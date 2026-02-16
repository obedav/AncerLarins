<?php

use Illuminate\Support\Facades\Schedule;

// Daily at 8am WAT: send daily digests for saved searches
Schedule::command('notifications:send-daily-digest')->dailyAt('08:00')->timezone('Africa/Lagos');

// Weekly on Monday at 8am WAT: send weekly digests
Schedule::command('notifications:send-weekly-digest')->weeklyOn(1, '08:00')->timezone('Africa/Lagos');

// Daily at midnight: expire old listings and warn about upcoming expirations
Schedule::command('properties:check-expiry')->daily();

// Hourly: recalculate agent performance metrics
Schedule::command('agents:update-performance')->hourly();
