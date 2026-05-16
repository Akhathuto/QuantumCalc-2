import React, { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { Sigma, BarChart, Activity, ShieldCheck, GitCompareArrows, Info } from 'lucide-react';

const math = create(all, { number: 'BigNumber', precision: 64 });

const ResultCard = ({ title, value, description }: { title: string, value: string | number, description?: string }) => {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className="bg-brand-bg border border-brand-border p-5 rounded-2xl relative group overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 text-brand-text">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/70">{title}</span>
                <button 
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg hover:bg-brand-surface text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    title="Copy to clipboard"
                >
                    {copied ? <ShieldCheck size={14} className="text-green-500" /> : <GitCompareArrows size={14} />}
                </button>
            </div>
            <div className="flex flex-col">
                <div className="text-2xl font-black text-brand-text tracking-tighter truncate font-mono">
                    {value}
                </div>
                {description && (
                    <div className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest mt-1">
                        {description}
                    </div>
                )}
            </div>
            {copied && (
                <div className="absolute top-2 right-10 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Copied
                </div>
            )}
        </motion.div>
    );
};

const SummaryPoint: React.FC<{ value: number; label: string; position: number; color: string }> = ({ value, label, position, color }) => (
    <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <span className="text-[10px] font-mono text-brand-text font-bold mb-1">{value.toFixed(2)}</span>
        <div className={`w-0.5 h-4 ${color} rounded-full`}></div>
        <div className="h-4 w-px bg-brand-border opacity-30"></div>
        <span className="text-[9px] font-black uppercase tracking-tighter text-brand-text-secondary mt-1">{label}</span>
    </div>
);

