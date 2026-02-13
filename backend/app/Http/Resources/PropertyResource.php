<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'formatted_price' => '₦' . number_format($this->price),
            'listing_type' => $this->listing_type,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'toilets' => $this->toilets,
            'area_sqm' => $this->area_sqm,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'lga' => $this->lga,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'year_built' => $this->year_built,
            'amenities' => [
                'is_furnished' => $this->is_furnished,
                'has_parking' => $this->has_parking,
                'has_security' => $this->has_security,
                'has_pool' => $this->has_pool,
                'has_gym' => $this->has_gym,
            ],
            'is_featured' => $this->is_featured,
            'is_verified' => $this->is_verified,
            'images' => PropertyImageResource::collection($this->whenLoaded('images')),
            'primary_image' => new PropertyImageResource($this->whenLoaded('images', fn () => $this->images->firstWhere('is_primary', true) ?? $this->images->first())),
            'owner' => new UserResource($this->whenLoaded('user')),
            'neighborhood' => new NeighborhoodResource($this->whenLoaded('neighborhood')),
            'reviews_count' => $this->whenCounted('reviews'),
            'reviews_avg_rating' => $this->whenLoaded('reviews', fn () => round($this->reviews->avg('rating'), 1)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
