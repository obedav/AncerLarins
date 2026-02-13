<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('neighborhood_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 15, 2);
            $table->string('listing_type');
            $table->string('property_type');
            $table->string('status')->default('available');
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('toilets')->default(0);
            $table->decimal('area_sqm', 10, 2)->nullable();
            $table->string('address');
            $table->string('city')->default('Lagos');
            $table->string('state')->default('Lagos');
            $table->string('lga');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('year_built')->nullable();
            $table->boolean('is_furnished')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->boolean('has_security')->default(false);
            $table->boolean('has_pool')->default(false);
            $table->boolean('has_gym')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index('listing_type');
            $table->index('property_type');
            $table->index('status');
            $table->index('city');
            $table->index('lga');
            $table->index('is_featured');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
