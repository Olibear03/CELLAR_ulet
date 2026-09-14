# Requirements Document

## Introduction

This document describes the requirements for a comprehensive overhaul of the CELLAR (Center for Language-Learning and Research) information management system built on Laravel 11, Inertia.js, React 18, and Tailwind CSS.

The overhaul involves five major areas: (1) removing the legacy Client Request Form module, (2) replacing the single-column role system with granular boolean permission flags, (3) introducing self-registration for external university critics with a pending-approval workflow, (4) redesigning the frontend UI with role-based navigation and a new Critic Summary Reports module, and (5) implementing a high-security ownership transfer mechanism for the Director account.

## Glossary

- **System**: The CELLAR Laravel + Inertia.js + React application.
- **Director**: The single user with `is_director = true`; highest-privilege account with exclusive access to analytics and ownership transfer.
- **Assistant**: A user with `is_assistant = true`; handles day-to-day CELLAR office operations.
- **Staff**: A user with `is_staff = true`; internal data processor with DMS access.
- **Critic**: A user with `is_critic = true`; external university professor or critic who can submit summary reports.
- **DMS**: Document Management System — the Documents, Links, Bin, Favorites, Search, and Dashboard pages.
- **Pending User**: A user whose `status` is `'pending'`; blocked from accessing the system until approved.
- **Active User**: A user whose `status` is `'active'`; allowed to access the system.
- **Deactivated User**: A user whose `status` is `'deactivated'`; blocked from accessing the system.
- **Critic Summary Report**: A record submitted by a Critic capturing document review details including title, type, page count, cost, and official receipt number.
- **Ownership Transfer**: The high-security operation of passing Director privileges from the current Director to another user.
- **OR Number**: Official Receipt number used in Critic Summary Reports for payment tracking.
- **Permission Flag**: A boolean column on the users table (`is_director`, `is_assistant`, `is_staff`, `is_critic`) that controls access.

---

## Requirements

### Requirement 1: Remove Client Request Form Module

**User Story:** As a system administrator, I want all Client Request Form functionality removed from the system, so that the codebase is clean and no dead code or broken references exist.

#### Acceptance Criteria

1. THE System SHALL remove all routes associated with the Client Request Form module, specifically: `GET /request`, `POST /request` (`client-request.submit`), `GET /request/success`, `GET /requests`, `PATCH /requests/{id}/review`, and `GET /requests/analytics`.
2. THE System SHALL remove the `ClientRequest` Eloquent model (`app/Models/ClientRequest.php`) and all associated migration files whose names include `client_requests` from the codebase.
3. THE System SHALL remove the React pages `ClientRequestForm.jsx`, `ClientRequestSuccess.jsx`, and `RequestManagement.jsx` from `resources/js/Pages/`.
4. THE System SHALL remove the email template `emails/client-request-confirmation.blade.php` from `resources/views/emails/`.
5. THE System SHALL remove the "Client Requests" sidebar link and any related navigation references from `AuthenticatedLayout.jsx`.
6. THE System SHALL drop the `client_requests` database table via a dedicated migration so that no future queries against it are possible.
7. THE System SHALL remove or update all references to `ClientRequest` in route closures (e.g., `web.php` dashboard route), controllers, seeders, factories, and test files so that no undefined-class or broken-import errors occur at runtime.
8. THE System SHALL remove any `ClientRequest`-related props, route calls, or links from `Welcome.jsx`, `Dashboard.jsx`, and `AuthenticatedLayout.jsx` so that no undefined route or undefined prop references remain in those components.

---

### Requirement 2: Permission Flag Database Migration

**User Story:** As a system architect, I want the user permission model migrated from a single `role` string column to discrete boolean permission flags, so that each role's access can be independently controlled and multiple flags can coexist.

#### Acceptance Criteria

