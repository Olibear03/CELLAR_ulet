<?php

namespace Tests\Feature;

use App\Models\CriticSummaryReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriticEarningsTest extends TestCase
{
    use RefreshDatabase;

    public function test_critic_earnings_only_include_the_authenticated_critics_records(): void
    {
        $critic = User::factory()->critic()->create(['status' => 'active']);
        $otherCritic = User::factory()->critic()->create(['status' => 'active']);
        $ownReport = $this->createReport($critic, ['total_amount' => 840, 'payment_status' => 'pending']);
        $this->createReport($otherCritic, ['total_amount' => 1500, 'payment_status' => 'paid']);

        $this->actingAs($critic)
            ->get(route('critic.earnings'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CriticEarnings')
                ->has('reports', 1)
                ->where('reports.0.id', $ownReport->id)
                ->where('reports.0.payment_status', 'pending')
            );
    }

    public function test_critic_cannot_access_another_role_earnings_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('critic.earnings'))
            ->assertForbidden();
    }

    public function test_critic_certification_and_official_receipt_pages_are_removed(): void
    {
        $critic = User::factory()->critic()->create(['status' => 'active']);

        $this->actingAs($critic)
            ->get('/submit-report')
            ->assertNotFound();

        $this->get('/official-receipt')->assertNotFound();

        $this->assertFalse(\Illuminate\Support\Facades\Route::has('critic.report.create'));
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('critic.report.store'));
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('critic.receipt.create'));
    }

    public function test_director_can_update_disbursement_status_and_audit_fields(): void
    {
        $director = User::factory()->director()->create();
        $report = $this->createReport(User::factory()->critic()->create(['status' => 'active']));

        $this->actingAs($director)
            ->patch(route('critic.reports.payment-status', $report), ['payment_status' => 'paid'])
            ->assertSessionHasNoErrors();

        $report->refresh();
        $this->assertSame('paid', $report->payment_status);
        $this->assertSame($director->id, $report->paid_by);
        $this->assertNotNull($report->paid_at);

        $this->actingAs($director)
            ->patch(route('critic.reports.payment-status', $report), ['payment_status' => 'pending'])
            ->assertSessionHasNoErrors();

        $report->refresh();
        $this->assertSame('pending', $report->payment_status);
        $this->assertNull($report->paid_by);
        $this->assertNull($report->paid_at);
    }

    public function test_critic_cannot_update_disbursement_status(): void
    {
        $critic = User::factory()->critic()->create(['status' => 'active']);
        $report = $this->createReport($critic);

        $this->actingAs($critic)
            ->patch(route('critic.reports.payment-status', $report), ['payment_status' => 'paid'])
            ->assertForbidden();
    }

    private function createReport(User $critic, array $overrides = []): CriticSummaryReport
    {
        return CriticSummaryReport::create(array_merge([
            'user_id' => $critic->id,
            'student_name' => 'Test Student',
            'course_degree' => 'BA English',
            'manuscript_title' => 'Test Manuscript',
            'document_type' => 'thesis',
            'times_read' => 2,
            'page_count' => 180,
            'total_amount' => 840,
            'or_number' => 'OR-TEST-'.$critic->id.'-'.uniqid(),
            'payment_status' => null,
        ], $overrides));
    }
}
