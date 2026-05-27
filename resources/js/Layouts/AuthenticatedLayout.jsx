import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * AuthenticatedLayout — main shell for all authenticated pages.
 *
 * Sidebar structure (grouped):
 *   WORKSPACE
 *     Dashboard
 *     Search
 *     Documents
 *     Links
 *
 *   LIBRARY
 *     Bookmarks
 *     Archive Bin
 *
 *   SECURITY
 *     Security
 *     Users
 *     Logs
 */
export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    /**
     * Returns the Tailwind classes for a sidebar nav item.
     * Handles both expanded and collapsed (icon-only) states.
     */
    const navItemClass = (isActive) => {
        const base = 'flex items-center py-2 w-full rounded-xl transition-all';
        const expanded = isActive
            ? 'px-4 bg-green-700 text-white shadow-sm'
            : 'px-4 text-emerald-100 hover:bg-emerald-800/50 hover:text-white';
        const collapsed = isActive
            ? 'justify-center px-0 w-10 h-10 bg-green-700 text-white shadow-sm'
            : 'justify-center px-0 w-10 h-10 text-emerald-100 hover:bg-emerald-800/50 hover:text-white';
        return `${base} ${isSidebarOpen ? expanded : collapsed}`;
    };

    /**
     * Section label — only visible when sidebar is expanded.
     */
    const SectionLabel = ({ label }) =>
        isSidebarOpen ? (
            <div className="px-5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2 mt-5">
                {label}
            </div>
        ) : (
            /* Thin divider line in collapsed mode */
            <div className="w-8 h-px bg-emerald-700/60 mx-auto my-3" />
        );

    return (
        <div className="flex h-screen bg-[#f8fafc]">

            {/* ── Sidebar ── */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-emerald-900 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>

                {/* Logo / Brand */}
                <div className="p-4 flex items-center h-16 relative mt-2 px-5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-green-700 p-2 rounded-xl shrink-0 shadow-sm flex items-center justify-center">
                            <ApplicationLogo className="w-7 h-7 object-contain drop-shadow-sm" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-[17px] font-bold text-white leading-tight tracking-wide">CELLAR</span>
                                <span className="text-[11px] font-medium text-emerald-200/70">IMS</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav groups */}
                <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">

                    {/* ── WORKSPACE group ── */}
                    <SectionLabel label="Workspace" />
                    <nav className="space-y-1 flex flex-col items-center px-3">

                        {/* Dashboard */}
                        <Link href={route('dashboard')} className={navItemClass(route().current('dashboard'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Dashboard</span>}
                        </Link>

                        {/* Documents */}
                        <Link href={route('documents')} className={navItemClass(route().current('documents'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Documents</span>}
                        </Link>

                        {/* Links */}
                        <Link href={route('links')} className={navItemClass(route().current('links'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Links</span>}
                        </Link>

                        {/* Client Requests */}
                        <Link href={route('requests.index')} className={navItemClass(route().current('requests.index'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Client Requests</span>}
                        </Link>
                    </nav>

                    {/* ── LIBRARY group ── */}
                    <SectionLabel label="Library" />
                    <nav className="space-y-1 flex flex-col items-center px-3">

                        {/* Bookmarks */}
                        <Link href={route('favorites.index')} className={navItemClass(route().current('favorites.index'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Bookmarks</span>}
                        </Link>

                        {/* Bin */}
                        <Link href={route('bin.index')} className={navItemClass(route().current('bin.index'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Bin</span>}
                        </Link>
                    </nav>

                    {/* ── ACCOUNT MANAGEMENT group ── */}
                    <SectionLabel label="Management" />
                    <nav className="space-y-1 mb-8 flex flex-col items-center px-3">

                        {/* Security / Account Management */}
                        <Link href={route('security')} className={navItemClass(route().current('security'))}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Account Management</span>}
                        </Link>

                    </nav>
                </div>

                {/* ── Storage Widget ── */}
                <div className="p-4 border-t border-emerald-800 mt-auto shrink-0">
                    {isSidebarOpen ? (
                        <div className="bg-emerald-800/40 rounded-2xl p-4 border border-emerald-700/50 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <span className="text-sm font-semibold text-emerald-100">Storage</span>
                                </div>
                                <span className="text-xs font-bold text-amber-400">45%</span>
                            </div>
                            <div className="w-full bg-emerald-900 rounded-full h-2 mb-3 overflow-hidden border border-emerald-800">
                                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full relative" style={{ width: '45%' }}>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-amber-400">45 GB Used</span>
                                <span className="text-emerald-300">55 GB Free</span>
                            </div>
                        </div>
                    ) : (
                        /* Collapsed storage icon with tooltip */
                        <div className="flex justify-center group relative">
                            <div className="bg-emerald-800/60 p-3 rounded-xl border border-emerald-700/50 hover:border-amber-400/50 transition-colors cursor-pointer">
                                <svg className="w-6 h-6 text-emerald-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-emerald-900 border border-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-200">
                                45% Storage Used
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header Bar */}
                <header className="bg-white h-16 flex items-center justify-between px-6 shrink-0 border-b border-gray-100 z-10 relative shadow-sm">
                    <div className="flex-1 flex items-center gap-6 pr-8">
                        {/* Sidebar toggle — green panel icon */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-50 shrink-0"
                            aria-label="Toggle sidebar"
                        >
                            {/* Two-panel layout icon — left panel + right content area */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="7" height="18" rx="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="13" y="3" width="8" height="18" rx="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>


                    </div>

                    {/* Right: notifications + user menu */}
                    <div className="flex items-center space-x-6 shrink-0 border-l border-gray-100 pl-6">
                        <button className="text-gray-400 hover:text-gray-600 relative transition-colors" aria-label="Notifications">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="flex flex-col items-start focus:outline-none text-left">
                                        <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                                        <span className="text-[11px] font-medium text-gray-500 mt-0.5 capitalize">{user.role}</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
