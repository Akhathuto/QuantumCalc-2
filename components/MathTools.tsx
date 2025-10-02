


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { create, all } from 'mathjs';
// FIX: Moved ReferenceLine from lucide-react to recharts import.
import { Brain, BarChart, FunctionSquare, Table, Percent, Sigma, ShieldCheck, Superscript, DivideCircle, Triangle, Ruler, RectangleHorizontal, Shuffle, AlertTriangle, BarChartHorizontal, Scaling, Eraser, GitCompareArrows, Atom, ArrowRightLeft, Circle, Eye, LineChart as LineChartIcon } from 'lucide-react';
import Button from './common/Button';
// FIX: Moved ReferenceLine from lucide-react to recharts import.
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, ReferenceLine } from 'recharts';


const math = create(all, { number: 'BigNumber', precision: 64 });

// --- Reusable UI ---
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 flex items-center gap-2 rounded-md font-semibold transition-colors text-sm ${isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}
    >
        <Icon size={16} />
        {label}
    </button>
);

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium mb-1 text-brand-text-secondary">{label}</label>
        <input {...props} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono" />
    </div>
);

const ResultCard: React.FC<{ title: string; value: string; description?: string }> = ({ title, value, description }) => (
    <div className="bg-brand-bg p-4 rounded-lg text-center flex-1">
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-brand-accent my-1 break-words">{value}</p>
        {description && <p className="text-xs text-brand-text-secondary">{description}</p>}
    </div>
);

// --- Interfaces for Equation Solver ---
interface SolvedDetails {
  type: 'linear' | 'quadratic';
  coeffs: { a: number; b: number; c: number };
  discriminant?: number;
}

