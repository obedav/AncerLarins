<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user()) {
            ActivityLog::create([
                'user_id'    => $request->user()->id,
                'action'     => $request->method() . ' ' . $request->path(),
                'metadata'   => [
                    'status_code' => $response->getStatusCode(),
                    'user_agent'  => $request->userAgent(),
                ],
                'ip_address' => $request->ip(),
            ]);
        }

        return $response;
    }
}
