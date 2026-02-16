<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use App\Services\SavedSearchService;
use Illuminate\Console\Command;

class SendDailyDigest extends Command
{
    protected $signature = 'notifications:send-daily-digest';
    protected $description = 'Send daily digest notifications for saved searches with new matches';

    public function handle(SavedSearchService $savedSearchService, NotificationService $notificationService): int
    {
        $searches = $savedSearchService->getSearchesDueForDigest('daily');

        $sent = 0;

        foreach ($searches as $search) {
            $notificationService->send(
                $search->user,
                "Daily Update: {$search->match_count} new matches",
                "Your saved search \"{$search->name}\" has {$search->match_count} new matching properties. Check them out!",
                'saved_search_digest',
                ['action_url' => '/dashboard/saved-searches']
            );

            $search->update([
                'match_count'      => 0,
                'last_notified_at' => now(),
            ]);

            $sent++;
        }

        $this->info("Sent {$sent} daily digest notifications.");

        return self::SUCCESS;
    }
}
