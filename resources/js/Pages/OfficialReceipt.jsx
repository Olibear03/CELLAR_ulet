import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const inputCls = 'w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

export default function OfficialReceipt() {
    // Dummy receipts history (wireframe) — English critic only
    const MOCK_RECEIPTS = [
        {
            id: 'r1',
            or_number: 'OR-2026-0001',
            student_name: 'Juan dela Cruz',
            course_degree: 'AB Journalism',
            manuscript_title: 'An Analysis of Modern Digital Journalism in the Philippines',
            times_read: 2,
            page_count: 110,
            total_amount: 2200.00,
            amount_words: 'Two thousand two hundred pesos only',
            created_at: '2026-06-01T10:00:00.000Z'
        },
        {
            id: 'r2',
            or_number: 'OR-2026-0002',
            student_name: 'Maria Clara',
            course_degree: 'AB English',
            manuscript_title: 'Syntactic Structures and Stylistics in Local Literature',
            times_read: 3,
            page_count: 145,
            total_amount: 4350.00,
            amount_words: 'Four thousand three hundred fifty pesos only',
            created_at: '2026-06-02T11:30:00.000Z'
        },
        {
            id: 'r3',
            or_number: 'OR-2026-0003',
            student_name: 'Crisostomo Ibarra',
            course_degree: 'MA English',
            manuscript_title: 'Socio-Political Discourse in Post-Colonial Philippine Novels',
            times_read: 2,
            page_count: 210,
            total_amount: 8400.00,
            amount_words: 'Eight thousand four hundred pesos only',
            created_at: '2026-06-03T14:15:00.000Z'
        }
    ];

    const [selected, setSelected] = useState(MOCK_RECEIPTS[0]);
    const [query, setQuery] = useState('');

    const handlePrint = () => {
        window.print();
    };

    const filtered = useMemo(() => {
        if (!query) return MOCK_RECEIPTS;
        return MOCK_RECEIPTS.filter(r => (
            r.or_number.toLowerCase().includes(query.toLowerCase()) ||
            r.student_name.toLowerCase().includes(query.toLowerCase()) ||
            r.manuscript_title.toLowerCase().includes(query.toLowerCase())
        ));
    }, [query]);

    return (
        <AuthenticatedLayout>
            <Head title="Official Receipt" />

            <div className="max-w-[1100px] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Official Receipt</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Standalone receipt page for completed certification entries. Keep My Certifications as-is.
                        </p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        Print Receipt
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Receipts History (English Critic)</h2>
                            <span className="text-xs text-gray-400">Wireframe / Dummy</span>
                        </div>

                        <div className="mb-3">
                            <input
                                type="search"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search OR, student or title..."
                                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100 pr-1">
                            {filtered.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelected(r)}
                                    className={`w-full text-left px-3 py-3 transition-colors rounded-lg mb-2 hover:bg-gray-50 flex items-start justify-between ${selected?.id === r.id ? 'bg-blue-50 border border-blue-100' : ''}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-gray-900">{r.or_number}</p>
                                            <p className="text-xs text-gray-400">· {new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-xs text-gray-700 mt-1 font-semibold">{r.student_name} <span className="text-[11px] text-gray-400">· {r.course_degree}</span></p>
                                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{r.manuscript_title}</p>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="text-sm font-extrabold text-gray-900">₱{r.total_amount.toFixed(2)}</p>
                                        <p className="text-xs text-blue-700 font-bold mt-2">View</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 print:border-black print:shadow-none print:px-0 print:py-0">
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Republic of the Philippines</p>
                                <p className="text-base font-extrabold text-gray-900 tracking-[0.12em]">CAVITE STATE UNIVERSITY</p>
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Don Severino delas Alas Campus</p>
                                <p className="mt-4 text-sm font-bold text-gray-900 uppercase tracking-[0.24em]">CENTER FOR LANGUAGE LEARNING AND RESEARCH</p>
                                <p className="text-xl font-black text-gray-900 mt-2 uppercase tracking-[0.25em]">OFFICIAL RECEIPT</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p className="font-semibold text-gray-900">O.R. Number</p>
                                    <p className="mt-1 text-gray-700">{selected?.or_number ?? '__________'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">Date</p>
                                    <p className="mt-1 text-gray-700">{selected ? new Date(selected.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">Name of the student/s</p>
                                    <p className="mt-1 text-gray-900 font-bold">{selected?.student_name || '__________________________'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">Manuscript Title</p>
                                    <p className="mt-1 text-gray-900">{selected?.manuscript_title || '______________________________________________________________'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 tracking-wide">No. of Times Read</p>
                                        <p className="mt-1 text-gray-900 font-semibold">{selected?.times_read ? `${selected.times_read}×` : '___'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 tracking-wide">No. of Pages</p>
                                        <p className="mt-1 text-gray-900 font-semibold">{selected?.page_count || '___'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">Total Amount</p>
                                    <p className="mt-1 text-gray-900 font-bold">{selected ? `₱${selected.total_amount.toFixed(2)}` : '₱0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">Amount in Words</p>
                                    <p className="mt-1 text-gray-900">{selected?.amount_words || '______________________________________________________________'}</p>
                                </div>
                            </div>

                            {/* Official Receipt details and signature blocks removed for wireframe history view */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
