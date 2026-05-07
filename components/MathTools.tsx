


import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';
import { BarChart, FunctionSquare, Table, Percent, Sigma, ShieldCheck, Superscript, DivideCircle, Triangle, Ruler, Shuffle, BarChartHorizontal, Scaling, Eraser, GitCompareArrows, Atom, ArrowRightLeft, Book, Landmark, Activity, Compass } from 'lucide-react';

// Import standalone components
import MatrixCalculator from './Matrix';
import StatisticsCalculator from './Statistics';
import EquationSolverTool from './EquationSolver';
import FormulaLibrary from './FormulaLibrary';


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

    const r = parseFloat(radius);
    const diameter = !isNaN(r) ? (2 * r).toFixed(2) : '';
    const circumference = !isNaN(r) ? (2 * Math.PI * r).toFixed(2) : '';
    const area = !isNaN(r) ? (Math.PI * r * r).toFixed(2) : '';
    
    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <div className="p-2 text-center text-sm bg-brand-bg rounded-lg">Changing any value will calculate the others.</div>
             <div className="grid md:grid-cols-2 gap-4">
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
        </div>
    );
};

const StandardDeviationCalculator = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8');

    const stats = useMemo(() => {
        if (dataStr.trim() === '') return { error: null, data: null };

        try {
            const data = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid number.`);
                return num;
            });

            if (data.length < 2) {
                return { error: "Please enter at least two numbers.", data: null };
            }

            return {
                error: null,
                data: {
                    count: data.length,
                    sum: math.sum(data),
                    mean: math.mean(data),
                    populationStdDev: math.std(data, 'uncorrected'),
                    sampleStdDev: math.std(data, 'unbiased'),
                    populationVariance: math.variance(data, 'uncorrected'),
                    sampleVariance: math.variance(data, 'unbiased'),
                }
            };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid data format.";
            return { error: msg, data: null };
        }
    }, [dataStr]);

    const formatValue = (value: number | string | bigint | undefined | any) => {
        if (typeof value === 'number') return parseFloat(value.toFixed(5)).toString();
        if (typeof value === 'bigint') return value.toString();
        if (value === undefined) return '--';
        return String(value);
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <div className="mb-4">
                <label htmlFor="stddev-data-input" className="block text-lg font-medium mb-2">Enter data (comma or space-separated)</label>
                <textarea id="stddev-data-input" value={dataStr} onChange={e => setDataStr(e.target.value)} rows={4} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono" />
            </div>
            {stats.error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{stats.error}</div>}
            <div className="bg-brand-bg p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-accent">Results</h3>
                {stats.data ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Count:</span><span className="font-mono font-bold">{formatValue(stats.data.count)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sum:</span><span className="font-mono font-bold">{formatValue(stats.data.sum)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Mean:</span><span className="font-mono font-bold">{formatValue(stats.data.mean)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sample Std Dev (n-1):</span><span className="font-mono font-bold">{formatValue(stats.data.sampleStdDev)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Population Std Dev (n):</span><span className="font-mono font-bold">{formatValue(stats.data.populationStdDev)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Sample Variance:</span><span className="font-mono font-bold">{formatValue(stats.data.sampleVariance)}</span></div>
                        <div className="flex justify-between border-b border-gray-700 py-1"><span className="font-semibold text-brand-text-secondary">Population Variance:</span><span className="font-mono font-bold">{formatValue(stats.data.populationVariance)}</span></div>
                    </div>
                ) : <p className="text-brand-text-secondary">Enter data for analysis.</p>}
            </div>
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
                    <select value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border h-[42px]">
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
        <input type="number" value={n} onChange={e=>setN(e.target.value)} className="w-20 bg-gray-900/70 p-1 rounded-md border border-brand-border text-center" />
        <hr className="w-20 my-1 border-brand-text" />
        <input type="number" value={d} onChange={e=>setD(e.target.value)} className="w-20 bg-gray-900/70 p-1 rounded-md border border-brand-border text-center" />
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

const BaseNCalculator = () => {
    const [val, setVal] = useState('255');
    const [fromBase, setFromBase] = useState<number>(10);

    const conversions = useMemo(() => {
        try {
            const decimal = parseInt(val, fromBase);
            if (isNaN(decimal)) return null;
            return {
                dec: decimal.toString(10),
                hex: decimal.toString(16).toUpperCase(),
                bin: decimal.toString(2),
                oct: decimal.toString(8)
            };
        } catch { return null; }
    }, [val, fromBase]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Input label="Value" value={val} onChange={e => setVal(e.target.value)} placeholder="Enter number..." />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest pl-1">From Base</label>
                    <select value={fromBase} onChange={e => setFromBase(parseInt(e.target.value))} className="w-full bg-brand-bg border border-brand-border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none">
                        <option value="10">Decimal (10)</option>
                        <option value="16">Hex (16)</option>
                        <option value="2">Binary (2)</option>
                        <option value="8">Octal (8)</option>
                    </select>
                </div>
            </div>
            {conversions && (
                <div className="grid grid-cols-2 gap-4">
                    <ResultCard title="DEC" value={conversions.dec} />
                    <ResultCard title="HEX" value={conversions.hex} />
                    <ResultCard title="BIN" value={conversions.bin} />
                    <ResultCard title="OCT" value={conversions.oct} />
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
    const [value, setValue] = useState('100');
    const [base, setBase] = useState('10');

    const result = useMemo(() => {
        const x = parseFloat(value);
        const b = parseFloat(base);

        if (isNaN(x) || x <= 0) return { "log10": 'x must be > 0', "ln": 'x must be > 0', "logB": 'x must be > 0' };
        
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

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <Input label="Value (x)" type="number" value={value} onChange={e => setValue(e.target.value)} />
                <Input label="Custom Base (b)" type="number" value={base} onChange={e => setBase(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <ResultCard title="Common Log (base 10)" value={result.log10} />
                <ResultCard title="Natural Log (ln)" value={result.ln} />
                <ResultCard title={`Log base ${base || 'b'}`} value={result.logB} />
            </div>
        </div>
    );
};

// --- Main Component ---
const MathTools: React.FC = () => {
    const { user, signInWithGoogle } = useAuth();
    const [activeCalc, setActiveCalc] = useState('statistics');

    const calculatorList = [
        { id: 'statistics', label: 'Statistics', Icon: BarChart },
        { id: 'matrix', label: 'Matrix', Icon: Table },
        { id: 'stddev', label: 'Std Dev', Icon: BarChartHorizontal },
        { id: 'confidence', label: 'Confidence', Icon: Scaling },
        { id: 'equations', label: 'Equations', Icon: FunctionSquare },
        { id: 'percentage', label: 'Percentage', Icon: Percent },
        { id: 'rounding', label: 'Rounding', Icon: Eraser },
        { id: 'ratio', label: 'Ratio', Icon: GitCompareArrows },
        { id: 'fractions', label: 'Fractions', Icon: DivideCircle },
        { id: 'factoring', label: 'Factoring', Icon: Atom },
        { id: 'perm-comb', label: 'Combinatorics', Icon: ArrowRightLeft },
        { id: 'gcf-lcm', label: 'GCD/LCM', Icon: Sigma },
        { id: 'prime', label: 'Primes', Icon: ShieldCheck },
        { id: 'powers', label: 'Powers', Icon: Superscript },
        { id: 'logarithms', label: 'Logarithms', Icon: Activity },
        { id: 'trigonometry', label: 'Trigonometry', Icon: Compass },
        { id: 'pythagorean', label: 'Triangle', Icon: Triangle },
        { id: 'distance', label: 'Distance', Icon: Ruler },
        { id: 'random', label: 'Random', Icon: Shuffle },
        { id: 'symbolic', label: 'Symbolic', Icon: Activity },
        { id: 'financial', label: 'Finance', Icon: Landmark },
        { id: 'formulas', label: 'Formulas', Icon: Book },
    ];

    const renderCalculator = () => {
        switch (activeCalc) {
            case 'matrix': return <MatrixCalculator />;
            case 'statistics': return <StatisticsCalculator />;
            case 'equations': return <EquationSolverTool />;
            case 'formulas': return <FormulaLibrary />;
            case 'symbolic': return <SymbolicMathTool />;
            case 'financial': return <FinancialCalculator />;
            case 'basen': return <BaseNCalculator />;
            case 'percentage': return <PercentageCalculatorTool />;
            case 'gcf-lcm': return <GcfLcmCalculator />;
            case 'prime': return <PrimeNumberCalculator />;
            case 'fractions': return <FractionCalculator />;
            case 'powers': return <PowersCalculator />;
            case 'logarithms': return <LogarithmsCalculator />;
            case 'trigonometry': return <TrigonometryCalculator />;
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
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-primary tracking-tighter">Math Tools</h2>
                    <p className="text-brand-text-secondary">Professional computation suite for elite engineers.</p>
                </div>
                {!user && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={signInWithGoogle}
                        className="flex items-center gap-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl group cursor-pointer hover:bg-brand-primary/10 transition-all"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none mb-1">Cloud Sync Disabled</p>
                            <p className="text-xs text-brand-text-secondary group-hover:text-brand-text transition-colors">Sign in to sync your workspace.</p>
                        </div>
                    </motion.div>
                )}
            </div>
            
            <div className="flex justify-start overflow-x-auto gap-2 mb-10 pb-4 scrollbar-hide no-scrollbar">
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

            <motion.div 
                key={activeCalc} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
            >
                {renderCalculator()}

                {!user && (
                    <div className="mt-12 p-8 md:p-12 rounded-[3.5rem] bg-brand-surface border border-brand-border flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 flex items-center gap-6">
                             <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                <Landmark size={32} />
                             </div>
                             <div>
                                <h4 className="font-black text-brand-text text-2xl tracking-tight mb-2">Build your math vault.</h4>
                                <p className="text-brand-text-secondary max-w-md font-light">Join QuantumCalc to persist these calculations, access advanced AI tutoring, and sync your full workspace.</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => signInWithGoogle().catch(console.error)}
                            className="relative z-10 w-full md:w-auto px-10 py-5 bg-brand-text text-brand-bg rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl"
                        >
                            Sign In to Sync
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MathTools;