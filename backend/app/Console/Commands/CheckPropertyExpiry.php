<?php

namespace App\Console\Commands;

use App\Enums\PropertyStatus;
use App\Models\Property;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class CheckPropertyExpiry extends Command
{
    protected $signature = 'properties:check-expiry';
    protected $description = 'Expire properties past their expiry date and notify agents of upcoming expirations';

    public function handle(NotificationService $notificationService): int
    {
        // Expire properties that have passed their expiry date
        $expired = Property::approved()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expired as $property) {
            $property->update(['status' => PropertyStatus::Expired]);

            $agentUser = $property->agent?->user;
            if ($agentUser) {
                $notificationService->send(
                    $agentUser,
                    'Listing Expired',
                    "Your listing \"{$property->title}\" has expired. Renew it to keep it visible.",
                    'property_expired',
                    ['action_type' => 'property', 'action_id' => $property->id]
                );
            }
        }

        // Warn agents about properties expiring in 7 days
        $expiringSoon = Property::approved()
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->get();

        foreach ($expiringSoon as $property) {
            $agentUser = $property->agent?->user;
            if ($agentUser) {
                $daysLeft = (int) now()->diffInDays($property->expires_at);
                $notificationService->send(
                    $agentUser,
                    'Listing Expiring Soon',
                    "Your listing \"{$property->title}\" expires in {$daysLeft} days.",
                    'property_expiring',
                    ['action_type' => 'property', 'action_id' => $property->id]
                );
            }
        }

        $this->info("Expired {$expired->count()} properties. Warned about {$expiringSoon->count()} expiring soon.");

        return self::SUCCESS;
    }
}
