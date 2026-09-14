# Implementation Plan: CELLAR System Overhaul

## Overview

This plan converts the CELLAR IMS overhaul spec into discrete coding tasks ordered from
infrastructure → backend → frontend → integration. Database migrations run first because no
application code can safely reference the new schema until the columns exist. Client Request
removal runs in parallel with migrations since it is purely destructive. Backend controllers
and middleware are built next, then React pages, then route wiring and final integration.

Tasks marked `*` are optional property-based or unit tests — they can be skipped for a faster
MVP but should be run before merging to production.

---

## Tasks

- [ ] 1. Run database migrations — permissions overhaul & client_requests drop
  - [ ] 1.1 Create the permission-flag + critic_summary_reports migration
    - New file: `database/migrations/YYYY_MM_DD_000001_overhaul_users_permissions_and_add_critic_reports.php`
    - Step 1: Add `is_director`, `is_assistant`, `is_staff`, `is_critic` (boolean, default false) and `status` (string, default `'pending'`) to `users`
    - Step 2: Data-migrate existing `role` values to flags using `Schema::hasColumn` guard (director → `is_director=1,status=active`; admin/admin_assistant → `is_assistant=1,status=active`; all others → `status=active`)
    - Step 3: Drop `role` column only if it still exists (`Schema::hasColumn` guard)
    - Step 4: Create `critic_summary_reports` table with all columns per design §Data Models
    - Implement `down()` to reverse all steps
    - Log a warning (not an error) when no `role='director'` row is found
    - _Requirements: 2.1–2.7, 2.10, 3.1–3.5_

  - [ ] 1.2 Create the client_requests table drop migration
    - New file: `database/migrations/YYYY_MM_DD_000002_drop_client_requests_table.php`
    - Use `Schema::dropIfExists('client_requests')` in `up()`
    - Implement `down()` that recreates the table (use the original create migration as reference)
    - _Requirements: 1.6_

- [ ] 2. Remove all Client Request module code
  - [ ] 2.1 Delete Client Request backend files
    - Delete `app/Models/ClientRequest.php`
    - Delete all migration files whose names include `client_requests` (seven files, see database/migrations/)
    - _Requirements: 1.2_

  - [ ] 2.2 Delete Client Request frontend pages
    - Delete `resources/js/Pages/ClientRequestForm.jsx`
    - Delete `resources/js/Pages/ClientRequestSuccess.jsx`
    - Delete `resources/js/Pages/RequestManagement.jsx` (if it exists)
    - _Requirements: 1.3_

  - [ ] 2.3 Delete Client Request email template
    - Delete `resources/views/emails/client-request-confirmation.blade.php` (if it exists)
    - _Requirements: 1.4_

  - [ ] 2.4 Remove Client Request routes from `routes/web.php`
    - Remove `GET /request`, `POST /request` (client-request.submit), `GET /request/success`, `GET /requests`, `PATCH /requests/{id}/review`, `GET /requests/analytics` route definitions
    - Remove inline `ClientRequest` model usages from the dashboard route closure (`requestsThisMonth` stat) and from any other route closures
    - _Requirements: 1.1, 1.7_

- [ ] 3. Update `User` model and create `CriticSummaryReport` model
  - [ ] 3.1 Update the `User` Eloquent model
    - Replace `role` with `is_director`, `is_assistant`, `is_staff`, `is_critic`, `status` in `$fillable`
    - Add `$casts` for the four boolean flags (`'is_director' => 'boolean'`, etc.)
    - Remove any `role`-based accessor, method, or reference
    - Add `criticSummaryReports(): HasMany` relationship
    - _Requirements: 2.8, 12.3_

  - [ ] 3.2 Create the `CriticSummaryReport` Eloquent model
    - New file: `app/Models/CriticSummaryReport.php`
    - `$fillable = ['user_id', 'document_title', 'document_type', 'page_count', 'cost', 'or_number']`
    - Add `user(): BelongsTo` relationship to `User`
    - _Requirements: 2.9_

- [ ] 4. Build backend middleware
  - [ ] 4.1 Create `EnsureAccountIsActive` middleware
    - New file: `app/Http/Middleware/EnsureAccountIsActive.php`
    - Implement `handle()` per design §1 — Directors bypass, pending → logout + redirect with message, deactivated → logout + redirect with message
    - _Requirements: 6.1–6.5_

  - [ ] 4.2 Register middleware aliases and apply to route groups in `bootstrap/app.php`
    - Register aliases `active`, `director`, `dms`, `critic` per design §Route Groups table
    - Ensure `active` middleware is applied after `auth` for all authenticated route groups
    - _Requirements: 6.4_

