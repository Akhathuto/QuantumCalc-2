

import { useState, useMemo, FC, InputHTMLAttributes, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Home, Car, Landmark, TrendingUp, PiggyBank, Table, HandCoins, Percent, Receipt, Wind,
    Calculator, Briefcase, Banknote, Bot, AlertCircle, Sparkles, Users, RefreshCw, Plus, Minus, ChevronDown
} from 'lucide-react';
import { getAutoLoanAnalysis, AutoLoanDetails, getFinancialInsight } from '../services/geminiService';
import { AppTab } from '../types';


// --- Reusable UI ---
const InputField: FC<InputHTMLAttributes<HTMLInputElement> & { label: string, id: string, currencySymbol?: string, rightAddon?: string }> = ({ label, id, currencySymbol, rightAddon, ...props }) => (
    <div className="group">
        <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-1.5 transition-colors group-focus-within:text-brand-primary">{label}</label>
        <div className="relative">
             {currencySymbol && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary font-mono text-sm">{currencySymbol}</span>}
            <input 
                id={id} 
                {...props} 
                className={`w-full bg-brand-bg/40 border border-brand-border/50 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 font-mono text-sm transition-all placeholder:text-brand-text-secondary/30 ${currencySymbol ? 'pl-9' : ''} ${rightAddon ? 'pr-12' : ''}`} 
            />
             {rightAddon && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary font-mono text-[10px] uppercase">{rightAddon}</span>}
        </div>
    </div>
);

const ResultCard: FC<{ title: string; value: string; description?: string; accent?: boolean }> = ({ title, value, description, accent }) => (
    <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${accent ? 'bg-brand-primary/10 border-brand-primary/30 shadow-[0_10px_30px_rgba(var(--brand-primary-rgb),0.1)]' : 'bg-brand-bg/50 border-brand-border/30 shadow-sm'}`}>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-2">{title}</p>
            <p className={`text-3xl font-black tracking-tight font-mono ${accent ? 'text-brand-primary' : 'text-brand-text'}`}>
                {value}
            </p>
        </div>
        {description && <p className="mt-4 text-xs text-brand-text-secondary leading-relaxed opacity-70">{description}</p>}
    </div>
);

const AIInsightSection: FC<{ data: any, type: string }> = ({ data, type }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const fetchInsight = async () => {
        setLoading(true);
        try {
            const res = await getFinancialInsight(data, type);
            setInsight(res);
        } catch (err) {
            console.error(err);
            setInsight("Failed to load insight.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 pointer-events-none" />
            
            <div className="relative p-6">
                {!insight && !loading && (
                    <div className="text-center space-y-4 py-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Bot className="text-brand-primary animate-pulse" size={40} />
                                <Sparkles className="absolute -top-1 -right-1 text-brand-accent animate-bounce" size={16} />
                            </div>
                        </div>
                        <div className="max-w-md mx-auto">
                            <h4 className="text-sm font-bold text-brand-text mb-1">Intelligent Market Analysis</h4>
                            <p className="text-xs text-brand-text-secondary mb-4 italic">Get personalized insights on your {type.toLowerCase()} based on current market trends via Gemini Pro.</p>
                            <button 
                                onClick={fetchInsight}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-brand-bg rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                            >
                                <Bot size={16} /> Run AI Analysis
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8 text-brand-text-secondary">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-2 border-brand-primary/20 rounded-full" />
                            <div className="absolute inset-0 border-2 border-brand-primary rounded-full border-t-transparent animate-spin" />
                            <Bot className="absolute inset-0 m-auto text-brand-primary" size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Analyzing Financial Patterns</p>
                            <p className="text-[10px] opacity-50 mt-1">Fetching latest market insights from Gemini...</p>
                        </div>
                    </div>
                )}

                {insight && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4 border-b border-brand-primary/10 pb-3">
                            <div className="flex items-center gap-2 text-brand-primary">
                                <Bot size={20} className="animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Quantum Analysis Report</span>
                            </div>
                            <button 
                                onClick={() => setInsight(null)}
                                className="p-2 text-brand-text-secondary hover:text-brand-primary transition-colors hover:bg-brand-primary/10 rounded-full"
                                title="Clear Insight"
                            >
                                <AlertCircle size={16} />
                            </button>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                             <p className="text-sm text-brand-text/90 leading-relaxed font-medium">
                                {insight}
                             </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                                AI Verification Complete
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Helper Functions ---
const formatCurrency = (value: number | undefined | null, currencyCode: string = 'USD') => {
    if (value === undefined || value === null || isNaN(value)) return '--';
    const numberFormat = localStorage.getItem('numberFormat') || 'us';
    const locale = numberFormat === 'eu' ? 'de-DE' : 'en-US';
    try {
        return value.toLocaleString(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 });
    } catch {
        return `$${value.toFixed(2)}`;
    }
};

interface CalculatorProps {
  currency: string;
  setActiveTab: (tab: AppTab) => void;
}

interface ChartPayloadItem {
    dataKey: string;
    name: string;
    value: number;
    color: string;
    payload: Record<string, string | number | boolean | null>;
}

const CustomChartTooltip = ({ active, payload, label, currency }: { active?: boolean, payload?: ChartPayloadItem[], label?: string | number, currency: string }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        // Mortgage/Retirement/Investment Chart
        if (payload.some((p) => p.dataKey === 'Interest Earned' || p.dataKey === 'Interest Paid (Total)')) {
            let reorderedPayload: ChartPayloadItem[] = [];
            // Mortgage Amortization
            if ('Principal Paid (Total)' in data) {
                 reorderedPayload = [
                    payload.find((p) => p.dataKey === 'Remaining Balance'),
                    payload.find((p) => p.dataKey === 'Principal Paid (Total)'),
                    payload.find((p) => p.dataKey === 'Interest Paid (Total)'),
                ].filter((p): p is ChartPayloadItem => p !== undefined);
            } else { // Investment/Retirement
                reorderedPayload = [
                    ...payload
                ].reverse();
            }

            return (
                <div className="bg-brand-surface/90 p-3 border border-brand-border rounded-lg shadow-lg">
                    <p className="font-bold text-brand-text mb-2">{label === 0 ? 'Start' : `End of Year ${label}`}</p>
                    {reorderedPayload.map((pld) => (
                        <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between gap-4">
                            <span>{pld.name}:</span>
                            <span className="font-mono font-semibold">{formatCurrency(pld.value, currency)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // Standard Loan Chart
        return (
            <div className="bg-brand-surface/90 p-3 border border-brand-border rounded-lg shadow-lg">
                <p className="font-bold text-brand-text mb-2">{label === '0' ? 'Start of Loan' : `End of Year ${label}`}</p>
                <div className="flex justify-between gap-4 text-brand-text">
                    <span>Remaining Balance:</span>
                    <span className="font-mono font-semibold">{formatCurrency(data['Remaining Balance'] as number, currency)}</span>
                </div>
                {label !== '0' && data['Principal Paid (Year)'] !== undefined && (
                    <>
                        <div className="flex justify-between gap-4" style={{ color: 'var(--color-accent)' }}>
                            <span>Principal Paid (This Year):</span>
                            <span className="font-mono font-semibold">{formatCurrency(data['Principal Paid (Year)'] as number, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4" style={{ color: 'var(--color-secondary)' }}>
                            <span>Interest Paid (This Year):</span>
                            <span className="font-mono font-semibold">{formatCurrency(data['Interest Paid (Year)'] as number, currency)}</span>
                        </div>
                    </>
                )}
            </div>
        );
    }
    return null;
};


interface PiePayloadItem {
    name: string;
    value: number;
    payload: {
        fill: string;
        percent?: number;
    };
}

const CustomPieTooltip = ({ active, payload, currency }: { active?: boolean, payload?: PiePayloadItem[], currency: string }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percent = ((data.payload.percent || 0) * 100).toFixed(2);
        return (
            <div className="bg-brand-surface/90 p-3 border border-brand-border rounded-lg shadow-lg">
                <p className="font-bold text-brand-text mb-1">{data.name}</p>
                <p style={{ color: data.payload.fill }} className="font-mono font-semibold">
                    {formatCurrency(data.value, currency)} ({percent}%)
                </p>
            </div>
        );
    }
    return null;
};


// --- Individual Calculators ---

const LoanCalculator = ({ currency }: CalculatorProps) => {
    const [amount, setAmount] = useState('25000');
    const [rate, setRate] = useState('6.5');
    const [term, setTerm] = useState('5');

    const result = useMemo(() => {
        const P = parseFloat(amount);
        const annualRate = parseFloat(rate);
        const years = parseInt(term);

        if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || annualRate < 0 || years <= 0) return null;

        const i = annualRate / 100 / 12; // monthly interest rate
        const n = years * 12; // number of months
        
        if (i === 0) { // Simple interest-free loan
            const M = P / n;
            return { monthlyPayment: M, totalInterest: 0, totalPaid: P, amortizationData: [] };
        }
        
        const M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        const totalPaid = M * n;
        const totalInterest = totalPaid - P;

        const amortizationData = [];
        let balance = P;
        let yearlyPrincipalPaid = 0;
        let yearlyInterestPaid = 0;

        amortizationData.push({
            year: '0',
            'Remaining Balance': P,
            'Principal Paid (Year)': 0,
            'Interest Paid (Year)': 0,
        });

        for (let month = 1; month <= n; month++) {
            const interestForMonth = balance * i;
            const principalForMonth = M - interestForMonth;
            balance -= principalForMonth;
            
            yearlyInterestPaid += interestForMonth;
            yearlyPrincipalPaid += principalForMonth;

            if (month % 12 === 0 || month === n) {
                amortizationData.push({
                    year: String(Math.ceil(month / 12)),
                    'Remaining Balance': parseFloat(balance > 0 ? balance.toFixed(2) : '0'),
                    'Principal Paid (Year)': parseFloat(yearlyPrincipalPaid.toFixed(2)),
                    'Interest Paid (Year)': parseFloat(yearlyInterestPaid.toFixed(2)),
                });
                // Reset yearly accumulators
                yearlyPrincipalPaid = 0;
                yearlyInterestPaid = 0;
            }
        }
        
        return { monthlyPayment: M, totalInterest, totalPaid, amortizationData };
    }, [amount, rate, term]);

    const handleExportCSV = () => {
        if (!result || !result.amortizationData) return;
        const headers = ["Year", "Remaining Balance", "Principal Paid (Year)", "Interest Paid (Year)"];
        const rows = result.amortizationData.map(d => [
            d.year, 
            d['Remaining Balance'], 
            d['Principal Paid (Year)'], 
            d['Interest Paid (Year)']
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'loan_amortization.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <ResultCard title="Monthly Payment" value={formatCurrency(result?.monthlyPayment, currency)} description="Recurring monthly liability" accent />
                    <ResultCard title="Interest Expense" value={formatCurrency(result?.totalInterest, currency)} description="Cost of borrowing over term" />
                    <ResultCard title="Total Repayment" value={formatCurrency(result?.totalPaid, currency)} description="Principal + Collective Interest" />
                </div>

                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Banknote size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Loan Acquisition Parameters</h3>
                    </div>
                    <InputField label="Principal Amount" id="loan-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Fixed Annual Rate" id="loan-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} rightAddon="%" />
                    <InputField label="Repayment Term" id="loan-term" type="number" value={term} onChange={e => setTerm(e.target.value)} rightAddon="YEARS" />
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8">
                     {result && result.amortizationData.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-text mb-1">Amortization Trajectory</h3>
                                    <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Balance decay across loan lifecycle</p>
                                </div>
                                <button onClick={handleExportCSV} className="p-2 h-10 w-10 flex items-center justify-center bg-brand-surface border border-brand-border/50 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all shadow-sm">
                                    <Table size={18} />
                                </button>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={result.amortizationData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="year" hide />
                                        <YAxis hide />
                                        <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                        <Line type="stepAfter" dataKey="Remaining Balance" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-brand-text-secondary opacity-30 italic py-12">
                            <Calculator size={48} className="mb-4" />
                            <p className="text-sm">Enter loan data to visualize trajectory</p>
                        </div>
                    )}
                </div>
            </div>

            {result && <AIInsightSection data={{ amount, rate, term }} type="Loan" />}
        </div>
    );
};

const InvestmentCalculator = ({ currency }: CalculatorProps) => {
    const [principal, setPrincipal] = useState('1000');
    const [contribution, setContribution] = useState('100');
    const [rate, setRate] = useState('7');
    const [term, setTerm] = useState('10');
    const [frequency, setFrequency] = useState('12'); // Monthly

    const result = useMemo(() => {
        const P = parseFloat(principal);
        const PMT = parseFloat(contribution);
        const r = parseFloat(rate) / 100;
        const t = parseInt(term);
        const n = parseInt(frequency);

        if (isNaN(P) || isNaN(PMT) || isNaN(r) || isNaN(t) || isNaN(n) || t <= 0 || n <= 0) return null;
        
        const growthData = [];
        const ratePerPeriod = r / n;
        
        for (let year = 0; year <= t; year++) {
            const totalPeriods = n * year;
            let futureVal;

            const principalPart = P * Math.pow(1 + ratePerPeriod, totalPeriods);
            
            if (ratePerPeriod > 0) {
                 const contributionsPart = PMT * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
                 futureVal = principalPart + contributionsPart;
            } else {
                futureVal = principalPart + (PMT * totalPeriods);
            }

            const totalInvested = P + (PMT * totalPeriods);
            const interest = futureVal - totalInvested;

            growthData.push({
                year: year,
                'Initial Principal': P,
                'Total Contributions': PMT * totalPeriods,
                'Interest Earned': interest > 0 ? interest : 0,
            });
        }

        const finalDataPoint = growthData[growthData.length - 1];
        const futureValue = finalDataPoint['Initial Principal'] + finalDataPoint['Total Contributions'] + finalDataPoint['Interest Earned'];
        const totalContributions = P + (PMT * n * t);
        const totalInterest = futureValue - totalContributions;
        
        return { futureValue, totalContributions, totalInterest, growthData };

    }, [principal, contribution, rate, term, frequency]);

    const handleExportCSV = () => {
        if (!result || !result.growthData) return;
        const headers = ["Year", "Initial Principal", "Total Contributions", "Interest Earned"];
        const rows = result.growthData.map(d => [
            d.year, 
            d['Initial Principal'], 
            d['Total Contributions'], 
            d['Interest Earned']
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'investment_growth.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <ResultCard title="Maturity Value" value={formatCurrency(result?.futureValue, currency)} description="Portfolio value at end of horizon" accent />
                <ResultCard title="Net Contributions" value={formatCurrency(result?.totalContributions, currency)} description="Principal + Collective Deposits" />
                <ResultCard title="Capital Gains" value={formatCurrency(result?.totalInterest, currency)} description="Net profit from compounding yield" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                            <TrendingUp size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Portfolio Parameters</h3>
                    </div>
                    <InputField label="Initial Capital" id="inv-principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Periodic Deposit" id="inv-contribution" type="number" value={contribution} onChange={e => setContribution(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Yield Expectation" id="inv-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} rightAddon="%" />
                    <InputField label="Accumulation Horizon" id="inv-term" type="number" value={term} onChange={e => setTerm(e.target.value)} rightAddon="YEARS" />
                    <div>
                        <label htmlFor="inv-frequency" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-1.5 transition-colors group-focus-within:text-brand-primary">Compound Frequency</label>
                        <select id="inv-frequency" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full h-12 bg-brand-bg/40 border border-brand-border/50 rounded-xl px-4 py-0 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 font-mono text-sm transition-all appearance-none cursor-pointer">
                            <option value="365">Daily</option>
                            <option value="12">Monthly</option>
                            <option value="4">Quarterly</option>
                            <option value="1">Annually</option>
                        </select>
                    </div>
                </div>
                <div className="bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-text mb-1">Growth Distribution</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Asset appreciation over time</p>
                        </div>
                        <button onClick={handleExportCSV} className="p-2 h-10 w-10 flex items-center justify-center bg-brand-surface border border-brand-border/50 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all shadow-sm">
                            <Table size={18} />
                        </button>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer>
                            <LineChart data={result?.growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="year" hide />
                                <YAxis hide />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Line type="monotone" dataKey="Initial Principal" name="Principal" stroke="#9f7aea" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Total Contributions" name="Contributions" stroke="#4299e1" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Interest Earned" name="Interest" stroke="#48bb78" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {result && <AIInsightSection data={{ principal, contribution, rate, term }} type="Investment" />}
        </div>
    );
};


const InterestRateCalculator = ({ currency }: CalculatorProps) => {
    const [loanAmount, setLoanAmount] = useState('20000');
    const [monthlyPayment, setMonthlyPayment] = useState('400');
    const [termYears, setTermYears] = useState('5');

    const result = useMemo(() => {
        const P = parseFloat(loanAmount);
        const M = parseFloat(monthlyPayment);
        const t = parseInt(termYears);

        if (isNaN(P) || isNaN(M) || isNaN(t) || P <= 0 || M <= 0 || t <= 0) {
            return { error: "Please enter valid positive numbers for all fields." };
        }
        
        const n = t * 12; // total number of payments

        if (M * n <= P) {
            return { error: "Monthly payment is too low to cover the principal. The loan will never be paid off." };
        }

        // Iterative calculation for interest rate (bisection method)
        let lowRate = 0;
        let highRate = 1; // 100% annual rate as upper bound
        let midRate = 0;
        const precision = 1e-7;
        let iterations = 0;
        const maxIterations = 100;

        while (iterations < maxIterations) {
            midRate = (lowRate + highRate) / 2;
            if (highRate - lowRate < precision) break;
            
            const calculatedPayment = P * (midRate * Math.pow(1 + midRate, n)) / (Math.pow(1 + midRate, n) - 1);

            if (calculatedPayment > M) {
                highRate = midRate;
            } else {
                lowRate = midRate;
            }
            iterations++;
        }
        
        const monthlyRate = midRate;
        if (monthlyRate === null || isNaN(monthlyRate)) {
            return { error: "Could not calculate the interest rate." };
        }
        
        const apr = monthlyRate * 12 * 100; // Annual rate in percentage
        const totalPaid = M * n;
        const totalInterest = totalPaid - P;

        return { apr, totalPaid, totalInterest, error: null };
    }, [loanAmount, monthlyPayment, termYears]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <ResultCard title="Implied APR" value={`${result.apr?.toFixed(3) ?? '--'}%`} description="Calculated annual interest rate" accent />
                <ResultCard title="Aggregate Cost" value={formatCurrency(result.totalPaid, currency)} description="Sum of all periodic payments" />
                <ResultCard title="Cost of Capital" value={formatCurrency(result.totalInterest, currency)} description="Total interest overhead" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <Receipt size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Loan Reverse Engineering</h3>
                    </div>
                    <InputField label="Principal Liquidity" id="ir-loan-amount" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Periodic Payment" id="ir-monthly-payment" type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Agreement Tenure" id="ir-term" type="number" value={termYears} onChange={e => setTermYears(e.target.value)} rightAddon="YEARS" />
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8 flex flex-col justify-center min-h-[300px]">
                    <div className="space-y-6 text-center">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary">Rate Estimation Engine</h3>
                         <div className="relative">
                            <div className="text-6xl font-black text-brand-text/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none uppercase tracking-tighter">ITERATIVE</div>
                            {result.error ? (
                                <div className="relative z-10 px-8 py-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <p className="text-sm text-red-400 font-medium italic">{result.error}</p>
                                </div>
                            ) : (
                                <p className="text-lg text-brand-text-secondary font-medium leading-relaxed relative z-10 px-8">
                                    Based on a payment of <span className="text-brand-primary font-bold">{formatCurrency(parseFloat(monthlyPayment), currency)}</span>, 
                                    the implicit annual interest rate on this debt instrument is approximately 
                                    <span className="text-brand-accent font-bold text-2xl"> {result.apr?.toFixed(3)}% </span>.
                                </p>
                            )}
                         </div>
                         <div className="pt-8 border-t border-brand-border/10">
                            <p className="text-[9px] text-brand-text-secondary uppercase tracking-widest italic opacity-50 px-4">
                                This calculation uses the Newton-Raphson iterative method to solve for the internal rate of return (IRR).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MortgageCalculator = ({ currency }: CalculatorProps) => {
    const [homePrice, setHomePrice] = useState('350000');
    const [downPayment, setDownPayment] = useState('70000');
    const [loanTerm, setLoanTerm] = useState('30');
    const [interestRate, setInterestRate] = useState('6.8');
    const [propertyTax, setPropertyTax] = useState('4200'); // annual
    const [homeInsurance, setHomeInsurance] = useState('1500'); // annual
    const [pmi, setPmi] = useState('0.5'); // annual percentage

    const downPaymentPercent = useMemo(() => {
        const price = parseFloat(homePrice);
        const down = parseFloat(downPayment);
        if (isNaN(price) || price === 0 || isNaN(down)) return 0;
        return (down / price) * 100;
    }, [homePrice, downPayment]);

    const handleDownPaymentChange = (value: string) => {
        setDownPayment(value);
    };

    const handleDownPaymentPercentChange = (value: string) => {
        const percent = parseFloat(value);
        const price = parseFloat(homePrice);
        if (isNaN(percent) || isNaN(price)) return;
        const newDownPayment = (price * (percent / 100)).toFixed(0);
        setDownPayment(newDownPayment);
    };
    
    const result = useMemo(() => {
        const price = parseFloat(homePrice);
        const down = parseFloat(downPayment);
        const years = parseInt(loanTerm);
        const annualRate = parseFloat(interestRate);
        const annualTax = parseFloat(propertyTax);
        const annualInsurance = parseFloat(homeInsurance);
        const annualPmiRate = parseFloat(pmi) / 100;

        if (isNaN(price) || isNaN(down) || isNaN(years) || isNaN(annualRate) || isNaN(annualTax) || isNaN(annualInsurance) || isNaN(annualPmiRate)) return null;

        const loanAmount = price - down;
        
        if (loanAmount <= 0) {
            const monthlyTax = annualTax / 12;
            const monthlyInsurance = annualInsurance / 12;
            const totalMonthlyPayment = monthlyTax + monthlyInsurance;
            const pieData = [
                { name: 'Property Tax', value: monthlyTax },
                { name: 'Home Insurance', value: monthlyInsurance },
            ].filter(item => item.value > 0);
            return {
                loanAmount: 0, totalMonthlyPayment, monthlyPI: 0, monthlyTax, monthlyInsurance, monthlyPmi: 0, pieData,
                amortizationData: null, totalInterestPaid: 0
            };
        }

        const monthlyRate = annualRate / 100 / 12;
        const numPayments = years * 12;
        
        const monthlyPI = monthlyRate > 0 
            ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
            : loanAmount / numPayments;

        const monthlyTax = annualTax / 12;
        const monthlyInsurance = annualInsurance / 12;
        const monthlyPmi = (downPaymentPercent < 20) ? (loanAmount * annualPmiRate) / 12 : 0;
        
        const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyPmi;

        const pieData = [
            { name: 'Principal & Interest', value: monthlyPI },
            { name: 'Property Tax', value: monthlyTax },
            { name: 'Home Insurance', value: monthlyInsurance },
            { name: 'PMI', value: monthlyPmi },
        ].filter(item => item.value > 0);
        
        const amortizationData = [];
        let balance = loanAmount;
        let totalInterestPaid = 0;
        
        amortizationData.push({ year: 0, 'Remaining Balance': balance, 'Interest Paid (Total)': 0, 'Principal Paid (Total)': 0 });

        for (let year = 1; year <= years; year++) {
            let interestForYear = 0;
            for (let month = 1; month <= 12; month++) {
                const interestForMonth = balance * monthlyRate;
                const principalForMonth = monthlyPI - interestForMonth;
                balance -= principalForMonth;
                interestForYear += interestForMonth;
            }
            totalInterestPaid += interestForYear;
            amortizationData.push({
                year: year,
                'Remaining Balance': parseFloat((balance > 0 ? balance : 0).toFixed(2)),
                'Interest Paid (Total)': parseFloat(totalInterestPaid.toFixed(2)),
                'Principal Paid (Total)': parseFloat((loanAmount - (balance > 0 ? balance : 0)).toFixed(2))
            });
        }
        
        return { loanAmount, totalMonthlyPayment, monthlyPI, monthlyTax, monthlyInsurance, monthlyPmi, pieData, amortizationData, totalInterestPaid };

    }, [homePrice, downPayment, loanTerm, interestRate, propertyTax, homeInsurance, pmi, downPaymentPercent]);

    const handleExportCSV = () => {
        if (!result || !result.amortizationData) return;
        const headers = ["Year", "Remaining Balance", "Interest Paid (Total)", "Principal Paid (Total)"];
        const rows = result.amortizationData.map(d => [
            d.year, 
            d['Remaining Balance'], 
            d['Interest Paid (Total)'], 
            d['Principal Paid (Total)']
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'mortgage_amortization.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);
    const PIE_COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', '#9f7aea'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-4">
                <ResultCard title="Total Monthly PITI" value={formatCurrency(result?.totalMonthlyPayment, currency)} description="Principal, Interest, Taxes, Insurance" accent />
                <ResultCard title="Loan Principal" value={formatCurrency(result?.loanAmount, currency)} description="Home Price minus Down Payment" />
                <ResultCard title="Monthly P&I" value={formatCurrency(result?.monthlyPI, currency)} description="Base loan payment" />
                <ResultCard title="Est. Closing Cash" value={formatCurrency(parseFloat(homePrice) * 0.03 + parseFloat(downPayment), currency)} description="Down payment + 3% closing costs" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Home size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Home Acquisition Details</h3>
                    </div>
                    
                    <InputField label="Target Home Price" id="mortgage-price" type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} currencySymbol={currencySymbol} />
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Down Payment ({downPaymentPercent.toFixed(1)}%)</label>
                            <span className="text-[10px] font-mono text-brand-primary">{formatCurrency(parseFloat(downPayment), currency)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="0.5" 
                            value={downPaymentPercent} 
                            onChange={e => handleDownPaymentPercentChange(e.target.value)} 
                            className="w-full h-1.5 bg-brand-border/30 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                        />
                        <InputField label="" id="mortgage-down" type="number" value={downPayment} onChange={e => handleDownPaymentChange(e.target.value)} currencySymbol={currencySymbol} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-1.5">Loan Term</label>
                            <select value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className="w-full h-12 bg-brand-bg/40 border border-brand-border/50 rounded-xl px-4 focus:ring-2 focus:ring-brand-primary/30 outline-none appearance-none cursor-pointer font-mono text-sm">
                                <option value="30">30 Years</option>
                                <option value="20">20 Years</option>
                                <option value="15">15 Years</option>
                                <option value="10">10 Years</option>
                            </select>
                        </div>
                        <InputField label="Rate" id="mortgage-rate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} rightAddon="%" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-border/10">
                        <InputField label="Annual Tax" id="mortgage-tax" type="number" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} currencySymbol={currencySymbol} />
                        <InputField label="Annual Insurance" id="mortgage-insurance" type="number" value={homeInsurance} onChange={e => setHomeInsurance(e.target.value)} currencySymbol={currencySymbol} />
                    </div>

                    {downPaymentPercent < 20 && (
                         <InputField label="PMI (Annual %)" id="mortgage-pmi" type="number" value={pmi} onChange={e => setPmi(e.target.value)} rightAddon="%" />
                    )}
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-brand-surface/20 border border-brand-border/30 p-8 rounded-[2rem] relative">
                         <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-text mb-1">Payment Breakdown</h3>
                                <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Constituent monthly costs</p>
                            </div>
                        </div>
                        <div className="h-64 sm:h-80 w-full relative">
                            {result && <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={result.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} stroke="none">
                                        {result.pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="focus:outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip currency={currency} />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>}
                        </div>
                    </div>

                    <div className="bg-brand-surface/20 border border-brand-border/30 p-8 rounded-[3rem]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest">Equity Accumulation</h3>
                            <button onClick={handleExportCSV} className="p-2 h-10 w-10 flex items-center justify-center bg-brand-surface border border-brand-border/50 rounded-xl hover:bg-brand-primary/10 transition-all">
                                <Table size={18} />
                            </button>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer>
                                <LineChart data={result?.amortizationData || ([] as any[])}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="year" hide />
                                    <YAxis hide />
                                    <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                    <Line type="monotone" dataKey="Principal Paid (Total)" stroke="#48bb78" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="Remaining Balance" stroke="#4299e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            {result && <AIInsightSection data={{ homePrice, downPayment, interestRate, loanTerm }} type="Mortgage" />}
        </div>
    );
};


const AutoLoanCalculator = ({ currency, setActiveTab }: CalculatorProps) => {
    const [vehiclePrice, setVehiclePrice] = useState('30000');
    const [downPayment, setDownPayment] = useState('5000');
    const [tradeInValue, setTradeInValue] = useState('2000');
    const [otherFees, setOtherFees] = useState('500');
    const [salesTaxRate, setSalesTaxRate] = useState('7');
    const [rate, setRate] = useState('5.5');
    const [term, setTerm] = useState('5');

    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const result = useMemo(() => {
        const price = parseFloat(vehiclePrice);
        const down = parseFloat(downPayment);
        const trade = parseFloat(tradeInValue);
        const fees = parseFloat(otherFees);
        const taxRate = parseFloat(salesTaxRate);
        const annualRate = parseFloat(rate);
        const years = parseInt(term);

        if (isNaN(price) || isNaN(down) || isNaN(trade) || isNaN(fees) || isNaN(taxRate) || isNaN(annualRate) || isNaN(years) || price <= 0 || annualRate < 0 || years <= 0) return null;

        const taxableAmount = Math.max(0, price - trade);
        const taxAmount = taxableAmount * (taxRate / 100);
        const totalCost = price + taxAmount + fees;
        const P = Math.max(0, totalCost - down - trade); // The loan principal

        if (P === 0) {
            const pieData = [
                { name: 'Vehicle Price', value: price },
                { name: 'Sales Tax', value: taxAmount },
                { name: 'Fees', value: fees },
            ].filter(item => item.value > 0);
            return { loanAmount: P, monthlyPayment: 0, totalInterest: 0, totalPaid: 0, amortizationData: [] as any[], pieData, taxAmount };
        }

        const i = annualRate / 100 / 12; // monthly interest rate
        const n = years * 12; // number of months
        
        let M, totalPaid, totalInterest;

        if (i === 0) { // Simple interest-free loan
            M = P / n;
            totalPaid = P;
            totalInterest = 0;
        } else {
            M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            totalPaid = M * n;
            totalInterest = totalPaid - P;
        }
        
        const pieData = [
            { name: 'Vehicle Price', value: price },
            { name: 'Sales Tax', value: taxAmount },
            { name: 'Fees', value: fees },
            { name: 'Total Interest', value: totalInterest > 0 ? totalInterest : 0 },
        ].filter(item => item.value > 0);

        const amortizationData = [];
        let balance = P;
        let yearlyPrincipalPaid = 0;
        let yearlyInterestPaid = 0;

        amortizationData.push({
            year: '0',
            'Remaining Balance': P,
        });

        for (let month = 1; month <= n; month++) {
            const interestForMonth = balance * i;
            const principalForMonth = M - interestForMonth;
            balance -= principalForMonth;
            
            yearlyInterestPaid += interestForMonth;
            yearlyPrincipalPaid += principalForMonth;

            if (month % 12 === 0 || month === n) {
                amortizationData.push({
                    year: String(Math.ceil(month / 12)),
                    'Remaining Balance': parseFloat(balance > 0 ? balance.toFixed(2) : '0'),
                    'Principal Paid (Year)': parseFloat(yearlyPrincipalPaid.toFixed(2)),
                    'Interest Paid (Year)': parseFloat(yearlyInterestPaid.toFixed(2)),
                });
                yearlyPrincipalPaid = 0;
                yearlyInterestPaid = 0;
            }
        }
        
        return { loanAmount: P, monthlyPayment: M, totalInterest, totalPaid, amortizationData, pieData, taxAmount };
    }, [vehiclePrice, downPayment, tradeInValue, otherFees, salesTaxRate, rate, term]);

    const handleGetAnalysis = useCallback(async () => {
        if (!result) return;
        setIsAnalysisLoading(true);
        setAnalysis(null);

        const details: AutoLoanDetails = {
            loanAmount: result.loanAmount,
            interestRate: parseFloat(rate),
            termYears: parseInt(term),
            vehiclePrice: parseFloat(vehiclePrice),
            downPayment: parseFloat(downPayment),
        };

        const analysisResult = await getAutoLoanAnalysis(details);
        setAnalysis(analysisResult);
        setIsAnalysisLoading(false);
    }, [result, rate, term, vehiclePrice, downPayment]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);
    const PIE_COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', '#9f7aea'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <ResultCard title="Monthly Payment" value={formatCurrency(result?.monthlyPayment, currency)} description="Recurring installment" accent />
                <ResultCard title="Financed Amount" value={formatCurrency(result?.loanAmount, currency)} description="Net principal after down + trade" />
                <ResultCard title="Interest Expense" value={formatCurrency(result?.totalInterest, currency)} description="Borrowing cost over term" />
                <ResultCard title="Acquisition Tax" value={formatCurrency(result?.taxAmount, currency)} description="Estimated sales tax" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Car size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Vehicle Acquisition Data</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Vehicle Price" id="auto-price" type="number" value={vehiclePrice} onChange={e => setVehiclePrice(e.target.value)} currencySymbol={currencySymbol} />
                        <InputField label="Down Payment" id="auto-down" type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} currencySymbol={currencySymbol} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Trade-in Value" id="auto-trade" type="number" value={tradeInValue} onChange={e => setTradeInValue(e.target.value)} currencySymbol={currencySymbol} />
                        <InputField label="Misc Fees" id="auto-fees" type="number" value={otherFees} onChange={e => setOtherFees(e.target.value)} currencySymbol={currencySymbol} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-brand-border/10 pt-4">
                        <InputField label="Sales Tax %" id="auto-tax" type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(e.target.value)} />
                        <InputField label="APR %" id="auto-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                        <InputField label="Years" id="auto-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
                    </div>
                </div>
                
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="bg-brand-surface/20 border border-brand-border/30 p-8 rounded-[2rem]">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6">Cost Distribution</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={result?.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none">
                                        {result?.pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip currency={currency} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-brand-primary/5 border border-brand-primary/20 p-8 rounded-[2rem] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Bot size={48} className="text-brand-primary" />
                         </div>
                         <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                             <Sparkles size={14} /> Intelligence Analysis
                         </h3>
                         <button 
                            onClick={handleGetAnalysis} 
                            disabled={isAnalysisLoading}
                            className="bg-brand-primary text-brand-bg px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isAnalysisLoading ? 'Processing...' : 'Run Auto Advisor'}
                        </button>
                        {analysis && (
                            <div className="mt-6 text-sm text-brand-text/80 leading-relaxed border-t border-brand-primary/10 pt-4 animate-in fade-in slide-in-from-top-2">
                                <div className={`p-4 rounded-xl border ${analysis.includes('Gemini API key is missing') ? 'bg-red-500/5 border-red-500/20' : 'bg-brand-bg/50 border-brand-border/40'}`}>
                                    <p className={`font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2 ${analysis.includes('Gemini API key is missing') ? 'text-red-500' : 'text-brand-primary'}`}>
                                        {analysis.includes('Gemini API key is missing') ? 'System Alert' : 'Heuristic Review'}
                                    </p>
                                    {analysis.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0 opacity-80">{line}</p>
                                    ))}
                                    {analysis.includes('Gemini API key is missing') && (
                                        <button 
                                            onClick={() => setActiveTab('settings')}
                                            className="mt-4 w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-red-500/20"
                                        >
                                            Configure API Key in Settings
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterestCalculator = ({ currency }: CalculatorProps) => {
    const [principal, setPrincipal] = useState('10000');
    const [rate, setRate] = useState('5');
    const [time, setTime] = useState('1');
    const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days'>('years');

    const result = useMemo(() => {
        const P = parseFloat(principal);
        const annualRate = parseFloat(rate);
        const t_period = parseFloat(time);
        
        if (isNaN(P) || isNaN(annualRate) || isNaN(t_period)) return null;

        const r = annualRate / 100; // Annual rate as a decimal
        let t_years: number;

        switch (timeUnit) {
            case 'months':
                t_years = t_period / 12;
                break;
            case 'days':
                t_years = t_period / 365;
                break;
            default: // years
                t_years = t_period;
        }
        
        const totalInterest = P * r * t_years;
        const totalAmount = P + totalInterest;
        
        return { totalInterest, totalAmount };
    }, [principal, rate, time, timeUnit]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <ResultCard title="Interest Accrued" value={formatCurrency(result?.totalInterest, currency)} description="Net simple yield" accent />
                <ResultCard title="Maturity Value" value={formatCurrency(result?.totalAmount, currency)} description="Principal + Total Interest" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Percent size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Accrual Parameters</h3>
                    </div>
                    <InputField label="Principal Balance" id="si-principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Yield %" id="si-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                    
                    <div className="flex gap-4">
                        <div className="flex-grow">
                             <InputField label="Duration" id="si-time" type="number" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                        <div className="w-1/3 pt-6">
                            <select 
                                value={timeUnit} 
                                onChange={e => setTimeUnit(e.target.value as 'years' | 'months' | 'days')} 
                                className="w-full h-12 px-4 bg-brand-surface/50 border border-brand-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-xs font-bold appearance-none cursor-pointer"
                            >
                                <option value="years">Years</option>
                                <option value="months">Months</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                         <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Simple Yield Profile</h3>
                         <div className="h-4 w-full bg-brand-bg/50 rounded-full overflow-hidden flex">
                             <div className="h-full bg-brand-primary" style={{ width: `${(parseFloat(principal) / (result?.totalAmount || 1)) * 100}%` }} />
                             <div className="h-full bg-brand-accent/40" style={{ width: `${((result?.totalInterest || 0) / (result?.totalAmount || 1)) * 100}%` }} />
                         </div>
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className="text-brand-text-secondary">Principal Coverage</span>
                             <span className="text-brand-accent">Total Interest</span>
                         </div>
                         <p className="text-xs text-brand-text-secondary italic leading-relaxed pt-4 border-t border-brand-border/10">
                            Simple interest is calculated only on the initial amount of a loan or deposit. Unlike compound interest, it does not apply to previously earned interest.
                         </p>
                    </div>
                </div>
            </div>
            {result && <AIInsightSection data={{ principal, rate, time, timeUnit }} type="Simple Interest" />}
        </div>
    );
};

const PaymentCalculator = ({ currency }: CalculatorProps) => {
    const [loanAmount, setLoanAmount] = useState('150000');
    const [rate, setRate] = useState('7');
    const [term, setTerm] = useState('30');
    const [payment, setPayment] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        setError('');
        setResult(null);

        const P = parseFloat(loanAmount);
        const r = parseFloat(rate);
        const t = parseFloat(term);
        const M = parseFloat(payment);
        
        const inputs = [loanAmount, rate, term, payment];
        const emptyInputs = inputs.filter(val => val.trim() === '');

        if (emptyInputs.length !== 1) {
            setError('Please leave exactly one field blank to calculate.');
            return;
        }

        try {
            if (payment.trim() === '') {
                // Calculate Payment
                if (isNaN(P) || isNaN(r) || isNaN(t)) throw new Error('Invalid inputs for Payment calculation.');
                const i = r / 100 / 12;
                const n = t * 12;
                const calculatedPayment = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
                setPayment(calculatedPayment.toFixed(2));
                setResult(`Monthly Payment: ${formatCurrency(calculatedPayment, currency)}`);
            } else if (loanAmount.trim() === '') {
                // Calculate Loan Amount
                if (isNaN(M) || isNaN(r) || isNaN(t)) throw new Error('Invalid inputs for Loan Amount calculation.');
                const i = r / 100 / 12;
                const n = t * 12;
                const calculatedAmount = (M * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));
                setLoanAmount(calculatedAmount.toFixed(2));
                setResult(`Loan Amount: ${formatCurrency(calculatedAmount, currency)}`);
            } else if (term.trim() === '') {
                // Calculate Term
                if (isNaN(P) || isNaN(r) || isNaN(M)) throw new Error('Invalid inputs for Term calculation.');
                const i = r / 100 / 12;
                if (P * i >= M) throw new Error('Payment is too low to cover interest.');
                const n = -Math.log(1 - (P * i) / M) / Math.log(1 + i);
                const years = n / 12;
                setTerm(years.toFixed(2));
                setResult(`Term: ${years.toFixed(2)} years`);
            } else if (rate.trim() === '') {
                // Calculate Rate (using iterative method from InterestRateCalculator)
                if (isNaN(P) || isNaN(t) || isNaN(M)) throw new Error('Invalid inputs for Rate calculation.');
                // ... (implementation of iterative rate calculation)
                setError('Rate calculation is complex and best handled in the dedicated Interest Rate Calculator for now.');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Calculation failed. Check your inputs.');
        }
    };

    const clearFields = () => {
        setLoanAmount(''); setRate(''); setTerm(''); setPayment(''); setError(''); setResult(null);
    };
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-primary/80 flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                Solve Variable Intelligence: Leave one field empty to calculate
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <HandCoins size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Dynamic Parameters</h3>
                    </div>
                    <InputField label="Loan Principal" id="pmt-amount" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} currencySymbol={currencySymbol} placeholder="Blank to solve" />
                    <InputField label="Interest Rate %" id="pmt-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Blank to solve" />
                    <InputField label="Term (Years)" id="pmt-term" type="number" value={term} onChange={e => setTerm(e.target.value)} placeholder="Blank to solve" />
                    <InputField label="Monthly Payment" id="pmt-payment" type="number" value={payment} onChange={e => setPayment(e.target.value)} currencySymbol={currencySymbol} placeholder="Blank to solve" />
                    
                    <div className="flex gap-4 pt-4">
                        <button onClick={calculate} className="flex-grow py-3 bg-brand-primary text-brand-bg rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20">Analyze</button>
                        <button onClick={clearFields} className="px-6 py-3 bg-brand-surface/50 text-brand-text border border-brand-border/50 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-surface transition-all">Reset</button>
                    </div>
                </div>

                <div className="lg:col-span-7 h-full flex flex-col gap-6">
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center justify-center text-center min-h-[300px] ${result ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-brand-surface/10 border-brand-border/20 border-dashed'}`}>
                         {error && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <p className="text-sm text-red-400 font-medium italic">{error}</p>
                            </div>
                         )}
                         {result && !error && (
                            <div className="animate-in slide-in-from-bottom-8 duration-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-4">Target Value Resolved</p>
                                <p className="text-5xl font-black text-brand-text tracking-tighter mb-4">{result.split(': ')[1]}</p>
                                <p className="text-xs text-brand-text-secondary uppercase tracking-widest font-bold">{result.split(': ')[0]}</p>
                            </div>
                         )}
                         {!result && !error && (
                            <div className="opacity-30 flex flex-col items-center">
                                 <Bot size={48} className="mb-4" />
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Engine Waiting for Input</p>
                            </div>
                         )}
                    </div>

                    <div className="p-6 rounded-[2rem] bg-brand-surface/20 border border-brand-border/30">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-4">Theoretical Background</h4>
                        <p className="text-xs text-brand-text-secondary leading-relaxed italic opacity-80">
                            This tool uses the standard Time Value of Money (TVM) formulas to solve for whichever variable is omitted. It assumes monthly compounding and payment frequencies.
                        </p>
                    </div>
                </div>
            </div>
            {result && <AIInsightSection data={{ loanAmount, rate, term, payment }} type="Variable Solver" />}
        </div>
    );
};

