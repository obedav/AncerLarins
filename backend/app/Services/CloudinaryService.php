<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    public function uploadImage($file, string $folder = 'properties'): array
    {
        try {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder'        => "ancerlarins/{$folder}",
                'resource_type' => 'image',
                'transformation' => ['quality' => 'auto', 'fetch_format' => 'auto'],
            ]);

            return [
                'url'       => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed', ['error' => $e->getMessage()]);
            return ['url' => null, 'public_id' => null];
        }
    }

    public function deleteImage(string $publicId): bool
    {
        try {
            Cloudinary::destroy($publicId);
            return true;
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function uploadMultiple(array $files, string $folder = 'properties'): array
    {
        return array_map(fn ($file) => $this->uploadImage($file, $folder), $files);
    }
}
