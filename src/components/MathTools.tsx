


import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { Search, BarChart, FunctionSquare, Table, Percent, Sigma, ShieldCheck, Superscript, DivideCircle, Triangle, Ruler, Shuffle, BarChartHorizontal, Scaling, Eraser, GitCompareArrows, Atom, ArrowRightLeft, Book, Landmark, Activity, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

// Import standalone components
import MatrixCalculator from './Matrix';
import StatisticsCalculator from './Statistics';
import EquationSolverTool from './EquationSolver';
import FormulaLibrary from './FormulaLibrary';


const math = create(all, { number: 'BigNumber', precision: 64 });

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary pl-1 italic">{label}</label>
        <input 
            {...props} 
            className="w-full bg-brand-surface/40 backdrop-blur-md border border-brand-border/60 rounded-xl px-4 py-3 text-brand-text text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all font-mono placeholder:opacity-30 shadow-inner" 
        />
    </div>
);

const ResultCard = ({ title, value, description }: { title: string, value: string, description?: string }) => {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className="bg-brand-surface/60 backdrop-blur-xl border border-brand-border/60 p-6 rounded-[2rem] relative group overflow-hidden shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/70">{title}</span>
                <button 
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg hover:bg-brand-surface text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    title="Copy to clipboard"
                >
                    {copied ? <ShieldCheck size={14} className="text-green-500" /> : <GitCompareArrows size={14} />}
                </button>
            </div>
            <div className="flex flex-col">
                <div className="text-2xl font-black text-brand-text tracking-tighter truncate font-mono">
                    {value}
                </div>
                {description && (
                    <div className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest mt-1">
                        {description}
                    </div>
                )}
            </div>
            {copied && (
                <div className="absolute top-2 right-10 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Copied
                </div>
            )}
        </motion.div>
    );
};


// --- Existing Calculators (Refactored) ---



const CalculationCard = ({ title, result, resultLabel }: {title:React.ReactNode, result:string, resultLabel:string}) => (
    <div className="bg-brand-bg p-6 rounded-lg flex flex-col"><h3 className="text-xl font-semibold mb-4 text-brand-text h-16 flex items-center">{title}</h3><div className="mt-auto pt-4 border-t border-gray-700"><span className="text-brand-text-secondary">{resultLabel}</span><p className="text-2xl font-bold text-brand-accent font-mono break-all min-h-[36px]">{result}</p></div></div>
);

