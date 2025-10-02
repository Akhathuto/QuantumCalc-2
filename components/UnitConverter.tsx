
import { useState, useMemo, useCallback } from 'react';
import { ArrowRightLeft } from 'lucide-react';

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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-brand-primary">Unit Converter</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-6 bg-brand-surface/50 rounded-lg">
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
  );
};