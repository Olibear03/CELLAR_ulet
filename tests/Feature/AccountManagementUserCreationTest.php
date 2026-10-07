<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountManagementUserCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_director_can_create_staff_and_assistant_as_distinct_roles(): void
    {
        $director = User::factory()->director()->create();

        $this->actingAs($director)
            ->post(route('security.users.store'), [
                'name' => 'New Staff',
                'email' => 'new.staff@example.com',
                'password' => 'temporary-password',
                'role' => 'staff',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $staff = User::where('email', 'new.staff@example.com')->firstOrFail();
        $this->assertTrue($staff->is_staff);
        $this->assertFalse($staff->is_assistant);

        $this->post(route('security.users.store'), [
            'name' => 'New Assistant',
            'email' => 'new.assistant@example.com',
            'password' => 'temporary-password',
            'role' => 'assistant',
        ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $assistant = User::where('email', 'new.assistant@example.com')->firstOrFail();
        $this->assertTrue($assistant->is_assistant);
        $this->assertFalse($assistant->is_staff);
    }

    public function test_assistant_can_create_staff_but_cannot_create_another_assistant(): void
    {
        $assistant = User::factory()->assistant()->create();

        $this->actingAs($assistant)
            ->post(route('security.users.store'), [
                'name' => 'New Staff',
                'email' => 'assistant.created.staff@example.com',
                'password' => 'temporary-password',
                'role' => 'staff',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $staff = User::where('email', 'assistant.created.staff@example.com')->firstOrFail();
        $this->assertTrue($staff->is_staff);
        $this->assertFalse($staff->is_assistant);

        $this->post(route('security.users.store'), [
            'name' => 'Unauthorized Assistant',
            'email' => 'unauthorized.assistant@example.com',
            'password' => 'temporary-password',
            'role' => 'assistant',
        ])->assertForbidden();
    }
}
