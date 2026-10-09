
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';

/**
 * Welcome / Landing page — Clean, minimal plain style.
 * Matches dashboard layout aesthetic (Light background, slate text, solid blue accents)
 */
export default function Welcome() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white text-slate-800">
            <Head title="CELLAR IMS" />

            {/* ── Header ── */}
            <header className="px-8 py-5 flex items-center gap-4 bg-white border-b border-slate-200 w-full relative z-10">
                <div className="bg-[#1e40af] p-2 rounded-lg shrink-0 shadow-sm">
                    <ApplicationLogo className="h-8 w-8 object-contain" />
                </div>
                <div>
                    <p className="text-slate-900 text-[16px] font-black tracking-wider leading-tight">CELLAR</p>
                    <p className="text-slate-500 text-[11px] tracking-wide font-medium">Information Management System</p>
                </div>

            </header>

            {/* ── Hero & Main Section ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-6xl w-full mx-auto py-12 relative z-10">
                
                {/* Visual Identity Badge */}
                <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Official Repository Panel</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                    CELLAR<br />
                    <span className="text-blue-600 font-extrabold text-2xl sm:text-4xl tracking-normal block mt-2">
                        Information Management System
                    </span>
                </h1>
                
                {/* Secondary Institution Context */}
                <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-14 max-w-xl">
                    Center for Language Learning and Research <span className="text-slate-300">•</span> Cavite State University
                </p>

                {/* ── 3-Column Visual Grid Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                    
                    {/* CARD 1: INTERNAL OPERATIONS */}
                    <Link
                        href={route('operator.login')}
                        className="group bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all duration-200 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-blue-100 transition-all duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-slate-900 font-extrabold text-lg mb-2 tracking-tight">CELLAR Operators</h2>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Executive Director, Admin Assistant, and Core Staff entry point. 
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 mt-6 text-xs font-bold uppercase tracking-wider text-blue-600">
                            Authenticate Account
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>

                    {/* CARD 2: EVALUATOR PORTAL */}
                    <Link
                        href={route('evaluator.login')} 
                        className="group bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all duration-200 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-blue-100 transition-all duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                        d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <h2 className="text-slate-900 font-extrabold text-lg mb-2 tracking-tight">Evaluator Portal</h2>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Login as evaluator
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 mt-6 text-xs font-bold uppercase tracking-wider text-blue-600">
                            Reviewer Login
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>

                    {/* CARD 3: PUBLIC REPOSITORIES */}
                    <Link
                        href={route('public-critics')} 
                        className="group bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all duration-200 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-blue-100 transition-all duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-slate-900 font-extrabold text-lg mb-2 tracking-tight">Lists of English Critics</h2>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                View Lists of Accredited English Critics in your college.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 mt-6 text-xs font-bold uppercase tracking-wider text-blue-600">
                            See Lists
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>

                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="text-center text-slate-400 text-[10px] py-6 border-t border-slate-200 bg-white font-bold tracking-widest uppercase relative z-10">
                © {new Date().getFullYear()} CENTER FOR LANGUAGE-LEARNING AND RESEARCH OF CAVITE STATE UNIVERSITY
            </footer>
        </div>
    );
}

function RegistrationCard() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [college, setCollege] = useState('');

    const colleges = [
        'College of Arts and Letters',
        'College of Education',
        'College of Engineering',
        'College of Science',
        'College of Business Administration',
    ];

    function handleSubmit(e) {
        e.preventDefault();
        console.log({ fullName, email, password, confirmPassword, college });
        alert('Registration submitted (UI only).');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Full Name</label>
                <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase">University Email <span className="text-xs text-slate-400">(@cvsu.edu.ph only)</span></label>
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@cvsu.edu.ph"
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase">College</label>
                <select
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                    <option value="">Select your college</option>
                    {colleges.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Password</label>
                <TextInput
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Confirm Password</label>
                <TextInput
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
            </div>

            <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 font-bold transition-colors">Register</button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-2">
                Already have an account? <Link href={route('evaluator.login')} className="text-blue-600 font-bold hover:underline">Log in</Link>
            </p>
        </form>
    );
}
