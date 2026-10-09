<?php

namespace App\Http\Controllers;

use App\Models\ClientRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CriticQueueController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->is_critic || $request->user()->is_director, 403);

        return Inertia::render('CriticRequests', [
            'requests' => ClientRequest::query()
                ->latest()
                ->get(),
            'availabilityStatus' => $request->user()->availability_status ?? 'accepting',
            'queueLimit' => $request->user()->max_queue_limit ?? 10,
        ]);
    }

    public function updateAvailability(Request $request): RedirectResponse
    {
        abort_unless($request->user()->is_critic || $request->user()->is_director, 403);

        $validated = $request->validate([
            'availability_status' => ['required', 'in:accepting,unavailable'],
        ]);

        $request->user()->update($validated);

        return redirect()->back()->with(
            'success',
            $validated['availability_status'] === 'accepting'
                ? 'You are now accepting student requests.'
                : 'You are no longer listed for new student requests.'
        );
    }
}
