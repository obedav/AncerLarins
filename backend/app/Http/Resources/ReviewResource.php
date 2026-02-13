<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'overall_rating'        => $this->overall_rating,
            'communication_rating'  => $this->communication_rating,
            'responsiveness_rating' => $this->responsiveness_rating,
            'negotiation_rating'    => $this->negotiation_rating,
            'comment'               => $this->comment,
            'status'                => $this->status,
            'user' => $this->when(
                $this->relationLoaded('user'),
                fn () => $this->user ? [
                    'id'         => $this->user->id,
                    'full_name'  => $this->user->full_name,
                    'avatar_url' => $this->user->avatar_url,
                ] : null
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
