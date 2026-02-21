<?php

namespace App\Services;

class ImageService
{
    public function __construct(
        protected CloudinaryService $cloudinaryService,
    ) {}

    public function upload($file, string $folder = 'properties'): array
    {
        $result = $this->cloudinaryService->uploadImage($file, $folder);

        $url = $result['url'];

        // Apply watermark to property images
        if ($url && $folder === 'properties') {
            $url = $this->applyWatermark($url);
        }

        return [
            'url'           => $url,
            'thumbnail_url' => $result['url'] ? $this->generateThumbnailUrl($result['url']) : null,
            'public_id'     => $result['public_id'],
        ];
    }

    public function uploadPrivate($file, string $folder = 'verification'): array
    {
        return $this->cloudinaryService->uploadPrivate($file, $folder);
    }

    public function getSignedUrl(?string $publicId): ?string
    {
        if (! $publicId) {
            return null;
        }

        return $this->cloudinaryService->getSignedUrl($publicId);
    }

    public function delete(?string $publicId): bool
    {
        if (! $publicId) {
            return false;
        }

        return $this->cloudinaryService->deleteImage($publicId);
    }

    protected function generateThumbnailUrl(string $url): string
    {
        return str_replace('/upload/', '/upload/c_fill,w_400,h_300,q_auto/', $url);
    }

    protected function applyWatermark(string $url): string
    {
        return str_replace(
            '/upload/',
            '/upload/l_text:Arial_24_bold:AncerLarins,co_rgb:FFFFFF,o_40,g_south_east,x_10,y_10/',
            $url
        );
    }
}
