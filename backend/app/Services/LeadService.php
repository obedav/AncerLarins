<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;

class LeadService
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    public function create(Property $property, User $user, string $contactType, ?string $source = null, ?string $utmCampaign = null): Lead
    {
        $lead = Lead::create([
            'property_id'  => $property->id,
            'agent_id'     => $property->agent_id,
            'user_id'      => $user->id,
            'contact_type' => $contactType,
            'source'       => $source,
            'utm_campaign' => $utmCampaign,
        ]);

        // Increment property contact counter
        $property->increment('contact_count');

        // Increment agent's total_leads counter
        if ($property->agent) {
            $property->agent->increment('total_leads');

            // Send push notification to agent
            $contactLabel = match ($contactType) {
                'whatsapp' => 'WhatsApp message',
                'call'     => 'phone call',
                default    => 'inquiry',
            };

            $this->notificationService->send(
                $property->agent->user,
                "New lead for {$property->title}!",
                "{$user->full_name} wants to reach you via {$contactLabel}.",
                'new_lead',
                ['action_type' => 'lead', 'action_id' => $lead->id, 'action_url' => '/dashboard/leads'],
            );
        }

        return $lead;
    }

    public function generateWhatsAppLink(Property $property, ?string $leadId = null): string
    {
        $agent = $property->agent;
        $phone = $agent?->whatsapp_number ?? $agent?->user?->phone ?? '';
        $phone = preg_replace('/[^0-9]/', '', $phone);

        $property->loadMissing(['area', 'city']);

        $frontendUrl = config('ancerlarins.frontend_url');
        $propertyUrl = "{$frontendUrl}/properties/{$property->slug}";
        if ($leadId) {
            $propertyUrl .= "?utm_source=whatsapp&utm_campaign={$leadId}";
        }

        $price = '₦' . number_format($property->price_kobo / 100, 0, '.', ',');

        $message = str_replace(
            [':title', ':area', ':city', ':price', ':url'],
            [
                $property->title,
                $property->area?->name ?? '',
                $property->city?->name ?? '',
                $price,
                $propertyUrl,
            ],
            config('ancerlarins.whatsapp_template'),
        );

        return "https://wa.me/{$phone}?text=" . urlencode($message);
    }

    public function markResponded(Lead $lead): void
    {
        $lead->markResponded();
    }
}
