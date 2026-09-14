import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

const DOCUMENT_TYPES = [
    { value: 'thesis',                    label: 'Thesis' },
    { value: 'dissertation',              label: 'Dissertation' },
    { value: 'capstone',                  label: 'Capstone Project Manuscript' },
    { value: 'edp_manuscript',            label: 'EDP Manuscript' },
    { value: 'design_project',            label: 'Design Project Manuscript' },
    { value: 'student_teaching_portfolio',label: 'Student Teaching Portfolio' },
    { value: 'narrative_report',          label: 'Narrative Report' },
    { value: 'other',                     label: 'Other' },
];

const inputCls = 'w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

export default function SubmitSummaryReport({ reports = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        student_name:     '',
        course_degree:    '',
        manuscript_title: '',
        document_type:    '',
        times_read:       '',
        page_count:       '',
        // total_amount and or_number removed; director computes amounts
    });

    // Stats calculations
    const stats = useMemo(() => {
        const totalSubmissions = reports.length;
        const totalPages = reports.reduce((sum, r) => sum + (parseInt(r.page_count) || 0), 0);
        const totalEarnings = reports.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
        return { totalSubmissions, totalPages, totalEarnings };
    }, [reports]);

    // Client-side filtering for history
    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchesSearch = !search ||
                r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                r.manuscript_title?.toLowerCase().includes(search.toLowerCase()) ||
                r.course_degree?.toLowerCase().includes(search.toLowerCase()) ||
                r.or_number?.toLowerCase().includes(search.toLowerCase());
            
            const matchesType = !filterType || r.document_type === filterType;
            return matchesSearch && matchesType;
        });
    }, [reports, search, filterType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('critic.report.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatCurrency = (n) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

    const docTypeLabel = (val) =>
        DOCUMENT_TYPES.find(t => t.value === val)?.label ?? val;

    return (
        <AuthenticatedLayout>
            <Head title="Critic Dashboard" />

            <div className="max-w-[1200px] mx-auto space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                            Certification Workspace
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Encode reading and editing certifications (CLLR-QF-02) forwarded to the Director.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95 cursor-pointer shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Encode Certification
                    </button>
                </div>

                {/* ── Success Flash Notification ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-sm">
                        <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* ── Statistics Cards (DMS Style) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Certifications', value: stats.totalSubmissions, color: 'bg-blue-600', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { label: 'Total Pages Evaluated', value: stats.totalPages, color: 'bg-emerald-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                        { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), color: 'bg-purple-600', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
                            <div className={`${card.color} text-white p-3 rounded-xl shrink-0 shadow-inner`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">{card.label}</p>
                                <p className="text-xl font-extrabold text-gray-900 mt-1.5 leading-none">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Search and Filters (DMS Style) ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by student name, manuscript title, course or O.R. #..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">All Document Types</option>
                        {DOCUMENT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* ── Table Layout (DMS Style) ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Certification History</h2>
                        <span className="text-xs font-bold text-gray-400">
                            Showing {filteredReports.length} of {reports.length} records
                        </span>
                    </div>

                    {filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm font-semibold">No certification records found</p>
                            <p className="text-gray-400 text-xs mt-1">Try adjusting your search query or document type filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-3.5">Student / Course</th>
                                        <th className="px-6 py-3.5">Manuscript Title</th>
                                        <th className="px-6 py-3.5">Document Type</th>
                                        <th className="px-6 py-3.5 text-center">Reads</th>
                                        <th className="px-6 py-3.5 text-center">Pages</th>
                                        <th className="px-6 py-3.5 text-right">Amount</th>
                                        <th className="px-6 py-3.5">O.R. #</th>
                                        <th className="px-6 py-3.5">Date Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {filteredReports.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-extrabold text-gray-950 text-sm">{r.student_name}</p>
                                                <p className="text-xs text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">{r.course_degree}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-[280px]">
                                                <p className="text-xs text-gray-600 line-clamp-2 font-medium" title={r.manuscript_title}>
                                                    {r.manuscript_title}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200/50 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                                                    {docTypeLabel(r.document_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-800 font-bold font-mono text-xs">{r.times_read}×</td>
                                            <td className="px-6 py-4 text-center text-gray-800 font-semibold font-mono text-xs">{r.page_count}</td>
                                            <td className="px-6 py-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                                                {formatCurrency(r.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs font-semibold">{r.or_number}</td>
                                            <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap font-medium">{formatDate(r.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* ── Encode Certification Modal (CLLR-QF-02 Form) ── */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-blue-600 text-white p-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 leading-tight">Encode Certification</h2>
                                <p className="text-xs text-gray-400 mt-0.5">CLLR-QF-02 Verification Record</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Student Name */}
                        <div>
                            <label className={labelCls}>Name of the Student/s</label>
                            <input
                                type="text"
                                value={data.student_name}
                                onChange={e => setData('student_name', e.target.value)}
                                className={inputCls}
                                placeholder="e.g. Juan dela Cruz"
                                required
                            />
                            <InputError message={errors.student_name} className="mt-1" />
                        </div>

                        {/* Course / Degree */}
                        <div>
                            <label className={labelCls}>Course / Degree</label>
                            <input
                                type="text"
                                value={data.course_degree}
                                onChange={e => setData('course_degree', e.target.value)}
                                className={inputCls}
                                placeholder="e.g. BSIT, MAED, Ph.D. Education"
                                required
                            />
                            <InputError message={errors.course_degree} className="mt-1" />
                        </div>

                        {/* Manuscript Title */}
                        <div>
                            <label className={labelCls}>Manuscript Title</label>
                            <textarea
                                value={data.manuscript_title}
                                onChange={e => setData('manuscript_title', e.target.value)}
                                rows={3}
                                className={inputCls + ' resize-none'}
                                placeholder="Full title of the manuscript"
                                required
                            />
                            <InputError message={errors.manuscript_title} className="mt-1" />
                        </div>

                        {/* Document Type */}
                        <div>
                            <label className={labelCls}>Document Type</label>
                            <select
                                value={data.document_type}
                                onChange={e => setData('document_type', e.target.value)}
                                className={inputCls}
                                required
                            >
                                <option value="">Select type…</option>
                                {DOCUMENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.document_type} className="mt-1" />
                        </div>

                        {/* Times Read + Page Count (side by side) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>No. of Times Read</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.times_read}
                                    onChange={e => setData('times_read', e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. 2"
                                    required
                                />
                                <InputError message={errors.times_read} className="mt-1" />
                            </div>
                            <div>
                                <label className={labelCls}>No. of Pages</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.page_count}
                                    onChange={e => setData('page_count', e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. 120"
                                    required
                                />
                                <InputError message={errors.page_count} className="mt-1" />
                            </div>
                        </div>

                        {/* Total Amount and O.R. Number removed — director computes amounts and issues O.R. */}

                        {/* Form Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-600 hover:text-slate-900 text-sm font-semibold px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    'Submit Record'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
