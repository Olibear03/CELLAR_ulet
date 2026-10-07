<?php

use App\Http\Controllers\CriticReportController;
use App\Http\Controllers\CriticProfileScheduleController;
use App\Http\Controllers\CriticEarningsController;
use App\Http\Controllers\CriticQueueController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ArchiveFileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Auth\CriticRegisterController;
use App\Http\Controllers\ShareController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Landing page — shows login button + Submit Client Request button
    return Inertia::render('Welcome');
});

Route::get('/public-critics', function () {
    return Inertia::render('PublicAccreditedCritics');
})->name('public-critics');

Route::get('/submit-report', [CriticReportController::class, 'create'])
    ->middleware(['auth', 'verified'])
    ->name('critic.report.create');

Route::post('/submit-report', [CriticReportController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('critic.report.store');

Route::get('/critic-reports', [CriticReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('critic.reports.index');
Route::patch('/critic-reports/{report}/payment-status', [CriticReportController::class, 'updatePaymentStatus'])
    ->middleware(['auth', 'verified'])
    ->name('critic.reports.payment-status');

Route::get('/register/critic', [CriticRegisterController::class, 'create'])
    ->middleware('guest')
    ->name('critic.register');

Route::post('/register/critic', [CriticRegisterController::class, 'store'])
    ->middleware('guest')
    ->name('critic.register.store');

Route::get('/critic-management', function () {
    abort_unless(auth()->user()->canManageCritics(), 403);

    $critics = \App\Models\User::where('is_critic', true)
        ->withCount('criticSummaryReports')
        ->orderBy('name')
        ->get(['id', 'name', 'email', 'college', 'status', 'created_at']);

    return Inertia::render('CriticManagement', ['critics' => $critics]);
})->middleware(['auth', 'verified'])->name('critic.management');

Route::post('/critic-management', function (\Illuminate\Http\Request $request) {
    abort_unless($request->user()->is_director, 403);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'college' => 'required|string|max:100',
        'email' => [
            'required',
            'string',
            'lowercase',
            'email',
            'max:255',
            'unique:users,email',
            function ($attribute, $value, $fail) {
                if (! str_ends_with(strtolower($value), '@cvsu.edu.ph')) {
                    $fail('Only @cvsu.edu.ph email addresses are permitted for critic accounts.');
                }
            },
        ],
        'password' => 'required|string|min:8',
    ]);

    $critic = \App\Models\User::create([
        ...$validated,
        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        'is_critic' => true,
        'status' => 'active',
    ]);

    \App\Models\ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => 'created_critic_account',
        'type' => 'auth',
        'location' => 'System',
    ]);

    return redirect()->back()->with('success', "{$critic->name} was registered as an active English Critic.");
})->middleware(['auth', 'verified'])->name('critic.management.store');

Route::patch('/critic-management/{id}/approve', function ($id) {
    abort_unless(auth()->user()->canManageCritics(), 403);
    \App\Models\User::where('is_critic', true)->findOrFail($id)->update(['status' => 'active']);
    return redirect()->back()->with('success', 'Critic approved.');
})->middleware(['auth', 'verified'])->name('critic.management.approve');

Route::patch('/critic-management/{id}/deactivate', function ($id) {
    abort_unless(auth()->user()->canManageCritics(), 403);
    \App\Models\User::where('is_critic', true)->findOrFail($id)->update(['status' => 'deactivated']);
    return redirect()->back()->with('success', 'Critic deactivated.');
})->middleware(['auth', 'verified'])->name('critic.management.deactivate');

Route::patch('/critic-management/{id}/reset-password', function (\Illuminate\Http\Request $request, $id) {
    abort_unless(auth()->user()->canManageCritics(), 403);
    $request->validate(['password' => 'required|string|min:8']);
    \App\Models\User::where('is_critic', true)->findOrFail($id)
        ->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
    return redirect()->back()->with('success', 'Critic password reset.');
})->middleware(['auth', 'verified'])->name('critic.management.reset-password');

Route::delete('/critic-management/{id}', function ($id) {
    abort_unless(auth()->user()->canManageCritics(), 403);
    $critic = \App\Models\User::where('is_critic', true)->findOrFail($id);
    abort_if($critic->id === auth()->id(), 403, 'You cannot delete your own account.');
    $critic->delete();
    return redirect()->back()->with('success', 'Critic deleted.');
})->middleware(['auth', 'verified'])->name('critic.management.destroy');

