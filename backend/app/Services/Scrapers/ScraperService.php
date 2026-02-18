<?php

namespace App\Services\Scrapers;

use App\Enums\ScrapedListingStatus;
use App\Models\ScrapedListing;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class ScraperService
{
    protected string $source;
    protected string $baseUrl;
    protected int $requestDelayMs = 2000;

    public function __construct(
        protected DeduplicationService $deduplicationService,
    ) {}

    abstract public function scrape(int $maxPages = 10): int;

    protected function fetch(string $url): ?string
    {
        if (! $this->respectRobots($url)) {
            Log::info("Scraper: URL blocked by robots.txt", ['url' => $url, 'source' => $this->source]);
            return null;
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'AncerLarinsBot/1.0 (+https://ancerlarins.com/bot)',
                'Accept'     => 'text/html,application/xhtml+xml',
            ])->timeout(30)->get($url);

            if ($response->successful()) {
                return $response->body();
            }

            Log::warning("Scraper: HTTP {$response->status()}", ['url' => $url, 'source' => $this->source]);
            return null;
        } catch (\Exception $e) {
            Log::error("Scraper: fetch failed", ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    protected function store(array $data): bool
    {
        // Check if already scraped
        if (ScrapedListing::where('source_url', $data['source_url'])->exists()) {
            return false;
        }

        $dedupResult = $this->deduplicationService->check($data);

        ScrapedListing::create([
            'source'              => $this->source,
            'source_url'          => $data['source_url'],
            'source_id'           => $data['source_id'] ?? null,
            'raw_data'            => $data['raw_data'] ?? [],
            'title'               => $data['title'],
            'price_kobo'          => $data['price_kobo'] ?? null,
            'location'            => $data['location'] ?? null,
            'bedrooms'            => $data['bedrooms'] ?? null,
            'property_type'       => $data['property_type'] ?? null,
            'listing_type'        => $data['listing_type'] ?? null,
            'image_url'           => $data['image_url'] ?? null,
            'status'              => $dedupResult['is_duplicate']
                ? ScrapedListingStatus::Duplicate
                : ScrapedListingStatus::Pending,
            'matched_property_id' => $dedupResult['matched_property_id'],
            'dedup_score'         => $dedupResult['score'],
        ]);

        return true;
    }

    protected function delay(): void
    {
        usleep($this->requestDelayMs * 1000);
    }

    protected function respectRobots(string $url): bool
    {
        $parsed = parse_url($url);
        $domain = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
        $path = $parsed['path'] ?? '/';

        $cacheKey = "robots_txt:{$parsed['host']}";

        $robotsContent = Cache::remember($cacheKey, 86400, function () use ($domain) {
            try {
                $response = Http::timeout(10)->get("{$domain}/robots.txt");
                return $response->successful() ? $response->body() : '';
            } catch (\Exception) {
                return '';
            }
        });

        if (empty($robotsContent)) {
            return true; // No robots.txt = allow all
        }

        // Simple robots.txt parser for our user-agent
        $lines = explode("\n", $robotsContent);
        $relevantSection = false;
        $disallowed = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (stripos($line, 'User-agent:') === 0) {
                $agent = trim(substr($line, 11));
                $relevantSection = ($agent === '*' || stripos($agent, 'AncerLarinsBot') !== false);
            } elseif ($relevantSection && stripos($line, 'Disallow:') === 0) {
                $disallowed[] = trim(substr($line, 9));
            }
        }

        foreach ($disallowed as $rule) {
            if ($rule && str_starts_with($path, $rule)) {
                return false;
            }
        }

        return true;
    }

    protected function parsePrice(string $priceText): ?int
    {
        // Remove currency symbols, commas, spaces
        $cleaned = preg_replace('/[^\d.]/', '', $priceText);
        if (! $cleaned || ! is_numeric($cleaned)) {
            return null;
        }

        // Convert to kobo (multiply by 100)
        return (int) ((float) $cleaned * 100);
    }

    protected function parseBedrooms(string $text): ?int
    {
        if (preg_match('/(\d+)\s*bed/i', $text, $m)) {
            return (int) $m[1];
        }
        return null;
    }
}
