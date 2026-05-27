import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Breadcrumbs from '@/Components/Breadcrumbs';

/**
 * Bin (Archive Bin) page — shows soft-deleted files.
 * Users can restore items back to their original location
 * or permanently delete them.
 */
export default function Bin({ files = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null); // file id pending permanent delete

    /* ── Client-side search ── */
    const filtered = files.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
            !q ||
            f.title?.toLowerCase().includes(q) ||
            f.user?.name?.toLowerCase().includes(q)
        );
    });

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    /* ── Actions ── */
    const handleRestore = (id) => {
        router.post(route('bin.restore', id), {}, { preserveScroll: true });
    };

    const handleForceDelete = (id) => {
        router.delete(route('bin.forceDelete', id), { preserveScroll: true });
        setConfirmDelete(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Archive Bin" />
            <div className="max-w-[1100px] mx-auto space-y-4">

               

                {/* Page header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none"> Bin</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {files.length > 0
                                ? `${files.length} deleted item${files.length !== 1 ? 's' : ''} — restore or permanently remove them.`
                                : 'Items you delete will appear here.'}
                        </p>
                    </div>

                    {/* Empty bin button — only shown when there are items */}
                    {files.length > 0 && (
                        <button
                            onClick={() => setConfirmDelete('all')}
                            className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            {/* Trash icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Empty Bin
                        </button>
                    )}
                </div>

                {/* Search bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                        placeholder="Search deleted items..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* File table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deleted</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? (
                                filtered.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50/60 transition-colors group">
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Greyed-out file icon to indicate deleted state */}
                                                <div className="bg-gray-100 text-gray-400 p-2 rounded-lg shrink-0">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[14px] font-semibold text-gray-500 truncate line-through decoration-gray-300">
                                                        {file.title}
                                                    </div>
                                                    <div className="text-[12px] text-gray-400 mt-0.5 truncate">{file.original_filename}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Owner */}
                                        <td className="px-6 py-4 text-[13px] text-gray-500">
                                            {file.user?.name ?? 'Unknown'}
                                        </td>

                                        {/* Deleted at */}
                                        <td className="px-6 py-4 text-[13px] text-gray-400">
                                            {file.deleted_at ? formatDate(file.deleted_at) : '—'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Restore */}
                                                <button
                                                    onClick={() => handleRestore(file.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                    title="Restore"
                                                >
                                                    {/* Restore / undo icon */}
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                    </svg>
                                                    Restore
                                                </button>

                                                {/* Permanently delete */}
                                                <button
                                                    onClick={() => setConfirmDelete(file.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                    title="Delete permanently"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        {/* Trash empty state */}
                                        <svg className="w-14 h-14 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <p className="text-gray-500 text-sm font-medium">
                                            {searchQuery ? 'No deleted items match your search.' : 'The bin is empty.'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Permanent delete confirmation dialog ── */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setConfirmDelete(null)}
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-red-100 p-2 rounded-xl">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-900">
                                {confirmDelete === 'all' ? 'Empty the bin?' : 'Delete permanently?'}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">
                            {confirmDelete === 'all'
                                ? 'All items in the bin will be permanently deleted. This cannot be undone.'
                                : 'This file will be permanently deleted and cannot be recovered.'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDelete === 'all') {
                                        // Force-delete all trashed items one by one
                                        files.forEach((f) => handleForceDelete(f.id));
                                    } else {
                                        handleForceDelete(confirmDelete);
                                    }
                                }}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                {confirmDelete === 'all' ? 'Empty Bin' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
