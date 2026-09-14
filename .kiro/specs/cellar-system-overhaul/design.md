# Design Document — CELLAR System Overhaul

## Overview

This document describes the technical design for a comprehensive overhaul of the CELLAR (Center for
Language-Learning and Research) information management system. The overhaul covers five areas:

1. **Remove Client Request Form** — eliminate all traces of the legacy CRF module.
2. **Permission Flag Migration** — replace the single `role` string column with discrete boolean flags
   (`is_director`, `is_assistant`, `is_staff`, `is_critic`) and a `status` column.
3. **Critic Self-Registration** — a public registration flow that creates `pending` critic accounts
   subject to admin approval before they can log in.
4. **Role-Based UI & New Modules** — conditional navigation per role, a Critic Summary Reports
   submission page, a university-wide analytics view for the Director, and a new Account Management
   portal that replaces the legacy Security page.
5. **Ownership Transfer** — a high-security, password-verified, transactional mechanism for handing
   Director privileges to another user.

The stack remains Laravel 11 + Inertia.js v2 + React 18 + Tailwind CSS, backed by SQLite.
All new migrations are written with SQLite-compatible syntax (no MySQL-only constructs).

---

## Architecture

### High-Level Component Map

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser (React 18 + Inertia.js v2)                              │
│  AuthenticatedLayout.jsx — conditional nav via shared props       │
│  Pages: Dashboard, Documents, Links, Bin, Favorites, Search      │
│         SubmitSummaryReport, CriticSummaryReports                 │
│         AccountManagement                                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │ Inertia XHR / full-page visits
┌────────────────────▼─────────────────────────────────────────────┐
│  Laravel 11 HTTP Layer                                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Middleware stack (per-request order):                       │ │
│  │  1. HandleInertiaRequests  — shares auth flags via share()  │ │
│  │  2. auth                   — session authentication         │ │
│  │  3. verified               — email verification (existing)  │ │
│  │  4. EnsureAccountIsActive  — blocks pending/deactivated     │ │
│  │  5. role gates: director / dms / critic                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  Controllers:                                                     │
│    Auth\AuthenticatedSessionController (modified)                 │
│    Auth\CriticRegisterController (new)                            │
│    AccountManagementController (new)                              │
│    CriticReportController (new)                                   │
│    OwnershipTransferController (new)                              │
└────────────────────┬─────────────────────────────────────────────┘
                     │ Eloquent / Query Builder
┌────────────────────▼─────────────────────────────────────────────┐
│  SQLite Database                                                  │
│    users (permission flags + status)                              │
│    critic_summary_reports                                         │
│    archive_files, categories, favorites, activity_logs, …        │
└──────────────────────────────────────────────────────────────────┘
```

### Route Groups and Middleware

Three named middleware aliases will be registered in `bootstrap/app.php`:

| Alias | Purpose | Checks |
|---|---|---|
| `active` | `EnsureAccountIsActive` | Passes Directors through; rejects pending/deactivated |
| `director` | Director-only gate | Requires `is_director = true` |
| `dms` | DMS access gate | Requires `is_director OR is_assistant OR is_staff` |
| `critic` | Critic gate | Requires `is_critic = true` |

Route group structure in `web.php` after the overhaul:

```
guest routes
  GET  /register/critic          CriticRegisterController@create
  POST /register/critic          CriticRegisterController@store

