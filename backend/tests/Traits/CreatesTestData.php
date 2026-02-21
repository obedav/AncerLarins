<?php

namespace Tests\Traits;

use App\Models\AgentProfile;
use App\Models\Area;
use App\Models\City;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\State;
use App\Models\User;

trait CreatesTestData
{
    protected function createVerifiedUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'phone_verified' => true,
        ], $overrides));
    }

    protected function createVerifiedAgent(array $userOverrides = [], array $profileOverrides = []): array
    {
        $user = User::factory()->agent()->create(array_merge([
            'phone_verified' => true,
        ], $userOverrides));

        $profile = AgentProfile::factory()->create(array_merge([
            'user_id' => $user->id,
        ], $profileOverrides));

        return ['user' => $user, 'profile' => $profile];
    }

    protected function createLocationHierarchy(array $overrides = []): array
    {
        $state = State::factory()->create($overrides['state'] ?? []);
        $city = City::factory()->create(array_merge(
            ['state_id' => $state->id],
            $overrides['city'] ?? []
        ));
        $area = Area::factory()->create(array_merge(
            ['city_id' => $city->id],
            $overrides['area'] ?? []
        ));

        return ['state' => $state, 'city' => $city, 'area' => $area];
    }

    protected function createApprovedProperty(AgentProfile $agent, array $overrides = []): Property
    {
        $location = $this->createLocationHierarchy();
        $propertyType = PropertyType::factory()->create();

        return Property::factory()->approved()->create(array_merge([
            'agent_id'         => $agent->id,
            'property_type_id' => $propertyType->id,
            'state_id'         => $location['state']->id,
            'city_id'          => $location['city']->id,
            'area_id'          => $location['area']->id,
        ], $overrides));
    }
}
