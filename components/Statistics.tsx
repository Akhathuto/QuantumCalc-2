import React, { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';

const math = create(all, { number: 'BigNumber', precision: 64 });

const ResultCard: React.FC<{ title: string; value: string; description?: string }> = ({ title, value, description }) => (
    <div className="bg-brand-bg p-4 rounded-lg text-center flex-1">
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-brand-accent my-1 break-words">{value}</p>
        {description && <p className="text-xs text-brand-text-secondary">{description}</p>}
    </div>
);

const SummaryPoint: React.FC<{ value: number; label: string; position: number; color: string }> = ({ value, label, position, color }) => (
    <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <span className="text-xs font-mono">{value.toFixed(2)}</span>
        <div className={`w-0.5 h-3 ${color}`}></div>
        <div className="h-2 w-px bg-brand-border"></div>
        <span className="text-xs font-semibold text-brand-text-secondary">{label}</span>
    </div>
);

const FiveNumberSummary: React.FC<{data: {min: number, q1: number, median: number, q3: number, max: number}}> = ({ data }) => {
    const { min, q1, median, q3, max } = data;
    const range = max - min;
    if (range === 0) {
      return <div className="text-center">All data points are {min}.</div>;
    }

    const getPosition = (val: number) => ((val - min) / range) * 100;
  
    return (
        <div className="bg-brand-bg p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-8 text-center">Five-Number Summary</h4>
            <div className="relative h-16 w-full">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 bg-brand-surface rounded-full"></div>
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-6 bg-brand-primary/30 border-y-2 border-brand-primary rounded"
                    style={{ left: `${getPosition(q1)}%`, width: `${getPosition(q3) - getPosition(q1)}%` }}
                ></div>
                <SummaryPoint value={min} label="Min" position={0} color="bg-red-500" />
                <SummaryPoint value={q1} label="Q1" position={getPosition(q1)} color="bg-brand-primary" />
                <SummaryPoint value={median} label="Median" position={getPosition(median)} color="bg-brand-accent" />
                <SummaryPoint value={q3} label="Q3" position={getPosition(q3)} color="bg-brand-primary" />
                <SummaryPoint value={max} label="Max" position={100} color="bg-red-500" />
            </div>
        </div>
    );
};

const Statistics = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8, 5, 6, 10, 11, 7, 7, 8');
    const [numBins, setNumBins] = useState(5);
    const [activeTab, setActiveTab] = useState('summary');

    const statsResult = useMemo(() => {
        if (dataStr.trim() === '') return { error: "Please enter data to see statistical analysis." };

        try {
            const data = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid number.`);
                return num;
            });
            if (data.length < 2) return { error: "Please enter at least two numbers." };

            const sortedData = [...data].sort((a, b) => a - b);
            const [q1, median, q3] = math.quantileSeq(sortedData, [0.25, 0.5, 0.75]) as number[];

            const min = sortedData[0];
            const max = sortedData[data.length - 1];
            let histogramData = [];
            if (min === max) {
                 histogramData.push({ name: String(min), count: data.length });
            } else {
                const effectiveBins = Math.min(numBins, data.length);
                const binWidth = (max - min) / effectiveBins;
                histogramData = Array.from({ length: effectiveBins }, (_, i) => ({
                    name: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
                    count: 0
                }));
                 data.forEach(num => {
                    const binIndex = num === max ? effectiveBins - 1 : Math.floor((num - min) / binWidth);
                    if (histogramData[binIndex]) histogramData[binIndex].count++;
                });
            }
            
            const frequencyPolygonData = histogramData.map(bin => {
                if (bin.name.includes('-')) {
                    const [start, end] = bin.name.split('-').map(parseFloat);
                    return { midpoint: (start + end) / 2, count: bin.count };
                }
                return { midpoint: parseFloat(bin.name), count: bin.count };
            });

            return {
                summary: {
                    count: data.length,
                    sum: math.sum(data),
                    mean: math.mean(data),
                    median,
                    mode: math.mode(data).join(', '),
                    stdDev: math.std(data),
                    variance: math.variance(data),
                    min,
                    max,
                    range: max - min,
                    q1,
                    q3,
                    iqr: q3 - q1,
                },
                histogramData,
                frequencyPolygonData,
                error: null,
            };

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid data format.";
            return { error: msg };
        }
    }, [dataStr, numBins]);

    const formatValue = (value: number | string | undefined) => {
        if (value === undefined) return '--';
        if (typeof value === 'number') return parseFloat(value.toFixed(4)).toString();
        return value;
    };
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary text-center">Statistics Calculator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="data-input" className="block text-lg font-medium mb-2">Enter data (comma or space-separated)</label>
                    <textarea id="data-input" value={dataStr} onChange={e => setDataStr(e.target.value)} rows={10} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <div className="flex gap-2 border-b border-brand-border mb-4">
                        <button onClick={() => setActiveTab('summary')} className={`py-2 px-4 font-semibold ${activeTab === 'summary' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Summary</button>
                        <button onClick={() => setActiveTab('histogram')} className={`py-2 px-4 font-semibold ${activeTab === 'histogram' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Histogram</button>
                        <button onClick={() => setActiveTab('polygon')} className={`py-2 px-4 font-semibold ${activeTab === 'polygon' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`}>Frequency Polygon</button>
                    </div>

                    {statsResult.error && <div className="text-red-400 text-center p-8">{statsResult.error}</div>}

                    {statsResult.summary && activeTab === 'summary' && (
                        <div className="space-y-4 animate-fade-in-down">
                            <FiveNumberSummary data={{ min: statsResult.summary.min, q1: statsResult.summary.q1, median: statsResult.summary.median, q3: statsResult.summary.q3, max: statsResult.summary.max }} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                               <ResultCard title="Mean" value={formatValue(statsResult.summary.mean)} />
                               <ResultCard title="Std. Dev" value={formatValue(statsResult.summary.stdDev)} />
                               <ResultCard title="Count" value={formatValue(statsResult.summary.count)} />
                               <ResultCard title="Sum" value={formatValue(statsResult.summary.sum)} />
                               <ResultCard title="IQR" value={formatValue(statsResult.summary.iqr)} />
                               <ResultCard title="Range" value={formatValue(statsResult.summary.range)} />
                            </div>
                        </div>
                    )}
                    
                    {statsResult.histogramData && activeTab === 'histogram' && (
                        <div className="space-y-4 animate-fade-in-down">
                            <div className="flex items-center gap-4">
                                <label htmlFor="bins-slider" className="text-sm">Bins: {numBins}</label>
                                <input id="bins-slider" type="range" min="2" max="20" value={numBins} onChange={e => setNumBins(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer>
                                    <RechartsBarChart data={statsResult.histogramData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--color-text-secondary)" />
                                        <YAxis allowDecimals={false} stroke="var(--color-text-secondary)" />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                        <Bar dataKey="count" name="Frequency" fill="var(--color-primary)" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    
                    {statsResult.frequencyPolygonData && activeTab === 'polygon' && (
                        <div className="space-y-4 animate-fade-in-down">
                             <div className="flex items-center gap-4">
                                <label htmlFor="bins-slider-poly" className="text-sm">Bins: {numBins}</label>
                                <input id="bins-slider-poly" type="range" min="2" max="20" value={numBins} onChange={e => setNumBins(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={statsResult.frequencyPolygonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                        <XAxis
                                            dataKey="midpoint"
                                            type="number"
                                            domain={['dataMin', 'dataMax']}
                                            tick={{ fontSize: 10 }}
                                            stroke="var(--color-text-secondary)"
                                            name="Bin Midpoint"
                                        />
                                        <YAxis dataKey="count" allowDecimals={false} stroke="var(--color-text-secondary)" name="Frequency" />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            name="Frequency"
                                            stroke="var(--color-accent)"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;