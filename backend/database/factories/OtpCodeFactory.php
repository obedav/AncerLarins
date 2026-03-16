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
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return [
            'phone' => '+234'.fake()->numerify('80########'),
            'code_hash' => hash_hmac('sha256', $code, config('app.key')),
            'purpose' => OtpPurpose::Registration,
            'expires_at' => now()->addMinutes(10),
        ];
    }

    /**
     * Create an OTP with a known plaintext code for testing.
     */
    public function withCode(string $code): static
    {
        return $this->state(fn () => [
            'code_hash' => hash_hmac('sha256', $code, config('app.key')),
        ]);
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
