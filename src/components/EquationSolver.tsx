import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { 
  Brain, TrendingUp, GitCompareArrows, ShieldCheck, Target, Download, 
  ChevronRight, ChevronLeft, Award, ListCollapse, HelpCircle, Variable 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
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

// Interface for interactive step
interface InteractiveStep {
  title: string;
  latex: string;
  explanation: string;
  tip?: string;
  visualData?: any; // For quadratic factor trees or specific diagrams
}

const EquationSolver = () => {
  const [activeTab, setActiveTab] = useState<'solver' | 'stepper'>('solver');
  const [equation, setEquation] = useState('x^2 - 4x + 3 = 0');
  const [solutions, setSolutions] = useState<(number | math.Complex)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [solvedDetails, setSolvedDetails] = useState<SolvedDetails | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Interactive Stepper State ---
  const [stepperInput, setStepperInput] = useState('x^2 - 5x + 6 = 0');
  const [stepperType, setStepperType] = useState<'linear' | 'quadratic' | 'derivative'>('quadratic');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepperError, setStepperError] = useState<string | null>(null);
  const [stepperSteps, setStepperSteps] = useState<InteractiveStep[]>([]);

  const handleCopy = () => {
    if (solutions.length > 0) {
      const sols = solutions.map(sol => `x = ${math.format(sol, { notation: 'fixed', precision: 4 })}`).join(', ');
      navigator.clipboard.writeText(`${equation} => ${sols}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportAcademic = () => {
    if (!solvedDetails) return;
    const { type, coeffs, discriminant } = solvedDetails;
    const { a, b, c } = coeffs;
    
    let markdownContent = `# Quantum Solver Study Report\n\n`;
    markdownContent += `**Equation:** $${equation}$\n`;
    markdownContent += `**Method:** Step-by-Step Algebraic Expansion\n\n`;
    
    markdownContent += `## 1. Polynomial Classification & Setup\n`;
    if (type === 'linear') {
      markdownContent += `The system has resolved a first-degree **linear equation** of the standard form:\n`;
      markdownContent += `$$ax + b = 0$$\n\n`;
      markdownContent += `Where coefficients are identified as:\n`;
      markdownContent += `- $a = ${a}$\n`;
      markdownContent += `- $b = ${b}$\n\n`;
    } else {
      markdownContent += `The system has resolved a second-degree **quadratic equation** of the standard form:\n`;
      markdownContent += `$$ax^2 + bx + c = 0$$\n\n`;
      markdownContent += `Where coefficients are extracted as:\n`;
      markdownContent += `- $a = ${a}$\n`;
      markdownContent += `- $b = ${b}$\n`;
      markdownContent += `- $c = ${c}$\n\n`;
    }
    
    markdownContent += `## 2. Derivation Path & Calculations\n`;
    if (type === 'linear') {
      markdownContent += `To isolate the unknown variable $x$, isolate the constant $b$ and divide by $a$:\n`;
      markdownContent += `$$ax = -b \\implies x = -\\frac{b}{a}$$\n\n`;
      markdownContent += `Substituting primitive values yields the isolate:\n`;
      markdownContent += `$$x = -\\frac{${b}}{${a}} = ${(-b / a).toFixed(6)}$$\n\n`;
    } else {
      markdownContent += `### Discriminant Resolution ($\\Delta$)\n`;
      markdownContent += `Solve the discriminant equation to determine target root space:\n`;
      markdownContent += `$$\\Delta = b^2 - 4ac$$\n`;
      markdownContent += `$$\\Delta = (${b})^2 - 4(${a})(${c}) = ${discriminant}$$\n\n`;
      
      if (discriminant !== undefined) {
        if (discriminant > 0) {
          markdownContent += `Because $\\Delta > 0$, the quadratic system holds **two distinct real roots**.\n\n`;
        } else if (discriminant === 0) {
          markdownContent += `Because $\\Delta = 0$, the quadratic system holds **exactly one real root**.\n\n`;
        } else {
          markdownContent += `Because $\\Delta < 0$, the quadratic system holds **two complex conjugate roots**.\n\n`;
        }
      }
      
      markdownContent += `### System Root Formulas Application\n`;
      markdownContent += `$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n`;
      markdownContent += `$$x = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})}$$\n\n`;
    }
    
    markdownContent += `## 3. Final Evaluated Solution Set\n`;
    solutions.forEach((sol, i) => {
      const valStr = math.format(sol, { notation: 'fixed', precision: 6 });
      markdownContent += `- **Root $x_{${i + 1}}$:** $${valStr}$\n`;
    });
    
    markdownContent += `\n*Calculations generated securely by Quantum Calculator - Academic Export Module, 2026.*\n`;
    
    // Export file setup
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `academic_solution_${type}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // --- DYNAMIC INTERACTIVE STEPPER COMPILER ---
  const handleCompileStepper = () => {
    setStepperError(null);
    setCurrentStepIdx(0);
    const rawInput = stepperInput.trim();

    if (!rawInput) {
      setStepperError("Please provide a valid mathematical expression.");
      return;
    }

    const steps: InteractiveStep[] = [];

    if (stepperType === 'quadratic') {
      try {
        let expr = rawInput;
        const parts = rawInput.split('=');
        if (parts.length === 2) {
          expr = `(${parts[0]}) - (${parts[1]})`;
        } else if (parts.length > 2) {
          throw new Error("Equation contains multiple '=' signs.");
        }

        const details = math.rationalize(expr, {}, true);
        if (!details.coefficients || details.coefficients.length !== 3) {
          throw new Error("Please input a valid quadratic equation of degree 2 (e.g., x^2 - 5x + 6 = 0).");
        }

        const c = parseFloat(details.coefficients[0].toString());
        const b = parseFloat(details.coefficients[1].toString());
        const a = parseFloat(details.coefficients[2].toString());

        if (a === 0) {
          throw new Error("Term coefficient for x² is zero. Choose 'Linear' equation instead.");
        }

        const disc = b * b - 4 * a * c;

        // Step 1: Polynomial Standard Form
        steps.push({
          title: "1. Canonical Quadratic Standard Form Setup",
          latex: `$${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$`,
          explanation: "First, align coefficients by setting the polynomial equal to zero. Any quadratic system fits standard format $ax^2 + bx + c = 0$.",
          tip: `For this equation, extracted coefficients are: a = ${a}, b = ${b}, and c = ${c}.`
        });

        // Step 2: Calculate Discriminant
        steps.push({
          title: "2. Resolve System Discriminant (Δ)",
          latex: `$\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c})$`,
          explanation: "The discriminant determines the space, shape, and count of possible solutions. Its algebraic formula is $\\Delta = b^2 - 4ac$.",
          tip: `Computing value: \\Delta = ${b*b} - ${4*a*c} = ${disc}. Since \\Delta ${disc > 0 ? '> 0' : disc === 0 ? '= 0' : '< 0'}, the roots are ${disc > 0 ? 'two distinct real numbers' : disc === 0 ? 'one double real root' : 'two complex conjugates'}.`
        });

        // Step 3: Quadratic Formula Injection
        steps.push({
          title: "3. Formulate Solution Set",
          latex: `$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${disc}}}{2(${a})}$`,
          explanation: "Substitute coefficients and discriminant back into the quadratic standard equation: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.",
          tip: `This simplifies the arithmetic boundaries down to: x = \\frac{${-b} \\pm \\sqrt{${disc}}}{${2*a}}`
        });

        // Step 4: Final Algebraic Reduction
        if (disc >= 0) {
          const root1 = (-b + Math.sqrt(disc)) / (2 * a);
          const root2 = (-b - Math.sqrt(disc)) / (2 * a);
          
          steps.push({
            title: "4. Solve Roots",
            latex: `$x_1 = ${root1.toFixed(4)}, \\quad x_2 = ${root2.toFixed(4)}$`,
            explanation: "Evaluate the equation using positive and negative discriminant roots to yield the final coordinate values.",
            tip: "These coordinates indicate exactly where the parabola intersects the horizontal axis (Y=0)."
          });

          // Extra: Show Factor Tree if roots are clean integers
          if (Number.isInteger(root1) && Number.isInteger(root2)) {
            // Factor form: (x - root1)(x - root2) = 0
            steps.push({
              title: "5. Visual Quadratic Factor Tree",
              latex: `$(x - ${root1})(x - ${root2}) = 0$`,
              explanation: "Since the roots are integers, we can construct a factor tree! The product of factors multiplies to $c$ and sums to $b$.",
              tip: `Factors are -(${root1}) and -(${root2}). Verified: (-${root1}) * (-${root2}) = ${root1*root2} (which equals c/a), and (-${root1}) + (-${root2}) = ${-(root1+root2)} (which equals b/a).`,
              visualData: { root1, root2, a, b, c }
            });
          }

        } else {
          const realPart = -b / (2 * a);
          const imagPart = Math.sqrt(-disc) / (2 * a);
          steps.push({
            title: "4. Complex Root Evaluation",
            latex: `$x_1 = ${realPart.toFixed(4)} + ${imagPart.toFixed(4)}i, \\quad x_2 = ${realPart.toFixed(4)} - ${imagPart.toFixed(4)}i$`,
            explanation: "Because the discriminant is negative, we extract imaginary numbers using the definition $i = \\sqrt{-1}$.",
            tip: "The roots are complex conjugates, meaning they have matching real components but mirrored imaginary components."
          });
        }

      } catch (err: any) {
        setStepperError(err.message || "Could not parse quadratic equation.");
      }

    } else if (stepperType === 'linear') {
      try {
        // Simple linear parsing of form ax + b = c
        // We will parse with simple regex for ease & high stability
        const cleanStr = rawInput.replace(/\s+/g, '');
        // format expected: ax + b = c or ax = b
        let a = 1;
        let b = 0;
        let c = 0;

        const eqParts = cleanStr.split('=');
        if (eqParts.length !== 2) {
          throw new Error("Equation must contain exactly one '=' sign (e.g., 3x + 9 = 24).");
        }

        const left = eqParts[0];
        const right = parseFloat(eqParts[1]);
        if (isNaN(right)) {
          throw new Error("Right side of equation must be a simple constant number.");
        }
        c = right;

        // Parse left: match ax + b or ax - b
        const xMatch = left.match(/(-?\d*)x/);
        if (!xMatch) {
          throw new Error("Variable 'x' term was not found in the expression.");
        }

        const aStr = xMatch[1];
        if (aStr === '') a = 1;
        else if (aStr === '-') a = -1;
        else a = parseFloat(aStr);

        // Parse constant on left (b)
        const withoutX = left.replace(xMatch[0], '');
        if (withoutX) {
          b = parseFloat(withoutX) || 0;
        }

        // Steps compilation
        steps.push({
          title: "1. Linear Isolation Setup",
          latex: `$${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : ''}${b} = ${c}$`,
          explanation: "Set up the linear equation variables. Our primary goal is to isolate the variable $x$ on one side of the equation.",
          tip: `Coefficients extracted: a = ${a}, constant b = ${b}, constant c = ${c}.`
        });

        const intermediateC = c - b;
        steps.push({
          title: "2. Isolate Constant Terms (Additive Inverse)",
          latex: `$${a === 1 ? '' : a === -1 ? '-' : a}x = ${c} - (${b}) = ${intermediateC}$`,
          explanation: "Subtract the constant $b$ from both sides of the equation to transpose constants onto the right-hand side.",
          tip: "Subtracting from both sides maintains the perfect equality of the system."
        });

        const finalSol = intermediateC / a;
        steps.push({
          title: "3. Solve for x (Multiplicative Inverse)",
          latex: `$x = \\frac{${intermediateC}}{${a}} = ${finalSol.toFixed(4)}$`,
          explanation: "Divide both sides of the equation by the variable coefficient $a$ to fully isolate $x$.",
          tip: `The system holds a single linear root located at x = ${finalSol.toFixed(4)}.`
        });

      } catch (err: any) {
        setStepperError(err.message || "Could not parse linear equation. Make sure it is of the form: ax + b = c.");
      }

    } else if (stepperType === 'derivative') {
      try {
        // Parse simple polynomial of form ax^2 + bx + c or similar
        // input format can be d/dx [ 3x^2 + 5x + 2 ] or just the polynomial
        let clean = rawInput.toLowerCase();
        if (clean.includes('d/dx')) {
          const match = clean.match(/\[(.*)\]/);
          if (match) clean = match[1];
        }
        clean = clean.replace(/\s+/g, '');

        // Standard coefficients parse
        // expected ax^2 + bx + c
        let a = 0;
        let b = 0;
        let c = 0;

        const x2Match = clean.match(/(-?\d*)x\^2/);
        let remaining = clean;
        if (x2Match) {
          const coeff = x2Match[1];
          if (coeff === '') a = 1;
          else if (coeff === '-') a = -1;
          else a = parseFloat(coeff);
          remaining = remaining.replace(x2Match[0], '');
        }

        const xMatch = remaining.match(/(-?\d*)x/);
        if (xMatch) {
          const coeff = xMatch[1];
          if (coeff === '' || coeff === '+') b = 1;
          else if (coeff === '-') b = -1;
          else b = parseFloat(coeff);
          remaining = remaining.replace(xMatch[0], '');
        }

        if (remaining) {
          // parse constant
          c = parseFloat(remaining) || 0;
        }

        if (a === 0 && b === 0 && c === 0) {
          throw new Error("Please input a polynomial expression like 3x^2 + 5x - 2.");
        }

        steps.push({
          title: "1. Apply Differentiation Linearity",
          latex: `$\\frac{d}{dx}[${a !== 0 ? `${a}x^2` : ''} ${b !== 0 ? `${b >= 0 ? '+' : ''}${b}x` : ''} ${c !== 0 ? `${c >= 0 ? '+' : ''}${c}` : ''}] = \\frac{d}{dx}[${a !== 0 ? `${a}x^2` : '0'}] + \\frac{d}{dx}[${b !== 0 ? `${b}x` : '0'}] + \\frac{d}{dx}[${c !== 0 ? `${c}` : '0'}]$`,
          explanation: "According to the Sum Rule in calculus, the derivative of a sum is equal to the sum of the individual derivatives.",
          tip: "We can compute the derivative of each separate term independently and add them up."
        });

        const stepsList = [];
        if (a !== 0) {
          stepsList.push({
            term: `${a}x^2`,
            deriv: `${2*a}x`,
            exp: `The Power Rule states that d/dx[x^n] = n * x^(n-1). For ${a}x^2, this yields: 2 * ${a}x^(2-1) = ${2*a}x.`
          });
        }
        if (b !== 0) {
          stepsList.push({
            term: `${b}x`,
            deriv: `${b}`,
            exp: `Using the power rule for x^1 yields 1 * ${b}x^(0) = ${b}.`
          });
        }
        if (c !== 0) {
          stepsList.push({
            term: `${c}`,
            deriv: `0`,
            exp: "The derivative of any constant value with respect to x is always zero, since constants do not change."
          });
        }

        // term derivatives
        steps.push({
          title: "2. Differentiate Individual Terms (Power Rule)",
          latex: `\\frac{d}{dx}[${a !== 0 ? `${a}x^2` : '0'}] = ${2*a}x, \\quad \\frac{d}{dx}[${b !== 0 ? `${b}x` : '0'}] = ${b}, \\quad \\frac{d}{dx}[${c !== 0 ? `${c}` : '0'}] = 0`,
          explanation: "Apply the calculus power rule $\\frac{d}{dx}[a x^n] = a n x^{n-1}$ to each polynomial term.",
          tip: stepsList.map(s => `• Term ${s.term} becomes ${s.deriv}: ${s.exp}`).join('\n')
        });

        // Final result combination
        const finalLatex = `${2*a !== 0 ? `${2*a}x` : ''} ${b !== 0 ? `${b >= 0 && 2*a !== 0 ? '+' : ''}${b}` : ''}`.trim() || '0';
        steps.push({
          title: "3. Recombine Differentiated Elements",
          latex: `$f'(x) = ${finalLatex}$`,
          explanation: "Sum up the evaluated derivatives of each independent term to arrive at the final derivative function.",
          tip: `The derivative f'(x) represent the instantaneous rate of change (tangent slope) of the original function at any point x.`
        });

      } catch (err: any) {
        setStepperError(err.message || "Could not parse calculus polynomial.");
      }
    }

    if (steps.length > 0) {
      setStepperSteps(steps);
    }
  };

  const currentStep = stepperSteps[currentStepIdx];

  const handleStepperPreset = (type: 'quadratic' | 'linear' | 'derivative', expr: string) => {
    setStepperType(type);
    setStepperInput(expr);
    setTimeout(() => {
      // Trigger update
      const clickBtn = document.getElementById('compile_stepper_trigger');
      if (clickBtn) clickBtn.click();
    }, 100);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Tab Selector */}
      <div className="flex justify-center bg-brand-surface p-1 rounded-2xl border border-brand-border/60 max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('solver')} 
          className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'solver' ? 'bg-brand-primary text-black font-semibold' : 'text-brand-text-secondary hover:text-brand-text'}`}
        >
          <Target size={12} className="inline mr-1" /> Symbolic Solver
        </button>
        <button 
          onClick={() => {
            setActiveTab('stepper');
            // compile once on load
            if (stepperSteps.length === 0) handleCompileStepper();
          }} 
          className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'stepper' ? 'bg-brand-primary text-black font-semibold' : 'text-brand-text-secondary hover:text-brand-text'}`}
        >
          <ListCollapse size={12} className="inline mr-1" /> Step-by-Step Solver
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'solver' ? (
          <motion.div 
            key="solver"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
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
                    className="px-8 bg-brand-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer"
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleExportAcademic}
                            className="px-4 py-1.5 bg-brand-surface border border-brand-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all flex items-center gap-2 cursor-pointer"
                            title="Export LaTeX Report"
                          >
                            <Download size={12} />
                            LaTeX Doc
                          </button>
                          <button 
                            onClick={handleCopy} 
                            className="px-4 py-1.5 bg-brand-surface border border-brand-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {copied ? <ShieldCheck size={12} className="text-green-500" /> : <GitCompareArrows size={12} />}
                            {copied ? 'Captured' : 'Capture'}
                          </button>
                        </div>
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
          </motion.div>
        ) : (
          <motion.div 
            key="stepper"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Controller: Form entries and Presets */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem] space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-accent rounded-full"></div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-text italic">Stepper Compiler</h4>
                </div>

                <div className="space-y-4">
                  {/* Stepper type */}
                  <div>
                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1.5">Domain Category</label>
                    <div className="grid grid-cols-3 gap-1 bg-brand-bg p-1 rounded-xl border border-brand-border/60">
                      <button 
                        onClick={() => { setStepperType('linear'); setStepperInput('3x + 9 = 24'); }} 
                        className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${stepperType === 'linear' ? 'bg-brand-primary text-black' : 'text-brand-text-secondary hover:text-brand-text'}`}
                      >
                        Linear
                      </button>
                      <button 
                        onClick={() => { setStepperType('quadratic'); setStepperInput('x^2 - 5x + 6 = 0'); }} 
                        className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${stepperType === 'quadratic' ? 'bg-brand-primary text-black' : 'text-brand-text-secondary hover:text-brand-text'}`}
                      >
                        Quadratic
                      </button>
                      <button 
                        onClick={() => { setStepperType('derivative'); setStepperInput('d/dx [3x^2 + 5x - 2]'); }} 
                        className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${stepperType === 'derivative' ? 'bg-brand-primary text-black' : 'text-brand-text-secondary hover:text-brand-text'}`}
                      >
                        Derivative
                      </button>
                    </div>
                  </div>

                  {/* Input stream */}
                  <div>
                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Symbolic Register</label>
                    <input 
                      type="text" 
                      value={stepperInput}
                      onChange={e => setStepperInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCompileStepper()}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all text-brand-text"
                    />
                  </div>

                  <button 
                    id="compile_stepper_trigger"
                    onClick={handleCompileStepper}
                    className="w-full py-3 bg-brand-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
                  >
                    Build Derivation Steps
                  </button>

                  {stepperError && (
                    <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
                      <p className="text-red-400 font-mono text-[10px] uppercase leading-tight">{stepperError}</p>
                    </div>
                  )}
                </div>

                {/* Prebuilt Study presets */}
                <div className="border-t border-brand-border/40 pt-4 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary">Study Templates</span>
                  <div className="space-y-1.5 text-left">
                    <button 
                      onClick={() => handleStepperPreset('linear', '4x - 12 = 8')} 
                      className="w-full text-left py-1.5 px-3 bg-brand-bg hover:border-brand-primary border border-brand-border rounded-xl text-[10px] font-mono text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer"
                    >
                      Linear: 4x - 12 = 8
                    </button>
                    <button 
                      onClick={() => handleStepperPreset('quadratic', '2x^2 + 8x - 10 = 0')} 
                      className="w-full text-left py-1.5 px-3 bg-brand-bg hover:border-brand-primary border border-brand-border rounded-xl text-[10px] font-mono text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer"
                    >
                      Quadratic: 2x² + 8x - 10 = 0
                    </button>
                    <button 
                      onClick={() => handleStepperPreset('derivative', 'd/dx [4x^2 - 6x + 7]')} 
                      className="w-full text-left py-1.5 px-3 bg-brand-bg hover:border-brand-primary border border-brand-border rounded-xl text-[10px] font-mono text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer"
                    >
                      Calculus: d/dx [4x² - 6x + 7]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel: Active Stepper Stream */}
            <div className="lg:col-span-8 space-y-6">
              {currentStep ? (
                <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] shadow-xl min-h-[420px] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary" />
                  
                  {/* Step Title Header */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">
                      <span className="text-brand-primary italic">Active Study Stepper</span>
                      <span>Step {currentStepIdx + 1} of {stepperSteps.length}</span>
                    </div>

                    <h3 className="text-xl font-black text-brand-text tracking-tight">
                      {currentStep.title}
                    </h3>
                  </div>

                  {/* Step LaTeX visual block */}
                  <div className="my-8 p-8 bg-brand-bg/80 border border-brand-border/60 rounded-[1.8rem] flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="text-2xl md:text-3xl font-bold font-mono text-brand-text text-center z-10 select-all leading-relaxed whitespace-pre-wrap">
                      <Latex>{currentStep.latex}</Latex>
                    </div>

                    {/* Render Quadratic Factor Tree visual if visualData is present */}
                    {currentStep.visualData && (
                      <div className="mt-6 p-4 border border-dashed border-brand-border/80 bg-brand-surface/50 rounded-2xl w-full max-w-sm text-center z-10 font-mono text-[11px] text-brand-text-secondary space-y-3">
                        <div className="flex justify-around items-center relative py-4">
                          <div className="text-brand-text flex flex-col items-center">
                            <span className="text-[10px] text-brand-text-secondary">Constant Product</span>
                            <span className="font-bold text-sm text-brand-primary">{currentStep.visualData.c / currentStep.visualData.a}</span>
                          </div>
                          
                          {/* Split branches */}
                          <div className="w-16 h-px bg-brand-border rotate-45" />
                          <div className="w-16 h-px bg-brand-border -rotate-45" />

                          <div className="text-brand-text flex flex-col items-center">
                            <span className="text-[10px] text-brand-text-secondary">X Coefficient Sum</span>
                            <span className="font-bold text-sm text-brand-accent">{currentStep.visualData.b / currentStep.visualData.a}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-brand-border/30 pt-2 text-center">
                          <div>
                            <span className="text-[9px] block text-brand-text-secondary">Factor 1</span>
                            <span className="font-bold text-brand-text text-xs">x - ({currentStep.visualData.root1})</span>
                          </div>
                          <div>
                            <span className="text-[9px] block text-brand-text-secondary">Factor 2</span>
                            <span className="font-bold text-brand-text text-xs">x - ({currentStep.visualData.root2})</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step Explanations / Theorem notes */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-brand-accent/10 text-brand-accent rounded-lg mt-0.5">
                        <Brain size={14} />
                      </div>
                      <p className="text-sm text-brand-text-secondary leading-relaxed">
                        {currentStep.explanation}
                      </p>
                    </div>

                    {currentStep.tip && (
                      <div className="p-4 bg-brand-bg/40 border border-brand-border/60 rounded-2xl flex gap-3 text-xs">
                        <HelpCircle size={16} className="text-brand-primary shrink-0 mt-0.5" />
                        <div className="text-brand-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
                          {currentStep.tip}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stepper Timeline Footer Controls */}
                  <div className="flex items-center justify-between border-t border-brand-border/40 pt-6">
                    <button 
                      onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentStepIdx === 0}
                      className="px-4 py-2 border border-brand-border rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-border hover:text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>

                    {/* Step Pip indicators */}
                    <div className="flex gap-1.5">
                      {stepperSteps.map((_, i) => (
                        <div 
                          key={i} 
                          onClick={() => setCurrentStepIdx(i)}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentStepIdx ? 'bg-brand-primary scale-125' : 'bg-brand-border hover:bg-brand-text-secondary/40'}`}
                        />
                      ))}
                    </div>

                    {currentStepIdx < stepperSteps.length - 1 ? (
                      <button 
                        onClick={() => setCurrentStepIdx(prev => Math.min(stepperSteps.length - 1, prev + 1))}
                        className="px-5 py-2.5 bg-brand-primary text-black font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        Next Step <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 animate-pulse">
                        <Award size={14} /> Solved
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                  <Variable size={48} className="text-brand-text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Study Expression Build</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquationSolver;
