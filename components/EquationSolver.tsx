import { useState } from 'react';
import { create, all } from 'mathjs';
import Button from './common/Button';
import { Brain } from 'lucide-react';

const math = create(all);

interface SolvedDetails {
  type: 'linear' | 'quadratic';
  coeffs: { a: number; b: number; c: number };
  discriminant?: number;
}

// Helper component for displaying the formula explanation
const FormulaExplainer = ({ details }: { details: SolvedDetails }) => {
    const { type, coeffs, discriminant } = details;
    const { a, b, c } = coeffs;

    const formatCoeff = (val?: number) => val !== undefined ? `(${val})` : '';
    
    return (
        <div className="mt-6 bg-brand-surface/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2"><Brain size={20} /> Formula Explanation</h3>
            {type === 'linear' && (
                <div className="space-y-3">
                    <p>This is a linear equation of the form <code className="font-mono bg-brand-bg p-1 rounded">ax + b = 0</code>.</p>
                    <p>The solution is found using the formula:</p>
                    <div className="font-mono bg-brand-bg p-3 rounded-md text-center text-lg">x = -b / a</div>
                    <p>Using your values (a={formatCoeff(a)}, b={formatCoeff(b)}):</p>
                    <div className="font-mono bg-brand-bg p-3 rounded-md text-center text-lg">x = -{formatCoeff(b)} / {formatCoeff(a)}</div>
                </div>
            )}
            {type === 'quadratic' && (
                 <div className="space-y-4">
                    <p>This is a quadratic equation of the form <code className="font-mono bg-brand-bg p-1 rounded">ax² + bx + c = 0</code>.</p>
                    <p>The solution is found using the Quadratic Formula:</p>
                    <div className="font-mono bg-brand-bg p-4 rounded-md text-center text-xl overflow-x-auto">
                        x = (-b &plusmn; &radic;(b² - 4ac)) / 2a
                    </div>
                    <div className="pt-3 border-t border-brand-border">
                        <h4 className="font-semibold">1. Calculate the Discriminant (Δ):</h4>
                        <p className="text-sm text-brand-text-secondary">The discriminant determines the nature of the roots.</p>
                        <div className="font-mono bg-brand-bg p-3 my-2 rounded-md text-lg">Δ = b² - 4ac</div>
                        <div className="font-mono bg-brand-bg p-3 rounded-md text-lg">Δ = {formatCoeff(b)}² - 4{formatCoeff(a)}{formatCoeff(c)} = {discriminant}</div>
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
                        <div className="font-mono bg-brand-bg p-3 mt-2 rounded-md text-lg overflow-x-auto">
                           x = (-{formatCoeff(b)} &plusmn; &radic;({discriminant})) / (2 * {formatCoeff(a)})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const EquationSolver = () => {
    const [equation, setEquation] = useState('x^2 - 4x + 3 = 0');
    const [solutions, setSolutions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [solvedDetails, setSolvedDetails] = useState<SolvedDetails | null>(null);

    const handleSolve = () => {
        setError(null);
        setSolutions([]);
        setSolvedDetails(null);

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

            const details = math.rationalize(expressionToSolve, {}, true);

            if (!details.coefficients) {
                 setError("Equation is not a recognized polynomial.");
                 return;
            }

            const coeffs = details.coefficients.map(c => c.isFraction ? c.valueOf() : parseFloat(c.toString()));
            
            let newSolutions: any[] = [];

            if (coeffs.length > 3) {
                setError("This solver currently supports linear and quadratic equations only (up to x^2).");
                return;
            }

            if (coeffs.length === 3) { // Quadratic: ax^2 + bx + c = 0
                const c = coeffs[0] || 0;
                const b = coeffs[1] || 0;
                const a = coeffs[2] || 0;
                
                if (a === 0) { // It's actually linear: bx + c = 0
                     if (b !== 0) {
                        newSolutions.push(-c / b);
                        setSolvedDetails({ type: 'linear', coeffs: { a: b, b: c, c: 0 }});
                    } else {
                        setError(c === 0 ? "Infinite solutions (0 = 0)" : "No solution");
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
                const b_const = coeffs[0] || 0; // The constant term
                const a_coeff = coeffs[1] || 0; // The x coefficient
                if (a_coeff !== 0) {
                    newSolutions.push(-b_const / a_coeff);
                    setSolvedDetails({ type: 'linear', coeffs: { a: a_coeff, b: b_const, c: 0 }});
                } else {
                    setError(b_const === 0 ? "Infinite solutions (0 = 0)" : "No solution");
                }
            } else if (coeffs.length === 1) { // Constant: c = 0
                 setError(coeffs[0] === 0 ? "Infinite solutions (0 = 0)" : `No solution (${coeffs[0]} = 0)`);
            } else {
                setError("Equation is not a recognized linear or quadratic polynomial.");
            }
            setSolutions(newSolutions);

        } catch (e: any) {
            setError(e.message || "Could not solve the equation. Ensure it's a valid polynomial in 'x'.");
        }
    };

    const formatSolution = (sol: any): string => {
        try {
            return math.format(sol, { notation: 'fixed', precision: 5 });
        } catch {
            return String(sol);
        }
    };

    const exampleEquations = [
        '2x - 10 = 0',
        'x^2 - 4 = 0',
        'x^2 + 2x + 1 = 0',
        'x^3 - 8 = 0', // For unsupported error
        'x^2 + x + 1 = 0' // complex roots
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Equation Solver</h2>
            
            <div className="mb-4">
                <label htmlFor="equation-input" className="block text-lg font-medium mb-2">
                    Enter a linear or quadratic equation to solve for 'x'
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        id="equation-input"
                        type="text"
                        value={equation}
                        onChange={e => setEquation(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSolve()}
                        className="flex-grow w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="e.g., 2x + 5 = 10"
                    />
                    <Button onClick={handleSolve} className="bg-brand-primary hover:bg-blue-500 h-auto px-6 py-3 text-lg">
                        Solve
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm text-brand-text-secondary mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                    {exampleEquations.map(ex => (
                        <button 
                            key={ex}
                            onClick={() => setEquation(ex)}
                            className="px-3 py-1 bg-brand-surface hover:bg-gray-600 rounded-full text-xs font-mono"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-brand-surface/50 p-6 rounded-lg min-h-[150px]">
                <h3 className="text-xl font-bold mb-2 text-brand-accent">Solution(s)</h3>
                {error && <p className="text-red-400 font-mono">{error}</p>}
                
                {!error && solutions.length > 0 && (
                    <div className="space-y-2">
                        {solutions.map((sol, index) => (
                            <p key={index} className="text-2xl font-mono">
                                x = {formatSolution(sol)}
                            </p>
                        ))}
                    </div>
                )}

                {!error && !solvedDetails && (
                    <p className="text-brand-text-secondary">Enter an equation and click 'Solve' to see the result.</p>
                )}
            </div>
            
            {!error && solvedDetails && <FormulaExplainer details={solvedDetails} />}
        </div>
    );
};

export default EquationSolver;