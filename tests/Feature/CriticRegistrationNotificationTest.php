<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CriticRegisteredNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriticRegistrationNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_critic_registration_notifies_directors_and_critic_managing_assistants(): void
    {
        $director = User::factory()->director()->create();
        $authorizedAssistant = User::factory()->assistant()->create([
            'can_manage_critics' => true,
        ]);
        $unauthorizedAssistant = User::factory()->assistant()->create();

        $this->post(route('critic.register.store'), [
            'name' => 'New Critic',
            'college' => 'CAS',
            'email' => 'new.critic@cvsu.edu.ph',
            'password' => 'long-password',
            'password_confirmation' => 'long-password',
        ])->assertOk()
            ->assertInertia(fn ($page) => $page->component('Auth/CriticRegisterSuccess'));

        $critic = User::where('email', 'new.critic@cvsu.edu.ph')->firstOrFail();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $director->id,
            'notifiable_type' => User::class,
            'data' => json_encode([
                'type' => 'critic_registered',
                'critic_id' => $critic->id,
                'name' => 'New Critic',
                'email' => 'new.critic@cvsu.edu.ph',
                'college' => 'CAS',
                'message' => 'New Critic registered as an English Critic and is awaiting review.',
            ]),
        ]);
        $this->assertSame(1, $director->unreadNotifications()->count());
        $this->assertSame(1, $authorizedAssistant->unreadNotifications()->count());
        $this->assertSame(0, $unauthorizedAssistant->notifications()->count());
    }

    public function test_notification_click_marks_it_read_and_opens_critic_management(): void
    {
        $director = User::factory()->director()->create();
        $critic = User::factory()->critic()->create();
        $director->notify(new CriticRegisteredNotification($critic));
        $notification = $director->notifications()->firstOrFail();

        $this->actingAs($director)
            ->get(route('critic.management'))
            ->assertInertia(fn ($page) => $page
                ->where('notifications.unread_count', 1)
                ->where('notifications.items.0.id', $notification->id)
                ->where('notifications.items.0.data.name', $critic->name));

        $this->actingAs($director)
            ->get(route('notifications.critic-management', $notification->id))
            ->assertRedirect(route('critic.management'));

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_notification_click_is_restricted_to_users_who_can_manage_critics(): void
    {
        $assistant = User::factory()->assistant()->create();
        $director = User::factory()->director()->create();
        $critic = User::factory()->critic()->create();
        $director->notify(new CriticRegisteredNotification($critic));
        $notification = $director->notifications()->firstOrFail();

        $this->actingAs($assistant)
            ->get(route('notifications.critic-management', $notification->id))
            ->assertForbidden();

        $this->assertNull($notification->fresh()->read_at);
    }
}
