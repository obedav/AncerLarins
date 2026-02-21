<?php

namespace Database\Factories;

use App\Enums\OtpPurpose;
use App\Models\OtpCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OtpCode>
 */
class OtpCodeFactory extends Factory
{
    protected $model = OtpCode::class;

    public function definition(): array
    {
        return [
            'phone'      => '+234' . fake()->numerify('80########'),
            'code'       => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
            'purpose'    => OtpPurpose::Registration,
            'expires_at' => now()->addMinutes(10),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->subMinutes(1),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'verified_at' => now(),
        ]);
    }

    public function forLogin(): static
    {
        return $this->state(fn () => [
            'purpose' => OtpPurpose::Login,
        ]);
    }
}
