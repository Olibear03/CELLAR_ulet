import { Head } from '@inertiajs/react';

/**
 * SharePage — public, unauthenticated file share page.
 *
 * Props (from ShareController@show):
 *   title            — string  File title (shown as heading)
 *   original_filename— string  Original upload filename
 *   file_url         — string  Absolute URL to the file in storage
 *   mime_or_ext      — string  MIME type or file extension
 *   is_previewable   — boolean Whether to show the Google Docs Viewer iframe
 */
export default function SharePage({ title, original_filename, file_url, mime_or_ext, is_previewable }) {
    return (
        <div className="min-h-screen bg-blue-900 flex flex-col">
            <Head title={`${title} — CELLAR`} />

            {/* ── Header / Branding ── */}
            <header className="px-8 py-5 flex items-center gap-4 shrink-0">
                <img
                    src="/CELLAR_logo.png"
                    alt="CELLAR Logo"
                    className="h-10 w-auto object-contain"
                />
                <div>
                    <p className="text-white text-[16px] font-bold leading-tight">CELLAR</p>
                    <p className="text-blue-300 text-[11px]">Information Management System</p>
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col items-center px-4 pb-12 pt-4">

                {/* File title card */}
                <div className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-white text-xl font-bold leading-snug">{title}</h1>
                        <p className="text-blue-300 text-sm mt-0.5">{original_filename}</p>
                    </div>

                    {/* Download button — always visible */}
                    <a
                        href={file_url}
                        download={original_filename}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow"
                    >
                        {/* Download icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>

                {/* ── Preview or fallback ── */}
                <div className="w-full max-w-4xl">
                    {is_previewable ? (
                        <PreviewEmbed fileUrl={file_url} filename={original_filename} />
                    ) : (
                        <DownloadCard filename={original_filename} fileUrl={file_url} />
                    )}
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="text-center text-blue-500 text-xs pb-6 shrink-0">
                © {new Date().getFullYear()} CENTER FOR LANGUAGE-LEARNING AND RESEARCH OF CAVITE STATE UNIVERSITY
            </footer>
        </div>
    );
}

/**
 * PreviewEmbed — Google Docs Viewer iframe for PDF, images, and Office files.
 */
function PreviewEmbed({ fileUrl, filename }) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-white/20">
            <iframe
                src={viewerUrl}
                title={`Preview: ${filename}`}
                className="w-full"
                style={{ minHeight: '650px', height: '75vh', border: 'none' }}
                allowFullScreen
            />
        </div>
    );
}

/**
 * DownloadCard — fallback for non-previewable files.
 * Shows filename and a prominent download button; no preview attempt.
 */
function DownloadCard({ filename, fileUrl }) {
    return (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            {/* File icon */}
            <div className="bg-blue-800 rounded-2xl p-5">
                <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>

            <div>
                <p className="text-white font-semibold text-lg">{filename}</p>
                <p className="text-blue-300 text-sm mt-1">Preview is not available for this file type.</p>
            </div>

            <a
                href={fileUrl}
                download={filename}
                className="flex items-center gap-2 px-7 py-3 bg-white text-blue-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
            </a>
        </div>
    );
}
