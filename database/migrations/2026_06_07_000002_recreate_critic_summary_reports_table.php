<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('critic_summary_reports');

        Schema::create('critic_summary_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('student_name');
            $table->string('course_degree');
            $table->string('manuscript_title');
            $table->string('document_type');
            $table->integer('times_read');
            $table->integer('page_count');
            $table->decimal('total_amount', 10, 2);
            $table->string('or_number');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('critic_summary_reports');
    }
};
