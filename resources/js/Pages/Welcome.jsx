import { Head, Link } from '@inertiajs/react';

/**
 * Welcome / Landing page — public entry point.
 *
 * Two clear actions:
 *   1. Submit Client Request  → /request  (no login needed)
 *   2. Staff Login            → /login
 */
export default function Welcome() {
    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col">
            <Head title="CELLAR IMS" />

            {/* ── Header ── */}
            <header className="px-8 py-5 flex items-center gap-4">
                <div className="bg-green-700 p-2 rounded-xl shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <div>
                    <p className="text-white text-[16px] font-bold leading-tight">CELLAR</p>
                    <p className="text-emerald-300 text-[11px]">Information Management System</p>
                </div>

                {/* Staff login link top-right */}
                <div className="ml-auto">
                    <Link
                        href={route('login')}
                        className="text-emerald-200 hover:text-white text-sm font-medium transition-colors"
                    >
                        Staff Login →
                    </Link>
                </div>
            </header>

            {/* ── Hero ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    CVSU-CELLAR<br />
                    <span className="text-amber-400">Information Management System</span>
                </h1>
                <p className="text-emerald-200 text-base sm:text-lg max-w-xl mb-10">
                    Center for Language Learning and Research - Cavite State University.
                    Submit a service request or log in to manage documents.
                </p>

                {/* ── Two action cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">

                    {/* Submit Client Request */}
                    <Link
                        href={route('client-request.form')}
                        className="group bg-white hover:bg-amber-50 border-2 border-white hover:border-amber-400 rounded-2xl p-7 text-left transition-all shadow-lg"
                    >
                        <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h2 className="text-gray-900 font-bold text-lg mb-1">Submit Client Request</h2>
                        <p className="text-gray-500 text-sm">
                            Request training, translation, language testing, or research funding services.
                        </p>
                        <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                            Fill out form
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>

                    {/* Staff Login */}
                    <Link
                        href={route('login')}
                        className="group bg-emerald-800 hover:bg-emerald-700 border-2 border-emerald-700 hover:border-emerald-500 rounded-2xl p-7 text-left transition-all shadow-lg"
                    >
                        <div className="bg-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-lg mb-1">Staff Login</h2>
                        <p className="text-emerald-300 text-sm">
                            Director and Admin Assistant access to manage documents, links, and requests.
                        </p>
                        <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-emerald-300 group-hover:text-white">
                            Log in
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="text-center text-emerald-500 text-xs pb-6">
                © {new Date().getFullYear()}   CENTER FOR LANGUAGE-LEARNING AND RESEARCH OF CAVITE STATE UNIVERSITY
            </footer>
        </div>
    );
}
