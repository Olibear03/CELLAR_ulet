import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Dropdown from '@/Components/Dropdown';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * CriticManagement — Director and permissioned assistant page for managing English Critic accounts.
 * English Critics self-register at /register/critic.
 * Directors can also register critics directly; authorized managers can approve, deactivate,
 * reset passwords, and delete accounts.
 */
export default function CriticManagement({ critics = [] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [resetTarget,  setResetTarget]  = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { auth, flash } = usePage().props;
    const {
        data: createData,
        setData: setCreateData,
        post: createCritic,
        processing: creatingCritic,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({ name: '', college: '', email: '', password: '' });
    const {
        data: resetData,
        setData: setResetData,
        patch: patchPassword,
        processing: resettingPassword,
        errors: resetErrors,
        reset: clearPassword,
    } = useForm({ password: '' });

    /* ── Actions ── */
    const submitCreate = (e) => {
        e.preventDefault();
        createCritic(route('critic.management.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                resetCreate();
            },
        });
    };

    const handleApprove    = (id) => router.patch(route('critic.management.approve', id),    {}, { preserveScroll: true });
    const handleDeactivate = (id) => router.patch(route('critic.management.deactivate', id), {}, { preserveScroll: true });
    const handleDelete     = (id) => {
        if (confirm('Permanently delete this critic account? This cannot be undone.'))
            router.delete(route('critic.management.destroy', id));
    };
    const submitReset = (e) => {
        e.preventDefault();
        patchPassword(route('critic.management.reset-password', resetTarget), {
            preserveScroll: true,
            onSuccess: () => { setResetTarget(null); clearPassword(); },
        });
    };

    /* ── Helpers ── */
    const statusBadge = (s) => {
        if (s === 'active')      return 'bg-green-100 text-green-700';
        if (s === 'deactivated') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const pending     = critics.filter(c => c.status === 'pending');
    const pageSize    = 8;
    const pageCount   = Math.ceil(critics.length / pageSize);
    const visibleCritics = critics.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const inputCls    = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none';

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, Math.max(pageCount, 1)));
    }, [pageCount]);

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
                            Manage English Critic accounts. New critics can be added here or self-register at{' '}
                            <a href={route('critic.register')} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 font-semibold hover:underline">
                                /register/critic
                            </a>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 self-end">
                        {auth.is_director && (
                            <button type="button" onClick={() => setCreateOpen(true)}
                                className="flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Register Critic
                            </button>
                        )}
                        <span className="text-xs font-semibold text-gray-400">{critics.length} critics total</span>
                    </div>
                </div>

                {flash?.success && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

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
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
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
                                {visibleCritics.map(c => (
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
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        aria-label={`Actions for ${c.name}`}
                                                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100"
                                                    >
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content
                                                    width="48"
                                                    contentClasses="rounded-xl bg-white py-1 shadow-lg ring-1 ring-gray-200"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => c.status === 'active' ? handleDeactivate(c.id) : handleApprove(c.id)}
                                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                                                            c.status === 'active' ? 'text-amber-700' : 'text-green-700'
                                                        }`}
                                                    >
                                                        {c.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { clearPassword(); setResetTarget(c.id); }}
                                                        className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Reset Password
                                                    </button>
                                                    <div className="my-1 border-t border-gray-100" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(c.id)}
                                                        disabled={Number(auth.user.id) === Number(c.id)}
                                                        title={Number(auth.user.id) === Number(c.id) ? 'You cannot delete your own account.' : undefined}
                                                        className="flex w-full items-center px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
                                                    >
                                                        Delete Account
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {pageCount > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                            <p className="text-xs text-gray-500">
                                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, critics.length)} of {critics.length} accounts
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-medium text-gray-500">Page {currentPage} of {pageCount}</span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(page + 1, pageCount))}
                                    disabled={currentPage === pageCount}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Register Critic Modal ── */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="register-critic-title"
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 id="register-critic-title" className="text-lg font-bold text-gray-900">Register English Critic</h3>
                                <p className="mt-1 text-sm text-gray-500">This account will be active immediately.</p>
                            </div>
                            <button type="button" onClick={() => { setCreateOpen(false); resetCreate(); }}
                                aria-label="Close registration"
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label htmlFor="critic-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</label>
                                <input id="critic-name" type="text" value={createData.name}
                                    onChange={e => setCreateData('name', e.target.value)}
                                    className={inputCls} autoFocus required />
                                {createErrors.name && <p className="mt-1 text-sm text-red-600">{createErrors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="critic-college" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">College</label>
                                <select id="critic-college" value={createData.college}
                                    onChange={e => setCreateData('college', e.target.value)}
                                    className={inputCls} required>
                                    <option value="">Select a college</option>
                                    {['CAFENR', 'CAS', 'CED', 'CEIT', 'CEMDS', 'CON', 'CVMBS'].map(college => (
                                        <option key={college} value={college}>{college}</option>
                                    ))}
                                </select>
                                {createErrors.college && <p className="mt-1 text-sm text-red-600">{createErrors.college}</p>}
                            </div>
                            <div>
                                <label htmlFor="critic-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">CvSU Email</label>
                                <input id="critic-email" type="email" value={createData.email}
                                    onChange={e => setCreateData('email', e.target.value)}
                                    className={inputCls} placeholder="name@cvsu.edu.ph" required />
                                {createErrors.email && <p className="mt-1 text-sm text-red-600">{createErrors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="critic-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Temporary Password</label>
                                <input id="critic-password" type="password" value={createData.password}
                                    onChange={e => setCreateData('password', e.target.value)}
                                    className={inputCls} minLength={8} autoComplete="new-password" required />
                                {createErrors.password && <p className="mt-1 text-sm text-red-600">{createErrors.password}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setCreateOpen(false); resetCreate(); }}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit" disabled={creatingCritic}
                                    className="rounded-lg bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                                    {creatingCritic ? 'Registering…' : 'Register Critic'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Reset Password Modal ── */}
            {resetTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Reset Critic Password</h3>
                            <button type="button" onClick={() => { setResetTarget(null); clearPassword(); }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitReset} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    New Password
                                </label>
                                <input type="password" value={resetData.password} onChange={e => setResetData('password', e.target.value)}
                                    className={inputCls} autoFocus required minLength={8}
                                    placeholder="Minimum 8 characters" />
                                {resetErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{resetErrors.password}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setResetTarget(null); clearPassword(); }}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit" disabled={resettingPassword}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                                    {resettingPassword ? 'Resetting…' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
