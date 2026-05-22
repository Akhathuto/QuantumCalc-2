import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  LineChart, 
  Beaker, 
  FlaskConical,
  Scale, 
  Binary, 
  Landmark, 
  HeartPulse,
  Code,
  GraduationCap,
  ArrowRight,
  History,
  Lightbulb,
  Search,
  Type,
  Calendar,
  Coins,
  ArrowRightLeft,
  Printer,
  Award
} from 'lucide-react';
import { AppTab, HistoryEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { ScholarCounter } from './ScholarCounter';

interface LandingPageProps {
  onTabClick: (tabId: AppTab) => void;
  history: HistoryEntry[];
  onLoginClick: () => void;
}

const toolCategories = [
  {
    name: 'Scientific Calculations',
    tools: [
      { id: 'calculator', name: 'Unified Calculator', desc: 'Powerful multi-modal expression parser & algebra engine.', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'graphing', name: 'Analytical Grapher', desc: 'Plot 2D equations in real-time with custom scale intervals.', icon: LineChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { id: 'math-tools', name: 'Advanced Algebra Suite', desc: 'Solve complex linear matrices, calculus polynomial limits.', icon: Beaker, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'periodic', name: 'Interactive Periodic Table', desc: 'Visualize atomic shells, weights, and isotope values.', icon: FlaskConical, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ]
  },
  {
    name: 'Classrooms, Tutors & Scholars',
    tools: [
      { id: 'k5worksheets', name: 'K-5 Homework Studio', desc: 'Generate seedable high-contrast homework sheets with custom grids, school notes, and separate printed answer sheets.', icon: Printer, color: 'text-pink-500', bg: 'bg-pink-500/10', badge: 'Popular' },
      { id: 'exercises', name: 'Curriculum Drills Arena', desc: 'Topic-by-topic drills, adaptive test sets, score stars & diploma awards.', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10', badge: 'Hot' },
      { id: 'student', name: 'AI Scholar Coach', desc: 'Prompt the custom academic assistant for proof formulas & learning guides.', icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
      { id: 'history', name: 'Formula & Execution Logs', desc: 'Audit and restore previous calculations, export lists, and favorite items.', icon: History, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    ]
  },
  {
    name: 'Everyday & Business Solvers',
    tools: [
      { id: 'financial', name: 'Capital & Mortgage Estimator', desc: 'Amortize mortgages, forecast compound interests & business savings.', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { id: 'units', name: 'Universal Measurement Converter', desc: 'Convert engineering dimensions like Torque, Speed, and Frequency.', icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      { id: 'currency', name: 'Live Currencies Arbitrage', desc: 'Exchange ratios with automatic live global currency tickers.', icon: Coins, color: 'text-green-500', bg: 'bg-green-500/10' },
      { id: 'health', name: 'Thermodynamics & Health', desc: 'Examine BMI index metrics, BMR caloric multipliers and hydration guides.', icon: HeartPulse, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { id: 'date', name: 'Temporal Date Interval Calc', desc: 'Compare exact calendar spans, time durations, and custom business intervals.', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ]
  },
  {
    name: 'Engineering & Bits',
    tools: [
      { id: 'programmer', name: 'Bitwise Programmer Calc', desc: 'Binary, Hex, Octal manipulations with simulated register feeds.', icon: Binary, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { id: 'base', name: 'Radix Conversion Tool', desc: 'Convert variables across numeral bases smoothly ranging from 2 to 64.', icon: ArrowRightLeft, color: 'text-orange-400', bg: 'bg-orange-400/10' },
      { id: 'developer', name: 'Developer Utilities', desc: 'JWT inspectors, secure bcrypt hashes, and JSON syntactic syntax trees.', icon: Code, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      { id: 'text', name: 'Text Analytics Workspace', desc: 'Character metrics, base64 converters, regex trials & markdown.', icon: Type, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    ]
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick, onLoginClick }) => {
  const { user, userData, totalScholars } = useAuth();
  const [mathFact, setMathFact] = useState<string>('Loading a brain-teasing fact...');
  const [isLoadingFact, setIsLoadingFact] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getGreeting = () => {
    if (!userData?.role) return `Hello, ${user?.displayName?.split(' ')[0] || 'Explorer'}.`;
    
    const name = user?.displayName?.split(' ')[0] || 'User';
    switch (userData.role) {
      case 'student': return `Ready to learn, ${name}?`;
      case 'teacher': return `Class is in session, ${name}.`;
      case 'business_owner': return `Strategy time, ${name}.`;
      case 'employee': return `Getting it done, ${name}.`;
      default: return `Welcome back, ${name}.`;
    }
  };

  const filteredCategories = toolCategories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.tools.length > 0);

  useEffect(() => {
    const fetchFact = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Provide a one-sentence fun and surprising fact about mathematics, physics, or productivity. Keep it engaging and concise.",
        });
        setMathFact(response.text || 'Mathematics is the language of the universe.');
      } catch (error) {
        setMathFact('A googol is the number 1 followed by 100 zeros.');
      } finally {
        setIsLoadingFact(false);
      }
    };

    fetchFact();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8 pt-16 pb-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm"
        >
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          <GraduationCap size={14} /> QuantumCalc Workspace
        </motion.div>

        <div className="flex justify-center mb-4">
          <ScholarCounter />
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-text leading-[1.1] max-w-4xl"
        >
          Solve complex problems <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-secondary inline-block transform hover:scale-105 transition-transform duration-300">
            step-by-step.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-brand-text-secondary text-lg md:text-2xl font-light max-w-2xl leading-relaxed"
        >
          {getGreeting()} <br className="hidden md:block" />
          Your unified workspace for mathematics, science, and development.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md mx-auto mt-8 flex flex-col items-center gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={() => onTabClick('calculator')}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-brand-primary text-brand-bg rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-brand-primary/30 outline-none focus:ring-4 focus:ring-brand-primary/50"
            >
              Start Calculating <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onTabClick('exercises')}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border text-brand-text rounded-full font-bold text-base hover:bg-brand-primary/5 active:scale-95 transition-all shadow-sm outline-none focus:ring-4 focus:ring-brand-border"
            >
              Practice Drills
            </button>
          </div>
          <div className="relative w-full group mt-2">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-brand-surface border border-brand-border rounded-full p-2 shadow-2xl">
              <Search size={20} className="text-brand-text-secondary ml-3" />
              <input 
                type="text" 
                placeholder="Search workspaces... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full py-2 px-3 text-brand-text placeholder-brand-text-secondary/50 font-medium"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Dynamic Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20"
      >
        {/* Main AI Teaser */}
        <motion.div 
          variants={itemVariants}
          onClick={() => onTabClick('student')}
          className="md:col-span-8 bg-gradient-to-br from-brand-surface to-brand-bg rounded-[32px] p-8 md:p-12 border border-brand-border/50 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-brand-primary/20 transition-colors duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest w-max mb-6 border border-brand-primary/10">
              <GraduationCap size={14} /> AI Problem Solver
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4 tracking-tight leading-[1.1]">
              {userData?.school ? `Solve anything at ${userData.school}.` : 'Access the AI Math Workspace.'}
            </h2>
            <p className="text-brand-text-secondary text-lg md:text-xl max-w-md mb-8 leading-relaxed font-light">
              {userData?.grade ? `Optimized for ${userData.grade}. ` : ''}Type equations, ask questions, and let the QuantumCalc Engine guide you step-by-step.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClick('student');
                }}
                className="bg-brand-text text-brand-bg px-8 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 outline-none focus:ring-2 focus:ring-brand-primary shadow-lg shadow-brand-text/10"
              >
                Open Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Fact of the day */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-4 bg-brand-surface/80 backdrop-blur-sm rounded-[32px] p-8 border border-brand-border/50 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <div className="p-2 bg-brand-secondary/10 rounded-full text-brand-secondary">
                <Lightbulb size={20} />
              </div>
              <h3 className="font-bold text-xs tracking-widest uppercase">Insight</h3>
            </div>
          </div>
          
          <div className="flex-grow flex items-center relative z-10">
            <AnimatePresence mode="wait">
              {isLoadingFact ? (
                <motion.div key="loader" className="space-y-4 w-full">
                  <div className="h-4 bg-brand-border/50 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-brand-border/50 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-brand-border/50 rounded-full w-4/6 animate-pulse" />
                </motion.div>
              ) : (
                <motion.p 
                  key="fact"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-brand-text text-xl font-serif italic leading-relaxed font-medium"
                >
                  "{mathFact}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-8 pt-6 border-t border-brand-border/30 flex items-center justify-between">
             <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-semibold">Fact of the moment</p>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-brand-primary">{totalScholars?.toLocaleString()} Scholars Reading</span>
             </div>
          </div>
        </motion.div>

        {/* Featured K5 Homework Banner */}
        <motion.div 
          variants={itemVariants}
          onClick={() => onTabClick('k5worksheets')}
          className="md:col-span-12 lg:col-span-7 bg-gradient-to-br from-teal-950/10 via-zinc-900/10 to-emerald-950/10 rounded-[32px] p-8 md:p-10 border border-emerald-500/25 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1 text-left"
        >
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest w-max mb-5 border border-emerald-500/10">
                <Printer size={13} /> Homework Studio
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-brand-text mb-3 tracking-tight">
                Elementary K-5 Homework Builder
              </h3>
              <p className="text-brand-text-secondary text-sm max-w-xl mb-6 leading-relaxed font-light">
                Generate seedable high-contrast homework sheets instantly. Tailor printable settings: input custom school names, custom teacher directions, toggle dynamic grid layouts (including handwriting lines, coordinate plane charts, dots, or blank), and print separate Answer Keys automatically.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:underline">
              <span>Open Homework Studio</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

        {/* Featured Practice Arena Banner */}
        <motion.div 
          variants={itemVariants}
          onClick={() => onTabClick('exercises')}
          className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-amber-950/10 via-zinc-900/10 to-orange-950/10 rounded-[32px] p-8 border border-amber-500/25 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-1 text-left"
        >
          <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-amber-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest w-max mb-5 border border-amber-500/10">
                <Award size={13} /> Curriculum Practice Arena
              </div>
              <h3 className="text-2xl font-extrabold text-brand-text mb-3 tracking-tight">
                Practice exams &amp; Diplomas
              </h3>
              <p className="text-brand-text-secondary text-xs mb-6 leading-normal font-light">
                Drill curriculum-aligned exercises covering multiplication, fractions, geometry, and calculus. Earn gold stars, track your progress, check dynamic step-by-step math proof guides, and strive to acquire the official Scholar's Graduation Diploma!
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:underline">
              <span>Enter Practice Arena</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Core Capabilities Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
      >
        <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/50 text-left hover:border-brand-primary/30 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Calculator size={24} />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-3">Universal Computing</h3>
          <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
            From basic math to complex matrix algebra, polynomial limits, and bitwise programming tools. A unified engine designed for precision, speed, and deep analytical parsing.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/50 text-left hover:border-brand-primary/30 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-3">Academic Excellence</h3>
          <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
            Perfect for scholars & educators. Instantly generate printable K-5 Math worksheets with customized answer keys, or jump into adaptive drills to earn achievements.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/50 text-left hover:border-brand-primary/30 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <LineChart size={24} />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-3">Real-time Visuals</h3>
          <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
            Create vivid 2D coordinate graphs, explore interactive periodic tables, and track live currency exchange rates. Data beautifully visualized on any device.
          </p>
        </motion.div>
      </motion.div>

      {/* Categories / Modules */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 bg-brand-surface border border-brand-border/50 rounded-[32px] p-8 md:p-12 shadow-sm text-left"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-brand-border/50">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-2 animate-fade-in">
              {searchQuery ? 'Search Results' : 'Comprehensive Module Categories'}
            </h2>
            <p className="text-brand-text-secondary text-sm">Explore specialized features for schools, code parsing, geometry, matrix math, health, and financials.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {filteredCategories.map((category, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                {category.name}
              </h3>
              <div className="flex flex-col gap-4">
                {category.tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => onTabClick(tool.id as AppTab)}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/5 hover:border-brand-primary/20 border border-brand-border/50 group transition-all duration-300 text-left shadow-sm hover:shadow-md"
                    >
                      <div className={`p-3 rounded-xl shrink-0 ${tool.bg} ${tool.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="block text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                            {tool.name}
                          </span>
                          {tool.badge && (
                            <span className="shrink-0 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono text-[9px] uppercase font-black tracking-widest rounded border border-indigo-500/10">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        {tool.desc && (
                          <span className="block text-xs text-brand-text-secondary group-hover:text-brand-text/80 transition-colors mt-1.5 leading-relaxed font-light">
                            {tool.desc}
                          </span>
                        )}
                      </div>
                      <ArrowRight size={18} className="shrink-0 ml-auto mt-1 text-brand-border group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

        {!user && (
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 mt-16 p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-primary/10 via-brand-bg to-brand-secondary/10 border border-brand-primary/20 text-center relative overflow-hidden group hover:border-brand-primary/40 transition-colors duration-500 shadow-sm"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-[20rem] -left-[20rem] w-[50rem] h-[50rem] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
            <div className="absolute -bottom-[20rem] -right-[20rem] w-[50rem] h-[50rem] bg-brand-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-text mb-6 tracking-tighter leading-[1.1] relative z-10 animate-fade-in">
              Ready to unbox the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">QuantumCalc Universe</span>?
            </h2>
            <p className="text-brand-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light relative z-10">
              Create a free account to sync your history across devices, access advanced AI Workspaces, customize K-5 sheets natively, and gain early access to upcoming modules. No credit card required.
            </p>
            <div className="flex justify-center mb-10 relative z-10 flex-wrap gap-4">
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">✓</div> Cross-device Sync</div>
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">✓</div> AI Tutors included</div>
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">✓</div> 100% Free forever</div>
            </div>
            
            <button 
              onClick={onLoginClick}
              className="inline-flex items-center gap-3 px-10 py-5 bg-brand-text text-brand-bg rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-brand-text/20 relative z-10 outline-none focus:ring-4 focus:ring-brand-primary/50"
            >
              Sign Up for Free <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
    </div>
  );
};

export default LandingPage;
