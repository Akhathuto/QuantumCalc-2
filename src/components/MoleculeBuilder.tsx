import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Thermometer, FlaskConical, Trash2, Plus, Minus, Info } from 'lucide-react';
import { ELEMENTS, Element } from './PeriodicTableData';

// Dictionary of common compounds with names and scientific summaries
const COMMON_COMPOUNDS: Record<string, { name: string; desc: string }> = {
    'H2O': { name: 'Water (Dihydrogen Monoxide)', desc: 'The universal solvent, critical for all known forms of life.' },
    'CO2': { name: 'Carbon Dioxide', desc: 'A vital greenhouse gas used by photoautotrophic organisms for photosynthesis.' },
    'CO': { name: 'Carbon Monoxide', desc: 'A highly hazardous, colorless, and odorless toxic gas that binds tightly to hemoglobin.' },
    'NaCl': { name: 'Sodium Chloride (Table Salt)', desc: 'Classic ionic compound essential for fluid balance and cellular communication.' },
    'C6H12O6': { name: 'Glucose', desc: 'The primary simple sugar and energy currency of cellular respiration.' },
    'CH4': { name: 'Methane (Natural Gas)', desc: 'The simplest hydrocarbon alkane and a powerful greenhouse gas.' },
    'NH3': { name: 'Ammonia', desc: 'A pungent, alkaline nitrogen compound widely utilized in modern agricultural fertilizers.' },
    'H2SO4': { name: 'Sulfuric Acid (Oil of Vitriol)', desc: 'An extremely strong, corrosive mineral acid essential for industrial manufacturing.' },
    'HCl': { name: 'Hydrochloric Acid', desc: 'A highly corrosive, strong acid naturally found in mammalian gastric secretions.' },
    'NaOH': { name: 'Sodium Hydroxide (Caustic Soda)', desc: 'A strong alkaline lye compound key in soap, paper, and industrial production.' },
    'C2H5OH': { name: 'Ethanol (Ethyl Alcohol)', desc: 'The standard volatile, flammable psychoactive alcohol found in recreational drinks.' },
    'CaCO3': { name: 'Calcium Carbonate', desc: 'A common geological mineral found in rocks, marine shells, pearls, and chalk.' },
    'NaHCO3': { name: 'Sodium Bicarbonate (Baking Soda)', desc: 'An amphoteric salt used as a leavening agent, deodorizer, and buffer.' },
    'H2O2': { name: 'Hydrogen Peroxide', desc: 'A simple, pale-blue oxidizing agent commonly used as a bleaching agent and antiseptic.' },
    'SiO2': { name: 'Silicon Dioxide (Quartz)', desc: 'A covalent network solid widely found in nature as sand or quartz, central to glass making.' }
};

// Pure utility function to parse chemical formula manually entered by the user
const parseFormula = (formulaStr: string): Record<string, number> => {
    if (!formulaStr) return {};

    const counts: Record<string, number> = {};
    let processed = formulaStr.trim();
    
    // Handle simple parentheses like (NH4)2 -> NH4 twice
    const parenRegex = /\(([^)]+)\)(\d*)/g;
    let match;
    while ((match = parenRegex.exec(processed)) !== null) {
        const sub = match[1];
        const multiplier = parseInt(match[2] || '1');
        const subCounts = parseFormula(sub);
        for (const [sym, count] of Object.entries(subCounts)) {
            counts[sym] = (counts[sym] || 0) + count * multiplier;
        }
        processed = processed.replace(match[0], '');
    }

    const elementRegex = /([A-Z][a-z]?)(\d*)/g;
    while ((match = elementRegex.exec(processed)) !== null) {
        const sym = match[1];
        const count = parseInt(match[2] || '1');
        counts[sym] = (counts[sym] || 0) + count;
    }

    // Verify element existence
    for (const sym of Object.keys(counts)) {
        const exists = ELEMENTS.some(e => e.symbol === sym);
        if (!exists) throw new Error(`Unknown element: "${sym}"`);
    }

    return counts;
};

