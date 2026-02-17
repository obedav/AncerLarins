<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Support\Facades\DB;

class MarketTrendService
{
    public function getAreaTrends(string $areaId, ?string $listingType = null): array
    {
        $query = DB::table('price_history')
            ->join('properties', 'price_history.property_id', '=', 'properties.id')
            ->where('properties.area_id', $areaId)
            ->where('price_history.recorded_at', '>=', now()->subMonths(6));

        if ($listingType) {
            $query->where('properties.listing_type', $listingType);
        }

        $monthly = $query
            ->selectRaw("
                TO_CHAR(price_history.recorded_at, 'YYYY-MM') as month,
                TO_CHAR(price_history.recorded_at, 'Mon YYYY') as month_label,
                ROUND(AVG(price_history.price_kobo)) as avg_price_kobo,
                COUNT(DISTINCT price_history.property_id) as listing_count
            ")
            ->groupByRaw("TO_CHAR(price_history.recorded_at, 'YYYY-MM'), TO_CHAR(price_history.recorded_at, 'Mon YYYY')")
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month'          => $row->month_label,
                'avg_price_kobo' => (int) $row->avg_price_kobo,
                'listing_count'  => (int) $row->listing_count,
            ]);

        return $monthly->toArray();
    }

    public function getAreaStats(string $areaId, ?string $listingType = null): array
    {
        $query = Property::approved()->where('area_id', $areaId);
        if ($listingType) {
            $query->where('listing_type', $listingType);
        }

        $areaStats = (clone $query)
            ->selectRaw('
                COUNT(*) as total_listings,
                ROUND(AVG(price_kobo)) as avg_price_kobo,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_kobo) as median_price_kobo
            ')
            ->first();

        $cityId = DB::table('areas')->where('id', $areaId)->value('city_id');

        $cityAvg = null;
        $comparison = null;

        if ($cityId) {
            $cityQuery = Property::approved()->where('city_id', $cityId);
            if ($listingType) {
                $cityQuery->where('listing_type', $listingType);
            }
            $cityAvg = $cityQuery->avg('price_kobo');

            if ($cityAvg && $areaStats->avg_price_kobo) {
                $diff = (($areaStats->avg_price_kobo - $cityAvg) / $cityAvg) * 100;
                $comparison = [
                    'percentage' => round($diff, 1),
                    'direction'  => $diff >= 0 ? 'above' : 'below',
                    'label'      => abs(round($diff, 1)) . '% ' . ($diff >= 0 ? 'above' : 'below') . ' city average',
                ];
            }
        }

        $domQuery = (clone $query)->whereNotNull('published_at');
        $avgDom = $domQuery
            ->selectRaw('ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - published_at)) / 86400)) as avg_days')
            ->value('avg_days');

        return [
            'total_listings'    => (int) ($areaStats->total_listings ?? 0),
            'avg_price_kobo'    => (int) ($areaStats->avg_price_kobo ?? 0),
            'median_price_kobo' => (int) ($areaStats->median_price_kobo ?? 0),
            'avg_days_on_market' => (int) ($avgDom ?? 0),
            'city_comparison'   => $comparison,
        ];
    }
}
