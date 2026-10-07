import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
};

const STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
};

const Field = ({ label, value }) => (
    <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
        <dd className="mt-1 break-words text-sm text-gray-800">{value || 'Not provided'}</dd>
    </div>
);

export default function CriticRequests({ requests = [], availabilityStatus = 'accepting', queueLimit = 10 }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processingRequest, setProcessingRequest] = useState(null);
    const pageSize = 8;
    const isAccepting = availabilityStatus === 'accepting';

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch = !query
                || request.client_name?.toLowerCase().includes(query)
                || request.email?.toLowerCase().includes(query)
                || request.research_title?.toLowerCase().includes(query)
                || request.reference_number?.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
    const page = Math.min(currentPage, pageCount);
    const visibleRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

    const updateFilter = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const reviewRequest = (requestId, status) => {
        router.patch(route('requests.review', requestId), { status }, {
            preserveScroll: true,
            onStart: () => setProcessingRequest({ id: requestId, status }),
            onFinish: () => setProcessingRequest(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Requests & Queue" />

            <div className="mx-auto max-w-[1200px] space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Requests &amp; Queue</h1>
                    <p className="mt-1 text-sm text-gray-500">Review incoming requests and keep track of their current status.</p>
                </div>

                {flash?.success && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Availability</p>
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${isAccepting ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                <span className="text-sm font-semibold text-gray-900">{isAccepting ? 'On' : 'Off'}</span>
                                <span className="text-sm text-gray-500">
                                    ({isAccepting ? 'Accepting Requests' : 'Not Accepting Requests'})
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                                {requests.filter((request) => request.status === 'pending').length} pending
                            </span>
                            <span className="text-xs">Queue limit: {queueLimit} active papers</span>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="relative block w-full sm:w-64">
                                <span className="sr-only">Search student, email or title</span>
                                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2m1.7-5.3a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => updateFilter(setSearch, event.target.value)}
                                    placeholder="Search student, title…"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </label>
                            <label>
                                <span className="sr-only">Filter requests by status</span>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => updateFilter(setStatusFilter, event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-40"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </label>
                        </div>

                        <button
                            type="button"
                            disabled
                            title="Walk-in request logging is not available yet."
                            className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-400 lg:ml-auto lg:w-auto"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
                            </svg>
                            Log Walk-In Request
                        </button>
                    </div>

                    {visibleRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Student &amp; Email</th>
                                        <th className="px-4 py-3">Document &amp; Link</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-center">Pages</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visibleRequests.map((request) => {
                                        const isProcessing = processingRequest?.id === request.id;
                                        const status = STATUS_LABELS[request.status] ? request.status : 'pending';

                                        return (
                                            <tr key={request.id} className="text-gray-700 transition-colors hover:bg-gray-50/70">
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-gray-900">{request.client_name}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500">{request.email}</p>
                                                </td>
                                                <td className="max-w-[260px] px-4 py-3.5">
                                                    <p className="truncate font-medium text-gray-800" title={request.research_title || ''}>
                                                        {request.research_title || 'Title not provided'}
                                                    </p>
                                                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                                                        No file attached
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{formatDate(request.request_date || request.created_at)}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-400">—</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}>
                                                        {STATUS_LABELS[status]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    {status === 'pending' ? (
                                                        <div className="inline-flex items-center gap-2">
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
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedRequest(request)}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                                        >
                                                            View Details
                                                        </button>
                                                    )}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-900">
                                {requests.length ? 'No requests match your filters' : 'No requests yet'}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {requests.length ? 'Try another search term or status.' : 'New client requests will appear here.'}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-medium text-gray-500">
                            Showing {filteredRequests.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRequests.length)} of {filteredRequests.length} requests
                        </p>
                        <div className="flex items-center justify-end gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                                Previous
                            </button>
                            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    aria-current={page === pageNumber ? 'page' : undefined}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${page === pageNumber ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page >= pageCount}
                                onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
                                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {selectedRequest && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedRequest(null);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="request-detail-title"
                        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                    >
                        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 id="request-detail-title" className="text-lg font-bold text-gray-900">Request Details</h2>
                                <p className="mt-0.5 text-xs text-gray-500">{selectedRequest.reference_number}</p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close request details"
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <dl className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                            <Field label="Client" value={selectedRequest.client_name} />
                            <Field label="Email" value={selectedRequest.email} />
                            <Field label="Contact Number" value={selectedRequest.contact_number} />
                            <Field label="Occupation" value={selectedRequest.occupation} />
                            <Field label="Agency" value={selectedRequest.agency} />
                            <Field label="Request Date" value={formatDate(selectedRequest.request_date || selectedRequest.created_at)} />
                            <Field label="Address" value={selectedRequest.address} />
                            <Field label="Office Address" value={selectedRequest.office_address} />
                            <Field label="Research Title" value={selectedRequest.research_title} />
                            <Field label="Translation Document" value={selectedRequest.translation_document} />
                            <Field
                                label="Services"
                                value={Array.isArray(selectedRequest.services) ? selectedRequest.services.join(', ') : ''}
                            />
                            <Field
                                label="Status"
                                value={STATUS_LABELS[selectedRequest.status] || selectedRequest.status}
                            />
                        </dl>
                        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
