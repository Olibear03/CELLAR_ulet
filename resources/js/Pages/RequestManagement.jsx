import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SERVICE_LABELS = {
    training:             'Training',
    cvsu_form_style:      'CvSU Form & Style',
    language_training:    'Language Training',
    translation_editing:  'Translation/Editing',
    language_proficiency: 'Language Proficiency Test',
    basic_english:        'Basic English Test',
    advanced_english:     'Advanced English Test',
    filipino_proficiency: 'Filipino Proficiency Test',
    research_funding:     'Research Funding',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function AdminSignaturePad({ value, onChange }) {
    const canvasRef = useRef(null);
    const drawing   = useRef(false);
    const [isEmpty, setIsEmpty] = useState(!value);

    useEffect(() => {
        if (value && canvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0);
                setIsEmpty(false);
            };
            img.src = value;
        }
    }, []);

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const src  = e.touches ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    };

    const startDraw = (e) => {
        e.preventDefault();
        drawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getPos(e, canvasRef.current);
        ctx.beginPath(); ctx.moveTo(x, y);
    };
    const draw = (e) => {
        if (!drawing.current) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
        const { x, y } = getPos(e, canvasRef.current);
        ctx.lineTo(x, y); ctx.stroke();
        setIsEmpty(false);
    };
    const stopDraw = () => {
        if (!drawing.current) return;
        drawing.current = false;
        onChange(canvasRef.current.toDataURL('image/png'));
    };
    const clear = () => {
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setIsEmpty(true);
        onChange('');
    };

    return (
        <div>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white relative">
                <canvas
                    ref={canvasRef} width={340} height={100}
                    className="w-full touch-none cursor-crosshair"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs text-gray-300">Draw your signature here</span>
                    </div>
                )}
            </div>
            <button type="button" onClick={clear} className="mt-1 text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
        </div>
    );
}

