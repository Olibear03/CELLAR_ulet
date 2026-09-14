# Implementation Plan: File Sharing Redesign

## Overview

Replace the existing `temporarySignedRoute`-based file sharing with a permanent, token-based system. This involves a new database migration, a `FileShare` Eloquent model, a `ShareController` with two endpoints, a new public `SharePage.jsx`, and a simplified `ShareLinkModal.jsx`. Old expiry logic is removed entirely.

## Tasks

- [x] 1. Database migration and FileShare model
  - [x] 1.1 Create the `file_shares` migration
    - Create `database/migrations/YYYY_MM_DD_HHMMSS_create_file_shares_table.php`
    - Define columns: `id`, `archive_file_id` (unique FK → `archive_files`, cascade delete), `token` (UUID, unique), `timestamps`
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 1.2 Create the `FileShare` Eloquent model
    - Create `app/Models/FileShare.php` with `$fillable`, `booted()` UUID auto-generation hook, and `archiveFile()` `belongsTo` relationship
    - _Requirements: 1.2_

  - [ ]* 1.3 Write property test for idempotent share generation (Property 1)
    - **Property 1: Share link generation is idempotent**
    - Seed an `ArchiveFile` via factory, call `generate` twice, assert identical URL returned and `FileShare::count()` for that file equals 1
    - **Validates: Requirements 2.2, 1.4**

  - [ ]* 1.4 Write property test for share URL token format (Property 2)
    - **Property 2: Share URL matches token format**
    - For varied `ArchiveFile` seeds, assert the returned URL matches `/\/share\/[0-9a-f-]{36}$/` and the UUID segment equals `FileShare::where('archive_file_id', …)->value('token')`
    - **Validates: Requirements 2.1, 2.5**

- [x] 2. ShareController — generate endpoint
  - [x] 2.1 Implement `ShareController@generate` (POST /share-link)
    - Create `app/Http/Controllers/ShareController.php`
    - Validate `file_id` (required, exists in `archive_files`); reject any expiry-related fields
    - Use `FileShare::firstOrCreate(['archive_file_id' => $request->file_id])` with lazy token assignment guard
    - Return `response()->json(['url' => url("/share/{$share->token}")])` 
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2_

  - [ ]* 2.2 Write feature tests for generate endpoint edge cases
    - Test 422 on missing `file_id`; 422 on non-existent `file_id`; 401 on unauthenticated request
    - _Requirements: 2.3, 2.4_

- [x] 3. ShareController — show endpoint
  - [x] 3.1 Implement `ShareController@show` (GET /share/{token})
    - Add `show(string $token)` method to `ShareController`
    - Look up `FileShare::with('archiveFile')->where('token', $token)->firstOrFail()` (404 on miss)
    - Implement private `resolveMimeOrExtension(ArchiveFile $file)` helper (disk MIME → extension fallback)
    - Implement private `isPreviewable(string $mimeOrExt)` helper using the flat allowlist
    - Return `Inertia::render('SharePage', [...])` with all required props
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 3.2 Write property test for share page props (Property 3)
    - **Property 3: Share page returns correct file props**
    - For each seeded `FileShare`, call `GET /share/{token}` and assert Inertia component is `SharePage` and all four required props (`title`, `original_filename`, `file_path`, `mime_or_ext`) match the associated `ArchiveFile`
    - **Validates: Requirements 4.1, 4.4**

- [x] 4. Route registration and cleanup
  - [x] 4.1 Register new routes and remove old share routes in `routes/web.php`
    - Add `Route::post('/share-link', [ShareController::class, 'generate'])->middleware(['auth', 'verified'])->name('share.generate')`
    - Add `Route::get('/share/{token}', [ShareController::class, 'show'])->name('share.view')`
    - Remove old `POST /share-link` closure (uses `URL::temporarySignedRoute`) and old `GET /share/{file}` closure
    - _Requirements: 2.4, 3.1, 4.3_

- [x] 5. Checkpoint — backend complete
  - Ensure all backend tests pass, run `php artisan migrate` to verify migration, ask the user if questions arise.

