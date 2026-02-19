<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\Estate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CooperativeSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            $this->command->warn('No users found — skipping cooperative seeder.');
            return;
        }

        $areas = Area::pluck('id', 'slug');
        $estates = Estate::pluck('id', 'slug');

        $cooperatives = [
            [
                'name'                     => 'Lekki Homeowners Collective',
                'description'              => "A group of young professionals pooling resources to acquire a block of flats in Lekki Phase 1. We're targeting a 6-unit building and plan to allocate units based on contribution. Monthly meetings held every last Saturday. Join us to own your first Lagos home without breaking the bank alone.",
                'target_amount_kobo'       => 30000000000, // ₦300M
                'monthly_contribution_kobo' => 50000000,   // ₦500K
                'area_slug'                => 'lekki-phase-1',
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 8,
                'start_date'               => now()->subMonths(4)->toDateString(),
                'target_date'              => now()->addMonths(20)->toDateString(),
                'contributed_pct'          => 15,
            ],
            [
                'name'                     => 'Ajah Land Acquisition Group',
                'description'              => "We're 12 contributors saving to buy 3 plots of land in the Sangotedo area of Ajah. Each member gets allocated based on their total contribution. Verified C of O land only. We've already identified two promising plots through a trusted surveyor.",
                'target_amount_kobo'       => 6000000000, // ₦60M
                'monthly_contribution_kobo' => 20000000,  // ₦200K
                'area_slug'                => 'ajah',
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 12,
                'start_date'               => now()->subMonths(6)->toDateString(),
                'target_date'              => now()->addMonths(12)->toDateString(),
                'contributed_pct'          => 35,
            ],
            [
                'name'                     => 'Chevron Estate Buyers Club',
                'description'              => "An exclusive cooperative targeting a property purchase within Chevron Estate, Lekki. Members contribute monthly towards acquiring a 4-bedroom semi-detached duplex. All funds held in a dedicated cooperative bank account with dual-signatory access.",
                'target_amount_kobo'       => 18000000000, // ₦180M
                'monthly_contribution_kobo' => 100000000,  // ₦1M
                'area_slug'                => 'chevron',
                'estate_slug'              => 'chevron-estate',
                'status'                   => 'forming',
                'member_count'             => 4,
                'start_date'               => now()->addDays(14)->toDateString(),
                'target_date'              => now()->addMonths(18)->toDateString(),
                'contributed_pct'          => 0,
            ],
            [
                'name'                     => 'Ikeja Diaspora Investment Group',
                'description'              => "Nigerians in the diaspora (UK, US, Canada) coming together to invest in Ikeja GRA property. We target undervalued properties, renovate, and either rent or sell. Monthly contribution in naira via Paystack. Quarterly Zoom meetings for progress updates.",
                'target_amount_kobo'       => 50000000000, // ₦500M
                'monthly_contribution_kobo' => 200000000,  // ₦2M
                'area_slug'                => 'ikeja-gra',
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 15,
                'start_date'               => now()->subMonths(8)->toDateString(),
                'target_date'              => now()->addMonths(16)->toDateString(),
                'contributed_pct'          => 40,
            ],
            [
                'name'                     => 'Victoria Island Office Co-op',
                'description'              => "Tech entrepreneurs pooling resources to purchase a commercial office space on Victoria Island. Each member gets proportional usage rights based on contribution. Target: a 500sqm office space in a prime VI location. Stop paying rent — own your workspace!",
                'target_amount_kobo'       => 40000000000, // ₦400M
                'monthly_contribution_kobo' => 150000000,  // ₦1.5M
                'area_slug'                => 'victoria-island',
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 10,
                'start_date'               => now()->subMonths(3)->toDateString(),
                'target_date'              => now()->addMonths(24)->toDateString(),
                'contributed_pct'          => 12,
            ],
            [
                'name'                     => 'Ibeju-Lekki Early Birds',
                'description'              => "We saw the future — Ibeju-Lekki is where Lagos is heading. Our cooperative is buying multiple plots near the Lekki Free Trade Zone and Dangote Refinery corridor. Get in early before prices triple. Currently acquiring our 4th plot.",
                'target_amount_kobo'       => 10000000000, // ₦100M
                'monthly_contribution_kobo' => 30000000,   // ₦300K
                'area_slug'                => null,
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 20,
                'start_date'               => now()->subMonths(12)->toDateString(),
                'target_date'              => now()->addMonths(6)->toDateString(),
                'contributed_pct'          => 65,
            ],
            [
                'name'                     => 'Maryland Starter Homes',
                'description'              => "Targeting first-time homeowners in the Maryland/Ojota area. We're pooling to build a small block of 8 starter apartments (2-bed each). Each contributing member gets first right to purchase at cost. Architect already engaged, land survey complete.",
                'target_amount_kobo'       => 15000000000, // ₦150M
                'monthly_contribution_kobo' => 40000000,   // ₦400K
                'area_slug'                => 'maryland',
                'estate_slug'              => null,
                'status'                   => 'active',
                'member_count'             => 8,
                'start_date'               => now()->subMonths(5)->toDateString(),
                'target_date'              => now()->addMonths(14)->toDateString(),
                'contributed_pct'          => 25,
            ],
            [
                'name'                     => 'Banana Island Dream Fund',
                'description'              => "The most ambitious cooperative on the platform. We're a group of high-net-worth individuals pooling to acquire a property on Banana Island. Minimum monthly contribution is ₦5M. Serious inquiries only. All members verified.",
                'target_amount_kobo'       => 200000000000, // ₦2B
                'monthly_contribution_kobo' => 500000000,   // ₦5M
                'area_slug'                => 'banana-island',
                'estate_slug'              => 'banana-island',
                'status'                   => 'forming',
                'member_count'             => 3,
                'start_date'               => now()->addDays(30)->toDateString(),
                'target_date'              => now()->addMonths(36)->toDateString(),
                'contributed_pct'          => 0,
            ],
        ];

        foreach ($cooperatives as $data) {
            $slug = Str::slug($data['name']);
            $admin = $users->random();

            $areaId = isset($data['area_slug']) && $data['area_slug']
                ? ($areas[$data['area_slug']] ?? null)
                : null;

            $estateId = isset($data['estate_slug']) && $data['estate_slug']
                ? ($estates[$data['estate_slug']] ?? null)
                : null;

            $cooperative = Cooperative::firstOrCreate(
                ['slug' => $slug],
                [
                    'name'                     => $data['name'],
                    'slug'                     => $slug,
                    'description'              => $data['description'],
                    'admin_user_id'            => $admin->id,
                    'target_amount_kobo'       => $data['target_amount_kobo'],
                    'monthly_contribution_kobo' => $data['monthly_contribution_kobo'],
                    'area_id'                  => $areaId,
                    'estate_id'                => $estateId,
                    'status'                   => $data['status'],
                    'member_count'             => $data['member_count'],
                    'start_date'               => $data['start_date'],
                    'target_date'              => $data['target_date'],
                ]
            );

            // Create the admin as the first member if cooperative was just created
            if ($cooperative->wasRecentlyCreated) {
                CooperativeMember::create([
                    'cooperative_id'       => $cooperative->id,
                    'user_id'              => $admin->id,
                    'role'                 => 'admin',
                    'total_contributed_kobo' => (int) ($data['target_amount_kobo'] * $data['contributed_pct'] / 100 / max($data['member_count'], 1)),
                    'joined_at'            => $data['start_date'],
                    'status'               => 'active',
                ]);
            }
        }

        $this->command->info('Seeded ' . count($cooperatives) . ' cooperatives.');
    }
}
