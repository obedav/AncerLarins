<?php

namespace App\Services;

use App\Contracts\SmsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EightyKoboSmsService implements SmsService
{
    protected string $email;

    protected string $password;

    protected string $senderName;

    protected string $baseUrl;

    public function __construct()
    {
        $this->email = config('services.80kobo.email');
        $this->password = config('services.80kobo.password');
        $this->senderName = config('services.80kobo.sender_name', 'AncerLarins');
        $this->baseUrl = config('services.80kobo.base_url', 'https://api.80kobosms.com/v2/app');
    }

    public function sendSms(string $phone, string $message): array
    {
        try {
            // 80kobo expects international format without '+' prefix
            $phone = ltrim($phone, '+');

            $response = Http::post("{$this->baseUrl}/sms", [
                'email' => $this->email,
                'password' => $this->password,
                'message' => $message,
                'sender_name' => $this->senderName,
                'recipients' => $phone,
                'forcednd' => '1',
            ]);

            $result = $response->json() ?? [];

            Log::info('80koboSMS response', [
                'phone_suffix' => substr($phone, -4),
                'status' => $response->status(),
                'response' => $result,
            ]);

            if ($response->successful() && (!isset($result['status']) || $result['status'] == 1)) {
                $result['code'] = 'ok';
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('80koboSMS sendSms failed', ['error' => $e->getMessage()]);

            return ['status' => false, 'error' => $e->getMessage()];
        }
    }
}
