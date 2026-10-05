<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_roles_can_use_the_operator_portal(): void
    {
        foreach ([User::factory()->director()->create(), User::factory()->assistant()->create(), User::factory()->staff()->create()] as $user) {
            $this->post('/login', [
                'email' => $user->email,
                'password' => 'password',
                'portal' => 'operator',
            ])->assertRedirect(route('dashboard', absolute: false));

            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
        }
    }

    public function test_critic_can_use_the_evaluator_portal(): void
    {
        $user = User::factory()->critic()->create();
        $user->update(['status' => 'active']);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'portal' => 'evaluator',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('critic.dashboard', absolute: false));
    }

    public function test_critic_cannot_use_the_operator_portal(): void
    {
        $user = User::factory()->critic()->create();

        $this->from('/login?portal=operator')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'portal' => 'operator',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_operator_cannot_use_the_evaluator_portal(): void
    {
        $user = User::factory()->director()->create();

        $this->from('/login?portal=evaluator')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'portal' => 'evaluator',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
