import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { Brain, TrendingUp, Share2, Copy, Check } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import Button from './common/Button';
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
    const { a, b, c } = coeffs;
    
    return (
        <div className="mt-6 bg-brand-bg p-6 rounded-lg border border-brand-border">
            <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2"><Brain size={20} /> Step-by-Step Solution</h3>
            {type === 'linear' && (
                <div className="space-y-4">
                    <p>Linear equation: <Latex>{'$ax + b = 0$'}</Latex></p>
                    <p>Formula: <Latex>{'$x = -\\frac{b}{a}$'}</Latex></p>
                    <div className="bg-brand-surface p-4 rounded-md text-center text-xl">
                        <Latex>{`$x = -\\frac{${b}}{${a}} = ${(-b / a).toFixed(4)}$`}</Latex>
                    </div>
                </div>
            )}
            {type === 'quadratic' && (
                 <div className="space-y-6">
                    <p>Quadratic equation: <Latex>{'$ax^2 + bx + c = 0$'}</Latex></p>
                    <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold mb-2">1. Discriminant (<Latex>{'$\\Delta = b^2 - 4ac$'}</Latex>):</h4>
                        <div className="bg-brand-surface p-4 rounded-md text-center text-xl">
                            <Latex>{`$\\Delta = (${b})^2 - 4(${a})(${c}) = ${discriminant}$`}</Latex>
                        </div>
                        {discriminant !== undefined && (
                            <p className="text-sm italic mt-2 text-brand-text-secondary">
                                {discriminant > 0 && "Δ > 0: Two distinct real roots."}
                                {discriminant === 0 && "Δ = 0: One real root."}
                                {discriminant < 0 && "Δ < 0: Two complex roots."}
                            </p>
                        )}
                    </div>
                     <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold mb-2">2. Quadratic Formula:</h4>
                        <div className="bg-brand-surface p-4 rounded-md text-center text-xl overflow-x-auto">
                           <Latex>{`$x = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})}$`}</Latex>
                        </div>
                    </div>
                </div>
            )}
        </div>
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

    const handleShare = async () => {
        if (solutions.length > 0) {
            const sols = solutions.map(sol => `x = ${math.format(sol, { notation: 'fixed', precision: 4 })}`).join(', ');
            const shareText = `${equation} => ${sols}`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Equation Solution',
                        text: shareText
                    });
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                handleCopy();
            }
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
        if (!equation.trim()) { setError("Please enter an equation."); return; }
        if (!equation.includes('x')) { setError("Equation must contain 'x'."); return; }

        try {
            let expr;
            const parts = equation.split('=');
            if (parts.length === 1) expr = parts[0];
            else if (parts.length === 2) expr = `(${parts[0]}) - (${parts[1]})`;
            else { setError("Invalid format."); return; }

            const details = math.rationalize(expr, {}, true);
            if (!details.coefficients) { setError("Not a polynomial."); return; }
            const coeffs = details.coefficients.map(c => typeof c === 'number' ? c : parseFloat(c.toString()));
            
            if (coeffs.length > 3) { setError("Only linear/quadratic supported."); return; }

            const newSols: (number | math.Complex)[] = [];
            if (coeffs.length === 3) {
                const [c, b, a] = coeffs;
                if (a === 0) {
                    if (b !== 0) { newSols.push(-c / b); setSolvedDetails({ type: 'linear', coeffs: { a: b, b: c, c: 0 }}); }
                    else setError(c === 0 ? "Infinite solutions" : "No solution");
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
                else setError(b === 0 ? "Infinite solutions" : "No solution");
            }
            setSolutions(newSols);
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error solving equation."); }
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary text-center">Equation Solver</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium mb-2">Enter equation (e.g., 2x + 5 = 10)</label>
                        <div className="flex gap-2">
                            <input type="text" value={equation} onChange={e => setEquation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSolve()} className="flex-grow bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary" />
                            <Button onClick={handleSolve} className="bg-brand-primary px-6">Solve</Button>
                        </div>
                    </div>
                    <div className="bg-brand-bg p-6 rounded-lg min-h-[150px] border border-brand-border relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-brand-accent">Solution(s)</h3>
                            {solutions.length > 0 && (
                                <div className="flex gap-2">
                                    <button onClick={handleShare} className="p-1.5 rounded hover:bg-brand-surface/50 text-brand-text-secondary hover:text-brand-primary transition-colors" title="Share result">
                                        <Share2 size={18} />
                                    </button>
                                    <button onClick={handleCopy} className="p-1.5 rounded hover:bg-brand-surface/50 text-brand-text-secondary hover:text-brand-primary transition-colors" title="Copy result">
                                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            )}
                        </div>
                        {error && <p className="text-red-400 font-mono">{error}</p>}
                        {solutions.length > 0 && (
                            <div className="space-y-2">
                                {solutions.map((sol, i) => <p key={i} className="text-3xl font-mono">x = {math.format(sol, { notation: 'fixed', precision: 4 })}</p>)}
                            </div>
                        )}
                        {!error && solutions.length === 0 && <p className="text-brand-text-secondary">Enter an equation to solve.</p>}
                    </div>
                    {solvedDetails && <FormulaExplainer details={solvedDetails} />}
                </div>
                <div className="space-y-6">
                    <div className="bg-brand-bg p-6 rounded-lg border border-brand-border h-full min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2"><TrendingUp size={20} /> Visual Representation</h3>
                        {graphData ? (
                            <div className="h-80 w-full mt-8">
                                <ResponsiveContainer>
                                    <LineChart data={graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} stroke="var(--color-text-secondary)" />
                                        <YAxis stroke="var(--color-text-secondary)" />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                        <ReferenceLine y={0} stroke="var(--color-text-secondary)" strokeWidth={2} />
                                        <ReferenceLine x={0} stroke="var(--color-text-secondary)" strokeWidth={2} />
                                        <Line type="monotone" dataKey="y" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <p className="text-center text-xs text-brand-text-secondary mt-4 italic">The roots are where the line crosses the x-axis (y=0).</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-brand-text-secondary italic">Solve an equation to see its graph.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquationSolver;