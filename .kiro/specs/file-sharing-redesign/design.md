# Design Document — File Sharing Redesign

## Overview

This redesign replaces the existing `temporarySignedRoute`-based file sharing with a permanent, token-based system. A single UUID token is stored per file in a new `file_shares` table. Authenticated users generate (or retrieve) that token via `POST /share-link`, and guests visit the resulting `GET /share/{token}` URL to view or download the file on a standalone, CELLAR-branded Inertia page. No external dependencies are added.

---

## Architecture

The change touches four layers:

```
[Browser / Authenticated User]
        │
        │  POST /share-link  (auth middleware)
        ▼
[ShareController@generate]
   ─ Validates file_id
   ─ Upserts FileShare (firstOrCreate)
   ─ Returns { url: "https://app/share/{token}" }
        │
        │  GET /share/{token}  (no middleware)
        ▼
[ShareController@show]
   ─ Looks up FileShare by token
   ─ Resolves file URL + MIME type
   ─ Returns Inertia::render('SharePage', [...props])
        │
        ▼
[Pages/SharePage.jsx]
   ─ CELLAR-branded layout (no sidebar/nav)
   ─ PreviewEmbed (iframe) or DownloadCard
   ─ Always shows download button
```

The `ShareLinkModal.jsx` is simplified in parallel: expiry UI removed, payload reduced to `{ file_id }` only.

---

## Components and Interfaces

### 1. Database Migration — `file_shares`

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_file_shares_table.php`

```php
Schema::create('file_shares', function (Blueprint $table) {
    $table->id();
    $table->foreignId('archive_file_id')
          ->unique()
          ->constrained('archive_files')
          ->cascadeOnDelete();
    $table->uuid('token')->unique();
    $table->timestamps();
});
```

Key constraints:
- `token` — unique, UUID
- `archive_file_id` — unique (one share record per file), foreign key with cascade delete

### 2. FileShare Model

**File:** `app/Models/FileShare.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FileShare extends Model
{
    protected $fillable = ['archive_file_id', 'token'];

    /**
     * Auto-generate a UUID token when creating a new share record.
     */
    protected static function booted(): void
    {
        static::creating(function (FileShare $share) {
            if (empty($share->token)) {
                $share->token = (string) Str::uuid();
            }
        });
    }

    public function archiveFile()
    {
        return $this->belongsTo(ArchiveFile::class);
    }
}
```

### 3. ShareController

**File:** `app/Http/Controllers/ShareController.php`

Two public methods:

#### `generate(Request $request)` — POST /share-link

```php
public function generate(Request $request): JsonResponse
{
    $request->validate([
        'file_id' => 'required|exists:archive_files,id',
    ]);

    $share = FileShare::firstOrCreate(
        ['archive_file_id' => $request->file_id]
    );

    // Lazily assign token if record existed without one (migration edge case)
    if (empty($share->token)) {
        $share->update(['token' => (string) Str::uuid()]);
    }

    $url = url("/share/{$share->token}");

    return response()->json(['url' => $url]);
}
```

#### `show(string $token)` — GET /share/{token}

```php
public function show(string $token): Response
{
    $share = FileShare::with('archiveFile')
                      ->where('token', $token)
                      ->firstOrFail(); // aborts with 404 if not found

    $file = $share->archiveFile;

    $fileUrl   = asset('storage/' . $file->file_path);
    $mimeOrExt = $this->resolveMimeOrExtension($file);

    return Inertia::render('SharePage', [
        'title'            => $file->title,
        'original_filename'=> $file->original_filename,
        'file_path'        => $file->file_path,
        'file_url'         => $fileUrl,
        'mime_or_ext'      => $mimeOrExt,
        'is_previewable'   => $this->isPreviewable($mimeOrExt),
    ]);
}
```

#### `resolveMimeOrExtension` (private helper)

Returns the MIME type if the file exists on disk (via `mime_content_type`), otherwise falls back to the extension extracted from `original_filename`. This keeps the controller self-contained without requiring MIME data to be stored in `archive_files.metadata`.

```php
private function resolveMimeOrExtension(ArchiveFile $file): string
{
    $disk = storage_path('app/public/' . $file->file_path);
    if (file_exists($disk)) {
        return mime_content_type($disk) ?: pathinfo($file->original_filename, PATHINFO_EXTENSION);
    }
    return pathinfo($file->original_filename, PATHINFO_EXTENSION);
}
```

#### `isPreviewable` (private helper)

```php
private function isPreviewable(string $mimeOrExt): bool
{
    $previewable = [
        // MIME types
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Extensions (Office formats + plain extension fallback)
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    ];
    return in_array(strtolower($mimeOrExt), $previewable, true);
}
```

### 4. Route Registration

**File:** `routes/web.php` — replace existing share routes:

```php
use App\Http\Controllers\ShareController;

