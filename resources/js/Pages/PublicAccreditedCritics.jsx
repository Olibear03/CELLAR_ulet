import { Head, Link } from '@inertiajs/react';

const CRITICS_DATA = [
    {
        college: 'College of Agriculture, Food, Environment, and Natural Resources',
        code: 'CAFENR',
        list: [
            'Mariedel M. Autriz',
            'Amyel Dale L. Cero',
            'Ma. Lourdes P. Gonzales',
            'Aitee Janelle B. Reterta',
            'Noel A. Sedigo',
            'Evelyn O. Singson',
            'Remelyn V. Concepcion'
        ]
    },
    {
        college: 'College of Arts and Sciences',
        code: 'CAS',
        list: [
            'Renato T. Agdalpen',
            'Racquel G. Agustin',
            'Renz Kevin M. Alcazar',
            'Ana Ruth M. Andalajao',
            'Joy N. Babaan',
            'Mariz S. Baybay',
            'Rosette Anne L. De Guzman',
            'Orlando B. Delos Reyes',
            'Armi Grace B. Desingaño',
            'Analyn T. Dico',
            'Bernard S. Feranil',
            'Bettina Joyce P. Ilagan',
            'Lisette D. Mendoza',
            'Catherine R. Mojica',
            'Regel L. Mozol',
            'Lynn G. Penales',
            'Manny A. Romeroso',
            'Ariel R. Rivera',
            'Allan Robert C. Solis',
            'Charita C. Troyo',
            'Agnes C. Francisco',
            'Julie Ann P. Atienza',
            'Marisol C. Crizaldo',
            'Shamdee Nahar-Cortes',
            'Marichu T. Benavides',
            'Liwayway P. Taglinao',
            'Lerry Anne A. Virtuso',
            'Cyrel B. Rodriguez',
            'Lloyd O. Balinado',
            'Ma. Veronica A. Peñaflorida',
            'Christine Polyanna H. Zabariza',
            'Ruby U. Matienzo',
            'Blessy Kaye S. Borcillo'
        ]
    },
    {
        college: 'College of Education',
        code: 'CED',
        list: [
            'Rhodora S. Crizaldo',
            'Marina P. Caudilla'
        ]
    },
    {
        college: 'College of Engineering and Information Technology',
        code: 'CEIT',
        list: [
            'Mary Joyce P. Alcazar',
            'Anabelle J. Almarez',
            'Renato B. Cubilla',
            'Ace Amiel E. Malicsi',
            'Ria Clarisse L. Mojica',
            'Marlon R. Pereña',
            'Mark Philip M. Sy',
            'Jefferson G. Rodriguez',
            'Dina P. Bawag'
        ]
    },
    {
        college: 'College of Economics, Management, and Development Studies',
        code: 'CEMDS',
        list: [
            'Lina C. Abogadie',
            'Maria Corazon A. Buena',
            'Florindo C. Ilagan',
            'Mary Grace A. Ilagan',
            'Tania Marie P. Melo',
            'Ma. Soledad M. Lising',
            'Rowena R. Noceda',
            'Thea Maries P. Perez',
            'Adora Joy T. Piete',
            'Patricia P. Sullano',
            'Clarisse Charmaine Beltran'
        ]
    },
    {
        college: 'College of Nursing',
        code: 'CON',
        list: [
            'Evelyn M. Del Mundo',
            'Karen Krista E. Cajilis'
        ]
    },
    {
        college: 'College of Veterinary Medicine and Biomedical Sciences',
        code: 'CVMBS',
        list: [
            'Alvin William A. Alvarez'
        ]
    }
];

export default function PublicAccreditedCritics() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
            <Head title="Accredited English Critics - Public Directory" />

            {/* ── Top Header Navigation Bar ── */}
            <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50 print:hidden shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="bg-blue-600 text-white p-2 rounded-lg transition-transform group-hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-base font-bold text-slate-900 block tracking-tight">CELLAR</span>
                            <span className="text-[10px] font-medium text-slate-500 block -mt-1">Public Directory</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-slate-900 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                            ← Home
                        </Link>
                        
                    </div>
                </div>
            </header>

            {/* ── Main Document Section ── */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 print:p-0">
                
                {/* Print button & page path (soft style) */}
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        CVSU Official Registry
                    </span>
                    
                </div>

                {/* Soft Document Container */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-10 shadow-sm print:shadow-none print:border-none print:p-0">
                    
                    {/* CVSTU Institution Header */}
                    <div className="text-center border-b border-slate-200 pb-6 mb-8">
                        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">Cavite State University</h1>
                        <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">Office of the Director for Curriculum and Instruction</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Don Severino de las Alas Campus, Indang, Cavite</p>
                        
                        <div className="mt-6">
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">LIST OF ACCREDITED ENGLISH CRITICS</h2>
                            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">As of December 15, 2025</p>
                        </div>
                    </div>

                    {/* Directory List per College */}
                    <div className="space-y-8">
                        {CRITICS_DATA.map((c) => (
                            <div key={c.code} className="space-y-3 page-break-inside-avoid">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200/60">
                                        {c.code}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                                        {c.college}
                                    </h3>
                                </div>

                                <div className="overflow-hidden border border-slate-100 rounded-xl">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                                <th className="py-2.5 px-4 w-12 text-center border-r border-slate-100 text-slate-400">#</th>
                                                <th className="py-2.5 px-4">Critic Name</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {c.list.map((name, i) => (
                                                <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                                                    <td className="py-2 px-4 text-center border-r border-slate-100 text-xs text-slate-400 font-mono">
                                                        {i + 1}
                                                    </td>
                                                    <td className="py-2 px-4 font-medium text-slate-800 text-xs sm:text-sm">
                                                        {name}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="text-center text-slate-400 text-[10px] py-6 border-t border-slate-200/60 bg-white font-bold tracking-widest uppercase mt-8 print:hidden">
                © {new Date().getFullYear()} CENTER FOR LANGUAGE-LEARNING AND RESEARCH OF CAVITE STATE UNIVERSITY
            </footer>
        </div>
    );
}
