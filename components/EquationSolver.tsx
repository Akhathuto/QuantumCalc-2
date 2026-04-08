import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { Brain, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import Button from './common/Button';

const math = create(all, { number: 'BigNumber', precision: 64 });

interface SolvedDetails {
  type: 'linear' | 'quadratic';
  coeffs: { a: number; b: number; c: number };
  discriminant?: number;
}

const FormulaExplainer = ({ details }: { details: SolvedDetails }) => {
    const { type, coeffs, discriminant } = details;
    const { a, b, c } = coeffs;
    const formatCoeff = (val?: number) => val !== undefined ? `(${val})` : '';
    
    return (
        <div className="mt-6 bg-brand-bg p-6 rounded-lg border border-brand-border">
            <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2"><Brain size={20} /> Step-by-Step Solution</h3>
            {type === 'linear' && (
                <div className="space-y-3">
                    <p>Linear equation: <code className="font-mono bg-brand-surface p-1 rounded">ax + b = 0</code></p>
                    <p>Formula: <code className="font-mono bg-brand-surface p-1 rounded">x = -b / a</code></p>
                    <div className="font-mono bg-brand-surface p-3 rounded-md text-center text-lg">x = -{formatCoeff(b)} / {formatCoeff(a)}</div>
                </div>
            )}
            {type === 'quadratic' && (
                 <div className="space-y-4">
                    <p>Quadratic equation: <code className="font-mono bg-brand-surface p-1 rounded">ax² + bx + c = 0</code></p>
                    <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold">1. Discriminant (Δ = b² - 4ac):</h4>
                        <div className="font-mono bg-brand-surface p-3 my-2 rounded-md text-lg">Δ = {formatCoeff(b)}² - 4({formatCoeff(a)})({formatCoeff(c)}) = {discriminant}</div>
                        {discriminant !== undefined && (
                            <p className="text-sm italic">
                                {discriminant > 0 && "Δ > 0: Two distinct real roots."}
                                {discriminant === 0 && "Δ = 0: One real root."}
                                {discriminant < 0 && "Δ < 0: Two complex roots."}
                            </p>
                        )}
                    </div>
                     <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold">2. Quadratic Formula:</h4>
                        <div className="font-mono bg-brand-surface p-3 mt-2 rounded-md text-lg overflow-x-auto">
                           x = (-{formatCoeff(b)} ± √({discriminant})) / (2 * {formatCoeff(a)})
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
                    <div className="bg-brand-bg p-6 rounded-lg min-h-[150px] border border-brand-border">
                        <h3 className="text-xl font-bold mb-4 text-brand-accent">Solution(s)</h3>
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