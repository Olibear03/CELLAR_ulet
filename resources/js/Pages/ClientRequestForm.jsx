import { useForm, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useRef, useState } from 'react';

/**
 * ClientRequestForm — public form (CLLR-QF-01).
 *
 * Services section matches the physical form exactly:
 *   ☐ Training
 *   ☐ CvSU Form and Style
 *   ☐ Language Training Courses
 *       ☐ English  ☐ French  ☐ Mandarin
 *       ☐ Filipino ☐ Spanish ☐ Korean  ☐ Japanese
 *   ☐ Translation/Editing Services
 *       → text: Type/Title of document
 *   ☐ Language Proficiency Test
 *       ☐ Basic English Proficiency Test
 *       ☐ Advanced English Proficiency Test
 *       ☐ Filipino Proficiency Test
 *   ☐ Language/Communication Research Funding
 *       → text: Title of Research
 *
 * Bottom: e-signature canvas + printed name field
 */

const LANGUAGES = ['English', 'French', 'Mandarin', 'Filipino', 'Spanish', 'Korean', 'Japanese'];
const PROFICIENCY = [
    { key: 'basic_english',    label: 'Basic English Proficiency Test' },
    { key: 'advanced_english', label: 'Advanced English Proficiency Test' },
    { key: 'filipino_test',    label: 'Filipino Proficiency Test' },
];

