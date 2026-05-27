<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            // Base64 PNG of the client's drawn signature
            $table->text('client_signature')->nullable()->after('research_title');
            // Director's name filled in when approving
            $table->string('director_name', 150)->nullable()->after('client_signature');
        });
    }

    public function down(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            $table->dropColumn(['client_signature', 'director_name']);
        });
    }
};
