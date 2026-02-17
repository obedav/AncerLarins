<?php

namespace App\Services;

use App\Enums\Furnishing;
use App\Enums\ListingType;
use App\Models\Area;
use App\Models\Property;

class ValuationService
{
    public function estimate(Property $property): ?array
    {
        $area = $property->area;

        if (! $area) {
            return null;
        }

        $areaBased = $this->areaBasedEstimate($property, $area);
        $comparables = $this->findComparables($property);
        $compMedian = $this->computeMedian($comparables);
        $compCount = $comparables->count();

        if ($areaBased === null && $compMedian === null) {
            return null;
        }

        if ($areaBased !== null && $compMedian !== null) {
            $estimate = (int) (($areaBased * 0.4) + ($compMedian * 0.6));
        } elseif ($compMedian !== null) {
            $estimate = (int) $compMedian;
        } else {
            $estimate = (int) $areaBased;
        }

        $confidence = $this->calculateConfidence($compCount, $areaBased !== null);
        $margin = (1 - $confidence) * 0.30;

        return [
            'estimate_kobo'    => $estimate,
            'confidence'       => round($confidence, 2),
            'comparable_count' => $compCount,
            'price_range'      => [
                'low'  => (int) ($estimate * (1 - $margin)),
                'high' => (int) ($estimate * (1 + $margin)),
            ],
        ];
    }

    protected function areaBasedEstimate(Property $property, Area $area): ?int
    {
        if ($property->listing_type === ListingType::Sale) {
            if (! $area->avg_buy_price_sqm || ! $property->floor_area_sqm) {
                return null;
            }
            $base = $area->avg_buy_price_sqm * $property->floor_area_sqm;
        } else {
            $bedrooms = $property->bedrooms ?? 1;
            $base = match (true) {
                $bedrooms <= 1 => $area->avg_rent_1br,
                $bedrooms == 2 => $area->avg_rent_2br,
                default        => $area->avg_rent_3br,
            };
            if (! $base) {
                return null;
            }
        }

        $base = $this->applyAdjustments($base, $property);

        return (int) $base;
    }

    protected function applyAdjustments(float $base, Property $property): float
    {
        if ($property->is_serviced) {
            $base *= 1.10;
        }
        if ($property->has_generator) {
            $base *= 1.05;
        }
        if ($property->has_water_supply) {
            $base *= 1.05;
        }
        if ($property->furnishing === Furnishing::Furnished) {
            $base *= 1.15;
        } elseif ($property->furnishing === Furnishing::SemiFurnished) {
            $base *= 1.08;
        }
        if ($property->year_built && $property->year_built < 2010) {
            $base *= 0.95;
        }

        return $base;
    }

    protected function findComparables(Property $property)
    {
        $bedrooms = $property->bedrooms ?? 0;

        return Property::approved()
            ->where('id', '!=', $property->id)
            ->where('listing_type', $property->listing_type)
            ->where(function ($q) use ($property) {
                $q->where('area_id', $property->area_id);
                if ($property->city_id) {
                    $q->orWhere('city_id', $property->city_id);
                }
            })
            ->whereBetween('bedrooms', [max(0, $bedrooms - 1), $bedrooms + 1])
            ->orderByRaw('ABS(price_kobo - ?) ASC', [$property->price_kobo])
            ->limit(10)
            ->pluck('price_kobo');
    }

    protected function computeMedian($prices): ?int
    {
        if ($prices->isEmpty()) {
            return null;
        }

        $sorted = $prices->sort()->values();
        $count = $sorted->count();
        $mid = (int) floor($count / 2);

        if ($count % 2 === 0) {
            return (int) (($sorted[$mid - 1] + $sorted[$mid]) / 2);
        }

        return (int) $sorted[$mid];
    }

    protected function calculateConfidence(int $compCount, bool $hasAreaData): float
    {
        if ($compCount === 0) {
            return $hasAreaData ? 0.3 : 0.1;
        }
        if ($compCount <= 3) {
            return 0.6;
        }
        if ($compCount <= 9) {
            return 0.8;
        }

        return 0.9;
    }

    public function batchRefresh(): int
    {
        $count = 0;

        Property::approved()
            ->whereNotNull('area_id')
            ->with('area')
            ->chunkById(100, function ($properties) use (&$count) {
                foreach ($properties as $property) {
                    $result = $this->estimate($property);
                    if ($result) {
                        $property->update([
                            'estimated_value_kobo' => $result['estimate_kobo'],
                            'last_valued_at'       => now(),
                        ]);
                        $count++;
                    }
                }
            });

        return $count;
    }
}
