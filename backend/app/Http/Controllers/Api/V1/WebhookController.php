<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    use ApiResponse;

    public function paystack(Request $request): JsonResponse
    {
        $secret = config('ancerlarins.paystack.secret_key');

        if ($secret && $request->header('x-paystack-signature') !== hash_hmac('sha512', $request->getContent(), $secret)) {
            Log::warning('Paystack webhook: invalid signature');
            return response()->json(['status' => 'invalid signature'], 403);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        Log::info('Paystack webhook received', ['event' => $event]);

        match ($event) {
            'charge.success'       => $this->handlePaystackChargeSuccess($data),
            'subscription.create'  => $this->handlePaystackSubscriptionCreate($data),
            'subscription.disable' => $this->handlePaystackSubscriptionDisable($data),
            default                => Log::info('Unhandled Paystack event', ['event' => $event]),
        };

        return response()->json(['status' => 'ok']);
    }

    public function termii(Request $request): JsonResponse
    {
        Log::info('Termii webhook received', $request->all());

        return response()->json(['status' => 'ok']);
    }

    protected function handlePaystackChargeSuccess(array $data): void
    {
        Log::info('Paystack charge.success', ['reference' => $data['reference'] ?? null]);
    }

    protected function handlePaystackSubscriptionCreate(array $data): void
    {
        Log::info('Paystack subscription.create', ['subscription_code' => $data['subscription_code'] ?? null]);
    }

    protected function handlePaystackSubscriptionDisable(array $data): void
    {
        Log::info('Paystack subscription.disable', ['subscription_code' => $data['subscription_code'] ?? null]);
    }
}