// --- Explainer for Equation Solver ---
const FormulaExplainer: React.FC<{ details: SolvedDetails }> = ({ details }) => {
    const { type, coeffs, discriminant } = details;
    const { a, b, c } = coeffs;

    const formatCoeff = (val?: number) => val !== undefined ? `(${val})` : '';
    
    return (
        <div className="mt-6 bg-brand-bg p-6 rounded-lg animate-fade-in-down">
            <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2"><Brain size={20} /> Formula Explanation</h3>
            {type === 'linear' && (
                <div className="space-y-3">
                    <p>This is a linear equation of the form <code className="font-mono bg-brand-surface p-1 rounded">ax + b = 0</code>.</p>
                    <p>The solution is found using the formula:</p>
                    <div className="font-mono bg-brand-surface p-3 rounded-md text-center text-lg">x = -b / a</div>
                    <p>Using your values (a={formatCoeff(a)}, b={formatCoeff(b)}):</p>
                    <div className="font-mono bg-brand-surface p-3 rounded-md text-center text-lg">x = -{formatCoeff(b)} / {formatCoeff(a)}</div>
                </div>
            )}
            {type === 'quadratic' && (
                 <div className="space-y-4">
                    <p>This is a quadratic equation of the form <code className="font-mono bg-brand-surface p-1 rounded">ax² + bx + c = 0</code>.</p>
                    <p>The solution is found using the Quadratic Formula:</p>
                    <div className="font-mono bg-brand-surface p-4 rounded-md text-center text-xl overflow-x-auto">
                        x = (-b &plusmn; &radic;(b² - 4ac)) / 2a
                    </div>
                    <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold">1. Calculate the Discriminant (Δ):</h4>
                        <p className="text-sm text-brand-text-secondary">The discriminant determines the nature of the roots.</p>
                        <div className="font-mono bg-brand-surface p-3 my-2 rounded-md text-lg">Δ = b² - 4ac</div>
                        <div className="font-mono bg-brand-surface p-3 rounded-md text-lg">Δ = {formatCoeff(b)}² - 4{formatCoeff(a)}{formatCoeff(c)} = {discriminant}</div>
                        {discriminant !== undefined && (
                            <p className="text-sm italic mt-2">
                                {discriminant > 0 && "Δ > 0: There are two distinct real roots."}
                                {discriminant === 0 && "Δ = 0: There is exactly one real root."}
                                {discriminant < 0 && "Δ < 0: There are two distinct complex roots."}
                            </p>
                        )}
                    </div>
                     <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold">2. Substitute into the formula:</h4>
                        <p className="text-sm text-brand-text-secondary">Plug a, b, and c into the main formula.</p>
                        <div className="font-mono bg-brand-surface p-3 mt-2 rounded-md text-lg overflow-x-auto">
                           x = (-{formatCoeff(b)} &plusmn; &radic;({discriminant})) / (2 * {formatCoeff(a)})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Component for Equation Solver Solution Display ---
const SolutionCard: React.FC<{ solution: any }> = ({ solution }) => {
    const formatSolution = (sol: any): string => {
        try {
            // Check if it's a complex number object from math.js
            if (sol && typeof sol === 'object' && sol.constructor.name === 'Complex') {
                const realPart = parseFloat(sol.re.toFixed(5));
                const imagPart = parseFloat(sol.im.toFixed(5));
                if (imagPart === 0) return String(realPart);
                if (realPart === 0) return `${imagPart}i`;
                return `${realPart} ${imagPart > 0 ? '+' : '-'} ${Math.abs(imagPart)}i`;
            }
            return math.format(sol, { notation: 'fixed', precision: 5 });
        } catch {
            return String(sol);
        }
    };

    return (
        <div className="bg-brand-bg p-4 rounded-lg flex items-center gap-4 animate-fade-in-down">
            <div className="text-xl font-bold text-brand-text-secondary bg-brand-surface w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0">
                x
            </div>
            <div className="text-2xl font-mono text-brand-accent break-all">
                = {formatSolution(solution)}
            </div>
        </div>
    );
};


// --- Existing Calculators (Refactored) ---
const MatrixCalculator = () => {
    const [size, setSize] = useState(3);
    const [matrixA, setMatrixA] = useState(Array(9).fill(0));
    const [matrixB, setMatrixB] = useState(Array(9).fill(0));
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [highlight, setHighlight] = useState<{row: number | null, col: number | null}>({ row: null, col: null });

    React.useEffect(() => {
        const newSize = size * size;
        setMatrixA(prev => [...prev, ...Array(newSize).fill(0)].slice(0, newSize));
        setMatrixB(prev => [...prev, ...Array(newSize).fill(0)].slice(0, newSize));
        
        if (size === 3) {
            setMatrixA([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            setMatrixB([9, 8, 7, 6, 5, 4, 3, 2, 1]);
        } else {
            setMatrixA([1, 2, 3, 4]);
            setMatrixB([5, 6, 7, 8]);
        }
    }, [size]);

    const handleCellChange = (matrixSetter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: string) => {
        matrixSetter(prev => {
            const newMatrix = [...prev];
            newMatrix[index] = value === '' ? 0 : parseFloat(value);
            return newMatrix;
        });
    };

    const getMatrix = (values: number[]) => {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix.push(values.slice(i * size, i * size + size));
        }
        return matrix;
    };

    const performOperation = (op: (a: any, b?: any) => any, requiresB: boolean = false) => {
        try {
            setError(null);
            const a = getMatrix(matrixA);
            const b = requiresB ? getMatrix(matrixB) : undefined;
            const res = b ? op(math.bignumber(a), math.bignumber(b)) : op(math.bignumber(a));
            
            if (typeof res === 'number' || res.isBigNumber) {
                setResult(`Result: ${math.format(res, {notation: 'fixed', precision: 4})}`);
            } else {
                setResult(math.format(res, { notation: 'fixed', precision: 4 }));
            }
        } catch (e: any) {
            setError(e.message || "An error occurred.");
            setResult(null);
        }
    };

    const matrixButtons = [
        { label: 'A + B', action: () => performOperation((a, b) => math.add(a,b), true) },
        { label: 'A - B', action: () => performOperation((a, b) => math.subtract(a,b), true) },
        { label: 'A × B', action: () => performOperation((a, b) => math.multiply(a,b), true) },
        { label: 'det(A)', action: () => performOperation(a => math.det(a), false) },
        { label: 'inv(A)', action: () => performOperation(a => math.inv(a), false) },
        { label: 'trans(A)', action: () => performOperation(a => math.transpose(a), false) },
    ];
    
    const swapMatrices = () => {
        setMatrixA(matrixB);
        setMatrixB(matrixA);
    };

    const fillMatrix = (setter: React.Dispatch<React.SetStateAction<number[]>>, type: 'random' | 'identity' | 'clear') => {
        const newMatrix = Array(size * size).fill(0);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const index = i * size + j;
                if (type === 'random') {
                    newMatrix[index] = Math.floor(Math.random() * 10);
                } else if (type === 'identity') {
                    newMatrix[index] = (i === j) ? 1 : 0;
                } // 'clear' is default (fill(0))
            }
        }
        setter(newMatrix);
    };


    const MatrixInputGrid: React.FC<{
        matrix: number[];
        setter: React.Dispatch<React.SetStateAction<number[]>>;
        label: string;
    }> = ({ matrix, setter, label }) => {
        return (
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl font-semibold mb-2">{label}</h3>
                <div className="flex items-center gap-2">
                    <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">[</div>
                    <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`}}>
                        {Array.from({ length: size * size }).map((_, i) => {
                            const rowIndex = Math.floor(i / size);
                            const colIndex = i % size;
                            const isHighlighted = highlight.row === rowIndex || highlight.col === colIndex;

                            return (
                                <input
                                    key={i}
                                    type="number"
                                    value={matrix[i] ?? ''}
                                    onChange={(e) => handleCellChange(setter, i, e.target.value)}
                                    onFocus={() => setHighlight({ row: rowIndex, col: colIndex })}
                                    onBlur={() => setHighlight({ row: null, col: null })}
                                    className={`w-16 h-16 bg-gray-900/70 border-gray-600 rounded-md p-2 text-center text-lg font-mono focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 ${isHighlighted ? 'bg-brand-primary/20' : ''}`}
                                />
                            );
                        })}
                    </div>
                    <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">]</div>
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => fillMatrix(setter, 'random')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Shuffle size={12} /> Random</button>
                    <button onClick={() => fillMatrix(setter, 'identity')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eye size={12} /> Identity</button>
                    <button onClick={() => fillMatrix(setter, 'clear')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eraser size={12} /> Clear</button>
                </div>
            </div>
        );
    };
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="mb-6 flex justify-center items-center gap-4">
                <label className="text-brand-text-secondary">Matrix Size:</label>
                <select 
                    value={size} 
                    onChange={e => setSize(parseInt(e.target.value))}
                    className="bg-brand-surface border-gray-600 rounded-md p-2"
                >
                    <option value={2}>2x2</option>
                    <option value={3}>3x3</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center justify-items-center mb-6">
                <MatrixInputGrid matrix={matrixA} setter={setMatrixA} label="Matrix A" />
                <button onClick={swapMatrices} className="p-3 bg-brand-surface hover:bg-brand-border rounded-full transition-colors" title="Swap A and B">
                    <ArrowRightLeft />
                </button>
                <MatrixInputGrid matrix={matrixB} setter={setMatrixB} label="Matrix B" />
            </div>

            <div className="border-t border-brand-border my-6"></div>

            <h3 className="text-xl font-semibold mb-4 text-center">Operations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 max-w-4xl mx-auto">
                 {matrixButtons.map(b => (
                    <button key={b.label} onClick={b.action} className="bg-brand-primary/80 hover:bg-brand-primary h-14 text-lg rounded-lg transition-colors font-semibold">
                        {b.label}
                    </button>
                ))}
            </div>
            
            <div className="bg-brand-bg p-6 rounded-lg min-h-[150px]">
                <h3 className="text-xl font-bold mb-2 text-brand-accent">Result</h3>
                {error && <p className="text-red-400 font-mono">{error}</p>}
                {result && <pre className="text-lg font-mono whitespace-pre-wrap">{result}</pre>}
                {!error && !result && <p className="text-brand-text-secondary">Select an operation to see the result.</p>}
            </div>
        </div>
    );
};

const FiveNumberSummary: React.FC<{data: {min: number, q1: number, median: number, q3: number, max: number}}> = ({ data }) => {
    const { min, q1, median, q3, max } = data;
    const range = max - min;
    if (range === 0) {
      return <div className="text-center">All data points are {min}.</div>;
    }

    const getPosition = (val: number) => ((val - min) / range) * 100;
  
    const SummaryPoint: React.FC<{ value: number; label: string; position: number; color: string }> = ({ value, label, position, color }) => (
        <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
            <span className="text-xs font-mono">{value.toFixed(2)}</span>
            <div className={`w-0.5 h-3 ${color}`}></div>
            <div className="h-2 w-px bg-brand-border"></div>
            <span className="text-xs font-semibold text-brand-text-secondary">{label}</span>
        </div>
    );

    return (
        <div className="bg-brand-bg p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-8 text-center">Five-Number Summary</h4>
            <div className="relative h-16 w-full">
                {/* Main Bar */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 bg-brand-surface rounded-full"></div>
                {/* Box (Q1 to Q3) */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-6 bg-brand-primary/30 border-y-2 border-brand-primary rounded"
                    style={{ left: `${getPosition(q1)}%`, width: `${getPosition(q3) - getPosition(q1)}%` }}
                ></div>

                {/* Points */}
                <SummaryPoint value={min} label="Min" position={0} color="bg-red-500" />
                <SummaryPoint value={q1} label="Q1" position={getPosition(q1)} color="bg-brand-primary" />
                <SummaryPoint value={median} label="Median" position={getPosition(median)} color="bg-brand-accent" />
                <SummaryPoint value={q3} label="Q3" position={getPosition(q3)} color="bg-brand-primary" />
                <SummaryPoint value={max} label="Max" position={100} color="bg-red-500" />
            </div>
        </div>
    );
};


const StatisticsCalculator = () => {
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

            // Histogram calculation
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

        } catch (e: any) {
            return { error: e.message || "Invalid data format." };
        }
    }, [dataStr, numBins]);

    const formatValue = (value: number | string | undefined) => {
        if (value === undefined) return '--';
        if (typeof value === 'number') return parseFloat(value.toFixed(4)).toString();
        return value;
    };
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="data-input" className="block text-lg font-medium mb-2">Enter data (comma or space-separated)</label>
                    <textarea id="data-input" value={dataStr} onChange={e => setDataStr(e.target.value)} rows={10} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono" />
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

const EquationSolverTool = () => {
    const [equation, setEquation] = useState('x^2 - 4x + 3 = 0');
    const [solutions, setSolutions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [solvedDetails, setSolvedDetails] = useState<SolvedDetails | null>(null);
    const [graphData, setGraphData] = useState<any[] | null>(null);
    const [polynomial, setPolynomial] = useState<{fn: (x:number)=>number, expr: string} | null>(null);


    const handleSolve = useCallback(() => {
        setError(null);
        setSolutions([]);
        setSolvedDetails(null);
        setGraphData(null);
        setPolynomial(null);

        if (!equation.trim()) {
            setError("Please enter an equation.");
            return;
        }

        if (!equation.includes('x')) {
            setError("The equation must contain the variable 'x' to solve for.");
            return;
        }

        try {
            let expressionToSolve;
            const parts = equation.split('=');

            if (parts.length === 1) {
                expressionToSolve = parts[0];
            } else if (parts.length === 2) {
                const lhs = parts[0].trim();
                const rhs = parts[1].trim();
                if (lhs === '' || rhs === '') {
                    setError("Invalid equation: Both sides of '=' must have content.");
                    return;
                }
                expressionToSolve = `(${lhs}) - (${rhs})`;
            } else {
                setError("Invalid equation format. Please use a single '=' sign.");
                return;
            }
            
            const tempMath = create(all, { number: 'number' });
            const details = tempMath.rationalize(expressionToSolve, {}, true);

            if (!details.coefficients) {
                 setError("Equation is not a recognized polynomial.");
                 return;
            }
            
            const coeffs = details.coefficients.map((c: any) => parseFloat(c.toString()));
            let newSolutions: any[] = [];
            let isSolvable = true;

            if (coeffs.length > 3) {
                setError("This solver currently supports linear and quadratic equations only (up to x^2).");
                isSolvable = false;
            } else if (coeffs.length === 3) { // Quadratic: ax^2 + bx + c = 0
                const c = coeffs[0] || 0;
                const b = coeffs[1] || 0;
                const a = coeffs[2] || 0;
                
                if (a === 0) { // It's actually linear: bx + c = 0
                     if (b !== 0) {
                        newSolutions.push(-c / b);
                        setSolvedDetails({ type: 'linear', coeffs: { a: b, b: c, c: 0 }});
                    } else {
                        setError(c === 0 ? "Infinite solutions (0 = 0)" : "No solution");
                        isSolvable = false;
                    }
                } else {
                    const discriminant = b * b - 4 * a * c;
                    setSolvedDetails({ type: 'quadratic', coeffs: { a, b, c }, discriminant });
                    if (discriminant >= 0) {
                        newSolutions.push((-b + Math.sqrt(discriminant)) / (2 * a));
                        if (discriminant > 0) {
                            newSolutions.push((-b - Math.sqrt(discriminant)) / (2 * a));
                        }
                    } else {
                        const realPart = -b / (2 * a);
                        const imagPart = Math.sqrt(-discriminant) / (2 * a);
                        newSolutions.push(math.complex(realPart, imagPart));
                        newSolutions.push(math.complex(realPart, -imagPart));
                    }
                }
            } else if (coeffs.length === 2) { // Linear: ax + b = 0
                const b_const = coeffs[0] || 0;
                const a_coeff = coeffs[1] || 0;
                if (a_coeff !== 0) {
                    newSolutions.push(-b_const / a_coeff);
                    setSolvedDetails({ type: 'linear', coeffs: { a: a_coeff, b: b_const, c: 0 }});
                } else {
                    setError(b_const === 0 ? "Infinite solutions (0 = 0)" : "No solution");
                    isSolvable = false;
                }
            } else if (coeffs.length === 1) {
                 setError(coeffs[0] === 0 ? "Infinite solutions (0 = 0)" : `No solution (${coeffs[0]} = 0)`);
                 isSolvable = false;
            } else {
                setError("Equation is not a recognized linear or quadratic polynomial.");
                isSolvable = false;
            }
            setSolutions(newSolutions);

            // --- Graph Generation Logic ---
            if (isSolvable) {
                const node = tempMath.parse(expressionToSolve);
                const compiledExpr = node.compile();
                const simplifiedExpr = details.expression.toString();
                setPolynomial({ fn: (x: number) => compiledExpr.evaluate({ x }), expr: simplifiedExpr });

                const realRoots = newSolutions.filter(s => typeof s === 'number' || (s.im === 0)).map(s => typeof s === 'number' ? s : s.re);
                
                let xMin, xMax;
                if (realRoots.length > 0) {
                    const minRoot = Math.min(...realRoots);
                    const maxRoot = Math.max(...realRoots);
                    const range = Math.max(10, (maxRoot - minRoot) * 1.5);
                    xMin = minRoot - range * 0.5;
                    xMax = maxRoot + range * 0.5;
                } else if (coeffs.length === 3) { // No real roots (quadratic)
                    const b = coeffs[1] || 0;
                    const a = coeffs[2] || 0;
                    const vertexX = -b / (2 * a);
                    xMin = vertexX - 5;
                    xMax = vertexX + 5;
                } else { // Constant or other unsolvable cases
                    xMin = -10;
                    xMax = 10;
                }
                
                const data = [];
                const step = (xMax - xMin) / 100;
                for (let x = xMin; x <= xMax; x += step) {
                    try {
                        const y = compiledExpr.evaluate({ x });
                        if (typeof y === 'number' && isFinite(y)) {
                            data.push({ x: parseFloat(x.toPrecision(4)), y: parseFloat(y.toPrecision(4)) });
                        }
                    } catch(e) { /* ignore points */ }
                }
                setGraphData(data);
            }

        } catch (e: any) {
            setError(e.message || "Could not solve the equation. Ensure it's a valid polynomial in 'x'.");
        }
    }, [equation]);

    const exampleEquations = [
        '2x - 10 = 0',
        'x^2 - 4 = 0',
        'x^2 + 2x + 1 = 0',
        'x^3 - 8 = 0', // For unsupported error
        'x^2 + x + 1 = 0' // complex roots
    ];
    
    useEffect(() => {
        handleSolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="bg-brand-surface/50 p-6 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div>
                      <label htmlFor="equation-input" className="block text-lg font-medium mb-2">Enter a linear or quadratic equation for 'x'</label>
                      <div className="flex gap-3">
                          <input id="equation-input" type="text" value={equation} onChange={e => setEquation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSolve()} className="flex-grow w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg" placeholder="e.g., 2x + 5 = 10" />
                          <Button onClick={handleSolve} className="bg-brand-primary hover:bg-blue-500 h-auto px-6 py-3 text-lg">Solve</Button>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold mb-3">Examples</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {exampleEquations.map(ex => <button key={ex} onClick={() => setEquation(ex)} className="w-full text-left px-3 py-2 bg-brand-bg hover:bg-gray-600 rounded-lg text-sm font-mono transition-colors">{ex}</button>)}
                      </div>
                  </div>
                  {!error && solutions.length > 0 && (
                      <div className="space-y-4">
                          <h3 className="text-xl font-bold text-brand-accent">Solution(s)</h3>
                          <div className="bg-brand-bg p-4 rounded-lg space-y-3">
                              {solutions.map((sol, index) => <SolutionCard key={index} solution={sol} />)}
                          </div>
                      </div>
                  )}
                  {error && (
                      <div className="flex items-center gap-3 text-red-400 font-semibold p-4 bg-red-900/30 rounded-lg">
                          <AlertTriangle size={24} />
                          <span>{error}</span>
                      </div>
                  )}
              </div>
              <div className="space-y-4">
                  {!error && graphData && polynomial && (
                      <div className="animate-fade-in-down">
                          <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 mb-2"><LineChartIcon size={20} /> Solution Graph</h3>
                          <div className="h-64 w-full bg-brand-bg p-4 rounded-lg">
                              <ResponsiveContainer>
                                  <LineChart data={graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                      <XAxis type="number" dataKey="x" domain={['dataMin', 'dataMax']} stroke="var(--color-text-secondary)" tick={{ fontSize: 10 }} />
                                      <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 10 }} />
                                      <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                      <Legend verticalAlign="top" height={36} />
                                      <ReferenceLine y={0} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
                                      <Line type="monotone" dataKey="y" name={`y = ${polynomial.expr}`} stroke="var(--color-primary)" dot={false} strokeWidth={2} />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  )}
                  {!error && solvedDetails && <FormulaExplainer details={solvedDetails} />}
              </div>
          </div>
      </div>
    );
};


const PercentageCalculatorTool = () => {
    const [val1, setVal1] = useState('15'); const [val2, setVal2] = useState('75');
    const [val3, setVal3] = useState('20'); const [val4, setVal4] = useState('150');
    const [val5, setVal5] = useState('50'); const [val6, setVal6] = useState('25');
    
    const result1 = useMemo(() => { const n1 = parseFloat(val1); const n2 = parseFloat(val2); if(isNaN(n1)||isNaN(n2)) return ''; return String(parseFloat(((n1/100)*n2).toPrecision(10))); }, [val1, val2]);
    const result2 = useMemo(() => { const n3 = parseFloat(val3); const n4 = parseFloat(val4); if(isNaN(n3)||isNaN(n4)||n4===0) return ''; return String(parseFloat(((n3/n4)*100).toPrecision(10))); }, [val3, val4]);
    const result3 = useMemo(() => { const n5 = parseFloat(val5); const n6 = parseFloat(val6); if(isNaN(n5)||isNaN(n6)||n5===0) return ''; const res = (n6 / n5) * 100; return String(parseFloat(res.toPrecision(10))); }, [val5, val6]);

    const inputClasses = "bg-brand-bg border border-gray-600 rounded-md text-brand-text w-24 text-center p-1 mx-1";
    const CalculationCard = ({ title, result, resultLabel }: {title:React.ReactNode, result:string, resultLabel:string}) => (
        <div className="bg-brand-bg p-6 rounded-lg flex flex-col"><h3 className="text-xl font-semibold mb-4 text-brand-text h-16 flex items-center">{title}</h3><div className="mt-auto pt-4 border-t border-gray-700"><span className="text-brand-text-secondary">{resultLabel}</span><p className="text-2xl font-bold text-brand-accent font-mono break-all min-h-[36px]">{result}</p></div></div>
    );

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CalculationCard title={<>What is <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={inputClasses} /> % of <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={inputClasses} />?</>} result={result1} resultLabel="Result" />
                <CalculationCard title={<><input type="number" value={val3} onChange={e => setVal3(e.target.value)} className={inputClasses}/> is what percent of <input type="number" value={val4} onChange={e => setVal4(e.target.value)} className={inputClasses}/>?</>} result={result2 ? `${result2} %` : ''} resultLabel="Result" />
                <CalculationCard title={<><input type="number" value={val5} onChange={e => setVal5(e.target.value)} className={inputClasses}/> is <input type="number" value={val6} onChange={e => setVal6(e.target.value)} className={inputClasses}/> % of what?</>} result={result3} resultLabel="Original Number" />
            </div>
        </div>
    );
};

// --- New Calculators ---
const RoundingCalculator = () => {
    const [number, setNumber] = useState('123.456789');
    const [decimals, setDecimals] = useState('2');
    
    const result = useMemo(() => {
        const num = parseFloat(number);
        const dec = parseInt(decimals);
        if (isNaN(num) || isNaN(dec) || dec < 0) return 'Invalid input';
        try {
            return math.round(num, dec).toString();
        } catch {
            return 'Error';
        }
    }, [number, decimals]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Input label="Number to Round" type="number" value={number} onChange={e => setNumber(e.target.value)} />
                <Input label="Decimal Places" type="number" min="0" value={decimals} onChange={e => setDecimals(e.target.value)} />
            </div>
            <ResultCard title="Rounded Result" value={result} />
        </div>
    );
};

const RatioCalculator = () => {
    const [a, setA] = useState('2');
    const [b, setB] = useState('3');
    const [c, setC] = useState('4');
    const [d, setD] = useState('');

    useEffect(() => {
        const valA = parseFloat(a); const valB = parseFloat(b);
        const valC = parseFloat(c); const valD = parseFloat(d);
        const emptyCount = [a,b,c,d].filter(v => v.trim() === '').length;

        if (emptyCount !== 1) return;
        
        try {
            if (a.trim() === '') setA(((valB * valC) / valD).toFixed(4));
            else if (b.trim() === '') setB(((valA * valD) / valC).toFixed(4));
            else if (c.trim() === '') setC(((valA * valD) / valB).toFixed(4));
            else if (d.trim() === '') setD(((valB * valC) / valA).toFixed(4));
        } catch {}
    }, [a, b, c, d]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="p-2 text-center text-sm bg-brand-bg rounded-lg">Enter three values to solve for the fourth.</div>
            <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                <Input label="A" value={a} onChange={e => setA(e.target.value)} />
                <span>/</span>
                <Input label="B" value={b} onChange={e => setB(e.target.value)} />
                <span>=</span>
                <Input label="C" value={c} onChange={e => setC(e.target.value)} />
                <span>/</span>
                <Input label="D" value={d} onChange={e => setD(e.target.value)} />
            </div>
        </div>
    );
};

const FactoringCalculator = () => {
    const [number, setNumber] = useState('144');
    
    const result = useMemo(() => {
        const num = parseInt(number);
        if (isNaN(num) || num < 2) return 'Enter an integer > 1';
        try {
            const factors = math.factor(num);
            
            return Array.from(factors.entries())
                .map(([base, exp]: [any, number]) => exp > 1 ? `${base} ^ ${exp}` : String(base))
                .join(' × ');
        } catch {
            return 'Cannot factorize';
        }
    }, [number]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <Input label="Number to Factor" type="number" value={number} onChange={e => setNumber(e.target.value)} />
            <ResultCard title="Prime Factorization" value={result} />
        </div>
    );
};

const PermutationCombinationCalculator = () => {
    const [n, setN] = useState('10');
    const [k, setK] = useState('3');
    
    const result = useMemo(() => {
        const numN = parseInt(n);
        const numK = parseInt(k);
        if (isNaN(numN) || isNaN(numK) || numN < numK || numK < 0) return { perm: 'Invalid', comb: 'Invalid' };
        try {
            const perm = math.permutations(math.bignumber(numN), math.bignumber(numK));
            const comb = math.combinations(math.bignumber(numN), math.bignumber(numK));
            return { perm: perm.toString(), comb: comb.toString() };
        } catch { return { perm: 'Error', comb: 'Error' }; }
    }, [n, k]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Input label="Total number of items (n)" type="number" value={n} onChange={e => setN(e.target.value)} />
                <Input label="Number of items to choose (k)" type="number" value={k} onChange={e => setK(e.target.value)} />
            </div>
            <div className="flex gap-4">
                <ResultCard title="Permutations (nPr)" value={result.perm} description="Order matters" />
                <ResultCard title="Combinations (nCr)" value={result.comb} description="Order does not matter" />
            </div>
        </div>
    );
};

const TriangleCalculator = () => {
    const [a, setA] = useState('5');
    const [b, setB] = useState('6');
    const [c, setC] = useState('7');
    
    const result = useMemo(() => {
        const sA = parseFloat(a); const sB = parseFloat(b); const sC = parseFloat(c);
        if (isNaN(sA) || isNaN(sB) || isNaN(sC) || sA<=0 || sB<=0 || sC<=0) return { error: 'Sides must be positive numbers.' };
        // Triangle inequality theorem
        if (sA + sB <= sC || sA + sC <= sB || sB + sC <= sA) return { error: 'These side lengths cannot form a valid triangle.' };
        
        const perimeter = sA + sB + sC;
        const s = perimeter / 2; // semi-perimeter
        const area = Math.sqrt(s * (s - sA) * (s - sB) * (s - sC)); // Heron's formula
        
        // Law of Cosines to find angles
        const angleA = Math.acos((sB*sB + sC*sC - sA*sA) / (2 * sB * sC)) * (180 / Math.PI);
        const angleB = Math.acos((sA*sA + sC*sC - sB*sB) / (2 * sA * sC)) * (180 / Math.PI);
        const angleC = 180 - angleA - angleB;
        
        return {
            perimeter: perimeter.toFixed(4),
            area: area.toFixed(4),
            angleA: angleA.toFixed(2),
            angleB: angleB.toFixed(2),
            angleC: angleC.toFixed(2),
            error: null
        };
    }, [a, b, c]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <div className="grid md:grid-cols-3 gap-4">
                <Input label="Side a" type="number" value={a} onChange={e => setA(e.target.value)} />
                <Input label="Side b" type="number" value={b} onChange={e => setB(e.target.value)} />
                <Input label="Side c" type="number" value={c} onChange={e => setC(e.target.value)} />
            </div>
            {result.error && <p className="text-red-400 text-center">{result.error}</p>}
            {result.perimeter && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <ResultCard title="Perimeter" value={result.perimeter} />
                    <ResultCard title="Area" value={result.area} />
                    <ResultCard title="Angle A" value={`${result.angleA}°`} />
                    <ResultCard title="Angle B" value={`${result.angleB}°`} />
                    <ResultCard title="Angle C" value={`${result.angleC}°`} />
                </div>
            )}
        </div>
    );
};

const CircleCalculator = () => {
    const [radius, setRadius] = useState('10');
    const [diameter, setDiameter] = useState('20');
    const [circumference, setCircumference] = useState('62.83');
    const [area, setArea] = useState('314.16');
    const [lastChanged, setLastChanged] = useState('radius');

    useEffect(() => {
        const r = parseFloat(radius);
        const d = parseFloat(diameter);
        const c = parseFloat(circumference);
        const a = parseFloat(area);

        if (lastChanged === 'radius' && !isNaN(r)) {
            setDiameter((2 * r).toFixed(2));
            setCircumference((2 * Math.PI * r).toFixed(2));
            setArea((Math.PI * r * r).toFixed(2));
        } else if (lastChanged === 'diameter' && !isNaN(d)) {
            setRadius((d / 2).toFixed(2));
            setCircumference((Math.PI * d).toFixed(2));
            setArea((Math.PI * (d / 2) * (d / 2)).toFixed(2));
        } else if (lastChanged === 'circumference' && !isNaN(c)) {
            const newRadius = c / (2 * Math.PI);
            setRadius(newRadius.toFixed(2));
            setDiameter((2 * newRadius).toFixed(2));
            setArea((Math.PI * newRadius * newRadius).toFixed(2));
        } else if (lastChanged === 'area' && !isNaN(a)) {
            const newRadius = Math.sqrt(a / Math.PI);
            setRadius(newRadius.toFixed(2));
            setDiameter((2 * newRadius).toFixed(2));
            setCircumference((2 * Math.PI * newRadius).toFixed(2));
        }
    }, [radius, diameter, circumference, area, lastChanged]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <div className="p-2 text-center text-sm bg-brand-bg rounded-lg">Changing any value will calculate the others.</div>
             <div className="grid md:grid-cols-2 gap-4">
                <Input label="Radius" type="number" value={radius} onChange={e => { setRadius(e.target.value); setLastChanged('radius'); }} />
                <Input label="Diameter" type="number" value={diameter} onChange={e => { setDiameter(e.target.value); setLastChanged('diameter'); }} />
                <Input label="Circumference" type="number" value={circumference} onChange={e => { setCircumference(e.target.value); setLastChanged('circumference'); }} />
                <Input label="Area" type="number" value={area} onChange={e => { setArea(e.target.value); setLastChanged('area'); }} />
            </div>
        </div>
    );
};

const StandardDeviationCalculator = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8');
    const [error, setError] = useState<string | null>(null);

    const stats = useMemo(() => {
        setError(null);
        if (dataStr.trim() === '') return null;

        try {
            const data = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid number.`);
                return num;
            });

            if (data.length < 2) {
                setError("Please enter at least two numbers.");
                return null;
            }

            return {
                count: data.length,
                sum: math.sum(data),
                mean: math.mean(data),
                populationStdDev: math.std(data, 'uncorrected'),
                sampleStdDev: math.std(data, 'unbiased'),
                populationVariance: math.variance(data, 'uncorrected'),
                sampleVariance: math.variance(data, 'unbiased'),
            };
        } catch (e: any) {
            setError(e.message || "Invalid data format.");
            return null;
        }
    }, [dataStr]);

    const formatValue = (value: number | string | undefined) => {
        if (typeof value === 'number') return parseFloat(value.toFixed(5)).toString();
        if (value === undefined) return '--';
        return value;
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="mb-4">
                <label htmlFor="stddev-data-input" className="block text-lg font-medium mb-2">Enter data (comma or space-separated)</label>
                <textarea id="stddev-data-input" value={dataStr} onChange={e => setDataStr(e.target.value)} rows={4} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono" />
            </div>
            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</div>}
            <div className="bg-brand-bg p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-accent">Results</h3>
                {stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Count:</span><span className="font-mono font-bold">{formatValue(stats.count)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sum:</span><span className="font-mono font-bold">{formatValue(stats.sum)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Mean:</span><span className="font-mono font-bold">{formatValue(stats.mean)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sample Std Dev (n-1):</span><span className="font-mono font-bold">{formatValue(stats.sampleStdDev)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Population Std Dev (n):</span><span className="font-mono font-bold">{formatValue(stats.populationStdDev)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sample Variance:</span><span className="font-mono font-bold">{formatValue(stats.sampleVariance)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Population Variance:</span><span className="font-mono font-bold">{formatValue(stats.populationVariance)}</span></div>
                    </div>
                ) : <p className="text-brand-text-secondary">Enter data for analysis.</p>}
            </div>
        </div>
    );
};

const ConfidenceIntervalCalculator = () => {
    const [mean, setMean] = useState('50');
    const [stdDev, setStdDev] = useState('5');
    const [size, setSize] = useState('100');
    const [confidence, setConfidence] = useState('95');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const zScores: { [key: string]: number } = {
        '80': 1.28, '85': 1.44, '90': 1.645, '95': 1.96, '98': 2.33, '99': 2.576
    };

    const calculate = useCallback(() => {
        setError('');
        const x = parseFloat(mean);
        const s = parseFloat(stdDev);
        const n = parseInt(size);
        const z = zScores[confidence];

        if (isNaN(x) || isNaN(s) || isNaN(n) || s < 0 || n <= 1) {
            setError('Please enter valid inputs (n > 1, s >= 0).');
            setResult(null);
            return;
        }
        if (!z) {
            setError('Please select a valid confidence level.');
            setResult(null);
            return;
        }

        const marginOfError = z * (s / Math.sqrt(n));
        const lowerBound = x - marginOfError;
        const upperBound = x + marginOfError;
        
        setResult({
            marginOfError: marginOfError.toFixed(4),
            lowerBound: lowerBound.toFixed(4),
            upperBound: upperBound.toFixed(4)
        });
    }, [mean, stdDev, size, confidence, zScores]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Input label="Sample Mean (x̄)" type="number" value={mean} onChange={e => setMean(e.target.value)} />
                <Input label="Sample Standard Deviation (s)" type="number" value={stdDev} onChange={e => setStdDev(e.target.value)} />
                <Input label="Sample Size (n)" type="number" value={size} onChange={e => setSize(e.target.value)} />
                <div>
                    <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Confidence Level</label>
                    <select value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border h-[42px]">
                        {Object.keys(zScores).map(level => <option key={level} value={level}>{level}%</option>)}
                    </select>
                </div>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {result && (
                <div className="grid sm:grid-cols-3 gap-4">
                    <ResultCard title="Margin of Error" value={`± ${result.marginOfError}`} />
                    <ResultCard title="Lower Bound" value={result.lowerBound} />
                    <ResultCard title="Upper Bound" value={result.upperBound} />
                </div>
            )}
        </div>
    );
};


const GcfLcmCalculator = () => {
    const [numbersStr, setNumbersStr] = useState('12, 18, 30');
    const [result, setResult] = useState<{ gcf: any, lcm: any } | null>({ gcf: 6, lcm: 90 });
    const [error, setError] = useState('');

    const calculate = useCallback(() => {
        setError('');
        const numbers = numbersStr.split(/[\s,]+/).filter(Boolean).map(s => parseInt(s));
        if (numbers.length < 2 || numbers.some(isNaN)) {
            setError('Please enter at least two valid integers.');
            setResult(null);
            return;
        }
        try {
            const gcf = math.gcd(...numbers);
            const lcm = math.lcm(...numbers);
            setResult({ gcf, lcm });
        } catch (e) {
            setError('Calculation failed. Please check your inputs.');
        }
    }, [numbersStr]);

    useEffect(() => {
      calculate()
    }, [calculate])
    
    return (
      <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
        <Input label="Numbers (comma or space-separated)" value={numbersStr} onChange={e => setNumbersStr(e.target.value)} />
        {error && <p className="text-red-400">{error}</p>}
        {result && (
          <div className="flex gap-4">
            <ResultCard title="Greatest Common Factor (GCF)" value={String(result.gcf)} />
            <ResultCard title="Least Common Multiple (LCM)" value={String(result.lcm)} />
          </div>
        )}
      </div>
    );
};

const PrimeNumberCalculator = () => {
    const [checkNum, setCheckNum] = useState('17');
    const [rangeNum, setRangeNum] = useState('100');
    const [isPrime, setIsPrime] = useState<boolean | null>(true);
    const [primesInRange, setPrimesInRange] = useState<number[]>([]);

    const handleCheck = useCallback(() => {
        const num = parseInt(checkNum);
        if (isNaN(num)) return;
        setIsPrime(math.isPrime(num));
    }, [checkNum]);

    const handleGenerate = useCallback(() => {
        const limit = parseInt(rangeNum);
        if (isNaN(limit) || limit < 2) { setPrimesInRange([]); return; }
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) sieve[j] = false;
            }
        }
        const primes = sieve.map((p, i) => p ? i : -1).filter(i => i !== -1);
        setPrimesInRange(primes);
    }, [rangeNum]);

    useEffect(() => {
      handleCheck();
      handleGenerate();
    }, [handleCheck, handleGenerate])
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <h3 className="text-xl font-bold">Primality Test</h3>
                <Input label="Check Number" type="number" value={checkNum} onChange={e => setCheckNum(e.target.value)} />
                {isPrime !== null && (
                    <div className="text-center font-bold text-lg">{checkNum} is {isPrime ? <span className="text-green-400">a prime number</span> : <span className="text-red-400">not a prime number</span>}.</div>
                )}
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold">Find Primes in a Range</h3>
                <Input label="Find primes up to" type="number" value={rangeNum} onChange={e => setRangeNum(e.target.value)} />
                {primesInRange.length > 0 && (
                    <div className="p-2 bg-brand-bg rounded-lg max-h-48 overflow-y-auto font-mono text-sm">
                        {primesInRange.join(', ')}
                    </div>
                )}
            </div>
        </div>
    );
};

