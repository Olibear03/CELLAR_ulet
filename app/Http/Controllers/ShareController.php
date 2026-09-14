<?php

namespace App\Http\Controllers;

use App\Models\ArchiveFile;
use App\Models\FileShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShareController extends Controller
{
    /**
     * Generate (or retrieve) a permanent share link for a file.
     *
     * POST /share-link
     * Auth: required (auth + verified middleware)
     *
     * Only `file_id` is accepted — any expiry fields (amount, unit, etc.)
     * present in the request body are silently ignored.
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'file_id' => 'required|exists:archive_files,id',
        ]);

        $share = FileShare::firstOrCreate(
            ['archive_file_id' => $request->file_id]
        );

        // Lazy token guard: assign a UUID if the record existed without one
        // (edge case from records created before the booted() hook was added)
        if (empty($share->token)) {
            $share->update(['token' => (string) Str::uuid()]);
        }

        return response()->json(['url' => url("/share/{$share->token}")]);
    }

    /**
     * Display the public share page for a given token.
     *
     * GET /share/{token}
     * Auth: none — publicly accessible
     */
    public function show(string $token): \Inertia\Response
    {
        $share = FileShare::with('archiveFile')
                          ->where('token', $token)
                          ->firstOrFail();

        $file      = $share->archiveFile;
        $mimeOrExt = $this->resolveMimeOrExtension($file);

        return Inertia::render('SharePage', [
            'title'             => $file->title,
            'original_filename' => $file->original_filename,
            'file_path'         => $file->file_path,
            'file_url'          => asset('storage/' . $file->file_path),
            'mime_or_ext'       => $mimeOrExt,
            'is_previewable'    => $this->isPreviewable($mimeOrExt),
        ]);
    }

    /**
     * Resolve the MIME type (when the file exists on disk) or fall back to
     * the extension extracted from the original filename.
     */
    private function resolveMimeOrExtension(ArchiveFile $file): string
    {
        $path = storage_path('app/public/' . $file->file_path);

        if (file_exists($path)) {
            return mime_content_type($path) ?: pathinfo($file->original_filename, PATHINFO_EXTENSION);
        }

        return pathinfo($file->original_filename, PATHINFO_EXTENSION);
    }

    /**
     * Determine whether the given MIME type or extension is previewable
     * via Google Docs Viewer.
     *
     * The check is case-insensitive and covers common PDF, image, and Office
     * formats.
     */
    private function isPreviewable(string $mimeOrExt): bool
    {
        $previewable = [
            // MIME types
            'application/pdf',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            // Extensions — images, PDF, Office formats
            'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp',
            'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        ];

        return in_array(strtolower($mimeOrExt), $previewable, true);
    }
}
