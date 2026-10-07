import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount) || 0);

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const StatCard = ({ label, value, icon, tone }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <p className="mt-2 whitespace-nowrap text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">{value}</p>
            </div>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={icon} />
                </svg>
            </span>
        </div>
    </div>
);

const statusClasses = {
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    untracked: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

export default function CriticEarnings({ reports = [] }) {
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('this-month');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filteredReports = useMemo(() => {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = startOfThisMonth;
        const normalizedSearch = search.trim().toLowerCase();

        return reports.filter((report) => {
            const submitted = new Date(report.created_at);
            const matchesPeriod = period === 'all-time'
                || (period === 'this-month' && submitted >= startOfThisMonth)
                || (period === 'last-month' && submitted >= startOfLastMonth && submitted < endOfLastMonth);
            const matchesSearch = !normalizedSearch
                || report.student_name?.toLowerCase().includes(normalizedSearch)
                || report.manuscript_title?.toLowerCase().includes(normalizedSearch);

            return matchesPeriod && matchesSearch;
        });
    }, [reports, search, period]);

    const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalEarned = reports.reduce((total, report) => total + Number(report.total_amount || 0), 0);
    const pendingDisbursement = reports
        .filter((report) => report.payment_status === 'pending')
        .reduce((total, report) => total + Number(report.total_amount || 0), 0);
    const firstItem = filteredReports.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const lastItem = Math.min(currentPage * pageSize, filteredReports.length);

    const downloadReport = () => {
        const columns = ['Date Logged', 'Student Names', 'Document Title', 'Pages', 'Fee', 'Status'];
        const rows = filteredReports.map((report) => [
            formatDate(report.created_at),
            report.student_name,
            report.manuscript_title,
            report.page_count,
            Number(report.total_amount || 0).toFixed(2),
            report.payment_status === 'paid' ? 'Paid' : report.payment_status === 'pending' ? 'Pending' : 'Untracked',
        ]);
        const csv = [columns, ...rows]
            .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
            .join('\r\n');
        const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'my-earnings.csv';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    };

    const stats = [
        {
            label: 'Total Earned',
            value: formatCurrency(totalEarned),
            tone: 'bg-blue-50 text-blue-700',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Completed Critiques',
            value: `${reports.length} ${reports.length === 1 ? 'Paper' : 'Papers'}`,
            tone: 'bg-emerald-50 text-emerald-600',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Pending Disbursement',
            value: formatCurrency(pendingDisbursement),
            tone: 'bg-amber-50 text-amber-600',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="My Earnings" />

            <div className="mx-auto max-w-[1200px] space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">My Earnings</h1>
                    <p className="mt-1 text-sm text-gray-500">Track your completed critiques and disbursement status.</p>
                </div>

                <section aria-label="Earnings summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
                </section>

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="relative block w-full sm:max-w-[290px]">
                            <span className="sr-only">Search earnings records</span>
                            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2m1.7-5.3a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                                placeholder="Search record…"
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </label>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label htmlFor="earnings-period" className="text-sm font-medium text-gray-600">Date:</label>
                            <select
                                id="earnings-period"
                                value={period}
                                onChange={(event) => { setPeriod(event.target.value); setPage(1); }}
                                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                                <option value="all-time">All Time</option>
                            </select>
                            <button
                                type="button"
                                onClick={downloadReport}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0l-4-4m4 4l4-4M5 17v3h14v-3" />
                                </svg>
                                Download Report
                            </button>
                        </div>
                    </div>

                    {pageReports.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Date Logged</th>
                                        <th className="px-4 py-3">Student Names</th>
                                        <th className="px-4 py-3">Document Title</th>
                                        <th className="px-4 py-3 text-center">Pages</th>
                                        <th className="px-4 py-3 text-right">Fee</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pageReports.map((report) => {
                                        const status = report.payment_status || 'untracked';
                                        const statusLabel = status === 'untracked' ? 'Untracked' : status === 'paid' ? 'Paid' : 'Pending';

                                        return (
                                            <tr key={report.id} className="text-gray-700 transition-colors hover:bg-gray-50/70">
                                                <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{formatDate(report.created_at)}</td>
                                                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-900">{report.student_name}</td>
                                                <td className="max-w-[280px] px-4 py-3.5">
                                                    <p className="line-clamp-2 text-gray-700" title={report.manuscript_title}>{report.manuscript_title}</p>
                                                </td>
                                                <td className="px-4 py-3.5 text-center tabular-nums text-gray-600">{report.page_count}</td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-gray-900">{formatCurrency(report.total_amount)}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-14 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-900">No earnings records found</p>
                            <p className="mt-1 text-sm text-gray-500">Try another date range or search term.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-medium text-gray-500">
                            Showing {firstItem}–{lastItem} of {filteredReports.length} records
                        </p>
                        <div className="flex items-center justify-end gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setPage((value) => Math.max(1, value - 1))}
                                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                                Previous
                            </button>
                            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                                    onClick={() => setPage(pageNumber)}
                                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={currentPage >= pageCount}
                                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </AuthenticatedLayout>
    );
}
