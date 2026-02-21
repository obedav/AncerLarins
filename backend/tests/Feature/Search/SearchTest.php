<?php

namespace Tests\Feature\Search;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Models\Area;
use App\Models\City;
use App\Models\Property;
use App\Models\State;
use App\Services\FraudDetectionService;
use App\Services\NotificationService;
use App\Services\ValuationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class SearchTest extends TestCase
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

    protected function seedProperties(int $approvedCount = 3, int $pendingCount = 1): array
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();
        $properties = [];

        for ($i = 0; $i < $approvedCount; $i++) {
            $properties[] = Property::factory()->approved()->create([
                'agent_id'         => $agent['profile']->id,
                'property_type_id' => $propertyType->id,
                'state_id'         => $location['state']->id,
                'city_id'          => $location['city']->id,
                'area_id'          => $location['area']->id,
            ]);
        }

        for ($i = 0; $i < $pendingCount; $i++) {
            Property::factory()->create([
                'agent_id'         => $agent['profile']->id,
                'property_type_id' => $propertyType->id,
                'state_id'         => $location['state']->id,
                'city_id'          => $location['city']->id,
                'area_id'          => $location['area']->id,
                'status'           => PropertyStatus::Pending,
            ]);
        }

        return [
            'agent'        => $agent,
            'location'     => $location,
            'propertyType' => $propertyType,
            'properties'   => $properties,
        ];
    }

    // ── Search Results ──────────────────────────────────────

    public function test_returns_approved_properties(): void
    {
        $this->seedProperties(3, 1);

        $response = $this->getJson('/api/v1/search');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filters_by_listing_type(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        Property::factory()->approved()->forRent()->create([
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ]);

        Property::factory()->approved()->forSale()->create([
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ]);

        $response = $this->getJson('/api/v1/search?listing_type=rent');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_filters_by_price_range(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $common = [
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ];

        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 5_000_000]));
        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 15_000_000]));
        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 50_000_000]));

        $response = $this->getJson('/api/v1/search?min_price=10000000&max_price=20000000');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_filters_by_city(): void
    {
        $agent = $this->createVerifiedAgent();
        $location1 = $this->createLocationHierarchy();
        $location2 = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        Property::factory()->approved()->create([
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location1['state']->id,
            'city_id'          => $location1['city']->id,
            'area_id'          => $location1['area']->id,
        ]);

        Property::factory()->approved()->create([
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location2['state']->id,
            'city_id'          => $location2['city']->id,
            'area_id'          => $location2['area']->id,
        ]);

        $response = $this->getJson("/api/v1/search?city_id={$location1['city']->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_filters_by_bedrooms(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $common = [
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ];

        Property::factory()->approved()->create(array_merge($common, ['bedrooms' => 1]));
        Property::factory()->approved()->create(array_merge($common, ['bedrooms' => 3]));
        Property::factory()->approved()->create(array_merge($common, ['bedrooms' => 5]));

        $response = $this->getJson('/api/v1/search?min_bedrooms=2');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_sorts_by_price(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $common = [
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ];

        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 30_000_000]));
        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 10_000_000]));
        Property::factory()->approved()->create(array_merge($common, ['price_kobo' => 20_000_000]));

        $response = $this->getJson('/api/v1/search?sort_by=price_asc');

        $response->assertOk();

        $prices = collect($response->json('data'))->pluck('price_kobo')->toArray();
        $this->assertEquals($prices, [10_000_000, 20_000_000, 30_000_000]);
    }

    public function test_pagination_meta(): void
    {
        $agent = $this->createVerifiedAgent();
        $location = $this->createLocationHierarchy();
        $propertyType = \App\Models\PropertyType::factory()->create();

        $common = [
            'agent_id'         => $agent['profile']->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ];

        for ($i = 0; $i < 25; $i++) {
            Property::factory()->approved()->create($common);
        }

        $response = $this->getJson('/api/v1/search?per_page=10');

        $response->assertOk()
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.per_page', 10);

        $this->assertCount(10, $response->json('data'));
    }

    // ── Suggestions ─────────────────────────────────────────

    public function test_suggestions_returns_matching(): void
    {
        Cache::flush();

        $state = State::factory()->create();
        $city = City::factory()->create([
            'state_id' => $state->id,
            'name'     => 'Lagos',
            'slug'     => 'lagos',
        ]);
        Area::factory()->create([
            'city_id' => $city->id,
            'name'    => 'Lekki Phase 1',
            'slug'    => 'lekki-phase-1',
        ]);

        $response = $this->getJson('/api/v1/search/suggestions?q=lek');

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Lekki Phase 1', $names);
    }
}
