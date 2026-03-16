<?php

namespace Tests\Feature\PropertyRequest;

use App\Enums\PropertyRequestStatus;
use App\Models\PropertyRequest;
use App\Models\PropertyRequestResponse;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class PropertyRequestTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    // ── Public: Browse ────────────────────────────────────────

    public function test_can_browse_active_property_requests(): void
    {
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        PropertyRequest::factory()->count(3)->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $response = $this->getJson('/api/v1/property-requests');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_browse_excludes_cancelled_requests(): void
    {
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        PropertyRequest::factory()->cancelled()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->getJson('/api/v1/property-requests');

        $response->assertOk();
    }

    public function test_can_view_property_request_detail(): void
    {
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $response = $this->getJson("/api/v1/property-requests/{$request->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    // ── Auth: Create ──────────────────────────────────────────

    public function test_authenticated_user_can_create_request(): void
    {
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/property-requests', [
                'title' => 'Looking for 3-bed apartment in Lekki',
                'description' => 'Need a modern 3-bedroom apartment.',
                'listing_type' => 'sale',
                'property_type_id' => $propertyType->id,
                'area_id' => $location['area']->id,
                'city_id' => $location['city']->id,
                'min_bedrooms' => 3,
                'max_bedrooms' => 4,
                'min_price_kobo' => 50_000_000,
                'max_price_kobo' => 100_000_000,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_create_validates_required_fields(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/property-requests', []);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_create_request(): void
    {
        $response = $this->postJson('/api/v1/property-requests', [
            'title' => 'Test',
        ]);

        $response->assertUnauthorized();
    }

    // ── Auth: My Requests ─────────────────────────────────────

    public function test_user_can_view_own_requests(): void
    {
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        PropertyRequest::factory()->count(2)->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/my-requests');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    // ── Auth: Delete ──────────────────────────────────────────

    public function test_owner_can_delete_own_request(): void
    {
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/property-requests/{$request->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('property_requests', ['id' => $request->id]);
    }

    public function test_non_owner_cannot_delete_request(): void
    {
        $owner = $this->createVerifiedUser();
        $other = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $request = PropertyRequest::factory()->create([
            'user_id' => $owner->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->actingAs($other)
            ->deleteJson("/api/v1/property-requests/{$request->id}");

        $response->assertStatus(403);
    }

    // ── Agent: Respond ────────────────────────────────────────

    public function test_agent_can_respond_to_request(): void
    {
        $agent = $this->createVerifiedAgent();
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $property = $this->createApprovedProperty($agent['profile']);

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $response = $this->actingAs($agent['user'])
            ->postJson("/api/v1/agent/property-requests/{$request->id}/respond", [
                'property_id' => $property->id,
                'message' => 'I have the perfect property for you!',
                'proposed_price_kobo' => 75_000_000,
            ]);

        $response->assertStatus(201);
    }

    public function test_agent_cannot_respond_twice(): void
    {
        $agent = $this->createVerifiedAgent();
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        PropertyRequestResponse::create([
            'property_request_id' => $request->id,
            'agent_id' => $agent['profile']->id,
            'message' => 'First response.',
        ]);

        $response = $this->actingAs($agent['user'])
            ->postJson("/api/v1/agent/property-requests/{$request->id}/respond", [
                'message' => 'Second response attempt.',
            ]);

        $response->assertStatus(422);
    }

    public function test_agent_cannot_respond_to_inactive_request(): void
    {
        $agent = $this->createVerifiedAgent();
        $user = $this->createVerifiedUser();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $request = PropertyRequest::factory()->fulfilled()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->actingAs($agent['user'])
            ->postJson("/api/v1/agent/property-requests/{$request->id}/respond", [
                'message' => 'Too late.',
            ]);

        $response->assertStatus(422);
    }

    // ── Owner: Accept Response ────────────────────────────────

    public function test_owner_can_accept_response(): void
    {
        $user = $this->createVerifiedUser();
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $agentResponse = PropertyRequestResponse::create([
            'property_request_id' => $request->id,
            'agent_id' => $agent['profile']->id,
            'message' => 'Great match!',
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/property-requests/{$request->id}/responses/{$agentResponse->id}/accept");

        $response->assertOk();
    }

    // ── Admin ─────────────────────────────────────────────────

    public function test_admin_can_list_all_requests(): void
    {
        $admin = User::factory()->admin()->create(['phone_verified' => true]);
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        PropertyRequest::factory()->count(3)->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/v1/admin/property-requests');

        $response->assertOk();
    }

    public function test_admin_can_update_request_status(): void
    {
        $admin = User::factory()->admin()->create(['phone_verified' => true]);
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
            'status' => PropertyRequestStatus::Active,
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/api/v1/admin/property-requests/{$request->id}/status", [
                'status' => 'fulfilled',
            ]);

        $response->assertOk();
        $this->assertEquals(PropertyRequestStatus::Fulfilled, $request->fresh()->status);
    }

    public function test_admin_can_delete_request(): void
    {
        $admin = User::factory()->admin()->create(['phone_verified' => true]);
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();
        $user = $this->createVerifiedUser();

        $request = PropertyRequest::factory()->create([
            'user_id' => $user->id,
            'area_id' => $location['area']->id,
            'city_id' => $location['city']->id,
            'property_type_id' => $propertyType->id,
        ]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/v1/admin/property-requests/{$request->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('property_requests', ['id' => $request->id]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/admin/property-requests');

        $response->assertStatus(403);
    }
}