1. THE System SHALL create a new migration that (a) migrates existing `role` data to the new boolean flags and (b) drops the `role` column from the `users` table; IF the `role` column does not exist at migration time, THE migration SHALL skip the drop step without error.
2. THE System SHALL add an `is_director` boolean column (default `false`) to the `users` table.
3. THE System SHALL add an `is_assistant` boolean column (default `false`) to the `users` table.
4. THE System SHALL add an `is_staff` boolean column (default `false`) to the `users` table.
5. THE System SHALL add an `is_critic` boolean column (default `false`) to the `users` table.
6. THE System SHALL add a `status` string column (default `'pending'`) to the `users` table; the application layer SHALL enforce that only the values `'pending'`, `'active'`, and `'deactivated'` are written to this column on every write operation.
7. THE System SHALL create a new `critic_summary_reports` table with columns: `id` (auto-increment primary key), `user_id` (foreign key to `users.id`, cascade on delete), `document_title` (string, not null), `document_type` (string, not null), `page_count` (integer, not null), `cost` (decimal 10,2, not null), `or_number` (string, not null), and standard `created_at`/`updated_at` timestamps.
8. THE `User` Model SHALL list `is_director`, `is_assistant`, `is_staff`, `is_critic`, and `status` in its `$fillable` array and SHALL NOT include `role` in `$fillable`.
9. THE System SHALL create a `CriticSummaryReport` Eloquent model with `$fillable = ['user_id', 'document_title', 'document_type', 'page_count', 'cost', 'or_number']` and a `belongsTo(User::class)` relationship.
10. THE migration SHALL migrate existing `role` data before dropping the column: users with `role = 'director'` SHALL be set to `is_director = true`, `status = 'active'`; users with `role = 'admin'` or `role = 'admin_assistant'` SHALL be set to `is_assistant = true`, `status = 'active'`; all other existing users SHALL be set to `status = 'active'`.

---

### Requirement 3: Existing Director Account Migration

**User Story:** As a system operator, I want the existing director account migrated to the new permission flag schema, so that the Director retains full access after the migration without manual intervention.

#### Acceptance Criteria

1. WHEN the new permission flag migration runs, THE System SHALL update the existing user with `role = 'director'` to have `is_director = true` and `status = 'active'`.
2. WHEN the new permission flag migration runs, THE System SHALL update all users with `role = 'admin'` or `role = 'admin_assistant'` to have `is_assistant = true` and `status = 'active'`.
3. IF no user with `role = 'director'` exists at migration time, THEN THE System SHALL log a warning but SHALL NOT fail the migration.
4. IF the process of converting an existing Director record to `is_director = true` fails during migration, THEN THE System SHALL log an error message identifying the failure and SHALL NOT fail the entire migration.
5. IF the migration is run more than once (idempotency), THEN THE System SHALL NOT overwrite already-migrated users whose `role` column has already been dropped; the migration SHALL detect the absence of the `role` column and skip the data-migration step without error.

---

### Requirement 4: Critic Self-Registration

**User Story:** As an external university professor, I want to register for a CELLAR account using my university email, so that I can submit critic summary reports without needing an administrator to create my account manually.

#### Acceptance Criteria

1. THE System SHALL provide a public registration page accessible without authentication.
2. WHEN a user submits the registration form, THE System SHALL validate that the email address ends with `@cvsu.edu.ph`.
3. IF the submitted email does not end with `@cvsu.edu.ph`, THEN THE System SHALL reject the registration and display the error message "Only @cvsu.edu.ph email addresses are permitted to register."
4. WHEN a valid registration is submitted, THE System SHALL create the user record with `is_critic = true` and `status = 'pending'`; IF the database write fails for any reason, no partial user record SHALL be left in the database.
5. WHEN a user with `status = 'pending'` attempts to log in, THE System SHALL block access and display the message "Your account is pending approval. Please wait for an administrator to activate your account."
6. WHEN a user with `status = 'deactivated'` attempts to log in, THE System SHALL block access and display the message "Your account has been deactivated. Please contact the administrator."
7. WHEN a Critic user with `status != 'active'` makes any authenticated request to a Critic-specific route, THE System SHALL return a 403 response and terminate the session.
8. IF the submitted email already exists in the `users` table, THEN THE System SHALL reject the registration and display the error "The email address has already been taken."
9. WHEN registration completes successfully, THE System SHALL display a confirmation message informing the user that their account is pending approval.

---

### Requirement 5: Pending Approvals Panel

**User Story:** As a Director or Admin Assistant, I want to see a list of users awaiting approval, so that I can grant or deny system access to newly registered critics.

#### Acceptance Criteria

1. THE System SHALL display a Pending Approvals panel that is visible only to users with `is_director = true` or `is_assistant = true`.
2. WHEN the Pending Approvals panel is loaded, THE System SHALL display all users where `status = 'pending'`.
3. WHEN the Director or Assistant clicks the [APPROVE] button for a pending user, THE System SHALL set that user's `status` to `'active'`.
4. WHEN the Director or Assistant clicks the [DEACTIVATE] button for a pending user, THE System SHALL set that user's `status` to `'deactivated'`.
5. WHEN a user's status changes via the Pending Approvals panel, THE System SHALL remove that user from the displayed pending list immediately upon server confirmation, without requiring a full page reload.

---