// Replace old /share-link and /share/{file} routes with:

Route::post('/share-link', [ShareController::class, 'generate'])
     ->middleware(['auth', 'verified'])
     ->name('share.generate');

Route::get('/share/{token}', [ShareController::class, 'show'])
     ->name('share.view');
// No auth middleware — public access
```

The old `Route::post('/share-link', ...)` closure (which uses `URL::temporarySignedRoute`) and `Route::get('/share/{file}', ...)` closure are both removed entirely.

### 5. SharePage.jsx

**File:** `resources/js/Pages/SharePage.jsx`

Standalone page — no `AuthenticatedLayout`. Renders CELLAR branding, optional PreviewEmbed, DownloadCard (always visible for non-previewable files), and always a download button.

```jsx
import { Head } from '@inertiajs/react';

/**
 * SharePage — public, unauthenticated file share page.
 *
 * Props (from ShareController@show):
 *   title            — string  File title (shown as heading)
 *   original_filename— string  Original upload filename
 *   file_url         — string  Absolute URL to the file in storage
 *   mime_or_ext      — string  MIME type or file extension
 *   is_previewable   — boolean Whether to show the Google Docs Viewer iframe
 */
export default function SharePage({ title, original_filename, file_url, mime_or_ext, is_previewable }) {
    return (
        <div className="min-h-screen bg-blue-900 flex flex-col">
            <Head title={`${title} — CELLAR`} />

            {/* ── Header / Branding ── */}
            <header className="px-8 py-5 flex items-center gap-4 shrink-0">
                <img
                    src="/CELLAR_logo.png"
                    alt="CELLAR Logo"
                    className="h-10 w-auto object-contain"
                />
                <div>
                    <p className="text-white text-[16px] font-bold leading-tight">CELLAR</p>
                    <p className="text-blue-300 text-[11px]">Information Management System</p>
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col items-center px-4 pb-12 pt-4">

                {/* File title card */}
                <div className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-white text-xl font-bold leading-snug">{title}</h1>
                        <p className="text-blue-300 text-sm mt-0.5">{original_filename}</p>
                    </div>

                    {/* Download button — always visible */}
                    <a
                        href={file_url}
                        download={original_filename}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow"
                    >
                        {/* Download icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>

                {/* ── Preview or fallback ── */}
                <div className="w-full max-w-4xl">
                    {is_previewable ? (
                        <PreviewEmbed fileUrl={file_url} filename={original_filename} />
                    ) : (
                        <DownloadCard filename={original_filename} fileUrl={file_url} />
                    )}
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="text-center text-blue-500 text-xs pb-6 shrink-0">
                © {new Date().getFullYear()} CENTER FOR LANGUAGE-LEARNING AND RESEARCH OF CAVITE STATE UNIVERSITY
            </footer>
        </div>
    );
}

/**
 * PreviewEmbed — Google Docs Viewer iframe for PDF, images, and Office files.
 */
function PreviewEmbed({ fileUrl, filename }) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-white/20">
            <iframe
                src={viewerUrl}
                title={`Preview: ${filename}`}
                className="w-full"
                style={{ minHeight: '650px', height: '75vh', border: 'none' }}
                allowFullScreen
            />
        </div>
    );
}

/**
 * DownloadCard — fallback for non-previewable files.
 * Shows filename and a prominent download button; no preview attempt.
 */
