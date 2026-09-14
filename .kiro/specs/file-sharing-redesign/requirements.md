# Requirements Document

## Introduction

This feature redesigns the file-sharing system in the CELLAR application. The existing implementation relies on Laravel's `temporarySignedRoute`, which produces expiring URLs tied to a time window. The redesign replaces this with a permanent, token-based sharing model: one stable UUID token per file stored in a dedicated `file_shares` database table, a public share page rendered via Inertia that is fully CELLAR-branded (no authenticated sidebar or nav), and inline file previews for PDF, image, and Office-format documents. The `ShareLinkModal` is simplified by removing all expiry-picker UI while retaining the generate-and-copy flow.

## Glossary

- **ShareController**: New Laravel controller responsible for the `POST /share-link` (authenticated) and `GET /share/{token}` (public) endpoints.
- **FileShare**: New Eloquent model representing a row in the `file_shares` table; belongs to an `ArchiveFile`.
- **file_shares**: New database table with columns `id`, `archive_file_id` (foreign key to `archive_files`), `token` (UUID, unique), `created_at`, `updated_at`.
- **ShareToken**: A UUID string stored in `file_shares.token` that uniquely identifies a public share link for one `ArchiveFile`.
- **SharePage**: The public, unauthenticated Inertia page rendered at `GET /share/{token}`, styled with CELLAR branding and no authenticated sidebar or navigation.
- **PreviewEmbed**: An inline `<iframe>` using Google Docs Viewer (`https://docs.google.com/viewer?url=…&embedded=true`) that renders PDF, image, or Office-format files inside the SharePage.
- **DownloadCard**: The fallback UI element displayed on the SharePage when the file type is not previewable; contains the file name and a download button only.
- **ShareLinkModal**: The existing React modal component (`ShareLinkModal.jsx`) used by authenticated users to generate and copy a share link for a file.
- **ArchiveFile**: The existing Eloquent model representing an uploaded file record in the `archive_files` table.
- **CELLAR Branding**: The application's visual identity — defined colors, fonts, and the CELLAR logo (`/CELLAR_logo.png`) — applied consistently to the SharePage.
- **Previewable Type**: A file whose MIME type or extension falls within: PDF (`application/pdf`), common images (`image/jpeg`, `image/png`, `image/gif`, `image/webp`), or Office-format documents (`.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`).

---

## Requirements

### Requirement 1: Permanent Share Token Storage

**User Story:** As an administrator, I want each shared file to have a single permanent share token stored in the database, so that share links never expire and are not duplicated.

#### Acceptance Criteria

1. THE ShareController SHALL store share tokens in the `file_shares` table with columns `archive_file_id`, `token` (UUID), `created_at`, and `updated_at`.
2. THE FileShare model SHALL declare a `belongsTo(ArchiveFile::class)` relationship.
3. THE `file_shares` table SHALL enforce a unique constraint on the `token` column.
4. THE `file_shares` table SHALL enforce a unique constraint on the `archive_file_id` column so that each `ArchiveFile` has at most one `FileShare` record.

---

### Requirement 2: Share Link Generation Endpoint

**User Story:** As an authenticated user, I want to generate a permanent public share link for a file, so that I can distribute access without worrying about expiry.

#### Acceptance Criteria

1. WHEN an authenticated user sends `POST /share-link` with a valid `file_id`, THE ShareController SHALL upsert a `FileShare` record for that `ArchiveFile` and return a JSON response containing the public share URL.
2. WHEN a `FileShare` record already exists for the given `archive_file_id`, THE ShareController SHALL return the existing `ShareToken` without creating a duplicate record.
3. IF `file_id` is missing or does not correspond to a record in `archive_files`, THEN THE ShareController SHALL return a 422 validation error response.
4. THE `POST /share-link` route SHALL require an authenticated session; unauthenticated requests SHALL receive a 401 response.
5. THE ShareController SHALL construct the public share URL in the format `GET /share/{token}` using the application's base URL.

---

### Requirement 3: Removal of Expiry Logic

