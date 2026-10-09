import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

export default function Security({ users = [], logs = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('security.users.store'), { onSuccess: () => reset() });
    };

    const role = (user) => {
        if (user.is_director) return 'Director';
        if (user.is_assistant) return 'Admin Assistant';
        if (user.is_staff) return 'Staff';
        if (user.is_critic) return 'English Critic';
        return 'User';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Account Management" />
            <div className="max-w-[1100px] mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Account Management</h1>
                    <p className="text-gray-500 mt-1">Manage CELLAR operator accounts and review account activity.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Create Admin Assistant</h2>
                        <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5" />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Email address" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5" />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                        <TextInput type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Temporary password" required minLength={8} className="w-full rounded-xl border border-gray-200 px-4 py-2.5" />
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                        <button disabled={processing} className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Create account</button>
                    </form>

                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3" /></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4">{role(user)}</td>
                                            <td className="px-6 py-4"><span className="rounded-md bg-gray-100 px-2 py-1 text-xs capitalize">{user.status}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                {user.id !== users.find(current => current.email === user.email)?.id ? null : (
                                                    <button onClick={() => router.patch(route('security.users.reset-password', user.id), { password: 'password' })} className="text-xs font-semibold text-blue-700 hover:underline">Reset password</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Recent Activity</h2></div>
                    <div className="divide-y divide-gray-100">
                        {logs.length === 0 ? <p className="px-6 py-8 text-sm text-gray-500">No account activity yet.</p> : logs.map(log => <div key={log.id} className="px-6 py-3 text-sm"><span className="font-medium">{log.user?.name ?? 'System'}</span><span className="text-gray-500"> · {log.action} · {log.created_at}</span></div>)}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
