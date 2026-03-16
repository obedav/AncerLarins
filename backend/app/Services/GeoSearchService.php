<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;

class GeoSearchService
{
    public function searchNearby(float $lat, float $lng, float $radiusKm = 5, array $filters = []): Builder
    {
        return Property::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw(
                'ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) <= ?',
                [$lng, $lat, $radiusKm * 1000]
            )
            ->selectRaw(
                '*, ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) as distance',
                [$lng, $lat]
            )
            ->orderBy('distance');
    }

    public function searchByBounds(float $northLat, float $southLat, float $eastLng, float $westLng): Builder
    {
        return Property::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereBetween('latitude', [$southLat, $northLat])
            ->whereBetween('longitude', [$westLng, $eastLng]);
    }
}