Route::get('/official-receipt', function () {
    return Inertia::render('OfficialReceipt');
})->middleware(['auth', 'verified'])->name('critic.receipt.create');

// ── Public Client Request Form (no login required) ──────────────────────────
Route::get('/request', function () {
    return Inertia::render('ClientRequestForm');
})->name('client-request.form');

Route::post('/request', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'client_name'          => 'required|string|max:150',
        'address'              => 'required|string|max:300',
        'occupation'           => 'required|string|max:150',
        'contact_number'       => 'required|string|max:50',
        'email'                => 'required|email|max:150',
        'agency'               => 'nullable|string|max:200',
        'office_address'       => 'nullable|string|max:300',
        'services'             => 'required|array|min:1',
        'language_options'     => 'nullable|array',
        'translation_document' => 'nullable|string|max:500',
        'research_title'       => 'nullable|string|max:500',
        'proficiency_options'  => 'nullable|array',
        'client_signature'     => 'nullable|string',
        'printed_name'         => 'nullable|string|max:150',
    ]);

    $ref = \App\Models\ClientRequest::generateReferenceNumber();

    $clientRequest = \App\Models\ClientRequest::create([
        ...$validated,
        'reference_number' => $ref,
        'request_date'     => now()->toDateString(),
        'status'           => 'pending',
    ]);

    // Send confirmation email to client
    \Illuminate\Support\Facades\Mail::send(
        'emails.client-request-confirmation',
        ['request' => $clientRequest],
        function ($m) use ($clientRequest) {
            $m->to($clientRequest->email, $clientRequest->client_name)
              ->subject("CELLAR Request Received — {$clientRequest->reference_number}");
        }
    );

    return redirect()->route('client-request.success', ['ref' => $ref]);
})->name('client-request.submit');

Route::get('/request/success', function (\Illuminate\Http\Request $request) {
    return Inertia::render('ClientRequestSuccess', [
        'reference' => $request->query('ref'),
    ]);
})->name('client-request.success');

Route::get('/critic-dashboard', function () {
    abort_unless(auth()->user()->is_critic || auth()->user()->is_director, 403);

    $reports = \App\Models\CriticSummaryReport::where('user_id', auth()->id())
        ->orderByDesc('created_at')
        ->get(['id', 'student_name', 'manuscript_title', 'total_amount', 'created_at']);

    $pendingRequests = \App\Models\ClientRequest::where('status', 'pending')
        ->orderBy('created_at')
        ->take(5)
        ->get(['id', 'reference_number', 'client_name', 'research_title', 'request_date', 'created_at']);

    return Inertia::render('CriticDashboard', [
        'pendingRequests' => $pendingRequests,
        'requestTotals' => [
            'pending' => \App\Models\ClientRequest::where('status', 'pending')->count(),
            'total' => \App\Models\ClientRequest::count(),
            'completed' => \App\Models\ClientRequest::whereIn('status', ['approved', 'rejected'])->count(),
        ],
        'earnings' => $reports->sum('total_amount'),
        'recentEarnings' => $reports->take(5)->values(),
    ]);
})->middleware(['auth', 'verified'])->name('critic.dashboard');

Route::get('/critic-profile-schedule', [CriticProfileScheduleController::class, 'edit'])
    ->middleware(['auth', 'verified'])
    ->name('critic.profile-schedule.edit');
