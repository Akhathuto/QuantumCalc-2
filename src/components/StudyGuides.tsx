import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Bookmark, 
  Search, 
  Sparkles, 
  Calendar, 
  GraduationCap, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText,
  ChevronRight,
  BookmarkCheck,
  Award,
  BookMarked,
  Info
} from 'lucide-react';

export interface StudyGuideItem {
  id: string;
  grade: '10' | '11' | '12' | 'All';
  subject: string;
  title: string;
  description: string;
  fileSize: string;
  downloadUrl: string;
  topics: string[];
  paper?: 'Paper 1' | 'Paper 2' | 'Both';
}

const STUDY_GUIDES: StudyGuideItem[] = [
  // Mathematics
  {
    id: 'math-geom-trig',
    grade: '12',
    subject: 'Mathematics',
    title: 'Analytical Geometry & Trigonometry',
    description: 'Master coordinate calculations, circle equations, tangents, double-arg trig expansions, and solving 2D/3D problems.',
    fileSize: '8.4 MB',
    downloadUrl: 'https://www.education.gov.za/LinkClick.aspx?fileticket=78NtNlAd50w%3d&tabid=728&portalid=0&mid=2899&forcedownload=true',
    topics: ['Analytical Geometry', 'Circles', 'Trigonometric Identities', '2D & 3D Representations'],
    paper: 'Paper 2'
  },
  {
    id: 'math-euclidean-stats',
    grade: '12',
    subject: 'Mathematics',
    title: 'Euclidean Geometry & Statistics',
    description: 'Step-by-step proofs of similarity and proportionality theorems, circle geometry techniques, bivariate data regressions, and standard deviations.',
    fileSize: '11.2 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematics%20-%20Euclidean%20Geometry%20and%20Statistics%20Study%20Guide.pdf',
    topics: ['Similarity Theorem', 'Circle Geometry', 'Regression Lines', 'Scatter Plots & Bivariate Data'],
    paper: 'Paper 2'
  },
  {
    id: 'math-algebra-calculus',
    grade: '12',
    subject: 'Mathematics',
    title: 'Equations, Functions & Calculus',
    description: 'Essential revision of complex quadratic systems, cubic function graphing, first principles derivative rules, optimization, and financial annuities.',
    fileSize: '14.5 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematics%20-%20Equations%20and%20Inequalities%2c%20Functions%20and%20Calculus%20Study%20Guide.pdf',
    topics: ['Quadratic Formulae', 'Cubic Functions', 'Calculus Optimization', 'Financial Maths'],
    paper: 'Paper 1'
  },
  {
    id: 'math-series-probability',
    grade: '12',
    subject: 'Mathematics',
    title: 'Patterns, Sequences & Probability',
    description: 'Revision of arithmetic and geometric series, sigma notation, convergence, fundamental counting principles, contingency tables, and independent events probability.',
    fileSize: '9.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematics%20-%20Number%20Patterns%2c%20Sequences%20and%20Series%2c%20and%20Probability%20Study%20Guide.pdf',
    topics: ['Arithmetic Series', 'Geometric Sequences', 'Fundamental Counting', 'Venn Diagrams'],
    paper: 'Paper 1'
  },

  // Physical Sciences
  {
    id: 'ps-physics',
    grade: '12',
    subject: 'Physical Sciences',
    title: 'Physics Study Guide',
    description: 'Comprehensive CAPS analysis of Newton’s laws of motion, vertical projectile trajectories, work-energy-power equations, Doppler effect, and electrostatics.',
    fileSize: '12.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Physical%20Science%20-%20Physics%20Study%20Guide.pdf',
    topics: ['Newtonian Mechanics', 'Work & Energy', 'Doppler Effect', 'Electric Fields', 'Electrodynamics'],
    paper: 'Paper 1'
  },
  {
    id: 'ps-chemistry',
    grade: '12',
    subject: 'Physical Sciences',
    title: 'Chemistry Study Guide',
    description: 'Detailed organic nomenclature rules, reaction rate dynamic equilibria, acid-base neutralizations, and electrochemical cell calculations.',
    fileSize: '10.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Physical%20Science%20-%20Chemistry%20Study%20Guide.pdf',
    topics: ['Organic Chemistry', 'Reaction Rates', 'Chemical Equilibrium', 'Galvanic & Electrolytic Cells'],
    paper: 'Paper 2'
  },

  // Life Sciences
  {
    id: 'ls-genetics',
    grade: '12',
    subject: 'Life Sciences',
    title: 'Genetics & Inheritance',
    description: 'Monohybrid and dihybrid genetic crosses, sex link disorders, DNA profiling, and essential genetic engineering explanations.',
    fileSize: '6.7 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Life%20Sciences%20Genetics%20Study%20Guide.pdf',
    topics: ['Mendelian Genetics', 'Genetic Crosses', 'Pedigree Diagrams', 'Mutation & Genetic Engineering'],
    paper: 'Paper 2'
  },
  {
    id: 'ls-meiosis',
    grade: '12',
    subject: 'Life Sciences',
    title: 'Meiosis & Homeostasis',
    description: 'Visual breakdown of the stages of meiosis, non-disjunction conditions (Down Syndrome), and dynamic negative feedback endocrine systems.',
    fileSize: '7.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Life%20Sciences%20Meiosis%20Study%20Guide.pdf',
    topics: ['First & Second Meiotic Division', 'Endocrine System', 'Thermoregulation & Blood Sugar Control'],
    paper: 'Paper 1'
  },
  {
    id: 'ls-evolution',
    grade: '12',
    subject: 'Life Sciences',
    title: 'Evolution & Homology',
    description: 'Exploring theories of evolution (Lamarckism, Darwinism), speciation, and hominid structural fossil evidence.',
    fileSize: '9.2 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Life%20Sciences%20Evolution%20Study%20Guide.pdf',
    topics: ['Natural Selection', 'Speciation Processes', 'Human Evolution fossils', 'Ape vs Human anatomy'],
    paper: 'Paper 2'
  },

  // Mathematical Literacy
  {
    id: 'ml-finance',
    grade: '12',
    subject: 'Mathematical Literacy',
    title: 'Finance & Taxation',
    description: 'Practical calculation of payslips, income tax brackets (SARS), interest compounding, personal budgeting, and loan repayments.',
    fileSize: '9.3 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematical%20Literacy%20Finance%20-%20Study%20Guide.pdf',
    topics: ['Inflow & Outflow', 'SARS Income Tax', 'Compound Interest Rates', 'Budget Sheets'],
    paper: 'Paper 1'
  },
  {
    id: 'ml-maps-measurement',
    grade: '12',
    subject: 'Mathematical Literacy',
    title: 'Maps, Plans & Measurements',
    description: 'Understanding bar and numeric map scales, standard multi-story floor plans, surface area of tanks, volume limits, and packaging rates.',
    fileSize: '11.5 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematical%20Literacy%20Maps%20Measurements%20-%20Study%20Guide.pdf',
    topics: ['Map Scales', 'Floor layouts', 'Volume & Surface Area', 'Conversion Factors'],
    paper: 'Paper 2'
  },
  {
    id: 'ml-data-probability',
    grade: '12',
    subject: 'Mathematical Literacy',
    title: 'Data Handling & Probability',
    description: 'Unpacking mean, median, mode calculations, IQR, box-and-whisker plots, probability trees, and standard risk evaluation scenarios.',
    fileSize: '7.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Mathematical%20Literacy%20Data%20Handling%20-%20Study%20Guide.pdf',
    topics: ['Measures of Central Tendency', 'Interquartile Ranges', 'Data Representation', 'Probability Trees'],
    paper: 'Paper 1'
  },

  // Geography
  {
    id: 'geo-maps',
    grade: '12',
    subject: 'Geography',
    title: 'Mapwork & Climate Geomorphology',
    description: 'Step-by-step topographic and orthophoto map-reading, GIS concepts, valley climates, coastal low-pressure cells, and fluvial landscape drainage.',
    fileSize: '15.2 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Geography%20Maps%20Study%20Guide.pdf',
    topics: ['Synoptic Weather Maps', 'Topographic Landscapes', 'Geographical Information Systems (GIS)', 'Fluvial Geomorphology'],
    paper: 'Paper 2'
  },
  {
    id: 'geo-settlement',
    grade: '12',
    subject: 'Geography',
    title: 'Settlement & Economic Geography',
    description: 'Rural and urban settlement structures, urban land-use zones, primary economic sectors of South Africa, and industrial development zones (IDZs).',
    fileSize: '13.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Geography%20Rural%20and%20Urban%20Settlements%20Study%20Guide.pdf',
    topics: ['Urban Land Use Mapwork', 'Socio-Economic Challenges', 'Reconstruction Programs', 'Industrial IDZs'],
    paper: 'Paper 1'
  },

  // Accounting
  {
    id: 'acc-balance',
    grade: '12',
    subject: 'Accounting',
    title: 'Balance Sheet & Financial Analysis',
    description: 'Structuring formal adjustments, calculating net trade debts, liquid ratios, cash flow statements, and comprehensive standard audits.',
    fileSize: '10.2 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Accounting%20-%20Balance%20Sheet%20Study%20Guide.pdf',
    topics: ['Adjustments ledger', 'Auditors reports', 'Ratio analysis', 'Cash Flow Analysis'],
    paper: 'Paper 1'
  },
  {
    id: 'acc-cost-budget',
    grade: '12',
    subject: 'Accounting',
    title: 'Cost Accounting & Cash Budgets',
    description: 'Practical guide to manufacturing ledger control, cost allocations, break-even analyses, debtors recovery profiles, and cash flow forecasting.',
    fileSize: '8.7 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Accounting%20-%20Cost%20Accounting%20and%20Budgeting%20Study%20Guide.pdf',
    topics: ['Manufacturing Accounts', 'Break-even Point', 'Cash Budget Analysis', 'Debtors Collection'],
    paper: 'Paper 2'
  },

  // Business Studies
  {
    id: 'bs-legislation',
    grade: '12',
    subject: 'Business Studies',
    title: 'Legislation, HR & Quality of Performance',
    description: 'Analysis of key laws like COIDA, Skills Development, Employment Equity Act, recruitment/induction channels, and quality management subsystems.',
    fileSize: '11.4 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Business%20Studies%20-%20Legislation%2c%20HR%20and%20Quality%20of%20Performance%20Study%20Guide.pdf',
    topics: ['Employment Equity Act', 'Human Resource Management', 'COID Insurance', 'Quality Control Systems'],
    paper: 'Paper 1'
  },
  {
    id: 'bs-ventures-roles',
    grade: '12',
    subject: 'Business Studies',
    title: 'Business Ventures & Creative Roles',
    description: 'Analyzing investments (forms and rates), management styles, leadership theories, dispute resolution, creative problem-solving, and corporate ethics.',
    fileSize: '9.5 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Business%20Studies%20-%20Business%20Ventures%20and%20Creative%20Roles%20Study%20Guide.pdf',
    topics: ['Investment options', 'Leadership Theories', 'Conflict Resolution', 'CSR and Ethics'],
    paper: 'Paper 2'
  },

  // Economics
  {
    id: 'econ-macro',
    grade: '12',
    subject: 'Economics',
    title: 'Macroeconomics & Business Cycles',
    description: 'Study of public sector participation, foreign exchange models, business cycles, multiplier formulas, and national accounting aggregates revision.',
    fileSize: '12.4 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Economics%20-%20Macroeconomics%20and%20Business%20Cycles%20Study%20Guide.pdf',
    topics: ['Circular Flow model', 'Foreign Exchange', 'Multiplier Principle', 'GDP aggregates'],
    paper: 'Paper 1'
  },
  {
    id: 'econ-micro',
    grade: '12',
    subject: 'Economics',
    title: 'Microeconomics & Market Structures',
    description: 'Deep dive into perfect and imperfect market structures, monopoly pricing, oligopolies, monopolistic competition, and market failures remediation.',
    fileSize: '10.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Economics%20-%20Microeconomics%20and%20Market%20Structures%20Study%20Guide.pdf',
    topics: ['Perfect Competition', 'Monopolies', 'Market Failures', 'Oligopoly Behavior'],
    paper: 'Paper 2'
  },

  // Technical Tech & Sciences (Technical Maths / Technical Sciences)
  {
    id: 'tech-maths',
    grade: '12',
    subject: 'Technical Mathematics',
    title: 'Functions, Calculus & Integration',
    description: 'Focus on technical geometry, argand diagrams, complex numbers, integration of exponential functions, and rates of change in industrial dynamics.',
    fileSize: '13.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Technical%20Mathematics%20Functions%2c%20Calculus%20and%20Integration%20Study%20Guide.pdf',
    topics: ['Argand Diagrams', 'Exponential integrals', 'Technical Geometry', 'Complex numbers'],
    paper: 'Both'
  },
  {
    id: 'tech-sciences',
    grade: '12',
    subject: 'Technical Sciences',
    title: 'Mechanics, Fluids & Electrochemistry',
    description: 'Revised laws of mechanical torque, fluids dynamics, viscosity, hydraulic lifts, electronics, semiconductors, and galvanic electroplate cells.',
    fileSize: '11.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Technical%20Sciences%20Mechanics%2520and%2520Fluids%2520Study%2520Guide.pdf',
    topics: ['Hydraulic systems', 'Semiconductors', 'Mechanical Torque', 'Electrochemistry cells'],
    paper: 'Both'
  },

  // Agricultural Sciences
  {
    id: 'agri-sciences',
    grade: '12',
    subject: 'Agricultural Sciences',
    title: 'Animal Nutrition & Genetics',
    description: 'Revision of feed digestion profiles, internal anatomy of ruminants vs monogastric farm stock, breeding technologies, and livestock genetics pedigree.',
    fileSize: '9.9 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Agricultural%20Sciences%20Animal%2520Nutrition%2520Study%2520Guide.pdf',
    topics: ['Ruminant Digestion', 'Nutrient Digestibility', 'Livestock breeding', 'Genetics pedigree'],
    paper: 'Paper 1'
  },

  // Computer Applications Technology (CAT)  
  {
    id: 'cat-theory',
    grade: '12',
    subject: 'Computer Applications Technology',
    title: 'System Technologies & Networks',
    description: 'Review of hardware architectures, network setups, internet protocols, cloud computing systems, database integration, and security/malware controls.',
    fileSize: '11.0 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Computer%20Applications%20Technology%20-%20Theory%20Study%20Guide.pdf',
    topics: ['System Technologies', 'Local Area Networks', 'Software types', 'Cloud systems and security'],
    paper: 'Paper 2'
  },
  {
    id: 'it-programming',
    grade: '12',
    subject: 'Information Technology',
    title: 'Software Development & SQL databases',
    description: 'Deep revision of software design patterns, object-oriented principles, array and text manipulation algorithms, relational databases, and SQL query filters.',
    fileSize: '12.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Information%20Technology%20-%20OOP%20and%20SQL%20Study%20Guide.pdf',
    topics: ['Object Oriented Programing', 'SQL Queries', 'Multidimensional Arrays', 'Sorting Algorithms'],
    paper: 'Paper 1'
  },

  // English First Additional Language (FAL)
  {
    id: 'eng-fal-writing',
    grade: '12',
    subject: 'English First Additional Language',
    title: 'Essay Writing & Transactional Texts',
    description: 'Format checklists and revision guides for argumentative/narrative essays, CV layouts, formal letters of complaint, email ethics, and reviews.',
    fileSize: '5.2 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/English%20First%20Additional%20Language%20-%20Writing%20Essays%20Study%20Guide.pdf',
    topics: ['Narrative & Discursive structures', 'Formal Letters', 'Curriculum Vitae structure', 'Transactional rules'],
    paper: 'Paper 3'
  },

  // Tourism
  {
    id: 'tourism-guide',
    grade: '12',
    subject: 'Tourism',
    title: 'Tourism Attractions & Forex calculations',
    description: 'Revision of world attractions, global time zones calculation, currency exchange rate conversion formulas, sustainable tourism, and tourist safety policies.',
    fileSize: '9.1 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/Tourism%20-%20Study%20Guide.pdf',
    topics: ['Global Time Zones', 'World Heritage Sites', 'Currency conversion calculations', 'Sustainable Tourism'],
    paper: 'Both'
  },

  // History
  {
    id: 'hist-sources',
    grade: '12',
    subject: 'History',
    title: 'Source-Based & Essay Questions',
    description: 'Learn critical historical analysis of source biases, formulating thesis arguments, and structured Cold War, Black Power, or African independence essays.',
    fileSize: '4.8 MB',
    downloadUrl: 'https://www.education.gov.za/Portals/0/CD/Computer/Self%20Study%20Guides%20Grade%2010%20-%2012/History/History%20Source-based%20questions%20Study%20Guide%20-%20Grade%2010-12.pdf',
    topics: ['Cold War proxy conflicts', 'Civil Rights Movement', 'Apartheid resistance', 'Source analysis bias'],
    paper: 'Both'
  }
];

