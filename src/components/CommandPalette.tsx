import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Terminal, 
  Calculator, 
  LineChart, 
  Zap, 
  ArrowRight,
  Palette,
  Layout,
  HelpCircle,
  FlaskConical,
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
  Trash2,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab } from '../types';

interface CommandPaletteProps {
  onTabClick: (tabId: AppTab) => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Appearance' | 'Security & Docs';
  keywords?: string[];
  shortcut?: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onTabClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Suggested keywords to show as "Hot Tags"
  const hotTags = [
    { label: 'Matrix', query: 'matrix' },
    { label: 'Compound Interest', query: 'mortgage' },
    { label: 'Binary Console', query: 'bitwise' },
    { label: 'Periodic Table', query: 'chemistry' },
    { label: 'Homework Sheets', query: 'pdf' },
    { label: 'Neon Theme', query: 'neon' },
  ];

  const applyTheme = (themeId: string) => {
    if (themeId === 'dark') {
      window.document.documentElement.removeAttribute('class');
    } else {
      window.document.documentElement.setAttribute('class', themeId);
    }
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  const copyConstant = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedText(name);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Comprehensive Indexed Commands with Synonym Keywords for enhanced search matching
  const commandsList: CommandItem[] = useMemo(() => [
    // 1. Navigation Modules
    {
      id: 'tab-calculator',
      title: 'Switch to Scientific Calculator',
      description: 'Dynamic math evaluation, functional equation parsing and algebra solver.',
      icon: Calculator,
      action: () => { onTabClick('calculator'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['math', 'solve', 'expression', 'cos', 'sin', 'tan', 'rad', 'root', 'square', 'pi', 'brackets', 'scientific'],
    },
    {
      id: 'tab-graphing',
      title: 'Switch to Analytical Grapher',
      description: 'Render interactive 2D function lines and coordinate system charts.',
      icon: LineChart,
      action: () => { onTabClick('graphing'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['plot', 'graph', 'chart', '2d', 'axis', 'function', 'sine', 'wave', 'line', 'visualize'],
    },
    {
      id: 'tab-math-tools',
      title: 'Switch to Algebra & Matrices',
      description: 'Solve polynomial coefficients vectors, transposes, and matrix determinant dimensions.',
      icon: Sparkles,
      action: () => { onTabClick('math-tools'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['matrix', 'determinant', 'vector', 'algebra', 'solve', 'linear', 'equations', 'invert', 'transpose'],
    },
    {
      id: 'tab-periodic',
      title: 'Switch to Periodic Table',
      description: 'Inspect atomic configurations, shells, isotope properties, and chemical categories.',
      icon: FlaskConical,
      action: () => { onTabClick('periodic'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['chemistry', 'atom', 'element', 'shells', 'isotopes', 'weight', 'nitrogen', 'gold', 'table', 'science'],
    },
    {
      id: 'tab-sandbox',
      title: 'Switch to Math Sandbox',
      description: 'Experiment with raw unstructured console computations and custom draft logs.',
      icon: Terminal,
      action: () => { onTabClick('sandbox'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['sandbox', 'playground', 'draft', 'code', 'experiment', 'unstructured', 'calculate', 'workspace'],
    },
    {
      id: 'tab-financial',
      title: 'Switch to Capital & Mortgage',
      description: 'Compute compounding interest curves, real estate loans, and future value growth.',
      icon: Award,
      action: () => { onTabClick('financial'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['finance', 'money', 'mortgage', 'compound', 'interest', 'growth', 'calculate', 'loan', 'investment'],
    },
    {
      id: 'tab-units',
      title: 'Switch to Measurement Units Converter',
      description: 'Translate speeds, torque parameters, metric volumes, and computational temperatures.',
      icon: Scale,
      action: () => { onTabClick('units'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['speed', 'torque', 'frequency', 'weight', 'length', 'convert', 'fields', 'units', 'metrics'],
    },
    {
      id: 'tab-currency',
      title: 'Switch to Currency Arbitrage',
      description: 'Live fiat exchange tickers, currency fields and cross bank metrics.',
      icon: Coins,
      action: () => { onTabClick('currency'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['forex', 'tickers', 'exchange', 'usd', 'eur', 'arbitrage', 'money', 'live', 'conversion'],
    },
    {
      id: 'tab-health',
      title: 'Switch to Thermodynamics & BMR',
      description: 'Calculate BMI ratios, active hydration cycles and BMR calorie coefficients.',
      icon: HeartPulse,
      action: () => { onTabClick('health'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['calories', 'health', 'hydration', 'bmi', 'weight', 'exercise', 'body', 'bmr', 'fat', 'mass'],
    },
    {
      id: 'tab-date',
      title: 'Switch to Temporal Duration',
      description: 'Analyze exact day gaps, calendar periods, and time intervals.',
      icon: Calendar,
      action: () => { onTabClick('date'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['time', 'date', 'calendar', 'duration', 'weeks', 'days', 'hours', 'compare', 'epochs'],
    },
    {
      id: 'tab-k5worksheets',
      title: 'Switch to K-5 Homework Studio',
      description: 'Print adaptive educational sheets, worksheets and math question printouts.',
      icon: Printer,
      action: () => { onTabClick('k5worksheets'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['pdf', 'printable', 'print', 'homework', 'sheets', 'k5', 'kids', 'answers', 'exercises'],
    },
    {
      id: 'tab-study-guides',
      title: 'Switch to DBE Self-Study Guides',
      description: 'Access official South African DBE CAPS study guides for Grades 10 - 12 (Maths, Physics, Life Sciences).',
      icon: GraduationCap,
      action: () => { onTabClick('study-guides'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['school', 'caps', 'south', 'african', 'study', 'guides', 'dbe', 'matric', 'grade', 'pdf', 'download'],
    },
    {
      id: 'tab-exercises',
      title: 'Switch to Drills Arena',
      description: 'Embark on dynamic interactive training quizzes and unlock stellar badges.',
      icon: Award,
      action: () => { onTabClick('exercises'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['quiz', 'test', 'drills', 'stars', 'adaptive', 'score', 'trophy', 'practice', 'game', 'education'],
    },
    {
      id: 'tab-student',
      title: 'Switch to Learning Coach',
      description: 'Engage the Gemini-powered study coach for formulas breakdowns and learning paths.',
      icon: GraduationCap,
      action: () => { onTabClick('student'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['ai', 'chat', 'mentor', 'proof', 'formulas', 'study', 'lessons', 'textbook', 'assistant', 'gemini'],
    },
    {
      id: 'tab-programmer',
      title: 'Switch to Bitwise Programmer Calculator',
      description: 'Work across hex, octal, binary systems and debug bit offsets.',
      icon: Binary,
      action: () => { onTabClick('programmer'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['hex', 'bin', 'oct', 'dec', 'register', 'bitwise', 'binary', 'manipulation', 'dev', 'bitwise shift'],
    },
    {
      id: 'tab-base',
      title: 'Switch to Radix Base Converter',
      description: 'Convert values and custom floating bases between base 2 and base 64.',
      icon: ArrowRightLeft,
      action: () => { onTabClick('base'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['base', 'binary', 'hexadecimal', 'radix', 'convert', 'octal', '64', 'representation'],
    },
    {
      id: 'tab-developer',
      title: 'Switch to Developer Utilities',
      description: 'Encode JSON tokens, generate passwords, and run SHA computations.',
      icon: Code,
      action: () => { onTabClick('developer'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['jwt', 'bcrypt', 'hash', 'inspect', 'token', 'crypt', 'dev', 'password', 'util', 'base64 decode'],
    },
    {
      id: 'tab-text',
      title: 'Switch to Text Analytics Suite',
      description: 'Examine string character structures, word frequencies, and read time.',
      icon: Type,
      action: () => { onTabClick('text'); setIsOpen(false); },
      category: 'Navigation',
      keywords: ['word', 'chars', 'base64', 'markdown', 'metrics', 'count', 'analyze', 'strings', 'regex'],
    },

    // 2. High-Tech Action Macros
    {
      id: 'action-clear-history',
      title: 'Macro: Clear Calculations Cache',
      description: 'Purge all cached calculation sequences and local dashboard telemetry.',
      icon: Trash2,
      action: () => {
        localStorage.removeItem('quantum_calc_history');
        window.dispatchEvent(new CustomEvent('clear-history-event'));
        setIsOpen(false);
      },
      category: 'Actions' as const,
      keywords: ['erase', 'delete', 'wipe', 'reset', 'purge', 'history', 'cache']
    },
    {
      id: 'action-copy-pi',
      title: 'Copy Constant: Pi (π)',
      description: 'Copy high precision Pi constant (3.141592653589793) to systemic clipboard.',
      icon: Copy,
      action: () => copyConstant('Pi', '3.141592653589793'),
      category: 'Actions' as const,
      keywords: ['math', 'constant', 'pi', 'circle', 'ratio', 'copy']
    },
    {
      id: 'action-copy-euler',
      title: 'Copy Constant: Euler\'s Number (e)',
      description: 'Copy base of natural logarithms (2.718281828459045) to systemic clipboard.',
      icon: Copy,
      action: () => copyConstant('Euler\'s Number', '2.718281828459045'),
      category: 'Actions' as const,
      keywords: ['constant', 'euler', 'exponent', 'log', 'copy']
    },
    {
      id: 'action-copy-planck',
      title: 'Copy Constant: Planck Constant (h)',
      description: 'Copy action quantum constant (6.62607015e-34) to systemic clipboard.',
      icon: Copy,
      action: () => copyConstant('Planck Constant', '6.62607015e-34'),
      category: 'Actions' as const,
      keywords: ['physics', 'quantum', 'const', 'planck', 'copy']
    },

    // 3. Elegant Themes
    {
      id: 'theme-dark',
      title: 'Apply Slate Midnight Theme',
      description: 'A rich, eye-soothing off-white typography over deep slate canvas.',
      icon: Palette,
      action: () => applyTheme('dark'),
      category: 'Appearance' as const,
      keywords: ['dark', 'slate', 'midnight', 'eyecare', 'theme']
    },
    {
      id: 'theme-neon',
      title: 'Apply Neon Odyssey Theme',
      description: 'High-tech cyberpunk aesthetic with hot-pink boundaries and toxic glows.',
      icon: Palette,
      action: () => applyTheme('neon'),
      category: 'Appearance' as const,
      keywords: ['neon', 'pink', 'cyberpunk', 'glow', 'theme']
    },
    {
      id: 'theme-royal',
      title: 'Apply Royal Nebula Theme',
      description: 'Deep cosmic violets paired with rich amethyst button frames.',
      icon: Palette,
      action: () => applyTheme('royal'),
      category: 'Appearance' as const,
      keywords: ['royal', 'purple', 'nebula', 'magic', 'theme']
    },
    {
      id: 'theme-terminal',
      title: 'Apply Core Matrix Console Theme',
      description: 'Monochrome high-contrast phosphor green for classic engineers.',
      icon: Palette,
      action: () => applyTheme('terminal'),
      category: 'Appearance' as const,
      keywords: ['matrix', 'green', 'monochrome', 'retro', 'terminal', 'theme']
    },
    {
      id: 'theme-cyberpunk',
      title: 'Apply Cyber Synthwave Theme',
      description: 'Intense retro synthwave accents with yellow headers and deep purples.',
      icon: Palette,
      action: () => applyTheme('cyberpunk'),
      category: 'Appearance' as const,
      keywords: ['cyber', 'synthwave', 'yellow', 'bright', 'theme']
    },

    // 4. Docs, Agreements and Help
    {
      id: 'tab-help',
      title: 'View FAQ & Help Documents',
      description: 'Examine detailed tutorials, gestures maps, and system shortcuts guides.',
      icon: HelpCircle,
      action: () => { onTabClick('help'); setIsOpen(false); },
      category: 'Security & Docs' as const,
      keywords: ['guide', 'help', 'tutorial', 'faq', 'manual', 'how to']
    },
    {
      id: 'tab-terms',
      title: 'Examine End User License Agreement',
      description: 'Explore QuantumCalc digital boundaries and calculation rules.',
      icon: FileText,
      action: () => { onTabClick('terms'); setIsOpen(false); },
      category: 'Security & Docs' as const,
      keywords: ['terms', 'license', 'legal', 'agreement', 'protocol', 'signature']
    },
    {
      id: 'tab-privacy',
      title: 'Examine Sovereign Privacy Protocol',
      description: 'Information regarding systemic data isolation and key parameters encryption.',
      icon: ShieldCheck,
      action: () => { onTabClick('privacy'); setIsOpen(false); },
      category: 'Security & Docs' as const,
      keywords: ['data', 'privacy', 'isolated', 'encryption', 'gdpr', 'confidential']
    },
    {
      id: 'tab-feedback',
      title: 'Open Dynamic Feedback Terminal',
      description: 'Transmit functional feature ideas or report calculation bugs to core devs.',
      icon: MessageSquare,
      action: () => { onTabClick('feedback'); setIsOpen(false); },
      category: 'Security & Docs' as const,
      keywords: ['rate', 'suggest', 'issue', 'bug', 'feedback', 'review']
    }
  ], [onTabClick]);

  // Enhanced search matching with light weighting/relevancy scoring
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commandsList;

    const queryLower = search.toLowerCase();
    
    return commandsList
      .map(cmd => {
        let score = 0;
        
        // Match exact title sequence
        if (cmd.title.toLowerCase().includes(queryLower)) {
          score += 10;
          // Substring alignment bonus
          if (cmd.title.toLowerCase().startsWith(queryLower)) score += 5;
        }

        // Match exact description sequence
        if (cmd.description.toLowerCase().includes(queryLower)) {
          score += 4;
        }

        // Match exact synonym keywords
        if (cmd.keywords && cmd.keywords.some(kw => kw.includes(queryLower))) {
          score += 8;
          // Perfect keyword match bonus
          if (cmd.keywords.some(kw => kw === queryLower)) score += 3;
        }

        // Category match
        if (cmd.category.toLowerCase().includes(queryLower)) {
          score += 2;
        }

        return { cmd, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.cmd);
  }, [search, commandsList]);

  // Set keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  // Autofocus input & Reset Selected Index
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Handle index scrolling for keyboard navigation
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 5));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIndex(filteredCommands.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  // Helper function to draw dynamic highlighted parts inside text for extreme polish
  const highlightMatch = (text: string, queryText: string) => {
    if (!queryText.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${queryText.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((p, i) => 
          p.toLowerCase() === queryText.toLowerCase() ? (
            <span key={i} className="text-white bg-brand-primary/40 font-black px-0.5 rounded-sm shadow-sm">{p}</span>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[200]"
            onClick={() => setIsOpen(false)}
          />

          {/* Interactive Core command palette container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-2xl bg-brand-surface/95 border-2 border-brand-primary/30 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.85)] z-[201] overflow-hidden backdrop-blur-2xl px-2 pt-2"
          >
            {/* Edge-Tech decorative light border flare */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
            
            {/* Main Interactive Search Input Zone */}
            <div className="flex items-center gap-3 p-5 border-b border-brand-border/60 relative">
              <Search className="text-brand-primary animate-pulse shrink-0" size={22} />
              
              <div className="flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Query functions, elements, constants or custom styles..."
                  className="bg-transparent border-none outline-none text-base sm:text-lg font-bold text-brand-text w-full placeholder:text-brand-text-secondary/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="flex items-center gap-2">
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="text-[10px] font-black tracking-widest text-brand-text-secondary bg-brand-bg hover:text-brand-text px-2 py-1 rounded-xl transition-all"
                  >
                    RESET
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-bg/80 border border-brand-border text-brand-text-secondary text-[10.5px] font-black tracking-widest">
                  <span className="font-sans text-[11px]">CTRL</span>
                  <span className="text-[11px]">+</span>
                  <span className="font-sans text-[11px]">K</span>
                </div>
              </div>
            </div>

            {/* Quick-suggestion click hot tags pill container */}
            <div className="px-5 py-3 border-b border-brand-border/40 bg-brand-surface/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-black text-brand-text-secondary/80 tracking-widest uppercase shrink-0 mr-1.5 flex items-center gap-1">
                <Sparkles size={11} className="text-brand-primary" /> Suggs:
              </span>
              {hotTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => setSearch(tag.query)}
                  className="text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl bg-brand-bg/60 border border-brand-border/40 hover:border-brand-primary hover:text-brand-primary text-brand-text-secondary whitespace-nowrap transition-all cursor-pointer hover:scale-[1.02]"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Live matched nodes indicator bar */}
            <div className="px-5 py-2.5 bg-brand-primary/5 border-b border-brand-border/40 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                <span className="font-bold text-brand-text/90">INDEX ENGINE STATUS</span>
              </div>
              <div className="font-bold text-brand-text-secondary">
                {filteredCommands.length} MATCHED NODES {search.trim() ? `FOR "${search.toUpperCase()}"` : ''}
              </div>
            </div>

            {/* Dynamic Search Results Container */}
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 custom-scrollbar relative select-none">
              {/* Dynamic clipboard floating response toast marker */}
              <AnimatePresence>
                {copiedText && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-2 right-4 z-50 bg-black text-brand-primary border border-brand-primary/50 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-primary/10 font-mono font-bold uppercase tracking-wider"
                  >
                    <Check size={12} className="text-brand-primary" /> COPIED: {copiedText}
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isActive = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        ref={isActive ? activeItemRef : null}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group cursor-pointer border ${
                          isActive 
                            ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-xl shadow-brand-primary/10 scale-101' 
                            : 'bg-transparent border-transparent text-brand-text-secondary hover:bg-brand-bg/40 hover:border-brand-border/30'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive 
                              ? 'bg-brand-bg text-brand-primary' 
                              : 'bg-brand-surface/80 text-brand-primary border border-brand-border/40'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm font-black tracking-tight truncate ${isActive ? 'text-brand-bg' : 'text-brand-text'}`}>
                              {highlightMatch(cmd.title, search)}
                            </p>
                            <p className={`text-[11px] truncate mt-0.5 leading-relaxed font-medium ${
                              isActive ? 'text-brand-bg/75' : 'text-brand-text-secondary/80'
                            }`}>
                              {highlightMatch(cmd.description, search)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 pl-3">
                          <span className={`text-[9px] uppercase tracking-widest font-mono p-1 px-2 rounded-lg border ${
                            isActive 
                              ? 'bg-brand-bg/15 text-brand-bg border-brand-bg/25' 
                              : 'bg-brand-surface text-brand-text-secondary border-brand-border/40'
                          }`}>
                            {cmd.category}
                          </span>
                          <ArrowRight 
                            size={16} 
                            className={`transition-all ${
                              isActive ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-1'
                            }`} 
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-14 text-center space-y-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-brand-surface/80 border border-brand-border flex items-center justify-center mx-auto">
                    <Layout className="text-brand-text-secondary opacity-30" size={32} />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <p className="font-extrabold text-sm text-brand-text">Zero Node Sequences Found</p>
                    <p className="text-xs text-brand-text-secondary leading-relaxed font-light">
                      No matching modules for "<span className="text-brand-primary font-bold">{search}</span>". Try searching for "matrix", "interest", "neon", "chemistry" or "pdf".
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Elegant telemetry, actions and navigation helper controls key board HUD */}
            <div className="p-4 border-t border-brand-border/60 bg-brand-bg/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
              <div className="flex items-center gap-4 flex-wrap justify-center font-bold">
                <div className="flex items-center gap-1">
                  <span className="bg-brand-surface px-2 py-0.5 rounded-lg border border-brand-border text-brand-text/90">Enter</span>
                  <span>Authorize</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="bg-brand-surface px-2 py-0.5 rounded-lg border border-brand-border text-brand-text/90">↑↓</span>
                  <span>Track</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="bg-brand-surface px-2 py-0.5 rounded-lg border border-brand-border text-brand-text/90">Page Up/Dn</span>
                  <span>Jump</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-brand-primary font-extrabold italic select-none">
                <Zap size={11} className="animate-bounce" />
                <span>INDEXED: {commandsList.length} STACK MODS</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
