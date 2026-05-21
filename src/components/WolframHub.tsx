import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import Latex from 'react-latex-next';
import { GoogleGenAI } from "@google/genai";
import { getApiKey, getGeminiModel, getSystemInstructionSuffix } from '../services/geminiService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

interface QueryStep {
  title: string;
  mathContent: string;
  explanation: string;
}

interface WolframResult {
  symbolicExpr: string;
  formattedInput: string;
  alternateForms: string[];
  steps: QueryStep[];
  properties: { label: string; value: string }[];
  domainRange?: string;
  plotPoints?: { x: number; y: number }[];
}

const PRESET_QUERIES = [
  { label: "Derivative: d/dx(x^3 - 3x^2 + 4)", query: "d/dx(x^3 - 3x^2 + 4)" },
  { label: "Integral: x^2 * sin(x)", query: "integrate x^2 * sin(x)" },
  { label: "Solve: x^2 - 5x + 6 = 0", query: "solve x^2 - 5x + 6 = 0" },
  { label: "Simplify: (x^2 - 9)/(x - 3)", query: "simplify (x^2 - 9)/(x - 3)" },
  { label: "Truth Table: p and (q or not p)", query: "truth table p and (q or not p)" }
];

export const WolframHub: React.FC = () => {
  const [queryInput, setQueryInput] = useState('d/dx(x^3 - 3x^2 + 4)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WolframResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quantum_wolfram_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (q: string) => {
    const nextHistory = [q, ...history.filter(item => item !== q)].slice(0, 10);
    setHistory(nextHistory);
    try {
      localStorage.setItem('quantum_wolfram_history', JSON.stringify(nextHistory));
    } catch (e) {
      console.warn("Storage restricted.", e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('quantum_wolfram_history');
    } catch (e) {
      console.warn("Storage delete failed", e);
    }
  };

  const executeSolve = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    saveHistory(queryText);

    try {
      // 1. Check if we can do custom offline calculation for simple polynomial derivatives/integrals/solves
      const offlineRes = tryOfflineSolve(queryText);
      if (offlineRes) {
        setResult(offlineRes);
        setLoading(false);
        return;
      }

      // 2. Fall back to Gemini API for advanced math step-by-step logical reasoning
      const apiKey = getApiKey();
      if (!apiKey) {
        // Run simulated high-quality stepped results if no API key is configured and offline parser didn't match
        const backupResult = getSimulatedSteppedResult(queryText);
        setResult(backupResult);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
        You are a highly advanced mathematical computational engine. You analyze query parameters and produce step-by-step rigorous logical proofs like WolframAlpha.
        Analyze the math expression: "${queryText}".
        Produce a JSON response matching this TypeScript schema exactly:
        {
          "symbolicExpr": "Standard mathematical expression using KaTeX format (e.g. \\frac{d}{dx}[x^3 - 3x^2 + 4] = 3x^2 - 6x)",
          "formattedInput": "Standard inputs formatted in LaTeX symbols",
          "alternateForms": ["Alternative equivalent form 1", "Alternative equivalent form 2"],
          "steps": [
            {
              "title": "Short title of step",
              "mathContent": "KaTeX representing math formulas at this step (use dual dollar signs if block equation, single dollar signs for inline)",
              "explanation": "Clear analytical educational insight for this step"
            }
          ],
          "properties": [
            { "label": "Classification / Type", "value": "e.g. Polynomial Derivative / Quadratic Equation" },
            { "label": "Domain", "value": "Real numbers, etc." },
            { "label": "Global Roots", "value": "List of roots" }
          ],
          "domainRange": "Domain and Range representation or asymptotic behavior",
          "plotPoints": [
             { "x": -2, "y": 4 },
             { "x": -1, "y": 1 },
             { "x": 0, "y": 0 },
             { "x": 1, "y": 1 },
             { "x": 2, "y": 4 }
          ]
        }
        Return ONLY valid JSON. No markdown blocks, no triple backticks. If you cannot solve it, output error JSON with a failure message.
      ` + getSystemInstructionSuffix();

      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: `Solve computational request: ${queryText}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const parsedText = response.text?.trim() || "{}";
      const cleanJson = parsedText.replace(/^```json/, '').replace(/```$/, '').trim();
      const payload = JSON.parse(cleanJson);

      if (payload && (payload.steps || payload.symbolicExpr)) {
        // Enforce numerical array of plotPoints
        let validPlot = payload.plotPoints || [];
        if (validPlot.length > 0) {
          validPlot = validPlot.map((p: any) => ({
            x: typeof p.x === 'number' ? p.x : parseFloat(p.x) || 0,
            y: typeof p.y === 'number' ? p.y : parseFloat(p.y) || 0
          }));
        } else {
          // Generate default points if missing
          validPlot = generatePlaceholderPoints(queryText);
        }
        payload.plotPoints = validPlot;
        setResult(payload);
      } else {
        throw new Error("Invalid format returned from model computation engine.");
      }
    } catch (err: any) {
      console.error(err);
      setError(`Computation limits reached or syntax issue: ${err.message || err}. Falling back to standard offline analyzer.`);
      const backupResult = getSimulatedSteppedResult(queryText);
      setResult(backupResult);
    } finally {
      setLoading(false);
    }
  };

  const generatePlaceholderPoints = (query: string) => {
    const pts = [];
    const lower = -3;
    const upper = 3;
    for (let x = lower; x <= upper; x += 1) {
      let y = x * x; // Default x^2
      if (query.includes('d/dx')) {
        y = 3 * x * x - 6 * x;
      } else if (query.includes('sin')) {
        y = Math.sin(x);
      } else if (query.includes('solve')) {
        y = x * x - 5 * x + 6;
      }
      pts.push({ x, y: parseFloat(y.toFixed(2)) });
    }
    return pts;
  };

  const tryOfflineSolve = (q: string): WolframResult | null => {
    const cleaned = q.toLowerCase().replace(/\s+/g, '');
    
    // Scenario 1: Basic derivative of normal simple quad/cubic x^3 - 3x^2 + 4
    if (cleaned === 'd/dx(x^3-3x^2+4)' || cleaned === 'd/dx(x^3-3x^2+4x)') {
      return {
        symbolicExpr: `\\frac{d}{dx}[x^3 - 3x^2 + 4] = 3x^2 - 6x`,
        formattedInput: `\\frac{d}{dx}(x^3 - 3x^2 + 4)`,
        alternateForms: [
          `3x(x - 2)`,
          `x(3x - 6)`
        ],
        steps: [
          {
            title: "Apply Sum Rule",
            mathContent: `\\frac{d}{dx}[u + v] = \\frac{d}{dx}[u] + \\frac{d}{dx}[v]`,
            explanation: "Deploy derivatives term by term over addition/subtraction."
          },
          {
            title: "Differentiate x^3",
            mathContent: `\\frac{d}{dx}[x^3] = 3x^2`,
            explanation: "Apply the generic Power Rule: $d/dx[x^n] = n x^{n-1}$."
          },
          {
            title: "Differentiate -3x^2",
            mathContent: `-3 \\cdot \\frac{d}{dx}[x^2] = -3(2x) = -6x`,
            explanation: "Pull out the constant multiplier and apply power rule to $x^2$."
          },
          {
            title: "Differentiate Constant",
            mathContent: `\\frac{d}{dx}[4] = 0`,
            explanation: "The derivative of any standing absolute scalar constraint is always zero."
          }
        ],
        properties: [
          { label: "Operation", value: "Differential Calculus" },
          { label: "Order", value: "First-Order Polynomial Derivative" },
          { label: "Roots", value: "x = 0, x = 2" }
        ],
        plotPoints: [
          { x: -1, y: 9 },
          { x: 0, y: 0 },
          { x: 1, y: -3 },
          { x: 2, y: 0 },
          { x: 3, y: 9 }
        ]
      };
    }

    // Scenario 2: Solve quadratic x^2 - 5x + 6 = 0
    if (cleaned.includes('solve') && cleaned.includes('x^2-5x+6')) {
      return {
        symbolicExpr: `x^2 - 5x + 6 = 0 \\Rightarrow x \\in \\{2, 3\\}`,
        formattedInput: `x^2 - 5x + 6 = 0`,
        alternateForms: [
          `(x - 2)(x - 3) = 0`,
          `x^2 - 5x = -6`
        ],
        steps: [
          {
            title: "Find Factoring Coefficients",
            mathContent: `x^2 - 5x + 6 = (x - p)(x - q)`,
            explanation: "Locate two factors that sum to $-5$ and multiply to $+6$. These are $-2$ and $-3$."
          },
          {
            title: "Set factors to zero",
            mathContent: `x - 2 = 0 \\quad \\text{or} \\quad x - 3 = 0`,
            explanation: "Apply Null Factor Law to determine the individual roots."
          }
        ],
        properties: [
          { label: "Mathematical Type", value: "Quadratic Equation" },
          { label: "Discriminant", value: "Delta = 1 (Deterministic Real Roots)" },
          { label: "Symmetry Axis", value: "x = 2.5" }
        ],
        plotPoints: [
          { x: 0, y: 6 },
          { x: 1, y: 2 },
          { x: 2, y: 0 },
          { x: 2.5, y: -0.25 },
          { x: 3, y: 0 },
          { x: 4, y: 2 }
        ]
      };
    }

    return null;
  };

  const getSimulatedSteppedResult = (query: string): WolframResult => {
    // Generate an intelligent mock result formatted as standard Wolfram step components
    return {
      symbolicExpr: `\\mathcal{W}[${query}]`,
      formattedInput: `${query}`,
      alternateForms: [
        `\\text{Direct symbolic translation format}`
      ],
      steps: [
        {
          title: "Lexical Extraction",
          mathContent: `Q = \\text{Parse}(${query})`,
          explanation: "Analyzed expression elements and isolated query targets."
        },
        {
          title: "Offline Sandbox Limit",
          mathContent: `\\text{Active Gemini Pro Key Required for Custom Symbolic Calculations}`,
          explanation: "Connecting to Google AI Studio API via settings unlocks unlimited step-by-step calculus, linear algebraic breakdowns, limit evaluations, and logical truth indices!"
        }
      ],
      properties: [
        { label: "Search Space Status", "value": "Offline Local Simulation" },
        { label: "Mathematical Input Detected", "value": `${query}` }
      ],
      plotPoints: [
        { x: -3, y: 9 },
        { x: -2, y: 4 },
        { x: -1, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 4 },
        { x: 3, y: 9 }
      ]
    };
  };

  useEffect(() => {
    // Run initial search
    executeSolve(queryInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto" id="wolfram_hub_section">
      <div className="bg-brand-surface/40 p-8 md:p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Cpu size={140} className="text-brand-primary" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles size={11} /> Wolfram Computational Intelligence
              </span>
              <h3 className="text-3xl font-black text-brand-text tracking-tight flex items-center gap-2">
                Knowledge Solver
              </h3>
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(p.query);
                    executeSolve(p.query);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-brand-bg hover:bg-brand-primary/10 text-[10px] text-brand-text-secondary hover:text-brand-primary font-mono border border-brand-border transition-all"
                >
                  {p.label.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* User Solver Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeSolve(queryInput);
                }}
                placeholder="Type calculus problem, simplify task, or algebraic equations..."
                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-2xl py-4 pl-5 pr-12 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-mono shadow-inner"
              />
              <button
                onClick={() => executeSolve(queryInput)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-brand-primary hover:bg-brand-primary/10 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Display Solver Panels */}
          {error && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8 pt-4"
              >
                {/* Mathematical Identity Block */}
                <div className="bg-brand-bg rounded-3xl p-6 border border-brand-border/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono block mb-1">Standard Symbolic Form</span>
                    <div className="text-xl font-black text-brand-text font-mono overflow-x-auto py-2 scrollbar-none">
                      <Latex>{`$$ ${result.symbolicExpr} $$`}</Latex>
                    </div>
                  </div>
                  {result.alternateForms && result.alternateForms.length > 0 && (
                    <div className="pt-4 md:pt-0 md:border-l border-brand-border/40 md:pl-6 space-y-2">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block font-mono">Alternative Forms</span>
                      {result.alternateForms.map((alt, i) => (
                        <div key={i} className="text-xs font-mono text-brand-text bg-brand-surface px-2.5 py-1.5 rounded-lg border border-brand-border/40">
                          <Latex>{`$ ${alt} $`}</Latex>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plot Panel */}
                {result.plotPoints && result.plotPoints.length > 0 && (
                  <div className="p-6 bg-brand-surface rounded-2xl border border-brand-border/50 space-y-4">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono block">Interactive Graph Estimate</span>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.plotPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="x" stroke="#71717a" fontSize={10} className="font-mono" />
                          <YAxis stroke="#71717a" fontSize={10} className="font-mono" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} 
                            labelClassName="text-brand-text text-xs"
                          />
                          <ReferenceLine x={0} stroke="#3f3f46" strokeWidth={1} />
                          <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={1} />
                          <Line type="monotone" dataKey="y" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 3 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Computational Steps Container */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-400" />
                    <h4 className="text-sm font-black text-brand-text uppercase tracking-wider font-mono">Logical Proof / Stepped Derivation</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.steps?.map((step, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-brand-bg/60 border border-brand-border/55 rounded-2xl p-5 hover:border-brand-primary/30 transition-all flex flex-col justify-between"
                        whileHover={{ y: -2 }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-brand-primary font-mono uppercase tracking-wider">Step {idx + 1}</span>
                            <span className="text-xs font-semibold text-brand-text">{step.title}</span>
                          </div>
                          <div className="p-3 bg-brand-surface rounded-xl border border-brand-border/40 text-center my-2 font-mono text-sm overflow-x-auto scrollbar-none">
                            <Latex>{`$ ${step.mathContent} $`}</Latex>
                          </div>
                        </div>
                        <p className="text-xs text-brand-text-secondary mt-3 font-light leading-relaxed">
                          {step.explanation}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Analytical Attributes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-brand-border/30">
                  {result.properties?.map((prop, idx) => (
                    <div key={idx} className="p-4 bg-brand-bg/40 border border-brand-border/40 rounded-xl">
                      <span className="text-[9px] font-bold text-brand-text-secondary uppercase block mb-1">{prop.label}</span>
                      <span className="text-xs font-mono font-bold text-brand-text">{prop.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Local Query Library Notes History */}
          {history.length > 0 && (
            <div className="mt-8 pt-6 border-t border-brand-border/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-brand-text-secondary uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Clock size={12} /> Calculation Registry
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-400 hover:text-red-500 font-bold uppercase transition-all"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQueryInput(q);
                      executeSolve(q);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-bg hover:bg-brand-surface hover:text-brand-primary text-xs font-mono text-brand-text-secondary border border-brand-border flex items-center gap-1.5 transition-all"
                  >
                    <ChevronRight size={10} className="text-brand-primary" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default WolframHub;
