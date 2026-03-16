<?php

namespace Tests\Feature\Inquiry;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class InquiryTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private User $admin;

    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create(['phone_verified' => true]);

        $agent = $this->createVerifiedAgent();
        $this->property = $this->createApprovedProperty($agent['profile']);

        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(true);
        });
    }

    // ── Public: Create Inquiry ────────────────────────────────

    public function test_guest_can_submit_inquiry(): void
    {
        $response = $this->postJson('/api/v1/inquiries', [
            'property_id' => $this->property->id,
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+2348012345678',
            'message' => 'I am interested in this property.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['inquiry_id', 'tracking_ref']]);
    }

    public function test_inquiry_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/inquiries', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['property_id', 'full_name', 'email', 'phone']);
    }

    // ── Public: Track Inquiry ─────────────────────────────────

    public function test_buyer_can_track_inquiry_with_ref_and_email(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'tracking_ref' => 'ABCDEFGHIJ',
            'email' => 'buyer@example.com',
            'email_hash' => Lead::hashEmail('buyer@example.com'),
        ]);

        $response = $this->postJson('/api/v1/inquiries/track', [
            'ref' => 'ABCDEFGHIJ',
            'email' => 'buyer@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tracking_ref', 'ABCDEFGHIJ');
    }

    public function test_track_returns_404_for_wrong_credentials(): void
    {
        Lead::factory()->create([
            'property_id' => $this->property->id,
            'tracking_ref' => 'ABCDEFGHIJ',
            'email_hash' => Lead::hashEmail('buyer@example.com'),
        ]);

        $response = $this->postJson('/api/v1/inquiries/track', [
            'ref' => 'ABCDEFGHIJ',
            'email' => 'wrong@example.com',
        ]);

        $response->assertStatus(404);
    }

    // ── Public: Accept Agreement ──────────────────────────────

    public function test_buyer_can_accept_agreement(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'tracking_ref' => 'XYZXYZXYZX',
            'email' => 'buyer2@example.com',
            'email_hash' => Lead::hashEmail('buyer2@example.com'),
        ]);

        $response = $this->postJson('/api/v1/inquiries/accept-agreement', [
            'ref' => 'XYZXYZXYZX',
            'email' => 'buyer2@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertNotNull($lead->fresh()->agreement_accepted_at);
    }

    public function test_accept_agreement_fails_if_already_accepted(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'tracking_ref' => 'AAAAAAAAAA',
            'email' => 'buyer3@example.com',
            'email_hash' => Lead::hashEmail('buyer3@example.com'),
            'agreement_accepted_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/inquiries/accept-agreement', [
            'ref' => 'AAAAAAAAAA',
            'email' => 'buyer3@example.com',
        ]);

        $response->assertStatus(422);
    }

    // ── Admin: List Inquiries ─────────────────────────────────

    public function test_admin_can_list_inquiries(): void
    {
        Lead::factory()->count(3)->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/inquiries');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_filter_inquiries_by_status(): void
    {
        Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);
        Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'qualified',
            'qualified_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/inquiries?status=new');

        $response->assertOk();
    }

    // ── Admin: View Detail ────────────────────────────────────

    public function test_admin_can_view_inquiry_detail(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/inquiries/{$lead->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $lead->id);
    }

    // ── Admin: Update Status ──────────────────────────────────

    public function test_admin_can_update_inquiry_status(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/inquiries/{$lead->id}/status", [
                'status' => 'contacted',
            ]);

        $response->assertOk();
        $this->assertEquals('contacted', $lead->fresh()->status);
    }

    public function test_status_update_sets_qualified_at_timestamp(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);

        $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/inquiries/{$lead->id}/status", [
                'status' => 'qualified',
            ]);

        $this->assertNotNull($lead->fresh()->qualified_at);
    }

    // ── Admin: Assign Inquiry ─────────────────────────────────

    public function test_admin_can_assign_inquiry(): void
    {
        $lead = Lead::factory()->create([
            'property_id' => $this->property->id,
            'status' => 'new',
        ]);
        $staff = User::factory()->admin()->create(['phone_verified' => true]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/inquiries/{$lead->id}/assign", [
                'assigned_to' => $staff->id,
            ]);

        $response->assertOk();
        $this->assertEquals($staff->id, $lead->fresh()->assigned_to);
    }

    // ── Agent: View Own Inquiries ─────────────────────────────

    public function test_agent_can_view_own_inquiries(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        Lead::factory()->count(2)->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($agent['user'])
            ->getJson('/api/v1/agent/inquiries');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    // ── Authorization ─────────────────────────────────────────

    public function test_non_admin_cannot_access_admin_inquiry_routes(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/admin/inquiries');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin_routes(): void
    {
        $response = $this->getJson('/api/v1/admin/inquiries');
        $response->assertUnauthorized();
    }
}
