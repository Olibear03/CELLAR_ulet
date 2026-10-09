<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $canManageCritics = (bool) ($user?->canManageCritics());

        return [
            ...parent::share($request),
            'auth' => [
                'user'         => $user,
                'is_director'  => (bool) ($user?->is_director),
                'is_assistant' => (bool) ($user?->is_assistant),
                'is_staff'     => (bool) ($user?->is_staff),
                'is_critic'    => (bool) ($user?->is_critic),
                'can_access_critic_reports' => (bool) ($user?->canAccessCriticReports()),
                'can_manage_critics' => $canManageCritics,
                'status'       => $user?->status,
            ],
            'notifications' => $canManageCritics ? [
                'unread_count' => $user->unreadNotifications()->count(),
                'items' => $user->unreadNotifications()
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => $notification->id,
                        'data' => $notification->data,
                        'created_at' => $notification->created_at,
                    ])
                    ->values(),
            ] : ['unread_count' => 0, 'items' => []],
        ];
    }
}
