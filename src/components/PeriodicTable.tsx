import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Atom, Search, TrendingUp, Thermometer, Layers, BarChart3, Sparkles, Loader2,
    Flame, HelpCircle, CheckCircle2, XCircle, ArrowLeftRight, FlaskConical, Info,
    Play, Pause, RefreshCw, Undo2, Dices, Copy, Check, Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

import { Element, CATEGORY_COLORS, ELEMENTS, getElementStateAtTemp } from './PeriodicTableData';

const getElectronConfiguration = (n: number) => {
    if (n === 24) return '[Ar] 4s1 3d5';
    if (n === 29) return '[Ar] 4s1 3d10';

    const shells = [
        { name: '1s', cap: 2 }, { name: '2s', cap: 2 }, { name: '2p', cap: 6 },
        { name: '3s', cap: 2 }, { name: '3p', cap: 6 }, { name: '4s', cap: 2 },
        { name: '3d', cap: 10 }, { name: '4p', cap: 6 }, { name: '5s', cap: 2 },
        { name: '4d', cap: 10 }, { name: '5p', cap: 6 }
    ];
    let remaining = n;
    const config = [];
    for (const shell of shells) {
        if (remaining <= 0) break;
        const count = Math.min(remaining, shell.cap);
        config.push(`${shell.name}${count}`);
        remaining -= count;
    }
    return config.join(' ');
};

const getShellComposition = (n: number) => {
    const orbitals = [
        { shell: 0, cap: 2 }, // 1s
        { shell: 1, cap: 2 }, // 2s
        { shell: 1, cap: 6 }, // 2p
        { shell: 2, cap: 2 }, // 3s
        { shell: 2, cap: 6 }, // 3p
        { shell: 3, cap: 2 }, // 4s
        { shell: 2, cap: 10 }, // 3d
        { shell: 3, cap: 6 }, // 4p
        { shell: 4, cap: 2 }, // 5s
        { shell: 3, cap: 10 }, // 4d
        { shell: 4, cap: 6 }  // 5p
    ];
    const shells = [0, 0, 0, 0, 0];
    let remaining = n;
    for (const orb of orbitals) {
        const count = Math.min(remaining, orb.cap);
        shells[orb.shell] += count;
        remaining -= count;
        if (remaining <= 0) break;
    }
    return shells.filter(s => s > 0);
};

const BohrModel = ({ n, color }: { n: number, color: string }) => {
    const composition = getShellComposition(n);
    return (
        <div className="relative w-56 h-56 flex items-center justify-center bg-brand-bg/10 rounded-full border border-brand-border/20 backdrop-blur-sm shadow-inner group">
            <motion.div 
                animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [`0 0 20px ${color}40`, `0 0 40px ${color}80`, `0 0 20px ${color}40`]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-[11px] text-white font-black z-20 border-2 border-white/30"
                style={{ 
                    background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
                }}
            >
                {n}+
            </motion.div>
            {composition.map((count, i) => {
                const radius = 35 + i * 20;
                return (
                    <div 
                        key={i} 
                        className="absolute border border-brand-primary/10 rounded-full animate-spin-slow" 
                        style={{ 
                            width: radius * 2, 
                            height: radius * 2, 
                            animationDuration: `${(i + 1) * 12}s`,
                            animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                        }}
                    >
                         {Array.from({ length: count }).map((_, j) => {
                             const angle = (j / count) * 360;
                             return (
                                 <motion.div 
                                     key={j} 
                                     animate={{ scale: [1, 1.2, 1] }}
                                     transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.1 }}
                                     className="absolute w-2.5 h-2.5 rounded-full shadow-lg border border-white/20"
                                     style={{ 
                                         top: 'calc(50% - 5px)', 
                                         left: 'calc(50% - 5px)', 
                                         transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                                         background: `radial-gradient(circle at 30% 30%, ${color}, #fff)`,
                                         boxShadow: `0 0 10px ${color}aa`
                                     }}
                                 />
                             );
                         })}
                    </div>
                );
            })}
            
            {/* Orbital Labels */}
            {composition.map((_, i) => (
                <div 
                    key={`label-${i}`}
                    className="absolute text-[8px] font-black opacity-30 pointer-events-none"
                    style={{ 
                        transform: `translateY(${-35 - i * 20}px)`,
                    }}
                >
                    n={i+1}
                </div>
            ))}
        </div>
    );
};

