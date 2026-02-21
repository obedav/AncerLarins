<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Area>
 */
class AreaFactory extends Factory
{
    protected $model = Area::class;

    public function definition(): array
    {
        $name = fake()->unique()->streetName();

        return [
            'city_id'   => City::factory(),
            'name'      => $name,
            'slug'      => Str::slug($name),
            'is_active' => true,
        ];
    }
}
