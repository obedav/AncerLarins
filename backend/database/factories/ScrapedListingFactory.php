<?php

namespace Database\Factories;

use App\Enums\ScrapedListingStatus;
use App\Models\ScrapedListing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScrapedListing>
 */
class ScrapedListingFactory extends Factory
{
    protected $model = ScrapedListing::class;

    public function definition(): array
    {
        return [
            'source' => fake()->randomElement(['property_pro', 'nigeria_property_centre', 'jiji']),
            'source_url' => fake()->url(),
            'source_id' => fake()->uuid(),
            'raw_data' => ['key' => 'value'],
            'title' => fake()->sentence(4),
            'price_kobo' => fake()->numberBetween(500_000_00, 50_000_000_00),
            'location' => fake()->city(),
            'bedrooms' => fake()->numberBetween(1, 6),
            'property_type' => fake()->randomElement(['apartment', 'house', 'land']),
            'listing_type' => fake()->randomElement(['sale', 'rent']),
            'image_url' => fake()->imageUrl(),
            'status' => ScrapedListingStatus::Pending,
        ];
    }

    public function imported(): static
    {
        return $this->state(fn () => [
            'status' => ScrapedListingStatus::Imported,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => ScrapedListingStatus::Rejected,
            'rejection_reason' => 'Duplicate listing',
        ]);
    }
}
