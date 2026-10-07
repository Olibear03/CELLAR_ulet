import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword, portal = 'operator' }) {
    const isEvaluator = portal === 'evaluator';
    const portalTitle = isEvaluator ? 'Evaluator Portal' : 'CELLAR Operator Login';
    const portalDescription = isEvaluator
        ? 'English Critics only. New accounts require Director approval.'
        : 'Sign in with your CELLAR operator account.';
    const operatorRoles = [
        { label: 'Director', value: 'director' },
        { label: 'Admin Assistant', value: 'assistant' },
        { label: 'Staff', value: 'staff' },
    ];
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        portal,
        operator_role: 'staff',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout logoInside={!isEvaluator}>
            <Head title={isEvaluator ? 'Evaluator Login' : 'CELLAR Operator Login'} />

            {/* Header Title Box */}
            <div className={`mb-6 rounded-2xl bg-white px-5 py-4 text-center border shadow-sm transition-all ${
                isEvaluator 
                    ? 'border-amber-200 text-amber-900' 
                    : 'border-slate-100 text-slate-900'
            }`}>
                <h1 className="text-xl font-extrabold tracking-tight">
                    {portalTitle}
                </h1>
                <p className={`mt-1 text-xs sm:text-sm font-semibold ${isEvaluator ? 'text-amber-700' : 'text-blue-600'}`}>
                    {portalDescription}
                </p>
            </div>

            {/* Role Selection Slider */}
            {!isEvaluator && (
                <fieldset className="mb-6">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <legend className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Select your role
                        </legend>
                        <span className="text-[11px] font-medium text-stone-400">Required</span>
                    </div>

                    <div className="relative grid grid-cols-3 rounded-full bg-blue-100 p-1 border border-blue-200/80">
                        <span
                            aria-hidden="true"
                            className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-blue-800 shadow-sm transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(${operatorRoles.findIndex((role) => role.value === data.operator_role) * 100}%)` }}
                        />
                        {operatorRoles.map((role, index) => (
                            <button
                                key={role.value}
                                type="button"
                                aria-pressed={data.operator_role === role.value}
                                onClick={() => setData('operator_role', role.value)}
                                className={`relative z-10 rounded-full py-2 text-xs sm:text-sm transition-colors duration-200 ${
                                    data.operator_role === role.value
                                        ? 'text-white font-bold'
                                        : 'text-blue-900 font-medium hover:text-blue-700'
                                }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                    <InputError message={errors.operator_role} className="mt-2 text-center" />
                    <p className="mt-2 text-center text-[11px] text-stone-500">
                        Access is based on the permissions assigned to your account.
                    </p>
                </fieldset>
            )}

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
                        Email Address
                    </label>

                    <div className="relative flex items-center rounded-2xl bg-white border border-slate-200/80 px-3.5 py-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
                        <svg className="w-5 h-5 text-slate-400 me-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="cvsu.edu.ph"
                            value={data.email}
                            className="w-full bg-transparent p-0 text-sm text-slate-800 placeholder-slate-400 border-none focus:outline-none focus:ring-0"
                            autoComplete="username"
                            autoFocus={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>

                    <InputError message={errors.email} className="mt-1.5 px-1" />
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex items-center justify-between px-1 mb-1.5">
                        <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="relative flex items-center rounded-2xl bg-white border border-slate-200/80 px-3.5 py-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
                        <svg className="w-5 h-5 text-slate-400 me-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••••••"
                            value={data.password}
                            className="w-full bg-transparent p-0 text-sm text-slate-800 placeholder-slate-400 border-none focus:outline-none focus:ring-0"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none ms-2"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5 px-1" />
                </div>

                {/* Remember Me */}
                <div className="pt-1">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ms-2.5 text-xs font-medium text-slate-600 select-none">
                            Remember me
                        </span>
                    </label>
                </div>

                {/* Log In Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-2xl bg-[#2563eb] py-3.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        LOG IN
                    </button>
                </div>

                {/* Register Footer Link */}
                <div className="pt-3 text-center">
                    <p className="text-xs font-medium text-slate-500">
                        Don't have an account?{' '}
                        <Link
                            href={isEvaluator ? route('critic.register') : route('register')}
                            className="font-bold text-blue-600 hover:underline ms-1"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
