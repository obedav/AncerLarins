<?php

namespace Tests\Feature\Property;

use App\Enums\PropertyStatus;
use App\Models\Property;
use App\Models\User;
use App\Services\FraudDetectionService;
use App\Services\NotificationService;
use App\Services\ValuationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class PropertyCrudTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(FraudDetectionService::class, function ($mock) {
            $mock->shouldReceive('analyze')->andReturn(['score' => 0, 'flags' => []]);
        });

        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(new \App\Models\Notification());
        });

        $this->mock(ValuationService::class, function ($mock) {
            $mock->shouldReceive('estimate')->andReturn(null);
        });
    }

    // ── Create ──────────────────────────────────────────────

    public function test_agent_can_create_property(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $response = $this->actingAs($agent['user'])
            ->postJson('/api/v1/agent/properties', [
                'listing_type'     => 'sale',
                'property_type_id' => $propertyType->id,
                'title'            => 'Beautiful Duplex in Lagos',
                'description'      => 'A stunning 4 bedroom duplex.',
                'price_kobo'       => 50_000_000,
                'state_id'         => $location['state']->id,
                'city_id'          => $location['city']->id,
                'area_id'          => $location['area']->id,
                'address'          => '123 Main Street',
                'bedrooms'         => 4,
                'bathrooms'        => 3,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('properties', [
            'title'  => 'Beautiful Duplex in Lagos',
            'status' => PropertyStatus::Pending->value,
        ]);

        $property = Property::where('title', 'Beautiful Duplex in Lagos')->first();
        $this->assertNotNull($property->slug);
    }

    public function test_create_validates_required_fields(): void
    {
        $agent = $this->createVerifiedAgent();

        $response = $this->actingAs($agent['user'])
            ->postJson('/api/v1/agent/properties', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['listing_type', 'property_type_id', 'title', 'price_kobo']);
    }

    public function test_create_validates_city_state_match(): void
    {
        $agent = $this->createVerifiedAgent();
        $location1 = $this->createLocationHierarchy();
        $location2 = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $response = $this->actingAs($agent['user'])
            ->postJson('/api/v1/agent/properties', [
                'listing_type'     => 'sale',
                'property_type_id' => $propertyType->id,
                'title'            => 'Mismatched City Property',
                'description'      => 'This should fail validation.',
                'price_kobo'       => 10_000_000,
                'state_id'         => $location1['state']->id,
                'city_id'          => $location2['city']->id, // Wrong state
                'address'          => '456 Wrong Street',
            ]);

        $response->assertStatus(422);
    }

    public function test_regular_user_cannot_create(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/agent/properties', [
                'title' => 'Should Fail',
            ]);

        $response->assertStatus(403);
    }

    // ── Update ──────────────────────────────────────────────

    public function test_agent_can_update_property(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        $response = $this->actingAs($agent['user'])
            ->putJson("/api/v1/agent/properties/{$property->id}", [
                'description' => 'Updated description for this property.',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertEquals('Updated description for this property.', $property->fresh()->description);
    }

    public function test_update_changes_slug_on_title_change(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);
        $oldSlug = $property->slug;

        $response = $this->actingAs($agent['user'])
            ->putJson("/api/v1/agent/properties/{$property->id}", [
                'title' => 'A Completely New Title',
            ]);

        $response->assertOk();

        $this->assertNotEquals($oldSlug, $property->fresh()->slug);
    }

    public function test_agent_cannot_update_others_property(): void
    {
        $agentA = $this->createVerifiedAgent();
        $agentB = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agentA['profile']);

        $response = $this->actingAs($agentB['user'])
            ->putJson("/api/v1/agent/properties/{$property->id}", [
                'title' => 'Hijacked Title',
            ]);

        $response->assertStatus(403);
    }

    // ── Delete ──────────────────────────────────────────────

    public function test_agent_can_delete_property(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        $response = $this->actingAs($agent['user'])
            ->deleteJson("/api/v1/agent/properties/{$property->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }

    public function test_agent_cannot_delete_others_property(): void
    {
        $agentA = $this->createVerifiedAgent();
        $agentB = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agentA['profile']);

        $response = $this->actingAs($agentB['user'])
            ->deleteJson("/api/v1/agent/properties/{$property->id}");

        $response->assertStatus(403);
    }

    // ── Read ────────────────────────────────────────────────

    public function test_index_returns_only_approved(): void
    {
        $agent = $this->createVerifiedAgent();
        $this->createApprovedProperty($agent['profile']);
        $this->createApprovedProperty($agent['profile']);

        Property::factory()->create([
            'agent_id'         => $agent['profile']->id,
            'status'           => PropertyStatus::Pending,
            'property_type_id' => \App\Models\PropertyType::factory(),
            'state_id'         => \App\Models\State::factory(),
            'city_id'          => \App\Models\City::factory(),
            'area_id'          => \App\Models\Area::factory(),
        ]);

        $response = $this->getJson('/api/v1/properties');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_show_returns_by_slug(): void
    {
        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_show_returns_404_for_nonexistent(): void
    {
        $response = $this->getJson('/api/v1/properties/totally-nonexistent-slug');

        $response->assertStatus(404);
    }
}
