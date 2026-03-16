<?php

namespace Tests\Feature\Commission;

use App\Models\Commission;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class CommissionTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create(['phone_verified' => true]);
    }

    // ── Index ─────────────────────────────────────────────────

    public function test_admin_can_list_commissions(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        $lead = Lead::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);

        Commission::factory()->count(3)->create([
            'lead_id' => $lead->id,
            'property_id' => $property->id,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/commissions');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_filter_commissions_by_status(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);
        $lead = Lead::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);

        Commission::factory()->create([
            'lead_id' => $lead->id,
            'property_id' => $property->id,
            'created_by' => $this->admin->id,
            'status' => 'pending',
        ]);
        Commission::factory()->paid()->create([
            'lead_id' => $lead->id,
            'property_id' => $property->id,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/commissions?status=pending');

        $response->assertOk();
    }

    // ── Summary ───────────────────────────────────────────────

    public function test_admin_can_view_revenue_summary(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/commissions/summary');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'year',
                    'total_earned',
                    'total_pending',
                    'total_invoiced',
                    'deals_won',
                    'deals_lost',
                    'monthly_revenue',
                ],
            ]);
    }

    // ── Store ─────────────────────────────────────────────────

    public function test_admin_can_create_commission(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);
        $lead = Lead::factory()->closed()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/commissions', [
                'lead_id' => $lead->id,
                'sale_price_kobo' => 100_000_000,
                'commission_rate' => 5.0,
                'payment_method' => 'bank_transfer',
                'notes' => 'Closed deal commission.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('commissions', [
            'lead_id' => $lead->id,
            'sale_price_kobo' => 100_000_000,
            'commission_rate' => 5.0,
            'commission_amount_kobo' => 5_000_000,
        ]);
    }

    public function test_create_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/commissions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lead_id', 'sale_price_kobo']);
    }

    public function test_commission_calculation_is_correct(): void
    {
        $this->assertEquals(2_500_000, Commission::calculate(100_000_000, 2.5));
        $this->assertEquals(5_000_000, Commission::calculate(100_000_000, 5.0));
        $this->assertEquals(0, Commission::calculate(0, 2.5));
    }

    // ── Update Status ─────────────────────────────────────────

    public function test_admin_can_update_commission_status_to_paid(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);
        $lead = Lead::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);

        $commission = Commission::factory()->create([
            'lead_id' => $lead->id,
            'property_id' => $property->id,
            'created_by' => $this->admin->id,
            'status' => 'invoiced',
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/commissions/{$commission->id}/status", [
                'status' => 'paid',
                'payment_reference' => 'PAY-REF-001',
            ]);

        $response->assertOk();

        $commission->refresh();
        $this->assertEquals('paid', $commission->status);
        $this->assertEquals('PAY-REF-001', $commission->payment_reference);
    }

    public function test_paid_status_sets_paid_at_timestamp(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);
        $lead = Lead::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);

        $commission = Commission::factory()->create([
            'lead_id' => $lead->id,
            'property_id' => $property->id,
            'created_by' => $this->admin->id,
            'status' => 'pending',
        ]);

        $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/commissions/{$commission->id}/status", [
                'status' => 'paid',
            ]);

        $this->assertNotNull($commission->fresh()->paid_at);
    }

    // ── Calculate Preview ─────────────────────────────────────

    public function test_admin_can_calculate_commission_preview(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/commissions/calculate', [
                'sale_price_kobo' => 50_000_000,
                'commission_rate' => 3.0,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.sale_price_kobo', 50_000_000)
            ->assertJsonPath('data.commission_rate', 3.0)
            ->assertJsonPath('data.commission_amount_kobo', 1_500_000);
    }

    public function test_calculate_uses_default_rate(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/commissions/calculate', [
                'sale_price_kobo' => 100_000_000,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.commission_rate', 2.5)
            ->assertJsonPath('data.commission_amount_kobo', 2_500_000);
    }

    // ── Authorization ─────────────────────────────────────────

    public function test_non_admin_cannot_access_commissions(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/admin/commissions');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_commissions(): void
    {
        $response = $this->getJson('/api/v1/admin/commissions');
        $response->assertUnauthorized();
    }
}
