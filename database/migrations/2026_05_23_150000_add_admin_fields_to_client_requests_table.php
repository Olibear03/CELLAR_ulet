<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            // Admin/director e-signature (base64 PNG) stored when approving
            if (!Schema::hasColumn('client_requests', 'admin_signature')) {
                $table->text('admin_signature')->nullable()->after('printed_name');
            }
            // Admin printed name stored when approving
            if (!Schema::hasColumn('client_requests', 'admin_printed_name')) {
                $table->string('admin_printed_name', 150)->nullable()->after('admin_signature');
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            $table->dropColumn(['admin_signature', 'admin_printed_name']);
        });
    }
};
