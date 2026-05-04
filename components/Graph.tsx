import { useState, useMemo, useRef, useEffect } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, RefObject, FC } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, BarChart, Bar
} from 'recharts';
import { create, all } from 'mathjs';
import { Plus, Trash2, Download, ChevronDown, AlertTriangle } from 'lucide-react';

const math = create(all);

// --- Reusable UI ---
const SubNavButton: FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base ${isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}
    >
        {label}
    </button>
);

const Input = ({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string, id: string }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <input id={id} {...props} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary" />
    </div>
);

const TextArea = ({ label, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, id: string }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <textarea id={id} {...props} rows={5} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 font-mono focus:ring-brand-primary focus:border-brand-primary" />
    </div>
);

const ErrorDisplay: FC<{ error: string | null }> = ({ error }) => {
    if (!error) return null;
    return (
        <div className="flex items-center gap-2 text-red-400 p-3 bg-red-900/50 rounded-md">
            <AlertTriangle size={20} />
            <span>{error}</span>
        </div>
    );
};

const ToggleSwitch: FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-brand-text-secondary">{label}</label>
        <button
            onClick={() => onChange(!checked)}
            role="switch"
            aria-checked={checked}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-gray-600'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);


const CollapsibleSection: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <details className="border border-brand-border rounded-lg group" open>
        <summary className="p-3 cursor-pointer font-semibold hover:bg-brand-border/30 list-none flex justify-between items-center">
            {title}
            <ChevronDown className="transform transition-transform duration-200 group-open:rotate-180" size={18} />
        </summary>
        <div className="p-4 border-t border-brand-border space-y-4">
            {children}
        </div>
    </details>
);


const ExportButton: FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-accent/80 hover:bg-brand-accent text-white rounded-md font-semibold transition-colors"
    >
        <Download size={18} /> Export as PNG
    </button>
);

// --- Export Logic ---
const exportToPng = (chartRef: RefObject<HTMLDivElement>, fileName: string) => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) {
        console.error("SVG element not found for export.");
        return;
    }

    const { width, height } = svg.getBoundingClientRect();
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Draw background on canvas to handle themes and transparency
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Increase resolution for better quality
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(2, 2);
    ctx.fillStyle = computedStyle.getPropertyValue('--color-surface').trim() || '#2d3748';
    ctx.fillRect(0, 0, width, height);

    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.onerror = (e) => {
        console.error("Image loading failed for SVG export:", e);
        URL.revokeObjectURL(url);
    };
    img.src = url;
};


// --- Chart Components ---

interface PlotFunction {
    id: string;
    expression: string;
    color: string;
    visible: boolean;
}

