import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Percent, ArrowUpRight, ArrowDownRight, Calculator, RefreshCw } from 'lucide-react';

interface CalculationCardProps {
    title: string;
    description: string;
    inputs: React.ReactNode;
    result: string;
    resultLabel: string;
    icon: any;
    delay?: number;
}

const CalculationCard: React.FC<CalculationCardProps> = ({ title, description, inputs, result, resultLabel, icon: Icon, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group relative"
    >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-brand-surface/40 border border-brand-border/40 p-8 rounded-[2.5rem] backdrop-blur-md flex flex-col h-full hover:border-brand-primary/30 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center">
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                    <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em]">{description}</p>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                {inputs}
            </div>

            <div className="pt-6 border-t border-brand-border/10">
                <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest mb-2">{resultLabel}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-brand-accent font-glow tracking-tighter tabular-nums">
                        {result || '---'}
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
);

const InlineInput = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label?: string }) => (
    <div className="relative">
        <input 
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-xl p-4 font-mono text-xl text-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
        />
        {label && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest pointer-events-none">{label}</span>}
    </div>
);

const PercentageCalculator = () => {
    // Basic Percentage
    const [val1, setVal1] = useState('15');
    const [val2, setVal2] = useState('75');
    const result1 = useMemo(() => {
        const num1 = parseFloat(val1);
        const num2 = parseFloat(val2);
        if (isNaN(num1) || isNaN(num2)) return '';
        return String(parseFloat(((num1 / 100) * num2).toPrecision(10)));
    }, [val1, val2]);

    // Percentage Of
    const [val3, setVal3] = useState('20');
    const [val4, setVal4] = useState('150');
    const result2 = useMemo(() => {
        const num3 = parseFloat(val3);
        const num4 = parseFloat(val4);
        if (isNaN(num3) || isNaN(num4) || num4 === 0) return '';
        return String(parseFloat(((num3 / num4) * 100).toPrecision(10))) + '%';
    }, [val3, val4]);
    
    // Percentage Difference
    const [val5, setVal5] = useState('50');
    const [val6, setVal6] = useState('25');
    const result3 = useMemo(() => {
        const num5 = parseFloat(val5);
        const num6 = parseFloat(val6);
        if (isNaN(num5) || isNaN(num6) || num5 === 0) return '';
        const diff = ((num6 - num5) / num5) * 100;
        return (diff > 0 ? '+' : '') + String(parseFloat(diff.toPrecision(10))) + '%';
    }, [val5, val6]);

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/20">
                    <Percent size={32} />
                </div>
                <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Quantum Percentage</h2>
                    <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black mt-2">Relative magnitude analytics engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CalculationCard 
                    title="Component Analysis"
                    description="Calculate partial portion of total"
                    icon={Calculator}
                    delay={0.1}
                    inputs={
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest px-1">What is</span>
                            <InlineInput value={val1} onChange={v => setVal1(v)} label="%" />
                            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest px-1">of</span>
                            <InlineInput value={val2} onChange={v => setVal2(v)} label="Total" />
                        </div>
                    }
                    result={result1}
                    resultLabel="Calculated Portion"
                />

                <CalculationCard 
                    title="Ratio Computation"
                    description="Determine constituent percentage"
                    icon={RefreshCw}
                    delay={0.2}
                    inputs={
                        <div className="space-y-4">
                            <InlineInput value={val3} onChange={v => setVal3(v)} label="Value" />
                            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest px-1">is what percentage of</span>
                            <InlineInput value={val4} onChange={v => setVal4(v)} label="Comparison" />
                        </div>
                    }
                    result={result2}
                    resultLabel="Relative Ratio"
                />

                <CalculationCard 
                    title="Delta Variance"
                    description="Calculate percentage increase/decrease"
                    icon={val6 > val5 ? ArrowUpRight : ArrowDownRight}
                    delay={0.3}
                    inputs={
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest px-1">From initial value</span>
                            <InlineInput value={val5} onChange={v => setVal5(v)} />
                            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest px-1">To target value</span>
                            <InlineInput value={val6} onChange={v => setVal6(v)} />
                        </div>
                    }
                    result={result3}
                    resultLabel="Net Variance"
                />
            </div>
        </div>
    );
};

export default PercentageCalculator;
