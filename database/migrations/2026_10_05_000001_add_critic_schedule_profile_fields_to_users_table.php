<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'professional_title')) {
                $table->string('professional_title')->nullable();
            }
            if (! Schema::hasColumn('users', 'department')) {
                $table->string('department')->nullable();
            }
            if (! Schema::hasColumn('users', 'office_location')) {
                $table->string('office_location')->nullable();
            }
            if (! Schema::hasColumn('users', 'availability_status')) {
                $table->string('availability_status')->default('accepting');
            }
            if (! Schema::hasColumn('users', 'office_hours')) {
                $table->json('office_hours')->nullable();
            }
            if (! Schema::hasColumn('users', 'max_queue_limit')) {
                $table->unsignedSmallInteger('max_queue_limit')->default(10);
            }
        });
    }

    public function down(): void
    {
        $columns = [
            'professional_title',
            'department',
            'office_location',
            'availability_status',
            'office_hours',
            'max_queue_limit',
        ];

        foreach ($columns as $column) {
            if (Schema::hasColumn('users', $column)) {
                Schema::table('users', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
