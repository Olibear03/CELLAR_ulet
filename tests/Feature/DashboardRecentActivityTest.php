<?php

namespace Tests\Feature;

use App\Models\ArchiveFile;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardRecentActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_displays_only_the_five_most_recent_files_and_folders_from_the_last_30_days(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);

        foreach (range(1, 7) as $number) {
            $file = ArchiveFile::create([
                'title' => "Repository item {$number}",
                'category_id' => $category->id,
                'user_id' => $user->id,
                'file_path' => $number % 2 === 0 ? 'folder' : "archives/file-{$number}.pdf",
                'original_filename' => $number % 2 === 0 ? 'folder' : "file-{$number}.pdf",
                'metadata' => ['type' => $number % 2 === 0 ? 'folder' : 'document'],
            ]);
            ArchiveFile::whereKey($file->id)->update([
                'created_at' => now()->subMinutes(8 - $number),
            ]);
        }

        $oldFile = ArchiveFile::create([
            'title' => 'Old repository item',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'archives/old.pdf',
            'original_filename' => 'old.pdf',
            'metadata' => ['type' => 'document'],
        ]);
        ArchiveFile::whereKey($oldFile->id)->update([
            'created_at' => now()->subDays(31),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->has('recentUploads', 5)
                ->where('recentUploads.0.title', 'Repository item 7')
                ->where('recentUploads.4.title', 'Repository item 3')
                ->where('recentUploads.1.metadata.type', 'folder'));
    }
}
