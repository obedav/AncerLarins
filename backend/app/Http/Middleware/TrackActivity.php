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
            $routeParams = $request->route()?->parameters() ?? [];

            $targetType = null;
            $targetId = null;

            foreach (['property', 'agent', 'user', 'report', 'lead', 'scrapedListing'] as $param) {
                if (isset($routeParams[$param])) {
                    $targetType = $param;
                    $value = $routeParams[$param];
                    $targetId = is_object($value) && method_exists($value, 'getKey')
                        ? $value->getKey()
                        : (string) $value;
                    break;
                }
            }

            ActivityLog::create([
                'user_id'     => $request->user()->id,
                'action'      => $request->method() . ' ' . $request->path(),
                'target_type' => $targetType,
                'target_id'   => $targetId,
                'metadata'    => [
                    'status_code' => $response->getStatusCode(),
                    'user_agent'  => $request->userAgent(),
                ],
                'ip_address'  => $request->ip(),
            ]);
        }

        return $response;
    }
}
