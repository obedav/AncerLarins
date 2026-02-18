<?php

namespace App\Services\Scrapers;

use App\Models\Property;
use App\Models\ScrapedListing;

class DeduplicationService
{
    public function check(array $data): array
    {
        // 1. Check for exact source_url match in scraped listings
        $existingScraped = ScrapedListing::where('source_url', $data['source_url'])->exists();
        if ($existingScraped) {
            return ['is_duplicate' => true, 'score' => 1.0, 'matched_property_id' => null];
        }

        // 2. Check against approved properties by title similarity
        $bestMatch = null;
        $bestScore = 0;

        $candidates = Property::approved()
            ->when($data['price_kobo'] ?? null, function ($q, $price) {
                $q->whereBetween('price_kobo', [(int) ($price * 0.7), (int) ($price * 1.3)]);
            })
            ->when($data['bedrooms'] ?? null, fn ($q, $br) => $q->where('bedrooms', $br))
            ->limit(100)
            ->get(['id', 'title', 'price_kobo']);

        foreach ($candidates as $property) {
            similar_text(
                strtolower($data['title'] ?? ''),
                strtolower($property->title),
                $percent,
            );
            $score = $percent / 100;

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $property->id;
            }
        }

        // 3. Exact match: same price + bedrooms + very similar title
        if ($bestScore >= 0.85) {
            return [
                'is_duplicate'        => true,
                'score'               => round($bestScore, 4),
                'matched_property_id' => $bestMatch,
            ];
        }

        return [
            'is_duplicate'        => false,
            'score'               => round($bestScore, 4),
            'matched_property_id' => $bestScore >= 0.6 ? $bestMatch : null,
        ];
    }
}
