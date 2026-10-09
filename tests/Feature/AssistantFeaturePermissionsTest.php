<?php

namespace Tests\Feature;

use App\Models\CriticSummaryReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AssistantFeaturePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_director_can_register_an_active_critic(): void
    {
        $director = User::factory()->director()->create();

        $this->actingAs($director)
            ->post(route('critic.management.store'), [
                'name' => 'New Critic',
                'college' => 'CAS',
                'email' => 'new.critic@cvsu.edu.ph',
                'password' => 'temporary-password',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $critic = User::where('email', 'new.critic@cvsu.edu.ph')->firstOrFail();
        $this->assertTrue($critic->is_critic);
        $this->assertSame('active', $critic->status);
        $this->assertSame('CAS', $critic->college);
        $this->assertTrue(Hash::check('temporary-password', $critic->password));
    }

    public function test_only_directors_can_change_assistant_feature_permissions(): void
    {
        $director = User::factory()->director()->create();
        $assistant = User::factory()->assistant()->create();

        $this->actingAs($director)
            ->patch(route('security.users.permissions', $assistant), [
                'can_access_critic_reports' => true,
                'can_manage_critics' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertTrue($assistant->fresh()->can_access_critic_reports);
        $this->assertTrue($assistant->fresh()->can_manage_critics);

        $this->actingAs($assistant)
            ->patch(route('security.users.permissions', $assistant), [
                'can_access_critic_reports' => false,
                'can_manage_critics' => false,
            ])
            ->assertForbidden();
    }

    public function test_assistant_feature_permissions_gate_the_corresponding_pages(): void
    {
        $assistant = User::factory()->assistant()->create();

        $this->actingAs($assistant)
            ->get(route('critic.reports.index'))
            ->assertForbidden();

        $this->get(route('critic.management'))->assertForbidden();

        $assistant->update([
            'can_access_critic_reports' => true,
            'can_manage_critics' => true,
        ]);

        $this->get(route('critic.reports.index'))->assertOk();
        $this->get(route('critic.management'))->assertOk();
    }

    public function test_billing_report_permission_also_controls_payment_updates(): void
    {
        $assistant = User::factory()->assistant()->create([
            'can_access_critic_reports' => true,
        ]);
        $critic = User::factory()->critic()->create(['status' => 'active']);
        $report = CriticSummaryReport::create([
            'user_id' => $critic->id,
            'student_name' => 'Test Student',
            'course_degree' => 'BA English',
            'manuscript_title' => 'Test Manuscript',
            'document_type' => 'thesis',
            'times_read' => 2,
            'page_count' => 180,
            'total_amount' => 840,
            'or_number' => 'OR-TEST-001',
            'payment_status' => 'pending',
        ]);

        $this->actingAs($assistant)
            ->patch(route('critic.reports.payment-status', $report), ['payment_status' => 'paid'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('paid', $report->fresh()->payment_status);
        $this->assertSame($assistant->id, $report->fresh()->paid_by);
    }

    public function test_director_using_the_critic_role_can_open_the_shared_billing_report(): void
    {
        $directorCritic = User::factory()->director()->create(['is_critic' => true]);

        $this->actingAs($directorCritic)
            ->get(route('critic.reports.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('CriticSummaryReports'));
    }

    public function test_only_directors_can_register_critics_and_cvsu_email_is_required(): void
    {
        $assistant = User::factory()->assistant()->create();

        $this->actingAs($assistant)
            ->post(route('critic.management.store'), [
                'name' => 'New Critic',
                'college' => 'CAS',
                'email' => 'new.critic@cvsu.edu.ph',
                'password' => 'temporary-password',
            ])
            ->assertForbidden();

        $director = User::factory()->director()->create();
        $this->actingAs($director)
            ->post(route('critic.management.store'), [
                'name' => 'New Critic',
                'college' => 'CAS',
                'email' => 'new.critic@example.com',
                'password' => 'temporary-password',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_director_can_transfer_ownership_to_a_critic_after_password_confirmation(): void
    {
        $director = User::factory()->director()->create();
        $director->forceFill(['password' => \Illuminate\Support\Facades\Hash::make('director-password')])->save();
        $critic = User::factory()->critic()->create(['status' => 'pending']);

        $this->actingAs($director)
            ->post(route('critic.management.transfer-ownership'), [
                'target_user_id' => $critic->id,
                'password' => 'director-password',
            ])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHasNoErrors();

        $this->assertTrue($critic->fresh()->is_director);
        $this->assertTrue($critic->fresh()->is_critic);
        $this->assertSame('active', $critic->fresh()->status);
        $this->assertFalse($director->fresh()->is_director);
        $this->assertTrue($director->fresh()->is_staff);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $director->id,
            'action' => 'transferred_director_ownership',
        ]);
    }

    public function test_ownership_transfer_requires_the_current_users_password(): void
    {
        $director = User::factory()->director()->create();
        $director->forceFill(['password' => \Illuminate\Support\Facades\Hash::make('director-password')])->save();
        $critic = User::factory()->critic()->create();

        $this->actingAs($director)
            ->post(route('critic.management.transfer-ownership'), [
                'target_user_id' => $critic->id,
                'password' => 'wrong-password',
            ])
            ->assertSessionHasErrors('transfer');

        $this->assertFalse($critic->fresh()->is_director);
        $this->assertTrue($director->fresh()->is_director);
    }

    public function test_director_cannot_transfer_ownership_to_a_staff_member(): void
    {
        $director = User::factory()->director()->create();
        $director->forceFill(['password' => Hash::make('director-password')])->save();
        $staff = User::factory()->staff()->create();

        $this->actingAs($director)
            ->post(route('critic.management.transfer-ownership'), [
                'target_user_id' => $staff->id,
                'password' => 'director-password',
            ])
            ->assertUnprocessable();

        $this->assertFalse($staff->fresh()->is_director);
        $this->assertTrue($director->fresh()->is_director);
        $this->assertFalse($director->fresh()->is_staff);
    }

    public function test_assistant_cannot_transfer_ownership_to_an_english_critic(): void
    {
        $assistant = User::factory()->assistant()->create();
        $critic = User::factory()->critic()->create();

        $this->actingAs($assistant)
            ->post(route('critic.management.transfer-ownership'), [
                'target_user_id' => $critic->id,
                'password' => 'password',
            ])
            ->assertForbidden();

        $this->assertFalse($critic->fresh()->is_director);
    }
}
