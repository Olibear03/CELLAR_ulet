<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentUploadActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_upload_is_logged_in_recent_activity(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);

        $this->actingAs($user)
            ->post(route('upload.store'), [
                'title' => 'Annual Report',
                'category_id' => $category->id,
                'file' => UploadedFile::fake()->create('annual-report.pdf', 20, 'application/pdf'),
                'metadata' => [
                    'year' => '2026',
                    'rating_period' => 'Jan-Jun',
                    'keywords' => 'report',
                ],
            ])
            ->assertRedirect('/documents')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'uploaded_documents',
            'type' => 'file_management',
            'location' => 'Documents',
        ]);
    }
}
