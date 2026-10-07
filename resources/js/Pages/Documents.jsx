import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import UploadModal from '@/Components/UploadModal';
import NewFolderModal from '@/Components/NewFolderModal';
import MoveModal from '@/Components/MoveModal';
import FilePreviewModal from '@/Components/FilePreviewModal';
import InfoPanel from '@/Components/InfoPanel';
import RenameModal from '@/Components/RenameModal';
import ShareLinkModal from '@/Components/ShareLinkModal';
import Breadcrumbs from '@/Components/Breadcrumbs';
import Dropdown from '@/Components/Dropdown';

export default function Documents({ files = [], categories = [], currentFolder = null, breadcrumbs = [], currentPath = '' }) {
    /* -- Modal state -- */
    const [uploadMode, setUploadMode] = useState(null);
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
    const [selectedInfoFile, setSelectedInfoFile] = useState(null);
    const [moveTarget, setMoveTarget] = useState(null);
    const [renameTarget, setRenameTarget] = useState(null); // file being renamed
    const [shareTarget, setShareTarget]   = useState(null); // file being shared

    /* -- Multi-select state -- */
    const [selectedIds, setSelectedIds] = useState(new Set()); // Set of selected file ids

    /* -- Single-click highlight & double-click preview -- */
    const [previewFile, setPreviewFile] = useState(null);
    const clickTimer = useRef(null);

    /* -- View & search state -- */
    const [viewMode, setViewMode] = useState('list');   // 'list' | 'grid'
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({ year: '', rating_period: '', author: '' });
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [groupBy, setGroupBy] = useState('');

    const dropdownRef = useRef(null);
    const defaultCategory = categories.find(c => c.name === 'general_doc')?.id || '';

    /* -- Close dropdown on outside click -- */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsNewDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* -- Client-side filtering -- */
    const filteredFiles = files.filter((file) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            file.title?.toLowerCase().includes(q) ||
            file.user?.name?.toLowerCase().includes(q) ||
            file.metadata?.keywords?.toLowerCase().includes(q);

        const matchesYear = !advancedFilters.year || file.metadata?.year === advancedFilters.year;
        const matchesPeriod = !advancedFilters.rating_period || file.metadata?.rating_period === advancedFilters.rating_period;
        const matchesAuthor = !advancedFilters.author || file.user?.name?.toLowerCase().includes(advancedFilters.author.toLowerCase());

        return matchesSearch && matchesYear && matchesPeriod && matchesAuthor;
    });

    const getSortValue = (file, field) => {
        switch (field) {
            case 'type':
                if (file.metadata?.type === 'folder') return 'Folder';
                return file.original_filename?.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || 'File';
            case 'size':
                return file.file_size;
            case 'date_created':
                return file.created_at ? new Date(file.created_at).getTime() : null;
            case 'date_modified':
                return file.updated_at ? new Date(file.updated_at).getTime() : null;
            case 'authors':
                return file.user?.name;
            case 'categories':
                return file.category?.name;
            case 'tags':
                return file.metadata?.keywords;
            case 'name':
            case 'title':
            default:
                return file.title;
        }
    };

    const sortedFiles = [...filteredFiles].sort((left, right) => {
        const leftValue = getSortValue(left, sortBy);
        const rightValue = getSortValue(right, sortBy);
        const leftMissing = leftValue === null || leftValue === undefined || leftValue === '';
        const rightMissing = rightValue === null || rightValue === undefined || rightValue === '';

        if (leftMissing || rightMissing) {
            return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1;
        }

        const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' });

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const groupedFiles = groupBy
        ? sortedFiles.reduce((groups, file) => {
            let label;
            switch (groupBy) {
                case 'type':
                    label = getSortValue(file, 'type');
                    break;
                case 'authors':
                    label = file.user?.name || 'Unknown author';
                    break;
                case 'categories':
                    label = file.category?.name || 'Uncategorized';
                    break;
                case 'tags':
                    label = file.metadata?.keywords || 'No tags';
                    break;
                default:
                    label = '';
            }
            const group = groups.find((item) => item.label === label);
            if (group) {
                group.files.push(file);
            } else {
                groups.push({ label, files: [file] });
            }
            return groups;
        }, [])
        : [{ label: '', files: sortedFiles }];

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    /* -- Create folder handler -- */
    const handleCreateFolder = (name) => {
        router.post(route('folders.store'), {
            name,
            category_id: defaultCategory,
            folder_id:    currentFolder?.id || null,
            current_path: currentPath,
        }, {
            onSuccess: () => setIsNewFolderOpen(false),
        });
    };

    /* -- Row click handler --
       Single click  ? toggle selection (multi-select)
       Double click  ? open folder or preview file
    -- */
    const handleRowClick = (file, e) => {
        // If Ctrl/Cmd or Shift held, always toggle selection
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            toggleSelect(file.id);
            return;
        }

        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            handleRowDoubleClick(file);
        } else {
            clickTimer.current = setTimeout(() => {
                clickTimer.current = null;
                // Plain single click — toggle this item's selection
                toggleSelect(file.id);
            }, 280);
        }
    };

    const handleRowDoubleClick = (file) => {
        setSelectedIds(new Set()); // clear selection on navigate/open
        if (file.metadata?.type === 'folder') {
            const newPath = currentPath ? `${currentPath}/${file.title}` : file.title;
            router.get(`/documents/${newPath}`);
        } else {
            setPreviewFile(file);
        }
    };

    /* -- Toggle a single item in the selection set -- */
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    /* -- Bulk actions -- */
    const handleBulkDelete = () => {
        if (!confirm(`Move ${selectedIds.size} item(s) to bin?`)) return;
        router.post(route('documents.bulk-delete'), {
            ids: [...selectedIds],
            current_path: currentPath,
        }, { onSuccess: () => setSelectedIds(new Set()) });
    };

    const handleBulkFavorite = () => {
        router.post(route('documents.bulk-favorite'), {
            ids: [...selectedIds],
        }, { onSuccess: () => setSelectedIds(new Set()) });
    };

    const handleBulkMove = () => {
        // Open move modal with a synthetic "multi" target
        setMoveTarget({ id: '__bulk__', title: `${selectedIds.size} items`, _bulkIds: [...selectedIds] });
    };

    const handleDelete = (id) => {
        if (confirm('Move this item to the bin?')) {
            router.delete(route('documents.destroy', id), {
                data: { current_path: currentPath },
            });
        }
    };

    const handleRename = (newName) => {
        if (!renameTarget) return;
        router.patch(route('documents.rename', renameTarget.id), {
            title:        newName,
            current_path: currentPath,
        });
    };

    /* -- Cleanup double-click timer on unmount -- */
    useEffect(() => {
        return () => { if (clickTimer.current) clearTimeout(clickTimer.current); };
    }, []);

    const handleFavorite = (id) => {
        router.post(route('favorites.store', id));
    };

    /* -- Move handler — supports single and bulk -- */
    const handleMove = (destinationFolderId) => {
        if (moveTarget?._bulkIds) {
            // Bulk move — patch each item
            const promises = moveTarget._bulkIds.map(id =>
                router.patch(route('documents.move', id), {
                    destination_folder_id: destinationFolderId,
                    current_path: currentPath,
                })
            );
            setSelectedIds(new Set());
        } else {
            router.patch(route('documents.move', moveTarget.id), {
                destination_folder_id: destinationFolderId,
                current_path:          currentPath,
            });
        }
        setMoveTarget(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Documents" />
            <div className="max-w-[1100px] mx-auto space-y-4">

                {/* 1. Breadcrumbs removed from top */}

                {/* 2. Page header — title left, "+ New" right */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Documents</h1>
                        <p className="text-gray-500 text-sm mt-1">All shared institutional documents.</p>
                    </div>

                    {/* "+ New" dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-3 py-2.5 rounded-full font-semibold transition-colors shadow-sm text-sm"
                            aria-haspopup="true"
                            aria-expanded={isNewDropdownOpen}
                        >
                            {/* Plus icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            New
                        </button>

                        {isNewDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1.5">
                                {/* Create New Folder */}
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    onClick={() => { setIsNewDropdownOpen(false); setIsNewFolderOpen(true); }}
                                >
                                    {/* Folder-plus icon */}
                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="font-medium">Create New Folder</span>
                                </button>
                                <div className="h-px bg-gray-100 mx-2" />
                                {/* Upload Folder */}
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    onClick={() => { setIsNewDropdownOpen(false); setUploadMode('folder'); }}
                                >
                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m-3-3h6" />
                                    </svg>
                                    <span className="font-medium">Upload Folder</span>
                                </button>
                                {/* Upload File */}
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    onClick={() => { setIsNewDropdownOpen(false); setUploadMode('file'); }}
                                >
                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium">Upload Document</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. View toggles (Root row removed) */}
                <div className="flex justify-end items-center">
                    {/* List / Grid view toggles */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white">
                        {/* List view */}
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List view"
                            aria-label="List view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        {/* Grid view */}
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid view"
                            aria-label="Grid view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 4. Search bar + Advanced */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        {/* Search input */}
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
                            {/* Clear button */}
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

                        {/* Advanced toggle */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showAdvanced
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
                                }`}
                        >
                            {/* Sliders / filter icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Advanced
                        </button>
                    </div>

                    {/* Advanced filter panel */}
                    {showAdvanced && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Sort by</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Name</option>
                                    <option value="date_modified">Date modified</option>
                                    <option value="type">Type</option>
                                    <option value="size">Size</option>
                                    <option value="date_created">Date created</option>
                                    <option value="authors">Authors</option>
                                    <option value="categories">Categories</option>
                                    <option value="tags">Tags</option>
                                    <option value="title">Title</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Order</label>
                                <select
                                    value={sortDirection}
                                    onChange={(e) => setSortDirection(e.target.value)}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Group by</label>
                                <select
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">No grouping</option>
                                    <option value="type">Type</option>
                                    <option value="authors">Authors</option>
                                    <option value="categories">Categories</option>
                                    <option value="tags">Tags</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Year</label>
                                <select
                                    value={advancedFilters.year}
                                    onChange={(e) => setAdvancedFilters(f => ({ ...f, year: e.target.value }))}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All years</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Rating Period</label>
                                <select
                                    value={advancedFilters.rating_period}
                                    onChange={(e) => setAdvancedFilters(f => ({ ...f, rating_period: e.target.value }))}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All periods</option>
                                    <option value="Jan-Jun">Jan-Jun</option>
                                    <option value="Jul-Dec">Jul-Dec</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Author</label>
                                <input
                                    type="text"
                                    value={advancedFilters.author}
                                    onChange={(e) => setAdvancedFilters(f => ({ ...f, author: e.target.value }))}
                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Filter by author"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Breadcrumbs — full path reflected in URL */}
                <div className="pt-2">
                    <Breadcrumbs items={[
                        // Root always links to /documents
                        { label: 'Documents', href: '/documents' },
                        // Each ancestor uses its path segment
                        ...breadcrumbs.map((crumb) => ({
                            label: crumb.title,
                            href:  crumb.path ? `/documents/${crumb.path}` : undefined,
                        }))
                    ]} />
                </div>

                {/* 5. Selection toolbar — shown when items are selected */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-2.5 shadow-sm">
                        {/* Close / deselect all */}
                        <button onClick={() => setSelectedIds(new Set())} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Clear selection">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <span className="text-sm font-semibold text-gray-700">{selectedIds.size} selected</span>
                        <div className="h-4 w-px bg-gray-200 mx-1" />

                        {/* Add to Bookmarks */}
                        <button onClick={handleBulkFavorite} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Add to Bookmarks">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>

                        {/* Move to */}
                        <button onClick={handleBulkMove} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Move to">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </button>

                        {/* Move to bin */}
                        <button onClick={handleBulkDelete} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Move to Bin">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <div className="ml-auto text-xs text-gray-400">Ctrl+click to multi-select</div>
                    </div>
                )}

                {/* File table (list view) */}
                {viewMode === 'list' ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredFiles.length > 0 ? (
                                    groupedFiles.flatMap(({ label, files: groupItems }) => [
                                        ...(label ? [(
                                            <tr key={`group-${label}`} className="bg-gray-50">
                                                <td colSpan="5" className="px-6 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    {label}
                                                </td>
                                            </tr>
                                        )] : []),
                                        ...groupItems.map((file) => {
                                        const isSelected = selectedIds.has(file.id);
                                        return (
                                        <tr
                                            key={file.id}
                                            onClick={(e) => handleRowClick(file, e)}
                                            className={`transition-colors group cursor-pointer select-none ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50/60'}`}
                                        >
                                            {/* Name */}
                                            <td className="px-6 py-4 w-[38%]">
                                                <div className="flex items-center gap-3">
                                                    {/* File or Folder icon */}
                                                    {file.metadata?.type === 'folder' ? (
                                                        <div className="bg-blue-100 text-blue-500 p-2 rounded-lg shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[#eef0fc] text-[#4d73ff] p-2 rounded-lg shrink-0">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="text-[14px] font-semibold text-gray-900 truncate">{file.title}</div>
                                                        {file.metadata?.type !== 'folder' && (
                                                            <div className="text-[12px] text-gray-400 mt-0.5 truncate">{file.original_filename}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tags */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {file.metadata?.year && (
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md">{file.metadata.year}</span>
                                                    )}
                                                    {file.metadata?.rating_period && (
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md">{file.metadata.rating_period}</span>
                                                    )}
                                                    {file.metadata?.keywords && (
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md">{file.metadata.keywords}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Owner */}
                                            <td className="px-6 py-4 text-[13px] text-gray-700 font-medium">
                                                {file.user?.name ?? 'Unknown'}
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-[13px] text-gray-500">
                                                {formatDate(file.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Download */}
                                                    <a
                                                        href={`/storage/${file.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                        title="Download"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </a>
                                                    {/* Share Link */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShareTarget(file); }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Share Link"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                    </button>
                                                    {/* More */}
                                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                        <Dropdown>
                                                            <Dropdown.Trigger>
                                                                <button
                                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                                    title="More options"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                                    </svg>
                                                                </button>
                                                            </Dropdown.Trigger>
                                                            <Dropdown.Content align="right" width="48">
                                                                {/* Rename */}
                                                                <button onClick={() => { setRenameTarget(file); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                    Rename
                                                                </button>
                                                                {/* Add to Bookmarks */}
                                                                <button onClick={() => handleFavorite(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                                    Add to Bookmarks
                                                                </button>
                                                                {/* Move to */}
                                                                <button onClick={(e) => { e.stopPropagation(); setMoveTarget(file); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                                    Move to
                                                                </button>
                                                                {/* Share Link */}
                                                                <button onClick={() => setShareTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                                    Share Link
                                                                </button>
                                                                {/* Info — opens the slide-over details panel */}
                                                                <button onClick={() => setSelectedInfoFile(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    Info
                                                                </button>
                                                                <div className="h-px bg-gray-100 my-1" />
                                                                {/* Move to Bin */}
                                                                <button onClick={() => handleDelete(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    Move to Bin
                                                                </button>
                                                            </Dropdown.Content>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ); })
                                    ])
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                            <p className="text-gray-500 text-sm font-medium">
                                                {searchQuery ? 'No documents match your search.' : 'No documents yet.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* -- Grid view — matches reference design -- */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredFiles.length > 0 ? (
                            groupedFiles.flatMap(({ label, files: groupItems }) => [
                            ...(label ? [(
                                <div key={`group-${label}`} className="col-span-full rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                                    {label}
                                </div>
                            )] : []),
                            ...groupItems.map((file) => {
                                const isFolder   = file.metadata?.type === 'folder';
                                const isSelected = selectedIds.has(file.id);

                                return (
                                    <div
                                        key={file.id}
                                        onClick={(e) => handleRowClick(file, e)}
                                        className={`relative rounded-2xl border flex flex-col transition-all cursor-pointer select-none group ${
                                            isSelected
                                                ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                                        }`}
                                    >
                                        {/* -- Top area: icon + ? menu (files only) -- */}
                                        <div className="relative flex items-start justify-between p-4 pb-2">
                                            {/* Icon */}
                                            <div className={`p-3 rounded-xl ${isFolder ? 'bg-blue-100' : 'bg-[#eef0fc]'}`}>
                                                {isFolder ? (
                                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6 text-[#4d73ff]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* ? context menu — shown on hover for both files and folders */}
                                            <div
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        <button onClick={() => setRenameTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            Rename
                                                        </button>
                                                        <button onClick={() => handleFavorite(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                            Add to Bookmarks
                                                        </button>
                                                        <button onClick={() => setMoveTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                            Move to
                                                        </button>
                                                        <button onClick={() => setShareTarget(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                            Share Link
                                                        </button>
                                                        {/* Info — opens the slide-over details panel */}
                                                        <button onClick={() => setSelectedInfoFile(file)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            Info
                                                        </button>
                                                        <div className="h-px bg-gray-100 my-1" />
                                                        <button onClick={() => handleDelete(file.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Move to Bin
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </div>

                                        {/* -- Middle: name + subtitle -- */}
                                        <div className="px-4 pb-3 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                                            {isFolder ? (
                                                <p className="text-xs text-gray-400 mt-0.5">Folder</p>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{file.original_filename}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(file.created_at)}</p>
                                                </>
                                            )}
                                            {isFolder && (
                                                <p className="text-xs text-gray-400 mt-0.5">{formatDate(file.created_at)}</p>
                                            )}
                                        </div>

                                        {/* -- Bottom action bar — files only -- */}
                                        {!isFolder && (
                                            <div
                                                className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Download + Open */}
                                                <button
                                                    onClick={() => setPreviewFile(file)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Open
                                                </button>

                                                {/* Share Link button */}
                                                <button
                                                    onClick={() => setShareTarget(file)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Share Link"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                            ])
                        ) : (
                            <div className="col-span-full py-20 text-center text-gray-500 text-sm">
                                {searchQuery ? 'No documents match your search.' : 'No documents yet.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <UploadModal
                show={uploadMode !== null}
                uploadMode={uploadMode}
                onClose={() => setUploadMode(null)}
                categories={categories}
                defaultCategory={defaultCategory}
                folderId={currentFolder?.id || null}
                currentPath={currentPath}
            />
            <NewFolderModal
                show={isNewFolderOpen}
                onClose={() => setIsNewFolderOpen(false)}
                onCreate={handleCreateFolder}
            />

            {/* Rename modal */}
            <RenameModal
                show={renameTarget !== null}
                onClose={() => setRenameTarget(null)}
                onRename={handleRename}
                file={renameTarget}
            />

            {/* Move modal — Google Drive-style folder picker */}
            <MoveModal
                show={moveTarget !== null}
                onClose={() => setMoveTarget(null)}
                onMove={handleMove}
                file={moveTarget}
                currentPath={currentPath}
            />

            {/* File preview overlay — opens on double-click, no page navigation */}
            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />

            {/* Slide-over info panel */}
            <InfoPanel
                file={selectedInfoFile}
                onClose={() => setSelectedInfoFile(null)}
                locationLabel={currentFolder ? currentFolder.title : 'Root'}
            />

            {/* Share Link modal */}
            <ShareLinkModal
                show={shareTarget !== null}
                onClose={() => setShareTarget(null)}
                file={shareTarget}
            />
        </AuthenticatedLayout>
    );
}
