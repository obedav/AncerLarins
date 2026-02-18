<?php

namespace App\Services\Scrapers;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Log;

class PropertyProScraper extends ScraperService
{
    protected string $source = 'propertypro';
    protected string $baseUrl = 'https://www.propertypro.ng';

    public function scrape(int $maxPages = 10): int
    {
        $count = 0;

        foreach (['rent', 'sale'] as $listingType) {
            for ($page = 1; $page <= $maxPages; $page++) {
                $url = "{$this->baseUrl}/property-for-{$listingType}/in/lagos?page={$page}";
                $html = $this->fetch($url);

                if (! $html) {
                    Log::info("PropertyPro: no HTML for page {$page}, stopping", ['listing_type' => $listingType]);
                    break;
                }

                $listings = $this->parsePage($html, $listingType);

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

        // PropertyPro uses .single-room-sale or .single-room-text for listing cards
        $cards = $xpath->query("//div[contains(@class, 'single-room-sale')] | //div[contains(@class, 'listings-property')]");

        if (! $cards || $cards->length === 0) {
            // Try alternative selectors
            $cards = $xpath->query("//div[contains(@class, 'property-')]//a[@href]");
        }

        foreach ($cards as $card) {
            try {
                $listing = $this->parseCard($card, $xpath, $listingType);
                if ($listing && ! empty($listing['title']) && ! empty($listing['source_url'])) {
                    $listings[] = $listing;
                }
            } catch (\Exception $e) {
                Log::debug("PropertyPro: failed to parse card", ['error' => $e->getMessage()]);
            }
        }

        return $listings;
    }

    protected function parseCard(\DOMNode $card, DOMXPath $xpath, string $listingType): ?array
    {
        // Extract title
        $titleNode = $xpath->query(".//h2 | .//h3 | .//h4", $card)->item(0);
        $title = $titleNode ? trim($titleNode->textContent) : null;

        // Extract link
        $linkNode = $xpath->query(".//a[@href]", $card)->item(0);
        $href = $linkNode ? $linkNode->getAttribute('href') : null;

        if (! $title || ! $href) {
            return null;
        }

        $sourceUrl = str_starts_with($href, 'http') ? $href : $this->baseUrl . $href;

        // Extract price
        $priceNode = $xpath->query(".//*[contains(@class, 'price')] | .//*[contains(@class, 'amount')]", $card)->item(0);
        $priceText = $priceNode ? trim($priceNode->textContent) : '';
        $priceKobo = $this->parsePrice($priceText);

        // Extract location
        $locationNode = $xpath->query(".//*[contains(@class, 'location')] | .//*[contains(@class, 'address')]", $card)->item(0);
        $location = $locationNode ? trim($locationNode->textContent) : null;

        // Extract bedrooms
        $bedroomsNode = $xpath->query(".//*[contains(@class, 'bed')]", $card)->item(0);
        $bedrooms = $bedroomsNode ? $this->parseBedrooms($bedroomsNode->textContent) : null;

        // Extract image
        $imgNode = $xpath->query(".//img[@src]", $card)->item(0);
        $imageUrl = $imgNode ? $imgNode->getAttribute('src') : null;
        if ($imageUrl && ! str_starts_with($imageUrl, 'http')) {
            $imageUrl = $this->baseUrl . $imageUrl;
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
                'price_text'    => $priceText,
                'scraped_from'  => $sourceUrl,
            ],
        ];
    }
}