/* ── Signature pad — draw OR upload an image ── */
function SignaturePad({ onChange }) {
    const canvasRef  = useRef(null);
    const fileRef    = useRef(null);
    const drawing    = useRef(false);
    const [mode, setMode]   = useState('draw');   // 'draw' | 'upload'
    const [isEmpty, setIsEmpty] = useState(true);
    const [preview, setPreview] = useState('');   // data URL for uploaded image

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const src  = e.touches ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    };

    /* ── Draw handlers ── */
    const startDraw = (e) => {
        e.preventDefault();
        drawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getPos(e, canvasRef.current);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!drawing.current) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.strokeStyle = '#1e293b';
        const { x, y } = getPos(e, canvasRef.current);
        ctx.lineTo(x, y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDraw = () => {
        if (!drawing.current) return;
        drawing.current = false;
        // Guard: canvas may not be mounted if mode switched
        if (canvasRef.current) {
            onChange(canvasRef.current.toDataURL('image/png'));
        }
    };

    /* ── Upload handler — reads image file as base64 ── */
    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setPreview(dataUrl);
            setIsEmpty(false);
            onChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    /* ── Clear everything ── */
    const clear = () => {
        if (mode === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
        setPreview('');
        setIsEmpty(true);
        onChange('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div>
            {/* Mode toggle */}
            <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => { setMode('draw'); clear(); }}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${mode === 'draw' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    ✏️ Draw
                </button>
                <button type="button" onClick={() => { setMode('upload'); clear(); }}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${mode === 'upload' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    🖼 Upload Image
                </button>
            </div>

            {/* Draw mode */}
            {mode === 'draw' && (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white relative">
                    <canvas
                        ref={canvasRef}
                        width={400} height={120}
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
            )}

            {/* Upload mode */}
            {mode === 'upload' && (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                    {preview ? (
                        <img src={preview} alt="Signature" className="w-full h-[120px] object-contain p-2" />
                    ) : (
                        <div
                            className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => fileRef.current?.click()}
                        >
                            <svg className="w-8 h-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-400">Click to upload PNG / JPG signature</span>
                        </div>
                    )}
                    {/* Hidden file input — accepts images only */}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            )}

            <button type="button" onClick={clear}
                className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                Clear signature
            </button>
        </div>
    );
}

export default function ClientRequestForm() {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const { data, setData, post, processing, errors } = useForm({
        client_name:          '',
        address:              '',
        occupation:           '',
        contact_number:       '',
        email:                '',
        agency:               '',
        office_address:       '',
        // Service flags
        svc_training:          false,
        svc_cvsu_form:         false,
        svc_language_training: false,
        svc_translation:       false,
        svc_proficiency:       false,
        svc_research_funding:  false,
        // Sub-options
        language_options:      [],
        translation_document:  '',
        proficiency_options:   [],
        research_title:        '',
        // Signature
        client_signature:      '',
        printed_name:          '',
    });

    const toggleArr = (field, val) =>
        setData(field, data[field].includes(val)
            ? data[field].filter(v => v !== val)
            : [...data[field], val]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const services = [];
        if (data.svc_training)          services.push('training');
        if (data.svc_cvsu_form)         services.push('cvsu_form_style');
        if (data.svc_language_training) services.push('language_training');
        if (data.svc_translation)       services.push('translation_editing');
        if (data.svc_proficiency)       services.push('language_proficiency');
        if (data.svc_research_funding)  services.push('research_funding');

        post(route('client-request.submit'), {
            data: {
                client_name:          data.client_name,
                address:              data.address,
                occupation:           data.occupation,
                contact_number:       data.contact_number,
                email:                data.email,
                agency:               data.agency,
                office_address:       data.office_address,
                services,
                language_options:     data.language_options,
                translation_document: data.translation_document,
                proficiency_options:  data.proficiency_options,
                research_title:       data.research_title,
                client_signature:     data.client_signature,
                printed_name:         data.printed_name,
            },
        });
    };

    /* ── Shared styles ── */
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none';
    const chk = 'w-4 h-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500 shrink-0 mt-0.5';
    const subChk = 'w-3.5 h-3.5 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500 shrink-0';

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Client Request Form — CVSU-CELLAR" />

            {/* Header */}
            <header className="bg-emerald-900 text-white px-6 py-4 flex items-center gap-4">
                <div className="bg-green-700 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <div>
                    <p className="text-[15px] font-bold leading-tight">CVSU-CELLAR</p>
                    <p className="text-[11px] text-emerald-300">Center for Language Learning and Research</p>
                </div>
                <Link href="/" className="ml-auto text-emerald-300 hover:text-white text-sm transition-colors">← Back</Link>
            </header>

            <div className="max-w-[760px] mx-auto px-4 py-10">

                {/* Title */}
                <div className="text-center mb-8">
                    <p className="text-xs text-gray-400 mb-1">Republic of the Philippines · Cavite State University · Don Severino delas Alas Campus, Indang, Cavite</p>
                    <p className="text-sm font-semibold text-gray-600 mb-0.5">CENTER FOR LANGUAGE LEARNING AND RESEARCH</p>
                    <h1 className="text-xl font-extrabold text-gray-900">CLIENT REQUEST FORM</h1>
                    <p className="text-xs text-gray-400 mt-1">CLLR-QF-01 &nbsp;|&nbsp; {today}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Client Information ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5 pb-3 border-b border-gray-100">
                            Client Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name of Client <span className="text-red-500">*</span></label>
                                <input type="text" value={data.client_name} onChange={e => setData('client_name', e.target.value)} className={inputCls} />
                                {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address <span className="text-red-500">*</span></label>
                                <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className={inputCls} />
                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Occupation / Designation <span className="text-red-500">*</span></label>
                                <input type="text" value={data.occupation} onChange={e => setData('occupation', e.target.value)} className={inputCls} />
                                {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact Number/s <span className="text-red-500">*</span></label>
                                <input type="text" value={data.contact_number} onChange={e => setData('contact_number', e.target.value)} className={inputCls} />
                                {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputCls} />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Agency / Institution / Company / Organization</label>
                                <input type="text" value={data.agency} onChange={e => setData('agency', e.target.value)} className={inputCls} placeholder="Optional" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Office Address</label>
                                <input type="text" value={data.office_address} onChange={e => setData('office_address', e.target.value)} className={inputCls} placeholder="Optional" />
                            </div>
                        </div>
                    </div>

                    {/* ── Services Requested ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1 pb-3 border-b border-gray-100">
                            Type of Services Requested <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">(put a check)</p>
                        {errors.services && <p className="text-xs text-red-500 mb-3">{errors.services}</p>}

                        <div className="space-y-4">

                            {/* Training */}
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input type="checkbox" checked={data.svc_training} onChange={e => setData('svc_training', e.target.checked)} className={chk} />
                                <span className="text-sm font-semibold text-gray-800">Training</span>
                            </label>

                            {/* CvSU Form and Style */}
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input type="checkbox" checked={data.svc_cvsu_form} onChange={e => setData('svc_cvsu_form', e.target.checked)} className={chk} />
                                <span className="text-sm text-gray-800">CvSU Form and Style</span>
                            </label>

                            {/* Language Training Courses */}
                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="checkbox" checked={data.svc_language_training} onChange={e => setData('svc_language_training', e.target.checked)} className={chk} />
                                    <span className="text-sm text-gray-800">Language Training Courses</span>
                                </label>
                                {/* Sub-options always visible, matching the physical form */}
                                <div className="ml-7 mt-2 grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-2">
                                    {LANGUAGES.map(lang => (
                                        <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox"
                                                checked={data.language_options.includes(lang)}
                                                onChange={() => toggleArr('language_options', lang)}
                                                className={subChk}
                                                disabled={!data.svc_language_training}
                                            />
                                            <span className={`text-xs ${data.svc_language_training ? 'text-gray-700' : 'text-gray-400'}`}>{lang}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Translation/Editing Services */}
                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="checkbox" checked={data.svc_translation} onChange={e => setData('svc_translation', e.target.checked)} className={chk} />
                                    <span className="text-sm font-semibold text-gray-800">Translation/Editing Services</span>
                                </label>
                                {/* Document field always visible */}
                                <div className="ml-7 mt-2">
                                    <p className={`text-xs mb-1 ${data.svc_translation ? 'text-gray-500' : 'text-gray-300'}`}>
                                        Type/Title of document to be translated/edited:
                                    </p>
                                    <input type="text" value={data.translation_document}
                                        onChange={e => setData('translation_document', e.target.value)}
                                        disabled={!data.svc_translation}
                                        className={`w-full border-0 border-b text-sm focus:outline-none py-1 bg-transparent transition-colors ${
                                            data.svc_translation
                                                ? 'border-gray-400 text-gray-900 focus:border-emerald-500'
                                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        }`}
                                        placeholder="Enter document title" />
                                    {errors.translation_document && <p className="text-xs text-red-500 mt-0.5">{errors.translation_document}</p>}
                                </div>
                            </div>

                            {/* Language Proficiency Test */}
                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="checkbox" checked={data.svc_proficiency} onChange={e => setData('svc_proficiency', e.target.checked)} className={chk} />
                                    <span className="text-sm font-semibold text-gray-800">Language Proficiency Test</span>
                                </label>
                                {/* Sub-tests always visible */}
                                <div className="ml-7 mt-2 space-y-2">
                                    {PROFICIENCY.map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox"
                                                checked={data.proficiency_options.includes(key)}
                                                onChange={() => toggleArr('proficiency_options', key)}
                                                className={subChk}
                                                disabled={!data.svc_proficiency}
                                            />
                                            <span className={`text-xs ${data.svc_proficiency ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Language/Communication Research Funding */}
                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="checkbox" checked={data.svc_research_funding} onChange={e => setData('svc_research_funding', e.target.checked)} className={chk} />
                                    <span className="text-sm font-semibold text-gray-800">Language/Communication Research Funding</span>
                                </label>
                                {/* Research title always visible */}
                                <div className="ml-7 mt-2">
                                    <p className={`text-xs mb-1 ${data.svc_research_funding ? 'text-gray-500' : 'text-gray-300'}`}>
                                        Title of Research requested for funding:
                                    </p>
                                    <input type="text" value={data.research_title}
                                        onChange={e => setData('research_title', e.target.value)}
                                        disabled={!data.svc_research_funding}
                                        className={`w-full border-0 border-b text-sm focus:outline-none py-1 bg-transparent transition-colors ${
                                            data.svc_research_funding
                                                ? 'border-gray-400 text-gray-900 focus:border-emerald-500'
                                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        }`}
                                        placeholder="Enter research title" />
                                    {errors.research_title && <p className="text-xs text-red-500 mt-0.5">{errors.research_title}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Signature Section ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5 pb-3 border-b border-gray-100">
                            Requested By
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    E-Signature <span className="text-red-500">*</span>
                                </label>
                                <SignaturePad onChange={val => setData('client_signature', val)} />
                                {errors.client_signature && <p className="text-xs text-red-500 mt-1">{errors.client_signature}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Printed Name <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={data.printed_name}
                                    onChange={e => setData('printed_name', e.target.value)}
                                    className={inputCls} placeholder="Your full name" />
                                <p className="text-xs text-gray-400 mt-1.5">Name and Signature of Client</p>
                                <p className="text-xs text-gray-400 mt-1">Date: {today}</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">A confirmation copy will be sent to your email upon submission.</p>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                            {processing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting…
                                </>
                            ) : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