Route::put('/critic-profile-schedule', [CriticProfileScheduleController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('critic.profile-schedule.update');
Route::get('/critic-earnings', [CriticEarningsController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('critic.earnings');
Route::get('/critic-requests', [CriticQueueController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('critic.requests');

Route::get('/dashboard', function () {
    $userId = auth()->id();

    // Total document files (excluding links and folders)
    $totalFiles = \App\Models\ArchiveFile::whereHas('category', function($q) {
        $q->where('name', 'general_doc');
    })->count();

    // Total links
    $totalLinks = \App\Models\ArchiveFile::whereHas('category', function($q) {
        $q->where('name', 'Links');
    })->count();

    // Client requests submitted this month
    $requestsThisMonth = \App\Models\ClientRequest::whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->count();

    // Monthly upload counts for the current year (all file types)
    $monthlyUploads = \App\Models\ArchiveFile::whereYear('created_at', now()->year)
        ->selectRaw("strftime('%m', created_at) as month, count(*) as total")
        ->groupByRaw("strftime('%m', created_at)")
        ->orderByRaw("strftime('%m', created_at)")
        ->pluck('total', 'month')
        ->toArray();

    // Recent uploads (last 5, any type)
    $recentUploads = \App\Models\ArchiveFile::with(['category', 'user'])
        ->whereNotJsonContains('metadata->type', 'folder')
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get();

    // Favorites for the current user
    $favoriteIds = \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', $userId)
        ->pluck('archive_file_id');
    $favorites = \App\Models\ArchiveFile::whereIn('id', $favoriteIds)
        ->with(['user'])
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get();

    return Inertia::render('Dashboard', [
        'totalFiles'         => $totalFiles,
        'totalLinks'         => $totalLinks,
        'requestsThisMonth'  => $requestsThisMonth,
        'monthlyUploads'     => $monthlyUploads,
        'recentUploads'      => $recentUploads,
        'favorites'          => $favorites,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Renamed from /research to /search — reflects the UI rename
Route::get('/search', function () {
    return Inertia::render('Search');
})->middleware(['auth', 'verified'])->name('search');



Route::get('/documents/{path?}', function (\Illuminate\Http\Request $request, $path = null) {
    // Build breadcrumb chain and resolve current folder from URL path segments.
    // e.g. /documents/Year-2026/Jan-Jun  →  resolves each segment under its parent
    $breadcrumbs   = [];
    $currentFolder = null;

    if ($path) {
        $segments    = explode('/', trim($path, '/'));
        $parentId    = null;

        foreach ($segments as $segment) {
            // Decode URL-encoded spaces (%20 or +) and match by title
            $title  = urldecode(str_replace('-', ' ', $segment));
            $folder = \App\Models\ArchiveFile::where('title', $segment)
                ->orWhere('title', $title)
                ->where(function ($q) use ($parentId) {
                    $parentId
                        ? $q->where('folder_id', $parentId)
                        : $q->whereNull('folder_id');
                })
                ->whereJsonContains('metadata->type', 'folder')
                ->first();

            if (!$folder) {
                // Segment not found — fall back to root
                return redirect()->route('documents');
            }

            $breadcrumbs[] = [
                'id'    => $folder->id,
                'title' => $folder->title,
                // Build the URL path up to this segment
                'path'  => implode('/', array_slice($segments, 0, array_search($segment, $segments) + 1)),
            ];

            $parentId      = $folder->id;
            $currentFolder = $folder;
        }
    }

    // Fetch files/folders inside the current location
    $query = \App\Models\ArchiveFile::with(['category', 'user'])
        ->whereHas('category', function ($q) { $q->where('name', 'general_doc'); })
        ->orderByRaw("CASE WHEN JSON_EXTRACT(metadata, '$.type') = 'folder' THEN 0 ELSE 1 END")
        ->orderBy('title');

    if ($currentFolder) {
        $query->where('folder_id', $currentFolder->id);
    } else {
        $query->whereNull('folder_id');
    }

    $disk = \Illuminate\Support\Facades\Storage::disk('public');
    $files = $query->get()->each(function ($file) use ($disk) {
        $file->file_size = ($file->metadata['type'] ?? null) === 'folder' || !$disk->exists($file->file_path)
            ? null
            : $disk->size($file->file_path);
    });

    return Inertia::render('Documents', [
        'files'         => $files,
        'categories'    => \App\Models\Category::all(),
        'currentFolder' => $currentFolder,
        'breadcrumbs'   => $breadcrumbs,
        // Pass the current URL path so the frontend can build child URLs
        'currentPath'   => $path ?? '',
    ]);
})->middleware(['auth', 'verified'])->name('documents')->where('path', '.*');

Route::get('/links', function () {
    return Inertia::render('Links', [
        'files' => \App\Models\ArchiveFile::with(['category', 'user'])
            ->whereHas('category', function($q) { $q->where('name', 'Links'); })
            ->orderBy('created_at', 'desc')
            ->get(),
        'categories' => \App\Models\Category::all()
    ]);
})->middleware(['auth', 'verified'])->name('links');

// Dedicated endpoint for saving URL-based link entries (no file upload required)
Route::post('/links', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'title'       => 'required|string|max:255',
        'url'         => 'required|url|max:2048',
        'description' => 'nullable|string|max:1000',
        'keywords'    => 'nullable|string|max:500',
        'category_id' => 'required|exists:categories,id',
    ]);

    \App\Models\ArchiveFile::create([
        'title'             => $request->title,
        'description'       => $request->description,
        'category_id'       => $request->category_id,
        'user_id'           => auth()->id(),
        'file_path'         => $request->url,
        'original_filename' => $request->url,
        'metadata'          => [
            'type'         => 'link',
            'keywords'     => $request->keywords,
            'confidential' => $request->boolean('confidential'),
        ],
    ]);

    return redirect()->back()->with('success', 'Link added successfully.');
})->middleware(['auth', 'verified'])->name('links.store');

// Update an existing link entry
Route::patch('/links/{id}', function (\Illuminate\Http\Request $request, $id) {
    $request->validate([
        'title'       => 'required|string|max:255',
        'url'         => 'required|url|max:2048',
        'description' => 'nullable|string|max:1000',
        'keywords'    => 'nullable|string|max:500',
    ]);

    $link = \App\Models\ArchiveFile::findOrFail($id);
    $link->update([
        'title'             => $request->title,
        'description'       => $request->description,
        'file_path'         => $request->url,
        'original_filename' => $request->url,
        'metadata'          => array_merge($link->metadata ?? [], [
            'keywords'     => $request->keywords,
            'confidential' => $request->boolean('confidential'),
        ]),
    ]);

    return redirect()->back()->with('success', 'Link updated successfully.');
})->middleware(['auth', 'verified'])->name('links.update');

Route::post('/upload', [ArchiveFileController::class, 'store'])->middleware(['auth', 'verified'])->name('upload.store');

Route::post('/folders', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name'        => 'required|string|max:255',
        'category_id' => 'required|exists:categories,id',
        'folder_id'   => 'nullable|exists:archive_files,id',
        'current_path'=> 'nullable|string',
    ]);

    \App\Models\ArchiveFile::create([
        'title'             => $request->name,
        'category_id'       => $request->category_id,
        'user_id'           => auth()->id(),
        'folder_id'         => $request->folder_id,
        'file_path'         => 'folder',
        'original_filename' => 'folder',
        'metadata'          => ['type' => 'folder'],
    ]);

    // Redirect back to the exact path the user was in
    $path = $request->current_path;
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Folder created.');
})->middleware(['auth', 'verified'])->name('folders.store');

Route::delete('/documents/{id}', function ($id) {
    $file     = \App\Models\ArchiveFile::findOrFail($id);
    $path     = request()->input('current_path', '');
    $file->delete();
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Deleted successfully.');
})->middleware(['auth', 'verified'])->name('documents.destroy');

// Bulk operations — move multiple items to bin or restore
Route::post('/documents/bulk-delete', function (\Illuminate\Http\Request $request) {
    $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:archive_files,id']);
    \App\Models\ArchiveFile::whereIn('id', $request->ids)->delete();
    $path = $request->input('current_path', '');
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Items moved to bin.');
})->middleware(['auth', 'verified'])->name('documents.bulk-delete');

Route::post('/documents/bulk-favorite', function (\Illuminate\Http\Request $request) {
    $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:archive_files,id']);
    foreach ($request->ids as $id) {
        \Illuminate\Support\Facades\DB::table('favorites')->updateOrInsert(
            ['user_id' => auth()->id(), 'archive_file_id' => $id]
        );
    }
    return redirect()->back()->with('success', 'Added to favorites.');
})->middleware(['auth', 'verified'])->name('documents.bulk-favorite');

Route::patch('/documents/{id}/rename', function (\Illuminate\Http\Request $request, $id) {
    $request->validate(['title' => 'required|string|max:255']);
    $file = \App\Models\ArchiveFile::findOrFail($id);
    $path = $request->input('current_path', '');
    $file->update(['title' => $request->title]);
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Renamed successfully.');
})->middleware(['auth', 'verified'])->name('documents.rename');

Route::get('/bin', function (\Illuminate\Http\Request $request) {
    $files = \App\Models\ArchiveFile::onlyTrashed()->with(['category', 'user'])->get();
    return Inertia::render('Bin', [
        'files' => $files,
    ]);
})->middleware(['auth', 'verified'])->name('bin.index');

Route::post('/bin/{id}/restore', function ($id) {
    \App\Models\ArchiveFile::onlyTrashed()->findOrFail($id)->restore();
    return redirect()->back()->with('success', 'Restored successfully.');
})->middleware(['auth', 'verified'])->name('bin.restore');

Route::delete('/bin/{id}/force', function ($id) {
    \App\Models\ArchiveFile::onlyTrashed()->findOrFail($id)->forceDelete();
    return redirect()->back()->with('success', 'Permanently deleted.');
})->middleware(['auth', 'verified'])->name('bin.forceDelete');

Route::get('/favorites', function (\Illuminate\Http\Request $request) {
    $favoriteIds = \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', auth()->id())
        ->pluck('archive_file_id');

    $all = \App\Models\ArchiveFile::whereIn('id', $favoriteIds)
        ->with(['category', 'user'])
        ->get();

    // Split into three groups for the UI
    $documents = $all->filter(fn($f) => !in_array($f->metadata['type'] ?? '', ['link', 'folder']))->values();
    $folders   = $all->filter(fn($f) => ($f->metadata['type'] ?? '') === 'folder')->values();
    $links     = $all->filter(fn($f) => ($f->metadata['type'] ?? '') === 'link')->values();

    return Inertia::render('Favorites', [
        'documents' => $documents,
        'folders'   => $folders,
        'links'     => $links,
    ]);
})->middleware(['auth', 'verified'])->name('favorites.index');

Route::post('/favorites/{id}', function ($id) {
    \Illuminate\Support\Facades\DB::table('favorites')->updateOrInsert(
        ['user_id' => auth()->id(), 'archive_file_id' => $id]
    );
    return redirect()->back()->with('success', 'Added to favorites.');
})->middleware(['auth', 'verified'])->name('favorites.store');

Route::delete('/favorites/{id}', function ($id) {
    \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', auth()->id())
        ->where('archive_file_id', $id)
        ->delete();
    return redirect()->back()->with('success', 'Removed from favorites.');
})->middleware(['auth', 'verified'])->name('favorites.destroy');

Route::get('/security', function () {
    abort_unless(auth()->user()->is_director || auth()->user()->is_assistant, 403);

    return Inertia::render('AccountManagement', [
        'users' => \App\Models\User::all(),
        'logs' => \App\Models\ActivityLog::with('user')->latest()->take(20)->get(),
    ]);
})->middleware(['auth', 'verified'])->name('security');

Route::post('/security/users', function (\Illuminate\Http\Request $request) {
    abort_unless($request->user()->is_director || $request->user()->is_assistant, 403);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'role' => 'required|in:staff,assistant',
    ]);

    abort_unless(
        $validated['role'] === 'staff' || $request->user()->is_director,
        403,
        'Only the director can create an Admin Assistant account.'
    );

    $newUser = \App\Models\User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        'is_assistant' => $validated['role'] === 'assistant',
        'is_staff' => $validated['role'] === 'staff',
        'status' => 'active',
    ]);

    \App\Models\ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => $validated['role'] === 'assistant' ? 'created_assistant_account' : 'created_staff_account',
        'type' => 'auth',
        'location' => 'System'
    ]);

    $roleLabel = $validated['role'] === 'assistant' ? 'Admin Assistant' : 'Staff';
    return redirect()->back()->with('success', "{$roleLabel} account created.");
})->middleware(['auth', 'verified'])->name('security.users.store');

