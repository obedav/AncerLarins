<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'formatted_amount' => '₦' . number_format($this->amount),
            'currency' => $this->currency,
            'reference' => $this->reference,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'property' => new PropertyResource($this->whenLoaded('property')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