const FractionCalculator = () => {
    const [n1, setN1] = useState('1'); const [d1, setD1] = useState('2');
    const [n2, setN2] = useState('3'); const [d2, setD2] = useState('4');
    const [result, setResult] = useState('');
    
    const fractionMath = useMemo(() => create(all, { number: 'Fraction' }), []);

    const calculate = useCallback((op: 'add' | 'subtract' | 'multiply' | 'divide') => {
        try {
            const f1 = fractionMath.fraction(parseInt(n1), parseInt(d1));
            const f2 = fractionMath.fraction(parseInt(n2), parseInt(d2));
            const res = fractionMath[op](f1, f2);
            setResult(`${res.toString()} (Decimal: ${res.valueOf().toFixed(4)})`);
        } catch {
            setResult('Invalid fraction');
        }
    }, [n1, d1, n2, d2, fractionMath]);

    useEffect(() => {
      calculate('add');
    }, [calculate])

    const FractionInput = ({ n, d, setN, setD }: any) => (
        <div className="flex flex-col items-center">
            <input type="number" value={n} onChange={e=>setN(e.target.value)} className="w-20 bg-gray-900/70 p-1 rounded-md border border-brand-border text-center" />
            <hr className="w-20 my-1 border-brand-text" />
            <input type="number" value={d} onChange={e=>setD(e.target.value)} className="w-20 bg-gray-900/70 p-1 rounded-md border border-brand-border text-center" />
        </div>
    );
    return(
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-center gap-4">
                <FractionInput n={n1} d={d1} setN={setN1} setD={setD1} />
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => calculate('add')} className="p-2 bg-brand-primary rounded text-xl">+</button>
                    <button onClick={() => calculate('subtract')} className="p-2 bg-brand-primary rounded text-xl">-</button>
                    <button onClick={() => calculate('multiply')} className="p-2 bg-brand-primary rounded text-xl">×</button>
                    <button onClick={() => calculate('divide')} className="p-2 bg-brand-primary rounded text-xl">÷</button>
                </div>
                <FractionInput n={n2} d={d2} setN={setN2} setD={setD2} />
            </div>
            {result && <ResultCard title="Result" value={result} />}
        </div>
    );
};

