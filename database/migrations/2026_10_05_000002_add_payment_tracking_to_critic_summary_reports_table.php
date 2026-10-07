<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('critic_summary_reports', function (Blueprint $table) {
            if (! Schema::hasColumn('critic_summary_reports', 'payment_status')) {
                $table->string('payment_status')->nullable();
            }
            if (! Schema::hasColumn('critic_summary_reports', 'paid_at')) {
                $table->timestamp('paid_at')->nullable();
            }
            if (! Schema::hasColumn('critic_summary_reports', 'paid_by')) {
                $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('critic_summary_reports', function (Blueprint $table) {
            if (Schema::hasColumn('critic_summary_reports', 'paid_by')) {
                $table->dropConstrainedForeignId('paid_by');
            }
            $columns = array_filter(
                ['payment_status', 'paid_at'],
                fn (string $column) => Schema::hasColumn('critic_summary_reports', $column)
            );
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