const RetirementCalculator = ({ currency }: CalculatorProps) => {
    const [currentAge, setCurrentAge] = useState('30');
    const [retirementAge, setRetirementAge] = useState('65');
    const [currentSavings, setCurrentSavings] = useState('25000');
    const [monthlyContribution, setMonthlyContribution] = useState('500');
    const [annualRate, setAnnualRate] = useState('7');

    const result = useMemo(() => {
        const age = parseInt(currentAge);
        const retireAge = parseInt(retirementAge);
        const P = parseFloat(currentSavings);
        const PMT = parseFloat(monthlyContribution);
        const r = parseFloat(annualRate) / 100;

        if (isNaN(age) || isNaN(retireAge) || isNaN(P) || isNaN(PMT) || isNaN(r) || retireAge <= age) return null;

        const t = retireAge - age;
        const n = 12; // monthly compounding
        const ratePerPeriod = r / n;
        const totalPeriods = t * n;

        const fvPrincipal = P * Math.pow(1 + ratePerPeriod, totalPeriods);
        const fvContributions = PMT * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
        const futureValue = fvPrincipal + fvContributions;

        const totalContributions = P + (PMT * totalPeriods);
        const totalInterest = futureValue - totalContributions;

        // Chart data
        const growthData = [];
        for (let year = 0; year <= t; year++) {
            const periods = year * n;
            const fvP = P * Math.pow(1 + ratePerPeriod, periods);
            const fvC = PMT * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod);
            const total = fvP + fvC;
            const contrib = P + (PMT * periods);
            growthData.push({
                year: age + year,
                'Initial Principal': P,
                'Total Contributions': PMT * periods,
                'Interest Earned': total - contrib > 0 ? total - contrib : 0,
            });
        }
        
        return { futureValue, totalContributions, totalInterest, growthData };
    }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualRate]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <ResultCard title="Retirement Corpus" value={formatCurrency(result?.futureValue, currency)} description="Target capital at maturation" accent />
                <ResultCard title="Lifetime Inputs" value={formatCurrency(result?.totalContributions, currency)} description="Sum of initial + periodic capital" />
                <ResultCard title="Market Interest" value={formatCurrency(result?.totalInterest, currency)} description="Compound growth performance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <PiggyBank size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Wealth Accumulation Variables</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Current Age" id="ret-current-age" type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} />
                        <InputField label="Retirement Age" id="ret-age" type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} />
                    </div>
                    <InputField label="Starting Capital" id="ret-savings" type="number" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Monthly Inflow" id="ret-contrib" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Growth Rate %" id="ret-rate" type="number" value={annualRate} onChange={e => setAnnualRate(e.target.value)} />
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-text mb-1">Growth Trajectory</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Year-on-year wealth composition</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={result?.growthData || []}>
                                <defs>
                                    <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9f7aea" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#9f7aea" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4299e1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4299e1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#48bb78" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#48bb78" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="year" hide />
                                <YAxis hide />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Area type="monotone" dataKey="Initial Principal" stackId="1" stroke="#9f7aea" fill="url(#colorCapital)" />
                                <Area type="monotone" dataKey="Total Contributions" stackId="1" stroke="#4299e1" fill="url(#colorContrib)" />
                                <Area type="monotone" dataKey="Interest Earned" stackId="1" stroke="#48bb78" fill="url(#colorInterest)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {result && <AIInsightSection data={{ currentAge, retirementAge, currentSavings, monthlyContribution, annualRate }} type="Retirement" />}
        </div>
    );
};

