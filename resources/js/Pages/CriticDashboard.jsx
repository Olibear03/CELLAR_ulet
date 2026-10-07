import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount) || 0);

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

const StatCard = ({ label, value, icon, accent }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{value}</p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={icon} />
                </svg>
            </div>
        </div>
    </div>
);

export default function CriticDashboard({
    pendingRequests = [],
    requestTotals = { pending: 0, total: 0, completed: 0 },
    earnings = 0,
    recentEarnings = [],
}) {
    const { auth, flash } = usePage().props;
    const [processingRequest, setProcessingRequest] = useState(null);

    const reviewRequest = (requestId, status) => {
        router.patch(route('requests.review', requestId), { status }, {
            preserveScroll: true,
            onStart: () => setProcessingRequest({ id: requestId, status }),
            onFinish: () => setProcessingRequest(null),
        });
    };

    const stats = [
        {
            label: 'Pending Requests',
            value: requestTotals.pending,
            accent: 'bg-amber-50 text-amber-600',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Total Requests',
            value: requestTotals.total,
            accent: 'bg-blue-50 text-blue-700',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 4h6m-6 4h6m-6 4h4',
        },
        {
            label: 'Done / Completed',
            value: requestTotals.completed,
            accent: 'bg-emerald-50 text-emerald-600',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Earnings',
            value: formatCurrency(earnings),
            accent: 'bg-violet-50 text-violet-600',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-300 space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back, {auth.user.name}</p>
                </div>

                {flash?.success && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <section aria-label="Workspace overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
                </section>

                <section id="request-queue" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Recent Pending Requests</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Review incoming client requests and choose an action.</p>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{requestTotals.pending} pending</span>
                    </div>

                    {pendingRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-180 text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Client</th>
                                        <th className="px-5 py-3">Research / Paper Title</th>
                                        <th className="px-5 py-3">Date Submitted</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingRequests.map((request) => {
                                        const isProcessing = processingRequest?.id === request.id;

                                        return (
                                            <tr key={request.id} className="text-gray-700 transition-colors hover:bg-gray-50/70">
                                                <td className="px-5 py-3.5">
                                                    <p className="font-semibold text-gray-900">{request.client_name}</p>
                                                    <p className="mt-0.5 text-xs text-gray-400">{request.reference_number}</p>
                                                </td>
                                                <td className="max-w-[320px] truncate px-5 py-3.5">{request.research_title || 'No title provided'}</td>
                                                <td className="whitespace-nowrap px-5 py-3.5">{formatDate(request.request_date || request.created_at)}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={Boolean(processingRequest)}
                                                            onClick={() => reviewRequest(request.id, 'approved')}
                                                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {isProcessing && processingRequest.status === 'approved' ? 'Accepting…' : 'Accept'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={Boolean(processingRequest)}
                                                            onClick={() => reviewRequest(request.id, 'rejected')}
                                                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {isProcessing && processingRequest.status === 'rejected' ? 'Rejecting…' : 'Reject'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-900">You’re all caught up</p>
                            <p className="mt-1 text-sm text-gray-500">New requests will appear here when they’re submitted.</p>
                        </div>
                    )}
                </section>

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                    <div id="billing-reports" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div id="earnings" className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">My Recent Billing Records</h2>
                                <p className="mt-0.5 text-sm text-gray-500">Your latest English Critic billing entries</p>
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{recentEarnings.length} records</span>
                        </div>
                        {recentEarnings.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentEarnings.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-900">{report.student_name}</p>
                                            <p className="mt-0.5 truncate text-xs text-gray-500">{report.manuscript_title}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(report.total_amount)}</p>
                                            <p className="mt-0.5 text-xs text-gray-400">{formatDate(report.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="px-5 py-8 text-center text-sm text-gray-500">Your billing records will appear here.</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Currently Reviewing</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Your active critique work</p>
                        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-7 text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-800">No active reviews yet</p>
                            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-500">
                                Requests are not assigned to a critic in the current workflow. Accepted requests will be listed here once review tracking is available.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}