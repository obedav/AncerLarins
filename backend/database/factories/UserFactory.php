<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'first_name'     => fake()->firstName(),
            'last_name'      => fake()->lastName(),
            'email'          => fake()->unique()->safeEmail(),
            'phone'          => '+234' . fake()->numerify('80########'),
            'password_hash'  => static::$password ??= Hash::make('password'),
            'phone_verified' => true,
            'role'           => UserRole::User,
            'status'         => UserStatus::Active,
        ];
    }

    public function agent(): static
    {
        return $this->state(fn () => ['role' => UserRole::Agent]);
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::Admin]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['phone_verified' => false]);
    }

    public function banned(): static
    {
        return $this->state(fn () => [
            'status'   => UserStatus::Banned,
            'ban_reason' => 'Violated terms of service',
            'banned_at'  => now(),
        ]);
    }
}