Route::patch('/security/users/{id}/permissions', function (\Illuminate\Http\Request $request, $id) {
    abort_unless($request->user()->is_director, 403);

    $target = \App\Models\User::where('is_assistant', true)->findOrFail($id);
    $validated = $request->validate([
        'can_access_critic_reports' => 'required|boolean',
        'can_manage_critics' => 'required|boolean',
    ]);

    $target->update($validated);

    \App\Models\ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => 'updated_assistant_permissions',
        'type' => 'auth',
        'location' => 'System',
    ]);

    return redirect()->back()->with('success', "Permissions updated for {$target->name}.");
})->middleware(['auth', 'verified'])->name('security.users.permissions');

// Promote an admin_assistant to admin (director only)
Route::patch('/security/users/{id}/promote', function (\Illuminate\Http\Request $request, $id) {
    // Only directors can promote
    if (! $request->user()->is_director) {
        abort(403, 'Only the director can promote users.');
    }

    $target = \App\Models\User::findOrFail($id);

    // Only assistants can be promoted
    if (! $target->is_assistant) {
        return redirect()->back()->withErrors(['promote' => 'Only admin assistants can be promoted.']);
    }

    $target->update(['is_assistant' => false, 'is_staff' => true]);

    return redirect()->back()->with('success', "{$target->name} has been promoted to Admin.");
})->middleware(['auth', 'verified'])->name('security.users.promote');

