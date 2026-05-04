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
  Zap,
  Star,
  Quote,
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

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick, history }) => {
  const { user } = useAuth();
  const [mathFact, setMathFact] = useState<string>('Loading a brain-teasing fact...');
  const [isLoadingFact, setIsLoadingFact] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ... useEffect logic ...
  
  const filteredCategories = toolCategories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.tools.length > 0);

  useEffect(() => {
    const fetchFact = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-text"
          >
            Welcome back, <span className="text-brand-primary">{user?.displayName?.split(' ')[0] || 'Explorer'}</span>.
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-brand-text-secondary mt-2 text-lg font-light"
          >
            Your computational cockpit is ready. What are we solving today?
          </motion.p>
        </div>
        <div className="flex items-center gap-3 bg-brand-surface/50 p-2 rounded-2xl border border-brand-border">
          <div className="relative group cursor-pointer">
            <input 
              type="text" 
              placeholder="Search tools... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 pl-2"
            />
            <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-6 grid-rows-none md:grid-rows-2 gap-4 h-auto md:h-[600px]"
      >
        {/* Featured: AI Solver Teaser */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-3 md:row-span-2 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl p-8 relative overflow-hidden group cursor-pointer shadow-2xl shadow-brand-primary/20"
          onClick={() => onTabClick('student')}
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <span className="text-white/80 font-mono text-xs uppercase tracking-widest">Enhanced Learning</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Solve anything with <br/> the AI Math Workspace.
              </h2>
              <p className="text-white/70 max-w-sm mb-6">
                Type word problems, complex formulas, or ask Nolo for a step-by-step walkthrough.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white text-brand-primary px-4 py-2 rounded-full font-bold text-sm">Get Started</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-primary bg-brand-surface flex items-center justify-center text-[10px] text-brand-primary font-bold">
                    v{i}.0
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
          <Zap className="absolute top-12 right-12 text-white/5 opacity-0 group-hover:opacity-10 transition-opacity" size={200} />
        </motion.div>

        {/* History Recap */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-3 md:row-span-1 bg-brand-surface rounded-3xl p-6 border border-brand-border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-brand-primary" />
              <h3 className="font-bold text-brand-text">Recent Computations</h3>
            </div>
            <button onClick={() => onTabClick('history')} className="text-xs text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {history.length > 0 ? (
              history.slice(0, 3).map((entry, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3 rounded-xl bg-brand-bg hover:bg-brand-surface transition-colors border border-transparent hover:border-brand-border cursor-pointer" onClick={() => onTabClick('history')}>
                  <div className="truncate pr-4">
                    <p className="text-sm font-mono text-brand-text">{entry.expression}</p>
                    <p className="text-xs text-brand-text-secondary truncate">{entry.result}</p>
                  </div>
                  <ArrowRight size={14} className="text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
                <p className="text-sm text-brand-text-secondary italic">Your calculation history will appear here.</p>
            )}
          </div>
        </motion.div>

        {/* Fact of the Day */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-2 md:row-span-1 bg-brand-surface rounded-3xl p-6 border border-brand-border flex flex-col justify-between group overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} className="text-amber-500" />
            <h3 className="font-bold text-brand-text text-sm">Quick Insight</h3>
          </div>
          <div className="relative">
             <AnimatePresence mode="wait">
              {isLoadingFact ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 h-16"
                >
                  <div className="h-4 bg-brand-border rounded w-full animate-pulse" />
                  <div className="h-4 bg-brand-border rounded w-2/3 animate-pulse" />
                </motion.div>
              ) : (
                <motion.p 
                  key="fact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-brand-text-secondary text-sm italic leading-relaxed h-16 line-clamp-3"
                >
                  "{mathFact}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">
             <span>AI Curated</span>
             <Quote size={12} className="opacity-20" />
          </div>
        </motion.div>

        {/* User Stats / Action */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-1 md:row-span-1 bg-brand-accent/5 rounded-3xl p-6 border border-brand-accent/20 flex flex-col items-center justify-center text-center hover:bg-brand-accent/10 transition-colors cursor-pointer group"
          onClick={() => onTabClick('settings')}
        >
          <Star className="text-brand-accent mb-2 group-hover:scale-125 transition-transform" size={24} />
          <p className="text-xs font-bold text-brand-accent uppercase tracking-tighter">Premium</p>
          <p className="text-[10px] text-brand-text-secondary mt-1">v2.1 Stable</p>
        </motion.div>
      </motion.div>

      {/* Categories Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-text">
          {searchQuery ? `Results for "${searchQuery}"` : 'Explore All Modules'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCategories.map((category, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-[0.2em] pb-2 border-b border-brand-border flex items-center justify-between">
                {category.name}
                <span className="text-[10px] font-mono opacity-50">[{category.tools.length}]</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => onTabClick(tool.id as AppTab)}
                      className="flex items-center gap-3 p-3 bg-brand-surface/40 hover:bg-brand-surface rounded-xl border border-brand-border hover:border-brand-primary/50 transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search logic will go here if we want dynamic filtering, for now we remove the duplicate assistant button */}
    </div>
  );
};

export default LandingPage;
