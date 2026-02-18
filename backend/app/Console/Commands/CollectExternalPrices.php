<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\ExternalPriceData;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CollectExternalPrices extends Command
{
    protected $signature = 'prices:collect-external {--source=all : Source to import (csv, all)}';

    protected $description = 'Import external price data from CSV files in storage/app/imports/';

    public function handle(): int
    {
        $source = $this->option('source');

        if ($source === 'all' || $source === 'csv') {
            $this->importCsvFiles();
        }

        return self::SUCCESS;
    }

    protected function importCsvFiles(): void
    {
        $importDir = 'imports';

        if (! Storage::disk('local')->exists($importDir)) {
            $this->info("No imports directory found at storage/app/{$importDir}/");
            $this->info("Create CSV files with format: area_slug,property_type,bedrooms,price_naira,listing_type,data_date");
            return;
        }

        $files = Storage::disk('local')->files($importDir);
        $csvFiles = array_filter($files, fn ($f) => str_ends_with($f, '.csv'));

        if (empty($csvFiles)) {
            $this->info("No CSV files found in storage/app/{$importDir}/");
            return;
        }

        foreach ($csvFiles as $file) {
            $this->info("Processing: {$file}");
            $this->processCsvFile($file);
        }
    }

    protected function processCsvFile(string $filePath): void
    {
        $content = Storage::disk('local')->get($filePath);
        $lines = explode("\n", $content);
        $header = str_getcsv(array_shift($lines));

        $imported = 0;
        $skipped = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }

            $row = str_getcsv($line);
            if (count($row) < 5) {
                $skipped++;
                continue;
            }

            $data = array_combine(array_slice($header, 0, count($row)), $row);

            $areaSlug = $data['area_slug'] ?? null;
            $area = $areaSlug ? Area::where('slug', $areaSlug)->first() : null;

            if (! $area) {
                $this->warn("  Area not found: {$areaSlug}");
                $skipped++;
                continue;
            }

            $priceNaira = (float) ($data['price_naira'] ?? 0);
            $priceKobo = (int) ($priceNaira * 100);

            if ($priceKobo <= 0) {
                $skipped++;
                continue;
            }

            ExternalPriceData::create([
                'source'        => 'csv_import',
                'area_id'       => $area->id,
                'property_type' => $data['property_type'] ?? 'flat-apartment',
                'bedrooms'      => isset($data['bedrooms']) ? (int) $data['bedrooms'] : null,
                'price_kobo'    => $priceKobo,
                'listing_type'  => $data['listing_type'] ?? 'rent',
                'data_date'     => $data['data_date'] ?? now()->toDateString(),
                'data_quality'  => 'medium',
                'raw_data'      => $data,
            ]);

            $imported++;
        }

        $this->info("  Imported: {$imported}, Skipped: {$skipped}");
    }
}
