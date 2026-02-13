<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;

class GeoSearchService
{
    public function searchNearby(float $lat, float $lng, float $radiusKm = 5, array $filters = []): Builder
    {
        return Property::query()
            ->whereNotNull('location')
            ->whereRaw(
                'ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
                [$lng, $lat, $radiusKm * 1000]
            )
            ->selectRaw(
                '*, ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance',
                [$lng, $lat]
            )
            ->orderBy('distance');
    }

    public function searchByBounds(float $northLat, float $southLat, float $eastLng, float $westLng): Builder
    {
        return Property::query()
            ->whereNotNull('location')
            ->whereRaw(
                'ST_Within(location::geometry, ST_MakeEnvelope(?, ?, ?, ?, 4326))',
                [$westLng, $southLat, $eastLng, $northLat]
            );
    }
}
