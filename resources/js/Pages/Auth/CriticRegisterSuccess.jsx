import { Head, Link } from '@inertiajs/react';

export default function CriticRegisterSuccess() {
    return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center px-4 py-12">
            <Head title="Registration Submitted — CELLAR" />

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                {/* Checkmark icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Registration Submitted</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Your account has been created and is <strong className="text-gray-700">pending approval</strong>.
                    An administrator will review your registration and activate your account shortly.
                    You will be able to log in once your account is approved.
                </p>

                <Link
                    href={route('evaluator.login')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
