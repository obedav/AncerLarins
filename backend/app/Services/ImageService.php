<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    public function __construct(
        protected CloudinaryService $cloudinaryService,
    ) {}

    public function upload($file, string $folder = 'properties'): array
    {
        // Try Cloudinary first if configured
        if ($this->isCloudinaryConfigured()) {
            $result = $this->cloudinaryService->uploadImage($file, $folder);

            if ($result['url']) {
                return [
                    'url' => $result['url'],
                    'thumbnail_url' => $this->generateThumbnailUrl($result['url']),
                    'public_id' => $result['public_id'],
                ];
            }
        }

        // Fallback to local storage
        return $this->uploadLocal($file, $folder);
    }

    public function uploadPrivate($file, string $folder = 'verification'): array
    {
        if ($this->isCloudinaryConfigured()) {
            $result = $this->cloudinaryService->uploadPrivate($file, $folder);
            if ($result['url']) {
                return $result;
            }
        }

        // Fallback: store in private local disk (NOT publicly accessible)
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("verification/{$folder}", $filename, 'private');

        return [
            'url' => null, // Private files must be served via a signed download endpoint
            'public_id' => "private:{$path}",
        ];
    }

    public function getSignedUrl(?string $publicId): ?string
    {
        if (! $publicId) {
            return null;
        }

        if (str_starts_with($publicId, 'local:')) {
            return url('storage/'.str_replace('local:', '', $publicId));
        }

        if (str_starts_with($publicId, 'private:')) {
            $path = str_replace('private:', '', $publicId);

            return Storage::disk('private')->temporaryUrl($path, now()->addMinutes(15));
        }

        return $this->cloudinaryService->getSignedUrl($publicId);
    }

    public function uploadVideo($file, string $folder = 'properties'): array
    {
        if ($this->isCloudinaryConfigured()) {
            $result = $this->cloudinaryService->uploadVideo($file, $folder);

            if ($result['url']) {
                return [
                    'url' => $result['url'],
                    'thumbnail_url' => $this->generateVideoThumbnailUrl($result['url']),
                    'public_id' => $result['public_id'],
                    'duration' => $result['duration'],
                ];
            }
        }

        // Fallback to local storage
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("videos/{$folder}", $filename, 'public');
        $url = url("storage/{$path}");

        return [
            'url' => $url,
            'thumbnail_url' => null,
            'public_id' => "local:{$path}",
            'duration' => null,
        ];
    }

    public function generateVideoThumbnailUrl(string $url): string
    {
        // Replace the file extension with .jpg and add thumbnail transformation
        $thumbnailUrl = preg_replace('/\.[^.]+$/', '.jpg', $url);

        return str_replace('/upload/', '/upload/c_fill,w_800,h_450,so_2/', $thumbnailUrl);
    }

    public function deleteVideo(?string $publicId): bool
    {
        if (! $publicId) {
            return false;
        }

        if (str_starts_with($publicId, 'local:')) {
            $path = str_replace('local:', '', $publicId);

            return Storage::disk('public')->delete($path);
        }

        return $this->cloudinaryService->deleteVideo($publicId);
    }

    public function delete(?string $publicId): bool
    {
        if (! $publicId) {
            return false;
        }

        if (str_starts_with($publicId, 'local:')) {
            $path = str_replace('local:', '', $publicId);

            return Storage::disk('public')->delete($path);
        }

        return $this->cloudinaryService->deleteImage($publicId);
    }

    protected function uploadLocal($file, string $folder): array
    {
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');
        $url = url("storage/{$path}");

        return [
            'url' => $url,
            'thumbnail_url' => $url, // same URL for local (no on-the-fly transforms)
            'public_id' => "local:{$path}",
        ];
    }

    protected function isCloudinaryConfigured(): bool
    {
        $url = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL', '');

        // Detect placeholder credentials
        return $url
            && ! str_contains($url, 'API_KEY')
            && ! str_contains($url, 'API_SECRET')
            && ! str_contains($url, 'CLOUD_NAME');
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
