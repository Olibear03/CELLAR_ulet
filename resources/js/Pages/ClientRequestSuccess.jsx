import { Head, Link } from '@inertiajs/react';

/**
 * ClientRequestSuccess — shown after a successful form submission.
 * Displays the reference number and next steps.
 */
export default function ClientRequestSuccess({ reference }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title="Request Submitted — CVSU-CELLAR" />

            {/* Header */}
            <header className="bg-emerald-900 text-white px-6 py-4 flex items-center gap-4">
                <div className="bg-green-700 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <div>
                    <p className="text-[15px] font-bold leading-tight">CVSU-CELLAR DMS</p>
                    <p className="text-[11px] text-emerald-300">Research Center</p>
                </div>
            </header>

            {/* Success card */}
            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
                    {/* Check icon */}
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Request Submitted!</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Your request has been received. A confirmation has been sent to your email.
                    </p>

                    {/* Reference number */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
                        <p className="text-xs text-gray-400 mb-1">Reference Number</p>
                        <p className="text-xl font-bold text-emerald-700 tracking-wider">{reference}</p>
                    </div>

                    <p className="text-xs text-gray-400 mb-6">
                        Please keep your reference number for follow-up inquiries.
                        The CELLAR team will review your request and contact you shortly.
                    </p>

                    <Link
                        href={route('client-request.form')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Submit another request
                    </Link>
                </div>
            </div>
        </div>
    );
}
