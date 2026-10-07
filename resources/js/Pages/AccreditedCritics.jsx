import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import CriticRequestModal from '@/Components/CriticRequestModal';

const CRITICS_DATA = [
    {
        college: 'College of Agriculture, Food, Environment, and Natural Resources',
        code: 'CAFENR',
        color: 'from-emerald-500/10 to-teal-500/10 text-emerald-800 border-emerald-200/50',
        badgeColor: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20',
        avatarColor: 'bg-emerald-100 text-emerald-800',
        list: [
            'Critic Dummy 3'
        ]
    },
    {
        college: 'College of Arts and Sciences',
        code: 'CAS',
        color: 'from-purple-500/10 to-pink-500/10 text-purple-800 border-purple-200/50',
        badgeColor: 'bg-purple-500/10 text-purple-700 ring-purple-600/20',
        avatarColor: 'bg-purple-100 text-purple-800',
        list: [
            'Critic Dummy 1'
        ]
    },
    {
        college: 'College of Education',
        code: 'CED',
        color: 'from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200/50',
        badgeColor: 'bg-amber-500/10 text-amber-700 ring-amber-600/20',
        avatarColor: 'bg-amber-100 text-amber-800',
        list: [
            'Critic Dummy 6'
        ]
    },
    {
        college: 'College of Engineering and Information Technology',
        code: 'CEIT',
        color: 'from-blue-500/10 to-indigo-500/10 text-blue-800 border-blue-200/50',
        badgeColor: 'bg-blue-500/10 text-blue-700 ring-blue-600/20',
        avatarColor: 'bg-blue-100 text-blue-800',
        list: [
            'Critic Dummy 2'
        ]
    },
    {
        college: 'College of Economics, Management, and Development Studies',
        code: 'CEMDS',
        color: 'from-sky-500/10 to-cyan-500/10 text-sky-800 border-sky-200/50',
        badgeColor: 'bg-sky-500/10 text-sky-700 ring-sky-600/20',
        avatarColor: 'bg-sky-100 text-sky-800',
        list: [
            'Critic Dummy 4'
        ]
    },
    {
        college: 'College of Nursing',
        code: 'CON',
        color: 'from-rose-500/10 to-pink-500/10 text-rose-800 border-rose-200/50',
        badgeColor: 'bg-rose-500/10 text-rose-700 ring-rose-600/20',
        avatarColor: 'bg-rose-100 text-rose-800',
        list: [
            'Critic Dummy 5'
        ]
    },
    {
        college: 'College of Veterinary Medicine and Biomedical Sciences',
        code: 'CVMBS',
        color: 'from-red-500/10 to-orange-500/10 text-red-800 border-red-200/50',
        badgeColor: 'bg-red-500/10 text-red-700 ring-red-600/20',
        avatarColor: 'bg-red-100 text-red-800',
        list: [
            'Critic Dummy 7'
        ]
    }
];

