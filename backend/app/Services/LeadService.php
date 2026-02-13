<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;

class LeadService
{
    public function create(Property $property, User $user, string $contactType, ?string $source = null): Lead
    {
        return Lead::create([
            'property_id'      => $property->id,
            'agent_profile_id' => $property->agent_id,
            'user_id'          => $user->id,
            'contact_type'     => $contactType,
            'source'           => $source,
        ]);
    }

    public function generateWhatsAppLink(Property $property): string
    {
        $agent = $property->agent;
        $phone = $agent?->whatsapp_number ?? $agent?->user?->phone ?? '';
        $phone = preg_replace('/[^0-9]/', '', $phone);

        $message = urlencode("Hi, I'm interested in your property: {$property->title} on AncerLarins.");

        return "https://wa.me/{$phone}?text={$message}";
    }

    public function markResponded(Lead $lead): void
    {
        $lead->markResponded();
    }
}
