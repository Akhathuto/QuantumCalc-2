
import { useState, useMemo } from 'react';
import { CalendarDays, PlusSquare } from 'lucide-react';

interface DateInputProps {
    label: string;
    value: string;
    setter: (val: string) => void;
}

const DateInput = ({ label, value, setter }: DateInputProps) => (
    <div>
        <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{label}</label>
        <input type="date" value={value} onChange={e => setter(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-text focus:ring-2 focus:ring-brand-primary transition-all outline-none shadow-inner" />
    </div>
);

interface NumberInputProps {
    value: string;
    setter: (val: string) => void;
}

const NumberInput = ({ value, setter }: NumberInputProps) => (
    <input type="number" value={value} onChange={e => setter(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-center font-mono focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
);

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

    return (
        <div>
          <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-bg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <CalendarDays size={24} />
              </div>
              <div>
                  <h2 className="text-3xl font-black text-brand-text uppercase tracking-widest leading-none">Date Calculator</h2>
                  <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.3em] font-black mt-1">Temporal Duration Analysis</p>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-surface border border-brand-border/50 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <CalendarDays size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                  <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Duration Between Dates</h3>
                  <div className="space-y-4">
                    <DateInput label="Start Date" value={startDate} setter={setStartDate} />
                    <DateInput label="End Date" value={endDate} setter={setEndDate} />
                  {duration ? (
                      <div className="pt-8 border-t border-brand-border/50">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary mt-4 mb-2">Calculated Duration</p>
                          <div className="bg-brand-bg/60 rounded-[1.5rem] p-6 border border-brand-border/50 shadow-inner">
                              <p className="text-3xl font-black font-mono tracking-tighter text-brand-text mb-2">
                                  {duration.years}y {duration.months}m {duration.days}d
                              </p>
                              <p className="text-xs text-brand-text-secondary uppercase tracking-widest font-bold">Total: {duration.totalDays.toLocaleString()} days</p>
                          </div>
                      </div>
                  ) : (
                      <p className="text-red-400 text-sm italic py-4">End date must proceed start date.</p>
                  )}
              </div>
          </div>
          </div>
          
          <div className="bg-brand-surface border border-brand-border/50 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <PlusSquare size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                  <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Add or Subtract Time</h3>
                    <DateInput label="Start From" value={baseDate} setter={setBaseDate} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2 text-center">Yrs</label>
                          <NumberInput value={addYears} setter={setAddYears} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2 text-center">Mos</label>
                          <NumberInput value={addMonths} setter={setAddMonths} />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2 text-center">Dys</label>
                          <NumberInput value={addDays} setter={setAddDays} />
                      </div>
                  </div>
                  {newDate ? (
                      <div className="pt-8 border-t border-brand-border/50">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary mt-4 mb-2">Projected Date</p>
                          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-[1.5rem] p-6 text-center shadow-inner">
                              <p className="text-xl font-black text-brand-primary tracking-tight">
                                  {newDate}
                              </p>
                          </div>
                      </div>
                  ) : (
                      <p className="text-red-400 text-sm italic py-4">Please enter a valid base date.</p>
                  )}
              </div>
          </div>
      </div>
      </div>
    );
};

export default DateCalculator;