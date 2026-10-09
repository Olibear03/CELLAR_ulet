<?php

namespace Tests\Feature;

use App\Models\ClientRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriticRequestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_critic_can_view_requests_queue_with_existing_request_details(): void
    {
        $critic = User::factory()->critic()->create(['status' => 'active']);
        $clientRequest = ClientRequest::create([
            'reference_number' => 'CR-TEST-REQUEST-001',
            'client_name' => 'Juan Dela Cruz',
            'address' => 'Indang, Cavite',
            'occupation' => 'Student',
            'contact_number' => '09123456789',
            'email' => 'juan@example.com',
            'services' => ['Editing'],
            'research_title' => 'Research Paper Title',
            'request_date' => now()->toDateString(),
            'status' => 'pending',
        ]);

        $this->actingAs($critic)
            ->get(route('critic.requests'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CriticRequests')
                ->has('requests', 1)
                ->where('requests.0.id', $clientRequest->id)
                ->where('requests.0.client_name', 'Juan Dela Cruz')
                ->where('requests.0.status', 'pending')
                ->where('availabilityStatus', 'accepting')
                ->where('queueLimit', 10)
            );
    }

    public function test_non_critic_cannot_view_critic_request_queue(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('critic.requests'))
            ->assertForbidden();
    }

    public function test_critic_can_toggle_availability_for_student_requests(): void
    {
        $critic = User::factory()->critic()->create([
            'status' => 'active',
            'availability_status' => 'accepting',
        ]);

        $this->actingAs($critic)
            ->patch(route('critic.requests.availability'), ['availability_status' => 'unavailable'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('unavailable', $critic->fresh()->availability_status);

        $this->get(route('critic.requests'))
            ->assertInertia(fn ($page) => $page->where('availabilityStatus', 'unavailable'));

        $this->patch(route('critic.requests.availability'), ['availability_status' => 'accepting'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('accepting', $critic->fresh()->availability_status);
    }

    public function test_only_active_critics_are_listed_for_student_requests(): void
    {
        User::factory()->critic()->create([
            'name' => 'Available Critic',
            'college' => 'CAS',
            'status' => 'active',
            'availability_status' => 'accepting',
        ]);
        User::factory()->critic()->create([
            'name' => 'Unavailable Critic',
            'college' => 'CAS',
            'status' => 'active',
            'availability_status' => 'unavailable',
        ]);
        User::factory()->critic()->create([
            'name' => 'Pending Critic',
            'college' => 'CAS',
            'status' => 'pending',
            'availability_status' => 'accepting',
        ]);
        User::factory()->critic()->create([
            'name' => 'Deactivated Critic',
            'college' => 'CAS',
            'status' => 'deactivated',
            'availability_status' => 'accepting',
        ]);
        User::factory()->create([
            'name' => 'Regular User',
            'college' => 'CAS',
            'status' => 'active',
        ]);
        $deletedCritic = User::factory()->critic()->create([
            'name' => 'Deleted Critic',
            'college' => 'CAS',
            'status' => 'active',
        ]);
        $deletedCritic->delete();

        $this->get(route('public-critics'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('PublicAccreditedCritics')
                ->has('accreditedCritics', 1)
                ->where('accreditedCritics.0.code', 'CAS')
                ->where('accreditedCritics.0.list.0', 'Available Critic')
                ->where('accreditedCritics.0.list.1', 'Unavailable Critic')
                ->has('accreditedCritics.0.list', 2)
                ->has('requestColleges', 1)
                ->where('requestColleges.0.code', 'CAS')
                ->where('requestColleges.0.list.0', 'Available Critic')
                ->where('requestColleges.0.list.1', 'Unavailable Critic')
                ->has('requestColleges.0.list', 2)
            );
    }

    public function test_non_critic_cannot_change_critic_request_availability(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('critic.requests.availability'), ['availability_status' => 'unavailable'])
            ->assertForbidden();
    }
}