export const StudyGuides: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'All' | '10' | '11' | '12'>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Track user study book state: e.g. Record<guideId, 'not_started' | 'in_progress' | 'completed'>
  const [userStatus, setUserStatus] = useState<Record<string, 'not_started' | 'in_progress' | 'completed'>>(() => {
    try {
      const stored = localStorage.getItem('quantumStudyGuidesStatus');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'completed'>('all');

  // Days left to typical NSC South African Matric exams starting ~October 20th
  const getExamCountdown = () => {
    const examDate = new Date('2026-10-20T08:00:00Z');
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    if (diffTime <= 0) {
      return { days: 0, text: 'Exam period is active!' };
    }
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days, text: `${days} days left until standard NSC Matric Examinations` };
  };

  const countdown = getExamCountdown();

  // Unique list of subjects in guides
  const subjects = ['All', ...Array.from(new Set(STUDY_GUIDES.map(item => item.subject)))];

  // Save progress changes
  const updateGuideStatus = (id: string, status: 'not_started' | 'in_progress' | 'completed') => {
    const nextStatus = { ...userStatus, [id]: status };
    setUserStatus(nextStatus);
    try {
      localStorage.setItem('quantumStudyGuidesStatus', JSON.stringify(nextStatus));
      if (status === 'completed') {
        showToast("Study guide marked as fully completed!");
      } else if (status === 'in_progress') {
        showToast("Study guide bookmarked and in-progress.");
      } else {
        showToast("Bookmark removed from study guide.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredGuides = STUDY_GUIDES.filter((guide) => {
    const matchesSearch = 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade = selectedGrade === 'All' || guide.grade === selectedGrade || guide.grade === 'All';
    const matchesSubject = selectedSubject === 'All' || guide.subject === selectedSubject;
    
    const guideState = userStatus[guide.id] || 'not_started';
    const matchesStatusTab = 
      activeTab === 'all' ||
      (activeTab === 'bookmarks' && guideState === 'in_progress') ||
      (activeTab === 'completed' && guideState === 'completed');

    return matchesSearch && matchesGrade && matchesSubject && matchesStatusTab;
  });

  // Calculate high-level progress statistics
  const bookmarkedCount = Object.values(userStatus).filter(s => s === 'in_progress').length;
  const completedCount = Object.values(userStatus).filter(s => s === 'completed').length;
  const totalCount = STUDY_GUIDES.length;
  const coveragePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 text-brand-text animate-fade-in" id="dbe_self_study_guides_page">
      {/* South African Department of Basic Education Curriculum Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-surface/50 to-brand-bg border border-brand-border/40 rounded-[2.5rem] p-6 md:p-10 shadow-xl">
        {/* Artistic glowing backings */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl">
            <GraduationCap size={14} /> National Department of Basic Education (DBE) Support
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
            High School <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">Self-Study Guides</span>
          </h1>

          <p className="text-brand-text-secondary text-sm md:text-base font-light leading-relaxed max-w-2xl">
            Access official, curriculum-aligned study guides for Grades 10 - 12 (CAPS syllabus). Developed by the South African National Education Department to support learners during independent exam revision, homework preparation, and final test sequences.
          </p>

          <div className="flex flex-wrap gap-4 pt-3 items-center">
            {countdown.days > 0 ? (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold animate-pulse">
                <Calendar size={14} /> {countdown.text}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                <CheckCircle2 size={14} /> {countdown.text}
              </div>
            )}

            <a 
              href="https://www.education.gov.za/SelfStudyGuidesGrade1012/tabid/728/Default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-brand-primary hover:text-white transition-colors cursor-pointer"
            >
              Official DBE Portal <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Grid containing Quick Tracker Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coverage Progress Card */}
        <div className="p-5 bg-brand-surface/30 border border-brand-border/40 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary leading-none block">Guide Completion</span>
            <div className="text-2xl font-black font-mono text-brand-primary">{coveragePercent}%</div>
            <span className="text-xs text-brand-text-secondary font-light block leading-none">{completedCount} of {totalCount} Syllabus modules completed</span>
          </div>
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 shadow-sm" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" className="stroke-brand-border/20 fill-none" strokeWidth="3.5" />
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                className="stroke-brand-primary fill-none transition-all duration-700" 
                strokeWidth="3.5" 
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 - (coveragePercent / 100) * (2 * Math.PI * 16)}
                strokeLinecap="round"
              />
            </svg>
            <Award size={18} className="absolute text-brand-primary" />
          </div>
        </div>

        {/* Current Bookmarked Targets */}
        <div className="p-5 bg-brand-surface/30 border border-brand-border/40 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
            <BookMarked size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary leading-none block mb-1">Active Study Desk</span>
            <div className="text-xl font-mono font-black text-amber-500">{bookmarkedCount} Active Guides</div>
            <span className="text-xs text-brand-text-secondary font-light leading-snug">Bookmarked and currently in progress</span>
          </div>
        </div>

        {/* Study tips advice */}
        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 leading-none block mb-1">Curriculum Tip</span>
            <div className="text-sm font-bold text-brand-text">Focus on High-Yield topics!</div>
            <span className="text-xs text-brand-text-secondary font-light leading-snug">Euclidean theorems, electrostatics, and stoichiometry yield 60%+ points in final papers.</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter, Search, and Status Tab Control Row */}
      <div className="bg-brand-surface/20 p-5 rounded-3xl border border-brand-border/30 space-y-4">
        {/* Primary Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Active status navigation Tabs (All / Desk / Finished) */}
          <div className="flex bg-brand-bg/50 border border-brand-border/40 p-1 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-black uppercase rounded-xl cursor-pointer transition-all ${
                activeTab === 'all' 
                  ? 'bg-brand-primary text-brand-bg shadow-sm' 
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              All Support Guides
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 text-xs font-black uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'bookmarks' 
                  ? 'bg-amber-500 text-brand-bg shadow-sm' 
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              <Bookmark size={12} className={activeTab === 'bookmarks' ? "fill-brand-bg" : ""} />
              Study Desk ({bookmarkedCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-xs font-black uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'completed' 
                  ? 'bg-emerald-500 text-brand-bg shadow-sm' 
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              <CheckCircle2 size={12} />
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search guides, topics (e.g. geometry, cells, SARS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border/50 text-brand-text text-xs rounded-xl focus:outline-none focus:border-brand-primary font-medium"
            />
          </div>
        </div>

        {/* Secondary Filter options: Grade & Subject */}
        <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-brand-border/20">
          {/* Grade trigger buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary flex items-center gap-1">
              <Filter size={10} /> Grade level:
            </span>
            <div className="flex bg-brand-bg/40 border border-brand-border/30 rounded-xl p-0.5">
              {(['All', '10', '11', '12'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all ${
                    selectedGrade === grade
                      ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary'
                      : 'text-brand-text-secondary hover:text-brand-text border border-transparent'
                  }`}
                >
                  {grade === 'All' ? 'All Grades' : `Gr. ${grade}`}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary flex items-center gap-1">
              <BookOpen size={10} /> Subject field:
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-brand-bg border border-brand-border/40 text-brand-text-secondary text-[11px] font-bold py-1 px-2.5 rounded-xl focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'All' ? 'All Subjects' : sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog items display list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dbe_self_study_guides_catalog_grid">
        <AnimatePresence mode="popLayout">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => {
              const guideState = userStatus[guide.id] || 'not_started';
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={guide.id}
                  className="bg-brand-surface/40 p-5 rounded-[2rem] border border-brand-border/50 flex flex-col justify-between hover:border-brand-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="space-y-3.5">
                    {/* Badge details */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
                          {guide.subject}
                        </span>
                        {guide.grade !== 'All' ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase bg-violet-500/10 text-violet-400 border border-violet-500/10">
                            Gr. {guide.grade}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/10">
                            Gr. 10-12
                          </span>
                        )}
                      </div>

                      {/* Display paper parameter if defined */}
                      {guide.paper && (
                        <span className="text-[10px] font-semibold text-brand-text-secondary/70">
                          {guide.paper}
                        </span>
                      )}
                    </div>

                    {/* Title and descriptions */}
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-brand-text tracking-tight group-hover:text-brand-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-brand-text-secondary leading-normal font-light">
                        {guide.description}
                      </p>
                    </div>

                    {/* Key exam topics chips */}
                    <div className="space-y-1.5 pt-2 border-t border-brand-border/25">
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-secondary/80 block">Key Capsule Topics</span>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.topics.map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-brand-bg/50 border border-brand-border/40 text-brand-text text-[9px] rounded-lg tracking-tight font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & trackers Footer */}
                  <div className="space-y-4 pt-4 mt-4 border-t border-brand-border/25">
                    {/* Status selection and size tracker */}
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-[10px] text-brand-text-secondary font-mono leading-none flex items-center gap-1">
                        <FileText size={11} /> {guide.fileSize}
                      </span>

                      {/* Control buttons representing local desk persistence */}
                      <div className="flex items-center gap-1">
                        {/* Bookmark button toggles Desk */}
                        <button
                          onClick={() => updateGuideStatus(
                            guide.id, 
                            guideState === 'in_progress' ? 'not_started' : 'in_progress'
                          )}
                          title={guideState === 'in_progress' ? 'Remove from Desk' : 'Bookmark to Desk'}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            guideState === 'in_progress'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                              : 'bg-transparent border-brand-border/40 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary'
                          }`}
                        >
                          {guideState === 'in_progress' ? <BookmarkCheck size={14} className="fill-amber-500" /> : <Bookmark size={14} />}
                        </button>

                        {/* Completed status button */}
                        <button
                          onClick={() => updateGuideStatus(
                            guide.id, 
                            guideState === 'completed' ? 'not_started' : 'completed'
                          )}
                          title={guideState === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            guideState === 'completed'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-transparent border-brand-border/40 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary'
                          }`}
                        >
                          <CheckCircle2 size={14} className={guideState === 'completed' ? 'text-emerald-400 fill-emerald-400/10' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Download buttons row */}
                    <div className="grid grid-cols-1 gap-2">
                      <a
                        href={guide.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (guideState === 'not_started') {
                            updateGuideStatus(guide.id, 'in_progress');
                          }
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase bg-brand-primary text-brand-bg hover:bg-white border border-transparent shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer"
                      >
                        <Download size={13} /> Download Study Guide
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border border-dashed border-brand-border/60 flex items-center justify-center mx-auto text-brand-text-secondary">
                <BookOpen size={20} />
              </div>
              <h4 className="text-base font-bold text-brand-text">No self-study guides found</h4>
              <p className="text-xs text-brand-text-secondary max-w-sm mx-auto font-light leading-relaxed">
                Try clearing your text filters, selected grades, or switching status tabs to display DBE curriculum documents.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Curriculum support guidelines */}
      <div className="bg-brand-surface/20 border border-brand-border/50 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-primary flex items-center gap-1.5">
            <Info size={12} /> Study Desk Guidelines
          </span>
          <h4 className="text-base font-black text-brand-text">How to utilize these self-study materials</h4>
          <p className="text-xs text-brand-text-secondary leading-snug font-light">
            Each syllabus module provided contains comprehensive CAPS summary content, detailed step-by-step calculations with margin notes, and standard exam-type revision worksheets. Download the guides to your local computer, bookmark active packets to your <strong>Study Desk</strong>, and mark completed files to track your readiness for final examination benchmarks securely!
          </p>
        </div>
        <div className="md:col-span-4 flex justify-start md:justify-end">
          <a
            href="https://www.education.gov.za/SelfStudyGuidesGrade1012/tabid/728/Default.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-bg border border-brand-border/60 hover:border-brand-primary/30 text-xs font-black uppercase tracking-wider text-brand-text-secondary hover:text-brand-text cursor-pointer transition-all"
          >
            DBE Official Website <ChevronRight size={14} className="text-brand-primary" />
          </a>
        </div>
      </div>

      {/* Toast Notification overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-surface border border-brand-primary/30 text-white text-xs rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm"
          >
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
