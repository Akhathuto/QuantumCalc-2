import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Scale, Pizza, Target, Timer, PersonStanding, GlassWater, Baby, Wine, AlertCircle } from 'lucide-react';


type HealthCalcType = 'bmi' | 'calorie-macro' | 'bodyfat' | 'idealweight' | 'heartrate' | 'pace' | 'lbm' | 'water' | 'pregnancy' | 'bac';
type UnitSystem = 'metric' | 'imperial';

// Reusable UI Components specific to Health Calculator
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 flex items-center gap-2 rounded-md font-semibold transition-colors text-sm ${isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}
    >
        <Icon size={16} />
        {label}
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

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary" />
    </div>
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

        let category = '';
        let color = '';
        if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-400'; }
        else if (bmi < 25) { category = 'Normal weight'; color = 'text-green-400'; }
        else if (bmi < 30) { category = 'Overweight'; color = 'text-yellow-400'; }
        else { category = 'Obesity'; color = 'text-red-400'; }

        return { bmi: bmi.toFixed(1), category, color };
    }, [unitSystem, weight, heightCm, heightFt, heightIn]);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {result && (
                <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <p className="text-brand-text-secondary">Your BMI is</p>
                    <p className={`text-4xl font-bold my-2 ${result.color}`}>{result.bmi}</p>
                    <p className={`font-semibold ${result.color}`}>{result.category}</p>
                </div>
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
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                {unitSystem === 'metric' ? (
                    <Input label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                        <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                    </div>
                )}
                <Input label={`Waist (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={waist} onChange={e => setWaist(e.target.value)} />
                <Input label={`Neck (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={neck} onChange={e => setNeck(e.target.value)} />
                {gender === 'female' && <Input label={`Hip (${unitSystem === 'metric' ? 'cm' : 'in'})`} type="number" value={hip} onChange={e => setHip(e.target.value)} />}
            </div>
            {result && (
                <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <p className="text-brand-text-secondary">Estimated Body Fat</p>
                    <p className="text-4xl font-bold text-brand-accent my-2">{result.bfp}%</p>
                    <p className="text-xs text-brand-text-secondary">Based on the U.S. Navy method.</p>
                </div>
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
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                {unitSystem === 'metric' ? (
                    <Input label="Height (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="Height (ft)" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                        <Input label="(in)" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
                    </div>
                )}
            </div>
            {result && (
                <div className="mt-6 space-y-4">
                    <div className="text-center bg-brand-bg p-4 rounded-lg">
                        <p className="text-brand-text-secondary">Healthy BMI Weight Range</p>
                        <p className="text-2xl font-bold text-brand-accent my-1">{result.healthyBmi}</p>
                    </div>
                    <div className="text-center bg-brand-bg p-4 rounded-lg">
                        <p className="text-brand-text-secondary">Range from Popular Formulas</p>
                        <p className="text-2xl font-bold text-brand-accent my-1">{result.avgRange}</p>
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
        <div>
            <Input label="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
            {result && (
                <div className="mt-6 space-y-4">
                    <div className="text-center bg-brand-bg p-4 rounded-lg">
                        <p className="text-brand-text-secondary">Estimated Maximum Heart Rate</p>
                        <p className="text-4xl font-bold text-brand-accent my-2">{result.maxHr}</p>
                        <p>beats per minute (bpm)</p>
                    </div>
                    <div className="bg-brand-bg p-4 rounded-lg">
                        <h4 className="font-semibold text-center mb-2">Target Heart Rate Zones (bpm)</h4>
                        <div className="relative w-full h-8 my-4">
                            <div className="flex w-full h-4 rounded-full overflow-hidden absolute top-0">
                                {/* 50% gray area */}
                                <div className="bg-gray-700" style={{ width: `50%` }} title="Below 50%"></div>
                                {/* The 5 colored zones */}
                                {result.zones.map(zone => (
                                    <div key={zone.name} className={`${zone.color}`} style={{ width: `${zone.width}%` }} title={`${zone.name}: ${zone.range} bpm`}></div>
                                ))}
                            </div>
                            <div className="absolute -bottom-1 w-full text-xs text-brand-text-secondary flex justify-between">
                                <span className="transform -translate-x-1/2">{Math.round(result.maxHr * 0.5)}</span>
                                <span className="transform -translate-x-1/2">{Math.round(result.maxHr * 0.6)}</span>
                                <span className="transform -translate-x-1/2">{Math.round(result.maxHr * 0.7)}</span>
                                <span className="transform -translate-x-1/2">{Math.round(result.maxHr * 0.8)}</span>
                                <span className="transform -translate-x-1/2">{Math.round(result.maxHr * 0.9)}</span>
                                <span className="transform -translate-x-1/2">{result.maxHr}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mt-6">
                            {result.zones.map(zone => (
                                <div key={zone.name} className="flex items-center justify-between p-2 rounded-md bg-brand-surface/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${zone.color}`}></div>
                                        <div>
                                            <span className="font-semibold">{zone.name}</span>
                                            <span className="text-xs text-brand-text-secondary block">{zone.percentage} of Max HR</span>
                                        </div>
                                    </div>
                                    <span className="font-mono font-semibold">{zone.range} bpm</span>
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

    const { bmr, calorieGoals } = useMemo(() => {
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
        const targetCalories = (calorieGoals as any)[goal];
        
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold">1. Your Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
                     <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
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
                 <h3 className="text-xl font-bold pt-4">2. Activity Level</h3>
                 <select value={activity} onChange={e => setActivity(parseFloat(e.target.value))} className="w-full bg-gray-900/70 p-2 rounded-md mb-6 border border-brand-border">
                    {activityLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                </select>
                {calorieGoals && (
                    <div className="bg-brand-bg p-4 rounded-lg">
                        <h4 className="font-semibold text-center mb-2">Daily Calorie Needs</h4>
                         <div className="space-y-2">
                            {Object.entries(calorieGoals).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-2 rounded-md bg-brand-surface/50">
                                    <span className="capitalize">{key.replace('loss', ' Loss').replace('gain', ' Gain')}</span>
                                    <span className="font-mono font-semibold">{value.toLocaleString()} cal/day</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-bold">3. Macronutrient Goals</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">My Goal Is</label>
                        <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                            <option value="loss">Weight Loss</option>
                            <option value="mildLoss">Mild Weight Loss</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="mildGain">Mild Weight Gain</option>
                            <option value="gain">Weight Gain</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Diet Plan</label>
                        <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                            <option value="balanced">Balanced</option>
                            <option value="lowcarb">Low Carb</option>
                            <option value="highprotein">High Protein</option>
                        </select>
                    </div>
                </div>
                {macroResult && (
                    <div className="bg-brand-bg p-4 rounded-lg text-center">
                        <p className="text-brand-text-secondary">Your daily target is</p>
                        <p className="text-3xl font-bold text-brand-accent my-1">{macroResult.targetCalories.toLocaleString()} calories</p>
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={macroResult.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                                        {macroResult.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} /> )}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value}g`, name]} contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-around text-sm">
                            <div className="text-center"><span className="font-bold block" style={{color: PIE_COLORS[0]}}>{macroResult.pieData[0].value}g</span> Protein</div>
                            <div className="text-center"><span className="font-bold block" style={{color: PIE_COLORS[1]}}>{macroResult.pieData[1].value}g</span> Carbs</div>
                            <div className="text-center"><span className="font-bold block" style={{color: PIE_COLORS[2]}}>{macroResult.pieData[2].value}g</span> Fat</div>
                        </div>
                    </div>
                )}
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
    const [result, setResult] = useState('');

    const calculate = useCallback(() => {
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
            setResult(`Pace: ${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} / ${unitLabel}`);
        }
        // Calculate Time
        else if (totalPaceSec > 0 && dist > 0) {
            const time = totalPaceSec * dist;
            const timeHours = Math.floor(time / 3600);
            const timeMinutes = Math.floor((time % 3600) / 60);
            const timeSeconds = Math.round(time % 60);
            setResult(`Time: ${timeHours}:${timeMinutes.toString().padStart(2, '0')}:${timeSeconds.toString().padStart(2, '0')}`);
        }
        // Calculate Distance
        else if (totalPaceSec > 0 && totalTimeSec > 0) {
            const distCalc = totalTimeSec / totalPaceSec;
            setResult(`Distance: ${distCalc.toFixed(2)} ${unitLabel}`);
        } else {
            setResult('');
        }
    }, [distance, hours, minutes, seconds, paceMin, paceSec, unitSystem]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Distance</label>
                <div className="flex items-center gap-2">
                    <input type="number" value={distance} onChange={e => setDistance(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" />
                    <span className="font-semibold">{unitSystem === 'metric' ? 'km' : 'miles'}</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <div className="flex items-center gap-2">
                    <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" placeholder="hh" />
                    <span>:</span>
                    <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" placeholder="mm" />
                    <span>:</span>
                    <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" placeholder="ss" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Pace</label>
                 <div className="flex items-center gap-2">
                    <input type="number" value={paceMin} onChange={e => setPaceMin(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" placeholder="min" />
                    <span>:</span>
                    <input type="number" value={paceSec} onChange={e => setPaceSec(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" placeholder="sec" />
                    <span className="font-semibold">/ {unitSystem === 'metric' ? 'km' : 'mi'}</span>
                </div>
            </div>
            {result && (
                 <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <p className="text-brand-text-secondary">Calculated Result</p>
                    <p className="text-2xl font-bold text-brand-accent my-2">{result}</p>
                 </div>
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
        <div className="space-y-4">
            <Input label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            <Input label="Body Fat Percentage (%)" type="number" value={bfp} onChange={e => setBfp(e.target.value)} />
            {result && (
                <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg flex justify-around">
                    <div>
                        <p className="text-brand-text-secondary">Lean Body Mass</p>
                        <p className="text-2xl font-bold text-brand-accent my-2">{result.lbm} {unitSystem === 'metric' ? 'kg' : 'lbs'}</p>
                    </div>
                    <div>
                        <p className="text-brand-text-secondary">Fat Mass</p>
                        <p className="text-2xl font-bold text-brand-secondary my-2">{result.fatMass} {unitSystem === 'metric' ? 'kg' : 'lbs'}</p>
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
        <div className="space-y-4">
            <Input label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            <Input label="Daily Exercise (minutes)" type="number" value={exercise} onChange={e => setExercise(e.target.value)} />
            {result && (
                 <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <p className="text-brand-text-secondary">Recommended Daily Water Intake</p>
                    <p className="text-3xl font-bold text-brand-accent my-2">{result.liters} Liters</p>
                    <p className="text-brand-text-secondary">{result.ounces} oz / {result.glasses} glasses</p>
                 </div>
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
        <div className="space-y-4">
            <div className="flex justify-center p-1 bg-brand-bg rounded-full">
                <UnitToggleButton label="Last Menstrual Period" isActive={method === 'lmp'} onClick={() => setMethod('lmp')} />
                <UnitToggleButton label="Conception Date" isActive={method === 'conception'} onClick={() => setMethod('conception')} />
            </div>
            <Input label="Select Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            {result && (
                <div className="mt-6 space-y-3">
                    <div className="text-center bg-brand-bg p-4 rounded-lg">
                        <p className="text-brand-text-secondary">Estimated Due Date</p>
                        <p className="text-2xl font-bold text-brand-accent my-1">{result.dueDate}</p>
                    </div>
                     <div className="text-center bg-brand-bg p-4 rounded-lg">
                        <p className="text-brand-text-secondary">Current Gestational Age</p>
                        <p className="text-xl font-bold text-brand-text my-1">{result.gestationalAge} (Trimester {result.trimester})</p>
                    </div>
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                 <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <Input label="Number of Standard Drinks" type="number" value={drinks} onChange={e => setDrinks(e.target.value)} />
                <Input label="Hours Since First Drink" type="number" value={hours} onChange={e => setHours(e.target.value)} />
            </div>
             <div className="mt-4 p-3 bg-yellow-900/50 text-yellow-300 rounded-lg text-xs flex gap-2">
                <AlertCircle size={28} />
                <span><strong>Disclaimer:</strong> This is an estimate only. Do not rely on this calculator to determine if it is safe to drive. Individual BAC can vary based on many factors.</span>
            </div>
            {result && (
                <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <p className="text-brand-text-secondary">Estimated Blood Alcohol Content (BAC)</p>
                    <p className="text-4xl font-bold text-brand-accent my-2">{result.bac}</p>
                    <p className="font-semibold">{result.status}</p>
                </div>
            )}
        </div>
    )
}

const HealthCalculator: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState<HealthCalcType>('calorie-macro');
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

    const calculators = [
        { id: 'calorie-macro', label: 'Calories & Macros', Icon: Pizza },
        { id: 'bmi', label: 'BMI', Icon: Scale },
        { id: 'bodyfat', label: 'Body Fat %', Icon: Droplets },
        { id: 'lbm', label: 'Lean Body Mass', Icon: PersonStanding },
        { id: 'idealweight', label: 'Ideal Weight', Icon: Scale },
        { id: 'heartrate', label: 'Heart Rate Zones', Icon: Target },
        { id: 'pace', label: 'Pace', Icon: Timer },
        { id: 'water', label: 'Water Intake', Icon: GlassWater },
        { id: 'pregnancy', label: 'Pregnancy', Icon: Baby },
        { id: 'bac', label: 'BAC', Icon: Wine },
    ];
    
    const calculatorHasUnits = useMemo(() => {
        return ['bmi', 'calorie-macro', 'bodyfat', 'idealweight', 'pace', 'lbm', 'water', 'bac'].includes(activeCalc);
    }, [activeCalc]);

    const renderCalculator = () => {
        const key = `${activeCalc}-${unitSystem}`; // Re-mount component on unit change to reset state
        switch (activeCalc) {
            case 'bmi': return <BMICalculator key={key} unitSystem={unitSystem} />;
            case 'calorie-macro': return <CalorieMacroCalculator key={key} unitSystem={unitSystem} />;
            case 'bodyfat': return <BodyFatCalculator key={key} unitSystem={unitSystem} />;
            case 'idealweight': return <IdealWeightCalculator key={key} unitSystem={unitSystem} />;
            case 'heartrate': return <HeartRateCalculator key={key} />;
            case 'pace': return <PaceCalculator key={key} unitSystem={unitSystem} />;
            case 'lbm': return <LeanBodyMassCalculator key={key} unitSystem={unitSystem} />;
            case 'water': return <WaterIntakeCalculator key={key} unitSystem={unitSystem} />;
            case 'pregnancy': return <PregnancyCalculator key={key} />;
            case 'bac': return <BACCalculator key={key} unitSystem={unitSystem} />;
            default: return null;
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Health & Fitness Calculators</h2>
            
            <div className="flex justify-center flex-wrap gap-2 mb-6">
                {calculators.map(calc => (
                     <SubNavButton 
                        key={calc.id}
                        label={calc.label} 
                        icon={calc.Icon}
                        isActive={activeCalc === calc.id} 
                        onClick={() => setActiveCalc(calc.id as HealthCalcType)} 
                     />
                ))}
            </div>

            <div className="bg-brand-surface/50 p-6 rounded-lg">
                {calculatorHasUnits && (
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2 p-1 bg-brand-bg rounded-full">
                           <UnitToggleButton label="Metric" isActive={unitSystem === 'metric'} onClick={() => setUnitSystem('metric')} />
                           <UnitToggleButton label="Imperial" isActive={unitSystem === 'imperial'} onClick={() => setUnitSystem('imperial')} />
                        </div>
                    </div>
                )}

                {renderCalculator()}
            </div>
        </div>
    );
};

export default HealthCalculator;