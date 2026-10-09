import { useState } from 'react';
import Modal from '@/Components/Modal';

/**
 * NewFolderModal — compact dialog to create a named folder.
 *
 * Layout (matches reference image):
 *   - Folder+ icon + "New Folder" title
 *   - Single text input (auto-focused, placeholder "Untitled folder")
 *   - Cancel / Create buttons
 *
 * Props:
 *   show     — boolean visibility
 *   onClose  — called on cancel or after successful creation
 *   onCreate — called with the folder name string when user clicks Create
 */
export default function NewFolderModal({ show, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        try {
            await onCreate?.({ name: name.trim(), tags: tags.trim() });
            setName('');
            setTags('');
            onClose();
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        setName('');
        setTags('');
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="bg-white rounded-2xl p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        {/* Folder-plus icon */}
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">New Folder</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleCreate}>
                    {/* Folder name input */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className="w-full border border-blue-400 bg-white rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Untitled folder"
                    />

                    <label htmlFor="new-folder-tags" className="mt-4 mb-1.5 block text-xs font-semibold text-gray-600">
                        Tags <span className="font-normal text-gray-400">(optional, comma-separated)</span>
                    </label>
                    <input
                        id="new-folder-tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="mb-5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. policies, 2026"
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || creating}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                name.trim() && !creating
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
