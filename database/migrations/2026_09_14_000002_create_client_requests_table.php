<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('client_requests')) {
            return;
        }

        Schema::create('client_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('client_name', 150);
            $table->string('address', 300);
            $table->string('occupation', 150);
            $table->string('contact_number', 50);
            $table->string('email', 150);
            $table->string('agency', 200)->nullable();
            $table->string('office_address', 300)->nullable();
            $table->json('services');
            $table->json('language_options')->nullable();
            $table->string('translation_document', 500)->nullable();
            $table->string('research_title', 500)->nullable();
            $table->json('proficiency_options')->nullable();
            $table->text('client_signature')->nullable();
            $table->string('printed_name', 150)->nullable();
            $table->date('request_date')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('admin_signature')->nullable();
            $table->string('admin_printed_name', 150)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_requests');
    }
};
