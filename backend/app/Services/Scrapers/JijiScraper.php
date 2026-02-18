<?php

namespace App\Services\Scrapers;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Log;

class JijiScraper extends ScraperService
{
    protected string $source = 'jiji';
    protected string $baseUrl = 'https://jiji.ng';

    public function scrape(int $maxPages = 10): int
    {
        $count = 0;

        $categories = [
            ['path' => 'real-estate/houses-apartments-for-rent/lagos', 'type' => 'rent'],
            ['path' => 'real-estate/houses-apartments-for-sale/lagos', 'type' => 'sale'],
        ];

        foreach ($categories as $category) {
            for ($page = 1; $page <= $maxPages; $page++) {
                $url = "{$this->baseUrl}/{$category['path']}?page={$page}";
                $html = $this->fetch($url);

                if (! $html) {
                    break;
                }

                $listings = $this->parsePage($html, $category['type']);

                if (empty($listings)) {
                    break;
                }

                foreach ($listings as $listing) {
                    if ($this->store($listing)) {
                        $count++;
                    }
                }

                $this->delay();
            }
        }

        return $count;
    }

    protected function parsePage(string $html, string $listingType): array
    {
        libxml_use_internal_errors(true);
        $doc = new DOMDocument();
        $doc->loadHTML($html, LIBXML_NOERROR);
        $xpath = new DOMXPath($doc);
        libxml_clear_errors();

        $listings = [];

        // Jiji uses various card class patterns
        $cards = $xpath->query("//div[contains(@class, 'b-list-advert__item')] | //article | //li[contains(@class, 'masonry-item')]");

        foreach ($cards as $card) {
            try {
                $listing = $this->parseCard($card, $xpath, $listingType);
                if ($listing && ! empty($listing['title']) && ! empty($listing['source_url'])) {
                    $listings[] = $listing;
                }
            } catch (\Exception $e) {
                Log::debug("Jiji: failed to parse card", ['error' => $e->getMessage()]);
            }
        }

        return $listings;
    }

    protected function parseCard(\DOMNode $card, DOMXPath $xpath, string $listingType): ?array
    {
        $titleNode = $xpath->query(".//a[contains(@class, 'title')] | .//h2 | .//h3", $card)->item(0);
        $title = $titleNode ? trim($titleNode->textContent) : null;

        $linkNode = $xpath->query(".//a[@href]", $card)->item(0);
        $href = $linkNode ? $linkNode->getAttribute('href') : null;

        if (! $title || ! $href) {
            return null;
        }

        $sourceUrl = str_starts_with($href, 'http') ? $href : $this->baseUrl . $href;

        $priceNode = $xpath->query(".//*[contains(@class, 'price')]", $card)->item(0);
        $priceText = $priceNode ? trim($priceNode->textContent) : '';
        $priceKobo = $this->parsePrice($priceText);

        $locationNode = $xpath->query(".//*[contains(@class, 'location')] | .//*[contains(@class, 'region')]", $card)->item(0);
        $location = $locationNode ? trim($locationNode->textContent) : null;

        $bedrooms = $this->parseBedrooms($card->textContent ?? '');

        $imgNode = $xpath->query(".//img[@src or @data-src]", $card)->item(0);
        $imageUrl = null;
        if ($imgNode) {
            $imageUrl = $imgNode->getAttribute('data-src') ?: $imgNode->getAttribute('src');
        }

        return [
            'source_url'    => $sourceUrl,
            'source_id'     => md5($sourceUrl),
            'title'         => $title,
            'price_kobo'    => $priceKobo,
            'location'      => $location,
            'bedrooms'      => $bedrooms,
            'listing_type'  => $listingType,
            'property_type' => null,
            'image_url'     => $imageUrl,
            'raw_data'      => [
                'price_text'   => $priceText,
                'scraped_from' => $sourceUrl,
            ],
        ];
    }
}
