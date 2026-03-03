<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'leads_status_created_at_index');
            $table->index(['agent_id', 'status'], 'leads_agent_id_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex('leads_status_created_at_index');
            $table->dropIndex('leads_agent_id_status_index');
        });
    }
};
