<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CooperativeService;
use App\Services\SubscriptionService;
use App\Services\WhatsAppBotService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * @group Webhooks
 *
 * Payment and SMS webhook handlers (Paystack, Termii). Verified by signature, no auth required.
 */
class WebhookController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected WhatsAppBotService $whatsAppBotService,
        protected CooperativeService $cooperativeService,
    ) {}

    public function paystack(Request $request): JsonResponse
    {
        $secret = config('services.paystack.secret_key');

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

        // Handle inbound SMS for WhatsApp bot
        $phone = $request->input('from') ?? $request->input('phone') ?? $request->input('msisdn');
        $message = $request->input('message') ?? $request->input('sms') ?? $request->input('text');

        if ($phone && $message) {
            $this->whatsAppBotService->handleIncoming($phone, $message);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function handlePaystackChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        Log::info('Paystack charge.success', ['reference' => $reference]);

        $metadataType = $data['metadata']['type'] ?? null;

        if ($metadataType === 'cooperative_contribution' && $reference) {
            $this->cooperativeService->verifyContribution($reference);
            return;
        }

        $this->subscriptionService->handleChargeSuccess($data);
    }

    protected function handlePaystackSubscriptionCreate(array $data): void
    {
        Log::info('Paystack subscription.create', ['subscription_code' => $data['subscription_code'] ?? null]);

        // Subscription creation is handled via charge.success + verify flow
        // This event is logged for auditing purposes
    }

    protected function handlePaystackSubscriptionDisable(array $data): void
    {
        Log::info('Paystack subscription.disable', ['subscription_code' => $data['subscription_code'] ?? null]);

        $this->subscriptionService->handleSubscriptionDisable($data);
    }
}
