
import { useState, useMemo, useCallback } from 'react';
import { ArrowRightLeft, Sparkles, Loader2, Info } from 'lucide-react';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

const CONVERSION_DATA = {
  Length: {
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
    // Special handling, no base unit factor
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
  },
  Time: {
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
    if (isNaN(inputNum)) return '';

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
    if (!('baseUnit' in categoryData)) return '';

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
            model: "gemini-2.5-flash",
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-brand-primary">Unit Converter</h2>
        
        {/* Smart Assistant Bar */}
        <div className="mb-8 relative">
            <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border rounded-2xl shadow-lg">
                <div className="flex items-center pl-4 text-brand-primary">
                    <Sparkles size={18} />
                </div>
                <input 
                    value={smartQuery}
                    onChange={e => setSmartQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSmartConvert()}
                    placeholder="Ask Nolo Smart Converter: '150 mph to km/h' or 'distance to Moon in meters'..."
                    className="flex-1 bg-transparent border-none outline-none p-3 text-sm text-brand-text"
                />
                <button 
                    onClick={handleSmartConvert}
                    disabled={isSmartLoading}
                    className="bg-brand-primary hover:bg-brand-secondary text-white px-6 rounded-xl transition-all font-bold text-xs disabled:opacity-50"
                >
                    {isSmartLoading ? <Loader2 size={16} className="animate-spin" /> : 'CONVERT'}
                </button>
            </div>
            
            <AnimatePresence>
                {smartResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 right-0 top-full mt-2 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-xl backdrop-blur-md z-10"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-brand-primary rounded-full text-white">
                                <Info size={14} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-brand-primary">{smartResult.value}</p>
                                {smartResult.note && <p className="text-xs text-brand-text-secondary mt-1">{smartResult.note}</p>}
                                {smartResult.comparison && (
                                    <div className="mt-2 pt-2 border-t border-brand-primary/20">
                                        <p className="text-[10px] uppercase font-bold text-brand-primary tracking-widest">Real-world Comparison</p>
                                        <p className="text-xs text-brand-text italic">{smartResult.comparison}</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSmartResult(null)} className="ml-auto text-brand-text-secondary hover:text-brand-text">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-6 bg-brand-surface/50 rounded-2xl border border-brand-border shadow-inner">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-brand-text-secondary mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as Category)}
              className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 focus:ring-brand-primary focus:border-brand-primary"
            >
              {Object.keys(CONVERSION_DATA).map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2">
                  <label htmlFor="from-unit" className="block text-sm font-medium text-brand-text-secondary mb-1">From</label>
                  <input
                      type="number"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary focus:border-brand-primary"
                  />
                  <select
                      id="from-unit"
                      value={fromUnit}
                      onChange={e => setFromUnit(e.target.value)}
                      className="w-full mt-2 bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
                  >
                      {unitsForCategory.map(unit => <option key={unit}>{unit}</option>)}
                  </select>
              </div>

              <div className="flex items-center justify-center">
                  <button onClick={swapUnits} className="p-3 bg-brand-primary/80 hover:bg-brand-primary rounded-full transition-transform transform hover:rotate-180">
                      <ArrowRightLeft size={20} />
                  </button>
              </div>

              <div className="sm:col-span-2">
                  <label htmlFor="to-unit" className="block text-sm font-medium text-brand-text-secondary mb-1">To</label>
                  <div className="w-full bg-gray-900/50 border-gray-700 rounded-md p-3 font-mono text-lg min-h-[50px] flex items-center">
                      {outputValue}
                  </div>
                  <select
                      id="to-unit"
                      value={toUnit}
                      onChange={e => setToUnit(e.target.value)}
                      className="w-full mt-2 bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
                  >
                      {unitsForCategory.map(unit => <option key={unit}>{unit}</option>)}
                  </select>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