- [ ] 5. Update `HandleInertiaRequests` middleware and login controller
  - [ ] 5.1 Update `HandleInertiaRequests::share()` to expose boolean flags
    - Replace `user.role` with `is_director`, `is_assistant`, `is_staff`, `is_critic`, `status` in the shared `auth` array per design §2
    - _Requirements: 7.4_

  - [ ] 5.2 Update `AuthenticatedSessionController::store()` for status-blocked login
    - After `$request->authenticate()` succeeds, check `status` for pending/deactivated (non-director) and throw `ValidationException` with exact messages per design §4
    - Add role-based post-login redirect: critics → `critic.report.create`, others → dashboard
    - _Requirements: 4.5, 4.6_

- [ ] 6. Build Auth controllers — Critic registration
  - [ ] 6.1 Create `CriticRegisterController`
    - New file: `app/Http/Controllers/Auth/CriticRegisterController.php`
    - `create()` → renders `Auth/CriticRegister` Inertia page
    - `store()` → validates name, email (unique, `@cvsu.edu.ph` domain rule), password; creates user with `is_critic=true, status='pending'`; does NOT call `Auth::login()`; renders `Auth/CriticRegisterSuccess`
    - Wrap `User::create()` in a try-catch to prevent partial records
    - _Requirements: 4.1–4.4, 4.8, 4.9_

- [ ] 7. Build core backend feature controllers
  - [ ] 7.1 Create `CriticReportController`
    - New file: `app/Http/Controllers/CriticReportController.php`
    - `create()` → renders `SubmitSummaryReport` with the authenticated critic's own reports ordered by `created_at desc`
    - `store()` → validates all fields per design §5 and saves `CriticSummaryReport` with `user_id = auth()->id()`; redirects back with success flash
    - `index()` → renders `CriticSummaryReports` with all reports eager-loaded with user; accepts `college` and `department` query params via `when()`; computes total count, total cost, average cost
    - _Requirements: 8.1–8.7, 9.1–9.6_

  - [ ] 7.2 Create `AccountManagementController`
    - New file: `app/Http/Controllers/AccountManagementController.php`
    - `index()` → maps users with derived `role_label` per priority order and passes to `AccountManagement` Inertia page
    - `updateStatus()` → guards self-modification (403); only Director can deactivate; Assistants can only approve; validates status is `active` or `deactivated`
    - `resetPassword()` → validates password min:8, hashes and saves
    - _Requirements: 5.1–5.5, 11.1–11.7_

  - [ ] 7.3 Create `OwnershipTransferController`
    - New file: `app/Http/Controllers/OwnershipTransferController.php`
    - `transfer()` → validates `target_user_id` (exists, not self, not already director); verifies password via `Hash::check`; wraps both flag updates in `DB::transaction()`; invalidates session and redirects to login on success; rolls back and returns 500 on exception
    - _Requirements: 10.1–10.9_

  - [ ]* 7.4 Write property tests for status blocking (Properties 3, 4, 5, 6)
    - **Property 3: Pending users are blocked at login** — Validates: Requirements 4.5, 6.2
    - **Property 4: Deactivated users are blocked at login** — Validates: Requirements 4.6, 6.3
    - **Property 5: Non-active non-director users blocked on all authenticated routes** — Validates: Requirements 6.1–6.3, 4.7
    - **Property 6: Director bypasses account status enforcement** — Validates: Requirements 6.5
    - Use Eris `forAll()` with 100+ iterations; generate random users with combinatorial flag/status values

  - [ ]* 7.5 Write property tests for route authorization gates (Properties 7, 8, 9, 20)
    - **Property 7: Critic users cannot access DMS routes** — Validates: Requirements 7.6
    - **Property 8: Non-director users cannot access director-exclusive routes** — Validates: Requirements 7.5, 9.1, 10.1
    - **Property 9: Submit Summary Report is accessible only to active critics** — Validates: Requirements 8.1
    - **Property 20: Non-director/non-assistant users cannot access Account Management** — Validates: Requirements 11.1

- [ ] 8. Checkpoint — all backend tests must pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Update routes in `routes/web.php`
  - [ ] 9.1 Restructure authenticated route groups with correct middleware
    - Wrap DMS routes (dashboard, documents, links, bin, favorites, search) in `auth + verified + active + dms` group
    - Add critic route group `auth + verified + active + critic`: `GET/POST /submit-report`
    - Add director route group `auth + verified + active + director`: `GET /critic-reports`, `GET /account-management`, `POST /account-management/users/{id}/status`, `POST /account-management/users/{id}/reset-password`, `POST /account-management/transfer-ownership`
    - Add director-or-assistant group: `POST /account-management/users/{id}/approve`, `POST /account-management/users/{id}/deactivate`
    - Remove old `/security` and all `/security/*` routes
    - Remove old `/request*` and `/requests*` routes (if not already done in task 2.4)
    - Add guest routes: `GET /register/critic`, `POST /register/critic`
    - _Requirements: 1.1, 7.5, 7.6, 8.1, 9.1, 10.1, 11.1_

  - [ ] 9.2 Update `dashboard` route closure to remove `ClientRequest` reference
    - Remove `requestsThisMonth` stat and its `ClientRequest` query from the dashboard route
    - Update the `Inertia::render('Dashboard', [...])` props array accordingly
    - _Requirements: 1.7, 1.8_

