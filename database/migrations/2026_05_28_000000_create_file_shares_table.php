<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('archive_file_id')
                  ->unique()
                  ->constrained('archive_files')
                  ->cascadeOnDelete();
            $table->uuid('token')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_shares');
    }
};
