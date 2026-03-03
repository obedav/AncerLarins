<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['property_id']);
            $table->dropForeign(['agent_id']);

            $table->foreign('property_id')
                ->references('id')->on('properties')
                ->restrictOnDelete();

            $table->foreign('agent_id')
                ->references('id')->on('agent_profiles')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['property_id']);
            $table->dropForeign(['agent_id']);

            $table->foreign('property_id')
                ->references('id')->on('properties')
                ->cascadeOnDelete();

            $table->foreign('agent_id')
                ->references('id')->on('agent_profiles')
                ->cascadeOnDelete();
        });
    }
};
