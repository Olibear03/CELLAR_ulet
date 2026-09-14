<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Add permission flag columns and status to users ──────────────
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_director')->default(false)->after('remember_token');
            $table->boolean('is_assistant')->default(false)->after('is_director');
            $table->boolean('is_critic')->default(false)->after('is_assistant');
            $table->string('status')->default('pending')->after('is_critic');
        });

        // ── 2. Data-migrate existing role values → flags (if role column exists) ──
        if (Schema::hasColumn('users', 'role')) {
            DB::table('users')->where('role', 'director')
                ->update(['is_director' => true, 'status' => 'active']);

            DB::table('users')->whereIn('role', ['admin', 'admin_assistant'])
                ->update(['is_assistant' => true, 'status' => 'active']);

            // All other existing users (not director/admin) become active too
            DB::table('users')
                ->where('is_director', false)
                ->where('is_assistant', false)
                ->update(['status' => 'active']);
        }

        // ── 3. Create critic_summary_reports table ───────────────────────────
        Schema::create('critic_summary_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // ── Fields matching CLLR-QF-02 certification form ──
            $table->string('student_name');            // "Name of the student/s"
            $table->string('course_degree');           // "course/degree"
            $table->string('manuscript_title');        // "Manuscript Title" / document title
            $table->string('document_type');           // type of manuscript (thesis, EDP, etc.)
            $table->integer('times_read');             // "No. of times read"
            $table->integer('page_count');             // "No. of pages"
            $table->decimal('total_amount', 10, 2);   // "Total Amount"
            $table->string('or_number');               // Official Receipt number

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('critic_summary_reports');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_director', 'is_assistant', 'is_critic', 'status']);
        });
    }
};