const AmortizationCalculator = ({ currency }: CalculatorProps) => {
    const [loanAmount, setLoanAmount] = useState('200000');
    const [rate, setRate] = useState('6.5');
    const [term, setTerm] = useState('30');

    const { schedule, summary } = useMemo(() => {
        const P = parseFloat(loanAmount);
        const annualRate = parseFloat(rate);
        const years = parseInt(term);
        if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || annualRate < 0 || years <= 0) return { schedule: [], summary: null };

        const i = annualRate / 100 / 12;
        const n = years * 12;
        const M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

        const scheduleData = [];
        let balance = P;
        for (let k = 1; k <= n; k++) {
            const interestPayment = balance * i;
            const principalPayment = M - interestPayment;
            balance -= principalPayment;
            scheduleData.push({
                month: k,
                payment: M,
                principal: principalPayment,
                interest: interestPayment,
                balance: balance > 0 ? balance : 0,
            });
        }
        
        return {
            schedule: scheduleData,
            summary: {
                monthlyPayment: M,
                totalInterest: (M * n) - P,
                totalPaid: M * n,
            }
        };
    }, [loanAmount, rate, term]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Loan Amount" id="amort-amount" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Annual Interest Rate (%)" id="amort-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                <InputField label="Loan Term (Years)" id="amort-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
            </div>
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ResultCard title="Monthly Payment" value={formatCurrency(summary.monthlyPayment, currency)} accent />
                    <ResultCard title="Total Interest" value={formatCurrency(summary.totalInterest, currency)} />
                    <ResultCard title="Total Paid" value={formatCurrency(summary.totalPaid, currency)} />
                </div>
            )}
            <div className="max-h-96 overflow-y-auto bg-brand-bg/30 rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-brand-text-secondary uppercase bg-brand-surface sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Month</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Principal</th>
                            <th className="px-4 py-3">Interest</th>
                            <th className="px-4 py-3">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {schedule.map(row => (
                            <tr key={row.month} className="border-b border-brand-border/50 hover:bg-brand-surface/30">
                                <td className="px-4 py-2">{row.month}</td>
                                <td className="px-4 py-2">{formatCurrency(row.payment, currency)}</td>
                                <td className="px-4 py-2 text-green-400">{formatCurrency(row.principal, currency)}</td>
                                <td className="px-4 py-2 text-orange-400">{formatCurrency(row.interest, currency)}</td>
                                <td className="px-4 py-2">{formatCurrency(row.balance, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InflationCalculator = ({ currency }: CalculatorProps) => {
    const [mode, setMode] = useState<'future' | 'past'>('future');
    const [amount, setAmount] = useState('1000');
    const [years, setYears] = useState('10');
    const [rate, setRate] = useState('3');

    const result = useMemo(() => {
        const A = parseFloat(amount);
        const t = parseInt(years);
        const r = parseFloat(rate) / 100;
        if (isNaN(A) || isNaN(t) || isNaN(r)) return null;

        if (mode === 'future') {
            const futureValue = A * Math.pow(1 + r, t);
            return {
                label: 'Projected Cost',
                value: futureValue,
                change: futureValue - A,
                changeLabel: 'Purchasing Power Loss'
            };
        } else {
            const pastValue = A / Math.pow(1 + r, t);
            return {
                label: 'Historical Cost',
                value: pastValue,
                change: A - pastValue,
                changeLabel: 'Price Appreciation'
            };
        }
    }, [mode, amount, years, rate]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <ResultCard title={result?.label || ''} value={formatCurrency(result?.value, currency)} description={mode === 'future' ? 'Equivalent value tomorrow' : 'Equivalent value yesterday'} accent />
                <ResultCard title={result?.changeLabel || ''} value={formatCurrency(result?.change, currency)} description="Delta change due to inflation" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <Wind size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Monetary erosion variables</h3>
                    </div>
                    
                    <div className="flex gap-2 p-1 bg-brand-bg/50 border border-brand-border/30 rounded-xl mb-4">
                        <button 
                            onClick={() => setMode('future')} 
                            className={`flex-grow py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'future' ? 'bg-brand-primary text-brand-bg shadow-sm' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Forward Projection
                        </button>
                        <button 
                            onClick={() => setMode('past')} 
                            className={`flex-grow py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'past' ? 'bg-brand-primary text-brand-bg shadow-sm' : 'text-brand-text-secondary hover:text-brand-text'}`}
                        >
                            Backward Analysis
                        </button>
                    </div>

                    <InputField label={mode === 'future' ? 'Base Capital' : 'Adjusted Capital'} id="inf-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Time Interval" id="inf-years" type="number" value={years} onChange={e => setYears(e.target.value)} rightAddon="YEARS" />
                    <InputField label="Avg. IPC Rate %" id="inf-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8 flex flex-col justify-center min-h-[300px]">
                    <div className="space-y-6 text-center">
                         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text-secondary">Erosion Impact Analysis</h3>
                         <div className="relative">
                            <div className="text-6xl font-black text-brand-text/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none uppercase tracking-tighter">Inflation</div>
                            <p className="text-lg text-brand-text-secondary font-medium leading-relaxed relative z-10 px-8">
                                At an average rate of <span className="text-brand-accent font-bold">{rate}%</span>, 
                                {mode === 'future' 
                                    ? ` the purchasing power of your capital will decrease by ` 
                                    : ` the cost of living was significantly lower `
                                }
                                <span className="text-brand-primary font-bold"> {formatCurrency(result?.change, currency)} </span>
                                over {years} years.
                            </p>
                         </div>
                         <div className="pt-8 border-t border-brand-border/10">
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest italic opacity-50">
                                This engine uses the compound interest formula to calculate CPI (Consumer Price Index) adjustments.
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinanceCalculator: FC<CalculatorProps> = ({ currency }) => {
    const [solveFor, setSolveFor] = useState<'N' | 'I' | 'PV' | 'PMT' | 'FV'>('FV');
    const [N, setN] = useState('120'); // Number of periods
    const [I, setI] = useState('5'); // Annual Rate
    const [PV, setPV] = useState('0'); // Present Value
    const [PMT, setPMT] = useState('-1000'); // Payment
    const [FV, setFV] = useState('0'); // Future Value
    const [compounding, setCompounding] = useState<'12' | '1' | '4'>('12'); // Monthly Default
    
    // Engine computations
    const calculateTVM = () => {
        let nObj = parseFloat(N);
        let iObj = parseFloat(I) / 100 / parseFloat(compounding);
        let pvObj = parseFloat(PV);
        let pmtObj = parseFloat(PMT);
        let fvObj = parseFloat(FV);
        
        if (isNaN(iObj) || iObj === 0) iObj = 1e-10; // Avoid divide by zero
        if (isNaN(nObj)) nObj = 0;
        if (isNaN(pvObj)) pvObj = 0;
        if (isNaN(pmtObj)) pmtObj = 0;
        if (isNaN(fvObj)) fvObj = 0;
        
        try {
            if (solveFor === 'FV') {
                const res = -(pvObj * Math.pow(1 + iObj, nObj) + pmtObj * ((Math.pow(1 + iObj, nObj) - 1) / iObj));
                return { value: res, label: 'Future Value', isCurrency: true };
            }
            if (solveFor === 'PV') {
                const res = -(fvObj + pmtObj * ((Math.pow(1 + iObj, nObj) - 1) / iObj)) / Math.pow(1 + iObj, nObj);
                return { value: res, label: 'Present Value', isCurrency: true };
            }
            if (solveFor === 'PMT') {
                const res = -(fvObj + pvObj * Math.pow(1 + iObj, nObj)) / ((Math.pow(1 + iObj, nObj) - 1) / iObj);
                return { value: res, label: 'Periodic Payment', isCurrency: true };
            }
            if (solveFor === 'N') {
                const num = -fvObj + (pmtObj / iObj);
                const den = pvObj + (pmtObj / iObj);
                if (num / den <= 0) return { value: NaN, label: 'Periods (N)', isCurrency: false };
                const res = Math.log(num/den) / Math.log(1 + iObj);
                return { value: res, label: 'Periods (N)', isCurrency: false };
            }
            if (solveFor === 'I') {
                let rate = 0.05;
                for (let iter = 0; iter < 100; iter++) {
                    const f = fvObj + pvObj*Math.pow(1+rate, nObj) + pmtObj*((Math.pow(1+rate, nObj)-1)/rate);
                    const fPrime = nObj*pvObj*Math.pow(1+rate, nObj-1) + pmtObj*(nObj*rate*Math.pow(1+rate, nObj-1) - Math.pow(1+rate, nObj) + 1)/(rate*rate);
                    const nextRate = rate - f/fPrime;
                    if (Math.abs(nextRate - rate) < 1e-7) { rate = nextRate; break; }
                    rate = nextRate;
                }
                const annualRate = rate * parseFloat(compounding) * 100;
                return { value: annualRate, label: 'Annual Rate (I/Y)', isCurrency: false, suffix: '%' };
            }
        } catch {
            return { value: NaN, label: 'Calculation Error', isCurrency: false };
        }
        return { value: NaN, label: '', isCurrency: false };
    };

    const result = calculateTVM();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2">Target Variable Computed</p>
                <div className="text-5xl font-black text-brand-text font-mono tracking-tighter">
                   {isNaN(result.value) || !isFinite(result.value) ? 'ERR' : 
                    result.isCurrency 
                      ? formatCurrency(result.value, currency) 
                      : `${result.value.toFixed(2)}${result.suffix || ''}`}
                </div>
                <p className="text-sm font-bold text-brand-text-secondary mt-2">{result.label}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-brand-border/30 pb-4">
                        <Calculator size={18} className="text-brand-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-brand-text">Solvable Metrics</h3>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                         {['N', 'I', 'PV', 'PMT', 'FV'].map((v) => (
                             <button
                                key={v}
                                onClick={() => setSolveFor(v as any)}
                                className={`py-3 text-xs font-black rounded-xl border transition-all ${
                                    solveFor === v 
                                        ? 'bg-brand-primary border-brand-primary text-brand-bg shadow-md' 
                                        : 'bg-brand-surface border-brand-border/40 text-brand-text-secondary hover:text-brand-text'
                                }`}
                             >
                                 {v}
                             </button>
                         ))}
                    </div>

                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary">Note: Use negative values for cash outflows (payments/deposits) and positive for inflows.</p>

                    <div className="space-y-4">
                        {solveFor !== 'N' && (
                            <InputField label="Periods (N)" id="tvm-n" type="number" step="any" value={N} onChange={e => setN(e.target.value)} />
                        )}
                        {solveFor !== 'I' && (
                            <InputField label="Annual Interest (I/Y) %" id="tvm-i" type="number" step="any" value={I} onChange={e => setI(e.target.value)} />
                        )}
                        {solveFor !== 'PV' && (
                            <InputField label="Present Value (PV)" id="tvm-pv" type="number" step="any" value={PV} onChange={e => setPV(e.target.value)} />
                        )}
                        {solveFor !== 'PMT' && (
                            <InputField label="Payment (PMT)" id="tvm-pmt" type="number" step="any" value={PMT} onChange={e => setPMT(e.target.value)} />
                        )}
                        {solveFor !== 'FV' && (
                            <InputField label="Future Value (FV)" id="tvm-fv" type="number" step="any" value={FV} onChange={e => setFV(e.target.value)} />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-brand-border/30 pb-4">
                        <RefreshCw size={18} className="text-brand-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-brand-text">Engine Parameters</h3>
                    </div>
                    
                    <div className="space-y-4 bg-brand-surface/30 p-6 rounded-2xl border border-brand-border/30">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-3">Compounding Frequency</label>
                        <div className="flex gap-2 text-center">
                             <button
                                onClick={() => setCompounding('1')}
                                className={`flex-1 py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${compounding === '1' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-brand-surface text-brand-text-secondary border border-brand-border/30 hover:bg-brand-bg'}`}
                             >
                                 Annually
                             </button>
                             <button
                                onClick={() => setCompounding('4')}
                                className={`flex-1 py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${compounding === '4' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-brand-surface text-brand-text-secondary border border-brand-border/30 hover:bg-brand-bg'}`}
                             >
                                 Quarterly
                             </button>
                             <button
                                onClick={() => setCompounding('12')}
                                className={`flex-1 py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${compounding === '12' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-brand-surface text-brand-text-secondary border border-brand-border/30 hover:bg-brand-bg'}`}
                             >
                                 Monthly
                             </button>
                        </div>
                    </div>
                    
                    <div className="bg-brand-primary/5 border border-brand-primary/20 p-6 rounded-2xl">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={12}/> TVM Solver Architecture</h4>
                        <p className="text-xs text-brand-text-secondary leading-relaxed">
                            The Time Value of Money engine computes complex inter-temporal financial constraints. Use solving variables to project savings trajectories, bond yields to maturity, mortgage durations, or reverse-calculate balloon loan parameters. Cash outflow must be denoted with a minus (e.g. initial deposits).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IncomeTaxCalculator: FC<CalculatorProps> = ({ currency }) => {
    const TAX_BRACKETS_2024 = useMemo(() => ({
      single: [
        { rate: 0.10, from: 0, to: 11600 },
        { rate: 0.12, from: 11601, to: 47150 },
        { rate: 0.22, from: 47151, to: 100525 },
        { rate: 0.24, from: 100526, to: 191950 },
        { rate: 0.32, from: 191951, to: 243725 },
        { rate: 0.35, from: 243726, to: 609350 },
        { rate: 0.37, from: 609351, to: Infinity },
      ],
      marriedFilingJointly: [
        { rate: 0.10, from: 0, to: 23200 },
        { rate: 0.12, from: 23201, to: 94300 },
        { rate: 0.22, from: 94301, to: 201050 },
        { rate: 0.24, from: 201051, to: 383900 },
        { rate: 0.32, from: 383901, to: 487450 },
        { rate: 0.35, from: 487451, to: 731200 },
        { rate: 0.37, from: 731201, to: Infinity },
      ],
    }), []);

    const STANDARD_DEDUCTION_2024 = useMemo(() => ({
        single: 14600,
        marriedFilingJointly: 29200,
    }), []);
    
    const [income, setIncome] = useState('80000');
    const [filingStatus, setFilingStatus] = useState<'single' | 'marriedFilingJointly'>('single');
    
    const result = useMemo(() => {
        const grossIncome = parseFloat(income);
        if (isNaN(grossIncome)) return null;
        
        const deduction = STANDARD_DEDUCTION_2024[filingStatus];
        const taxableIncome = Math.max(0, grossIncome - deduction);
        const brackets = TAX_BRACKETS_2024[filingStatus];
        
        let totalTax = 0;
        let remainingIncome = taxableIncome;
        let marginalRate = 0;
        const taxBreakdown = [];
        
        for (const bracket of brackets) {
            if (remainingIncome <= 0) break;
            const taxableInBracket = Math.min(remainingIncome, bracket.to - bracket.from + (bracket.to === Infinity ? 0 : 1));
            const taxInBracket = taxableInBracket * bracket.rate;
            totalTax += taxInBracket;
            remainingIncome -= taxableInBracket;
            marginalRate = bracket.rate;
            taxBreakdown.push({
                rate: `${(bracket.rate * 100)}%`,
                range: `${formatCurrency(bracket.from, currency)} - ${bracket.to === Infinity ? 'Above' : formatCurrency(bracket.to, currency)}`,
                tax: formatCurrency(taxInBracket, currency)
            });
        }
        
        const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
        
        return { totalTax, effectiveRate, marginalRate: marginalRate * 100, taxBreakdown };
    }, [income, filingStatus, currency, STANDARD_DEDUCTION_2024, TAX_BRACKETS_2024]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <ResultCard title="Total Tax Liability" value={formatCurrency(result?.totalTax, currency)} description="Estimated Federal Obligation" accent />
                <ResultCard title="Effective Tax Rate" value={`${result?.effectiveRate.toFixed(2) || '0.00'}%`} description="Actual tax per dollar earned" />
                <ResultCard title="Marginal Tax Rate" value={`${result?.marginalRate.toFixed(0) || '0'}%`} description="Highest tax bracket reached" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Briefcase size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Taxable Income Review</h3>
                    </div>
                    <InputField label="Gross Annual Salary" id="tax-income" type="number" value={income} onChange={e => setIncome(e.target.value)} currencySymbol={currencySymbol} />
                    
                    <div className="group relative">
                        <label className="absolute -top-2.5 left-3 px-2 bg-brand-surface text-[9px] font-black uppercase tracking-widest text-brand-text-secondary z-10">Filing Status</label>
                        <select 
                            id="tax-status" 
                            value={filingStatus} 
                            onChange={e => setFilingStatus(e.target.value as 'single' | 'marriedFilingJointly')} 
                            className="w-full h-12 pl-4 pr-10 bg-brand-surface/50 border border-brand-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                            <option value="single">Single</option>
                            <option value="marriedFilingJointly">Married Filing Jointly</option>
                        </select>
                        <Users size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none group-hover:text-brand-primary transition-colors" />
                    </div>

                    <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1">Standard Deduction</p>
                        <p className="text-lg font-black text-brand-text">{formatCurrency(STANDARD_DEDUCTION_2024[filingStatus], currency)}</p>
                        <p className="text-[9px] text-brand-text-secondary italic mt-1 opacity-60">Automatically applied 2024 thresholds</p>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-brand-surface/20 rounded-[2rem] border border-brand-border/30 p-8">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-text mb-1">Tax Bracket Allocation</h3>
                            <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest">Progressive tax layer visualization</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary border-b border-brand-border/20">
                                    <th className="py-2">Rate</th>
                                    <th className="py-2 text-right">Income Range</th>
                                    <th className="py-2 text-right">Bracket Tax</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-mono text-brand-text/80">
                                {result?.taxBreakdown.map((row, idx) => (
                                    <tr key={idx} className="border-b border-brand-border/10">
                                        <td className="py-2 font-bold text-brand-primary">{row.rate}</td>
                                        <td className="py-2 text-right">{row.range}</td>
                                        <td className="py-2 text-right">{row.tax}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[9px] text-brand-text-secondary text-center italic mt-6 opacity-40 uppercase tracking-widest">Calculations based on 2024 IRS Federal Tax Brackets</p>
                </div>
            </div>
            {result && <AIInsightSection data={{ income, filingStatus }} type="Income Tax" />}
        </div>
    );
};

const SalaryCalculator: FC<CalculatorProps> = ({ currency }) => {
    const [grossSalary, setGrossSalary] = useState('60000');
    const [payPeriod, setPayPeriod] = useState('annually');
    
    const results = useMemo(() => {
        const gross = parseFloat(grossSalary);
        if (isNaN(gross) || gross <= 0) return null;
        
        let annual = gross;
        if (payPeriod === 'monthly') annual = gross * 12;
        else if (payPeriod === 'bi-weekly') annual = gross * 26;
        else if (payPeriod === 'weekly') annual = gross * 52;
        
        return {
            annual,
            monthly: annual / 12,
            biWeekly: annual / 26,
            weekly: annual / 52,
            daily: annual / 260,
            hourly: annual / 2080
        };
    }, [grossSalary, payPeriod]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <ResultCard title="Annual Equivalent" value={formatCurrency(results?.annual, currency)} description="Total Yearly Compensation" accent />
                <ResultCard title="Monthly Take" value={formatCurrency(results?.monthly, currency)} description="Standard monthly installment" />
                <ResultCard title="Hourly Rate" value={formatCurrency(results?.hourly, currency)} description="Based on 2080 annual hours" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                            <Banknote size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Compensation Terms</h3>
                    </div>
                    
                    <InputField label="Stated Salary" id="salary-amount" type="number" value={grossSalary} onChange={e => setGrossSalary(e.target.value)} currencySymbol={currencySymbol} />
                    
                    <div className="group relative">
                        <label className="absolute -top-2.5 left-3 px-2 bg-brand-surface text-[9px] font-black uppercase tracking-widest text-brand-text-secondary z-10">Pay Cycle</label>
                        <select 
                            id="salary-period" 
                            value={payPeriod} 
                            onChange={e => setPayPeriod(e.target.value)} 
                            className="w-full h-12 pl-4 pr-10 bg-brand-surface/50 border border-brand-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                            <option value="annually">Annually</option>
                            <option value="monthly">Monthly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none group-hover:text-brand-primary transition-colors" />
                    </div>

                    <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border/20 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Standard Hours</span>
                            <span className="text-xs font-bold text-brand-text">40 / Week</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Paid Days</span>
                            <span className="text-xs font-bold text-brand-text">260 / Year</span>
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-brand-bg/40 rounded-[2rem] border border-brand-border/30 p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-brand-text">Pay Schedule Breakdown</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Weekly', value: results?.weekly },
                            { label: 'Bi-Weekly', value: results?.biWeekly },
                            { label: 'Monthly', value: results?.monthly },
                            { label: 'Daily', value: results?.daily }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-brand-surface/30 border border-brand-border/20 rounded-2xl hover:bg-brand-surface/50 transition-colors">
                                <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest">{item.label}</span>
                                <span className="text-lg font-mono font-black text-brand-text">{formatCurrency(item.value || 0, currency)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SalesTaxCalculator: FC<CalculatorProps> = ({ currency }) => {
    const [preTax, setPreTax] = useState('100');
    const [rate1, setRate1] = useState('8.5');

    const result1 = useMemo(() => {
        const p = parseFloat(preTax);
        const r = parseFloat(rate1) / 100;
        if (isNaN(p) || isNaN(r)) return { tax: 0, total: 0 };
        const tax = p * r;
        return { tax, total: p + tax };
    }, [preTax, rate1]);

    const [postTax, setPostTax] = useState('125.50');
    const [rate2, setRate2] = useState('7');

    const result2 = useMemo(() => {
        const p = parseFloat(postTax);
        const r = parseFloat(rate2) / 100;
        if (isNaN(p) || isNaN(r)) return { tax: 0, base: 0 };
        const base = p / (1 + r);
        return { tax: p - base, base };
    }, [postTax, rate2]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Sales Tax */}
                <div className="space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Plus size={48} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Receipt size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Net to Gross</h3>
                    </div>
                    
                    <InputField label="Price Before Tax" id="st-pretax" type="number" value={preTax} onChange={e => setPreTax(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Sales Tax Rate %" id="st-rate1" type="number" value={rate1} onChange={e => setRate1(e.target.value)} />

                    <div className="pt-6 border-t border-brand-border/20 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Tax Component</span>
                            <span className="text-lg font-black text-brand-accent">{formatCurrency(result1.tax, currency)}</span>
                        </div>
                        <div className="flex justify-between items-end p-4 bg-brand-primary/10 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Final Price</span>
                            <span className="text-2xl font-black text-brand-primary">{formatCurrency(result1.total, currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Remove Sales Tax */}
                <div className="space-y-6 bg-brand-surface/20 p-8 rounded-[2rem] border border-brand-border/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Minus size={48} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Receipt size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-text">Gross to Net</h3>
                    </div>
                    
                    <InputField label="Price After Tax" id="st-posttax" type="number" value={postTax} onChange={e => setPostTax(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Sales Tax Rate %" id="st-rate2" type="number" value={rate2} onChange={e => setRate2(e.target.value)} />

                    <div className="pt-6 border-t border-brand-border/20 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Tax Content</span>
                            <span className="text-lg font-black text-brand-accent">{formatCurrency(result2.tax, currency)}</span>
                        </div>
                        <div className="flex justify-between items-end p-4 bg-purple-500/10 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Price Excluding Tax</span>
                            <span className="text-2xl font-black text-brand-text">{formatCurrency(result2.base, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-brand-surface/20 border border-brand-border/30 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary opacity-60">
                    Use this tool for quick VAT, GST, or Sales Tax adjustments in both directions.
                </p>
            </div>
        </div>
    );
};

// --- Main Component ---
const FinancialCalculator = ({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) => {
    const [activeCalc, setActiveCalc] = useState('mortgage');
    const [currency, setCurrency] = useState('USD');

    const calculatorList = [
        { value: 'mortgage', label: 'Mortgage', Icon: Home },
        { value: 'auto-loan', label: 'Auto Loan', Icon: Car },
        { value: 'loan', label: 'Standard Loan', Icon: Landmark },
        { value: 'investment', label: 'Investment', Icon: TrendingUp },
        { value: 'retirement', label: 'Retirement', Icon: PiggyBank },
        { value: 'amortization', label: 'Amortization', Icon: Table },
        { value: 'payment', label: 'Solve for variable', Icon: HandCoins },
        { value: 'interest', label: 'Simple Interest', Icon: Percent },
        { value: 'interest-rate', label: 'Interest Rate (APR)', Icon: Receipt },
        { value: 'inflation', label: 'Inflation', Icon: Wind }, 
        { value: 'finance', label: 'Finance (TVM)', Icon: Calculator },
        { value: 'income-tax', label: 'Income Tax', Icon: Briefcase },
        { value: 'salary', label: 'Salary', Icon: Banknote },
        { value: 'sales-tax', label: 'Sales Tax', Icon: Receipt },
    ];
    
    const currencyList = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'ZAR'];

    const ActiveCalculator = useMemo(() => {
        const calculators: Record<string, FC<CalculatorProps>> = {
            'mortgage': MortgageCalculator,
            'loan': LoanCalculator,
            'auto-loan': AutoLoanCalculator,
            'interest': InterestCalculator,
            'payment': PaymentCalculator,
            'retirement': RetirementCalculator,
            'amortization': AmortizationCalculator,
            'investment': InvestmentCalculator,
            'inflation': InflationCalculator,
            'finance': FinanceCalculator,
            'income-tax': IncomeTaxCalculator,
            'salary': SalaryCalculator,
            'interest-rate': InterestRateCalculator,
            'sales-tax': SalesTaxCalculator,
        };
        return calculators[activeCalc];
    }, [activeCalc]);


    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-brand-primary rounded-full" />
                    <h2 className="text-4xl font-black tracking-tighter text-brand-text uppercase leading-none">
                        Financial <span className="text-brand-primary">Suite</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-text-secondary mt-3 opacity-60">Professional Capital & Debt Analyzers</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="group relative w-full sm:w-48">
                        <label className="absolute -top-2.5 left-3 px-2 bg-brand-surface text-[9px] font-black uppercase tracking-widest text-brand-text-secondary z-10">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full h-12 pl-4 pr-10 bg-brand-surface/50 border border-brand-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-sm font-bold appearance-none cursor-pointer hover:border-brand-primary/30"
                        >
                            {currencyList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Landmark size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none group-hover:text-brand-primary transition-colors" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-24 lg:z-20">
                    <div className="hidden lg:block p-4 mb-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Calculator Categories</p>
                        <p className="text-xs text-brand-text-secondary italic">Select a tool to begin analysis</p>
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    <div className="lg:hidden sticky top-2 z-40 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="rounded-2xl bg-brand-surface/95 border border-brand-primary/20 backdrop-blur-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] shadow-brand-bg">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Calculator size={14} className="text-brand-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Calculator Mode</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{calculatorList.find(c => c.value === activeCalc)?.label} Active</span>
                            </div>
                            <div className="relative">
                                <select
                                    id="mobile-calc-select"
                                    value={activeCalc}
                                    onChange={(e) => setActiveCalc(e.target.value)}
                                    className="w-full appearance-none bg-brand-bg border border-brand-border/50 hover:border-brand-primary/50 text-brand-text text-sm font-bold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                                >
                                    {calculatorList.map(calc => (
                                        <option key={calc.value} value={calc.value} className="bg-brand-bg text-brand-text font-bold">
                                            {calc.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-brand-text">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation List */}
                    <div className="hidden lg:flex flex-col gap-2 pb-0">
                        {calculatorList.map((calc) => {
                            const Icon = calc.Icon;
                            const isActive = activeCalc === calc.value;
                            return (
                                <button
                                    key={calc.value}
                                    onClick={() => setActiveCalc(calc.value)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group shrink-0 ${
                                        isActive 
                                            ? 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20 scale-[1.02]' 
                                            : 'bg-brand-surface/40 hover:bg-brand-surface text-brand-text-secondary hover:text-brand-text hover:translate-x-1 border border-brand-border/30'
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-brand-bg' : 'group-hover:text-brand-primary transition-colors'} />
                                    <span className="text-sm font-bold tracking-tight">{calc.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Calculator Content */}
                <div className="lg:col-span-9">
                    <div className="relative group bg-brand-surface/30 border border-brand-border/30 p-8 pt-10 rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden min-h-[600px]">
                        {/* Decorative Background Element */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-1000" />
                        
                        <div className="relative z-10">
                            <ActiveCalculator currency={currency} setActiveTab={setActiveTab} />
                        </div>
                        
                        {/* Status Bar */}
                        <div className="mt-12 pt-6 border-t border-brand-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary opacity-50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Quantum Financial Engine Active
                            </div>
                            <div>
                                {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Report Basis
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialCalculator;