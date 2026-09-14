import { useState } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

/**
 * ShareLinkModal — generates a permanent share link for a file.
 *
 * Flow:
 *   1. User clicks "Generate Link"
 *   2. Backend returns a permanent URL
 *   3. URL is displayed with a Copy button
 *
 * Props:
 *   show    — boolean
 *   onClose — () => void
 *   file    — { id, title } | null
 */
export default function ShareLinkModal({ show, onClose, file }) {
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [loading, setLoading]           = useState(false);
    const [copied, setCopied]             = useState(false);
    const [error, setError]               = useState('');

    /* ── Reset all state when the modal closes ── */
    const handleClose = () => {
        setGeneratedUrl('');
        setCopied(false);
        setError('');
        onClose();
    };

    /* ── Generate the permanent share link via the backend ── */
    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setGeneratedUrl('');
        try {
            const res = await axios.post('/share-link', {
                file_id: file.id,
            });
            setGeneratedUrl(res.data.url);
        } catch (e) {
            setError(e.response?.data?.message ?? 'Failed to generate link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Copy generated URL to clipboard ── */
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedUrl);
        } catch {
            // Fallback for browsers without clipboard API
            const el = document.createElement('textarea');
            el.value = generatedUrl;
            document.body.appendChild(el);
            el.select();
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="bg-white rounded-2xl p-7">

                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Share / network icon */}
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Share Link</h2>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 ml-7">
                            Generate a guest link for "{file?.title}".
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Error message ── */}
                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                {/* ── Generated URL display with copy button ── */}
                {generatedUrl && (
                    <div className="mb-5">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                            {/* Truncated URL */}
                            <p className="flex-1 text-xs text-gray-600 truncate font-mono">{generatedUrl}</p>

                            {/* Copy button */}
                            <button
                                onClick={handleCopy}
                                className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                    copied
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Action buttons ── */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                {/* Spinner */}
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generating…
                            </>
                        ) : (
                            <>
                                {/* Link icon */}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Generate Link
                            </>
                        )}
                    </button>
                </div>

            </div>
        </Modal>
    );
}