interface MoleculeBuilderProps {
    ingredients: Record<string, number>;
    setIngredients: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export const MoleculeBuilder = ({ ingredients, setIngredients }: MoleculeBuilderProps) => {
    const [typedFormula, setTypedFormula] = useState('');
    const [useManualInput, setUseManualInput] = useState(false);
    const [error, setError] = useState('');
    const [parsedManualIngredients, setParsedManualIngredients] = useState<Record<string, number> | null>(null);

    const activeIngredientsList = useMemo(() => {
        return Object.entries(ingredients)
            .filter(([_, count]) => count > 0)
            .map(([symbol, count]) => {
                const element = ELEMENTS.find(e => e.symbol === symbol);
                return { symbol, count, element };
            });
    }, [ingredients]);

    const builtFormulaString = useMemo(() => {
        return Object.entries(ingredients)
            .filter(([_, count]) => count > 0)
            .map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`)
            .join('');
    }, [ingredients]);

    // Parse whenever manual input changes
    useEffect(() => {
        if (useManualInput && typedFormula) {
            try {
                const parsed = parseFormula(typedFormula);
                setParsedManualIngredients(parsed);
                setError('');
            } catch (e: any) {
                setParsedManualIngredients(null);
                setError(e.message);
            }
        } else {
            setParsedManualIngredients(null);
            setError('');
        }
    }, [useManualInput, typedFormula]);

    const handleManualCalc = () => {
        if (parsedManualIngredients && !error) {
            setIngredients(parsedManualIngredients);
        }
    };

    const handleIncrement = (symbol: string) => {
        setIngredients(prev => ({
            ...prev,
            [symbol]: (prev[symbol] || 0) + 1
        }));
    };

    const handleDecrement = (symbol: string) => {
        setIngredients(prev => {
            const current = prev[symbol] || 0;
            if (current <= 1) {
                const next = { ...prev };
                delete next[symbol];
                return next;
            }
            return {
                ...prev,
                [symbol]: current - 1
            };
        });
    };

    const handleClear = () => {
        setIngredients({});
        setTypedFormula('');
        setError('');
    };

    const calculatedResult = useMemo(() => {
        const activeList = useManualInput ? 
            Object.entries(parsedManualIngredients || {}).map(([sym, count]) => ({
                symbol: sym,
                count,
                element: ELEMENTS.find(e => e.symbol === sym)
            })) : activeIngredientsList;

        if (activeList.length === 0) return null;

        let totalMass = 0;
        const breakdown = [];

        for (const item of activeList) {
            if (!item.element) continue;
            const mass = item.element.mass * item.count;
            totalMass += mass;
            breakdown.push({
                symbol: item.symbol,
                element: item.element,
                count: item.count,
                mass,
                percent: 0
            });
        }

        breakdown.forEach(item => {
            item.percent = totalMass > 0 ? (item.mass / totalMass) * 100 : 0;
        });

        // Search for common compound details
        const currentFormula = useManualInput ? typedFormula : builtFormulaString;
        const compoundDetail = COMMON_COMPOUNDS[currentFormula] || null;

        return {
            totalMass,
            composition: breakdown,
            formula: currentFormula,
            compound: compoundDetail
        };
    }, [useManualInput, parsedManualIngredients, activeIngredientsList, typedFormula, builtFormulaString]);

    return (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group min-h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div>
                <div className="flex justify-between items-center relative z-10 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                            <FlaskConical size={20} />
                        </div>
                        <h4 className="font-black text-brand-text uppercase tracking-tighter">Molecular Synthesis Lab</h4>
                    </div>

                    <div className="flex bg-brand-bg p-0.5 rounded-lg border border-brand-border text-[9px] font-black uppercase">
                        <button 
                            onClick={() => { setUseManualInput(false); handleClear(); }} 
                            className={`px-2.5 py-1 rounded-md transition-all ${!useManualInput ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Build
                        </button>
                        <button 
                            onClick={() => { setUseManualInput(true); handleClear(); }} 
                            className={`px-2.5 py-1 rounded-md transition-all ${useManualInput ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Type
                        </button>
                    </div>
                </div>

                {!useManualInput ? (
                    <div className="space-y-4 relative z-10">
                        {activeIngredientsList.length === 0 ? (
                            <div className="p-6 bg-brand-bg/40 border border-dashed border-brand-border rounded-2xl text-center space-y-2">
                                <p className="text-xs text-brand-text-secondary leading-relaxed">
                                    Your molecular flask is currently empty.
                                </p>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest leading-none">
                                    Click elements on the Periodic Table to synthesize!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] uppercase font-black text-brand-text-secondary tracking-widest pl-1">Recipe Ingredients</p>
                                    <button 
                                        onClick={handleClear}
                                        className="text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-all"
                                    >
                                        <Trash2 size={12} /> Empty Flask
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                    {activeIngredientsList.map(item => (
                                        <div key={item.symbol} className="flex items-center justify-between bg-brand-bg/60 p-2 rounded-xl border border-brand-border/60 hover:border-brand-primary/30 transition-all">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow" style={{ backgroundColor: item.element?.color }}>
                                                    {item.symbol}
                                                </div>
                                                <span className="text-[10px] font-black text-brand-text">{item.element?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDecrement(item.symbol)} className="p-1 bg-brand-bg rounded hover:bg-brand-primary/20 text-brand-text-secondary hover:text-brand-primary transition-colors">
                                                    <Minus size={10} />
                                                </button>
                                                <span className="text-xs font-black font-mono w-4 text-center">{item.count}</span>
                                                <button onClick={() => handleIncrement(item.symbol)} className="p-1 bg-brand-bg rounded hover:bg-brand-primary/20 text-brand-text-secondary hover:text-brand-primary transition-colors">
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 relative z-10">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={typedFormula}
                                onChange={e => { setTypedFormula(e.target.value); setError(''); }}
                                placeholder="e.g., C6H12O6, H2SO4, (NH4)2SO4"
                                className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none font-mono tracking-widest placeholder:text-brand-text-secondary/50 transition-all font-bold"
                            />
                            <button 
                                onClick={handleManualCalc}
                                className="bg-brand-primary text-white px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:shadow-lg transition-all active:scale-95 text-xs"
                            >
                                Parse Formula
                            </button>
                        </div>
                        {error && <p className="text-[10px] text-red-400 font-black uppercase tracking-widest ml-1">{error}</p>}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {calculatedResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 pt-4 relative z-10 border-t border-brand-border/40 mt-4"
                    >
                        {calculatedResult.compound && (
                            <div className="p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex items-start gap-2.5">
                                <div className="p-1 bg-brand-primary/10 rounded-lg text-brand-primary mt-0.5 shrink-0">
                                    <Info size={12} />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="text-[10px] font-black uppercase text-brand-primary tracking-wide">{calculatedResult.compound.name}</h5>
                                    <p className="text-[9px] text-brand-text-secondary font-medium leading-relaxed">{calculatedResult.compound.desc}</p>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-brand-bg/80 rounded-2xl border border-brand-primary/20 backdrop-blur-sm flex justify-between items-center shadow-inner">
                            <div>
                                <span className="text-[10px] text-brand-text-secondary uppercase font-black tracking-widest block mb-0.5">
                                    Molecular Mass ({calculatedResult.formula})
                                </span>
                                <span className="text-xl font-black text-brand-primary font-mono tracking-tighter">
                                    {calculatedResult.totalMass.toFixed(4)} <span className="text-xs opacity-60">g/mol</span>
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-4 border-brand-primary/10 border-r-brand-primary animate-spin-slow" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-black text-brand-text-secondary tracking-[0.2em] pl-1">Composition Ratio</p>
                            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                                {calculatedResult.composition.map(item => (
                                    <div key={item.symbol} className="flex items-center gap-3 bg-brand-bg/40 p-2.5 rounded-xl border border-brand-border group/row hover:border-brand-primary/25 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center font-black text-xs text-brand-primary border border-brand-border shadow-md">
                                            {item.symbol}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter px-0.5 opacity-75">
                                                <span>{item.count} atom(s) • {(item.count * (item.element?.mass || 0)).toFixed(2)} u</span>
                                                <span>{item.percent.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1 bg-brand-bg rounded-full overflow-hidden p-[1px]">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percent}%` }}
                                                    className="h-full bg-brand-primary rounded-full shadow-[0_0_8px_rgba(66,153,225,0.4)]" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
