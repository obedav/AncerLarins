<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\City;
use App\Models\PropertyRequest;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertyRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Grab users to assign as request owners
        $users = User::whereIn('role', ['user', 'admin'])->get();
        if ($users->isEmpty()) {
            $this->command->warn('No users found — skipping property request seeder.');
            return;
        }

        // Cache lookups
        $areas = Area::pluck('id', 'slug');
        $cities = City::pluck('id', 'slug');
        $propertyTypes = PropertyType::pluck('id', 'slug');

        $requests = [
            [
                'title'           => 'Looking for a 2-bedroom flat in Lekki Phase 1',
                'description'     => "I'm a young professional relocating to Lagos for work. I need a well-maintained 2-bedroom flat in Lekki Phase 1 or surrounding areas. Must have good water supply, prepaid meter, and be in a secure compound. I prefer first floor or above. Budget is flexible for the right place.",
                'listing_type'    => 'rent',
                'property_type'   => 'flat-apartment',
                'area_slug'       => 'lekki-phase-1',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => 2,
                'max_bedrooms'    => 2,
                'budget_kobo'     => 450000000,
                'max_price_kobo'  => 500000000,
                'move_in_date'    => now()->addDays(30)->toDateString(),
            ],
            [
                'title'           => 'Family needs 3-bed flat in Ikeja GRA or Maryland',
                'description'     => "We're a family of 4 looking for a spacious 3-bedroom flat in Ikeja GRA or Maryland area. Must have children's play area or garden, 24/7 security, and reliable power. Close to good schools is a priority. We have a car so parking for at least one vehicle is needed.",
                'listing_type'    => 'rent',
                'property_type'   => 'flat-apartment',
                'area_slug'       => 'ikeja-gra',
                'city_slug'       => 'ikeja',
                'min_bedrooms'    => 3,
                'max_bedrooms'    => 3,
                'budget_kobo'     => 300000000,
                'max_price_kobo'  => 350000000,
                'move_in_date'    => now()->addDays(45)->toDateString(),
                'amenity_preferences' => ['Parking', 'Security', 'Children Play Area'],
            ],
            [
                'title'           => 'Short-let apartment needed in Victoria Island for 2 weeks',
                'description'     => "I'm visiting Lagos for a business trip and need a fully furnished short-let apartment in Victoria Island or Lekki Phase 1. Minimum 1-bedroom with fast WiFi, working AC, and secure parking. Must be in a well-managed building. Check-in around March 15th.",
                'listing_type'    => 'short_let',
                'property_type'   => 'flat-apartment',
                'area_slug'       => 'victoria-island',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => 1,
                'max_bedrooms'    => 2,
                'budget_kobo'     => 150000000,
                'max_price_kobo'  => 200000000,
                'move_in_date'    => now()->addDays(25)->toDateString(),
                'amenity_preferences' => ['WiFi', 'AC', 'Parking', 'Generator'],
            ],
            [
                'title'           => 'Looking to buy land in Ibeju-Lekki for development',
                'description'     => "I want to purchase a plot of land (minimum 600sqm) in Ibeju-Lekki area. Must have a valid C of O or Governor's Consent. Preferably within 2km of the Lekki-Epe Expressway. No wetland or government-acquired land. Budget is firm.",
                'listing_type'    => 'sale',
                'property_type'   => 'land',
                'area_slug'       => null,
                'city_slug'       => 'ibeju-lekki',
                'min_bedrooms'    => null,
                'max_bedrooms'    => null,
                'budget_kobo'     => 2000000000,
                'max_price_kobo'  => 2500000000,
                'move_in_date'    => null,
            ],
            [
                'title'           => 'Need 4-bedroom duplex in a gated estate in Lekki',
                'description'     => "We're looking for a 4-bedroom semi-detached or fully detached duplex in a gated estate around Lekki-Chevron-Ikota axis. Must have BQ (boys' quarters), swimming pool or gym in the estate, and 24/7 security. Willing to pay up to 2 years rent upfront for the right property.",
                'listing_type'    => 'rent',
                'property_type'   => 'semi-detached-duplex',
                'area_slug'       => 'chevron',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => 4,
                'max_bedrooms'    => 5,
                'budget_kobo'     => 800000000,
                'max_price_kobo'  => 1200000000,
                'move_in_date'    => now()->addDays(60)->toDateString(),
                'amenity_preferences' => ['BQ', 'Swimming Pool', 'Gym', '24/7 Security'],
            ],
            [
                'title'           => 'Affordable self-contain in Yaba or Surulere',
                'description'     => "I'm a student at UNILAG looking for an affordable self-contained apartment in Yaba or Surulere. I need basic amenities — running water, electricity (even if not 24/7), and a safe neighbourhood. Nothing fancy, just clean and secure.",
                'listing_type'    => 'rent',
                'property_type'   => 'self-contain',
                'area_slug'       => null,
                'city_slug'       => 'surulere',
                'min_bedrooms'    => null,
                'max_bedrooms'    => null,
                'budget_kobo'     => 50000000,
                'max_price_kobo'  => 80000000,
                'move_in_date'    => now()->addDays(14)->toDateString(),
            ],
            [
                'title'           => 'Office space needed in Ikeja or Victoria Island',
                'description'     => "Our tech startup needs a shop/office space of at least 50sqm in Ikeja CBD or Victoria Island. Must have reliable internet connectivity, air conditioning, and 24/7 access. Open plan preferred. We're a team of 8 and growing.",
                'listing_type'    => 'rent',
                'property_type'   => 'shop-office',
                'area_slug'       => 'victoria-island',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => null,
                'max_bedrooms'    => null,
                'budget_kobo'     => 500000000,
                'max_price_kobo'  => 800000000,
                'move_in_date'    => now()->addDays(30)->toDateString(),
                'amenity_preferences' => ['Internet', 'AC', '24/7 Access'],
            ],
            [
                'title'           => 'Want to buy a 3-bed flat in Ajah under ₦35M',
                'description'     => "First-time buyer looking for a 3-bedroom flat in Ajah or Sangotedo area. New build preferred. Must have C of O. I'd like to be close to schools and markets. Willing to consider off-plan if the developer is reputable and the price is right.",
                'listing_type'    => 'sale',
                'property_type'   => 'flat-apartment',
                'area_slug'       => 'ajah',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => 3,
                'max_bedrooms'    => 3,
                'budget_kobo'     => 3000000000,
                'max_price_kobo'  => 3500000000,
                'move_in_date'    => null,
                'amenity_preferences' => ['New Build', 'C of O', 'Close to Schools'],
            ],
            [
                'title'           => 'Expat couple needs furnished 2-bed on the Island',
                'description'     => "We're an expat couple moving to Lagos for a 2-year assignment. We need a fully furnished 2-bedroom apartment in VI, Ikoyi, or Lekki Phase 1. Must be in a serviced building with reliable power (inverter/generator), clean water, and gym. Our company will pay up to ₦7M/year.",
                'listing_type'    => 'rent',
                'property_type'   => 'flat-apartment',
                'area_slug'       => 'ikoyi',
                'city_slug'       => 'eti-osa',
                'min_bedrooms'    => 2,
                'max_bedrooms'    => 2,
                'budget_kobo'     => 600000000,
                'max_price_kobo'  => 700000000,
                'move_in_date'    => now()->addDays(20)->toDateString(),
                'amenity_preferences' => ['Furnished', 'Gym', 'Generator', 'Inverter', 'Swimming Pool'],
            ],
            [
                'title'           => 'Warehouse space needed in Apapa or Amuwo-Odofin',
                'description'     => "We need a warehouse of at least 500sqm in Apapa, Amuwo-Odofin, or Ikorodu for our logistics business. Must have good road access for trucks, loading bay, and be secure. Long-term lease preferred (minimum 3 years).",
                'listing_type'    => 'rent',
                'property_type'   => 'warehouse',
                'area_slug'       => null,
                'city_slug'       => 'apapa',
                'min_bedrooms'    => null,
                'max_bedrooms'    => null,
                'budget_kobo'     => 1000000000,
                'max_price_kobo'  => 1500000000,
                'move_in_date'    => now()->addDays(45)->toDateString(),
            ],
        ];

        $userIndex = 0;

        foreach ($requests as $data) {
            $user = $users[$userIndex % $users->count()];
            $userIndex++;

            $areaId = isset($data['area_slug']) && $data['area_slug']
                ? ($areas[$data['area_slug']] ?? null)
                : null;

            $cityId = isset($data['city_slug']) && $data['city_slug']
                ? ($cities[$data['city_slug']] ?? null)
                : null;

            $propertyTypeId = isset($data['property_type']) && $data['property_type']
                ? ($propertyTypes[$data['property_type']] ?? null)
                : null;

            PropertyRequest::firstOrCreate(
                ['title' => $data['title']],
                [
                    'user_id'              => $user->id,
                    'title'                => $data['title'],
                    'description'          => $data['description'],
                    'listing_type'         => $data['listing_type'],
                    'property_type_id'     => $propertyTypeId,
                    'area_id'              => $areaId,
                    'city_id'              => $cityId,
                    'min_bedrooms'         => $data['min_bedrooms'] ?? null,
                    'max_bedrooms'         => $data['max_bedrooms'] ?? null,
                    'budget_kobo'          => $data['budget_kobo'] ?? null,
                    'max_price_kobo'       => $data['max_price_kobo'] ?? null,
                    'move_in_date'         => $data['move_in_date'] ?? null,
                    'amenity_preferences'  => $data['amenity_preferences'] ?? null,
                    'status'               => 'active',
                    'response_count'       => 0,
                    'expires_at'           => now()->addDays(30),
                ]
            );
        }

        $this->command->info('Seeded ' . count($requests) . ' property requests.');
    }
}
