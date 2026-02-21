<?php

namespace Tests\Feature\Webhook;

use App\Models\AgentProfile;
use App\Models\AgentSubscription;
use App\Models\User;
use App\Services\CooperativeService;
use App\Services\NotificationService;
use App\Services\PaystackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class PaystackWebhookTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected string $webhookUrl = '/api/v1/webhooks/paystack';
    protected string $testSecret = 'test_paystack_secret';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.paystack.secret_key' => $this->testSecret]);

        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(new \App\Models\Notification());
        });
    }

    protected function generatePaystackSignature(string $payload): string
    {
        return hash_hmac('sha512', $payload, $this->testSecret);
    }

    protected function postWebhook(array $body, ?string $signature = null): \Illuminate\Testing\TestResponse
    {
        $payload = json_encode($body);
        $signature ??= $this->generatePaystackSignature($payload);

        return $this->call(
            'POST',
            $this->webhookUrl,
            [],
            [],
            [],
            [
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
                'CONTENT_TYPE'              => 'application/json',
            ],
            $payload
        );
    }

    // ── Signature Validation ────────────────────────────────

    public function test_rejects_invalid_signature(): void
    {
        $response = $this->postWebhook(
            ['event' => 'charge.success', 'data' => []],
            'invalid-signature'
        );

        $response->assertStatus(403);
    }

    public function test_accepts_valid_signature(): void
    {
        $response = $this->postWebhook([
            'event' => 'some.unknown.event',
            'data'  => [],
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    // ── charge.success ──────────────────────────────────────

    public function test_charge_success_creates_subscription(): void
    {
        $agent = $this->createVerifiedAgent();
        $profile = $agent['profile'];
        $reference = 'sub_test_' . uniqid();

        $this->mock(PaystackService::class, function ($mock) use ($profile, $reference) {
            $mock->shouldReceive('verifyTransaction')
                ->with($reference)
                ->andReturn([
                    'status' => true,
                    'data'   => [
                        'status'    => 'success',
                        'amount'    => 1500000,
                        'reference' => $reference,
                        'metadata'  => [
                            'agent_profile_id' => $profile->id,
                            'tier'             => 'basic',
                        ],
                    ],
                ]);
        });

        $response = $this->postWebhook([
            'event' => 'charge.success',
            'data'  => [
                'reference' => $reference,
                'metadata'  => ['type' => 'subscription'],
            ],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('agent_subscriptions', [
            'agent_profile_id'  => $profile->id,
            'payment_reference' => $reference,
        ]);
    }

    public function test_charge_success_skips_duplicate(): void
    {
        $agent = $this->createVerifiedAgent();
        $reference = 'sub_dup_' . uniqid();

        AgentSubscription::create([
            'agent_profile_id'  => $agent['profile']->id,
            'tier'              => 'basic',
            'amount_kobo'       => 1500000,
            'payment_reference' => $reference,
            'payment_provider'  => 'paystack',
            'starts_at'         => now(),
            'ends_at'           => now()->addDays(30),
            'status'            => 'active',
        ]);

        $response = $this->postWebhook([
            'event' => 'charge.success',
            'data'  => ['reference' => $reference],
        ]);

        $response->assertOk();

        $this->assertDatabaseCount('agent_subscriptions', 1);
    }

    public function test_charge_success_routes_cooperative(): void
    {
        $reference = 'coop_test_' . uniqid();

        $this->mock(CooperativeService::class, function ($mock) use ($reference) {
            $mock->shouldReceive('verifyContribution')
                ->once()
                ->with($reference);
        });

        $response = $this->postWebhook([
            'event' => 'charge.success',
            'data'  => [
                'reference' => $reference,
                'metadata'  => ['type' => 'cooperative_contribution'],
            ],
        ]);

        $response->assertOk();
    }

    // ── subscription.disable ────────────────────────────────

    public function test_subscription_disable_downgrades(): void
    {
        $agent = $this->createVerifiedAgent([], [
            'subscription_tier'       => \App\Enums\SubscriptionTier::Basic,
            'max_listings'            => 10,
            'subscription_expires_at' => now()->addDays(15),
        ]);

        $response = $this->postWebhook([
            'event' => 'subscription.disable',
            'data'  => [
                'subscription_code' => 'SUB_test123',
                'customer'          => ['email' => $agent['user']->email],
            ],
        ]);

        $response->assertOk();

        $profile = $agent['profile']->fresh();
        $this->assertEquals(\App\Enums\SubscriptionTier::Free, $profile->subscription_tier);
        $this->assertEquals(3, $profile->max_listings);
    }

    public function test_subscription_disable_unknown_email(): void
    {
        $response = $this->postWebhook([
            'event' => 'subscription.disable',
            'data'  => [
                'subscription_code' => 'SUB_unknown',
                'customer'          => ['email' => 'nonexistent@example.com'],
            ],
        ]);

        $response->assertOk();
    }

    // ── Unhandled Events ────────────────────────────────────

    public function test_unhandled_event_returns_ok(): void
    {
        $response = $this->postWebhook([
            'event' => 'transfer.success',
            'data'  => ['id' => 123],
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'ok');
    }
}
