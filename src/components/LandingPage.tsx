import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  LineChart, 
  Beaker, 
  FlaskConical,
  Scale, 
  Binary, 
  Landmark, 
  HeartPulse,
  Code,
  GraduationCap,
  ArrowRight,
  History,
  Lightbulb,
  Search,
  Type,
  Calendar,
  Coins,
  ArrowRightLeft,
  Printer,
  Award,
  RefreshCw,
  Quote,
  Sparkles,
  Cpu,
  Orbit,
  Brain,
  Infinity as InfinityIcon,
  Heart,
  Volume2,
  Copy,
  Check,
  Trash2,
  Bookmark
} from 'lucide-react';
import { AppTab, HistoryEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { ScholarCounter } from './ScholarCounter';

interface LandingPageProps {
  onTabClick: (tabId: AppTab) => void;
  history: HistoryEntry[];
  onLoginClick: () => void;
}

const toolCategories = [
  {
    name: 'Scientific Calculations',
    tools: [
      { id: 'calculator', name: 'Unified Calculator', desc: 'Powerful multi-modal expression parser & algebra engine.', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'graphing', name: 'Analytical Grapher', desc: 'Plot 2D equations in real-time with custom scale intervals.', icon: LineChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { id: 'math-tools', name: 'Advanced Algebra Suite', desc: 'Solve complex linear matrices, calculus polynomial limits.', icon: Beaker, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'periodic', name: 'Interactive Periodic Table', desc: 'Visualize atomic shells, weights, and isotope values.', icon: FlaskConical, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ]
  },
  {
    name: 'Classrooms, Tutors & Scholars',
    tools: [
      { id: 'k5worksheets', name: 'K-5 Homework Studio', desc: 'Generate seedable high-contrast homework sheets with custom grids, school notes, and separate printed answer sheets.', icon: Printer, color: 'text-pink-500', bg: 'bg-pink-500/10', badge: 'Popular' },
      { id: 'exercises', name: 'Curriculum Drills Arena', desc: 'Topic-by-topic drills, adaptive test sets, score stars & diploma awards.', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10', badge: 'Hot' },
      { id: 'student', name: 'AI Scholar Coach', desc: 'Prompt the custom academic assistant for proof formulas & learning guides.', icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
      { id: 'history', name: 'Formula & Execution Logs', desc: 'Audit and restore previous calculations, export lists, and favorite items.', icon: History, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    ]
  },
  {
    name: 'Everyday & Business Solvers',
    tools: [
      { id: 'financial', name: 'Capital & Mortgage Estimator', desc: 'Amortize mortgages, forecast compound interests & business savings.', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { id: 'units', name: 'Universal Measurement Converter', desc: 'Convert engineering dimensions like Torque, Speed, and Frequency.', icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      { id: 'currency', name: 'Live Currencies Arbitrage', desc: 'Exchange ratios with automatic live global currency tickers.', icon: Coins, color: 'text-green-500', bg: 'bg-green-500/10' },
      { id: 'health', name: 'Thermodynamics & Health', desc: 'Examine BMI index metrics, BMR caloric multipliers and hydration guides.', icon: HeartPulse, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { id: 'date', name: 'Temporal Date Interval Calc', desc: 'Compare exact calendar spans, time durations, and custom business intervals.', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ]
  },
  {
    name: 'Engineering & Bits',
    tools: [
      { id: 'programmer', name: 'Bitwise Programmer Calc', desc: 'Binary, Hex, Octal manipulations with simulated register feeds.', icon: Binary, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { id: 'base', name: 'Radix Conversion Tool', desc: 'Convert variables across numeral bases smoothly ranging from 2 to 64.', icon: ArrowRightLeft, color: 'text-orange-400', bg: 'bg-orange-400/10' },
      { id: 'developer', name: 'Developer Utilities', desc: 'JWT inspectors, secure bcrypt hashes, and JSON syntactic syntax trees.', icon: Code, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      { id: 'text', name: 'Text Analytics Workspace', desc: 'Character metrics, base64 converters, regex trials & markdown.', icon: Type, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    ]
  }
];

const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
}> = ({ children, className = '', onClick }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxRotate = 8; // Gentle tilt angle
    const rX = ((centerY - y) / centerY) * maxRotate;
    const rY = ((x - centerX) / centerX) * maxRotate;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.015 : 1,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className={`${className}`}
    >
      <div style={{ transform: isHovered ? "translateZ(20px)" : "translateZ(0px)", transition: "transform 0.2s ease-out" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

const ScientificSandbox3D: React.FC = () => {
  const [mode, setMode] = useState<'wave' | 'torus' | 'dodecahedron'>('torus');
  const [speed, setSpeed] = useState(1);
  const [energy, setEnergy] = useState(1.4);
  const [rotation, setRotation] = useState({ x: 30, y: 0, z: 20 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      
      const multiplier = speed * (isHovered ? 1.3 : 0.5);
      setRotation(prev => ({
        ...prev,
        y: (prev.y + 16 * delta * multiplier) % 360,
        x: (prev.x + 8 * delta * multiplier) % 360,
        z: (prev.z + 4 * delta * multiplier) % 360
      }));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [speed, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const points: {x: number, y: number, z: number}[] = [];
  const lines: [number, number][] = [];

  if (mode === 'wave') {
    const size = 5;
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        const dist = Math.sqrt(x*x + y*y);
        const z = Math.sin(dist * 0.9 - (performance.now() / 320) * speed) * energy;
        points.push({ x, y, z });
      }
    }
    const side = size * 2 + 1;
    for (let x = 0; x < side; x++) {
      for (let y = 0; y < side; y++) {
        const idx = x * side + y;
        if (y + 1 < side) lines.push([idx, idx + 1]);
        if (x + 1 < side) lines.push([idx, idx + side]);
      }
    }
  } else if (mode === 'torus') {
    const uSteps = 14;
    const vSteps = 10;
    const R = 3.3;
    const r = 1.2 * energy;

    for (let u = 0; u < uSteps; u++) {
      const theta = (u * 2 * Math.PI) / uSteps;
      for (let v = 0; v < vSteps; v++) {
        const phi = (v * 2 * Math.PI) / vSteps;
        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const y = (R + r * Math.cos(phi)) * Math.sin(theta);
        const z = r * Math.sin(phi);
        points.push({ x, y, z });
      }
    }

    for (let u = 0; u < uSteps; u++) {
      for (let v = 0; v < vSteps; v++) {
        const idx1 = u * vSteps + v;
        const idx2 = u * vSteps + ((v + 1) % vSteps);
        const idx3 = ((u + 1) % uSteps) * vSteps + v;
        lines.push([idx1, idx2]);
        lines.push([idx1, idx3]);
      }
    }
  } else if (mode === 'dodecahedron') {
    const phiVal = (1 + Math.sqrt(5)) / 2;
    const a = 1.5;
    const b = 1.5 / phiVal;
    const c = 1.5 * phiVal;

    const baseVertices = [
      {x: -a, y: -a, z: -a}, {x: -a, y: -a, z:  a}, {x: -a, y:  a, z: -a}, {x: -a, y:  a, z:  a},
      {x:  a, y: -a, z: -a}, {x:  a, y: -a, z:  a}, {x:  a, y:  a, z: -a}, {x:  a, y:  a, z:  a},
      {x:  0, y: -b, z: -c}, {x:  0, y: -b, z:  c}, {x:  0, y:  b, z: -c}, {x:  0, y:  b, z:  c},
      {x: -b, y: -c, z:  0}, {x: -b, y:  c, z:  0}, {x:  b, y: -c, z:  0}, {x:  b, y:  c, z:  0},
      {x: -c, y:  0, z: -b}, {x: -c, y:  0, z:  b}, {x:  c, y:  0, z: -b}, {x:  c, y:  0, z:  b}
    ];

    points.push(...baseVertices);

    const dEdges: [number, number][] = [
      [0,8], [0,12], [0,16], [1,9], [1,12], [1,17], [2,10], [2,13], [2,16], [3,11], [3,13], [3,17],
      [4,8], [4,14], [4,18], [5,9], [5,14], [5,19], [6,10], [6,15], [6,18], [7,11], [7,15], [7,19],
      [8,10], [9,11], [12,14], [13,15], [16,17], [18,19]
    ];
    lines.push(...dEdges);
  }

  const rx = ((rotation.x + mousePos.y * 30) * Math.PI) / 180;
  const ry = ((rotation.y + mousePos.x * 60) * Math.PI) / 180;
  const rz = (rotation.z * Math.PI) / 180;

  const width = 280;
  const height = 280;
  const center = { x: width / 2, y: height / 2 };
  const scale = mode === 'wave' ? 17 : 33;

  const projected = points.map(p => {
    const x1 = p.x * Math.cos(rz) - p.y * Math.sin(rz);
    const y1 = p.x * Math.sin(rz) + p.y * Math.cos(rz);
    const z1 = p.z;

    const x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
    const y2 = y1;
    const z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);

    const x3 = x2;
    const y3 = y2 * Math.cos(rx) - z2 * Math.sin(rx);
    const z3 = y2 * Math.sin(rx) + z2 * Math.cos(rx);

    const dist = 12;
    const factor = dist / (dist + z3);
    const px = center.x + x3 * scale * factor;
    const py = center.y + y3 * scale * factor;
    const normDepth = (z3 + 5) / 10;

    return { x: px, y: py, depth: normDepth };
  });

  return (
    <div 
      className="bg-brand-surface/80 border border-brand-border/40 rounded-[2rem] p-5 w-full max-w-[340px] flex flex-col items-center select-none shadow-2xl relative overflow-hidden backdrop-blur-md hover:border-brand-primary/25 transition-colors group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-primary),transparent_60%)] opacity-[0.05] pointer-events-none" />

      <div className="flex bg-brand-bg/85 p-1 border border-brand-border/30 rounded-xl w-full text-xs font-semibold mb-3 tracking-wide z-10 self-stretch relative justify-between font-mono">
        {(['wave', 'torus', 'dodecahedron'] as const).map(t => (
          <button
            key={t}
            onClick={() => setMode(t)}
            className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-widest flex-1 text-center transition-all cursor-pointer ${
              mode === t 
                ? 'bg-brand-primary text-brand-bg shadow-md' 
                : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-primary/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center my-3 bg-brand-bg/50 rounded-2xl border border-brand-border/15 p-2 overflow-hidden w-full h-[220px] shadow-inner" style={{ transform: 'translateZ(20px)' }}>
        <svg width={width} height={height} className="overflow-visible select-none max-w-full max-h-full">
          {lines.map(([i, j], idx) => {
            const p1 = projected[i];
            const p2 = projected[j];
            if (!p1 || !p2) return null;
            
            const avgDepth = (p1.depth + p2.depth) / 2;
            const lineOpacity = Math.max(0.08, Math.min(0.9, avgDepth * 0.75));
            const strokeColor = mode === 'wave' 
              ? 'url(#waveGradient)' 
              : mode === 'torus' 
                ? 'url(#torusGradient)' 
                : 'url(#dodecGradient)';

            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={strokeColor}
                strokeWidth={1.2 + avgDepth * 1.5}
                strokeOpacity={lineOpacity}
              />
            );
          })}

          {projected.map((pt, idx) => {
            const nodeOpacity = Math.max(0.15, Math.min(0.95, pt.depth * 0.95));
            const nodeColor = mode === 'wave' 
              ? '#6366f1' 
              : mode === 'torus' 
                ? '#ec4899' 
                : '#f59e0b';

            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={2 + pt.depth * 2.5}
                fill={nodeColor}
                fillOpacity={nodeOpacity}
              />
            );
          })}

          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="torusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="dodecGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-2.5 left-3.5 font-mono text-[8.5px] text-brand-text-secondary/60 uppercase tracking-widest">
          {mode === 'wave' && `ψ(x,y,t) wave mesh: 11x11`}
          {mode === 'torus' && `toroidal geometry: (14,10)`}
          {mode === 'dodecahedron' && `3D Dodecahedron Edge Matrix`}
        </div>
      </div>

      <div className="w-full space-y-1.5 mt-2 z-10 self-stretch px-1" style={{ transform: 'translateZ(10px)' }}>
        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-brand-text-secondary/70 tracking-wider">
          <span>VELOCITY: {speed.toFixed(1)}x</span>
          <span>AMPLITUDE: {energy.toFixed(1)}</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex items-center">
            <input 
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="accent-brand-primary h-1 rounded-full w-full cursor-pointer bg-brand-border/40"
              title="Rotation speed"
            />
          </div>
          <div className="flex-1 flex items-center">
            <input 
              type="range" 
              min="0.5" 
              max="2.2" 
              step="0.1"
              value={energy}
              onChange={(e) => setEnergy(parseFloat(e.target.value))}
              className="accent-brand-secondary h-1 rounded-full w-full cursor-pointer bg-brand-border/40"
              title="Geometric Energy factor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CuratedFact {
  text: string;
  category: 'math' | 'physics' | 'computing' | 'space' | 'brain';
  badge: string; 
}
const INSIGHT_FACTS: CuratedFact[] = [
  // --- MATHEMATICS ---
  {
    category: 'math',
    badge: 'Exponential Scaling',
    text: 'If you fold a standard piece of printer paper exactly 42 times, the accumulated thickness would reach the moon. Fold it 103 times, and it would exceed the diameter of the observable universe.'
  },
  {
    category: 'math',
    badge: 'Number Theory',
    text: 'A "googolplex" is 1 followed by a googol of zeros. It is so mathematically vast that there is not enough space nor atoms in the observable universe to write the digits down in full.'
  },
  {
    category: 'math',
    badge: 'Geometry',
    text: 'A perfect circle is mathematically composed of an infinite number of infinitely small straight lines, beautifully resolving the dimensional relationship between curved and linear space.'
  },
  {
    category: 'math',
    badge: 'Golden Spiral',
    text: 'The Fibonacci sequence is so deeply engrained in nature that the number of spirals in a pinecone, sunflower, or pineapple almost always corresponds to a Fibonacci number.'
  },
  {
    category: 'math',
    badge: 'Probability Theory',
    text: 'In a room of just 23 completely random people, there is a 50.7% mathematical probability that at least two of them share the exact same calendar birthday.'
  },
  {
    category: 'math',
    badge: 'Mathematical Symbols',
    text: 'The symbol for division (÷) is officially known as an "obelus", while the symbol for infinity (∞) is known as a "lemniscate".'
  },
  {
    category: 'math',
    badge: 'Prime Distribution',
    text: 'The prime number theorem reveals that primes grow less frequent as numbers get larger, yet they remain infinitely distributed, forming the fundamental building blocks of all integers.'
  },
  {
    category: 'math',
    badge: 'Sheldon Prime',
    text: 'The number 73 is the 21st prime number. Its mirror, 37, is the 12th prime number, whose mirror 21 is the result of multiplying 7 and 3, which is also binary 1001001—a palindrome.'
  },
  {
    category: 'math',
    badge: 'Infinity Sizes',
    text: 'There are different sizes of infinity - for example, the infinity of real decimal numbers is strictly larger than the infinity of counting integers, as proven by Cantor\'s diagonal argument.'
  },
  {
    category: 'math',
    badge: 'Perfect Numbers',
    text: 'A perfect number equals the sum of its proper divisors. The first is 6 (1+2+3), followed by 28 (1+2+4+7+14), preserving a rare and beautiful arithmetic balance.'
  },
  {
    category: 'math',
    badge: 'Pi Randomness',
    text: 'The digits of Pi are completely normal, containing every single phone number, birthday, and even the complete binary code of all books ever written.'
  },
  {
    category: 'math',
    badge: 'Monty Hall Paradox',
    text: 'In the famous Monty Hall problem, if you are shown three doors with a prize behind one and you switch doors after one empty door is revealed, your mathematical odds of winning double from one-third to two-thirds.'
  },
  {
    category: 'math',
    badge: 'Billion Counter',
    text: 'If you were to count out loud non-stop at a steady rate of one number per second, it would take you approximately 31.7 years to reach the number one billion.'
  },
  {
    category: 'math',
    badge: 'Zero Division',
    text: 'The concept of zero took thousands of years to accept, and dividing any number by zero remains completely undefined because it breaks the fundamental arithmetic laws.'
  },
  {
    category: 'math',
    badge: 'Googol Origin',
    text: 'The term googol was coined in 1938 by a nine-year-old boy named Milton Sirotta, who was the nephew of American mathematician Edward Kasner.'
  },
  {
    category: 'math',
    badge: 'Six Degrees',
    text: 'Any two people on Earth can be connected through an average of just six acquaintances, a mathematical concept known as the six degrees of separation web.'
  },
  // --- PHYSICS ---
  {
    category: 'physics',
    badge: 'Relativity',
    text: 'Due to gravitational time dilation, time passes marginally faster at the summit of mountains than at sea level. This means your head is technically older than your feet.'
  },
  {
    category: 'physics',
    badge: 'Cosmology',
    text: 'Every single hydrogen atom currently in your organic cells was synthesized in the intense core furnace of the Big Bang, approximately 13.8 billion years ago.'
  },
  {
    category: 'physics',
    badge: 'Quantum Densities',
    text: 'Neutron stars are so incredibly dense that a single teaspoon of their material would weigh about 6 billion tons on Earth—approximately equal to the weight of all humanity.'
  },
  {
    category: 'physics',
    badge: 'Cosmic Limit',
    text: 'The speed of light traveling in a vacuum is exactly 299,792,458 meters per second. This is an absolute cosmic speed limit - nothing with mass can ever match or exceed it.'
  },
  {
    category: 'physics',
    badge: 'Atomic Space',
    text: 'If we removed all the empty acoustic space from the individual atoms making up the entire human race, all 8 billion people would fit inside the volume of a single sugar cube.'
  },
  {
    category: 'physics',
    badge: 'Quantum Duality',
    text: 'Light behaves simultaneously as both a packet of energy (photon) and a continuous wave, a quantum duality famously illustrated by the double-slit experiment.'
  },
  {
    category: 'physics',
    badge: 'Acoustic Vacuum',
    text: 'The universe is completely silent because sound requires a physical medium like air or water to propagate, while light and radio waves can travel freely through empty space.'
  },
  {
    category: 'physics',
    badge: 'Spacetime Warp',
    text: 'Black holes can slow time down to an absolute standstill for an outside observer because of their extreme, infinite gravitational warping of the spacetime continuum.'
  },
  {
    category: 'physics',
    badge: 'Glass Flow Myth',
    text: 'Contrary to popular belief, antique cathedral glass is not thicker at the bottom because glass flows like a slow liquid - it is simply due to the uneven medieval crown glass manufacturing process.'
  },
  {
    category: 'physics',
    badge: 'Time in Orbit',
    text: 'Astronauts on the International Space Station age slightly slower than people on Earth because they are moving at 27,600 km/h, experiencing time dilation.'
  },
  {
    category: 'physics',
    badge: 'Magnetic Pillars',
    text: 'Earth\'s magnetic poles are not static, constantly migrating at about 55 kilometers per year, and they completely reverse polarities every few hundred thousand years.'
  },
  {
    category: 'physics',
    badge: 'Banana Radiation',
    text: 'Bananas contain naturally occurring potassium isotopes, making them slightly radioactive, though you would need to eat roughly ten million bananas at once to suffer severe radiation poisoning.'
  },
  {
    category: 'physics',
    badge: 'Cosmic Microwave',
    text: 'The static hiss you hear when tuning an old analog television or radio to empty frequencies is partially caused by the lingering echo of the Big Bang cosmic microwave background radiation.'
  },
  {
    category: 'physics',
    badge: 'Lightning Power',
    text: 'A single bolt of lightning contains enough electrical energy to power an average home for up to three full months, or toast over one hundred thousand slices of bread.'
  },
  {
    category: 'physics',
    badge: 'Sound of Speed',
    text: 'Sound travels about four times faster in water than it does in air, and up to fifteen times faster through solid steel, as atoms propagate kinetic energy quicker when closely bonded.'
  },
  {
    category: 'physics',
    badge: 'Outer Space Drive',
    text: 'If you could drive your car straight upward at eighty kilometers per hour, you would reach the physical boundary of outer space in just over one single hour.'
  },
  // --- COMPUTING ---
  {
    category: 'computing',
    badge: 'Computer History',
    text: 'The first actual computer "bug" was a real moth found trapped inside a hardware relay of the Harvard Mark II computer by legendary mathematician Grace Hopper in 1947.'
  },
  {
    category: 'computing',
    badge: 'Digital Commerce',
    text: 'Approximately 92% of the money on Earth exists purely in digital databases on computer server arrays. Only around 8% of all global currency exists as physical paper notes or mint coins.'
  },
  {
    category: 'computing',
    badge: 'Nanotech Limits',
    text: 'Modern silicon microchip transistors are under 3 nanometers wide. This is smaller than a single strand of human DNA, operating close to active physical quantum limits.'
  },
  {
    category: 'computing',
    badge: 'Neural Bandwidth',
    text: 'If our human brain were a digital hard drive, its total storage capacity would be approximately 2.5 petabytes, which is equivalent to about 3 million hours of high-definition video.'
  },
  {
    category: 'computing',
    badge: 'Turing Filters',
    text: 'The CAPTCHA acronym actually stands for "Completely Automated Public Turing test to tell Computers and Humans Apart", acting as an everyday filter for machine intelligence.'
  },
  {
    category: 'computing',
    badge: 'The Halting Problem',
    text: 'In 1936, visionary mathematician Alan Turing proved that it is mathematically impossible for a computer program to perfectly predict whether another program will run forever or finish.'
  },
  {
    category: 'computing',
    badge: 'Pioneering Hardware',
    text: 'The first electronic desktop computer, the ENIAC, occupied an entire 1,800 square foot room, weighed over 30 tons, and consumed 150 kilowatts of absolute electrical power.'
  },
  {
    category: 'computing',
    badge: 'Superposition',
    text: 'Quantum computers use qubits instead of traditional binary bits, allowing them to exist in states of 0, 1, or both simultaneously to solve specific complex algorithms instantly.'
  },
  {
    category: 'computing',
    badge: 'First Programmer',
    text: 'The world\'s first computer programmer was Ada Lovelace, an English mathematician who wrote an algorithm for Charles Babbage\'s mechanical Analytical Engine in 1843.'
  },
  {
    category: 'computing',
    badge: 'Spam Mail Origin',
    text: 'The term "spam" for junk email was inspired by a 1970 Monty Python comedy sketch where characters repetitively shout the word "Spam" to drown out all other conversations.'
  },
  {
    category: 'computing',
    badge: 'The Millionth Pixel',
    text: 'In 2005, a student created "The Million Dollar Homepage", selling 1 million pixels of web space for 1 dollar each to advertisers, earning exactly 1 million dollars in months.'
  },
  {
    category: 'computing',
    badge: 'First Video Game',
    text: 'The first recognized digital computer video game, called Spacewar, was created in 1962 by a team of researchers at MIT using a system with only 9 kilobytes of operational computer memory.'
  },
  {
    category: 'computing',
    badge: 'Password Physics',
    text: 'A standard twelve-character password with mixed uppercase letters, numbers, and special symbols takes a modern high-performance desktop computer about 226 years to crack using brute-force methods.'
  },
  {
    category: 'computing',
    badge: 'Wooden Mouse',
    text: 'The first mechanical computer mouse invented by Douglas Engelbart in 1964 was carved out of a single block of wood and used two metallic wheels to track coordinate positions.'
  },
  {
    category: 'computing',
    badge: 'Bot Traffic',
    text: 'Over fifty percent of all daily internet traffic is generated by automated bots, software scripts, and security scanners rather than real human browsing sessions.'
  },
  {
    category: 'computing',
    badge: 'Apollo Memory',
    text: 'The Guidance Computer that navigated Apollo 11 to the moon in 1969 possessed only sixty-four kilobytes of memory, which is vastly weaker than the microchip in a modern electronic car key.'
  },
  // --- SPACE ---
  {
    category: 'space',
    badge: 'Planetary Dynamics',
    text: 'One single natural day on the planet Venus is longer than its entire orbital year - it takes Venus 243 Earth days to complete a rotation but only 225 Earth days to orbit the sun.'
  },
  {
    category: 'space',
    badge: 'Cosmic Scales',
    text: 'There are approximately 3 trillion trees on Earth, which vastly exceeds the estimated 100 to 400 billion stars present in our entire home Milky Way galaxy.'
  },
  {
    category: 'space',
    badge: 'Solar Mass',
    text: 'Our Sun is so incredibly massive that it accounts for exactly 99.86% of the total matter in the entire Solar System, with planets occupying only the remaining 0.14%.'
  },
  {
    category: 'space',
    badge: 'Solar Transit',
    text: 'Light from the Sun takes approximately 8 minutes and 20 seconds to travel across the vast celestial vacuum of space before finally reaching the surface of Earth.'
  },
  {
    category: 'space',
    badge: 'Exo-Geology',
    text: 'The largest known volcano in the solar system is Olympus Mons on Mars. It stands 21 kilometers high, which is more than twice the height of Mount Everest.'
  },
  {
    category: 'space',
    badge: 'Thermal Runaway',
    text: 'Venus is the hottest planet in our solar system, with a surface temperature reaching over 460 degrees Celsius—hot enough to melt lead—due to a dense runaway greenhouse atmosphere.'
  },
  {
    category: 'space',
    badge: 'Exploration Gear',
    text: 'An astronaut\'s spacesuit costs approximately 12 million dollars to create, with 70% of that total cost dedicated entirely to the complex life-support systems and electronics.'
  },
  {
    category: 'space',
    badge: 'Lunar Preservation',
    text: 'The footprint impressions left behind by Apollo astronauts on the Moon will likely persist for over 100 million years because there is no wind, water, or active atmospheric erosion.'
  },
  {
    category: 'space',
    badge: 'Extreme Gravity',
    text: 'If you fell into a stellar-mass black hole, your body would undergo "spaghettification", getting stretched into a long, thin string due to extreme tidal gravity variations.'
  },
  {
    category: 'space',
    badge: 'Silent Collision',
    text: 'In about 4.5 billion years, our Milky Way galaxy will collide with the Andromeda galaxy, but because space is so vast, almost no stars will actually hit each other.'
  },
  {
    category: 'space',
    badge: 'Diamond Rain',
    text: 'Deep inside the intense atmospheric pressures of Jupiter and Saturn, it literally rains diamonds composed of highly compressed carbon soot.'
  },
  {
    category: 'space',
    badge: 'Cold Welding',
    text: 'If two clean pieces of identical metal touch each other in the vacuum of outer space, they will instantly fuse and lock together in a physical phenomenon known as cold welding.'
  },
  {
    category: 'space',
    badge: 'Cosmic Water',
    text: 'Astronomers have discovered a giant floating reservoir of water vapor in deep space that holds over 140 trillion times the total volume of all liquid water in Earth\'s oceans combined.'
  },
  {
    category: 'space',
    badge: 'Space Silence',
    text: 'Because there is no sound medium in outer space, the violent explosion of a giant stellar supernova or collision of two massive stars occurs in absolute, eerie silence.'
  },
  {
    category: 'space',
    badge: 'Pluto Orbit Year',
    text: 'One single year on Pluto is equivalent to 248 Earth years, which means Pluto has still not completed one full orbit around our Sun since its original discovery in 1930.'
  },
  {
    category: 'space',
    badge: 'Scent of Space',
    text: 'Astronauts report that open space smells like seared steak, hot welding fumes, and ozone molecules clinging to their spacesuits after returning from a spacewalk.'
  },
  // --- BRAIN & PRODUCTIVITY ---
  {
    category: 'brain',
    badge: 'Neurology',
    text: 'The human brain consumes about 20% of your body\'s total resting energy and oxygen intake, despite constituting only 2% of your average overall physical body weight.'
  },
  {
    category: 'brain',
    badge: 'Psychology',
    text: 'The "Zeigarnik Effect" reveals that human working memory holds onto incomplete or interrupted tasks with significantly greater clarity than completed ones.'
  },
  {
    category: 'brain',
    badge: 'Cognition',
    text: 'Walking outside in a natural environment for just 10 minutes increases dynamic creative brainstorming by nearly 60%, compared to thinking in static indoor offices.'
  },
  {
    category: 'brain',
    badge: 'Cognitive Load',
    text: 'Our short-term working memory is naturally optimized to store approximately 4 to 7 individual items or informational chunks at any single moment.'
  },
  {
    category: 'brain',
    badge: 'Prefrontal Limits',
    text: 'The brain cannot actually multitask - instead, it performs rapid "task-switching", which consumes significant energy and reduces cognitive performance by up to 40%.'
  },
  {
    category: 'brain',
    badge: 'Neuroplasticity',
    text: 'Deep learning and physical skill retention occur predominantly during the rapid eye movement (REM) and deep stages of night sleep, reinforcing neural connections.'
  },
  {
    category: 'brain',
    badge: 'Tactile Memory',
    text: 'Writing your notes, plans, and equations down by hand on physical paper triggers vastly superior conceptual neural processing and long-term encoding than typing on a keyboard.'
  },
  {
    category: 'brain',
    badge: 'Attention Spans',
    text: 'Taking brief, scheduled, structured breaks—often known as the Pomodoro technique—preserves stamina, sharpens focal clarity, and staves off cognitive exhaustion.'
  },
  {
    category: 'brain',
    badge: 'Feynman Trick',
    text: 'The Feynman Technique suggests that to truly master any complex scientific concept, you must attempt to explain it simply to an eight-year-old child.'
  },
  {
    category: 'brain',
    badge: 'Memory Palace',
    text: 'The "Method of Loci" or Memory Palace dates back to ancient Greece, allowing you to memorize lists by mentally placing items in familiar physical settings.'
  },
  {
    category: 'brain',
    badge: 'Dopamine Loop',
    text: 'Social media notifications trigger a short burst of dopamine, creating a seeking loop that makes your brain anticipate novelty rather than focus on long-term goals.'
  },
  {
    category: 'brain',
    badge: 'Brain Powerhouse',
    text: 'An active fully functioning human brain generates about 20 watts of electrical energy, which is enough electrical power to run a low-wattage LED light bulb.'
  },
  {
    category: 'brain',
    badge: 'Sleep Cleaning',
    text: 'During sleep, your brain cells literally shrink by about 60% to allow cerebrospinal fluid to wash through and clear out toxic cognitive waste products accumulated during the day.'
  },
  {
    category: 'brain',
    badge: 'Brain Painless',
    text: 'The actual brain tissue contains zero physical pain receptors, allowing surgeons to perform delicate brain surgeries while the patient remains conscious and talking.'
  },
  {
    category: 'brain',
    badge: 'Language Buffer',
    text: 'Learning and actively speaking two or more languages acts as a powerful cognitive buffer, delay-alerting age-related dementia symptoms by up to five full years.'
  },
  {
    category: 'brain',
    badge: 'Fake Smile Effect',
    text: 'The simple physical act of holding a smile, even when entirely forced, triggers immediate chemical releases that reduce heart rates and tell the brain to feel happier.'
  }
];

const CATEGORY_ITEMS = [
  { id: 'math', icon: InfinityIcon, label: 'Math' },
  { id: 'physics', icon: Orbit, label: 'Physics' },
  { id: 'computing', icon: Cpu, label: 'Computing' },
  { id: 'space', icon: Sparkles, label: 'Space' },
  { id: 'brain', icon: Brain, label: 'Brain' }
] as const;

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick, onLoginClick }) => {
  const { user, userData, totalScholars } = useAuth();
  
  // High fidelity states
  const [selectedCategory, setSelectedCategory] = useState<'math' | 'physics' | 'computing' | 'space' | 'brain'>('math');
  const [mathFact, setMathFact] = useState<string>('If you fold a standard piece of printer paper exactly 42 times, the accumulated thickness would reach the moon. Fold it 103 times, and it would exceed the diameter of the observable universe.');
  const [factSource, setFactSource] = useState<'curated' | 'ai'>('curated');
  const [factBadge, setFactBadge] = useState<string>('Exponential Scaling');
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track viewed facts globally to keep selections overlaps-free and fresh
  const [viewedFacts, setViewedFacts] = useState<string[]>([
    'If you fold a standard piece of printer paper exactly 42 times, the accumulated thickness would reach the moon. Fold it 103 times, and it would exceed the diameter of the observable universe.'
  ]);

  // Premium Insight state enhancements
  const [favoritedFacts, setFavoritedFacts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('quantumcalc_fav_facts') || '[]');
    } catch {
      return [];
    }
  });
  const [activeInsightView, setActiveInsightView] = useState<'discover' | 'saved'>('discover');
  const [hasCopied, setHasCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    localStorage.setItem('quantumcalc_fav_facts', JSON.stringify(favoritedFacts));
  }, [favoritedFacts]);

  // Track the history of audio playback
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isFactFavorited = (text: string) => favoritedFacts.includes(text);

  const toggleFavoriteFact = (text: string) => {
    setFavoritedFacts(prev => {
      if (prev.includes(text)) {
        return prev.filter(t => t !== text);
      } else {
        return [...prev, text];
      }
    });
  };

  const handleCopyFact = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSpeakFact = (text: string) => {
    if (!window.speechSynthesis) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };
    
    // Choose a nice high-quality native voice if possible
    try {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-') && !v.name.includes('Google'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    } catch (e) {
      // ignore
    }
    
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const getGreeting = () => {
    if (!userData?.role) return `Hello, ${user?.displayName?.split(' ')[0] || 'Explorer'}.`;
    
    const name = user?.displayName?.split(' ')[0] || 'User';
    switch (userData.role) {
      case 'student': return `Ready to learn, ${name}?`;
      case 'teacher': return `Class is in session, ${name}.`;
      case 'business_owner': return `Strategy time, ${name}.`;
      case 'employee': return `Getting it done, ${name}.`;
      default: return `Welcome back, ${name}.`;
    }
  };

  const filteredCategories = toolCategories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.tools.length > 0);

  const getRandomCuratedFact = (cat: typeof selectedCategory, currentViewed: string[] = []) => {
    const filtered = INSIGHT_FACTS.filter(f => f.category === cat && !currentViewed.includes(f.text));
    const pool = filtered.length > 0 ? filtered : INSIGHT_FACTS.filter(f => f.category === cat);
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const handleCategoryChange = (catId: typeof selectedCategory) => {
    setSelectedCategory(catId);
    const localFact = getRandomCuratedFact(catId, viewedFacts);
    setMathFact(localFact.text);
    setFactSource('curated');
    setFactBadge(localFact.badge);
    setViewedFacts(prev => {
      const nextViewed = [...prev.filter(t => t !== localFact.text), localFact.text];
      // Reset history if capacity reaches max curated facts inside this category
      const catFactsCount = INSIGHT_FACTS.filter(f => f.category === catId).length;
      if (nextViewed.filter(t => INSIGHT_FACTS.some(f => f.category === catId && f.text === t)).length >= catFactsCount) {
        return nextViewed.filter(t => !INSIGHT_FACTS.some(f => f.category === catId && f.text === t)).concat(localFact.text);
      }
      return nextViewed;
    });
  };

  const handleNextCurated = () => {
    const localFact = getRandomCuratedFact(selectedCategory, viewedFacts);
    setMathFact(localFact.text);
    setFactSource('curated');
    setFactBadge(localFact.badge);
    setViewedFacts(prev => {
      const nextViewed = [...prev, localFact.text];
      const catFactsCount = INSIGHT_FACTS.filter(f => f.category === selectedCategory).length;
      if (nextViewed.filter(t => INSIGHT_FACTS.some(f => f.category === selectedCategory && f.text === t)).length >= catFactsCount) {
        return nextViewed.filter(t => !INSIGHT_FACTS.some(f => f.category === selectedCategory && f.text === t)).concat(localFact.text);
      }
      return nextViewed;
    });
  };

  const fetchFact = async (categoryOverride?: typeof selectedCategory) => {
    setIsLoadingFact(true);
    const cat = categoryOverride || selectedCategory;
    const catLabel = cat === 'math' ? 'mathematics or algebra' :
                     cat === 'physics' ? 'quantum physics or relativity' :
                     cat === 'computing' ? 'computer science or computation' :
                     cat === 'space' ? 'astronomy or galaxy science' :
                     'cognitive brain science, human neuro-system or productivity hacks';
    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Provide a single-sentence mind-blowing, fun and surprising fact about ${catLabel}. Keep it highly educational, engaging, and concise. Do not use quotes around the output. Avoid conversational introductions or generic phrasing. Length limit: under 200 characters. Absolutely do not include any semicolons in the sentence.`,
      });
      const text = response.text?.replace(/^"|"$/g, '').trim();
      if (text) {
        setMathFact(text);
        setFactSource('ai');
        setFactBadge('AI Streamed');
      } else {
        throw new Error('Empty response');
      }
    } catch (error) {
      // fallback to curated fact
      const localFact = getRandomCuratedFact(cat, viewedFacts);
      setMathFact(localFact.text);
      setFactSource('curated');
      setFactBadge(localFact.badge);
    } finally {
      setIsLoadingFact(false);
    }
  };

  useEffect(() => {
    // Initial fetch is skipped because we pre-populated mathematical curated state, preventing layouts jumps on mount!
  }, []);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 16 }
    }
  };

  const floatingEquations = [
    { text: "e^{iπ} + 1 = 0", top: "12%", left: "5%", rotate: -8, size: "text-[12px] sm:text-[14px]" },
    { text: "E = mc²", top: "22%", right: "8%", rotate: 12, size: "text-[13px] sm:text-[15px]" },
    { text: "∫ e^x dx = e^x", top: "42%", left: "4%", rotate: -15, size: "text-[11px] sm:text-[13px]" },
    { text: "∇ × B = μ₀J", top: "68%", right: "6%", rotate: 18, size: "text-[12px] sm:text-[14px]" },
    { text: "∑ n⁻² = π²/6", top: "84%", left: "7%", rotate: 6, size: "text-[11px] sm:text-[13px]" },
    { text: "iℏ ∂/∂t |Ψ⟩ = H |Ψ⟩", top: "18%", right: "4%", rotate: -6, size: "text-[12px] sm:text-[14px]" },
    { text: "G_μν = 8πG/c⁴ T_μν", top: "58%", left: "8%", rotate: 5, size: "text-[11px] sm:text-[13px]" },
    { text: "f'(x) = dy/dx", top: "48%", right: "12%", rotate: -4, size: "text-[12px] sm:text-[14px]" },
    { text: "pV = nRT", top: "76%", left: "14%", rotate: 10, size: "text-[12px] sm:text-[14px]" },
  ];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Background Constellation & Grid Overlay inside standard body limits */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden h-full w-full z-0">
        {floatingEquations.map((eq, index) => (
          <motion.div
            key={index}
            className={`absolute hidden lg:block opacity-15 font-mono ${eq.size} text-brand-primary pointer-events-none select-none transition-all duration-300`}
            style={{
              top: eq.top,
              left: eq.left,
              right: eq.right,
            }}
            animate={{
              y: [0, -18, 0],
              rotate: [eq.rotate, eq.rotate + 4, eq.rotate - 4, eq.rotate],
            }}
            transition={{
              duration: 9 + (index % 3) * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
          >
            {eq.text}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[40px] px-6 py-12 md:px-12 md:py-16 bg-gradient-to-b from-brand-surface/30 to-transparent border border-brand-border/15 backdrop-blur-[1px]">
          {/* Subtle grid and radial highlighting backplates */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,var(--color-primary),transparent_45%)] opacity-[0.06] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-[0.08] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left side: Heading content */}
            <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6">
              
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10.5px] font-bold uppercase tracking-[0.25em] shadow-sm border border-brand-primary/15 relative z-10"
              >
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                </span>
                <GraduationCap size={13} className="animate-pulse" /> QuantumCalc Workspace
              </motion.div>

              <div className="flex justify-center mb-1 relative z-10">
                <ScholarCounter />
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[76px] font-bold tracking-[-0.03em] text-brand-text leading-[1.05] font-serif"
              >
                Solve problems <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary via-[#a855f7] to-brand-secondary inline-block py-2">
                  step-by-step.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-brand-text-secondary text-base sm:text-lg md:text-xl font-light leading-relaxed relative z-10 font-sans mt-2"
              >
                {getGreeting()} <br />
                Your unified workspace for mathematics, science, and development.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="relative w-full max-w-lg flex flex-col items-center lg:items-start gap-5 pt-2"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
                  <button
                    onClick={() => onTabClick('calculator')}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-3.5 bg-brand-primary text-brand-bg rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-brand-primary/25 outline-none focus:ring-4 focus:ring-brand-primary/40 cursor-pointer"
                  >
                    Start Calculating <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => onTabClick('exercises')}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-3.5 bg-brand-surface border border-brand-border text-brand-text rounded-full font-bold text-sm hover:bg-brand-primary/5 active:scale-95 transition-all shadow-md outline-none focus:ring-4 focus:ring-brand-border cursor-pointer animate-fade-in"
                  >
                    Practice Drills
                  </button>
                </div>
                
                <div className="relative w-full max-w-md group mt-1">
                  <div className="absolute inset-0 bg-brand-primary/25 blur-xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
                  <motion.div 
                    animate={{ scale: isSearchFocused ? 1.02 : 1 }}
                    className={`relative flex items-center bg-brand-surface border rounded-full p-2 transition-all duration-300 shadow-xl ${
                      isSearchFocused 
                        ? 'border-brand-primary ring-2 ring-brand-primary/15' 
                        : 'border-brand-border/60 hover:border-brand-border'
                    }`}
                  >
                    <Search size={16} className={`ml-3 transition-colors duration-200 ${isSearchFocused ? 'text-brand-primary' : 'text-brand-text-secondary/60'}`} />
                    <input 
                      type="text" 
                      placeholder="Search workspaces... (Ctrl+K)"
                      value={searchQuery}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-[12.5px] w-full py-1.5 px-3.5 text-brand-text placeholder-brand-text-secondary/40 font-medium"
                    />
                    <span className="hidden sm:inline-block px-2.5 py-1 text-[9px] font-mono text-brand-text-secondary/55 bg-brand-bg border border-brand-border/30 rounded-full shrink-0 mr-1.5 uppercase font-bold tracking-wider">
                      Ctrl K
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right side: Magical 3D Projection Sandbox */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <ScientificSandbox3D />
            </div>
          </div>
        </section>

        {/* Dynamic Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20"
        >
          {/* Main AI Teaser */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8"
          >
            <TiltCard
              onClick={() => onTabClick('student')}
              className="h-full w-full bg-gradient-to-br from-brand-surface via-brand-surface to-brand-bg rounded-[32px] p-8 md:p-12 border border-brand-border/45 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-brand-primary/15 transition-colors duration-700 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest w-max mb-6 border border-brand-primary/10">
                  <GraduationCap size={14} className="animate-pulse" /> AI Problem Solver
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-brand-text mb-4 tracking-tight leading-[1.1]">
                  {userData?.school ? `Solve anything at ${userData.school}.` : 'Access the AI Math Workspace.'}
                </h2>
                <p className="text-brand-text-secondary text-lg md:text-xl max-w-lg mb-8 leading-relaxed font-light">
                  {userData?.grade ? `Optimized for ${userData.grade}. ` : ''}Type equations, ask structural queries, and let the QuantumCalc Intelligence Engine guide you step-by-step.
                </p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClick('student');
                    }}
                    className="bg-brand-text text-brand-bg px-8 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 outline-none focus:ring-2 focus:ring-brand-primary shadow-lg shadow-brand-text/10 cursor-pointer"
                  >
                    Open Workspace <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              {/* Elegant glass shimmer overlay on card */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-gradient transition-all duration-1000 pointer-events-none" />
            </TiltCard>
          </motion.div>

          {/* Fact of the day */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4"
          >
            <TiltCard
              className="h-full w-full bg-gradient-to-br from-brand-secondary/10 via-brand-surface to-brand-surface rounded-[32px] p-8 border border-brand-secondary/20 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-brand-secondary/10 transition-all duration-500"
            >
              <div 
                className="absolute -top-6 -right-6 text-brand-secondary rotate-12 pointer-events-none transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110"
                style={{ opacity: 0.035 }}
              >
                <Quote size={130} />
              </div>

              <div className="flex flex-col gap-4 mb-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-secondary">
                    <div className="p-2 bg-brand-secondary/10 rounded-full text-brand-secondary">
                      <Lightbulb size={20} />
                    </div>
                    <h3 className="font-bold text-xs tracking-widest uppercase text-brand-text/90">Insight Core</h3>
                  </div>
                  
                  {/* Topic Indicator */}
                  {activeInsightView === 'discover' && (
                    <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all duration-300 ${
                      factSource === 'ai' 
                        ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20' 
                        : 'bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/20'
                    }`}>
                      {factBadge}
                    </span>
                  )}
                </div>

                {/* Sub-Tabs: Discover vs Saved */}
                <div className="grid grid-cols-2 p-1 bg-brand-secondary/5 border border-brand-secondary/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setActiveInsightView('discover')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 outline-none cursor-pointer ${
                      activeInsightView === 'discover'
                        ? 'bg-brand-surface border border-brand-secondary/10 text-brand-secondary shadow-sm'
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    <Sparkles size={11.5} />
                    <span>Discover</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInsightView('saved')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 outline-none cursor-pointer ${
                      activeInsightView === 'saved'
                        ? 'bg-brand-surface border border-brand-secondary/10 text-rose-500 shadow-sm'
                        : 'text-brand-text-secondary hover:text-rose-400'
                    }`}
                  >
                    <Heart size={11.5} fill={favoritedFacts.length > 0 ? "currentColor" : "none"} className={favoritedFacts.length > 0 ? "text-rose-500" : ""} />
                    <span>Saved ({favoritedFacts.length})</span>
                  </button>
                </div>
              </div>

              {activeInsightView === 'discover' ? (
                <>
                  {/* Category selector tabs */}
                  <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar relative z-10 py-1 border-b border-brand-secondary/10 pb-3">
                    {CATEGORY_ITEMS.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all duration-300 whitespace-nowrap outline-none ${
                            isSelected 
                              ? 'bg-brand-secondary text-brand-bg shadow-md shadow-brand-secondary/20 scale-102' 
                              : 'bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-text-secondary hover:text-brand-text'
                          }`}
                        >
                          <Icon size={11} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Dynamic Fact viewbox */}
                  <div className="flex-grow flex flex-col justify-center relative z-10 my-2 min-h-[140px]">
                    <AnimatePresence mode="wait">
                      {isLoadingFact ? (
                        <motion.div key="loader" className="space-y-4 w-full">
                          <div className="h-4 bg-brand-secondary/20 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-brand-secondary/20 rounded-full w-5/6 animate-pulse" />
                          <div className="h-4 bg-brand-secondary/20 rounded-full w-4/6 animate-pulse" />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key={mathFact}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25 }}
                          className="relative pl-5 border-l-[3px] border-brand-secondary/40 py-1.5 flex flex-col justify-between h-full"
                        >
                          <div>
                            <p className="text-brand-text text-[15px] sm:text-base leading-relaxed font-serif font-medium text-left">
                              "{mathFact}"
                            </p>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-wider font-mono text-brand-text-secondary/40 font-bold">Source:</span>
                                <span className="text-[9px] uppercase tracking-wider font-mono font-extrabold text-brand-text-secondary/70">
                                  {factSource === 'ai' ? 'Gemini 3.5 AI Model' : 'QuantumCurator Engine'}
                                </span>
                              </div>

                              {/* Interactive utilities */}
                              <div className="flex items-center gap-1.5 shrink-0 z-20">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFavoriteFact(mathFact); }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                    isFactFavorited(mathFact) 
                                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                                      : 'bg-brand-secondary/5 border-brand-secondary/15 text-brand-text-secondary hover:text-brand-text hover:bg-brand-secondary/10'
                                  }`}
                                  title={isFactFavorited(mathFact) ? "Remove from Saved" : "Save Fact"}
                                >
                                  <Heart size={12} fill={isFactFavorited(mathFact) ? "currentColor" : "none"} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSpeakFact(mathFact); }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                    isPlayingAudio 
                                      ? 'bg-brand-primary/15 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/25 animate-pulse' 
                                      : 'bg-brand-secondary/5 border-brand-secondary/15 text-brand-text-secondary hover:text-brand-text hover:bg-brand-secondary/10'
                                  }`}
                                  title={isPlayingAudio ? "Stop Narrator" : "Listen to Fact"}
                                >
                                  <Volume2 size={12} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCopyFact(mathFact); }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                    hasCopied 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                      : 'bg-brand-secondary/5 border-brand-secondary/15 text-brand-text-secondary hover:text-brand-text hover:bg-brand-secondary/10'
                                  }`}
                                  title="Copy to Clipboard"
                                >
                                  {hasCopied ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action tabs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                    <button
                      type="button"
                      onClick={handleNextCurated}
                      disabled={isLoadingFact}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-brand-border/60 hover:bg-brand-secondary/5 text-brand-text font-bold text-[11px] font-sans transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Cycle standard local fun facts"
                    >
                      <RefreshCw size={12} className={isLoadingFact ? "animate-spin" : ""} />
                      Local Shuffle
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchFact()}
                      disabled={isLoadingFact}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-secondary text-brand-bg hover:scale-[1.02] font-extrabold text-[11px] font-sans shadow-md shadow-brand-secondary/15 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Generate a brand new fact with AI"
                    >
                      <Sparkles size={12} className="text-brand-bg" />
                      Gemini Flash
                    </button>
                  </div>
                </>
              ) : (
                /* Saved / Favorited view container */
                <div className="flex-grow flex flex-col justify-start relative z-10 my-2 min-h-[220px] max-h-[260px] overflow-y-auto pr-1 no-scrollbar space-y-3">
                  {favoritedFacts.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-8 px-4 space-y-3">
                      <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/10 rounded-full text-brand-text-secondary/40">
                        <Bookmark size={24} />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-bold text-brand-text/80">Cabinet is empty</p>
                        <p className="text-[10px] text-brand-text-secondary/60 mt-1 max-w-[200px] leading-relaxed mx-auto">
                          Click the heart icon on standard facts to preserve them inside your local dashboard!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {favoritedFacts.map((fav, i) => (
                        <motion.div
                          key={fav}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-3 bg-brand-surface border border-brand-secondary/10 rounded-2xl flex flex-col gap-2 relative group/item hover:border-brand-secondary/20 transition-all duration-300"
                        >
                          <p className="text-[12px] text-brand-text/90 leading-relaxed font-sans font-medium text-left">
                            "{fav}"
                          </p>
                          <div className="flex items-center justify-between border-t border-brand-secondary/10 pt-2 mt-1">
                            <span className="text-[9px] font-mono font-bold text-brand-text-secondary/40">
                              Saved Discoveries #{favoritedFacts.length - i}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyFact(fav)}
                                className="p-1 rounded bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer"
                                title="Copy"
                              >
                                <Copy size={10} />
                              </button>
                              <button
                                onClick={() => handleSpeakFact(fav)}
                                className="p-1 rounded bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-text-secondary hover:text-brand-primary transition-all cursor-pointer"
                                title="Narrate"
                              >
                                <Volume2 size={10} />
                              </button>
                              <button
                                onClick={() => toggleFavoriteFact(fav)}
                                className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/10 text-brand-text-secondary hover:text-rose-500 transition-all cursor-pointer"
                                title="Remove / Trash"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 pt-5 border-t border-brand-secondary/20 flex items-center justify-between relative z-10">
                 <p className="text-[9px] text-brand-text-secondary uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <Sparkles size={11} className="text-brand-secondary" /> Daily Discovery
                 </p>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-brand-primary">{totalScholars?.toLocaleString()} Scholars Online</span>
                 </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Featured K5 Homework Banner */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-7"
          >
            <TiltCard
              onClick={() => onTabClick('k5worksheets')}
              className="h-full w-full bg-gradient-to-br from-teal-950/15 via-brand-surface to-emerald-950/15 rounded-[32px] p-8 md:p-10 border border-emerald-500/20 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest w-max mb-5 border border-emerald-500/10">
                    <Printer size={13} className="animate-pulse" /> Homework Studio
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-text mb-3 tracking-tight font-serif">
                    Elementary K-5 Homework Builder
                  </h3>
                  <p className="text-brand-text-secondary text-[14.5px] max-w-xl mb-6 leading-relaxed font-light">
                    Generate seedable high-contrast homework sheets instantly. Tailor printable settings: input custom school names, custom directions, toggle dynamic grid layouts (including handwriting guidelines, coordinate planes, grid lines, or blanks), and export answers.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:underline">
                  <span>Open Homework Studio</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Featured Practice Arena Banner */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-5"
          >
            <TiltCard
              onClick={() => onTabClick('exercises')}
              className="h-full w-full bg-gradient-to-br from-amber-950/15 via-brand-surface to-orange-950/15 rounded-[32px] p-8 border border-amber-500/20 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-amber-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest w-max mb-5 border border-amber-500/10">
                    <Award size={13} /> Curriculum Practice Arena
                  </div>
                  <h3 className="text-2xl font-bold text-brand-text mb-3 tracking-tight font-serif">
                    Practice exams &amp; Diplomas
                  </h3>
                  <p className="text-brand-text-secondary text-[13.5px] mb-6 leading-relaxed font-light font-sans">
                    Drill curriculum-aligned exercises covering multiplication, algebra, and calculus. Earn gold stars, track metrics, check dynamic mathematical proof paths, and strive to earn the Scholar's Diploma.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:underline">
                  <span>Enter Practice Arena</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TiltCard>
          </motion.div>

        </motion.div>

        {/* Core Capabilities Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
        >
          <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/45 text-left hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Calculator size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Universal Computing</h3>
            <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
              From modular arithmetic to calculus limits, matrices, and bitwise binary operations. A unified computing engine designed for responsive input, high precision, and fast parsing.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/45 text-left hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Academic Excellence</h3>
            <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
              Tailored for scholars and teachers. Instantly construct custom K-5 sheets with answer guides, or test your skills in adaptive study runs to earn performance metrics.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface rounded-[24px] p-8 border border-brand-border/45 text-left hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <LineChart size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Real-time Visuals</h3>
            <p className="text-brand-text-secondary text-sm leading-relaxed font-light">
              Plot linear or quadratic mathematical equations in 2D coordinate spaces, check live periodic atomic elements, or observe real-time global exchange values beautifully.
            </p>
          </motion.div>
        </motion.div>

        {/* Categories / Modules */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 bg-brand-surface border border-brand-border/40 rounded-[32px] p-8 md:p-12 shadow-sm text-left relative overflow-hidden"
        >
          <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-brand-primary/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-brand-border/25">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-brand-text mb-2 font-serif">
                {searchQuery ? 'Search Workspaces' : 'Comprehensive Modules'}
              </h2>
              <p className="text-brand-text-secondary text-sm font-light leading-relaxed">Explore specialized workspaces: currency rate tickers, matrix solvers, health guides, coordinate scales, and educator panels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative z-10">
            {filteredCategories.map((category, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-[0.18em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  {category.name}
                </h3>
                <div className="flex flex-col gap-4">
                  {category.tools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onTabClick(tool.id as AppTab)}
                        className="flex items-start gap-4 p-4.5 rounded-2xl bg-brand-bg/60 hover:bg-brand-primary/5 hover:border-brand-primary/25 border border-brand-border/40 group transition-all duration-300 text-left shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <div className={`p-3 rounded-xl shrink-0 ${tool.bg} ${tool.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="block text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="shrink-0 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono text-[9px] uppercase font-black tracking-widest rounded border border-indigo-500/15">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          {tool.desc && (
                            <span className="block text-xs text-brand-text-secondary group-hover:text-brand-text/80 transition-colors mt-2 leading-relaxed font-light">
                              {tool.desc}
                            </span>
                          )}
                        </div>
                        <ArrowRight size={18} className="shrink-0 ml-auto mt-1 text-brand-border group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {!user && (
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 mt-16 p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-primary/10 via-brand-bg to-brand-secondary/10 border border-brand-primary/20 text-center relative overflow-hidden group hover:border-brand-primary/35 transition-colors duration-500 shadow-sm"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-[20rem] -left-[20rem] w-[50rem] h-[50rem] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
            <div className="absolute -bottom-[20rem] -right-[20rem] w-[50rem] h-[50rem] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-brand-text mb-6 tracking-tight leading-[1.15] relative z-10">
              Ready to unbox the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-[#a855f7]">QuantumCalc Universe</span>?
            </h2>
            <p className="text-brand-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light relative z-10 font-sans">
              Create your account to restore calculation states from history instantly, access workspace helpers, export printed materials safely, and gain premium options. Completely free.
            </p>
            <div className="flex justify-center mb-10 relative z-10 flex-wrap gap-5">
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">✓</div> History Synchronization</div>
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">✓</div> AI Workspace Helpers</div>
               <div className="flex items-center gap-2 text-sm text-brand-text font-medium"><div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">✓</div> 100% Free Setup</div>
            </div>
            
            <button 
              onClick={onLoginClick}
              className="inline-flex items-center gap-3 px-10 py-5 bg-brand-text text-brand-bg hover:scale-105 active:scale-95 transition-transform rounded-full font-bold text-base shadow-2xl shadow-brand-text/15 relative z-10 outline-none focus:ring-4 focus:ring-brand-primary/45 cursor-pointer"
            >
              Sign Up for Free <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
