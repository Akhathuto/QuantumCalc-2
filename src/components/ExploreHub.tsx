import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calculator, 
  LineChart, 
  Beaker, 
  FlaskConical, 
  Terminal, 
  Landmark, 
  Scale, 
  Coins, 
  HeartPulse, 
  Calendar, 
  Printer, 
  Award, 
  GraduationCap, 
  Binary, 
  ArrowRightLeft, 
  Code, 
  Type,
  History,
  Compass,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AppTab } from '../types';

interface ExploreHubProps {
  onTabClick: (tabId: AppTab) => void;
}

interface ToolItem {
  id: AppTab;
  name: string;
  desc: string;
  category: 'math' | 'everyday' | 'learning' | 'dev' | 'favorites';
  icon: React.ElementType;
  color: string;
  bg: string;
  badge?: string;
}

const toolsList: ToolItem[] = [
  { id: 'calculator', name: 'Unified Calculator', desc: 'Powerful expression parser & math solving engine.', category: 'math', icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-500/10', badge: 'Core' },
  { id: 'graphing', name: 'Analytical Grapher', desc: 'Plot 2D dynamic equations in real-time.', category: 'math', icon: LineChart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'math-tools', name: 'Algebra & Matrices', desc: 'Solve linear matrices, calculus polynomial limits.', category: 'math', icon: Beaker, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'periodic', name: 'Periodic Table', desc: 'Interactive atomic shells, weights, and isotope values.', category: 'math', icon: FlaskConical, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'sandbox', name: 'Math Sandbox', desc: 'Experiment with raw sandbox calculations.', category: 'math', icon: Terminal, color: 'text-teal-400', bg: 'bg-teal-500/10' },

  { id: 'financial', name: 'Capital & Mortgage', desc: 'Amortize mortgages, forecast compound growth.', category: 'everyday', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'units', name: 'Measurement Unit Solver', desc: 'Convert torque, speed, and frequency fields.', category: 'everyday', icon: Scale, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'currency', name: 'Currency Arbitrage', desc: 'Live global currency exchange tickers.', category: 'everyday', icon: Coins, color: 'text-green-400', bg: 'bg-green-500/10', badge: 'Live' },
  { id: 'health', name: 'Thermodynamics & BMR', desc: 'BMI index, BMR caloric multipliers and hydration guides.', category: 'everyday', icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'date', name: 'Temporal Duration', desc: 'Compare exact calendar spans, time durations.', category: 'everyday', icon: Calendar, color: 'text-rose-400', bg: 'bg-rose-500/10' },

  { id: 'k5worksheets', name: 'K-5 Homework Studio', desc: 'Generate custom math homework sheets with answers.', category: 'learning', icon: Printer, color: 'text-pink-400', bg: 'bg-pink-500/10', badge: 'Hot' },
  { id: 'exercises', name: 'Drills Arena', desc: 'Adaptive test sets, score stars & diploma achievements.', category: 'learning', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'student', name: 'Learning Coach', desc: 'AI academic solver for proof formulas & learning guides.', category: 'learning', icon: GraduationCap, color: 'text-violet-400', bg: 'bg-violet-500/10' },

  { id: 'programmer', name: 'Bitwise Programmer', desc: 'Binary, Hex, Octal manipulations with register feeds.', category: 'dev', icon: Binary, color: 'text-orange-400', bg: 'bg-orange-500/10', badge: 'Hex' },
  { id: 'base', name: 'Radix Base Converter', desc: 'Convert variables across bases from 2 to 64.', category: 'dev', icon: ArrowRightLeft, color: 'text-amber-300', bg: 'bg-amber-400/10' },
  { id: 'developer', name: 'Developer Utilities', desc: 'JWT token inspectors and bcrypt hashes.', category: 'dev', icon: Code, color: 'text-yellow-300', bg: 'bg-yellow-440/10' },
  { id: 'text', name: 'Text Analytics Suite', desc: 'Character metrics, base64 and markdown workspaces.', category: 'dev', icon: Type, color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

const ExploreHub: React.FC<ExploreHubProps> = ({ onTabClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'math' | 'everyday' | 'learning' | 'dev'>('all');

  const filteredTools = useMemo(() => {
    return toolsList.filter(tool => {
      const q = searchQuery.toLowerCase();
      const synonymsMap: Record<string, string[]> = {
        'calculator': ['math', 'solve', 'cos', 'sin', 'tan', 'pi', 'root', 'expression'],
        'graphing': ['plot', 'chart', '2d', 'sine', 'wave', 'line', 'axis'],
        'math-tools': ['matrix', 'determinant', 'vector', 'algebra', 'transpose', 'linear'],
        'periodic': ['chemistry', 'atom', 'element', 'shells', 'isotopes', 'nitrogen', 'science'],
        'sandbox': ['playground', 'draft', 'code', 'experiment', 'unstructured'],
        'financial': ['finance', 'money', 'mortgage', 'compound', 'interest', 'growth', 'loan'],
        'units': ['speed', 'torque', 'frequency', 'weight', 'convert', 'fields', 'units', 'metrics'],
        'currency': ['forex', 'tickers', 'exchange', 'usd', 'eur', 'arbitrage', 'money', 'live'],
        'health': ['calories', 'health', 'hydration', 'bmi', 'bmr', 'weight', 'diet', 'calorie'],
        'date': ['time', 'date', 'calendar', 'duration', 'weeks', 'days', 'hours'],
        'k5worksheets': ['pdf', 'printable', 'print', 'homework', 'sheets', 'k5', 'kids'],
        'exercises': ['quiz', 'test', 'drills', 'stars', 'adaptive', 'score', 'trophy'],
        'student': ['ai', 'chat', 'mentor', 'proof', 'formulas', 'study', 'lessons', 'gemini'],
        'programmer': ['hex', 'bin', 'oct', 'dec', 'register', 'bitwise', 'binary'],
        'base': ['base', 'binary', 'hexadecimal', 'radix', 'convert', 'octal', '64'],
        'developer': ['jwt', 'bcrypt', 'hash', 'inspect', 'token', 'crypt', 'password'],
        'text': ['word', 'chars', 'base64', 'markdown', 'metrics', 'count', 'analyze']
      };
      
      const synonyms = synonymsMap[tool.id as string] || [];
      const matchesSearch = tool.name.toLowerCase().includes(q) || 
                            tool.desc.toLowerCase().includes(q) ||
                            synonyms.some(s => s.toLowerCase().includes(q));
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const categories = [
    { id: 'all', label: 'All Tools', count: toolsList.length },
    { id: 'math', label: 'Math & Chemistry', count: toolsList.filter(t => t.category === 'math').length },
    { id: 'everyday', label: 'Everyday & Business', count: toolsList.filter(t => t.category === 'everyday').length },
    { id: 'learning', label: 'Learning & K-5', count: toolsList.filter(t => t.category === 'learning').length },
    { id: 'dev', label: 'Developer & Bytes', count: toolsList.filter(t => t.category === 'dev').length },
  ];

  const exploreHotTags = [
    { label: 'Calculus Matrix', query: 'matrix' },
    { label: 'BMI & Calorie', query: 'calorie' },
    { label: 'Fiat Exchange', query: 'arbitrage' },
    { label: 'Binary System', query: 'bitwise' },
    { label: 'Printable PDF Sheets', query: 'pdf' },
  ];

  return (
    <div className="w-full flex flex-col font-sans px-2 py-4">
      {/* Search Header Container */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="text-brand-primary animate-spin-slow" size={20} />
            <h2 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight uppercase">QuantumCalc Hub</h2>
          </div>
          <p className="text-xs text-brand-text-secondary leading-relaxed font-light">
            Instantly explore any analytical interface. Optimized for fast touch controls.
          </p>
        </div>

        {/* Dynamic Search Box with large key indicators */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search solvers, units, worksheets, or try tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-16 bg-brand-surface border-2 border-brand-border hover:border-brand-primary/40 focus:border-brand-primary/80 rounded-2xl text-brand-text text-sm sm:text-base outline-none transition-all placeholder:text-brand-text-secondary/40 font-medium font-sans shadow-inner focus:ring-4 focus:ring-brand-primary/10"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" size={18} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-text-secondary hover:text-brand-primary transition-colors bg-brand-bg px-2.5 py-1.5 rounded-xl border border-brand-border"
              >
                RESET
              </button>
            )}
          </div>

          {/* Inline tag suggestors */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary/60 whitespace-nowrap">Quick Hotkeys:</span>
            {exploreHotTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => setSearchQuery(tag.query)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap font-bold hover:scale-[1.02] cursor-pointer ${
                  searchQuery === tag.query 
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                    : 'bg-brand-surface/40 border-brand-border/40 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Scrollbar - Large and finger friendly */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-5 scrollbar-none scroll-smooth touch-pan-x -mx-4 px-4">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4.5 py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer border ${
                isActive 
                  ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-md shadow-brand-primary/10 scale-102' 
                  : 'bg-brand-surface border-brand-border/40 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/20'
              }`}
            >
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono leading-none ${isActive ? 'bg-brand-bg/20 text-brand-bg' : 'bg-brand-bg border border-brand-border/30 text-brand-text-secondary/80'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Grid Results */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onTabClick(tool.id)}
                className="w-full text-left p-4.5 rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-primary active:scale-[0.98] transition-all relative flex items-center justify-between gap-4 group cursor-pointer shadow-sm hover:shadow-md hover:shadow-brand-primary/5 select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Large tactile icon badge background */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tool.bg} border border-white/5 shadow-inner`}>
                    <Icon size={24} className={tool.color} />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-text tracking-tight truncate group-hover:text-brand-primary transition-colors">{tool.name}</span>
                      {tool.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary shrink-0">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-brand-text-secondary font-medium leading-relaxed tracking-wide truncate mt-0.5">{tool.desc}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-brand-bg/50 border border-brand-border/40 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:border-brand-primary/35 transition-all text-brand-text-secondary group-hover:text-brand-primary">
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-brand-surface rounded-3xl border border-brand-border/40">
          <Sparkles className="mx-auto text-brand-text-secondary/30 mb-2" size={32} />
          <p className="text-sm font-bold text-brand-text mb-1">No matching tools found</p>
          <p className="text-xs text-brand-text-secondary leading-relaxed font-light">Try checking another category or refining your search term.</p>
        </div>
      )}

      {/* Quick History Hub navigation shortcut */}
      <div className="mt-8 border-t border-brand-border/30 pt-6">
        <div className="bg-gradient-to-br from-brand-surface to-brand-bg border border-brand-border/40 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
              <History size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-text">Historic Tracking</h4>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed font-light">Restore equations or review previous sheets instantly.</p>
            </div>
          </div>
          <button
            onClick={() => onTabClick('history')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-black tracking-wider uppercase text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all border border-brand-primary/20 text-center cursor-pointer"
          >
            Open Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExploreHub;
