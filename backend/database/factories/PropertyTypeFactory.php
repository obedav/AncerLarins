<?php

namespace Database\Factories;

use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PropertyType>
 */
class PropertyTypeFactory extends Factory
{
    protected $model = PropertyType::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Flat', 'Duplex', 'Bungalow', 'Penthouse', 'Mansion',
            'Studio', 'Self Contain', 'Maisonette', 'Terrace', 'Detached',
        ]);

        return [
            'name'      => $name,
            'slug'      => Str::slug($name),
            'is_active' => true,
        ];
    }
}