const PercentageCalculatorTool = () => {
    const [val1, setVal1] = useState('15'); const [val2, setVal2] = useState('75');
    const [val3, setVal3] = useState('20'); const [val4, setVal4] = useState('150');
    const [val5, setVal5] = useState('50'); const [val6, setVal6] = useState('25');
    
    const result1 = useMemo(() => { const n1 = parseFloat(val1); const n2 = parseFloat(val2); if(isNaN(n1)||isNaN(n2)) return ''; return String(parseFloat(((n1/100)*n2).toPrecision(10))); }, [val1, val2]);
    const result2 = useMemo(() => { const n3 = parseFloat(val3); const n4 = parseFloat(val4); if(isNaN(n3)||isNaN(n4)||n4===0) return ''; return String(parseFloat(((n3/n4)*100).toPrecision(10))); }, [val3, val4]);
    const result3 = useMemo(() => { const n5 = parseFloat(val5); const n6 = parseFloat(val6); if(isNaN(n5)||isNaN(n6)||n5===0) return ''; const res = (n6 / n5) * 100; return String(parseFloat(res.toPrecision(10))); }, [val5, val6]);

    const inputClasses = "bg-brand-bg border border-gray-600 rounded-md text-brand-text w-24 text-center p-1 mx-1";

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

    const derivedValues = useMemo(() => {
        const valA = parseFloat(a);
        const valB = parseFloat(b);
        const valC = parseFloat(c);
        const valD = parseFloat(d);
        const emptyFields = [
            { name: 'a', val: a },
            { name: 'b', val: b },
            { name: 'c', val: c },
            { name: 'd', val: d }
        ].filter(f => f.val.trim() === '');

        if (emptyFields.length === 1) {
            const missing = emptyFields[0].name;
            try {
                if (missing === 'a' && !isNaN(valB) && !isNaN(valC) && !isNaN(valD) && valD !== 0) return { a: ((valB * valC) / valD).toFixed(4) };
                if (missing === 'b' && !isNaN(valA) && !isNaN(valC) && !isNaN(valD) && valC !== 0) return { b: ((valA * valD) / valC).toFixed(4) };
                if (missing === 'c' && !isNaN(valA) && !isNaN(valB) && !isNaN(valD) && valB !== 0) return { c: ((valA * valD) / valB).toFixed(4) };
                if (missing === 'd' && !isNaN(valA) && !isNaN(valB) && !isNaN(valC) && valA !== 0) return { d: ((valB * valC) / valA).toFixed(4) };
            } catch { /* ignore */ }
        }
        return {};
    }, [a, b, c, d]);

    const displayA = a || derivedValues.a || '';
    const displayB = b || derivedValues.b || '';
    const displayC = c || derivedValues.c || '';
    const displayD = d || derivedValues.d || '';
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="p-2 text-center text-sm bg-brand-bg rounded-lg">Enter three values to solve for the fourth.</div>
            <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                <Input label="A" value={displayA} onChange={e => setA(e.target.value)} />
                <span>/</span>
                <Input label="B" value={displayB} onChange={e => setB(e.target.value)} />
                <span>=</span>
                <Input label="C" value={displayC} onChange={e => setC(e.target.value)} />
                <span>/</span>
                <Input label="D" value={displayD} onChange={e => setD(e.target.value)} />
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
            let n = num;
            const factors: Record<number, number> = {};
            for (let i = 2; i * i <= n; i++) {
                while (n % i === 0) {
                    factors[i] = (factors[i] || 0) + 1;
                    n /= i;
                }
            }
            if (n > 1) {
                factors[n] = 1;
            }
            
            return Object.entries(factors)
                .map(([base, exp]) => exp > 1 ? `${base} ^ ${exp}` : String(base))
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

const TriangleVisualizer = ({ a, b, c }: { a: number, b: number, c: number }) => {
    const sA = a; const sB = b; const sC = c;
    const cosA = (sB*sB + sC*sC - sA*sA) / (2 * sB * sC);
    const angleA = Math.acos(cosA);
    
    const scale = 80 / Math.max(sA, sB, sC);
    const v1 = { x: 10, y: 90 };
    const v2 = { x: 10 + sC * scale, y: 90 };
    const v3 = { x: 10 + sB * Math.cos(angleA) * scale, y: 90 - sB * Math.sin(angleA) * scale };

    return (
        <div className="flex justify-center bg-brand-bg rounded-xl p-4 border border-brand-border h-48 relative overflow-hidden">
             <svg viewBox="0 0 100 100" className="h-full">
                <motion.path 
                    d={`M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z`}
                    fill="var(--color-primary)"
                    fillOpacity="0.1"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    initial={false}
                    animate={{ d: `M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z` }}
                />
             </svg>
             <div className="absolute bottom-2 right-4 text-[10px] font-mono text-brand-text-secondary uppercase">Geometric Projection</div>
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
            error: null,
            vals: { a: sA, b: sB, c: sC }
        };
    }, [a, b, c]);
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
             <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Side a" type="number" value={a} onChange={e => setA(e.target.value)} />
                        <Input label="Side b" type="number" value={b} onChange={e => setB(e.target.value)} />
                        <Input label="Side c" type="number" value={c} onChange={e => setC(e.target.value)} />
                    </div>
                    {result.error && <p className="text-red-400 text-center bg-red-400/10 py-2 rounded-lg text-sm">{result.error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="Perimeter" value={result.perimeter || '--'} />
                        <ResultCard title="Area" value={result.area || '--'} />
                    </div>
                </div>
                {!result.error && result.vals && <TriangleVisualizer {...result.vals} />}
             </div>

            {!result.error && (
                <div className="grid grid-cols-3 gap-4">
                    <ResultCard title="∠ A" value={`${result.angleA}°`} />
                    <ResultCard title="∠ B" value={`${result.angleB}°`} />
                    <ResultCard title="∠ C" value={`${result.angleC}°`} />
                </div>
            )}
        </div>
    );
};

const CircleCalculator = () => {
    const [radius, setRadius] = useState('10');

    const r = parseFloat(radius);
    const diameter = !isNaN(r) ? (2 * r).toFixed(2) : '';
    const circumference = !isNaN(r) ? (2 * Math.PI * r).toFixed(2) : '';
    const area = !isNaN(r) ? (Math.PI * r * r).toFixed(2) : '';
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
             <div className="grid lg:grid-cols-2 gap-8">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Radius" type="number" value={radius} onChange={e => setRadius(e.target.value)} />
                    <Input label="Diameter" type="number" value={diameter} onChange={e => {
                        const d = parseFloat(e.target.value);
                        if (!isNaN(d)) setRadius((d / 2).toString());
                        else setRadius('');
                    }} />
                    <Input label="Circumference" type="number" value={circumference} onChange={e => {
                        const c = parseFloat(e.target.value);
                        if (!isNaN(c)) setRadius((c / (2 * Math.PI)).toString());
                        else setRadius('');
                    }} />
                    <Input label="Area" type="number" value={area} onChange={e => {
                        const a = parseFloat(e.target.value);
                        if (!isNaN(a)) setRadius(Math.sqrt(a / Math.PI).toString());
                        else setRadius('');
                    }} />
                </div>
                
                <div className="flex justify-center items-center bg-brand-bg rounded-xl p-4 border border-brand-border h-48 relative overflow-hidden">
                    <svg viewBox="0 0 100 100" className="h-full">
                        <motion.circle 
                            cx="50" cy="50" r="40"
                            fill="var(--color-primary)"
                            fillOpacity="0.1"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                        />
                        <line x1="50" y1="50" x2="90" y2="50" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 2" />
                        <text x="70" y="45" fontSize="6" fill="var(--color-accent)" textAnchor="middle" className="font-mono font-bold">R</text>
                    </svg>
                    <div className="absolute bottom-2 right-4 text-[10px] font-mono text-brand-text-secondary uppercase">Vector Simulation</div>
                </div>
             </div>
        </div>
    );
};


