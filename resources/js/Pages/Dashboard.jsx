import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import FilePreviewModal from '@/Components/FilePreviewModal';

export default function Dashboard({
    totalFiles     = 0,
    totalLinks     = 0,
    monthlyUploads = {},
    recentUploads  = [],
    favorites      = [],
}) {
    const user = usePage().props.auth.user;
    const [previewFile, setPreviewFile]     = useState(null);
    const [uploadPeriod, setUploadPeriod]   = useState('monthly');
    const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build 12-slot array from the monthlyUploads object keyed by zero-padded month string
    const monthlyData = MONTHS.map((_, i) => {
        const key = String(i + 1).padStart(2, '0');
        return monthlyUploads[key] ?? 0;
    });
    const maxUploads = Math.max(...monthlyData, 1);

    const periodLabels = {
        weekly:  'Weekly Uploads',
        monthly: 'Monthly Uploads',
        yearly:  'Yearly Uploads',
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    const StatCard = ({ icon, label, value }) => (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="bg-blue-800 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-4xl font-extrabold text-gray-900 leading-none mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Live count</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-none">Dashboard</h1>
                    <p className="text-gray-500 font-semibold mt-1">Welcome Back, {user.name}</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <StatCard label="Total Files" value={totalFiles}
                        icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    />
                    <StatCard label="Total Links" value={totalLinks}
                        icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                    />
                </div>

                {/* Upload chart + Favorites */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Upload chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[280px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4 relative">
                            <h2 className="text-lg font-bold text-gray-900">{periodLabels[uploadPeriod]}</h2>
                            <button onClick={() => setPeriodMenuOpen(!periodMenuOpen)}
                                className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className={`w-4 h-4 transition-transform ${periodMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {periodMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setPeriodMenuOpen(false)} />
                                    <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44">
                                        {[
                                            { key: 'weekly',  label: 'Weekly Uploads',  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                            { key: 'monthly', label: 'Monthly Uploads', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                            { key: 'yearly',  label: 'Yearly Uploads',  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                                        ].map(({ key, label, icon }) => (
                                            <button key={key} onClick={() => { setUploadPeriod(key); setPeriodMenuOpen(false); }}
                                                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-colors ${uploadPeriod === key ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                                                </svg>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Bar chart */}
                        <div className="flex-1 flex flex-col justify-end gap-2 pt-2">
                            <div className="flex items-end gap-1.5 h-40">
                                {MONTHS.map((month, i) => {
                                    const val = monthlyData[i];
                                    const heightPct = (val / maxUploads) * 100;
                                    const isCurrent = i === new Date().getMonth();
                                    return (
                                        <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                                {val} upload{val !== 1 ? 's' : ''}
                                            </div>
                                            <div className="w-full flex items-end" style={{ height: '100%' }}>
                                                <div className={`w-full rounded-t-md transition-all duration-500 ${isCurrent ? 'bg-blue-600' : 'bg-blue-200 group-hover:bg-blue-400'}`}
                                                    style={{ height: `${Math.max(heightPct, val > 0 ? 4 : 0)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-1.5">
                                {MONTHS.map((month, i) => (
                                    <div key={month} className={`flex-1 text-center text-[10px] font-medium ${i === new Date().getMonth() ? 'text-blue-700 font-bold' : 'text-gray-400'}`}>
                                        {month}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-blue-600" />
                                    <span className="text-[11px] text-gray-500">Current month</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-blue-200" />
                                    <span className="text-[11px] text-gray-500">Other months</span>
                                </div>
                                <span className="ml-auto text-[11px] text-gray-400">{new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bookmarks panel */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Bookmarks</h2>
                            <Link href={route('favorites.index')} className="text-xs text-blue-700 font-semibold hover:underline">
                                View all
                            </Link>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                                </svg>
                                <p className="text-sm text-gray-400">No bookmarks yet</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {favorites.map((file) => {
                                    const isLink   = file.metadata?.type === 'link';
                                    const isFolder = file.metadata?.type === 'folder';
                                    const handleClick = () => {
                                        if (isLink) window.open(file.file_path, '_blank', 'noopener,noreferrer');
                                        else if (isFolder) window.location.href = `/documents/${file.title}`;
                                        else setPreviewFile(file);
                                    };
                                    return (
                                        <li key={file.id} onClick={handleClick}
                                            className="flex items-center gap-3 cursor-pointer rounded-xl p-2 -mx-2 hover:bg-gray-50 transition-colors group">
                                            <div className={`p-2 rounded-lg shrink-0 ${isFolder ? 'bg-blue-100 text-blue-500' : 'bg-blue-800 text-white'}`}>
                                                {isLink ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                ) : isFolder ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{file.title}</p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {file.user?.name ?? 'Unknown'}
                                                    {file.metadata?.year && ` · ${file.metadata.year}`}
                                                    {file.metadata?.rating_period && ` ${file.metadata.rating_period}`}
                                                </p>
                                            </div>
                                            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Latest files and folders from the past 30 days</p>
                    </div>
                    {recentUploads.length === 0 ? (
                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium text-sm">No activity yet</p>
                            <p className="text-gray-400 text-xs mt-1">Newly added files and folders will appear here.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentUploads.map((file) => {
                                const isFolder = file.metadata?.type === 'folder';

                                return (
                                <li key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="bg-blue-800 p-2.5 rounded-xl shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d={isFolder
                                                    ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                                    : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                                        <p className="mt-0.5 truncate text-xs text-gray-400">
                                            {isFolder ? 'Folder' : (file.original_filename || 'File')}
                                            {file.user?.name && ` · ${file.user.name}`}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-400 shrink-0">{formatDate(file.created_at)}</span>
                                </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

            </div>

            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </AuthenticatedLayout>
    );
}