- [ ] 10. Build React frontend — Auth pages
  - [ ] 10.1 Create `Auth/CriticRegister.jsx`
    - Public page at `/register/critic`
    - Form fields: Name, Email (with `@cvsu.edu.ph` hint), Password, Confirm Password
    - Use `useForm` from `@inertiajs/react`; display field-level validation errors
    - _Requirements: 4.1_

  - [ ] 10.2 Create `Auth/CriticRegisterSuccess.jsx`
    - Static confirmation page: pending-approval message, link back to `/login`
    - _Requirements: 4.9_

- [ ] 11. Build React frontend — Critic pages
  - [ ] 11.1 Create `SubmitSummaryReport.jsx`
    - Two-panel layout: left = submission form, right/bottom = personal history table
    - Form fields per requirements §8.2: Document Title, Document Type (select with exact 6 options), Page Count (integer, min 1), Cost (decimal, min 0), OR Number
    - History table columns: Document Title, Document Type, Page Count, Cost, OR Number, Date Submitted; ordered most-recent-first
    - On success, Inertia redirect reloads page with new record prepended
    - Display field-level validation errors per §8.7
    - _Requirements: 8.1–8.7_

  - [ ]* 11.2 Write property tests for critic submission validation (Properties 10, 11, 12)
    - **Property 10: Valid critic submissions always set user_id to authenticated critic** — Validates: Requirements 8.4
    - **Property 11: Invalid submissions do not create database records** — Validates: Requirements 8.7, 8.3
    - **Property 12: Document type validation accepts exactly the specified values** — Validates: Requirements 8.3

- [ ] 12. Build React frontend — Director pages
  - [ ] 12.1 Create `CriticSummaryReports.jsx`
    - Full-width table: Critic Name, Document Title, Document Type, Page Count, Cost, OR Number, Date Submitted
    - College and department filter dropdowns (default "All"); use `router.get()` on change with `preserveScroll: true`
    - Aggregate stats bar: total submissions, total cost, average cost; handle zero-record empty state message
    - _Requirements: 9.1–9.6_

  - [ ]* 12.2 Write property tests for report filtering and aggregates (Properties 13, 14, 15)
    - **Property 13: Critic's history page shows only their own records** — Validates: Requirements 8.5
    - **Property 14: Filter results match applied filters (AND condition)** — Validates: Requirements 9.4
    - **Property 15: Aggregate statistics are consistent with visible records** — Validates: Requirements 9.6

  - [ ] 12.3 Create `AccountManagement.jsx` (replaces `Security.jsx`)
    - Full user list table: Name, Email, Role Label, Status, registration date
    - Pending Approvals panel section with [APPROVE] and [DEACTIVATE] buttons
    - Status changes use `router.post()` with `preserveScroll: true` so the pending list updates without full reload
    - Director-only controls: Reset Password (modal with min-8 password field), Transfer Ownership button
    - Transfer Ownership modal: exact text "Are you sure you want to permanently transfer system ownership?" + password input
    - Conditional rendering: Assistants see approve/deactivate only; Directors see all controls
    - Prevent Director from selecting themselves as transfer target (disable button / show error)
    - _Requirements: 5.1–5.5, 10.1–10.9, 11.1–11.8_

  - [ ]* 12.4 Write property tests for ownership transfer (Properties 16, 17)
    - **Property 16: Incorrect password on ownership transfer prevents any DB changes** — Validates: Requirements 10.3, 10.4
    - **Property 17: Ownership transfer is atomic — both users updated or neither is** — Validates: Requirements 10.5, 10.7