const PowersCalculator = () => {
    // Exponent
    const [base, setBase] = useState('2'); const [exponent, setExponent] = useState('10');
    // Root
    const [radicand, setRadicand] = useState('1024'); const [degree, setDegree] = useState('10');
    // Log
    const [logBase, setLogBase] = useState('2'); const [antilog, setAntilog] = useState('1024');

    const expResult = useMemo(() => { try { return String(math.pow(math.bignumber(base), math.bignumber(exponent))); } catch { return 'Error'; }}, [base, exponent]);
    const rootResult = useMemo(() => { try { return String(math.nthRoot(math.bignumber(radicand), math.bignumber(degree))); } catch { return 'Error'; }}, [radicand, degree]);
    const logResult = useMemo(() => { try { return String(math.log(math.bignumber(antilog), math.bignumber(logBase))); } catch { return 'Error'; }}, [logBase, antilog]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg grid md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-brand-bg p-4 rounded-lg">
                <h3 className="font-bold text-center">Exponent (xʸ)</h3>
                <Input label="Base (x)" value={base} onChange={e => setBase(e.target.value)} />
                <Input label="Exponent (y)" value={exponent} onChange={e => setExponent(e.target.value)} />
                <ResultCard title="Result" value={expResult} />
            </div>
            <div className="space-y-3 bg-brand-bg p-4 rounded-lg">
                <h3 className="font-bold text-center">Root (ⁿ√x)</h3>
                <Input label="Degree (n)" value={degree} onChange={e => setDegree(e.target.value)} />
                <Input label="Radicand (x)" value={radicand} onChange={e => setRadicand(e.target.value)} />
                <ResultCard title="Result" value={rootResult} />
            </div>
             <div className="space-y-3 bg-brand-bg p-4 rounded-lg">
                <h3 className="font-bold text-center">Logarithm (logₐ(x))</h3>
                <Input label="Base (a)" value={logBase} onChange={e => setLogBase(e.target.value)} />
                <Input label="Number (x)" value={antilog} onChange={e => setAntilog(e.target.value)} />
                <ResultCard title="Result" value={logResult} />
            </div>
        </div>
    );
};

