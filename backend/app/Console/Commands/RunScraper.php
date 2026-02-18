<?php

namespace App\Console\Commands;

use App\Services\Scrapers\JijiScraper;
use App\Services\Scrapers\NigeriaPropertyCentreScraper;
use App\Services\Scrapers\PropertyProScraper;
use Illuminate\Console\Command;

class RunScraper extends Command
{
    protected $signature = 'scraper:run {source : propertypro|nigeriapropertycentre|jiji} {--pages=10 : Number of pages to scrape}';

    protected $description = 'Run a specific property listing scraper';

    public function handle(
        PropertyProScraper $propertyProScraper,
        NigeriaPropertyCentreScraper $nigeriaPropertyCentreScraper,
        JijiScraper $jijiScraper,
    ): int {
        $source = $this->argument('source');
        $maxPages = (int) $this->option('pages');

        $scraper = match ($source) {
            'propertypro'           => $propertyProScraper,
            'nigeriapropertycentre' => $nigeriaPropertyCentreScraper,
            'jiji'                  => $jijiScraper,
            default                 => null,
        };

        if (! $scraper) {
            $this->error("Unknown source: {$source}. Use: propertypro, nigeriapropertycentre, or jiji");
            return self::FAILURE;
        }

        $this->info("Scraping {$source} (max {$maxPages} pages)...");

        $count = $scraper->scrape($maxPages);

        $this->info("Done. Scraped {$count} new listings from {$source}.");
        return self::SUCCESS;
    }
}
