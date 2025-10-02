

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { InputHTMLAttributes, FC } from 'react';
import { Landmark, PiggyBank, HandCoins, Car, Home, Percent, TrendingUp, Receipt, FileText, Bot, Banknote, Loader, Wind, Calculator, Table, Info, Briefcase } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, PieChart, Pie, Cell } from 'recharts';
import CustomDropdown from './common/CustomDropdown';
import { getAutoLoanAnalysis, AutoLoanDetails } from '../services/geminiService';


// --- Reusable UI ---
const InputField: FC<InputHTMLAttributes<HTMLInputElement> & { label: string, id: string, currencySymbol?: string, rightAddon?: string }> = ({ label, id, currencySymbol, rightAddon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <div className="relative">
             {currencySymbol && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">{currencySymbol}</span>}
            <input id={id} {...props} className={`w-full bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary font-mono ${currencySymbol ? 'pl-7' : ''} ${rightAddon ? 'pr-10' : ''}`} />
             {rightAddon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">{rightAddon}</span>}
        </div>
    </div>
);

const ResultCard: FC<{ title: string; value: string; description?: string }> = ({ title, value, description }) => (
    <div className="bg-brand-bg p-4 rounded-lg text-center flex-1">
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-brand-accent my-1 break-all">{value}</p>
        {description && <p className="text-xs text-brand-text-secondary">{description}</p>}
    </div>
);

// --- Helper Functions ---
const formatCurrency = (value: number | undefined | null, currencyCode: string = 'USD') => {
    if (value === undefined || value === null || isNaN(value)) return '--';
    try {
        return value.toLocaleString(undefined, { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 });
    } catch (e) {
        return `$${value.toFixed(2)}`;
    }
};

interface CalculatorProps {
  currency: string;
}

const CustomChartTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        // Mortgage/Retirement/Investment Chart
        if (payload.some((p: any) => p.dataKey === 'Interest Earned' || p.dataKey === 'Interest Paid (Total)')) {
            let reorderedPayload = [];
            // Mortgage Amortization
            if ('Principal Paid (Total)' in data) {
                 reorderedPayload = [
                    payload.find((p: any) => p.dataKey === 'Remaining Balance'),
                    payload.find((p: any) => p.dataKey === 'Principal Paid (Total)'),
                    payload.find((p: any) => p.dataKey === 'Interest Paid (Total)'),
                ].filter(Boolean);
            } else { // Investment/Retirement
                reorderedPayload = [
                    ...payload
                ].reverse();
            }

            return (
                <div className="bg-brand-surface/90 p-3 border border-brand-border rounded-lg shadow-lg">
                    <p className="font-bold text-brand-text mb-2">{label === 0 ? 'Start' : `End of Year ${label}`}</p>
                    {reorderedPayload.map((pld: any) => (
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
                    <span className="font-mono font-semibold">{formatCurrency(data['Remaining Balance'], currency)}</span>
                </div>
                {label !== '0' && data['Principal Paid (Year)'] !== undefined && (
                    <>
                        <div className="flex justify-between gap-4" style={{ color: 'var(--color-accent)' }}>
                            <span>Principal Paid (This Year):</span>
                            <span className="font-mono font-semibold">{formatCurrency(data['Principal Paid (Year)'], currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4" style={{ color: 'var(--color-secondary)' }}>
                            <span>Interest Paid (This Year):</span>
                            <span className="font-mono font-semibold">{formatCurrency(data['Interest Paid (Year)'], currency)}</span>
                        </div>
                    </>
                )}
            </div>
        );
    }
    return null;
};


const CustomPieTooltip = ({ active, payload, currency }: any) => {
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

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Loan Details</h3>
                    <InputField label="Loan Amount" id="loan-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Interest Rate (%)" id="loan-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                    <InputField label="Loan Term (Years)" id="loan-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
                </div>
                <div className="space-y-4">
                    <ResultCard title="Monthly Payment" value={formatCurrency(result?.monthlyPayment, currency)} description="The amount you'll pay each month." />
                    <ResultCard title="Total Interest Paid" value={formatCurrency(result?.totalInterest, currency)} description="The total interest paid over the life of the loan." />
                    <ResultCard title="Total Amount Paid" value={formatCurrency(result?.totalPaid, currency)} description="Principal + Interest" />
                </div>
            </div>

            {result && result.amortizationData.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Loan Balance Over Time</h3>
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <ResponsiveContainer>
                            <LineChart data={result.amortizationData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" unit=" yr" stroke="var(--color-text-secondary)" />
                                <YAxis tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')} stroke="var(--color-text-secondary)" width={80} />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Legend />
                                <Line type="monotone" dataKey="Remaining Balance" stroke="var(--color-primary)" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
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
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Investment Details</h3>
                    <InputField label="Initial Principal" id="inv-principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Periodic Contribution" id="inv-contribution" type="number" value={contribution} onChange={e => setContribution(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Rate of Return (%)" id="inv-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                    <InputField label="Investment Term (Years)" id="inv-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
                    <div>
                    <label htmlFor="inv-frequency" className="block text-sm font-medium text-brand-text-secondary mb-1">Compounding Frequency</label>
                    <select id="inv-frequency" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
                        <option value="365">Daily</option>
                        <option value="12">Monthly</option>
                        <option value="4">Quarterly</option>
                        <option value="1">Annually</option>
                    </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <ResultCard title="Future Value" value={formatCurrency(result?.futureValue, currency)} description="The total value of your investment at the end of the term." />
                    <ResultCard title="Total Contributions" value={formatCurrency(result?.totalContributions, currency)} description="Principal + all periodic contributions." />
                    <ResultCard title="Total Interest Earned" value={formatCurrency(result?.totalInterest, currency)} description="The profit earned from compounding." />
                </div>
            </div>
            {result && result.growthData.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Investment Growth Over Time</h3>
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <ResponsiveContainer>
                            <LineChart data={result.growthData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" unit=" yr" stroke="var(--color-text-secondary)" />
                                <YAxis tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')} stroke="var(--color-text-secondary)" width={80} />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Legend />
                                <Line type="monotone" dataKey="Initial Principal" name="Principal" stroke="#9f7aea" dot={false} />
                                <Line type="monotone" dataKey="Total Contributions" name="Contributions" stroke="#4299e1" dot={false} />
                                <Line type="monotone" dataKey="Interest Earned" name="Interest" stroke="#48bb78" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
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
    
    const currencySymbol = new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Loan Details</h3>
                <InputField label="Loan Amount" id="ir-loan-amount" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Monthly Payment" id="ir-monthly-payment" type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Loan Term (Years)" id="ir-term" type="number" value={termYears} onChange={e => setTermYears(e.target.value)} />
            </div>
            <div className="space-y-4">
                {result.error ? (
                    <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{result.error}</div>
                ) : (
                    <>
                        <ResultCard title="Estimated Annual Rate (APR)" value={`${result.apr?.toFixed(3) ?? '--'}%`} description="The calculated annual interest rate." />
                        <ResultCard title="Total Paid" value={formatCurrency(result.totalPaid, currency)} description="The total amount you will pay over the loan term." />
                        <ResultCard title="Total Interest" value={formatCurrency(result.totalInterest, currency)} description="The total cost of borrowing." />
                    </>
                )}
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
            let principalForYear = 0;
            for (let month = 1; month <= 12; month++) {
                const interestForMonth = balance * monthlyRate;
                const principalForMonth = monthlyPI - interestForMonth;
                balance -= principalForMonth;
                interestForYear += interestForMonth;
                principalForYear += principalForMonth;
            }
            totalInterestPaid += interestForYear;
            amortizationData.push({
                year: year,
                'Remaining Balance': balance > 0 ? balance : 0,
                'Interest Paid (Total)': totalInterestPaid,
                'Principal Paid (Total)': loanAmount - (balance > 0 ? balance : 0),
            });
        }
        
        return { loanAmount, totalMonthlyPayment, monthlyPI, monthlyTax, monthlyInsurance, monthlyPmi, pieData, amortizationData, totalInterestPaid };

    }, [homePrice, downPayment, loanTerm, interestRate, propertyTax, homeInsurance, pmi, downPaymentPercent]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);
    const PIE_COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', '#9f7aea'];

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Mortgage Details</h3>
                    <InputField label="Home Price" id="mortgage-price" type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} currencySymbol={currencySymbol} />
                    <div>
                        <label htmlFor="down-payment-percent" className="block text-sm font-medium text-brand-text-secondary mb-1">Down Payment ({downPaymentPercent.toFixed(1)}%)</label>
                        <div className="flex items-center gap-2">
                            <InputField label="" id="mortgage-down" type="number" value={downPayment} onChange={e => handleDownPaymentChange(e.target.value)} currencySymbol={currencySymbol} />
                            <input type="range" id="down-payment-percent" min="0" max="100" step="0.5" value={downPaymentPercent} onChange={e => handleDownPaymentPercentChange(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="loan-term" className="block text-sm font-medium text-brand-text-secondary mb-1">Loan Term (Years)</label>
                        <select id="loan-term" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
                            <option value="30">30 Years</option>
                            <option value="20">20 Years</option>
                            <option value="15">15 Years</option>
                            <option value="10">10 Years</option>
                        </select>
                    </div>
                    <InputField label="Interest Rate (%)" id="mortgage-rate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                    <InputField label="Annual Property Tax" id="mortgage-tax" type="number" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Home Insurance" id="mortgage-insurance" type="number" value={homeInsurance} onChange={e => setHomeInsurance(e.target.value)} currencySymbol={currencySymbol} />
                    {downPaymentPercent < 20 && (
                         <InputField label="PMI (% of loan/year)" id="mortgage-pmi" type="number" value={pmi} onChange={e => setPmi(e.target.value)} />
                    )}
                </div>
                <div className="lg:col-span-3 space-y-4">
                    <ResultCard title="Total Monthly Payment" value={formatCurrency(result?.totalMonthlyPayment, currency)} description="Includes PITI + PMI" />
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <h3 className="text-xl font-bold mb-2 text-center">Monthly Payment Breakdown</h3>
                        {result && <ResponsiveContainer>
                            <PieChart>
                                <Pie data={result.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                    {result.pieData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip currency={currency} />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>}
                    </div>
                </div>
            </div>
            {result && result.amortizationData && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Loan Amortization Schedule</h3>
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <ResponsiveContainer>
                            <LineChart data={result.amortizationData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" unit=" yr" stroke="var(--color-text-secondary)" />
                                <YAxis tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')} stroke="var(--color-text-secondary)" width={80} />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Legend />
                                <Line type="monotone" dataKey="Principal Paid (Total)" stroke="#48bb78" name="Principal Paid" dot={false} />
                                <Line type="monotone" dataKey="Interest Paid (Total)" stroke="#ed8936" name="Interest Paid" dot={false} />
                                <Line type="monotone" dataKey="Remaining Balance" stroke="#4299e1" name="Loan Balance" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
};


const AutoLoanCalculator = ({ currency }: CalculatorProps) => {
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
            return { loanAmount: P, monthlyPayment: 0, totalInterest: 0, totalPaid: 0, amortizationData: [], pieData, taxAmount };
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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Auto Loan Details</h3>
                    <InputField label="Vehicle Price" id="auto-price" type="number" value={vehiclePrice} onChange={e => setVehiclePrice(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Down Payment" id="auto-down" type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Trade-in Value" id="auto-trade" type="number" value={tradeInValue} onChange={e => setTradeInValue(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Other Fees (e.g., Doc, Title)" id="auto-fees" type="number" value={otherFees} onChange={e => setOtherFees(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Sales Tax Rate (%)" id="auto-tax" type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(e.target.value)} />
                    <InputField label="Annual Interest Rate (%)" id="auto-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                    <InputField label="Loan Term (Years)" id="auto-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
                </div>
                <div className="space-y-4">
                    <ResultCard title="Total Loan Amount" value={formatCurrency(result?.loanAmount, currency)} description="The total amount financed." />
                    <ResultCard title="Monthly Payment" value={formatCurrency(result?.monthlyPayment, currency)} description="The amount you'll pay each month." />
                    <ResultCard title="Total Interest Paid" value={formatCurrency(result?.totalInterest, currency)} description="The total interest paid over the life of the loan." />
                    <ResultCard title="Sales Tax" value={formatCurrency(result?.taxAmount, currency)} description="Estimated sales tax amount." />
                </div>
            </div>
             {result && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 items-center">
                    <div className="lg:col-span-3">
                        <h3 className="text-xl font-bold mb-4 text-center">Total Cost Breakdown</h3>
                        <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={result.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                                        {result.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip currency={currency} />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-4 text-center">
                        <h3 className="text-xl font-bold">AI Loan Analysis</h3>
                        <button 
                            onClick={handleGetAnalysis} 
                            disabled={isAnalysisLoading}
                            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-brand-primary/20 text-brand-primary rounded-lg hover:bg-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAnalysisLoading ? <><Loader size={18} className="animate-spin" /> Analyzing...</> : <><Bot size={18} /> Get Analysis</>}
                        </button>
                        {analysis && !isAnalysisLoading && (
                            <div className="p-4 bg-brand-bg text-brand-text-secondary text-sm rounded-lg animate-fade-in-down text-left">
                                {analysis.split('\n').map((line, i) => (
                                    <p key={i} className="mb-1">{line.replace(/-\s*/, '• ')}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             )}
             {result && result.amortizationData.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Loan Balance Over Time</h3>
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <ResponsiveContainer>
                            <LineChart data={result.amortizationData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" unit=" yr" stroke="var(--color-text-secondary)" />
                                <YAxis tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')} stroke="var(--color-text-secondary)" width={80} />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Legend />
                                <Line type="monotone" dataKey="Remaining Balance" stroke="var(--color-primary)" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
};

const InterestCalculator = ({ currency }: CalculatorProps) => {
    const [principal, setPrincipal] = useState('1000');
    const [rate, setRate] = useState('5');
    const [time, setTime] = useState('2');
    const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days'>('years');

    const result = useMemo(() => {
        const P = parseFloat(principal);
        const annualRate = parseFloat(rate);
        const t_period = parseFloat(time);

        if (isNaN(P) || isNaN(annualRate) || isNaN(t_period) || P <= 0 || annualRate < 0 || t_period <= 0) {
            return null;
        }

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Simple Interest Details</h3>
                <InputField 
                    label="Principal Amount" 
                    id="si-principal" 
                    type="number" 
                    value={principal} 
                    onChange={e => setPrincipal(e.target.value)} 
                    currencySymbol={currencySymbol} 
                />
                <InputField 
                    label="Annual Interest Rate (%)" 
                    id="si-rate" 
                    type="number" 
                    value={rate} 
                    onChange={e => setRate(e.target.value)} 
                />
                <div className="flex gap-2">
                    <div className="flex-grow">
                        <InputField 
                            label="Time Period" 
                            id="si-time" 
                            type="number" 
                            value={time} 
                            onChange={e => setTime(e.target.value)} 
                        />
                    </div>
                    <div className="w-1/3">
                        <label htmlFor="si-time-unit" className="block text-sm font-medium text-brand-text-secondary mb-1">&nbsp;</label>
                        <select 
                            id="si-time-unit" 
                            value={timeUnit} 
                            onChange={e => setTimeUnit(e.target.value as any)} 
                            className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 h-[42px] focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="years">Years</option>
                            <option value="months">Months</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <ResultCard 
                    title="Total Interest" 
                    value={formatCurrency(result?.totalInterest, currency)} 
                    description="The amount of interest earned or paid." 
                />
                <ResultCard 
                    title="Total Amount" 
                    value={formatCurrency(result?.totalAmount, currency)} 
                    description="Principal + Total Interest" 
                />
            </div>
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
        } catch (e: any) {
            setError(e.message || 'Calculation failed. Check your inputs.');
        }
    };

    const clearFields = () => {
        setLoanAmount(''); setRate(''); setTerm(''); setPayment(''); setError(''); setResult(null);
    };
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="space-y-4">
            <div className="p-3 bg-brand-bg text-center text-sm rounded-lg text-brand-text-secondary flex items-center justify-center gap-2">
                <Info size={16} /> Fill any three fields and leave one blank to solve for it.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Loan Amount" id="pmt-amount" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Annual Interest Rate (%)" id="pmt-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
                <InputField label="Loan Term (Years)" id="pmt-term" type="number" value={term} onChange={e => setTerm(e.target.value)} />
                <InputField label="Monthly Payment" id="pmt-payment" type="number" value={payment} onChange={e => setPayment(e.target.value)} currencySymbol={currencySymbol} />
            </div>
            <div className="flex gap-4">
                <button onClick={calculate} className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-lg font-semibold">Calculate</button>
                <button onClick={clearFields} className="w-full py-3 bg-brand-surface hover:bg-gray-600 rounded-lg font-semibold">Clear</button>
            </div>
            <div className="bg-brand-bg p-4 rounded-lg min-h-[80px] text-center">
                {error && <p className="text-red-400">{error}</p>}
                {result && <p className="text-2xl font-bold text-brand-accent">{result}</p>}
            </div>
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
         <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Retirement Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Current Age" id="ret-current-age" type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} />
                        <InputField label="Retirement Age" id="ret-age" type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} />
                    </div>
                    <InputField label="Current Savings" id="ret-savings" type="number" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Monthly Contribution" id="ret-contrib" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Annual Rate of Return (%)" id="ret-rate" type="number" value={annualRate} onChange={e => setAnnualRate(e.target.value)} />
                </div>
                <div className="space-y-4">
                    <ResultCard title="Estimated Savings at Retirement" value={formatCurrency(result?.futureValue, currency)} />
                    <ResultCard title="Total Contributions" value={formatCurrency(result?.totalContributions, currency)} />
                    <ResultCard title="Total Interest Earned" value={formatCurrency(result?.totalInterest, currency)} />
                </div>
            </div>
            {result && result.growthData.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Projected Growth</h3>
                    <div className="h-80 w-full bg-brand-bg/30 p-4 rounded-lg">
                        <ResponsiveContainer>
                            <LineChart data={result.growthData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" name="Age" stroke="var(--color-text-secondary)" />
                                <YAxis tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')} stroke="var(--color-text-secondary)" width={80} />
                                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                                <Legend />
                                <Line type="monotone" dataKey="Initial Principal" name="Principal" stroke="#9f7aea" dot={false} />
                                <Line type="monotone" dataKey="Total Contributions" name="Contributions" stroke="#4299e1" dot={false} />
                                <Line type="monotone" dataKey="Interest Earned" name="Interest" stroke="#48bb78" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
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
                <div className="flex flex-wrap gap-4 justify-around">
                    <ResultCard title="Monthly Payment" value={formatCurrency(summary.monthlyPayment, currency)} />
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
                label: 'Value in the Future',
                value: futureValue,
                change: futureValue - A,
                changeLabel: 'Lost purchasing power'
            };
        } else {
            const pastValue = A / Math.pow(1 + r, t);
            return {
                label: 'Value in the Past',
                value: pastValue,
                change: A - pastValue,
                changeLabel: 'Increased purchasing power'
            };
        }
    }, [mode, amount, years, rate]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                <div className="flex gap-2 p-1 bg-brand-bg rounded-full">
                    <button onClick={() => setMode('future')} className={`w-full py-1 rounded-full ${mode === 'future' ? 'bg-brand-primary' : ''}`}>Future Value</button>
                    <button onClick={() => setMode('past')} className={`w-full py-1 rounded-full ${mode === 'past' ? 'bg-brand-primary' : ''}`}>Past Value</button>
                </div>
                <InputField label={mode === 'future' ? 'Initial Amount' : 'Target Amount'} id="inf-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Number of Years" id="inf-years" type="number" value={years} onChange={e => setYears(e.target.value)} />
                <InputField label="Average Annual Inflation Rate (%)" id="inf-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
             <div className="space-y-4">
                 <ResultCard title={result?.label || ''} value={formatCurrency(result?.value, currency)} />
                 <ResultCard title={result?.changeLabel || ''} value={formatCurrency(result?.change, currency)} />
             </div>
        </div>
    );
};

const FinanceCalculator: FC<CalculatorProps> = ({ currency }) => (
    <div className="text-center text-brand-text-secondary p-8 bg-brand-bg rounded-lg">
        <Calculator size={48} className="mx-auto mb-4 text-brand-primary" />
        <p>A full Time Value of Money (TVM) solver is coming soon to handle complex financial calculations for N, I/Y, PV, PMT, and FV.</p>
    </div>
);

const IncomeTaxCalculator: FC<CalculatorProps> = ({ currency }) => {
    const TAX_BRACKETS_2024 = {
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
    };
    const STANDARD_DEDUCTION_2024 = {
        single: 14600,
        marriedFilingJointly: 29200,
    };
    
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
    }, [income, filingStatus, currency]);

    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
                 <InputField label="Gross Annual Income" id="tax-income" type="number" value={income} onChange={e => setIncome(e.target.value)} currencySymbol={currencySymbol} />
                 <div>
                     <label htmlFor="tax-status" className="block text-sm font-medium text-brand-text-secondary mb-1">Filing Status</label>
                     <select id="tax-status" value={filingStatus} onChange={e => setFilingStatus(e.target.value as any)} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
                         <option value="single">Single</option>
                         <option value="marriedFilingJointly">Married Filing Jointly</option>
                     </select>
                 </div>
                 <div className="space-y-4 pt-4">
                     <ResultCard title="Total Tax Liability" value={formatCurrency(result?.totalTax, currency)} />
                     <ResultCard title="Effective Tax Rate" value={`${result?.effectiveRate.toFixed(2) || '0.00'}%`} />
                     <ResultCard title="Marginal Tax Rate" value={`${result?.marginalRate.toFixed(0) || '0'}%`} />
                 </div>
                 <p className="text-xs text-brand-text-secondary text-center italic mt-2">Based on 2024 US Federal tax brackets and standard deductions. For estimation purposes only.</p>
            </div>
            <div className="lg:col-span-3">
                 <h3 className="text-xl font-bold mb-4 text-center">Tax Bracket Breakdown</h3>
                 <div className="overflow-x-auto bg-brand-bg/30 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-brand-text-secondary uppercase bg-brand-surface">
                            <tr>
                                <th className="px-4 py-3">Tax Rate</th>
                                <th className="px-4 py-3">Taxable Income Range</th>
                                <th className="px-4 py-3">Tax in Bracket</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {result?.taxBreakdown.map(row => (
                                <tr key={row.rate} className="border-b border-brand-border/50">
                                    <td className="px-4 py-2 font-semibold">{row.rate}</td>
                                    <td className="px-4 py-2">{row.range}</td>
                                    <td className="px-4 py-2">{row.tax}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SalaryCalculator: FC<CalculatorProps> = ({ currency }) => (
    <div className="text-center text-brand-text-secondary p-8 bg-brand-bg rounded-lg">
        <Banknote size={48} className="mx-auto mb-4 text-brand-primary" />
        <p>A salary calculator is coming soon to estimate your take-home pay after taxes and deductions.</p>
    </div>
);

const SalesTaxCalculator: FC<CalculatorProps> = ({ currency }) => {
    const [preTax, setPreTax] = useState('100');
    const [rate1, setRate1] = useState('8.5');

    const result1 = useMemo(() => {
        const p = parseFloat(preTax);
        const r = parseFloat(rate1) / 100;
        if (isNaN(p) || isNaN(r)) return { tax: '', total: '' };
        const tax = p * r;
        return { tax: tax.toFixed(2), total: (p + tax).toFixed(2) };
    }, [preTax, rate1]);

    const [postTax, setPostTax] = useState('125.50');
    const [rate2, setRate2] = useState('7');

    const result2 = useMemo(() => {
        const p = parseFloat(postTax);
        const r = parseFloat(rate2) / 100;
        if (isNaN(p) || isNaN(r)) return { tax: '', base: '' };
        const base = p / (1 + r);
        return { tax: (p - base).toFixed(2), base: base.toFixed(2) };
    }, [postTax, rate2]);
    
    const currencySymbol = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(1).find(p => p.type === 'currency')?.value, [currency]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                <h3 className="text-xl font-bold">Add Sales Tax</h3>
                <InputField label="Pre-Tax Price" id="st-pretax" type="number" value={preTax} onChange={e => setPreTax(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Tax Rate (%)" id="st-rate1" type="number" value={rate1} onChange={e => setRate1(e.target.value)} />
                <div className="pt-2 border-t border-brand-border/50 space-y-2">
                    <p>Tax Amount: <span className="font-mono font-semibold text-brand-accent">{formatCurrency(parseFloat(result1.tax), currency)}</span></p>
                    <p>Total Price: <span className="font-mono font-semibold text-brand-accent">{formatCurrency(parseFloat(result1.total), currency)}</span></p>
                </div>
            </div>
             <div className="space-y-4 bg-brand-bg/30 p-4 rounded-lg">
                <h3 className="text-xl font-bold">Remove Sales Tax</h3>
                <InputField label="Post-Tax Price" id="st-posttax" type="number" value={postTax} onChange={e => setPostTax(e.target.value)} currencySymbol={currencySymbol} />
                <InputField label="Tax Rate (%)" id="st-rate2" type="number" value={rate2} onChange={e => setRate2(e.target.value)} />
                <div className="pt-2 border-t border-brand-border/50 space-y-2">
                    <p>Tax Amount: <span className="font-mono font-semibold text-brand-accent">{formatCurrency(parseFloat(result2.tax), currency)}</span></p>
                    <p>Base Price: <span className="font-mono font-semibold text-brand-accent">{formatCurrency(parseFloat(result2.base), currency)}</span></p>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const FinancialCalculator = () => {
    const [activeCalc, setActiveCalc] = useState('mortgage');
    const [currency, setCurrency] = useState('USD');

    const calculatorList = [
        { value: 'mortgage', label: 'Mortgage Calculator', Icon: Home },
        { value: 'auto-loan', label: 'Auto Loan Calculator', Icon: Car },
        { value: 'loan', label: 'Loan Calculator', Icon: Landmark },
        { value: 'investment', label: 'Investment Calculator', Icon: TrendingUp },
        { value: 'retirement', label: 'Retirement Calculator', Icon: PiggyBank },
        { value: 'amortization', label: 'Amortization Calculator', Icon: Table },
        { value: 'payment', label: 'Payment Calculator', Icon: HandCoins },
        { value: 'interest', label: 'Simple Interest Calculator', Icon: Percent },
        { value: 'interest-rate', label: 'Interest Rate (APR) Calc', Icon: Receipt },
        { value: 'inflation', label: 'Inflation Calculator', Icon: Wind }, 
        { value: 'finance', label: 'Finance (TVM) Calculator', Icon: Calculator },
        { value: 'income-tax', label: 'Income Tax Calculator', Icon: Briefcase },
        { value: 'salary', label: 'Salary Calculator', Icon: Banknote },
        { value: 'sales-tax', label: 'Sales Tax Calculator', Icon: Receipt },
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
        const Component = calculators[activeCalc];
        return () => <Component currency={currency} />;
    }, [activeCalc, currency]);


    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-brand-primary">Financial Calculators</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                    <CustomDropdown
                        items={calculatorList}
                        selectedValue={activeCalc}
                        onSelect={setActiveCalc}
                    />
                    <div className="w-32">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full h-12 px-3 bg-brand-surface border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            {currencyList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <ActiveCalculator />
            </div>
        </div>
    );
};

export default FinancialCalculator;