<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->phone_verified) {
            return response()->json([
                'message' => 'Phone number not verified.',
                'error' => 'phone_not_verified',
            ], 403);
        }

        return $next($request);
    }
}
