<?php

namespace App\Services;

use App\Models\Area;
use App\Models\City;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\SearchLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SearchService
{
    public function __construct(
        protected GeoSearchService $geoSearchService,
    ) {}

    public function search(array $filters, ?string $userId = null): LengthAwarePaginator
    {
        $query = Property::query()->approved()
            ->with(['propertyType', 'city', 'area', 'images', 'agent.user']);

        if (! empty($filters['q'])) {
            $query->search($filters['q']);
        }

        if (! empty($filters['listing_type'])) {
            $query->where('listing_type', $filters['listing_type']);
        }

        if (! empty($filters['property_type_id'])) {
            $query->where('property_type_id', $filters['property_type_id']);
        }

        if (! empty($filters['state_id'])) {
            $query->where('state_id', $filters['state_id']);
        }

        if (! empty($filters['city_id'])) {
            $query->inCity($filters['city_id']);
        }

        if (! empty($filters['area_id'])) {
            $query->inArea($filters['area_id']);
        }

        if (! empty($filters['min_price']) || ! empty($filters['max_price'])) {
            $query->priceBetween(
                $filters['min_price'] ?? null,
                $filters['max_price'] ?? null
            );
        }

        if (! empty($filters['min_bedrooms']) || ! empty($filters['max_bedrooms'])) {
            $query->withBedrooms(
                $filters['min_bedrooms'] ?? null,
                $filters['max_bedrooms'] ?? null
            );
        }

        if (! empty($filters['min_bathrooms'])) {
            $query->where('bathrooms', '>=', $filters['min_bathrooms']);
        }

        if (! empty($filters['furnishing'])) {
            $query->where('furnishing', $filters['furnishing']);
        }

        if (isset($filters['is_serviced'])) {
            $query->where('is_serviced', $filters['is_serviced']);
        }

        if (isset($filters['has_bq'])) {
            $query->where('has_bq', $filters['has_bq']);
        }

        $sortBy = $filters['sort_by'] ?? 'newest';
        match ($sortBy) {
            'price_asc'  => $query->orderBy('price_kobo', 'asc'),
            'price_desc' => $query->orderBy('price_kobo', 'desc'),
            'popular'    => $query->withCount('views')->orderByDesc('views_count'),
            default      => $query->latest('published_at'),
        };

        $this->logSearch($filters, $userId);

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function suggestions(string $query): array
    {
        $results = [];

        $areas = Area::where('name', 'ilike', "%{$query}%")
            ->active()
            ->limit(3)
            ->get()
            ->map(fn ($a) => [
                'type'  => 'area',
                'id'    => $a->id,
                'label' => $a->name,
                'slug'  => $a->slug,
                'extra' => $a->city?->name,
            ]);

        $cities = City::where('name', 'ilike', "%{$query}%")
            ->active()
            ->limit(3)
            ->get()
            ->map(fn ($c) => [
                'type'  => 'city',
                'id'    => $c->id,
                'label' => $c->name,
                'slug'  => $c->slug,
                'extra' => $c->state?->name,
            ]);

        $propertyTypes = PropertyType::where('name', 'ilike', "%{$query}%")
            ->active()
            ->limit(3)
            ->get()
            ->map(fn ($pt) => [
                'type'  => 'property_type',
                'id'    => $pt->id,
                'label' => $pt->name,
                'slug'  => $pt->slug,
            ]);

        return array_merge(
            $areas->toArray(),
            $cities->toArray(),
            $propertyTypes->toArray(),
        );
    }

    public function mapSearch(float $north, float $south, float $east, float $west, array $filters = []): array
    {
        $query = $this->geoSearchService->searchByBounds($north, $south, $east, $west);

        $query->approved();

        if (! empty($filters['listing_type'])) {
            $query->where('listing_type', $filters['listing_type']);
        }

        if (! empty($filters['property_type_id'])) {
            $query->where('property_type_id', $filters['property_type_id']);
        }

        if (! empty($filters['min_price']) || ! empty($filters['max_price'])) {
            $query->priceBetween(
                $filters['min_price'] ?? null,
                $filters['max_price'] ?? null,
            );
        }

        return $query->select(['id', 'title', 'slug', 'price_kobo', 'listing_type', 'bedrooms', 'bathrooms'])
            ->selectRaw('ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude')
            ->limit(200)
            ->get()
            ->toArray();
    }

    protected function logSearch(array $filters, ?string $userId): void
    {
        SearchLog::create([
            'user_id'          => $userId,
            'query_text'       => $filters['q'] ?? null,
            'listing_type'     => $filters['listing_type'] ?? null,
            'property_type_id' => $filters['property_type_id'] ?? null,
            'city_id'          => $filters['city_id'] ?? null,
            'area_id'          => $filters['area_id'] ?? null,
            'min_price'        => $filters['min_price'] ?? null,
            'max_price'        => $filters['max_price'] ?? null,
            'min_bedrooms'     => $filters['min_bedrooms'] ?? null,
            'results_count'    => 0,
        ]);
    }
}
