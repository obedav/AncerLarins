<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TermiiService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'phone'    => 'required|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'sometimes|in:tenant,landlord,agent',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'],
            'password' => $data['password'],
            'role'     => $data['role'] ?? 'tenant',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user'  => $user,
            'token' => $token,
        ], 'Registration successful', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user'  => $user,
            'token' => $token,
        ], 'Login successful');
    }

    public function sendOtp(Request $request, TermiiService $termii): JsonResponse
    {
        $data = $request->validate(['phone' => 'required|string']);

        $result = $termii->sendOtp($data['phone']);

        return $this->successResponse($result, 'OTP sent');
    }

    public function verifyOtp(Request $request, TermiiService $termii): JsonResponse
    {
        $data = $request->validate([
            'pin_id' => 'required|string',
            'otp'    => 'required|string',
        ]);

        $result = $termii->verifyOtp($data['pin_id'], $data['otp']);

        if (($result['verified'] ?? false) === true || ($result['verified'] ?? '') === 'True') {
            $request->user()?->update(['is_verified' => true]);
            return $this->successResponse(null, 'Phone verified successfully');
        }

        return $this->errorResponse('Invalid OTP', 422);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse($request->user()->load('properties'));
    }
}
