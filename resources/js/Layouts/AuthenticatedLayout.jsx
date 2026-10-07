import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isDirector = auth.is_director;
    const isAssistant = auth.is_assistant;
    const isStaff = auth.is_staff;
    const isCritic = auth.is_critic;
    const canAccessCriticReports = auth.can_access_critic_reports;
    const canManageCritics = auth.can_manage_critics;

    // Active Role state (Persisted in localStorage for Directors)
    const [activeRole, setActiveRole] = useState(() => {
        if (isDirector) {
            return localStorage.getItem('cellar_active_role') || 'Director';
        }
        return isDirector ? 'Director' : isAssistant ? 'Admin Assistant' : isStaff ? 'Staff' : isCritic ? 'English Critic' : 'User';
    });

    const handleRoleChange = (newRole) => {
        setActiveRole(newRole);
        if (isDirector) {
            localStorage.setItem('cellar_active_role', newRole);
            if (newRole === 'English Critic') {
                if (!route().current('critic.report.create') && !route().current('critic.receipt.create')) {
                    router.visit(route('critic.report.create'));
                }
            } else if (newRole === 'Director') {
                if (route().current('critic.report.create') || route().current('critic.receipt.create')) {
                    router.visit(route('dashboard'));
                }
            }
        }
    };

    // Determine if showing DMS sidebar or Critic sidebar
    const showCriticNav = isDirector ? (activeRole === 'English Critic') : (isCritic && !isDirector && !isAssistant && !isStaff);
    const showDmsNav = isDirector ? (activeRole === 'Director') : (isDirector || isAssistant || isStaff || (!isCritic));

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItemClass = (isActive) => {
        const base = 'flex items-center py-2 w-full rounded-xl transition-all';
        const expanded = isActive
            ? 'px-4 bg-blue-700 text-white shadow-sm hover:bg-blue-700 hover:text-white'
            : 'px-4 text-blue-100 hover:bg-blue-800/50 hover:text-white';
        const collapsed = isActive
            ? 'justify-center px-0 w-10 h-10 bg-blue-700 text-white shadow-sm'
            : 'justify-center px-0 w-10 h-10 text-blue-100 hover:bg-blue-800/50 hover:text-white';
        return `${base} ${isSidebarOpen ? expanded : collapsed}`;
    };

    const SectionLabel = ({ label }) =>
        isSidebarOpen ? (
            <div className="px-5 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-2 mt-5">{label}</div>
        ) : (
            <div className="w-8 h-px bg-blue-700/60 mx-auto my-3" />
        );

    // Derive role label from active role or flags
    const roleLabel = isDirector ? activeRole : isAssistant ? 'Admin Assistant' : isStaff ? 'Staff' : isCritic ? 'English Critic' : 'User';

    return (
        <div className="flex h-screen bg-[#f8fafc]">

            {/* ── Sidebar ── */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>

                {/* Logo */}
                <div className="p-4 flex items-center h-16 relative mt-2 px-5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-blue-700 p-2 rounded-xl shrink-0 shadow-sm flex items-center justify-center">
                            <ApplicationLogo className="w-7 h-7 object-contain drop-shadow-sm" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-[17px] font-bold text-white leading-tight tracking-wide">CELLAR</span>
                                <span className="text-[11px] font-medium text-blue-200/70">IMS</span>
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">

                    {/* ── CRITIC nav ── */}
                    {showCriticNav && (
                        <>
                            <SectionLabel label="Workspace" />
                            <nav className="space-y-1 flex flex-col items-center px-3">
                                <Link href={route('critic.dashboard')} className={navItemClass(route().current('critic.dashboard') && !window.location.hash)}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2v-2z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Dashboard</span>}
                                </Link>
                                <Link href={route('critic.requests')} className={navItemClass(route().current('critic.requests'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Requests &amp; Queue</span>}
                                </Link>
                                <Link href={route('critic.earnings')} className={navItemClass(route().current('critic.earnings'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">My Earnings</span>}
                                </Link>
                                <Link href={`${route('critic.dashboard')}#billing-reports`} className={navItemClass(route().current('critic.dashboard') && window.location.hash === '#billing-reports')}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">EC Billing Reports</span>}
                                </Link>
                            </nav>

                            <SectionLabel label="My Work" />
                            <nav className="space-y-1 flex flex-col items-center px-3">
                                <Link href={route('critic.report.create')} className={navItemClass(route().current('critic.report.create'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">My Certifications</span>}
                                </Link>

                                <Link href={route('critic.receipt.create')} className={navItemClass(route().current('critic.receipt.create'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M16 4h4a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h4m8 0v4M8 4v4m0 8h8m-8 4h8" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Official Receipt</span>}
                                </Link>

                            </nav>
                            <SectionLabel label="Account" />
                            <nav className="space-y-1 flex flex-col items-center px-3">
                                <Link href={route('critic.profile-schedule.edit')} className={navItemClass(route().current('critic.profile-schedule.edit'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M5.121 17.804A9 9 0 1118.88 17.8M15 10a3 3 0 11-6 0 3 3 0 016 0zm-3 11a8.96 8.96 0 005.657-2" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Profile &amp; Schedule</span>}
                                </Link>
                            </nav>
                        </>
                    )}

                    {/* ── DMS nav (Director + Assistant) ── */}
                    {showDmsNav && (
                        <>
                            <SectionLabel label="Workspace" />
                            <nav className="space-y-1 flex flex-col items-center px-3">

                                <Link href={route('dashboard')} className={navItemClass(route().current('dashboard'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Dashboard</span>}
                                </Link>

                                <Link href={route('documents')} className={navItemClass(route().current('documents'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Documents</span>}
                                </Link>

                                <Link href={route('links')} className={navItemClass(route().current('links'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">External Links</span>}
                                </Link>


                                {(isDirector || canAccessCriticReports) && (
                                    <Link href={route('critic.reports.index')} className={navItemClass(route().current('critic.reports.index'))}>
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">EC Billing Report</span>}
                                    </Link>
                                )}
                            </nav>

                            <SectionLabel label="Library" />
                            <nav className="space-y-1 flex flex-col items-center px-3">
                                <Link href={route('favorites.index')} className={navItemClass(route().current('favorites.index'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Bookmarks</span>}
                                </Link>

                                <Link href={route('bin.index')} className={navItemClass(route().current('bin.index'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Bin</span>}
                                </Link>
                            </nav>
                        </>
                    )}

                    {/* ── Management (Director + Assistant only — NOT Staff) ── */}
                    {showDmsNav && (isDirector || isAssistant) && (
                        <>
                            <SectionLabel label="Management" />
                            <nav className="space-y-1 flex flex-col items-center px-3">
                                {/* Account Management — Director + Assistant */}
                                <Link href={route('security')} className={navItemClass(route().current('security'))}>
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Account Management</span>}
                                </Link>

                                {/* Director and explicitly permissioned assistant links */}
                                {(isDirector || canManageCritics) && (
                                    <>
                                        {/* English Critic Management */}
                                        <Link href={route('critic.management')} className={navItemClass(route().current('critic.management'))}>
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {isSidebarOpen && <span className="ml-3.5 text-[14.5px] font-medium tracking-wide">Critic Management</span>}
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </>
                    )}
                </div>

                {/* Storage widget */}
                {showDmsNav && (
                    <div className="p-4 border-t border-blue-800 mt-auto shrink-0">
                        {isSidebarOpen ? (
                            <div className="bg-blue-800/40 rounded-2xl p-4 border border-blue-700/50 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        <span className="text-sm font-semibold text-blue-100">Storage</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-400">45%</span>
                                </div>
                                <div className="w-full bg-blue-900 rounded-full h-2 mb-3 overflow-hidden border border-blue-800">
                                    <div className="bg-linear-to-r from-blue-500 to-blue-300 h-full rounded-full" style={{ width: '45%' }} />
                                </div>
                                <div className="flex justify-between text-[11px] font-medium">
                                    <span className="text-blue-400">45 GB Used</span>
                                    <span className="text-blue-300">55 GB Free</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center group relative">
                                <div className="bg-blue-800/60 p-3 rounded-xl border border-blue-700/50 hover:border-blue-400/50 transition-colors cursor-pointer">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-blue-900 border border-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-200">
                                    45% Storage Used
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="bg-white h-16 flex items-center justify-between px-6 shrink-0 border-b border-gray-100 z-10 relative shadow-sm">
                    <div className="flex-1 flex items-center gap-6 pr-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-50 shrink-0"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="7" height="18" rx="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="13" y="3" width="8" height="18" rx="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0 border-l border-gray-100 pl-6">
                        {/* Active Role Selector for Director */}
                        {isDirector && (
                            <div className="flex items-center text-sm font-medium text-gray-700">
                                <span className="mr-2 text-gray-500">Active Role:</span>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button type="button" className="inline-flex items-center text-sm font-semibold text-gray-800 hover:text-blue-600 focus:outline-none transition-colors">
                                            {activeRole}
                                            <svg className="ml-1 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content width="48" align="right">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange('Director')}
                                            className={`block w-full text-left px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out ${activeRole === 'Director' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            Director
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange('English Critic')}
                                            className={`block w-full text-left px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out ${activeRole === 'English Critic' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            English Critic
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}

                        <button className="text-gray-400 hover:text-gray-600 relative transition-colors" aria-label="Notifications">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button type="button" className="flex flex-col items-start focus:outline-none text-left">
                                    <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                                    <span className="text-[11px] font-medium text-gray-500 mt-0.5">{roleLabel}</span>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
