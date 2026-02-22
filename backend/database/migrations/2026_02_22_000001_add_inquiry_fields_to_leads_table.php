<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('full_name', 100)->nullable()->after('user_id');
            $table->string('email', 255)->nullable()->after('full_name');
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('budget_range', 50)->nullable()->after('phone');
            $table->string('timeline', 30)->nullable()->after('budget_range');
            $table->string('financing_type', 20)->nullable()->after('timeline');
            $table->text('message')->nullable()->after('financing_type');
            $table->string('status', 30)->default('new')->after('message');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete()->after('status');
            $table->text('staff_notes')->nullable()->after('assigned_to');
            $table->timestampTz('qualified_at')->nullable()->after('staff_notes');
            $table->timestampTz('inspection_at')->nullable()->after('qualified_at');
            $table->timestampTz('closed_at')->nullable()->after('inspection_at');

            $table->index('status');
            $table->index('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropIndex(['status']);
            $table->dropIndex(['assigned_to']);
            $table->dropColumn([
                'full_name', 'email', 'phone', 'budget_range', 'timeline',
                'financing_type', 'message', 'status', 'assigned_to',
                'staff_notes', 'qualified_at', 'inspection_at', 'closed_at',
            ]);
        });
    }
};
