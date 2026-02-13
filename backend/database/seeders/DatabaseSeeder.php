<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@ancerlarins.com',
            'role' => 'admin',
        ]);

        // Create test users for each role
        User::factory()->create([
            'name' => 'Test Tenant',
            'email' => 'tenant@test.com',
            'role' => 'tenant',
        ]);

        User::factory()->create([
            'name' => 'Test Landlord',
            'email' => 'landlord@test.com',
            'role' => 'landlord',
        ]);

        User::factory()->create([
            'name' => 'Test Agent',
            'email' => 'agent@test.com',
            'role' => 'agent',
        ]);

        // Seed neighborhoods
        $this->call(NeighborhoodSeeder::class);
    }
}
