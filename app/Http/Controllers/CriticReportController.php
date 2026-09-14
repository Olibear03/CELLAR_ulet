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
     * Critic's own submission form + personal history.
     * GET /submit-report
     */
    public function create(): Response
    {
        $reports = CriticSummaryReport::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SubmitSummaryReport', [
            'reports' => $reports,
        ]);
    }

    /**
     * Store a new critic certification report.
     * POST /submit-report
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'student_name'     => 'required|string|max:255',
            'course_degree'    => 'required|string|max:255',
            'manuscript_title' => 'required|string|max:500',
            'document_type'    => 'required|in:thesis,dissertation,capstone,edp_manuscript,design_project,student_teaching_portfolio,narrative_report,other',
            'times_read'       => 'required|integer|min:1',
            'page_count'       => 'required|integer|min:1',
            'total_amount'     => 'required|numeric|min:0',
            'or_number'        => 'required|string|max:100',
        ]);

        CriticSummaryReport::create([
            'user_id'          => auth()->id(),
            'student_name'     => $request->student_name,
            'course_degree'    => $request->course_degree,
            'manuscript_title' => $request->manuscript_title,
            'document_type'    => $request->document_type,
            'times_read'       => $request->times_read,
            'page_count'       => $request->page_count,
            'total_amount'     => $request->total_amount,
            'or_number'        => $request->or_number,
        ]);

        return redirect()->back()->with('success', 'Certification record submitted successfully.');
    }

    /**
     * Director-only: university-wide reports dashboard.
     * GET /critic-reports
     */
    public function index(): Response
    {
        $reports   = CriticSummaryReport::with('user')->orderBy('created_at', 'desc')->get();
        $total     = $reports->count();
        $totalCost = $reports->sum('total_amount');
        $avgCost   = $total > 0 ? round($totalCost / $total, 2) : 0;

        return Inertia::render('CriticSummaryReports', [
            'reports'    => $reports,
            'totalCost'  => $totalCost,
            'avgCost'    => $avgCost,
        ]);
    }
}
