<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\NeighborhoodController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AncerLarins API Routes (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Auth ─────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/otp/send', [AuthController::class, 'sendOtp']);
        Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // ── Properties (public) ─────────────────────────────
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/featured', [PropertyController::class, 'featured']);
    Route::get('/properties/{slug}', [PropertyController::class, 'show']);

    // ── Search (public) ─────────────────────────────────
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/nearby', [SearchController::class, 'nearby']);
    Route::get('/search/autocomplete', [SearchController::class, 'autocomplete']);

    // ── Neighborhoods (public) ──────────────────────────
    Route::get('/neighborhoods', [NeighborhoodController::class, 'index']);
    Route::get('/neighborhoods/{slug}', [NeighborhoodController::class, 'show']);

    // ── Reviews (public read) ───────────────────────────
    Route::get('/properties/{property}/reviews', [ReviewController::class, 'index']);

    // ── Payments webhook (no auth) ──────────────────────
    Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

    // ── Authenticated routes ────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Properties management
        Route::post('/properties', [PropertyController::class, 'store']);
        Route::put('/properties/{property}', [PropertyController::class, 'update']);
        Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
        Route::post('/properties/{property}/images', [PropertyController::class, 'uploadImages']);
        Route::get('/my/properties', [PropertyController::class, 'myProperties']);

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::put('/bookings/{booking}', [BookingController::class, 'update']);

        // Payments
        Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
        Route::get('/payments/verify/{reference}', [PaymentController::class, 'verify']);
        Route::get('/payments/history', [PaymentController::class, 'history']);

        // Reviews
        Route::post('/properties/{property}/reviews', [ReviewController::class, 'store']);

        // Favorites
        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/{property}', [FavoriteController::class, 'toggle']);

        // User profile
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/profile/avatar', [UserController::class, 'uploadAvatar']);
    });
});
