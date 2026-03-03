<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    'whatsapp_template' => "Hi, I'm interested in your property:\n\n*:title*\n📍 :area, :city\n💰 :price\n\nFound on AncerLarins: :url",

    // Business constants
    'landmark_radius_meters'     => 5000,
    'landmark_limit'             => 10,
    'similar_properties_limit'   => 6,
    'property_expiry_days'       => 90,
    'featured_default_days'      => 30,
];