const StandardDeviationCalculator = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8');
    
    const stats = useMemo(() => {
        const nums = dataStr.split(/[,\s]+/).filter(Boolean).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (nums.length === 0) return null;
        
        try {
            const mean = math.mean(nums);
            const std = math.std(nums);
            const variance = math.variance(nums);
            const sum = math.sum(nums);
            const sorted = [...nums].sort((a, b) => a - b);
            const median = math.median(nums);
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            
            return { mean, std, variance, sum, median, min, max, count: nums.length };
        } catch (e) {
            return null;
        }
    }, [dataStr]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-text pl-1 italic">Dynamic Data Array</label>
                    <span className="text-[10px] font-mono text-brand-primary uppercase">N = {stats?.count || 0}</span>
                </div>
                <textarea 
                    value={dataStr} 
                    onChange={e => setDataStr(e.target.value)}
                    className="w-full h-24 bg-brand-bg border border-brand-border rounded-xl p-4 text-brand-text text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all font-mono resize-none leading-relaxed"
                    placeholder="Enter numbers separated by commas or spaces..."
                />
            </div>

            {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ResultCard title="Mean (μ)" value={String(stats.mean)} />
                    <ResultCard title="Std Dev (σ)" value={String(stats.std)} />
                    <ResultCard title="Variance (σ²)" value={String(stats.variance)} />
                    <ResultCard title="Sum (Σ)" value={String(stats.sum)} />
                    <ResultCard title="Median" value={String(stats.median)} />
                    <ResultCard title="Min" value={String(stats.min)} />
                    <ResultCard title="Max" value={String(stats.max)} />
                    <ResultCard title="Range" value={String(stats.max - stats.min)} />
                </div>
            ) : (
                <div className="p-8 text-center bg-brand-bg rounded-xl border border-brand-border border-dashed">
                    <p className="text-brand-text-secondary text-sm font-mono uppercase tracking-widest">Waiting for valid input vector...</p>
                </div>
            )}
        </div>
    );
};

const zScores: Record<string, number> = {
    '80': 1.28, '85': 1.44, '90': 1.645, '95': 1.96, '98': 2.33, '99': 2.576
};

const ConfidenceIntervalCalculator = () => {
    const [mean, setMean] = useState('50');
    const [stdDev, setStdDev] = useState('5');
    const [size, setSize] = useState('100');
    const [confidence, setConfidence] = useState('95');

    const result = useMemo(() => {
        const x = parseFloat(mean);
        const s = parseFloat(stdDev);
        const n = parseInt(size);
        const z = zScores[confidence];

        if (isNaN(x) || isNaN(s) || isNaN(n) || s < 0 || n <= 1) {
            return { error: 'Please enter valid inputs (n > 1, s >= 0).', data: null };
        }
        if (!z) {
            return { error: 'Please select a valid confidence level.', data: null };
        }

        const marginOfError = z * (s / Math.sqrt(n));
        const lowerBound = x - marginOfError;
        const upperBound = x + marginOfError;
        
        return {
            error: null,
            data: {
                marginOfError: marginOfError.toFixed(4),
                lowerBound: lowerBound.toFixed(4),
                upperBound: upperBound.toFixed(4)
            }
        };
    }, [mean, stdDev, size, confidence]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Input label="Sample Mean (x̄)" type="number" value={mean} onChange={e => setMean(e.target.value)} />
                <Input label="Sample Standard Deviation (s)" type="number" value={stdDev} onChange={e => setStdDev(e.target.value)} />
                <Input label="Sample Size (n)" type="number" value={size} onChange={e => setSize(e.target.value)} />
                <div>
                    <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Confidence Level</label>
                    <select value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all h-[42px]">
                        {Object.keys(zScores).map(level => <option key={level} value={level}>{level}%</option>)}
                    </select>
                </div>
            </div>
            {result.error && <p className="text-red-400">{result.error}</p>}
            {result.data && (
                <div className="grid sm:grid-cols-3 gap-4">
                    <ResultCard title="Margin of Error" value={`± ${result.data.marginOfError}`} />
                    <ResultCard title="Lower Bound" value={result.data.lowerBound} />
                    <ResultCard title="Upper Bound" value={result.data.upperBound} />
                </div>
            )}
        </div>
    );
};


