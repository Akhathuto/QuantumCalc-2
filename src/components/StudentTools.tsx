import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import LessonsHub from './LessonsHub';
import WolframHub from './WolframHub';
import MathExercises from './MathExercises';
import K5Worksheets from './K5Worksheets';
import { 
  GraduationCap, 
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
  Sparkles,
  Zap,
  MousePointer2,
  Activity,
  ShieldCheck,
  Target,
  Coffee,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Divide
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from './AuthProvider';
import SubNavButton from './common/SubNavButton';

// --- UI Components ---
const Input = ({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, id: string }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">{label}</label>
        <input id={id} {...props} className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/50" />
    </div>
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
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GraduationCap size={140} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-text uppercase tracking-widest">Performance Index</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-black">Semester Quality-Point Average</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {courses.map((course, index) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={course.id} 
                                className="flex flex-wrap gap-6 items-end bg-brand-bg/40 p-6 rounded-[2.5rem] border border-brand-border/30 hover:border-brand-primary/30 transition-all shadow-inner group/item"
                            >
                                <div className="flex-1 min-w-[200px]">
                                    <Input label="Discipline Designation" id={`course_${course.id}`} type="text" value={course.name} onChange={e => updateCourse(course.id, 'name', e.target.value)} placeholder={`e.g. Quantum Mechanics ${index + 1}`} />
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1 ml-1">Grade</label>
                                    <div className="relative">
                                        <select value={course.grade} onChange={e => updateCourse(course.id, 'grade', e.target.value)} className="w-full bg-brand-bg/60 border border-brand-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all appearance-none cursor-pointer">
                                            {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary opacity-50">
                                            <RotateCcw size={12} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28">
                                    <Input label="Credits" id={`credits_${course.id}`} type="number" value={course.credits} onChange={e => updateCourse(course.id, 'credits', e.target.value)} min="0" step="0.5" />
                                </div>
                                <button onClick={() => removeCourse(course.id)} className="p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all active:scale-90 group-hover/item:opacity-100 opacity-50">
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <button onClick={addCourse} className="flex items-center gap-3 text-brand-primary hover:text-brand-secondary text-[10px] uppercase font-black tracking-widest px-6 py-3 bg-brand-primary/10 rounded-xl transition-all border border-brand-primary/20 hover:scale-105 active:scale-95">
                            <Plus size={18} /> Append Assessment Node
                        </button>
                        
                        <div className="flex-1 max-w-sm w-full bg-brand-bg/80 border-2 border-brand-primary rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary animate-pulse" />
                            <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-2">GPA Resultant Quotient</div>
                            <div className="text-6xl font-black text-brand-text tracking-tightest font-mono">{gpa}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target size={140} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-text uppercase tracking-widest">Threshold Analysis</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-black">Variable Assessment Forecaster</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <Input label="Current Cumulative (%)" id="cur_grade" type="number" value={currentGrade} onChange={e => setCurrentGrade(e.target.value)} placeholder="85" />
                        <Input label="Objective Threshold (%)" id="target_grade" type="number" value={targetGrade} onChange={e => setTargetGrade(e.target.value)} placeholder="90" />
                        <Input label="Final Weight Coefficient (%)" id="final_weight" type="number" value={finalWeight} onChange={e => setFinalWeight(e.target.value)} placeholder="20" />
                    </div>
                    
                    {requiredFinal !== null && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-10 rounded-[2.5rem] text-center border-2 shadow-2xl relative overflow-hidden ${parseFloat(requiredFinal) > 100 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-30">
                                <Activity size={40} />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">Required Performance Variable</div>
                            <div className="text-7xl font-black tracking-tightest mb-4">{requiredFinal}%</div>
                            <p className="text-sm opacity-80 font-light max-w-md mx-auto leading-relaxed italic">The following magnitude is required on your final Terminal Assessment to reach the {targetGrade}% threshold.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

const POMODORO_MODES = {
    work: { label: 'Focus Cycle', time: 25 * 60, color: 'text-brand-primary', shadow: 'shadow-brand-primary/30', icon: BrainCircuit },
    shortBreak: { label: 'Brief Respite', time: 5 * 60, color: 'text-emerald-400', shadow: 'shadow-emerald-400/30', icon: Coffee },
    longBreak: { label: 'Long Recovery', time: 15 * 60, color: 'text-blue-400', shadow: 'shadow-blue-400/30', icon: Moon }
};

// --- 2. Pomodoro Timer ---
const PomodoroTimer = () => {
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        setIsActive(false);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
        setMode(newMode);
        setTimeLeft(POMODORO_MODES[newMode].time);
        setIsActive(false);
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(POMODORO_MODES[mode].time);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((POMODORO_MODES[mode].time - timeLeft) / POMODORO_MODES[mode].time) * 100;
    const CurrentIcon = POMODORO_MODES[mode].icon;

    return (
        <div className="bg-brand-surface/40 p-12 rounded-[4rem] border border-brand-border/50 max-w-2xl mx-auto text-center backdrop-blur-md shadow-2xl relative overflow-hidden group">
            {/* Header progress bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-border/20">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${POMODORO_MODES[mode].color.replace('text-', 'bg-')} transition-all shadow-[0_0_20px_rgba(var(--brand-primary),0.5)]`}
                />
            </div>

            <div className="relative z-10">
                <div className="flex justify-center gap-3 mb-16 bg-brand-bg/50 p-2 rounded-[2rem] w-fit mx-auto border border-brand-border/30 backdrop-blur-sm shadow-inner">
                    {(Object.keys(POMODORO_MODES) as Array<keyof typeof POMODORO_MODES>).map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-brand-text text-brand-bg shadow-2xl scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/40'}`}
                        >
                            {POMODORO_MODES[m].label}
                        </button>
                    ))}
                </div>

                <div className="relative w-80 h-80 mx-auto mb-16 flex items-center justify-center group/timer">
                    <div className={`absolute inset-0 rounded-full blur-[100px] opacity-20 transition-all duration-700 ${POMODORO_MODES[mode].color.replace('text-', 'bg-')} ${isActive ? 'scale-110 animate-pulse' : 'scale-75'}`} />
                    
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-110">
                        <circle cx="160" cy="160" r="145" className="stroke-brand-border/20" strokeWidth="2" fill="none" />
                        <motion.circle 
                            cx="160" cy="160" r="145" 
                            className={`stroke-current ${POMODORO_MODES[mode].color}`} 
                            strokeWidth="10" fill="none" 
                            strokeDasharray={2 * Math.PI * 145}
                            animate={{ strokeDashoffset: 2 * Math.PI * 145 * (1 - progress / 100) }}
                            transition={{ duration: 1, ease: "linear" }}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div 
                            initial={false}
                            animate={{ scale: isActive ? 1.05 : 1 }}
                            className={`text-8xl font-black font-mono tracking-tightest leading-none ${POMODORO_MODES[mode].color}`}
                        >
                            {formatTime(timeLeft)}
                        </motion.div>
                        <div className="flex items-center gap-3 mt-6 bg-brand-bg/40 px-6 py-2 rounded-full border border-brand-border/30 backdrop-blur-sm">
                            <CurrentIcon size={14} className={isActive ? 'animate-spin-slow' : ''} />
                            <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em]">
                                {isActive ? 'System Active' : 'Idle Protocol'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-8">
                    <button 
                        onClick={toggleTimer}
                        className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-brand-bg transition-all hover:scale-105 active:scale-90 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${POMODORO_MODES[mode].color.replace('text-', 'bg-')} ${POMODORO_MODES[mode].shadow} relative overflow-hidden group/btn`}
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                        {isActive ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-24 h-24 rounded-[2.5rem] bg-brand-surface border border-brand-border hover:border-brand-primary/50 flex items-center justify-center text-brand-text transition-all hover:scale-105 active:scale-90 shadow-2xl hover:text-brand-primary group/reset"
                    >
                        <RotateCcw size={32} className="group-hover/reset:rotate-[-45deg] transition-transform" />
                    </button>
                </div>
                
                <div className="mt-16 pt-10 border-t border-brand-border/20 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-brand-text-secondary/50 grayscale hover:grayscale-0 transition-all duration-500">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Cognitive Optimization Protocol: Active</span>
                    </div>
                    <div className="text-[9px] font-mono text-brand-text-secondary/30 uppercase tracking-widest">
                        Node_Ref: {mode.toUpperCase()}_TIMER_0x{timeLeft.toString(16).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GEOMETRY_SHAPES = {
    circle: { name: 'Circle', params: ['Radius (r)'], icon: Target, calc: (r: number) => ({ Area: Math.PI * r * r, Circumference: 2 * Math.PI * r }) },
    rectangle: { name: 'Rectangle', params: ['Length (l)', 'Width (w)'], icon: Triangle, calc: (l: number, w: number) => ({ Area: l * w, Perimeter: 2 * (l + w) }) },
    triangle: { name: 'Triangle', params: ['Base (b)', 'Height (h)'], icon: Triangle, calc: (b: number, h: number) => ({ Area: 0.5 * b * h }) },
    sphere: { name: 'Sphere', params: ['Radius (r)'], icon: Atom, calc: (r: number) => ({ Volume: (4/3) * Math.PI * Math.pow(r, 3), 'Surface Area': 4 * Math.PI * r * r }) },
    cylinder: { name: 'Cylinder', params: ['Radius (r)', 'Height (h)'], icon: FlaskConical, calc: (r: number, h: number) => ({ Volume: Math.PI * r * r * h, 'Surface Area': 2 * Math.PI * r * (r + h) }) },
};

// --- 3. Geometry Solver ---
const GeometrySolver = () => {
    const [shape, setShape] = useState('circle');
    const [inputs, setInputs] = useState<Record<string, string>>({});

    const currentShape = (GEOMETRY_SHAPES as any)[shape];

    const results = useMemo(() => {
        const args = (currentShape.params as string[]).map((p: string) => parseFloat(inputs[p] || '0'));
        if (args.some(isNaN) || args.some((a: number) => a <= 0)) return null;
        return (currentShape.calc as any)(...args);
    }, [inputs, currentShape]);

    return (
        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 max-w-5xl mx-auto backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Triangle size={200} className="rotate-45" />
            </div>
            
            <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-12 bg-brand-bg/50 p-2 rounded-[2rem] border border-brand-border/30 w-fit backdrop-blur-sm shadow-inner">
                    {Object.entries(GEOMETRY_SHAPES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => { setShape(key); setInputs({}); }}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${shape === key ? 'bg-brand-primary text-brand-bg shadow-2xl scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/40'}`}
                        >
                            {(val as any).name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/10">
                                <currentShape.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-brand-text uppercase tracking-widest">{currentShape.name} Analysis</h4>
                                <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-black">Vector Topology Engine</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {(currentShape.params as string[]).map((param: string) => (
                                <Input 
                                    key={param}
                                    label={param} 
                                    id={`geom_${param}`}
                                    type="number" 
                                    value={inputs[param] || ''} 
                                    onChange={e => setInputs({...inputs, [param]: e.target.value})}
                                    placeholder="0.00"
                                    min="0"
                                />
                            ))}
                            <div className="p-6 bg-brand-bg/30 rounded-2xl border border-brand-border/30 text-[9px] text-brand-text-secondary uppercase leading-relaxed tracking-wider font-mono italic">
                                // Enter scalar magnitudes for Euclidean space calculations.
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-brand-bg/60 p-10 rounded-[3rem] border border-brand-border/50 flex flex-col justify-center shadow-2xl relative overflow-hidden group/res min-h-[360px]">
                        <div className="absolute -top-20 -right-20 p-20 opacity-5 group-hover/res:opacity-20 transition-all duration-1000 scale-150 rotate-12">
                            <currentShape.icon size={240} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-10 text-center">Computed Euclidean Metrics</div>
                            {results ? (
                                <div className="space-y-8">
                                    {Object.entries(results).map(([key, val]) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={key} 
                                            className="flex flex-col items-center border-b border-brand-border/30 pb-6 group/metric"
                                        >
                                            <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] mb-2 group-hover/metric:text-brand-primary transition-colors">{key} Resultant</span>
                                            <span className="font-mono font-black text-5xl text-brand-text tracking-tightest group-hover/metric:scale-110 transition-transform">
                                                {(val as number).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-6">
                                    <div className="w-16 h-16 bg-brand-border/20 rounded-[2rem] flex items-center justify-center mx-auto text-brand-text-secondary/50 animate-pulse">
                                        <Activity size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">
                                            Awaiting Coordinate Inputs
                                        </p>
                                        <p className="text-[8px] text-brand-text-secondary/50 uppercase tracking-widest font-mono">
                                            Input magnitude sequence to trigger solver.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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

    const calculateMolarMass = () => {
        if (!formula) return null;
        try {
            const regex = /([A-Z][a-z]*)(\d*)/g;
            const matches = Array.from(formula.matchAll(regex));
            if (matches.length === 0) return { error: 'Invalid Structure' };
            
            let mass = 0;
            for (const match of matches) {
                const element = match[1];
                const count = match[2] ? parseInt(match[2], 10) : 1;
                
                if (ATOMIC_WEIGHTS[element]) {
                    mass += ATOMIC_WEIGHTS[element] * count;
                } else {
                    return { error: `Element [${element}] Not Found` };
                }
            }
            return { mass: mass.toFixed(3) };
        } catch (e) {
            return { error: 'Computation Error' };
        }
    };
    const molarMass = calculateMolarMass();

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
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FlaskConical size={180} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <Atom size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-text uppercase tracking-widest">Stoichiometric Engine</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-black">Empirical Mass Matrix Analysis</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <Input 
                                label="Chemical Empirical Notation" 
                                id="chem_formula"
                                type="text" 
                                value={formula} 
                                onChange={e => setFormula(e.target.value)}
                                placeholder="e.g. C6H12O6"
                                className="text-xl font-mono tracking-widest bg-brand-bg/60 p-5 rounded-2xl"
                            />
                            <div className="p-6 bg-brand-bg/40 rounded-2xl border border-brand-border/30 text-[10px] text-brand-text-secondary uppercase leading-relaxed tracking-wider font-mono italic">
                                // Formula character set is CASE-SENSITIVE.<br/>
                                // Example: NaCl [Sodium Chloride], H2O [Dihydrogen Monoxide].
                            </div>
                        </div>
                        
                        <div className="relative group/mass">
                            <div className="absolute -inset-2 bg-brand-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover/mass:opacity-100 transition-opacity duration-700" />
                            <div className={`relative p-12 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all duration-500 backdrop-blur-sm min-h-[220px] ${molarMass?.error ? 'bg-red-500/5 border-red-500/20 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]'}`}>
                                {molarMass && !molarMass.error ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-4 text-emerald-500/60">
                                            <ShieldCheck size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Calculated Aggregate Mass</span>
                                        </div>
                                        <div className="text-7xl font-black font-mono tracking-tightest mb-2 group-hover/mass:scale-110 transition-transform">{molarMass.mass}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 font-mono">grams // mole</div>
                                    </>
                                ) : molarMass?.error ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-12 h-12 rounded-full border-2 border-red-500/20 flex items-center justify-center mx-auto">
                                            <Activity size={24} className="text-red-500 animate-pulse" />
                                        </div>
                                        <p className="font-black text-xs uppercase tracking-[0.3em] font-mono">{molarMass.error}</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 space-y-6">
                                        <Activity size={40} className="mx-auto opacity-20 animate-pulse text-brand-text-secondary" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary">Input Required</p>
                                            <p className="text-[8px] font-mono text-brand-text-secondary/40 uppercase tracking-widest italic">Awaiting structural sequence...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-16 border-t border-brand-border/20">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/10">
                            <FlaskConical size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-text uppercase tracking-widest">Thermodynamic State V.2</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-black">Ideal Gas Law [PV=nRT] Solver</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="p-2 bg-brand-bg/50 rounded-[2rem] w-fit flex gap-2 border border-brand-border/30 backdrop-blur-sm shadow-inner mx-auto lg:mx-0">
                            {['P', 'V', 'n', 'T'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setSolveFor(val)}
                                    className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${solveFor === val ? 'bg-brand-text text-brand-bg shadow-2xl scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/40'}`}
                                >
                                    {val === 'P' ? 'Pressure (P)' : val === 'V' ? 'Volume (V)' : val === 'n' ? 'Moles (n)' : 'Temp (T)'}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className={`transition-all duration-500 ${solveFor === 'P' ? 'opacity-20 scale-95 grayscale pointer-events-none' : ''}`}>
                                <Input label="Pressure (atm)" id="gas_p" type="number" value={p} onChange={e => setP(e.target.value)} placeholder="1.0" />
                            </div>
                            <div className={`transition-all duration-500 ${solveFor === 'V' ? 'opacity-20 scale-95 grayscale pointer-events-none' : ''}`}>
                                <Input label="Volume (L)" id="gas_v" type="number" value={v} onChange={e => setV(e.target.value)} placeholder="22.4" />
                            </div>
                            <div className={`transition-all duration-500 ${solveFor === 'n' ? 'opacity-20 scale-95 grayscale pointer-events-none' : ''}`}>
                                <Input label="Moles (n)" id="gas_n" type="number" value={n} onChange={e => setN(e.target.value)} placeholder="1.0" />
                            </div>
                            <div className={`transition-all duration-500 ${solveFor === 'T' ? 'opacity-20 scale-95 grayscale pointer-events-none' : ''}`}>
                                <Input label="Temperature (K)" id="gas_t" type="number" value={t} onChange={e => setT(e.target.value)} placeholder="273.15" />
                            </div>
                        </div>

                        {idealResult !== null && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-16 rounded-[3rem] bg-brand-primary/10 border-2 border-brand-primary/20 text-brand-primary text-center shadow-2xl relative overflow-hidden group/ideal"
                            >
                                <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary opacity-30" />
                                <div className="flex items-center justify-center gap-3 mb-6 text-brand-primary/60">
                                    <Activity size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Isolated Variable: {solveFor}</span>
                                </div>
                                <div className="text-8xl font-black font-mono tracking-tightest group-hover/ideal:scale-110 transition-transform">{idealResult}</div>
                            </motion.div>
                        )}
                        
                        <div className="p-6 bg-brand-bg/30 rounded-2xl border border-brand-border/30 text-[9px] text-brand-text-secondary/50 uppercase tracking-widest font-mono text-center">
                            // Universal Gas Constant (R) ≈ 0.08206 L⋅atm/(mol⋅K) // System Alpha-V.2
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4.5 Physics Tools ---
const PhysicsTools = () => {
    // Kinematics Calculator (1D)
    const [dx, setDx] = useState('');
    const [vi, setVi] = useState('');
    const [vf, setVf] = useState('');
    const [a, setA] = useState('');
    const [t, setT] = useState('');
    const [isSolved, setIsSolved] = useState(false);

    const calculateKinematics = () => {
        let count = 0;
        const vals = { dx: parseFloat(dx), vi: parseFloat(vi), vf: parseFloat(vf), a: parseFloat(a), t: parseFloat(t) };
        if (!isNaN(vals.dx)) count++; if (!isNaN(vals.vi)) count++; if (!isNaN(vals.vf)) count++; if (!isNaN(vals.a)) count++; if (!isNaN(vals.t)) count++;
        
        if (count < 3) { return; }
        if (count > 3) { return; }

        let nDx = vals.dx, nVi = vals.vi, nVf = vals.vf, nA = vals.a, nT = vals.t;

        let madeProgress = true;
        while (madeProgress) {
            madeProgress = false;
            if (isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nT)) { nVf = nVi + nA * nT; madeProgress = true; }
            if (isNaN(nVi) && !isNaN(nVf) && !isNaN(nA) && !isNaN(nT)) { nVi = nVf - nA * nT; madeProgress = true; }
            if (isNaN(nA) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nT)) { nA = (nVf - nVi) / nT; madeProgress = true; }
            if (isNaN(nT) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nA)) { nT = (nVf - nVi) / nA; madeProgress = true; }
            if (isNaN(nDx) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nT)) { nDx = nVi * nT + 0.5 * nA * nT * nT; madeProgress = true; }
            if (isNaN(nVi) && !isNaN(nDx) && !isNaN(nA) && !isNaN(nT) && nT !== 0) { nVi = (nDx - 0.5 * nA * nT * nT) / nT; madeProgress = true; }
            if (isNaN(nA) && !isNaN(nDx) && !isNaN(nVi) && !isNaN(nT) && nT !== 0) { nA = (2 * (nDx - nVi * nT)) / (nT * nT); madeProgress = true; }
            if (isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && !isNaN(nDx)) { 
                const sq = nVi * nVi + 2 * nA * nDx;
                if (sq >= 0) { nVf = Math.sqrt(sq); madeProgress = true; }
            }
            if (isNaN(nVi) && !isNaN(nVf) && !isNaN(nA) && !isNaN(nDx)) { 
                const sq = nVf * nVf - 2 * nA * nDx;
                if (sq >= 0) { nVi = Math.sqrt(sq); madeProgress = true; }
            }
            if (isNaN(nA) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nDx) && nDx !== 0) { nA = (nVf * nVf - nVi * nVi) / (2 * nDx); madeProgress = true; }
            if (isNaN(nDx) && !isNaN(nVf) && !isNaN(nVi) && !isNaN(nA) && nA !== 0) { nDx = (nVf * nVf - nVi * nVi) / (2 * nA); madeProgress = true; }
            if (isNaN(nDx) && !isNaN(nVi) && !isNaN(nVf) && !isNaN(nT)) { nDx = 0.5 * (nVi + nVf) * nT; madeProgress = true; }
            if (isNaN(nT) && !isNaN(nDx) && !isNaN(nVi) && !isNaN(nVf)) { nT = (2 * nDx) / (nVi + nVf); madeProgress = true; }
        }

        setDx(isNaN(nDx) ? '' : nDx.toFixed(4));
        setVi(isNaN(nVi) ? '' : nVi.toFixed(4));
        setVf(isNaN(nVf) ? '' : nVf.toFixed(4));
        setA(isNaN(nA) ? '' : nA.toFixed(4));
        setT(isNaN(nT) ? '' : nT.toFixed(4));
        setIsSolved(true);
        setTimeout(() => setIsSolved(false), 2000);
    };

    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={240} className="rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <Triangle size={28} className="rotate-90" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Kinematics Analyzer</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">1D Linear Motion Matrix [System V.1]</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {[
                            { label: 'Displacement (Δx)', id: 'k_dx', val: dx, set: setDx, unit: 'm' },
                            { label: 'Init Velocity (vᵢ)', id: 'k_vi', val: vi, set: setVi, unit: 'm/s' },
                            { label: 'Final Velocity (v_f)', id: 'k_vf', val: vf, set: setVf, unit: 'm/s' },
                            { label: 'Acceleration (a)', id: 'k_a', val: a, set: setA, unit: 'm/s²' },
                            { label: 'Time duration (t)', id: 'k_t', val: t, set: setT, unit: 's' }
                        ].map((item) => (
                            <div key={item.id} className="space-y-2 group/input">
                                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest px-1 group-hover/input:text-brand-primary transition-colors">
                                    {item.label}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        id={item.id}
                                        value={item.val}
                                        onChange={e => item.set(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-4 text-brand-text font-mono focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-brand-text-secondary/20"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-brand-text-secondary/30 pointer-events-none uppercase">
                                        {item.unit}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 pt-10 border-t border-brand-border/20">
                        <div className="flex-1 flex gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={calculateKinematics} 
                                className={`flex-1 px-10 py-5 rounded-2xl bg-brand-primary text-brand-bg font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl shadow-brand-primary/20 flex items-center justify-center gap-3 ${isSolved ? 'bg-emerald-500' : ''}`}
                            >
                                {isSolved ? <ShieldCheck size={18} /> : <Activity size={18} />}
                                {isSolved ? 'System Converged' : 'Compute Kinematic State'}
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setDx(''); setVi(''); setVf(''); setA(''); setT(''); }} 
                                className="px-10 py-5 rounded-2xl bg-brand-surface border border-brand-border text-brand-text-secondary font-black uppercase tracking-[0.3em] text-[11px] hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-3"
                            >
                                <RotateCcw size={18} />
                                Reset
                            </motion.button>
                        </div>
                        <div className="lg:w-1/3 p-5 bg-brand-bg/30 rounded-2xl border border-brand-border/30 flex items-center gap-4 group/hint">
                            <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border/50 flex items-center justify-center text-brand-text-secondary/40">
                                <MousePointer2 size={20} />
                            </div>
                            <p className="text-[9px] text-brand-text-secondary uppercase leading-relaxed tracking-wider font-mono italic">
                                // Input exactly [3] kinematic variables to solve for unknowns. <br/>
                                // System employs iterative differential state mapping.
                            </p>
                        </div>
                    </div>
                </div>

                {isSolved && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-emerald-500/5 pointer-events-none flex items-center justify-center"
                    >
                        <div className="w-full h-1 absolute bottom-0 bg-emerald-500/30 animate-pulse" />
                    </motion.div>
                )}
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
                { name: 'Quadratic Formula', eq: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
                { name: 'Distance Formula', eq: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
                { name: 'Slope Intersection', eq: 'y = mx + b' },
                { name: 'Logarithm Product', eq: '\\log_b(xy) = \\log_b(x) + \\log_b(y)' },
            ]
        },
        {
            name: 'Calculus',
            formulas: [
                { name: 'Fundamental Theorem', eq: '\\int_a^b f(x) dx = F(b) - F(a)' },
                { name: 'Product Rule', eq: '(fg)\' = f\'g + fg\'' },
                { name: 'Chain Rule', eq: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}' },
                { name: 'Power Rule', eq: '\\frac{d}{dx} [x^n] = n x^{n-1}' },
            ]
        },
        {
            name: 'Physics // Classical',
            formulas: [
                { name: 'Time-Independent Kinematics', eq: 'v^2 = v_0^2 + 2a\\Delta x' },
                { name: 'Newton\'s Second Law', eq: '\\vec{F} = m\\vec{a}' },
                { name: 'Gravitational Force', eq: 'F = G \\frac{m_1 m_2}{r^2}' },
                { name: 'Centripetal Accel.', eq: 'a_c = \\frac{v^2}{r}' },
            ]
        },
        {
            name: 'Geometry // Analytical',
            formulas: [
                { name: 'Equation of Circle', eq: '(x-h)^2 + (y-k)^2 = r^2' },
                { name: 'Law of Cosines', eq: 'c^2 = a^2 + b^2 - 2ab \\cos(y)' },
                { name: 'Area of Ellipse', eq: 'A = \\pi a b' },
                { name: 'Euler\'s Formula', eq: 'V - E + F = 2' },
            ]
        },
        {
            name: 'Statistics // Probabilistic',
            formulas: [
                { name: 'Standard Deviation', eq: '\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}' },
                { name: 'Bayes\' Theorem', eq: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}' },
                { name: 'Normal Distribution', eq: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}' },
                { name: 'Binomial Coeff.', eq: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}' },
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
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const result = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `Explain the formula for "${searchTerm}". Provide the name, the equation in LaTeX format (use standard LaTeX, surround with $), and a 2-sentence explanation. Return as JSON: {"name": "...", "eq": "...", "explanation": "..."}`,
                config: { responseMimeType: "application/json" }
            });
            let text = result.text || '{}';
            text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
            const data = JSON.parse(text);
            setAiFormula(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-16 max-w-6xl mx-auto px-4">
            <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/synth">
                <div className="absolute top-0 right-0 p-16 opacity-5 group-hover/synth:opacity-10 transition-opacity">
                    <Sparkles size={200} className="rotate-12" />
                </div>
                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-brand-text uppercase tracking-widest">Logic Synthesizer</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black">AI Formula Derivation Matrix // Alpha-Node</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                        <div className="flex-1 relative group/input">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary group-focus-within/input:text-brand-primary transition-colors" size={24} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchAiFormula()}
                                placeholder="Search laws, theorems, or quantum states..."
                                className="w-full bg-brand-bg/50 border border-brand-border rounded-[2rem] pl-16 pr-8 py-6 text-lg outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:opacity-30 font-medium"
                            />
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={searchAiFormula}
                            disabled={isSearching || !searchTerm.trim()}
                            className="px-14 py-6 bg-brand-primary text-brand-bg font-black rounded-2xl text-[11px] uppercase tracking-[0.4em] hover:bg-brand-secondary active:scale-95 transition-all shadow-2xl shadow-brand-primary/40 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
                            {isSearching ? "Synthesizing..." : "Derive Protocol"}
                        </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                        {aiFormula && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -30 }}
                                className="mt-12 p-12 bg-brand-bg/60 rounded-[3.5rem] border border-brand-border/50 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative group/res overflow-hidden"
                            >
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-primary animate-pulse shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.5)]" />
                                <div className="absolute -right-20 -bottom-20 opacity-5 group-hover/res:opacity-10 transition-opacity">
                                    <Activity size={300} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em]">System Output // Derivation Complete</div>
                                    </div>
                                    <h4 className="text-4xl font-black text-brand-text mb-10 tracking-tightest leading-none">{aiFormula.name}</h4>
                                    <div className="bg-brand-bg p-10 rounded-[2.5rem] border-2 border-brand-border shadow-inner flex items-center justify-center mb-10 group/formula">
                                        <div className="markdown-body prose prose-invert max-w-none text-2xl font-mono overflow-x-auto no-scrollbar w-full text-center group-hover/formula:scale-110 transition-transform duration-700">
                                            <ReactMarkdown>{aiFormula.eq}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 items-start">
                                        <div className="w-1.5 h-auto self-stretch bg-brand-primary/30 rounded-full" />
                                        <p className="text-brand-text-secondary text-lg leading-relaxed italic tracking-wide font-medium">
                                            {aiFormula.explanation}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {categories.map((cat, cIdx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: cIdx * 0.1 }}
                        key={cat.name} 
                        className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md hover:border-brand-primary/50 transition-all duration-500 shadow-xl group/card relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                            <BookOpen size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-brand-border/20">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <Layers size={20} />
                            </div>
                            <h3 className="text-xs font-black text-brand-text uppercase tracking-[0.4em]">{cat.name}</h3>
                        </div>
                        <div className="space-y-10">
                            {cat.formulas.map((f, fIdx) => (
                                <div key={f.name} className="space-y-4 group/item">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="text-[9px] font-black text-brand-text-secondary uppercase tracking-[0.2em] group-hover/item:text-brand-primary transition-colors">{f.name}</div>
                                        <div className="text-[8px] font-mono text-brand-text-secondary/20">0{fIdx+1}</div>
                                    </div>
                                    <div className="bg-brand-bg/50 p-6 rounded-2xl border border-transparent group-hover/item:border-brand-primary/30 transition-all shadow-inner group-hover/item:scale-105 duration-300">
                                        <div className="markdown-body prose prose-invert prose-brand text-xs overflow-x-auto no-scrollbar font-mono text-center">
                                            <ReactMarkdown>{`$${f.eq}$`}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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
        citation += `"${title || 'Untitled Document'}." `;
        if (publisher) citation += `${publisher}, `;
        if (year) citation += `${year}, `;
        if (url) citation += `${url}.`;
        return citation.trim().replace(/,$/, '.');
    }, [authorLast, authorFirst, title, publisher, year, url]);

    const apa = useMemo(() => {
        let citation = '';
        if (authorLast) citation += `${authorLast}${authorFirst ? `, ${authorFirst.charAt(0)}.` : ''} `;
        if (year) citation += `(${year}). `;
        citation += `${title || 'Untitled Document'}. `;
        if (publisher) citation += `${publisher}. `;
        if (url) citation += `${url}`;
        return citation.trim();
    }, [authorLast, authorFirst, title, publisher, year, url]);

    const copyCitation = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-brand-surface/40 p-12 rounded-[4rem] border border-brand-border/50 max-w-5xl mx-auto backdrop-blur-md shadow-2xl relative overflow-hidden group/citation">
             <div className="absolute top-0 right-0 p-16 opacity-5 group-hover/citation:opacity-10 transition-opacity">
                <Quote size={200} className="-rotate-12" />
            </div>
            <div className="relative z-10 w-full">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                        <Quote size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-brand-text uppercase tracking-widest">Bibliographic Engine</h3>
                        <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black">Formal Academic Attribution Matrix // Ver-IX</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 bg-brand-bg/30 p-10 rounded-[3rem] border border-brand-border/20 shadow-inner">
                    <div className="space-y-1 group/field">
                        <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-3 group-hover/field:text-brand-primary transition-colors">Archive Sequence Classification</label>
                        <div className="relative">
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-brand-bg/60 border border-brand-border rounded-2xl p-5 text-sm font-bold text-brand-text outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all appearance-none cursor-pointer">
                                <option value="website">Digital Document (Website)</option>
                                <option value="book">Hardcover Manuscript (Book)</option>
                                <option value="article">Scholarly Periodical (Article)</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary opacity-30">
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>
                    <Input label="Temporal Node (Year)" id="cite_year" type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" className="bg-brand-bg/60" />
                    <Input label="Scholar Surname" id="cite_last" type="text" value={authorLast} onChange={e => setAuthorLast(e.target.value)} placeholder="e.g. von Neumann" className="bg-brand-bg/60" />
                    <Input label="Scholar Given Name" id="cite_first" type="text" value={authorFirst} onChange={e => setAuthorFirst(e.target.value)} placeholder="e.g. John" className="bg-brand-bg/60" />
                    <div className="md:col-span-2">
                        <Input label="Document Nomenclature (Title)" id="cite_title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Theory of Self-Reproducing Automata" className="bg-brand-bg/60" />
                    </div>
                    <div className="md:col-span-2">
                        <Input label="Publisher / Institutional Repository" id="cite_publisher" type="text" value={publisher} onChange={e => setPublisher(e.target.value)} placeholder="e.g. University of Illinois Press" className="bg-brand-bg/60" />
                    </div>
                    {type === 'website' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
                            <Input label="Digital Locator Link (URL)" id="cite_url" type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://archive.scholarly-domain.net/..." className="bg-brand-bg/60" />
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {[
                        { label: 'MLA // 9th Expansion', citation: mla, id: 'mla' },
                        { label: 'APA // 7th Foundation', citation: apa, id: 'apa' }
                    ].map((style) => (
                        <div key={style.id} className="bg-brand-bg/80 p-10 rounded-[3.5rem] border-2 border-brand-border/50 relative group/style hover:border-brand-primary/50 transition-all duration-500 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),1)]" />
                                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em]">{style.label}</div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => copyCitation(style.citation)} 
                                    className="p-4 bg-brand-surface rounded-2xl text-brand-text-secondary hover:text-brand-primary transition-all border border-brand-border/50 shadow-xl group/copy"
                                >
                                    <Copy size={18} className="group-hover/copy:scale-110 transition-transform" />
                                </motion.button>
                            </div>
                            <div className="font-serif text-xl text-brand-text leading-relaxed bg-brand-bg/40 p-10 rounded-[2.5rem] border border-brand-border/30 min-h-[160px] flex items-center justify-center italic text-center tracking-wide shadow-inner">
                                {style.citation || <span className="opacity-10 uppercase font-sans text-xs tracking-[0.5em] font-black text-brand-primary line-clamp-1">Awaiting Data stream...</span>}
                            </div>
                            <div className="mt-8 flex justify-center opacity-10 uppercase font-mono text-[8px] tracking-[0.3em] font-black text-brand-text-secondary">
                                // System-Generated Attribution Node
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 7. Flashcards ---
const Flashcards = () => {
    const [cards, setCards] = useState<{id: number, front: string, back: string}[]>([
        { id: 1, front: 'Quantum Superposition', back: 'A fundamental principle of quantum mechanics where a physical system exists partly in all its theoretically possible states simultaneously.' },
        { id: 2, front: 'Heisenberg Uncertainty', back: 'States that the more precisely the position of a particle is determined, the less precisely its momentum can be predicted.' },
        { id: 3, front: 'Entanglement', back: 'A phenomenon where two particles become linked and share the same existence, even when separated by vast distances.' }
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
        <div className="max-w-5xl mx-auto space-y-16 lg:px-8">
            {cards.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-12 bg-brand-primary/10 px-8 py-3 rounded-full border border-brand-primary/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.15)] flex items-center gap-3">
                        <Activity size={14} className="animate-pulse" />
                        Recursive Memory Unit {currentIndex + 1} // {cards.length}
                    </div>
                    
                    <div 
                        className="w-full h-[450px] cursor-pointer group relative"
                        style={{ perspective: '2500px' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="absolute inset-0 bg-brand-primary/10 blur-[100px] rounded-full opacity-40 animate-pulse" />
                        
                        <motion.div 
                            className="relative w-full h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        >
                            {/* Front */}
                            <div 
                                className="absolute inset-0 bg-brand-surface/80 backdrop-blur-2xl border-2 border-brand-border/50 rounded-[4rem] p-16 flex flex-col items-center justify-center text-center shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <div className="absolute top-0 left-0 p-12 opacity-5">
                                    <BrainCircuit size={180} />
                                </div>
                                <div className="absolute -right-10 -bottom-10 opacity-5">
                                    <Zap size={140} />
                                </div>
                                <h3 className="text-5xl font-black text-brand-text tracking-tightest leading-[1.1] mb-10">{cards[currentIndex].front}</h3>
                                <div className="mt-8 flex items-center gap-3 text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                    <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                                    <span>Trigger Flip Protocol</span>
                                </div>
                            </div>
                            {/* Back */}
                            <div 
                                className="absolute inset-0 bg-brand-primary text-brand-bg rounded-[4rem] p-16 flex flex-col items-center justify-center text-center shadow-[0_40px_100px_rgba(var(--brand-primary-rgb),0.3)]"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Sparkles size={180} />
                                </div>
                                <p className="text-2xl font-bold leading-relaxed max-w-2xl italic tracking-wide">{cards[currentIndex].back}</p>
                                <div className="mt-12 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.6em] opacity-60">
                                    <ShieldCheck size={18} />
                                    Verification Complete
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-8 mt-16 bg-brand-bg/50 p-3 rounded-[2.5rem] border border-brand-border/30 backdrop-blur-md shadow-2xl">
                        <motion.button whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.9 }} onClick={prevCard} className="w-16 h-16 bg-brand-surface hover:bg-brand-text hover:text-brand-bg rounded-2xl transition-all flex items-center justify-center shadow-xl group border border-brand-border/50">
                            <ChevronLeft size={28} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, y: 5 }} whileTap={{ scale: 0.9 }} onClick={() => deleteCard(cards[currentIndex].id)} className="w-16 h-16 text-red-400 hover:bg-red-400/20 rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-red-400/30" title="Purge Node">
                            <Trash2 size={28} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }} onClick={nextCard} className="w-16 h-16 bg-brand-surface hover:bg-brand-text hover:text-brand-bg rounded-2xl transition-all flex items-center justify-center shadow-xl border border-brand-border/50">
                            <ChevronRight size={28} />
                        </motion.button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-32 bg-brand-surface/40 rounded-[4rem] border-2 border-brand-border/50 border-dashed backdrop-blur-md">
                    <Layers size={80} className="mx-auto text-brand-border mb-8 animate-pulse opacity-30" />
                    <p className="text-2xl font-black text-brand-text-secondary uppercase tracking-[0.5em]">Memory Store Depleted</p>
                    <p className="text-sm text-brand-text-secondary/60 mt-4 tracking-widest font-mono italic">// Initialize new knowledge nodes for ingestion.</p>
                </div>
            )}

            <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/add">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/add:opacity-10 transition-opacity">
                    <Plus size={150} />
                </div>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                        <Sparkles size={24} />
                    </div>
                    <h4 className="text-xl font-black text-brand-text uppercase tracking-widest">Neural Knowledge Ingestion</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
                    <div className="space-y-8">
                        <Input label="Neural Trigger Node (Front)" id="card_front" type="text" value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="e.g. Concept, Term, or Formula" className="bg-brand-bg/50" />
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Synthesis Resolution (Back)</label>
                            <textarea value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Provide the core logic, definition, or solution..." className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-6 text-sm outline-none focus:ring-4 focus:ring-brand-primary/10 h-40 resize-none transition-all font-medium text-brand-text placeholder:opacity-30" />
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addCard} 
                        className="h-[272px] bg-brand-text text-brand-bg font-black uppercase tracking-[0.4em] text-[12px] rounded-[2.5rem] hover:bg-brand-primary hover:text-white transition-all shadow-2xl flex flex-col items-center justify-center gap-6 group/btn"
                    >
                        <div className="w-20 h-20 bg-brand-bg/10 rounded-full flex items-center justify-center border-4 border-brand-bg/20 group-hover/btn:scale-110 transition-transform duration-500">
                            <Layers size={32} />
                        </div>
                        <div className="text-center">
                            <span>Commit to Memory Matrix</span>
                            <p className="text-[8px] opacity-40 mt-2 font-mono tracking-[0.2em] italic">// Persistence Protocol Active</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

