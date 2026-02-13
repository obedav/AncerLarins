<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LagosSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── State ────────────────────────────────────────────
        $lagosId = Str::uuid()->toString();
        DB::table('states')->insert([
            'id' => $lagosId,
            'name' => 'Lagos',
            'slug' => 'lagos',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ── Cities (Lagos LGAs) ─────────────────────────────
        $lgas = [
            'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
            'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
            'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
            'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere',
        ];

        $cityIds = [];
        foreach ($lgas as $lga) {
            $id = Str::uuid()->toString();
            $cityIds[$lga] = $id;
            DB::table('cities')->insert([
                'id' => $id,
                'state_id' => $lagosId,
                'name' => $lga,
                'slug' => Str::slug($lga),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── Areas (50+ across Lagos) ────────────────────────
        $areas = [
            // Eti-Osa (11 areas)
            ['city' => 'Eti-Osa', 'name' => 'Lekki Phase 1', 'lat' => 6.4412, 'lng' => 3.4718, 'rent_1br' => 150000000, 'rent_2br' => 250000000, 'rent_3br' => 400000000, 'buy_sqm' => 50000000, 'safety' => 8.0],
            ['city' => 'Eti-Osa', 'name' => 'Lekki Phase 2', 'lat' => 6.4500, 'lng' => 3.5167, 'rent_1br' => 80000000, 'rent_2br' => 150000000, 'rent_3br' => 250000000, 'buy_sqm' => 30000000, 'safety' => 7.0],
            ['city' => 'Eti-Osa', 'name' => 'Victoria Island', 'lat' => 6.4281, 'lng' => 3.4219, 'rent_1br' => 200000000, 'rent_2br' => 400000000, 'rent_3br' => 600000000, 'buy_sqm' => 80000000, 'safety' => 8.5],
            ['city' => 'Eti-Osa', 'name' => 'Ikoyi', 'lat' => 6.4500, 'lng' => 3.4333, 'rent_1br' => 250000000, 'rent_2br' => 500000000, 'rent_3br' => 800000000, 'buy_sqm' => 100000000, 'safety' => 9.0],
            ['city' => 'Eti-Osa', 'name' => 'Banana Island', 'lat' => 6.4560, 'lng' => 3.4270, 'rent_1br' => 500000000, 'rent_2br' => 800000000, 'rent_3br' => 1500000000, 'buy_sqm' => 250000000, 'safety' => 9.5],
            ['city' => 'Eti-Osa', 'name' => 'Ajah', 'lat' => 6.4667, 'lng' => 3.5833, 'rent_1br' => 50000000, 'rent_2br' => 80000000, 'rent_3br' => 150000000, 'buy_sqm' => 15000000, 'safety' => 6.5],
            ['city' => 'Eti-Osa', 'name' => 'Chevron', 'lat' => 6.4350, 'lng' => 3.5250, 'rent_1br' => 100000000, 'rent_2br' => 180000000, 'rent_3br' => 300000000, 'buy_sqm' => 35000000, 'safety' => 7.5],
            ['city' => 'Eti-Osa', 'name' => 'Ikota', 'lat' => 6.4450, 'lng' => 3.5350, 'rent_1br' => 70000000, 'rent_2br' => 120000000, 'rent_3br' => 200000000, 'buy_sqm' => 25000000, 'safety' => 7.0],
            ['city' => 'Eti-Osa', 'name' => 'Osapa London', 'lat' => 6.4380, 'lng' => 3.5180, 'rent_1br' => 80000000, 'rent_2br' => 150000000, 'rent_3br' => 250000000, 'buy_sqm' => 30000000, 'safety' => 7.5],
            ['city' => 'Eti-Osa', 'name' => 'Agungi', 'lat' => 6.4320, 'lng' => 3.5100, 'rent_1br' => 70000000, 'rent_2br' => 130000000, 'rent_3br' => 200000000, 'buy_sqm' => 25000000, 'safety' => 7.0],
            ['city' => 'Eti-Osa', 'name' => 'Ilasan', 'lat' => 6.4360, 'lng' => 3.5050, 'rent_1br' => 60000000, 'rent_2br' => 100000000, 'rent_3br' => 180000000, 'buy_sqm' => 20000000, 'safety' => 7.0],

            // Ikeja (8 areas)
            ['city' => 'Ikeja', 'name' => 'Ikeja GRA', 'lat' => 6.5833, 'lng' => 3.3500, 'rent_1br' => 100000000, 'rent_2br' => 200000000, 'rent_3br' => 350000000, 'buy_sqm' => 40000000, 'safety' => 8.0],
            ['city' => 'Ikeja', 'name' => 'Maryland', 'lat' => 6.5700, 'lng' => 3.3650, 'rent_1br' => 60000000, 'rent_2br' => 100000000, 'rent_3br' => 150000000, 'buy_sqm' => 20000000, 'safety' => 6.5],
            ['city' => 'Ikeja', 'name' => 'Alausa', 'lat' => 6.6115, 'lng' => 3.3569, 'rent_1br' => 50000000, 'rent_2br' => 80000000, 'rent_3br' => 120000000, 'buy_sqm' => 18000000, 'safety' => 7.0],
            ['city' => 'Ikeja', 'name' => 'Oregun', 'lat' => 6.5950, 'lng' => 3.3700, 'rent_1br' => 40000000, 'rent_2br' => 70000000, 'rent_3br' => 100000000, 'buy_sqm' => 15000000, 'safety' => 6.5],
            ['city' => 'Ikeja', 'name' => 'Opebi', 'lat' => 6.5850, 'lng' => 3.3580, 'rent_1br' => 50000000, 'rent_2br' => 80000000, 'rent_3br' => 130000000, 'buy_sqm' => 18000000, 'safety' => 7.0],
            ['city' => 'Ikeja', 'name' => 'Allen Avenue', 'lat' => 6.5970, 'lng' => 3.3560, 'rent_1br' => 60000000, 'rent_2br' => 100000000, 'rent_3br' => 150000000, 'buy_sqm' => 22000000, 'safety' => 7.0],
            ['city' => 'Ikeja', 'name' => 'Adeniyi Jones', 'lat' => 6.5920, 'lng' => 3.3520, 'rent_1br' => 50000000, 'rent_2br' => 85000000, 'rent_3br' => 120000000, 'buy_sqm' => 18000000, 'safety' => 7.0],
            ['city' => 'Ikeja', 'name' => 'Ogba', 'lat' => 6.6200, 'lng' => 3.3400, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 12000000, 'safety' => 6.0],

            // Surulere (4 areas)
            ['city' => 'Surulere', 'name' => 'Surulere', 'lat' => 6.4969, 'lng' => 3.3564, 'rent_1br' => 40000000, 'rent_2br' => 70000000, 'rent_3br' => 100000000, 'buy_sqm' => 15000000, 'safety' => 6.0],
            ['city' => 'Surulere', 'name' => 'Adeniran Ogunsanya', 'lat' => 6.4950, 'lng' => 3.3530, 'rent_1br' => 45000000, 'rent_2br' => 75000000, 'rent_3br' => 110000000, 'buy_sqm' => 16000000, 'safety' => 6.0],
            ['city' => 'Surulere', 'name' => 'Bode Thomas', 'lat' => 6.4930, 'lng' => 3.3620, 'rent_1br' => 35000000, 'rent_2br' => 60000000, 'rent_3br' => 90000000, 'buy_sqm' => 14000000, 'safety' => 5.5],
            ['city' => 'Surulere', 'name' => 'Aguda', 'lat' => 6.5010, 'lng' => 3.3570, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 12000000, 'safety' => 5.5],

            // Lagos Island (4 areas)
            ['city' => 'Lagos Island', 'name' => 'Lagos Island', 'lat' => 6.4549, 'lng' => 3.3903, 'rent_1br' => 80000000, 'rent_2br' => 150000000, 'rent_3br' => 250000000, 'buy_sqm' => 45000000, 'safety' => 6.5],
            ['city' => 'Lagos Island', 'name' => 'Marina', 'lat' => 6.4480, 'lng' => 3.3930, 'rent_1br' => 100000000, 'rent_2br' => 200000000, 'rent_3br' => 300000000, 'buy_sqm' => 50000000, 'safety' => 7.0],
            ['city' => 'Lagos Island', 'name' => 'Broad Street', 'lat' => 6.4500, 'lng' => 3.3900, 'rent_1br' => 90000000, 'rent_2br' => 180000000, 'rent_3br' => 280000000, 'buy_sqm' => 48000000, 'safety' => 6.5],
            ['city' => 'Lagos Island', 'name' => 'Onikan', 'lat' => 6.4520, 'lng' => 3.4050, 'rent_1br' => 85000000, 'rent_2br' => 160000000, 'rent_3br' => 260000000, 'buy_sqm' => 45000000, 'safety' => 7.0],

            // Lagos Mainland (3 areas)
            ['city' => 'Lagos Mainland', 'name' => 'Yaba', 'lat' => 6.5097, 'lng' => 3.3792, 'rent_1br' => 40000000, 'rent_2br' => 70000000, 'rent_3br' => 120000000, 'buy_sqm' => 18000000, 'safety' => 6.0],
            ['city' => 'Lagos Mainland', 'name' => 'Ebute Metta', 'lat' => 6.4850, 'lng' => 3.3850, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 12000000, 'safety' => 5.5],
            ['city' => 'Lagos Mainland', 'name' => 'Oyingbo', 'lat' => 6.4780, 'lng' => 3.3880, 'rent_1br' => 25000000, 'rent_2br' => 40000000, 'rent_3br' => 60000000, 'buy_sqm' => 10000000, 'safety' => 5.0],

            // Kosofe (4 areas)
            ['city' => 'Kosofe', 'name' => 'Gbagada', 'lat' => 6.5525, 'lng' => 3.3889, 'rent_1br' => 50000000, 'rent_2br' => 80000000, 'rent_3br' => 130000000, 'buy_sqm' => 18000000, 'safety' => 6.5],
            ['city' => 'Kosofe', 'name' => 'Anthony', 'lat' => 6.5600, 'lng' => 3.3750, 'rent_1br' => 40000000, 'rent_2br' => 70000000, 'rent_3br' => 110000000, 'buy_sqm' => 16000000, 'safety' => 6.0],
            ['city' => 'Kosofe', 'name' => 'Ogudu', 'lat' => 6.5650, 'lng' => 3.3980, 'rent_1br' => 35000000, 'rent_2br' => 60000000, 'rent_3br' => 100000000, 'buy_sqm' => 14000000, 'safety' => 6.0],
            ['city' => 'Kosofe', 'name' => 'Magodo', 'lat' => 6.6150, 'lng' => 3.3800, 'rent_1br' => 80000000, 'rent_2br' => 130000000, 'rent_3br' => 200000000, 'buy_sqm' => 28000000, 'safety' => 7.5],

            // Alimosho (4 areas)
            ['city' => 'Alimosho', 'name' => 'Ikotun', 'lat' => 6.5500, 'lng' => 3.2700, 'rent_1br' => 15000000, 'rent_2br' => 25000000, 'rent_3br' => 40000000, 'buy_sqm' => 5000000, 'safety' => 5.0],
            ['city' => 'Alimosho', 'name' => 'Egbeda', 'lat' => 6.5900, 'lng' => 3.2850, 'rent_1br' => 15000000, 'rent_2br' => 25000000, 'rent_3br' => 40000000, 'buy_sqm' => 5000000, 'safety' => 5.0],
            ['city' => 'Alimosho', 'name' => 'Akowonjo', 'lat' => 6.6100, 'lng' => 3.3100, 'rent_1br' => 18000000, 'rent_2br' => 30000000, 'rent_3br' => 45000000, 'buy_sqm' => 6000000, 'safety' => 5.0],
            ['city' => 'Alimosho', 'name' => 'Idimu', 'lat' => 6.5600, 'lng' => 3.2600, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 35000000, 'buy_sqm' => 4000000, 'safety' => 5.0],

            // Oshodi-Isolo (3 areas)
            ['city' => 'Oshodi-Isolo', 'name' => 'Isolo', 'lat' => 6.5250, 'lng' => 3.3250, 'rent_1br' => 25000000, 'rent_2br' => 40000000, 'rent_3br' => 60000000, 'buy_sqm' => 10000000, 'safety' => 5.5],
            ['city' => 'Oshodi-Isolo', 'name' => 'Oshodi', 'lat' => 6.5550, 'lng' => 3.3350, 'rent_1br' => 20000000, 'rent_2br' => 35000000, 'rent_3br' => 50000000, 'buy_sqm' => 8000000, 'safety' => 5.0],
            ['city' => 'Oshodi-Isolo', 'name' => 'Mafoluku', 'lat' => 6.5800, 'lng' => 3.3300, 'rent_1br' => 20000000, 'rent_2br' => 35000000, 'rent_3br' => 50000000, 'buy_sqm' => 8000000, 'safety' => 5.0],

            // Amuwo-Odofin (2 areas)
            ['city' => 'Amuwo-Odofin', 'name' => 'Festac Town', 'lat' => 6.4630, 'lng' => 3.2830, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 12000000, 'safety' => 6.0],
            ['city' => 'Amuwo-Odofin', 'name' => 'Amuwo', 'lat' => 6.4550, 'lng' => 3.3000, 'rent_1br' => 25000000, 'rent_2br' => 40000000, 'rent_3br' => 60000000, 'buy_sqm' => 10000000, 'safety' => 5.5],

            // Apapa (2 areas)
            ['city' => 'Apapa', 'name' => 'Apapa', 'lat' => 6.4475, 'lng' => 3.3612, 'rent_1br' => 50000000, 'rent_2br' => 80000000, 'rent_3br' => 130000000, 'buy_sqm' => 20000000, 'safety' => 5.5],
            ['city' => 'Apapa', 'name' => 'Apapa GRA', 'lat' => 6.4500, 'lng' => 3.3550, 'rent_1br' => 70000000, 'rent_2br' => 120000000, 'rent_3br' => 200000000, 'buy_sqm' => 30000000, 'safety' => 7.0],

            // Agege (2 areas)
            ['city' => 'Agege', 'name' => 'Agege', 'lat' => 6.6186, 'lng' => 3.3284, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 30000000, 'buy_sqm' => 4000000, 'safety' => 4.5],
            ['city' => 'Agege', 'name' => 'Pen Cinema', 'lat' => 6.6200, 'lng' => 3.3250, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 30000000, 'buy_sqm' => 4000000, 'safety' => 4.5],

            // Shomolu (2 areas)
            ['city' => 'Shomolu', 'name' => 'Shomolu', 'lat' => 6.5350, 'lng' => 3.3900, 'rent_1br' => 20000000, 'rent_2br' => 35000000, 'rent_3br' => 50000000, 'buy_sqm' => 8000000, 'safety' => 5.0],
            ['city' => 'Shomolu', 'name' => 'Bariga', 'lat' => 6.5380, 'lng' => 3.3950, 'rent_1br' => 15000000, 'rent_2br' => 25000000, 'rent_3br' => 40000000, 'buy_sqm' => 6000000, 'safety' => 5.0],

            // Ikorodu (2 areas)
            ['city' => 'Ikorodu', 'name' => 'Ikorodu', 'lat' => 6.6194, 'lng' => 3.5105, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 35000000, 'buy_sqm' => 3000000, 'safety' => 5.0],
            ['city' => 'Ikorodu', 'name' => 'Agric', 'lat' => 6.6100, 'lng' => 3.4800, 'rent_1br' => 10000000, 'rent_2br' => 18000000, 'rent_3br' => 30000000, 'buy_sqm' => 2500000, 'safety' => 5.0],

            // Ibeju-Lekki (4 areas)
            ['city' => 'Ibeju-Lekki', 'name' => 'Ibeju-Lekki', 'lat' => 6.4500, 'lng' => 3.6200, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 8000000, 'safety' => 6.0],
            ['city' => 'Ibeju-Lekki', 'name' => 'Eleko', 'lat' => 6.4200, 'lng' => 3.6500, 'rent_1br' => 25000000, 'rent_2br' => 40000000, 'rent_3br' => 60000000, 'buy_sqm' => 5000000, 'safety' => 6.0],
            ['city' => 'Ibeju-Lekki', 'name' => 'Abijo', 'lat' => 6.4300, 'lng' => 3.6100, 'rent_1br' => 30000000, 'rent_2br' => 50000000, 'rent_3br' => 80000000, 'buy_sqm' => 7000000, 'safety' => 6.5],
            ['city' => 'Ibeju-Lekki', 'name' => 'Awoyaya', 'lat' => 6.4600, 'lng' => 3.5900, 'rent_1br' => 25000000, 'rent_2br' => 40000000, 'rent_3br' => 70000000, 'buy_sqm' => 6000000, 'safety' => 6.0],

            // Ojo (2 areas)
            ['city' => 'Ojo', 'name' => 'Ojo', 'lat' => 6.4600, 'lng' => 3.1800, 'rent_1br' => 10000000, 'rent_2br' => 18000000, 'rent_3br' => 25000000, 'buy_sqm' => 3000000, 'safety' => 5.0],
            ['city' => 'Ojo', 'name' => 'Alaba International', 'lat' => 6.4650, 'lng' => 3.1900, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 30000000, 'buy_sqm' => 4000000, 'safety' => 5.0],

            // Badagry (1 area)
            ['city' => 'Badagry', 'name' => 'Badagry', 'lat' => 6.4167, 'lng' => 2.8833, 'rent_1br' => 8000000, 'rent_2br' => 15000000, 'rent_3br' => 20000000, 'buy_sqm' => 2000000, 'safety' => 5.5],

            // Epe (1 area)
            ['city' => 'Epe', 'name' => 'Epe', 'lat' => 6.5833, 'lng' => 3.9833, 'rent_1br' => 8000000, 'rent_2br' => 15000000, 'rent_3br' => 22000000, 'buy_sqm' => 2000000, 'safety' => 6.0],

            // Mushin (2 areas)
            ['city' => 'Mushin', 'name' => 'Mushin', 'lat' => 6.5280, 'lng' => 3.3530, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 30000000, 'buy_sqm' => 5000000, 'safety' => 4.5],
            ['city' => 'Mushin', 'name' => 'Idi-Araba', 'lat' => 6.5200, 'lng' => 3.3600, 'rent_1br' => 15000000, 'rent_2br' => 25000000, 'rent_3br' => 35000000, 'buy_sqm' => 6000000, 'safety' => 5.0],

            // Ifako-Ijaiye (3 areas)
            ['city' => 'Ifako-Ijaiye', 'name' => 'Ifako', 'lat' => 6.6500, 'lng' => 3.3200, 'rent_1br' => 12000000, 'rent_2br' => 20000000, 'rent_3br' => 30000000, 'buy_sqm' => 4000000, 'safety' => 5.0],
            ['city' => 'Ifako-Ijaiye', 'name' => 'Ijaiye', 'lat' => 6.6600, 'lng' => 3.2800, 'rent_1br' => 10000000, 'rent_2br' => 18000000, 'rent_3br' => 28000000, 'buy_sqm' => 3500000, 'safety' => 5.0],
            ['city' => 'Ifako-Ijaiye', 'name' => 'Ojokoro', 'lat' => 6.6700, 'lng' => 3.3100, 'rent_1br' => 10000000, 'rent_2br' => 18000000, 'rent_3br' => 25000000, 'buy_sqm' => 3000000, 'safety' => 5.0],

            // Ajeromi-Ifelodun (1 area)
            ['city' => 'Ajeromi-Ifelodun', 'name' => 'Ajegunle', 'lat' => 6.4600, 'lng' => 3.3300, 'rent_1br' => 8000000, 'rent_2br' => 15000000, 'rent_3br' => 22000000, 'buy_sqm' => 3000000, 'safety' => 4.0],
        ];

        foreach ($areas as $area) {
            $areaId = Str::uuid()->toString();
            DB::table('areas')->insert([
                'id' => $areaId,
                'city_id' => $cityIds[$area['city']],
                'name' => $area['name'],
                'slug' => Str::slug($area['name']),
                'avg_rent_1br' => $area['rent_1br'],
                'avg_rent_2br' => $area['rent_2br'],
                'avg_rent_3br' => $area['rent_3br'],
                'avg_buy_price_sqm' => $area['buy_sqm'],
                'safety_score' => $area['safety'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Set PostGIS location
            if (isset($area['lat']) && isset($area['lng'])) {
                DB::statement(
                    "UPDATE areas SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?",
                    [$area['lng'], $area['lat'], $areaId]
                );
            }
        }

        // ── Property Types (13) ─────────────────────────────
        $propertyTypes = [
            ['name' => 'Flat / Apartment', 'slug' => 'flat-apartment', 'icon' => 'building', 'sort' => 1],
            ['name' => 'Mini Flat', 'slug' => 'mini-flat', 'icon' => 'home', 'sort' => 2],
            ['name' => 'Self Contain', 'slug' => 'self-contain', 'icon' => 'door-open', 'sort' => 3],
            ['name' => 'Room & Parlour', 'slug' => 'room-parlour', 'icon' => 'couch', 'sort' => 4],
            ['name' => 'Duplex', 'slug' => 'duplex', 'icon' => 'house', 'sort' => 5],
            ['name' => 'Semi-Detached Duplex', 'slug' => 'semi-detached-duplex', 'icon' => 'house-chimney', 'sort' => 6],
            ['name' => 'Detached House', 'slug' => 'detached-house', 'icon' => 'house-chimney-window', 'sort' => 7],
            ['name' => 'Terrace', 'slug' => 'terrace', 'icon' => 'city', 'sort' => 8],
            ['name' => 'Bungalow', 'slug' => 'bungalow', 'icon' => 'house-flag', 'sort' => 9],
            ['name' => 'Penthouse', 'slug' => 'penthouse', 'icon' => 'building-columns', 'sort' => 10],
            ['name' => 'Shop / Office', 'slug' => 'shop-office', 'icon' => 'store', 'sort' => 11],
            ['name' => 'Warehouse', 'slug' => 'warehouse', 'icon' => 'warehouse', 'sort' => 12],
            ['name' => 'Land', 'slug' => 'land', 'icon' => 'mountain-sun', 'sort' => 13],
        ];

        foreach ($propertyTypes as $pt) {
            DB::table('property_types')->insert([
                'id' => Str::uuid()->toString(),
                'name' => $pt['name'],
                'slug' => $pt['slug'],
                'icon' => $pt['icon'],
                'sort_order' => $pt['sort'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── Amenities (25 common Nigerian real estate amenities) ──
        $amenities = [
            // Utilities
            ['name' => '24hr Electricity', 'category' => 'utilities', 'icon' => 'bolt', 'sort' => 1],
            ['name' => 'Generator', 'category' => 'utilities', 'icon' => 'car-battery', 'sort' => 2],
            ['name' => 'Water Supply', 'category' => 'utilities', 'icon' => 'droplet', 'sort' => 3],
            ['name' => 'Prepaid Meter', 'category' => 'utilities', 'icon' => 'gauge', 'sort' => 4],
            ['name' => 'Internet / Wi-Fi', 'category' => 'utilities', 'icon' => 'wifi', 'sort' => 5],

            // Security
            ['name' => 'CCTV', 'category' => 'security', 'icon' => 'video', 'sort' => 6],
            ['name' => 'Security Guard', 'category' => 'security', 'icon' => 'shield', 'sort' => 7],
            ['name' => 'Gated Community', 'category' => 'security', 'icon' => 'lock', 'sort' => 8],
            ['name' => 'Perimeter Fence', 'category' => 'security', 'icon' => 'fence', 'sort' => 9],

            // Recreation
            ['name' => 'Swimming Pool', 'category' => 'recreation', 'icon' => 'water-ladder', 'sort' => 10],
            ['name' => 'Gym', 'category' => 'recreation', 'icon' => 'dumbbell', 'sort' => 11],
            ['name' => 'Children\'s Playground', 'category' => 'recreation', 'icon' => 'child', 'sort' => 12],
            ['name' => 'Tennis Court', 'category' => 'recreation', 'icon' => 'table-tennis', 'sort' => 13],
            ['name' => 'Garden', 'category' => 'recreation', 'icon' => 'tree', 'sort' => 14],

            // Parking
            ['name' => 'Parking Space', 'category' => 'parking', 'icon' => 'square-parking', 'sort' => 15],
            ['name' => 'Covered Garage', 'category' => 'parking', 'icon' => 'warehouse', 'sort' => 16],

            // Interior
            ['name' => 'Air Conditioning', 'category' => 'interior', 'icon' => 'snowflake', 'sort' => 17],
            ['name' => 'Wardrobe', 'category' => 'interior', 'icon' => 'box', 'sort' => 18],
            ['name' => 'Kitchen Cabinet', 'category' => 'interior', 'icon' => 'kitchen-set', 'sort' => 19],
            ['name' => 'POP Ceiling', 'category' => 'interior', 'icon' => 'layer-group', 'sort' => 20],
            ['name' => 'Tiled Floor', 'category' => 'interior', 'icon' => 'border-all', 'sort' => 21],

            // Exterior
            ['name' => 'Interlocked Compound', 'category' => 'exterior', 'icon' => 'road', 'sort' => 22],
            ['name' => 'Boys Quarter (BQ)', 'category' => 'exterior', 'icon' => 'house-user', 'sort' => 23],

            // Building
            ['name' => 'Elevator', 'category' => 'building', 'icon' => 'elevator', 'sort' => 24],
            ['name' => 'Laundry Room', 'category' => 'building', 'icon' => 'shirt', 'sort' => 25],
        ];

        foreach ($amenities as $amenity) {
            DB::table('amenities')->insert([
                'id' => Str::uuid()->toString(),
                'name' => $amenity['name'],
                'category' => $amenity['category'],
                'icon' => $amenity['icon'],
                'sort_order' => $amenity['sort'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
