<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passkey\AuthenticatePasskeyRequest;
use App\Http\Requests\Passkey\RegisterPasskeyRequest;
use App\Services\AuthService;
use App\Services\WebauthnService;
use App\Traits\ApiResponse;
use App\Traits\AttachesAuthCookies;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasskeyController extends Controller
{
    use ApiResponse, AttachesAuthCookies;

    public function __construct(
        protected WebauthnService $webauthnService,
        protected AuthService $authService,
    ) {}

    /**
     * Get registration options (authenticated — user is adding a passkey).
     */
    public function registrationOptions(Request $request): JsonResponse
    {
        try {
            $result = $this->webauthnService->beginRegistration($request->user());

            return $this->successResponse($result, 'Registration options generated.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to generate registration options.', 500);
        }
    }

    /**
     * Complete registration (save credential).
     */
    public function register(RegisterPasskeyRequest $request): JsonResponse
    {
        try {
            $credential = $this->webauthnService->completeRegistration(
                user: $request->user(),
                challengeId: $request->input('challenge_id'),
                credential: $request->input('credential'),
                deviceName: $request->input('device_name'),
            );

            return $this->successResponse([
                'id' => $credential->id,
                'device_name' => $credential->device_name,
                'created_at' => $credential->created_at,
            ], 'Passkey registered successfully.', 201);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to register passkey.', 500);
        }
    }

    /**
     * Get authentication options (public — user is logging in).
     */
    public function authenticationOptions(): JsonResponse
    {
        try {
            $result = $this->webauthnService->beginAuthentication();

            return $this->successResponse($result, 'Authentication options generated.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to generate authentication options.', 500);
        }
    }

    /**
     * Complete authentication (verify assertion, return tokens).
     */
    public function authenticate(AuthenticatePasskeyRequest $request): JsonResponse
    {
        try {
            $user = $this->webauthnService->completeAuthentication(
                challengeId: $request->input('challenge_id'),
                assertion: $request->input('credential'),
            );

            $this->authService->recordLogin($user);
            $tokens = $this->authService->generateTokens($user);

            $jsonResponse = $this->successResponse([
                'user' => new \App\Http\Resources\UserResource($user),
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
            ], 'Authenticated successfully.');

            $this->attachAuthCookies($jsonResponse, $tokens['access_token'], $tokens['refresh_token']);

            return $jsonResponse;
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 401);
        } catch (\Throwable $e) {
            return $this->errorResponse('Authentication failed.', 401);
        }
    }

    /**
     * List user's registered passkeys.
     */
    public function index(Request $request): JsonResponse
    {
        $credentials = $request->user()->webauthnCredentials()
            ->select(['id', 'device_name', 'created_at', 'last_used_at'])
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse($credentials);
    }

    /**
     * Delete a passkey.
     */
    public function destroy(Request $request, string $credential): JsonResponse
    {
        $deleted = $request->user()->webauthnCredentials()
            ->where('id', $credential)
            ->delete();

        if (! $deleted) {
            return $this->errorResponse('Passkey not found.', 404);
        }

        return $this->successResponse(null, 'Passkey deleted.');
    }
}
