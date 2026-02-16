<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AgentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AncerLarins API Routes (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public: Auth ────────────────────────────────────
    Route::prefix('auth')->middleware('throttle:30,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // ── Public: Properties ──────────────────────────────
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/{slug}', [PropertyController::class, 'show'])->where('slug', '[a-z0-9\-]+');
    Route::get('/properties/{property}/similar', [PropertyController::class, 'similar']);

    // ── Public: Search ──────────────────────────────────
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/search/map', [SearchController::class, 'map']);

    // ── Public: Agents ──────────────────────────────────
    Route::get('/agents', [AgentController::class, 'index']);
    Route::get('/agents/{agent}', [AgentController::class, 'show']);
    Route::get('/agents/{agent}/listings', [AgentController::class, 'listings']);
    Route::get('/agents/{agent}/reviews', [AgentController::class, 'reviews']);

    // ── Webhooks (no auth, verified by signature) ──────
    Route::prefix('webhooks')->group(function () {
        Route::post('/paystack', [App\Http\Controllers\Api\V1\WebhookController::class, 'paystack']);
        Route::post('/termii', [App\Http\Controllers\Api\V1\WebhookController::class, 'termii']);
    });

    // ── Public: Locations ───────────────────────────────
    Route::get('/states', [LocationController::class, 'states']);
    Route::get('/cities', [LocationController::class, 'cities']);
    Route::get('/areas', [LocationController::class, 'areas']);
    Route::get('/areas/{area}', [LocationController::class, 'areaDetail']);

    // ── Protected: Authenticated users ──────────────────
    Route::middleware(['auth:sanctum', 'throttle:60,1', 'ensure.phone_verified', 'track.activity'])->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // User profile & preferences
        Route::get('/me', [UserController::class, 'me']);
        Route::put('/me', [UserController::class, 'update']);

        // Saved properties
        Route::get('/me/saved-properties', [UserController::class, 'savedProperties']);
        Route::post('/properties/{property}/save', [PropertyController::class, 'save']);

        // Saved searches
        Route::get('/me/saved-searches', [UserController::class, 'savedSearches']);
        Route::post('/me/saved-searches', [UserController::class, 'createSavedSearch']);
        Route::delete('/me/saved-searches/{savedSearch}', [UserController::class, 'deleteSavedSearch']);

        // Notifications
        Route::get('/me/notifications', [UserController::class, 'notifications']);
        Route::get('/me/notifications/unread-count', [UserController::class, 'unreadNotificationsCount']);
        Route::patch('/me/notifications/{notification}/read', [UserController::class, 'markNotificationRead']);
        Route::post('/me/notifications/read-all', [UserController::class, 'markAllNotificationsRead']);

        // Push tokens
        Route::post('/me/push-tokens', [UserController::class, 'registerPushToken']);
        Route::delete('/me/push-tokens', [UserController::class, 'removePushToken']);

        // Reviews
        Route::post('/agents/{agent}/reviews', [AgentController::class, 'createReview']);

        // Contact / leads
        Route::post('/properties/{property}/contact', [PropertyController::class, 'contact']);

        // Reports
        Route::post('/reports', [PropertyController::class, 'report']);

        // ── Agent routes ────────────────────────────────
        Route::middleware('ensure.agent')->prefix('agent')->group(function () {

            Route::get('/dashboard', [AgentController::class, 'dashboard']);
            Route::get('/leads', [AgentController::class, 'leads']);
            Route::put('/leads/{lead}/respond', [AgentController::class, 'respondToLead']);
            Route::put('/profile', [AgentController::class, 'updateProfile']);
            Route::post('/verification', [AgentController::class, 'submitVerification']);

            // Property management
            Route::post('/properties', [PropertyController::class, 'store']);
            Route::put('/properties/{property}', [PropertyController::class, 'update']);
            Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
            Route::post('/properties/{property}/images', [PropertyController::class, 'uploadImages']);
            Route::delete('/images/{image}', [PropertyController::class, 'removeImage']);
        });

        // ── Admin routes ────────────────────────────────
        Route::middleware('ensure.admin')->prefix('admin')->group(function () {

            Route::get('/dashboard', [AdminController::class, 'dashboard']);

            // Property moderation
            Route::get('/properties/pending', [AdminController::class, 'pendingProperties']);
            Route::post('/properties/approve', [AdminController::class, 'approveProperty']);
            Route::post('/properties/reject', [AdminController::class, 'rejectProperty']);
            Route::post('/properties/feature', [AdminController::class, 'featureProperty']);

            // Agent moderation
            Route::get('/agents/pending', [AdminController::class, 'pendingAgents']);
            Route::post('/agents/verify', [AdminController::class, 'verifyAgent']);
            Route::post('/agents/reject', [AdminController::class, 'rejectAgent']);

            // Users
            Route::post('/users/ban', [AdminController::class, 'banUser']);

            // Reports
            Route::get('/reports', [AdminController::class, 'reports']);
            Route::post('/reports/{report}/resolve', [AdminController::class, 'resolveReport']);
        });
    });
});
