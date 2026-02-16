<?php

namespace App\Services;

use App\Models\Property;
use App\Models\SavedSearch;
use App\Models\User;
use Illuminate\Support\Collection;

class SavedSearchService
{
    public function create(User $user, array $data): SavedSearch
    {
        // Map notification_frequency to the model's frequency column
        if (isset($data['notification_frequency'])) {
            $data['frequency'] = $data['notification_frequency'];
            unset($data['notification_frequency']);
        }

        return SavedSearch::create(array_merge($data, [
            'user_id' => $user->id,
        ]));
    }

    public function delete(SavedSearch $savedSearch): void
    {
        $savedSearch->delete();
    }

    /**
     * Find all active saved searches that match a given property.
     */
    public function findMatchingSearches(Property $property): Collection
    {
        return SavedSearch::query()
            ->needsNotification()
            ->with('user')
            ->where(function ($query) use ($property) {
                $query->whereNull('listing_type')
                    ->orWhere('listing_type', $property->listing_type);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('property_type_id')
                    ->orWhere('property_type_id', $property->property_type_id);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('city_id')
                    ->orWhere('city_id', $property->city_id);
            })
            ->where(function ($query) use ($property) {
                // area_ids is a JSON array — check if property area is in the list
                $query->whereNull('area_ids')
                    ->orWhereJsonContains('area_ids', $property->area_id);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('min_price_kobo')
                    ->orWhere('min_price_kobo', '<=', $property->price_kobo);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('max_price_kobo')
                    ->orWhere('max_price_kobo', '>=', $property->price_kobo);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('min_bedrooms')
                    ->orWhere('min_bedrooms', '<=', $property->bedrooms ?? 0);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('max_bedrooms')
                    ->orWhere('max_bedrooms', '>=', $property->bedrooms ?? 0);
            })
            ->where(function ($query) use ($property) {
                $query->whereNull('furnishing')
                    ->orWhere('furnishing', $property->furnishing);
            })
            ->get();
    }

    /**
     * Get saved searches due for digest notification.
     */
    public function getSearchesDueForDigest(string $frequency): Collection
    {
        return SavedSearch::query()
            ->needsNotification()
            ->where('frequency', $frequency)
            ->where(function ($query) {
                $query->whereNull('last_notified_at')
                    ->orWhere('last_notified_at', '<', now()->subHours(23));
            })
            ->where('match_count', '>', 0)
            ->with(['user', 'propertyType', 'city'])
            ->get();
    }
}
