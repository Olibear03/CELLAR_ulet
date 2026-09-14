import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';

/**
 * Profile Edit page — matches the reference design:
 *
 *  Header: "My Profile" + subtitle
 *  Card 1: Avatar + name/role + Name / Email / Recovery Email fields + SAVE
 *  Card 2: CHANGE PASSWORD — Current / New / Confirm + SAVE
 */
export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    /* ── Profile info form ── */
    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        errors: profileErrors,
        processing: profileProcessing,
        recentlySuccessful: profileSaved,
    } = useForm({
        name:  user.name,
        email: user.email,
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'));
    };

    /* ── Password form ── */
    const passwordRef        = useRef();
    const currentPasswordRef = useRef();

    const {
        data: pwData,
        setData: setPwData,
        put: putPassword,
        errors: pwErrors,
        processing: pwProcessing,
        recentlySuccessful: pwSaved,
        reset: resetPw,
    } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPw(),
            onError: (errors) => {
                if (errors.password) {
                    resetPw('password', 'password_confirmation');
                    passwordRef.current?.focus();
                }
                if (errors.current_password) {
                    resetPw('current_password');
                    currentPasswordRef.current?.focus();
                }
            },
        });
    };

    /* ── Shared input style ── */
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none';

    /* ── Save button ── */
    const SaveBtn = ({ processing, label = 'SAVE' }) => (
        <button
            type="submit"
            disabled={processing}
            className="bg-blue-400 hover:bg-blue-500 disabled:opacity-60 text-blue-900 font-bold text-sm px-6 py-2 rounded-lg transition-colors"
        >
            {processing ? 'Saving…' : label}
        </button>
    );

    return (
        <AuthenticatedLayout>
            <Head title="My Profile" />

            <div className="max-w-[760px] mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your account information and security</p>
                </div>

                {/* ── Card 1: Profile info ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">

                    {/* Avatar + name/role */}
                    <div className="flex items-center gap-5 mb-7">
                        {/* Avatar with hover edit overlay */}
                        <div className="relative group w-20 h-20 shrink-0">
                            <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center text-white text-2xl font-bold select-none">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            {/* Edit overlay — appears on hover */}
                            <button
                                type="button"
                                className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Change photo"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-white text-[10px] font-semibold mt-0.5">Edit</span>
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{user.name}</h2>
                            <p className="text-gray-400 font-medium capitalize mt-0.5">{user.role ?? 'User'}</p>
                        </div>
                    </div>

                    <form onSubmit={submitProfile} className="space-y-5">
                        {/* Name + Email row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData('name', e.target.value)}
                                    className={inputCls}
                                    autoComplete="name"
                                />
                                <InputError message={profileErrors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData('email', e.target.value)}
                                    className={inputCls}
                                    autoComplete="email"
                                />
                                <InputError message={profileErrors.email} className="mt-1" />
                            </div>
                        </div>

                        {/* Recovery Email (display only — no backend field yet) */}
                        <div className="sm:w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Recovery Email</label>
                            <input
                                type="email"
                                placeholder="recovery@example.com"
                                className={inputCls}
                                disabled
                            />
                        </div>

                        {/* Email verification notice */}
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <p className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                Your email is unverified.
                            </p>
                        )}
                        {status === 'verification-link-sent' && (
                            <p className="text-sm text-blue-600">Verification link sent.</p>
                        )}

                        <div className="flex items-center gap-4">
                            <SaveBtn processing={profileProcessing} />
                            <Transition show={profileSaved} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-blue-600 font-medium">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* ── Card 2: Change password ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">

                    {/* Section header */}
                    <div className="flex items-center gap-2.5 mb-6">
                        {/* Key icon */}
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">Change Password</h2>
                    </div>

                    <form onSubmit={submitPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <input
                                ref={currentPasswordRef}
                                type="password"
                                value={pwData.current_password}
                                onChange={(e) => setPwData('current_password', e.target.value)}
                                className={inputCls}
                                autoComplete="current-password"
                            />
                            <InputError message={pwErrors.current_password} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                value={pwData.password}
                                onChange={(e) => setPwData('password', e.target.value)}
                                className={inputCls}
                                autoComplete="new-password"
                            />
                            <InputError message={pwErrors.password} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                value={pwData.password_confirmation}
                                onChange={(e) => setPwData('password_confirmation', e.target.value)}
                                className={inputCls}
                                autoComplete="new-password"
                            />
                            <InputError message={pwErrors.password_confirmation} className="mt-1" />
                        </div>

                        <div className="flex items-center gap-4">
                            <SaveBtn processing={pwProcessing} />
                            <Transition show={pwSaved} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-blue-600 font-medium">Password updated.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
