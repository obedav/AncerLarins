<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'tier'              => $this->tier,
            'amount_kobo'       => $this->amount_kobo,
            'payment_reference' => $this->payment_reference,
            'payment_provider'  => $this->payment_provider,
            'starts_at'         => $this->starts_at?->toISOString(),
            'ends_at'           => $this->ends_at?->toISOString(),
            'status'            => $this->status,
            'is_active'         => $this->isActive(),
            'days_remaining'    => $this->ends_at?->isFuture() ? now()->diffInDays($this->ends_at) : 0,
        ];
    }
}