const FunctionPlotter = () => {
    const [functions, setFunctions] = useState<PlotFunction[]>([
        { id: '1', expression: 'sin(x)', color: '#4299e1', visible: true }
    ]);
    const [xMin, setXMin] = useState('-10');
    const [xMax, setXMax] = useState('10');
    const [title, setTitle] = useState('Dynamic Function Plot');
    const [xLabel, setXLabel] = useState('x');
    const [yLabel, setYLabel] = useState('f(x)');
    const chartRef = useRef<HTMLDivElement>(null);

    const addFunction = () => {
        const colors = ['#f56565', '#48bb78', '#ed8936', '#9f7aea', '#4fd1c5'];
        const newColor = colors[functions.length % colors.length];
        setFunctions([...functions, { id: Date.now().toString(), expression: '', color: newColor, visible: true }]);
    };

    const removeFunction = (id: string) => {
        if (functions.length > 1) {
            setFunctions(functions.filter(f => f.id !== id));
        }
    };

    const updateFunction = (id: string, updates: Partial<PlotFunction>) => {
        setFunctions(functions.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const { datasets, error } = useMemo(() => {
        const min = parseFloat(xMin);
        const max = parseFloat(xMax);
        if (isNaN(min) || isNaN(max)) return { datasets: [], error: "X Min/Max must be numbers."};
        if (min >= max) return { datasets: [], error: "X Max must be > X Min." };
        
        const combinedData: any[] = [];
        const step = (max - min) / 200;

        try {
            const compiledFunctions = functions.filter(f => f.visible && f.expression.trim()).map(f => {
                try {
                    return { id: f.id, code: math.parse(f.expression).compile() };
                } catch {
                    return null;
                }
            }).filter(Boolean);

            for (let i = 0; i <= 200; i++) {
                const x = min + i * step;
                const point: any = { x: parseFloat(x.toPrecision(4)) };
                compiledFunctions.forEach(cf => {
                    try {
                        const y = cf!.code.evaluate({ x });
                        if (typeof y === 'number' && isFinite(y)) {
                            point[`y_${cf!.id}`] = y;
                        }
                    } catch {
                        // Ignore evaluation errors for a specific point
                    }
                });
                combinedData.push(point);
            }
            return { datasets: combinedData, error: null };
        } catch (e) {
             return { datasets: [], error: e instanceof Error ? e.message : 'Invalid function detected.' };
        }
    }, [xMin, xMax, functions]);
    
    const handleExport = () => exportToPng(chartRef, `${title.replace(/\s+/g, '_') || 'function-plot'}.png`);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-brand-text uppercase tracking-widest">Equations</h4>
                            <button onClick={addFunction} className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                        {functions.map(f => (
                            <div key={f.id} className="flex items-center gap-2 group">
                                <input 
                                    type="color" 
                                    value={f.color} 
                                    onChange={e => updateFunction(f.id, { color: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                />
                                <div className="flex-1 relative">
                                    <input 
                                        type="text"
                                        placeholder="sin(x)..."
                                        value={f.expression}
                                        onChange={e => updateFunction(f.id, { expression: e.target.value })}
                                        className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 pr-8 font-mono text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                    {f.expression && (
                                        <button 
                                            onClick={() => updateFunction(f.id, { visible: !f.visible })}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${f.visible ? 'text-brand-primary' : 'text-brand-text-secondary line-through'}`}
                                        >
                                            {f.visible ? 'HIDE' : 'SHOW'}
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => removeFunction(f.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Input id="function_xmin" label="X Min" type="text" value={xMin} onChange={e => setXMin(e.target.value)} />
                        <Input id="function_xmax" label="X Max" type="text" value={xMax} onChange={e => setXMax(e.target.value)} />
                    </div>

                    <ErrorDisplay error={error} />

                    <CollapsibleSection title="Chart Preferences">
                         <Input id="function_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <div className="grid grid-cols-2 gap-2">
                            <Input id="function_xlabel" label="X-Axis" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                            <Input id="function_ylabel" label="Y-Axis" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         </div>
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef} className="bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                        <h3 className="text-xl font-bold text-center mb-6">{title}</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <LineChart data={datasets} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                                    <XAxis type="number" dataKey="x" domain={['dataMin', 'dataMax']} stroke="var(--color-text-secondary)" label={{ value: xLabel, position: 'insideBottom', offset: -15 }} tick={{fontSize: 10}} />
                                    <YAxis stroke="var(--color-text-secondary)" label={{ value: yLabel, angle: -90, position: 'insideLeft' }} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }} itemStyle={{fontSize: '12px'}} />
                                    <Legend wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                                    {functions.map(f => f.visible && f.expression && (
                                        <Line 
                                            key={f.id}
                                            type="monotone" 
                                            dataKey={`y_${f.id}`} 
                                            stroke={f.color} 
                                            strokeWidth={2} 
                                            dot={false} 
                                            name={`y = ${f.expression}`} 
                                            animationDuration={300}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <ExportButton onClick={handleExport} />
                </div>
            </div>
        </div>
    );
};

const ScatterPlotter = () => {
    const [dataStr, setDataStr] = useState('1, 5\n2, 8\n3, 6\n4, 9\n5, 7');
    const [title, setTitle] = useState('Sample Scatter Plot');
    const [xLabel, setXLabel] = useState('X-Axis');
    const [yLabel, setYLabel] = useState('Y-Axis');
    const [pointColor, setPointColor] = useState('#4299e1');
    const chartRef = useRef<HTMLDivElement>(null);
    
    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: [], error: "Please enter data." };
        try {
            const points = dataStr.split('\n').map((line, i) => {
                const parts = line.split(/[,;\s]+/).filter(Boolean);
                if (parts.length !== 2) throw new Error(`Invalid format on line ${i + 1}. Use 'X, Y'.`);
                const [x, y] = [parseFloat(parts[0]), parseFloat(parts[1])];
                if (isNaN(x) || isNaN(y)) throw new Error(`Invalid number on line ${i + 1}.`);
                return { x, y };
            });
            return { data: points, error: null };
        } catch (e) { return { data: [], error: e instanceof Error ? e.message : "An error occurred." }; }
    }, [dataStr]);

    const handleExport = () => exportToPng(chartRef, `${title.replace(/\s+/g, '_') || 'scatter-plot'}.png`);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                     <TextArea id="scatter_data" label="Data (X,Y per line)" value={dataStr} onChange={e => setDataStr(e.target.value)} />
                     <ErrorDisplay error={error} />
                     <CollapsibleSection title="Customize Chart">
                         <Input id="scatter_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <Input id="scatter_xlabel" label="X-Axis Label" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                         <Input id="scatter_ylabel" label="Y-Axis Label" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         <div>
                            <label htmlFor="scatter_color" className="block text-sm font-medium text-brand-text-secondary mb-1">Point Color</label>
                            <input id="scatter_color" type="color" value={pointColor} onChange={e => setPointColor(e.target.value)} className="w-full h-10 p-1 bg-gray-900/70 border-gray-600 rounded-md cursor-pointer" />
                        </div>
                     </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef}>
                        <h3 className="text-xl font-bold text-center mb-2 min-h-[28px]">{title}</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="var(--color-border)" />
                                    <XAxis type="number" dataKey="x" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15 }} stroke="var(--color-text-secondary)" />
                                    <YAxis type="number" dataKey="y" name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} stroke="var(--color-text-secondary)" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                    <Scatter name="Data Points" data={data} fill={pointColor} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <ExportButton onClick={handleExport} />
                </div>
            </div>
        </div>
    );
};

const BarChartCreator = () => {
    const [dataStr, setDataStr] = useState('Mice, 25\nZebra, 42\nLion, 12\nElephant, 8');
    const [title, setTitle] = useState('Animal Population');
    const [xLabel, setXLabel] = useState('Animal');
    const [yLabel, setYLabel] = useState('Population');
    const [barColor, setBarColor] = useState('#48bb78');
    const chartRef = useRef<HTMLDivElement>(null);
    
    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: [], error: "Please enter data." };
        try {
            const points = dataStr.split('\n').map((line, i) => {
                const parts = line.split(',');
                if (parts.length !== 2) throw new Error(`Invalid format on line ${i + 1}. Use 'Label,Value'.`);
                const name = parts[0].trim();
                const value = parseFloat(parts[1]);
                if (!name) throw new Error(`Missing label on line ${i+1}.`);
                if (isNaN(value)) throw new Error(`Invalid number on line ${i + 1}.`);
                return { name, value };
            });
            return { data: points, error: null };
        } catch (e) { return { data: [], error: e instanceof Error ? e.message : "An error occurred." }; }
    }, [dataStr]);

    const handleExport = () => exportToPng(chartRef, `${title.replace(/\s+/g, '_') || 'bar-chart'}.png`);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <TextArea id="bar_data" label="Data (Label,Value per line)" value={dataStr} onChange={e => setDataStr(e.target.value)} />
                    <ErrorDisplay error={error} />
                    <CollapsibleSection title="Customize Chart">
                         <Input id="bar_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <Input id="bar_xlabel" label="X-Axis Label" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                         <Input id="bar_ylabel" label="Y-Axis Label" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         <div>
                            <label htmlFor="bar_color" className="block text-sm font-medium text-brand-text-secondary mb-1">Bar Color</label>
                            <input id="bar_color" type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-full h-10 p-1 bg-gray-900/70 border-gray-600 rounded-md cursor-pointer" />
                        </div>
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef}>
                        <h3 className="text-xl font-bold text-center mb-2 min-h-[28px]">{title}</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="var(--color-border)" />
                                    <XAxis dataKey="name" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15 }} stroke="var(--color-text-secondary)" />
                                    <YAxis name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} stroke="var(--color-text-secondary)" />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                    <Legend />
                                    <Bar dataKey="value" fill={barColor} name={yLabel} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <ExportButton onClick={handleExport} />
                </div>
            </div>
        </div>
    );
};

const HistogramCreator = () => {
    const [dataStr, setDataStr] = useState('1,5,2,8,7,9,12,4,5,8,5,6,10,11');
    const [numBins, setNumBins] = useState('5');
    const [title, setTitle] = useState('Data Distribution');
    const [xLabel, setXLabel] = useState('Value Bins');
    const [yLabel, setYLabel] = useState('Frequency');
    const [barColor, setBarColor] = useState('#ed8936');
    const chartRef = useRef<HTMLDivElement>(null);
    
    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: [], error: "Please enter data." };
        const bins = parseInt(numBins);
        if (isNaN(bins) || bins <= 0) return { data: [], error: "Number of bins must be a positive integer." };
        
        try {
            const numbers = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid number.`);
                return num;
            });
            if (numbers.length < 2) return { data: [], error: "Please enter at least two numbers."};

            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            if (min === max) return { data: [{ name: `${min}`, count: numbers.length }], error: null };

            const binWidth = (max - min) / bins;
            const histogramData = Array.from({ length: bins }, (_, i) => ({
                name: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
                count: 0
            }));
            
            numbers.forEach(num => {
                const binIndex = num === max ? bins - 1 : Math.floor((num - min) / binWidth);
                if (histogramData[binIndex]) histogramData[binIndex].count++;
            });
            return { data: histogramData, error: null };
        } catch (e) { return { data: [], error: e instanceof Error ? e.message : "Invalid data format." }; }
    }, [dataStr, numBins]);
    
    const handleExport = () => exportToPng(chartRef, `${title.replace(/\s+/g, '_') || 'histogram'}.png`);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-4">
                     <TextArea id="hist_data" label="Data (comma or space-separated)" value={dataStr} onChange={e => setDataStr(e.target.value)} />
                     <Input id="hist_bins" label="Number of Bins" type="number" value={numBins} min="1" onChange={e => setNumBins(e.target.value)} />
                     <ErrorDisplay error={error} />
                     <CollapsibleSection title="Customize Chart">
                         <Input id="hist_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <Input id="hist_xlabel" label="X-Axis Label" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                         <Input id="hist_ylabel" label="Y-Axis Label" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         <div>
                            <label htmlFor="hist_color" className="block text-sm font-medium text-brand-text-secondary mb-1">Bar Color</label>
                            <input id="hist_color" type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-full h-10 p-1 bg-gray-900/70 border-gray-600 rounded-md cursor-pointer" />
                        </div>
                     </CollapsibleSection>
                 </div>
                 <div className="lg:col-span-2">
                    <div ref={chartRef}>
                        <h3 className="text-xl font-bold text-center mb-2 min-h-[28px]">{title}</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} barCategoryGap="0%">
                                    <CartesianGrid stroke="var(--color-border)" />
                                    <XAxis dataKey="name" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15 }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <YAxis name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} stroke="var(--color-text-secondary)" allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                    <Legend />
                                    <Bar dataKey="count" fill={barColor} name={yLabel} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <ExportButton onClick={handleExport} />
                 </div>
            </div>
        </div>
    );
};

