<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'avatar_url' => $this->avatar_url,
            'is_verified' => $this->is_verified,
            'bio' => $this->when($this->bio, $this->bio),
            'company_name' => $this->when($this->company_name, $this->company_name),
            'lga' => $this->lga,
            'state' => $this->state,
            'properties_count' => $this->whenCounted('properties'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
