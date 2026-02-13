<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgent
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, [UserRole::Agent, UserRole::Admin, UserRole::SuperAdmin])) {
            return response()->json([
                'message' => 'Agent access required.',
                'error' => 'not_agent',
            ], 403);
        }

        return $next($request);
    }
}
