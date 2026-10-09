<?php

namespace Tests\Feature;

use App\Models\ArchiveFile;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentFolderAndFavoriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_folder_can_be_created_with_optional_tags(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);

        $this->actingAs($user)
            ->post(route('folders.store'), [
                'name' => 'Policies',
                'tags' => 'policy, 2026',
                'category_id' => $category->id,
            ])
            ->assertRedirect('/documents')
            ->assertSessionHasNoErrors();

        $folder = ArchiveFile::where('title', 'Policies')->firstOrFail();
        $this->assertSame('folder', $folder->metadata['type']);
        $this->assertSame('policy, 2026', $folder->metadata['keywords']);

        $this->actingAs($user)
            ->post(route('folders.store'), [
                'name' => 'Untaged',
                'category_id' => $category->id,
            ])
            ->assertRedirect('/documents')
            ->assertSessionHasNoErrors();

        $untaggedFolder = ArchiveFile::where('title', 'Untaged')->firstOrFail();
        $this->assertSame('folder', $untaggedFolder->metadata['type']);
        $this->assertNull($untaggedFolder->metadata['keywords']);
    }

    public function test_bookmarking_a_folder_adds_it_to_the_documents_bookmarks_panel(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);
        $folder = ArchiveFile::create([
            'title' => 'Research',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'folder',
            'original_filename' => 'folder',
            'metadata' => ['type' => 'folder'],
        ]);
        $document = ArchiveFile::create([
            'title' => 'Report',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'archives/report.pdf',
            'original_filename' => 'report.pdf',
            'metadata' => ['type' => 'document'],
        ]);

        $this->actingAs($user)
            ->post(route('favorites.store', $folder))
            ->assertRedirect();
        $this->post(route('favorites.store', $document))
            ->assertRedirect();

        $this->get(route('favorites.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Favorites')
                ->has('folders', 1)
                ->where('folders.0.id', $folder->id)
                ->has('documents', 1)
                ->where('documents.0.id', $document->id));
    }
}