const GcfLcmCalculator = () => {
    const [numbersStr, setNumbersStr] = useState('12, 18, 30');

    const result = useMemo(() => {
        const numbers = numbersStr.split(/[\s,]+/).filter(Boolean).map(s => parseInt(s));
        if (numbers.length < 2 || numbers.some(isNaN)) {
            return { error: 'Please enter at least two valid integers.', data: null };
        }
        try {
            const gcf = numbers.reduce((a, b) => Number(math.gcd(a, b)));
            const lcm = numbers.reduce((a, b) => Number(math.lcm(a, b)));
            return { error: null, data: { gcf, lcm } };
        } catch {
            return { error: 'Calculation failed. Please check your inputs.', data: null };
        }
    }, [numbersStr]);
    
    return (
      <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
        <Input label="Numbers (comma or space-separated)" value={numbersStr} onChange={e => setNumbersStr(e.target.value)} />
        {result.error && <p className="text-red-400">{result.error}</p>}
        {result.data && (
          <div className="flex gap-4">
            <ResultCard title="Greatest Common Factor (GCF)" value={String(result.data.gcf)} />
            <ResultCard title="Least Common Multiple (LCM)" value={String(result.data.lcm)} />
          </div>
        )}
      </div>
    );
};

const PrimeNumberCalculator = () => {
    const [checkNum, setCheckNum] = useState('17');
    const [rangeNum, setRangeNum] = useState('100');

    const isPrime = useMemo(() => {
        const num = parseInt(checkNum);
        if (isNaN(num)) return null;
        return math.isPrime(num);
    }, [checkNum]);

    const primesInRange = useMemo(() => {
        const limit = parseInt(rangeNum);
        if (isNaN(limit) || limit < 2) return [];
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) sieve[j] = false;
            }
        }
        return sieve.map((p, i) => p ? i : -1).filter(i => i !== -1);
    }, [rangeNum]);
    
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

interface FractionInputProps {
    n: string;
    d: string;
    setN: (val: string) => void;
    setD: (val: string) => void;
}

const FractionInput = ({ n, d, setN, setD }: FractionInputProps) => (
    <div className="flex flex-col items-center">
        <input type="number" value={n} onChange={e=>setN(e.target.value)} className="w-20 bg-brand-bg/50 p-2 rounded-xl border border-brand-border text-center font-mono focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
        <hr className="w-20 my-1.5 border-brand-text/40" />
        <input type="number" value={d} onChange={e=>setD(e.target.value)} className="w-20 bg-brand-bg/50 p-2 rounded-xl border border-brand-border text-center font-mono focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
    </div>
);

