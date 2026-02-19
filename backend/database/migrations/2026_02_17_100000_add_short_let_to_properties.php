<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: drop old check constraints and add new ones with expanded values
        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_listing_type_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_listing_type_check CHECK (listing_type::text = ANY (ARRAY['rent'::text, 'sale'::text, 'short_let'::text]))");

        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_rent_period_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_rent_period_check CHECK (rent_period::text = ANY (ARRAY['yearly'::text, 'monthly'::text, 'quarterly'::text, 'weekly'::text, 'daily'::text]))");

        // Add short-let specific columns
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('min_stay_days')->nullable();
            $table->unsignedSmallInteger('max_stay_days')->nullable();
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['min_stay_days', 'max_stay_days', 'check_in_time', 'check_out_time']);
        });

        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_rent_period_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_rent_period_check CHECK (rent_period::text = ANY (ARRAY['yearly'::text, 'monthly'::text, 'quarterly'::text]))");

        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_listing_type_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_listing_type_check CHECK (listing_type::text = ANY (ARRAY['rent'::text, 'sale'::text]))");
    }
};
