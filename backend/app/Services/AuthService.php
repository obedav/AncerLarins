<?php

namespace App\Services;

use App\Enums\OtpPurpose;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\OtpCode;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        protected TermiiService $termiiService,
    ) {}

    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $phone = $this->normalizePhone($data['phone']);

            $user = User::create([
                'first_name'    => $data['first_name'],
                'last_name'     => $data['last_name'],
                'phone'         => $phone,
                'email'         => $data['email'] ?? null,
                'password_hash' => $data['password'] ?? null,
                'role'          => UserRole::from($data['role'] ?? 'user'),
                'status'        => UserStatus::Active,
            ]);

            if ($user->role === UserRole::Agent) {
                $user->agentProfile()->create([
                    'company_name' => $user->full_name,
                ]);
            }

            // DEV BYPASS: Skip OTP sending in local environment
            if (app()->environment('local')) {
                OtpCode::create([
                    'phone'      => $phone,
                    'code'       => '000000',
                    'purpose'    => OtpPurpose::Registration,
                    'expires_at' => now()->addMinutes(10),
                ]);
            } else {
                $this->sendOtp($phone, OtpPurpose::Registration);
            }

            return $user;
        });
    }

    public function login(array $data): ?array
    {
        if (! empty($data['email'])) {
            $user = User::where('email', $data['email'])->first();
        } else {
            $phone = $this->normalizePhone($data['phone']);
            $user = User::where('phone', $phone)->first();
        }

        $phone = $user?->phone;

        if (! $user || $user->status === UserStatus::Banned) {
            return null;
        }

        // DEV BYPASS: Skip OTP sending in local environment
        if (app()->environment('local')) {
            OtpCode::create([
                'phone'      => $phone,
                'code'       => '000000',
                'purpose'    => OtpPurpose::Login,
                'expires_at' => now()->addMinutes(10),
            ]);
        } else {
            $this->sendOtp($phone, OtpPurpose::Login);
        }

        return ['otp_sent' => true];
    }

    public function verifyOtp(string $phone, string $code, string $purpose): ?array
    {
        $phone = $this->normalizePhone($phone);
        $purpose = OtpPurpose::from($purpose);

        // DEV BYPASS: Accept code 000000 in local environment
        if (app()->environment('local') && $code === '000000') {
            $user = User::where('phone', $phone)->first();

            if (! $user) {
                return null;
            }

            if ($purpose === OtpPurpose::Registration || $purpose === OtpPurpose::Login) {
                $user->update([
                    'phone_verified' => true,
                    'last_login_at'  => now(),
                    'last_login_ip'  => request()->ip(),
                ]);

                $tokens = $this->generateTokens($user);

                return [
                    'user'          => $user,
                    'access_token'  => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                ];
            }

            return ['user' => $user];
        }

        $otp = OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->where('code', $code)
            ->valid()
            ->latest('created_at')
            ->first();

        if (! $otp) {
            return null;
        }

        $otp->markVerified();

        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return null;
        }

        if ($purpose === OtpPurpose::Registration || $purpose === OtpPurpose::Login) {
            $user->update([
                'phone_verified' => true,
                'last_login_at'  => now(),
                'last_login_ip'  => request()->ip(),
            ]);

            $tokens = $this->generateTokens($user);

            return [
                'user'          => $user,
                'access_token'  => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
            ];
        }

        return ['user' => $user];
    }

    public function refreshToken(string $refreshToken): ?array
    {
        $token = RefreshToken::where('token_hash', hash('sha256', $refreshToken))
            ->active()
            ->first();

        if (! $token || ! $token->isValid()) {
            return null;
        }

        $token->revoke();

        $user = $token->user;
        $tokens = $this->generateTokens($user);

        return [
            'access_token'  => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
        $user->refreshTokens()->active()->update(['revoked_at' => now()]);
    }

    public function forgotPassword(string $phone): void
    {
        $phone = $this->normalizePhone($phone);
        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return; // Silent fail to prevent user enumeration
        }

        if (app()->environment('local')) {
            OtpCode::create([
                'phone'      => $phone,
                'code'       => '000000',
                'purpose'    => OtpPurpose::PasswordReset,
                'expires_at' => now()->addMinutes(10),
            ]);
        } else {
            $this->sendOtp($phone, OtpPurpose::PasswordReset);
        }
    }

    public function sendOtp(string $phone, OtpPurpose $purpose): void
    {
        $recentCount = OtpCode::where('phone', $phone)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentCount >= 3) {
            return;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'phone'      => $phone,
            'code'       => $code,
            'purpose'    => $purpose,
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->termiiService->sendOtp($phone);
    }

    protected function generateTokens(User $user): array
    {
        $accessToken = $user->createToken('api')->plainTextToken;

        $rawRefreshToken = Str::random(64);
        RefreshToken::create([
            'user_id'    => $user->id,
            'token_hash' => hash('sha256', $rawRefreshToken),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $rawRefreshToken,
        ];
    }

    public function normalizePhone(string $phone): string
    {
        if (str_starts_with($phone, '0')) {
            return '+234' . substr($phone, 1);
        }

        return $phone;
    }
}
