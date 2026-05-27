<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_requests', function (Blueprint $table) {
            $table->id();

            // Auto-generated unique reference number e.g. CLLR-2026-00001
            $table->string('reference_number', 30)->unique();

            // Client information
            $table->date('request_date');
            $table->string('client_name', 150);
            $table->string('address', 300);
            $table->string('occupation', 150);
            $table->string('contact_number', 50);
            $table->string('email', 150);
            $table->string('agency', 200)->nullable();
            $table->string('office_address', 300)->nullable();

            // Services requested — JSON array of selected service keys
            $table->json('services');

            // Conditional sub-fields
            $table->json('language_options')->nullable();
            $table->string('translation_document', 500)->nullable();
            $table->string('research_title', 500)->nullable();

            // Approval workflow
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_requests');
    }
};