const PythagoreanCalculator = () => {
    const [a, setA] = useState('3');
    const [b, setB] = useState('4');
    const [c, setC] = useState('5');
    const [solveFor, setSolveFor] = useState<'c' | 'a' | 'b'>('c');

    const result = useMemo(() => {
        const valA = parseFloat(a); const valB = parseFloat(b); const valC = parseFloat(c);
        if (isNaN(valA) || isNaN(valB) || isNaN(valC)) return 'Invalid input';
        try {
            if (solveFor === 'c') return `c = ${math.sqrt(math.add(math.pow(valA, 2), math.pow(valB, 2))).toFixed(4)}`;
            if (solveFor === 'a') {
                if (valC <= valB) return 'c must be > b';
                return `a = ${math.sqrt(math.subtract(math.pow(valC, 2), math.pow(valB, 2))).toFixed(4)}`;
            }
            if (solveFor === 'b') {
                 if (valC <= valA) return 'c must be > a';
                return `b = ${math.sqrt(math.subtract(math.pow(valC, 2), math.pow(valA, 2))).toFixed(4)}`;
            }
        } catch { return 'Error' }
    }, [a, b, c, solveFor]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="flex justify-center gap-2">
                <span>Solve for:</span>
                <button onClick={() => setSolveFor('a')} className={`px-3 py-1 text-sm rounded-full ${solveFor === 'a' ? 'bg-brand-primary' : 'bg-brand-bg'}`}>a</button>
                <button onClick={() => setSolveFor('b')} className={`px-3 py-1 text-sm rounded-full ${solveFor === 'b' ? 'bg-brand-primary' : 'bg-brand-bg'}`}>b</button>
                <button onClick={() => setSolveFor('c')} className={`px-3 py-1 text-sm rounded-full ${solveFor === 'c' ? 'bg-brand-primary' : 'bg-brand-bg'}`}>c (hypotenuse)</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <Input label="Side a" type="number" value={a} onChange={e => setA(e.target.value)} disabled={solveFor === 'a'} />
                <Input label="Side b" type="number" value={b} onChange={e => setB(e.target.value)} disabled={solveFor === 'b'} />
                <Input label="Hypotenuse c" type="number" value={c} onChange={e => setC(e.target.value)} disabled={solveFor === 'c'} />
            </div>
            <ResultCard title="Result" value={String(result)} description="Based on a² + b² = c²" />
        </div>
    );
};

