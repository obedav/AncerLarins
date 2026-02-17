<?php

namespace App\Console\Commands;

use App\Services\NeighborhoodService;
use Illuminate\Console\Command;

class RefreshAreaScores extends Command
{
    protected $signature = 'areas:refresh-scores';

    protected $description = 'Recalculate all area scores from approved neighborhood reviews';

    public function handle(NeighborhoodService $neighborhoodService): int
    {
        $this->info('Refreshing area scores...');

        $count = $neighborhoodService->recalculateAllAreaScores();

        $this->info("Recalculated scores for {$count} areas.");

        return self::SUCCESS;
    }
}
