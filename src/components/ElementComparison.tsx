import { motion } from 'motion/react';
import { ArrowLeftRight, Layers, Thermometer, TrendingUp, X } from 'lucide-react';
import { Element } from './PeriodicTableData';

interface ElementComparisonProps {
    elementA: Element;
    elementB: Element;
    onClear: () => void;
}

export const ElementComparison = ({ elementA, elementB, onClear }: ElementComparisonProps) => {

    const compareMetrics = [
        { label: 'Atomic Number', valA: elementA.number, valB: elementB.number, max: 118, unit: '' },
        { label: 'Atomic Mass', valA: elementA.mass, valB: elementB.mass, max: 250, unit: ' u' },
        { label: 'Electronegativity', valA: elementA.electronegativity || 0, valB: elementB.electronegativity || 0, max: 4, unit: '' },
        { label: 'Atomic Radius', valA: elementA.atomic_radius || 0, valB: elementB.atomic_radius || 0, max: 300, unit: ' pm' },
        { label: 'Density', valA: elementA.density || 0, valB: elementB.density || 0, max: 22.6, unit: ' g/cm³' },
        { label: 'Melting Point', valA: elementA.melting_point || 0, valB: elementB.melting_point || 0, max: 4000, unit: ' K' },
        { label: 'Boiling Point', valA: elementA.boiling_point || 0, valB: elementB.boiling_point || 0, max: 6000, unit: ' K' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-brand-primary/10"
        >
            <button 
                onClick={onClear} 
                className="absolute top-4 right-4 p-2 bg-brand-bg hover:bg-brand-surface rounded-full transition-colors border border-brand-border z-10"
            >
                <X size={16} />
            </button>

            <div className="absolute -top-10 -right-10 opacity-[0.02] pointer-events-none">
                <ArrowLeftRight size={300} />
            </div>

            <div className="flex items-center gap-3 relative z-10 mb-6">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <ArrowLeftRight size={20} />
                </div>
                <h4 className="font-black text-brand-text uppercase tracking-tighter">Direct Head-To-Head Comparative Deck</h4>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                {/* Element A */}
                <div className="flex flex-col items-center bg-brand-bg/30 p-5 rounded-2xl border border-brand-border/40 text-center relative overflow-hidden group">
                    <div className="absolute top-2 left-2 text-[10px] font-black opacity-30">ELEMENT A</div>
                    <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg bg-brand-bg mt-2 transition-transform group-hover:scale-105" 
                         style={{ borderColor: elementA.color, boxShadow: `0 10px 20px ${elementA.color}15` }}>
                        <span className="text-[10px] font-mono opacity-50 leading-none">{elementA.number}</span>
                        <span className="text-3xl font-black leading-none my-1" style={{ color: elementA.color }}>{elementA.symbol}</span>
                        <span className="text-[8px] font-mono opacity-50 leading-none">{elementA.mass.toFixed(2)}</span>
                    </div>
                    <h5 className="font-black text-lg text-brand-text mt-3">{elementA.name}</h5>
                    <span style={{ backgroundColor: `${elementA.color}15`, color: elementA.color }} 
                          className="mt-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-current">
                        {elementA.category}
                    </span>
                </div>

                {/* Element B */}
                <div className="flex flex-col items-center bg-brand-bg/30 p-5 rounded-2xl border border-brand-border/40 text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 text-[10px] font-black opacity-30">ELEMENT B</div>
                    <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg bg-brand-bg mt-2 transition-transform group-hover:scale-105" 
                         style={{ borderColor: elementB.color, boxShadow: `0 10px 20px ${elementB.color}15` }}>
                        <span className="text-[10px] font-mono opacity-50 leading-none">{elementB.number}</span>
                        <span className="text-3xl font-black leading-none my-1" style={{ color: elementB.color }}>{elementB.symbol}</span>
                        <span className="text-[8px] font-mono opacity-50 leading-none">{elementB.mass.toFixed(2)}</span>
                    </div>
                    <h5 className="font-black text-lg text-brand-text mt-3">{elementB.name}</h5>
                    <span style={{ backgroundColor: `${elementB.color}15`, color: elementB.color }} 
                          className="mt-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-current">
                        {elementB.category}
                    </span>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary pl-1">Metrics & Properties comparison</p>
                
                <div className="space-y-3">
                    {compareMetrics.map(metric => {
                        const isAEmpty = metric.valA === 0;
                        const isBEmpty = metric.valB === 0;
                        const percentA = isAEmpty ? 0 : Math.min((Number(metric.valA) / metric.max) * 100, 100);
                        const percentB = isBEmpty ? 0 : Math.min((Number(metric.valB) / metric.max) * 100, 100);
                        
                        return (
                            <div key={metric.label} className="bg-brand-bg/20 p-3 rounded-xl border border-brand-border/60 hover:border-brand-primary/10 transition-colors">
                                <div className="flex justify-between text-[10px] font-black uppercase text-brand-text-secondary tracking-wide mb-1 px-1">
                                    <span>{metric.label}</span>
                                    <div className="flex gap-4">
                                        <span style={{ color: elementA.color }}>{isAEmpty ? 'N/A' : `${metric.valA}${metric.unit}`}</span>
                                        <span className="opacity-30">vs</span>
                                        <span style={{ color: elementB.color }}>{isBEmpty ? 'N/A' : `${metric.valB}${metric.unit}`}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5 h-2">
                                    {/* Left bar for A (reversed layout or right-aligned) */}
                                    <div className="h-full bg-brand-bg rounded overflow-hidden flex justify-end">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentA}%` }}
                                            className="h-full rounded-l" 
                                            style={{ backgroundColor: elementA.color, boxShadow: `0 0 8px ${elementA.color}40` }}
                                        />
                                    </div>
                                    {/* Right bar for B */}
                                    <div className="h-full bg-brand-bg rounded overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentB}%` }}
                                            className="h-full rounded-r" 
                                            style={{ backgroundColor: elementB.color, boxShadow: `0 0 8px ${elementB.color}40` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
