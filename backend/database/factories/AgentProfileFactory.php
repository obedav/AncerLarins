<?php

namespace Database\Factories;

use App\Enums\SubscriptionTier;
use App\Enums\VerificationStatus;
use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentProfile>
 */
class AgentProfileFactory extends Factory
{
    protected $model = AgentProfile::class;

    public function definition(): array
    {
        return [
            'user_id'             => User::factory()->agent(),
            'company_name'        => fake()->company(),
            'verification_status' => VerificationStatus::Unverified,
            'subscription_tier'   => SubscriptionTier::Free,
            'max_listings'        => 3,
            'active_listings'     => 0,
            'total_listings'      => 0,
            'total_leads'         => 0,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'verification_status' => VerificationStatus::Verified,
            'verified_at'         => now(),
        ]);
    }
}
