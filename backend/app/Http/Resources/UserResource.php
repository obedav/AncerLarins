<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isSelf = $request->user()?->id === $this->id;

        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'full_name'  => $this->full_name,
            'phone'      => $isSelf ? $this->phone : $this->maskedPhone(),
            'email'      => $isSelf ? $this->email : null,
            'avatar_url' => $this->avatar_url,
            'role'       => $this->role->value,
            'status'     => $this->when($isSelf, $this->status),
            'phone_verified' => $this->when($isSelf, $this->phone_verified),
            'preferred_city_id' => $this->when($isSelf, $this->preferred_city_id),
            'agent_profile' => $this->when(
                $this->relationLoaded('agentProfile') && $this->agentProfile,
                fn () => new AgentDetailResource($this->agentProfile)
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    protected function maskedPhone(): ?string
    {
        if (! $this->phone) {
            return null;
        }

        return substr($this->phone, 0, 7) . '****' . substr($this->phone, -2);
    }
}
