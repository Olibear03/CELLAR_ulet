import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const DOCUMENT_TYPES = {
    thesis:                     'Thesis',
    dissertation:               'Dissertation',
    capstone:                   'Capstone',
    edp_manuscript:             'EDP Manuscript',
    design_project:             'Design Project',
    student_teaching_portfolio: 'Teaching Portfolio',
    narrative_report:           'Narrative Report',
    other:                      'Other',
};

// Wireframe-optimized list of critics
const CRITICS_DATA = [
    {
        college: 'College of Agriculture, Food, Environment, and Natural Resources',
        code: 'CAFENR',
        color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
        list: ['Critic Dummy 3']
    },
    {
        college: 'College of Arts and Sciences',
        code: 'CAS',
        color: 'bg-purple-500/10 text-purple-700 border-purple-200/50',
        list: ['Critic Dummy 1']
    },
    {
        college: 'College of Education',
        code: 'CED',
        color: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
        list: ['Critic Dummy 6']
    },
    {
        college: 'College of Engineering and Information Technology',
        code: 'CEIT',
        color: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
        list: ['Critic Dummy 2']
    },
    {
        college: 'College of Economics, Management, and Development Studies',
        code: 'CEMDS',
        color: 'bg-sky-500/10 text-sky-700 border-sky-200/50',
        list: ['Critic Dummy 4']
    },
    {
        college: 'College of Nursing',
        code: 'CON',
        color: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
        list: ['Critic Dummy 5']
    },
    {
        college: 'College of Veterinary Medicine and Biomedical Sciences',
        code: 'CVMBS',
        color: 'bg-red-500/10 text-red-700 border-red-200/50',
        list: ['Critic Dummy 7']
    }
];

