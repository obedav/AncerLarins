<?php

namespace App\Services;

use App\Enums\ReviewStatus;
use App\Models\Area;
use App\Models\NeighborhoodReview;
use App\Models\User;

class NeighborhoodService
{
    public function getAreaInsights(Area $area): array
    {
        $reviews = $area->neighborhoodReviews()->approved();

        $avgScores = $reviews->selectRaw('
            COUNT(*) as review_count,
            ROUND(AVG(overall)::numeric, 1) as avg_overall,
            ROUND(AVG(safety)::numeric, 1) as avg_safety,
            ROUND(AVG(transport)::numeric, 1) as avg_transport,
            ROUND(AVG(amenities)::numeric, 1) as avg_amenities,
            ROUND(AVG(noise)::numeric, 1) as avg_noise
        ')->first();

        $recentReviews = $area->neighborhoodReviews()
            ->approved()
            ->with('user:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn ($r) => [
                'id'             => $r->id,
                'overall'        => $r->overall,
                'safety'         => $r->safety,
                'transport'      => $r->transport,
                'amenities'      => $r->amenities,
                'noise'          => $r->noise,
                'comment'        => $r->comment,
                'lived_duration' => $r->lived_duration,
                'user_name'      => $r->user ? $r->user->first_name . ' ' . substr($r->user->last_name, 0, 1) . '.' : 'Anonymous',
                'created_at'     => $r->created_at?->toISOString(),
            ]);

        return [
            'area' => [
                'id'   => $area->id,
                'name' => $area->name,
                'slug' => $area->slug,
            ],
            'scores' => [
                'overall'   => (float) ($avgScores->avg_overall ?? $area->safety_score ?? 0),
                'safety'    => (float) ($avgScores->avg_safety ?? $area->safety_score ?? 0),
                'transport' => (float) ($avgScores->avg_transport ?? $area->traffic_score ?? 0),
                'amenities' => (float) ($avgScores->avg_amenities ?? $area->amenity_score ?? 0),
                'noise'     => (float) ($avgScores->avg_noise ?? 0),
            ],
            'review_count'  => (int) ($avgScores->review_count ?? 0),
            'rent_averages' => [
                '1br' => $area->avg_rent_1br,
                '2br' => $area->avg_rent_2br,
                '3br' => $area->avg_rent_3br,
            ],
            'recent_reviews' => $recentReviews,
        ];
    }

    public function submitReview(User $user, Area $area, array $data): NeighborhoodReview
    {
        return NeighborhoodReview::create([
            'area_id'        => $area->id,
            'user_id'        => $user->id,
            'overall'        => $data['overall'],
            'safety'         => $data['safety'],
            'transport'      => $data['transport'],
            'amenities'      => $data['amenities'],
            'noise'          => $data['noise'],
            'comment'        => $data['comment'] ?? null,
            'lived_duration' => $data['lived_duration'] ?? null,
            'status'         => ReviewStatus::Pending,
        ]);
    }

    public function recalculateAreaScores(Area $area): void
    {
        $avg = $area->neighborhoodReviews()
            ->approved()
            ->selectRaw('
                ROUND(AVG(safety)::numeric, 1) as safety,
                ROUND(AVG(transport)::numeric, 1) as transport,
                ROUND(AVG(amenities)::numeric, 1) as amenities
            ')
            ->first();

        if ($avg && ($avg->safety || $avg->transport || $avg->amenities)) {
            $area->update([
                'safety_score'  => $avg->safety,
                'traffic_score' => $avg->transport,
                'amenity_score' => $avg->amenities,
            ]);
        }
    }

    public function recalculateAllAreaScores(): int
    {
        $count = 0;

        Area::active()->each(function (Area $area) use (&$count) {
            $this->recalculateAreaScores($area);
            $count++;
        });

        return $count;
    }
}
