<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'company_name'        => $this->company_name,
            'license_number'      => $this->license_number,
            'bio'                 => $this->bio,
            'logo_url'            => $this->logo_url,
            'office_address'      => $this->office_address,
            'website'             => $this->website,
            'whatsapp_number'     => $this->whatsapp_number,
            'verification_status' => $this->verification_status,
            'subscription_tier'   => $this->subscription_tier,
            'specializations'     => $this->specializations,
            'years_experience'    => $this->years_experience,
            'avg_rating'          => $this->avg_rating ? round($this->avg_rating, 1) : null,
            'total_reviews'       => $this->total_reviews,
            'user' => $this->when(
                $this->relationLoaded('user'),
                fn () => [
                    'id'         => $this->user->id,
                    'full_name'  => $this->user->full_name,
                    'avatar_url' => $this->user->avatar_url,
                    'phone'      => $this->user->phone,
                ]
            ),
            'office_area' => $this->when(
                $this->relationLoaded('officeArea') && $this->officeArea,
                fn () => [
                    'id'   => $this->officeArea->id,
                    'name' => $this->officeArea->name,
                ]
            ),
            'recent_properties' => $this->when(
                $this->relationLoaded('properties'),
                fn () => PropertyListResource::collection($this->properties)
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
