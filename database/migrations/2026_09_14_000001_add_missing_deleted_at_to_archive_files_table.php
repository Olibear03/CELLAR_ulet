<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('archive_files', 'deleted_at')) {
            Schema::table('archive_files', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('archive_files', 'deleted_at')) {
            Schema::table('archive_files', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
