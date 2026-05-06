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
  ArrowRightLeft
} from 'lucide-react';
import { AppTab, HistoryEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { GoogleGenAI } from "@google/genai";

interface LandingPageProps {
  onTabClick: (tabId: AppTab) => void;
  onLoginClick: () => void;
  history: HistoryEntry[];
}

const toolCategories = [
  {
    name: 'Core Utilities',
    tools: [
      { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'graphing', name: 'Graphing', icon: LineChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { id: 'date', name: 'Date Calc', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      { id: 'history', name: 'History', icon: History, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    ]
  },
  {
    name: 'Specialist Tools',
    tools: [
      { id: 'math-tools', name: 'Math Toolset', icon: Beaker, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'periodic', name: 'Chemistry', icon: FlaskConical, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      { id: 'programmer', name: 'Programmer', icon: Binary, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { id: 'base', name: 'Base Conv.', icon: ArrowRightLeft, color: 'text-orange-400', bg: 'bg-orange-400/10' },
      { id: 'financial', name: 'Finance', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { id: 'developer', name: 'Dev SDK', icon: Code, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      { id: 'text', name: 'Text Tools', icon: Type, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    ]
  },
  {
    name: 'Daily & Education',
    tools: [
      { id: 'units', name: 'Units', icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      { id: 'currency', name: 'Currency', icon: Coins, color: 'text-green-500', bg: 'bg-green-500/10' },
      { id: 'health', name: 'Health', icon: HeartPulse, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { id: 'student', name: 'Student Tools', icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick, onLoginClick }) => {
  const { user, userData } = useAuth();
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
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
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
      <section className="flex flex-col items-center text-center space-y-6 pt-10 pb-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4"
        >
          <GraduationCap size={14} /> QuantumCalc Workspace
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-text leading-tight"
        >
          Solve complex problems <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            step-by-step.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-brand-text-secondary text-lg md:text-xl font-light max-w-2xl"
        >
          {getGreeting()} <br className="hidden md:block" />
          Your unified workspace for mathematics, science, and development is ready.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md mx-auto mt-8 group"
        >
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
        </motion.div>
      </section>

      {/* Dynamic Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Main AI Teaser */}
        <motion.div 
          variants={itemVariants}
          onClick={() => onTabClick('student')}
          className="md:col-span-8 bg-gradient-to-br from-brand-surface to-brand-bg rounded-[2rem] p-8 md:p-12 border border-brand-border relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-brand-primary/10 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-brand-primary/10 transition-colors duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest w-max mb-6">
              <GraduationCap size={14} /> AI Problem Solver
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-text mb-4 tracking-tight leading-tight">
              {userData?.school ? `Solve anything at ${userData.school}.` : 'Access the AI Math Workspace.'}
            </h2>
            <p className="text-brand-text-secondary text-base md:text-lg max-w-md mb-8">
              {userData?.grade ? `Optimized for ${userData.grade}. ` : ''}Type equations, ask questions, and let the QuantumCalc Engine guide you step-by-step.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClick('student');
                }}
                className="bg-brand-text text-brand-bg px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-surface"
              >
                Open Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Fact of the day */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-4 bg-brand-surface rounded-[2rem] p-8 border border-brand-border flex flex-col relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Lightbulb size={20} />
              <h3 className="font-bold text-xs tracking-widest uppercase">Insight</h3>
            </div>
          </div>
          
          <div className="flex-grow flex items-center">
            <AnimatePresence mode="wait">
              {isLoadingFact ? (
                <motion.div key="loader" className="space-y-3 w-full">
                  <div className="h-4 bg-brand-border rounded w-full animate-pulse" />
                  <div className="h-4 bg-brand-border rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-brand-border rounded w-4/6 animate-pulse" />
                </motion.div>
              ) : (
                <motion.p 
                  key="fact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-brand-text text-lg font-serif italic leading-relaxed"
                >
                  "{mathFact}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 pt-4 border-t border-brand-border/50">
             <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Fact of the moment</p>
          </div>
        </motion.div>

        {/* Categories / Modules */}
        <motion.div variants={itemVariants} className="md:col-span-12 mt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-brand-border">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-text">
                {searchQuery ? 'Search Results' : 'Comprehensive Modules'}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCategories.map((category, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full" />
                  {category.name}
                </h3>
                <div className="flex flex-col gap-2">
                  {category.tools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onTabClick(tool.id as AppTab)}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-brand-surface/50 hover:bg-brand-surface border border-transparent hover:border-brand-border group transition-all duration-300 text-left"
                      >
                        <div className={`p-2.5 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                            {tool.name}
                          </span>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-brand-border group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
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
            className="md:col-span-12 mt-16 p-12 rounded-[3rem] bg-brand-primary/5 border border-brand-primary/20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent)]" />
            <h2 className="text-3xl md:text-5xl font-black text-brand-text mb-6 tracking-tighter">
              Unlock the full potential.
            </h2>
            <p className="text-brand-text-secondary text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Connect your account to sync your history across devices, access advanced AI workspaces, and personalize your experience.
            </p>
            <button 
              onClick={onLoginClick}
              className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-brand-bg rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/40"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LandingPage;
