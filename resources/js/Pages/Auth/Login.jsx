import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, portal = 'operator' }) {
    const isEvaluator = portal === 'evaluator';
    const portalTitle = isEvaluator ? 'Evaluator Portal' : 'CELLAR Operator Login';
    const portalDescription = isEvaluator
        ? 'English Critics only. New accounts require Director approval.'
        : 'For Directors, Admin Assistants, and Staff.';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        portal,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={isEvaluator ? 'Evaluator Login' : 'CELLAR Operator Login'} />

            <div className={`mb-6 rounded-lg border px-4 py-3 ${isEvaluator ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                <h1 className={`text-xl font-semibold ${isEvaluator ? 'text-amber-900' : 'text-blue-900'}`}>
                    {portalTitle}
                </h1>
                <p className={`mt-1 text-sm ${isEvaluator ? 'text-amber-800' : 'text-blue-800'}`}>
                    {portalDescription}
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-blue-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-stone-700">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex flex-col items-center space-y-2">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-teal-600 underline hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
                <div>
                    <p className="mt-4 text-center text-sm text-stone-700">
                        Don't have an account?{' '}
                        <Link
                            href={isEvaluator ? route('critic.register') : route('register')}
                            className={`font-medium ${isEvaluator ? 'text-amber-700 hover:text-amber-800' : 'text-teal-600 hover:text-teal-700'}`}
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
