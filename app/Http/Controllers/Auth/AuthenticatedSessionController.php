<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'portal' => in_array($request->string('portal')->value(), ['operator', 'evaluator'], true)
                ? $request->string('portal')->value()
                : null,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();
        $portal = $request->string('portal')->value();

        $allowed = match ($portal) {
            'evaluator' => $user->is_critic,
            'operator' => $user->is_director || $user->is_assistant || $user->is_staff,
            default => true,
        };

        if (! $allowed) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => $portal === 'evaluator'
                    ? 'This portal is for English Critics only.'
                    : 'This portal is for CELLAR Directors, Admin Assistants, and Staff only.',
            ]);
        }

        // Block non-director users who aren't active yet
        if (! $user->is_director) {
            if ($user->status === 'pending') {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => 'Your account is pending approval. Please wait for an administrator to activate your account.',
                ]);
            }

            if ($user->status === 'deactivated') {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => 'Your account has been deactivated. Please contact the administrator.',
                ]);
            }
        }

        $request->session()->regenerate();

        \App\Models\ActivityLog::create([
            'user_id'  => Auth::id(),
            'action'   => 'sign_in',
            'type'     => 'auth',
            'location' => 'System',
        ]);

        // Critics land on their workspace; everyone else → dashboard
        if ($user->is_critic && ! $user->is_director && ! $user->is_assistant && ! $user->is_staff) {
            return redirect()->route('critic.dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