### Requirement 6: Account Status Enforcement

**User Story:** As a system administrator, I want only active users to be able to use the system, so that pending and deactivated accounts cannot access protected resources.

#### Acceptance Criteria

1. WHEN any authenticated request is made by a non-Director user, THE System SHALL verify that the authenticated user has `status = 'active'`.
2. IF the authenticated user has `status = 'pending'`, THEN THE System SHALL terminate the session and redirect to the login page with the message "Your account is pending approval."
3. IF the authenticated user has `status = 'deactivated'`, THEN THE System SHALL terminate the session and redirect to the login page with the message "Your account has been deactivated."
4. THE System SHALL enforce the status check via a named middleware (e.g., `EnsureAccountIsActive`) applied globally to all authenticated routes.
5. WHEN the authenticated user has `is_director = true`, THE System SHALL bypass the status check entirely and allow the request to proceed regardless of the `status` column value.

---

### Requirement 7: Role-Based Navigation and UI Access Control

**User Story:** As a system designer, I want each role to see only the navigation items and pages relevant to their permissions, so that users are not exposed to functionality outside their access level.

#### Acceptance Criteria

1. WHEN a user with `is_critic = true` is authenticated, THE System SHALL display ONLY the "Submit Summary Report" navigation item and SHALL NOT render any DMS navigation items (Documents, Links, Bin, Favorites, Search, Dashboard).
2. WHEN a user with `is_assistant = true` or `is_staff = true` is authenticated, THE System SHALL display the core DMS navigation (Dashboard, Documents, Links, Bookmarks, Bin, Search) and SHALL NOT display any Director-exclusive navigation items (Account Management, Critic Summary Reports, Transfer Ownership).
3. WHEN a user with `is_director = true` is authenticated, THE System SHALL display the core DMS navigation plus "Account Management" and "Critic Summary Reports" navigation items.
4. THE `AuthenticatedLayout` component SHALL conditionally render navigation items based on the authenticated user's permission flags (`is_director`, `is_assistant`, `is_staff`, `is_critic`) passed via Inertia shared props from `HandleInertiaRequests` middleware.
5. IF a user without `is_director = true` sends a request to a Director-exclusive route, THEN THE System SHALL return HTTP 403 and SHALL write a log entry containing the user ID, attempted route, and UTC timestamp.
6. IF a user with `is_critic = true` sends a request to any DMS route, THEN THE System SHALL return HTTP 403.

---

### Requirement 8: Submit Summary Report (Critic)

**User Story:** As a Critic, I want to submit a summary report of a document I have reviewed, so that CELLAR can track and record my review activity and compensation.

#### Acceptance Criteria

1. THE System SHALL provide a "Submit Summary Report" page accessible only to authenticated users with `is_critic = true` and `status = 'active'`.
2. THE Submit Summary Report page SHALL contain a form with the following fields: Document Title (text input, required), Document Type (select, required), Page Count (integer input, required, minimum value 1), Cost (decimal input, required, minimum value 0.00), and OR Number (text input, required).
3. THE Document Type select field SHALL offer exactly the following options: `manuscript`, `research`, `thesis`, `dissertation`, `book_chapter`, `journal_article`.
4. WHEN a Critic submits a form that passes all validation rules, THE System SHALL create a `CriticSummaryReport` record with `user_id` set to the authenticated Critic's ID and all submitted field values.
5. WHEN the Submit Summary Report page is loaded, THE System SHALL display a personal history table of all past submissions by the authenticated Critic with columns: Document Title, Document Type, Page Count, Cost, OR Number, and Date Submitted, ordered by most recent first.
6. WHEN a Critic submission is saved successfully in the database, THE System SHALL clear all form fields and prepend the new submission to the top of the personal history table.
7. IF the submitted form fails validation (empty required field, page count less than 1, cost less than 0, or non-numeric values for page count or cost), THEN THE System SHALL display field-level validation error messages adjacent to the offending fields and SHALL NOT create any database record.

---

### Requirement 9: Director — University-Wide Critic Summary Reports

**User Story:** As the Director, I want to view an analytical table of all critic submissions across the university, so that I can monitor review activity, track costs, and identify patterns by college or department.

#### Acceptance Criteria

