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
}
