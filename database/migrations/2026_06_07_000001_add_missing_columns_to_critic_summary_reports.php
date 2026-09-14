<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('critic_summary_reports', 'student_name')) {
            Schema::table('critic_summary_reports', function (Blueprint $table) {
                $table->string('student_name')->nullable();
            });
        }
        if (!Schema::hasColumn('critic_summary_reports', 'course_degree')) {
            Schema::table('critic_summary_reports', function (Blueprint $table) {
                $table->string('course_degree')->nullable();
            });
        }
        if (!Schema::hasColumn('critic_summary_reports', 'manuscript_title')) {
            Schema::table('critic_summary_reports', function (Blueprint $table) {
                $table->string('manuscript_title')->nullable();
            });
        }
        if (!Schema::hasColumn('critic_summary_reports', 'times_read')) {
            Schema::table('critic_summary_reports', function (Blueprint $table) {
                $table->integer('times_read')->default(0);
            });
        }
        if (!Schema::hasColumn('critic_summary_reports', 'total_amount')) {
            Schema::table('critic_summary_reports', function (Blueprint $table) {
                $table->decimal('total_amount', 10, 2)->default(0);
            });
        }
    }

    public function down(): void
    {
        Schema::table('critic_summary_reports', function (Blueprint $table) {
            $table->dropColumn([
                'student_name',
                'course_degree',
                'manuscript_title',
                'times_read',
                'total_amount',
            ]);
        });
    }
};
