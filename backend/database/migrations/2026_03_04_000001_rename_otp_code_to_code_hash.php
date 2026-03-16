<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->renameColumn('code', 'code_hash');
        });

        // Increase column length for the HMAC hash (64 hex chars for SHA-256)
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->string('code_hash', 128)->change();
        });
    }

    public function down(): void
    {
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->string('code_hash', 6)->change();
        });

        Schema::table('otp_codes', function (Blueprint $table) {
            $table->renameColumn('code_hash', 'code');
        });
    }
};
