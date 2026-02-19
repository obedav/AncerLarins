<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Estate;
use Illuminate\Database\Seeder;

class EstateSeeder extends Seeder
{
    public function run(): void
    {
        $estates = [
            // Ikoyi
            ['name' => 'Banana Island', 'area_slug' => 'ikoyi', 'estate_type' => 'gated_estate', 'developer' => 'Banana Island Estate', 'security_type' => '24/7 Armed Security', 'total_units' => 536, 'service_charge_kobo' => 500000000, 'service_charge_period' => 'annually', 'electricity_source' => 'Independent Power', 'water_source' => 'Central Treatment Plant'],
            ['name' => 'Parkview Estate', 'area_slug' => 'ikoyi', 'estate_type' => 'gated_estate', 'developer' => 'Parkview Estate', 'security_type' => '24/7 Security Gate', 'total_units' => 400],
            ['name' => 'Old Ikoyi Estate', 'area_slug' => 'ikoyi', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Neighbourhood Watch'],

            // Lekki
            ['name' => 'Chevron Estate', 'area_slug' => 'lekki', 'estate_type' => 'gated_estate', 'developer' => 'Chevron Nigeria', 'security_type' => '24/7 Security', 'total_units' => 200, 'service_charge_kobo' => 150000000, 'service_charge_period' => 'annually'],
            ['name' => 'Pinnock Beach Estate', 'area_slug' => 'lekki', 'estate_type' => 'gated_estate', 'developer' => 'Pinnock Properties', 'security_type' => '24/7 Armed Security', 'total_units' => 120, 'electricity_source' => 'Independent Power'],
            ['name' => 'Lekki Phase 1', 'area_slug' => 'lekki', 'estate_type' => 'open_estate', 'developer' => 'LSDPC', 'security_type' => 'Estate Security'],
            ['name' => 'Nicon Town Estate', 'area_slug' => 'lekki', 'estate_type' => 'gated_estate', 'developer' => 'NICON Insurance', 'security_type' => '24/7 Security Gate', 'total_units' => 300],
            ['name' => 'Osapa London', 'area_slug' => 'lekki', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Estate Security'],
            ['name' => 'Agungi Estate', 'area_slug' => 'lekki', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Neighbourhood Watch'],
            ['name' => 'Ikate Elegushi', 'area_slug' => 'lekki', 'estate_type' => 'open_estate', 'developer' => 'Elegushi Royal Family', 'security_type' => 'Estate Security'],

            // Victoria Island
            ['name' => 'Eko Atlantic City', 'area_slug' => 'victoria-island', 'estate_type' => 'mixed_use', 'developer' => 'South Energyx Nigeria', 'security_type' => '24/7 Armed Security', 'total_units' => 2000, 'electricity_source' => 'Independent Power', 'water_source' => 'Desalination Plant'],
            ['name' => '1004 Estate', 'area_slug' => 'victoria-island', 'estate_type' => 'highrise', 'developer' => 'LSDPC', 'security_type' => '24/7 Security', 'total_units' => 1004],
            ['name' => 'Oniru Estate', 'area_slug' => 'victoria-island', 'estate_type' => 'gated_estate', 'developer' => 'Oniru Family', 'security_type' => 'Estate Security', 'total_units' => 500],

            // Ajah
            ['name' => 'Lekki Gardens Estate', 'area_slug' => 'ajah', 'estate_type' => 'gated_estate', 'developer' => 'Lekki Gardens Ltd', 'security_type' => '24/7 Security Gate', 'total_units' => 800, 'service_charge_kobo' => 50000000, 'service_charge_period' => 'annually'],
            ['name' => 'Abraham Adesanya Estate', 'area_slug' => 'ajah', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Neighbourhood Watch'],
            ['name' => 'Sangotedo Estate', 'area_slug' => 'ajah', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Estate Security'],

            // Ikeja
            ['name' => 'Ikeja GRA', 'area_slug' => 'ikeja', 'estate_type' => 'open_estate', 'developer' => 'Lagos State Government', 'security_type' => 'Security Patrol'],
            ['name' => 'Magodo GRA Phase 1', 'area_slug' => 'ikeja', 'estate_type' => 'gated_estate', 'developer' => 'Lagos State Government', 'security_type' => '24/7 Security Gate', 'total_units' => 600],
            ['name' => 'Magodo GRA Phase 2', 'area_slug' => 'ikeja', 'estate_type' => 'gated_estate', 'developer' => 'Lagos State Government', 'security_type' => '24/7 Security Gate', 'total_units' => 800],

            // Yaba
            ['name' => 'Yaba Tech Estate', 'area_slug' => 'yaba', 'estate_type' => 'open_estate', 'developer' => 'LSDPC', 'security_type' => 'Neighbourhood Watch'],

            // Surulere
            ['name' => 'Adelabu Estate', 'area_slug' => 'surulere', 'estate_type' => 'open_estate', 'developer' => null, 'security_type' => 'Neighbourhood Watch'],

            // Ibeju-Lekki
            ['name' => 'Lakowe Lakes Golf Estate', 'area_slug' => 'ibeju-lekki', 'estate_type' => 'gated_estate', 'developer' => 'Lakowe Lakes', 'security_type' => '24/7 Armed Security', 'total_units' => 300, 'amenities' => ['Golf Course', 'Club House', 'Swimming Pool'], 'service_charge_kobo' => 200000000, 'service_charge_period' => 'annually'],
            ['name' => 'Pan Atlantic University Estate', 'area_slug' => 'ibeju-lekki', 'estate_type' => 'gated_estate', 'developer' => 'Pan Atlantic', 'security_type' => '24/7 Security'],
            ['name' => 'Beechwood Estate', 'area_slug' => 'ibeju-lekki', 'estate_type' => 'gated_estate', 'developer' => 'Beechwood Estates', 'security_type' => '24/7 Security Gate', 'total_units' => 400],

            // Maryland
            ['name' => 'Maryland Estate', 'area_slug' => 'maryland', 'estate_type' => 'open_estate', 'developer' => 'Lagos State Government', 'security_type' => 'Security Patrol'],

            // Gbagada
            ['name' => 'Gbagada Estate', 'area_slug' => 'gbagada', 'estate_type' => 'open_estate', 'developer' => 'LSDPC', 'security_type' => 'Neighbourhood Watch'],

            // Apapa
            ['name' => 'Apapa GRA', 'area_slug' => 'apapa', 'estate_type' => 'open_estate', 'developer' => 'Lagos State Government', 'security_type' => 'Security Patrol'],
        ];

        foreach ($estates as $data) {
            $areaSlug = $data['area_slug'];
            unset($data['area_slug']);

            $area = Area::where('slug', $areaSlug)->first();
            if (! $area) {
                continue;
            }

            $slug = str($data['name'])->slug()->toString();

            Estate::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, [
                    'area_id' => $area->id,
                    'slug'    => $slug,
                ])
            );
        }
    }
}
