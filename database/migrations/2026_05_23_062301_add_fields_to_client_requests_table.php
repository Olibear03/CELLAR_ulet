<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            $table->string('reference_number', 30)->unique()->after('id');
            $table->date('request_date')->after('reference_number');
            $table->string('client_name', 150)->after('request_date');
            $table->string('address', 300)->after('client_name');
            $table->string('occupation', 150)->after('address');
            $table->string('contact_number', 50)->after('occupation');
            $table->string('email', 150)->after('contact_number');
            $table->string('agency', 200)->nullable()->after('email');
            $table->string('office_address', 300)->nullable()->after('agency');
            $table->json('services')->after('office_address');
            $table->json('language_options')->nullable()->after('services');
            $table->string('translation_document', 500)->nullable()->after('language_options');
            $table->string('research_title', 500)->nullable()->after('translation_document');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('research_title');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::table('client_requests', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'reference_number', 'request_date', 'client_name', 'address',
                'occupation', 'contact_number', 'email', 'agency', 'office_address',
                'services', 'language_options', 'translation_document', 'research_title',
                'status', 'reviewed_by', 'reviewed_at',
            ]);
        });
    }
};
