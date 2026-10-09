import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

/**
 * AccountManagement — internal staff/assistant management.
 * Visible to: Director + Admin Assistant.
 * English Critics are managed separately on /critic-management.
 *
 * Director can:  create, approve, deactivate, reset password, hard-delete, transfer ownership
 * Assistant can: create, approve, deactivate, reset password (no delete, no transfer)
 */
export default function AccountManagement({ users = [], logs = [] }) {
    const { auth }    = usePage().props;
    const isDirector  = auth.is_director;
    const isAssistant = auth.is_assistant;

    const [createOpen,       setCreateOpen]       = useState(false);
    const [resetTarget,      setResetTarget]       = useState(null);
    const [tempPassword,     setTempPassword]      = useState('');
    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const [transferTarget,   setTransferTarget]    = useState(null);
    const [transferPassword, setTransferPassword]  = useState('');
    const [transferError,    setTransferError]     = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', role: 'staff',
    });
    const {
        data: permissionData,
        setData: setPermissionData,
        patch: patchPermissions,
        processing: savingPermissions,
        reset: resetPermissions,
    } = useForm({
        can_access_critic_reports: false,
        can_manage_critics: false,
    });

    /* ── Create account ── */
    const openCreate = (role) => { setData('role', role); setCreateOpen(true); };
    const submitCreate = (e) => {
        e.preventDefault();
        post(route('security.users.store'), {
            onSuccess: () => { reset(); setCreateOpen(false); },
        });
    };

    /* ── Actions ── */
    const handleApprove    = (id) => router.patch(route('security.users.approve', id),    {}, { preserveScroll: true });
    const handleDeactivate = (id) => router.patch(route('security.users.deactivate', id), {}, { preserveScroll: true });

    const handleDelete = (id) => {
        if (confirm('Permanently delete this account? This cannot be undone.'))
            router.delete(route('security.users.destroy', id));
    };

    const submitResetPassword = (e) => {
        e.preventDefault();
        router.patch(route('security.users.reset-password', resetTarget), { password: tempPassword }, {
            onSuccess: () => { setResetTarget(null); setTempPassword(''); },
        });
    };

    const openPermissions = (user) => {
        setPermissionsTarget(user);
        setPermissionData({
            can_access_critic_reports: Boolean(user.can_access_critic_reports),
            can_manage_critics: Boolean(user.can_manage_critics),
        });
    };

    const submitPermissions = (e) => {
        e.preventDefault();
        patchPermissions(route('security.users.permissions', permissionsTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setPermissionsTarget(null);
                resetPermissions();
            },
        });
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        setTransferError('');
        router.post(route('account-management.transfer-ownership'), {
            target_user_id: transferTarget.id,
            password:        transferPassword,
        }, {
            onError:   (errs) => setTransferError(errs.transfer || 'Transfer failed.'),
            onSuccess: ()     => { setTransferTarget(null); setTransferPassword(''); },
        });
    };

    /* ── Helpers ── */
    const roleLabel = (u) => {
        if (u.is_director)  return { label: 'Director',         cls: 'bg-blue-700 text-white' };
        if (u.is_assistant) return { label: 'Admin Assistant',  cls: 'bg-purple-600 text-white' };
        if (u.is_staff)     return { label: 'Staff',            cls: 'bg-sky-500 text-white' };
        return { label: 'User', cls: 'bg-gray-400 text-white' };
    };

    const statusBadge = (s) => {
        if (s === 'active')      return 'bg-green-100 text-green-700';
        if (s === 'deactivated') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    // Only show internal staff (no critics) on this page
    const internalUsers = users.filter(u => !u.is_critic);
    const pendingUsers  = internalUsers.filter(u => u.status === 'pending');
    const staffUsers    = internalUsers.filter(u => u.is_staff && !u.is_director && !u.is_assistant);

    const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none';

    return (
        <AuthenticatedLayout>
            <Head title="Account Management" />
            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">
                            Account Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage internal staff and assistant accounts.
                            {(isDirector || auth.can_manage_critics) && (
                                <> English Critics are managed on the{' '}
                                    <a href={route('critic.management')} className="text-blue-600 font-semibold hover:underline">
                                        Critic Management
                                    </a> page.
                                </>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => openCreate('staff')}
                            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white pl-4 pr-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Staff
                        </button>
                        {isDirector && (
                            <button onClick={() => openCreate('assistant')}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white pl-4 pr-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Assistant
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Pending Approvals ── */}
                {pendingUsers.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-sm font-bold text-amber-800">Pending Approvals ({pendingUsers.length})</h2>
                        </div>
                        <div className="space-y-2">
                            {pendingUsers.map(u => (
                                <div key={u.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleApprove(u.id)}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg">
                                            Approve
                                        </button>
                                        <button onClick={() => handleDeactivate(u.id)}
                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg">
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── User table ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h2 className="text-base font-bold text-gray-900">Internal Users</h2>
                        <span className="ml-auto text-xs font-semibold text-gray-400">{internalUsers.length} accounts</span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 w-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {internalUsers.map(u => {
                                const { label, cls } = roleLabel(u);
                                const isSelf      = u.id === auth.user.id;
                                const isTargetDir = u.is_director;
                                const canAct      = !isSelf && !isTargetDir;
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-800">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${cls}`}>{label}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${statusBadge(u.status)}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canAct && (
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="52">
                                                        {isDirector && u.is_assistant && (
                                                            <button onClick={() => openPermissions(u)}
                                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50">
                                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                Manage Permissions
                                                            </button>
                                                        )}
                                                        {/* Approve — if pending */}
                                                        {u.status === 'pending' && (
                                                            <button onClick={() => handleApprove(u.id)}
                                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50">
                                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                Approve
                                                            </button>
                                                        )}
                                                        {/* Reset password */}
                                                        <button onClick={() => { setResetTarget(u.id); setTempPassword(''); }}
                                                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                                            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                            Reset Password
                                                        </button>
                                                        {/* Deactivate */}
                                                        {u.status !== 'deactivated' && (
                                                            <button onClick={() => handleDeactivate(u.id)}
                                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                                                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                                Deactivate
                                                            </button>
                                                        )}
                                                        {/* Transfer ownership — Director → Staff, Assistant → Staff (target must be is_staff) */}
                                                        {(isDirector || isAssistant) && u.is_staff && (
                                                            <button onClick={() => { setTransferTarget(u); setTransferPassword(''); setTransferError(''); }}
                                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50">
                                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                                Transfer Role to {u.name.split(' ')[0]}
                                                            </button>
                                                        )}
                                                        {/* Hard delete — Director only */}
                                                        {isDirector && (
                                                            <>
                                                                <div className="h-px bg-gray-100 my-1" />
                                                                <button onClick={() => handleDelete(u.id)}
                                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    Hard Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {internalUsers.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-400 text-sm">No internal users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                        <p className="mt-1 text-xs text-gray-500">The five most recent account activities.</p>
                    </div>
                    {logs.length === 0 ? (
                        <p className="px-6 py-8 text-sm text-gray-500">No account activity yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {logs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {log.user?.name ?? 'System'}
                                            <span className="font-normal text-gray-600"> · {log.action.replaceAll('_', ' ')}</span>
                                        </p>
                                        <p className="mt-0.5 text-xs capitalize text-gray-400">
                                            {log.type?.replaceAll('_', ' ')}{log.location ? ` · ${log.location}` : ''}
                                        </p>
                                    </div>
                                    <time dateTime={log.created_at} className="shrink-0 text-xs text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </time>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* ── Create Account Modal ── */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">
                                Create {data.role === 'assistant' ? 'Admin Assistant' : 'Staff'} Account
                            </h3>
                            <button onClick={() => { reset(); setCreateOpen(false); }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} autoFocus required />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputCls} required />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Temporary Password</label>
                                <TextInput type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputCls} required minLength={8} />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <input type="hidden" name="role" value={data.role} />
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { reset(); setCreateOpen(false); }}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
                                <button type="submit" disabled={processing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                                    {processing ? 'Creating…' : 'Create'}
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
                            <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                            <button onClick={() => setResetTarget(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                                <TextInput type="password" value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                                    className={inputCls} autoFocus required minLength={8} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setResetTarget(null)}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Assistant Permissions Modal ── */}
            {permissionsTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="assistant-permissions-title"
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
                        <div className="flex justify-between items-start gap-4 mb-5">
                            <div>
                                <h3 id="assistant-permissions-title" className="text-lg font-bold text-gray-900">Assistant Permissions</h3>
                                <p className="text-sm text-gray-500 mt-1">Choose what {permissionsTarget.name} can access.</p>
                            </div>
                            <button type="button" onClick={() => setPermissionsTarget(null)}
                                aria-label="Close permissions"
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitPermissions} className="space-y-3">
                            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" checked={permissionData.can_access_critic_reports}
                                    onChange={e => setPermissionData('can_access_critic_reports', e.target.checked)}
                                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900">EC Billing Report</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">View English Critic billing reports and update payment status.</span>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" checked={permissionData.can_manage_critics}
                                    onChange={e => setPermissionData('can_manage_critics', e.target.checked)}
                                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900">Critic Management</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Review, activate, deactivate, and manage English Critic accounts.</span>
                                </span>
                            </label>
                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setPermissionsTarget(null)}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit" disabled={savingPermissions}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                                    {savingPermissions ? 'Saving…' : 'Save Permissions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Transfer Role Modal ── */}
            {transferTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-2 rounded-xl">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Transfer Role</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            Transfer your <strong>{isDirector ? 'Director' : 'Admin Assistant'}</strong> role to{' '}
                            <strong>{transferTarget.name}</strong>.
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            You will become a Staff member after this action.
                        </p>
                        {transferError && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                                {transferError}
                            </p>
                        )}
                        <form onSubmit={submitTransfer} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Confirm your password
                                </label>
                                <TextInput type="password" value={transferPassword}
                                    onChange={e => setTransferPassword(e.target.value)}
                                    className={inputCls} autoFocus required placeholder="Enter your current password" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setTransferTarget(null)}
                                    className="px-5 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                                <button type="submit"
                                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg">
                                    Confirm Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
