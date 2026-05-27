import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AddLinkModal from '@/Components/AddLinkModal';
import EditLinkModal from '@/Components/EditLinkModal';
import Dropdown from '@/Components/Dropdown';
import InfoPanel from '@/Components/InfoPanel';

/**
 * Links page â€” external resources and shortcuts.
 * Each row has a working â“˜ info popover and â‹® context menu
 * with Add to Bookmarks and Move to Bin actions.
 */
export default function Links({ files = [], categories = [] }) {
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [editTarget, setEditTarget]       = useState(null); // link being edited
    const [infoFile, setInfoFile]           = useState(null);
    const [viewMode, setViewMode]           = useState('list');
    const [searchQuery, setSearchQuery]     = useState('');
    const [showAdvanced, setShowAdvanced]   = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({ keywords: '', author: '' });

    const defaultCategory = categories.find(c => c.name === 'Links')?.id || '';

    /* â”€â”€ Actions â”€â”€ */
    const handleFavorite = (id) => {
        // No preserveScroll â€” Inertia must reload so Bookmarks page gets fresh data
        router.post(route('favorites.store', id));
    };

    const handleMoveToBin = (id) => {
        if (confirm('Move this link to the bin?')) {
            router.delete(route('documents.destroy', id), {
                data: { current_path: '' },
            });
        }
    };

    /* â”€â”€ Filtering â”€â”€ */
    const filteredFiles = files.filter((file) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            file.title?.toLowerCase().includes(q) ||
            file.user?.name?.toLowerCase().includes(q) ||
            file.metadata?.keywords?.toLowerCase().includes(q) ||
            file.original_filename?.toLowerCase().includes(q);

        const matchesKeywords = !advancedFilters.keywords ||
            file.metadata?.keywords?.toLowerCase().includes(advancedFilters.keywords.toLowerCase());
        const matchesAuthor = !advancedFilters.author ||
            file.user?.name?.toLowerCase().includes(advancedFilters.author.toLowerCase());

        return matchesSearch && matchesKeywords && matchesAuthor;
    });

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            <Head title="Links" />
            {/* Clicking outside closes any open info popover */}
            <div className="max-w-[1100px] mx-auto space-y-4">

                {/* Page header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Links</h1>
                        <p className="text-gray-500 text-sm mt-1">External resources, journals, and partner portals.</p>
                    </div>
                    <button
                        onClick={() => setIsAddLinkOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-2.5 rounded-full font-semibold transition-colors shadow-sm text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Link
                    </button>
                </div>

                {/* View toggles */}
                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search + Advanced */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
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
                                placeholder="Search by title, author, keyword..."
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showAdvanced ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Advanced
                        </button>
                    </div>
                    {showAdvanced && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Keywords</label>
                                <input type="text" value={advancedFilters.keywords} onChange={(e) => setAdvancedFilters(f => ({ ...f, keywords: e.target.value }))} className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Filter by keyword" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Author</label>
                                <input type="text" value={advancedFilters.author} onChange={(e) => setAdvancedFilters(f => ({ ...f, author: e.target.value }))} className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Filter by author" />
                            </div>
                        </div>
                    )}
                </div>

                {/* List view */}
                {viewMode === 'list' ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                        <div className="divide-y divide-gray-100">
                            {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                                <div key={file.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group">

                                    {/* Link icon */}
                                    <div className="bg-[#eef0fc] text-[#4d73ff] p-2.5 rounded-xl shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>

                                    {/* Title + URL */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900 truncate">{file.title}</span>
                                            {/* Open in new tab */}
                                            <a
                                                href={file.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-300 hover:text-blue-500 transition-colors shrink-0"
                                                title="Open link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{file.file_path}</p>
                                    </div>

                                    {/* â“˜ info button â€” opens slide-over panel */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setInfoFile(file); }}
                                        className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                        title="Info"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>

                                    {/* â‹® context menu */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                    </svg>
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                <button onClick={() => setEditTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleFavorite(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                    Add to Bookmarks
                                                </button>
                                                <div className="h-px bg-gray-100 my-1" />
                                                <button onClick={() => handleMoveToBin(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Move to Bin
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <p className="text-gray-500 text-sm font-medium">{searchQuery ? 'No links match your search.' : 'No links saved yet.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Grid view */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                            <div key={file.id} className="relative bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow group flex flex-col">
                                {/* â‹® menu top-right */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="48">
                                            <button onClick={() => setEditTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Edit
                                            </button>
                                            <button onClick={() => handleFavorite(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                Add to Bookmarks
                                            </button>
                                            <div className="h-px bg-gray-100 my-1" />
                                            <button onClick={() => handleMoveToBin(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Move to Bin
                                            </button>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="bg-[#eef0fc] text-[#4d73ff] p-3 rounded-xl w-fit mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{file.file_path}</p>
                                <p className="text-xs text-gray-500 mt-2">{formatDate(file.created_at)}</p>

                                {/* Bottom bar */}
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                    <a href={file.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open
                                    </a>
                                    <button onClick={() => setInfoFile(file)} className="p-1 rounded-full text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Info">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-gray-500 text-sm">
                                {searchQuery ? 'No links match your search.' : 'No links saved yet.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddLinkModal
                show={isAddLinkOpen}
                onClose={() => setIsAddLinkOpen(false)}
                categories={categories}
                defaultCategory={defaultCategory}
            />

            {/* Edit link modal */}
            <EditLinkModal
                show={editTarget !== null}
                onClose={() => setEditTarget(null)}
                link={editTarget}
            />

            {/* Slide-over info panel â€” same as Documents */}
            <InfoPanel
                file={infoFile}
                onClose={() => setInfoFile(null)}
                locationLabel="Links"
            />
        </AuthenticatedLayout>
    );
}

