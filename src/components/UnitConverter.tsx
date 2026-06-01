import { useState, useMemo, useCallback } from 'react';
import { ArrowRightLeft, Sparkles, Loader2, Info, Ruler, Weight, Thermometer, Clock, Database, ChevronRight, Target, ChevronDown } from 'lucide-react';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

const CONVERSION_DATA = {
  Length: {
    icon: Ruler,
    baseUnit: 'Meter',
    units: {
      Meter: 1,
      Kilometer: 1000,
      Centimeter: 0.01,
      Millimeter: 0.001,
      Mile: 1609.34,
      Yard: 0.9144,
      Foot: 0.3048,
      Inch: 0.0254,
    },
  },
  Mass: {
    icon: Weight,
    baseUnit: 'Kilogram',
    units: {
      Kilogram: 1,
      Gram: 0.001,
      Milligram: 1e-6,
      Pound: 0.453592,
      Ounce: 0.0283495,
      Tonne: 1000,
    },
  },
  Temperature: {
    icon: Thermometer,
    // Special handling, no base unit factor
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
  },
  Time: {
    icon: Clock,
    baseUnit: 'Second',
    units: {
      Second: 1,
      Minute: 60,
      Hour: 3600,
      Day: 86400,
      Week: 604800,
      Month: 2.628e6, // approx
      Year: 3.154e7, // approx
    },
  },
  'Data Storage': {
    icon: Database,
    baseUnit: 'Byte',
    units: {
        Byte: 1,
        Kilobyte: 1024,
        Megabyte: Math.pow(1024, 2),
        Gigabyte: Math.pow(1024, 3),
        Terabyte: Math.pow(1024, 4),
    }
  }
};

type Category = keyof typeof CONVERSION_DATA;