const FractionCalculator = () => {
    const [n1, setN1] = useState('1'); const [d1, setD1] = useState('2');
    const [n2, setN2] = useState('3'); const [d2, setD2] = useState('4');
    const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
    
    const fractionMath = useMemo(() => create(all, { number: 'Fraction' }), []);

    const result = useMemo(() => {
        try {
            const f1 = fractionMath.fraction(parseInt(n1), parseInt(d1));
            const f2 = fractionMath.fraction(parseInt(n2), parseInt(d2));
            const res = fractionMath[operation](f1, f2);
            const decimalValue = Number(res.valueOf());
            return `${res.toString()} (Decimal: ${decimalValue.toFixed(4)})`;
        } catch {
            return 'Invalid fraction';
        }
    }, [n1, d1, n2, d2, operation, fractionMath]);

    return(
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-center gap-4">
                <FractionInput n={n1} d={d1} setN={setN1} setD={setD1} />
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setOperation('add')} className={`p-2 rounded text-xl ${operation === 'add' ? 'bg-brand-accent' : 'bg-brand-primary'}`}>+</button>
                    <button onClick={() => setOperation('subtract')} className={`p-2 rounded text-xl ${operation === 'subtract' ? 'bg-brand-accent' : 'bg-brand-primary'}`}>-</button>
                    <button onClick={() => setOperation('multiply')} className={`p-2 rounded text-xl ${operation === 'multiply' ? 'bg-brand-accent' : 'bg-brand-primary'}`}>×</button>
                    <button onClick={() => setOperation('divide')} className={`p-2 rounded text-xl ${operation === 'divide' ? 'bg-brand-accent' : 'bg-brand-primary'}`}>÷</button>
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
            if (solveFor === 'c') return `c = ${Number(math.sqrt(Number(math.add(math.pow(valA, 2), math.pow(valB, 2))))).toFixed(4)}`;
            if (solveFor === 'a') {
                if (valC <= valB) return 'c must be > b';
                return `a = ${Number(math.sqrt(Number(math.subtract(math.pow(valC, 2), math.pow(valB, 2))))).toFixed(4)}`;
            }
            if (solveFor === 'b') {
                 if (valC <= valA) return 'c must be > a';
                return `b = ${Number(math.sqrt(Number(math.subtract(math.pow(valC, 2), math.pow(valA, 2))))).toFixed(4)}`;
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


const SymbolicMathTool = () => {
    const [expression, setExpression] = useState('x^2 + 2x + 1');
    const [variable, setVariable] = useState('x');

    const result = useMemo(() => {
        if (!expression.trim()) return { derivative: '', integral: '', error: null };
        try {
            const derivative = math.derivative(expression, variable);
            return {
                derivative: derivative.toString(),
                integral: "Use AI Assistant for complex integrals (Coming Soon to Native)",
                error: null
            };
        } catch (e) {
            return { derivative: '', integral: '', error: e instanceof Error ? e.message : 'Invalid expression' };
        }
    }, [expression, variable]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Input label="Expression" value={expression} onChange={e => setExpression(e.target.value)} placeholder="e.g. x^3 + x^2" />
                </div>
                <Input label="Variable" value={variable} onChange={e => setVariable(e.target.value)} />
            </div>
            {result.error && <p className="text-red-400 text-sm">{result.error}</p>}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-brand-bg p-6 rounded-xl space-y-2 border border-brand-border shadow-sm group hover:border-brand-primary transition-all">
                    <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest">Derivative d/d{variable}</h4>
                    <p className="text-2xl font-mono font-bold text-brand-text truncate">{result.derivative || 'Ready'}</p>
                </div>
                <div className="bg-brand-bg p-6 rounded-xl space-y-2 border border-brand-border shadow-sm opacity-50 grayscale">
                    <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest">Integral ∫ dx (Native Support Ltd)</h4>
                    <p className="text-sm italic">Coming soon... Try AI Tutor for integrals.</p>
                </div>
            </div>
            <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                <p className="text-xs text-brand-text-secondary flex items-baseline gap-2">
                    <span className="font-bold text-brand-primary">💡 PRO TIP:</span> 
                    Symbolic differentiation is calculated locally. For step-by-step proofs, use the **AI Tutor** in a split view.
                </p>
            </div>
        </div>
    );
};

const FinancialCalculator = () => {
    const [mode, setMode] = useState<'compound' | 'loan'>('compound');
    const [principal, setPrincipal] = useState('1000');
    const [rate, setRate] = useState('5');
    const [time, setTime] = useState('5');
    const [compounding, setCompounding] = useState('1'); 

    const result = useMemo(() => {
        const p = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const t = parseFloat(time);
        const n = parseFloat(compounding);

        if (isNaN(p) || isNaN(r) || isNaN(t)) return null;

        if (mode === 'compound') {
            const amount = p * Math.pow(1 + r / n, n * t);
            return { total: amount.toFixed(2), interest: (amount - p).toFixed(2) };
        } else {
            const monthlyRate = r / 12;
            const months = t * 12;
            const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
            return { total: (emi * months).toFixed(2), monthly: emi.toFixed(2), interest: (emi * months - p).toFixed(2) };
        }
    }, [principal, rate, time, compounding, mode]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
            <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border h-12">
                <button onClick={() => setMode('compound')} className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === 'compound' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>Compound Interest</button>
                <button onClick={() => setMode('loan')} className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === 'loan' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>Loan / EMI</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <Input label="Principal Amount ($)" value={principal} onChange={e => setPrincipal(e.target.value)} type="number" />
                <Input label="Interest Rate (%)" value={rate} onChange={e => setRate(e.target.value)} type="number" />
                <Input label="Term (Years)" value={time} onChange={e => setTime(e.target.value)} type="number" />
                {mode === 'compound' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest pl-1">Compounding</label>
                        <select value={compounding} onChange={e => setCompounding(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none">
                            <option value="1">Annually</option>
                            <option value="4">Quarterly</option>
                            <option value="12">Monthly</option>
                            <option value="365">Daily</option>
                        </select>
                    </div>
                )}
            </div>
            {result && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ResultCard title={`Total ${mode === 'compound' ? 'Value' : 'Repayment'}`} value={`$${result.total}`} />
                    {mode === 'loan' && <ResultCard title="Monthly EMI" value={`$${result.monthly}`} />}
                    <ResultCard title="Total Interest" value={`$${result.interest}`} />
                </div>
            )}
        </div>
    );
};

const TrigonometryCalculator = () => {
    const [angle, setAngle] = useState('45');
    const [unit, setUnit] = useState<'deg' | 'rad'>('deg');
    const [functionType, setFunctionType] = useState('sin');

    const result = useMemo(() => {
        const val = parseFloat(angle);
        if (isNaN(val)) return 'Invalid input';

        try {
            const valInRads = unit === 'deg' ? (val * Math.PI) / 180 : val;
            let res;

            switch (functionType) {
                case 'sin': res = Math.sin(valInRads); break;
                case 'cos': res = Math.cos(valInRads); break;
                case 'tan': res = Math.tan(valInRads); break;
                case 'asin': res = unit === 'deg' ? Math.asin(val) * 180 / Math.PI : Math.asin(val); break;
                case 'acos': res = unit === 'deg' ? Math.acos(val) * 180 / Math.PI : Math.acos(val); break;
                case 'atan': res = unit === 'deg' ? Math.atan(val) * 180 / Math.PI : Math.atan(val); break;
                default: return 'Error';
            }
            
            return Number(res).toFixed(6);
        } catch {
            return 'Error';
        }
    }, [angle, unit, functionType]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <Input label={functionType.startsWith('a') ? "Value" : "Angle"} type="number" value={angle} onChange={e => setAngle(e.target.value)} />
                <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest pl-1">{functionType.startsWith('a') ? 'Output Unit' : 'Input Unit'}</label>
                        <select value={unit} onChange={e => setUnit(e.target.value as 'deg' | 'rad')} className="w-full bg-brand-bg border border-brand-border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none h-[42px] mt-1">
                            <option value="deg">Degrees</option>
                            <option value="rad">Radians</option>
                        </select>
                    </div>
                    <div className="flex-1 space-y-1">
                         <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest pl-1">Function</label>
                         <select value={functionType} onChange={e => setFunctionType(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none h-[42px] mt-1">
                            <option value="sin">sin(x)</option>
                            <option value="cos">cos(x)</option>
                            <option value="tan">tan(x)</option>
                            <option value="asin">arcsin(x)</option>
                            <option value="acos">arccos(x)</option>
                            <option value="atan">arctan(x)</option>
                        </select>
                    </div>
                </div>
            </div>
            <ResultCard title="Result" value={String(result)} />
        </div>
    );
};

const LogarithmsCalculator = () => {
    // Basic
    const [value, setValue] = useState('100');
    const [base, setBase] = useState('10');

    // Antilog
    const [antiValue, setAntiValue] = useState('2');
    const [antiBase, setAntiBase] = useState('10');

    // Properties
    const [pBase, setPBase] = useState('2');
    const [pX, setPX] = useState('8');
    const [pY, setPY] = useState('4');
    const [power, setPower] = useState('3');

    const basicResult = useMemo(() => {
        const x = parseFloat(value);
        const b = parseFloat(base);

        if (isNaN(x) || x <= 0) return { log10: 'x must be > 0', ln: 'x must be > 0', logB: 'x must be > 0' };
        
        const res: any = {
            log10: Math.log10(x).toFixed(6),
            ln: Math.log(x).toFixed(6),
            logB: 'Invalid base'
        };

        if (!isNaN(b) && b > 0 && b !== 1) {
            res.logB = (Math.log(x) / Math.log(b)).toFixed(6);
        }

        return res;
    }, [value, base]);

    const antiResult = useMemo(() => {
        const y = parseFloat(antiValue);
        const b = parseFloat(antiBase);

        if (isNaN(y)) return { base10: 'Invalid', basee: 'Invalid', baseb: 'Invalid' };
        
        const res: any = {
            base10: Math.pow(10, y).toExponential(4),
            basee: Math.exp(y).toExponential(4),
            baseb: 'Invalid base'
        };

        if (!isNaN(b) && b > 0) {
            res.baseb = Math.pow(b, y).toExponential(4);
        }
        
        // Auto convert to standard formatting if not too large/small
        Object.keys(res).forEach(k => {
             if (res[k] !== 'Invalid base' && res[k] !== 'Invalid') {
                 const num = parseFloat(res[k]);
                 if (num >= 0.0001 && num <= 100000) {
                     res[k] = parseFloat(num.toFixed(6)).toString();
                 }
             }
        });

        return res;
    }, [antiValue, antiBase]);

    const propResult = useMemo(() => {
        const x = parseFloat(pX);
        const y = parseFloat(pY);
        const b = parseFloat(pBase);
        const p = parseFloat(power);
        
        if (isNaN(x) || x <= 0 || isNaN(y) || y <= 0 || isNaN(b) || b <= 0 || b === 1 || isNaN(p)) {
            return { product: 'Invalid inputs', quotient: 'Invalid inputs', powerR: 'Invalid inputs', baseChange: 'Invalid inputs' };
        }

        const logBase = (val: number) => Math.log(val) / Math.log(b);
        const lX = logBase(x);
        const lY = logBase(y);

        return {
            product: (lX + lY).toFixed(6),
            productDesc: `${lX.toFixed(2)} + ${lY.toFixed(2)}`,
            quotient: (lX - lY).toFixed(6),
            quotientDesc: `${lX.toFixed(2)} - ${lY.toFixed(2)}`,
            powerR: (p * lX).toFixed(6),
            powerDesc: `${p} × ${lX.toFixed(2)}`,
            baseChange: (Math.log(x) / Math.log(y)).toFixed(6),
            baseChangeDesc: `ln(${x.toFixed(2)}) / ln(${y.toFixed(2)})`
        };
    }, [pX, pY, pBase, power]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                     <Activity size={24} />
                 </div>
                 <div>
                     <h2 className="text-3xl font-black text-brand-text uppercase tracking-widest leading-none">Logarithms</h2>
                     <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black mt-1">Multi-Base & Properties</p>
                 </div>
             </div>

             <div className="bg-brand-surface border border-brand-border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Scaling size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4">Core Logarithms</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Value (x)" type="number" value={value} onChange={e => setValue(e.target.value)} />
                        <Input label="Custom Base (b)" type="number" value={base} onChange={e => setBase(e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border/50">
                        <ResultCard title="Common Log (base 10)" value={basicResult.log10} />
                        <ResultCard title="Natural Log (ln)" value={basicResult.ln} />
                        <ResultCard title={`Log\u208B(${value})`} description={`Base ${base || 'b'}`} value={basicResult.logB} />
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface border border-brand-border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Superscript size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-[10px] font-black text-[#fbbc05] uppercase tracking-[0.3em] mb-4">Antilogarithms / Exponents</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Exponent (y)" type="number" value={antiValue} onChange={e => setAntiValue(e.target.value)} />
                        <Input label="Custom Base (b)" type="number" value={antiBase} onChange={e => setAntiBase(e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border/50">
                        <ResultCard title="10^y" description="Common Antilog" value={antiResult.base10} />
                        <ResultCard title="e^y" description="Natural Antilog" value={antiResult.basee} />
                        <ResultCard title={`${antiBase || 'b'}^${antiValue || 'y'}`} description={`Base ${antiBase || 'b'}`} value={antiResult.baseb} />
                    </div>
                </div>
            </div>

             <div className="bg-brand-surface border border-brand-border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Atom size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-[10px] font-black text-[#ea4335] uppercase tracking-[0.3em] mb-4">Properties & Laws</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Base (b)" type="number" value={pBase} onChange={e => setPBase(e.target.value)} />
                        <Input label="Value (X)" type="number" value={pX} onChange={e => setPX(e.target.value)} />
                        <Input label="Value (Y)" type="number" value={pY} onChange={e => setPY(e.target.value)} />
                        <Input label="Power (p)" type="number" value={power} onChange={e => setPower(e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-brand-border/50">
                        <ResultCard title="Product: logь(X · Y)" description={`= logь(X) + logь(Y) = ${propResult.productDesc}`} value={propResult.product} />
                        <ResultCard title="Quotient: logь(X / Y)" description={`= logь(X) - logь(Y) = ${propResult.quotientDesc}`} value={propResult.quotient} />
                        <ResultCard title="Power: logь(X^p)" description={`= p · logь(X) = ${propResult.powerDesc}`} value={propResult.powerR} />
                        <ResultCard title="Change of Base: logʏ(X)" description={`= ln(X) / ln(Y) = ${propResult.baseChangeDesc}`} value={propResult.baseChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const MathTools: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
    const { user } = useAuth();
    const [activeCalc, setActiveCalc] = useState('dashboard');

    const calculatorList = useMemo(() => [
        { id: 'statistics', label: 'Summary', Icon: BarChart, category: 'Statistics' },
        { id: 'stddev', label: 'Std Dev', Icon: BarChartHorizontal, category: 'Statistics' },
        { id: 'confidence', label: 'Confidence', Icon: Scaling, category: 'Statistics' },
        { id: 'matrix', label: 'Matrix', Icon: Table, category: 'Linear Algebra' },
        { id: 'equations', label: 'Equations', Icon: FunctionSquare, category: 'Algebra' },
        { id: 'symbolic', label: 'Symbolic', Icon: Activity, category: 'Calculus' },
        { id: 'percentage', label: 'Percentage', Icon: Percent, category: 'Utilities' },
        { id: 'rounding', label: 'Rounding', Icon: Eraser, category: 'Utilities' },
        { id: 'ratio', label: 'Ratio', Icon: GitCompareArrows, category: 'Algebra' },
        { id: 'fractions', label: 'Fractions', Icon: DivideCircle, category: 'Arithmetic' },
        { id: 'factoring', label: 'Factoring', Icon: Atom, category: 'Arithmetic' },
        { id: 'perm-comb', label: 'Combinatorics', Icon: ArrowRightLeft, category: 'Discrete' },
        { id: 'gcf-lcm', label: 'GCD / LCM', Icon: Sigma, category: 'Arithmetic' },
        { id: 'prime', label: 'Primes', Icon: ShieldCheck, category: 'Arithmetic' },
        { id: 'powers', label: 'Powers', Icon: Superscript, category: 'Arithmetic' },
        { id: 'logarithms', label: 'Logarithms', Icon: Activity, category: 'Arithmetic' },
        { id: 'trigonometry', label: 'Trigonometry', Icon: Compass, category: 'Geometry' },
        { id: 'pythagorean', label: 'Pythagorean', Icon: Triangle, category: 'Geometry' },
        { id: 'triangle', label: 'Triangles', Icon: Triangle, category: 'Geometry' },
        { id: 'circle', label: 'Circles', Icon: Triangle, category: 'Geometry' },
        { id: 'distance', label: 'Distance', Icon: Ruler, category: 'Geometry' },
        { id: 'random', label: 'Random', Icon: Shuffle, category: 'Utilities' },
        { id: 'financial', label: 'Finance', Icon: Landmark, category: 'Utilities' },
        { id: 'formulas', label: 'Handbook', Icon: Book, category: 'Knowledge' },
    ], []);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredCalculators = useMemo(() => {
        return calculatorList.filter(calc => {
            const matchesSearch = calc.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                calc.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = (selectedCategory === null || selectedCategory === 'All') ? true : calc.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, calculatorList]);

    const categories = ['All', ...Array.from(new Set(calculatorList.map(c => c.category)))];

    const renderCalculator = () => {
        const currentCalc = calculatorList.find(c => c.id === activeCalc);
        return (
            <div className="space-y-6">
                <button 
                    onClick={() => setActiveCalc('dashboard')} 
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary hover:text-brand-primary transition-all group"
                >
                    <div className="w-8 h-px bg-brand-border group-hover:w-12 group-hover:bg-brand-primary transition-all"></div>
                    Return to Control Center {currentCalc ? ` / ${currentCalc.label}` : ''}
                </button>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                >
                    {(() => {
                        switch (activeCalc) {
                            case 'matrix': return <MatrixCalculator />;
                            case 'statistics': return <StatisticsCalculator />;
                            case 'equations': return <EquationSolverTool />;
                            case 'formulas': return <FormulaLibrary />;
                            case 'symbolic': return <SymbolicMathTool />;
                            case 'financial': return <FinancialCalculator />;
                            case 'percentage': return <PercentageCalculatorTool />;
                            case 'gcf-lcm': return <GcfLcmCalculator />;
                            case 'prime': return <PrimeNumberCalculator />;
                            case 'fractions': return <FractionCalculator />;
                            case 'powers': return <PowersCalculator />;
                            case 'logarithms': return <LogarithmsCalculator />;
                            case 'trigonometry': return <TrigonometryCalculator />;
                            case 'pythagorean': return <PythagoreanCalculator />;
                            case 'distance': return <DistanceCalculator />;
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
                    })()}
                </motion.div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            <AnimatePresence mode="wait">
                {activeCalc === 'dashboard' ? (
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {/* Hero Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">v4.0.2 Stable Build</span>
                                </div>
                                <h1 className="text-7xl md:text-9xl font-black text-brand-text tracking-tighter uppercase italic leading-[0.8]">
                                    Compute<br/>
                                    <span className="text-brand-primary">Core</span>
                                </h1>
                                <p className="text-brand-text-secondary font-mono text-[11px] uppercase tracking-[0.4em] pl-1">
                                    Advanced Symbolic Processing Terminal
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-brand-surface border border-brand-border p-2 rounded-2xl shadow-xl">
                                <div className="px-6 py-4 flex flex-col items-center border-r border-brand-border">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary opacity-50">Modules</span>
                                    <span className="text-2xl font-black text-brand-text font-mono tracking-tighter">{calculatorList.length}</span>
                                </div>
                                <div className="px-6 py-4 flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary opacity-50">Uptime</span>
                                    <span className="text-2xl font-black text-brand-text font-mono tracking-tighter italic">99.9%</span>
                                </div>
                            </div>
                        </div>

                        {/* Control Interface */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-accent rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
                                <div className="relative bg-brand-surface border border-brand-border rounded-[2rem] p-4 flex items-center">
                                    <Search className="ml-4 text-brand-text-secondary opacity-30" size={24} />
                                    <input 
                                        type="text"
                                        placeholder="SEARCH SYMBOLIC ENGINES..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent px-6 py-4 text-2xl font-black italic uppercase tracking-tighter text-brand-text outline-none placeholder:opacity-5 placeholder:not-italic"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                            (selectedCategory === null && cat === 'All') || selectedCategory === cat
                                            ? 'bg-brand-primary border-brand-primary text-white shadow-xl scale-105' 
                                            : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:border-brand-primary hover:text-brand-text'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Engineering Module Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredCalculators.map((calc, idx) => (
                                    <motion.button
                                        layout
                                        key={calc.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                                        onClick={() => setActiveCalc(calc.id)}
                                        className="group aspect-square bg-brand-bg border border-brand-border rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-5 hover:border-brand-primary hover:shadow-[0_0_50px_-12px_rgba(var(--brand-primary-rgb),0.3)] transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                        <div className="p-5 bg-brand-surface rounded-[1.5rem] group-hover:scale-110 group-hover:rotate-3 transition-transform relative">
                                            <calc.Icon size={32} className="text-brand-primary" />
                                            <div className="absolute inset-0 bg-brand-primary/10 rounded-[1.5rem] animate-ping group-hover:block hidden"></div>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-brand-text uppercase tracking-widest">{calc.label}</span>
                                            <span className="block text-[8px] font-medium text-brand-text-secondary uppercase tracking-[0.3em] mt-1 italic">{calc.category}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Global CTA */}
                        {!user && (
                            <motion.div 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-12 bg-brand-surface border-2 border-brand-primary/20 rounded-[3rem] p-12 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-brand-primary/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                                    <div className="space-y-4">
                                        <h3 className="text-5xl font-black text-brand-text tracking-tighter uppercase italic leading-none">
                                            Sync Your <span className="text-brand-primary underline decoration-4 decoration-brand-primary/30">Workspace</span>
                                        </h3>
                                        <p className="text-brand-text-secondary uppercase text-xs font-bold tracking-widest max-w-lg">
                                            Register your core identity to preserve calculation history and custom symbolic variables across terminal sessions.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={onLoginClick}
                                        className="px-12 py-6 bg-brand-text text-brand-bg font-black uppercase tracking-[0.4em] text-[10px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-text/20 flex items-center gap-4 group"
                                    >
                                        Establish Connection
                                        <ArrowRightLeft className="group-hover:translate-x-2 transition-transform" size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="calculator"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, type: 'spring', damping: 25 }}
                    >
                        {renderCalculator()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MathTools;