<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ── AncerLarins Services ─────────────────────────────

    'sms' => [
        'provider' => env('SMS_PROVIDER', 'termii'),
        'fallback' => env('SMS_FALLBACK'),
    ],

    'termii' => [
        'api_key' => env('TERMII_API_KEY'),
        'base_url' => env('TERMII_BASE_URL', 'https://v3.api.termii.com/api'),
        'sender_id' => env('TERMII_SENDER_ID', 'AncerLarins'),
        'channel' => env('TERMII_CHANNEL', 'dft'),
        'webhook_secret' => env('TERMII_WEBHOOK_SECRET'),
        'webhook_ips' => array_filter(explode(',', env('TERMII_WEBHOOK_IPS', ''))),
    ],

    '80kobo' => [
        'email' => env('EIGHTY_KOBO_EMAIL'),
        'password' => env('EIGHTY_KOBO_PASSWORD'),
        'sender_name' => env('EIGHTY_KOBO_SENDER_NAME', 'AncerLarins'),
        'base_url' => env('EIGHTY_KOBO_BASE_URL', 'https://api.80kobosms.com/v2/app'),
    ],

    'turnstile' => [
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
        'site_key' => env('TURNSTILE_SITE_KEY'),
    ],

    'paystack' => [
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'payment_url' => env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co'),
    ],

    'fcm' => [
        'server_key' => env('FCM_SERVER_KEY'),
        'project_id' => env('FCM_PROJECT_ID'),
    ],

];
