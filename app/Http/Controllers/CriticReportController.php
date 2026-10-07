<?php

namespace App\Http\Controllers;

use App\Models\CriticSummaryReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CriticReportController extends Controller
{
    /**
     * University-wide English Critic billing report.
     * GET /critic-reports
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->canAccessCriticReports(), 403);

        $reports   = CriticSummaryReport::with('user')->orderBy('created_at', 'desc')->get();
        $total     = $reports->count();
        $totalCost = $reports->sum('total_amount');
        $avgCost   = $total > 0 ? round($totalCost / $total, 2) : 0;

        return Inertia::render('CriticSummaryReports', [
            'reports'    => $reports,
            'critics'    => \App\Models\User::where('is_critic', true)
                ->orderBy('name')
                ->get(['name', 'college', 'status']),
            'totalCost'  => $totalCost,
            'avgCost'    => $avgCost,
        ]);
    }

    public function updatePaymentStatus(Request $request, CriticSummaryReport $report): RedirectResponse
    {
        abort_unless($request->user()->canAccessCriticReports(), 403);

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid',
        ]);

        $report->update([
            'payment_status' => $validated['payment_status'],
            'paid_at' => $validated['payment_status'] === 'paid' ? now() : null,
            'paid_by' => $validated['payment_status'] === 'paid' ? $request->user()->id : null,
        ]);

        return redirect()->back()->with('success', 'Disbursement status updated.');
    }
}
