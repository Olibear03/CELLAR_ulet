import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

/**
 * InfoPanel — reusable slide-over info panel.
 *
 * ── What makes the entrance (and exit) smooth ──────────────────────────────
 * We use Headless UI's <Transition> component instead of toggling CSS classes
 * manually. It keeps the panel in the DOM during both enter and leave phases,
 * which is essential — if we returned null when closed, React would unmount
 * the element immediately and the exit animation would never play.
 *
 * Two nested Transition.Child elements run in parallel:
 *   1. Backdrop  — fades in/out with opacity (duration-300)
 *   2. Panel     — slides in from the right with translateX (duration-300)
 *      enterFrom: translate-x-full  (fully off-screen to the right)
 *      enterTo:   translate-x-0     (fully visible)
 *      leaveFrom: translate-x-0
 *      leaveTo:   translate-x-full  (slides back off-screen)
 *
 * The `ease-in-out` timing function gives it the natural deceleration feel.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Props:
 *   file          — the file/folder/link object, or null to hide
 *   onClose       — () => void
 *   locationLabel — string shown in the "Location" row
 */
export default function InfoPanel({ file, onClose, locationLabel = 'Root' }) {
    const show = !!file;

    const isFolder = file?.metadata?.type === 'folder';
    const isLink   = file?.metadata?.type === 'link';
    const typeLabel = isFolder ? 'Folder' : isLink ? 'Link' : 'Document';

    return (
        /*
         * Transition wraps the whole overlay. `show` drives enter/leave.
         * `as={Fragment}` avoids adding an extra DOM wrapper element.
         */
        <Transition show={show} as={Fragment}>
            <div className="fixed inset-0 z-50 flex justify-end">

                {/* ── Backdrop — fades in/out ── */}
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                </Transition.Child>

                {/* ── Sliding panel — enters from the right ── */}
                <Transition.Child
                    as={Fragment}
                    enter="transition transform ease-in-out duration-300"
                    enterFrom="translate-x-full"   /* starts fully off-screen right */
                    enterTo="translate-x-0"         /* slides to its natural position */
                    leave="transition transform ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"      /* slides back off-screen right */
                >
                    <div className="relative w-80 bg-white shadow-2xl border-l border-gray-200 h-full overflow-y-auto">

                        {/* Header */}
                        <div className="p-5 flex justify-between items-start border-b border-gray-100">
                            <div className="flex items-center gap-2 min-w-0">
                                {/* Icon — changes based on file type */}
                                {isFolder ? (
                                    <div className="bg-blue-100 text-blue-500 p-1.5 rounded-md shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                ) : isLink ? (
                                    <div className="bg-[#eef0fc] text-[#4d73ff] p-1.5 rounded-md shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="bg-[#eef0fc] text-[#4d73ff] p-1.5 rounded-md shrink-0">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                    </div>
                                )}
                                <h3 className="font-semibold text-gray-900 truncate" title={file?.title}>
                                    {file?.title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 shrink-0 ml-2"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-6">

                            {/* Details section */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Details</h4>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="block text-gray-400 mb-1">Type</span>
                                        <span className="font-medium text-gray-900">{typeLabel}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-1">Owner</span>
                                        <span className="font-medium text-gray-900">{file?.user?.name || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-1">Location</span>
                                        <span className="font-medium text-gray-900">{locationLabel}</span>
                                    </div>
                                    {isLink && file?.file_path && (
                                        <div>
                                            <span className="block text-gray-400 mb-1">URL</span>
                                            <a
                                                href={file.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:underline break-all text-xs"
                                            >
                                                {file.file_path}
                                            </a>
                                        </div>
                                    )}
                                    {!isFolder && !isLink && file?.original_filename && (
                                        <div>
                                            <span className="block text-gray-400 mb-1">Filename</span>
                                            <span className="font-medium text-gray-900 break-all text-xs">{file.original_filename}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="block text-gray-400 mb-1">Created</span>
                                        <span className="font-medium text-gray-900">
                                            {file?.created_at ? new Date(file.created_at).toLocaleString() : '—'}
                                        </span>
                                    </div>
                                    {file?.metadata?.year && (
                                        <div>
                                            <span className="block text-gray-400 mb-1">Year</span>
                                            <span className="font-medium text-gray-900">{file.metadata.year}</span>
                                        </div>
                                    )}
                                    {file?.metadata?.rating_period && (
                                        <div>
                                            <span className="block text-gray-400 mb-1">Rating Period</span>
                                            <span className="font-medium text-gray-900">{file.metadata.rating_period}</span>
                                        </div>
                                    )}
                                    {file?.metadata?.keywords && (
                                        <div>
                                            <span className="block text-gray-400 mb-1">Keywords</span>
                                            <span className="font-medium text-gray-900">{file.metadata.keywords}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity timeline */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Activity</h4>
                                <div className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                                    <div className="pl-4 relative">
                                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1" />
                                        <p className="text-sm font-medium text-gray-900">
                                            {isLink ? 'Added' : isFolder ? 'Created' : 'Uploaded'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {file?.created_at ? new Date(file.created_at).toLocaleString() : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </Transition.Child>

            </div>
        </Transition>
    );
}
