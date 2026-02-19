<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'amount_kobo'       => $this->amount_kobo,
            'payment_reference' => $this->payment_reference,
            'payment_method'    => $this->payment_method,
            'status'            => $this->status?->value,
            'contributed_at'    => $this->contributed_at?->toISOString(),
            'verified_at'       => $this->verified_at?->toISOString(),
            'member'            => $this->when(
                $this->relationLoaded('member'),
                fn () => new CooperativeMemberResource($this->member)
            ),
        ];
    }
}
