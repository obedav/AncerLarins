<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GeoSearchService
{
    private const EARTH_RADIUS_KM = 6371;

    public function searchNearby(float $lat, float $lng, float $radiusKm = 5, array $filters = []): Builder
    {
        $haversine = sprintf(
            '(%d * ACOS(LEAST(1.0, COS(RADIANS(%f)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(%f)) + SIN(RADIANS(%f)) * SIN(RADIANS(latitude)))))',
            self::EARTH_RADIUS_KM, $lat, $lng, $lat
        );

        return Property::select('*')
            ->selectRaw("{$haversine} AS distance")
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw("{$haversine} <= ?", [$radiusKm])
            ->orderBy('distance');
    }

    public function searchByBounds(float $northLat, float $southLat, float $eastLng, float $westLng, array $filters = []): Builder
    {
        return Property::whereBetween('latitude', [$southLat, $northLat])
            ->whereBetween('longitude', [$westLng, $eastLng]);
    }
}