- [ ] 13. Update `AuthenticatedLayout.jsx` — conditional nav and role label
  - [ ] 13.1 Implement role-based conditional navigation
    - Read `is_director`, `is_assistant`, `is_staff`, `is_critic` from `usePage().props.auth`
    - Derive `isDms = is_director || is_assistant || is_staff`
    - If `is_critic && !isDms`: render only "Submit Summary Report" nav item
    - If `isDms`: render Workspace group (Dashboard, Documents, Links, Search) + Library group (Bookmarks, Bin)
    - If `is_director`: additionally render Management group (Account Management link → `/account-management`, Critic Summary Reports link → `/critic-reports`)
    - Remove the "Client Requests" nav item entirely
    - _Requirements: 7.1–7.4, 1.5, 1.8_

  - [ ] 13.2 Replace `user.role` with derived role label in header dropdown
    - Use the `role_label` prop passed from `AccountManagementController::index()` or derive inline from auth flags using the same priority order (Director > Assistant > Staff > Critic > Unassigned)
    - Remove the `{user.role}` reference in the Dropdown.Trigger span
    - _Requirements: 11.8_

  - [ ]* 13.3 Write property test for role label derivation (Property 18)
    - **Property 18: Role Label derivation follows exact priority order** — Validates: Requirements 11.8
    - Test all 16 combinations of the four boolean flags

- [ ] 14. Update database seeders and factories
  - [ ] 14.1 Update `UserFactory` to use new permission flags
    - Remove `role` field from factory default state
    - Add `is_director`, `is_assistant`, `is_staff`, `is_critic` (all default false) and `status` (default `'active'`) to factory definition
    - _Requirements: 12.3_

  - [ ] 14.2 Update `DatabaseSeeder` to seed valid flag-based users
    - Create at least one user with `is_director = true, status = 'active'`
    - Create at least one user with a non-director flag (`is_assistant`, `is_staff`, or `is_critic`) and `status = 'active'`
    - Remove all references to `role` column and `ClientRequest` model
    - _Requirements: 12.1, 12.2, 12.4_

- [ ] 15. Build remaining property-based tests
  - [ ]* 15.1 Write property tests for critic registration (Properties 1, 2)
    - **Property 1: Critic registration enforces domain restriction** — Validates: Requirements 4.2, 4.3
    - **Property 2: Successful critic registration sets correct flags** — Validates: Requirements 4.4
    - Use Eris to generate random email strings and verify accept/reject behaviour

  - [ ]* 15.2 Write property test for password reset (Property 19)
    - **Property 19: Password reset stores verifiable hash** — Validates: Requirements 11.7
    - For any password string of length ≥ 8, verify `Hash::check(submitted, stored) === true` after reset

- [ ] 16. Checkpoint — full test suite must pass
  - Ensure all tests pass (including optional property tests if run), ask the user if questions arise.

- [ ] 17. Delete legacy `Security.jsx` page
  - [ ] 17.1 Remove `Security.jsx` and verify no remaining references
    - Delete `resources/js/Pages/Security.jsx`
    - Search for any remaining `import Security` or `route('security')` references in JS files and remove them
    - _Requirements: 11.1 (Account Management replaces Security)_

- [ ] 18. Final checkpoint — compile assets and verify routes
  - [ ] 18.1 Run `npm run build` and confirm zero errors
    - Ensure Vite compiles without warnings about removed components or undefined routes
  - [ ] 18.2 Run `php artisan route:list` and confirm removed routes are gone, new routes are present
    - Verify no `client-request.*`, `requests.*`, or `security` routes appear in the list
    - Verify `register/critic`, `submit-report`, `critic-reports`, `account-management`, and `transfer-ownership` routes are present
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based or unit tests and can be skipped for a faster MVP.
- Tasks 1 and 2 can be worked in parallel — migrations touch the DB schema, CRF removal touches files.
- Tasks 3–5 depend on task 1 completing (User model references new columns).
- Tasks 6–7 depend on tasks 3–5 (controllers use the updated model and middleware).
- Tasks 10–13 depend on tasks 6–9 (frontend pages need routes and controllers in place).
- Task 17 must come after task 13 (the layout must already reference `account-management` before Security.jsx is deleted).
- All Eris property tests require PHPUnit and the `giorgiosironi/eris` Composer package (minimum 100 iterations per property).
- The `active` middleware alias must be registered (task 4.2) before any route-level middleware tests are run.
- SQLite-compatible syntax only — no MySQL-specific constructs in any migration.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["2.4", "3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "4.2", "5.1", "5.2", "14.1", "14.2"] },
    { "id": 3, "tasks": ["6.1", "7.1", "7.2", "7.3"] },
    { "id": 4, "tasks": ["7.4", "7.5", "9.1", "9.2"] },
    { "id": 5, "tasks": ["10.1", "10.2", "11.1", "12.1", "12.3", "15.1", "15.2"] },
    { "id": 6, "tasks": ["11.2", "12.2", "12.4", "13.1", "13.2"] },
    { "id": 7, "tasks": ["13.3", "17.1"] },
    { "id": 8, "tasks": ["18.1", "18.2"] }
  ]
}
```
