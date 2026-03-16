<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Lagos geography, property types, and amenities first
        $this->call(LagosSeeder::class);

        $now = now();

        // Create admin user (credentials from .env)
        DB::table('users')->insert([
            'id' => Str::uuid()->toString(),
            'first_name' => env('SUPER_ADMIN_FIRST_NAME', 'Admin'),
            'last_name' => env('SUPER_ADMIN_LAST_NAME', 'User'),
            'email' => env('SUPER_ADMIN_EMAIL', 'admin@ancerlarins.com'),
            'phone' => env('SUPER_ADMIN_PHONE', '+2340000000000'),
            'password_hash' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'changeme')),
            'phone_verified' => true,
            'email_verified' => true,
            'role' => 'super_admin',
            'status' => 'active',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create test user
        DB::table('users')->insert([
            'id' => Str::uuid()->toString(),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'user@test.com',
            'phone' => '+2348000000002',
            'password_hash' => Hash::make('password'),
            'phone_verified' => true,
            'email_verified' => true,
            'role' => 'user',
            'status' => 'active',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create test agent user
        $agentUserId = Str::uuid()->toString();
        DB::table('users')->insert([
            'id' => $agentUserId,
            'first_name' => 'Test',
            'last_name' => 'Agent',
            'email' => 'agent@test.com',
            'phone' => '+2348000000003',
            'password_hash' => Hash::make('password'),
            'phone_verified' => true,
            'email_verified' => true,
            'role' => 'agent',
            'status' => 'active',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create agent profile for test agent
        DB::table('agent_profiles')->insert([
            'id' => Str::uuid()->toString(),
            'user_id' => $agentUserId,
            'company_name' => 'Test Properties Ltd',
            'verification_status' => 'verified',
            'verified_at' => $now,
            'whatsapp_number' => '+2348000000003',
            'subscription_tier' => 'basic',
            'max_listings' => 10,
            'bio' => 'Licensed real estate agent serving the Lagos market.',
            'specializations' => json_encode(['residential', 'commercial']),
            'years_experience' => 5,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Seed additional Nigerian states
        $this->call([
            AbujaSeeder::class,
            RiversSeeder::class,
            OyoSeeder::class,
            DeltaSeeder::class,
            EnuguSeeder::class,
            OgunSeeder::class,
        ]);

        // Seed sample data
        $this->call([
            PropertySeeder::class,
            EstateSeeder::class,
            BlogPostSeeder::class,
            CooperativeSeeder::class,
            PropertyRequestSeeder::class,
        ]);
    }
}
