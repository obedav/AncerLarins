<?php

namespace App\Console\Commands;

use App\Services\PropertyRequestService;
use Illuminate\Console\Command;

class ExpirePropertyRequests extends Command
{
    protected $signature = 'property-requests:expire';

    protected $description = 'Expire property requests that have passed their expiration date';

    public function handle(PropertyRequestService $service): int
    {
        $count = $service->expireOldRequests();

        $this->info("Expired {$count} property request(s).");

        return self::SUCCESS;
    }
}