const PieChartCreator = () => {
    const [dataStr, setDataStr] = useState('Marketing, 50\nSales, 120\nDevelopment, 90\nSupport, 75');
    const [title, setTitle] = useState('Department Budget Allocation');
    const [enable3d, setEnable3d] = useState(true);
    const chartRef = useRef<HTMLDivElement>(null);

    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: [], error: "Please enter data." };
        try {
            const parsedData = dataStr.split('\n').map((line, index) => {
                const parts = line.split(',');
                if (parts.length !== 2) throw new Error(`Invalid format on line ${index + 1}. Use 'Label,Value'.`);
                const name = parts[0].trim();
                const value = parseFloat(parts[1].trim());
                if (!name) throw new Error(`Missing label on line ${index + 1}.`);
                if (isNaN(value)) throw new Error(`Invalid number on line ${index + 1}.`);
                return { name, value };
            });
            return { data: parsedData, error: null };
        } catch (e) { return { data: [], error: e instanceof Error ? e.message : "An error occurred." }; }
    }, [dataStr]);
    
    const COLORS = ['#4299e1', '#ed8936', '#48bb78', '#9f7aea', '#f56565', '#4fd1c5'];
    const handleExport = () => exportToPng(chartRef, `${title.replace(/\s+/g, '_') || 'pie-chart'}.png`);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <TextArea id="pie_data" label="Data (Label,Value per line)" value={dataStr} onChange={e => setDataStr(e.target.value)} />
                     <ErrorDisplay error={error} />
                     <CollapsibleSection title="Customize Chart">
                        <Input id="pie_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                        <ToggleSwitch label="Enable 3D Effect" checked={enable3d} onChange={setEnable3d} />
                     </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div className={`transition-transform ${enable3d ? '[filter:drop-shadow(0_10px_8px_rgba(0,0,0,0.3))]' : ''}`} ref={chartRef}>
                        <h3 className="text-xl font-bold text-center mb-2 min-h-[28px]">{title}</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <ExportButton onClick={handleExport} />
                </div>
            </div>
        </div>
    );
};

