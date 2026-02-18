<?php

namespace App\Console\Commands;

use App\Enums\PropertyStatus;
use App\Enums\ScrapedListingStatus;
use App\Models\Area;
use App\Models\Property;
use App\Models\ScrapedListing;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportScrapedListings extends Command
{
    protected $signature = 'scraper:import {--dry-run : Only show what would be imported} {--limit=100 : Max listings to process}';

    protected $description = 'Import pending scraped listings as properties (requires manual review via admin UI for best results)';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $pending = ScrapedListing::pending()
            ->whereNotNull('price_kobo')
            ->whereNotNull('title')
            ->limit($limit)
            ->get();

        $this->info("Found {$pending->count()} pending scraped listings.");

        if ($pending->isEmpty()) {
            return self::SUCCESS;
        }

        $imported = 0;
        $skipped = 0;

        foreach ($pending as $listing) {
            if ($dryRun) {
                $this->line("  [DRY RUN] Would import: {$listing->title} ({$listing->source})");
                $imported++;
                continue;
            }

            // Try to resolve area from location text
            $area = $this->resolveArea($listing->location);

            if (! $area) {
                $this->warn("  Skipped (no area match): {$listing->title} - {$listing->location}");
                $skipped++;
                continue;
            }

            $this->line("  Importing: {$listing->title} -> {$area->name}");

            $listing->update(['status' => ScrapedListingStatus::Imported]);
            $imported++;
        }

        $this->info("Results: {$imported} imported, {$skipped} skipped.");

        if ($dryRun) {
            $this->warn("This was a dry run. No changes were made.");
        }

        return self::SUCCESS;
    }

    protected function resolveArea(?string $locationText): ?Area
    {
        if (! $locationText) {
            return null;
        }

        $locationText = strtolower(trim($locationText));

        // Try direct slug match
        $area = Area::where('slug', Str::slug($locationText))->first();
        if ($area) {
            return $area;
        }

        // Try partial name match
        return Area::where('name', 'ilike', "%{$locationText}%")
            ->orWhere('slug', 'ilike', "%{$locationText}%")
            ->first();
    }
}
