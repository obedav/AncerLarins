<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->unique()->nullable()->after('email');
            $table->string('role')->default('tenant')->after('phone');
            $table->string('avatar_url')->nullable()->after('role');
            $table->boolean('is_verified')->default(false)->after('avatar_url');
            $table->text('bio')->nullable()->after('is_verified');
            $table->string('company_name')->nullable()->after('bio');
            $table->string('lga')->nullable()->after('company_name');
            $table->string('state')->nullable()->after('lga');
            $table->index(['role', 'state', 'lga']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'state', 'lga']);
            $table->dropColumn(['phone', 'role', 'avatar_url', 'is_verified', 'bio', 'company_name', 'lga', 'state']);
        });
    }
};