// Demote an admin back to assistant (director only)
Route::patch('/security/users/{id}/demote', function (\Illuminate\Http\Request $request, $id) {
    if (! $request->user()->is_director) {
        abort(403, 'Only the director can demote users.');
    }

    $target = \App\Models\User::findOrFail($id);

    if (! $target->is_staff) {
        return redirect()->back()->withErrors(['demote' => 'Only admins can be demoted.']);
    }

    $target->update(['is_staff' => false, 'is_assistant' => true]);

    return redirect()->back()->with('success', "{$target->name} has been demoted to Assistant.");
})->middleware(['auth', 'verified'])->name('security.users.demote');

// Reset a user's password to a temporary one
Route::patch('/security/users/{id}/reset-password', function (\Illuminate\Http\Request $request, $id) {
    abort_unless($request->user()->is_director || $request->user()->is_assistant, 403);

    $request->validate(['password' => 'required|string|min:8']);
    $target = \App\Models\User::findOrFail($id);
    $target->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
    return redirect()->back()->with('success', 'Password reset successfully.');
})->middleware(['auth', 'verified'])->name('security.users.reset-password');

// Toggle active/inactive status (using a status column if present, else just track via role)
Route::patch('/security/users/{id}/toggle-status', function ($id) {
    abort_unless(auth()->user()->is_director || auth()->user()->is_assistant, 403);

    $target = \App\Models\User::findOrFail($id);
    $current = $target->status === 'active';
    $target->update(['status' => $current ? 'deactivated' : 'active']);
    return redirect()->back()->with('success', $current ? 'User deactivated.' : 'User activated.');
})->middleware(['auth', 'verified'])->name('security.users.toggle-status');

