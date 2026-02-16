<?php

namespace App\Jobs;

use App\Enums\NotificationFrequency;
use App\Models\Property;
use App\Models\SavedSearch;
use App\Services\NotificationService;
use App\Services\SavedSearchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MatchSavedSearchesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        protected string $propertyId,
    ) {}

    public function handle(SavedSearchService $savedSearchService, NotificationService $notificationService): void
    {
        $property = Property::with(['propertyType', 'city', 'area'])->find($this->propertyId);

        if (!$property) {
            return;
        }

        $matchingSearches = $savedSearchService->findMatchingSearches($property);

        foreach ($matchingSearches as $search) {
            // Only send instant notifications here; daily/weekly are handled by digest commands
            if ($search->frequency !== NotificationFrequency::Instant) {
                $search->increment('match_count');
                continue;
            }

            $search->increment('match_count');
            $search->update(['last_notified_at' => now()]);

            $location = collect([$property->area?->name, $property->city?->name])
                ->filter()
                ->join(', ');

            $notificationService->send(
                $search->user,
                'New Match: ' . $property->title,
                "A new property in {$location} matches your saved search \"{$search->name}\".",
                'saved_search_match',
                [
                    'action_type' => 'property',
                    'action_id'   => $property->id,
                    'action_url'  => "/properties/{$property->slug}",
                ]
            );
        }
    }
}
