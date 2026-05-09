import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" title="QuantumCalc Home">
      <div className="relative h-10 w-10">
        <img src="/icon.svg" alt="QuantumCalc Logo" className="absolute inset-0 h-full w-full object-contain" />
      </div>
      <span className="text-xl font-bold text-brand-text hidden sm:block">QuantumCalc</span>
    </div>
  );
};

export default Logo;