export const UnitConverter = () => {
  const [category, setCategory] = useState<Category>('Length');
  const [fromUnit, setFromUnit] = useState<string>('Meter');
  const [toUnit, setToUnit] = useState<string>('Foot');
  const [inputValue, setInputValue] = useState<string>('1');
  const [smartQuery, setSmartQuery] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [smartResult, setSmartResult] = useState<{value: string, note?: string, comparison?: string} | null>(null);

  const unitsForCategory = useMemo(() => {
    const data = CONVERSION_DATA[category];
    return 'baseUnit' in data ? Object.keys(data.units) : data.units;
  }, [category]);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    const data = CONVERSION_DATA[newCategory];
    const newUnits = 'baseUnit' in data
        ? Object.keys(data.units) 
        : data.units;
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
    setInputValue('1');
  };
  
  const swapUnits = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const outputValue = useMemo(() => {
    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) return '0.000000';

    if (category === 'Temperature') {
      if (fromUnit === toUnit) return inputNum.toPrecision(6);
      let tempInCelsius: number;
      // Convert to Celsius first
      if (fromUnit === 'Fahrenheit') tempInCelsius = (inputNum - 32) * 5 / 9;
      else if (fromUnit === 'Kelvin') tempInCelsius = inputNum - 273.15;
      else tempInCelsius = inputNum;
      
      // Convert from Celsius to target
      if (toUnit === 'Fahrenheit') return (tempInCelsius * 9 / 5 + 32).toPrecision(6);
      if (toUnit === 'Kelvin') return (tempInCelsius + 273.15).toPrecision(6);
      return tempInCelsius.toPrecision(6);
    }
    
    const categoryData = CONVERSION_DATA[category];
    if (!('baseUnit' in categoryData)) return '0.000000';

    const units = categoryData.units as Record<string, number>;
    const fromFactor = units[fromUnit];
    const toFactor = units[toUnit];
    const valueInBase = inputNum * fromFactor;
    const result = valueInBase / toFactor;
    
    return result.toPrecision(6);
  }, [inputValue, fromUnit, toUnit, category]);

  const handleSmartConvert = async () => {
    if (!smartQuery.trim()) return;
    setIsSmartLoading(true);
    setSmartResult(null);

    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Convert this and return ONLY JSON: {"value": "numerical_result_as_string", "unit": "unit_name", "note": "brief_explanation_or_fact", "comparison": "an interesting real-world comparison for this value"}. Input: ${smartQuery}`,
            config: {
                systemInstruction: "You are a unit conversion specialist. If the input is ambiguous, give the most likely conversion. Return strictly valid JSON. In 'comparison', provide a relatable fact (e.g., 'This is roughly the weight of 2 blue whales' or 'This distance is about 5 Marathons')."
            }
        });
        
        const text = response.text || "{}";
        const cleaned = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        setSmartResult({ 
            value: `${data.value} ${data.unit}`, 
            note: data.note,
            comparison: data.comparison 
        });
    } catch (err) {
        console.error(err);
        setSmartResult({ value: "Error", note: "Could not process your request. Try formatted input like '10kg to lbs'." });
    } finally {
        setIsSmartLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-lg shadow-brand-primary/20 transition-transform hover:scale-110 active:scale-95 duration-300">
                <ArrowRightLeft size={24} />
            </div>
            <div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Universal Converter</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">Multi-dimensional translation protocol</p>
                </div>
            </div>
        </div>
      </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Categories */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:z-20">
            <h3 className="hidden lg:flex text-xs font-black text-brand-text-secondary uppercase tracking-[0.3em] px-2 items-center gap-2">
                <ChevronRight size={14} className="text-brand-primary" />
                Dimensions
            </h3>
            
            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden sticky top-2 z-40 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="rounded-2xl bg-brand-surface/95 border border-brand-primary/20 backdrop-blur-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] shadow-brand-bg">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Dimension</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{category}</span>
                    </div>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value as Category)}
                            className="w-full appearance-none bg-brand-bg border border-brand-border/50 hover:border-brand-primary/50 text-brand-text text-sm font-bold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                        >
                            {(Object.keys(CONVERSION_DATA) as Category[]).map(cat => (
                                <option key={cat} value={cat} className="bg-brand-bg text-brand-text font-bold">
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-brand-text">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation List */}
            <div className="hidden lg:flex flex-col gap-2 pb-0">
                {(Object.entries(CONVERSION_DATA) as [Category, any][]).map(([cat, data]) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all min-w-max text-left border relative group ${
                            category === cat 
                                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                                : 'bg-brand-surface/20 border-brand-border/20 text-brand-text-secondary hover:bg-brand-surface/40 hover:text-white'
                        }`}
                    >
                        {category === cat && (
                            <motion.div 
                                layoutId="catActive"
                                className="absolute inset-0 bg-brand-primary/5 rounded-2xl pointer-events-none"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <data.icon size={18} className="relative z-10" />
                        <span className="text-sm relative z-10">{cat}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Right Col: Interface */}
        <div className="lg:col-span-9 space-y-8">
            {/* Smart Assistant Bar */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition-opacity" />
                <div className="relative flex gap-2 p-2 bg-brand-bg/80 border border-brand-border/50 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center pl-4 text-brand-primary">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <input 
                        value={smartQuery}
                        onChange={e => setSmartQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSmartConvert()}
                        placeholder="NLP Search: '150 mph to km/h' or 'distance to Moon in meters'..."
                        className="flex-1 bg-transparent border-none outline-none p-4 text-sm text-brand-text font-bold placeholder:text-brand-text-secondary/50"
                    />
                    <button 
                        onClick={handleSmartConvert}
                        disabled={isSmartLoading}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-bg px-8 rounded-xl transition-all shadow-lg shadow-brand-primary/20 font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-2 active:scale-95"
                    >
                        {isSmartLoading ? <Loader2 size={16} className="animate-spin" /> : 'CONVERT'}
                    </button>
                </div>
                
                <AnimatePresence>
                    {smartResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full mt-4 p-6 bg-brand-bg border border-brand-primary/30 rounded-[2rem] shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
                            <div className="relative flex items-start gap-6">
                                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                    <Info size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">AI Derivative Result</h4>
                                        <button onClick={() => setSmartResult(null)} className="text-brand-text-secondary hover:text-white transition-colors">✕</button>
                                    </div>
                                    <p className="text-4xl font-black text-white font-glow tracking-tighter mb-2">{smartResult.value}</p>
                                    {smartResult.note && <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">{smartResult.note}</p>}
                                    {smartResult.comparison && (
                                        <div className="p-4 rounded-2xl bg-brand-surface/30 border border-brand-border/10">
                                            <p className="text-[10px] uppercase font-bold text-brand-primary tracking-widest mb-1 flex items-center gap-2">
                                                <Target size={12} /> Analytical context
                                            </p>
                                            <p className="text-xs text-brand-text leading-relaxed italic">{smartResult.comparison}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Standard Interface */}
            <div className="bg-brand-surface/20 border border-brand-border/40 p-8 md:p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-sm relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[3.5rem]" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Source */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1">Source Input</label>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                className="w-full bg-brand-bg/50 border border-brand-border/40 rounded-3xl p-6 font-mono text-4xl text-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none shadow-inner"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={fromUnit}
                                onChange={e => setFromUnit(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-border/20 rounded-2xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer appearance-none pr-12"
                            >
                                {unitsForCategory.map(unit => <option key={unit}>{unit}</option>)}
                            </select>
                            <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-text-secondary pointer-events-none" />
                        </div>
                    </div>

                    {/* Swap Button (Absolute Center on Desktop, Inline on Mobile) */}
                    <div className="flex items-center justify-center -my-6 md:my-0">
                        <button 
                            onClick={swapUnits} 
                            className="w-16 h-16 bg-brand-primary text-brand-bg hover:bg-brand-accent rounded-2xl transition-all transform hover:rotate-180 active:scale-90 shadow-2xl shadow-brand-primary/30 flex items-center justify-center group"
                        >
                            <ArrowRightLeft size={28} className="group-active:scale-110" />
                        </button>
                    </div>

                    {/* Target */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1">Computed Projection</label>
                            <div className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-3xl p-6 font-mono text-4xl text-brand-accent min-h-[92px] flex items-center overflow-hidden font-glow tracking-tighter shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.05)]">
                                {outputValue}
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={toUnit}
                                onChange={e => setToUnit(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-border/20 rounded-2xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer appearance-none pr-12"
                            >
                                {unitsForCategory.map(unit => <option key={unit}>{unit}</option>)}
                            </select>
                            <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-text-secondary pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 flex items-center justify-center gap-8">
                    {/* Visual accents */}
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-border/20 to-transparent" />
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-primary/20" />)}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-border/20 to-transparent" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
