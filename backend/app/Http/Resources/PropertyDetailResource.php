<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'listing_type'     => $this->listing_type,
            'description'      => $this->description,
            'price_kobo'       => $this->price_kobo,
            'formatted_price'  => $this->formatted_price,
            'price_negotiable' => $this->price_negotiable,
            'rent_period'      => $this->rent_period,
            'agency_fee_pct'   => $this->agency_fee_pct,
            'caution_fee_kobo' => $this->caution_fee_kobo,
            'service_charge_kobo' => $this->service_charge_kobo,
            'legal_fee_kobo'   => $this->legal_fee_kobo,
            'min_stay_days'    => $this->min_stay_days,
            'max_stay_days'    => $this->max_stay_days,
            'check_in_time'    => $this->check_in_time,
            'check_out_time'   => $this->check_out_time,
            'address'          => $this->address,
            'landmark_note'    => $this->landmark_note,
            'location_fuzzy'   => $this->location_fuzzy,
            'bedrooms'         => $this->bedrooms,
            'bathrooms'        => $this->bathrooms,
            'toilets'          => $this->toilets,
            'sitting_rooms'    => $this->sitting_rooms,
            'floor_area_sqm'   => $this->floor_area_sqm,
            'land_area_sqm'    => $this->land_area_sqm,
            'floor_number'     => $this->floor_number,
            'total_floors'     => $this->total_floors,
            'year_built'       => $this->year_built,
            'furnishing'       => $this->furnishing,
            'parking_spaces'   => $this->parking_spaces,
            'has_bq'           => $this->has_bq,
            'has_swimming_pool' => $this->has_swimming_pool,
            'has_gym'          => $this->has_gym,
            'has_cctv'         => $this->has_cctv,
            'has_generator'    => $this->has_generator,
            'has_water_supply' => $this->has_water_supply,
            'has_prepaid_meter' => $this->has_prepaid_meter,
            'is_serviced'      => $this->is_serviced,
            'is_new_build'     => $this->is_new_build,
            'available_from'   => $this->available_from?->toDateString(),
            'inspection_available' => $this->inspection_available,
            'featured'         => $this->featured,
            'is_new'           => $this->is_new,
            'status'           => $this->status,
            'property_type'    => $this->when(
                $this->relationLoaded('propertyType'),
                fn () => [
                    'id'   => $this->propertyType->id,
                    'name' => $this->propertyType->name,
                    'slug' => $this->propertyType->slug,
                ]
            ),
            'state' => $this->when(
                $this->relationLoaded('state'),
                fn () => [
                    'id'   => $this->state->id,
                    'name' => $this->state->name,
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
                    'slug' => $this->area->slug,
                ]
            ),
            'images' => $this->when(
                $this->relationLoaded('images'),
                fn () => $this->images->map(fn ($img) => [
                    'id'            => $img->id,
                    'url'           => $img->url,
                    'thumbnail_url' => $img->thumbnail_url,
                    'caption'       => $img->caption,
                    'is_cover'      => $img->is_cover,
                    'sort_order'    => $img->sort_order,
                ])
            ),
            'amenities' => $this->when(
                $this->relationLoaded('amenities'),
                fn () => $this->amenities->map(fn ($a) => [
                    'id'       => $a->id,
                    'name'     => $a->name,
                    'icon'     => $a->icon,
                    'category' => $a->category,
                ])
            ),
            'agent' => $this->when(
                $this->relationLoaded('agent'),
                fn () => $this->agent ? new AgentDetailResource($this->agent->load('user')) : null
            ),
            'virtual_tour' => $this->when(
                $this->relationLoaded('virtualTour') && $this->virtualTour,
                fn () => [
                    'type' => $this->virtualTour->tour_type,
                    'url'  => $this->virtualTour->tour_url,
                ]
            ),
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'views_count'      => $this->when(isset($this->views_count), $this->views_count),
            'saves_count'      => $this->when(isset($this->saved_by_count), $this->saved_by_count),
            'similar_count'    => $this->when(isset($this->similar_count), $this->similar_count),
            'ancer_estimate'   => $this->when(isset($this->ancer_estimate) && $this->ancer_estimate, function () {
                $est = $this->ancer_estimate;
                return [
                    'estimate_kobo'      => $est['estimate_kobo'],
                    'formatted_estimate' => '₦' . number_format($est['estimate_kobo'] / 100, 0, '.', ','),
                    'confidence'         => $est['confidence'],
                    'price_range'        => [
                        'low_kobo'  => $est['price_range']['low'],
                        'high_kobo' => $est['price_range']['high'],
                    ],
                    'comparable_count'   => $est['comparable_count'],
                ];
            }),
            'published_at'     => $this->published_at?->toISOString(),
            'expires_at'       => $this->expires_at?->toISOString(),
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
        ];
    }
}