auth + verified + active routes
  dms group
    GET/POST  /dashboard, /documents/*, /links, /links/{id}, …
    GET       /search, /bin, /favorites, …
  critic group
    GET  /submit-report           CriticReportController@create
    POST /submit-report           CriticReportController@store
  director group
    GET  /critic-reports          CriticReportController@index
    GET  /account-management      AccountManagementController@index
    POST /account-management/users/{id}/status
    POST /account-management/users/{id}/reset-password
    POST /account-management/transfer-ownership
  director-or-assistant group
    GET  /account-management      (shared with director)
    POST /account-management/users/{id}/approve
    POST /account-management/users/{id}/deactivate
```

> The `active` middleware is applied after `auth` globally to all authenticated routes.
> The Director bypass inside `EnsureAccountIsActive` means Directors can never be locked out.

---

## Components and Interfaces

### 1. `EnsureAccountIsActive` Middleware

**File:** `app/Http/Middleware/EnsureAccountIsActive.php`

```php
public function handle(Request $request, Closure $next): Response
{
    $user = $request->user();
    if (!$user) return $next($request);

    // Directors are never blocked
    if ($user->is_director) return $next($request);

    if ($user->status === 'pending') {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login')
            ->withErrors(['email' => 'Your account is pending approval. Please wait for an administrator to activate your account.']);
    }

    if ($user->status === 'deactivated') {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login')
            ->withErrors(['email' => 'Your account has been deactivated. Please contact the administrator.']);
    }

    return $next($request);
}
```

Registered in `bootstrap/app.php` with alias `active`, appended after `auth` in the `web` middleware group for all authenticated route groups.

---

### 2. `HandleInertiaRequests` — Shared Props

**File:** `app/Http/Middleware/HandleInertiaRequests.php`

The `share()` method will be updated to expose the boolean permission flags and status to every React page:

```php
public function share(Request $request): array
{
    $user = $request->user();
    return [
        ...parent::share($request),
        'auth' => [
            'user'         => $user,
            'is_director'  => (bool) ($user?->is_director),
            'is_assistant' => (bool) ($user?->is_assistant),
            'is_staff'     => (bool) ($user?->is_staff),
            'is_critic'    => (bool) ($user?->is_critic),
            'status'       => $user?->status,
        ],
    ];
}
```

React components read these via `usePage().props.auth`.

The legacy `user.role` string reference in `AuthenticatedLayout.jsx` (used to display the role label in the user dropdown) will be replaced with a derived label computed from the flags.

---

### 3. `CriticRegisterController`

**File:** `app/Http/Controllers/Auth/CriticRegisterController.php`

Reuses Breeze's pattern but with additional validation and forced flag values.
The existing `/register` Breeze route remains untouched (internal use only / disabled via `guest` middleware if needed).

| Method | Route | Description |
|---|---|---|
| `create()` | `GET /register/critic` | Renders `Auth/CriticRegister` Inertia page |
| `store()` | `POST /register/critic` | Validates, creates user, redirects to confirmation |

Validation rules for `store()`:
- `name`: required, string, max:255
- `email`: required, email, lowercase, max:255, unique:users, ends_with:@cvsu.edu.ph (custom rule)
- `password`: required, confirmed, `Password::defaults()`

On success:
```php
User::create([
    'name'       => $request->name,
    'email'      => $request->email,
    'password'   => Hash::make($request->password),
    'is_critic'  => true,
    'status'     => 'pending',
]);
// No Auth::login() — pending users must be approved first
return Inertia::render('Auth/CriticRegisterSuccess');
```

The email domain check is best implemented as a simple `Rule::in` or a closure rule:
```php
function ($attr, $value, $fail) {
    if (!str_ends_with(strtolower($value), '@cvsu.edu.ph')) {
        $fail('Only @cvsu.edu.ph email addresses are permitted to register.');
    }
}
```

---

### 4. `AuthenticatedSessionController` — Login Status Check

The existing `store()` method calls `$request->authenticate()` (which calls `Auth::attempt()`). After the session is regenerated, we add the status check **before** the redirect:

```php
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    $user = Auth::user();

    if (!$user->is_director) {
        if ($user->status === 'pending') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw ValidationException::withMessages([
                'email' => 'Your account is pending approval. Please wait for an administrator to activate your account.',
            ]);
        }
        if ($user->status === 'deactivated') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw ValidationException::withMessages([
                'email' => 'Your account has been deactivated. Please contact the administrator.',
            ]);
        }
    }

    // Role-based post-login redirect
    if ($user->is_critic) {
        return redirect()->route('critic.report.create');
    }
    return redirect()->intended(route('dashboard', absolute: false));
}
```

This handles the login-time check (Req 4.5/4.6). The `EnsureAccountIsActive` middleware handles all subsequent requests (Req 6).

---

### 5. `CriticReportController`

**File:** `app/Http/Controllers/CriticReportController.php`

| Method | Route | Middleware | Description |
|---|---|---|---|
| `create()` | `GET /submit-report` | auth, active, critic | Renders form + personal history |
| `store()` | `POST /submit-report` | auth, active, critic | Validates and saves report |
| `index()` | `GET /critic-reports` | auth, active, director | University-wide analytics view |

`store()` validation:
```php
$request->validate([
    'document_title' => 'required|string|max:255',
    'document_type'  => 'required|in:manuscript,research,thesis,dissertation,book_chapter,journal_article',
    'page_count'     => 'required|integer|min:1',
    'cost'           => 'required|numeric|min:0',
    'or_number'      => 'required|string|max:100',
]);
CriticSummaryReport::create([...$validated, 'user_id' => auth()->id()]);
return redirect()->back()->with('success', 'Report submitted.');
```

`create()` passes the authenticated critic's own reports ordered by `created_at desc`.

`index()` (Director only) passes all reports with their critic user (eager-loaded), plus aggregate stats. Filter parameters `college` and `department` are accepted as query strings and applied via `when()` on the query builder.

---

### 6. `AccountManagementController`

**File:** `app/Http/Controllers/AccountManagementController.php`

| Method | Route | Middleware | Description |
|---|---|---|---|
| `index()` | `GET /account-management` | auth, active, director-or-assistant | Lists all users with derived role labels |
| `updateStatus()` | `POST /account-management/users/{id}/status` | auth, active, director-or-assistant | Sets status to active or deactivated |
| `resetPassword()` | `POST /account-management/users/{id}/reset-password` | auth, active, director-or-assistant | Hashes and saves new password |

`index()` derives the Role Label in PHP and passes it to Inertia:
```php
$users = User::all()->map(function ($u) {
    $u->role_label = match(true) {
        (bool)$u->is_director  => 'Director',
        (bool)$u->is_assistant => 'Assistant',
        (bool)$u->is_staff     => 'Staff',
        (bool)$u->is_critic    => 'Critic',
        default                => 'Unassigned',
    };
    return $u;
});
```

`updateStatus()` guards against self-modification (returns 403 if target ID === auth ID).
Only the Director can deactivate; Assistants can only approve (set to `active`).

---

### 7. `OwnershipTransferController`

**File:** `app/Http/Controllers/OwnershipTransferController.php`

| Method | Route | Middleware | Description |
|---|---|---|---|
| `transfer()` | `POST /account-management/transfer-ownership` | auth, active, director | Executes ownership transfer |

Flow:
1. Validate `target_user_id` (required, exists:users,id, not self, not already director)
2. Verify `password` via `Hash::check($request->password, auth()->user()->password)`
3. If check fails → return back with error `Incorrect password.`
4. Wrap in `DB::transaction()`:
   - `$currentDirector->update(['is_director' => false, 'is_staff' => true])`
   - `$targetUser->update(['is_director' => true, 'is_critic' => false, 'is_assistant' => false, 'is_staff' => false])`
5. On commit: invalidate former director's session, redirect to `login`
6. On exception: roll back, return 500 error response

The former director's session invalidation uses `Auth::logoutOtherDevices()` or direct session store flush; if it fails, the redirect still proceeds (Req 10.6).

---

### 8. React Pages

#### `Auth/CriticRegister.jsx`
Public page at `/register/critic`. Simple form: Name, Email, Password, Confirm Password. Shows the `@cvsu.edu.ph` domain requirement. On success, renders `Auth/CriticRegisterSuccess.jsx` with the pending-approval message.

#### `SubmitSummaryReport.jsx`
Accessible at `/submit-report`, critic-only. Two-panel layout:
- **Left/top**: submission form with fields defined in Req 8.2/8.3.
- **Right/bottom**: personal history table (Document Title, Document Type, Page Count, Cost, OR Number, Date Submitted), ordered most-recent-first.

Uses `useForm` from `@inertiajs/react`. On success, the Inertia redirect reloads the page with the new record prepended via the fresh server response.

#### `CriticSummaryReports.jsx`
Accessible at `/critic-reports`, director-only. Full-width table of all submissions. Filter controls (college, department dropdowns) above the table, implemented as controlled React state with `router.get()` on change (preserving scroll). Aggregate stats bar below filters.

#### `AccountManagement.jsx`
Replaces `Security.jsx`. Accessible at `/account-management`. Rendered for both Director and Assistant, but with conditional controls:
- Assistants see Approve/Deactivate only.
- Directors also see Reset Password, Transfer Ownership, and delete controls.

The Pending Approvals panel is a separate section within the same page. Status changes use `router.post()` with `preserveScroll: true` so the pending list updates without a full reload (Req 5.5).

#### `AuthenticatedLayout.jsx` — Updated Conditional Nav

```jsx
const { is_director, is_assistant, is_staff, is_critic } = usePage().props.auth;
const isDms = is_director || is_assistant || is_staff;
```

Nav rendering logic:
- If `is_critic` and not `isDms`: show only "Submit Summary Report"
- If `isDms`: show Workspace group (Dashboard, Documents, Links, Search), Library group (Bookmarks, Bin)
- If `is_director`: additionally show Management group (Account Management, Critic Summary Reports)

The "Client Requests" nav item is removed entirely.

The user role label in the header dropdown reads from the derived `role_label` prop instead of the removed `user.role` string.

---

## Data Models

### `users` Table — After Migration

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | bigint PK | — | existing |
| `name` | string | — | existing |
| `email` | string unique | — | existing |
| `password` | string | — | existing |
| `email_verified_at` | timestamp null | null | existing |
| `remember_token` | string null | null | existing |
| `is_director` | boolean | false | new |
| `is_assistant` | boolean | false | new |
| `is_staff` | boolean | false | new |
| `is_critic` | boolean | false | new |
| `status` | string | `'pending'` | new; values: pending, active, deactivated |
| `created_at` / `updated_at` | timestamps | — | existing |
| ~~`role`~~ | ~~string~~ | — | **dropped** by migration |

**`User` Model changes:**
- Remove `#[Fillable]` attribute with `role`; add `$fillable` array (or updated attribute) including `is_director`, `is_assistant`, `is_staff`, `is_critic`, `status`.
- Add `$casts` for the four boolean flags: `'is_director' => 'boolean'`, etc.
- Remove any accessor/method referencing `role`.

### `critic_summary_reports` Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | bigint PK auto-increment | — | |
| `user_id` | bigint unsigned | FK → users.id, cascade delete | |
| `document_title` | string | not null | |
| `document_type` | string | not null | enum enforced at app layer |
| `page_count` | integer | not null | min 1 |
| `cost` | decimal(10,2) | not null | min 0.00 |
| `or_number` | string | not null | |
| `created_at` / `updated_at` | timestamps | — | |

**`CriticSummaryReport` Model:**
```php
protected $fillable = ['user_id','document_title','document_type','page_count','cost','or_number'];

public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

**`User` → reports relationship:**
```php
public function criticSummaryReports(): HasMany
{
    return $this->hasMany(CriticSummaryReport::class);
}
```

### Migration Strategy

**Migration file:** `xxxx_xx_xx_xxxxxx_overhaul_users_permissions_and_add_critic_reports.php`

The single migration performs these steps in order:

1. Add `is_director`, `is_assistant`, `is_staff`, `is_critic` (boolean, default false) and `status` (string, default `'pending'`) columns to `users`.
2. **Data migration** (only if `role` column exists — checked via `Schema::hasColumn`):
   - `UPDATE users SET is_director=1, status='active' WHERE role='director'`
   - `UPDATE users SET is_assistant=1, status='active' WHERE role IN ('admin','admin_assistant')`
   - `UPDATE users SET status='active' WHERE role NOT IN ('director','admin','admin_assistant')`
   - Log a warning if no `role='director'` record is found (but do not fail).
3. Drop the `role` column (only if it exists — `Schema::hasColumn` guard).
4. Create the `critic_summary_reports` table.

The `down()` method re-adds the `role` column, drops `critic_summary_reports`, and drops the flag + status columns.

**`client_requests` Removal Migration:** A separate migration file drops the `client_requests` table using `Schema::dropIfExists('client_requests')`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Critic registration enforces domain restriction

*For any* email string submitted to the critic registration endpoint, the registration SHALL succeed if and only if the email ends with `@cvsu.edu.ph` (case-insensitive). All other email addresses SHALL be rejected with the specific domain error message.

**Validates: Requirements 4.2, 4.3**

---

### Property 2: Successful critic registration sets correct flags

*For any* valid registration submission (name, `@cvsu.edu.ph` email, valid password), the created user record SHALL have `is_critic = true` and `status = 'pending'` — regardless of who submits the form or what name/email combination is used.

**Validates: Requirements 4.4**

---

### Property 3: Pending users are blocked at login

*For any* user whose `status = 'pending'` (and `is_director = false`), an attempted login with correct credentials SHALL be rejected and SHALL return the exact message "Your account is pending approval. Please wait for an administrator to activate your account."

**Validates: Requirements 4.5, 6.2**

---

### Property 4: Deactivated users are blocked at login

*For any* user whose `status = 'deactivated'` (and `is_director = false`), an attempted login with correct credentials SHALL be rejected and SHALL return the exact message "Your account has been deactivated. Please contact the administrator."

**Validates: Requirements 4.6, 6.3**

---

### Property 5: Non-active non-director users are blocked on all authenticated routes

*For any* user with `is_director = false` and `status != 'active'`, any authenticated HTTP request to a protected route SHALL result in session invalidation and a redirect to the login page, regardless of which route or HTTP method is used.

**Validates: Requirements 6.1, 6.2, 6.3, 4.7**

---

### Property 6: Director bypasses account status enforcement

*For any* user with `is_director = true`, authenticated requests SHALL proceed to the route handler regardless of the value of the `status` column.

**Validates: Requirements 6.5**

---

### Property 7: Critic users cannot access DMS routes

*For any* authenticated user with `is_critic = true` and `is_director = false` and `is_assistant = false` and `is_staff = false`, any HTTP request to a DMS route (dashboard, documents, links, bin, favorites, search) SHALL return HTTP 403.

**Validates: Requirements 7.6**

---

### Property 8: Non-director users cannot access director-exclusive routes

*For any* authenticated user with `is_director = false`, any HTTP request to a director-exclusive route (critic-reports, transfer-ownership) SHALL return HTTP 403.

**Validates: Requirements 7.5, 9.1, 10.1**

---

### Property 9: Submit Summary Report is accessible only to active critics

*For any* authenticated user who does not have `is_critic = true` and `status = 'active'`, a request to `GET /submit-report` or `POST /submit-report` SHALL return HTTP 403.

**Validates: Requirements 8.1**

---

### Property 10: Valid critic submissions always set user_id to the authenticated critic

*For any* active critic user and any valid form submission (valid document_type, page_count ≥ 1, cost ≥ 0, non-empty title and or_number), the created `CriticSummaryReport` record SHALL have `user_id` equal to the authenticated critic's `id`.

**Validates: Requirements 8.4**

---

### Property 11: Invalid submissions do not create database records

*For any* form submission that fails at least one validation rule (empty required field, page_count < 1, cost < 0, non-numeric page_count or cost, document_type not in allowed set), no `CriticSummaryReport` record SHALL be created and the total record count SHALL remain unchanged.

**Validates: Requirements 8.7, 8.3**

---

### Property 12: Document type validation accepts exactly the specified values

*For any* string value submitted as `document_type`, the submission SHALL be accepted if and only if the value is one of: `manuscript`, `research`, `thesis`, `dissertation`, `book_chapter`, `journal_article`. All other values SHALL trigger a validation error.

**Validates: Requirements 8.3**

> Property reflection: Properties 11 and 12 are related but non-redundant — Property 11 verifies no DB write occurs on any validation failure; Property 12 specifically verifies the exact allowed set for document_type. Both are kept.

---

### Property 13: Critic's history page shows only their own records

*For any* active critic user, all `CriticSummaryReport` records returned to the `/submit-report` page SHALL have `user_id` equal to the authenticated critic's `id`. No records from other critics SHALL appear.

**Validates: Requirements 8.5**

---

### Property 14: Filter results match applied filters (AND condition)

*For any* non-empty college or department filter value applied to the Critic Summary Reports page, every record displayed SHALL satisfy all active filter conditions simultaneously. No record failing any active filter SHALL appear in the results.

**Validates: Requirements 9.4**

---

### Property 15: Aggregate statistics are consistent with visible records

*For any* set of `CriticSummaryReport` records visible after filter application, the displayed total count SHALL equal the number of records, the total cost SHALL equal the sum of all `cost` values, and the average cost SHALL equal the sum divided by the count (or `0.00` when count is zero).

**Validates: Requirements 9.6**

---

### Property 16: Incorrect password on ownership transfer prevents any DB changes

*For any* ownership transfer request where the submitted password fails `Hash::check` against the Director's stored password, neither the Director's nor the target user's permission flags SHALL be modified.

**Validates: Requirements 10.3, 10.4**

---

### Property 17: Ownership transfer is atomic — both users updated or neither is

*For any* valid ownership transfer (correct password, valid target), the operation SHALL update exactly both the current Director (`is_director = false`, `is_staff = true`) and the target user (`is_director = true`, all other flags false) within a single transaction. If any exception occurs mid-transaction, both records SHALL remain in their pre-transfer state.

**Validates: Requirements 10.5, 10.7**

---

### Property 18: Role Label derivation follows exact priority order

*For any* combination of `is_director`, `is_assistant`, `is_staff`, and `is_critic` boolean flag values, the derived Role Label SHALL be: "Director" if `is_director`, else "Assistant" if `is_assistant`, else "Staff" if `is_staff`, else "Critic" if `is_critic`, else "Unassigned". No other label SHALL be returned.

**Validates: Requirements 11.8**

---

### Property 19: Password reset stores verifiable hash

*For any* new password string of length ≥ 8 submitted to the reset-password endpoint, the stored password hash SHALL satisfy `Hash::check(submittedPassword, storedHash) === true` after the operation completes.

**Validates: Requirements 11.7**

---

### Property 20: Non-director/non-assistant users cannot access Account Management

*For any* authenticated user with `is_director = false` and `is_assistant = false`, a request to `GET /account-management` or any of its sub-routes SHALL return HTTP 403.

**Validates: Requirements 11.1**

---

## Error Handling

### Migration Errors

- `Schema::hasColumn('users', 'role')` guards every read and drop of the `role` column, ensuring idempotent re-runs.
- If no `director` row is found during the data migration step, `Log::warning('cellar.migration: no director user found')` is emitted; the migration continues and succeeds.
- If a single user update fails, the exception is caught, logged with the user ID, and the migration continues with remaining users (Req 3.4). The full migration does not fail for individual row errors.

### Registration Errors

- Email domain validation failure: 422 Unprocessable Entity, field-level error returned to Inertia form.
- Duplicate email: 422, error "The email address has already been taken." (Laravel's default unique rule message).
- DB write failure during `User::create()`: the transaction wraps the insert; if it fails, no partial user record remains. The user sees a generic 500 error.

### Authentication Errors

- Wrong credentials: existing Laravel rate-limited 422 (unchanged).
- Pending/deactivated login: `ValidationException` thrown after `Auth::attempt()` succeeds but before session commit, then session is immediately invalidated.

### Ownership Transfer Errors

- Wrong password: back redirect with inline error `Incorrect password.`, no DB changes.
- Self-transfer: 422 with message "You cannot transfer ownership to yourself."
- Target is already Director: 422 with message "The selected user is already the Director."
- DB transaction exception: `DB::rollBack()` called in catch block; returns 500 JSON response `{ "message": "Transfer failed. Please try again." }` to Inertia error handler.
- Session invalidation failure (rare): logged, redirect to `/login` still proceeds.

### Authorization Errors

- 403 responses from middleware gates are caught by Laravel's exception handler and returned as Inertia 403 pages (the default Breeze error page).
- Director-exclusive route violation also emits a log entry: `Log::warning("403 director-route access", ['user_id' => ..., 'route' => ..., 'timestamp' => now()->utc()])` (Req 7.5).

---

## Testing Strategy

### Property-Based Testing

The project uses **PHP** so we will use [**Eris**](https://github.com/giorgiosironi/eris) (a PHP property-based testing library that integrates with PHPUnit) to implement the correctness properties defined above.

Each property test runs a minimum of **100 iterations** and is tagged with the corresponding design property.

Example test structure:

```php
/**
 * Feature: cellar-system-overhaul, Property 1: Critic registration enforces domain restriction
 */
