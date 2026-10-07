<?php

namespace App\Http\Controllers;

use App\Models\CriticSummaryReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CriticEarningsController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->is_critic || $request->user()->is_director, 403);

        $reports = CriticSummaryReport::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'student_name',
                'manuscript_title',
                'page_count',
                'total_amount',
                'payment_status',
                'created_at',
            ]);

        return Inertia::render('CriticEarnings', [
            'reports' => $reports,
        ]);
    }
}