1. THE System SHALL provide a "Critic Summary Reports" page accessible only to authenticated users with `is_director = true`.
2. WHEN the Critic Summary Reports page is loaded with no active filters, THE System SHALL display all `critic_summary_reports` records with columns: Critic Name, Document Title, Document Type, Page Count, Cost, OR Number, and Date Submitted.
3. THE Critic Summary Reports page SHALL include a college filter and a department filter control; both filters default to "All".
4. WHEN the Director selects a college filter value, THE System SHALL display only records where the submitting Critic's college matches the selected value; if a department filter is also active, THEN both filters SHALL be applied as AND conditions.
5. WHEN no records match the applied filters, THE System SHALL display an empty-state message ("No records found for the selected filters.") rather than an error.
6. THE Critic Summary Reports page SHALL display the following aggregate statistics computed from the currently visible (filtered) records: total number of submissions, total cost (sum), and average cost per submission; WHEN zero records are visible, totals SHALL display as 0 and average SHALL display as 0.00.

---

### Requirement 10: Director — Ownership Transfer

**User Story:** As the Director, I want to transfer ownership of the Director account to another internal user, so that leadership transitions can be made securely and without requiring direct database access.

#### Acceptance Criteria

1. THE System SHALL provide a "Transfer Ownership" button on the Account Management page, visible only to authenticated users with `is_director = true`.
2. WHEN the Director clicks "Transfer Ownership" for a target user, THE System SHALL display a modal containing exactly the text "Are you sure you want to permanently transfer system ownership?" and a password input field.
3. WHEN the Director submits the modal, THE System SHALL validate the submitted password against the Director's stored hashed password using `Hash::check`.
4. IF the submitted password fails `Hash::check`, THEN THE System SHALL display the error "Incorrect password." inside the modal and SHALL NOT perform any database changes.
5. WHEN the password passes validation, THE System SHALL execute a database transaction that atomically: sets the current Director's `is_director = false` and `is_staff = true`; sets the target user's `is_director = true` and sets their `is_critic = false`, `is_assistant = false`, `is_staff = false`.
6. WHEN the transaction commits successfully, THE System SHALL invalidate the former Director's session and redirect to the login page; if session invalidation fails, the redirect SHALL still occur.
7. IF the database transaction fails or throws an exception, THE System SHALL roll back all changes, leave `is_director` flags unchanged, and return an error response to the frontend.
8. THE System SHALL NOT allow the Director to select themselves as the transfer target; IF the target user ID equals the authenticated Director's ID, THE System SHALL return a 422 validation error without executing any database changes.
9. THE System SHALL NOT allow transfer to a user who already has `is_director = true`.

---

### Requirement 11: Account Management — Director Controls

**User Story:** As the Director, I want to manage all user accounts from a dedicated management portal, so that I can control who has access to the system and with what permissions.

#### Acceptance Criteria

1. THE System SHALL provide an Account Management page accessible only to authenticated users with `is_director = true` or `is_assistant = true`.
2. WHEN the Account Management page is loaded, THE System SHALL display all users with the following data columns: Name, Email, Role Label, Status, and registration date.
3. WHEN the Director or Assistant sets a user's status to 'active', THE System SHALL update that user's `status` column to `'active'`.
4. WHEN the Director sets a user's status to 'deactivated', THE System SHALL update that user's `status` column to `'deactivated'`.
5. IF the target user's `id` equals the authenticated Director's `id`, THEN THE System SHALL return a 403 error and SHALL NOT update the Director's status.
6. IF the authenticated user has `is_critic = true`, THEN THE System SHALL NOT render any delete or deactivate controls on their own profile interface.
7. WHEN the Director submits a password reset for a user, THE System SHALL hash and save the new password; the new password SHALL be at least 8 characters long, validated server-side.
8. THE System SHALL derive and display a Role Label for each user using the following priority: if `is_director = true` → "Director"; else if `is_assistant = true` → "Assistant"; else if `is_staff = true` → "Staff"; else if `is_critic = true` → "Critic"; else → "Unassigned".

---

### Requirement 12: Updated Database Seeder

**User Story:** As a developer, I want the database seeder updated to use the new permission flag schema, so that fresh installs create valid seed data without referencing the removed `role` column.

#### Acceptance Criteria

1. THE `DatabaseSeeder` SHALL create at least one user with `is_director = true` and `status = 'active'`.
2. THE `DatabaseSeeder` SHALL NOT reference the `role` column or any removed models such as `ClientRequest`.
3. THE `UserFactory` SHALL include `is_director`, `is_assistant`, `is_staff`, `is_critic`, and `status` in its default state definition and SHALL NOT include a `role` field.
4. THE `DatabaseSeeder` SHALL create at least one additional user with a non-Director permission flag (`is_assistant = true`, `is_staff = true`, or `is_critic = true`) and `status = 'active'` to verify that the flag system works end-to-end on a fresh install.
