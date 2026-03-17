<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('virtual_tours', 'cloudinary_public_id')) {
            return;
        }

        Schema::table('virtual_tours', function (Blueprint $table) {
            $table->string('cloudinary_public_id')->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('virtual_tours', function (Blueprint $table) {
            $table->dropColumn('cloudinary_public_id');
        });
    }
};
