import { useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import Modal from '@/Components/Modal';

/**
 * UploadModal — compact document upload dialog.
 *
 * folderId is intentionally NOT stored in useForm state — it's read directly
 * from the prop at submit time so it always reflects the current folder,
 * regardless of when the modal was first mounted.
 */
export default function UploadModal({ show, onClose, categories = [], defaultCategory = '', folderId = null, uploadMode = 'file', currentPath = '' }) {
    const isFolderUpload = uploadMode === 'folder';

    const { data, setData, processing, progress, reset } = useForm({
        file: null,
        title: '',
        author: '',
        year: new Date().getFullYear().toString(),
        rating_period: 'Jan-Jun',
        keywords: '',
        confidential: false,
        category_id: defaultCategory,
    });

    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Reset form fields when the modal opens fresh
    useEffect(() => {
        if (show) {
            reset();
        }
    }, [show]);

    /* ── Drag handlers ── */
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) {
            const files = isFolderUpload ? e.dataTransfer.files : e.dataTransfer.files[0];
            setData(prev => {
                const newData = { ...prev, file: files };
                if (isFolderUpload && files[0]?.webkitRelativePath) {
                    newData.title = files[0].webkitRelativePath.split('/')[0];
                } else if (!isFolderUpload && files.name) {
                    newData.title = files.name.split('.').slice(0, -1).join('.');
                }
                return newData;
            });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) {
            const files = isFolderUpload ? e.target.files : e.target.files[0];
            setData(prev => {
                const newData = { ...prev, file: files };
                if (isFolderUpload && files[0]?.webkitRelativePath) {
                    newData.title = files[0].webkitRelativePath.split('/')[0];
                } else if (!isFolderUpload && files.name) {
                    newData.title = files.name.split('.').slice(0, -1).join('.');
                }
                return newData;
            });
        }
    };

    /* ── Submit — folder_id is read from the prop directly, not from form state,
       so it always reflects the folder the user is currently viewing ── */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Build relative paths for folder uploads
        const relativePaths = [];
        if (isFolderUpload && data.file && data.file.length > 0) {
            for (let i = 0; i < data.file.length; i++) {
                relativePaths.push(data.file[i].webkitRelativePath || '');
            }
        }

        // Construct the full payload, injecting the live folderId prop.
        // We use router.post with a plain object so folder_id is always
        // the current prop value — never a stale copy from form state.
        const payload = {
            title: isFolderUpload
                ? (data.file?.[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded Folder')
                : data.title,
            author: data.author,
            category_id: data.category_id,
            upload_mode: uploadMode,
            // Always use the current prop value — guaranteed to be current folder
            folder_id: folderId ?? null,
            current_path: currentPath,  // so the server redirects back to the right path
            relative_paths: relativePaths,
            metadata: {
                year: data.year,
                rating_period: data.rating_period,
                keywords: data.keywords,
                confidential: data.confidential,
            },
        };

        // Attach file(s) — must use FormData for binary uploads
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'metadata') {
                Object.entries(value).forEach(([mk, mv]) => {
                    formData.append(`metadata[${mk}]`, mv ?? '');
                });
            } else if (key === 'relative_paths') {
                value.forEach((p) => formData.append('relative_paths[]', p));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (isFolderUpload && data.file?.length) {
            for (let i = 0; i < data.file.length; i++) {
                formData.append('file[]', data.file[i]);
            }
        } else if (data.file) {
            formData.append('file', data.file);
        }

        router.post(route('upload.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
                // Explicitly reload the current folder so the new file appears
                // router.post's back() can lose the ?folder_id query param
                router.reload();
            },
        });
    };

    const hasFiles = isFolderUpload ? data.file?.length > 0 : Boolean(data.file);
    const hasTitle = isFolderUpload || Boolean(data.title?.trim());
    const canSubmit = hasFiles && hasTitle && data.year && data.rating_period && !processing;

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="bg-white rounded-2xl p-7">

                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isFolderUpload ? 'Upload Folder' : 'Upload Document'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {isFolderUpload ? 'Select a folder to upload its contents.' : 'Attach the file and tag it with metadata.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        aria-label="Close"
                    >
                        {/* X icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── Drag & Drop Zone ── */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {/* Cloud upload icon */}
                        <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>

                        {data.file ? (
                            <>
                                <p className="text-sm font-semibold text-gray-700 truncate max-w-xs">{data.file.name || (data.file.length ? `${data.file.length} files selected` : '')}</p>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setData('file', null); }}
                                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-3">{isFolderUpload ? 'Click to choose a folder' : 'Drop a file here or'}</p>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                                >
                                    {isFolderUpload ? 'Choose Folder' : 'Choose file'}
                                </button>
                            </>
                        )}

                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange} 
                            {...(isFolderUpload ? { webkitdirectory: "", directory: "" } : {})} 
                        />

                        {/* Upload progress bar */}
                        {progress && (
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mt-4">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Title / Author ── */}
                    <div className="grid grid-cols-2 gap-4">
                        {!isFolderUpload && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                                    placeholder="Document title"
                                />
                            </div>
                        )}
                        <div className={isFolderUpload ? 'col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Author <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder="Author name"
                            />
                        </div>
                    </div>

                    {/* ── Year / Rating Period ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating Period</label>
                            <select
                                value={data.rating_period}
                                onChange={(e) => setData('rating_period', e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="Jan-Jun">Jan-Jun</option>
                                <option value="Jul-Dec">Jul-Dec</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Keywords ── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                        <input
                            type="text"
                            value={data.keywords}
                            onChange={(e) => setData('keywords', e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="e.g. report, 2026, annual"
                        />
                    </div>

                    

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                canSubmit
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {processing ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
