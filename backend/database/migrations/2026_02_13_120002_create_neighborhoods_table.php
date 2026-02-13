<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('neighborhoods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('city');
            $table->string('state');
            $table->string('lga');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('avg_rent_price', 15, 2)->nullable();
            $table->decimal('avg_sale_price', 15, 2)->nullable();
            $table->decimal('safety_rating', 3, 1)->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();
            $table->index(['city', 'state', 'lga']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('neighborhoods');
    }
};
