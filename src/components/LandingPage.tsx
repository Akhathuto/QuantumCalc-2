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
  Award
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

const LandingPage: React.FC<LandingPageProps> = ({ onTabClick, onLoginClick }) => {
  const { user, userData, totalScholars } = useAuth();
  const [mathFact, setMathFact] = useState<string>('Loading a brain-teasing fact...');
  const [isLoadingFact, setIsLoadingFact] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    const fetchFact = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Provide a one-sentence fun and surprising fact about mathematics, physics, or productivity. Keep it engaging and concise.",
        });
        setMathFact(response.text || 'Mathematics is the language of the universe.');
      } catch (error) {
        setMathFact('A googol is the number 1 followed by 100 zeros.');
      } finally {
        setIsLoadingFact(false);
      }
    };

    fetchFact();
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
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-brand-text leading-[1.1] font-sans"
              >
                Solve problems <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary inline-block py-1">
                  step-by-step.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-brand-text-secondary text-base sm:text-lg md:text-xl font-light leading-relaxed relative z-10"
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
                <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4 tracking-tight leading-[1.1] font-sans">
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
              className="h-full w-full bg-brand-surface/80 backdrop-blur-sm rounded-[32px] p-8 border border-brand-border/45 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-brand-secondary">
                  <div className="p-2 bg-brand-secondary/10 rounded-full text-brand-secondary">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="font-bold text-xs tracking-widest uppercase">Insight</h3>
                </div>
              </div>
              
              <div className="flex-grow flex items-center relative z-10 my-4">
                <AnimatePresence mode="wait">
                  {isLoadingFact ? (
                    <motion.div key="loader" className="space-y-4 w-full">
                      <div className="h-4 bg-brand-border/40 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-brand-border/40 rounded-full w-5/6 animate-pulse" />
                      <div className="h-4 bg-brand-border/40 rounded-full w-4/6 animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.p 
                      key="fact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-brand-text text-[17.5px] font-serif italic leading-relaxed font-medium text-left"
                    >
                      "{mathFact}"
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-8 pt-6 border-t border-brand-border/25 flex items-center justify-between">
                 <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-semibold">Fact of the moment</p>
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
                  <h3 className="text-2xl md:text-3xl font-extrabold text-brand-text mb-3 tracking-tight">
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
                  <h3 className="text-2xl font-extrabold text-brand-text mb-3 tracking-tight">
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
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-2 font-sans">
                {searchQuery ? 'Search Workspaces' : 'Comprehensive Modules'}
              </h2>
              <p className="text-brand-text-secondary text-sm font-light">Explore specialized workspaces: currency rate tickers, matrix solvers, health guides, coordinate scales, and educator panels.</p>
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
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-text mb-6 tracking-tighter leading-[1.15] relative z-10">
              Ready to unbox the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">QuantumCalc Universe</span>?
            </h2>
            <p className="text-brand-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light relative z-10">
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
