<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    protected $model = City::class;

    public function definition(): array
    {
        $name = fake()->unique()->city();

        return [
            'state_id'  => State::factory(),
            'name'      => $name,
            'slug'      => Str::slug($name),
            'is_active' => true,
        ];
    }
}
