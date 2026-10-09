import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'friday', label: 'Friday' },
];

const COLLEGES = [
    ['CAFENR', 'College of Agriculture, Food, Environment, and Natural Resources'],
    ['CAS', 'College of Arts and Sciences'],
    ['CED', 'College of Education'],
    ['CEIT', 'College of Engineering and Information Technology'],
    ['CEMDS', 'College of Economics, Management, and Development Studies'],
    ['CON', 'College of Nursing'],
    ['CVMBS', 'College of Veterinary Medicine and Biomedical Sciences'],
];

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const CardHeading = ({ icon, children }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={icon} />
            </svg>
        </span>
        <h2 className="text-base font-bold text-gray-900">{children}</h2>
    </div>
);

export default function CriticProfileSchedule({ profile }) {
    const { flash } = usePage().props;
    const [editingSchedule, setEditingSchedule] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        college: profile.college ?? '',
        professional_title: profile.professional_title ?? '',
        department: profile.department ?? '',
        office_location: profile.office_location ?? '',
        availability_status: profile.availability_status ?? 'accepting',
        max_queue_limit: profile.max_queue_limit ?? 10,
        office_hours: Object.fromEntries(DAYS.map(({ key }) => [
            key,
            {
                enabled: Boolean(profile.office_hours?.[key]?.enabled),
                start: profile.office_hours?.[key]?.start ?? '',
                end: profile.office_hours?.[key]?.end ?? '',
            },
        ])),
    });

    const saveChanges = (event) => {
        event.preventDefault();
        put(route('critic.profile-schedule.update'), {
            preserveScroll: true,
            onSuccess: () => setEditingSchedule(false),
        });
    };

    const updateOfficeHour = (day, field, value) => {
        setData('office_hours', {
            ...data.office_hours,
            [day]: { ...data.office_hours[day], [field]: value },
        });
    };

    const cancelScheduleEdit = () => {
        setData('office_hours', Object.fromEntries(DAYS.map(({ key }) => [
            key,
            {
                enabled: Boolean(profile.office_hours?.[key]?.enabled),
                start: profile.office_hours?.[key]?.start ?? '',
                end: profile.office_hours?.[key]?.end ?? '',
            },
        ])));
        setEditingSchedule(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profile & Schedule" />

            <div className="mx-auto max-w-[1200px] space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Profile &amp; Schedule</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your professional details and consultation availability.</p>
                </div>

                {flash?.success && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={saveChanges}>
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <CardHeading icon="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.878.513l-4 1a1 1 0 01-1.213-1.213l1-4A2 2 0 017.25 9.25L9 11z">
                                Personal &amp; Office Details
                            </CardHeading>

                            <div className="space-y-4 p-5 sm:p-6">
                                <div>
                                    <label htmlFor="professional_title" className={labelClass}>Professional Title</label>
                                    <input
                                        id="professional_title"
                                        value={data.professional_title}
                                        onChange={(event) => setData('professional_title', event.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Dr. Critic"
                                    />
                                    <InputError message={errors.professional_title} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="college" className={labelClass}>College</label>
                                    <select
                                        id="college"
                                        value={data.college}
                                        onChange={(event) => setData('college', event.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Select your college</option>
                                        {COLLEGES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
                                    </select>
                                    <InputError message={errors.college} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="name" className={labelClass}>Full Name</label>
                                    <input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        className={inputClass}
                                        autoComplete="name"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="department" className={labelClass}>Department / College</label>
                                    <input
                                        id="department"
                                        value={data.department}
                                        onChange={(event) => setData('department', event.target.value)}
                                        className={inputClass}
                                        placeholder="Department or unit"
                                    />
                                    <InputError message={errors.department} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="email" className={labelClass}>Official Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        className={inputClass}
                                        autoComplete="email"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="office_location" className={labelClass}>Office Location / Room</label>
                                    <input
                                        id="office_location"
                                        value={data.office_location}
                                        onChange={(event) => setData('office_location', event.target.value)}
                                        className={inputClass}
                                        placeholder="Building and room"
                                    />
                                    <InputError message={errors.office_location} className="mt-1" />
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? 'Saving…' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <CardHeading icon="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm3 10h3m-3 4h3">
                                Consultation &amp; F2F Schedule
                            </CardHeading>

                            <div className="space-y-5 p-5 sm:p-6">
                                <div>
                                    <label htmlFor="availability_status" className={labelClass}>Master Availability Status</label>
                                    <select
                                        id="availability_status"
                                        value={data.availability_status}
                                        onChange={(event) => setData('availability_status', event.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="accepting">Accepting New Submissions</option>
                                        <option value="unavailable">Temporarily Unavailable</option>
                                    </select>
                                    <InputError message={errors.availability_status} className="mt-1" />
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-gray-800">Office Hours for F2F Meetings</h3>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={(event) => {
                                                if (editingSchedule) {
                                                    saveChanges(event);
                                                } else {
                                                    setEditingSchedule(true);
                                                }
                                            }}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {editingSchedule ? (processing ? 'Saving…' : 'Save Schedule') : 'Edit'}
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full min-w-[420px] text-sm">
                                            <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                                                <tr>
                                                    <th className="px-3 py-2.5 text-left">Day</th>
                                                    <th className="px-3 py-2.5 text-left">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {DAYS.map(({ key, label }) => {
                                                    const hours = data.office_hours[key];
                                                    return (
                                                        <tr key={key}>
                                                            <th scope="row" className="px-3 py-2.5 font-medium text-gray-800">
                                                                {editingSchedule ? (
                                                                    <label className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={hours.enabled}
                                                                            onChange={(event) => updateOfficeHour(key, 'enabled', event.target.checked)}
                                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        {label}
                                                                    </label>
                                                                ) : label}
                                                            </th>
                                                            <td className="px-3 py-2.5">
                                                                {editingSchedule ? (
                                                                    hours.enabled ? (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <input
                                                                                type="time"
                                                                                aria-label={`${label} start time`}
                                                                                value={hours.start}
                                                                                onChange={(event) => updateOfficeHour(key, 'start', event.target.value)}
                                                                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                                            />
                                                                            <span className="text-gray-400">to</span>
                                                                            <input
                                                                                type="time"
                                                                                aria-label={`${label} end time`}
                                                                                value={hours.end}
                                                                                onChange={(event) => updateOfficeHour(key, 'end', event.target.value)}
                                                                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                                            />
                                                                        </div>
                                                                    ) : <span className="text-sm text-gray-400">Unavailable</span>
                                                                ) : hours.enabled ? (
                                                                    <span className="text-sm text-gray-700">
                                                                        {hours.start || '—'} – {hours.end || '—'}
                                                                    </span>
                                                                ) : <span className="text-sm text-gray-400">Not set</span>}
                                                                <InputError message={errors[`office_hours.${key}.start`] || errors[`office_hours.${key}.end`]} className="mt-1" />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <label htmlFor="max_queue_limit" className="text-sm font-medium text-gray-700">
                                        Max Queue Limit (Active Papers)
                                    </label>
                                    <input
                                        id="max_queue_limit"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.max_queue_limit}
                                        onChange={(event) => setData('max_queue_limit', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-24"
                                    />
                                    <InputError message={errors.max_queue_limit} className="sm:basis-full" />
                                </div>

                                {editingSchedule && (
                                    <button
                                        type="button"
                                        onClick={cancelScheduleEdit}
                                        className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
                                    >
                                        Cancel schedule edit
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
