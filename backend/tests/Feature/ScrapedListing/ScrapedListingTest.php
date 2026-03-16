<?php

namespace Tests\Feature\ScrapedListing;

use App\Enums\ScrapedListingStatus;
use App\Models\ScrapedListing;
use App\Models\User;
use App\Services\ScrapedListingImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class ScrapedListingTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private User $admin;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create(['phone_verified' => true]);
        $this->token = $this->admin->createToken('api')->plainTextToken;
    }

    // ── Index ────────────────────────────────────────────────

    public function test_admin_can_list_scraped_listings(): void
    {
        ScrapedListing::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/admin/scraped-listings');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_filter_by_status(): void
    {
        ScrapedListing::factory()->create(['status' => ScrapedListingStatus::Pending]);
        ScrapedListing::factory()->rejected()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/admin/scraped-listings?status=pending');

        $response->assertOk();
    }

    public function test_admin_can_filter_by_source(): void
    {
        ScrapedListing::factory()->create(['source' => 'jiji']);
        ScrapedListing::factory()->create(['source' => 'property_pro']);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/admin/scraped-listings?source=jiji');

        $response->assertOk();
    }

    // ── Approve ──────────────────────────────────────────────

    public function test_admin_can_approve_pending_listing(): void
    {
        $listing = ScrapedListing::factory()->create();
        $location = $this->createLocationHierarchy();
        $agentData = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agentData['profile']);

        $this->mock(ScrapedListingImportService::class, function ($mock) use ($property) {
            $mock->shouldReceive('import')->once()->andReturn($property);
        });

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/admin/scraped-listings/{$listing->id}/approve");

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_cannot_approve_non_pending_listing(): void
    {
        $listing = ScrapedListing::factory()->rejected()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/admin/scraped-listings/{$listing->id}/approve");

        $response->assertStatus(422);
    }

    // ── Reject ───────────────────────────────────────────────

    public function test_admin_can_reject_listing(): void
    {
        $listing = ScrapedListing::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/admin/scraped-listings/{$listing->id}/reject", [
                'reason' => 'Low quality listing',
            ]);

        $response->assertOk();

        $this->assertEquals(ScrapedListingStatus::Rejected, $listing->fresh()->status);
        $this->assertEquals('Low quality listing', $listing->fresh()->rejection_reason);
    }

    public function test_reject_reason_is_optional(): void
    {
        $listing = ScrapedListing::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/admin/scraped-listings/{$listing->id}/reject");

        $response->assertOk();
    }

    // ── Authorization ────────────────────────────────────────

    public function test_non_admin_cannot_access_scraped_listings(): void
    {
        $user = $this->createVerifiedUser();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/scraped-listings');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_scraped_listings(): void
    {
        $response = $this->getJson('/api/v1/admin/scraped-listings');

        $response->assertStatus(401);
    }
}
