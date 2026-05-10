import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { Brain, TrendingUp, GitCompareArrows, ShieldCheck, Target } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { motion } from 'motion/react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const math = create(all, { number: 'BigNumber', precision: 64 });

interface SolvedDetails {
  type: 'linear' | 'quadratic';
  coeffs: { a: number; b: number; c: number };
  discriminant?: number;
}

const FormulaExplainer = ({ details }: { details: SolvedDetails }) => {
    const { type, coeffs, discriminant } = details;
    const { a, b } = coeffs;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic flex items-center gap-2">
                    <Brain size={14} className="text-brand-primary" /> 
                    Logical Extraction Path
                </h3>
            </div>

            {type === 'linear' && (
                <div className="space-y-6">
                    <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border flex items-center justify-center min-h-[100px]">
                        <div className="text-2xl font-black text-brand-text font-mono">
                            <Latex>{`$x = -\\frac{${b}}{${a}} = ${(-b / a).toFixed(4)}$`}</Latex>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-bg/50 rounded-xl border border-brand-border text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary block mb-1">Primitive</span>
                            <Latex>{'$ax + b = 0$'}</Latex>
                        </div>
                        <div className="p-4 bg-brand-bg/50 rounded-xl border border-brand-border text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary block mb-1">Isolate</span>
                            <Latex>{'$x = -\\frac{b}{a}$'}</Latex>
                        </div>
                    </div>
                </div>
            )}

            {type === 'quadratic' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary italic">Discriminant</span>
                                <Latex>{'$\\Delta = b^2 - 4ac$'}</Latex>
                            </div>
                            <div className="text-2xl font-black text-brand-text font-mono text-center py-2">
                                <Latex>{`$\\Delta = ${discriminant}$`}</Latex>
                            </div>
                            {discriminant !== undefined && (
                                <p className="text-[9px] font-black uppercase tracking-wider text-center text-brand-text-secondary bg-brand-surface py-1.5 rounded-lg border border-brand-border">
                                    {discriminant > 0 && "Two distinct real roots"}
                                    {discriminant === 0 && "One real root"}
                                    {discriminant < 0 && "Two complex roots"}
                                </p>
                            )}
                        </div>
                        
                        <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent italic">Quadratic Form</span>
                                <Latex>{'$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$'}</Latex>
                            </div>
                            <div className="text-xl font-black text-brand-text font-mono text-center py-2 overflow-x-auto scrollbar-hide">
                               <Latex>{`$x = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})}$`}</Latex>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const EquationSolver = () => {
    const [equation, setEquation] = useState('x^2 - 4x + 3 = 0');
    const [solutions, setSolutions] = useState<(number | math.Complex)[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [solvedDetails, setSolvedDetails] = useState<SolvedDetails | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (solutions.length > 0) {
            const sols = solutions.map(sol => `x = ${math.format(sol, { notation: 'fixed', precision: 4 })}`).join(', ');
            navigator.clipboard.writeText(`${equation} => ${sols}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const graphData = useMemo(() => {
        if (!solvedDetails) return null;
        const { a, b, c } = solvedDetails.coeffs;
        const points = [];
        const center = solvedDetails.type === 'quadratic' ? -b / (2 * a) : -c / b;
        const range = 5;
        for (let x = center - range; x <= center + range; x += 0.2) {
            const y = a * x * x + b * x + c;
            points.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
        }
        return points;
    }, [solvedDetails]);

    const handleSolve = () => {
        setError(null); setSolutions([]); setSolvedDetails(null);
        if (!equation.trim()) { setError("Waiting for symbolic input..."); return; }
        if (!equation.includes('x')) { setError("Symbol 'x' not detected in stream."); return; }

        try {
            let expr;
            const parts = equation.split('=');
            if (parts.length === 1) expr = parts[0];
            else if (parts.length === 2) expr = `(${parts[0]}) - (${parts[1]})`;
            else { setError("Malformed equation grammar."); return; }

            const details = math.rationalize(expr, {}, true);
            if (!details.coefficients) { setError("Expression is non-polynomial."); return; }
            const coeffs = details.coefficients.map(c => typeof c === 'number' ? c : parseFloat(c.toString()));
            
            if (coeffs.length > 3) { setError("System limited to degree <= 2."); return; }

            const newSols: (number | math.Complex)[] = [];
            if (coeffs.length === 3) {
                const [c, b, a] = coeffs;
                if (a === 0) {
                    if (b !== 0) { newSols.push(-c / b); setSolvedDetails({ type: 'linear', coeffs: { a: b, b: c, c: 0 }}); }
                    else setError(c === 0 ? "Infinite solution set" : "Null solution set");
                } else {
                    const d = b * b - 4 * a * c;
                    setSolvedDetails({ type: 'quadratic', coeffs: { a, b, c }, discriminant: d });
                    if (d >= 0) {
                        newSols.push((-b + Math.sqrt(d)) / (2 * a));
                        if (d > 0) newSols.push((-b - Math.sqrt(d)) / (2 * a));
                    } else {
                        const r = -b / (2 * a), i = Math.sqrt(-d) / (2 * a);
                        newSols.push(math.complex(r, i)); newSols.push(math.complex(r, -i));
                    }
                }
            } else if (coeffs.length === 2) {
                const [b, a] = coeffs;
                if (a !== 0) { newSols.push(-b / a); setSolvedDetails({ type: 'linear', coeffs: { a, b, c: 0 }}); }
                else setError(b === 0 ? "Infinite solution set" : "Null solution set");
            }
            setSolutions(newSols);
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Calculation kernel failure."); }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Input & Solution */}
                <div className="space-y-6">
                    <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Equation Register</h3>
                            </div>
                            <span className="text-[10px] font-mono text-brand-primary font-bold">READY_TO_PARSE</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={equation} 
                                onChange={e => setEquation(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSolve()} 
                                className="flex-grow bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 font-mono text-xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-brand-text placeholder:opacity-20"
                                placeholder="ax² + bx + c = 0"
                            />
                            <button 
                                onClick={handleSolve}
                                className="px-8 bg-brand-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                            >
                                Compute
                            </button>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-brand-primary/10 rounded-3xl blur opacity-50"></div>
                            <div className="relative bg-brand-bg border border-brand-border p-8 rounded-3xl min-h-[160px] flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6 border-b border-brand-border pb-4">
                                    <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-widest italic flex items-center gap-2">
                                        <Target size={12} /> Solution Buffer
                                    </h3>
                                    {solutions.length > 0 && (
                                        <button 
                                            onClick={handleCopy} 
                                            className="px-4 py-1.5 bg-brand-surface border border-brand-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all flex items-center gap-2"
                                        >
                                            {copied ? <ShieldCheck size={12} className="text-green-500" /> : <GitCompareArrows size={12} />}
                                            {copied ? 'Captured' : 'Capture'}
                                        </button>
                                    )}
                                </div>
                                {error && <p className="text-red-400 font-mono text-sm uppercase tracking-tighter">{error}</p>}
                                {solutions.length > 0 ? (
                                    <div className="space-y-4">
                                        {solutions.map((sol, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:scale-150 transition-transform"></div>
                                                <p className="text-3xl font-black text-brand-text font-mono tracking-tighter">
                                                    x = {math.format(sol, { notation: 'fixed', precision: 4 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : !error && (
                                    <div className="text-center opacity-20 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for Input...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {solvedDetails && <FormulaExplainer details={solvedDetails} />}
                </div>

                {/* Right Panel: Visualization */}
                <div className="space-y-6">
                    <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] shadow-xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-brand-accent rounded-full"></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic flex items-center gap-2">
                                <TrendingUp size={14} className="text-brand-accent" />
                                Geometric Projection
                            </h3>
                        </div>
                        
                        <div className="flex-1 min-h-[400px] flex flex-col justify-center">
                            {graphData ? (
                                <div className="h-96 w-full relative">
                                    <div className="absolute inset-0 bg-brand-bg/30 rounded-[2rem] border border-brand-border border-dashed pointer-events-none"></div>
                                    <ResponsiveContainer>
                                        <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                                            <XAxis dataKey="x" type="number" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontWeight: 700 }} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '10px', fontWeight: 900 }} 
                                            />
                                            <ReferenceLine y={0} stroke="var(--color-text)" strokeWidth={1} opacity={0.2} />
                                            <ReferenceLine x={0} stroke="var(--color-text)" strokeWidth={1} opacity={0.2} />
                                            <Line 
                                                type="monotone" 
                                                dataKey="y" 
                                                stroke="var(--color-primary)" 
                                                strokeWidth={5} 
                                                dot={false} 
                                                animationDuration={1500}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="mt-8 p-4 bg-brand-bg/50 rounded-xl border border-brand-border">
                                        <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.1em] leading-relaxed italic text-center">
                                            The roots are isolated at intersections where polynomial trajectory crosses the horizontal axis <span className="text-brand-primary">(Y=0)</span>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
                                    <Target size={48} className="text-brand-text-secondary" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Projection module inactive</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquationSolver;
