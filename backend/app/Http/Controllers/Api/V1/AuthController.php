<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AuthService $authService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'Registration successful. Please verify your phone.', 201);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->authService->verifyOtp(
            $data['phone'],
            $data['code'],
            $data['purpose'],
        );

        if (! $result) {
            return $this->errorResponse('Invalid or expired OTP.', 422);
        }

        $response = ['user' => new UserResource($result['user'])];

        if (isset($result['access_token'])) {
            $response['access_token']  = $result['access_token'];
            $response['refresh_token'] = $result['refresh_token'];
        }

        return $this->successResponse($response, 'Phone verified successfully.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        if (! $result) {
            return $this->errorResponse('Invalid credentials.', 401);
        }

        return $this->successResponse(null, 'OTP sent to your phone.');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $this->authService->forgotPassword($request->phone);

        return $this->successResponse(null, 'If an account exists, an OTP has been sent.');
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        $result = $this->authService->refreshToken($request->refresh_token);

        if (! $result) {
            return $this->errorResponse('Invalid refresh token.', 401);
        }

        return $this->successResponse([
            'access_token'  => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
        ], 'Token refreshed.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(null, 'Logged out.');
    }

}