const DistanceCalculator = () => {
    const [x1, setX1] = useState('2'); const [y1, setY1] = useState('3');
    const [x2, setX2] = useState('8'); const [y2, setY2] = useState('11');
    const result = useMemo(() => {
        try {
            const p1 = [parseFloat(x1), parseFloat(y1)];
            const p2 = [parseFloat(x2), parseFloat(y2)];
            if(p1.some(isNaN) || p2.some(isNaN)) return 'Invalid coordinates';
            return `Distance = ${math.distance(p1, p2).toFixed(4)}`;
        } catch { return 'Error'; }
    }, [x1, y1, x2, y2]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold mb-2">Point 1 (x₁, y₁)</h3>
                    <div className="flex gap-2">
                        <Input label="x₁" type="number" value={x1} onChange={e => setX1(e.target.value)} />
                        <Input label="y₁" type="number" value={y1} onChange={e => setY1(e.target.value)} />
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Point 2 (x₂, y₂)</h3>
                    <div className="flex gap-2">
                        <Input label="x₂" type="number" value={x2} onChange={e => setX2(e.target.value)} />
                        <Input label="y₂" type="number" value={y2} onChange={e => setY2(e.target.value)} />
                    </div>
                </div>
            </div>
             <ResultCard title="Result" value={String(result)} description="2D distance formula" />
        </div>
    );
};

