import React from 'react';
import { 
  Calculator, 
  LineChart, 
  Beaker, 
  Scale, 
  Banknote, 
  Binary, 
  Landmark, 
  Calendar, 
  HeartPulse,
  ArrowRight
} from 'lucide-react';
import { AppTab } from '../types';

interface LandingPageProps {
  onTabClick: (tabId: AppTab) => void;
}

const tools = [
  { id: 'calculator', name: 'Scientific Calculator', icon: Calculator, description: 'Advanced mathematical expressions, functions, and constants.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'graphing', name: 'Graphing', icon: LineChart, description: 'Plot equations, analyze intersections, and visualize data.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'math-tools', name: 'Math Tools', icon: Beaker, description: 'Matrix operations, statistics, and equation solvers.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'programmer', name: 'Programmer', icon: Binary, description: 'Bitwise operations, shifts, and multi-base representations.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'financial', name: 'Financial', icon: Landmark, description: 'Loans, investments, compound interest, and more.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'units', name: 'Unit Converter', icon: Scale, description: 'Convert length, mass, volume, temperature, and more.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'currency', name: 'Currency', icon: Banknote, description: 'Real-time exchange rates and currency conversion.', color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'base', name: 'Base Converter', icon: Binary, description: 'Binary, octal, decimal, and hexadecimal conversions.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'date', name: 'Date & Time', icon: Calendar, description: 'Calculate durations, add/subtract dates, and time zones.', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'health', name: 'Health', icon: HeartPulse, description: 'BMI, BMR, and other health-related calculations.', color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick }) => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-8 border border-brand-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          v2.1 is live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
          QuantumCalc
        </h1>
        <p className="text-xl md:text-2xl text-brand-text-secondary font-light mb-10 leading-relaxed">
          The ultimate all-in-one computational toolkit for students, professionals, and everyday problem solvers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onTabClick('calculator')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105 shadow-lg shadow-brand-primary/20"
          >
            Open Calculator <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => onTabClick('graphing')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-surface hover:bg-brand-surface/80 text-brand-text border border-brand-border px-8 py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105"
          >
            Try Graphing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full animate-fade-in-down" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onTabClick(tool.id as AppTab)}
              className="group flex flex-col items-start text-left p-6 bg-brand-surface rounded-2xl border border-brand-border hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`p-4 rounded-xl ${tool.bg} ${tool.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-brand-text group-hover:text-brand-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-brand-text-secondary leading-relaxed">
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage;
