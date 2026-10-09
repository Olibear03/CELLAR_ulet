import { Head, useForm, Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';

export default function CriticRegister() {
    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        college:               '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('critic.register.store'));
    };

    const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none';

    return (
        <GuestLayout logoInside>
            <Head title="Critic Registration — CELLAR" />

            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create your account</h1>
                <p className="text-gray-500 text-sm mb-6">
                    For external university critics only. Your account will be reviewed before activation.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">College</label>
                        <select value={data.college} onChange={e => setData('college', e.target.value)} className={inputCls} required>
                            <option value="">Select your college</option>
                            <option value="CAFENR">CAFENR</option>
                            <option value="CAS">CAS</option>
                            <option value="CED">CED</option>
                            <option value="CEIT">CEIT</option>
                            <option value="CEMDS">CEMDS</option>
                            <option value="CON">CON</option>
                            <option value="CVMBS">CVMBS</option>
                        </select>
                        <InputError message={errors.college} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className={inputCls}
                            placeholder="Your full name"
                            autoFocus
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            University Email
                            <span className="ml-1 text-blue-600 normal-case font-normal">(@cvsu.edu.ph only)</span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className={inputCls}
                            placeholder="yourname@cvsu.edu.ph"
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                        <TextInput
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className={inputCls}
                            placeholder="Minimum 8 characters"
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                        <TextInput
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            className={inputCls}
                            placeholder="Re-enter your password"
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 mt-2"
                    >
                        {processing ? 'Registering…' : 'Register'}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-xs mt-5">
                    Already have an account?{' '}
                    <Link href={route('evaluator.login')} className="text-blue-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
