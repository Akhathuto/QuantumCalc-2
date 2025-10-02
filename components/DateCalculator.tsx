
import { useState, useMemo } from 'react';

const DateCalculator = () => {
    // Duration State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);

    // Add/Subtract State
    const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [addYears, setAddYears] = useState('1');
    const [addMonths, setAddMonths] = useState('6');
    const [addDays, setAddDays] = useState('0');

    const duration = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
        
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        return { years, months, days, totalDays };
    }, [startDate, endDate]);

    const newDate = useMemo(() => {
        const base = new Date(baseDate);
        if (isNaN(base.getTime())) return null;

        const years = parseInt(addYears) || 0;
        const months = parseInt(addMonths) || 0;
        const days = parseInt(addDays) || 0;
        
        base.setFullYear(base.getFullYear() + years);
        base.setMonth(base.getMonth() + months);
        base.setDate(base.getDate() + days);

        return base.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, [baseDate, addYears, addMonths, addDays]);

    const DateInput = ({ label, value, setter }: { label: string, value: string, setter: (val: string) => void }) => (
        <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
            <input type="date" value={value} onChange={e => setter(e.target.value)} className="w-full bg-gray-900/70 dark:bg-brand-bg border-brand-border rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary" />
        </div>
    );
    
    const NumberInput = ({ value, setter }: { value: string, setter: (val: string) => void }) => (
        <input type="number" value={value} onChange={e => setter(e.target.value)} className="w-20 bg-gray-900/70 dark:bg-brand-bg border-brand-border rounded-md p-1 text-center" />
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Date Calculator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
                    <h3 className="text-xl font-bold mb-2 text-brand-accent">Duration Between Dates</h3>
                    <DateInput label="Start Date" value={startDate} setter={setStartDate} />
                    <DateInput label="End Date" value={endDate} setter={setEndDate} />
                    {duration ? (
                        <div className="pt-4 border-t border-brand-border">
                            <p className="text-lg">Duration is:</p>
                            <p className="text-2xl font-bold">{duration.years} years, {duration.months} months, {duration.days} days</p>
                            <p className="text-brand-text-secondary">or {duration.totalDays.toLocaleString()} total days.</p>
                            <p className="text-xs text-brand-text-secondary italic mt-2">
                                The duration is calculated by the calendar difference, not by converting total days.
                            </p>
                        </div>
                    ) : (
                        <p className="text-brand-secondary">End date must be after start date.</p>
                    )}
                </div>
                 <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
                    <h3 className="text-xl font-bold mb-2 text-brand-accent">Add or Subtract Time</h3>
                    <DateInput label="Start From" value={baseDate} setter={setBaseDate} />
                    <div className="flex flex-wrap items-center gap-2">
                        <NumberInput value={addYears} setter={setAddYears} /> years,
                        <NumberInput value={addMonths} setter={setAddMonths} /> months,
                        <NumberInput value={addDays} setter={setAddDays} /> days
                    </div>
                     {newDate ? (
                        <div className="pt-4 border-t border-brand-border">
                            <p className="text-lg">Resulting Date:</p>
                            <p className="text-2xl font-bold">{newDate}</p>
                        </div>
                    ) : (
                        <p className="text-brand-secondary">Please enter a valid base date.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateCalculator;