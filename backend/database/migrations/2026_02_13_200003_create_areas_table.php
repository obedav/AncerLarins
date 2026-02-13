<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('city_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->bigInteger('avg_rent_1br')->nullable();
            $table->bigInteger('avg_rent_2br')->nullable();
            $table->bigInteger('avg_rent_3br')->nullable();
            $table->bigInteger('avg_buy_price_sqm')->nullable();
            $table->decimal('safety_score', 3, 1)->nullable();
            $table->decimal('traffic_score', 3, 1)->nullable();
            $table->decimal('amenity_score', 3, 1)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->unique(['city_id', 'slug']);
        });

        DB::statement('ALTER TABLE areas ADD COLUMN location geography(Point, 4326)');
        DB::statement('CREATE INDEX areas_location_gist ON areas USING GIST(location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};
