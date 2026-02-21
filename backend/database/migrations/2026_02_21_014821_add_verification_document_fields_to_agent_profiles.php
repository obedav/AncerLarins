<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->string('id_document_number', 100)->nullable()->after('id_document_type');
            $table->string('id_document_front_url')->nullable()->after('id_document_url');
            $table->string('id_document_front_public_id')->nullable()->after('id_document_front_url');
            $table->string('id_document_back_url')->nullable()->after('id_document_front_public_id');
            $table->string('id_document_back_public_id')->nullable()->after('id_document_back_url');
            $table->string('selfie_url')->nullable()->after('id_document_back_public_id');
            $table->string('selfie_public_id')->nullable()->after('selfie_url');
            $table->string('cac_document_public_id')->nullable()->after('cac_document_url');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'id_document_number',
                'id_document_front_url',
                'id_document_front_public_id',
                'id_document_back_url',
                'id_document_back_public_id',
                'selfie_url',
                'selfie_public_id',
                'cac_document_public_id',
            ]);
        });
    }
};
