<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class FraudDetectionService
{
    /**
     * Analyze a property for fraud signals.
     *
     * @return array{score: int, flags: string[]}
     */
    public function analyze(Property $property, array $imagePublicIds = []): array
    {
        $score = 0;
        $flags = [];

        // Signal 1: Price anomaly — price is < 50% of area average for bedroom count
        $priceSignal = $this->checkPriceAnomaly($property);
        if ($priceSignal) {
            $score += 40;
            $flags[] = 'price_anomaly';
        }

        // Signal 2: Duplicate images — cloudinary_public_id already used on other approved properties
        $dupeImageSignal = $this->checkDuplicateImages($property, $imagePublicIds);
        if ($dupeImageSignal) {
            $score += 35;
            $flags[] = 'duplicate_images';
        }

        // Signal 3: Phone reputation — agent's phone has been reported multiple times
        $phoneSignal = $this->checkPhoneReputation($property);
        if ($phoneSignal) {
            $score += 25;
            $flags[] = 'phone_reputation';
        }

        return [
            'score' => min($score, 100),
            'flags' => $flags,
        ];
    }

    protected function checkPriceAnomaly(Property $property): bool
    {
        if (! $property->area_id || ! $property->price_kobo) {
            return false;
        }

        $area = $property->area;
        if (! $area) {
            return false;
        }

        $bedrooms = $property->bedrooms ?? 1;

        if ($property->listing_type->value === 'sale') {
            $areaAvg = $area->avg_buy_price_sqm;
            if (! $areaAvg || ! $property->floor_area_sqm) {
                return false;
            }
            $expectedPrice = $areaAvg * $property->floor_area_sqm;
        } else {
            $expectedPrice = match (true) {
                $bedrooms <= 1 => $area->avg_rent_1br,
                $bedrooms == 2 => $area->avg_rent_2br,
                default        => $area->avg_rent_3br,
            };
        }

        if (! $expectedPrice || $expectedPrice <= 0) {
            return false;
        }

        return $property->price_kobo < ($expectedPrice * 0.50);
    }

    protected function checkDuplicateImages(Property $property, array $imagePublicIds): bool
    {
        if (empty($imagePublicIds)) {
            return false;
        }

        $duplicateCount = PropertyImage::whereIn('cloudinary_public_id', $imagePublicIds)
            ->whereHas('property', function ($q) use ($property) {
                $q->where('id', '!=', $property->id)
                  ->where('status', 'approved');
            })
            ->count();

        return $duplicateCount > 0;
    }

    protected function checkPhoneReputation(Property $property): bool
    {
        $agent = $property->agent;
        if (! $agent) {
            return false;
        }

        $user = $agent->user;
        if (! $user || ! $user->phone) {
            return false;
        }

        // Count reports filed against this agent (polymorphic)
        $reportCount = Report::where('reportable_id', $agent->id)
            ->where('reportable_type', 'App\\Models\\AgentProfile')
            ->count();

        return $reportCount >= 2;
    }
}
