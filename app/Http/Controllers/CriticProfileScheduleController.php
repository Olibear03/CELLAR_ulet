<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CriticProfileScheduleController extends Controller
{
    private const DAYS = ['monday', 'wednesday', 'friday'];

    public function edit(Request $request): Response
    {
        abort_unless($request->user()->is_critic || $request->user()->is_director, 403);

        return Inertia::render('CriticProfileSchedule', [
            'profile' => $request->user()->only([
                'name',
                'email',
                'college',
                'professional_title',
                'department',
                'office_location',
                'availability_status',
                'office_hours',
                'max_queue_limit',
            ]),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->is_critic || $request->user()->is_director, 403);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($request->user()->id),
            ],
            'college' => ['nullable', 'string', 'max:100'],
            'professional_title' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:150'],
            'office_location' => ['nullable', 'string', 'max:255'],
            'availability_status' => ['required', Rule::in(['accepting', 'unavailable'])],
            'max_queue_limit' => ['required', 'integer', 'between:1,100'],
            'office_hours' => ['required', 'array'],
        ];

        foreach (self::DAYS as $day) {
            $rules["office_hours.{$day}.enabled"] = ['required', 'boolean'];
            $rules["office_hours.{$day}.start"] = [
                'nullable',
                'required_if:office_hours.'.$day.'.enabled,1,true',
                'date_format:H:i',
            ];
            $rules["office_hours.{$day}.end"] = [
                'nullable',
                'required_if:office_hours.'.$day.'.enabled,1,true',
                'date_format:H:i',
                'after:office_hours.'.$day.'.start',
            ];
        }

        $validated = $request->validate($rules);
        $user = $request->user();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('critic.profile-schedule.edit')
            ->with('success', 'Profile and schedule updated.');
    }
}
