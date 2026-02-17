<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Expand listing_type enum to include short_let
        DB::statement("ALTER TABLE properties MODIFY COLUMN listing_type ENUM('rent', 'sale', 'short_let') NOT NULL");

        // Expand rent_period enum to include weekly and daily
        DB::statement("ALTER TABLE properties MODIFY COLUMN rent_period ENUM('yearly', 'monthly', 'quarterly', 'weekly', 'daily') NULL");

        // Add short-let specific columns
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('min_stay_days')->nullable()->after('rent_period');
            $table->unsignedSmallInteger('max_stay_days')->nullable()->after('min_stay_days');
            $table->time('check_in_time')->nullable()->after('max_stay_days');
            $table->time('check_out_time')->nullable()->after('check_in_time');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['min_stay_days', 'max_stay_days', 'check_in_time', 'check_out_time']);
        });

        DB::statement("ALTER TABLE properties MODIFY COLUMN rent_period ENUM('yearly', 'monthly', 'quarterly') NULL");
        DB::statement("ALTER TABLE properties MODIFY COLUMN listing_type ENUM('rent', 'sale') NOT NULL");
    }
};
