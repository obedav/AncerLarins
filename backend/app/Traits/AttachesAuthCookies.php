<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Cookie;

trait AttachesAuthCookies
{
    protected function attachAuthCookies(JsonResponse $response, string $accessToken, string $refreshToken): void
    {
        $secure = request()->isSecure() || app()->environment('production');
        $domain = config('session.domain');

        // httpOnly access token — 24 hours
        $response->withCookie(new Cookie(
            name: 'access_token',
            value: $accessToken,
            expire: now()->addDay(),
            path: '/',
            domain: $domain,
            secure: $secure,
            httpOnly: true,
            sameSite: 'lax',
        ));

        // httpOnly refresh token — 30 days
        $response->withCookie(new Cookie(
            name: 'refresh_token',
            value: $refreshToken,
            expire: now()->addDays(30),
            path: '/',
            domain: $domain,
            secure: $secure,
            httpOnly: true,
            sameSite: 'lax',
        ));

        // Non-httpOnly indicator so the frontend knows auth state
        $response->withCookie(new Cookie(
            name: 'is_logged_in',
            value: '1',
            expire: now()->addDays(30),
            path: '/',
            domain: $domain,
            secure: $secure,
            httpOnly: false,
            sameSite: 'lax',
        ));
    }

    protected function clearAuthCookies(JsonResponse $response): void
    {
        $domain = config('session.domain');

        $response->withCookie(Cookie::create('access_token')->withPath('/')->withDomain($domain)->withExpires(0));
        $response->withCookie(Cookie::create('refresh_token')->withPath('/')->withDomain($domain)->withExpires(0));
        $response->withCookie(Cookie::create('is_logged_in')->withPath('/')->withDomain($domain)->withExpires(0));
    }
}
