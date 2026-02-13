<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected string $secretKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->baseUrl   = config('services.paystack.payment_url');
    }

    public function initializeTransaction(string $email, int $amountInKobo, string $reference, array $metadata = []): array
    {
        try {
            $response = Http::withToken($this->secretKey)->post("{$this->baseUrl}/transaction/initialize", [
                'email'     => $email,
                'amount'    => $amountInKobo,
                'reference' => $reference,
                'metadata'  => $metadata ?: null,
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Paystack initializeTransaction failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function verifyTransaction(string $reference): array
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->get("{$this->baseUrl}/transaction/verify/{$reference}");

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Paystack verifyTransaction failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function listBanks(): array
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->get("{$this->baseUrl}/bank", ['country' => 'nigeria']);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Paystack listBanks failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'data' => []];
        }
    }

    public function resolveAccount(string $accountNumber, string $bankCode): array
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->get("{$this->baseUrl}/bank/resolve", [
                    'account_number' => $accountNumber,
                    'bank_code'      => $bankCode,
                ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Paystack resolveAccount failed', ['error' => $e->getMessage()]);
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
