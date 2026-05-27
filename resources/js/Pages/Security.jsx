import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { useState } from 'react';
import InputError from '@/Components/InputError';

/**
 * Security page — User Management + Activity Logs.
 * Dropdown actions (Reset Password, Deactivate, Delete) are fully wired.
 */
export default function Security({ users = [], logs = [] }) {
    const authUser = usePage().props.auth.user;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [resetTarget, setResetTarget]             = useState(null); // user being reset
    const [tempPassword, setTempPassword]           = useState('');

    // Both director and admin can create assistants and manage users
    const canManageUsers = ['director', 'admin'].includes(authUser.role?.toLowerCase());
    // Only director can promote / demote
    const isDirector = authUser.role?.toLowerCase() === 'director';

    /* ── Create assistant form ── */
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '',
    });

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('security.users.store'), {
            onSuccess: () => { reset(); setIsCreateModalOpen(false); },
        });
    };

    /* ── Dropdown actions ── */
    const handleResetPassword = (userId) => {
        setResetTarget(userId);
        setTempPassword('');
    };

    const submitResetPassword = (e) => {
        e.preventDefault();
        router.patch(route('security.users.reset-password', resetTarget), {
            password: tempPassword,
        }, {
            onSuccess: () => { setResetTarget(null); setTempPassword(''); },
        });
    };

    const handleToggleStatus = (userId) => {
        router.patch(route('security.users.toggle-status', userId));
    };

    const handleDeleteUser = (userId) => {
        if (confirm('Permanently delete this account? This cannot be undone.')) {
            router.delete(route('security.users.destroy', userId));
        }
    };

    /* ── Promote assistant → admin (director only) ── */
    const handlePromote = (userId) => {
        if (confirm('Promote this assistant to Admin? They will gain user management access.')) {
            router.patch(route('security.users.promote', userId));
        }
    };

    /* ── Demote admin → assistant (director only) ── */
    const handleDemote = (userId) => {
        if (confirm('Demote this admin back to Assistant?')) {
            router.patch(route('security.users.demote', userId));
        }
    };

    /* ── Role badge color ── */
    const roleBadge = (role) => {
        if (role?.toLowerCase() === 'director')        return 'bg-blue-600 text-white';
        if (role?.toLowerCase() === 'admin')           return 'bg-purple-500 text-white';
        if (role?.toLowerCase().includes('assistant')) return 'bg-emerald-500 text-white';
        return 'bg-gray-400 text-white';
    };

    /* ── Shared input style ── */
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none';

    return (
        <AuthenticatedLayout>
            <Head title="Account Management" />
            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* ── Page header ── */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Account Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage user accounts, roles, and view activity logs.</p>
                    </div>
                    {canManageUsers && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-2.5 rounded-full font-semibold transition-colors shadow-sm text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Assistant
                        </button>
                    )}
                </div>

                {/* ── User Management ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h2 className="text-base font-bold text-gray-900">User Management</h2>
                        <span className="ml-auto text-xs font-semibold text-gray-400">{users.length} users</span>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                <th className="px-6 py-3 w-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {users.length > 0 ? users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${roleBadge(u.role)}`}>
                                            {u.role || 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${u.active === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {u.active === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {new Date(u.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Only show actions for non-director users that aren't yourself */}
                                        {u.role?.toLowerCase() !== 'director' && u.id !== authUser.id && canManageUsers && (
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    {/* Reset Password */}
                                                    <button onClick={() => handleResetPassword(u.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                        Reset Password
                                                    </button>

                                                    {/* Promote to Admin — director only, only for assistants */}
                                                    {isDirector && u.role?.toLowerCase() === 'admin_assistant' && (
                                                        <button onClick={() => handlePromote(u.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                            Promote to Admin
                                                        </button>
                                                    )}

                                                    {/* Demote to Assistant — director only, only for admins */}
                                                    {isDirector && u.role?.toLowerCase() === 'admin' && (
                                                        <button onClick={() => handleDemote(u.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                                            Demote to Assistant
                                                        </button>
                                                    )}

                                                    {/* Activate / Deactivate */}
                                                    <button onClick={() => handleToggleStatus(u.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                        {u.active === false ? (
                                                            <>
                                                                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                Activate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                                Deactivate
                                                            </>
                                                        )}
                                                    </button>

                                                    <div className="h-px bg-gray-100 my-1" />

                                                    {/* Delete — only director can delete admins; both can delete assistants */}
                                                    {(isDirector || u.role?.toLowerCase() === 'admin_assistant') && (
                                                        <button onClick={() => handleDeleteUser(u.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Delete Account
                                                        </button>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-400 text-sm">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Activity Logs ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-base font-bold text-gray-900">Activity Logs</h2>
                        <span className="ml-auto text-xs font-semibold text-gray-400">{logs.length} entries</span>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.user?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${roleBadge(log.user?.role)}`}>
                                            {log.user?.role || 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{log.action}</td>
                                    <td className="px-6 py-4 text-gray-600">{log.type}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 text-sm">No activity logged yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ── Create Assistant Modal ── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Create Assistant Account</h3>
                            <button onClick={() => { reset(); setIsCreateModalOpen(false); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" autoFocus required />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporary Password</label>
                                <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { reset(); setIsCreateModalOpen(false); }} className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
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
                            <button onClick={() => setResetTarget(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={tempPassword}
                                    onChange={(e) => setTempPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    autoFocus
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setResetTarget(null)} className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
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