**User Story:** As an administrator, I want all expiry-based sharing logic removed from the application, so that the codebase no longer contains references to temporary signed routes for file sharing.

#### Acceptance Criteria

1. THE ShareController SHALL generate share URLs without invoking `URL::temporarySignedRoute` or any other time-bounded signing mechanism.
2. THE `POST /share-link` route handler SHALL accept only `file_id` and SHALL reject any request body fields related to expiry duration (e.g., `amount`, `unit`).
3. THE ShareLinkModal SHALL render no expiry-picker UI elements (numeric input, unit dropdown, or expiry helper text).

---

### Requirement 4: Public Share Page Route

**User Story:** As a guest user, I want to open a public share link and view or download the file without logging in, so that I can access shared content without needing a CELLAR account.

#### Acceptance Criteria

1. WHEN a guest navigates to `GET /share/{token}`, THE ShareController SHALL look up the `FileShare` record by `token` and render the Inertia `SharePage` with the associated `ArchiveFile` data.
2. IF the `token` does not match any record in `file_shares`, THEN THE ShareController SHALL return a 404 response.
3. THE `GET /share/{token}` route SHALL require no authentication; unauthenticated visitors SHALL be able to access the SharePage.
4. THE ShareController SHALL pass at minimum the file's `title`, `original_filename`, `file_path`, and resolved MIME type or extension to the SharePage as Inertia props.

---

### Requirement 5: CELLAR-Branded Standalone Share Page

**User Story:** As a guest user, I want the share page to display CELLAR branding, so that I can trust the source of the shared document.

#### Acceptance Criteria

1. THE SharePage SHALL display the CELLAR logo sourced from `/CELLAR_logo.png`.
2. THE SharePage SHALL apply CELLAR brand colors and fonts consistent with the authenticated application's design system.
3. THE SharePage SHALL render without the authenticated sidebar, top navigation bar, or any other authenticated layout elements.
4. THE SharePage SHALL display the file's `title` as a visible heading.

---

### Requirement 6: Inline File Preview

**User Story:** As a guest user, I want supported files to display inline on the share page, so that I can view documents without downloading them.

#### Acceptance Criteria

1. WHEN the shared file is a Previewable Type, THE SharePage SHALL render a PreviewEmbed using the Google Docs Viewer URL `https://docs.google.com/viewer?url={encodedFileUrl}&embedded=true` inside an `<iframe>`.
2. THE PreviewEmbed `<iframe>` SHALL be given sufficient height (minimum 600px) to make document content readable without scrolling the outer page.
3. WHEN the shared file is not a Previewable Type, THE SharePage SHALL render the DownloadCard instead of the PreviewEmbed.
4. THE SharePage SHALL always display a download button regardless of whether the PreviewEmbed is shown.

---

### Requirement 7: Download Fallback Card

**User Story:** As a guest user, I want a clear download option when a file cannot be previewed, so that I can still access the content.

#### Acceptance Criteria

1. WHEN a file is not a Previewable Type, THE SharePage SHALL render the DownloadCard displaying the file name and a download button.
2. THE DownloadCard SHALL initiate a file download when the download button is activated.
3. THE DownloadCard SHALL not display any preview attempt or placeholder iframe for non-previewable files.

---

### Requirement 8: ShareLinkModal Simplification

**User Story:** As an authenticated user, I want the Share Link modal to be straightforward with no expiry settings, so that generating a permanent link is a one-click action.

#### Acceptance Criteria

1. THE ShareLinkModal SHALL render a "Generate Link" button that calls `POST /share-link` with only the `file_id` of the current file.
2. WHEN the ShareController returns a share URL, THE ShareLinkModal SHALL display the URL in a read-only text field alongside a copy-to-clipboard button.
3. THE ShareLinkModal SHALL display the file name in its header to confirm the target file.
4. THE ShareLinkModal SHALL display a success confirmation state (e.g., "Copied!" label) for a minimum of 2 seconds after the copy button is activated.
5. IF the `POST /share-link` request fails, THEN THE ShareLinkModal SHALL display an inline error message without closing the modal.