// Permanently delete a user account
Route::delete('/security/users/{id}', function ($id) {
    $target = \App\Models\User::findOrFail($id);
    // Prevent deleting yourself
    if ($target->id === auth()->id()) {
        return redirect()->back()->withErrors(['delete' => 'You cannot delete your own account.']);
    }
    $target->delete();
    return redirect()->back()->with('success', 'Account deleted.');
})->middleware(['auth', 'verified'])->name('security.users.destroy');

// Temporary — UML Activity Diagram page (remove before production)
Route::get('/activity-diagram', function () {
    return Inertia::render('ActivityDiagram');
})->middleware(['auth', 'verified'])->name('activity-diagram');

// ── Client Request Management (admin) ───────────────────────────────────────
Route::get('/requests', function () {
    $requests = \App\Models\ClientRequest::with('reviewer')
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('RequestManagement', [
        'requests' => $requests,
    ]);
})->middleware(['auth', 'verified'])->name('requests.index');

// Approve or reject a request (Director or English Critic)
Route::patch('/requests/{id}/review', function (\Illuminate\Http\Request $request, $id) {
    abort_unless($request->user()->is_director || $request->user()->is_critic, 403);

    $request->validate([
        'status'             => 'required|in:approved,rejected',
        'admin_signature'    => 'nullable|string',
        'admin_printed_name' => 'nullable|string|max:150',
    ]);

    $cr = \App\Models\ClientRequest::findOrFail($id);
    $cr->update([
        'status'             => $request->status,
        'reviewed_by'        => auth()->id(),
        'reviewed_at'        => now(),
        'admin_signature'    => $request->admin_signature,
        'admin_printed_name' => $request->admin_printed_name ?? auth()->user()->name,
    ]);

    return redirect()->back()->with('success', "Request {$cr->reference_number} {$request->status}.");
})->middleware(['auth', 'verified'])->name('requests.review');

