import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Scale, Pizza, Target, Timer, PersonStanding, GlassWater, Baby, Wine, AlertCircle, Dumbbell, Moon, Activity, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { formatNumber } from '../lib/formatters';

type HealthCalcType = 'bmi' | 'calorie-macro' | 'bodyfat' | 'idealweight' | 'heartrate' | 'pace' | 'lbm' | 'water' | 'pregnancy' | 'bac' | 'onerepmax' | 'sleep' | 'bloodpressure';
type UnitSystem = 'metric' | 'imperial';

// Reusable UI Components specific to Health Calculator
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void; layoutId?: string }> = ({ label, icon: Icon, isActive, onClick, layoutId }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-4 py-3 md:py-4 md:justify-start justify-center flex items-center gap-3 rounded-xl font-bold transition-all duration-300 text-sm min-w-[140px] md:min-w-0 w-full relative ${
            isActive 
                ? 'text-brand-primary' 
                : 'text-brand-text-secondary hover:text-white hover:bg-brand-surface/50'
        }`}
    >
        {isActive && (
            <motion.div 
                layoutId={layoutId}
                className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <Icon size={18} className="relative z-10" />
        <span className="relative z-10">{label}</span>
    </button>
);

const UnitToggleButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
     <button
        onClick={onClick}
        className={`px-3 py-1 text-sm rounded-full ${isActive ? 'bg-brand-accent text-white' : 'bg-brand-surface'}`}
    >
        {label}
    </button>
);

const Input = ({ label, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ElementType }) => (
    <div className="group space-y-2">
        <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-primary flex items-center gap-2">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <div className="relative">
            <input 
                {...props} 
                className="w-full bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-mono placeholder:text-brand-text-secondary/30" 
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
    </div>
);

const Select = ({ label, icon: Icon, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; icon?: React.ElementType }) => (
    <div className="group space-y-2">
        <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-primary flex items-center gap-2">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <div className="relative">
            <select 
                {...props} 
                className="w-full bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-mono appearance-none"
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary">
                <Activity size={16} />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
    </div>
);

const ResultCard = ({ title, value, unit, category, color, description, icon: Icon }: { title: string; value: string; unit?: string; category?: string; color?: string; description?: string; icon?: React.ElementType }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-8 overflow-hidden rounded-[2rem] border border-brand-border/40 bg-brand-bg relative group"
    >
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${color || 'from-brand-primary to-brand-accent'}`} />
        <div className="relative p-8 text-center">
            {Icon && (
                <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-brand-surface/80 border border-brand-border/30 ${color ? color.split(' ')[0] : 'text-brand-primary'}`}>
                    <Icon size={24} />
                </div>
            )}
            <p className="text-xs font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{title}</p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className={`text-6xl font-black tracking-tighter ${color ? color.split(' ')[0] : 'text-brand-accent font-glow'}`}>
                    {value}
                </span>
                {unit && <span className="text-xl font-bold text-brand-text-secondary">{unit}</span>}
            </div>
            {category && (
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border ${color ? color.replace('text-', 'bg-').replace('text-', 'border-') + '/20' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${color ? color.split(' ')[0].replace('text-', 'bg-') : 'bg-brand-primary'}`} />
                    {category}
                </div>
            )}
            {description && (
                <p className="text-sm text-brand-text-secondary max-w-sm mx-auto leading-relaxed font-mono">
                    {description}
                </p>
            )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
    </motion.div>
);


// Individual Calculator Implementations
const BMICalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [weight, setWeight] = useState(unitSystem === 'metric' ? '70' : '155');
    const [heightCm, setHeightCm] = useState('175');
    const [heightFt, setHeightFt] = useState('5');
    const [heightIn, setHeightIn] = useState('9');

    const result = useMemo(() => {
        let weightKg = parseFloat(weight);
        let heightM: number;

        if (unitSystem === 'imperial') {
            const hFt = parseFloat(heightFt);
            const hIn = parseFloat(heightIn);
            if (isNaN(hFt) || isNaN(hIn)) return null;
            weightKg *= 0.453592; // lbs to kg
            heightM = (hFt * 12 + hIn) * 0.0254; // ft+in to m
        } else {
             const hCm = parseFloat(heightCm);
             if (isNaN(hCm)) return null;
             heightM = hCm / 100;
        }

        if (isNaN(weightKg) || isNaN(heightM) || heightM <= 0 || weightKg <= 0) return null;
        
        const bmi = weightKg / (heightM * heightM);
        const bmiValue = bmi;
        let category = '';
        let color = '';
        let description = '';
        
        if (bmiValue < 18.5) { 
            category = 'Underweight'; 
            color = 'text-blue-400 from-blue-500 to-cyan-500'; 
            description = 'High nutrient density recommended.';
        }
        else if (bmiValue < 25) { 
            category = 'Normal weight'; 
            color = 'text-green-400 from-green-500 to-emerald-500'; 
            description = 'Optimal physiological balance achieved.';
        }
        else if (bmiValue < 30) { 
            category = 'Overweight'; 
            color = 'text-yellow-400 from-yellow-500 to-orange-500'; 
            description = 'Metabolic optimization suggested.';
        }
        else { 
            category = 'Obesity'; 
            color = 'text-red-400 from-red-500 to-pink-500'; 
            description = 'Medical consultation recommended.';
        }

        return { bmi: bmi.toFixed(1), category, color, description };
    }, [unitSystem, weight, heightCm, heightFt, heightIn]);

    return (
        <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input icon={Scale} label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                {unitSystem === 'metric' ? (
                     <Input icon={PersonStanding} label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Input icon={PersonStanding} label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                        <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                    </div>
                )}
            </div>
            {result && (
                <ResultCard 
                    title="Computed BMI Index"
                    value={formatNumber(result.bmi)}
                    category={result.category}
                    color={result.color}
                    description={result.description}
                    icon={Activity}
                />
            )}
        </div>
    );
};

const BodyFatCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [heightCm, setHeightCm] = useState('175');
    const [heightFt, setHeightFt] = useState('5');
    const [heightIn, setHeightIn] = useState('9');
    const [waist, setWaist] = useState(unitSystem === 'metric' ? '85' : '33');
    const [neck, setNeck] = useState(unitSystem === 'metric' ? '38' : '15');
    const [hip, setHip] = useState(unitSystem === 'metric' ? '97' : '38');

    const result = useMemo(() => {
        let hCm = parseFloat(heightCm);
        let wCm = parseFloat(waist);
        let nCm = parseFloat(neck);
        let hipCm = parseFloat(hip);
        
        if (unitSystem === 'imperial') {
            const hFt = parseFloat(heightFt);
            const hIn = parseFloat(heightIn);
            if (isNaN(hFt) || isNaN(hIn)) return null;
            hCm = (hFt * 12 + hIn) * 2.54;
            wCm *= 2.54;
            nCm *= 2.54;
            hipCm *= 2.54;
        }

        if (isNaN(hCm) || isNaN(wCm) || isNaN(nCm) || (gender === 'female' && isNaN(hipCm)) || hCm <= 0 || wCm <= 0 || nCm <= 0) return null;

        let bfp = 0;
        // US Navy Method
        if (gender === 'male') {
            bfp = 86.010 * Math.log10(wCm - nCm) - 70.041 * Math.log10(hCm) + 36.76;
        } else {
            if (hipCm <= 0) return null;
            bfp = 163.205 * Math.log10(wCm + hipCm - nCm) - 97.684 * Math.log10(hCm) - 78.387;
        }

        if (bfp < 2) bfp = 2; // Floor at a reasonable minimum

        return { bfp: bfp.toFixed(1) };
    }, [unitSystem, gender, heightCm, heightFt, heightIn, waist, neck, hip]);

    return (
        <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select label="Biological Gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </Select>
                {unitSystem === 'metric' ? (
                    <Input icon={PersonStanding} label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Input icon={PersonStanding} label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                        <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                    </div>
                )}
                <Input label={`Waist (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={waist} onChange={e => setWaist(e.target.value)} />
                <Input label={`Neck (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={neck} onChange={e => setNeck(e.target.value)} />
                {gender === 'female' && <Input label={`Hip (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={hip} onChange={e => setHip(e.target.value)} />}
            </div>
            {result && (
                <ResultCard 
                    title="Computed Body Fat"
                    value={formatNumber(result.bfp)}
                    unit="%"
                    description="Estimated via US Navy algorithm using anthropometric measurements."
                    icon={Droplets}
                />
            )}
        </div>
    );
};

const IdealWeightCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [heightCm, setHeightCm] = useState('175');
    const [heightFt, setHeightFt] = useState('5');
    const [heightIn, setHeightIn] = useState('9');

    const result = useMemo(() => {
        let hCm = parseFloat(heightCm);
        if (unitSystem === 'imperial') {
            const hFt = parseFloat(heightFt);
            const hIn = parseFloat(heightIn);
            if (isNaN(hFt) || isNaN(hIn)) return null;
            hCm = (hFt * 12 + hIn) * 2.54;
        }

        if (isNaN(hCm) || hCm <= 0) return null;

        const hInches = hCm / 2.54;
        const hMeters = hCm / 100;
        const inchesOver5Ft = hInches > 60 ? hInches - 60 : 0;

        const rangesKg: Record<string, number> = {};
        if (gender === 'male') {
            rangesKg['G.J. Hamwi (1964)'] = 48 + 2.7 * inchesOver5Ft;
            rangesKg['B.J. Devine (1974)'] = 50 + 2.3 * inchesOver5Ft;
            rangesKg['J.D. Robinson (1983)'] = 52 + 1.9 * inchesOver5Ft;
            rangesKg['D.R. Miller (1983)'] = 56.2 + 1.41 * inchesOver5Ft;
        } else {
            rangesKg['G.J. Hamwi (1964)'] = 45.5 + 2.2 * inchesOver5Ft;
            rangesKg['B.J. Devine (1974)'] = 45.5 + 2.3 * inchesOver5Ft;
            rangesKg['J.D. Robinson (1983)'] = 49 + 1.7 * inchesOver5Ft;
            rangesKg['D.R. Miller (1983)'] = 53.1 + 1.36 * inchesOver5Ft;
        }

        const healthyBmiMinKg = 18.5 * hMeters * hMeters;
        const healthyBmiMaxKg = 24.9 * hMeters * hMeters;

        const formatRange = (min: number, max: number) => {
            if (unitSystem === 'imperial') {
                return `${(min * 2.20462).toFixed(1)} - ${(max * 2.20462).toFixed(1)} lbs`;
            }
            return `${min.toFixed(1)} - ${max.toFixed(1)} kg`;
        };

        const allWeights = Object.values(rangesKg);
        const avgMin = Math.min(...allWeights);
        const avgMax = Math.max(...allWeights);
        
        return {
            ranges: Object.entries(rangesKg).map(([name, val]) => ({ name, value: formatRange(val, val).split(' - ')[0] })),
            healthyBmi: formatRange(healthyBmiMinKg, healthyBmiMaxKg),
            avgRange: formatRange(avgMin, avgMax),
        };
    }, [unitSystem, gender, heightCm, heightFt, heightIn]);

    return (
        <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select label="Biological Gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </Select>
                {unitSystem === 'metric' ? (
                    <Input icon={PersonStanding} label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Input icon={PersonStanding} label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                        <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                    </div>
                )}
            </div>
            {result && (
                <div className="mt-8 space-y-6">
                    <ResultCard 
                        title="Healthy BMI Weight Range"
                        value={result.healthyBmi.split(' ')[0]}
                        unit={result.healthyBmi.split(' ')[2]}
                        description="The weight range where your BMI is between 18.5 and 24.9."
                        color="text-emerald-400 from-emerald-500 to-teal-500"
                        icon={Activity}
                    />
                    <div className="bg-brand-bg/50 border border-brand-border/30 rounded-[2rem] p-6">
                        <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Estimation Consensus</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {result.ranges.map((r, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-brand-surface/30 border border-brand-border/10">
                                    <span className="text-[10px] text-brand-text-secondary uppercase font-bold">{r.name.split(' (')[0]}</span>
                                    <span className="font-mono font-bold text-brand-text">{r.value}{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HeartRateCalculator: React.FC = () => {
    const [age, setAge] = useState('30');
    
    const result = useMemo(() => {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum <= 0) return null;
        
        const maxHr = 220 - ageNum;
        
        const zones = [
            { name: 'Zone 1: Very Light', percentage: '50-60%', range: `${Math.round(maxHr * 0.5)} - ${Math.round(maxHr * 0.6)}`, color: 'bg-blue-500', width: 10 },
            { name: 'Zone 2: Light', percentage: '60-70%', range: `${Math.round(maxHr * 0.6)} - ${Math.round(maxHr * 0.7)}`, color: 'bg-green-500', width: 10 },
            { name: 'Zone 3: Moderate', percentage: '70-80%', range: `${Math.round(maxHr * 0.7)} - ${Math.round(maxHr * 0.8)}`, color: 'bg-yellow-500', width: 10 },
            { name: 'Zone 4: Hard', percentage: '80-90%', range: `${Math.round(maxHr * 0.8)} - ${Math.round(maxHr * 0.9)}`, color: 'bg-orange-500', width: 10 },
            { name: 'Zone 5: Maximum', percentage: '90-100%', range: `${Math.round(maxHr * 0.9)} - ${maxHr}`, color: 'bg-red-500', width: 10 },
        ];

        return { maxHr, zones };
    }, [age]);

    return (
        <div className="max-w-xl mx-auto">
            <Input icon={Activity} label="Chronological Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
            {result && (
                <div className="mt-8 space-y-6">
                    <ResultCard 
                        title="Max Heart Rate"
                        value={result.maxHr.toString()}
                        unit="BPM"
                        description="Estimated maximum cardiac capacity based on age."
                        icon={Target}
                    />
                    
                    <div className="bg-brand-bg/50 border border-brand-border/30 rounded-[2.5rem] p-8">
                        <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-6 text-center">Neurometabolic Zones</h4>
                        
                        <div className="space-y-3">
                            {result.zones.map(zone => (
                                <div key={zone.name} className="group flex items-center justify-between p-4 rounded-2xl bg-brand-surface/30 border border-brand-border/10 hover:border-brand-primary/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${zone.color} group-hover:scale-125 transition-transform`} />
                                        <div>
                                            <span className="font-bold text-sm block">{zone.name.split(': ')[1]}</span>
                                            <span className="text-[10px] text-brand-text-secondary uppercase font-bold">{zone.percentage}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono text-lg font-black text-brand-text">{zone.range}</span>
                                        <span className="text-[10px] text-brand-text-secondary font-bold block">BPM</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const activityLevels = [
    { label: "Sedentary (little or no exercise)", value: 1.2 },
    { label: "Lightly active (light exercise/sports 1-3 days/week)", value: 1.375 },
    { label: "Moderately active (moderate exercise/sports 3-5 days/week)", value: 1.55 },
    { label: "Very active (hard exercise/sports 6-7 days a week)", value: 1.725 },
    { label: "Extra active (very hard exercise/physical job)", value: 1.9 },
];

const CalorieMacroCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [age, setAge] = useState('30');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState(unitSystem === 'metric' ? '70' : '155');
    const [heightCm, setHeightCm] = useState('175');
    const [heightFt, setHeightFt] = useState('5');
    const [heightIn, setHeightIn] = useState('9');
    const [activity, setActivity] = useState(activityLevels[1].value);
    
    const [goal, setGoal] = useState('maintenance');
    const [plan, setPlan] = useState('balanced');

    const { calorieGoals } = useMemo(() => {
        let weightKg = parseFloat(weight);
        let hCm = parseFloat(heightCm);
        const ageNum = parseInt(age);
        if (isNaN(ageNum)) return { bmr: null, calorieGoals: null };

        if (unitSystem === 'imperial') {
            const hFt = parseFloat(heightFt);
            const hIn = parseFloat(heightIn);
            if (isNaN(hFt) || isNaN(hIn)) return { bmr: null, calorieGoals: null };
            weightKg *= 0.453592;
            hCm = (hFt * 12 + hIn) * 2.54;
        }
        
        if (isNaN(weightKg) || isNaN(hCm) || weightKg <= 0 || hCm <= 0 || ageNum <= 0) return { bmr: null, calorieGoals: null };

        let calculatedBmr: number;
        if (gender === 'male') {
            calculatedBmr = 10 * weightKg + 6.25 * hCm - 5 * ageNum + 5;
        } else {
            calculatedBmr = 10 * weightKg + 6.25 * hCm - 5 * ageNum - 161;
        }
        
        const maintenance = Math.round(calculatedBmr * activity);
        const goals = {
            maintenance: maintenance,
            mildLoss: maintenance - 250,
            loss: maintenance - 500,
            mildGain: maintenance + 250,
            gain: maintenance + 500,
        };
        
        return { bmr: Math.round(calculatedBmr), calorieGoals: goals };

    }, [unitSystem, age, gender, weight, heightCm, heightFt, heightIn, activity]);

    const macroResult = useMemo(() => {
        if (!calorieGoals) return null;
        const targetCalories = (calorieGoals as Record<string, number>)[goal];
        
        const plans: Record<string, {p: number, c: number, f: number}> = {
            balanced: { p: 0.30, c: 0.40, f: 0.30 },
            lowcarb: { p: 0.40, c: 0.25, f: 0.35 },
            highprotein: { p: 0.40, c: 0.30, f: 0.30 },
        };
        
        const { p, c, f } = plans[plan];
        
        const proteinGrams = Math.round((targetCalories * p) / 4);
        const carbGrams = Math.round((targetCalories * c) / 4);
        const fatGrams = Math.round((targetCalories * f) / 9);
        
        const pieData = [
            { name: 'Protein', value: proteinGrams },
            { name: 'Carbs', value: carbGrams },
            { name: 'Fat', value: fatGrams },
        ];
        
        return { pieData, targetCalories };
    }, [calorieGoals, goal, plan]);
    
    const PIE_COLORS = ['#4299e1', '#48bb78', '#ed8936'];
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={14} className="text-brand-primary" />
                            Biometric Parameters
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Chronological Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
                            <Select label="Gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </Select>
                            <Input label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                            {unitSystem === 'metric' ? (
                                <Input label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                                    <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={14} className="text-brand-primary" />
                            Active Capacity
                        </h3>
                        <Select label="Metabolic Activity" value={activity} onChange={e => setActivity(parseFloat(e.target.value))}>
                            {activityLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                        </Select>
                    </div>

                    {calorieGoals && (
                        <div className="bg-brand-bg/50 border border-brand-border/30 rounded-[2rem] p-6 space-y-4">
                            <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] text-center border-b border-brand-border/10 pb-4">Daily TDEE Projections</h4>
                            <div className="grid gap-2">
                                {Object.entries(calorieGoals).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-brand-surface/20 border border-brand-border/5">
                                        <span className="text-xs font-bold text-brand-text/80 capitalize">{key.replace('mild', 'Mild ').replace('loss', 'Loss').replace('gain', 'Gain')}</span>
                                        <div className="text-right">
                                            <span className="font-mono font-black text-brand-text">{value.toLocaleString()}</span>
                                            <span className="text-[10px] text-brand-text-secondary font-bold ml-1">CAL/DAY</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Target size={14} className="text-brand-primary" />
                            Optimization Targets
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select label="Primary Objective" value={goal} onChange={e => setGoal(e.target.value)}>
                                <option value="loss">Weight Loss</option>
                                <option value="mildLoss">Mild Weight Loss</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="mildGain">Mild Weight Gain</option>
                                <option value="gain">Weight Gain</option>
                            </Select>
                            <Select label="Nutrient Partitioning" value={plan} onChange={e => setPlan(e.target.value)}>
                                <option value="balanced">Balanced</option>
                                <option value="lowcarb">Low Carb</option>
                                <option value="highprotein">High Protein</option>
                            </Select>
                        </div>
                    </div>

                    {macroResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-brand-surface/30 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                            
                            <div className="text-center relative z-10">
                                <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.3em] mb-2">Target Daily Intake</p>
                                <div className="flex items-baseline justify-center gap-2 mb-6">
                                    <span className="text-5xl font-black text-brand-accent font-glow tracking-tighter">
                                        {macroResult.targetCalories.toLocaleString()}
                                    </span>
                                    <span className="text-sm font-bold text-brand-text-secondary">CALORIES</span>
                                </div>

                                <div className="h-48 w-full relative">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={macroResult.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5}>
                                                {macroResult.pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} /> 
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [`${value}g`, name]} contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xs font-bold text-brand-text-secondary uppercase">Macros</span>
                                        <Pizza size={14} className="text-brand-primary mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-8">
                                    {macroResult.pieData.map((macro, i) => (
                                        <div key={macro.name} className="p-3 rounded-2xl bg-brand-bg/50 border border-brand-border/10">
                                            <div className="text-[10px] font-bold text-brand-text-secondary uppercase mb-1">{macro.name}</div>
                                            <div className="font-mono font-black text-lg" style={{ color: PIE_COLORS[i] }}>{macro.value}g</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PaceCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [distance, setDistance] = useState('5');
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('25');
    const [seconds, setSeconds] = useState('0');
    const [paceMin, setPaceMin] = useState('');
    const [paceSec, setPaceSec] = useState('');
    const result = useMemo(() => {
        const dist = parseFloat(distance);
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;
        const pMin = parseInt(paceMin) || 0;
        const pSec = parseInt(paceSec) || 0;

        const totalTimeSec = h * 3600 + m * 60 + s;
        const totalPaceSec = pMin * 60 + pSec;
        const unitLabel = unitSystem === 'metric' ? 'km' : 'mi';

        // Calculate Pace
        if (totalTimeSec > 0 && dist > 0) {
            const pace = totalTimeSec / dist;
            const paceMinutes = Math.floor(pace / 60);
            const paceSeconds = Math.round(pace % 60);
            return `Pace: ${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} / ${unitLabel}`;
        }
        // Calculate Time
        else if (totalPaceSec > 0 && dist > 0) {
            const time = totalPaceSec * dist;
            const timeHours = Math.floor(time / 3600);
            const timeMinutes = Math.floor((time % 3600) / 60);
            const timeSeconds = Math.round(time % 60);
            return `Time: ${timeHours}:${timeMinutes.toString().padStart(2, '0')}:${timeSeconds.toString().padStart(2, '0')}`;
        }
        // Calculate Distance
        else if (totalPaceSec > 0 && totalTimeSec > 0) {
            const distCalc = totalTimeSec / totalPaceSec;
            return `Distance: ${distCalc.toFixed(2)} ${unitLabel}`;
        } else {
            return '';
        }
    }, [distance, hours, minutes, seconds, paceMin, paceSec, unitSystem]);

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-6">
                <Input label="Exercise Distance" type="number" value={distance} onChange={e => setDistance(e.target.value)} />
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Timer size={12} />
                        Duration (HH:MM:SS)
                    </label>
                    <div className="flex items-center gap-3">
                        <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="flex-1 bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 outline-none transition-all font-mono text-center" placeholder="HH" />
                        <span className="text-brand-text-secondary font-bold">:</span>
                        <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className="flex-1 bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 outline-none transition-all font-mono text-center" placeholder="MM" />
                        <span className="text-brand-text-secondary font-bold">:</span>
                        <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className="flex-1 bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 outline-none transition-all font-mono text-center" placeholder="SS" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Activity size={12} />
                        Target Pace (MIN:SEC / {unitSystem === 'metric' ? 'KM' : 'MI'})
                    </label>
                    <div className="flex items-center gap-3">
                        <input type="number" value={paceMin} onChange={e => setPaceMin(e.target.value)} className="flex-1 bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 outline-none transition-all font-mono text-center" placeholder="MIN" />
                        <span className="text-brand-text-secondary font-bold">:</span>
                        <input type="number" value={paceSec} onChange={e => setPaceSec(e.target.value)} className="flex-1 bg-brand-surface/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-brand-border/40 focus:border-brand-primary/50 outline-none transition-all font-mono text-center" placeholder="SEC" />
                    </div>
                </div>
            </div>

            {result && (
                 <ResultCard 
                    title="Calculated Metric"
                    value={result.split(': ')[1].split(' /')[0]}
                    unit={result.split(' /')[1] || result.split(': ')[1].split(' ')[1]}
                    category={result.split(': ')[0]}
                    icon={Timer}
                 />
            )}
        </div>
    );
};

const LeanBodyMassCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [weight, setWeight] = useState(unitSystem === 'metric' ? '70' : '155');
    const [bfp, setBfp] = useState('15');

    const result = useMemo(() => {
        const w = parseFloat(weight);
        const bf = parseFloat(bfp);
        if (isNaN(w) || isNaN(bf) || w <= 0 || bf < 0 || bf >= 100) return null;

        const fatMass = w * (bf / 100);
        const lbm = w - fatMass;

        return { lbm: lbm.toFixed(1), fatMass: fatMass.toFixed(1) };
    }, [weight, bfp]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Input icon={Scale} label={`Current Body Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            <Input icon={Droplets} label="Body Fat Percentage (%)" type="number" value={bfp} onChange={e => setBfp(e.target.value)} />
            {result && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="bg-brand-surface/30 border border-brand-border/40 p-6 rounded-[2rem] text-center">
                        <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-2">Lean Mass</p>
                        <p className="text-3xl font-black text-brand-primary">{formatNumber(result.lbm)}</p>
                        <p className="text-xs font-bold text-brand-text-secondary mt-1">{unitSystem === 'metric' ? 'KG' : 'LBS'}</p>
                    </div>
                    <div className="bg-brand-surface/30 border border-brand-border/40 p-6 rounded-[2rem] text-center">
                        <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-2">Fat Mass</p>
                        <p className="text-3xl font-black text-brand-secondary">{formatNumber(result.fatMass)}</p>
                        <p className="text-xs font-bold text-brand-text-secondary mt-1">{unitSystem === 'metric' ? 'KG' : 'LBS'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const WaterIntakeCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [weight, setWeight] = useState(unitSystem === 'metric' ? '70' : '155');
    const [exercise, setExercise] = useState('30'); // minutes

    const result = useMemo(() => {
        let weightLbs = parseFloat(weight);
        if (unitSystem === 'metric') {
            weightLbs *= 2.20462;
        }
        const exerciseMins = parseFloat(exercise);

        if (isNaN(weightLbs) || isNaN(exerciseMins) || weightLbs <= 0) return null;

        const baseIntakeOz = weightLbs * (2 / 3);
        const exerciseIntakeOz = Math.floor(exerciseMins / 30) * 12;
        const totalOz = baseIntakeOz + exerciseIntakeOz;

        return {
            liters: (totalOz * 0.0295735).toFixed(1),
            ounces: totalOz.toFixed(0),
            glasses: (totalOz / 8).toFixed(1),
        };
    }, [weight, exercise, unitSystem]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Input icon={Scale} label={`Body Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            <Input icon={Timer} label="Daily Physical Activity (minutes)" type="number" value={exercise} onChange={e => setExercise(e.target.value)} />
            {result && (
                 <ResultCard 
                    title="Objective Hydration Level"
                    value={result.liters}
                    unit="LITERS"
                    description={`Equivalent to ~${result.ounces} oz or ${result.glasses} standard glasses.`}
                    icon={GlassWater}
                 />
            )}
        </div>
    );
};

const PregnancyCalculator: React.FC = () => {
    const [method, setMethod] = useState<'lmp' | 'conception'>('lmp');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const result = useMemo(() => {
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) return null;

        let dueDate: Date;
        if (method === 'lmp') {
            dueDate = new Date(inputDate.getTime());
            dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
        } else {
            dueDate = new Date(inputDate.getTime());
            dueDate.setDate(dueDate.getDate() + 266); // 38 weeks
        }
        
        const today = new Date();
        const daysPregnant = Math.floor((today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(daysPregnant / 7);
        const days = daysPregnant % 7;

        let trimester = 0;
        if (weeks < 14) trimester = 1;
        else if (weeks < 28) trimester = 2;
        else trimester = 3;

        return {
            dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            gestationalAge: `${weeks} weeks, ${days} days`,
            trimester
        };
    }, [method, date]);

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex justify-center p-1 bg-brand-bg rounded-2xl border border-brand-border/30">
                <UnitToggleButton label="LMP Method" isActive={method === 'lmp'} onClick={() => setMethod('lmp')} />
                <UnitToggleButton label="Conception Method" isActive={method === 'conception'} onClick={() => setMethod('conception')} />
            </div>
            <Input icon={Activity} label="Reference Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            {result && (
                <div className="space-y-6">
                    <ResultCard 
                        title="Estimated Delivery Date"
                        value={result.dueDate.split(', ')[0]}
                        unit={result.dueDate.split(', ')[1]}
                        description={`Gestational Age: ${result.gestationalAge}`}
                        category={`Trimester ${result.trimester}`}
                        color="text-brand-primary from-brand-primary/20 to-brand-accent/20"
                        icon={Baby}
                    />
                </div>
            )}
        </div>
    );
};

const BACCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [weight, setWeight] = useState(unitSystem === 'metric' ? '75' : '165');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [drinks, setDrinks] = useState('2');
    const [hours, setHours] = useState('2');

    const result = useMemo(() => {
        let weightKg = parseFloat(weight);
        if (unitSystem === 'imperial') {
            weightKg *= 0.453592;
        }
        const numDrinks = parseInt(drinks);
        const timeHours = parseFloat(hours);

        if (isNaN(weightKg) || isNaN(numDrinks) || isNaN(timeHours) || weightKg <= 0 || numDrinks < 0 || timeHours < 0) return null;

        const alcoholGrams = numDrinks * 14; // Standard drink in US = 14g alcohol
        const genderConstant = gender === 'male' ? 0.68 : 0.55;
        const metabolismRate = 0.015;

        const bac = ((alcoholGrams / (weightKg * 1000 * genderConstant)) * 100) - (timeHours * metabolismRate);
        const finalBac = Math.max(0, bac);

        let status = '';
        if (finalBac < 0.02) status = 'Sober';
        else if (finalBac < 0.08) status = 'Impairment Likely';
        else if (finalBac < 0.15) status = 'Legally Intoxicated';
        else status = 'High Risk';
        
        return { bac: finalBac.toFixed(3), status };
    }, [weight, gender, drinks, hours, unitSystem]);
    
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                <Select label="Biological Gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </Select>
                <Input label="Standard Servings" type="number" value={drinks} onChange={e => setDrinks(e.target.value)} />
                <Input label="Hours Elapsed" type="number" value={hours} onChange={e => setHours(e.target.value)} />
            </div>
             <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-4">
                <AlertCircle size={20} className="text-orange-500 shrink-0" />
                <p className="text-[10px] text-orange-200/80 font-mono uppercase leading-relaxed">
                    <strong>Critical Warning:</strong> Algorithmic derivation only. Do not rely for safety. Physiological variance is unpredictable.
                </p>
            </div>
            {result && (
                <ResultCard 
                    title="Estimated BAC Index"
                    value={result.bac}
                    category={result.status}
                    color={result.status === 'Sober' ? 'text-green-400' : 'text-red-400'}
                    description="Calculated using Widmark formula with standard metabolism rates."
                    icon={Wine}
                />
            )}
        </div>
    )
}







const OneRepMaxCalculator: React.FC<{ unitSystem: UnitSystem }> = ({ unitSystem }) => {
    const [weight, setWeight] = useState('100');
    const [reps, setReps] = useState('5');

    const result = useMemo(() => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return null;

        let epley = w * (1 + r / 30);
        if (r === 1) epley = w;

        const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map(p => ({
            percent: p,
            weight: (epley * (p / 100)).toFixed(1)
        }));

        return {
            oneRepMax: epley.toFixed(1),
            percentages
        };
    }, [weight, reps]);

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input icon={Dumbbell} label={`Resistance (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                <Input icon={Activity} label="Form Repetitions" type="number" value={reps} onChange={e => setReps(e.target.value)} />
            </div>
            {result && (
                <div className="space-y-8">
                    <ResultCard 
                        title="Estimated Absolute Max"
                        value={result.oneRepMax}
                        unit={unitSystem === 'metric' ? 'KG' : 'LBS'}
                        description="Theoretical maximal performance capacity derived via Epley integration."
                        icon={Target}
                    />
                    <div className="bg-brand-bg/50 border border-brand-border/30 rounded-[2.5rem] p-8">
                        <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-6 text-center">Intensity Partitioning</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {result.percentages.map(p => (
                                <div key={p.percent} className="bg-brand-surface/30 border border-brand-border/10 p-3 rounded-2xl text-center group hover:border-brand-primary/30 transition-all">
                                    <div className="text-[10px] text-brand-text-secondary font-bold mb-1">{p.percent}%</div>
                                    <div className="font-mono font-black text-brand-text group-hover:text-brand-primary transition-colors">{p.weight}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SleepCalculator: React.FC = () => {
    const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
    const [time, setTime] = useState('07:00');

    const result = useMemo(() => {
        if (!time) return null;
        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);
        if (isNaN(hours) || isNaN(minutes)) return null;

        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);

        const cycles = [6, 5, 4, 3]; // Number of 90-min cycles
        const cycleLengthMs = 90 * 60 * 1000;
        const fallAsleepMs = 15 * 60 * 1000;

        const times = cycles.map(c => {
            const t = new Date(targetTime.getTime());
            if (mode === 'wake') {
                t.setTime(t.getTime() - (c * cycleLengthMs) - fallAsleepMs);
            } else {
                t.setTime(t.getTime() + (c * cycleLengthMs) + fallAsleepMs);
            }
            return {
                cycles: c,
                hours: (c * 90) / 60,
                timeStr: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        });

        return times;
    }, [mode, time]);

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex justify-center p-1 bg-brand-bg rounded-2xl border border-brand-border/30">
                <UnitToggleButton label="Wake Up Target" isActive={mode === 'wake'} onClick={() => setMode('wake')} />
                <UnitToggleButton label="Sleep Onset Plan" isActive={mode === 'sleep'} onClick={() => setMode('sleep')} />
            </div>
            <Input icon={Moon} label="Target Timestamp" type="time" value={time} onChange={e => setTime(e.target.value)} />
            
            {result && (
                <div className="bg-brand-surface/20 border border-brand-border/40 rounded-[2.5rem] p-8 space-y-6">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] text-center border-b border-brand-border/10 pb-6">
                        {mode === 'wake' ? 'Optimal Onset Windows' : 'Optimal Awakening Intervals'}
                    </h4>
                    <div className="grid gap-3">
                        {result.map((r, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-brand-bg/50 border border-brand-border/20 rounded-2xl group hover:border-brand-primary/40 transition-all">
                                <div>
                                    <span className="text-3xl font-black text-brand-accent font-glow tracking-tighter group-hover:text-brand-primary transition-colors">{r.timeStr}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-brand-text uppercase">{r.cycles} Neural Cycles</div>
                                    <div className="text-[10px] text-brand-text-secondary font-bold uppercase">{r.hours}H Total Duration</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-brand-text-secondary text-center uppercase font-bold tracking-widest bg-brand-surface/40 p-3 rounded-xl border border-brand-border/10">
                        * Indexed with 15-minute neural transition buffer.
                    </p>
                </div>
            )}
        </div>
    );
};

const BloodPressureCalculator: React.FC = () => {
    const [systolic, setSystolic] = useState('120');
    const [diastolic, setDiastolic] = useState('80');

    const result = useMemo(() => {
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);

        if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return null;

        let category = '';
        let color = '';
        let description = '';

        if (sys > 180 || dia > 120) {
            category = 'Hypertensive Crisis';
            color = 'text-red-600 bg-red-900/30';
            description = 'Consult your doctor immediately.';
        } else if (sys >= 140 || dia >= 90) {
            category = 'High Blood Pressure (Stage 2)';
            color = 'text-red-400 bg-red-900/20';
            description = 'Consult your doctor.';
        } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
            category = 'High Blood Pressure (Stage 1)';
            color = 'text-orange-400 bg-orange-900/20';
            description = 'Lifestyle changes recommended. Consult your doctor.';
        } else if (sys >= 120 && sys <= 129 && dia < 80) {
            category = 'Elevated';
            color = 'text-yellow-400 bg-yellow-900/20';
            description = 'Healthy lifestyle changes recommended.';
        } else if (sys < 120 && dia < 80) {
            category = 'Normal';
            color = 'text-green-400 bg-green-900/20';
            description = 'Keep up the good work!';
        } else {
            category = 'Mixed / Uncategorized';
            color = 'text-gray-400 bg-gray-800';
            description = 'Please check your inputs or consult a doctor.';
        }

        return { category, color, description };
    }, [systolic, diastolic]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Systolic (Upper)" type="number" value={systolic} onChange={e => setSystolic(e.target.value)} />
                <Input label="Diastolic (Lower)" type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} />
            </div>
            {result && (
                <ResultCard 
                    title="Computed BP Classification"
                    value={`${systolic}/${diastolic}`}
                    unit="mmHg"
                    category={result.category}
                    color={result.color}
                    description={result.description}
                    icon={Activity}
                />
            )}
        </div>
    );
};

const HealthCalculator: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState<HealthCalcType>('calorie-macro');
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

    const calculators = [
        { id: 'calorie-macro', label: 'Calories & Macros', Icon: Pizza },
        { id: 'bmi', label: 'BMI', Icon: Scale },
        { id: 'bodyfat', label: 'Body Fat %', Icon: Droplets },
        { id: 'lbm', label: 'Lean Body Mass', Icon: PersonStanding },
        { id: 'idealweight', label: 'Ideal Weight', Icon: Scale },
        { id: 'onerepmax', label: 'One Rep Max', Icon: Dumbbell },
        { id: 'heartrate', label: 'Heart Rate Zones', Icon: Target },
        { id: 'pace', label: 'Pace', Icon: Timer },
        { id: 'water', label: 'Water Intake', Icon: GlassWater },
        { id: 'sleep', label: 'Sleep Cycles', Icon: Moon },
        { id: 'bloodpressure', label: 'Blood Pressure', Icon: Activity },
        { id: 'pregnancy', label: 'Pregnancy', Icon: Baby },
        { id: 'bac', label: 'BAC', Icon: Wine },
    ];
    
    const calculatorHasUnits = useMemo(() => {
        return ['bmi', 'calorie-macro', 'bodyfat', 'idealweight', 'pace', 'lbm', 'water', 'bac', 'onerepmax'].includes(activeCalc);
    }, [activeCalc]);

    const renderCalculator = () => {
        const key = `${activeCalc}-${unitSystem}`; // Re-mount component on unit change to reset state
        switch (activeCalc) {
            case 'bmi': return <BMICalculator key={key} unitSystem={unitSystem} />;
            case 'calorie-macro': return <CalorieMacroCalculator key={key} unitSystem={unitSystem} />;
            case 'bodyfat': return <BodyFatCalculator key={key} unitSystem={unitSystem} />;
            case 'idealweight': return <IdealWeightCalculator key={key} unitSystem={unitSystem} />;
            case 'onerepmax': return <OneRepMaxCalculator key={key} unitSystem={unitSystem} />;
            case 'heartrate': return <HeartRateCalculator key={key} />;
            case 'pace': return <PaceCalculator key={key} unitSystem={unitSystem} />;
            case 'lbm': return <LeanBodyMassCalculator key={key} unitSystem={unitSystem} />;
            case 'water': return <WaterIntakeCalculator key={key} unitSystem={unitSystem} />;
            case 'sleep': return <SleepCalculator key={key} />;
            case 'bloodpressure': return <BloodPressureCalculator key={key} />;
            case 'pregnancy': return <PregnancyCalculator key={key} />;
            case 'bac': return <BACCalculator key={key} unitSystem={unitSystem} />;
            default: return null;
        }
    };

    const activeCalcData = calculators.find(c => c.id === activeCalc);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-12 md:mb-16">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-mono mb-4 border border-brand-primary/20"
                >
                    <Stethoscope size={14} /> Health Protocol
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Health & Fitness Metrics
                </h2>
                <p className="text-brand-text-secondary mt-4 max-w-2xl font-mono text-sm leading-relaxed">
                    A suite of high-performance tools for biological tracking. All calculations run strictly client-side.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                <div className="w-full md:w-64 flex-shrink-0 md:sticky top-[100px] z-30 bg-brand-bg/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none pb-4 md:pb-0 border-b border-brand-border/20 md:border-none -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-2 pb-2 md:pb-0 mask-fade-edges">
                        <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                            {calculators.map(calc => (
                                 <SubNavButton 
                                    key={calc.id}
                                    label={calc.label} 
                                    icon={calc.Icon}
                                    isActive={activeCalc === calc.id} 
                                    onClick={() => setActiveCalc(calc.id as HealthCalcType)} 
                                    layoutId="healthNavActive"
                                 />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-w-0 pb-20">
                    <div className="mb-8 pb-6 border-b border-brand-border/40 flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            {activeCalcData?.Icon && React.createElement(activeCalcData.Icon, { size: 28, className: "text-brand-primary" })}
                            {activeCalcData?.label}
                        </h3>
                        {calculatorHasUnits && (
                            <div className="flex items-center gap-2 p-1 bg-brand-bg rounded-full scale-90 origin-right border border-brand-border/30">
                               <UnitToggleButton label="Metric" isActive={unitSystem === 'metric'} onClick={() => setUnitSystem('metric')} />
                               <UnitToggleButton label="Imperial" isActive={unitSystem === 'imperial'} onClick={() => setUnitSystem('imperial')} />
                            </div>
                        )}
                    </div>

                    <motion.div 
                        key={`${activeCalc}-${unitSystem}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-brand-surface/20 p-6 md:p-10 rounded-[2.5rem] border border-brand-border/40 shadow-inner backdrop-blur-sm"
                    >
                        {renderCalculator()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HealthCalculator;