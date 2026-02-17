<?php

namespace App\Console\Commands;

use App\Services\ValuationService;
use Illuminate\Console\Command;

class RefreshValuations extends Command
{
    protected $signature = 'properties:refresh-valuations';

    protected $description = 'Batch update AncerEstimate valuations for all approved properties';

    public function handle(ValuationService $valuationService): int
    {
        $this->info('Refreshing property valuations...');

        $count = $valuationService->batchRefresh();

        $this->info("Updated {$count} property valuations.");

        return self::SUCCESS;
    }
}