const AreaCalculator = () => {
    const [shape, setShape] = useState('rectangle');
    const [inputs, setInputs] = useState({ width: '10', height: '5', radius: '7', base: '8' });
    const result = useMemo(() => {
        const w = parseFloat(inputs.width); const h = parseFloat(inputs.height);
        const r = parseFloat(inputs.radius); const b = parseFloat(inputs.base);
        try {
            if (shape === 'rectangle' && !isNaN(w) && !isNaN(h)) return `Area = ${(w*h).toFixed(4)}`;
            if (shape === 'triangle' && !isNaN(b) && !isNaN(h)) return `Area = ${(0.5*b*h).toFixed(4)}`;
            if (shape === 'circle' && !isNaN(r)) return `Area = ${(Math.PI * r * r).toFixed(4)}`;
            return 'Invalid inputs';
        } catch { return 'Error'; }
    }, [shape, inputs]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <select value={shape} onChange={e => setShape(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                <option value="rectangle">Rectangle</option>
                <option value="triangle">Triangle</option>
                <option value="circle">Circle</option>
            </select>
            <div className="flex gap-4">
                {shape === 'rectangle' && <>
                    <Input label="Width" type="number" value={inputs.width} onChange={e => setInputs({...inputs, width: e.target.value})} />
                    <Input label="Height" type="number" value={inputs.height} onChange={e => setInputs({...inputs, height: e.target.value})} />
                </>}
                 {shape === 'triangle' && <>
                    <Input label="Base" type="number" value={inputs.base} onChange={e => setInputs({...inputs, base: e.target.value})} />
                    <Input label="Height" type="number" value={inputs.height} onChange={e => setInputs({...inputs, height: e.target.value})} />
                </>}
                {shape === 'circle' && <Input label="Radius" type="number" value={inputs.radius} onChange={e => setInputs({...inputs, radius: e.target.value})} />}
            </div>
            <ResultCard title="Result" value={String(result)} />
        </div>
    );
};

const RandomNumberGenerator = () => {
    const [min, setMin] = useState('1');
    const [max, setMax] = useState('100');
    const [count, setCount] = useState('5');
    const [numbers, setNumbers] = useState<number[]>([]);

    const generate = () => {
        const minN = parseInt(min); const maxN = parseInt(max); const countN = parseInt(count);
        if (isNaN(minN) || isNaN(maxN) || isNaN(countN) || minN > maxN || countN <= 0) return;
        const results = Array.from({length: countN}, () => Math.floor(Math.random() * (maxN - minN + 1)) + minN);
        setNumbers(results);
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
                <Input label="Minimum" type="number" value={min} onChange={e => setMin(e.target.value)} />
                <Input label="Maximum" type="number" value={max} onChange={e => setMax(e.target.value)} />
                <Input label="Count" type="number" value={count} onChange={e => setCount(e.target.value)} />
            </div>
            <button onClick={generate} className="w-full py-2 bg-brand-primary rounded-lg font-semibold">Generate</button>
            {numbers.length > 0 && <ResultCard title="Generated Numbers" value={numbers.join(', ')} />}
        </div>
    );
};


// --- Main Component ---
const MathTools: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState('statistics');

    const calculatorList = [
        { id: 'statistics', label: 'Statistics', Icon: BarChart },
        { id: 'matrix', label: 'Matrix', Icon: Table },
        { id: 'stddev', label: 'Standard Deviation', Icon: BarChartHorizontal },
        { id: 'confidence', label: 'Confidence Interval', Icon: Scaling },
        { id: 'equations', label: 'Equation Solver', Icon: FunctionSquare },
        { id: 'percentage', label: 'Percentage', Icon: Percent },
        { id: 'rounding', label: 'Rounding', Icon: Eraser },
        { id: 'ratio', label: 'Ratio & Proportion', Icon: GitCompareArrows },
        { id: 'fractions', label: 'Fractions', Icon: DivideCircle },
        { id: 'factoring', label: 'Factoring', Icon: Atom },
        { id: 'perm-comb', label: 'Permutation/Combination', Icon: ArrowRightLeft },
        { id: 'gcf-lcm', label: 'GCF & LCM', Icon: Sigma },
        { id: 'prime', label: 'Prime Numbers', Icon: ShieldCheck },
        { id: 'powers', label: 'Powers & Roots', Icon: Superscript },
        { id: 'pythagorean', label: 'Pythagorean Theorem', Icon: Triangle },
        { id: 'triangle', label: 'Triangle Solver', Icon: Triangle },
        { id: 'circle', label: 'Circle Solver', Icon: Circle },
        { id: 'distance', label: 'Distance', Icon: Ruler },
        { id: 'area', label: 'Area', Icon: RectangleHorizontal },
        { id: 'random', label: 'Random Numbers', Icon: Shuffle },
    ];

    const renderCalculator = () => {
        switch (activeCalc) {
            case 'matrix': return <MatrixCalculator />;
            case 'statistics': return <StatisticsCalculator />;
            case 'equations': return <EquationSolverTool />;
            case 'percentage': return <PercentageCalculatorTool />;
            case 'gcf-lcm': return <GcfLcmCalculator />;
            case 'prime': return <PrimeNumberCalculator />;
            case 'fractions': return <FractionCalculator />;
            case 'powers': return <PowersCalculator />;
            case 'pythagorean': return <PythagoreanCalculator />;
            case 'distance': return <DistanceCalculator />;
            case 'area': return <AreaCalculator />;
            case 'random': return <RandomNumberGenerator />;
            case 'stddev': return <StandardDeviationCalculator />;
            case 'confidence': return <ConfidenceIntervalCalculator />;
            case 'rounding': return <RoundingCalculator />;
            case 'ratio': return <RatioCalculator />;
            case 'factoring': return <FactoringCalculator />;
            case 'perm-comb': return <PermutationCombinationCalculator />;
            case 'triangle': return <TriangleCalculator />;
            case 'circle': return <CircleCalculator />;
            default: return null;
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Math Tools Suite</h2>
            
            <div className="flex justify-center flex-wrap gap-2 mb-6">
                {calculatorList.map(calc => (
                     <SubNavButton 
                        key={calc.id}
                        label={calc.label} 
                        icon={calc.Icon}
                        isActive={activeCalc === calc.id} 
                        onClick={() => setActiveCalc(calc.id)} 
                     />
                ))}
            </div>

            {renderCalculator()}
        </div>
    );
};

export default MathTools;