export default function AccreditedCritics() {
    const [search, setSearch] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [copiedName, setCopiedName] = useState(null);

    // Flatten all critics with college context
    const allCritics = useMemo(() => {
        let result = [];
        CRITICS_DATA.forEach((c) => {
            c.list.forEach((name, index) => {
                result.push({
                    name,
                    index: index + 1,
                    college: c.college,
                    code: c.code,
                    badgeColor: c.badgeColor,
                    avatarColor: c.avatarColor,
                });
            });
        });
        return result;
    }, []);

    // Filtered critics list
    const filteredCritics = useMemo(() => {
        return allCritics.filter((critic) => {
            const matchesSearch =
                critic.name.toLowerCase().includes(search.toLowerCase()) ||
                critic.college.toLowerCase().includes(search.toLowerCase()) ||
                critic.code.toLowerCase().includes(search.toLowerCase());
            
            const matchesCollege = selectedCollege === 'ALL' || critic.code === selectedCollege;

            return matchesSearch && matchesCollege;
        });
    }, [allCritics, search, selectedCollege]);

    // Handle copying critic name
    const handleCopy = (name) => {
        navigator.clipboard.writeText(name).then(() => {
            setCopiedName(name);
            setTimeout(() => setCopiedName(null), 2000);
        });
    };

    // Calculate college counts dynamically
    const collegeCounts = useMemo(() => {
        const counts = { ALL: allCritics.length };
        CRITICS_DATA.forEach((c) => {
            counts[c.code] = c.list.length;
        });
        return counts;
    }, [allCritics]);

    // Highlight search match helper
    const highlightText = (text, highlight) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-100 text-yellow-900 rounded px-0.5 font-bold">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Accredited English Critics" />

            {/* Print Only Header (Hidden on Screen) */}
            <div className="hidden print:block mb-8">
                <div className="text-center border-b-2 border-gray-900 pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Cavite State University</h1>
                    <p className="text-sm font-semibold">Office of the Director for Curriculum and Instruction</p>
                    <p className="text-xs text-gray-500">Don Severino de las Alas Campus, Indang, Cavite</p>
                    <div className="mt-4">
                        <h2 className="text-lg font-bold">LIST OF ACCREDITED ENGLISH CRITICS</h2>
                        <p className="text-sm font-medium">As of December 15, 2025</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto space-y-6 print:p-0">

                {/* ── Header Area ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Active Directory
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Updated December 15, 2025</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mt-1.5">
                            Accredited English Critics
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            List of officially accredited English Critics across Cavite State University colleges.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-9a9 9 0 0118 0v3h-18v-3z" />
                            </svg>
                            Print List
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                    {[
                        { label: 'Total Critics', value: allCritics.length, color: 'bg-blue-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                        { label: 'Colleges Represented', value: CRITICS_DATA.length, color: 'bg-emerald-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                        { label: 'Primary Pool', value: 'CAS (1)', color: 'bg-purple-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Accreditation Status', value: 'Active', color: 'bg-amber-600', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3">
                            <div className={`${card.color} text-white p-2 rounded-xl shrink-0`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter & Search Section ── */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4 print:hidden">
                    {/* Search & Views */}
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
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search critics by name, college, or abbreviation..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none"
                            />
                        </div>

                        {/* View Modes */}
                        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'list' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                List
                            </button>
                        </div>
                    </div>

                    {/* College Filter Pills */}
                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Colleges</p>
                        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => setSelectedCollege('ALL')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                    selectedCollege === 'ALL'
                                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                All Colleges ({collegeCounts.ALL})
                            </button>
                            {CRITICS_DATA.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => setSelectedCollege(c.code)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                        selectedCollege === c.code
                                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {c.code} ({collegeCounts[c.code]})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Success Toast for Copying ── */}
                {copiedName && (
                    <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border border-gray-800 animate-slide-in">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied &quot;{copiedName}&quot; to clipboard</span>
                    </div>
                )}

                {/* ── Critics Grid / List ── */}
                <div className="print:block">
                    {/* Screen View */}
                    <div className="print:hidden">
                        {filteredCritics.length === 0 ? (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
                                <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
                                </svg>
                                <p className="text-gray-500 text-sm font-semibold">No Accredited Critics Found</p>
                                <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms or selecting a different college.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCritics.map((critic, i) => (
                                    <div
                                        key={i}
                                        className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 rounded-2xl p-5 flex flex-col justify-between relative group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${critic.avatarColor}`}>
                                                {critic.name.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-gray-400 font-mono">#{critic.index}</span>
                                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${critic.badgeColor}`}>
                                                        {critic.code}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                                                    {highlightText(critic.name, search)}
                                                </h3>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    {critic.college}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(critic.name)}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 hover:text-blue-900 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                title="Copy Name"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Copy Name
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right print:hidden">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredCritics.map((critic, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                                        #{critic.index}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${critic.avatarColor}`}>
                                                                {critic.name.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-gray-800 text-sm">
                                                                {highlightText(critic.name, search)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${critic.badgeColor}`}>
                                                                {critic.code}
                                                            </span>
                                                            <span className="text-xs text-gray-500 truncate max-w-[400px]">
                                                                {critic.college}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right print:hidden">
                                                        <button
                                                            onClick={() => handleCopy(critic.name)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 hover:text-blue-900 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                            Copy
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Print Layout (Only visible when printing) */}
                    <div className="hidden print:block space-y-6">
                        {CRITICS_DATA.map((c) => {
                            // If user filtered for a specific college and this isn't it, skip
                            if (selectedCollege !== 'ALL' && selectedCollege !== c.code) {
                                return null;
                            }

                            // Filter list based on search query
                            const filteredList = c.list.filter(name => 
                                name.toLowerCase().includes(search.toLowerCase())
                            );

                            if (filteredList.length === 0) return null;

                            return (
                                <div key={c.code} className="space-y-2 page-break-inside-avoid">
                                    <h3 className="text-sm font-bold border-b border-gray-400 pb-1 text-gray-800 uppercase tracking-wide">
                                        {c.college} ({c.code})
                                    </h3>
                                    <table className="w-full text-left text-xs border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100 border-b border-gray-300">
                                                <th className="px-3 py-1.5 font-bold border-r border-gray-300 w-12 text-center">#</th>
                                                <th className="px-3 py-1.5 font-bold">Critic Name</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300">
                                            {filteredList.map((name, i) => (
                                                <tr key={i} className="border-b border-gray-300">
                                                    <td className="px-3 py-1 border-r border-gray-300 text-center font-mono text-gray-600">{i + 1}</td>
                                                    <td className="px-3 py-1 font-semibold text-gray-800">{name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
            <CriticRequestModal colleges={CRITICS_DATA} />
        </AuthenticatedLayout>
    );
}
