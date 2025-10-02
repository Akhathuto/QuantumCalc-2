import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" title="QuantumCalc Home">
      <div className="relative h-10 w-10">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full"
        >
          {/* Orbits */}
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="25"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            opacity="0.3"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="25"
            ry="45"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            opacity="0.3"
            transform="rotate(60 50 50)"
          />

          {/* Animating Particles */}
          <circle r="4" fill="var(--color-primary)">
            <animateMotion dur="6s" repeatCount="indefinite" path="M 5,50 a 45,25 0 1,0 90,0 a 45,25 0 1,0 -90,0" />
          </circle>
           <circle r="4" fill="var(--color-accent)">
            <animateMotion dur="8s" repeatCount="indefinite">
                <mpath href="#orbit2"/>
            </animateMotion>
          </circle>
          <path id="orbit2" d="M 50,5 A 25,45 60 1,1 50,95 A 25,45 60 1,1 50,5 Z" style={{display:'none'}} />
        </svg>

        {/* BrainCircuit Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative h-full w-full p-1.5 text-brand-primary"
        >
          <path d="M12 2a10 10 0 0 0-4.3 19.42" />
          <path d="M12 2a10 10 0 0 1 4.3 19.42" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
          <path d="M12 6a6 6 0 0 0-6 6" />
          <path d="M16 14a2 2 0 0 0-2-2" />
          <path d="M12 12a4 4 0 0 1 4 4" />
        </svg>
      </div>
      <span className="text-xl font-bold text-brand-text hidden sm:block">QuantumCalc</span>
    </div>
  );
};

export default Logo;
