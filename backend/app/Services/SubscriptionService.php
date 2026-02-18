<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Enums\SubscriptionTier;
use App\Models\AgentProfile;
use App\Models\AgentSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SubscriptionService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected PaystackService $paystackService,
    ) {}

    public function getPlans(): array
    {
        return [
            [
                'tier'               => SubscriptionTier::Free->value,
                'name'               => 'Free',
                'price_kobo'         => 0,
                'max_listings'       => 3,
                'featured_per_month' => 0,
                'features'           => [
                    'Up to 3 active listings',
                    'Basic agent profile',
                    'WhatsApp lead notifications',
                ],
            ],
            [
                'tier'               => SubscriptionTier::Basic->value,
                'name'               => 'Basic',
                'price_kobo'         => 1500000, // ₦15,000/month
                'max_listings'       => 10,
                'featured_per_month' => 1,
                'features'           => [
                    'Up to 10 active listings',
                    '1 featured listing per month',
                    'Verified agent badge',
                    'Lead analytics dashboard',
                    'Priority support',
                ],
            ],
            [
                'tier'               => SubscriptionTier::Pro->value,
                'name'               => 'Pro',
                'price_kobo'         => 3500000, // ₦35,000/month
                'max_listings'       => 30,
                'featured_per_month' => 5,
                'features'           => [
                    'Up to 30 active listings',
                    '5 featured listings per month',
                    'Verified agent badge',
                    'Advanced lead analytics',
                    'Priority placement in search',
                    'Priority support',
                ],
            ],
            [
                'tier'               => SubscriptionTier::Enterprise->value,
                'name'               => 'Enterprise',
                'price_kobo'         => 8000000, // ₦80,000/month
                'max_listings'       => 9999,
                'featured_per_month' => 9999,
                'features'           => [
                    'Unlimited listings',
                    'Unlimited featured listings',
                    'Verified agent badge',
                    'Advanced lead analytics',
                    'Top placement in search',
                    'Dedicated account manager',
                    'API access',
                ],
            ],
        ];
    }

    public function initializePayment(AgentProfile $agent, string $tier): array
    {
        $plan = collect($this->getPlans())->firstWhere('tier', $tier);

        if (! $plan || $plan['price_kobo'] === 0) {
            return ['status' => false, 'message' => 'Invalid tier or free tier selected.'];
        }

        $reference = 'sub_' . Str::uuid()->toString();
        $email = $agent->user->email ?? $agent->user->phone . '@ancerlarins.ng';

        $result = $this->paystackService->initializeTransaction(
            email: $email,
            amountInKobo: $plan['price_kobo'],
            reference: $reference,
            metadata: [
                'agent_profile_id' => $agent->id,
                'tier'             => $tier,
                'custom_fields'    => [
                    ['display_name' => 'Tier', 'variable_name' => 'tier', 'value' => $plan['name']],
                    ['display_name' => 'Agent', 'variable_name' => 'agent', 'value' => $agent->company_name ?? $agent->user->full_name],
                ],
            ],
        );

        if (! ($result['status'] ?? false)) {
            Log::error('Paystack initializeTransaction failed for subscription', [
                'agent_id' => $agent->id,
                'tier'     => $tier,
                'result'   => $result,
            ]);
            return ['status' => false, 'message' => $result['message'] ?? 'Payment initialization failed.'];
        }

        return [
            'status'            => true,
            'authorization_url' => $result['data']['authorization_url'],
            'access_code'       => $result['data']['access_code'],
            'reference'         => $result['data']['reference'],
        ];
    }

    public function verifyAndActivate(string $reference): ?AgentSubscription
    {
        $result = $this->paystackService->verifyTransaction($reference);

        if (! ($result['status'] ?? false) || ($result['data']['status'] ?? '') !== 'success') {
            Log::warning('Paystack payment verification failed', [
                'reference' => $reference,
                'result'    => $result,
            ]);
            return null;
        }

        $data = $result['data'];
        $metadata = $data['metadata'] ?? [];

        $agentProfileId = $metadata['agent_profile_id'] ?? null;
        $tier = $metadata['tier'] ?? null;

        if (! $agentProfileId || ! $tier) {
            Log::error('Missing metadata in Paystack verification', [
                'reference' => $reference,
                'metadata'  => $metadata,
            ]);
            return null;
        }

        $agent = AgentProfile::find($agentProfileId);
        if (! $agent) {
            Log::error('Agent not found for subscription', ['agent_profile_id' => $agentProfileId]);
            return null;
        }

        return $this->createOrExtendSubscription(
            agent: $agent,
            tier: $tier,
            amountKobo: $data['amount'] ?? 0,
            reference: $reference,
            provider: 'paystack',
        );
    }

    public function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (! $reference) {
            Log::warning('Paystack charge.success: missing reference');
            return;
        }

        // Avoid duplicate processing
        $existing = AgentSubscription::where('payment_reference', $reference)->first();
        if ($existing) {
            Log::info('Paystack charge.success: already processed', ['reference' => $reference]);
            return;
        }

        $this->verifyAndActivate($reference);
    }

    public function handleSubscriptionDisable(array $data): void
    {
        $subscriptionCode = $data['subscription_code'] ?? null;

        Log::info('Paystack subscription.disable received', ['subscription_code' => $subscriptionCode]);

        // Find the agent by the most recent active subscription's payment reference
        // Paystack subscription events don't always contain our custom metadata,
        // so we look up by the customer email
        $customerEmail = $data['customer']['email'] ?? null;

        if (! $customerEmail) {
            Log::warning('Paystack subscription.disable: missing customer email');
            return;
        }

        $agent = AgentProfile::whereHas('user', function ($q) use ($customerEmail) {
            $q->where('email', $customerEmail);
        })->first();

        if (! $agent) {
            Log::warning('Paystack subscription.disable: agent not found', ['email' => $customerEmail]);
            return;
        }

        DB::transaction(function () use ($agent) {
            // Cancel all active subscriptions
            $agent->subscriptions()
                ->where('status', SubscriptionStatus::Active)
                ->update(['status' => SubscriptionStatus::Cancelled]);

            // Downgrade agent to free tier
            $agent->update([
                'subscription_tier'       => SubscriptionTier::Free,
                'subscription_expires_at' => null,
                'max_listings'            => 3,
            ]);
        });

        $this->notificationService->send(
            $agent->user,
            'Subscription Cancelled',
            'Your subscription has been cancelled. You have been downgraded to the Free plan with 3 listings.',
            'subscription_cancelled',
            ['action_url' => '/dashboard/subscription'],
        );
    }

    protected function createOrExtendSubscription(
        AgentProfile $agent,
        string $tier,
        int $amountKobo,
        string $reference,
        string $provider = 'paystack',
    ): AgentSubscription {
        $tierEnum = SubscriptionTier::from($tier);
        $limits = $this->tierLimits($tierEnum);

        return DB::transaction(function () use ($agent, $tierEnum, $amountKobo, $reference, $provider, $limits) {
            // Deactivate any existing active subscriptions
            $agent->subscriptions()
                ->where('status', SubscriptionStatus::Active)
                ->update(['status' => SubscriptionStatus::Expired]);

            // Create new subscription (30 days)
            $subscription = AgentSubscription::create([
                'agent_profile_id'  => $agent->id,
                'tier'              => $tierEnum->value,
                'amount_kobo'       => $amountKobo,
                'payment_reference' => $reference,
                'payment_provider'  => $provider,
                'starts_at'         => now(),
                'ends_at'           => now()->addDays(30),
                'status'            => SubscriptionStatus::Active,
            ]);

            // Update agent profile
            $agent->update([
                'subscription_tier'       => $tierEnum,
                'subscription_expires_at' => $subscription->ends_at,
                'max_listings'            => $limits['max_listings'],
            ]);

            // Notify agent
            $this->notificationService->send(
                $agent->user,
                'Subscription Activated',
                "Your {$tierEnum->value} plan is now active. You can list up to {$limits['max_listings']} properties.",
                'subscription_activated',
                [
                    'action_url'  => '/dashboard/subscription',
                    'action_type' => 'subscription',
                    'action_id'   => $subscription->id,
                ],
            );

            return $subscription;
        });
    }

    protected function tierLimits(SubscriptionTier $tier): array
    {
        return match ($tier) {
            SubscriptionTier::Free       => ['max_listings' => 3, 'featured_per_month' => 0],
            SubscriptionTier::Basic      => ['max_listings' => 10, 'featured_per_month' => 1],
            SubscriptionTier::Pro        => ['max_listings' => 30, 'featured_per_month' => 5],
            SubscriptionTier::Enterprise => ['max_listings' => 9999, 'featured_per_month' => 9999],
        };
    }
}
