<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriticProfileScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_critic_can_view_and_update_their_profile_and_schedule(): void
    {
        $critic = User::factory()->critic()->create(['status' => 'active']);

        $this->actingAs($critic)
            ->get(route('critic.profile-schedule.edit'))
            ->assertOk();

        $this->actingAs($critic)
            ->put(route('critic.profile-schedule.update'), [
                'name' => 'Dr. Critic',
                'email' => $critic->email,
                'college' => 'CED',
                'professional_title' => 'Dr.',
                'department' => 'English Department',
                'office_location' => 'CED Building - Room 204',
                'availability_status' => 'accepting',
                'max_queue_limit' => 10,
                'office_hours' => [
                    'monday' => ['enabled' => true, 'start' => '13:00', 'end' => '16:00'],
                    'wednesday' => ['enabled' => true, 'start' => '09:00', 'end' => '12:00'],
                    'friday' => ['enabled' => false, 'start' => '', 'end' => ''],
                ],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('critic.profile-schedule.edit'));

        $critic->refresh();
        $this->assertSame('CED', $critic->college);
        $this->assertSame('CED Building - Room 204', $critic->office_location);
        $this->assertSame('13:00', $critic->office_hours['monday']['start']);
        $this->assertSame(10, $critic->max_queue_limit);
    }

    public function test_non_critic_cannot_access_the_critic_profile_and_schedule(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('critic.profile-schedule.edit'))
            ->assertForbidden();
    }
}
