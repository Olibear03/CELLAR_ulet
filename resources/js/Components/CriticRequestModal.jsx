import { useState } from 'react';
import Modal from '@/Components/Modal';

const DOCUMENT_TYPES = [
    { value: 'thesis', label: 'Thesis' },
    { value: 'dissertation', label: 'Dissertation' },
    { value: 'capstone', label: 'Capstone Project Manuscript' },
    { value: 'edp_manuscript', label: 'EDP Manuscript' },
    { value: 'design_project', label: 'Design Project Manuscript' },
    { value: 'student_teaching_portfolio', label: 'Student Teaching Portfolio' },
    { value: 'narrative_report', label: 'Narrative Report' },
    { value: 'other', label: 'Other' },
];

const inputClassName = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
const labelClassName = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function CriticRequestModal({ colleges = [] }) {
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({
        studentName: '',
        email: '',
        college: '',
        critic: '',
        courseDegree: '',
        documentType: '',
        manuscriptTitle: '',
        pageCount: '',
        details: '',
    });

    const closeModal = () => setShow(false);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === 'college' ? { critic: '' } : {}),
        }));
    };

    const selectedCollege = colleges.find((college) => college.code === form.college);

    return (
        <>
            <button
                type="button"
                onClick={() => setShow(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-xl border border-blue-700 bg-blue-600 px-5 py-4 text-left text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 print:hidden"
                aria-haspopup="dialog"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8 7h8m-8 4h8m-8 4h5m-8 6l3-3h10a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v13l1 3z" />
                    </svg>
                </span>
                <span>
                    <span className="block text-sm font-extrabold">Submit Request</span>
                    <span className="mt-0.5 block text-xs text-blue-100">Request manuscript review</span>
                </span>
            </button>

            <Modal show={show} onClose={closeModal} maxWidth="lg">
                <div className="bg-white p-6 sm:p-7">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Submit a Manuscript Review Request</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter the student and manuscript details to prepare a request.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Close request form"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className={labelClassName}>Student name <span className="text-red-500">*</span></span>
                                <input
                                    name="studentName"
                                    value={form.studentName}
                                    onChange={updateField}
                                    autoComplete="name"
                                    required
                                    className={inputClassName}
                                    placeholder="Full name"
                                />
                            </label>
                            <label className="block">
                                <span className={labelClassName}>Student email <span className="text-red-500">*</span></span>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={updateField}
                                    autoComplete="email"
                                    required
                                    className={inputClassName}
                                    placeholder="student@example.com"
                                />
                            </label>
                            <label className="block">
                                <span className={labelClassName}>College <span className="text-red-500">*</span></span>
                                <select
                                    name="college"
                                    value={form.college}
                                    onChange={updateField}
                                    required
                                    className={inputClassName}
                                >
                                    <option value="">Select a college</option>
                                    {colleges.map((college) => (
                                        <option key={college.code} value={college.code}>{college.college}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className={labelClassName}>English critic <span className="text-red-500">*</span></span>
                                <select
                                    name="critic"
                                    value={form.critic}
                                    onChange={updateField}
                                    required
                                    disabled={!selectedCollege}
                                    className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
                                >
                                    <option value="">
                                        {selectedCollege ? 'Select an English critic' : 'Select a college first'}
                                    </option>
                                    {selectedCollege?.list.map((critic) => (
                                        <option key={critic} value={critic}>{critic}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className={labelClassName}>Course / degree <span className="text-red-500">*</span></span>
                                <input
                                    name="courseDegree"
                                    value={form.courseDegree}
                                    onChange={updateField}
                                    required
                                    className={inputClassName}
                                    placeholder="e.g. Bachelor of Science in Biology"
                                />
                            </label>
                            <label className="block">
                                <span className={labelClassName}>Type of manuscript <span className="text-red-500">*</span></span>
                                <select
                                    name="documentType"
                                    value={form.documentType}
                                    onChange={updateField}
                                    required
                                    className={inputClassName}
                                >
                                    <option value="">Select a manuscript type</option>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="block">
                            <span className={labelClassName}>Manuscript title <span className="text-red-500">*</span></span>
                            <input
                                name="manuscriptTitle"
                                value={form.manuscriptTitle}
                                onChange={updateField}
                                required
                                className={inputClassName}
                                placeholder="Enter the full manuscript title"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className={labelClassName}>Number of pages</span>
                                <input
                                    type="number"
                                    name="pageCount"
                                    value={form.pageCount}
                                    onChange={updateField}
                                    min="1"
                                    className={inputClassName}
                                    placeholder="Optional"
                                />
                            </label>
                            <label className="block">
                                <span className={labelClassName}>Additional details</span>
                                <input
                                    name="details"
                                    value={form.details}
                                    onChange={updateField}
                                    className={inputClassName}
                                    placeholder="Optional"
                                />
                            </label>
                        </div>

                        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                            Request submission is not connected yet. Your entries will not be sent or saved.
                        </p>

                        <div className="flex justify-end gap-3 pt-1">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled
                                className="cursor-not-allowed rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white opacity-50"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
