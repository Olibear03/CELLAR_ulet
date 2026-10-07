<?php

namespace App\Http\Controllers;

use App\Models\ClientRequest;
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
}