// --- 8. Assignment Tracker ---
const AssignmentTracker = () => {
    const [assignments, setAssignments] = useState<{id: number, title: string, subject: string, date: string, priority: 'low' | 'medium' | 'high', done: boolean}[]>(() => {
        try { return JSON.parse(localStorage.getItem('academic_assignments') || '[]'); } catch { return []; }
    });
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    useEffect(() => {
        localStorage.setItem('academic_assignments', JSON.stringify(assignments));
    }, [assignments]);

    const addAssignment = () => {
        if (!title.trim()) return;
        setAssignments([...assignments, { id: Date.now(), title, subject, date, priority, done: false }]);
        setTitle(''); setSubject(''); setDate(''); setPriority('medium');
    };

    const toggleDone = (id: number) => {
        setAssignments(assignments.map(a => a.id === id ? { ...a, done: !a.done } : a));
    };

    const deleteAssignment = (id: number) => {
        setAssignments(assignments.filter(a => a.id !== id));
    };

    const sortedAssignments = [...assignments].sort((a, b) => {
        if (a.done === b.done) {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            if (priorityMap[a.priority] !== priorityMap[b.priority]) {
                return priorityMap[b.priority] - priorityMap[a.priority];
            }
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return a.done ? 1 : -1;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/tracker">
                <div className="absolute top-0 right-0 p-16 opacity-5 group-hover/tracker:opacity-10 transition-opacity">
                    <Target size={180} />
                </div>
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                        <Target size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-brand-text uppercase tracking-widest">Milestone Log Engine</h3>
                        <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black">Strategic Objective & Deadline Management Matrix</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 bg-brand-bg/30 p-10 rounded-[3rem] border border-brand-border/20 shadow-inner">
                    <Input label="Objective Designation" id="as_title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Master Thesis Beta" className="bg-brand-bg/60" />
                    <Input label="Discipline Core" id="as_subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Astrophysics" className="bg-brand-bg/60" />
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Terminal Deadline</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-brand-bg/60 border border-brand-border rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-brand-text placeholder:opacity-30" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Priority Level</label>
                        <select 
                            value={priority} 
                            onChange={e => setPriority(e.target.value as any)}
                            className="w-full bg-brand-bg/60 border border-brand-border rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-brand-text"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addAssignment} 
                    className="w-full py-6 bg-brand-primary text-brand-bg font-black uppercase tracking-[0.5em] text-[12px] rounded-[2rem] hover:bg-brand-secondary transition-all shadow-2xl shadow-brand-primary/40 flex items-center justify-center gap-4 group/addbtn"
                >
                    <Plus size={24} className="group-hover/addbtn:rotate-180 transition-transform duration-500" />
                    <span>Initialize Tracking Node</span>
                </motion.button>
            </div>

            <div className="grid lg:grid-cols-1 gap-6 px-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {sortedAssignments.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-24 bg-brand-surface/20 rounded-[4rem] border-2 border-brand-border/30 border-dashed backdrop-blur-sm"
                        >
                            <ShieldCheck size={64} className="mx-auto text-emerald-500/30 mb-6 animate-pulse" />
                            <p className="text-[12px] font-black text-brand-text-secondary uppercase tracking-[0.6em]">All objectives secured. Zero pending active nodes.</p>
                            <div className="mt-4 text-[8px] font-mono text-brand-text-secondary/20 uppercase tracking-[0.3em]">System clear for next phase // convergence 100%</div>
                        </motion.div>
                    ) : (
                        sortedAssignments.map((a, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 30 }}
                                transition={{ delay: idx * 0.05 }}
                                key={a.id} 
                                className={`group flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 ${a.done ? 'bg-emerald-500/5 border-emerald-500/30 opacity-60' : 'bg-brand-surface/60 border-brand-border/50 hover:border-brand-primary shadow-2xl'}`}
                            >
                                <div className="flex items-center gap-10">
                                    <motion.button 
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => toggleDone(a.id)} 
                                        className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-4 transition-all duration-500 ${a.done ? 'bg-emerald-500 border-emerald-500 text-brand-bg shadow-[0_0_30px_rgba(16,185,129,0.4)] rotate-0' : 'bg-brand-bg/50 border-brand-border text-transparent hover:border-brand-primary -rotate-12 hover:rotate-0'}`}
                                    >
                                        <Check size={32} strokeWidth={4} />
                                    </motion.button>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`text-2xl font-black tracking-tightest leading-none ${a.done ? 'line-through text-brand-text-secondary/50' : 'text-brand-text'}`}>{a.title}</div>
                                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                a.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                a.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                            }`}>
                                                {a.priority}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            {a.subject && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                                    <BookOpen size={12} />
                                                    {a.subject}
                                                </div>
                                            )}
                                            {a.date && (
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-bg/50 border border-brand-border text-[9px] font-black uppercase tracking-[0.2em] ${!a.done && new Date(a.date) < new Date() ? 'text-red-400 border-red-400/30 pulse' : 'text-brand-text-secondary/60'}`}>
                                                    <Activity size={12} />
                                                    {a.done ? 'Manifest Fulfilled' : `Due Node: ${a.date}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteAssignment(a.id)} className="w-14 h-14 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/20 rounded-2xl transition-all duration-300">
                                    <Trash2 size={24} />
                                </motion.button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- 9. Notes Tool (Structured Archives) ---
const NotesTool = () => {
    const [notes, setNotes] = useState<{id: number, title: string, content: string, category: string, date: string}[]>(() => {
        try { return JSON.parse(localStorage.getItem('academic_notes') || '[]'); } catch { return []; }
    });
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'vault' | 'scratchpad'>('vault');
    const [quickNotes, setQuickNotes] = useState<string>(() => localStorage.getItem('quick_notes') || '');
    const [selectedNote, setSelectedNote] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('academic_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('quick_notes', quickNotes);
    }, [quickNotes]);

    const addNote = () => {
        if (!title.trim() || !content.trim()) return;
        const newNote = {
            id: Date.now(),
            title,
            category,
            content,
            date: new Date().toLocaleDateString()
        };
        setNotes([newNote, ...notes]);
        setTitle('');
        setContent('');
    };

    const deleteNote = (id: number) => {
        setNotes(notes.filter(n => n.id !== id));
        if (selectedNote === id) setSelectedNote(null);
    };

    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase())
    );

    const activeNote = notes.find(n => n.id === selectedNote);

    return (
        <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex justify-center">
                <div className="flex bg-brand-surface/40 p-2 rounded-[2.5rem] border border-brand-border/30 backdrop-blur-md shadow-2xl">
                    <button 
                        onClick={() => { setActiveTab('vault'); setSelectedNote(null); }}
                        className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${activeTab === 'vault' ? 'bg-brand-primary text-brand-bg shadow-[0_15px_40px_rgba(var(--brand-primary-rgb),0.3)] scale-105' : 'text-brand-text-secondary hover:text-brand-text'}`}
                    >
                        Long-Term Vaults
                    </button>
                    <button 
                        onClick={() => { setActiveTab('scratchpad'); setSelectedNote(null); }}
                        className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${activeTab === 'scratchpad' ? 'bg-brand-primary text-brand-bg shadow-[0_15px_40px_rgba(var(--brand-primary-rgb),0.3)] scale-105' : 'text-brand-text-secondary hover:text-brand-text'}`}
                    >
                        Volatile Scratchpad
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'vault' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="vault"
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                        <div className="lg:col-span-4 space-y-10">
                            <div className="bg-brand-surface/40 p-12 rounded-[4rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/entry">
                                <div className="absolute top-0 left-0 p-10 opacity-5 group-hover/entry:opacity-10 transition-opacity">
                                    <StickyNote size={180} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                                            <Plus size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">New Archive</h3>
                                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">Archive Formalization Protocol</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <Input label="Node Designation (Title)" id="note_title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Relativistic Mass Synthesis" className="bg-brand-bg/50" />
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Segment Classification (Tag)</label>
                                            <input 
                                                value={category} 
                                                onChange={e => setCategory(e.target.value)} 
                                                className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-5 text-sm font-bold text-brand-text outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:opacity-30" 
                                                placeholder="General, Research, Lab, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Encoded Logic (Markdown Supported)</label>
                                            <textarea 
                                                value={content} 
                                                onChange={e => setContent(e.target.value)} 
                                                className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-6 text-sm font-medium text-brand-text outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all h-60 resize-none placeholder:opacity-30" 
                                                placeholder="Begin formal archive documentation..."
                                            />
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={addNote} 
                                            className="w-full py-5 bg-brand-primary text-brand-bg font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-2xl shadow-brand-primary/30 active:scale-95 transition-all"
                                        >
                                            Commit to Archive Phase
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-8">
                            {selectedNote !== null && activeNote ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-brand-surface/60 border border-brand-primary/30 rounded-[4rem] p-16 shadow-2xl min-h-[600px] flex flex-col backdrop-blur-3xl"
                                >
                                    <div className="flex items-center justify-between mb-12">
                                        <button 
                                            onClick={() => setSelectedNote(null)}
                                            className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-primary transition-colors group"
                                        >
                                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Library</span>
                                        </button>
                                        <div className="flex gap-4">
                                            <div className="px-4 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary">{activeNote.category}</div>
                                            <button onClick={() => deleteNote(activeNote.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black text-brand-text tracking-tight border-l-8 border-brand-primary pl-8 mb-10">{activeNote.title}</h2>
                                    <div className="markdown-body prose prose-invert prose-brand max-w-none flex-1">
                                        <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-brand-border/20 text-[10px] font-mono text-brand-text-secondary opacity-30 flex justify-between uppercase tracking-widest">
                                        <div>// Timestamp: {activeNote.date}</div>
                                        <div>// Hash: {activeNote.id.toString(16).toUpperCase()}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="relative group/search">
                                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within/search:text-brand-primary transition-colors" size={24} />
                                        <input 
                                            type="text" 
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Search archive nodes by title, content, or tag classification..."
                                            className="w-full bg-brand-surface/40 border border-brand-border/50 rounded-[2.5rem] pl-20 pr-10 py-6 text-lg font-bold text-brand-text focus:ring-8 focus:ring-brand-primary/5 outline-none backdrop-blur-md transition-all shadow-xl placeholder:opacity-20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {filteredNotes.map((note, idx) => (
                                                <motion.div 
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={note.id} 
                                                    onClick={() => setSelectedNote(note.id)}
                                                    className="bg-brand-surface/40 p-10 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md group/note relative hover:border-brand-primary/50 transition-all duration-500 cursor-pointer flex flex-col shadow-2xl hover:scale-[1.02]"
                                                >
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] font-mono">
                                                                {note.category}
                                                            </div>
                                                            <div className="text-[8px] font-mono text-brand-text-secondary/30 uppercase tracking-widest">{note.date}</div>
                                                        </div>
                                                        <div onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="w-10 h-10 flex items-center justify-center text-brand-text-secondary/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                                            <Trash2 size={18} />
                                                        </div>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-brand-text mb-6 tracking-tight group-hover/note:text-brand-primary transition-colors leading-none">{note.title}</h4>
                                                    <p className="text-brand-text-secondary text-sm leading-relaxed line-clamp-4 mb-10 italic flex-1">{note.content}</p>
                                                    <div className="pt-6 border-t border-brand-border/20 flex gap-2 overflow-hidden items-center justify-between">
                                                        <div className="flex items-center gap-2 opacity-20 uppercase font-mono text-[8px] tracking-[0.3em] font-black">
                                                            // Read full archive node
                                                        </div>
                                                        <div className="p-3 bg-brand-primary text-brand-bg rounded-xl shadow-lg">
                                                            <ChevronRight size={14} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {filteredNotes.length === 0 && (
                                            <div className="col-span-full py-32 text-center">
                                                <Layers size={64} className="mx-auto text-brand-text-secondary/10 mb-8" />
                                                <div className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-text-secondary/40">Zero resultants found for search query.</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="scratchpad"
                        className="max-w-5xl mx-auto"
                    >
                        <div className="bg-brand-surface/40 p-12 rounded-[4rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/scratch">
                            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-focus-within/scratch:opacity-20 transition-opacity">
                                <Zap size={240} className="animate-pulse" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20">
                                            <Activity size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Logic Scratchpad</h3>
                                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black">Unstructured High-Volatility Data Ingestion</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-2 bg-brand-bg/50 rounded-full border border-brand-border text-[9px] font-black uppercase tracking-[0.5em] text-emerald-500 pulse">
                                        <Activity size={12} />
                                        Real-time Sync Active
                                    </div>
                                </div>
                                <textarea 
                                    value={quickNotes}
                                    onChange={e => setQuickNotes(e.target.value)}
                                    placeholder="Initiate unstructured data capture. All characters are automatically synced to local persistence layer. Cleanse periodically to optimize recall..."
                                    className="w-full bg-brand-bg/40 border-2 border-brand-border rounded-[3rem] p-12 text-lg font-medium leading-relaxed text-brand-text outline-none focus:ring-[15px] focus:ring-brand-primary/5 focus:border-brand-primary min-h-[600px] transition-all shadow-inner placeholder:italic placeholder:opacity-20 scroll-smooth custom-scrollbar"
                                />
                                <div className="mt-8 flex justify-between items-center text-[9px] font-mono text-brand-text-secondary/40 font-black uppercase tracking-[0.4em]">
                                    <div>// Volatile Buffer State: {quickNotes.length} chars</div>
                                    <div>// Encryption Layer: AES-Node-X</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- 10. AI Tutor Workspace ---
const AITutor = () => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: "Systems online. I am **Nolo**, your terminal-optimized academic liaison. \n\nI specialize in algorithmic derivation, conceptual synthesis, and scientific inquiry. How shall we expand your knowledge base today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<'chat' | 'step-by-step' | 'explanation'>('chat');
    const [subject, setSubject] = useState('General');
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
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("Gemini API key is not configured.");
            
            const ai = new GoogleGenAI({ apiKey });
            
            let systemPrompt = `You are Nolo, a high-level academic tutor and research assistant. 
            Current Subject Focus: ${subject}. 
            Mode: ${workspaceMode}.
            Guidelines:
            1. Use formal but encouraging academic tone.
            2. Break down complex derivations step-by-step.
            3. Use LaTeX-style formatting for all math formulas (surround with $ or $$ for display).
            4. At the end of your response, PROVIDE 3 "Suggested Follow-up" questions or directions as a bulleted list at the very end of the markdown, starting with the phrase "GUIDED PATHS:".`;
            
            if (workspaceMode === 'step-by-step') {
                systemPrompt += " FOCUS: Be extremely detail-oriented. Index every logical transition as a [DERIVATION STEP].";
            } else if (workspaceMode === 'explanation') {
                systemPrompt += " FOCUS: Prioritize first-principles thinking and visual analogies.";
            }

            const historyParts = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [...historyParts, { role: 'user', parts: [{ text: userText }] }],
                config: {
                    systemInstruction: systemPrompt,
                }
            });
            
            setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', text: `CRITICAL ERROR: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyChat = () => {
        const text = messages.map(m => `**${m.role === 'user' ? 'Scholar' : 'Nolo AI'}**: ${m.text}`).join('\n\n');
        navigator.clipboard.writeText(text);
    };

    const downloadChat = () => {
        const text = messages.map(m => `**${m.role === 'user' ? 'Scholar' : 'Nolo AI'}**: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nolo-derivation-log-${new Date().toISOString().slice(0,10)}.md`;
        a.click();
    };

    const quickActions = [
        { label: 'Synthesize Concept', icon: BookOpen, prompt: 'Synthesize the core mechanics of ' },
        { label: 'Algorithmic Solve', icon: BrainCircuit, prompt: 'Apply first principles to solve: ' },
        { label: 'Identify Fallacies', icon: Search, prompt: 'Analyze this logic for potential heuristic errors: ' },
        { label: 'Simulate Exam', icon: CheckSquare, prompt: 'Generate 3 high-difficulty evaluation problems for ' },
    ];

    const subjects = ['General', 'Theoretical Physics', 'Applied Mathematics', 'Organic Chemistry', 'Computer Science', 'Philosophy'];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[750px] animate-fade-in">
            {/* Sidebar Controls */}
            <div className="lg:w-64 flex flex-col gap-6">
                <div className="bg-brand-surface/40 p-5 rounded-3xl border border-brand-border/50 space-y-6 backdrop-blur-md">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] pl-1">Knowledge focus</h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {subjects.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSubject(s)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold text-left transition-all border ${subject === s ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-brand-bg/30 border-brand-border/30 text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg/50'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] pl-1">Logic Pattern</h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {(['chat', 'step-by-step', 'explanation'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setWorkspaceMode(mode)}
                                    className={`p-3 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest ${workspaceMode === mode ? 'bg-brand-text text-brand-bg border-brand-text shadow-xl' : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:border-brand-primary/50'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="bg-brand-surface/20 p-5 rounded-3xl border border-brand-border/30 mt-auto space-y-4">
                    <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Active Presets</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {quickActions.map(action => (
                            <button
                                key={action.label}
                                onClick={() => setInput(action.prompt)}
                                className="w-full p-3 text-[9px] bg-brand-surface/40 border border-brand-border/50 rounded-xl text-left hover:bg-brand-primary hover:text-white transition-all flex items-center gap-3 group"
                            >
                                <div className="w-6 h-6 rounded-lg bg-brand-bg flex items-center justify-center text-brand-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <action.icon size={12} />
                                </div>
                                <span className="font-bold uppercase tracking-wider">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 bg-brand-surface/40 rounded-[2.5rem] border border-brand-border flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl group/chat relative">
                <div className="p-6 border-b border-brand-border bg-brand-surface/80 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-bg shadow-xl shadow-brand-primary/20 relative">
                            <BrainCircuit size={24} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-brand-bg rounded-full animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-brand-text text-sm uppercase tracking-widest">Nolo Module</h3>
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Active</div>
                            </div>
                            <p className="text-[10px] text-brand-text-secondary font-mono tracking-wider">SECURE_CHANNEL // SYNCED: {subject.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={copyChat} className="p-2.5 text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text rounded-xl transition-all" title="Copy Chat">
                            <Copy size={18} />
                        </button>
                        <button onClick={downloadChat} className="p-2.5 text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text rounded-xl transition-all" title="Download Session">
                            <Download size={18} />
                        </button>
                        <div className="w-px h-6 bg-brand-border mx-1" />
                        <button onClick={() => setMessages([messages[0]])} className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-all" title="Reset Session">
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth no-scrollbar">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] relative`}>
                                {msg.role === 'model' && (
                                    <div className="absolute -top-4 left-0 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">Nolo AI Response</div>
                                )}
                                <div className={`p-6 rounded-[2rem] shadow-xl ${msg.role === 'user' ? 'bg-brand-text text-brand-bg rounded-tr-none' : 'bg-brand-bg/60 border border-brand-border text-brand-text rounded-tl-none backdrop-blur-sm'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="whitespace-pre-wrap font-bold text-sm tracking-wide leading-relaxed">{msg.text}</div>
                                    ) : (
                                        <div className="markdown-body prose prose-invert prose-brand max-w-none text-sm leading-relaxed">
                                            <ReactMarkdown>{msg.text.split('GUIDED PATHS:')[0]}</ReactMarkdown>
                                            
                                            {msg.text.includes('GUIDED PATHS:') && (
                                                <div className="mt-8 pt-6 border-t border-brand-border/30 space-y-4">
                                                    <div className="flex items-center gap-2 text-brand-primary">
                                                        <Zap size={14} className="fill-current" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Guided Derivations</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.text.split('GUIDED PATHS:')[1].split('\n').filter(l => l.trim().startsWith('*') || l.trim().startsWith('-')).map((line, lIdx) => {
                                                            const text = line.replace(/^\s*[*-]\s*/, '').trim();
                                                            return (
                                                                <button
                                                                    key={lIdx}
                                                                    onClick={() => handleSend(text)}
                                                                    className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                                                                >
                                                                    {text}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="absolute -top-4 right-0 text-[8px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Researcher Input</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-brand-bg/40 border border-brand-border p-6 rounded-[2rem] rounded-tl-none flex items-center gap-4 backdrop-blur-md">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Decoding Quantum State...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-8 bg-brand-bg/80 border-t border-brand-border backdrop-blur-xl relative z-10">
                    <div className="flex gap-4 items-end">
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
                                placeholder="Transmit data or inquiry for Nolo..."
                                className="w-full bg-brand-surface/40 border border-brand-border rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary min-h-[60px] max-h-[200px] resize-none transition-all font-medium placeholder:text-brand-text-secondary/30"
                            />
                            <div className="absolute right-4 bottom-4 flex items-center gap-3">
                                <div className="flex items-center gap-2 px-2 py-1 bg-brand-bg/50 rounded-md border border-brand-border">
                                    <span className="text-[8px] text-brand-text-secondary font-black uppercase tracking-tighter">Enter to send</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-brand-bg/50 rounded-md border border-brand-border">
                                    <span className="text-[8px] text-brand-text-secondary font-black uppercase tracking-tighter">Shift+Enter new line</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 disabled:grayscale text-brand-bg w-16 h-16 rounded-2xl transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center group/send active:scale-95"
                        >
                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SCALES = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, mile: 0.000621371, yard: 1.09361, feet: 3.28084, inch: 39.3701, nm: 1e9, angstrom: 1e10, 'light-year': 1.057e-16 } as Record<string, number>,
    mass: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274, 'atomic-mass-unit': 6.022e+26, ton: 0.00110231 } as Record<string, number>,
    energy: { joule: 1, kilojoule: 0.001, calorie: 0.239006, electronvolt: 6.242e+18, 'watt-hour': 0.000277778, btu: 0.000947817 } as Record<string, number>,
    pressure: { pascal: 1, bar: 1e-5, atm: 9.8692e-6, torr: 0.00750062, psi: 0.000145038 } as Record<string, number>,
    temperature: { celsius: 'C', fahrenheit: 'F', kelvin: 'K' } as Record<string, any>
};

// --- 11. Scientific Unit Converter ---
const ScientificUnitConverter = () => {
    const [value, setValue] = useState('1');
    const [category, setCategory] = useState<keyof typeof SCALES>('length');
    const [from, setFrom] = useState('m');
    const [to, setTo] = useState('km');

    const currentUnits = Object.keys(SCALES[category]);

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val)) return '0';
        
        if (category === 'temperature') {
            let base = val;
            if (from === 'fahrenheit') base = (val - 32) * 5/9;
            if (from === 'kelvin') base = val - 273.15;
            
            if (to === 'fahrenheit') return (base * 9/5 + 32).toFixed(4);
            if (to === 'kelvin') return (base + 273.15).toFixed(4);
            return base.toFixed(4);
        }

        const scales = SCALES[category] as Record<string, number>;
        const inBase = val / scales[from];
        return (inBase * scales[to]).toExponential(4).replace(/e\+0/g, 'e').replace(/e-0/g, 'e-');
    }, [value, category, from, to]);

    return (
        <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 max-w-5xl mx-auto backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <RotateCcw size={180} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                        <RotateCcw size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Dimension Phase Swapper</h3>
                        <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">Multi-Scale Physical Unit Protocol // Alpha-7</p>
                    </div>
                </div>

                <div className="flex gap-2 p-2 bg-brand-bg/50 border border-brand-border/30 rounded-[2rem] mb-12 overflow-x-auto no-scrollbar shadow-inner backdrop-blur-sm">
                    {Object.keys(SCALES).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => {
                                setCategory(cat as any);
                                const units = Object.keys(SCALES[cat as keyof typeof SCALES]);
                                setFrom(units[0]);
                                setTo(units[1] || units[0]);
                            }}
                            className={`px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-brand-primary text-brand-bg shadow-2xl scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/40'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8 bg-brand-bg/30 p-8 rounded-[2.5rem] border border-brand-border/20 shadow-inner">
                        <Input label="Scalar Magnitude // Input" id="conv_val" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0.00" className="bg-brand-surface/60" />
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Source Domain Matrix</label>
                            <div className="relative group/sel">
                                <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-brand-surface/60 border border-brand-border/50 rounded-2xl p-5 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-all appearance-none cursor-pointer group-hover/sel:border-brand-primary/50">
                                    {currentUnits.map(u => <option key={u} value={u} className="bg-brand-bg text-brand-text">{u.toUpperCase()}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary">
                                    <ChevronDown size={18} className="opacity-30 group-hover/sel:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-12 bg-brand-bg/60 rounded-[3rem] border-2 border-brand-border flex flex-col items-center justify-center min-h-[220px] shadow-2xl relative group/res overflow-hidden">
                            <div className="absolute top-4 left-6 text-[9px] font-black text-brand-primary uppercase tracking-[0.5em] opacity-40">Resulting Vector magnitude</div>
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover/res:opacity-10 transition-opacity">
                                <Activity size={160} />
                            </div>
                            <div className="text-6xl font-black font-mono text-brand-text truncate w-full text-center tracking-tightest group-hover/res:scale-110 transition-transform duration-500">
                                {result}
                            </div>
                            <div className="absolute bottom-4 text-[8px] font-mono text-brand-text-secondary/30 uppercase tracking-[0.4em]">// Scientific Notation Encoded</div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2 mb-2">Target Domain Matrix</label>
                            <div className="relative group/sel2">
                                <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-5 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-all appearance-none cursor-pointer group-hover/sel2:border-brand-primary/50">
                                    {currentUnits.map(u => <option key={u} value={u} className="bg-brand-bg text-brand-text">{u.toUpperCase()}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary">
                                    <ChevronDown size={18} className="opacity-30 group-hover/sel2:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 12. Periodic Table ---
const PeriodicTable = () => {
    const elements = [
        { s: 'H', n: 'Hydrogen', a: 1.008, c: 'bg-emerald-500', cat: 'Reactive Nonmetal', state: 'Gas' },
        { s: 'He', n: 'Helium', a: 4.002, c: 'bg-purple-500', cat: 'Noble Gas', state: 'Gas' },
        { s: 'Li', n: 'Lithium', a: 6.941, c: 'bg-red-500', cat: 'Alkali Metal', state: 'Solid' },
        { s: 'Be', n: 'Beryllium', a: 9.012, c: 'bg-orange-500', cat: 'Alkaline Earth Metal', state: 'Solid' },
        { s: 'B', n: 'Boron', a: 10.81, c: 'bg-yellow-500', cat: 'Metalloid', state: 'Solid' },
        { s: 'C', n: 'Carbon', a: 12.01, c: 'bg-green-500', cat: 'Reactive Nonmetal', state: 'Solid' },
        { s: 'N', n: 'Nitrogen', a: 14.01, c: 'bg-blue-500', cat: 'Reactive Nonmetal', state: 'Gas' },
        { s: 'O', n: 'Oxygen', a: 16.00, c: 'bg-indigo-500', cat: 'Reactive Nonmetal', state: 'Gas' },
        { s: 'F', n: 'Fluorine', a: 19.00, c: 'bg-pink-500', cat: 'Reactive Nonmetal', state: 'Gas' },
        { s: 'Ne', n: 'Neon', a: 20.18, c: 'bg-purple-500', cat: 'Noble Gas', state: 'Gas' },
        { s: 'Na', n: 'Sodium', a: 22.98, c: 'bg-red-500', cat: 'Alkali Metal', state: 'Solid' },
        { s: 'Mg', n: 'Magnesium', a: 24.31, c: 'bg-orange-500', cat: 'Alkaline Earth Metal', state: 'Solid' },
        { s: 'Al', n: 'Aluminum', a: 26.98, c: 'bg-gray-500', cat: 'Post-Transition Metal', state: 'Solid' },
        { s: 'Si', n: 'Silicon', a: 28.08, c: 'bg-yellow-500', cat: 'Metalloid', state: 'Solid' },
        { s: 'P', n: 'Phosphorus', a: 30.97, c: 'bg-green-500', cat: 'Reactive Nonmetal', state: 'Solid' },
    ];

    const [selected, setSelected] = useState(elements[0]);

    return (
        <div className="bg-brand-surface/40 p-10 rounded-[3.5rem] border border-brand-border/50 max-w-6xl mx-auto backdrop-blur-md shadow-2xl relative overflow-hidden group/table">
            <div className="absolute -top-20 -left-20 p-40 opacity-5 group-hover/table:opacity-10 transition-opacity">
                <Atom size={300} />
            </div>
            
            <div className="relative z-10 flex flex-col xl:flex-row gap-12">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <Atom size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Elemental Matrix Alpha</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">Standard Atomic Architecture // Periodic Protocol</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 gap-4">
                        {elements.map(el => (
                            <motion.button 
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                key={el.s}
                                onClick={() => setSelected(el)}
                                className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group/el ${selected.s === el.s ? 'border-brand-primary bg-brand-primary/10 shadow-[0_0_25px_rgba(var(--brand-primary-rgb),0.3)]' : 'border-brand-border/40 bg-brand-bg/40 hover:border-brand-primary/40'}`}
                            >
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${el.c} opacity-60 group-hover/el:opacity-100 transition-opacity`} />
                                <span className="text-xl font-black text-brand-text tracking-tighter">{el.s}</span>
                                <span className="text-[8px] font-black text-brand-text-secondary uppercase tracking-widest font-mono">{el.a}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="w-full xl:w-96 flex flex-col gap-6">
                    <div className="bg-brand-bg/60 p-10 rounded-[3rem] border border-brand-border shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group/detail">
                        <div className={`absolute top-0 inset-x-0 h-3 ${selected.c} shadow-[0_4px_20px_rgba(0,0,0,0.5)]`} />
                        <div className="absolute -right-10 -bottom-10 opacity-5 group-hover/detail:opacity-10 transition-opacity">
                            <Atom size={200} />
                        </div>
                        
                        <div className="relative z-10 w-full">
                            <div className="text-8xl font-black text-brand-text mb-2 tracking-tightest group-hover/detail:scale-110 transition-transform duration-700">{selected.s}</div>
                            <div className="text-2xl font-black text-brand-primary uppercase tracking-[0.2em] mb-8">{selected.n}</div>
                            
                            <div className="space-y-5">
                                {[
                                    { label: 'Atomic Mass', val: `${selected.a} u`, icon: Activity },
                                    { label: 'Matter State', val: selected.state, icon: FlaskConical },
                                    { label: 'Classification', val: selected.cat, icon: ShieldCheck }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col items-center py-4 border-b border-brand-border/20 group/row">
                                        <span className="text-[9px] uppercase font-black text-brand-text-secondary tracking-[0.4em] mb-1 group-hover/row:text-brand-primary transition-colors">{row.label}</span>
                                        <span className="text-sm font-black text-brand-text font-mono tracking-wider">{row.val}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-10 w-full py-4 bg-brand-surface border border-brand-border/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                Spectral Data Feed
                                <Zap size={14} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 13. Equation Solver ---
const EquationSolver = () => {
    const [equation, setEquation] = useState('2x + 5 = 15');
    const [result, setResult] = useState<string | null>(null);
    const [steps, setSteps] = useState<string[]>([]);
    const [isSolving, setIsSolving] = useState(false);

    const solveEquation = async () => {
        if (!equation.trim()) return;
        setIsSolving(true);
        try {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const resp = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `Solve this math equation: "${equation}". Provide the final answer and a list of 3-5 logical steps. Return as JSON: {"answer": "x = ...", "steps": ["step 1", "step 2", ...]}`,
                config: { responseMimeType: "application/json" }
            });
            let text = resp.text || '{}';
            // Handle common markdown wrapping if it happens
            text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
            const data = JSON.parse(text);
            setResult(data.answer);
            setSteps(data.steps || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group/solver">
            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover/solver:opacity-10 transition-opacity">
                <Divide size={240} className="-rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-xl shadow-brand-primary/20">
                        <Divide size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Variable Phase Isolator</h3>
                        <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black">AI-Driven Algebraic Resolution Matrix</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-16">
                    <div className="flex-1 relative group/input">
                        <input 
                            type="text" 
                            value={equation} 
                            onChange={e => setEquation(e.target.value)} 
                            placeholder="e.g. sin(x) = 0.5 or 3x² - 4 = 11"
                            className="w-full bg-brand-bg/50 border border-brand-border rounded-[2rem] p-6 font-mono text-2xl text-brand-text outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:opacity-20 shadow-inner group-hover/input:border-brand-primary/30"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20 uppercase font-mono text-[9px] tracking-widest text-brand-primary font-black">
                            // Logic Stream 0xAlpha
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={solveEquation}
                        disabled={isSolving}
                        className="px-12 bg-brand-primary text-brand-bg font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] hover:bg-brand-secondary transition-all shadow-2xl shadow-brand-primary/30 disabled:opacity-50 flex items-center justify-center gap-3 min-h-[72px]"
                    >
                        {isSolving ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                        {isSolving ? "Analyzing Topology..." : "Initiate Resolution"}
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="grid grid-cols-1 xl:grid-cols-3 gap-12"
                        >
                            <div className="xl:col-span-2 space-y-8">
                                <div className="flex items-center gap-3">
                                    <Activity size={14} className="text-brand-primary" />
                                    <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.6em]">Stepwise Phase Derivation</div>
                                </div>
                                <div className="space-y-4">
                                    {steps.map((step, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i} 
                                            className="flex gap-6 p-6 bg-brand-bg/40 border border-brand-border/20 rounded-[2rem] group/step hover:border-brand-primary/30 transition-all backdrop-blur-sm"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border text-brand-primary flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg group-hover/step:bg-brand-primary group-hover/step:text-brand-bg transition-all font-mono">{i+1}</div>
                                            <p className="text-sm text-brand-text-secondary italic leading-relaxed py-1">{step}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:mt-0 xl:mt-8">
                                <div className="bg-brand-bg p-12 rounded-[3.5rem] border-2 border-brand-primary flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(var(--brand-primary-rgb),0.2)] relative overflow-hidden h-fit group/node">
                                    <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-primary animate-pulse" />
                                    <div className="absolute -right-10 -bottom-10 opacity-5 group-hover/node:opacity-10 transition-opacity">
                                        <ShieldCheck size={200} />
                                    </div>
                                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-6">Resolution convergence</div>
                                    <div className="text-4xl font-black text-brand-text font-mono truncate w-full group-hover/node:scale-110 transition-transform duration-700 tracking-tightest">{result}</div>
                                    <div className="mt-8 pt-8 border-t border-brand-border/20 w-full">
                                        <p className="text-[8px] font-mono text-brand-text-secondary/40 uppercase tracking-[0.3em]">
                                            // Verified Node Output 0x7F
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- 13. Practice Bench (Dynamic Problem Sets) ---

interface PracticeProblem {
    q: string;
    a: string;
    hints?: string[];
    answerKey?: string;
    keywords?: string[];
    show?: boolean;
    choices?: string[];
}

const OFFLINE_SAMPLES: Record<string, PracticeProblem[]> = {
    'Math': [
        { 
            q: 'Find the derivative of the composite transcendental function: $f(x) = e^{2x} \\sin(x)$', 
            a: 'Apply the Product Rule: $\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'$. Here, let $u = e^{2x}$ and $v = \\sin(x)$. Their respective derivatives are $u\' = 2e^{2x}$ and $v\' = \\cos(x)$. Combining these, we obtain: \n$$f\'(x) = (2e^{2x}) \\sin(x) + e^{2x} (\\cos(x)) = e^{2x}(2\\sin(x) + \\cos(x))$$',
            hints: [
                'Identify this as a product of two distinct functions, $e^{2x}$ and $\\sin(x)$. Therefore, the Product Rule is mandatory.',
                'The Chain Rule is needed to find the derivative of the exponent part: $\\frac{d}{dx}[e^{2x}] = 2e^{2x}$.',
                'Plug $u\' = 2e^{2x}$ and $v\' = \\cos(x)$ into $u\'v + uv\'$, and factor out $e^{2x}$ for the final form.'
            ],
            answerKey: 'e^{2x}(2\\sin(x) + \\cos(x))',
            keywords: ['2e^{2x}', 'cos', 'sin', 'product']
        },
        { 
            q: 'Solve for the real variable $x$ in the logarithmic equation: $\\log_2(x) + \\log_2(x-2) = 3$', 
            a: 'First, combine files via the rule $\\log_2(A) + \\log_2(B) = \\log_2(A B)$:\n$$\\log_2(x(x-2)) = 3$$\nRewrite this into its corresponding exponential form:\n$$x(x-2) = 2^3 = 8 \\Rightarrow x^2 - 2x - 8 = 0$$\nFactoring the quadratic yields $(x-4)(x+2) = 0$. This gives roots $x = 4$ and $x = -2$. Since the original logarithmic domain restricts $x > 2$, $x = -2$ is extraneous. Thus, the single valid solution is $x = 4$.',
            hints: [
                'Combine the terms on the left side of the equation using the logarithmic product identity.',
                'Convert from logarithmic form to exponential form: $\\log_2(W) = V \\Rightarrow W = 2^V$. Here, $2^3 = 8$.',
                'Solve the resulting quadratic equation $x^2 - 2x - 8 = 0$. Discard any solutions that violate the original domains ($x>0$ and $x-2>0$ hence $x>2$).'
            ],
            answerKey: '4',
            keywords: ['4', 'x=4', 'extraneous']
        },
        { 
            q: 'Evaluate the indefinite integral: $\\int x \\cos(x) dx$', 
            a: 'Apply the Integration by Parts formula: $\\int u \\, dv = uv - \\int v \\, du$. \nLet $u = x \\Rightarrow du = dx$. \nLet $dv = \\cos(x)dx \\Rightarrow v = \\sin(x)$. \nSubstituting these into the model:\n$$\\int x \\cos(x) dx = x\\sin(x) - \\int \\sin(x) dx = x\\sin(x) - (-\\cos(x)) + C = x\\sin(x) + \\cos(x) + C$$',
            hints: [
                'Use Integration by Parts (ILATE/LIATE rule). Choose $u$ as the algebraic term and $dv$ as the trigonometric term.',
                'Identify $u = x \\Rightarrow du = dx$ and $dv = \\cos(x)dx \\Rightarrow v = \\sin(x)$.',
                'Substitute these terms into the integration by parts formula: $uv - \\int v \\, du$. Complete the easy integral remaining.'
            ],
            answerKey: 'x\\sin(x) + \\cos(x) + C',
            keywords: ['x\\sin', 'cos', '+ C', 'parts']
        }
    ],
    'Physics': [
        { 
            q: 'A 2kg mass is attached to a high-precision spring with force constant $k = 50 \\text{ N/m}$. Deduce the formal physical period of orbital oscillation ($T$) ignoring external resistive frictional effects.', 
            a: 'The mechanical period of a mass-spring system is given by the formula:\n$$T = 2\\pi\\sqrt{\\frac{m}{k}}$$\nSubstitute $m = 2\\text{ kg}$ and $k = 50\\text{ N/m}$:\n$$T = 2\\pi\\sqrt{\\frac{2}{50}} = 2\\pi\\sqrt{\\frac{1}{25}} = 2\\pi\\frac{1}{5} = \\frac{2\\pi}{5} \\approx 1.2566 \\text{ seconds}$$',
            hints: [
                'Identify the governing physical equation for simple harmonic spring periods: $T = 2\\pi\\sqrt{\\frac{m}{k}}$.',
                'Plug in $m = 2$ and $k = 50$. Notice that the fraction under the radical simplifies directly to $1/25$.',
                'The square root of $1/25$ is exactly $1/5 = 0.2$. Multiply this by $2\\pi$ to obtain the numeric value of roughly $1.26\\text{ seconds}$.'
            ],
            answerKey: '1.26',
            keywords: ['1.26', '2\\pi/5', 'spring']
        },
        { 
            q: 'Calculate the total macroscopic physical work done by an constant vector force $F = 20\\text{ N}$ moving an object $5\\text{ m}$ forward, if the angle between the acting force vector and the direction of spatial displacement is exactly $60^\\circ$.', 
            a: 'The physical work done is defined by the dot product:\n$$W = \\vec{F} \\cdot \\vec{d} = F \\cdot d \\cdot \\cos(\\alpha)$$\nPlugging in the given values:\n$$W = 20 \\text{ N} \\times 5 \\text{ m} \\times \\cos(60^\\circ) = 100 \\times 0.5 = 50 \\text{ Joules}$$',
            hints: [
                'Use the basic physics equation for Work: $W = F \\cdot d \\cdot \\cos(\\theta)$.',
                'Substitute $F=20\\text{ N}$, $d=5\\text{ m}$, and $\\theta=60^\\circ$. Recall that $\\cos(60^\\circ)$ equals exactly $0.5$ (or $1/2$).',
                'Multiply $100$ by $0.5$ to calculate the final scalar work in Joules.'
            ],
            answerKey: '50',
            keywords: ['50', 'joules', '50J']
        }
    ],
    'Chemistry': [
        { 
            q: 'Evaluate the precise theoretical molar concentration (pH) of a $0.01 \\text{ M}$ solution of Hydrochloric Acid (HCl), assuming complete academic dissociation in an aqueous format.', 
            a: 'Since hydrochloric acid (HCl) is a strong mineral acid, it undergoes complete dissociation in water:\n$$\\text{HCl}_{(aq)} \\rightarrow \\text{H}^+_{(aq)} + \\text{Cl}^-_{(aq)}$$\nHence, the concentration of hydrated proton species $[\\text{H}^+] = [\\text{HCl}]_0 = 0.01 \\text{ M} = 10^{-2} \\text{ M}$. Calculating pH using the negative logarithmic multiplier yields:\n$$\\text{pH} = -\\log_{10}[\\text{H}^+] = -\\log_{10}(10^{-2}) = 2$$',
            hints: [
                'Identify hydrochloric acid (HCl) as a strong acid that ionizes entirely in water, meaning $[\\text{H}^+] = 0.01\\text{ M}$.',
                'Apply the definition of pH: $\\text{pH} = -\\log_{10}[\\text{H}^+]$.',
                'Compute $-\\log_{10}(0.01)$. Note that $0.01 = 10^{-2}$.'
            ],
            answerKey: '2',
            keywords: ['2', 'ph', 'dissociation']
        },
        { 
            q: 'Determine the exact mass of Sodium Hydroxide (NaOH, molar mass = $40.0\\text{ g/mol}$) needed to prepare a solution volume of $500\\text{ mL}$ with a target concentration of $0.1\\text{ M}$.', 
            a: 'Step 1: Calculate moles of NaOH solute required:\n$$n = M \\times V = 0.1 \\text{ mol/L} \\times 0.500 \\text{ L} = 0.05 \\text{ moles}$$\nStep 2: Convert quantitative chemical moles to macroscopic weight in grams:\n$$\\text{Mass} = n \\times \\text{MW} = 0.05 \\text{ moles} \\times 40.0 \\text{ g/mol} = 2.0 \\text{ grams}$$',
            hints: [
                'Calculate the required chemical moles of NaOH first: $\\text{moles} = \\text{Molarity} \\times \\text{Volume in Liters}$. Convert $500\\text{ mL}$ to liters first ($0.5\\text{ L}$).',
                'This gives $0.1 \\times 0.5 = 0.05\\text{ moles}$.',
                'Multiply $0.05\\text{ moles}$ by the molecular mass of Sodium Hydroxide ($40.0\\text{ g/mol}$).'
            ],
            answerKey: '2',
            keywords: ['2', '2g', '0.05']
        }
    ],
    'CS': [
        { 
            q: 'Translate the 8-bit digital binary byte `01000011` into a standard human base-10 integer.', 
            a: 'Identify column weights from right to left ($128|64|32|16|8|4|2|1$):\n* Position 6: $1 \\times 64 = 64$\n* Position 1: $1 \\times 2 = 2$\n* Position 0: $1 \\times 1 = 1$\nSumming these up: $64 + 2 + 1 = 67$.',
            hints: [
                'Under base-2 positional binary systems, column weights increase by a factor of 2 starting from the rightmost place ($1, 2, 4, 8, 16, 32, 64, 128$).',
                'Identify which weights hold active 1s in `01000011`. This corresponds to the columns with value 64, 2, and 1.',
                'Add these active values to get the scalar decimal translation.'
            ],
            answerKey: '67',
            keywords: ['67', 'sixty-seven']
        },
        { 
            q: 'State the worst-case asymptotic algorithmic time complexity (Big-O) of sorting an initial array of size $n$ using the classic divide-and-conquer Merge Sort algorithm.', 
            a: 'Merge Sort recursively splits the array structure into identical halves, forming a recursion tree with a depth of $O(\\log n)$. On each layer of the tree, merging the arrays takes a combined linear sweep time of $O(n)$. Combining these operations yields the rigorous worst-case bound of:\n$$O(n \\log n)$$',
            hints: [
                'Recall that Merge Sort divides arrays in half recursively, producing a recursion tree with $\\log_2 n$ levels.',
                'At each level, elements must be re-merged sequentially, which consumes linear $O(n)$ time operations.',
                'Multiply the depth ($\\log n$) by the linear reconstruction cost ($n$).'
            ],
            answerKey: 'O(n \\log n)',
            keywords: ['n log n', 'o(n log n)', 'logarithmic']
        }
    ],
    'Biology': [
        { 
            q: 'Which vital cell organelle serves as the energy power generation station where cellular respiration occurs and ATP is actively synthesized?', 
            a: 'The **Mitochondrion** (plural: Mitochondria) is a double-membrane organelle that hosts the citric acid cycle (Krebs) and electron transport chain to convert sugar chemical inputs into Adenosine Triphosphate (ATP) chemical fuel.',
            hints: [
                'It contains its own DNA and has deeply folded internal membrane layers called cristae.',
                'Its primary product is ATP.',
                'Its spelling begins with "Mito" and is often jokingly called the powerhouse.'
            ],
            answerKey: 'Mitochondria',
            keywords: ['mitochondria', 'mitochondrion']
        }
    ],
    'Economics': [
        { 
            q: 'Assume market consumer demand is modeled by the price equation $P = 100 - 2Q_d$ and supply is given by $P = 20 + 2Q_s$. Compute the exact price ($P$) established at market clearance equilibrium.', 
            a: 'Set quantity demanded equal to quantity supplied ($Q_d = Q_s = Q$) for equilibrium:\n$$100 - 2Q = 20 + 2Q \\Rightarrow 80 = 4Q \\Rightarrow Q = 20 \\text{ units}$$\nPlug $Q = 20$ back into the demand model to determine price:\n$$P = 100 - 2(20) = 60$$',
            hints: [
                'Equilibrium clears the market when demand price equals supply price. Set $100 - 2Q = 20 + 2Q$.',
                'Solve for quantity $Q$ by grouping like terms: $80 = 4Q \\Rightarrow Q = 20$.',
                'Substitute $Q=20$ back into either equation to obtain the equilibrium price.'
            ],
            answerKey: '60',
            keywords: ['60', 'p=60', 'equilibrium']
        }
    ],
    'History': [
        { 
            q: 'State the exact Renaissance calendar year when Christopher Columbus crossed the Atlantic Ocean and made landfall in the Americas.', 
            a: 'Christopher Columbus landed on Caribbean shores in the calendar year **1492**, initiating extensive transatlantic exchange sequences.',
            hints: [
                'It occurred in the final decade of the 15th century.',
                'The rhymes go "In fourteen hundred and ninety-..."',
                'Write down the 4-digit year.'
            ],
            answerKey: '1492',
            keywords: ['1492', 'fourteen ninety-two']
        }
    ],
    'Literature': [
        { 
            q: 'Name the specific literary figure of speech where Romeo compares Juliet to the morning sun in the phrase: "Juliet is the sun".', 
            a: 'This is a **Metaphor**, as it makes a direct semantic comparison equating Juliet to the sun without utilizing comparative auxiliary qualifiers like "like" or "as" (which would indicate a simile).',
            hints: [
                'Contrast this direct identity with a comparison that utilizes "like" or "as" (which would be a Simile).',
                'By saying "she IS the sun," the author equates her directly to the solar source.',
                'Starts with an M.'
            ],
            answerKey: 'Metaphor',
            keywords: ['metaphor']
        }
    ],
    'Psychology': [
        { 
            q: 'Identify the prominent behavioral psychologist who pioneered Operant Conditioning theories using conditioning boxes containing custom stimulus levers.', 
            a: 'The prominent behaviorist **B.F. Skinner** (Burrhus Frederic Skinner) developed theories of Operant Conditioning using experimental animal chambers popularly titled "Skinner Boxes."',
            hints: [
                'The chamber boxes named after him give a strong hint to his surname.',
                'He studied behavior modified through positive reinforcement and negative punishment.',
                'His initials are B. F.'
            ],
            answerKey: 'B.F. Skinner',
            keywords: ['skinner', 'b.f. skinner']
        }
    ]
};

const SYLLABUS_CHEATSHEETS: Record<string, { title: string, content: string }> = {
    'Math': {
        title: 'Analytical Calculus & Logarithm Cheat Sheet',
        content: `**Core Derivative Formulas:**
* Power Rule: $\\frac{d}{dx}[x^n] = n x^{n-1}$
* Exponential: $\\frac{d}{dx}[e^{kx}] = k e^{kx}$
* Trigonometry: $\\frac{d}{dx}[\\sin(x)] = \\cos(x)$, $\\frac{d}{dx}[\\cos(x)] = -\\sin(x)$
* Product Rule: $(uv)' = u'v + uv'$
* Chain Rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$

**Fundamental Integrals:**
* $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$
* $\\int e^{kx} dx = \\frac{1}{k}e^{kx} + C$
* $\\int \\frac{1}{x} dx = \\ln|x| + C$
* Integration by parts: $\\int u \\, dv = uv - \\int v \\, du$`
    },
    'Physics': {
        title: 'Mechanics, Energies & Oscillation Quick Sheet',
        content: `**Linear Kinematics:**
* Speed relationships: $v = v_0 + at$
* Displacement: $d = v_0 t + \\frac{1}{2}at^2$
* Energy Equivalence: $v^2 = v_0^2 + 2ad$

**Dynamics & Mechanical Work:**
* Newton's 2nd Law: $F = m a$
* Mechanical Work: $W = F \\cdot d \\cdot \\cos(\\theta)$
* Kinetic Energy: $KE = \\frac{1}{2}m v^2$
* Gravitational Potential Energy: $PE = mgh$

**Simple Harmonic Oscillators:**
* Elastic Spring: Period $T = 2\\pi\\sqrt{\\frac{m}{k}}$
* Gravity Pendulum: Period $T = 2\\pi\\sqrt{\\frac{L}{g}}$`
    },
    'Chemistry': {
        title: 'Acid-Base Equilibria & Solutions Guide',
        content: `**Aqueous Acidic pH & pOH:**
* $\\text{pH} = -\\log_{10}[\\text{H}^+]$
* $\\text{pOH} = -\\log_{10}[\\text{OH}^-]$
* Water constant relation: $\\text{pH} + \\text{pOH} = 14 \\quad (\\text{at } 25^\\circ\\text{C})$
* Hydronium concentration: $[\\text{H}^+] = 10^{-\\text{pH}}$

**Concentration and Dilutions:**
* Molar Concentration (Molarity): $M = \\frac{\\text{moles of solute (mol)}}{\\text{volume of solution (L)}}$
* Dilution formula: $M_1 V_1 = M_2 V_2$

**Ideal Gases:**
* Equation of state: $P V = n R T$
* Constant $R = 0.08206 \\text{ L}\\cdot\\text{atm}/(\\text{mol}\\cdot\\text{K}) = 8.314 \\text{ J}/(\\text{mol}\\cdot\\text{K})$`
    },
    'CS': {
        title: 'Asymptotics & Positional Systems Guide',
        content: `**Binary Counting Weights:**
* Base-2 multipliers:  $128 \\ | \\ 64 \\ | \\ 32 \\ | \\ 16 \\ | \\ 8 \\ | \\ 4 \\ | \\ 2 \\ | \\ 1$
* A single byte consists of 8 bits. Maximum unsigned value is $255$.

**Complexity Classes (Fastest to Slowest):**
1. Constant Time: $O(1)$
2. Logarithmic Time: $O(\\log n)$
3. Linear Time: $O(n)$
4. Linearithmic Time: $O(n \\log n)$
5. Quadratic Time: $O(n^2)$
6. Exponential Time: $O(2^n)$`
    },
    'Biology': {
        title: 'Organelles & Genetic Code Review Sheet',
        content: `**Organelle Responsibilities:**
* **Nucleus**: Encapsulates and protects genomic DNA.
* **Mitochondria**: Energy production through Krebs cycle and electron transport chain.
* **Ribosome**: Machine responsible for peptide synthesis (protein assembling).

**The Central Dogma:**
* Transcription: $\\text{DNA} \\rightarrow \\text{mRNA}$ (Nucleus)
* Translation: $\\text{mRNA} \\rightarrow \\text{Protein}$ (Ribosomes)
* Base Pairing: DNA: $\\text{A-T, C-G}$; RNA: $\\text{A-U, C-G}$`
    },
    'Economics': {
        title: 'Microeconomics Demand & Markets',
        content: `**Market Clearance Equilibrium:**
* Occurs where Market Quantity Demanded equals Quantity Supplied ($Q_d = Q_s$).
* Market price is stable here. Any other state triggers surplus or shortage pressures.

**National Accounting Gross Domestic Product:**
* Income/Expenditure Equation: $GDP = C + I + G + (X - M)$
* $C$: Household Consumption, $I$: Business Capital Investment, $G$: Government Purchases, $X$: National Exports, $M$: National Imports.`
    },
    'History': {
        title: 'Global Chronologies Cheat Sheet',
        content: `**Decisive Transition Markers:**
* **Magna Carta (1215)**: Initial constraints on royal absolute power in England.
* **Printing Press (c. 1440)**: Hand-made literature converted into mass printing.
* **Landfall of Columbus (1492)**: Conjoined Western and Eastern hemispheres.
* **Steam Industrial Era (late 18th century)**: Mechanical energy overrides organic muscular force.`
    },
    'Literature': {
        title: 'Poetics, Devices & Figurative Analysis',
        content: `**Key Stylistic Figures:**
* **Metaphor**: Direct semantic equivalence (e.g. *Juliet is the sun*).
* **Simile**: Comparative equivalence matching using words "like" or "as" (e.g. *Juliet shines like the morning sun*).
* **Personification**: Assigning animal or human volition to inanimate abstractions.
* **Alliteration**: Sequential repetition of distinct phonetics (e.g. *She sells sea shells*).`
    },
    'Psychology': {
        title: 'Behaviorism & Neural Storage Quick Sheet',
        content: `**Conditioning Frameworks:**
* **Classical Association (Pavlov)**: Biological reflex triggered by an arbitrary paired precursor (bell conditioning).
* **Operant Adaptation (Skinner)**: Voluntary actions reshaped by positive reinforcement rewards or negative punishments.

**Memory Storehouse Pipeline:**
$$\\text{Sensory Input} \\rightarrow \\text{Short-Term (Working Memory Case)} \\rightarrow \\text{Long-Term Memory}$$`
    }
};

// --- Equations Whiteboard Sketchpad Canvas Component ---
const ScratchpadCanvas: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#3b82f6'); // Royal blue default
    const [brushSize, setBrushSize] = useState(3);
    const lastX = React.useRef(0);
    const lastY = React.useRef(0);

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        if ('touches' in e) {
            if (e.touches.length === 0) return { x: 0, y: 0 };
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);
        lastX.current = x;
        lastY.current = y;
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX.current = x;
        lastY.current = y;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className="p-4 bg-zinc-950/60 border border-brand-border/40 rounded-2xl space-y-3 print:hidden animate-fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest flex items-center gap-1.5">
                    ✏️ Problem Scratchpad & Derivation Board
                </span>
                <div className="flex items-center gap-2">
                    {/* Active colors */}
                    {['#3b82f6', '#10b981', '#ef4444', '#eab308', '#ffffff'].map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-4.5 h-4.5 rounded-full border transition-transform hover:scale-110 ${color === c ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-white/10'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="h-4 w-px bg-brand-border/40 mx-1" />
                    <select
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="bg-brand-bg text-[10px] text-brand-text border border-brand-border/40 rounded px-1 cursor-pointer outline-none"
                    >
                        <option value={2}>Thin Brush</option>
                        <option value={4}>Medium Brush</option>
                        <option value={8}>Bold Marker</option>
                    </select>
                    <button
                        onClick={clearCanvas}
                        className="px-2.5 py-1 bg-brand-surface border border-brand-border/40 text-brand-text-secondary hover:text-brand-text rounded text-[9px] font-bold uppercase transition-colors"
                    >
                        Reset Canvas
                    </button>
                </div>
            </div>
            
            <canvas
                ref={canvasRef}
                width={720}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[150px] bg-black/60 border border-brand-border/25 rounded-xl cursor-crosshair touch-none shadow-inner"
            />
        </div>
    );
};

const PracticeBench = () => {
    const [subject, setSubject] = useState('Math');
    const [level, setLevel] = useState('High School');
    const [topic, setTopic] = useState('');
    const [batchSize, setBatchSize] = useState(3);
    const [problems, setProblems] = useState<PracticeProblem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // MCQ vs Open-Ended mode toggle
    const [isMcqMode, setIsMcqMode] = useState(false);

    // MODE states: 'practice' (tutoring + immediate hints) vs 'exam' (graded testing)
    const [mode, setMode] = useState<'practice' | 'exam'>('practice');
    const [showCheatsheet, setShowCheatsheet] = useState(false);
    
    // Interactive states for learner
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [revealedHintsCount, setRevealedHintsCount] = useState<Record<number, number>>({});
    const [gradeResult, setGradeResult] = useState<Record<number, { checked: boolean; isCorrect: boolean; matchedTerm?: string; feedback: string }>>({});
    const [confidenceGrades, setConfidenceGrades] = useState<Record<number, 'correct' | 'partial' | 'review'>>({});

    // Whiteboard Scratchpad displays toggled per indices
    const [scratchpadOpend, setScratchpadOpend] = useState<Record<number, boolean>>({});

    // Conversational Quick-Ask logs per problem index
    const [chatInputs, setChatInputs] = useState<Record<number, string>>({});
    const [aiChatLogs, setAiChatLogs] = useState<Record<number, { role: 'user' | 'model'; text: string }[]>>({});
    const [chatLoading, setChatLoading] = useState<Record<number, boolean>>({});

    // Exam-specific states
    const [examTimer, setExamTimer] = useState(0);
    const [examIntervalId, setExamIntervalId] = useState<any>(null);
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [examScorecard, setExamScorecard] = useState<{ score: number; total: number; percentage: number; letterGrade: string; evaluation: string } | null>(null);

    // Start counter for exam timer
    useEffect(() => {
        if (mode === 'exam' && !examSubmitted && problems.length > 0) {
            const id = setInterval(() => {
                setExamTimer(t => t + 1);
            }, 1000);
            setExamIntervalId(id);
            return () => clearInterval(id);
        } else {
            if (examIntervalId) {
                clearInterval(examIntervalId);
                setExamIntervalId(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, examSubmitted, problems.length]);

    // Reset everything when topic/subject/problems changes
    const resetInteractiveStates = () => {
        setUserAnswers({});
        setRevealedHintsCount({});
        setGradeResult({});
        setConfidenceGrades({});
        setScratchpadOpend({});
        setChatInputs({});
        setAiChatLogs({});
        setChatLoading({});
        setExamTimer(0);
        setExamSubmitted(false);
        setExamScorecard(null);
    };

    const generateProblems = async () => {
        setIsLoading(true);
        resetInteractiveStates();
        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("Gemini API key is not configured.");
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `Generate ${batchSize} highly rigorous practice exercises for ${subject} ${topic ? `(specifically focusing on ${topic})` : ''} at ${level} level. 
            Formatting: Return a JSON array of objects, containing:
            'q': the formal question description in friendly markdown.
            'a': the full clear, step-by-step rigorous solution text with LaTeX formula derivations.
            'answerKey': a single word or extremely brief exact key answer.
            'keywords': an array of 3-4 lowercase scientific key phrases / words found in the solution.
            'hints': an array of exactly 3 sequential educational scaffolding cues, without giving the final answer away.
            ${isMcqMode ? `Additionally, include a 'choices' array of exactly 4 strings: option answers labeled as 'A. ...', 'B. ...', 'C. ...', 'D. ...', and make the 'answerKey' string exactly the correct choice option letter: 'A', 'B', 'C', or 'D'.` : ''}
            Keep descriptions extremely academic, detailed and clear for both kids and high school learners too.
            Example envelope: [{"q": "Calculate...", "a": "Let...", "answerKey": "${isMcqMode ? 'B' : '50'}", "keywords": ["work", "joules"], "hints": ["Recall...", "Plug..."]${isMcqMode ? ', "choices": ["A. 20", "B. 50", "C. 80", "D. 120"]' : ''}}]`;

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });
            
            const raw = response.text || '[]';
            const parsed = JSON.parse(raw);
            setProblems(parsed.map((p: any) => ({ ...p, show: false })));
        } catch (error: any) {
            console.error(error);
            // Fallback to offline samples on error or API key mismatch
            loadSample(subject);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSample = (s: string) => {
        resetInteractiveStates();
        const baseSet = OFFLINE_SAMPLES[s] || OFFLINE_SAMPLES['Math'];
        let list = [...baseSet];
        if (list.length > batchSize) {
            list = list.slice(0, batchSize);
        }
        
        const processed = list.map(p => {
            const item = { ...p, show: false };
            if (isMcqMode) {
                const keyVal = p.answerKey || '4';
                item.choices = [
                    `A. ${keyVal} (Analytical Target Output)`,
                    `B. Complementary mathematical boundary fallback`,
                    `C. Diverging coordinate extraneous solution`,
                    `D. Discharged standard coefficient error`
                ];
                item.answerKey = 'A';
            }
            return item;
        });

        setProblems(processed);
    };

    const handleIncrementHint = (idx: number) => {
        const currentCount = revealedHintsCount[idx] || 0;
        if (currentCount < 3) {
            setRevealedHintsCount({
                ...revealedHintsCount,
                [idx]: currentCount + 1
            });
        }
    };

    // Multi-turn contextual AI Coaching Chat assistant
    const executeQuickAsk = async (idx: number) => {
        const query = chatInputs[idx] || '';
        if (!query.trim()) return;

        setChatInputs({ ...chatInputs, [idx]: '' });

        const currentChat = aiChatLogs[idx] || [];
        const updatedWithUser = [...currentChat, { role: 'user' as const, text: query }];
        setAiChatLogs(prev => ({ ...prev, [idx]: updatedWithUser }));
        setChatLoading(prev => ({ ...prev, [idx]: true }));

        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("Key offline.");
            const ai = new GoogleGenAI({ apiKey });

            const problem = problems[idx];
            const chatPrompt = `You are a friendly, highly intelligent academic coach helping a student on a specific problem card in real time.
            
            Problem Context Question: "${problem.q}"
            Verified Reference Solution Manual: "${problem.a}"
            Student's Followup Question: "${query}"
            
            Deliver a highly precise, exceptionally direct, supportive, and motivating response. Suggest step-by-step formula explanations or LaTeX. Keep it under 2 scannable paragraphs. Encourage their growth!`;

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ role: 'user', parts: [{ text: chatPrompt }] }]
            });
            
            setAiChatLogs(prev => ({
                ...prev,
                [idx]: [...updatedWithUser, { role: 'model' as const, text: response.text || 'Coaching connection timed out. Please retry!' }]
            }));
        } catch (e) {
            setAiChatLogs(prev => ({
                ...prev,
                [idx]: [...updatedWithUser, { role: 'model' as const, text: 'Coaching AI is currently offline. Review the verified reference solution manual step details below!' }]
            }));
        } finally {
            setChatLoading(prev => ({ ...prev, [idx]: false }));
        }
    };

    // Offline self-check engine using analytical keywords
    const executeLocalOfflineCheck = (idx: number) => {
        const ans = (userAnswers[idx] || '').trim().toLowerCase();
        if (!ans) {
            setGradeResult({
                ...gradeResult,
                [idx]: { checked: true, isCorrect: false, feedback: 'Blank Submission. Please write down your steps or numeric values!' }
            });
            return;
        }

        const prob = problems[idx];
        const key = (prob.answerKey || '').toLowerCase();
        const keywords = prob.keywords || [];

        // Exact match of overall key
        if (key && (ans === key || ans.includes(key))) {
            setGradeResult({
                ...gradeResult,
                [idx]: { checked: true, isCorrect: true, feedback: 'Superb! Your solution matched the target benchmark key exactly. Keep on keeping on!' }
            });
            setConfidenceGrades({ ...confidenceGrades, [idx]: 'correct' });
            return;
        }

        // Check keyword matches
        const matched = keywords.filter(word => ans.includes(word.toLowerCase()));
        if (matched.length >= Math.max(1, Math.floor(keywords.length / 2))) {
            setGradeResult({
                ...gradeResult,
                [idx]: { 
                    checked: true, 
                    isCorrect: true, 
                    matchedTerm: matched.join(', '),
                    feedback: `Excellent derivation! While your text is open-ended, we detected key parameters: [${matched.join(', ')}]. Perfect scientific path!` 
                }
            });
            setConfidenceGrades({ ...confidenceGrades, [idx]: 'correct' });
        } else if (matched.length > 0) {
            setGradeResult({
                ...gradeResult,
                [idx]: { 
                    checked: true, 
                    isCorrect: false, 
                    matchedTerm: matched.join(', '),
                    feedback: `Partially trace. You mentioned intermediate properties [${matched.join(', ')}], but missing full execution. Disclose the solution step below to learn!` 
                }
            });
            setConfidenceGrades({ ...confidenceGrades, [idx]: 'partial' });
        } else {
            setGradeResult({
                ...gradeResult,
                [idx]: { 
                    checked: true, 
                    isCorrect: false, 
                    feedback: `Keep drafting! We didn't immediately detect key concepts in your answer. Check the guide hint parameters above to verify formulas or calculations!` 
                }
            });
            setConfidenceGrades({ ...confidenceGrades, [idx]: 'review' });
        }
    };

    // Complete active exam, score and formulate letter grading
    const submitCompleteExam = () => {
        if (problems.length === 0) return;
        
        let earnedPoints = 0;
        const totalPossiblePoints = problems.length * 10;

        problems.forEach((_, index) => {
            const grade = confidenceGrades[index];
            if (grade === 'correct') {
                earnedPoints += 10;
            } else if (grade === 'partial') {
                earnedPoints += 5;
            } else {
                // If they did check locally and got it right
                const res = gradeResult[index];
                if (res?.isCorrect) {
                     earnedPoints += 10;
                } else if (userAnswers[index]?.trim()) {
                     earnedPoints += 3; // minimal participation points
                }
            }
        });

        const percentage = Math.round((earnedPoints / totalPossiblePoints) * 100);
        let letter = 'F';
        let evalText = '';

        if (percentage >= 95) {
            letter = 'A+';
            evalText = 'Outstanding! Your absolute mastery of this field is exemplary. Keep up this magnificent performance!';
        } else if (percentage >= 85) {
            letter = 'A';
            evalText = 'Excellent scholastic capability. You demonstrated critical mechanical knowledge across multiple challenge domains!';
        } else if (percentage >= 75) {
            letter = 'B';
            evalText = 'Solid capability. Minor details need work, but you maintain the underlying scientific principles securely.';
        } else if (percentage >= 60) {
            letter = 'C';
            evalText = 'Passing standard. We suggest reinforcing formulas via the syllabus notes and trying additional practice rounds.';
        } else {
            letter = 'D/F';
            evalText = 'Sub-optimal performance. Re-read the associated subject cheatsheet, utilize hints in Practice Mode, and try again!';
        }

        setExamScorecard({
            score: earnedPoints,
            total: totalPossiblePoints,
            percentage,
            letterGrade: letter,
            evaluation: evalText
        });
        setExamSubmitted(true);
    };

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Header Control Panel */}
            <div className="bg-brand-surface/40 p-12 rounded-[4rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target size={200} />
                </div>
                <div className="relative z-10 space-y-8">
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-brand-bg flex items-center justify-center shadow-2xl shadow-brand-primary/30 shrink-0">
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-brand-text uppercase tracking-widest">Scholar Arena</h3>
                                <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.4em] font-black">Interactive Examine & Tutor Platform</p>
                            </div>
                        </div>

                        {/* Top controls: Practice/Exam mode toggle & Cheatsheet */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    setIsMcqMode(!isMcqMode);
                                    resetInteractiveStates();
                                }}
                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${isMcqMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${isMcqMode ? 'bg-indigo-500' : 'bg-zinc-500'}`} />
                                Problem Format: {isMcqMode ? 'Multiple Choice' : 'Open Ended'}
                            </button>

                            <button
                                onClick={() => {
                                    setMode(mode === 'practice' ? 'exam' : 'practice');
                                    resetInteractiveStates();
                                }}
                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${mode === 'exam' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${mode === 'exam' ? 'bg-red-500 animate-pulse' : 'bg-brand-primary'}`} />
                                Current: {mode === 'exam' ? 'Exam Room Mode' : 'Tutoring Lab'}
                            </button>

                            <button
                                onClick={() => setShowCheatsheet(!showCheatsheet)}
                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${showCheatsheet ? 'bg-brand-text text-brand-bg border-brand-text' : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary'}`}
                            >
                                <BookOpen size={12} />
                                {showCheatsheet ? 'Close Reference Notes' : 'Open Study Cheatsheet'}
                            </button>
                        </div>
                    </div>

                    {/* Target Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">Academic Discipline</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Math', 'Physics', 'Chemistry', 'CS', 'Biology', 'Economics', 'History', 'Literature', 'Psychology'].map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => setSubject(s)}
                                            className={`p-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${subject === s ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-xl' : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary hover:text-brand-text'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">Focus Syllabus Topic (Optional)</label>
                                <input 
                                    type="text" 
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Limits, Wave Mechanics, Thermodynamics..."
                                    className="w-full bg-brand-bg/40 border border-brand-border rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all text-brand-text placeholder:opacity-30"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">Scholastic Rigor</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['High School', 'Undergraduate', 'Graduate', 'Doctorate'].map(l => (
                                        <button 
                                            key={l} 
                                            onClick={() => setLevel(l)}
                                            className={`p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${level === l ? 'bg-brand-text text-brand-bg border-brand-text' : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary hover:text-brand-text'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">Challenge Scale (Exercise Count)</label>
                                <div className="flex gap-2">
                                    {[3, 5, 10].map(n => (
                                        <button 
                                            key={n}
                                            onClick={() => setBatchSize(n)}
                                            className={`flex-1 p-4 rounded-xl text-xs font-black transition-all border ${batchSize === n ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-brand-bg/40 border-brand-border text-brand-text-secondary'}`}
                                        >
                                            0{n} Challenges
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={generateProblems}
                            disabled={isLoading}
                            className="flex-[2] py-5 bg-brand-primary text-brand-bg rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {isLoading ? 'Synthesizing Challenges...' : 'Initiate New Exercise Set'}
                        </motion.button>
                        <button 
                            onClick={() => loadSample(subject)}
                            className="flex-1 py-5 bg-brand-surface border border-brand-border text-brand-text-secondary rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] hover:text-brand-text transition-all"
                        >
                            Load Offline Standard Exercises
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Syllabus Reference Note */}
            <AnimatePresence>
                {showCheatsheet && SYLLABUS_CHEATSHEETS[subject] && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-brand-primary/5 border border-brand-primary/15 rounded-[2.5rem] p-8 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                <BookOpen size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">{SYLLABUS_CHEATSHEETS[subject].title}</h4>
                                <p className="text-[9px] text-brand-text-secondary font-mono tracking-wider uppercase mt-0.5">Complementary Study Reference Sheet</p>
                            </div>
                        </div>
                        <div className="markdown-body prose prose-invert prose-brand max-w-none text-xs leading-relaxed space-y-2 opacity-90 border-t border-brand-border/15 pt-4">
                            <ReactMarkdown>{SYLLABUS_CHEATSHEETS[subject].content}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Exam Floating Header Banner */}
            {mode === 'exam' && problems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-2xl gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <div>
                            <span className="text-[10px] font-mono uppercase text-red-400 tracking-wider">Exam Environment Enabled</span>
                            <p className="text-[11px] text-brand-text-secondary">Answer confirmation checkers are hidden. Complete all solutions and click grade at the bottom.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-black/40 border border-brand-border rounded-xl font-mono text-sm text-brand-text tracking-widest">
                            Time: {formatTimer(examTimer)}
                        </div>
                        {!examSubmitted && (
                            <button
                                onClick={submitCompleteExam}
                                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                                Finish & Grade Exam
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Scorecard Modal / Panel */}
            <AnimatePresence>
                {examSubmitted && examScorecard && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-brand-surface border border-brand-border rounded-[3rem] p-10 space-y-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 text-brand-primary">
                            <ShieldCheck size={160} />
                        </div>

                        <div className="border-b border-brand-border pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-brand-text uppercase tracking-widest">Scholar Examination Report Card</h3>
                                <p className="text-[10px] text-brand-text-secondary font-mono tracking-widest mt-1">Discipline: {subject} &bull; Intensity Level: {level}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <span className="text-xs text-brand-text-secondary uppercase font-bold block">Class Grade</span>
                                    <span className="text-4xl font-black text-brand-primary">{examScorecard.letterGrade}</span>
                                </div>
                                <div className="h-10 w-px bg-brand-border" />
                                <div className="text-center font-mono">
                                    <span className="text-xs text-brand-text-secondary uppercase font-bold block">Performance</span>
                                    <span className="text-lg font-bold text-brand-text">{examScorecard.percentage}%</span>
                                    <span className="text-[10px] text-brand-text-secondary block">({examScorecard.score}/{examScorecard.total} Pts)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-brand-bg/50 border border-brand-border rounded-2xl relative">
                            <span className="absolute -top-3 left-6 px-3 bg-brand-surface border border-brand-border rounded-full text-[9px] font-mono text-brand-primary uppercase tracking-widest">Direct Pedagogical Evaluation</span>
                            <p className="text-sm text-brand-text-secondary leading-relaxed font-medium pt-2">{examScorecard.evaluation}</p>
                        </div>

                        <div className="flex justify-end gap-3 text-[10px] font-black uppercase tracking-wider">
                            <button
                                onClick={() => {
                                    setExamSubmitted(false);
                                    setExamScorecard(null);
                                    setMode('practice');
                                }}
                                className="px-5 py-3 bg-brand-primary text-brand-bg rounded-xl"
                            >
                                Convert to Practice (Tutor reviews unlocked)
                            </button>
                            <button
                                onClick={() => {
                                    resetInteractiveStates();
                                }}
                                className="px-5 py-3 bg-brand-bg border border-brand-border text-brand-text-secondary rounded-xl hover:text-brand-text"
                            >
                                Re-take Exam with new parameters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Exercises List */}
            <div className="space-y-8">
                <AnimatePresence mode="popLayout" initial={false}>
                    {problems.map((p, idx) => {
                        const hintsCount = revealedHintsCount[idx] || 0;
                        const gradeVal = gradeResult[idx];
                        const answerDraft = userAnswers[idx] || '';

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className="bg-brand-surface/40 p-10 rounded-[4rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative group/problem space-y-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="px-4 py-1.5 bg-brand-bg/50 border border-brand-border rounded-full text-[9px] font-black text-brand-text-secondary uppercase tracking-widest flex items-center gap-2">
                                        <Target size={12} /> Challenge 0{idx + 1}
                                    </div>
                                    <div className="text-[8px] font-mono text-brand-text-secondary/20 uppercase tracking-[0.3em]">
                                        Format: {p.choices ? 'MCQ OPTIONS (A-D)' : 'OPEN RESPONSE'}
                                    </div>
                                </div>

                                <div className="markdown-body prose prose-invert prose-brand max-w-none text-base font-medium leading-relaxed">
                                    <ReactMarkdown>{p.q}</ReactMarkdown>
                                </div>

                                {/* Active Scratchpad whiteboard component drawer */}
                                {scratchpadOpend[idx] && (
                                    <ScratchpadCanvas />
                                )}

                                {/* Tutoring hints (Practice mode only) */}
                                {mode === 'practice' && p.hints && p.hints.length > 0 && (
                                    <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-primary tracking-wider">
                                                <Activity size={14} /> Responsive Clue Scaffolding
                                            </div>
                                            {hintsCount < 3 && (
                                                <button
                                                    onClick={() => handleIncrementHint(idx)}
                                                    className="text-[9px] font-bold text-brand-text-secondary hover:text-brand-primary uppercase tracking-widest"
                                                >
                                                    Reveal Clue ({hintsCount}/3)
                                                </button>
                                            )}
                                        </div>

                                        {hintsCount > 0 && (
                                            <ul className="space-y-2 border-t border-brand-border/10 pt-3">
                                                {p.hints.slice(0, hintsCount).map((hintText, hIdx) => (
                                                    <li key={hIdx} className="text-[11px] text-brand-text-secondary leading-relaxed flex items-start gap-2">
                                                        <span className="font-mono text-brand-primary font-bold">Clue 0{hIdx + 1}:</span>
                                                        <span className="font-light italic">{hintText}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* Typing entry workspace / MCQ option button tiles */}
                                {!examSubmitted && (
                                    <div className="space-y-3">
                                        {p.choices && p.choices.length > 0 ? (
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">
                                                    Select the Correct Option Answer:
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                                    {p.choices.map(choice => {
                                                        const letter = choice.trim().charAt(0).toUpperCase();
                                                        const isSelected = userAnswers[idx] === letter;
                                                        return (
                                                            <button
                                                                key={choice}
                                                                onClick={() => setUserAnswers({ ...userAnswers, [idx]: letter })}
                                                                className={`p-4.5 rounded-2xl text-left text-xs font-bold border transition-all ${
                                                                    isSelected
                                                                        ? 'bg-brand-primary/15 border-brand-primary text-brand-primary shadow-xl shadow-brand-primary/5 font-extrabold'
                                                                        : 'bg-brand-bg/40 border-brand-border/50 text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/70'
                                                                }`}
                                                            >
                                                                {choice}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-widest ml-1">Write your mathematical steps or answers here:</label>
                                                <textarea
                                                    value={answerDraft}
                                                    onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                                    placeholder="Introduce formulas, numbers, or logic to check."
                                                    rows={3}
                                                    className="w-full bg-brand-bg/60 border border-brand-border rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-brand-primary text-brand-text outline-none transition-all placeholder:opacity-20"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions row */}
                                <div className="border-t border-brand-border/15 pt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                    
                                    {/* Evaluation Trigger (Practice lab) */}
                                    {mode === 'practice' && !examSubmitted ? (
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => executeLocalOfflineCheck(idx)}
                                                className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-[10px] font-bold uppercase text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all"
                                            >
                                                Check Answer
                                            </button>

                                            <button
                                                onClick={() => setScratchpadOpend({ ...scratchpadOpend, [idx]: !scratchpadOpend[idx] })}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all flex items-center gap-1.5 ${
                                                    scratchpadOpend[idx]
                                                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-500 font-extrabold'
                                                        : 'bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-text'
                                                }`}
                                            >
                                                <span>✏️ Whiteboard {scratchpadOpend[idx] ? 'Opened' : 'Scratchpad'}</span>
                                            </button>

                                            {getApiKey() && !p.choices && (
                                                <button
                                                    onClick={() => executeQuickAsk(idx)}
                                                    disabled={chatLoading[idx] || !answerDraft.trim()}
                                                    className="px-4 py-2.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-[10px] font-bold uppercase text-brand-primary hover:bg-brand-primary hover:text-brand-bg transition-all disabled:opacity-50"
                                                >
                                                    {chatLoading[idx] ? 'Analyzing...' : 'Submit to AI Coach'}
                                                </button>
                                            )}
                                        </div>
                                    ) : mode === 'exam' && !examSubmitted ? (
                                        /* Confident level markers in exam mode */
                                        <div className="flex gap-4 items-center flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">Mark Self-Confidence:</span>
                                                <div className="flex bg-brand-bg/50 rounded-lg p-1 border border-brand-border">
                                                    <button 
                                                        onClick={() => setConfidenceGrades({...confidenceGrades, [idx]: 'correct'})}
                                                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest ${confidenceGrades[idx] === 'correct' ? 'bg-emerald-500/10 text-emerald-400' : 'text-brand-text-secondary hover:text-brand-text'}`}
                                                    >
                                                        Confident
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfidenceGrades({...confidenceGrades, [idx]: 'partial'})}
                                                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest ${confidenceGrades[idx] === 'partial' ? 'bg-amber-500/10 text-amber-400' : 'text-brand-text-secondary hover:text-brand-text'}`}
                                                    >
                                                        Unsure
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfidenceGrades({...confidenceGrades, [idx]: 'review'})}
                                                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest ${confidenceGrades[idx] === 'review' ? 'bg-red-500/10 text-red-400' : 'text-brand-text-secondary hover:text-brand-text'}`}
                                                    >
                                                        Tough
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setScratchpadOpend({ ...scratchpadOpend, [idx]: !scratchpadOpend[idx] })}
                                                className={`px-4 py-2 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                                                    scratchpadOpend[idx]
                                                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-500 font-extrabold'
                                                        : 'bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-text'
                                                }`}
                                            >
                                                <span>✏️ Calculations Wire</span>
                                            </button>
                                        </div>
                                    ) : (
                                        /* Post exam view */
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-brand-text-secondary font-semibold uppercase">Exam Answer Entered:</span>
                                            <span className="text-[10px] font-mono font-medium truncate text-brand-primary max-w-xs block bg-brand-bg/50 px-3 py-1 rounded border border-brand-border">"{answerDraft || 'No entry'}"</span>
                                        </div>
                                    )}

                                    {/* Reveal full theoretical manual */}
                                    {(mode === 'practice' || examSubmitted) && (
                                        <button 
                                            onClick={() => setProblems(problems.map((prob, i) => i === idx ? { ...prob, show: !prob.show } : prob))}
                                            className="flex items-center gap-3 text-brand-primary hover:text-brand-secondary transition-colors"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{p.show ? 'Fold Solution Details' : 'Disclose Solution Ledger'}</span>
                                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                                <Layers size={14} />
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Self-check feedback result output */}
                                {mode === 'practice' && gradeVal?.checked && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl text-[11px] leading-relaxed border flex gap-3 ${gradeVal.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <div>
                                            <p className="font-semibold mb-0.5">{gradeVal.isCorrect ? 'Benchmark Verified Correct' : 'Benchmark Correction Recommendation'}</p>
                                            <p className="opacity-95 text-brand-text-secondary font-medium">{gradeVal.feedback}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Interactive Quick-Ask Conversational AI Coach Core overlay */}
                                {mode === 'practice' && (
                                    <div className="mt-4 p-5 rounded-3xl bg-brand-surface/30 border border-brand-border/40 space-y-4 print:hidden">
                                        <div className="text-[9px] font-black uppercase text-brand-primary tracking-widest flex items-center gap-1">
                                            <span>💬 Realtime Audio & Study chat coach</span>
                                        </div>
                                        
                                        {/* Discussion logs */}
                                        {aiChatLogs[idx] && aiChatLogs[idx].length > 0 && (
                                            <div className="space-y-4 border-b border-brand-border/20 pb-4 max-h-56 overflow-y-auto pr-1">
                                                {aiChatLogs[idx].map((msg, mIdx) => (
                                                    <div key={mIdx} className={`flex flex-col gap-1 text-[11px] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[8px] uppercase tracking-widest text-brand-text-secondary font-bold">
                                                            {msg.role === 'user' ? 'Scholar' : 'Academic Coach'}
                                                        </span>
                                                        <div className={`p-3.5 rounded-2xl max-w-[85%] font-medium leading-relaxed ${
                                                            msg.role === 'user' 
                                                                ? 'bg-brand-primary/10 text-brand-primary rounded-tr-none' 
                                                                : 'bg-brand-surface/60 text-brand-text-secondary rounded-tl-none border border-brand-border/30'
                                                        }`}>
                                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Chat inputs */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInputs[idx] || ''}
                                                onChange={(e) => setChatInputs({ ...chatInputs, [idx]: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && executeQuickAsk(idx)}
                                                placeholder="Ask coach: 'Can you simplify steps?', 'Where did the constant come from?'..."
                                                className="flex-1 bg-brand-bg/50 border border-brand-border/50 rounded-xl px-4 py-2.5 text-xs text-brand-text outline-none focus:ring-1 focus:ring-brand-primary placeholder:opacity-20"
                                            />
                                            <button
                                                onClick={() => executeQuickAsk(idx)}
                                                disabled={chatLoading[idx] || !(chatInputs[idx] || '').trim()}
                                                className="px-4 py-2.5 bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-brand-primary/95 disabled:opacity-50 transition-colors"
                                            >
                                                {chatLoading[idx] ? 'Consulting...' : 'Ask Coach'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Correct Solution Block */}
                                <AnimatePresence>
                                    {p.show && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-4 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative">
                                                <div className="absolute top-0 right-0 p-6 opacity-30 text-emerald-500">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                    Verified Reference Solution Ledger
                                                </div>
                                                <div className="markdown-body prose prose-invert prose-emerald text-brand-text-secondary text-sm leading-relaxed max-w-none font-medium italic">
                                                    <ReactMarkdown>{p.a}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {problems.length === 0 && !isLoading && (
                    <div className="py-24 text-center border-2 border-dashed border-brand-border/30 rounded-[4rem] bg-brand-surface/10">
                        <Target size={48} className="mx-auto text-brand-text-secondary/10 mb-6" />
                        <div className="text-[10px] font-black text-brand-text-secondary/30 uppercase tracking-[0.8em]">Idle State // Choose Parameters & Deploy Sandbox</div>
                    </div>
                )}
            </div>

            {/* Complete Exam trigger at very bottom */}
            {mode === 'exam' && problems.length > 0 && !examSubmitted && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={submitCompleteExam}
                        className="py-5 px-10 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                        Grade & Submit Exam Set
                    </button>
                </div>
            )}

        </div>
    );
};

// --- Main Student Tools Component ---
const StudentTools: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
    const { user, userData } = useAuth();
    type ToolID = 'gpa' | 'pomodoro' | 'geometry' | 'science' | 'physics' | 'formulas' | 'notes' | 'citations' | 'flashcards' | 'assignments' | 'elements' | 'tutor' | 'equation' | 'unit' | 'exercises' | 'lessons' | 'wolfram' | 'mathexercises' | 'k5worksheets';
    const [activeTool, setActiveTool] = useState<ToolID>('lessons');
    const [activeToolSearch, setActiveToolSearch] = useState('');

    const categories = [
        { id: 'productivity', label: 'Productivity', icon: Activity, types: ['pomodoro', 'assignments', 'notes', 'flashcards'] },
        { id: 'practice', label: 'Practice Bench', icon: Target, types: ['lessons', 'exercises', 'mathexercises', 'k5worksheets', 'tutor'] },
        { id: 'math', label: 'Advanced Math', icon: Zap, types: ['wolfram', 'equation', 'geometry', 'gpa'] },
        { id: 'science', label: 'Science Core', icon: Atom, types: ['science', 'physics', 'elements', 'unit'] },
        { id: 'research', label: 'Research', icon: BookOpen, types: ['formulas', 'citations'] }
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
            case 'equation': return <EquationSolver />;
            case 'unit': return <ScientificUnitConverter />;
            case 'exercises': return <PracticeBench />;
            case 'lessons': return <LessonsHub onLoginClick={onLoginClick} />;
            case 'wolfram': return <WolframHub />;
            case 'mathexercises': return <MathExercises />;
            case 'k5worksheets': return <K5Worksheets />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-brand-primary mb-2">
                        <GraduationCap className="animate-pulse" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Academic Engine v4.1</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-brand-text tracking-tightest leading-none">Research <span className="text-brand-primary">Terminal</span></h2>
                    <p className="text-brand-text-secondary text-lg font-light max-w-xl">
                        Integrated computational workspace for academic exploration and scientific derivation.
                        {userData?.school ? ` Authorized for ${userData.school}.` : ''}
                    </p>
                </div>
                {!user && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={onLoginClick}
                        className="flex items-center gap-4 p-4 pr-6 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/50 rounded-[2rem] group cursor-pointer transition-all backdrop-blur-md"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-bg shadow-lg shadow-brand-primary/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest leading-none mb-1">Encrypted Session</p>
                            <p className="text-sm text-brand-text-secondary group-hover:text-brand-text transition-colors">Sign in to sync research.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative">
                {/* Navigation Sidebar */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-6 relative z-10">
                    <div className="bg-brand-surface border border-brand-border/50 p-4 rounded-3xl shadow-2xl backdrop-blur-3xl md:sticky md:top-24 max-h-[50vh] md:max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                        
                        {/* Interactive Sidebar Search */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text-secondary">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="Find a tool..."
                                value={activeToolSearch}
                                onChange={(e) => setActiveToolSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-inner"
                            />
                        </div>

                        {categories.map((cat, index) => {
                            const getToolLabel = (type: string) => {
                                if (type === 'gpa') return 'GPA Calculator';
                                if (type === 'elements') return 'Periodic Table';
                                if (type === 'tutor') return 'AI Tutor';
                                if (type === 'equation') return 'Equation Solver';
                                if (type === 'wolfram') return 'Wolfram Computational';
                                if (type === 'mathexercises') return 'Math Drills';
                                if (type === 'k5worksheets') return 'K5 Worksheets';
                                return type.charAt(0).toUpperCase() + type.slice(1);
                            };

                            const filteredTypes = cat.types.filter(type => {
                                return getToolLabel(type).toLowerCase().includes(activeToolSearch.toLowerCase());
                            });

                            if (filteredTypes.length === 0) return null;

                            return (
                                <div key={cat.id} className={index !== 0 ? 'mt-6' : ''}>
                                    <div className="flex items-center gap-2 px-4 mb-2 text-brand-text-secondary">
                                        <cat.icon size={12} className="opacity-80" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">{cat.label}</h3>
                                    </div>
                                    <div className="flex flex-col">
                                        {filteredTypes.map(type => (
                                            <SubNavButton
                                                key={type}
                                                label={getToolLabel(type)}
                                                isActive={activeTool === type}
                                                onClick={() => setActiveTool(type as ToolID)}
                                                icon={ChevronRight}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTool} 
                            initial={{ opacity: 0, scale: 0.98, y: 30 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.98, y: -20 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="relative group/tool"
                        >
                            <div className="absolute -inset-4 bg-brand-primary/5 rounded-[3rem] blur-3xl opacity-0 group-hover/tool:opacity-100 transition-opacity duration-1000" />
                            <div className="relative">
                                {renderTool()}
                            </div>

                            {!user && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="mt-16 p-10 md:p-16 rounded-[4rem] bg-brand-surface/30 border border-brand-border/50 flex flex-col md:flex-row items-center justify-between gap-10 backdrop-blur-xl group/cta"
                                >
                                    <div className="space-y-4 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <MousePointer2 size={12} /> Researcher License
                                        </div>
                                        <h4 className="font-black text-brand-text text-4xl leading-tight">Persistent Subject Repository</h4>
                                        <p className="text-brand-text-secondary text-lg font-light">Authenticated scholars save derivation logs, customized flashcard decks, and AI tutor conversation history across devices.</p>
                                    </div>
                                    <button 
                                        onClick={onLoginClick}
                                        className="w-full md:w-auto px-12 py-6 bg-brand-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/40"
                                    >
                                        Secure Workspace
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentTools;