import { ChemistryQuiz } from './ChemistryQuiz';
import { SolubilityChecker } from './SolubilityChecker';
import { MoleculeBuilder } from './MoleculeBuilder';
import { ElementComparison } from './ElementComparison';

type ViewMode = 'category' | 'electronegativity' | 'atomic_radius';
type BlockType = 'all' | 's' | 'p' | 'd' | 'f';

const getElementBlock = (e: Element): 's' | 'p' | 'd' | 'f' => {
    if (e.category === 'lanthanide' || e.category === 'actinide') return 'f';
    if (e.group === 1 || e.group === 2 || e.number === 2) return 's';
    if (e.group >= 13 && e.group <= 18) return 'p';
    return 'd';
};

const PeriodicTable = () => {
    const [selected, setSelected] = useState<Element | null>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('category');
    const [blockFilter, setBlockFilter] = useState<BlockType>('all');
    const [stateFilter, setStateFilter] = useState<'all' | 'solid' | 'liquid' | 'gas' | 'synthetic'>('all');
    const [showTrends, setShowTrends] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [copiedSymbol, setCopiedSymbol] = useState(false);

    // Dynamic temperature state for phase simulator
    const [temperature, setTemperature] = useState(298.15); // Room Temperature by default (25°C)
    const [tempUnit, setTempUnit] = useState<'K' | 'C' | 'F'>('K');

    // Head-to-head comparison states
    const [compareA, setCompareA] = useState<Element | null>(null);
    const [compareB, setCompareB] = useState<Element | null>(null);

    // Sandbox dashboard tab states
    const [sandboxTab, setSandboxTab] = useState<'synthesis' | 'solubility' | 'quiz'>('synthesis');
    const [ingredients, setIngredients] = useState<Record<string, number>>({});

    const [isAiThinking, setIsAiThinking] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    const pickRandomElement = () => {
        const randomIndex = Math.floor(Math.random() * ELEMENTS.length);
        const randomElem = ELEMENTS[randomIndex];
        setSelected(randomElem);
    };

    const askAiForElement = async () => {
        if (!selected) return;
        setIsAiThinking(true);
        setAiInsight(null);
        try {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `Provide a deep scientific insight about the element ${selected.name} (${selected.symbol}). Include its historical significance, modern industrial applications, and one fun fact. Format with markdown.`,
                config: {
                    systemInstruction: "You are the QuantumCalc Chemical Intelligence System. Provide expert, high-level but accessible briefings on chemical elements.",
                }
            });
            setAiInsight(response.text || "Could not generate insight.");
        } catch (err) {
            setAiInsight("Deep research unavailable at this time.");
        } finally {
            setIsAiThinking(false);
        }
    };

    const isAnyMatch = useMemo(() => {
        if (!search) return true;
        return ELEMENTS.some(e => 
            e.name.toLowerCase().includes(search.toLowerCase()) || 
            e.symbol.toLowerCase().includes(search.toLowerCase()) ||
            e.number.toString() === search
        );
    }, [search]);

    const getElementStyle = (element: Element) => {
        const isHoveredCat = hoveredCategory === element.category;
        const isBlockMatch = blockFilter === 'all' || getElementBlock(element) === blockFilter;
        const isStateMatch = stateFilter === 'all' || getElementStateAtTemp(element, temperature) === stateFilter;
        const opacity = ((hoveredCategory && !isHoveredCat) || !isBlockMatch || !isStateMatch) ? '0.2' : '1';
        const color = CATEGORY_COLORS[element.category] || element.color;

        if (viewMode === 'category') {
            return {
                background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                borderColor: `${color}44`,
                borderLeftWidth: '4px',
                borderLeftColor: color,
                color: color,
                opacity
            };
        }
        
        if (viewMode === 'electronegativity') {
            if (element.electronegativity === null) return { backgroundColor: '#1a202c', borderLeft: '4px solid #4a5568', opacity };
            const intensity = (element.electronegativity / 4) * 255;
            const trendColor = `rgb(${intensity}, ${intensity * 0.2}, ${255 - intensity})`;
            return { background: `linear-gradient(135deg, ${trendColor}33, ${trendColor}11)`, borderLeft: `4px solid ${trendColor}`, borderColor: `${trendColor}44`, color: trendColor, opacity };
        }

        if (viewMode === 'atomic_radius') {
            if (element.atomic_radius === null) return { backgroundColor: '#1a202c', borderLeft: '4px solid #4a5568', opacity };
            const intensity = (element.atomic_radius / 200) * 255;
            const trendColor = `rgb(${intensity * 0.5}, ${intensity}, ${255 - intensity * 0.5})`;
            return { background: `linear-gradient(135deg, ${trendColor}33, ${trendColor}11)`, borderLeft: `4px solid ${trendColor}`, borderColor: `${trendColor}44`, color: trendColor, opacity };
        }

        return { opacity };
    };

    const getElementProperty = (element: Element) => {
        if (viewMode === 'electronegativity') return element.electronegativity?.toFixed(2) || '-';
        if (viewMode === 'atomic_radius') return element.atomic_radius ? `${element.atomic_radius}pm` : '-';
        return element.number;
    };

    const categories = Array.from(new Set(ELEMENTS.map(e => e.category)));

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-brand-surface/50 p-4 rounded-2xl border border-brand-border shadow-sm">
                <div className="flex items-center gap-4 bg-brand-primary/10 px-6 py-3 rounded-2xl border border-brand-primary/20 shadow-lg">
                    <div className="p-2 bg-brand-primary rounded-lg text-white">
                        <Atom size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text tracking-tighter uppercase leading-none">Periodic Table</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Chemical Intelligence System</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* View mode buttons */}
                    <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border h-10 shadow-inner">
                        <button onClick={() => setViewMode('category')} className={`px-3.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${viewMode === 'category' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <Layers size={12} /> Standard
                        </button>
                        <button onClick={() => setViewMode('electronegativity')} className={`px-3.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${viewMode === 'electronegativity' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <TrendingUp size={12} /> Electronegativity
                        </button>
                        <button onClick={() => setViewMode('atomic_radius')} className={`px-3.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${viewMode === 'atomic_radius' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <TrendingUp size={12} className="rotate-90" /> Radius
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowTrends(!showTrends)}
                        className={`h-10 px-3.5 rounded-xl border border-brand-border flex items-center gap-2 text-xs font-bold transition-all ${showTrends ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text'}`}
                    >
                        <BarChart3 size={15} /> {showTrends ? 'Hide' : 'Trends'}
                    </button>

                    <button
                        onClick={pickRandomElement}
                        title="Pick Random Element"
                        className="h-10 px-3.5 rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-primary/10 text-brand-text-secondary hover:text-brand-primary flex items-center gap-2 text-xs font-bold transition-all"
                    >
                        <Dices size={15} /> Random
                    </button>

                    <div className="relative flex-1 md:flex-initial min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={15} />
                        <input 
                            type="text"
                            placeholder="Element, Symbol, #..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Block & State Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-brand-surface/30 rounded-2xl border border-brand-border/40">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-brand-text-secondary tracking-widest">
                            <Filter size={13} className="text-brand-primary" /> Block:
                        </div>
                        <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border text-[9px] font-black uppercase gap-1">
                            {(['all', 's', 'p', 'd', 'f'] as BlockType[]).map(block => (
                                <button
                                    key={block}
                                    onClick={() => setBlockFilter(block)}
                                    className={`px-2.5 py-1 rounded-lg transition-all ${
                                        blockFilter === block 
                                            ? 'bg-brand-primary text-white shadow-md' 
                                            : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface'
                                    }`}
                                >
                                    {block === 'all' ? 'All' : `${block.toUpperCase()}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-brand-text-secondary tracking-widest">
                            <Thermometer size={13} className="text-brand-primary" /> State:
                        </div>
                        <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border text-[9px] font-black uppercase gap-1">
                            {(['all', 'solid', 'liquid', 'gas', 'synthetic'] as const).map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStateFilter(st)}
                                    className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                                        stateFilter === st 
                                            ? 'bg-brand-primary text-white shadow-md' 
                                            : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {(blockFilter !== 'all' || stateFilter !== 'all' || search) && (
                    <button
                        onClick={() => {
                            setBlockFilter('all');
                            setStateFilter('all');
                            setSearch('');
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-wider transition-all border border-brand-primary/20"
                    >
                        <Undo2 size={12} /> Reset Filters
                    </button>
                )}
            </div>

            {showTrends && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-brand-surface border border-brand-border rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-brand-text flex items-center gap-2">
                            <BarChart3 size={18} className="text-brand-primary" /> Elemental Trends
                        </h4>
                        <div className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-widest bg-brand-bg px-3 py-1 rounded-full border border-brand-border">
                            Plotting by Atomic Number (Z)
                        </div>
                    </div>
                    <div className="h-72 w-full bg-brand-bg/50 rounded-2xl p-4 border border-brand-border/40">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ELEMENTS.sort((a,b) => a.number - b.number)}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis 
                                    dataKey="number" 
                                    stroke="#4a5568" 
                                    fontSize={10} 
                                    tickFormatter={(val) => `Z=${val}`}
                                    label={{ value: 'Atomic Number', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#718096', fontWeight: 'bold' }} 
                                />
                                <YAxis stroke="#4a5568" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.9)', border: '1px solid #4a5568', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '4px' }}
                                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line 
                                    type="stepAfter" 
                                    dataKey={viewMode === 'electronegativity' ? 'electronegativity' : viewMode === 'atomic_radius' ? 'atomic_radius' : 'mass'} 
                                    stroke="var(--color-primary)" 
                                    strokeWidth={4} 
                                    dot={false}
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-primary)' }}
                                    name={viewMode === 'electronegativity' ? 'Electronegativity' : viewMode === 'atomic_radius' ? 'Radius (pm)' : 'Atomic Mass (u)'}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Thermodynamic Phase Simulator */}
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="space-y-1">
                        <h4 className="font-black text-brand-text uppercase tracking-tight flex items-center gap-2">
                            <Flame className="text-orange-500 animate-pulse" size={18} /> Thermodynamic Phase Simulator
                        </h4>
                        <p className="text-[10px] text-brand-text-secondary">
                            Drag the temperature slider to witness matter shift between solid, liquid, gaseous, and synthetic states.
                        </p>
                    </div>

                    <div className="flex bg-brand-bg p-0.5 rounded-lg border border-brand-border text-[9px] font-black uppercase">
                        <button 
                            onClick={() => setTempUnit('K')} 
                            className={`px-3 py-1 rounded-md transition-all ${tempUnit === 'K' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Kelvin (K)
                        </button>
                        <button 
                            onClick={() => setTempUnit('C')} 
                            className={`px-3 py-1 rounded-md transition-all ${tempUnit === 'C' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Celsius (°C)
                        </button>
                        <button 
                            onClick={() => setTempUnit('F')} 
                            className={`px-3 py-1 rounded-md transition-all ${tempUnit === 'F' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Fahrenheit (°F)
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 mt-6 items-center relative z-10">
                    {/* Slider & Presets */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest pl-0.5">Simulated Temperature</span>
                            <span className="text-lg font-black font-mono text-brand-primary tracking-tighter bg-brand-bg px-3.5 py-1 rounded-xl border border-brand-border">
                                {tempUnit === 'K' ? `${temperature.toFixed(1)} K` : tempUnit === 'C' ? `${(temperature - 273.15).toFixed(1)} °C` : `${((temperature - 273.15) * 1.8 + 32).toFixed(1)} °F`}
                            </span>
                        </div>

                        <div className="relative">
                            <input 
                                type="range" 
                                min="0" 
                                max="6000" 
                                step="5"
                                value={temperature}
                                onChange={e => setTemperature(parseFloat(e.target.value))}
                                className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary border border-brand-border"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { label: 'Absolute Zero (0 K)', val: 0 },
                                { label: 'Freezing Point (273.15 K)', val: 273.15 },
                                { label: 'Room Temp (298.15 K)', val: 298.15 },
                                { label: 'Water Boils (373.15 K)', val: 373.15 },
                                { label: 'Sun Surface (5778 K)', val: 5778 },
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => setTemperature(preset.val)}
                                    className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-md bg-brand-bg hover:bg-brand-primary/10 text-brand-text-secondary hover:text-brand-primary border border-brand-border/60 hover:border-brand-primary/30 transition-all"
                                >
                                    {preset.label.split(' (')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Phase Statistics Counts */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                        {[
                            { label: 'Solid', count: ELEMENTS.filter(e => getElementStateAtTemp(e, temperature) === 'solid').length, color: 'border-slate-500/20 text-slate-400 bg-slate-500/5' },
                            { label: 'Liquid', count: ELEMENTS.filter(e => getElementStateAtTemp(e, temperature) === 'liquid').length, color: 'border-blue-500/20 text-blue-400 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.05)]' },
                            { label: 'Gas', count: ELEMENTS.filter(e => getElementStateAtTemp(e, temperature) === 'gas').length, color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
                            { label: 'Synthetic', count: ELEMENTS.filter(e => getElementStateAtTemp(e, temperature) === 'synthetic').length, color: 'border-pink-500/20 text-pink-400 bg-pink-500/5' },
                        ].map(stat => (
                            <div key={stat.label} className={`border p-2.5 rounded-xl flex justify-between items-center ${stat.color}`}>
                                <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                <span className="text-sm font-black font-mono leading-none">{stat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trend Legend */}
            {viewMode !== 'category' && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between px-6 py-3 bg-brand-surface border border-brand-border rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                            <BarChart3 size={16} className="text-brand-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-text">
                            {viewMode === 'electronegativity' ? 'Electronegativity Scale (Pauling)' : 'Atomic Radius Scale (pm)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-brand-text-secondary">LOW</span>
                        <div 
                            className="w-32 h-2 rounded-full" 
                            style={{ 
                                background: viewMode === 'electronegativity' 
                                    ? 'linear-gradient(to right, rgb(0, 0, 255), rgb(255, 51, 0))' 
                                    : 'linear-gradient(to right, rgb(0, 255, 127.5), rgb(255, 255, 0))'
                            }} 
                        />
                        <span className="text-[9px] font-bold text-brand-text-secondary">HIGH</span>
                    </div>
                </motion.div>
            )}

            {/* Main Table Grid */}
            <div className="relative overflow-x-auto pb-4 pl-8 scrollbar-thin scrollbar-thumb-brand-primary/20 group">
                <div className="grid grid-cols-18 gap-1.5 min-w-[1250px] p-4 bg-brand-surface/20 rounded-3xl border border-brand-border/30 backdrop-blur-md shadow-2xl">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={`group-${i + 1}`} className="flex items-center justify-center h-8 mb-2">
                            <span className="text-[9px] font-black text-brand-primary opacity-40 tracking-widest uppercase whitespace-nowrap">
                                Group {i + 1}
                            </span>
                        </div>
                    ))}

                    {Array.from({ length: 7 * 18 }).map((_, i) => {
                        const row = Math.floor(i / 18) + 1;
                        const col = (i % 18) + 1;
                        const element = ELEMENTS.find(e => e.period === row && e.group === col);
                        const isMatch = element ? (
                            element.name.toLowerCase().includes(search.toLowerCase()) || 
                            element.symbol.toLowerCase().includes(search.toLowerCase()) ||
                            element.number.toString() === search
                        ) : false;

                        return (
                            <div key={i} className="aspect-square relative group/cell">
                                {col === 1 && (
                                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 flex justify-end">
                                        <span className="text-[9px] font-black text-brand-primary opacity-40 uppercase tracking-widest vertical-text whitespace-nowrap">
                                            Period {row}
                                        </span>
                                    </div>
                                )}
                                {element ? (
                                    <motion.button
                                        whileHover={{ scale: 1.12, zIndex: 10, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelected(element)}
                                        onMouseEnter={() => !search && setHoveredCategory(element.category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                        className={`w-full h-full rounded-xl shadow-lg flex flex-col items-center justify-between p-2.5 border transition-all duration-300 backdrop-blur-md relative overflow-hidden group/element ${selected?.number === element.number ? 'ring-2 ring-white border-transparent scale-110 z-20 shadow-brand-primary/50' : 'border-white/10'} ${(!isMatch && search) ? 'opacity-20 grayscale scale-95 blur-[1px]' : 'opacity-100 shadow-md'} ${compareA?.number === element.number ? 'ring-2 ring-cyan-400 border-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''} ${compareB?.number === element.number ? 'ring-2 ring-lime-400 border-transparent shadow-[0_0_15px_rgba(163,230,53,0.5)]' : ''}`}
                                        style={getElementStyle(element)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                        
                                        <div className="w-full flex justify-between items-start z-10">
                                            <span className="text-[9px] font-black opacity-40 leading-none">{getElementProperty(element)}</span>
                                            <div className="flex items-center gap-1">
                                                {/* State of matter dynamic indicator letter */}
                                                <span className={`text-[6px] font-black uppercase px-0.5 py-px rounded shrink-0 leading-none ${
                                                    getElementStateAtTemp(element, temperature) === 'gas' ? 'bg-purple-500/20 text-purple-400' :
                                                    getElementStateAtTemp(element, temperature) === 'liquid' ? 'bg-blue-500/20 text-blue-400' :
                                                    getElementStateAtTemp(element, temperature) === 'synthetic' ? 'bg-pink-500/20 text-pink-400' :
                                                    'bg-slate-500/20 text-slate-300'
                                                }`}>
                                                    {getElementStateAtTemp(element, temperature)[0]}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: element.color }} />
                                            </div>
                                        </div>

                                        <span className="text-lg font-black tracking-tighter z-10 leading-none -mt-1 group-hover/element:scale-110 transition-transform">{element.symbol}</span>
                                        
                                        <span className="text-[7px] font-black uppercase tracking-tight opacity-70 truncate w-full text-center z-10 leading-none">
                                            {element.name}
                                        </span>

                                        {/* Comparison Badge Label overlay if active */}
                                        {compareA?.number === element.number && (
                                            <div className="absolute bottom-1 right-1 px-1 py-px rounded bg-cyan-400 text-black text-[6px] font-black leading-none z-20">A</div>
                                        )}
                                        {compareB?.number === element.number && (
                                            <div className="absolute bottom-1 right-1 px-1 py-px rounded bg-lime-400 text-black text-[6px] font-black leading-none z-20">B</div>
                                        )}
                                        
                                        {/* Subtle Glow Background */}
                                        <div 
                                            className="absolute bottom-0 left-0 w-full h-1/3 opacity-30 pointer-events-none blur-xl group-hover/element:opacity-50 transition-opacity"
                                            style={{ backgroundColor: element.color }}
                                        />
                                    </motion.button>
                                ) : (
                                    <div className="w-full h-full border border-brand-border/10 rounded-xl bg-brand-surface/5 flex items-center justify-center group/empty transition-all">
                                        <div className="w-1 h-1 rounded-full bg-brand-border/20 group-hover/empty:scale-150 transition-transform" />
                                        <div className="absolute top-1 left-1 text-[6px] font-black text-brand-text-secondary opacity-[0.05] group-hover/empty:opacity-20 uppercase">
                                            {row}:{col}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap justify-center gap-3 px-4 py-3 bg-brand-surface/20 rounded-2xl border border-brand-border/40">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                    <div 
                        key={cat} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border/40 cursor-default transition-all ${hoveredCategory === cat ? 'bg-brand-primary/10 border-brand-primary/40 scale-105' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-text">{cat}</span>
                    </div>
                ))}
            </div>

            {!isAnyMatch && search && (
                <div className="text-center py-10 text-brand-text-secondary bg-brand-surface/20 rounded-2xl border border-dashed border-brand-border">
                    <p>No elements match your search "<span className="text-brand-primary font-bold">{search}</span>"</p>
                </div>
            )}

            {/* Direct Head-to-Head Comparative Deck */}
            <AnimatePresence mode="wait">
                {compareA && compareB && (
                    <motion.div
                        key={`${compareA.symbol}-${compareB.symbol}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ElementComparison 
                            elementA={compareA} 
                            elementB={compareB} 
                            onClear={() => { setCompareA(null); setCompareB(null); }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chemistry Sandbox Dashboard */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border/40 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-brand-text uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="text-brand-primary" size={20} /> Chemical Sandbox Labs
                        </h3>
                        <p className="text-xs text-brand-text-secondary">Explore thermodynamic properties, build chemical formulas, test solubility and practice your atomic trivia.</p>
                    </div>

                    <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border text-[10px] font-black uppercase shadow-inner">
                        <button 
                            onClick={() => setSandboxTab('synthesis')} 
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sandboxTab === 'synthesis' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            <FlaskConical size={14} /> Molecule Builder
                        </button>
                        <button 
                            onClick={() => setSandboxTab('solubility')} 
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sandboxTab === 'solubility' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            <Layers size={14} /> Solubility Rules
                        </button>
                        <button 
                            onClick={() => setSandboxTab('quiz')} 
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sandboxTab === 'quiz' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            <HelpCircle size={14} /> Academic Quiz
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {sandboxTab === 'synthesis' && (
                        <motion.div key="synthesis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                            <MoleculeBuilder ingredients={ingredients} setIngredients={setIngredients} />
                        </motion.div>
                    )}
                    {sandboxTab === 'solubility' && (
                        <motion.div key="solubility" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                            <SolubilityChecker />
                        </motion.div>
                    )}
                    {sandboxTab === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                            <ChemistryQuiz />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Details Panel */}
            <AnimatePresence mode="wait">
                {selected ? (
                    <motion.div
                        key={selected.number}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-brand-primary/10"
                    >
                        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                            <Atom size={300} />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-10 items-start">
                            {/* Big Element Card */}
                            <div className="w-full lg:w-48 h-48 rounded-3xl flex flex-col items-center justify-center border-2 border-brand-primary shadow-2xl bg-brand-bg relative shrink-0 overflow-hidden" 
                                 style={{ boxShadow: `0 20px 40px ${selected.color}25`, borderColor: selected.color }}>
                                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(45deg, transparent, ${selected.color})` }} />
                                <span className="text-3xl font-mono text-brand-text-secondary mb-1">{selected.number}</span>
                                <span className="text-7xl font-black text-brand-text leading-none">{selected.symbol}</span>
                                <span className="text-base font-mono text-brand-text-secondary mt-2">{selected.mass.toFixed(4)}</span>
                            </div>

                            {/* Property Matrix */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-baseline gap-3">
                                        <h4 className="text-4xl font-black text-brand-text tracking-tight">{selected.name}</h4>
                                        <span style={{ backgroundColor: `${selected.color}20`, color: selected.color }} 
                                              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current w-fit">
                                            {selected.category}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                            {getElementBlock(selected).toUpperCase()}-Block
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${selected.name} (${selected.symbol}) - Atomic #${selected.number}, Mass: ${selected.mass} u`);
                                            setCopiedSymbol(true);
                                            setTimeout(() => setCopiedSymbol(false), 2000);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-brand-text-secondary hover:text-brand-text text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                        {copiedSymbol ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                        {copiedSymbol ? 'Copied Details' : 'Copy Spec'}
                                    </button>
                                </div>

                                <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed bg-brand-bg/30 p-4 rounded-xl italic">
                                    "{selected.summary}"
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <DetailStat label="Density" value={selected.density || 'N/A'} unit="g/cm³" max={22.6} icon={Layers} />
                                    <DetailStat label="Melting Point" value={selected.melting_point || 'N/A'} unit="K" max={3800} icon={Thermometer} />
                                    <DetailStat label="Boiling Point" value={selected.boiling_point || 'N/A'} unit="K" max={6000} icon={Thermometer} />
                                    <DetailStat label="Electronegativity" value={selected.electronegativity || 'N/A'} max={4} icon={TrendingUp} />
                                </div>

                                {/* AI Research section */}
                                <div className="mt-8 pt-8 border-t border-brand-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="text-brand-primary" size={20} />
                                            <h5 className="text-sm font-black uppercase tracking-widest text-brand-text">AI RESEARCH BRIEF</h5>
                                        </div>
                                        <button 
                                            onClick={askAiForElement}
                                            disabled={isAiThinking}
                                            className="px-4 py-1.5 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest transition-all border border-brand-primary/20 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isAiThinking ? (
                                                <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
                                            ) : (
                                                <><Sparkles size={12} /> Deep Dive</>
                                            )}
                                        </button>
                                    </div>

                                    {aiInsight ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 prose prose-invert prose-sm max-w-none markdown-body"
                                        >
                                            <ReactMarkdown>{aiInsight}</ReactMarkdown>
                                        </motion.div>
                                    ) : (
                                        <div className="p-6 bg-brand-bg/30 rounded-2xl border border-dashed border-brand-border text-center">
                                            <p className="text-xs text-brand-text-secondary">Click "Deep Dive" for an AI-powered scientific briefing on this element.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-xl backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-black text-brand-primary tracking-widest mb-6 px-1 flex items-center gap-2">
                                        <Atom size={12} /> Quantum Structure
                                    </p>
                                    <div className="flex flex-col md:flex-row items-center gap-12">
                                        <div className="shrink-0 flex justify-center w-full md:w-auto p-4 bg-brand-bg/40 rounded-3xl border border-white/5">
                                            <BohrModel n={selected.number} color={selected.color} />
                                        </div>
                                        <div className="flex-1 space-y-6 w-full">
                                            <div className="p-4 bg-brand-bg/60 rounded-2xl border border-brand-border">
                                                <p className="text-[10px] text-brand-text-secondary uppercase font-black tracking-tighter mb-2">Electron Configuration</p>
                                                <p className="font-mono text-2xl font-black text-brand-text tracking-tighter">
                                                    {getElectronConfiguration(selected.number)}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {getShellComposition(selected.number).map((count, i) => (
                                                    <div key={i} className="flex flex-col items-center group/shell">
                                                        <div className="w-12 h-12 rounded-2xl border-2 border-brand-primary shadow-[inset_0_0_15px_rgba(66,153,225,0.2)] flex flex-col items-center justify-center bg-brand-bg/80 relative overflow-hidden group-hover/shell:scale-110 transition-transform">
                                                            <span className="text-xs font-black text-brand-text leading-none">{count}</span>
                                                            <span className="text-[8px] font-black text-brand-primary uppercase mt-0.5">e⁻</span>
                                                        </div>
                                                        <span className="text-[9px] text-brand-text-secondary mt-1.5 font-black uppercase tracking-widest">n={i+1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-6 border-t border-brand-border/40 mt-4">
                                    <div className="px-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs">
                                        <span className="text-brand-text-secondary uppercase text-[8px] block mb-0.5 font-black">Atomic Radius</span>
                                        <span className="font-black text-brand-text">{selected.atomic_radius || 'N/A'} pm</span>
                                    </div>
                                    <div className="px-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs">
                                        <span className="text-brand-text-secondary uppercase text-[8px] block mb-0.5 font-black">Group / Period</span>
                                        <span className="font-black text-brand-text">G {selected.group} / P {selected.period}</span>
                                    </div>
                                    
                                    <div className="flex-1" />
                                    
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => setCompareA(selected)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${compareA?.number === selected.number ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'}`}
                                        >
                                            <ArrowLeftRight size={12} /> Set Left (A)
                                        </button>
                                        <button
                                            onClick={() => setCompareB(selected)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${compareB?.number === selected.number ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : 'bg-lime-500/10 border-lime-500/20 text-lime-400 hover:bg-lime-500/20'}`}
                                        >
                                            <ArrowLeftRight size={12} /> Set Right (B)
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIngredients(prev => ({
                                                    ...prev,
                                                    [selected.symbol]: (prev[selected.symbol] || 0) + 1
                                                }));
                                                setSandboxTab('synthesis');
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 text-green-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <FlaskConical size={12} /> Add to Lab Flask
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 bg-brand-bg hover:bg-brand-surface rounded-full transition-colors border border-brand-border">✕</button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-brand-surface/30 border border-dashed border-brand-border/50 rounded-2xl p-12 text-center">
                        <div className="mb-4 text-brand-primary opacity-20 flex justify-center">
                            <Atom size={48} />
                        </div>
                        <p className="text-sm text-brand-text-secondary">Select an element to view detailed physical and chemical properties.</p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8 opacity-40 grayscale">
                             {categories.map(cat => (
                                 <div key={cat} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                                     <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ELEMENTS.find(e => e.category === cat)?.color }} />
                                     {cat}
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DetailStat = ({ label, value, icon: Icon, unit, max }: { label: string; value: string | number; icon: any; unit?: string; max?: number }) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    const percent = max && !isNaN(numericValue) ? (numericValue / max) * 100 : 0;

    return (
        <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-border/50 group/stat hover:border-brand-primary/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary group-hover/stat:bg-brand-primary group-hover/stat:text-white transition-colors">
                    <Icon size={12} />
                </div>
                <span className="text-[9px] uppercase font-black text-brand-text-secondary tracking-widest leading-none">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-brand-text tracking-tighter">{value}</span>
                {unit && <span className="text-[10px] font-bold text-brand-text-secondary uppercase">{unit}</span>}
            </div>
            {max && (
                <div className="mt-3 h-1 bg-brand-bg rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percent, 100)}%` }}
                        className="h-full bg-brand-primary shadow-[0_0_8px_rgba(66,153,225,0.4)]" 
                    />
                </div>
            )}
        </div>
    );
};

export default PeriodicTable;
