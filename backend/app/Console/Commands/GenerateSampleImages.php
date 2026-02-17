<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateSampleImages extends Command
{
    protected $signature = 'samples:generate-images {--count=16 : Number of properties} {--per=4 : Images per property}';
    protected $description = 'Download real sample property images for development';

    // Curated Unsplash property photos — exteriors, interiors, kitchens, bedrooms, etc.
    private array $photos = [
        // Exteriors / Buildings
        'photo-1564013799919-ab600027ffc6',
        'photo-1600596542815-ffad4c1539a9',
        'photo-1600585154340-be6161a56a0c',
        'photo-1512917774080-9991f1c4c750',
        'photo-1613490493576-7fde63acd811',
        'photo-1600607687939-ce8a6c25118c',
        'photo-1600566753190-17f0baa2a6c3',
        'photo-1600573472550-8090b5e0745e',
        'photo-1605276374104-dee2a0ed3cd6',
        'photo-1583608205776-bfd35f0d9f83',
        'photo-1580587771525-78b9dba3b914',
        'photo-1576941089067-2de3c901e126',
        // Interiors / Living rooms
        'photo-1600210492486-724fe5c67fb0',
        'photo-1616486338812-3dadae4b4ace',
        'photo-1600585154526-990dced4db0d',
        'photo-1560448204-e02f11c3d0e2',
        // Kitchens
        'photo-1600489000022-c2086d79f9d4',
        'photo-1556909114-f6e7ad7d3136',
        // Bedrooms
        'photo-1616594039964-ae9021a400a0',
        'photo-1522771739844-6a9f6d5f14af',
        // Bathrooms
        'photo-1600566752355-35792bedcfea',
        'photo-1552321554-5fefe8c9ef14',
        // Luxury / Pools
        'photo-1600607687644-aac4c3eac7f4',
        'photo-1600047509807-ba8f99d2cdde',
        // Land / Open spaces
        'photo-1500382017468-9049fed747ef',
        'photo-1628624747186-a941c476b7ef',
        // Commercial
        'photo-1497366216548-37526070297c',
        'photo-1486406146926-c627a92ad1ab',
    ];

    public function handle(): void
    {
        $count = (int) $this->option('count');
        $perProperty = (int) $this->option('per');

        Storage::disk('public')->makeDirectory('properties/samples');

        $totalPhotos = count($this->photos);
        $downloaded = 0;
        $failed = 0;

        $this->info("Downloading real property images from Unsplash...");
        $bar = $this->output->createProgressBar($count * $perProperty);
        $bar->start();

        for ($p = 1; $p <= $count; $p++) {
            for ($i = 0; $i < $perProperty; $i++) {
                $photoId = $this->photos[($p * $perProperty + $i) % $totalPhotos];

                // Full size
                $fullPath = "properties/samples/property-{$p}-{$i}.jpg";
                $thumbPath = "properties/samples/property-{$p}-{$i}-thumb.jpg";

                if (!Storage::disk('public')->exists($fullPath)) {
                    $fullUrl = "https://images.unsplash.com/{$photoId}?w=800&h=600&fit=crop&q=80";
                    if ($this->downloadImage($fullUrl, $fullPath)) {
                        $downloaded++;
                    } else {
                        // Fallback: generate a placeholder with GD
                        $this->generateFallback($fullPath, 800, 600, $p, $i);
                        $failed++;
                    }
                }

                if (!Storage::disk('public')->exists($thumbPath)) {
                    $thumbUrl = "https://images.unsplash.com/{$photoId}?w=400&h=300&fit=crop&q=70";
                    if (!$this->downloadImage($thumbUrl, $thumbPath)) {
                        $this->generateFallback($thumbPath, 400, 300, $p, $i);
                    }
                }

                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();

        if ($failed > 0) {
            $this->warn("{$failed} images failed to download (GD fallbacks used). Check your internet connection.");
        }
        $this->info("Done! {$downloaded} images downloaded to storage/app/public/properties/samples/");
    }

    private function downloadImage(string $url, string $storagePath): bool
    {
        try {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 15,
                    'user_agent' => 'AncerLarins/1.0 (Development Sample Data)',
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $data = @file_get_contents($url, false, $context);

            if ($data && strlen($data) > 1000) {
                Storage::disk('public')->put($storagePath, $data);
                return true;
            }
        } catch (\Throwable $e) {
            // Fall through to return false
        }

        return false;
    }

    private function generateFallback(string $path, int $w, int $h, int $propNum, int $imgNum): void
    {
        $img = imagecreatetruecolor($w, $h);
        $bg = imagecolorallocate($img, 27, 42, 74); // Brand primary
        $accent = imagecolorallocate($img, 240, 217, 160); // Brand accent
        $white = imagecolorallocate($img, 255, 255, 255);

        imagefilledrectangle($img, 0, 0, $w, $h, $bg);

        // Simple house icon
        $cx = (int)($w / 2);
        $cy = (int)($h / 2) - 20;
        $size = min($w, $h) / 4;

        // Roof triangle
        $points = [
            $cx, $cy - $size,
            $cx - $size, $cy,
            $cx + $size, $cy,
        ];
        imagefilledpolygon($img, $points, $accent);

        // Body rectangle
        $bodyW = (int)($size * 1.4);
        $bodyH = (int)($size * 1.0);
        imagefilledrectangle($img, $cx - $bodyW / 2, $cy, $cx + $bodyW / 2, $cy + $bodyH, $accent);

        // Door
        $doorW = (int)($size * 0.35);
        $doorH = (int)($size * 0.6);
        imagefilledrectangle($img, $cx - $doorW / 2, $cy + $bodyH - $doorH, $cx + $doorW / 2, $cy + $bodyH, $bg);

        // Label
        $label = "Property #{$propNum}";
        $labelW = imagefontwidth(4) * strlen($label);
        imagestring($img, 4, ($w - $labelW) / 2, $h - 40, $label, $white);

        $fullPath = Storage::disk('public')->path($path);
        imagejpeg($img, $fullPath, 85);
        imagedestroy($img);
    }
}
