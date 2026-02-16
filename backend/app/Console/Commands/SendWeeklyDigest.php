<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use App\Services\SavedSearchService;
use Illuminate\Console\Command;

class SendWeeklyDigest extends Command
{
    protected $signature = 'notifications:send-weekly-digest';
    protected $description = 'Send weekly digest notifications for saved searches with new matches';

    public function handle(SavedSearchService $savedSearchService, NotificationService $notificationService): int
    {
        $searches = $savedSearchService->getSearchesDueForDigest('weekly');

        $sent = 0;

        foreach ($searches as $search) {
            $notificationService->send(
                $search->user,
                "Weekly Update: {$search->match_count} new matches",
                "Your saved search \"{$search->name}\" had {$search->match_count} new matching properties this week.",
                'saved_search_digest',
                ['action_url' => '/dashboard/saved-searches']
            );

            $search->update([
                'match_count'      => 0,
                'last_notified_at' => now(),
            ]);

            $sent++;
        }

        $this->info("Sent {$sent} weekly digest notifications.");

        return self::SUCCESS;
    }
}
