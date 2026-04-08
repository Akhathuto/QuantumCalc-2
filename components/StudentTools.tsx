import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Loader2,
  Quote,
  Layers,
  CheckSquare,
  Search,
  FlaskConical
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- UI Components ---
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 flex items-center gap-2 rounded-md font-semibold transition-colors text-sm ${isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}
    >
        <Icon size={16} />
        {label}
    </button>
);

// --- 1. GPA Calculator ---
const GPACalculator = () => {
    const [courses, setCourses] = useState([{ id: 1, name: '', grade: 'A', credits: 3 }]);
    const [targetGrade, setTargetGrade] = useState('');
    const [currentGrade, setCurrentGrade] = useState('');
    const [finalWeight, setFinalWeight] = useState('');

    const gradePoints: Record<string, number> = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

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
            totalPoints += (gradePoints[c.grade] || 0) * credits;
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
                                    {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
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
    }, [shape, inputs, currentShape]);

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

// --- 4. Science Tools ---
const ScienceTools = () => {
    const [formula, setFormula] = useState('');
    
    // Basic atomic weights
    const atomicWeights: Record<string, number> = {
        H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, 
        F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, 
        Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87, I: 126.90, 
        Au: 196.97, Hg: 200.59, Pb: 207.2
    };

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
                
                if (atomicWeights[element]) {
                    mass += atomicWeights[element] * count;
                } else {
                    return { error: `Unknown element: ${element}` };
                }
            }
            return valid ? { mass: mass.toFixed(3) } : { error: 'Invalid formula format' };
        } catch (e) {
            return { error: 'Error calculating mass' };
        }
    }, [formula]);

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

    return (
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

// --- 9. Element Lookup ---
const ElementLookup = () => {
    const [search, setSearch] = useState('');
    
    const elements = [
        { num: 1, sym: 'H', name: 'Hydrogen', mass: 1.008, group: 'Nonmetal' },
        { num: 2, sym: 'He', name: 'Helium', mass: 4.0026, group: 'Noble Gas' },
        { num: 3, sym: 'Li', name: 'Lithium', mass: 6.94, group: 'Alkali Metal' },
        { num: 4, sym: 'Be', name: 'Beryllium', mass: 9.0122, group: 'Alkaline Earth' },
        { num: 5, sym: 'B', name: 'Boron', mass: 10.81, group: 'Metalloid' },
        { num: 6, sym: 'C', name: 'Carbon', mass: 12.011, group: 'Nonmetal' },
        { num: 7, sym: 'N', name: 'Nitrogen', mass: 14.007, group: 'Nonmetal' },
        { num: 8, sym: 'O', name: 'Oxygen', mass: 15.999, group: 'Nonmetal' },
        { num: 9, sym: 'F', name: 'Fluorine', mass: 18.998, group: 'Halogen' },
        { num: 10, sym: 'Ne', name: 'Neon', mass: 20.180, group: 'Noble Gas' },
        { num: 11, sym: 'Na', name: 'Sodium', mass: 22.990, group: 'Alkali Metal' },
        { num: 12, sym: 'Mg', name: 'Magnesium', mass: 24.305, group: 'Alkaline Earth' },
        { num: 13, sym: 'Al', name: 'Aluminum', mass: 26.982, group: 'Post-Transition Metal' },
        { num: 14, sym: 'Si', name: 'Silicon', mass: 28.085, group: 'Metalloid' },
        { num: 15, sym: 'P', name: 'Phosphorus', mass: 30.974, group: 'Nonmetal' },
        { num: 16, sym: 'S', name: 'Sulfur', mass: 32.06, group: 'Nonmetal' },
        { num: 17, sym: 'Cl', name: 'Chlorine', mass: 35.45, group: 'Halogen' },
        { num: 18, sym: 'Ar', name: 'Argon', mass: 39.95, group: 'Noble Gas' },
        { num: 19, sym: 'K', name: 'Potassium', mass: 39.098, group: 'Alkali Metal' },
        { num: 20, sym: 'Ca', name: 'Calcium', mass: 40.078, group: 'Alkaline Earth' },
        { num: 26, sym: 'Fe', name: 'Iron', mass: 55.845, group: 'Transition Metal' },
        { num: 29, sym: 'Cu', name: 'Copper', mass: 63.546, group: 'Transition Metal' },
        { num: 30, sym: 'Zn', name: 'Zinc', mass: 65.38, group: 'Transition Metal' },
        { num: 47, sym: 'Ag', name: 'Silver', mass: 107.87, group: 'Transition Metal' },
        { num: 79, sym: 'Au', name: 'Gold', mass: 196.97, group: 'Transition Metal' },
        { num: 80, sym: 'Hg', name: 'Mercury', mass: 200.59, group: 'Transition Metal' },
        { num: 82, sym: 'Pb', name: 'Lead', mass: 207.2, group: 'Post-Transition Metal' },
    ];

    const filtered = elements.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) || 
        e.sym.toLowerCase().includes(search.toLowerCase()) ||
        e.num.toString() === search
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border">
                <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                    <FlaskConical size={24} /> Element Lookup
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-secondary" size={18} />
                    <input 
                        type="text" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search by name, symbol, or atomic number..." 
                        className="w-full bg-gray-900/70 pl-10 p-3 rounded border border-brand-border focus:border-brand-primary outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(e => (
                    <div key={e.num} className="bg-brand-surface p-4 rounded-lg border border-brand-border flex items-center gap-4 hover:border-brand-primary/50 transition-colors">
                        <div className="w-14 h-14 shrink-0 rounded bg-gray-900 flex flex-col items-center justify-center border border-brand-border/50">
                            <span className="text-[10px] text-brand-text-secondary -mb-1">{e.num}</span>
                            <span className="text-lg font-bold text-brand-primary">{e.sym}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold truncate">{e.name}</div>
                            <div className="text-xs text-brand-text-secondary truncate">{e.mass} g/mol</div>
                            <div className="text-[10px] text-brand-accent mt-1 truncate">{e.group}</div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center p-8 text-brand-text-secondary">
                        No elements found matching "{search}".
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 10. AI Tutor ---
const AITutor = () => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: "Hi! I'm Nolo, your AI Tutor. Ask me a math, physics, or chemistry problem, and I'll help you solve it step-by-step instead of just giving you the answer. I can also help you with writing, history, and general high school subjects!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key is not configured.");
            }
            
            const ai = new GoogleGenAI({ apiKey });
            
            // Build history for context (simple concatenation for this example)
            const historyText = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n\n');
            const prompt = `${historyText}\n\nStudent: ${userText}`;
            
            const response = await ai.models.generateContent({
                model: "gemini-3.1-pro-preview",
                contents: prompt,
                config: {
                    systemInstruction: "You are Nolo, an AI step-by-step tutor for high school students. When given a math, physics, or chemistry problem, do NOT just give the final answer. Break it down into clear, logical steps so the student can learn how to solve it themselves. Ask guiding questions if necessary. For history, literature, or writing, provide constructive feedback and encourage critical thinking. Use markdown for formatting.",
                }
            });
            
            setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-surface/50 rounded-lg border border-brand-border flex flex-col h-[600px]">
            <div className="p-4 border-b border-brand-border bg-brand-surface/80 flex items-center gap-3 rounded-t-lg">
                <BrainCircuit className="text-brand-primary" />
                <div>
                    <h3 className="font-bold text-brand-text">Nolo - AI Step-by-Step Tutor</h3>
                    <p className="text-xs text-brand-text-secondary">Powered by Gemini 3.1 Pro</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-gray-800 text-brand-text rounded-tl-none'}`}>
                            {msg.role === 'user' ? (
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            ) : (
                                <div className="markdown-body text-sm">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-brand-text p-3 rounded-lg rounded-tl-none flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-brand-primary" />
                            <span className="text-sm text-brand-text-secondary">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-brand-border bg-brand-surface/80 rounded-b-lg">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your math or science problem here..."
                        className="flex-1 bg-gray-900/70 p-3 rounded-md border border-brand-border focus:border-brand-primary outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Student Tools Component ---
const StudentTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState('gpa');

    const tools = [
        { id: 'gpa', label: 'Grades & GPA', Icon: GraduationCap },
        { id: 'pomodoro', label: 'Study Timer', Icon: Timer },
        { id: 'geometry', label: 'Geometry', Icon: Triangle },
        { id: 'science', label: 'Science', Icon: Atom },
        { id: 'formulas', label: 'Formulas', Icon: BookOpen },
        { id: 'citations', label: 'Citations', Icon: Quote },
        { id: 'flashcards', label: 'Flashcards', Icon: Layers },
        { id: 'assignments', label: 'Assignments', Icon: CheckSquare },
        { id: 'elements', label: 'Elements', Icon: FlaskConical },
        { id: 'tutor', label: 'Nolo AI Tutor', Icon: BrainCircuit },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'gpa': return <GPACalculator />;
            case 'pomodoro': return <PomodoroTimer />;
            case 'geometry': return <GeometrySolver />;
            case 'science': return <ScienceTools />;
            case 'formulas': return <FormulaReference />;
            case 'citations': return <CitationGenerator />;
            case 'flashcards': return <Flashcards />;
            case 'assignments': return <AssignmentTracker />;
            case 'elements': return <ElementLookup />;
            case 'tutor': return <AITutor />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 text-brand-primary flex items-center justify-center gap-3">
                    <GraduationCap size={36} />
                    Student & Academic Tools
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto">
                    A suite of tools designed to help you study smarter, solve complex problems, and manage your academic life.
                </p>
            </div>
            
            <div className="flex justify-center flex-wrap gap-2 mb-8">
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

            <div className="bg-brand-surface/30 p-4 md:p-6 rounded-xl border border-brand-border/50 shadow-lg">
                {renderTool()}
            </div>
        </div>
    );
};

export default StudentTools;
