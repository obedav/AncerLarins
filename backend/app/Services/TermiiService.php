<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TermiiService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $senderId;

    public function __construct()
    {
        $this->apiKey   = config('services.termii.api_key');
        $this->baseUrl  = config('services.termii.base_url');
        $this->senderId = config('services.termii.sender_id');
    }

    public function sendOtp(string $phone): array
    {
        try {
            $response = Http::post("{$this->baseUrl}/sms/otp/send", [
                'api_key'        => $this->apiKey,
                'message_type'   => 'NUMERIC',
                'to'             => $phone,
                'from'           => $this->senderId,
                'channel'        => 'generic',
                'pin_attempts'   => 3,
                'pin_time_limit' => 10,
                'pin_length'     => 6,
                'pin_placeholder' => '< 1234 >',
                'message_text'   => 'Your AncerLarins verification code is < 1234 >. Valid for 10 minutes.',
                'pin_type'       => 'NUMERIC',
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Termii sendOtp failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'error' => $e->getMessage()];
        }
    }

    public function verifyOtp(string $pinId, string $otp): array
    {
        try {
            $response = Http::post("{$this->baseUrl}/sms/otp/verify", [
                'api_key' => $this->apiKey,
                'pin_id'  => $pinId,
                'pin'     => $otp,
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Termii verifyOtp failed', ['error' => $e->getMessage()]);
            return ['verified' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendSms(string $phone, string $message): array
    {
        try {
            $response = Http::post("{$this->baseUrl}/sms/send", [
                'api_key' => $this->apiKey,
                'to'      => $phone,
                'from'    => $this->senderId,
                'sms'     => $message,
                'type'    => 'plain',
                'channel' => 'generic',
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Termii sendSms failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'error' => $e->getMessage()];
        }
    }
}