- [x] 6. SharePage.jsx — standalone public page
  - [x] 6.1 Create `resources/js/Pages/SharePage.jsx`
    - Standalone layout — no `AuthenticatedLayout`, no sidebar or top nav
    - Render CELLAR-branded header with `/CELLAR_logo.png`, brand colors (`bg-blue-900`), and fonts consistent with the app's design system
    - Display file `title` as `<h1>` heading and `original_filename` as subtitle
    - Always render a download `<a download>` anchor pointing to `file_url`
    - Conditionally render `<PreviewEmbed>` when `is_previewable` is true, otherwise render `<DownloadCard>`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.4_

  - [x] 6.2 Implement `PreviewEmbed` sub-component inside `SharePage.jsx`
    - Build Google Docs Viewer URL: `https://docs.google.com/viewer?url={encodeURIComponent(fileUrl)}&embedded=true`
    - Render `<iframe>` with `minHeight: 650px`, `height: 75vh`, `border: none`, and `allowFullScreen`
    - _Requirements: 6.1, 6.2_

  - [x] 6.3 Implement `DownloadCard` sub-component inside `SharePage.jsx`
    - Show file icon, filename, and a prominent download `<a download>` anchor
    - Do not render any `<iframe>` or preview placeholder
    - _Requirements: 6.3, 7.1, 7.2, 7.3_

  - [ ]* 6.4 Write property test: file title always appears as heading (Property 4)
    - **Property 4: File title always appears as heading on SharePage**
    - Render `SharePage` with varied title prop strings; assert `<h1>` contains the title text
    - **Validates: Requirements 5.4**

  - [ ]* 6.5 Write property test: previewable files render Google Docs Viewer iframe (Property 5)
    - **Property 5: Previewable files always render a Google Docs Viewer iframe**
    - Render `SharePage` with `is_previewable=true` and varied `file_url` strings; assert `<iframe>` `src` contains `docs.google.com/viewer` and encoded file URL; assert computed `minHeight` ≥ 600px
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 6.6 Write property test: non-previewable files render DownloadCard without iframe (Property 6)
    - **Property 6: Non-previewable files render DownloadCard without iframe**
    - Render `SharePage` with `is_previewable=false`; assert no `<iframe>` in output and `DownloadCard` is present with correct filename
    - **Validates: Requirements 6.3, 7.1, 7.3**

  - [ ]* 6.7 Write property test: download button always present (Property 7)
    - **Property 7: Download button is always present**
    - Render `SharePage` for both `is_previewable=true` and `is_previewable=false`; assert a `<a download>` anchor pointing to `file_url` is always in the output
    - **Validates: Requirements 6.4**

- [x] 7. Checkpoint — SharePage complete
  - Ensure all SharePage component tests pass, ask the user if questions arise.

- [x] 8. ShareLinkModal.jsx — simplification
  - [x] 8.1 Simplify `resources/js/Components/ShareLinkModal.jsx`
    - Remove: `amount` state, `unit` state, `unitMenuOpen` state, `unitMenuRef`, outside-click effect, custom unit dropdown, numeric amount input, "Token Expiry" label, `expiryLabel` variable, and expiry helper text paragraph
    - Retain: `generatedUrl`, `loading`, `copied`, `error` states; `handleClose`, `handleGenerate`, `handleCopy` functions; header with file name, generate button, URL display, copy button, error display
    - Update `handleGenerate` to post `{ file_id: file.id }` only (no expiry fields)
    - Keep copy feedback timer at 2500 ms
    - _Requirements: 3.3, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 8.2 Write property test: modal displays any returned URL in read-only field (Property 8)
    - **Property 8: ShareLinkModal displays any returned URL in a read-only field**
    - Mock `axios.post` to return varied URL strings; render `ShareLinkModal`, click Generate; assert URL appears in a read-only text element and copy button is active
    - **Validates: Requirements 8.2**

  - [ ]* 8.3 Write property test: modal shows inline error for any failed request (Property 9)
    - **Property 9: ShareLinkModal shows inline error for any failed request**
    - Mock `axios.post` to reject with varied error messages (network error, 422, 401); render `ShareLinkModal`, click Generate; assert error is displayed inline and modal stays mounted
    - **Validates: Requirements 8.5**

  - [ ]* 8.4 Write example test: copy feedback timer resets after 2500 ms
    - Click copy button; assert "Copied!" is shown; advance fake timers past 2500 ms; assert label reverts to normal
    - _Requirements: 8.4_

- [x] 9. Final checkpoint — full integration
  - Ensure all tests pass (PHP and JS), verify routes are clean with no references to `temporarySignedRoute` in share logic, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints validate incremental progress before moving to the next layer
- Property tests (Properties 1–9) map directly to the Correctness Properties section in the design document
- PHP tests use PHPUnit feature tests; JS tests use Vitest + React Testing Library
- Run `php artisan migrate` after task 1.1 to apply the `file_shares` table before testing backend tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "1.3", "1.4"] },
    { "id": 3, "tasks": ["2.2", "3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3", "8.1"] },
    { "id": 7, "tasks": ["6.4", "6.5", "6.6", "6.7", "8.2", "8.3", "8.4"] }
  ]
}
```
