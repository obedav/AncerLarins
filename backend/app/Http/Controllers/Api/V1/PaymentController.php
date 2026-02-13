<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaystackService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    use ApiResponse;

    public function initialize(Request $request, PaystackService $paystack): JsonResponse
    {
        $data = $request->validate([
            'amount'      => 'required|numeric|min:100',
            'property_id' => 'nullable|exists:properties,id',
            'booking_id'  => 'nullable|exists:bookings,id',
        ]);

        $reference = 'AL-' . Str::upper(Str::random(12));
        $amountInKobo = (int) ($data['amount'] * 100);

        $result = $paystack->initializeTransaction(
            $request->user()->email,
            $amountInKobo,
            $reference,
            ['user_id' => $request->user()->id]
        );

        if ($result['status'] ?? false) {
            Payment::create([
                'user_id'     => $request->user()->id,
                'property_id' => $data['property_id'] ?? null,
                'booking_id'  => $data['booking_id'] ?? null,
                'amount'      => $data['amount'],
                'reference'   => $reference,
                'status'      => 'pending',
            ]);
        }

        return $this->successResponse($result, 'Payment initialized');
    }

    public function verify(Request $request, string $reference, PaystackService $paystack): JsonResponse
    {
        $result = $paystack->verifyTransaction($reference);
        $payment = Payment::where('reference', $reference)->firstOrFail();

        if (($result['data']['status'] ?? '') === 'success') {
            $payment->update([
                'status'              => 'success',
                'paystack_reference'  => $result['data']['reference'] ?? null,
                'payment_method'      => $result['data']['channel'] ?? null,
            ]);
        } else {
            $payment->update(['status' => 'failed']);
        }

        return $this->successResponse(new PaymentResource($payment->fresh()), 'Payment verified');
    }

    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('x-paystack-signature');
        $computed  = hash_hmac('sha512', $request->getContent(), config('services.paystack.secret_key'));

        if ($signature !== $computed) {
            return $this->errorResponse('Invalid signature', 403);
        }

        $event = $request->input('event');
        $data  = $request->input('data');

        if ($event === 'charge.success') {
            Payment::where('reference', $data['reference'] ?? '')->update([
                'status'             => 'success',
                'paystack_reference' => $data['reference'],
                'payment_method'     => $data['channel'] ?? null,
                'metadata'           => $data['metadata'] ?? null,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function history(Request $request): JsonResponse
    {
        $payments = $request->user()
            ->payments()
            ->with('property')
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($payments);
    }
}
