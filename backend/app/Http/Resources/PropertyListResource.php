<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'slug'          => $this->slug,
            'listing_type'  => $this->listing_type,
            'price_kobo'    => $this->price_kobo,
            'formatted_price' => $this->formatted_price,
            'price_negotiable' => $this->price_negotiable,
            'rent_period'   => $this->when($this->listing_type?->value === 'rent', $this->rent_period),
            'bedrooms'      => $this->bedrooms,
            'bathrooms'     => $this->bathrooms,
            'toilets'       => $this->toilets,
            'floor_area_sqm' => $this->floor_area_sqm,
            'address'       => $this->address,
            'featured'      => $this->featured,
            'is_new'        => $this->is_new,
            'status'        => $this->status,
            'property_type' => $this->when(
                $this->relationLoaded('propertyType'),
                fn () => [
                    'id'   => $this->propertyType->id,
                    'name' => $this->propertyType->name,
                    'slug' => $this->propertyType->slug,
                ]
            ),
            'city' => $this->when(
                $this->relationLoaded('city'),
                fn () => [
                    'id'   => $this->city->id,
                    'name' => $this->city->name,
                    'slug' => $this->city->slug,
                ]
            ),
            'area' => $this->when(
                $this->relationLoaded('area') && $this->area,
                fn () => [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                ]
            ),
            'cover_image' => $this->when(
                $this->relationLoaded('images'),
                fn () => $this->coverImage ? [
                    'url'           => $this->coverImage->url,
                    'thumbnail_url' => $this->coverImage->thumbnail_url,
                ] : null
            ),
            'agent' => $this->when(
                $this->relationLoaded('agent'),
                fn () => $this->agent ? [
                    'id'           => $this->agent->id,
                    'company_name' => $this->agent->company_name,
                    'user_name'    => $this->agent->user?->full_name,
                    'is_verified'  => $this->agent->isVerified(),
                ] : null
            ),
            'images_count' => $this->when(
                $this->relationLoaded('images'),
                fn () => $this->images->count()
            ),
            'views_count'  => $this->when(isset($this->views_count), $this->views_count),
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}