function PrintableForm({ req }) {
    if (!req) return null;
    const approvedDate = req.reviewed_at
        ? new Date(req.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const requestDate = req.request_date
        ? new Date(req.request_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
    const LANGS = ['English', 'French', 'Mandarin', 'Filipino', 'Spanish', 'Korean', 'Japanese'];
    const PROF  = [
        { key: 'basic_english',    label: 'Basic English Proficiency Test' },
        { key: 'advanced_english', label: 'Advanced English Proficiency Test' },
        { key: 'filipino_test',    label: 'Filipino Proficiency Test' },
    ];
    const svc   = req.services ?? [];
    const langs = req.language_options ?? [];
    const prof  = req.proficiency_options ?? [];
    const chk   = (checked) => checked ? 'X' : '_';

    return (
        <div id="printable-form" style={{display:'none'}} className="print:block font-sans text-xs text-gray-900 p-8 max-w-2xl mx-auto">
            <div className="text-center mb-4">
                <p className="text-gray-500 text-xs">Republic of the Philippines - Cavite State University - Don Severino delas Alas Campus, Indang, Cavite</p>
                <p className="font-bold mt-1">CENTER FOR LANGUAGE LEARNING AND RESEARCH</p>
                <p className="text-lg font-extrabold mt-1">CLIENT REQUEST FORM</p>
                <p className="text-gray-500 text-xs mt-1">CLLR-QF-01 | Ref: {req.reference_number} | {requestDate}</p>
            </div>
            <hr className="border-gray-400 mb-4" />
            <table className="w-full mb-4">
                <tbody>
                    <tr><td className="py-0.5 pr-3 font-semibold w-44">Name of Client:</td><td className="py-0.5 border-b border-gray-400">{req.client_name}</td></tr>
                    <tr><td className="py-0.5 pr-3 font-semibold">Address:</td><td className="py-0.5 border-b border-gray-400">{req.address}</td></tr>
                    <tr><td className="py-0.5 pr-3 font-semibold">Occupation:</td><td className="py-0.5 border-b border-gray-400">{req.occupation}</td></tr>
                    <tr><td className="py-0.5 pr-3 font-semibold">Contact Number/s:</td><td className="py-0.5 border-b border-gray-400">{req.contact_number}</td></tr>
                    <tr><td className="py-0.5 pr-3 font-semibold">Email Address:</td><td className="py-0.5 border-b border-gray-400">{req.email}</td></tr>
                    {req.agency && <tr><td className="py-0.5 pr-3 font-semibold">Agency / Institution:</td><td className="py-0.5 border-b border-gray-400">{req.agency}</td></tr>}
                    {req.office_address && <tr><td className="py-0.5 pr-3 font-semibold">Office Address:</td><td className="py-0.5 border-b border-gray-400">{req.office_address}</td></tr>}
                </tbody>
            </table>
            <p className="font-bold mb-1">Type of Services Requested: <span className="font-normal text-gray-500">(put a check)</span></p>
            <div className="space-y-1 mb-4 pl-2">
                <p>[{chk(svc.includes('training'))}] Training</p>
                <p>[{chk(svc.includes('cvsu_form_style'))}] CvSU Form and Style</p>
                <p>[{chk(svc.includes('language_training'))}] Language Training Courses</p>
                {svc.includes('language_training') && (
                    <div className="pl-6 grid grid-cols-4 gap-x-4">
                        {LANGS.map(l => <span key={l}>[{chk(langs.includes(l))}] {l}</span>)}
                    </div>
                )}
                <p>[{chk(svc.includes('translation_editing'))}] Translation/Editing Services</p>
                {svc.includes('translation_editing') && req.translation_document && (
                    <p className="pl-6">Type/Title of document: {req.translation_document}</p>
                )}
                <p>[{chk(svc.includes('language_proficiency'))}] Language Proficiency Test</p>
                {svc.includes('language_proficiency') && (
                    <div className="pl-6 space-y-0.5">
                        {PROF.map(p => <p key={p.key}>[{chk(prof.includes(p.key))}] {p.label}</p>)}
                    </div>
                )}
                <p>[{chk(svc.includes('research_funding'))}] Language/Communication Research Funding</p>
                {svc.includes('research_funding') && req.research_title && (
                    <p className="pl-6">Title of Research: {req.research_title}</p>
                )}
            </div>
            <hr className="border-gray-300 mb-4" />
            <div className="grid grid-cols-2 gap-8 mt-2">
                <div>
                    <p className="font-semibold mb-2">Requested By:</p>
                    {req.client_signature
                        ? <img src={req.client_signature} alt="Client Signature" className="h-16 object-contain mb-1" />
                        : <div className="h-16 border-b border-gray-400 mb-1" />
                    }
                    <p className="border-b border-gray-400 pb-0.5 font-medium">{req.printed_name || req.client_name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Name and Signature of Client | Date: {requestDate}</p>
                </div>
                <div>
                    <p className="font-semibold mb-2">Approved By:</p>
                    {req.admin_signature
                        ? <img src={req.admin_signature} alt="Admin Signature" className="h-16 object-contain mb-1" />
                        : <div className="h-16 border-b border-gray-400 mb-1" />
                    }
                    <p className="border-b border-gray-400 pb-0.5 font-medium">{req.admin_printed_name || req.reviewer?.name || 'Director'}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Name and Signature of Director | Date: {approvedDate}</p>
                </div>
            </div>
        </div>
    );
}

function RequestDetailDrawer({ req, onClose, isDirector }) {
    const [adminSig, setAdminSig]   = useState(req?.admin_signature ?? '');
    const [adminName, setAdminName] = useState(req?.admin_printed_name ?? '');
    const [submitting, setSubmitting] = useState(false);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';

    const handleApprove = () => {
        setSubmitting(true);
        router.patch(
            route('requests.review', req.id),
            { status: 'approved', admin_signature: adminSig, admin_printed_name: adminName },
            { preserveScroll: true, onFinish: () => { setSubmitting(false); onClose(); } }
        );
    };

    const handleReject = () => {
        if (!confirm('Reject this request?')) return;
        setSubmitting(true);
        router.patch(
            route('requests.review', req.id),
            { status: 'rejected', admin_signature: adminSig, admin_printed_name: adminName },
            { preserveScroll: true, onFinish: () => { setSubmitting(false); onClose(); } }
        );
    };

    const handlePrint = () => {
        const el = document.getElementById('printable-form');
        if (!el) return;
        el.style.display = 'block';
        window.print();
        el.style.display = 'none';
    };

    const svc   = req.services ?? [];
    const langs = req.language_options ?? [];
    const prof  = req.proficiency_options ?? [];

    const statusStyle = {
        pending:  'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    const PROF_LABELS = {
        basic_english:    'Basic English Proficiency Test',
        advanced_english: 'Advanced English Proficiency Test',
        filipino_test:    'Filipino Proficiency Test',
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <p className="text-xs font-mono font-bold text-emerald-700 mb-0.5">{req.reference_number}</p>
                        <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{req.client_name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${statusStyle[req.status]}`}>
                            {req.status}
                        </span>
                        {req.status === 'approved' && (
                            <button onClick={handlePrint}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print / Download
                            </button>
                        )}
                        <button onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

                    {/* Client Information */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                            Client Information
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {[
                                ['Name',           req.client_name],
                                ['Email',          req.email],
                                ['Contact',        req.contact_number],
                                ['Occupation',     req.occupation],
                                ['Address',        req.address],
                                ['Agency',         req.agency || 'N/A'],
                                ['Office Address', req.office_address || 'N/A'],
                                ['Date Submitted', fmtDate(req.request_date)],
                            ].map(([label, val]) => (
                                <div key={label}>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                                    <p className="text-sm text-gray-900 mt-0.5 break-words">{val}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Services Requested */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                            Services Requested
                        </h3>
                        <div className="space-y-2.5">
                            {svc.length === 0 && <p className="text-sm text-gray-400">No services listed.</p>}
                            {svc.map(s => (
                                <div key={s} className="flex flex-col gap-1">
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg w-fit">
                                        <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {SERVICE_LABELS[s] ?? s}
                                    </span>
                                    {s === 'language_training' && langs.length > 0 && (
                                        <p className="text-xs text-gray-500 ml-1">Languages: {langs.join(', ')}</p>
                                    )}
                                    {s === 'translation_editing' && req.translation_document && (
                                        <p className="text-xs text-gray-500 ml-1">Document: {req.translation_document}</p>
                                    )}
                                    {s === 'language_proficiency' && prof.length > 0 && (
                                        <p className="text-xs text-gray-500 ml-1">Tests: {prof.map(p => PROF_LABELS[p] ?? p).join(', ')}</p>
                                    )}
                                    {s === 'research_funding' && req.research_title && (
                                        <p className="text-xs text-gray-500 ml-1">Research: {req.research_title}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Client Signature */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                            Client Signature
                        </h3>
                        <div className="flex gap-6 items-start">
                            <div className="flex-1">
                                {req.client_signature ? (
                                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-3">
                                        <img src={req.client_signature} alt="Client e-signature" className="h-20 object-contain w-full" />
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 h-20 flex items-center justify-center">
                                        <span className="text-xs text-gray-400">No signature provided</span>
                                    </div>
                                )}
                                <p className="text-xs font-semibold text-gray-700 mt-1.5">{req.printed_name || req.client_name}</p>
                                <p className="text-[10px] text-gray-400">Name and Signature of Client</p>
                                <p className="text-[10px] text-gray-400">Date: {fmtDate(req.request_date)}</p>
                            </div>
                        </div>
                    </section>

                    {/* Admin / Director Signature */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                            {req.status === 'approved' ? 'Approved By (Director)' : 'Director Signature'}
                        </h3>
                        {req.status === 'approved' ? (
                            <div className="flex gap-6 items-start">
                                <div className="flex-1">
                                    {req.admin_signature ? (
                                        <div className="border border-gray-200 rounded-xl bg-gray-50 p-3">
                                            <img src={req.admin_signature} alt="Admin e-signature" className="h-20 object-contain w-full" />
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 h-20 flex items-center justify-center">
                                            <span className="text-xs text-gray-400">No admin signature on file</span>
                                        </div>
                                    )}
                                    <p className="text-xs font-semibold text-gray-700 mt-1.5">{req.admin_printed_name || req.reviewer?.name || 'Director'}</p>
                                    <p className="text-[10px] text-gray-400">Name and Signature of Director</p>
                                    <p className="text-[10px] text-gray-400">Date: {fmtDate(req.reviewed_at)}</p>
                                </div>
                            </div>
                        ) : req.status === 'pending' && isDirector ? (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Draw your signature to approve this request.</p>
                                <AdminSignaturePad value={adminSig} onChange={setAdminSig} />
                                <input
                                    type="text"
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    placeholder="Your printed name"
                                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Pending director review.</p>
                        )}
                    </section>

                    {/* Review info for non-pending */}
                    {req.status !== 'pending' && req.reviewed_at && (
                        <section>
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                                Review Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Reviewed By</p>
                                    <p className="text-sm text-gray-900 mt-0.5">{req.reviewer?.name ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Reviewed On</p>
                                    <p className="text-sm text-gray-900 mt-0.5">{fmtDate(req.reviewed_at)}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* ── Footer actions (director + pending only) ── */}
                {isDirector && req.status === 'pending' && (
                    <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">Draw your signature above, then approve or reject.</p>
                        <div className="flex gap-2">
                            <button onClick={handleReject} disabled={submitting}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                                Reject
                            </button>
                            <button onClick={handleApprove} disabled={submitting}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function RequestManagement({ requests = [] }) {
    const { auth } = usePage().props;
    const isDirector = auth.user?.role?.toLowerCase() === 'director';

    const [activeTab,      setActiveTab]      = useState('requests');
    const [statusFilter,   setStatusFilter]   = useState('pending');
    const [selectedReq,    setSelectedReq]    = useState(null);
    const [analytics,      setAnalytics]      = useState(null);
    const [analyticsYear,  setAnalyticsYear]  = useState(new Date().getFullYear());
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    /* keep drawer in sync after Inertia re-renders */
    useEffect(() => {
        if (selectedReq) {
            const updated = requests.find(r => r.id === selectedReq.id);
            if (updated) setSelectedReq(updated);
        }
    }, [requests]);

    /* load analytics when tab opens */
    useEffect(() => {
        if (activeTab === 'analytics') loadAnalytics();
    }, [activeTab, analyticsYear]);

    const loadAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            const res = await axios.get(route('requests.analytics'), { params: { year: analyticsYear } });
            setAnalytics(res.data);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const filtered  = requests.filter(r => r.status === statusFilter);
    const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    const StatusBadge = ({ status }) => {
        const map = {
            pending:  'bg-amber-50 text-amber-700 border-amber-200',
            approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return (
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${map[status] ?? ''}`}>
                {status}
            </span>
        );
    };

    const BarChart = ({ data, labelMap, colorClass = 'bg-emerald-500' }) => {
        const max = Math.max(...Object.values(data), 1);
        return (
            <div className="space-y-2">
                {Object.entries(data).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-44 shrink-0 truncate">{labelMap?.[key] ?? key}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width: `${(val / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-6 text-right">{val}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Request Management" />

            {/* Hidden printable form — only visible during window.print() */}
            <PrintableForm req={selectedReq} />

            <div className="max-w-[1100px] mx-auto space-y-5">

                {/* Page header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Request Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Review client service requests and monitor submission analytics.</p>
                    </div>
                    <a href={route('client-request.form')} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Public Form
                    </a>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200">
                    {['requests', 'analytics'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ══ REQUESTS TAB ══ */}
                {activeTab === 'requests' && (
                    <>
                        {/* Status filter pills */}
                        <div className="flex gap-2">
                            {['pending', 'approved', 'rejected'].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                                        statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}>
                                    {s}
                                    <span className="ml-1.5 text-xs opacity-70">({requests.filter(r => r.status === s).length})</span>
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length > 0 ? filtered.map(req => (
                                        <tr key={req.id}
                                            onClick={() => setSelectedReq(req)}
                                            className="hover:bg-emerald-50/40 cursor-pointer transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono font-semibold text-emerald-700">{req.reference_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-gray-900">{req.client_name}</p>
                                                <p className="text-xs text-gray-400">{req.email}</p>
                                                <p className="text-xs text-gray-400">{req.occupation}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(req.services ?? []).map(s => (
                                                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">
                                                            {SERVICE_LABELS[s] ?? s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{fmtDate(req.request_date)}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={req.status} />
                                                {req.reviewed_at && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        by {req.reviewer?.name ?? 'N/A'} · {fmtDate(req.reviewed_at)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSelectedReq(req)}
                                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                                                        View
                                                    </button>
                                                    {isDirector && req.status === 'pending' && (
                                                        <button onClick={() => setSelectedReq(req)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                                            Review
                                                        </button>
                                                    )}
                                                    {req.status === 'approved' && (
                                                        <button onClick={() => setSelectedReq(req)}
                                                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors">
                                                            Print
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                                                No {statusFilter} requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ══ ANALYTICS TAB ══ */}
                {activeTab === 'analytics' && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600">Year:</label>
                            <select value={analyticsYear} onChange={e => setAnalyticsYear(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
                                {analytics?.available_years?.map(y => <option key={y} value={y}>{y}</option>)}
                                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            </select>
                        </div>

                        {loadingAnalytics ? (
                            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading analytics...</div>
                        ) : analytics ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Requests', value: analytics.total,    color: 'text-gray-900' },
                                        { label: 'Pending',        value: analytics.pending,  color: 'text-amber-600' },
                                        { label: 'Approved',       value: analytics.approved, color: 'text-emerald-600' },
                                        { label: 'Rejected',       value: analytics.rejected, color: 'text-red-600' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                                            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Submissions — {analyticsYear}</h3>
                                    {Object.keys(analytics.monthly).length > 0 ? (
                                        <div className="space-y-2">
                                            {MONTHS.map((m, i) => {
                                                const key = String(i + 1).padStart(2, '0');
                                                const val = analytics.monthly[key] ?? 0;
                                                const max = Math.max(...Object.values(analytics.monthly), 1);
                                                return (
                                                    <div key={m} className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-500 w-8 shrink-0">{m}</span>
                                                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                                            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(val / max) * 100}%` }} />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700 w-5 text-right">{val}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : <p className="text-sm text-gray-400">No data for {analyticsYear}.</p>}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Service Distribution</h3>
                                    {Object.keys(analytics.services).length > 0
                                        ? <BarChart data={analytics.services} labelMap={SERVICE_LABELS} colorClass="bg-emerald-500" />
                                        : <p className="text-sm text-gray-400">No service data.</p>}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Language Training Demand</h3>
                                    {Object.keys(analytics.languages).length > 0
                                        ? <BarChart data={analytics.languages} colorClass="bg-purple-500" />
                                        : <p className="text-sm text-gray-400">No language training requests yet.</p>}
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Detail / review drawer */}
            {selectedReq && (
                <RequestDetailDrawer
                    req={selectedReq}
                    isDirector={isDirector}
                    onClose={() => setSelectedReq(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}
