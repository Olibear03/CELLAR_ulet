<?php

namespace Tests\Feature;

use App\Models\ArchiveFile;
use App\Models\Category;
use App\Models\FileShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShareControllerGenerateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the generate endpoint returns a valid URL
     * and creates a FileShare record with a UUID token.
     */
    public function test_generate_returns_valid_url_with_token(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);
        $file = ArchiveFile::create([
            'title' => 'Test Document',
            'description' => 'A test file',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'uploads/test.pdf',
            'original_filename' => 'test.pdf',
            'metadata' => [],
        ]);

        $response = $this->actingAs($user)->postJson('/share-link', [
            'file_id' => $file->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['url']);

        $url = $response->json('url');
        $this->assertStringContainsString('/share/', $url);

        // Verify FileShare record was created
        $this->assertDatabaseHas('file_shares', [
            'archive_file_id' => $file->id,
        ]);

        $share = FileShare::where('archive_file_id', $file->id)->first();
        $this->assertNotNull($share->token);
        $this->assertMatchesRegularExpression('/^[0-9a-f-]{36}$/', $share->token);
        $this->assertStringEndsWith("/share/{$share->token}", $url);
    }

    /**
     * Test that generating multiple times for the same file
     * returns the same URL (idempotency).
     */
    public function test_generate_is_idempotent(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);
        $file = ArchiveFile::create([
            'title' => 'Test Document',
            'description' => 'A test file',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'uploads/test.pdf',
            'original_filename' => 'test.pdf',
            'metadata' => [],
        ]);

        $response1 = $this->actingAs($user)->postJson('/share-link', [
            'file_id' => $file->id,
        ]);
        $url1 = $response1->json('url');

        $response2 = $this->actingAs($user)->postJson('/share-link', [
            'file_id' => $file->id,
        ]);
        $url2 = $response2->json('url');

        $this->assertEquals($url1, $url2);
        $this->assertEquals(1, FileShare::where('archive_file_id', $file->id)->count());
    }

    /**
     * Test that the generate endpoint returns 422
     * when file_id is missing.
     */
    public function test_generate_returns_422_when_file_id_missing(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/share-link', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file_id']);
    }

    /**
     * Test that the generate endpoint returns 422
     * when file_id does not exist.
     */
    public function test_generate_returns_422_when_file_id_does_not_exist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/share-link', [
            'file_id' => 99999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file_id']);
    }

    /**
     * Test that unauthenticated requests return 401.
     */
    public function test_generate_returns_401_when_unauthenticated(): void
    {
        $category = Category::create(['name' => 'general_doc']);
        $user = User::factory()->create();
        $file = ArchiveFile::create([
            'title' => 'Test Document',
            'description' => 'A test file',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'uploads/test.pdf',
            'original_filename' => 'test.pdf',
            'metadata' => [],
        ]);

        $response = $this->postJson('/share-link', [
            'file_id' => $file->id,
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that expiry-related fields (amount, unit) are ignored
     * if present in the request.
     */
    public function test_generate_ignores_expiry_fields(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'general_doc']);
        $file = ArchiveFile::create([
            'title' => 'Test Document',
            'description' => 'A test file',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'file_path' => 'uploads/test.pdf',
            'original_filename' => 'test.pdf',
            'metadata' => [],
        ]);

        // Send extra fields that should be ignored
        $response = $this->actingAs($user)->postJson('/share-link', [
            'file_id' => $file->id,
            'amount' => 24,
            'unit' => 'hours',
        ]);

        // Should still succeed
        $response->assertStatus(200);
        $response->assertJsonStructure(['url']);
    }
}
