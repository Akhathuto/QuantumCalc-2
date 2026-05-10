import { useState, useMemo, useRef, useEffect } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, RefObject, FC } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, BarChart, Bar
} from 'recharts';
import { create, all } from 'mathjs';
import { Plus, Trash2, Download, ChevronDown, AlertTriangle, ShieldCheck, Activity, Box, Wind, Zap, BarChart2, MousePointer2 } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

const Plot = createPlotlyComponent(Plotly);

const math = create(all);

// --- Reusable UI ---
const CategoryTab: FC<{ label: string; icon: any; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isActive ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30 -translate-y-1' : 'bg-brand-surface/40 text-brand-text-secondary hover:bg-brand-surface/80 hover:text-brand-text border border-brand-border/50'}`}
    >
        <Icon size={14} />
        <span>{label}</span>
    </button>
);

const ChartTypeButton: FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${isActive ? 'bg-brand-text text-brand-bg border-brand-text' : 'bg-transparent text-brand-text-secondary border-brand-border hover:border-brand-text/50 hover:text-brand-text'}`}
    >
        {label}
    </button>
);

const Input = ({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string, id: string }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">{label}</label>
        <input id={id} {...props} className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/50" />
    </div>
);

const TextArea = ({ label, id, onClear, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, id: string, onClear?: () => void }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between ml-1">
            <label htmlFor={id} className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">{label}</label>
            {onClear && (
                <button onClick={onClear} className="text-[10px] font-black text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-widest">Clear</button>
            )}
        </div>
        <textarea id={id} {...props} rows={5} className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-4 font-mono text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/20" />
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

const Scatter3DPlotter = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2\n2, 8, 4\n3, 6, 7\n4, 9, 1\n5, 7, 5');
    const [title, setTitle] = useState('3D Spatial Patterns');
    
    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: null, error: "Please enter data points (X, Y, Z)." };
        try {
            const lines = dataStr.split('\n').filter(l => l.trim());
            const x: number[] = [], y: number[] = [], z: number[] = [];
            lines.forEach((line, i) => {
                const parts = line.split(/[,;\s]+/).filter(Boolean);
                if (parts.length !== 3) throw new Error(`Invalid format on line ${i + 1}. Use 'X, Y, Z'.`);
                const [xv, yv, zv] = [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
                if (isNaN(xv) || isNaN(yv) || isNaN(zv)) throw new Error(`Invalid number on line ${i + 1}.`);
                x.push(xv); y.push(yv); z.push(zv);
            });
            return {
                data: [{
                    x, y, z,
                    mode: 'markers',
                    type: 'scatter3d',
                    marker: {
                        size: 8,
                        color: z,
                        colorscale: 'Viridis',
                        opacity: 0.8,
                        line: { color: 'white', width: 0.5 }
                    }
                }],
                error: null
            };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e.message : "Parsing error." };
        }
    }, [dataStr]);

    return (
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Box size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">3D Scatter Matrix</h4>
                            <p className="text-[10px] text-brand-text-secondary uppercase">Spatial Data Ingestion</p>
                        </div>
                    </div>
                    <TextArea id="s3d_data" label="Coordinate Dataset (X, Y, Z)" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} placeholder="0, 0, 0" />
                    <Input id="s3d_title" label="Visualization Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2">
                    <div className="h-[600px] bg-brand-bg/40 p-6 rounded-[2.5rem] border border-brand-border/50 overflow-hidden relative group/plot">
                        <div className="absolute top-6 left-6 z-10">
                            <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">Rendering Engine</div>
                            <div className="text-[8px] font-mono text-brand-text-secondary uppercase">3D_ACCEL // ACTIVE</div>
                        </div>
                        {data && (
                            <Plot 
                                data={data as any} 
                                layout={{ 
                                    title: { text: title, font: { family: 'Inter', size: 16, color: '#ffffff', weight: 'bold' } },
                                    autosize: true, 
                                    margin: { l: 0, r: 0, b: 0, t: 80 }, 
                                    paper_bgcolor: 'rgba(0,0,0,0)', 
                                    font: { color: '#ffffff' },
                                    scene: {
                                        xaxis: { gridcolor: '#444', title: 'X AXIS', backgroundcolor: 'rgba(0,0,0,0.1)', showbackground: true },
                                        yaxis: { gridcolor: '#444', title: 'Y AXIS', backgroundcolor: 'rgba(0,0,0,0.1)', showbackground: true },
                                        zaxis: { gridcolor: '#444', title: 'Z AXIS', backgroundcolor: 'rgba(0,0,0,0.1)', showbackground: true }
                                    }
                                }} 
                                style={{ width: '100%', height: '100%' }} 
                                useResizeHandler={true} 
                                config={{ displayModeBar: false }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RadarPlotter = () => {
    const [dataStr, setDataStr] = useState('Speed, 80\nStrength, 45\nAgility, 90\nIntelligence, 70\nEndurance, 55\nLuck, 30');
    const [title, setTitle] = useState('Attribute Analysis');

    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: null, error: "Please enter data." };
        try {
            const lines = dataStr.split('\n').filter(l => l.trim());
            const r: number[] = [], theta: string[] = [];
            lines.forEach((line, i) => {
                const parts = line.split(',');
                if (parts.length !== 2) throw new Error(`Invalid format on line ${i + 1}. Use 'Label, Value'.`);
                const label = parts[0].trim();
                const value = parseFloat(parts[1].trim());
                if (!label || isNaN(value)) throw new Error(`Invalid data on line ${i + 1}.`);
                r.push(value); theta.push(label);
            });
            // Close the loop
            r.push(r[0]); theta.push(theta[0]);
            
            return {
                data: [{
                    type: 'scatterpolar',
                    r, theta,
                    fill: 'toself',
                    fillcolor: 'rgba(99, 102, 241, 0.3)',
                    line: { color: '#6366f1', width: 4 },
                    marker: { color: '#6366f1', size: 10 }
                }],
                error: null
            };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e.message : "Parsing error." };
        }
    }, [dataStr]);

    return (
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">Multi-Axis Analysis</h4>
                            <p className="text-[10px] text-brand-text-secondary uppercase">Recursive Property Evaluation</p>
                        </div>
                    </div>
                    <TextArea id="radar_data" label="Property Set (Label, Value)" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} placeholder="Property, 100" />
                    <Input id="radar_title" label="Plot Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2">
                    <div className="h-[550px] bg-brand-bg/40 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10">
                            <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">Polar Geometry Core</div>
                            <div className="text-[8px] font-mono text-brand-text-secondary uppercase">RADAR_PROTO // STABLE</div>
                        </div>
                        {data && (
                            <Plot 
                                data={data as any} 
                                layout={{ 
                                    title: { text: title, font: { family: 'Inter', size: 16, color: '#ffffff', weight: 'bold' } },
                                    polar: { 
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        radialaxis: { visible: true, gridcolor: '#444', range: [0, Math.max(...data[0].r) * 1.1], tickfont: { size: 10 } },
                                        angularaxis: { gridcolor: '#444', tickfont: { size: 10 } }
                                    },
                                    paper_bgcolor: 'rgba(0,0,0,0)', 
                                    font: { color: '#ffffff', family: 'Inter' },
                                    margin: { l: 80, r: 80, b: 80, t: 80 }
                                }} 
                                style={{ width: '100%', height: '100%' }} 
                                useResizeHandler={true} 
                                config={{ displayModeBar: false }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FunctionPlotter = () => {
    const [functions, setFunctions] = useState<PlotFunction[]>([
        { id: '1', expression: 'sin(x)', color: '#4299e1', visible: true }
    ]);
    const [xMin, setXMin] = useState('-10');
    const [xMax, setXMax] = useState('10');
    const [title, setTitle] = useState('Dynamic Function Analysis');
    const [xLabel, setXLabel] = useState('x-axis (ref)');
    const [yLabel, setYLabel] = useState('f(x) resultant');
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
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">Equations</h4>
                                    <p className="text-[10px] text-brand-text-secondary uppercase">Vector Calculus Mode</p>
                                </div>
                            </div>
                            <button onClick={addFunction} className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg hover:shadow-brand-primary/20">
                                <Plus size={20} />
                            </button>
                        </div>
                        {functions.map(f => (
                            <div key={f.id} className="flex items-center gap-3 group">
                                <input 
                                    type="color" 
                                    value={f.color} 
                                    onChange={e => updateFunction(f.id, { color: e.target.value })}
                                    className="w-10 h-10 rounded-xl cursor-pointer bg-brand-bg/50 border border-brand-border hover:border-brand-primary transition-colors"
                                />
                                <div className="flex-1 relative">
                                    <input 
                                        type="text"
                                        placeholder="sin(x)..."
                                        value={f.expression}
                                        onChange={e => updateFunction(f.id, { expression: e.target.value })}
                                        className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-3 pr-10 font-mono text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                    />
                                    {f.expression && (
                                        <button 
                                            onClick={() => updateFunction(f.id, { visible: !f.visible })}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest ${f.visible ? 'text-brand-primary' : 'text-brand-text-secondary opacity-50'}`}
                                        >
                                            {f.visible ? 'ON' : 'OFF'}
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => removeFunction(f.id)} className="opacity-0 group-hover:opacity-100 p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="function_xmin" label="Lower Bound (x)" type="text" value={xMin} onChange={e => setXMin(e.target.value)} />
                        <Input id="function_xmax" label="Upper Bound (x)" type="text" value={xMax} onChange={e => setXMax(e.target.value)} />
                    </div>

                    <ErrorDisplay error={error} />

                    <CollapsibleSection title="Advanced Schema">
                         <Input id="function_title" label="Visualization Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input id="function_xlabel" label="X-Axis Alias" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                            <Input id="function_ylabel" label="Y-Axis Alias" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         </div>
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef} className="bg-brand-bg/40 p-8 rounded-[2.5rem] border border-brand-border/50 relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Live Computation Baseline</span>
                        </div>
                        <h3 className="text-xl font-black text-center mb-10 text-brand-text/80">{title}</h3>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer>
                                <LineChart data={datasets} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
                                    <XAxis type="number" dataKey="x" domain={['dataMin', 'dataMax']} stroke="var(--color-text-secondary)" label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 10, fill: 'var(--color-text-secondary)' }} tick={{fontSize: 10, fill: 'var(--color-text-secondary)'}} />
                                    <YAxis stroke="var(--color-text-secondary)" label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-secondary)' }} tick={{fontSize: 10, fill: 'var(--color-text-secondary)'}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 28, 30, 0.9)', borderColor: 'var(--color-border)', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{fontSize: '12px', fontWeight: 'bold'}} labelStyle={{fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'black', marginBottom: '4px'}} />
                                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '30px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
                                    {functions.map(f => f.visible && f.expression && (
                                        <Line 
                                            key={f.id}
                                            type="monotone" 
                                            dataKey={`y_${f.id}`} 
                                            stroke={f.color} 
                                            strokeWidth={3} 
                                            dot={false} 
                                            name={f.expression} 
                                            animationDuration={1000}
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
    const [title, setTitle] = useState('Empirical Coordinate Analysis');
    const [xLabel, setXLabel] = useState('Independent Variable');
    const [yLabel, setYLabel] = useState('Dependent Outcome');
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
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Wind size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">Discrete Set</h4>
                            <p className="text-[10px] text-brand-text-secondary uppercase">Stochastic Point Mapping</p>
                        </div>
                    </div>
                    <TextArea id="scatter_data" label="Coordinate Matrix (X, Y)" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} placeholder="0, 0" />
                    <ErrorDisplay error={error} />
                    <CollapsibleSection title="Geometric Rules">
                         <Input id="scatter_title" label="Visualization Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input id="scatter_xlabel" label="X-Axis Alias" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                            <Input id="scatter_ylabel" label="Y-Axis Alias" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="scatter_color" className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1 mb-1">Point Chromatics</label>
                            <input id="scatter_color" type="color" value={pointColor} onChange={e => setPointColor(e.target.value)} className="w-full h-12 p-1.5 bg-brand-bg/50 border border-brand-border rounded-xl cursor-pointer" />
                        </div>
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef} className="bg-brand-bg/40 p-8 rounded-[2.5rem] border border-brand-border/50 relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Distribution Active</span>
                        </div>
                        <h3 className="text-xl font-black text-center mb-10 text-brand-text/80">{title}</h3>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer>
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="var(--color-border)" opacity={0.2} vertical={false} />
                                    <XAxis type="number" dataKey="x" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <YAxis type="number" dataKey="y" name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(26, 28, 30, 0.9)', borderColor: 'var(--color-border)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} itemStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                                    <Scatter name="Observation Points" data={data} fill={pointColor} />
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
    const [title, setTitle] = useState('Categorical Distribution');
    const [xLabel, setXLabel] = useState('Entity');
    const [yLabel, setYLabel] = useState('Magnitude');
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
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <BarChart2 size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">Discrete Measure</h4>
                            <p className="text-[10px] text-brand-text-secondary uppercase">Categorical Quantification</p>
                        </div>
                    </div>
                    <TextArea id="bar_data" label="Data Entries (Label, Value)" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} placeholder="Label, 100" />
                    <ErrorDisplay error={error} />
                    <CollapsibleSection title="Aesthetic Protocol">
                         <Input id="bar_title" label="Visualization Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input id="bar_xlabel" label="X-Axis Alias" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                            <Input id="bar_ylabel" label="Y-Axis Alias" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="bar_color" className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1 mb-1">Fill Chromatics</label>
                            <input id="bar_color" type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-full h-12 p-1.5 bg-brand-bg/50 border border-brand-border rounded-xl cursor-pointer" />
                        </div>
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2">
                    <div ref={chartRef} className="bg-brand-bg/40 p-8 rounded-[2.5rem] border border-brand-border/50 relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-brand-primary/40" />
                             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-60">Static Registry</span>
                        </div>
                        <h3 className="text-xl font-black text-center mb-10 text-brand-text/80">{title}</h3>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="var(--color-border)" opacity={0.2} vertical={false} />
                                    <XAxis dataKey="name" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <YAxis name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 28, 30, 0.9)', borderColor: 'var(--color-border)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} itemStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '30px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
                                    <Bar dataKey="value" fill={barColor} name={yLabel} radius={[4, 4, 0, 0]} />
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
    const [title, setTitle] = useState('Frequency Distribution');
    const [xLabel, setXLabel] = useState('Quantum Intervals');
    const [yLabel, setYLabel] = useState('Occurrence Count');
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
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-1 space-y-8">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-text uppercase tracking-widest">Spectral Density</h4>
                            <p className="text-[10px] text-brand-text-secondary uppercase">Frequency Modal Mapping</p>
                        </div>
                    </div>
                     <TextArea id="hist_data" label="Observation Samples" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} placeholder="1.2, 5.4, 2.3..." />
                     <Input id="hist_bins" label="Resolution (Bins)" type="number" value={numBins} min="1" onChange={e => setNumBins(e.target.value)} />
                     <ErrorDisplay error={error} />
                     <CollapsibleSection title="Render Parameters">
                         <Input id="hist_title" label="Visualization Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input id="hist_xlabel" label="X-Axis Alias" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} />
                            <Input id="hist_ylabel" label="Y-Axis Alias" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="hist_color" className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1 mb-1">Bin Chromatics</label>
                            <input id="hist_color" type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-full h-12 p-1.5 bg-brand-bg/50 border border-brand-border rounded-xl cursor-pointer" />
                        </div>
                     </CollapsibleSection>
                 </div>
                 <div className="lg:col-span-2">
                    <div ref={chartRef} className="bg-brand-bg/40 p-8 rounded-[2.5rem] border border-brand-border/50 relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-brand-primary/40" />
                             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-60">Distribution Matrix</span>
                        </div>
                        <h3 className="text-xl font-black text-center mb-10 text-brand-text/80">{title}</h3>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }} barCategoryGap="0%">
                                    <CartesianGrid stroke="var(--color-border)" opacity={0.2} vertical={false} />
                                    <XAxis dataKey="name" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" tick={{fontSize: 10}} />
                                    <YAxis name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-secondary)' }} stroke="var(--color-text-secondary)" allowDecimals={false} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 28, 30, 0.9)', borderColor: 'var(--color-border)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} itemStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '30px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
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
    const [title, setTitle] = useState('Advanced Composition Analysis');
    const [isDonut, setIsDonut] = useState(true);
    const chartRef = useRef<HTMLDivElement>(null);

    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: null, error: "Please enter data." };
        try {
            const labels: string[] = [], values: number[] = [];
            dataStr.split('\n').filter(l => l.trim()).forEach((line, index) => {
                const parts = line.split(',');
                if (parts.length !== 2) throw new Error(`Invalid format on line ${index + 1}. Use 'Label,Value'.`);
                const name = parts[0].trim();
                const value = parseFloat(parts[1].trim());
                if (!name || isNaN(value)) throw new Error(`Invalid data on line ${index + 1}.`);
                labels.push(name);
                values.push(value);
            });
            return {
                data: [{
                    values,
                    labels,
                    type: 'pie',
                    hole: isDonut ? 0.4 : 0,
                    pull: [0, 0, 0.1, 0, 0], // Pull out a slice for visual interest
                    marker: {
                        colors: ['#4299e1', '#ed8936', '#48bb78', '#9f7aea', '#f56565', '#4fd1c5'],
                        line: { color: '#1a1c1e', width: 2 }
                    },
                    textinfo: 'label+percent',
                    insidetextorientation: 'radial'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: e instanceof Error ? e.message : "An error occurred." }; }
    }, [dataStr, isDonut]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <TextArea id="pie_data" label="Segment Values" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} />
                    <ErrorDisplay error={error} />
                    <CollapsibleSection title="Aesthetics">
                        <Input id="pie_title" label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                        <ToggleSwitch label="Donut Mode" checked={isDonut} onChange={setIsDonut} />
                    </CollapsibleSection>
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    <div className="h-full w-full" ref={chartRef}>
                        {data && (
                            <Plot 
                                data={data as any} 
                                layout={{ 
                                    title: title,
                                    paper_bgcolor: 'rgba(0,0,0,0)', 
                                    font: { color: '#ffffff' },
                                    margin: { l: 20, r: 20, b: 20, t: 50 },
                                    showlegend: true,
                                    legend: { orientation: 'h', y: -0.1 }
                                }} 
                                style={{ width: '100%', height: '100%' }}
                                useResizeHandler={true}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Surface3DPlotter = () => {
    const [expression, setExpression] = useState('sin(sqrt(x^2 + y^2))');
    const [xMin, setXMin] = useState('-10');
    const [xMax, setXMax] = useState('10');
    const [yMin, setYMin] = useState('-10');
    const [yMax, setYMax] = useState('10');
    const [resolution, setResolution] = useState('50');

    const { data, error } = useMemo(() => {
        try {
            const xMinVal = parseFloat(xMin), xMaxVal = parseFloat(xMax), yMinVal = parseFloat(yMin), yMaxVal = parseFloat(yMax), res = parseInt(resolution);
            const compiled = math.parse(expression).compile();
            const xValues: number[] = [], yValues: number[] = [], zValues: number[][] = [];
            const xStep = (xMaxVal - xMinVal) / res, yStep = (yMaxVal - yMinVal) / res;
            for (let i = 0; i <= res; i++) xValues.push(xMinVal + i * xStep);
            for (let j = 0; j <= res; j++) yValues.push(yMinVal + j * yStep);
            for (let j = 0; j <= res; j++) {
                const zRow: number[] = [];
                for (let i = 0; i <= res; i++) {
                    const z = compiled.evaluate({ x: xValues[i], y: yValues[j] });
                    zRow.push(typeof z === 'number' && isFinite(z) ? z : 0);
                }
                zValues.push(zRow);
            }
            return { data: [{ z: zValues, x: xValues, y: yValues, type: 'surface', colorscale: 'Viridis' }], error: null };
        } catch (e) { return { data: null, error: "Invalid expression or parameters." }; }
    }, [expression, xMin, xMax, yMin, yMax, resolution]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="s_expr" label="Surface z = f(x, y)" value={expression} onChange={e => setExpression(e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="s_xmin" label="X Min" value={xMin} onChange={e => setXMin(e.target.value)} />
                        <Input id="s_xmax" label="X Max" value={xMax} onChange={e => setXMax(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="s_ymin" label="Y Min" value={yMin} onChange={e => setYMin(e.target.value)} />
                        <Input id="s_ymax" label="Y Max" value={yMax} onChange={e => setYMax(e.target.value)} />
                    </div>
                    <Input id="s_res" label="Resolution" type="number" value={resolution} onChange={e => setResolution(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ autosize: true, margin: { l: 0, r: 0, b: 0, t: 30 }, paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const PolarPlotter = () => {
    const [expression, setExpression] = useState('2 * sin(5 * theta)');
    const [thetaMax, setThetaMax] = useState('2 * PI');

    const { data, error } = useMemo(() => {
        try {
            const tMax = math.evaluate(thetaMax), compiled = math.parse(expression).compile();
            const thetaValues: number[] = [], rValues: number[] = [], res = 200, step = tMax / res;
            for (let i = 0; i <= res; i++) {
                const t = i * step;
                thetaValues.push((t * 180) / Math.PI);
                rValues.push(compiled.evaluate({ theta: t }));
            }
            return { data: [{ type: 'scatterpolar', mode: 'lines', r: rValues, theta: thetaValues, line: { color: '#6366f1', width: 3 }, fill: 'toself', fillcolor: 'rgba(99, 102, 241, 0.1)' }], error: null };
        } catch (e) { return { data: null, error: "Invalid expression." }; }
    }, [expression, thetaMax]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="p_expr" label="Polar r = f(θ)" value={expression} onChange={e => setExpression(e.target.value)} />
                    <Input id="p_tmax" label="θ Max" value={thetaMax} onChange={e => setThetaMax(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ polar: { bgcolor: 'rgba(255,255,255,0.05)', radialaxis: { gridcolor: '#444' }, angularaxis: { gridcolor: '#444' } }, paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, margin: { l: 40, r: 40, b:40, t:40 } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const ContourPlotter = () => {
    const [expression, setExpression] = useState('x^2 - y^2');
    const { data, error } = useMemo(() => {
        try {
            const compiled = math.parse(expression).compile();
            const xValues: number[] = [], yValues: number[] = [], zValues: number[][] = [], res = 40;
            for (let i = 0; i <= res; i++) xValues.push(-5 + i * (10 / res));
            for (let j = 0; j <= res; j++) yValues.push(-5 + j * (10 / res));
            for (let j = 0; j <= res; j++) {
                const zRow = [];
                for (let i = 0; i <= res; i++) zRow.push(compiled.evaluate({ x: xValues[i], y: yValues[j] }));
                zValues.push(zRow);
            }
            return { data: [{ z: zValues, x: xValues, y: yValues, type: 'contour', colorscale: 'Viridis' }], error: null };
        } catch (e) { return { data: null, error: "Invalid" }; }
    }, [expression]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="c_expr" label="f(x, y)" value={expression} onChange={e => setExpression(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' } }} style={{ width: '100%', height: '100%' }} />}
                </div>
            </div>
        </div>
    );
};

const VectorFieldPlotter = () => {
    const [uExpr, setUExpr] = useState('-y');
    const [vExpr, setVExpr] = useState('x');
    const [xMin, setXMin] = useState('-5');
    const [xMax, setXMax] = useState('5');
    const [yMin, setYMin] = useState('-5');
    const [yMax, setYMax] = useState('5');
    const [gridRes, setGridRes] = useState('20');

    const { data, error } = useMemo(() => {
        try {
            const xMinVal = parseFloat(xMin), xMaxVal = parseFloat(xMax), yMinVal = parseFloat(yMin), yMaxVal = parseFloat(yMax), res = parseInt(gridRes);
            const uCompiled = math.parse(uExpr).compile();
            const vCompiled = math.parse(vExpr).compile();
            
            const xStep = (xMaxVal - xMinVal) / res;
            const yStep = (yMaxVal - yMinVal) / res;

            const x: number[] = [];
            const y: number[] = [];
            const u: number[] = [];
            const v: number[] = [];

            for (let i = 0; i <= res; i++) {
                for (let j = 0; j <= res; j++) {
                    const currX = xMinVal + i * xStep;
                    const currY = yMinVal + j * yStep;
                    const currU = uCompiled.evaluate({ x: currX, y: currY });
                    const currV = vCompiled.evaluate({ x: currX, y: currY });
                    
                    x.push(currX);
                    y.push(currY);
                    u.push(currU);
                    v.push(currV);
                }
            }

            return {
                data: [{
                    type: 'cone',
                    x: x, y: y, z: x.map(() => 0),
                    u: u, v: v, w: u.map(() => 0),
                    sizemode: 'scaled',
                    sizeref: 0.5,
                    anchor: 'tail',
                    colorscale: 'Viridis',
                    showscale: false
                }],
                error: null
            };
        } catch (e) {
            return { data: null, error: "Invalid vector expressions or grid parameters." };
        }
    }, [uExpr, vExpr, xMin, xMax, yMin, yMax, gridRes]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="v_uexpr" label="U (x-component)" value={uExpr} onChange={e => setUExpr(e.target.value)} />
                    <Input id="v_vexpr" label="V (y-component)" value={vExpr} onChange={e => setVExpr(e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="v_xmin" label="X Min" value={xMin} onChange={e => setXMin(e.target.value)} />
                        <Input id="v_xmax" label="X Max" value={xMax} onChange={e => setXMax(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="v_ymin" label="Y Min" value={yMin} onChange={e => setYMin(e.target.value)} />
                        <Input id="v_ymax" label="Y Max" value={yMax} onChange={e => setYMax(e.target.value)} />
                    </div>
                    <Input id="v_res" label="Grid Density" type="number" value={gridRes} onChange={e => setGridRes(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && (
                        <Plot 
                            data={data as any} 
                            layout={{ 
                                title: '2D Vector Field',
                                autosize: true, 
                                margin: { l: 0, r: 0, b: 0, t: 30 }, 
                                paper_bgcolor: 'rgba(0,0,0,0)', 
                                font: { color: '#ffffff' },
                                scene: {
                                    camera: { eye: { x: 0, y: 0, z: 2.5 } }, // Looking top-down
                                    xaxis: { title: 'X', gridcolor: '#444' },
                                    yaxis: { title: 'Y', gridcolor: '#444' },
                                    zaxis: { visible: false }
                                }
                            }} 
                            style={{ width: '100%', height: '100%' }} 
                            useResizeHandler={true} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const HeatmapPlotter = () => {
    const [dataStr, setDataStr] = useState('1,2,3,4,5\n2,3,4,5,6\n3,4,5,6,7\n4,5,6,7,8\n5,6,7,8,9');
    const [title, setTitle] = useState('Dynamic Heatmap Intensity');

    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: null, error: "Please enter data rows." };
        try {
            const z = dataStr.split('\n').filter(l => l.trim()).map(line => {
                const row = line.split(/[,;\s]+/).filter(Boolean).map(v => parseFloat(v));
                if (row.some(v => isNaN(v))) throw new Error("Invalid number in data.");
                return row;
            });
            return {
                data: [{
                    z,
                    type: 'heatmap',
                    colorscale: 'Viridis'
                }],
                error: null
            };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e.message : "Parsing error." };
        }
    }, [dataStr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <TextArea id="heat_data" label="Data Matrix" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} />
                    <Input id="heat_title" label="Plot Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border overflow-hidden">
                    {data && (
                        <Plot 
                            data={data as any} 
                            layout={{ 
                                title,
                                autosize: true, 
                                margin: { l: 50, r: 20, b: 50, t: 50 }, 
                                paper_bgcolor: 'rgba(0,0,0,0)', 
                                font: { color: '#ffffff' }
                            }} 
                            style={{ width: '100%', height: '100%' }} 
                            useResizeHandler={true} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const Mesh3DPlotter = () => {
    const [dataStr, setDataStr] = useState('0,0,0\n1,0,0\n0,1,0\n0,0,1');
    const [title, setTitle] = useState('3D Mesh Structure');

    const { data, error } = useMemo(() => {
        if (!dataStr.trim()) return { data: null, error: "Please enter vertex coordinates." };
        try {
            const lines = dataStr.split('\n').filter(l => l.trim());
            const x: number[] = [], y: number[] = [], z: number[] = [];
            lines.forEach((line, i) => {
                const parts = line.split(/[,;\s]+/).filter(Boolean);
                if (parts.length !== 3) throw new Error(`Line ${i+1}: Expected X,Y,Z.`);
                x.push(parseFloat(parts[0]));
                y.push(parseFloat(parts[1]));
                z.push(parseFloat(parts[2]));
            });
            return {
                data: [{
                    x, y, z,
                    type: 'mesh3d',
                    opacity: 0.8,
                    color: '#6366f1'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: e instanceof Error ? e.message : "Error" }; }
    }, [dataStr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <TextArea id="mesh_data" label="Mesh Vertices" value={dataStr} onChange={e => setDataStr(e.target.value)} onClear={() => setDataStr('')} />
                    <Input id="mesh_title" label="Plot Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title, paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const Parametric3DPlotter = () => {
    const [xExpr, setXExpr] = useState('cos(t)');
    const [yExpr, setYExpr] = useState('sin(t)');
    const [zExpr, setZExpr] = useState('t / 5');
    const [tMin, setTMin] = useState('0');
    const [tMax, setTMax] = useState('10 * PI');

    const { data, error } = useMemo(() => {
        try {
            const tm = math.evaluate(tMin), tx = math.evaluate(tMax);
            const xComp = math.parse(xExpr).compile();
            const yComp = math.parse(yExpr).compile();
            const zComp = math.parse(zExpr).compile();
            const x: number[] = [], y: number[] = [], z: number[] = [], res = 500;
            const step = (tx - tm) / res;
            for (let i = 0; i <= res; i++) {
                const t = tm + i * step;
                x.push(xComp.evaluate({ t }));
                y.push(yComp.evaluate({ t }));
                z.push(zComp.evaluate({ t }));
            }
            return {
                data: [{
                    x, y, z,
                    type: 'scatter3d',
                    mode: 'lines',
                    line: { width: 6, color: z, colorscale: 'Viridis' }
                }],
                error: null
            };
        } catch (e) { return { data: null, error: "Invalid expression or range." }; }
    }, [xExpr, yExpr, zExpr, tMin, tMax]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="para_x" label="x(t)" value={xExpr} onChange={e => setXExpr(e.target.value)} />
                    <Input id="para_y" label="y(t)" value={yExpr} onChange={e => setYExpr(e.target.value)} />
                    <Input id="para_z" label="z(t)" value={zExpr} onChange={e => setZExpr(e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="para_tmin" label="t Min" value={tMin} onChange={e => setTMin(e.target.value)} />
                        <Input id="para_tmax" label="t Max" value={tMax} onChange={e => setTMax(e.target.value)} />
                    </div>
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title: 'Parametric Curve', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const RibbonPlotter = () => {
    const [expr, setExpr] = useState('sin(x) * cos(y)');
    const { data, error } = useMemo(() => {
        try {
            const compiled = math.parse(expr).compile();
            const z: number[][] = [], res = 30;
            for (let i = 0; i < res; i++) {
                const row = [];
                for (let j = 0; j < res; j++) {
                    row.push(compiled.evaluate({ x: i/5, y: j/5 }));
                }
                z.push(row);
            }
            return {
                data: [{
                    z,
                    type: 'surface',
                    contours: {
                        z: { show: true, usecolormap: true, highlightcolor: "#42f4f4", project: { z: true } }
                    },
                    colorscale: 'Electric'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: "Parsing error" }; }
    }, [expr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="ribbon_expr" label="Isosurface f(x,y)" value={expr} onChange={e => setExpr(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title: 'Contour Isosurface', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const WaterfallPlotter = () => {
    const [expr, setExpr] = useState('exp(-(x-t)^2) * cos(5*x)');
    const { data, error } = useMemo(() => {
        try {
            const compiled = math.parse(expr).compile();
            const plots = [];
            const xMin = -5, xMax = 5, res = 100;
            const tRes = 20;
            for (let i = 0; i < tRes; i++) {
                const t = i / 2;
                const x: number[] = [], y: number[] = [], z: number[] = [];
                for (let j = 0; j <= res; j++) {
                    const xv = xMin + (j * (xMax - xMin)) / res;
                    x.push(xv);
                    y.push(t);
                    z.push(compiled.evaluate({ x: xv, t }));
                }
                plots.push({
                    type: 'scatter3d',
                    mode: 'lines',
                    x, y, z,
                    line: { width: 4, color: i, colorscale: 'Viridis' },
                    showlegend: false
                });
            }
            return { data: plots, error: null };
        } catch (e) { return { data: null, error: "Expression error (use 'x' and 't')." }; }
    }, [expr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="water_expr" label="Spectral f(x, t)" value={expr} onChange={e => setExpr(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title: '3D Waterfall Evolution', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const VectorField3DPlotter = () => {
    const [uExpr, setUExpr] = useState('-y');
    const [vExpr, setVExpr] = useState('x');
    const [wExpr, setWExpr] = useState('z/5');
    const [title, setTitle] = useState('3D Flow Field');

    const { data, error } = useMemo(() => {
        try {
            const uComp = math.parse(uExpr).compile();
            const vComp = math.parse(vExpr).compile();
            const wComp = math.parse(wExpr).compile();
            const x: number[] = [], y: number[] = [], z: number[] = [];
            const u: number[] = [], v: number[] = [], w: number[] = [];
            
            const res = 8;
            for(let i = -res; i <= res; i += 4) {
                for(let j = -res; j <= res; j += 4) {
                    for(let k = -res; k <= res; k += 4) {
                        const xv = i, yv = j, zv = k;
                        x.push(xv); y.push(yv); z.push(zv);
                        u.push(uComp.evaluate({ x: xv, y: yv, z: zv }));
                        v.push(vComp.evaluate({ x: xv, y: yv, z: zv }));
                        w.push(wComp.evaluate({ x: xv, y: yv, z: zv }));
                    }
                }
            }
            return {
                data: [{
                    type: 'cone',
                    x, y, z, u, v, w,
                    sizemode: 'absolute',
                    sizeref: 2,
                    colorscale: 'Portland'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: "Parsing error" }; }
    }, [uExpr, vExpr, wExpr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="v3d_u" label="U(x,y,z)" value={uExpr} onChange={e => setUExpr(e.target.value)} />
                    <Input id="v3d_v" label="V(x,y,z)" value={vExpr} onChange={e => setVExpr(e.target.value)} />
                    <Input id="v3d_w" label="W(x,y,z)" value={wExpr} onChange={e => setWExpr(e.target.value)} />
                    <Input id="v3d_title" label="Plot Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title, paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const IsosurfacePlotter = () => {
    const [expr, setExpr] = useState('x^2 + y^2 - z^2');
    const [isomin, setIsomin] = useState('1');
    const [isomax, setIsomax] = useState('10');

    const { data, error } = useMemo(() => {
        try {
            const compiled = math.parse(expr).compile();
            const x: number[] = [], y: number[] = [], z: number[] = [], val: number[] = [];
            const res = 15;
            for(let i = -res; i <= res; i+=2) {
                for(let j = -res; j <= res; j+=2) {
                    for(let k = -res; k <= res; k+=2) {
                        x.push(i); y.push(j); z.push(k);
                        val.push(compiled.evaluate({ x: i, y: j, z: k }));
                    }
                }
            }
            return {
                data: [{
                    type: 'isosurface',
                    x, y, z, value: val,
                    isomin: parseFloat(isomin),
                    isomax: parseFloat(isomax),
                    opacity: 0.6,
                    surface: { show: true, fill: 0.7 },
                    caps: { x: { show: false }, y: { show: false }, z: { show: false } },
                    colorscale: 'Electric'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: "Parsing error" }; }
    }, [expr, isomin, isomax]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="iso_expr" label="f(x,y,z)" value={expr} onChange={e => setExpr(e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="iso_min" label="Iso Min" value={isomin} onChange={e => setIsomin(e.target.value)} />
                        <Input id="iso_max" label="Iso Max" value={isomax} onChange={e => setIsomax(e.target.value)} />
                    </div>
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title: 'Volume Isosurface', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const StreamtubePlotter = () => {
    const [uExpr, setUExpr] = useState('-y');
    const [vExpr, setVExpr] = useState('x');
    const [wExpr, setWExpr] = useState('0.1');

    const { data, error } = useMemo(() => {
        try {
            const uComp = math.parse(uExpr).compile();
            const vComp = math.parse(vExpr).compile();
            const wComp = math.parse(wExpr).compile();
            const x: number[] = [], y: number[] = [], z: number[] = [];
            const u: number[] = [], v: number[] = [], w: number[] = [];
            
            for(let i = -5; i <= 5; i += 2) {
                for(let j = -5; j <= 5; j += 2) {
                    for(let k = -5; k <= 5; k += 2) {
                        x.push(i); y.push(j); z.push(k);
                        u.push(uComp.evaluate({ x: i, y: j, z: k }));
                        v.push(vComp.evaluate({ x: i, y: j, z: k }));
                        w.push(wComp.evaluate({ x: i, y: j, z: k }));
                    }
                }
            }
            return {
                data: [{
                    type: 'streamtube',
                    x, y, z, u, v, w,
                    starts: {
                        x: [0, 0, 0],
                        y: [-2, 0, 2],
                        z: [0, 0, 0]
                    },
                    sizeref: 0.3,
                    colorscale: 'Viridis'
                }],
                error: null
            };
        } catch (e) { return { data: null, error: "Parsing error" }; }
    }, [uExpr, vExpr, wExpr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Input id="st_u" label="U(x,y,z)" value={uExpr} onChange={e => setUExpr(e.target.value)} />
                    <Input id="st_v" label="V(x,y,z)" value={vExpr} onChange={e => setVExpr(e.target.value)} />
                    <Input id="st_w" label="W(x,y,z)" value={wExpr} onChange={e => setWExpr(e.target.value)} />
                    <ErrorDisplay error={error} />
                </div>
                <div className="lg:col-span-2 h-[500px] bg-brand-bg/30 p-4 rounded-xl border border-brand-border">
                    {data && <Plot data={data as any} layout={{ title: '3D Streamtubes', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: '#ffffff' }, scene: { xaxis: { gridcolor: '#444' }, yaxis: { gridcolor: '#444' }, zaxis: { gridcolor: '#444' } } }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />}
                </div>
            </div>
        </div>
    );
};

const Graph = () => {
    const { user, signInWithGoogle } = useAuth();
    type ChartType = 'function' | 'scatter' | 'scatter3d' | 'radar' | 'bar' | 'histogram' | 'pie' | 'surface3d' | 'polar' | 'contour' | 'vector' | 'heatmap' | 'mesh3d' | 'parametric3d' | 'ribbon' | 'waterfall' | 'vector3d' | 'isosurface' | 'streamtube';
    
    const [chartType, setChartType] = useState<ChartType>(() => {
        try { return (localStorage.getItem('graphing_activeChartType') as ChartType) || 'function'; } catch { return 'function'; }
    });

    const categories = [
        { id: 'standard', label: 'Baseline', icon: BarChart2, types: ['function', 'scatter', 'bar', 'histogram', 'pie'] },
        { id: '3d', label: '3D Advanced', icon: Box, types: ['surface3d', 'scatter3d', 'parametric3d', 'mesh3d', 'waterfall'] },
        { id: 'fields', label: 'Flow & Volumes', icon: Wind, types: ['vector', 'vector3d', 'isosurface', 'streamtube', 'ribbon'] },
        { id: 'specialized', label: 'Analysis', icon: Zap, types: ['radar', 'polar', 'contour', 'heatmap'] }
    ];

    const currentCategoryId = categories.find(c => c.types.includes(chartType))?.id || 'standard';
    const [activeCategory, setActiveCategory] = useState(currentCategoryId);

    useEffect(() => { 
        localStorage.setItem('graphing_activeChartType', chartType);
    }, [chartType]);

    const renderChart = () => {
        switch(chartType) {
            case 'function': return <FunctionPlotter />;
            case 'scatter': return <ScatterPlotter />;
            case 'scatter3d': return <Scatter3DPlotter />;
            case 'radar': return <RadarPlotter />;
            case 'bar': return <BarChartCreator />;
            case 'histogram': return <HistogramCreator />;
            case 'pie': return <PieChartCreator />;
            case 'surface3d': return <Surface3DPlotter />;
            case 'polar': return <PolarPlotter />;
            case 'contour': return <ContourPlotter />;
            case 'vector': return <VectorFieldPlotter />;
            case 'heatmap': return <HeatmapPlotter />;
            case 'mesh3d': return <Mesh3DPlotter />;
            case 'parametric3d': return <Parametric3DPlotter />;
            case 'ribbon': return <RibbonPlotter />;
            case 'waterfall': return <WaterfallPlotter />;
            case 'vector3d': return <VectorField3DPlotter />;
            case 'isosurface': return <IsosurfacePlotter />;
            case 'streamtube': return <StreamtubePlotter />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-brand-primary mb-2">
                        <Activity className="animate-pulse" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Visual-Lab Core v8.1</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black text-brand-text tracking-tightest leading-[0.85]">
                        Research<br />
                        <span className="text-brand-primary">Terminal</span>
                    </h2>
                    <p className="text-brand-text-secondary text-xl font-light max-w-xl leading-relaxed">High-performance computational graphics engine for interactive data exploration and spatial synthesis.</p>
                </div>
                {!user && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={signInWithGoogle}
                        className="flex items-center gap-5 p-5 pr-8 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/50 rounded-[2.5rem] group cursor-pointer transition-all backdrop-blur-md shadow-2xl"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-bg shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-110">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest leading-none mb-1.5">Unauthenticated Node</p>
                            <p className="text-base text-brand-text-secondary group-hover:text-brand-text transition-colors font-medium">Link ID to persist data.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Navigation Section */}
            <div className="space-y-12 mb-16">
                <div className="flex flex-wrap gap-4 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <CategoryTab 
                            key={cat.id}
                            label={cat.label}
                            icon={cat.icon}
                            isActive={activeCategory === cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                // Automatically switch to the first type in that category if current isn't in it
                                if (!cat.types.includes(chartType)) {
                                    setChartType(cat.types[0] as ChartType);
                                }
                            }}
                        />
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-bg to-transparent z-10 pointer-events-none md:hidden" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-bg to-transparent z-10 pointer-events-none md:hidden" />
                    <motion.div 
                        initial={false}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-2.5 p-2 bg-brand-surface/20 border border-brand-border/30 rounded-[2rem] backdrop-blur-sm"
                    >
                        {categories.find(c => c.id === activeCategory)?.types.map(type => (
                            <ChartTypeButton 
                                key={type}
                                label={type.charAt(0).toUpperCase() + type.slice(1).replace('3d', ' 3D')}
                                isActive={chartType === type}
                                onClick={() => setChartType(type as ChartType)}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={chartType} 
                    initial={{ opacity: 0, scale: 0.98, y: 40 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.98, y: -30 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className="relative group/chart"
                >
                    <div className="absolute -inset-10 bg-brand-primary/10 rounded-[5rem] blur-[120px] opacity-0 group-hover/chart:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    <div className="relative">
                        {renderChart()}
                    </div>

                    {!user && (
                        <div className="mt-24 relative">
                            <div className="absolute inset-0 bg-brand-primary/5 rounded-[4rem] blur-3xl" />
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative p-12 md:p-20 rounded-[4rem] bg-brand-surface/30 border border-brand-border/40 flex flex-col md:flex-row items-center justify-between gap-12 backdrop-blur-2xl group/cta overflow-hidden shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                                <div className="space-y-6 max-w-2xl relative z-10">
                                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/30">
                                        <MousePointer2 size={12} /> Secure Archive Active
                                    </div>
                                    <h4 className="font-black text-brand-text text-5xl md:text-6xl tracking-tight leading-none">Persistent Laboratory Workspace</h4>
                                    <p className="text-brand-text-secondary text-xl font-light leading-relaxed">Join the global research network to save complex parameter sets, export ultra-high resolution assets, and collaborate on shared computational models.</p>
                                </div>
                                <button 
                                    onClick={signInWithGoogle}
                                    className="w-full md:w-auto relative z-10 px-14 py-7 bg-brand-primary text-white rounded-[2rem] font-black text-base uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_50px_rgba(var(--brand-primary-rgb),0.5)] active:scale-95 transition-all shadow-2xl shadow-brand-primary/40 group/btn"
                                >
                                    Activate Credentials
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-[2rem]" />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Graph;