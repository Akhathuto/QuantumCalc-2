import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Book, 
    Search, 
    Calculator as CalcIcon, 
    Atom, 
    Dna, 
    Globe, 
    Code, 
    Zap,
    GraduationCap,
    Lightbulb
} from 'lucide-react';

const ACADEMIC_CATEGORIES = [
    { id: 'math', name: 'Mathematics', icon: CalcIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'physics', name: 'Physics', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'chemistry', name: 'Chemistry', icon: Atom, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'biology', name: 'Biology', icon: Dna, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'cs', name: 'Computer Science', icon: Code, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'history', name: 'History/Geo', icon: Globe, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const FORMULAS = {
    math: [
        { name: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Solves quadratic equations of the form ax² + bx + c = 0' },
        { name: 'Pythagorean Theorem', formula: 'a^2 + b^2 = c^2', description: 'Relation between sides of a right-angled triangle' },
        { name: 'Area of Circle', formula: 'A = \\pi r^2', description: 'Total space enclosed by a circle' },
        { name: 'Euler\'s Identity', formula: 'e^{i\\pi} + 1 = 0', description: 'The most beautiful equation in mathematics' }
    ],
    physics: [
        { name: 'Einstein\'s Energy', formula: 'E = mc^2', description: 'Mass-energy equivalence' },
        { name: 'Newton\'s Second Law', formula: 'F = ma', description: 'Force equals mass times acceleration' },
        { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Equation of state for a hypothetical ideal gas' },
        { name: 'Uncertainty Principle', formula: '\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}', description: 'Fundamental limit to precision of measurements' }
    ],
    chemistry: [
        { name: 'Molarity', formula: 'M = \\frac{n}{V}', description: 'Moles of solute per liter of solution' },
        { name: 'pH Calculation', formula: 'pH = -\\log[H^+]', description: 'Measures the acidity or basicity of a solution' },
        { name: 'Gibbs Free Energy', formula: '\\Delta G = \\Delta H - T\\Delta S', description: 'Predicts the spontaneity of a reaction' }
    ]
};

const EXERCISES = {
    math: [
        { q: "Find the roots of x² - 5x + 6 = 0", a: "x = 2, x = 3", difficulty: 'Easy' },
        { q: "Calculate the derivative of f(x) = x³ + 2x", a: "f'(x) = 3x² + 2", difficulty: 'Medium' },
        { q: "Integrate ∫(2x) dx", a: "x² + C", difficulty: 'Easy' }
    ],
    physics: [
        { q: "A car travels 100m in 5s. Find velocity.", a: "20 m/s", difficulty: 'Easy' },
        { q: "Calculate gravitational force between two 1kg masses at 1m.", a: "6.67 × 10⁻¹¹ N", difficulty: 'Hard' }
    ]
};

const ExerciseReference = () => {
    const [selectedCat, setSelectedCat] = useState('math');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'formulas' | 'exercises'>('formulas');

    const filteredFormulas = (FORMULAS[selectedCat as keyof typeof FORMULAS] || []).filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) || 
        f.description.toLowerCase().includes(search.toLowerCase())
    );

    const filteredExercises = (EXERCISES[selectedCat as keyof typeof EXERCISES] || []).filter(e => 
        e.q.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-lg shadow-brand-primary/5">
                            <Book size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">Academic Nexus</span>
                    </div>
                    <h1 className="text-6xl font-black text-brand-text leading-none tracking-tightest">
                        Scholastic <br />
                        <span className="text-brand-primary">Repository</span>
                    </h1>
                    <p className="text-xl text-brand-text-secondary max-w-2xl leading-relaxed font-light italic">
                        A curated archive of computational blueprints, universal constants, and cognitive evaluation modules.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-brand-surface/40 px-8 py-6 rounded-[2rem] border border-brand-border/50 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Knowledge Nodes</div>
                        <div className="text-3xl font-black text-brand-text">1,248</div>
                    </div>
                    <div className="bg-brand-primary/5 px-8 py-6 rounded-[2rem] border border-brand-primary/20 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Active Exercises</div>
                        <div className="text-3xl font-black text-brand-primary font-mono">42+</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Category Sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-brand-surface/40 p-6 rounded-[2.5rem] border border-brand-border/50 backdrop-blur-md shadow-xl">
                        <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] mb-6 ml-2">Knowledge Domains</h4>
                        <div className="space-y-2">
                            {ACADEMIC_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${selectedCat === cat.id ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-xl scale-105' : 'bg-brand-bg/40 text-brand-text-secondary border-transparent hover:border-brand-border hover:bg-brand-surface/60'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCat === cat.id ? 'bg-white/20' : cat.bg + ' ' + cat.color}`}>
                                        <cat.icon size={20} />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/20">
                        <div className="flex items-center gap-3 text-brand-primary mb-4">
                            <Lightbulb size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cognitive Tip</span>
                        </div>
                        <p className="text-[11px] text-brand-text-secondary leading-relaxed font-medium">Use the <span className="text-brand-primary">Logic Scratchpad</span> in Student Tools to derive these formulas from first principles.</p>
                    </div>
                </div>

                {/* Listing Area */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Top Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex bg-brand-surface/40 p-1.5 rounded-2xl border border-brand-border/50 w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('formulas')}
                                className={`flex-1 md:w-40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'formulas' ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'}`}
                            >
                                Formula Matrix
                            </button>
                            <button
                                onClick={() => setActiveTab('exercises')}
                                className={`flex-1 md:w-40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'exercises' ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'}`}
                            >
                                Practice Modules
                            </button>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filter repository..."
                                className="w-full bg-brand-surface/40 border-2 border-brand-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCat + activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {activeTab === 'formulas' ? (
                                filteredFormulas.length > 0 ? (
                                    filteredFormulas.map((f, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 hover:border-brand-primary/50 transition-all group/card shadow-xl"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-lg font-black text-brand-text tracking-tight group-hover/card:text-brand-primary transition-colors">{f.name}</h3>
                                                <div className="p-2 bg-brand-bg/50 rounded-lg text-brand-text-secondary/30 group-hover/card:text-brand-primary transition-colors">
                                                    <Zap size={14} />
                                                </div>
                                            </div>
                                            <div className="bg-brand-bg/60 p-6 rounded-2xl border border-brand-border/50 mb-6 flex items-center justify-center min-h-[100px] shadow-inner">
                                                <div className="text-xl font-mono text-brand-text tracking-widest text-center">
                                                    {f.formula}
                                                </div>
                                            </div>
                                            <p className="text-sm text-brand-text-secondary leading-relaxed font-light line-clamp-2 italic opacity-80">{f.description}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 text-center opacity-20">
                                        <Search size={64} className="mx-auto mb-6" />
                                        <div className="text-[10px] font-black uppercase tracking-[0.6em]">Zero matches in current domain</div>
                                    </div>
                                )
                            ) : (
                                filteredExercises.length > 0 ? (
                                    filteredExercises.map((e, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl space-y-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Active Evaluator</span>
                                                </div>
                                                <div className="px-3 py-1 bg-brand-bg/50 rounded-full border border-brand-border text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">
                                                    {e.difficulty}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-lg font-black text-brand-text tracking-tight leading-tight">{e.q}</p>
                                                <div className="pt-6 border-t border-brand-border/20">
                                                    <div className="text-[9px] font-black text-brand-text-secondary/40 uppercase tracking-[0.4em] mb-2">Computational Result</div>
                                                    <div className="text-md font-mono text-emerald-500 font-bold bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                                                        {e.a}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 text-center opacity-20">
                                        <GraduationCap size={64} className="mx-auto mb-6" />
                                        <div className="text-[10px] font-black uppercase tracking-[0.6em]">Modular content currently offline</div>
                                    </div>
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExerciseReference;
