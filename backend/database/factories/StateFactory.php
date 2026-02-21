<?php

namespace Database\Factories;

use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<State>
 */
class StateFactory extends Factory
{
    protected $model = State::class;

    public function definition(): array
    {
        $name = fake()->unique()->city() . ' State';

        return [
            'name'      => $name,
            'slug'      => Str::slug($name),
            'is_active' => true,
        ];
    }
}
