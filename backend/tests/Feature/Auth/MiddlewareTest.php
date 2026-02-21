<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    public function test_unverified_phone_returns_403(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me');

        $response->assertStatus(403)
            ->assertJsonPath('error', 'phone_not_verified');
    }

    public function test_verified_phone_passes(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me');

        $response->assertOk();
    }

    public function test_non_agent_blocked_from_agent_routes(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/agent/properties', []);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'not_agent');
    }

    public function test_agent_can_access_agent_routes(): void
    {
        $agent = $this->createVerifiedAgent();

        $response = $this->actingAs($agent['user'])
            ->getJson('/api/v1/agent/dashboard');

        $response->assertStatus(200);
    }

    public function test_non_admin_blocked_from_admin_routes(): void
    {
        $agent = $this->createVerifiedAgent();

        $response = $this->actingAs($agent['user'])
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403)
            ->assertJsonPath('error', 'not_admin');
    }
}
