<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $appUrl = rtrim(config('app.url'), '/');

        // Fetch existing seeded data
        $agentProfile = DB::table('agent_profiles')->first();
        if (!$agentProfile) {
            $this->command->error('No agent profile found. Run DatabaseSeeder first.');
            return;
        }

        $state = DB::table('states')->where('name', 'Lagos')->first();
        $areas = DB::table('areas')->get()->keyBy('name');
        $cities = DB::table('cities')->get()->keyBy('id');
        $propertyTypes = DB::table('property_types')->get()->keyBy('slug');
        $amenities = DB::table('amenities')->get();

        // Amenity IDs by category for realistic assignment
        $amenityByCategory = $amenities->groupBy('category')->map(fn ($group) => $group->pluck('id')->toArray());

        $adminUser = DB::table('users')->where('role', 'super_admin')->first();

        // Property templates — realistic Nigerian listings
        $properties = [
            // ─── RENT LISTINGS ─────────────────────────────────
            [
                'title' => 'Luxury 3 Bedroom Flat with BQ in Lekki Phase 1',
                'area' => 'Lekki Phase 1',
                'type' => 'flat-apartment',
                'listing_type' => 'rent',
                'bedrooms' => 3, 'bathrooms' => 3, 'toilets' => 4, 'sitting_rooms' => 1,
                'price_kobo' => 450000000, // ₦4.5M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 150,
                'furnishing' => 'semi_furnished',
                'year_built' => 2022,
                'has_bq' => true, 'has_generator' => true, 'has_water_supply' => true,
                'has_cctv' => true, 'is_serviced' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 2,
                'agency_fee_pct' => 10,
                'caution_fee_kobo' => 45000000,
                'service_charge_kobo' => 150000000,
                'description' => "Beautifully finished 3 bedroom apartment with boys quarter in a serene estate in Lekki Phase 1. The apartment features spacious rooms, modern kitchen, and 24-hour power supply.\n\nKey highlights:\n- All rooms ensuite\n- Fitted kitchen with granite top\n- Central gas system\n- 24-hour security\n- Ample parking space\n\nIdeal for families and expatriates looking for comfortable living in a prime Lagos location.",
                'featured' => true,
            ],
            [
                'title' => 'Spacious 2 Bedroom Apartment in Victoria Island',
                'area' => 'Victoria Island',
                'type' => 'flat-apartment',
                'listing_type' => 'rent',
                'bedrooms' => 2, 'bathrooms' => 2, 'toilets' => 3, 'sitting_rooms' => 1,
                'price_kobo' => 500000000, // ₦5M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 120,
                'furnishing' => 'furnished',
                'year_built' => 2021,
                'has_generator' => true, 'has_water_supply' => true, 'has_swimming_pool' => true,
                'has_gym' => true, 'has_cctv' => true, 'is_serviced' => true,
                'parking_spaces' => 1,
                'agency_fee_pct' => 10,
                'service_charge_kobo' => 200000000,
                'description' => "Fully furnished 2 bedroom apartment in the heart of Victoria Island. Perfect for corporate executives and expats. The building features a rooftop swimming pool, gym, and 24/7 concierge service.\n\nPrime location with easy access to Eko Atlantic, bars, restaurants, and the business district.",
                'featured' => true,
            ],
            [
                'title' => 'Modern Self Contain in Yaba',
                'area' => 'Yaba',
                'type' => 'self-contain',
                'listing_type' => 'rent',
                'bedrooms' => 1, 'bathrooms' => 1, 'toilets' => 1, 'sitting_rooms' => 0,
                'price_kobo' => 50000000, // ₦500K/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 25,
                'furnishing' => 'unfurnished',
                'year_built' => 2020,
                'has_prepaid_meter' => true, 'has_water_supply' => true,
                'parking_spaces' => 0,
                'agency_fee_pct' => 10,
                'caution_fee_kobo' => 5000000,
                'description' => "Clean and spacious self-contained apartment in a quiet neighborhood in Yaba. Close to the University of Lagos and Yaba Tech. Ideal for students and young professionals.\n\nFeatures tiled floors, modern bathroom, and prepaid meter. Water supply available. Easy access to public transportation.",
            ],
            [
                'title' => 'Executive 4 Bedroom Duplex in Ikeja GRA',
                'area' => 'Ikeja GRA',
                'type' => 'duplex',
                'listing_type' => 'rent',
                'bedrooms' => 4, 'bathrooms' => 4, 'toilets' => 5, 'sitting_rooms' => 2,
                'price_kobo' => 800000000, // ₦8M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 280,
                'furnishing' => 'unfurnished',
                'year_built' => 2019,
                'has_bq' => true, 'has_generator' => true, 'has_water_supply' => true,
                'has_cctv' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 3,
                'agency_fee_pct' => 10,
                'caution_fee_kobo' => 80000000,
                'legal_fee_kobo' => 25000000,
                'description' => "Exquisite 4 bedroom semi-detached duplex in the prestigious Ikeja GRA estate. Features include a large living room, dining area, modern kitchen, all rooms ensuite, and a boys quarter.\n\nThe compound is gated with security, and the neighborhood is serene with well-maintained roads. 10 minutes from the domestic airport.",
            ],
            [
                'title' => 'Serviced Mini Flat in Chevron',
                'area' => 'Chevron',
                'type' => 'mini-flat',
                'listing_type' => 'rent',
                'bedrooms' => 1, 'bathrooms' => 1, 'toilets' => 2, 'sitting_rooms' => 1,
                'price_kobo' => 150000000, // ₦1.5M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 45,
                'furnishing' => 'semi_furnished',
                'year_built' => 2023,
                'has_generator' => true, 'has_water_supply' => true, 'is_serviced' => true,
                'has_prepaid_meter' => true,
                'parking_spaces' => 1,
                'agency_fee_pct' => 10,
                'service_charge_kobo' => 50000000,
                'description' => "Brand new serviced mini flat in a gated estate along Chevron Drive, Lekki. The property comes with 24-hour electricity, running water, and security.\n\nPerfect for singles and young couples. Close to Chevron roundabout and major landmarks.",
            ],
            [
                'title' => 'Affordable 2 Bedroom Flat in Ajah',
                'area' => 'Ajah',
                'type' => 'flat-apartment',
                'listing_type' => 'rent',
                'bedrooms' => 2, 'bathrooms' => 2, 'toilets' => 2, 'sitting_rooms' => 1,
                'price_kobo' => 100000000, // ₦1M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 80,
                'furnishing' => 'unfurnished',
                'year_built' => 2021,
                'has_water_supply' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 1,
                'agency_fee_pct' => 10,
                'caution_fee_kobo' => 10000000,
                'description' => "Newly built 2 bedroom flat in a gated estate in Ajah. All rooms ensuite with modern finishes. Tiled throughout with POP ceiling.\n\nConvenient location along the Lekki-Epe Expressway with access to major bus stops, markets, and shopping centers.",
            ],
            [
                'title' => 'Cozy 3 Bedroom Flat in Gbagada',
                'area' => 'Gbagada',
                'type' => 'flat-apartment',
                'listing_type' => 'rent',
                'bedrooms' => 3, 'bathrooms' => 2, 'toilets' => 3, 'sitting_rooms' => 1,
                'price_kobo' => 180000000, // ₦1.8M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 110,
                'furnishing' => 'unfurnished',
                'year_built' => 2018,
                'has_generator' => true, 'has_water_supply' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 1,
                'agency_fee_pct' => 10,
                'description' => "Well-maintained 3 bedroom flat in Gbagada Phase 2. The property is in a quiet and secure neighborhood with easy access to Third Mainland Bridge.\n\nSuitable for families. Generator backup available. Water runs 24/7. Close to schools, hospitals, and markets.",
            ],
            [
                'title' => 'Furnished Studio Apartment in Ikoyi',
                'area' => 'Ikoyi',
                'type' => 'self-contain',
                'listing_type' => 'rent',
                'bedrooms' => 1, 'bathrooms' => 1, 'toilets' => 1, 'sitting_rooms' => 0,
                'price_kobo' => 350000000, // ₦3.5M/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 40,
                'furnishing' => 'furnished',
                'year_built' => 2024,
                'has_swimming_pool' => true, 'has_gym' => true, 'has_generator' => true,
                'has_water_supply' => true, 'has_cctv' => true, 'is_serviced' => true,
                'is_new_build' => true,
                'parking_spaces' => 1,
                'service_charge_kobo' => 100000000,
                'description' => "Exquisitely furnished studio apartment in a luxury high-rise building in Ikoyi. Features include smart home technology, premium appliances, and access to residents-only pool and gym.\n\nPerfect for corporate short/long stays. Building has 24-hour concierge, elevator, and underground parking.",
            ],

            // ─── SALE LISTINGS ─────────────────────────────────
            [
                'title' => '5 Bedroom Detached House in Lekki Phase 1',
                'area' => 'Lekki Phase 1',
                'type' => 'detached-house',
                'listing_type' => 'sale',
                'bedrooms' => 5, 'bathrooms' => 5, 'toilets' => 6, 'sitting_rooms' => 2,
                'price_kobo' => 25000000000, // ₦250M
                'floor_area_sqm' => 400,
                'land_area_sqm' => 600,
                'furnishing' => 'unfurnished',
                'year_built' => 2020,
                'has_bq' => true, 'has_swimming_pool' => true, 'has_generator' => true,
                'has_water_supply' => true, 'has_cctv' => true, 'is_serviced' => true,
                'has_prepaid_meter' => true,
                'parking_spaces' => 4,
                'agency_fee_pct' => 5,
                'legal_fee_kobo' => 500000000,
                'price_negotiable' => true,
                'description' => "Magnificent 5 bedroom fully detached house with swimming pool and 2-room BQ in a prime estate in Lekki Phase 1. Built to the highest standards with premium finishes throughout.\n\nFeatures:\n- Smart home automation\n- Italian kitchen fittings\n- Jacuzzi in master suite\n- CCTV surveillance system\n- Inverter system with solar backup\n- Interlocked compound with landscaped garden\n\nPerfect for large families or as a prestigious investment property.",
                'featured' => true,
            ],
            [
                'title' => '4 Bedroom Semi-Detached Duplex in Ikota',
                'area' => 'Ikota',
                'type' => 'semi-detached-duplex',
                'listing_type' => 'sale',
                'bedrooms' => 4, 'bathrooms' => 4, 'toilets' => 5, 'sitting_rooms' => 1,
                'price_kobo' => 8500000000, // ₦85M
                'floor_area_sqm' => 220,
                'land_area_sqm' => 300,
                'furnishing' => 'unfurnished',
                'year_built' => 2023,
                'has_bq' => true, 'has_generator' => true, 'has_water_supply' => true,
                'has_cctv' => true, 'is_new_build' => true,
                'parking_spaces' => 2,
                'agency_fee_pct' => 5,
                'legal_fee_kobo' => 200000000,
                'description' => "Newly built 4 bedroom semi-detached duplex with BQ in a gated estate in Ikota, Lekki. Modern architectural design with spacious interiors.\n\nAll rooms ensuite, fitted kitchen, and a separate laundry area. The estate features 24-hour security, well-paved roads, and green areas.\n\nClose to VGC, Ikota Shopping Complex, and major Lekki landmarks.",
            ],
            [
                'title' => '3 Bedroom Terrace House in Ajah',
                'area' => 'Ajah',
                'type' => 'terrace',
                'listing_type' => 'sale',
                'bedrooms' => 3, 'bathrooms' => 3, 'toilets' => 4, 'sitting_rooms' => 1,
                'price_kobo' => 5500000000, // ₦55M
                'floor_area_sqm' => 160,
                'land_area_sqm' => 200,
                'furnishing' => 'unfurnished',
                'year_built' => 2024,
                'has_generator' => true, 'has_water_supply' => true, 'is_new_build' => true,
                'has_prepaid_meter' => true,
                'parking_spaces' => 1,
                'agency_fee_pct' => 5,
                'legal_fee_kobo' => 100000000,
                'price_negotiable' => true,
                'description' => "Brand new 3 bedroom terrace house in a well-planned estate in Ajah. Perfect for first-time home buyers and young families.\n\nFeatures all rooms ensuite, open-plan kitchen, and a dedicated car park. The estate has a community center, children's playground, and 24-hour security.",
            ],
            [
                'title' => 'Luxury Penthouse in Banana Island',
                'area' => 'Banana Island',
                'type' => 'penthouse',
                'listing_type' => 'sale',
                'bedrooms' => 4, 'bathrooms' => 5, 'toilets' => 6, 'sitting_rooms' => 2,
                'price_kobo' => 120000000000, // ₦1.2B
                'floor_area_sqm' => 500,
                'furnishing' => 'furnished',
                'year_built' => 2023,
                'has_swimming_pool' => true, 'has_gym' => true, 'has_generator' => true,
                'has_water_supply' => true, 'has_cctv' => true, 'is_serviced' => true,
                'has_prepaid_meter' => true,
                'parking_spaces' => 3,
                'floor_number' => 12,
                'total_floors' => 14,
                'legal_fee_kobo' => 2000000000,
                'description' => "Ultra-luxury penthouse apartment on Banana Island, the most exclusive address in Lagos. Panoramic views of the Lagos lagoon and the Atlantic Ocean.\n\nThis one-of-a-kind residence features:\n- Private elevator access\n- Floor-to-ceiling windows\n- Italian marble throughout\n- Bespoke kitchen with Gaggenau appliances\n- Home cinema room\n- Wine cellar\n- Private terrace with outdoor dining\n\nBuilding amenities include infinity pool, spa, fully equipped gym, and 24/7 concierge.",
                'featured' => true,
            ],
            [
                'title' => 'Commercial Shop/Office Space on Allen Avenue',
                'area' => 'Allen Avenue',
                'type' => 'shop-office',
                'listing_type' => 'sale',
                'bedrooms' => 0, 'bathrooms' => 2, 'toilets' => 2, 'sitting_rooms' => 0,
                'price_kobo' => 3500000000, // ₦35M
                'floor_area_sqm' => 100,
                'furnishing' => 'unfurnished',
                'year_built' => 2015,
                'has_generator' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 2,
                'agency_fee_pct' => 5,
                'description' => "Prime commercial office space on Allen Avenue, Ikeja. Ground floor unit with excellent road visibility and foot traffic.\n\nSuitable for banks, retail shops, restaurants, or corporate offices. The building has backup generator and ample parking.\n\nAllen Avenue is one of the busiest commercial corridors in Ikeja with high demand for commercial space.",
            ],
            [
                'title' => 'Plot of Land in Ibeju-Lekki',
                'area' => 'Ibeju-Lekki',
                'type' => 'land',
                'listing_type' => 'sale',
                'bedrooms' => 0, 'bathrooms' => 0, 'toilets' => 0, 'sitting_rooms' => 0,
                'price_kobo' => 1500000000, // ₦15M
                'land_area_sqm' => 648,
                'furnishing' => 'unfurnished',
                'agency_fee_pct' => 5,
                'legal_fee_kobo' => 50000000,
                'price_negotiable' => true,
                'description' => "Well-positioned plot of land in a developing area of Ibeju-Lekki, close to the Dangote Refinery and Lekki Free Trade Zone.\n\nTitle: Governor's Consent\nSize: 648 sqm (standard plot)\n\nThis is an excellent investment opportunity as the area is experiencing rapid development and land values have been appreciating steadily.\n\nSurvey plan and all documentation available for inspection.",
            ],
            [
                'title' => '3 Bedroom Bungalow in Magodo',
                'area' => 'Magodo',
                'type' => 'bungalow',
                'listing_type' => 'sale',
                'bedrooms' => 3, 'bathrooms' => 2, 'toilets' => 3, 'sitting_rooms' => 1,
                'price_kobo' => 6000000000, // ₦60M
                'floor_area_sqm' => 180,
                'land_area_sqm' => 450,
                'furnishing' => 'unfurnished',
                'year_built' => 2010,
                'has_bq' => true, 'has_generator' => true, 'has_water_supply' => true,
                'has_prepaid_meter' => true,
                'parking_spaces' => 2,
                'agency_fee_pct' => 5,
                'legal_fee_kobo' => 150000000,
                'description' => "Solid 3 bedroom bungalow on a large plot in Magodo GRA Phase 2. This is a well-maintained property in a serene and upscale neighborhood.\n\nThe compound has a separate BQ, carport, and a garden area. Good for renovation or redevelopment into a multi-story building.\n\nMagodo GRA is one of the most sought-after residential areas in Lagos with excellent road networks and proximity to Ikeja.",
            ],
            [
                'title' => '2 Bedroom Flat in Surulere',
                'area' => 'Surulere',
                'type' => 'flat-apartment',
                'listing_type' => 'rent',
                'bedrooms' => 2, 'bathrooms' => 2, 'toilets' => 2, 'sitting_rooms' => 1,
                'price_kobo' => 80000000, // ₦800K/year
                'rent_period' => 'yearly',
                'floor_area_sqm' => 75,
                'furnishing' => 'unfurnished',
                'year_built' => 2017,
                'has_water_supply' => true, 'has_prepaid_meter' => true,
                'parking_spaces' => 0,
                'agency_fee_pct' => 10,
                'caution_fee_kobo' => 8000000,
                'description' => "Neat 2 bedroom flat in a quiet street in Surulere. Close to the National Stadium, shopping centers, and major bus stops.\n\nAll rooms ensuite with tiled floors and POP ceiling. Water supply is stable. Prepaid meter installed.\n\nSurulere is a vibrant residential area with excellent connectivity to Lagos Island and the mainland.",
            ],
        ];

        // Generate local sample images
        $imageCount = count($properties);
        $imagesPerProperty = 4;
        Artisan::call('samples:generate-images', [
            '--count' => $imageCount,
            '--per' => $imagesPerProperty,
        ]);
        $this->command->info('Generated sample images in storage.');

        foreach ($properties as $index => $p) {
            $area = $areas->get($p['area']);
            if (!$area) {
                $this->command->warn("Area '{$p['area']}' not found, skipping.");
                continue;
            }

            $city = $cities->get($area->city_id);
            $propType = $propertyTypes->get($p['type']);
            if (!$propType) {
                $this->command->warn("Property type '{$p['type']}' not found, skipping.");
                continue;
            }

            $slug = Str::slug($p['title']);
            $existingCount = DB::table('properties')->where('slug', 'like', "{$slug}%")->count();
            if ($existingCount > 0) {
                $slug = "{$slug}-{$existingCount}";
            }

            $propertyId = Str::uuid()->toString();
            $publishedAt = $now->copy()->subDays(rand(1, 60));

            DB::table('properties')->insert([
                'id' => $propertyId,
                'agent_id' => $agentProfile->id,
                'listing_type' => $p['listing_type'],
                'property_type_id' => $propType->id,
                'title' => $p['title'],
                'slug' => $slug,
                'description' => $p['description'],
                'price_kobo' => $p['price_kobo'],
                'price_negotiable' => $p['price_negotiable'] ?? false,
                'rent_period' => $p['rent_period'] ?? null,
                'agency_fee_pct' => $p['agency_fee_pct'] ?? null,
                'caution_fee_kobo' => $p['caution_fee_kobo'] ?? null,
                'service_charge_kobo' => $p['service_charge_kobo'] ?? null,
                'legal_fee_kobo' => $p['legal_fee_kobo'] ?? null,
                'state_id' => $state->id,
                'city_id' => $area->city_id,
                'area_id' => $area->id,
                'address' => "{$p['area']}, {$city->name}, Lagos",
                'location_fuzzy' => true,
                'bedrooms' => $p['bedrooms'],
                'bathrooms' => $p['bathrooms'],
                'toilets' => $p['toilets'],
                'sitting_rooms' => $p['sitting_rooms'],
                'floor_area_sqm' => $p['floor_area_sqm'] ?? null,
                'land_area_sqm' => $p['land_area_sqm'] ?? null,
                'floor_number' => $p['floor_number'] ?? null,
                'total_floors' => $p['total_floors'] ?? null,
                'year_built' => $p['year_built'] ?? null,
                'furnishing' => $p['furnishing'],
                'parking_spaces' => $p['parking_spaces'] ?? 0,
                'has_bq' => $p['has_bq'] ?? false,
                'has_swimming_pool' => $p['has_swimming_pool'] ?? false,
                'has_gym' => $p['has_gym'] ?? false,
                'has_cctv' => $p['has_cctv'] ?? false,
                'has_generator' => $p['has_generator'] ?? false,
                'has_water_supply' => $p['has_water_supply'] ?? false,
                'has_prepaid_meter' => $p['has_prepaid_meter'] ?? false,
                'is_serviced' => $p['is_serviced'] ?? false,
                'is_new_build' => $p['is_new_build'] ?? false,
                'inspection_available' => true,
                'status' => 'approved',
                'approved_by' => $adminUser?->id,
                'approved_at' => $publishedAt,
                'featured' => $p['featured'] ?? false,
                'featured_until' => ($p['featured'] ?? false) ? $now->copy()->addMonths(3) : null,
                'view_count' => rand(10, 500),
                'save_count' => rand(0, 30),
                'contact_count' => rand(0, 20),
                'share_count' => rand(0, 10),
                'published_at' => $publishedAt,
                'expires_at' => $publishedAt->copy()->addMonths(3),
                'created_at' => $publishedAt,
                'updated_at' => $now,
            ]);

            // Seed images from locally generated samples
            $propNum = $index + 1;
            for ($i = 0; $i < $imagesPerProperty; $i++) {
                $imgUrl = "{$appUrl}/storage/properties/samples/property-{$propNum}-{$i}.jpg";
                $thumbUrl = "{$appUrl}/storage/properties/samples/property-{$propNum}-{$i}-thumb.jpg";
                DB::table('property_images')->insert([
                    'id' => Str::uuid()->toString(),
                    'property_id' => $propertyId,
                    'image_url' => $imgUrl,
                    'thumbnail_url' => $thumbUrl,
                    'caption' => $i === 0 ? 'Main view' : null,
                    'sort_order' => $i,
                    'is_cover' => $i === 0,
                    'width' => 800,
                    'height' => 600,
                    'created_at' => $publishedAt,
                ]);
            }

            // Attach 3-6 random amenities
            $selectedAmenities = $amenities->random(min(rand(3, 6), $amenities->count()));
            foreach ($selectedAmenities as $amenity) {
                DB::table('property_amenities')->insertOrIgnore([
                    'property_id' => $propertyId,
                    'amenity_id' => $amenity->id,
                ]);
            }

            // Create price history records (6 months) for Market Trends
            for ($month = 5; $month >= 0; $month--) {
                $recordDate = $now->copy()->subMonths($month)->startOfMonth();
                // Slight price variation over months (±5%)
                $variation = 1 + (rand(-5, 5) / 100);
                $historicPrice = (int) round($p['price_kobo'] * $variation);

                DB::table('price_history')->insert([
                    'id' => Str::uuid()->toString(),
                    'property_id' => $propertyId,
                    'price_kobo' => $historicPrice,
                    'listing_type' => $p['listing_type'],
                    'recorded_at' => $recordDate,
                ]);
            }
        }

        $this->command->info('Seeded ' . count($properties) . ' properties with images, amenities, and price history.');
    }
}
