import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * CriticManagement — Director-only page for managing English Critic accounts.
 * English Critics self-register at /register/critic.
 * This page lets the Director approve, deactivate, reset passwords, and delete them.
 */
export default function CriticManagement({ critics = [] }) {

    const [resetTarget,  setResetTarget]  = useState(null);
    const [newPassword,  setNewPassword]  = useState('');

    /* ── Actions ── */
    const handleApprove    = (id) => router.patch(route('critic.management.approve', id),    {}, { preserveScroll: true });
    const handleDeactivate = (id) => router.patch(route('critic.management.deactivate', id), {}, { preserveScroll: true });
    const handleDelete     = (id) => {
        if (confirm('Permanently delete this critic account? This cannot be undone.'))
            router.delete(route('critic.management.destroy', id));
    };
    const submitReset = (e) => {
        e.preventDefault();
        router.patch(route('critic.management.reset-password', resetTarget), { password: newPassword }, {
            onSuccess: () => { setResetTarget(null); setNewPassword(''); },
        });
    };

    /* ── Helpers ── */
    const statusBadge = (s) => {
        if (s === 'active')      return 'bg-green-100 text-green-700';
        if (s === 'deactivated') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const pending     = critics.filter(c => c.status === 'pending');
    const inputCls    = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none';

    return (
        <AuthenticatedLayout>
            <Head title="Critic Management" />
            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">
                            English Critic Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage external English Critic accounts. Critics self-register at{' '}
                            <a href={route('critic.register')} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 font-semibold hover:underline">
                                /register/critic
                            </a>.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 self-end">{critics.length} critics total</span>
                </div>

                {/* ── Pending Approvals ── */}
                {pending.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-sm font-bold text-amber-800">
                                Pending Critic Registrations ({pending.length})
                            </h2>
                        </div>
                        <div className="space-y-2">
                            {pending.map(c => (
                                <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                        <p className="text-xs text-gray-500">{c.email} · {c.college}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleApprove(c.id)}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                            Approve
                                        </button>
                                        <button onClick={() => handleDeactivate(c.id)}
                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors">
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Critics table ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h2 className="text-base font-bold text-gray-900">All English Critics</h2>
                    </div>

                    {critics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm font-medium">No critics registered yet.</p>
                            <p className="text-gray-400 text-xs mt-1">Critics self-register at /register/critic.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>

                                    <th className="px-6 py-3 w-10" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {critics.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {c.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-800">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{c.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                                {c.college}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${statusBadge(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {/* Action buttons */}
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {c.status === 'pending' && (
                                                    <button onClick={() => handleApprove(c.id)}
                                                        className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                                                        title="Approve">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </button>
                                                )}
                                                {c.status === 'active' && (
                                                    <button onClick={() => handleDeactivate(c.id)}
                                                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
                                                        title="Deactivate">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    </button>
                                                )}
                                                {c.status === 'deactivated' && (
                                                    <button onClick={() => handleApprove(c.id)}
                                                        className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                                                        title="Re-activate">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </button>
                                                )}
                                                <button onClick={() => { setResetTarget(c.id); setNewPassword(''); }}
                                                    className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                                    title="Reset Password">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                                    title="Hard Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Reset Password Modal ── */}
            {resetTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Reset Critic Password</h3>
                            <button onClick={() => setResetTarget(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitReset} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    New Password
                                </label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className={inputCls} autoFocus required minLength={8}
                                    placeholder="Minimum 8 characters" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setResetTarget(null)}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
