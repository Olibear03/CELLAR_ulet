import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function ArchiveSearch({ recentUploads = [], categories = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNewDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Filter logic
    const filteredFiles = recentUploads.filter(file => {
        const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = activeCategory ? file.category_id === activeCategory : true;

        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Archive Search" />
            <div className="max-w-[1400px] mx-auto space-y-6">
                
                {/* Search Area */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative">
                    <div className="relative flex items-center w-full h-12 rounded-full bg-gray-50 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden">
                        <div className="pl-6 pr-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-transparent border-none text-gray-900 text-[15px] placeholder-gray-500 focus:outline-none focus:ring-0 px-2"
                            placeholder="Search in Drive..."
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="pr-6 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Top Action Bar: Breadcrumbs & New Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-gray-800 text-lg sm:text-xl font-medium">
                        <span 
                            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${!activeCategory ? 'bg-gray-100 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                            onClick={() => setActiveCategory(null)}
                        >
                            My Drive
                        </span>
                        {activeCategory && (
                            <>
                                <svg className="w-5 h-5 text-gray-400 mx-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-100">
                                    {categories.find(c => c.id === activeCategory)?.name}
                                </span>
                            </>
                        )}
                    </div>

                    {/* New Button Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
                            className="flex items-center bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all gap-2"
                        >
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            <span className="font-semibold text-gray-700">New</span>
                        </button>
                        
                        {isNewDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 z-50 py-2">
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                                    <span className="font-medium">New folder</span>
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                    <span className="font-medium">Upload Document</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] min-h-[600px]">
                    
                    {/* Folders Section */}
                    {(!activeCategory || categories.some(c => c.id === activeCategory)) && (
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Folders</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {categories.map((category) => (
                                    <div 
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id === activeCategory ? null : category.id)}
                                        className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer group select-none ${
                                            activeCategory === category.id 
                                                ? 'border-blue-500 bg-blue-50/50' 
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className={`w-6 h-6 mr-3 shrink-0 transition-colors ${activeCategory === category.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                                        </svg>
                                        <div className="overflow-hidden">
                                            <h4 className={`text-[14px] font-semibold truncate transition-colors ${activeCategory === category.id ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                                {category.name}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="border-gray-100 my-8" />

                    {/* Files Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                {activeCategory ? `Files in ${categories.find(c => c.id === activeCategory)?.name}` : 'Files'}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="pb-3 pt-2 text-xs font-semibold text-gray-500 w-[50%]">Name</th>
                                        <th className="pb-3 pt-2 text-xs font-semibold text-gray-500 w-[20%]">Owner</th>
                                        <th className="pb-3 pt-2 text-xs font-semibold text-gray-500 w-[20%]">Last modified</th>
                                        <th className="pb-3 pt-2 text-xs font-semibold text-gray-500 w-[10%] text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.length > 0 ? (
                                        filteredFiles.map(file => (
                                            <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                                        </svg>
                                                        <span className="text-[14px] font-medium text-gray-800">{file.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-[13px] font-medium text-gray-600">{file.user ? file.user.name : 'Unknown'}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-[13px] font-medium text-gray-600">{formatDate(file.updated_at)}</span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <a href={`/storage/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all" onClick={(e) => e.stopPropagation()}>
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-200 mb-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                                    </svg>
                                                    <h4 className="text-gray-900 font-bold text-lg">No files here</h4>
                                                    <p className="text-gray-500 mt-1 max-w-sm text-sm">Upload files or select a different folder to see documents.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
