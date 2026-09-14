<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class CriticRegisterController extends Controller
{
    /**
     * Show the critic self-registration form.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/CriticRegister');
    }

    /**
     * Handle critic self-registration.
     * Sets is_critic = true and status = 'pending' — no auto-login.
     */
    public function store(Request $request): RedirectResponse|Response
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:' . User::class,
                function ($attribute, $value, $fail) {
                    if (! str_ends_with(strtolower($value), '@cvsu.edu.ph')) {
                        $fail('Only @cvsu.edu.ph email addresses are permitted to register.');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'is_critic'  => true,
            'status'     => 'pending',
        ]);

        // Do NOT log in — account must be approved first
        return Inertia::render('Auth/CriticRegisterSuccess');
    }
}