// Analytics dashboard data
Route::get('/requests/analytics', function () {
    $year  = request()->query('year', now()->year);
    $month = request()->query('month');

    $query = \App\Models\ClientRequest::whereYear('created_at', $year);
    if ($month) $query->whereMonth('created_at', $month);

    $all = $query->get();

    // Monthly totals for the selected year
    $monthly = \App\Models\ClientRequest::whereYear('created_at', $year)
        ->selectRaw("strftime('%m', created_at) as month, count(*) as total")
        ->groupByRaw("strftime('%m', created_at)")
        ->orderByRaw("strftime('%m', created_at)")
        ->pluck('total', 'month');

    // Service distribution — flatten all services arrays
    $serviceCounts = [];
    foreach ($all as $r) {
        foreach ($r->services ?? [] as $svc) {
            $serviceCounts[$svc] = ($serviceCounts[$svc] ?? 0) + 1;
        }
    }

    // Language demand
    $languageCounts = [];
    foreach ($all as $r) {
        foreach ($r->language_options ?? [] as $lang) {
            $languageCounts[$lang] = ($languageCounts[$lang] ?? 0) + 1;
        }
    }

    return response()->json([
        'total'          => $all->count(),
        'pending'        => $all->where('status', 'pending')->count(),
        'approved'       => $all->where('status', 'approved')->count(),
        'rejected'       => $all->where('status', 'rejected')->count(),
        'monthly'        => $monthly,
        'services'       => $serviceCounts,
        'languages'      => $languageCounts,
        'available_years'=> \App\Models\ClientRequest::selectRaw("strftime('%Y', created_at) as y")
                                ->groupByRaw("strftime('%Y', created_at)")
                                ->pluck('y'),
    ]);
})->middleware(['auth', 'verified'])->name('requests.analytics');

Route::post('/categories', [CategoryController::class, 'store'])->middleware(['auth', 'verified'])->name('categories.store');

Route::post('/share-link', [ShareController::class, 'generate'])
    ->middleware(['auth', 'verified'])
    ->name('share.generate');

Route::get('/share/{token}', [ShareController::class, 'show'])
    ->name('share.view');

// API: fetch folders for the Move modal folder picker
Route::get('/api/folders', function (\Illuminate\Http\Request $request) {
    $parentId = $request->query('parent_id'); // null = root
    $exclude  = $request->query('exclude');   // id of the item being moved (skip it)

    $query = \App\Models\ArchiveFile::select('id', 'title', 'folder_id', 'metadata')
        ->whereJsonContains('metadata->type', 'folder')
        ->whereHas('category', function ($q) { $q->where('name', 'general_doc'); });

    if ($parentId) {
        $query->where('folder_id', $parentId);
    } else {
        $query->whereNull('folder_id');
    }

    // Exclude the item being moved and all its descendants to prevent circular moves
    if ($exclude) {
        $query->where('id', '!=', $exclude);
    }

    return response()->json($query->orderBy('title')->get());
})->middleware(['auth', 'verified']);

// Move a file/folder to a different parent folder
Route::patch('/documents/{id}/move', function (\Illuminate\Http\Request $request, $id) {
    $request->validate([
        'destination_folder_id' => 'nullable|exists:archive_files,id',
        'current_path'          => 'nullable|string',
    ]);

    $file = \App\Models\ArchiveFile::findOrFail($id);

    // Prevent moving a folder into itself or its own descendant
    if ($request->destination_folder_id) {
        $dest = \App\Models\ArchiveFile::find($request->destination_folder_id);
        $node = $dest;
        while ($node) {
            if ($node->id === $file->id) {
                return back()->withErrors(['move' => 'Cannot move a folder into itself.']);
            }
            $node = $node->folder_id ? \App\Models\ArchiveFile::find($node->folder_id) : null;
        }
    }

    $file->update(['folder_id' => $request->destination_folder_id]);

    $path = $request->input('current_path', '');
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Moved successfully.');
})->middleware(['auth', 'verified'])->name('documents.move');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
