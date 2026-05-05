import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  GraduationCap, 
  Timer, 
  Triangle, 
  Atom, 
  BookOpen, 
  BrainCircuit,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Send,
  Quote,
  Layers,
  CheckSquare,
  Search,
  FlaskConical,
  Copy,
  Download,
  StickyNote,
  Loader2,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PeriodicTable from './PeriodicTable';
import { useAuth } from './AuthProvider';

// --- UI Components ---
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-5 py-3 flex items-center gap-2.5 rounded-xl font-bold transition-all duration-300 text-sm ${
            isActive 
                ? 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20 scale-105' 
                : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const GRADE_POINTS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
};

// --- 1. GPA Calculator ---
const GPACalculator = () => {
    const [courses, setCourses] = useState([{ id: 1, name: '', grade: 'A', credits: 3 }]);
    const [targetGrade, setTargetGrade] = useState('');
    const [currentGrade, setCurrentGrade] = useState('');
    const [finalWeight, setFinalWeight] = useState('');

    const addCourse = () => setCourses([...courses, { id: Date.now(), name: '', grade: 'A', credits: 3 }]);
    const removeCourse = (id: number) => setCourses(courses.filter(c => c.id !== id));
    const updateCourse = (id: number, field: string, value: any) => {
        setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const gpa = useMemo(() => {
        let totalPoints = 0;
        let totalCredits = 0;
        courses.forEach(c => {
            const credits = Number(c.credits) || 0;
            totalPoints += (GRADE_POINTS[c.grade] || 0) * credits;
            totalCredits += credits;
        });
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    }, [courses]);

    const requiredFinal = useMemo(() => {
        const target = parseFloat(targetGrade);
        const current = parseFloat(currentGrade);
        const weight = parseFloat(finalWeight) / 100;
        if (isNaN(target) || isNaN(current) || isNaN(weight) || weight === 0) return null;
        const required = (target - current * (1 - weight)) / weight;
        return required.toFixed(2);
    }, [targetGrade, currentGrade, finalWeight]);

    return (
        <div className="space-y-8">
            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary">Semester GPA Calculator</h3>
                <div className="space-y-4">
                    {courses.map((course, index) => (
                        <div key={course.id} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-brand-text-secondary mb-1">Course Name</label>
                                <input type="text" value={course.name} onChange={e => updateCourse(course.id, 'name', e.target.value)} placeholder={`Course ${index + 1}`} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-brand-text-secondary mb-1">Grade</label>
                                <select value={course.grade} onChange={e => updateCourse(course.id, 'grade', e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none">
                                    {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-brand-text-secondary mb-1">Credits</label>
                                <input type="number" value={course.credits} onChange={e => updateCourse(course.id, 'credits', e.target.value)} min="0" step="0.5" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                            </div>
                            <button onClick={() => removeCourse(course.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors mb-1">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addCourse} className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 text-sm font-medium">
                        <Plus size={16} /> Add Course
                    </button>
                </div>
                <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-center">
                    <div className="text-sm text-brand-text-secondary">Estimated Semester GPA</div>
                    <div className="text-4xl font-bold text-brand-primary">{gpa}</div>
                </div>
            </div>

            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary">Final Grade Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Current Grade (%)</label>
                        <input type="number" value={currentGrade} onChange={e => setCurrentGrade(e.target.value)} placeholder="e.g. 85" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Target Grade (%)</label>
                        <input type="number" value={targetGrade} onChange={e => setTargetGrade(e.target.value)} placeholder="e.g. 90" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Final Exam Weight (%)</label>
                        <input type="number" value={finalWeight} onChange={e => setFinalWeight(e.target.value)} placeholder="e.g. 20" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    </div>
                </div>
                {requiredFinal !== null && (
                    <div className={`p-4 rounded-lg text-center border ${parseFloat(requiredFinal) > 100 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        <div className="text-sm mb-1">You need to score</div>
                        <div className="text-3xl font-bold">{requiredFinal}%</div>
                        <div className="text-sm mt-1">on your final exam to get a {targetGrade}% in the class.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 2. Pomodoro Timer ---
const PomodoroTimer = () => {
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    const modes = {
        work: { label: 'Pomodoro', time: 25 * 60, color: 'text-rose-500' },
        shortBreak: { label: 'Short Break', time: 5 * 60, color: 'text-emerald-500' },
        longBreak: { label: 'Long Break', time: 15 * 60, color: 'text-blue-500' }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
        setMode(newMode);
        setTimeLeft(modes[newMode].time);
        setIsActive(false);
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(modes[mode].time);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100;

    return (
        <div className="bg-brand-surface/50 p-8 rounded-lg max-w-md mx-auto text-center">
            <div className="flex justify-center gap-2 mb-8">
                {(Object.keys(modes) as Array<keyof typeof modes>).map(m => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === m ? 'bg-brand-primary text-white' : 'bg-gray-800 text-brand-text-secondary hover:bg-gray-700'}`}
                    >
                        {modes[m].label}
                    </button>
                ))}
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="128" cy="128" r="120" className="stroke-gray-800" strokeWidth="8" fill="none" />
                    <circle 
                        cx="128" cy="128" r="120" 
                        className={`stroke-current ${modes[mode].color} transition-all duration-1000 ease-linear`} 
                        strokeWidth="8" fill="none" 
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className={`text-6xl font-bold font-mono ${modes[mode].color}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button 
                    onClick={toggleTimer}
                    className="w-16 h-16 rounded-full bg-brand-primary hover:bg-brand-primary/90 flex items-center justify-center text-white transition-transform hover:scale-105"
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
                <button 
                    onClick={resetTimer}
                    className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-brand-text transition-transform hover:scale-105"
                >
                    <RotateCcw size={28} />
                </button>
            </div>
        </div>
    );
};

// --- 3. Geometry Solver ---
const GeometrySolver = () => {
    const [shape, setShape] = useState('circle');
    const [inputs, setInputs] = useState<Record<string, string>>({});

    const shapes = {
        circle: { name: 'Circle', params: ['Radius (r)'], calc: (r: number) => ({ Area: Math.PI * r * r, Circumference: 2 * Math.PI * r }) },
        rectangle: { name: 'Rectangle', params: ['Length (l)', 'Width (w)'], calc: (l: number, w: number) => ({ Area: l * w, Perimeter: 2 * (l + w) }) },
        triangle: { name: 'Triangle', params: ['Base (b)', 'Height (h)'], calc: (b: number, h: number) => ({ Area: 0.5 * b * h }) },
        sphere: { name: 'Sphere', params: ['Radius (r)'], calc: (r: number) => ({ Volume: (4/3) * Math.PI * Math.pow(r, 3), 'Surface Area': 4 * Math.PI * r * r }) },
        cylinder: { name: 'Cylinder', params: ['Radius (r)', 'Height (h)'], calc: (r: number, h: number) => ({ Volume: Math.PI * r * r * h, 'Surface Area': 2 * Math.PI * r * (r + h) }) },
    };

    const currentShape = shapes[shape as keyof typeof shapes];

    const results = useMemo(() => {
        const args = currentShape.params.map(p => parseFloat(inputs[p] || '0'));
        if (args.some(isNaN) || args.some(a => a <= 0)) return null;
        return (currentShape.calc as any)(...args);
    }, [inputs, currentShape]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(shapes).map(([key, val]) => (
                    <button
                        key={key}
                        onClick={() => { setShape(key); setInputs({}); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${shape === key ? 'bg-brand-primary text-white' : 'bg-gray-800 text-brand-text-secondary hover:bg-gray-700'}`}
                    >
                        {val.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {currentShape.params.map(param => (
                        <div key={param}>
                            <label className="block text-sm text-brand-text-secondary mb-1">{param}</label>
                            <input 
                                type="number" 
                                value={inputs[param] || ''} 
                                onChange={e => setInputs({...inputs, [param]: e.target.value})}
                                className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none"
                                min="0"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-brand-border flex flex-col justify-center">
                    <h4 className="text-lg font-semibold mb-4 text-brand-primary">Results</h4>
                    {results ? (
                        <div className="space-y-3">
                            {Object.entries(results).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center border-b border-brand-border/50 pb-2">
                                    <span className="text-brand-text-secondary">{key}</span>
                                    <span className="font-mono font-bold text-lg">{(val as number).toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-brand-text-secondary text-sm italic text-center">
                            Enter valid positive numbers to see results.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ATOMIC_WEIGHTS: Record<string, number> = {
    H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, 
    F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, 
    Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87, I: 126.90, 
    Au: 196.97, Hg: 200.59, Pb: 207.2, U: 238.03, Pu: 244
};

// --- 4. Science Tools ---
const ScienceTools = () => {
    // Molar Mass
    const [formula, setFormula] = useState('');

    const molarMass = useMemo(() => {
        if (!formula) return null;
        try {
            const regex = /([A-Z][a-z]*)(\d*)/g;
            let match;
            let mass = 0;
            let valid = false;
            
            while ((match = regex.exec(formula)) !== null) {
                valid = true;
                const element = match[1];
                const count = match[2] ? parseInt(match[2], 10) : 1;
                
                if (ATOMIC_WEIGHTS[element]) {
                    mass += ATOMIC_WEIGHTS[element] * count;
                } else {
                    return { error: `Unknown element: ${element}` };
                }
            }
            return valid ? { mass: mass.toFixed(3) } : { error: 'Invalid formula' };
        } catch (e) {
            return { error: 'Error calculating mass' };
        }
    }, [formula]);

    // Ideal Gas Law
    const [p, setP] = useState('');
    const [v, setV] = useState('');
    const [n, setN] = useState('');
    const [t, setT] = useState('');
    const [solveFor, setSolveFor] = useState('P');
    const R = 0.08206; // L*atm/(mol*K)

    const idealResult = useMemo(() => {
        const pNum = parseFloat(p);
        const vNum = parseFloat(v);
        const nNum = parseFloat(n);
        const tNum = parseFloat(t);

        try {
            if (solveFor === 'P') {
                if (isNaN(nNum) || isNaN(tNum) || isNaN(vNum) || vNum === 0) return null;
                return `${((nNum * R * tNum) / vNum).toFixed(4)} atm`;
            }
            if (solveFor === 'V') {
                if (isNaN(nNum) || isNaN(tNum) || isNaN(pNum) || pNum === 0) return null;
                return `${((nNum * R * tNum) / pNum).toFixed(4)} L`;
            }
            if (solveFor === 'n') {
                if (isNaN(pNum) || isNaN(vNum) || isNaN(tNum) || tNum === 0) return null;
                return `${((pNum * vNum) / (R * tNum)).toFixed(4)} mol`;
            }
            if (solveFor === 'T') {
                if (isNaN(pNum) || isNaN(vNum) || isNaN(nNum) || nNum === 0) return null;
                return `${((pNum * vNum) / (nNum * R)).toFixed(4)} K`;
            }
        } catch (e) {
            return 'Error';
        }
        return null;
    }, [p, v, n, t, solveFor]);

    return (
        <div className="space-y-8">
            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <Atom size={24} /> Molar Mass Calculator
                </h3>
                <div className="max-w-md">
                    <label className="block text-sm text-brand-text-secondary mb-1">Chemical Formula (e.g., H2O, C6H12O6, NaCl)</label>
                    <input 
                        type="text" 
                        value={formula} 
                        onChange={e => setFormula(e.target.value)}
                        placeholder="Enter formula..."
                        className="w-full bg-gray-900/70 p-3 rounded border border-brand-border focus:border-brand-primary outline-none font-mono text-lg mb-4"
                    />
                    
                    {molarMass && (
                        <div className={`p-4 rounded-lg ${molarMass.error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {molarMass.error ? (
                                <span>{molarMass.error}</span>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Molar Mass:</span>
                                    <span className="text-2xl font-bold font-mono">{molarMass.mass} g/mol</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <FlaskConical size={24} /> Ideal Gas Law Calculator (PV = nRT)
                </h3>

                
                <div className="mb-6">
                    <label className="block text-sm text-brand-text-secondary mb-2">Solve For:</label>
                    <div className="flex gap-2">
                        {['P', 'V', 'n', 'T'].map(val => (
                            <button
                                key={val}
                                onClick={() => setSolveFor(val)}
                                className={`px-4 py-2 rounded-md font-bold transition-all ${solveFor === val ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-text-secondary hover:bg-brand-border'}`}
                            >
                                {val === 'P' ? 'Pressure (P)' : val === 'V' ? 'Volume (V)' : val === 'n' ? 'Moles (n)' : 'Temp (T)'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {solveFor !== 'P' && (
                        <div>
                            <label className="block text-sm text-brand-text-secondary mb-1">Pressure (atm)</label>
                            <input type="number" value={p} onChange={e => setP(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                        </div>
                    )}
                    {solveFor !== 'V' && (
                        <div>
                            <label className="block text-sm text-brand-text-secondary mb-1">Volume (L)</label>
                            <input type="number" value={v} onChange={e => setV(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                        </div>
                    )}
                    {solveFor !== 'n' && (
                        <div>
                            <label className="block text-sm text-brand-text-secondary mb-1">Moles (n)</label>
                            <input type="number" value={n} onChange={e => setN(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                        </div>
                    )}
                    {solveFor !== 'T' && (
                        <div>
                            <label className="block text-sm text-brand-text-secondary mb-1">Temperature (K)</label>
                            <input type="number" value={t} onChange={e => setT(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                        </div>
                    )}
                </div>

                {idealResult !== null && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <div className="text-sm mb-1">Calculated {solveFor === 'P' ? 'Pressure' : solveFor === 'V' ? 'Volume' : solveFor === 'n' ? 'Moles' : 'Temperature'}:</div>
                        <div className="text-3xl font-bold font-mono">{idealResult}</div>
                    </div>
                )}
            </div>

            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <FlaskConical size={24} /> Combined Gas Law (P₁V₁/T₁ = P₂V₂/T₂)
                </h3>
                <p className="text-sm text-brand-text-secondary mb-6">Enter 5 of the 6 variables to calculate the 6th.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Initial State */}
                    <div className="space-y-4 bg-gray-900/40 p-4 rounded-xl border border-brand-border/50">
                        <h4 className="font-bold text-brand-text mb-2">Initial State (1)</h4>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">P₁ (Pressure)</label>
                            <input type="number" id="p1" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="e.g. 1.0" />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">V₁ (Volume)</label>
                            <input type="number" id="v1" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="e.g. 2.0" />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">T₁ (Temp in K)</label>
                            <input type="number" id="t1" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="e.g. 298" />
                        </div>
                    </div>
                    {/* Final State */}
                    <div className="space-y-4 bg-gray-900/40 p-4 rounded-xl border border-brand-border/50">
                        <h4 className="font-bold text-brand-text mb-2">Final State (2)</h4>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">P₂ (Pressure)</label>
                            <input type="number" id="p2" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="Leave empty to solve for P₂" />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">V₂ (Volume)</label>
                            <input type="number" id="v2" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="Leave empty to solve for V₂" />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-secondary mb-1">T₂ (Temp in K)</label>
                            <input type="number" id="t2" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="Leave empty to solve for T₂" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-center">
                    <button onClick={() => {
                        const p1 = parseFloat((document.getElementById('p1') as HTMLInputElement).value);
                        const v1 = parseFloat((document.getElementById('v1') as HTMLInputElement).value);
                        const t1 = parseFloat((document.getElementById('t1') as HTMLInputElement).value);
                        const p2 = parseFloat((document.getElementById('p2') as HTMLInputElement).value);
                        const v2 = parseFloat((document.getElementById('v2') as HTMLInputElement).value);
                        const t2 = parseFloat((document.getElementById('t2') as HTMLInputElement).value);
                        
                        let res = '';
                        let count = 0;
                        if (!isNaN(p1)) count++; if (!isNaN(v1)) count++; if (!isNaN(t1)) count++;
                        if (!isNaN(p2)) count++; if (!isNaN(v2)) count++; if (!isNaN(t2)) count++;
                        
                        if (count !== 5) {
                            alert("Please enter exactly 5 values.");
                            return;
                        }
                        
                        // P1V1/T1 = P2V2/T2
                        if (isNaN(p1)) res = `P₁ = ${((p2 * v2 * t1) / (t2 * v1)).toFixed(4)}`;
                        else if (isNaN(v1)) res = `V₁ = ${((p2 * v2 * t1) / (t2 * p1)).toFixed(4)}`;
                        else if (isNaN(t1)) res = `T₁ = ${((p1 * v1 * t2) / (p2 * v2)).toFixed(4)}`;
                        else if (isNaN(p2)) res = `P₂ = ${((p1 * v1 * t2) / (t1 * v2)).toFixed(4)}`;
                        else if (isNaN(v2)) res = `V₂ = ${((p1 * v1 * t2) / (t1 * p2)).toFixed(4)}`;
                        else if (isNaN(t2)) res = `T₂ = ${((p2 * v2 * t1) / (p1 * v1)).toFixed(4)}`;

                        const resultDiv = document.getElementById('combined-result');
                        if (resultDiv) {
                            resultDiv.innerText = res;
                            resultDiv.parentElement?.classList.remove('hidden');
                        }
                    }} className="w-full md:w-auto px-8 py-3 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20">
                        Calculate Unknown Variable
                    </button>
                </div>
                <div className="hidden mt-6">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
                        <div className="text-sm mb-1">Result:</div>
                        <div id="combined-result" className="text-3xl font-bold font-mono"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4.5 Physics Tools ---
const PhysicsTools = () => {
    // Kinematics Calculator (1D)
    // Variables: displacement (dx), initial velocity (vi), final velocity (vf), acceleration (a), time (t)
    const [dx, setDx] = useState('');
    const [vi, setVi] = useState('');
    const [vf, setVf] = useState('');
    const [a, setA] = useState('');
    const [t, setT] = useState('');

    const calculateKinematics = () => {
        let count = 0;
        const vals = { dx: parseFloat(dx), vi: parseFloat(vi), vf: parseFloat(vf), a: parseFloat(a), t: parseFloat(t) };
        if (!isNaN(vals.dx)) count++; if (!isNaN(vals.vi)) count++; if (!isNaN(vals.vf)) count++; if (!isNaN(vals.a)) count++; if (!isNaN(vals.t)) count++;
        
        if (count < 3) { alert("Enter exactly 3 known variables."); return; }
        if (count > 3) { alert("Enter EXACTLY 3 known variables (leave 2 empty)."); return; }

        let nDx = vals.dx, nVi = vals.vi, nVf = vals.vf, nA = vals.a, nT = vals.t;

        // Try to derive missing variables one by one
        let madeProgress = true;
        while (madeProgress) {
            madeProgress = false;
            
            // Vf = Vi + at
            if (isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nT)) { nVf = nVi + nA * nT; madeProgress = true; }
            if (isNaN(nVi) && !isNaN(nVf) && !isNaN(nA) && !isNaN(nT)) { nVi = nVf - nA * nT; madeProgress = true; }
            if (isNaN(nA) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nT)) { nA = (nVf - nVi) / nT; madeProgress = true; }
            if (isNaN(nT) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nA)) { nT = (nVf - nVi) / nA; madeProgress = true; }

            // dx = Vi*t + 0.5*a*t^2
            if (isNaN(nDx) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nT)) { nDx = nVi * nT + 0.5 * nA * nT * nT; madeProgress = true; }
            if (isNaN(nVi) && !isNaN(nDx) && !isNaN(nA) && !isNaN(nT) && nT !== 0) { nVi = (nDx - 0.5 * nA * nT * nT) / nT; madeProgress = true; }
            if (isNaN(nA) && !isNaN(nDx) && !isNaN(nVi) && !isNaN(nT) && nT !== 0) { nA = (2 * (nDx - nVi * nT)) / (nT * nT); madeProgress = true; }

            // vf^2 = vi^2 + 2*a*dx
            if (isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nDx)) { 
                const sq = nVi * nVi + 2 * nA * nDx;
                if (sq >= 0) { nVf = Math.sqrt(sq); madeProgress = true; } // Might be +/- 
            }
            if (isNaN(nVi) && !isNaN(nVf) && !isNaN(nA) && !isNaN(nDx)) { 
                const sq = nVf * nVf - 2 * nA * nDx;
                if (sq >= 0) { nVi = Math.sqrt(sq); madeProgress = true; }
            }
            if (isNaN(nA) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nDx) && nDx !== 0) { nA = (nVf * nVf - nVi * nVi) / (2 * nDx); madeProgress = true; }
            if (isNaN(nDx) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && nA !== 0) { nDx = (nVf * nVf - nVi * nVi) / (2 * nA); madeProgress = true; }

            // dx = 0.5 * (vi + vf) * t
            if (isNaN(nDx) && !isNaN(nVi) && !isNaN(nVf) && !isNaN(nT)) { nDx = 0.5 * (nVi + nVf) * nT; madeProgress = true; }
            if (isNaN(nT) && !isNaN(nDx) && !isNaN(nVi) && !isNaN(nVf)) { nT = (2 * nDx) / (nVi + nVf); madeProgress = true; }
        }

        setDx(isNaN(nDx) ? '' : nDx.toFixed(4));
        setVi(isNaN(nVi) ? '' : nVi.toFixed(4));
        setVf(isNaN(nVf) ? '' : nVf.toFixed(4));
        setA(isNaN(nA) ? '' : nA.toFixed(4));
        setT(isNaN(nT) ? '' : nT.toFixed(4));
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <Triangle size={24} className="rotate-90" /> Kinematics Calculator (1D)
                </h3>
                <p className="text-sm text-brand-text-secondary mb-6">Enter exactly 3 known variables and click calculate to find the remaining 2.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Displacement (Δx)</label>
                        <input type="number" value={dx} onChange={e => setDx(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="m" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Initial Velocity (vᵢ)</label>
                        <input type="number" value={vi} onChange={e => setVi(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="m/s" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Final Velocity (v_f)</label>
                        <input type="number" value={vf} onChange={e => setVf(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="m/s" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Acceleration (a)</label>
                        <input type="number" value={a} onChange={e => setA(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="m/s²" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Time (t)</label>
                        <input type="number" value={t} onChange={e => setT(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" placeholder="s" />
                    </div>
                </div>
                <div className="mt-6 flex gap-4">
                    <button onClick={calculateKinematics} className="px-8 py-3 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20">
                        Calculate Missing
                    </button>
                    <button onClick={() => { setDx(''); setVi(''); setVf(''); setA(''); setT(''); }} className="px-6 py-3 rounded-lg bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-all">
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 5. Formula Reference ---
const FormulaReference = () => {
    const categories = [
        {
            name: 'Algebra',
            formulas: [
                { name: 'Quadratic Formula', eq: 'x = [-b ± √(b² - 4ac)] / 2a' },
                { name: 'Distance Formula', eq: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]' },
                { name: 'Slope', eq: 'm = (y₂ - y₁) / (x₂ - x₁)' },
                { name: 'Logarithm Product', eq: 'log_b(xy) = log_b(x) + log_b(y)' },
            ]
        },
        {
            name: 'Calculus',
            formulas: [
                { name: 'Power Rule (Derivative)', eq: 'd/dx [x^n] = n * x^(n-1)' },
                { name: 'Product Rule', eq: 'd/dx [f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)' },
                { name: 'Chain Rule', eq: 'd/dx [f(g(x))] = f\'(g(x)) * g\'(x)' },
                { name: 'Power Rule (Integral)', eq: '∫ x^n dx = (x^(n+1))/(n+1) + C' },
            ]
        },
        {
            name: 'Physics (Kinematics)',
            formulas: [
                { name: 'Velocity', eq: 'v = v₀ + at' },
                { name: 'Displacement', eq: 'Δx = v₀t + ½at²' },
                { name: 'Velocity Squared', eq: 'v² = v₀² + 2aΔx' },
                { name: 'Newton\'s Second Law', eq: 'F = ma' },
            ]
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [aiFormula, setAiFormula] = useState<{name: string, eq: string, explanation: string} | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const searchAiFormula = async () => {
        if (!searchTerm.trim() || isSearching) return;
        setIsSearching(true);
        setAiFormula(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Explain the formula for "${searchTerm}". Provide the name, the equation in clean text, and a 2-sentence explanation. Return as JSON: {"name": "...", "eq": "...", "explanation": "..."}`,
                config: {
                    responseMimeType: "application/json"
                }
            });
            const data = JSON.parse(result.text || '{}');
            setAiFormula(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-primary/20">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <Sparkles size={20} /> AI Formula Explainer
                </h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search any formula (e.g., Einstein Field Equations, Taylor Series)..."
                        className="flex-1 bg-gray-900/70 p-3 rounded-xl border border-brand-border focus:border-brand-primary outline-none text-sm"
                    />
                    <button 
                        onClick={searchAiFormula}
                        disabled={isSearching || !searchTerm.trim()}
                        className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 size={20} className="animate-spin" /> : "Explain"}
                    </button>
                </div>
                {aiFormula && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-brand-bg/50 rounded-xl border border-brand-border"
                    >
                        <h4 className="text-lg font-bold text-brand-text mb-2">{aiFormula.name}</h4>
                        <div className="font-mono bg-brand-bg p-4 rounded-lg mb-4 text-brand-accent border border-brand-border">
                            {aiFormula.eq}
                        </div>
                        <p className="text-sm text-brand-text-secondary leading-relaxed italic">
                            {aiFormula.explanation}
                        </p>
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(cat => (
                <div key={cat.name} className="bg-brand-surface/50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 text-brand-primary border-b border-brand-border pb-2">{cat.name}</h3>
                    <div className="space-y-4">
                        {cat.formulas.map(f => (
                            <div key={f.name}>
                                <div className="text-xs text-brand-text-secondary mb-1">{f.name}</div>
                                <div className="font-mono bg-gray-900/70 p-2 rounded text-sm text-brand-accent overflow-x-auto whitespace-nowrap">
                                    {f.eq}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
};

// --- 6. Citation Generator ---
const CitationGenerator = () => {
    const [type, setType] = useState('website');
    const [authorLast, setAuthorLast] = useState('');
    const [authorFirst, setAuthorFirst] = useState('');
    const [title, setTitle] = useState('');
    const [publisher, setPublisher] = useState('');
    const [year, setYear] = useState('');
    const [url, setUrl] = useState('');

    const mla = useMemo(() => {
        let citation = '';
        if (authorLast) citation += `${authorLast}${authorFirst ? `, ${authorFirst}` : ''}. `;
        citation += `"${title || 'Title'}." `;
        if (publisher) citation += `${publisher}, `;
        if (year) citation += `${year}, `;
        if (url) citation += `${url}.`;
        return citation.trim().replace(/,$/, '.');
    }, [authorLast, authorFirst, title, publisher, year, url]);

    const apa = useMemo(() => {
        let citation = '';
        if (authorLast) citation += `${authorLast}${authorFirst ? `, ${authorFirst.charAt(0)}.` : ''} `;
        if (year) citation += `(${year}). `;
        citation += `${title || 'Title'}. `;
        if (publisher) citation += `${publisher}. `;
        if (url) citation += `${url}`;
        return citation.trim();
    }, [authorLast, authorFirst, title, publisher, year, url]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-brand-primary flex items-center gap-2">
                <Quote size={24} /> Citation Generator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm text-brand-text-secondary mb-1">Source Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none">
                        <option value="website">Website</option>
                        <option value="book">Book</option>
                        <option value="article">Article</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-brand-text-secondary mb-1">Year Published</label>
                    <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2023" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-brand-text-secondary mb-1">Author Last Name</label>
                    <input type="text" value={authorLast} onChange={e => setAuthorLast(e.target.value)} placeholder="e.g. Smith" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-brand-text-secondary mb-1">Author First Name</label>
                    <input type="text" value={authorFirst} onChange={e => setAuthorFirst(e.target.value)} placeholder="e.g. John" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-brand-text-secondary mb-1">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title of the article, book, or page" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-brand-text-secondary mb-1">Publisher / Website Name</label>
                    <input type="text" value={publisher} onChange={e => setPublisher(e.target.value)} placeholder="e.g. Oxford University Press" className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                {type === 'website' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm text-brand-text-secondary mb-1">URL</label>
                        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-brand-border">
                    <div className="text-xs text-brand-text-secondary mb-2 uppercase tracking-wider font-bold">MLA 9th Edition</div>
                    <div className="font-serif text-lg">{mla}</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-brand-border">
                    <div className="text-xs text-brand-text-secondary mb-2 uppercase tracking-wider font-bold">APA 7th Edition</div>
                    <div className="font-serif text-lg">{apa}</div>
                </div>
            </div>
        </div>
    );
};

// --- 7. Flashcards ---
const Flashcards = () => {
    const [cards, setCards] = useState<{id: number, front: string, back: string}[]>([
        { id: 1, front: 'Mitochondria', back: 'The powerhouse of the cell.' },
        { id: 2, front: 'Photosynthesis', back: 'Process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.' }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    const addCard = () => {
        if (!newFront.trim() || !newBack.trim()) return;
        setCards([...cards, { id: Date.now(), front: newFront, back: newBack }]);
        setNewFront('');
        setNewBack('');
    };

    const deleteCard = (id: number) => {
        const newCards = cards.filter(c => c.id !== id);
        setCards(newCards);
        if (currentIndex >= newCards.length) {
            setCurrentIndex(Math.max(0, newCards.length - 1));
        }
        setIsFlipped(false);
    };

    const nextCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {cards.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div className="text-sm text-brand-text-secondary mb-4">
                        Card {currentIndex + 1} of {cards.length}
                    </div>
                    
                    <div 
                        className="w-full h-64 cursor-pointer group"
                        style={{ perspective: '1000px' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div 
                            className="relative w-full h-full transition-transform duration-500"
                            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        >
                            {/* Front */}
                            <div 
                                className="absolute inset-0 bg-brand-surface border border-brand-border rounded-xl p-8 flex items-center justify-center text-center shadow-lg"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <h3 className="text-2xl font-bold text-brand-primary">{cards[currentIndex].front}</h3>
                                <div className="absolute bottom-4 text-xs text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Click to flip</div>
                            </div>
                            {/* Back */}
                            <div 
                                className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-8 flex items-center justify-center text-center shadow-lg"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <p className="text-lg text-brand-text">{cards[currentIndex].back}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <button onClick={prevCard} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">&larr; Prev</button>
                        <button onClick={() => deleteCard(cards[currentIndex].id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete Card">
                            <Trash2 size={20} />
                        </button>
                        <button onClick={nextCard} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">Next &rarr;</button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12 bg-brand-surface/50 rounded-xl border border-brand-border">
                    <Layers size={48} className="mx-auto text-brand-text-secondary mb-4 opacity-50" />
                    <p className="text-brand-text-secondary">No flashcards yet. Add some below!</p>
                </div>
            )}

            <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border">
                <h4 className="font-bold mb-4 text-brand-primary">Add New Flashcard</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Front (Term / Question)</label>
                        <input type="text" value={newFront} onChange={e => setNewFront(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-secondary mb-1">Back (Definition / Answer)</label>
                        <textarea value={newBack} onChange={e => setNewBack(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none h-24 resize-none" />
                    </div>
                    <button onClick={addCard} className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2">
                        <Plus size={18} /> Add Card
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 8. Assignment Tracker ---
const AssignmentTracker = () => {
    const [assignments, setAssignments] = useState<{id: number, title: string, subject: string, date: string, done: boolean}[]>([]);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState('');

    const addAssignment = () => {
        if (!title.trim()) return;
        setAssignments([...assignments, { id: Date.now(), title, subject, date, done: false }]);
        setTitle(''); setSubject(''); setDate('');
    };

    const toggleDone = (id: number) => {
        setAssignments(assignments.map(a => a.id === id ? { ...a, done: !a.done } : a));
    };

    const deleteAssignment = (id: number) => {
        setAssignments(assignments.filter(a => a.id !== id));
    };

    const sortedAssignments = [...assignments].sort((a, b) => {
        if (a.done === b.done) {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return a.done ? 1 : -1;
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <CheckSquare size={24} /> Assignment Tracker
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment Title" className="bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (e.g. Math)" className="bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-gray-900/70 p-2 rounded border border-brand-border focus:border-brand-primary outline-none text-brand-text-secondary" />
                </div>
                <button onClick={addAssignment} className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2">
                    <Plus size={18} /> Add Assignment
                </button>
            </div>

            <div className="space-y-3">
                {sortedAssignments.length === 0 ? (
                    <div className="text-center p-8 text-brand-text-secondary bg-brand-surface/30 rounded-lg border border-brand-border/50">
                        No assignments tracked. You're all caught up!
                    </div>
                ) : (
                    sortedAssignments.map(a => (
                        <div key={a.id} className={`flex items-center justify-between p-4 rounded-lg border ${a.done ? 'bg-gray-900/40 border-brand-border/30 opacity-60' : 'bg-brand-surface border-brand-border'}`}>
                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleDone(a.id)} className={`w-6 h-6 rounded flex items-center justify-center border ${a.done ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-text-secondary text-transparent'}`}>
                                    <CheckSquare size={16} />
                                </button>
                                <div>
                                    <div className={`font-medium ${a.done ? 'line-through text-brand-text-secondary' : 'text-brand-text'}`}>{a.title}</div>
                                    <div className="text-xs text-brand-text-secondary flex gap-3 mt-1">
                                        {a.subject && <span>{a.subject}</span>}
                                        {a.date && <span className={!a.done && new Date(a.date) < new Date() ? 'text-red-400' : ''}>Due: {a.date}</span>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deleteAssignment(a.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- 9. Notes Tool ---

const NotesTool = () => {
    const [notes, setNotes] = useState<string>(() => localStorage.getItem('quantumcalc_notes') || '');
    const [lastSaved, setLastSaved] = useState<string>('');

    useEffect(() => {
        localStorage.setItem('quantumcalc_notes', notes);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLastSaved(new Date().toLocaleTimeString());
    }, [notes]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-brand-surface/50 p-4 rounded-xl border border-brand-border">
                <div className="flex items-center gap-3">
                    <StickyNote className="text-brand-primary" size={24} />
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">Scratchpad</h3>
                        <p className="text-[10px] text-brand-text-secondary uppercase">Autosaves locally</p>
                    </div>
                </div>
                <div className="text-xs text-brand-text-secondary">Last saved: {lastSaved}</div>
            </div>
            <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Start typing your notes, derivations, or problem drafts..."
                className="w-full h-96 bg-brand-surface border border-brand-border rounded-xl p-6 text-brand-text outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm shadow-inner"
            />
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        const blob = new Blob([notes], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'quantumcalc_notes.txt';
                        a.click();
                    }}
                    className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all"
                >
                    Export as .txt
                </button>
                <button 
                    onClick={() => setNotes('')}
                    className="px-6 py-3 bg-red-400/20 text-red-400 font-bold rounded-xl hover:bg-red-400/30 transition-all border border-red-400/20"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};

// --- 10. AI Tutor Workspace ---
const AITutor = () => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: "Hi! I'm Nolo, your AI Tutor. Ask me a math, physics, or chemistry problem, and I'll help you solve it step-by-step instead of just giving you the answer. I can also help you with writing, history, and general high school subjects!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<'chat' | 'step-by-step' | 'explanation'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (quickPrompt?: string) => {
        const userText = quickPrompt || input.trim();
        if (!userText || isLoading) return;
        
        if (!quickPrompt) setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Gemini API key is not configured.");
            
            const ai = new GoogleGenAI({ apiKey });
            
            let systemPrompt = "You are Nolo, an AI step-by-step tutor for high school students. Break it down into clear, logical steps. Use markdown for formatting.";
            
            if (workspaceMode === 'step-by-step') {
                systemPrompt += " FOCUS: Be extremely pedantic about steps. Use [Step 1], [Step 2] formatting. For formulas, use LaTeX-style backticks.";
            } else if (workspaceMode === 'explanation') {
                systemPrompt += " FOCUS: Explain the THEORY and CONCEPTS behind the problem rather than just the math solving.";
            }

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userText,
                config: {
                    systemInstruction: systemPrompt,
                }
            });
            
            setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyChat = () => {
        const text = messages.map(m => `**${m.role === 'user' ? 'Student' : 'Nolo AI'}**: ${m.text}`).join('\n\n');
        navigator.clipboard.writeText(text);
        alert('Chat copied to clipboard as Markdown!');
    };

    const downloadChat = () => {
        const text = messages.map(m => `**${m.role === 'user' ? 'Student' : 'Nolo AI'}**: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nolo-tutor-session-${new Date().toISOString().slice(0,10)}.md`;
        a.click();
    };

    const quickActions = [
        { label: 'Summarize Concept', icon: BookOpen, prompt: 'Explain the core concepts of ' },
        { label: 'Step-by-Step Solve', icon: BrainCircuit, prompt: 'Help me solve this problem step-by-step: ' },
        { label: 'Analyze Proof', icon: Search, prompt: 'Check this derivation for errors and explain why: ' },
        { label: 'Test Knowledge', icon: CheckSquare, prompt: 'Give me 3 practice problems regarding ' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[650px]">
            {/* Sidebar Controls */}
            <div className="lg:w-48 flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest pl-2">Mode</h4>
                {(['chat', 'step-by-step', 'explanation'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setWorkspaceMode(mode)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border ${workspaceMode === mode ? 'bg-brand-primary text-white border-brand-primary shadow-lg' : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:border-brand-primary/50'}`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
                
                <div className="mt-auto space-y-2">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest pl-2">Presets</h4>
                    {quickActions.map(action => (
                        <button
                            key={action.label}
                            onClick={() => setInput(action.prompt)}
                            className="w-full p-2 text-[10px] bg-brand-surface border border-brand-border rounded-lg text-left hover:bg-brand-primary/10 transition-colors flex items-center gap-2"
                        >
                            <action.icon size={12} className="text-brand-primary" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 bg-brand-surface/50 rounded-2xl border border-brand-border flex flex-col overflow-hidden shadow-inner">
                <div className="p-4 border-b border-brand-border bg-brand-surface/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                            <BrainCircuit size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-text text-sm">Workspace Environment</h3>
                            <p className="text-[10px] text-brand-text-secondary">Logic Engine: Gemini 3.1 Pro</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={copyChat} className="p-2 text-brand-text-secondary hover:bg-brand-surface rounded-lg transition-colors" title="Copy Chat">
                            <Copy size={16} />
                        </button>
                        <button onClick={downloadChat} className="p-2 text-brand-text-secondary hover:bg-brand-surface rounded-lg transition-colors" title="Download Session">
                            <Download size={16} />
                        </button>
                        <button onClick={() => setMessages([messages[0]])} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Clear Chat">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-brand-surface border border-brand-border text-brand-text rounded-tl-none'}`}>
                                {msg.role === 'user' ? (
                                    <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                                ) : (
                                    <div className="markdown-body prose prose-invert prose-sm">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">Processing Data...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 bg-brand-bg/50 border-t border-brand-border">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <textarea 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Paste equation or problem description..."
                                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-primary min-h-[50px] max-h-[150px] resize-none"
                            />
                            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                <span className="text-[10px] text-brand-text-secondary font-mono">Shift+Enter for newline</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center font-bold"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Student Tools Component ---
const StudentTools: React.FC = () => {
    const { user, userData } = useAuth();
    const [activeTool, setActiveTool] = useState('gpa');

    const tools = [
        { id: 'gpa', label: 'Grades & GPA', Icon: GraduationCap },
        { id: 'pomodoro', label: 'Study Timer', Icon: Timer },
        { id: 'geometry', label: 'Geometry', Icon: Triangle },
        { id: 'science', label: 'Chemistry', Icon: Atom },
        { id: 'physics', label: 'Physics', Icon: Triangle },
        { id: 'formulas', label: 'Formulas', Icon: BookOpen },
        { id: 'notes', label: 'Scratchpad', Icon: StickyNote },
        { id: 'citations', label: 'Citations', Icon: Quote },
        { id: 'flashcards', label: 'Flashcards', Icon: Layers },
        { id: 'assignments', label: 'Assignments', Icon: CheckSquare },
        { id: 'elements', label: 'Periodic Table', Icon: FlaskConical },
        { id: 'tutor', label: 'Nolo AI Tutor', Icon: BrainCircuit },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'gpa': return <GPACalculator />;
            case 'pomodoro': return <PomodoroTimer />;
            case 'geometry': return <GeometrySolver />;
            case 'science': return <ScienceTools />;
            case 'physics': return <PhysicsTools />;
            case 'formulas': return <FormulaReference />;
            case 'notes': return <NotesTool />;
            case 'citations': return <CitationGenerator />;
            case 'flashcards': return <Flashcards />;
            case 'assignments': return <AssignmentTracker />;
            case 'elements': return <PeriodicTable />;
            case 'tutor': return <AITutor />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8 text-center pt-4">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4"
                >
                    <GraduationCap size={14} /> Academic Workspace
                </motion.div>
                <h2 className="text-4xl font-extrabold text-brand-text mb-2 tracking-tight text-center flex items-center justify-center gap-3">
                    <GraduationCap size={36} className="text-brand-primary" />
                    Welcome back, <span className="text-brand-primary">{user?.displayName?.split(' ')[0] || 'Scholar'}</span>.
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto font-light text-lg">
                    {userData?.school ? `Solving the impossible at ${userData.school}. ` : 'Your all-in-one suite for academic excellence. '}
                    {userData?.grade ? `Currently focused on ${userData.grade}.` : ''}
                </p>
            </div>
            
            <div className="sticky top-[80px] z-30 bg-brand-bg/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 mb-4">
                <div className="flex overflow-x-auto no-scrollbar gap-3 py-2 mask-fade-edges">
                    <div className="flex gap-2 mx-auto sm:justify-center min-w-max px-2">
                        {tools.map(tool => (
                            <SubNavButton 
                                key={tool.id}
                                label={tool.label} 
                                icon={tool.Icon}
                                isActive={activeTool === tool.id} 
                                onClick={() => setActiveTool(tool.id)} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            <motion.div 
                key={activeTool}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-brand-surface/40 backdrop-blur-sm p-4 md:p-8 rounded-[2rem] border border-brand-border/50 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="relative z-10">
                    {renderTool()}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentTools;