const getCriticCollege = (criticName) => {
    if (!criticName) return null;
    const name = criticName.trim();
    switch (name) {
        case 'Critic Dummy 1':
            return { college: 'College of Arts and Sciences', code: 'CAS', color: 'bg-purple-500/10 text-purple-700 border-purple-200/50' };
        case 'Critic Dummy 2':
            return { college: 'College of Engineering and Information Technology', code: 'CEIT', color: 'bg-blue-500/10 text-blue-700 border-blue-200/50' };
        case 'Critic Dummy 3':
            return { college: 'College of Agriculture, Food, Environment, and Natural Resources', code: 'CAFENR', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50' };
        case 'Critic Dummy 4':
            return { college: 'College of Economics, Management, and Development Studies', code: 'CEMDS', color: 'bg-sky-500/10 text-sky-700 border-sky-200/50' };
        case 'Critic Dummy 5':
            return { college: 'College of Nursing', code: 'CON', color: 'bg-rose-500/10 text-rose-700 border-rose-200/50' };
        case 'Critic Dummy 6':
            return { college: 'College of Education', code: 'CED', color: 'bg-amber-500/10 text-amber-700 border-amber-200/50' };
        case 'Critic Dummy 7':
            return { college: 'College of Veterinary Medicine and Biomedical Sciences', code: 'CVMBS', color: 'bg-red-500/10 text-red-700 border-red-200/50' };
        default:
            return null;
    }
};

const ALL_OFFICIAL_CRITICS = [
    { name: 'Critic Dummy 1', collegeName: 'College of Arts and Sciences', collegeCode: 'CAS', color: 'bg-purple-500/10 text-purple-700 border-purple-200/50' },
    { name: 'Critic Dummy 2', collegeName: 'College of Engineering and Information Technology', collegeCode: 'CEIT', color: 'bg-blue-500/10 text-blue-700 border-blue-200/50' },
    { name: 'Critic Dummy 3', collegeName: 'College of Agriculture, Food, Environment, and Natural Resources', collegeCode: 'CAFENR', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50' },
    { name: 'Critic Dummy 4', collegeName: 'College of Economics, Management, and Development Studies', collegeCode: 'CEMDS', color: 'bg-sky-500/10 text-sky-700 border-sky-200/50' },
    { name: 'Critic Dummy 5', collegeName: 'College of Nursing', collegeCode: 'CON', color: 'bg-rose-500/10 text-rose-700 border-rose-200/50' },
    { name: 'Critic Dummy 6', collegeName: 'College of Education', collegeCode: 'CED', color: 'bg-amber-500/10 text-amber-700 border-amber-200/50' },
    { name: 'Critic Dummy 7', collegeName: 'College of Veterinary Medicine and Biomedical Sciences', collegeCode: 'CVMBS', color: 'bg-red-500/10 text-red-700 border-red-200/50' }
];

// 3 Fake submissions per critic (21 total mock items) all receiving O.R. numbers
const MOCK_REPORTS = [
    // Critic Dummy 1 (CAS)
    {
        id: 'mock-1',
        user: { name: 'Critic Dummy 1' },
        student_name: 'Juan dela Cruz',
        course_degree: 'AB Journalism',
        manuscript_title: 'An Analysis of Modern Digital Journalism in the Philippines',
        document_type: 'thesis',
        times_read: 2,
        page_count: 110,
        total_amount: 2200.00,
        or_number: 'OR-2026-0001',
        created_at: '2026-06-01T10:00:00.000Z'
    },
    {
        id: 'mock-2',
        user: { name: 'Critic Dummy 1' },
        student_name: 'Maria Clara',
        course_degree: 'AB English',
        manuscript_title: 'Syntactic Structures and Stylistics in Local Literature',
        document_type: 'thesis',
        times_read: 3,
        page_count: 145,
        total_amount: 4350.00,
        or_number: 'OR-2026-0002',
        created_at: '2026-06-02T11:30:00.000Z'
    },
    {
        id: 'mock-3',
        user: { name: 'Critic Dummy 1' },
        student_name: 'Crisostomo Ibarra',
        course_degree: 'MA English',
        manuscript_title: 'Socio-Political Discourse in Post-Colonial Philippine Novels',
        document_type: 'dissertation',
        times_read: 2,
        page_count: 210,
        total_amount: 8400.00,
        or_number: 'OR-2026-0003',
        created_at: '2026-06-03T14:15:00.000Z'
    },
    // Critic Dummy 2 (CEIT)
    {
        id: 'mock-4',
        user: { name: 'Critic Dummy 2' },
        student_name: 'Jose Rizal',
        course_degree: 'BS Computer Science',
        manuscript_title: 'Development of an AI-Driven Library Archival Management System',
        document_type: 'capstone',
        times_read: 2,
        page_count: 180,
        total_amount: 3600.00,
        or_number: 'OR-2026-0004',
        created_at: '2026-06-04T09:00:00.000Z'
    },
    {
        id: 'mock-5',
        user: { name: 'Critic Dummy 2' },
        student_name: 'Andres Bonifacio',
        course_degree: 'BS Information Technology',
        manuscript_title: 'Cloud-Based Document Tracking and Analytics for Academic Research',
        document_type: 'capstone',
        times_read: 1,
        page_count: 95,
        total_amount: 1900.00,
        or_number: 'OR-2026-0005',
        created_at: '2026-06-04T15:20:00.000Z'
    },
    {
        id: 'mock-6',
        user: { name: 'Critic Dummy 2' },
        student_name: 'Emilio Jacinto',
        course_degree: 'BS Civil Engineering',
        manuscript_title: 'Structural Integrity Assessment of Heritage Bridges in Cavite',
        document_type: 'design_project',
        times_read: 2,
        page_count: 250,
        total_amount: 5000.00,
        or_number: 'OR-2026-0006',
        created_at: '2026-06-05T10:45:00.000Z'
    },
    // Critic Dummy 3 (CAFENR)
    {
        id: 'mock-7',
        user: { name: 'Critic Dummy 3' },
        student_name: 'Gabriela Silang',
        course_degree: 'BS Agriculture',
        manuscript_title: 'Growth Performance and Yield of Organic Rice under Intercropping',
        document_type: 'thesis',
        times_read: 2,
        page_count: 88,
        total_amount: 1760.00,
        or_number: 'OR-2026-0007',
        created_at: '2026-06-01T08:30:00.000Z'
    },
    {
        id: 'mock-8',
        user: { name: 'Critic Dummy 3' },
        student_name: 'Melchora Aquino',
        course_degree: 'BS Food Technology',
        manuscript_title: 'Physicochemical Properties and Shelf-life of Coconut-based Desserts',
        document_type: 'thesis',
        times_read: 3,
        page_count: 115,
        total_amount: 3450.00,
        or_number: 'OR-2026-0008',
        created_at: '2026-06-02T13:00:00.000Z'
    },
    {
        id: 'mock-9',
        user: { name: 'Critic Dummy 3' },
        student_name: 'Gregoria de Jesus',
        course_degree: 'MS Environmental Science',
        manuscript_title: 'Biodiversity Assessment of Riparian Zones in Indang Watersheds',
        document_type: 'dissertation',
        times_read: 2,
        page_count: 195,
        total_amount: 7800.00,
        or_number: 'OR-2026-0009',
        created_at: '2026-06-03T16:40:00.000Z'
    },
    // Critic Dummy 4 (CEMDS)
    {
        id: 'mock-10',
        user: { name: 'Critic Dummy 4' },
        student_name: 'Apolinario Mabini',
        course_degree: 'BS Business Administration',
        manuscript_title: 'Market Viability and Consumer Response to E-Commerce Apps',
        document_type: 'thesis',
        times_read: 2,
        page_count: 130,
        total_amount: 2600.00,
        or_number: 'OR-2026-0010',
        created_at: '2026-06-01T11:00:00.000Z'
    },
    {
        id: 'mock-11',
        user: { name: 'Critic Dummy 4' },
        student_name: 'Marcelo H. del Pilar',
        course_degree: 'BS Economics',
        manuscript_title: 'Economic Impact of Inflation on Local Agri-Producers in Cavite',
        document_type: 'thesis',
        times_read: 1,
        page_count: 105,
        total_amount: 2100.00,
        or_number: 'OR-2026-0011',
        created_at: '2026-06-02T09:15:00.000Z'
    },
    {
        id: 'mock-12',
        user: { name: 'Critic Dummy 4' },
        student_name: 'Juan Luna',
        course_degree: 'MBA',
        manuscript_title: 'Strategic Management Practices of Cooperatives in Region IV-A',
        document_type: 'dissertation',
        times_read: 2,
        page_count: 220,
        total_amount: 8800.00,
        or_number: 'OR-2026-0012',
        created_at: '2026-06-03T15:00:00.000Z'
    },
    // Critic Dummy 5 (CON)
    {
        id: 'mock-13',
        user: { name: 'Critic Dummy 5' },
        student_name: 'Teresa Magbanua',
        course_degree: 'BS Nursing',
        manuscript_title: 'Health-Seeking Behaviors of Elderly Residents in Rural Cavite',
        document_type: 'thesis',
        times_read: 2,
        page_count: 140,
        total_amount: 2800.00,
        or_number: 'OR-2026-0013',
        created_at: '2026-06-01T14:30:00.000Z'
    },
    {
        id: 'mock-14',
        user: { name: 'Critic Dummy 5' },
        student_name: 'Trinidad Tecson',
        course_degree: 'BS Nursing',
        manuscript_title: 'Stress Levels and Coping Mechanisms among Emergency Ward Nurses',
        document_type: 'thesis',
        times_read: 2,
        page_count: 125,
        total_amount: 2500.00,
        or_number: 'OR-2026-0014',
        created_at: '2026-06-02T16:00:00.000Z'
    },
    {
        id: 'mock-15',
        user: { name: 'Critic Dummy 5' },
        student_name: 'Josefa Llanes Escoda',
        course_degree: 'MS Nursing',
        manuscript_title: 'Efficacy of Community-Based Preventive Health Seminars on Hygiene',
        document_type: 'dissertation',
        times_read: 3,
        page_count: 190,
        total_amount: 7600.00,
        or_number: 'OR-2026-0015',
        created_at: '2026-06-03T10:00:00.000Z'
    },
    // Critic Dummy 6 (CED)
    {
        id: 'mock-16',
        user: { name: 'Critic Dummy 6' },
        student_name: 'Francisco Baltazar',
        course_degree: 'Bachelor of Secondary Education',
        manuscript_title: 'Classroom Management Styles of Pre-Service Secondary Teachers',
        document_type: 'student_teaching_portfolio',
        times_read: 2,
        page_count: 160,
        total_amount: 3200.00,
        or_number: 'OR-2026-0016',
        created_at: '2026-06-01T15:45:00.000Z'
    },
    {
        id: 'mock-17',
        user: { name: 'Critic Dummy 6' },
        student_name: 'Leona Florentino',
        course_degree: 'Bachelor of Elementary Education',
        manuscript_title: 'Development of Gamified Learning Modules for Early Mathematics',
        document_type: 'thesis',
        times_read: 2,
        page_count: 112,
        total_amount: 2240.00,
        or_number: 'OR-2026-0017',
        created_at: '2026-06-02T14:00:00.000Z'
    },
    {
        id: 'mock-18',
        user: { name: 'Critic Dummy 6' },
        student_name: 'Jose Maria Panganiban',
        course_degree: 'MA Education',
        manuscript_title: 'Implementation of Blended Learning Modalities in Secondary Schools',
        document_type: 'dissertation',
        times_read: 2,
        page_count: 240,
        total_amount: 9600.00,
        or_number: 'OR-2026-0018',
        created_at: '2026-06-03T13:20:00.000Z'
    },
    // Critic Dummy 7 (CVMBS)
    {
        id: 'mock-19',
        user: { name: 'Critic Dummy 7' },
        student_name: 'Galicano Apacible',
        course_degree: 'Doctor of Veterinary Medicine',
        manuscript_title: 'Prevalence of Avian Influenza in Selected Farms in Cavite Province',
        document_type: 'thesis',
        times_read: 2,
        page_count: 150,
        total_amount: 3000.00,
        or_number: 'OR-2026-0019',
        created_at: '2026-06-01T16:15:00.000Z'
    },
    {
        id: 'mock-20',
        user: { name: 'Critic Dummy 7' },
        student_name: 'Mariano Ponce',
        course_degree: 'BS Biomedical Sciences',
        manuscript_title: 'Antimicrobial Efficacy of Selected Herbal Extracts against S. aureus',
        document_type: 'thesis',
        times_read: 3,
        page_count: 135,
        total_amount: 4050.00,
        or_number: 'OR-2026-0020',
        created_at: '2026-06-02T10:30:00.000Z'
    },
    {
        id: 'mock-21',
        user: { name: 'Critic Dummy 7' },
        student_name: 'Antonio Luna',
        course_degree: 'MS Biology',
        manuscript_title: 'Molecular Characterization of Microbial Communities in Organic Soil',
        document_type: 'dissertation',
        times_read: 2,
        page_count: 205,
        total_amount: 8200.00,
        or_number: 'OR-2026-0021',
        created_at: '2026-06-03T11:45:00.000Z'
    }
];

export default function CriticSummaryReports({ reports = [] }) {
    const [activeTab, setActiveTab] = useState('table'); // 'table' | 'directory' | 'analytics'
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('ALL');
    
    // Directory selected critic
    const [selectedCritic, setSelectedCritic] = useState(null);
    const [directorySearch, setDirectorySearch] = useState('');
    const [directoryCollege, setDirectoryCollege] = useState('ALL');

    // Use strictly static mock reports for the wireframe
    const combinedReports = useMemo(() => {
        return MOCK_REPORTS;
    }, []);

    // Pre-calculate the college for every report's author
    const enrichedReports = useMemo(() => {
        return combinedReports.map(r => ({
            ...r,
            college_info: getCriticCollege(r.user?.name)
        }));
    }, [combinedReports]);

    // Filtered reports for the main spreadsheet table
    const filteredReports = useMemo(() => {
        return enrichedReports.filter(r => {
            const collegeCode = r.college_info?.code || '';
            const collegeName = r.college_info?.college || '';

            const matchSearch = !search ||
                r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                r.manuscript_title?.toLowerCase().includes(search.toLowerCase()) ||
                r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                r.or_number?.toLowerCase().includes(search.toLowerCase()) ||
                collegeCode.toLowerCase().includes(search.toLowerCase()) ||
                collegeName.toLowerCase().includes(search.toLowerCase());
                
            const matchType = !filterType || r.document_type === filterType;
            const matchCollege = selectedCollege === 'ALL' || collegeCode === selectedCollege;

            return matchSearch && matchType && matchCollege;
        });
    }, [enrichedReports, search, filterType, selectedCollege]);

    // Directory list filtered
    const filteredCritics = useMemo(() => {
        return ALL_OFFICIAL_CRITICS.filter(c => {
            const matchesSearch = !directorySearch || c.name.toLowerCase().includes(directorySearch.toLowerCase());
            const matchesCollege = directoryCollege === 'ALL' || c.collegeCode === directoryCollege;
            return matchesSearch && matchesCollege;
        });
    }, [directorySearch, directoryCollege]);

    // Selected critic's submissions (Solo view)
    const criticSoloSubmissions = useMemo(() => {
        if (!selectedCritic) return [];
        return enrichedReports.filter(r => r.user?.name?.trim().toLowerCase() === selectedCritic.name.trim().toLowerCase());
    }, [enrichedReports, selectedCritic]);

    // Stats calculations for selected critic
    const criticSoloStats = useMemo(() => {
        const total = criticSoloSubmissions.length;
        const totalAmount = criticSoloSubmissions.reduce((sum, r) => sum + parseFloat(r.total_amount ?? 0), 0);
        const pageCount = criticSoloSubmissions.reduce((sum, r) => sum + (parseInt(r.page_count) || 0), 0);
        return { total, totalAmount, pageCount };
    }, [criticSoloSubmissions]);

    // Analytics calculations (Aggregates)
    const analyticsData = useMemo(() => {
        const collegeStats = {};
        CRITICS_DATA.forEach(c => {
            collegeStats[c.code] = { count: 0, amount: 0, pages: 0, college: c.college, code: c.code, color: c.color };
        });
        collegeStats['Unspecified'] = { count: 0, amount: 0, pages: 0, college: 'Unspecified College', code: 'N/A', color: 'bg-gray-100 text-gray-500 border-gray-200' };

        const docTypeStats = {};
        Object.keys(DOCUMENT_TYPES).forEach(k => {
            docTypeStats[k] = { count: 0, label: DOCUMENT_TYPES[k] };
        });

        enrichedReports.forEach(r => {
            const code = r.college_info?.code || 'Unspecified';
            if (collegeStats[code]) {
                collegeStats[code].count += 1;
                collegeStats[code].amount += parseFloat(r.total_amount ?? 0);
                collegeStats[code].pages += parseInt(r.page_count ?? 0);
            }

            const type = r.document_type || 'other';
            if (docTypeStats[type]) {
                docTypeStats[type].count += 1;
            } else {
                docTypeStats['other'].count += 1;
            }
        });

        return {
            colleges: Object.values(collegeStats).filter(c => c.count > 0 || c.code !== 'N/A'),
            documentTypes: Object.values(docTypeStats).filter(t => t.count > 0)
        };
    }, [enrichedReports]);

    // Donut chart calculations
    const donutSegments = useMemo(() => {
        const totalSubmissions = analyticsData.colleges.reduce((sum, c) => sum + c.count, 0);
        let cumulativePercent = 0;
        return analyticsData.colleges.map((c, idx) => {
            const percent = totalSubmissions > 0 ? (c.count / totalSubmissions) * 100 : 0;
            const startPercent = cumulativePercent;
            cumulativePercent += percent;
            return {
                ...c,
                percent,
                startPercent
            };
        });
    }, [analyticsData]);

    const totalSubmissionsCount = useMemo(() => {
        return analyticsData.colleges.reduce((sum, c) => sum + c.count, 0);
    }, [analyticsData]);


    const visibleTotal = filteredReports.reduce((s, r) => s + parseFloat(r.total_amount ?? 0), 0);
    const visibleAvg   = filteredReports.length > 0 ? visibleTotal / filteredReports.length : 0;
    const totalPagesCount = filteredReports.reduce((s, r) => s + (parseInt(r.page_count) || 0), 0);

    const formatCurrency = (n) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Critic Summary Reports" />

            {/* Print-only CSS structure to format the tables as grid sheets */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    aside, header, .no-print, button, input, select, nav, .tab-buttons {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-family: 'Courier New', Courier, monospace, sans-serif !important;
                    }
                    .print-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: transparent !important;
                    }
                    .print-sheet {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-top: 15px !important;
                    }
                    .print-sheet th {
                        background-color: #f1f5f9 !important;
                        color: #000 !important;
                        border: 1px solid #94a3b8 !important;
                        font-weight: bold !important;
                        font-size: 10px !important;
                        padding: 6px !important;
                        text-transform: uppercase !important;
                    }
                    .print-sheet td {
                        border: 1px solid #cbd5e1 !important;
                        font-size: 10px !important;
                        padding: 5px !important;
                        color: #000 !important;
                    }
                    .print-header {
                        display: block !important;
                        text-align: center !important;
                        margin-bottom: 25px !important;
                        border-bottom: 2px solid #000 !important;
                        padding-bottom: 10px !important;
                    }
                    .print-title {
                        font-size: 16px !important;
                        font-weight: 800 !important;
                    }
                    .print-subtitle {
                        font-size: 11px !important;
                        color: #475569 !important;
                    }
                }
            ` }} />

            {/* Print Header Component */}
            <div className="hidden print-header print:block text-center border-b-2 border-gray-900 pb-4 mb-6">
                <h1 className="text-xl font-bold uppercase tracking-wide">Cavite State University</h1>
                <p className="text-xs font-semibold">Office of the Director for Curriculum and Instruction</p>
                <p className="text-[10px] text-gray-500">Don Severino de las Alas Campus, Indang, Cavite</p>
                <div className="mt-4">
                    <h2 className="text-sm font-bold uppercase">CLLR-QF-02: ENGLISH CRITIQUE SUMMARY RECORD</h2>
                    <p className="text-xs text-gray-600">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    {selectedCritic && activeTab === 'directory' && (
                        <p className="text-xs font-bold mt-1 text-blue-900">SOLO RECORD: {selectedCritic.name.toUpperCase()} ({selectedCritic.collegeCode})</p>
                    )}
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto space-y-6 print-container print:p-0">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-none">
                            Critic Reports Workspace
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Review, print, and analyze CLLR-QF-02 certifications and accredited critic directories.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 022 2zm0-9a9 9 0 0118 0v3h-18v-3z" />
                            </svg>
                            Print Sheets
                        </button>
                    </div>
                </div>

                {/* ── Tabs Controls (DMS Style) ── */}
                <div className="border-b border-gray-200 no-print">
                    <nav className="flex space-x-6" aria-label="Tabs">
                        {[
                            { id: 'table', label: 'Summary List', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                            { id: 'directory', label: 'Critics Directory', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                            { id: 'analytics', label: 'Analytics Dashboard', icon: 'M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === t.id
                                        ? 'border-blue-900 text-blue-900'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={t.icon} />
                                </svg>
                                {t.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── TAB 1: Spreadsheet Sheet View ── */}
                {activeTab === 'table' && (
                    <div className="space-y-4">

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-3 no-print">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search student, manuscript, critic, receipt number..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={selectedCollege}
                                    onChange={e => setSelectedCollege(e.target.value)}
                                    className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="ALL">All Colleges</option>
                                    {CRITICS_DATA.map(c => (
                                        <option key={c.code} value={c.code}>{c.code}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                    className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="">All Types</option>
                                    {Object.entries(DOCUMENT_TYPES).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Spreadsheet Grid Table */}
                        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden print-container">
                            {filteredReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center no-print">
                                    <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm font-semibold">No records found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse print-sheet">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                                                <th className="border-r border-slate-300 px-3 py-2 text-center w-8">#</th>
                                                <th className="border-r border-slate-300 px-3 py-2">Critic Name</th>
                                                <th className="border-r border-slate-300 px-3 py-2 text-center w-16">College</th>
                                                <th className="border-r border-slate-300 px-3 py-2">Student Name</th>
                                                <th className="border-r border-slate-300 px-3 py-2">Course/Degree</th>
                                                <th className="border-r border-slate-300 px-3 py-2 max-w-[200px]">Manuscript Title</th>
                                                <th className="border-r border-slate-300 px-3 py-2">Type</th>
                                                <th className="border-r border-slate-300 px-3 py-2 text-center w-12">Reads</th>
                                                <th className="border-r border-slate-300 px-3 py-2 text-center w-12">Pages</th>
                                                <th className="border-r border-slate-300 px-3 py-2 text-right">Fee</th>
                                                <th className="border-r border-slate-300 px-3 py-2">O.R. #</th>
                                                <th className="px-3 py-2">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {filteredReports.map((r, i) => (
                                                <tr key={r.id} className="hover:bg-slate-50 transition-colors font-medium">
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-center text-gray-400 font-mono">{i + 1}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 font-bold text-gray-900">{r.user?.name ?? '—'}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-center">
                                                        <span className="font-bold text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                                            {r.college_info?.code || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 font-semibold text-gray-800">{r.student_name}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-gray-600">{r.course_degree}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-gray-500 font-normal leading-tight max-w-[200px] truncate" title={r.manuscript_title}>
                                                        {r.manuscript_title}
                                                    </td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5">
                                                        <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                                                            {DOCUMENT_TYPES[r.document_type] ?? r.document_type}
                                                        </span>
                                                    </td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-center font-mono font-bold text-gray-900">{r.times_read}×</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-center font-mono">{r.page_count}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 text-right font-mono font-bold text-gray-900">{formatCurrency(r.total_amount)}</td>
                                                    <td className="border-r border-slate-200 px-3 py-1.5 font-mono text-gray-500 text-[11px]">{r.or_number}</td>
                                                    <td className="px-3 py-1.5 text-gray-400 font-normal">{formatDate(r.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 2: Critics Directory (Solo / Combined Views) ── */}
                {activeTab === 'directory' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Directory sidebar: Left Column */}
                        <div className="md:col-span-4 bg-white border border-gray-200 shadow-sm rounded-2xl p-4 space-y-4 no-print">
                            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Accredited Pool</h2>
                            
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={directorySearch}
                                    onChange={e => setDirectorySearch(e.target.value)}
                                    placeholder="Filter by name..."
                                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />

                                <select
                                    value={directoryCollege}
                                    onChange={e => setDirectoryCollege(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                >
                                    <option value="ALL">All Colleges</option>
                                    {CRITICS_DATA.map(c => (
                                        <option key={c.code} value={c.code}>{c.code}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 pr-1 no-scrollbar">
                                {filteredCritics.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCritic(c)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-between group ${
                                            selectedCritic?.name === c.name
                                                ? 'bg-blue-900 text-white font-bold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                                selectedCritic?.name === c.name ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {c.name.split(' ')[2]}
                                            </div>
                                            <span className="truncate max-w-[150px] font-semibold">{c.name}</span>
                                        </div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            selectedCritic?.name === c.name ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {c.collegeCode}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Detail View / Selected Critic's Submission: Right Column */}
                        <div className="md:col-span-8 space-y-4 print-container">
                            {selectedCritic ? (
                                <div className="space-y-4">
                                    {/* Critic Profile and Summary */}
                                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 relative overflow-hidden no-print">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="bg-blue-50 text-blue-800 font-bold border border-blue-200 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                {selectedCritic.collegeCode} Critic
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                                                {selectedCritic.name.split(' ')[2]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-950">{selectedCritic.name}</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">{selectedCritic.collegeName}</p>
                                            </div>
                                        </div>

                                        {/* Solo stats summary */}
                                        <div className="grid grid-cols-3 gap-3 border-t border-gray-100 mt-5 pt-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Encoded</p>
                                                <p className="text-base font-black text-gray-900 mt-1">{criticSoloStats.total} Submissions</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pages Evaluated</p>
                                                <p className="text-base font-black text-gray-900 mt-1">{criticSoloStats.pageCount} Pages</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Value</p>
                                                <p className="text-base font-black text-gray-900 mt-1">{formatCurrency(criticSoloStats.totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solo Table */}
                                    <div className="bg-white border border-slate-300 shadow-sm rounded-xl overflow-hidden print-container">
                                        <div className="px-5 py-3.5 border-b border-slate-300 bg-slate-50 flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                CLLR-QF-02 Submissions (Solo Version: {selectedCritic.name})
                                            </h4>
                                            <button 
                                                onClick={() => setSelectedCritic(null)}
                                                className="text-xs text-blue-700 hover:text-blue-900 font-bold no-print cursor-pointer"
                                            >
                                                Close Solo
                                            </button>
                                        </div>

                                        {criticSoloSubmissions.length === 0 ? (
                                            <div className="p-12 text-center text-gray-400 text-xs font-medium">
                                                No reading/editing certifications have been encoded by {selectedCritic.name} yet.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse print-sheet">
                                                    <thead>
                                                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                                                            <th className="border-r border-slate-300 px-3 py-2 text-center w-8">#</th>
                                                            <th className="border-r border-slate-300 px-3 py-2">Student Name</th>
                                                            <th className="border-r border-slate-300 px-3 py-2">Course</th>
                                                            <th className="border-r border-slate-300 px-3 py-2 max-w-[200px]">Manuscript Title</th>
                                                            <th className="border-r border-slate-300 px-3 py-2">Type</th>
                                                            <th className="border-r border-slate-300 px-3 py-2 text-center w-12">Reads</th>
                                                            <th className="border-r border-slate-300 px-3 py-2 text-center w-12">Pages</th>
                                                            <th className="border-r border-slate-300 px-3 py-2 text-right">Fee</th>
                                                            <th className="border-r border-slate-300 px-3 py-2">O.R. #</th>
                                                            <th className="px-3 py-2">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {criticSoloSubmissions.map((r, idx) => (
                                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors font-medium">
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-center font-mono text-gray-400">{idx + 1}</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 font-bold text-gray-900">{r.student_name}</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-gray-600">{r.course_degree}</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-gray-500 font-normal max-w-[200px] truncate" title={r.manuscript_title}>
                                                                    {r.manuscript_title}
                                                                </td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5">
                                                                    <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                                                                        {DOCUMENT_TYPES[r.document_type] ?? r.document_type}
                                                                    </span>
                                                                </td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-center font-mono font-bold text-gray-900">{r.times_read}×</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-center font-mono">{r.page_count}</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 text-right font-mono font-bold text-gray-900">{formatCurrency(r.total_amount)}</td>
                                                                <td className="border-r border-slate-200 px-3 py-1.5 font-mono text-gray-500">{r.or_number}</td>
                                                                <td className="px-3 py-1.5 text-gray-400">{formatDate(r.created_at)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full no-print">
                                    <svg className="w-14 h-14 text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase">Select an English Critic</h3>
                                    <p className="text-gray-400 text-xs mt-1 max-w-[280px]">
                                        Choose a critic from the registry to see their individual certifications history and stats.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 3: Analytics Dashboard (Visual Graphs / Charts) ── */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6 no-print">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* SVG Pie/Donut Chart: Submissions by College */}
                            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 space-y-4">
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wide">Submissions by College</h3>
                                    <p className="text-xs text-gray-400">Distribution of encoded certifications per college.</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                                    {/* Donut SVG */}
                                    <div className="relative w-40 h-40 shrink-0">
                                        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 origin-center">
                                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                            {donutSegments.map((segment, i) => {
                                                const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#0ea5e9', '#f43f5e', '#ef4444'];
                                                const strokeColor = colors[i % colors.length];
                                                return (
                                                    <circle
                                                        key={segment.code}
                                                        cx="21"
                                                        cy="21"
                                                        r="15.91549430918954"
                                                        fill="transparent"
                                                        stroke={strokeColor}
                                                        className="transition-all duration-500"
                                                        strokeWidth="4.5"
                                                        strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                                                        strokeDashoffset={-segment.startPercent}
                                                    />
                                                );
                                            })}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xl font-black text-gray-900 leading-none">{totalSubmissionsCount}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Submits</span>
                                        </div>
                                    </div>

                                    {/* Legends */}
                                    <div className="flex-1 space-y-2 w-full">
                                        {donutSegments.map((c, i) => {
                                            const bgColors = [
                                                'bg-emerald-500',
                                                'bg-purple-500',
                                                'bg-amber-500',
                                                'bg-blue-500',
                                                'bg-sky-500',
                                                'bg-rose-500',
                                                'bg-red-500'
                                            ];
                                            const bgColor = bgColors[i % bgColors.length];
                                            return (
                                                <div key={c.code} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-gray-600 font-semibold">
                                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColor}`} />
                                                        <span>{c.code} ({c.count})</span>
                                                    </div>
                                                    <span className="font-extrabold text-gray-900">{c.percent.toFixed(0)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* SVG Column Chart: Total Earnings by College */}
                            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 space-y-4">
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wide">Earnings (₱) by College</h3>
                                    <p className="text-xs text-gray-400">Aggregated payment amounts processed per college.</p>
                                </div>

                                <div className="h-[220px] flex items-end justify-between gap-4 pt-6 border-b border-gray-100 pb-2">
                                    {analyticsData.colleges.map(c => {
                                        const maxAmount = Math.max(...analyticsData.colleges.map(x => x.amount), 1);
                                        const heightPercent = (c.amount / maxAmount) * 100;
                                        return (
                                            <div key={c.code} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                                <div className="text-[10px] font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatCurrency(c.amount)}
                                                </div>
                                                <div 
                                                    className="w-full bg-emerald-600 rounded-t-lg transition-all duration-500 hover:bg-emerald-700 shadow-inner"
                                                    style={{ height: `${heightPercent * 0.8}%` }}
                                                />
                                                <span className="text-[10px] font-black text-gray-500 tracking-wider mt-1">{c.code}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Horizontal breakdown: Document Types */}
                            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 space-y-4 md:col-span-2">
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wide">Document Type Distribution</h3>
                                    <p className="text-xs text-gray-400">Total count of manuscript formats checked by English critics.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {analyticsData.documentTypes.map(t => {
                                        return (
                                            <div key={t.label} className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-blue-900/10 border border-blue-900/20 flex items-center justify-center font-extrabold text-blue-900 text-xs">
                                                    {t.count}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{t.label}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold">{((t.count / combinedReports.length) * 100).toFixed(0)}% of total</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Aggregates Dashboard Visual Card */}
                            <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white shadow-md rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-5 -mt-5"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                                
                                <div className="space-y-1 z-10">
                                    <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest">Office of Curriculum & Instruction</span>
                                    <h3 className="text-base font-black tracking-wide leading-tight">CELLAR Analytics</h3>
                                </div>

                                <div className="space-y-3 mt-8 z-10">
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="text-xs font-medium text-blue-200">Accredited Critics Pool</span>
                                        <span className="text-xs font-black">{ALL_OFFICIAL_CRITICS.length} Active</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="text-xs font-medium text-blue-200">Total Submissions</span>
                                        <span className="text-xs font-black">{combinedReports.length} Records</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-medium text-blue-200">Total System Value</span>
                                        <span className="text-xs font-black">{formatCurrency(combinedReports.reduce((s, r) => s + parseFloat(r.total_amount ?? 0), 0))}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