// --- Main Graphing Component ---
const Graph = () => {
    type ChartType = 'function' | 'scatter' | 'bar' | 'histogram' | 'pie';
    const [chartType, setChartType] = useState<ChartType>(() => {
        try {
            return (localStorage.getItem('graphing_activeChartType') as ChartType) || 'function';
        } catch { return 'function'; }
    });

    useEffect(() => {
        try {
            localStorage.setItem('graphing_activeChartType', chartType);
        } catch { console.error("Failed to save chart type"); }
    }, [chartType]);
    
    const renderChart = () => {
        switch(chartType) {
            case 'function': return <FunctionPlotter />;
            case 'scatter': return <ScatterPlotter />;
            case 'bar': return <BarChartCreator />;
            case 'histogram': return <HistogramCreator />;
            case 'pie': return <PieChartCreator />;
            default: return null;
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Graphing & Charting Suite</h2>
             <div className="flex justify-center flex-wrap gap-2 mb-6">
                <SubNavButton label="Function Plot" isActive={chartType === 'function'} onClick={() => setChartType('function')} />
                <SubNavButton label="Scatter Plot" isActive={chartType === 'scatter'} onClick={() => setChartType('scatter')} />
                <SubNavButton label="Bar Chart" isActive={chartType === 'bar'} onClick={() => setChartType('bar')} />
                <SubNavButton label="Histogram" isActive={chartType === 'histogram'} onClick={() => setChartType('histogram')} />
                <SubNavButton label="Pie Chart" isActive={chartType === 'pie'} onClick={() => setChartType('pie')} />
            </div>
            {renderChart()}
        </div>
    );
};

export default Graph;