public function test_registration_accepts_only_cvsu_domain(): void
{
    $this->forAll(
        Generator\elements($this->invalidDomainEmails()),
    )->then(function (string $email) {
        $response = $this->post('/register/critic', [
            'name'                  => 'Test User',
            'email'                 => $email,
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $response->assertSessionHasErrors('email');
        $this->assertDatabaseMissing('users', ['email' => $email]);
    });
}
```

Properties covered by property-based tests (20 total, see Correctness Properties section):
- Properties 1–8: Auth/middleware invariants
- Properties 9–13: Critic report submission invariants
- Properties 14–15: Filter and aggregation invariants
- Properties 16–17: Ownership transfer atomicity
- Properties 18–20: Role label derivation, password hashing, access control

### Unit Tests

Unit tests cover specific examples and edge cases that complement the property tests:

- **Migration tests**: 3 examples (director role → `is_director=true`, admin → `is_assistant=true`, idempotent re-run)
- **Registration**: `@cvsu.edu.ph` accepted, duplicate email rejected
- **Login**: active user proceeds, pending user blocked with exact message, deactivated user blocked with exact message
- **Ownership transfer**: self-transfer returns 422, transfer to existing director returns 422, wrong password returns error
- **Account Management**: Director cannot change own status (403), role label for each flag combination
- **Critic Summary Reports**: empty filter state, aggregate stats at zero records

### Integration Tests

Integration tests verify wiring between layers:

- **Full registration-to-approval flow**: register → pending state → admin approves → active → login succeeds
- **Full ownership transfer flow**: password check → transaction → session invalidated → new director can log in
- **Pending Approvals panel**: update is reflected immediately (Inertia response contains updated user list)
- **Database seeder**: fresh seeder run produces at least one `is_director=true, status=active` user and one other active non-director user

### Test File Locations

```
tests/
  Feature/
    Auth/
      CriticRegistrationTest.php       — properties 1, 2, 3, 4
      LoginStatusCheckTest.php         — properties 3, 4, 5, 6
    Middleware/
      EnsureAccountIsActiveTest.php    — properties 5, 6
    Authorization/
      RoleGateTest.php                 — properties 7, 8, 9, 20
    CriticReport/
      SubmitReportTest.php             — properties 10, 11, 12, 13
    DirectorReports/
      FilterAndAggregateTest.php       — properties 14, 15
    OwnershipTransfer/
      TransferOwnershipTest.php        — properties 16, 17
    AccountManagement/
      RoleLabelTest.php                — property 18
      PasswordResetTest.php            — property 19
  Unit/
    MigrationDataTest.php
    UserFactoryTest.php
    DatabaseSeederTest.php
```
