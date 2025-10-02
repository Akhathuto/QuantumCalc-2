import { useState, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// Define props for the helper component
interface CalculationCardProps {
    title: ReactNode;
    result: string;
    resultLabel: string;
}

// Define the helper component outside the main component for stability and performance.
const CalculationCard: FC<CalculationCardProps> = ({ title, result, resultLabel }) => (
    <div className="bg-brand-surface/50 p-6 rounded-lg flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-brand-text h-16 flex items-center">{title}</h3>
        <div className="mt-auto pt-4 border-t border-gray-700">
            <span className="text-brand-text-secondary">{resultLabel}</span>
            <p className="text-2xl font-bold text-brand-accent font-mono break-all min-h-[36px]">{result}</p>
        </div>
    </div>
);


const PercentageCalculator = () => {
    const [val1, setVal1] = useState('15');
    const [val2, setVal2] = useState('75');

    const result1 = useMemo(() => {
        const num1 = parseFloat(val1);
        const num2 = parseFloat(val2);
        if (isNaN(num1) || isNaN(num2)) return '';
        const res = (num1 / 100) * num2;
        return String(parseFloat(res.toPrecision(10)));
    }, [val1, val2]);

    const [val3, setVal3] = useState('20');
    const [val4, setVal4] = useState('150');

    const result2 = useMemo(() => {
        const num3 = parseFloat(val3);
        const num4 = parseFloat(val4);
        if (isNaN(num3) || isNaN(num4) || num4 === 0) return '';
        const res = (num3 / num4) * 100;
        return String(parseFloat(res.toPrecision(10)));
    }, [val3, val4]);
    
    const [val5, setVal5] = useState('50');
    const [val6, setVal6] = useState('25');
    
    const result3 = useMemo(() => {
        const num5 = parseFloat(val5);
        const num6 = parseFloat(val6);
        if (isNaN(num5) || isNaN(num6) || num5 === 0) return '';
        const res = (num6 / num5) * 100;
        return String(parseFloat(res.toPrecision(10)));
    }, [val5, val6]);

    const inputClasses = "bg-brand-bg border border-gray-600 rounded-md text-brand-text w-24 text-center p-1 mx-1 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50";

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Percentage Calculator</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CalculationCard 
                    title={<>What is <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={inputClasses} /> % of <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={inputClasses} />?</>}
                    result={result1}
                    resultLabel="Result"
                />

                <CalculationCard 
                    title={<><input type="number" value={val3} onChange={e => setVal3(e.target.value)} className={inputClasses}/> is what percent of <input type="number" value={val4} onChange={e => setVal4(e.target.value)} className={inputClasses}/>?</>}
                    result={result2 ? `${result2} %` : ''}
                    resultLabel="Result"
                />

                <CalculationCard 
                    title={<><input type="number" value={val5} onChange={e => setVal5(e.target.value)} className={inputClasses}/> is <input type="number" value={val6} onChange={e => setVal6(e.target.value)} className={inputClasses}/> % of what?</>}
                    result={result3}
                    resultLabel="Original Number"
                />
            </div>
        </div>
    );
};

export default PercentageCalculator;