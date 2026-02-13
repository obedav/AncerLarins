<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landmarks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('area_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->timestampsTz();
        });

        DB::statement('ALTER TABLE landmarks ADD COLUMN location geography(Point, 4326)');
        DB::statement('CREATE INDEX landmarks_location_gist ON landmarks USING GIST(location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('landmarks');
    }
};
