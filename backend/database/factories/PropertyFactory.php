<?php

namespace Database\Factories;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Models\AgentProfile;
use App\Models\Area;
use App\Models\City;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'agent_id'         => AgentProfile::factory(),
            'listing_type'     => ListingType::Sale,
            'property_type_id' => PropertyType::factory(),
            'title'            => $title,
            'slug'             => Str::slug($title) . '-' . fake()->unique()->randomNumber(5),
            'description'      => fake()->paragraph(),
            'price_kobo'       => fake()->numberBetween(5_000_000, 500_000_000),
            'state_id'         => State::factory(),
            'city_id'          => City::factory(),
            'area_id'          => Area::factory(),
            'address'          => fake()->address(),
            'bedrooms'         => fake()->numberBetween(1, 5),
            'bathrooms'        => fake()->numberBetween(1, 4),
            'status'           => PropertyStatus::Pending,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status'       => PropertyStatus::Approved,
            'published_at' => now(),
        ]);
    }

    public function forRent(): static
    {
        return $this->state(fn () => [
            'listing_type' => ListingType::Rent,
        ]);
    }

    public function forSale(): static
    {
        return $this->state(fn () => [
            'listing_type' => ListingType::Sale,
        ]);
    }
}
