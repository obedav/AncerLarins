<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMService
{
    protected string $serverKey;

    public function __construct()
    {
        $this->serverKey = config('services.fcm.server_key');
    }

    public function sendToDevice(string $token, string $title, string $body, array $data = []): array
    {
        return $this->send(['to' => $token], $title, $body, $data);
    }

    public function sendToMultiple(array $tokens, string $title, string $body, array $data = []): array
    {
        return $this->send(['registration_ids' => $tokens], $title, $body, $data);
    }

    protected function send(array $target, string $title, string $body, array $data): array
    {
        try {
            $payload = array_merge($target, [
                'notification' => ['title' => $title, 'body' => $body, 'sound' => 'default'],
                'data'         => $data ?: null,
            ]);

            $response = Http::withHeaders([
                'Authorization' => "key={$this->serverKey}",
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('FCM send failed', ['error' => $e->getMessage()]);
            return ['success' => 0, 'failure' => 1];
        }
    }
}
