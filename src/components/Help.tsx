import React, { useState } from 'react';
import {
    Calculator,
    LineChart,
    HelpCircle,
    ChevronDown,
    Beaker,
    GraduationCap,
    Code,
    Smartphone,
    TrendingUp,
    Sparkles,
    Binary,
    ArrowLeftRight,
    Atom,
    BookOpen,
    ChevronRight,
    Clock,
    History,
    Settings as SettingsIcon
} from 'lucide-react';

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  className?: string;
  children: React.ReactNode;
  startOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon: Icon, className = "", children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <div className={`border border-brand-border rounded-2xl bg-brand-surface/40 overflow-hidden transition-all duration-300 hover:border-brand-primary/20 ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-brand-surface/60 focus:outline-none transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Icon size={22} />
                  </div>
                  <span className="font-bold text-lg text-brand-text">
                      {title}
                  </span>
                </div>
                <ChevronDown size={20} className={`text-brand-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-brand-text-secondary prose prose-invert prose-sm max-w-none text-base leading-relaxed space-y-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface HelpProps {
  canInstall?: boolean;
  onInstall?: () => void;
  setActiveTab?: (tab: any) => void;
}

const Help: React.FC<HelpProps> = ({ canInstall = false, onInstall, setActiveTab }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            
            {/* Display Header */}
            <div className="text-center space-y-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono uppercase tracking-widest mb-2">
                    <HelpCircle size={14} /> Comprehensive Guide
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase">Help & Documentation</h2>
                <p className="max-w-xl mx-auto text-lg text-brand-text-secondary font-light">
                    The complete unified student and developer manual of QuantumCalc instructions, guidelines, formulas, and deep navigation routes.
                </p>
            </div>

            {/* General App Quick Navigation Jump Board */}
            <div className="p-6 rounded-3xl bg-brand-surface/20 border border-brand-border/45 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-brand-text font-black text-sm uppercase tracking-wider">
                    <BookOpen size={16} className="text-brand-primary" />
                    <span>Quick Interactive Sitelinks Jump Board</span>
                </div>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                    Click any element below to immediately launch its respective interface without having to scan the sidebar panel.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
                    {setActiveTab && (
                        <>
                            <button onClick={() => setActiveTab('calculator')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Calculator size={14} /> Scientific Calculator
                            </button>
                            <button onClick={() => setActiveTab('graphing')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <LineChart size={14} /> Graphing & Charts
                            </button>
                            <button onClick={() => setActiveTab('periodic')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Atom size={14} /> Periodic Table
                            </button>
                            <button onClick={() => setActiveTab('math-tools')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Beaker size={14} /> Matrices & Solvers
                            </button>
                            <button onClick={() => setActiveTab('programmer')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Binary size={14} /> Programmer Console
                            </button>
                            <button onClick={() => setActiveTab('units')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <ArrowLeftRight size={14} /> Unit Converter
                            </button>
                            <button onClick={() => setActiveTab('currency')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <TrendingUp size={14} /> Live Currency
                            </button>
                            <button onClick={() => setActiveTab('base')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Binary size={14} /> Base Converter
                            </button>
                            <button onClick={() => setActiveTab('financial')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <TrendingUp size={14} /> Financial Planner
                            </button>
                            <button onClick={() => setActiveTab('student')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <GraduationCap size={14} /> Student Workspace
                            </button>
                            <button onClick={() => setActiveTab('health')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Smartphone size={14} /> Health Calculator
                            </button>
                            <button onClick={() => setActiveTab('text')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Code size={14} /> Text Processor
                            </button>
                            <button onClick={() => setActiveTab('developer')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <Code size={14} /> Developer Tools
                            </button>
                            <button onClick={() => setActiveTab('exercises')} className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border/40 hover:border-brand-primary/35 bg-brand-surface/30 hover:bg-brand-primary/5 text-left text-xs transition-all text-brand-text hover:text-brand-primary font-medium">
                                <GraduationCap size={14} /> Exercises Board
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="space-y-4">
                {/* Android App & Download guide (Start Open) */}
                <AccordionItem title="Android Version & App Download" icon={Smartphone} startOpen={true}>
                    <p className="border-l-4 border-brand-primary pl-4 py-1 mb-4 italic text-brand-text font-medium text-lg">
                        You can download and run QuantumCalc as a fast, fully sandboxed, standalone application on your Android smartphone, iOS tablet, or desktop computer!
                    </p>
                    
                    <div className="space-y-6 mt-4">
                        {/* Standard PWA Sideload container */}
                        <div className="p-6 rounded-2xl bg-brand-surface/30 border border-brand-border/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-all duration-500"></div>
                            <h4 className="text-brand-text font-black text-base flex items-center gap-2 mb-3">
                                <Smartphone size={18} className="text-brand-primary" />
                                Instant WebAPK / PWA Sideload
                            </h4>
                            <p className="text-brand-text-secondary leading-relaxed mb-4 text-sm">
                                QuantumCalc leverages advanced <strong>Progressive Web App (PWA) and WebAPK</strong> systems supported by chromium-based engines. Installing through this secure sideload builds a lightweight native app bundle container on your Android phone over-the-air, bypassing bloated third-party app stores:
                            </p>
                            
                            {/* Interactive Install Button */}
                            <div className="my-5 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-left">
                                    <h5 className="font-bold text-brand-text text-sm">Install QuantumCalc Directly</h5>
                                    <p className="text-xs text-brand-text-secondary mt-1">Ready to install directly onto your handset with a single click.</p>
                                </div>
                                {canInstall ? (
                                    <button 
                                        onClick={onInstall}
                                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-brand-bg font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20"
                                    >
                                        <Smartphone size={16} />
                                        Sideload App
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-surface/80 border border-brand-border text-xs text-brand-text-secondary font-mono">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        Ready • Use your browser's "Add to Home screen" option
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-1">
                                <h5 className="font-bold text-brand-text text-sm uppercase tracking-wide">How to install across different systems:</h5>
                                <ul className="list-disc pl-5 space-y-3.5 text-sm text-brand-text-secondary">
                                    <li><strong>Android Phones (Chrome / Samsung Internet):</strong> Tap the <strong>"Sideload App"</strong> button above if active. If your browser restricts popup scripts, simply click your browser's top-right settings menu (denoted by three dots <code className="bg-brand-bg px-1 rounded">⋮</code>) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. This automatically compiles a secure target WebAPK installer file and triggers Android system controls to add it.</li>
                                    <li><strong>iOS iPhone & iPad (Safari web browser):</strong> Tap the system <strong>Share</strong> button (an action icon featuring a square box with an arrow pointing upwards) in Apple Safari's bottom toolbar, scroll down through the popup selection menu, and select <strong>"Add to Home Screen"</strong>. It registers immediately as a full-screen home screen application container.</li>
                                    <li><strong>Windows PC & macOS Desktop (Chrome / Brave / Edge):</strong> Click the download monitor arrow appearing on the right-hand edge of your URL address navigation bar, or open browser settings and click <strong>"Install QuantumCalc..."</strong> so it runs on your desktop with standalone windowed dimensions.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
                
                {/* Getting started */}
                <AccordionItem title="Getting Started, Cloud Sync & History" icon={HelpCircle}>
                    <p className="text-brand-text font-bold mb-2">How do I preserve my calculations and settings?</p>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        QuantumCalc has two layers of storage: local persistence and personal cloud backup via Google Drive synchronization:
                    </p>
                    <ul className="list-disc pl-5 space-y-3 text-brand-text-secondary">
                        <li><strong>Standard History Logging:</strong> Every equation processed in the primary Scientific Calculator is automatically tracked. Load previous steps back into the prompt simply by choosing them, or tap the <strong>Star Icon</strong> to add them to your persistent Favorites gallery.</li>
                        <li><strong>Google Drive Synced Integration:</strong> Open <strong>Settings</strong> and authenticate with your account. Press <strong>"Backup to Google Drive"</strong> to securely store your variables, history, and customized modes. Access any device later, authenticate, and click <strong>"Restore from Google Drive"</strong> to download your state.</li>
                        <li><strong>Scratchpad Pad:</strong> A sticky draft pad that remains open as you navigate between pages. Safely write variables, note constants, or construct multi-step equations without losing focus.</li>
                    </ul>
                    <div className="flex gap-3 pt-2">
                        {setActiveTab && (
                            <>
                                <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                    <History size={13} /> View History
                                </button>
                                <button onClick={() => setActiveTab('settings')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                    <SettingsIcon size={13} /> Settings & Backup
                                </button>
                            </>
                        )}
                    </div>
                </AccordionItem>
                
                {/* Scientific Calculator */}
                <AccordionItem title="Core Engineering & Scientific Calculator" icon={Calculator}>
                    <p className="text-brand-text-secondary leading-relaxed mb-2">
                        The primary calculator evaluates algebraic equations complying with standard PEMDAS precedence (Parentheses, Exponents, Multiplication & Division, Addition & Subtraction).
                    </p>
                    <h5 className="font-extrabold text-brand-text text-sm uppercase tracking-wide">Standard Input Formats & Grammar</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-brand-text-secondary">
                        <li><strong>Degree vs Radian Modes:</strong> Toggle DEG or RAD to evaluate trigonometric functions appropriately. For angles in degrees, e.g. <code>sin(90) = 1</code> in DEG, but in RAD it expects radians: <code>sin(pi/2) = 1</code>.</li>
                        <li><strong>Special Keys:</strong> <code>Ans</code> loads the previous successfully evaluated answer inside your active stream. Use <code>Exp</code> for scientific notation (e.g. <code>5e3</code> matches <code>5000</code>).</li>
                        <li><strong>Inverse & Hyperbolic Functions:</strong> Toggle the <code>2nd</code> button to load inverses (<code>asin</code>, <code>acos</code>, <code>atan</code>) and hyperbolic versions (<code>sinh</code>, <code>cosh</code>, <code>tanh</code>).</li>
                    </ul>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-2">Memory Accumulators</h5>
                            <ul className="list-disc pl-4 space-y-1 text-xs text-brand-text-secondary">
                                <li><code>MC</code>: Clears any stored decimal values back to 0.</li>
                                <li><code>MR</code>: Loads the currently held memory register value on cursor.</li>
                                <li><code>M+</code>: Adds the active solution sum to the accumulated value.</li>
                                <li><code>M-</code>: Subtracts the current solution sum from memory register.</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1">AI Guided Explanation</h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                As you query complicated algebraic formulas, our Gemini AI platform will auto-detect prefixes to display formula sheets, relevant plots, and proofs in a contextual sidebar panel.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('calculator')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Calculator size={13} /> Launch Scientific Calculator <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Graphing */}
                <AccordionItem title="Graphing, Functions & Categorical Charts" icon={LineChart}>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        Graph function definitions, raw coordinates, or business spreadsheets inside beautiful dynamic plots.
                    </p>
                    <div className="space-y-4 text-sm">
                        <div className="space-y-1">
                            <h5 className="font-bold text-brand-text">1. Function Plotter (Relative to X)</h5>
                            <p className="text-brand-text-secondary">
                                Type equations using <code>x</code> as the variable parameter, e.g. <code>x^2 - 3*x + 2</code> or <code>sin(x)</code>. Adjust the bounds sliders to change the scale from -10 to 10 or specify custom viewport ranges.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h5 className="font-bold text-brand-text">2. Coordinate Scatters</h5>
                            <p className="text-brand-text-secondary">
                                Input row-by-row coordinate configurations, one coordinate pairs set per line. E.g.<br />
                                <code className="inline-block bg-brand-bg px-2 py-0.5 rounded text-xs mt-1">1, 15</code><br />
                                <code className="inline-block bg-brand-bg px-2 py-0.5 rounded text-xs">2, 35</code><br />
                                <code className="inline-block bg-brand-bg px-2 py-0.5 rounded text-xs">3, 75</code>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h5 className="font-bold text-brand-text">3. Categorical Bar & Pie Charts</h5>
                            <p className="text-brand-text-secondary">
                                Ideal for student presentation charts. List category label followed by a comma and its sum weight. E.g.<br />
                                <code className="inline-block bg-brand-bg px-2 py-0.5 rounded text-xs mt-1">Physics, 45</code><br />
                                <code className="inline-block bg-brand-bg px-2 py-0.5 rounded text-xs">Chemistry, 55</code>
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('graphing')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <LineChart size={13} /> Launch Graphing & Charts <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Algebraic Solvers */}
                <AccordionItem title="Algebraic Solvers, Matrices & Formulas" icon={Beaker}>
                    <p className="text-brand-text-secondary leading-relaxed mb-2">
                        A power desk for solving arrays, equations, and mathematical factors.
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div>
                            <h5 className="font-bold text-brand-text">Matrix Engine:</h5>
                            <p className="mt-1">
                                Input numeric cells to calculate 2x2 and 3x3 matrices. Select core tasks like:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                                <li><strong>Determinant:</strong> Obtains scaling volume (e.g. <code>|A| = ad - bc</code> for 2x2 matrix).</li>
                                <li><strong>Inverse:</strong> Evaluates structural matrix inverse systems.</li>
                                <li><strong>Transpose:</strong> Swap rows for columns instantly.</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Equation Root Finder:</h5>
                            <p className="mt-1">
                                Solves Quadratic Equations complying with: <code className="bg-brand-bg px-1 rounded">ax² + bx + c = 0</code>. Enter parameters <code>a</code>, <code>b</code>, and <code>c</code> to calculate the roots via the quadratic equation formula:
                            </p>
                            <div className="bg-brand-bg/85 py-2 px-4 rounded-xl font-mono text-center text-xs mt-1 text-brand-primary">
                                x = (-b ± √(b² - 4ac)) / 2a
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Descriptive Statistics:</h5>
                            <p className="mt-1">
                                Input comma-separated items (e.g., <code>10, 15, 20, 25, 30</code>) to compute Mean, Mode, Median, Variance, Standard Deviation, and Confidence Interval structures.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('math-tools')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Beaker size={13} /> Launch Solver Workstation <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Programmer & Multi-Base Converter */}
                <AccordionItem title="Programmer Calculator & Multi-Base Converter" icon={Binary}>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        An environment curated for computing engineers, binary formatting, and logical gates operations.
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div className="p-4 rounded-xl bg-brand-surface/25 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text">Radix Inputs & Keyboard Constraints</h5>
                            <p className="mt-1 leading-relaxed">
                                Select between <strong>HEX</strong>, <strong>DEC</strong>, <strong>OCT</strong>, and <strong>BIN</strong> modes. Based on your selection, unavailable options on the keypad automatically lock preventing invalid notation entries.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/25 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text">Bitwise Logic & Shifting</h5>
                            <p className="mt-1 leading-relaxed">
                                Connect values using hardware operators: <code>AND</code>, <code>OR</code>, <code>XOR</code>, <code>NOT</code>, <code>NAND</code>, <code>NOR</code>. Perform shifts using bit-manipulators (e.g. <code>x &lt;&lt; y</code>). Set target word boundaries (8, 16, 32, 64 bits) to model hardware signed formats.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Generic Base Converter</h5>
                            <p className="mt-1 leading-relaxed">
                                Convert any floating-point numbers between base 2 and base 36. It includes an educational division log explaining division routines with remainders.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="flex gap-2.5 pt-3">
                            <button onClick={() => setActiveTab('programmer')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Binary size={13} /> Launch Programmer Calculator <ChevronRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('base')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <ArrowLeftRight size={13} /> Launch Base Radix Converter <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Unit and Currency Converters */}
                <AccordionItem title="Unit Converter & Live Currency Exchanges" icon={ArrowLeftRight}>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div>
                            <h5 className="font-bold text-brand-text">Imperial & Metric Unit Conversions:</h5>
                            <p className="mt-1">
                                Navigate categories like Length (m, km, ft, miles), Weight (kg, lbs, oz), Temperature (°C, °F, K), Speed, Energy, and Areas. Choose input and target parameters to automatically calculate equivalence equations.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">International Live Currency Exchanger:</h5>
                            <p className="mt-1">
                                Perform currency conversion with live fetched data. Enter amount, pick origin and targets, and get conversion results. Useful for business math worksheets.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="flex gap-2.5 pt-3">
                            <button onClick={() => setActiveTab('units')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <ArrowLeftRight size={13} /> Launch Unit Converter <ChevronRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('currency')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <TrendingUp size={13} /> Launch Live Currency <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Financial, Date & Health */}
                <AccordionItem title="Financial, Date & Health Calculators" icon={TrendingUp}>
                    <p className="text-brand-text-secondary text-sm">
                        Specialized modules covering home loan interests, biological physical shapes, and time differences.
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div>
                            <h5 className="font-bold text-brand-text">Loan & Mortgage Interest (Amortization):</h5>
                            <p className="mt-1">
                                Input Loan Amount, annual interest percentage, and month or year thresholds. Leverages the standard PMI annuity calculation:
                            </p>
                            <div className="bg-brand-bg/85 py-2 px-4 rounded-xl font-mono text-center text-xs mt-1 text-brand-primary">
                                P = [r * PV] / [1 - (1 + r)^-n]
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Compound Growth Forecast (Compound Interest):</h5>
                            <p className="mt-1">
                                Calculate the future compound value of savings based on the compound formula: <code className="bg-brand-bg px-1 rounded">A = P(1 + r/n)^(nt)</code>.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Health Metrical Formulas:</h5>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li><strong>Body Mass Index:</strong> <code className="bg-brand-bg px-1 rounded">BMI = weight (kg) / height² (m)</code>. Standard clinical scores include: Underweight (&lt;18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (&gt;30).</li>
                                <li><strong>BMR (Basal Metabolic Rate):</strong> Estimates daily baseline calories using the Mifflin-St Jeor formula based on biometric parameters.</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Calendar Date Calculator:</h5>
                            <p className="mt-1">
                                Find the precise days duration between any two days, or add/subtract integer amounts of time to fetch prospective deadlines. Excellent for monitoring coursework deadlines.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="flex flex-wrap gap-2.5 pt-3">
                            <button onClick={() => setActiveTab('financial')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <TrendingUp size={13} /> Launch Financial Planner <ChevronRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('date')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Clock size={13} /> Launch Date Calculator <ChevronRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('health')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Smartphone size={13} /> Launch Health Calculator <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Developer Console & Text tools */}
                <AccordionItem title="Developer Core, Security Hashes & Text Tools" icon={Code}>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        A power kit designed for computer engineering, computer science students, and programmers.
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                                <h5 className="font-bold text-brand-text mb-1.5">JSON Beautifier</h5>
                                <p className="text-xs leading-relaxed">
                                    Format raw API JSON string outputs into pretty-printed structures with customize spaces and tabs, or compress them with the minifier to reduce payloads.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                                <h5 className="font-bold text-brand-text mb-1.5">Cryptographic Hashing</h5>
                                <p className="text-xs leading-relaxed">
                                    Calculate MD5, SHA-1, SHA-256, and SHA-512 values for code verifications locally in the browser securely.
                                </p>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">JWT Decoders:</h5>
                            <p className="mt-1 text-sm">
                                Paste JSON Web Token strings to automatically inspect decrypted payload data structure without forwarding payload values to external APIs.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="flex gap-2.5 pt-3">
                            <button onClick={() => setActiveTab('developer')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Code size={13} /> Launch Developer Core <ChevronRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('text')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Code size={13} /> Launch Text & Case Tools <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Student academics */}
                <AccordionItem title="Academic Suite (GPA, Citations, Pomodoro, Cards)" icon={GraduationCap}>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        Specialized modules built strictly for school, study planning, citations formatting, and workspace productivity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-text-secondary">
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1.5 text-sm">GPA and Target Score Calculators</h5>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Input Class Scores and weight parameters to monitor individual subject aggregates.</li>
                                <li>Calculate target scores required on final exams to maintain grade standing.</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1.5 text-sm">Citation Maker (APA / MLA)</h5>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>APA 7th Format:</strong> Synthesize references correctly based on Author, Volume, Year parameters.</li>
                                <li><strong>MLA 9th Format:</strong> Generates bibliography citations for academic papers.</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1.5 text-sm">Pomodoro Clock & Concentrator</h5>
                            <p className="leading-relaxed">
                                Boost study efficiency using the 25/5 technique: 25 minutes of high-intensity study blocks followed by 5 and 15-minute relaxation periods.
                              </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1.5 text-sm">Study Flashcards</h5>
                            <p className="leading-relaxed">
                                Construct vocabulary cards and formula sheets. Toggle active states to study elements, parameters, and expressions whenever needed.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('student')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <GraduationCap size={13} /> Launch Student Workspace <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Chemistry Interactive Periodic Table */}
                <AccordionItem title="Chemistry Interactive Periodic Table" icon={Atom}>
                    <p className="text-brand-text-secondary leading-relaxed mb-3">
                        QuantumCalc contains an interactive Chemistry cell matrix containing complete element descriptors and chemical trends calculations:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-brand-text-secondary">
                        <li><strong>Interactive Mouse Hover:</strong> Instantly highlights categories like Halogens, Transition Metals, Alkalis, and Noble Gases in distinct visual heatmaps.</li>
                        <li><strong>Expanded Element Inspector:</strong> Click on any symbol to explore its physical properties (Atomic Mass, Electro-negativity, Configurations, Density, Boiling points, and Valence states).</li>
                    </ul>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('periodic')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <Atom size={13} /> Launch Interactive Periodic Table <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* Exercises reference */}
                <AccordionItem title="Exercises & Training Reference Board" icon={GraduationCap}>
                    <p className="text-brand-text-secondary leading-relaxed mb-3">
                        Practice solving math equations directly within the app using the Exercises Reference Board.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-brand-text-secondary">
                        <li><strong>Structured Practice Guides:</strong> Access specific formula databases categorized under Algebra, Calculus, and general mathematics.</li>
                        <li><strong>Step-by-Step Walkthroughs:</strong> Practice standard arithmetic rules, matrix layouts, linear calculations, and formula operations before applying them to physical classroom homework.</li>
                    </ul>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('exercises')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <GraduationCap size={13} /> Open Training Exercises Board <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* AI Math Tutor */}
                <AccordionItem title="AI Academic Tutor & Scratchpad Helpers" icon={Sparkles}>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        Smart helper utilities that let you tutor with AI and maintain session records easily.
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div>
                            <h5 className="font-bold text-brand-text">AI Math Advisor (Floating chatbot):</h5>
                            <p className="mt-1 leading-relaxed">
                                Click the round **Google Gemini Assistant** launcher button at the bottom-right corner of your workspace. Pose questions, math inquiries, equation checks, or proof requests in standard natural English. It leverages modern Google Gemini models to assist you with logical proofs.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text">Dockable Scratchpad Notepad:</h5>
                            <p className="mt-1 leading-relaxed">
                                Toggle the persistent notepad sidebar by clicking the **Scratchpad** icon in your bottom utility drawer. Highlight, write down variables, draft notes, or track multiple algebraic parameters as you transition between formulas.
                            </p>
                        </div>
                    </div>
                </AccordionItem>

                {/* K5 Interactive Worksheets Lab */}
                <AccordionItem title="K-5 Interactive Arithmetic, Time & Money Worksheets" icon={GraduationCap}>
                    <p className="text-brand-text-secondary leading-relaxed mb-3">
                        Curated specifically for younger elementary learners (Kindergarten through 5th Grade). It creates visually tactile, interactive work sheets focused on the fundamentals of counting, geometry, tell time, and coin currencies:
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">🧮 Interactive Geometry & Shape Counting</h5>
                            <p className="text-xs leading-relaxed">
                                Renders real-time vector SVGs of triangles, stars, and basic polygons. Students can physically count the visual blocks onscreen and type answers, triggering instant star rewards.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">⏰ Analog Clocks & Time-telling</h5>
                            <p className="text-xs leading-relaxed">
                                Draws an elegant vector clock face with responsive hands. It randomly places the hour and minute hands. Students learn to read analog time configurations, calculating corresponding numbers to verify their results.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">🪙 Coin Counting & Financial Foundations</h5>
                            <p className="text-xs leading-relaxed">
                                Generates random currency configurations of standard coins (Quarters, Dimes, Nickels, Pennies). Prompts young scholars to combine cent increments and determine cash totals in an easy-to-read workspace.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">🌸 Kid-Friendly Nature Meadows Theme</h5>
                            <p className="text-xs leading-relaxed">
                                Toggle the custom **Playful Meadow/Forest styling mode** to overlay soft grassy backgrounds, rounded comic-book headers, and friendly animal emotes to create an inviting, stress-free space for young learners.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('student')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <GraduationCap size={13} /> Launch K-5 Worksheets workspace <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>

                {/* AI Math Coach & Practice Bench Sandbox */}
                <AccordionItem title="AI Math Coach & Practice Bench Sandbox" icon={Sparkles}>
                    <p className="text-brand-text-secondary leading-relaxed mb-3">
                        The ultimate challenge workspace where students practice multi-disciplinary sciences with the support of real-time AI modeling and on-screen drawingboards:
                    </p>
                    <div className="space-y-4 text-sm text-brand-text-secondary">
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">📝 Multiple Choice (MCQ) vs. Open Ended</h5>
                            <p className="text-xs leading-relaxed">
                                Switch formats instantly inside the parameters panel. Solve standard text response questions or choose interactive multiple-choice layouts (options labeled A-D) with offline verification.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">🎨 Canvas Whiteboard Math Scratchpad</h5>
                            <p className="text-xs leading-relaxed">
                                Toggle the **Whiteboard Scratchpad** right inside the problem card. Use the mouse or touchscreen to draw out complex derivations, write steps, highlight values with multiple colors, and clear canvas states on-click.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">💬 Multi-Turn Academic Chat Coach</h5>
                            <p className="text-xs leading-relaxed">
                                Ask the context-bound coach follow-up questions right inside individual problem cards. Chat about specific formula definitions, constant values, or integral methods. The coach analyzes the surrounding problem context for highly precise feedback.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">📚 Guided Clue Scaffolding 1-3</h5>
                            <p className="text-xs leading-relaxed">
                                Stuck on a challenging equation? Rather than immediately looking up the answer key, request sequential hints (Clue 1 to 3) to guide you step-by-step through standard mathematical formulas.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/20">
                            <h5 className="font-bold text-brand-text mb-1 flex items-center gap-1.5">⏱️ Graded Exam Room Mode</h5>
                            <p className="text-xs leading-relaxed">
                                Turn off real-time hints and tutorials to test your skills under real-world exam conditions. Renders a live ticking timer, and generates automatic grading with scorecard percentage summaries, letter grades (e.g., A+, B), and academic advice.
                            </p>
                        </div>
                    </div>
                    {setActiveTab && (
                        <div className="pt-3">
                            <button onClick={() => setActiveTab('student')} className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">
                                <GraduationCap size={13} /> Launch Practice Bench Sandbox <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </AccordionItem>
            </div>
        </div>
    );
};

export default Help;
