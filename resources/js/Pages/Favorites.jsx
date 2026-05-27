import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import InfoPanel from '@/Components/InfoPanel';
import FilePreviewModal from '@/Components/FilePreviewModal';

/**
 * Favorites page — two-panel layout (Documents | Links).
 *
 * Each row:
 *   icon | title + subtitle | ⓘ info popover | ⋮ context menu
 *
 * ⓘ  → shows a small info popover (owner, date, type)
 * ⋮  → Remove from Favorites / Move to Bin
 */
export default function Favorites({ documents = [], links = [] }) {
    const [infoFile, setInfoFile]       = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const handleUnfavorite = (id) => {
        router.delete(route('favorites.destroy', id));
    };

    const handleMoveToBin = (id) => {
        router.delete(route('documents.destroy', id), {
            data: { current_path: '' },
        });
    };

    /* ── Open a file — preview for docs, new tab for links, navigate for folders ── */
    const handleOpen = (file, isLink) => {
        const isFolder = file.metadata?.type === 'folder';
        if (isLink || file.metadata?.type === 'link') {
            window.open(file.file_path, '_blank', 'noopener,noreferrer');
        } else if (isFolder) {
            window.location.href = `/documents/${encodeURIComponent(file.title)}`;
        } else {
            setPreviewFile(file);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const isEmpty = documents.length === 0 && links.length === 0;

    /* ── Reusable row renderer ── */
    const FavRow = ({ file, isLink = false }) => {
        const isFolder = file.metadata?.type === 'folder';

        return (
            <li
                className="relative flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer"
                onDoubleClick={() => handleOpen(file, isLink)}
                title={isLink ? 'Double-click to open link' : isFolder ? 'Double-click to open folder' : 'Double-click to preview'}
            >

                {/* Icon — folder / file / link */}
                {isFolder ? (
                    <div className="bg-amber-100 text-amber-500 p-2 rounded-lg shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                ) : isLink ? (
                    <div className="bg-[#eef0fc] text-[#4d73ff] p-2 rounded-lg shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                ) : (
                    <div className="bg-[#eef0fc] text-[#4d73ff] p-2 rounded-lg shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                    </div>
                )}

                {/* Name + subtitle */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                    {isLink ? (
                        <a
                            href={file.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 truncate mt-0.5 hover:text-blue-500 transition-colors block"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {file.file_path}
                        </a>
                    ) : isFolder ? (
                        <p className="text-xs text-gray-400 mt-0.5">Folder</p>
                    ) : (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{file.original_filename}</p>
                    )}
                </div>

                {/* Quick open button — single click ── */}
                {!isFolder && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpen(file, isLink); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all shrink-0"
                        title={isLink ? 'Open link' : 'Preview file'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                )}

                {/* ⓘ info button — opens the same slide-over panel as Documents */}
                <button
                    onClick={() => setInfoFile(file)}
                    className="p-1.5 rounded-full text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors shrink-0"
                    title="Info"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                {/* ⋮ context menu */}
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="p-1.5 rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align="right" width="48">
                            <button
                                onClick={() => handleUnfavorite(file.id)}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Remove from Bookmarks
                            </button>
                            <button
                                onClick={() => handleMoveToBin(file.id)}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Move to Bin
                            </button>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </li>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Bookmarks" />
            {/* Close info popover when clicking outside */}
            <div className="max-w-[1100px] mx-auto space-y-6">
                {/* Page header */}
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                    </svg>
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Bookmarks</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Quick access to documents and links you've bookmarked.</p>
                    </div>
                </div>

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No bookmarks yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Bookmark a file or link to see it here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Documents panel */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-800">Documents</span>
                                <span className="text-sm font-semibold text-gray-400">{documents.length}</span>
                            </div>
                            {documents.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400 text-sm">No documents bookmarked yet.</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {documents.map((file) => (
                                        <FavRow key={file.id} file={file} isLink={false} />
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Links panel */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-800">Links</span>
                                <span className="text-sm font-semibold text-gray-400">{links.length}</span>
                            </div>
                            {links.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400 text-sm">No links bookmarked yet.</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {links.map((file) => (
                                        <FavRow key={file.id} file={file} isLink={true} />
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* Slide-over info panel — same as Documents */}
            <InfoPanel
                file={infoFile}
                onClose={() => setInfoFile(null)}
                locationLabel="Bookmarks"
            />

            {/* File preview overlay */}
            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </AuthenticatedLayout>
    );
}
