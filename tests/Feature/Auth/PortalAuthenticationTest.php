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
        foreach ([
            'director' => User::factory()->director()->create(),
            'assistant' => User::factory()->assistant()->create(),
            'staff' => User::factory()->staff()->create(),
        ] as $role => $user) {
            $this->post('/login', [
                'email' => $user->email,
                'password' => 'password',
                'portal' => 'operator',
                'operator_role' => $role,
            ])->assertRedirect(route('dashboard', absolute: false));

            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
        }
    }

    public function test_operator_role_selection_must_match_the_account_role(): void
    {
        $users = [
            'director' => User::factory()->director()->create(),
            'assistant' => User::factory()->assistant()->create(),
            'staff' => User::factory()->staff()->create(),
        ];

        foreach ($users as $actualRole => $user) {
            foreach (array_diff(['director', 'assistant', 'staff'], [$actualRole]) as $selectedRole) {
                $this->from('/login?portal=operator')->post('/login', [
                    'email' => $user->email,
                    'password' => 'password',
                    'portal' => 'operator',
                    'operator_role' => $selectedRole,
                ])->assertSessionHasErrors('operator_role');

                $this->assertGuest();
            }
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