function DownloadCard({ filename, fileUrl }) {
    return (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            {/* File icon */}
            <div className="bg-blue-800 rounded-2xl p-5">
                <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>

            <div>
                <p className="text-white font-semibold text-lg">{filename}</p>
                <p className="text-blue-300 text-sm mt-1">Preview is not available for this file type.</p>
            </div>

            <a
                href={fileUrl}
                download={filename}
                className="flex items-center gap-2 px-7 py-3 bg-white text-blue-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
            </a>
        </div>
    );
}
```

### 6. ShareLinkModal.jsx — Simplified

**File:** `resources/js/Components/ShareLinkModal.jsx`

Remove: `amount` state, `unit` state, `unitMenuOpen` state, `unitMenuRef`, the outside-click effect, the custom unit dropdown, the numeric amount input, the "Token Expiry" label, the `expiryLabel` variable, and the expiry helper text paragraph.

Retain: `generatedUrl`, `loading`, `copied`, `error` states; `handleClose`, `handleGenerate`, `handleCopy` functions; the header with file name, generate button, URL display, copy button, error display.

Updated `handleGenerate`:

```jsx
const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setGeneratedUrl('');
    try {
        const res = await axios.post('/share-link', { file_id: file.id });
        setGeneratedUrl(res.data.url);
    } catch (e) {
        setError(e.response?.data?.message ?? 'Failed to generate link. Please try again.');
    } finally {
        setLoading(false);
    }
};
```

The copy feedback timer remains 2500 ms (satisfies the ≥ 2 second requirement).

---

## Data Models

### `file_shares` table

| Column             | Type         | Constraints                                    |
|--------------------|--------------|------------------------------------------------|
| `id`               | bigint       | PK, auto-increment                             |
| `archive_file_id`  | bigint       | FK → `archive_files.id`, unique, cascade delete|
| `token`            | varchar(36)  | unique, UUID format                            |
| `created_at`       | timestamp    | nullable                                       |
| `updated_at`       | timestamp    | nullable                                       |

### Relationships

- `FileShare` belongs to `ArchiveFile` (via `archive_file_id`)
- `ArchiveFile` may have one `FileShare` (optional; not all files are shared)

No changes are made to the `archive_files` table.

---

## Interfaces

### POST /share-link

**Auth:** Required (`auth`, `verified` middleware)

**Request body:**
```json
{ "file_id": 42 }
```

**Success response (200):**
```json
{ "url": "https://app.example.com/share/550e8400-e29b-41d4-a716-446655440000" }
```

**Error responses:**
- `422` — `file_id` missing or not found in `archive_files`
- `401` — unauthenticated

---

### GET /share/{token}

**Auth:** None

**Success:** Inertia render of `SharePage` with props:
```json
{
  "title": "Research Summary 2025",
  "original_filename": "research_summary_2025.pdf",
  "file_path": "uploads/research_summary_2025.pdf",
  "file_url": "https://app.example.com/storage/uploads/research_summary_2025.pdf",
  "mime_or_ext": "application/pdf",
  "is_previewable": true
}
```

**Error responses:**
- `404` — token not found in `file_shares`

---

## Error Handling

| Scenario | Handling |
|---|---|
| `file_id` missing in POST /share-link | Laravel validation returns 422 JSON with error details |
| `file_id` references non-existent archive file | Laravel validation (`exists:archive_files,id`) returns 422 |
| Token not found in GET /share/{token} | `firstOrFail()` aborts with 404 |
| File missing from disk (storage gap) | SharePage renders normally; iframe/download href will fail gracefully in browser |
| Unauthenticated POST /share-link | Auth middleware returns 401 |
| `axios.post` network failure in ShareLinkModal | `catch` sets `error` state; modal stays open; user sees inline error message |

---

## Previewable Type Detection

The `isPreviewable` helper in `ShareController` uses a flat allowlist approach. MIME types are checked first (when the file is on disk), extensions as fallback (when only `original_filename` is available). This avoids requiring a separate package and keeps the logic transparent.

Allowlist (case-insensitive):

| Category | Values |
|---|---|
| PDF | `application/pdf`, `pdf` |
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `jpg`, `jpeg`, `png`, `gif`, `webp` |
| Office | `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx` |

Google Docs Viewer supports all of the above, including `.ppt`/`.pptx` formats.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Share link generation is idempotent

*For any* valid `ArchiveFile`, calling `POST /share-link` multiple times for the same file always returns the same URL, and exactly one `FileShare` record exists for that file at all times.

**Validates: Requirements 2.2, 1.4**

---

### Property 2: Share URL matches token format

*For any* valid `ArchiveFile`, the URL returned by `POST /share-link` is of the form `{base_url}/share/{uuid}` where the UUID matches the `token` stored in the `FileShare` record for that file.

**Validates: Requirements 2.1, 2.5**

---

### Property 3: Share page returns correct file props

*For any* existing `FileShare` record, a `GET /share/{token}` request renders the Inertia `SharePage` component and includes all four required props — `title`, `original_filename`, `file_path`, and `mime_or_ext` — with values matching the associated `ArchiveFile`.

**Validates: Requirements 4.1, 4.4**

---

### Property 4: File title always appears as heading on SharePage

*For any* file title string, when `SharePage` is rendered with that title as a prop, the title is displayed in a heading element visible to the user.

**Validates: Requirements 5.4**

---

### Property 5: Previewable files always render a Google Docs Viewer iframe

*For any* MIME type or extension that belongs to the previewable allowlist (PDF, common images, Office formats), rendering `SharePage` with `is_previewable=true` produces an `<iframe>` whose `src` contains `docs.google.com/viewer` with the encoded file URL as the `url` query parameter.

**Validates: Requirements 6.1, 6.2**

---

### Property 6: Non-previewable files render DownloadCard without iframe

*For any* MIME type or extension that does not belong to the previewable allowlist, rendering `SharePage` with `is_previewable=false` displays the `DownloadCard` component (including filename and download button) and does not render any `<iframe>` element.

**Validates: Requirements 6.3, 7.1, 7.3**

---

### Property 7: Download button is always present

*For any* file — previewable or not — when `SharePage` is rendered, at least one download button or anchor with a `download` attribute pointing to the file URL is present in the output.

**Validates: Requirements 6.4**

---

### Property 8: ShareLinkModal displays any returned URL in a read-only field

*For any* URL string returned by a successful `POST /share-link` response, the `ShareLinkModal` renders that URL inside a read-only text element that is visible to the user, alongside an active copy-to-clipboard button.

**Validates: Requirements 8.2**

---

### Property 9: ShareLinkModal shows inline error for any failed request

*For any* error response from `POST /share-link` (network error or 4xx/5xx status), the `ShareLinkModal` displays the error message inline within the modal body and the modal remains open (does not close).

**Validates: Requirements 8.5**


---

## Testing Strategy

### Unit / Feature Tests (PHP — PHPUnit)

- **Property 1 (Idempotence):** Generate a seeded `ArchiveFile` with a factory, call the `generate` action twice, assert both calls return the same URL and `FileShare::count()` for that file equals 1.
- **Property 2 (URL format):** For a variety of seeded `ArchiveFile` records, call `generate` and assert the returned URL matches the regex `/\/share\/[0-9a-f-]{36}$/` and that the UUID segment equals `FileShare::where('archive_file_id', …)->value('token')`.
- **Property 3 (Share page props):** For each seeded `FileShare`, call `GET /share/{token}` and assert the Inertia response component is `SharePage` and props contain `title`, `original_filename`, `file_path`, `mime_or_ext`.
- **Edge cases:** 422 on missing/invalid `file_id`; 404 on unknown token; 401 on unauthenticated `POST /share-link`.

### Component Tests (React — Vitest + React Testing Library)

- **Property 4 (Title heading):** Render `SharePage` with varied title props; assert `<h1>` contains the title.
- **Property 5 (Preview iframe):** Render `SharePage` with `is_previewable=true` and varied `file_url`; assert `<iframe>` src contains `docs.google.com/viewer` and the encoded URL; assert `minHeight` ≥ 600px.
- **Property 6 (DownloadCard, no iframe):** Render `SharePage` with `is_previewable=false`; assert no `<iframe>` is rendered and `DownloadCard` is present with filename.
- **Property 7 (Download button invariant):** Render `SharePage` for both previewable and non-previewable files; assert a `download` anchor is always present.
- **Property 8 (Modal URL display):** Mock `axios.post` to return varied URL strings; render `ShareLinkModal`, click Generate; assert URL in read-only field matches mock value.
- **Property 9 (Modal error state):** Mock `axios.post` to reject with varied error messages; render `ShareLinkModal`, click Generate; assert error is shown inline and modal remains mounted.
- **Example (Copy feedback timer):** Click copy button; assert "Copied!" shown; advance fake timers past 2500 ms; assert label reverts.
