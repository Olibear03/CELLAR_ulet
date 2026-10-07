<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CriticManagementActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_director_can_activate_deactivate_and_reset_a_critic_account(): void
    {
        $director = User::factory()->director()->create();
        $critic = User::factory()->critic()->create(['status' => 'deactivated']);

        $this->actingAs($director)
            ->patch(route('critic.management.approve', $critic))
            ->assertRedirect();
        $this->assertSame('active', $critic->fresh()->status);

        $this->patch(route('critic.management.deactivate', $critic))
            ->assertRedirect();
        $this->assertSame('deactivated', $critic->fresh()->status);

        $this->patch(route('critic.management.reset-password', $critic), [
            'password' => 'updated-password',
        ])->assertRedirect();
        $this->assertTrue(Hash::check('updated-password', $critic->fresh()->password));
    }

    public function test_director_can_delete_another_critic_account(): void
    {
        $director = User::factory()->director()->create();
        $critic = User::factory()->critic()->create();

        $this->actingAs($director)
            ->delete(route('critic.management.destroy', $critic))
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $critic->id]);
    }

    public function test_director_cannot_delete_their_own_critic_account(): void
    {
        $directorCritic = User::factory()->director()->create(['is_critic' => true]);

        $this->actingAs($directorCritic)
            ->delete(route('critic.management.destroy', $directorCritic))
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $directorCritic->id]);
    }
}