const FiveNumberSummary: React.FC<{data: {min: number, q1: number, median: number, q3: number, max: number}}> = ({ data }) => {
    const { min, q1, median, q3, max } = data;
    const range = max - min;
    const getPosition = (val: number) => range === 0 ? 50 : ((val - min) / range) * 100;
  
    return (
        <div className="bg-brand-surface p-8 rounded-3xl border border-brand-border relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-5 bg-brand-primary rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text italic">Interquartile Range Map</h4>
            </div>
            <div className="relative h-20 w-full px-4">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-1 bg-brand-bg border border-brand-border rounded-full opacity-50"></div>
                {range > 0 && (
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 h-8 bg-brand-primary/20 border-x border-brand-primary/50 relative z-10"
                        style={{ left: `${getPosition(q1)}%`, width: `${getPosition(q3) - getPosition(q1)}%` }}
                    >
                         <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-brand-primary/30"></div>
                    </div>
                )}
                <SummaryPoint value={min} label="Min" position={range === 0 ? 0 : 0} color="bg-red-500" />
                <SummaryPoint value={q1} label="Q1" position={getPosition(q1)} color="bg-brand-primary" />
                <SummaryPoint value={median} label="Median" position={getPosition(median)} color="bg-brand-accent" />
                <SummaryPoint value={q3} label="Q3" position={getPosition(q3)} color="bg-brand-primary" />
                <SummaryPoint value={max} label="Max" position={range === 0 ? 100 : 100} color="bg-red-500" />
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                    <p className="text-xl font-black text-brand-primary tracking-tighter">
                        {payload[0].value} <span className="text-[10px] uppercase font-bold text-brand-text-secondary">Freq</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const Statistics = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8, 5, 6, 10, 11, 7, 7, 8');
    const [numBins, setNumBins] = useState(5);
    const [activeTab, setActiveTab] = useState('summary');

    const statsResult = useMemo(() => {
        if (dataStr.trim() === '') return { error: "Waiting for data stream..." };

        try {
            const data = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid scalar.`);
                return num;
            });
            if (data.length < 2) return { error: "Requires N >= 2 for meaningful analysis." };

            const sortedData = [...data].sort((a, b) => a - b);
            const [q1, median, q3] = math.quantileSeq(sortedData, [0.25, 0.5, 0.75]) as unknown as number[];

            const min = sortedData[0];
            const max = sortedData[data.length - 1];
            let histogramData: { name: string; count: number }[] = [];
            if (min === max) {
                 histogramData.push({ name: String(min), count: data.length });
            } else {
                const effectiveBins = Math.min(numBins, data.length);
                const binWidth = (max - min) / effectiveBins;
                histogramData = Array.from({ length: effectiveBins }, (_, i) => ({
                    name: `${(min + i * binWidth).toFixed(1)}—${(min + (i + 1) * binWidth).toFixed(1)}`,
                    count: 0
                }));
                 data.forEach(num => {
                    const binIndex = num === max ? effectiveBins - 1 : Math.floor((num - min) / binWidth);
                    if (histogramData[binIndex]) histogramData[binIndex].count++;
                });
            }
            
            const frequencyPolygonData = histogramData.map(bin => {
                if (bin.name.includes('—')) {
                    const [start, end] = bin.name.split('—').map(parseFloat);
                    return { midpoint: (start + end) / 2, count: bin.count };
                }
                return { midpoint: parseFloat(bin.name), count: bin.count };
            });

            return {
                summary: [
                    { label: 'Mean (μ)', value: Number(math.mean(data)).toFixed(4) },
                    { label: 'Std. Dev (σ)', value: Number(math.std(data)).toFixed(4) },
                    { label: 'Variance (σ²)', value: Number(math.variance(data)).toFixed(4) },
                    { label: 'Count (N)', value: data.length },
                    { label: 'Sum (Σ)', value: Number(math.sum(data)).toFixed(2) },
                    { label: 'IQR', value: (q3 - q1).toFixed(4) },
                ],
                fiveNumber: { min, q1, median: Number(median), q3, max },
                histogramData,
                frequencyPolygonData,
                error: null,
            };

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid frequency data.";
            return { error: msg };
        }
    }, [dataStr, numBins]);

    return (
        <div className="space-y-8 pb-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
                {/* Data Input Section */}
                <div className="space-y-6">
                    <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Input Vector Stream</h3>
                           </div>
                           <span className="text-[10px] font-mono text-brand-primary font-bold">ACTIVE_BUFFER</span>
                        </div>
                        <textarea 
                            value={dataStr} 
                            onChange={e => setDataStr(e.target.value)} 
                            className="flex-1 w-full bg-brand-bg border border-brand-border rounded-[1.5rem] p-6 text-brand-text text-sm focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none font-mono resize-none leading-loose placeholder:opacity-20"
                            placeholder="Enter data points separated by commas or line breaks..."
                        />
                        <div className="mt-6 flex items-center justify-between text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Processing Live</span>
                            </div>
                            <span>Total Cells: {statsResult.summary?.find(s => s.label.startsWith('Count'))?.value || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-6">
                    {/* Navigation */}
                    <div className="flex p-1.5 bg-brand-surface rounded-2xl border border-brand-border w-fit">
                        {[
                            { id: 'summary', label: 'Summary', icon: Sigma },
                            { id: 'histogram', label: 'Distribution', icon: BarChart },
                            { id: 'polygon', label: 'Polygon', icon: Activity }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id ? 'bg-brand-bg text-brand-primary border border-brand-border shadow-lg scale-[1.02]' : 'text-brand-text-secondary hover:text-brand-text'
                                }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        {statsResult.error ? (
                            <div className="h-full flex items-center justify-center p-12 bg-brand-surface rounded-[2.5rem] border border-brand-border border-dashed">
                                <div className="text-center space-y-4 max-w-xs scale-95">
                                    <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                                        <Info size={32} />
                                    </div>
                                    <p className="text-brand-text-secondary text-xs font-black uppercase tracking-[0.2em]">{statsResult.error}</p>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                className="space-y-6"
                            >
                                {activeTab === 'summary' && statsResult.summary && (
                                    <div className="space-y-6">
                                        <FiveNumberSummary data={statsResult.fiveNumber!} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {statsResult.summary.map((s, idx) => (
                                                <ResultCard key={idx} title={s.label} value={s.value} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'histogram' && statsResult.histogramData && (
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Frequency Distribution</h3>
                                            </div>
                                            <div className="flex items-center gap-4 bg-brand-bg px-4 py-2 rounded-xl border border-brand-border">
                                                <span className="text-[10px] font-black text-brand-text-secondary uppercase">Bins: {numBins}</span>
                                                <input type="range" min="2" max="20" value={numBins} onChange={e => setNumBins(parseInt(e.target.value))} className="w-24 h-1 bg-brand-border rounded-full appearance-none cursor-pointer accent-brand-primary" />
                                            </div>
                                        </div>
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer>
                                                <RechartsBarChart data={statsResult.histogramData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontWeight: 700 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontWeight: 700 }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'polygon' && statsResult.frequencyPolygonData && (
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border space-y-8">
                                         <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Continuous Density Trace</h3>
                                            </div>
                                            <div className="bg-brand-bg px-4 py-2 rounded-xl border border-brand-border">
                                                <span className="text-[10px] font-black text-brand-text-secondary uppercase">Harmonics: {numBins}</span>
                                            </div>
                                        </div>
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer>
                                                <LineChart data={statsResult.frequencyPolygonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="midpoint" type="number" hide />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontWeight: 700 }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="count" 
                                                        stroke="var(--color-primary)" 
                                                        strokeWidth={4} 
                                                        dot={{ r: 6, fill: 'var(--color-bg)', stroke: 'var(--color-primary)', strokeWidth: 2 }} 
                                                        activeDot={{ r: 8, stroke: 'var(--color-bg)', strokeWidth: 4 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
