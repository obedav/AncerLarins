<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->index(['status', 'published_at'], 'idx_properties_status_published');
            $table->index(['agent_id', 'status'], 'idx_properties_agent_status');
            $table->index(['featured', 'featured_until'], 'idx_properties_featured');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_activity_logs_user_created');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex('idx_properties_status_published');
            $table->dropIndex('idx_properties_agent_status');
            $table->dropIndex('idx_properties_featured');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_user_created');
        });
    }
};
