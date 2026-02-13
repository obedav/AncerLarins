<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'company_name'     => $this->company_name,
            'logo_url'         => $this->logo_url,
            'verification_status' => $this->verification_status,
            'subscription_tier' => $this->subscription_tier,
            'avg_rating'       => $this->avg_rating ? round($this->avg_rating, 1) : null,
            'total_reviews'    => $this->total_reviews,
            'years_experience' => $this->years_experience,
            'specializations'  => $this->specializations,
            'user' => $this->when(
                $this->relationLoaded('user'),
                fn () => [
                    'id'        => $this->user->id,
                    'full_name' => $this->user->full_name,
                    'avatar_url' => $this->user->avatar_url,
                ]
            ),
            'properties_count' => $this->when(
                isset($this->properties_count),
                $this->properties_count
            ),
        ];
    }
}
