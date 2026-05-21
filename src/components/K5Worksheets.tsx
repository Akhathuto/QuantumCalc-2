import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Sparkles, 
  Download, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  XCircle,
  Smile,
  GraduationCap,
  Award,
  Sparkle,
  Volume2,
  LayoutGrid,
  Bookmark,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import Latex from 'react-latex-next';

interface WorksheetQuestion {
  id: number;
  questionStr: string;
  mathContent?: string;
  blankSpaceLines: number;
  answerKey: string;
  stepDetails?: string;
  svgType?: 'clock' | 'geometry' | 'counting' | 'money' | 'fraction';
  svgData?: any;
}

const GRADE_LEVELS = [
  { id: 'K', label: "Kindergarten", num: 0 },
  { id: 'G1', label: "Grade 1", num: 1 },
  { id: 'G2', label: "Grade 2", num: 2 },
  { id: 'G3', label: "Grade 3", num: 3 },
  { id: 'G4', label: "Grade 4", num: 4 },
  { id: 'G5', label: "Grade 5", num: 5 },
  { id: 'G6', label: "Grade 6 (Middle)", num: 6 }
];

const TOPICS = [
  { id: 'counting_kids', label: "Primary Counting & Visual Shapes" },
  { id: 'clock_time', label: "Clock Reading & Time Dial" },
  { id: 'money_math', label: "Coin Counting & Cash Register" },
  { id: 'fractions_sum', label: "Fraction Addition circles" },
  { id: 'geometry', label: "Area & Perimeter Shapes" },
  { id: 'arithmetic', label: "Primary Addition & Subtraction" },
  { id: 'division_remainder', label: "Division with Remainders" },
  { id: 'decimals', label: "Decimal Multiplication" },
  { id: 'word_problems', label: "Visual Word Problems" }
];

const COMPANIONS = [
  { id: '🦖', label: 'Dino' },
  { id: '🍎', label: 'Apple' },
  { id: '🐱', label: 'Kitty' },
  { id: '🐼', label: 'Panda' },
  { id: '🚀', label: 'Rocket' },
  { id: '🐸', label: 'Froggy' }
];

// Speech Synthesis question reader
const SpeakButton: React.FC<{ text: string }> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Prepare speech strings
    const voiceText = text
      .replace(/\$/g, '')
      .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1 over $2')
      .replace(/\\times/g, 'times')
      .replace(/\\div/g, 'divided by')
      .replace(/cm\^2/g, 'square centimeters');

    const utterance = new SpeechSynthesisUtterance(voiceText);
    utterance.rate = 0.85; // slightly slower for elementary kids
    utterance.pitch = 1.15; // warmer friendly pitch

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-full border flex items-center gap-1.5 transition-all outline-none print:hidden ${
        isPlaying 
          ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse' 
          : 'bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500/20 active:scale-95'
      }`}
      title={isPlaying ? "Stop listening" : "Listen out loud"}
    >
      <Volume2 size={13} />
      <span className="text-[10px] font-black uppercase tracking-wider">
        {isPlaying ? 'Stop' : 'Read'}
      </span>
    </button>
  );
};

// Crayon Drawing Scratchpad for kids
const ScribbleBox: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ec4899'); // Default pink crayon
  const [isEraser, setIsEraser] = useState(false);
  const [size, setSize] = useState(4);
  const lastX = React.useRef(0);
  const lastY = React.useRef(0);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    lastX.current = x;
    lastY.current = y;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="p-4 bg-white border border-teal-200 rounded-[2rem] space-y-3 shadow-md border-dashed mt-2 print:hidden animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap text-slate-700">
        <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest flex items-center gap-1">
          🖍️ Crayon Sketch Box
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { hex: '#ec4899', emoji: '🌸' }, // Pink
            { hex: '#ef4444', emoji: '🔴' }, // Red
            { hex: '#3b82f6', emoji: '🔵' }, // Blue
            { hex: '#10b981', emoji: '🟢' }, // Green
            { hex: '#f59e0b', emoji: '🟡' }, // Orange
            { hex: '#8b5cf6', emoji: '🟣' }  // Purple
          ].map(c => (
            <button
              key={c.hex}
              onClick={() => {
                setColor(c.hex);
                setIsEraser(false);
              }}
              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs transition-transform hover:scale-110 border ${
                !isEraser && color === c.hex ? 'border-teal-500 scale-105 shadow-sm ring-2 ring-teal-500/20' : 'border-zinc-200'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Color: ${c.hex}`}
            >
              <span className="opacity-95 text-[10px]">{c.emoji}</span>
            </button>
          ))}
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          <button
            onClick={() => setIsEraser(true)}
            className={`px-2 py-1 rounded-xl text-[9px] font-bold border transition-all ${
              isEraser ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-white border-zinc-200 text-zinc-500'
            }`}
          >
            🧹 Eraser
          </button>
          <select
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="bg-zinc-100 text-[9px] text-zinc-700 border border-zinc-200 rounded-lg p-1 outline-none font-bold"
          >
            <option value={2}>Thin Chalk</option>
            <option value={4}>Regular Crayon</option>
            <option value={8}>Bright Marker</option>
          </select>
          <button
            onClick={clearCanvas}
            className="px-2 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[9px] font-black uppercase hover:bg-rose-100 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={700}
        height={130}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-[120px] bg-emerald-50/10 border-2 border-dashed border-teal-100 rounded-2xl cursor-crosshair touch-none shadow-inner"
      />
    </div>
  );
};

// Help helper for SVG sector arcs drawing
const getSectorPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const rad = Math.PI / 180;
  const x1 = cx + r * Math.sin(startAngle * rad);
  const y1 = cy - r * Math.cos(startAngle * rad);
  const x2 = cx + r * Math.sin(endAngle * rad);
  const y2 = cy - r * Math.cos(endAngle * rad);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

// Expanded SVG drawing renderer
const RenderWorksheetSVG: React.FC<{ type: string; data: any }> = ({ type, data }) => {
  if (type === 'clock') {
    const { hour, minute } = data;
    const minDeg = minute * 6;
    const minRad = (minDeg * Math.PI) / 180;
    const minX = 50 + 28 * Math.sin(minRad);
    const minY = 50 - 28 * Math.cos(minRad);

    const hourDeg = (hour % 12) * 30 + minute * 0.5;
    const hourRad = (hourDeg * Math.PI) / 180;
    const hourX = 50 + 18 * Math.sin(hourRad);
    const hourY = 50 - 18 * Math.cos(hourRad);

    const ticks = [];
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x1 = 50 + 36 * Math.sin(angle);
      const y1 = 50 - 36 * Math.cos(angle);
      const x2 = 50 + 40 * Math.sin(angle);
      const y2 = 50 - 40 * Math.cos(angle);
      const tx = 50 + 30 * Math.sin(angle);
      const ty = 50 - 30 * Math.cos(angle);
      ticks.push(
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="1.5" />
          <text 
            x={tx} 
            y={ty + 2} 
            textAnchor="middle" 
            fontSize="6.5px" 
            fontWeight="black" 
            fill="#0f172a" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {i}
          </text>
        </g>
      );
    }

    return (
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          {ticks}
          {/* Minute hand (Red) */}
          <line x1="50" y1="50" x2={minX} y2={minY} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          {/* Hour hand (Black/Cyan) */}
          <line x1="50" y1="50" x2={hourX} y2={hourY} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          {/* Center Pin */}
          <circle cx="50" cy="50" r="3.5" fill="#0f172a" />
          <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'geometry') {
    const { shapeType = 'rectangle', length, width, base, height, side } = data;
    
    if (shapeType === 'triangle') {
      return (
        <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none">
          <svg width="180" height="110" viewBox="0 0 180 110">
            <polygon 
              points="40,90 140,90 40,20" 
              fill="#fff1f2" 
              stroke="#f43f5e" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
            />
            {/* Base label */}
            <text x="90" y="103" textAnchor="middle" fontSize="10px" fontWeight="black" fill="#1e293b">
              {base} cm
            </text>
            {/* Height label */}
            <text x="21" y="60" textAnchor="middle" fontSize="10px" fontWeight="black" fill="#1e293b">
              {height} cm
            </text>
          </svg>
        </div>
      );
    }

    if (shapeType === 'square') {
      return (
        <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none">
          <svg width="180" height="110" viewBox="0 0 180 110">
            <rect 
              x="55" 
              y="20" 
              width="70" 
              height="70" 
              fill="#f0fdf4" 
              stroke="#10b981" 
              strokeWidth="2.5" 
              rx="4"
            />
            <text x="90" y="12" textAnchor="middle" fontSize="10px" fontWeight="black" fill="#1e293b">
              {side} cm
            </text>
          </svg>
        </div>
      );
    }

    // Default rectangle
    const visualWidth = Math.min(100, Math.max(50, width * 8));
    const visualHeight = Math.min(75, Math.max(30, length * 6));
    return (
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none">
        <svg width="180" height="110" viewBox="0 0 180 110">
          <rect 
            x={(180 - visualWidth) / 2} 
            y={(110 - visualHeight) / 2} 
            width={visualWidth} 
            height={visualHeight} 
            fill="#eff6ff" 
            stroke="#3b82f6" 
            strokeWidth="2.5" 
            rx="4"
          />
          <text 
            x={(180 - visualWidth) / 2 - 20} 
            y="58" 
            textAnchor="middle" 
            fontSize="10px" 
            fontWeight="black" 
            fill="#1e293b"
          >
            {length} cm
          </text>
          <text 
            x="90" 
            y={(110 - visualHeight) / 2 - 8} 
            textAnchor="middle" 
            fontSize="10px" 
            fontWeight="black" 
            fill="#1e293b"
          >
            {width} cm
          </text>
        </svg>
      </div>
    );
  }

  if (type === 'counting') {
    const { count, shape } = data;
    const items = [];
    const columns = Math.ceil(Math.sqrt(count));
    
    for (let i = 0; i < count; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const cx = 18 + col * 26;
      const cy = 18 + row * 26;
      
      items.push(
        <text 
          key={i} 
          x={cx} 
          y={cy + 7} 
          textAnchor="middle" 
          fontSize="18px"
        >
          {shape}
        </text>
      );
    }
    
    const svgWidth = 36 + (columns - 1) * 26;
    const rowsCount = Math.ceil(count / columns);
    const svgHeight = 36 + (rowsCount - 1) * 26;

    return (
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none animate-fade-in">
        <svg width={Math.max(120, svgWidth)} height={Math.max(60, svgHeight)} viewBox={`0 0 ${Math.max(120, svgWidth)} ${Math.max(60, svgHeight)}`}>
          {items}
        </svg>
      </div>
    );
  }

  if (type === 'money') {
    const { quarters = 0, dimes = 0, nickels = 0, pennies = 0 } = data;
    const coinsList: { val: number; label: string; bg: string; border: string; text: string; r: number }[] = [];
    
    for (let i = 0; i < quarters; i++) coinsList.push({ val: 25, label: '25¢', bg: 'q-grad', border: '#94a3b8', text: '#1e293b', r: 18 });
    for (let i = 0; i < nickels; i++) coinsList.push({ val: 5, label: '5¢', bg: 'n-grad', border: '#cbd5e1', text: '#475569', r: 16 });
    for (let i = 0; i < dimes; i++) coinsList.push({ val: 10, label: '10¢', bg: 'd-grad', border: '#94a3b8', text: '#334155', r: 13 });
    for (let i = 0; i < pennies; i++) coinsList.push({ val: 1, label: '1¢', bg: 'p-grad', border: '#ea580c', text: '#7c2d12', r: 14 });

    return (
      <div className="p-4 bg-white rounded-3xl border border-zinc-200/70 max-w-full overflow-x-auto mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none animate-fade-in custom-scrollbar">
        <div className="min-w-fit flex justify-center">
          <svg width={coinsList.length * 38 + 24} height="52" viewBox={`0 0 ${coinsList.length * 38 + 24} 52`} className="shrink-0">
            <defs>
              <radialGradient id="q-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </radialGradient>
              <radialGradient id="n-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              <radialGradient id="d-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              <radialGradient id="p-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="70%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
            </defs>
            {coinsList.map((coin, index) => {
              const cx = 22 + index * 38;
              const cy = 26;
              return (
                <g key={index}>
                  <circle cx={cx} cy={cy} r={coin.r} fill={`url(#${coin.bg})`} stroke={coin.border} strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r={coin.r - 2.5} fill="none" stroke={coin.border} strokeWidth="0.5" strokeDasharray="1.5,1.5" />
                  <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8.5px" fontWeight="black" fill={coin.text} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {coin.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'fraction') {
    const { num1, den1, num2 = null, den2 = null } = data;
    
    return (
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none animate-fade-in">
        <svg width="220" height="90" viewBox="0 0 220 90" className="max-w-full h-auto">
          {/* Circle 1 */}
          <g transform="translate(10, 0)">
            {Array.from({ length: den1 }).map((_, i) => {
              const startAngle = (i * 360) / den1;
              const endAngle = ((i + 1) * 360) / den1;
              const path = getSectorPath(38, 45, 28, startAngle, endAngle);
              const isShaded = i < num1;
              return (
                <path
                  key={i}
                  d={path}
                  fill={isShaded ? "#06b6d4" : "#f1f5f9"}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              );
            })}
            <text x="38" y="86" textAnchor="middle" fontSize="10px" fontWeight="black" fill="#1e293b">
              {num1}/{den1}
            </text>
          </g>

          {/* Plus sign math representation */}
          {num2 !== null && den2 !== null && (
            <>
              <g transform="translate(90, 0)">
                <text x="10" y="51" textAnchor="middle" fontSize="20px" fontWeight="black" fill="#64748b">
                  +
                </text>
              </g>

              {/* Circle 2 */}
              <g transform="translate(118, 0)">
                {Array.from({ length: den2 }).map((_, i) => {
                  const startAngle = (i * 360) / den2;
                  const endAngle = ((i + 1) * 360) / den2;
                  const path = getSectorPath(38, 45, 28, startAngle, endAngle);
                  const isShaded = i < num2;
                  return (
                    <path
                      key={i}
                      d={path}
                      fill={isShaded ? "#fb7185" : "#f1f5f9"}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                  );
                })}
                <text x="38" y="86" textAnchor="middle" fontSize="10px" fontWeight="black" fill="#1e293b">
                  {num2}/{den2}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
    );
  }

  return null;
};

// Answer Grader helper for kids
const checkK5Answer = (question: WorksheetQuestion, userVal: string) => {
  if (!userVal) return false;
  const cleanAns = userVal.trim().toLowerCase().replace(/\s+/g, '');
  const cleanKey = question.answerKey.trim().toLowerCase().replace(/\s+/g, '');

  if (cleanAns === cleanKey) return true;

  // Flexible contains criteria for string lists
  if (cleanAns.includes(cleanKey) || cleanKey.includes(cleanAns)) {
    if (cleanAns.length > 1 && cleanKey.length > 1) return true;
  }

  // Pure numeric equivalents (strip centimeter suffixes, extra letters)
  const numericAns = cleanAns.replace(/[^0-9/:]/g, '');
  const numericKey = cleanKey.replace(/[^0-9/:]/g, '');
  
  if (numericAns && numericKey && numericAns === numericKey) {
    return true;
  }

  // Float conversion logic
  const isFloat = !isNaN(parseFloat(numericAns)) && !isNaN(parseFloat(numericKey));
  if (isFloat && parseFloat(numericAns) === parseFloat(numericKey)) {
    return true;
  }

  return false;
};

// Programmatic curriculum generator that creates exactly 100 educational worksheet templates
const generateOneHundredTemplates = () => {
  const templates: any[] = [];
  
  const animals = ['Dinosaur', 'Panda Bear', 'Lion Cub', 'Koala Bear', 'Bunny Hop', 'Unicorn Magic', 'Baby Dragon', 'Forest Fox', 'Honey Bear', 'Happy Penguin', 'Playful Monkey', 'Puppy Friend', 'Fluffy Kitten', 'Robot Buddy', 'Wise Owl'];
  const places = ['Outer Space', 'Wild Safari', 'Deep Sea Blue', 'Magic Forest', 'Toy Factory', 'Sweet Bakery', 'Candy Island', 'Pirate River', 'Jungles Hub', 'Cloud Castle', 'Volcano Range', 'Submarine Lab'];
  const roles = ['Astronaut', 'Wizard Math', 'Smart Detective', 'Star Explorer', 'Ninja Sums', 'Baker Chef', 'Sea Captain', 'Superhero', 'Professor'];
  
  const companionEmojis = ['🦖', '🐼', '🦁', '🐨', '🐰', '🦄', '🐲', '🦊', '🐻', '🐧', '🐵', '🐶', '🐱', '🤖', '🦉'];
  const icons = ['✨', '🎪', '🍭', '🎨', '🧩', '🚀', '🔮', '🔭', '🧭', '🛹', '🎳', '🏆', '🎭', '🎸', '🎒'];

  const colors = [
    { name: 'orange', class: 'from-orange-500/10 via-amber-500/5 to-orange-500/10 border-orange-500/20 text-orange-400' },
    { name: 'teal', class: 'from-teal-500/10 via-cyan-500/5 to-teal-500/10 border-teal-500/20 text-teal-400' },
    { name: 'emerald', class: 'from-emerald-500/10 via-green-500/5 to-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    { name: 'rose', class: 'from-rose-500/10 via-red-500/5 to-rose-500/10 border-rose-500/20 text-rose-400' },
    { name: 'indigo', class: 'from-indigo-500/10 via-violet-500/5 to-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    { name: 'amber', class: 'from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-amber-500/20 text-yellow-400' },
    { name: 'cyan', class: 'from-cyan-500/10 via-blue-500/5 to-cyan-500/10 border-cyan-500/20 text-cyan-400' },
    { name: 'pink', class: 'from-pink-500/10 via-fuchsia-500/5 to-pink-500/10 border-pink-500/20 text-pink-400' },
    { name: 'violet', class: 'from-violet-500/10 via-purple-500/5 to-violet-500/10 border-violet-500/20 text-violet-400' },
  ];

  const topicsList = [
    { id: 'counting_kids', label: 'Counting', grades: ['K', 'G1'] },
    { id: 'clock_time', label: 'Time Dial', grades: ['G1', 'G2', 'G3'] },
    { id: 'money_math', label: 'Money Math', grades: ['G2', 'G3', 'G4'] },
    { id: 'fractions_sum', label: 'Fractions', grades: ['G3', 'G4', 'G5'] },
    { id: 'geometry', label: 'Geometry', grades: ['G3', 'G4', 'G5', 'G6'] },
    { id: 'arithmetic', label: 'Primary Math', grades: ['K', 'G1', 'G2', 'G3'] },
    { id: 'division_remainder', label: 'Remainders', grades: ['G3', 'G4', 'G5'] },
    { id: 'decimals', label: 'Decimals', grades: ['G4', 'G5', 'G6'] },
    { id: 'word_problems', label: 'Story Problems', grades: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] }
  ];

  for (let i = 1; i <= 100; i++) {
    // Select topic deterministically
    const topicObj = topicsList[i % topicsList.length];
    // Select grade from permitted grades
    const grade = topicObj.grades[i % topicObj.grades.length];
    
    const animal = animals[(i * 3 + 1) % animals.length];
    const place = places[(i * 2 + 5) % places.length];
    const role = roles[(i * 5 + 2) % roles.length];
    
    // Mix and match titles to sound spectacular
    let title = '';
    if (i % 3 === 0) {
      title = `${place} ${animal} ${topicObj.label}`;
    } else if (i % 3 === 1) {
      title = `${role} ${topicObj.label} Quest`;
    } else {
      title = `${animal} ${topicObj.label} Lab`;
    }

    const companion = companionEmojis[i % companionEmojis.length];
    const icon = icons[i % icons.length];
    const colorObj = colors[i % colors.length];
    const questionsCount = 4 + ((i * 2) % 10); // 4 to 12 questions
    const seed = 100 + i * 13;

    const desc = `Level up on ${topicObj.label.toLowerCase()} inside ${place.toLowerCase()} with your friendly mentor ${companion}!`;

    templates.push({
      id: i,
      title,
      badge: `${grade} - Vol. ${i}`,
      grade,
      topic: topicObj.id,
      topicLabel: topicObj.label,
      icon,
      companion,
      count: questionsCount,
      desc,
      color: colorObj.class,
      seed
    });
  }
  return templates;
};

const ALL_TEMPLATES = generateOneHundredTemplates();

export const K5Worksheets: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('G3');
  const [selectedTopic, setSelectedTopic] = useState('counting_kids');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [seed, setSeed] = useState(1);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showGridWorkspace, setShowGridWorkspace] = useState(true);
  const [questions, setQuestions] = useState<WorksheetQuestion[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState('Grade 3 Mathematics Worksheet');

  // Kids companion for counting shapes
  const [selectedCompanion, setSelectedCompanion] = useState('🦖');

  // Interactive Online Grader state
  const [isInteractive, setIsInteractive] = useState(true);
  const [answersDraft, setAnswersDraft] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState(false);
  const [isKidsTheme, setIsKidsTheme] = useState(true);

  // Print Solutions switcher ( modular printable outputs )
  const [printSolutions, setPrintSolutions] = useState(false);

  // Individual scratchpad drawing cards open state
  const [scribbleOpend, setScribbleOpend] = useState<Record<number, boolean>>({});

  // Achievements
  const [earnedStars, setEarnedStars] = useState(0);
  const [scholarName, setScholarName] = useState('');

  // Curriculum library search, filter, and pagination states
  const [curriculumSearchText, setCurriculumSearchText] = useState('');
  const [curriculumGradeFilter, setCurriculumGradeFilter] = useState('All');
  const [curriculumTopicFilter, setCurriculumTopicFilter] = useState('All');
  const [curriculumDifficultyFilter, setCurriculumDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [curriculumSortBy, setCurriculumSortBy] = useState<'id' | 'title' | 'count'>('id');
  const [curriculumSortOrder, setCurriculumSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bookmarkedBlueprints, setBookmarkedBlueprints] = useState<number[]>([]);
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [isCurriculumExpanded, setIsCurriculumExpanded] = useState(false);

  // Print Output configuration customizing overlays
  const [customSchoolName, setCustomSchoolName] = useState('Primary School Mathematics Sandbox');
  const [printFontSize, setPrintFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [gridStyle, setGridStyle] = useState<'grid' | 'lines' | 'blank' | 'dots'>('grid');
  const [appendSolutionsOnPrint, setAppendSolutionsOnPrint] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [expandPrintDesigner, setExpandPrintDesigner] = useState(false);

  // Auto compile lists
  useEffect(() => {
    const generateDynamicWorksheet = () => {
      const generated: WorksheetQuestion[] = [];
      const gradeNum = GRADE_LEVELS.find(g => g.id === selectedGrade)?.num ?? 3;
      const baseVal = seed * 4 + gradeNum * 3;

      for (let i = 1; i <= questionsCount; i++) {
        const qSeed1 = (baseVal * i + 19) % 23 + 2;
        const qSeed2 = (baseVal * i * 9 + 41) % 17 + 3;

        switch (selectedTopic) {
          case 'counting_kids': {
            // Early grades count visually
            if (selectedGrade === 'K' || selectedGrade === 'G1') {
              const count = (qSeed1 % 9) + 3; // 3 to 11 items
              generated.push({
                id: i,
                questionStr: `Count the friendly animals in the box below carefully. How many can you count?`,
                blankSpaceLines: 1,
                answerKey: `${count}`,
                svgType: 'counting',
                svgData: { count, shape: selectedCompanion },
                stepDetails: `\\text{Counting slowly one-by-one gives exactly } ${count} \\text{ companion shapes.}`
              });
            } else if (selectedGrade === 'G2' || selectedGrade === 'G3') {
              // Skip counting - trademark K5 Learning worksheet
              const step = (qSeed1 % 3) === 0 ? 2 : (qSeed1 % 3 === 1 ? 5 : 10);
              const start = (qSeed2 % 10) * step + step;
              const sequence = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
              const blankIdx1 = 2; // middle
              const blankIdx2 = 4; // last
              const ans1 = sequence[blankIdx1];
              const ans2 = sequence[blankIdx2];

              const displaySeq = [...sequence];
              displaySeq[blankIdx1] = -1; // -1 represents empty underscore block
              displaySeq[blankIdx2] = -1;

              const mathTexStr = sequence.map((v, idx) => 
                idx === blankIdx1 || idx === blankIdx2 ? '\\underline{\\quad}' : `${v}`
              ).join(',\\ ');

              generated.push({
                id: i,
                questionStr: `Fill in the missing numbers in this Skip Counting sequence (counting by ${step}s):`,
                mathContent: mathTexStr,
                blankSpaceLines: 2,
                answerKey: `${ans1}, ${ans2}`,
                stepDetails: `\\text{The sequence increases by } ${step} \\text{ each step. Missing values: } ${ans1} \\text{ and } ${ans2}.`
              });
            } else {
              // Higher grades (G4, G5, G6): Place value or Roman Numerals
              if (i % 2 === 0) {
                // Place value identification
                const digits = [
                  (qSeed1 % 9) + 1,
                  (qSeed2 % 9) + 1,
                  ((qSeed1 + qSeed2) % 9) + 1,
                  (qSeed1 * qSeed2 % 9) + 1
                ];
                const chosenIdx = (qSeed1 % 4); // 0: Thousands, 1: Hundreds, 2: Tens, 3: Ones
                const chosenDigit = digits[chosenIdx];
                const placeLabel = ['Thousands', 'Hundreds', 'Tens', 'Ones'][chosenIdx];
                const placeValue = chosenDigit * Math.pow(10, 3 - chosenIdx);

                const texFormula = digits.map((d, idx) => 
                  idx === chosenIdx ? `\\underline{${d}}` : `${d}`
                ).join('');

                generated.push({
                  id: i,
                  questionStr: `In the number below, state the Place Value of the underlined digit:`,
                  mathContent: `${texFormula}`,
                  blankSpaceLines: 2,
                  answerKey: `${placeValue}`,
                  stepDetails: `\\text{The underlined digit } ${chosenDigit} \\text{ is in the } \\text{${placeLabel}} \\text{ place. Value: } ${placeValue}.`
                });
              } else {
                // Roman numeral conversions - classic K5 Learning worksheets
                const conversions = [
                  { num: 4, roman: 'IV' }, { num: 9, roman: 'IX' }, { num: 14, roman: 'XIV' },
                  { num: 19, roman: 'XIX' }, { num: 24, roman: 'XXIV' }, { num: 29, roman: 'XXIX' },
                  { num: 35, roman: 'XXXV' }, { num: 42, roman: 'XLII' }, { num: 49, roman: 'XLIX' },
                  { num: 55, roman: 'LV' }, { num: 68, roman: 'LXVIII' }, { num: 89, roman: 'LXXXIX' }
                ];
                const val = conversions[i % conversions.length];
                generated.push({
                  id: i,
                  questionStr: `Convert the following Roman Numeral to a standard number value:`,
                  mathContent: `\\text{Roman Numeral: } \\bf{${val.roman}}`,
                  blankSpaceLines: 1,
                  answerKey: `${val.num}`,
                  stepDetails: `\\text{Roman Numeral } ${val.roman} \\text{ evaluates to } ${val.num} \\text{ in standard arabic notation.}`
                });
              }
            }
            break;
          }

          case 'clock_time': {
            const hrs = (qSeed1 % 12) + 1;
            
            if (selectedGrade === 'K' || selectedGrade === 'G1') {
              // Tell time on the hour or half-hour
              const mins = (qSeed2 % 2 === 0) ? 0 : 30;
              const displayMins = mins.toString().padStart(2, '0');
              generated.push({
                id: i,
                questionStr: `Look carefully at the clock indicator. What is the time shown?`,
                blankSpaceLines: 1,
                answerKey: `${hrs}:${displayMins}`,
                svgType: 'clock',
                svgData: { hour: hrs, minute: mins },
                stepDetails: `\\text{The short hour hand points near } ${hrs} \\text{ and the long minute hand points at } ${mins}\\phi \\text{. Time is: } ${hrs}:${displayMins}.`
              });
            } else if (selectedGrade === 'G2') {
              // Time to nearest 5 minutes
              const minutesList = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55];
              const mins = minutesList[qSeed2 % minutesList.length];
              const displayMins = mins.toString().padStart(2, '0');
              generated.push({
                id: i,
                questionStr: `View the analog clock dial below. State the current time to the nearest 5 minutes:`,
                blankSpaceLines: 1,
                answerKey: `${hrs}:${displayMins}`,
                svgType: 'clock',
                svgData: { hour: hrs, minute: mins },
                stepDetails: `\\text{The clock shows exactly } ${hrs} \\text{ hours and } ${mins} \\text{ minutes. Result: } ${hrs}:${displayMins}.`
              });
            } else {
              // Grade 3+: Tell exact time to nearest 1-minute with Elapsed Time word problems!
              const mins = ((qSeed1 * 7) % 60);
              const displayMins = mins.toString().padStart(2, '0');
              const elapsedMinutes = (qSeed2 * 3) % 45 + 15; // 15 to 59 minutes elapsed

              let futureHrs = hrs;
              let futureMins = mins + elapsedMinutes;
              if (futureMins >= 60) {
                futureHrs = (hrs + Math.floor(futureMins / 60)) % 12 || 12;
                futureMins = futureMins % 60;
              }
              const displayFutureMins = futureMins.toString().padStart(2, '0');

              generated.push({
                id: i,
                questionStr: `The clock below indicates morning time (AM). If a lesson starts exactly at this time and lasts for ${elapsedMinutes} minutes, what time does the lesson end?`,
                blankSpaceLines: 3,
                answerKey: `${futureHrs}:${displayFutureMins} AM`,
                svgType: 'clock',
                svgData: { hour: hrs, minute: mins },
                stepDetails: `\\text{Lesson starts at } ${hrs}:${displayMins}\\text{ AM. Adding elapsed } ${elapsedMinutes} \\text{ mins makes the end time: } ${futureHrs}:${displayFutureMins}\\text{ AM.}`
              });
            }
            break;
          }

          case 'money_math': {
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2') {
              // Classic coin collection sum
              const quarters = (qSeed1 % 3) + 1; // 1 to 3
              const dimes = (qSeed2 % 3) + 1; // 1 to 3
              const nickels = (qSeed1 * 2) % 3 + i % 2; // 0 to 3
              const pennies = (qSeed2 * 3) % 4 + 1; // 1 to 4
              const totalCents = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;

              generated.push({
                id: i,
                questionStr: `Count the total value of these coins (Quarters = 25¢, Dimes = 10¢, Nickels = 5¢, Pennies = 1¢):`,
                blankSpaceLines: 2,
                answerKey: `${totalCents}¢`,
                svgType: 'money',
                svgData: { quarters, dimes, nickels, pennies },
                stepDetails: `\\text{Evaluate: } (${quarters} \\times 25\\phi) + (${dimes} \\times 10\\phi) + (${nickels} \\times 5\\phi) + (${pennies} \\times 1\\phi) = ${totalCents}\\phi.`
              });
            } else if (selectedGrade === 'G3' || selectedGrade === 'G4') {
              // Making change - flagship K5 category
              const costCents = (qSeed1 % 15) * 20 + 200; // e.g., $2.00 to $4.80
              const costDisplay = (costCents / 100).toFixed(2);
              const billPay = 500; // Paid with $5.00
              const changeCents = billPay - costCents;
              const changeDisplay = (changeCents / 100).toFixed(2);

              generated.push({
                id: i,
                questionStr: `You bought a storybook for $${costDisplay}. If you paid with a $5.00 dollar bill, how much change should you receive?`,
                blankSpaceLines: 3,
                answerKey: `$${changeDisplay}`,
                stepDetails: `\\text{Change} = \\text{Paid} - \\text{Cost} = \\$5.00 - \\$${costDisplay} = \\$${changeDisplay}.`
              });
            } else {
              // Grade 5 & 6: Rate math and decimal currency ratios
              const itemsCount = (qSeed1 % 4) + 3; // 3 to 6
              const pricePerItem = (1.10 + (qSeed2 % 5) * 0.15); // e.g. $1.10 to $1.70
              const totalCost = (itemsCount * pricePerItem).toFixed(2);
              
              generated.push({
                id: i,
                questionStr: `If ${itemsCount} identical folders cost a total of $${totalCost}, what is the unit price of just a single folder?`,
                blankSpaceLines: 3,
                answerKey: `$${pricePerItem.toFixed(2)}`,
                stepDetails: `\\text{Unit Price} = \\text{Total Cost} \\div \\text{Quantity} = \\$${totalCost} \\div ${itemsCount} = \\$${pricePerItem.toFixed(2)}.`
              });
            }
            break;
          }

          case 'fractions_sum': {
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2' || selectedGrade === 'G3') {
              // K-3 K5 Worksheets focus on "What fraction of this circle is colored?"
              const den = Math.max(3, Math.min(qSeed1 % 8, 8));
              const num = Math.max(1, (qSeed2 % (den - 1)) + 1);

              generated.push({
                id: i,
                questionStr: `Look at the colored circle partition. What is the fraction of shaded parts?`,
                blankSpaceLines: 2,
                answerKey: `${num}/${den}`,
                svgType: 'fraction',
                svgData: { num1: num, den1: den }, // Single circle view
                stepDetails: `\\text{The circle is split into } ${den} \\text{ equal parts. } ${num} \\text{ part(s) are shaded. Fraction: } \\frac{${num}}{${den}}.`
              });
            } else if (selectedGrade === 'G4') {
              // Adding fractions with like denominators
              const den = Math.max(4, Math.min(qSeed1 % 9, 10));
              const num1 = Math.max(1, Math.floor(den / 3));
              const num2 = Math.max(1, Math.floor(den / 3) + 1);
              const sumNum = num1 + num2;
              
              // Simplify outcome
              const gcdFn = (x: number, y: number): number => (!y ? x : gcdFn(y, x % y));
              const currentGcd = gcdFn(sumNum, den);
              const finalNum = sumNum / currentGcd;
              const finalDen = den / currentGcd;

              generated.push({
                id: i,
                questionStr: `Add the following fractions with the same denominator and simplify your final answer:`,
                mathContent: `\\frac{${num1}}{${den}} + \\frac{${num2}}{${den}}`,
                blankSpaceLines: 3,
                answerKey: finalDen === 1 ? `${finalNum}` : `\\frac{${finalNum}}{${finalDen}}`,
                stepDetails: `\\text{Like Denominators: } \\frac{${num1} + ${num2}}{${den}} = \\frac{${sumNum}}{${den}}. \\text{ Reduced Form: } \\frac{${finalNum}}{${finalDen}}.`
              });
            } else {
              // G5 & G6: Unlike denominators, or mixed improper conversion
              if (i % 2 === 0) {
                // Different denominator sum
                const den1 = (qSeed1 % 2 === 0) ? 3 : 5;
                const den2 = (qSeed2 % 2 === 0) ? 2 : 4;
                const num1 = 1;
                const num2 = 1;

                const baseD = den1 * den2;
                const baseN = num1 * den2 + num2 * den1;

                generated.push({
                  id: i,
                  questionStr: `Evaluate the fractions sum with unlike denominators and find simpler terms:`,
                  mathContent: `\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}`,
                  blankSpaceLines: 4,
                  answerKey: `\\frac{${baseN}}{${baseD}}`,
                  svgType: 'fraction',
                  svgData: { num1, den1, num2, den2 },
                  stepDetails: `\\text{Find common denominator: } ${den1} \\times ${den2} = ${baseD}. \\text{ Equation: } \\frac{${den2}}{${baseD}} + \\frac{${den1}}{${baseD}} = \\frac{${baseN}}{${baseD}}.`
                });
              } else {
                // Mixed fraction to improper
                const whole = (qSeed1 % 4) + 1; // 1 to 4
                const den = [3, 4, 5, 8][qSeed2 % 4];
                const num = (qSeed1 % (den - 1)) + 1;
                const improperNum = whole * den + num;

                generated.push({
                  id: i,
                  questionStr: `Convert this mixed fraction into an improper fraction:`,
                  mathContent: `${whole}\\ \\frac{${num}}{${den}}`,
                  blankSpaceLines: 3,
                  answerKey: `\\frac{${improperNum}}{${den}}`,
                  stepDetails: `\\text{Multiply whole and denominator then add numerator: } (${whole} \\times ${den}) + ${num} = ${improperNum}. \\text{ Result is } \\frac{${improperNum}}{${den}}.`
                });
              }
            }
            break;
          }

          case 'geometry': {
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2' || selectedGrade === 'G3') {
              // Perimeter of squares / basic shape identification
              const side = (qSeed1 % 5) + 3; // 3 to 7
              const perimeter = 4 * side;
              generated.push({
                id: i,
                questionStr: `Find the complete perimeter (in cm) of a playground sandbox shaped like a perfect square with side length ${side} cm:`,
                blankSpaceLines: 3,
                answerKey: `${perimeter} cm`,
                svgType: 'geometry',
                svgData: { shapeType: 'square', side },
                stepDetails: `\\text{A square has } 4 \\text{ equal sides. } \\text{Perimeter} = 4 \\times s = 4 \\times ${side} = ${perimeter}\\text{ cm}.`
              });
            } else if (selectedGrade === 'G4' || selectedGrade === 'G5') {
              // Classic Rectangle area/perimeter or Triangles
              const isTri = (i % 2 === 0);
              if (isTri) {
                const base = (qSeed1 % 6) + 4;
                const height = (qSeed2 % 4) + 4;
                const area = 0.5 * base * height;
                generated.push({
                  id: i,
                  questionStr: `Calculate the Area (cm²) of this right triangle:`,
                  blankSpaceLines: 4,
                  answerKey: `${area} cm²`,
                  svgType: 'geometry',
                  svgData: { shapeType: 'triangle', base, height },
                  stepDetails: `\\text{Area} = \\frac{1}{2} \\times b \\times h = \\frac{1}{2} \\times ${base} \\times ${height} = ${area}\\text{ cm}^2.`
                });
              } else {
                const length = (qSeed1 % 5) + 5;
                const width = (qSeed2 % 4) + 3;
                const area = length * width;
                const perimeter = 2 * (length + width);
                generated.push({
                  id: i,
                  questionStr: `Compute the Area (cm²) and Perimeter (cm) of the rectangle shown:`,
                  blankSpaceLines: 4,
                  answerKey: `Area = ${area}, Perimeter = ${perimeter}`,
                  svgType: 'geometry',
                  svgData: { shapeType: 'rectangle', length, width },
                  stepDetails: `\\text{Area} = L \\times W = ${length} \\times ${width} = ${area}\\text{ cm}^2. \\text{ Perimeter} = 2(L+W) = 2(${length}+${width}) = ${perimeter}\\text{ cm}.`
                });
              }
            } else {
              // G6 Volume of Rectangular Prism
              const length = (qSeed1 % 4) + 4;
              const width = (qSeed2 % 3) + 3;
              const height = (qSeed1 % 3) + 2;
              const volume = length * width * height;

              generated.push({
                id: i,
                questionStr: `A rectangular chest box has length = ${length} cm, width = ${width} cm, and height = ${height} cm. Find its complete Volume in cubic centimeters (cm³):`,
                blankSpaceLines: 4,
                answerKey: `${volume} cm³`,
                stepDetails: `\\text{Volume} = L \\times W \\times H = ${length} \\times ${width} \\times ${height} = ${volume}\\text{ cm}^3.`
              });
            }
            break;
          }

          case 'decimals': {
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2' || selectedGrade === 'G3' || selectedGrade === 'G4') {
              // Simple converting tenths/hundredths to decimal representation
              const fractionNumerator = [3, 7, 9, 23, 45, 81][qSeed1 % 6];
              const fractionDenominator = (fractionNumerator > 10) ? 100 : 10;
              const expectedDec = (fractionNumerator / fractionDenominator).toFixed(fractionDenominator === 100 ? 2 : 1);

              generated.push({
                id: i,
                questionStr: `Convert the following base fraction to its exact decimal notation format:`,
                mathContent: `\\frac{${fractionNumerator}}{${fractionDenominator}}`,
                blankSpaceLines: 2,
                answerKey: `${expectedDec}`,
                stepDetails: `\\text{Divide the numerator by denominator: } ${fractionNumerator} \\div ${fractionDenominator} = ${expectedDec}.`
              });
            } else if (selectedGrade === 'G5') {
              // Decimals addition and subtraction
              const d1 = (qSeed1 * 0.15 + 1.2).toFixed(2);
              const d2 = (qSeed2 * 0.12 + 0.4).toFixed(2);
              const sum = (parseFloat(d1) + parseFloat(d2)).toFixed(2);

              generated.push({
                id: i,
                questionStr: `Solve this decimal addition sum carefully. Align the decimal points:`,
                mathContent: `${d1} + ${d2}`,
                blankSpaceLines: 3,
                answerKey: `${sum}`,
                stepDetails: `\\text{Align dots row-wise: } 1.00 + 0.00 \\text{ yields outcome } {${d1}} + {${d2}} = {${sum}}.`
              });
            } else {
              // Grade 6: decimals multiplication & division
              const d1 = (qSeed1 * 0.4).toFixed(1); // e.g. 1.2, 2.4
              const d2 = (qSeed2 * 0.3).toFixed(1); // e.g. 0.9, 1.5
              const prod = (parseFloat(d1) * parseFloat(d2)).toFixed(2);

              generated.push({
                id: i,
                questionStr: `Multiply these decimals. Count the decimal places in the product:`,
                mathContent: `${d1} \\times ${d2}`,
                blankSpaceLines: 3,
                answerKey: `${prod}`,
                stepDetails: `\\text{Multiply digits: } ${Math.round(parseFloat(d1)*10)} \\times ${Math.round(parseFloat(d2)*10)} = ${Math.round(parseFloat(prod)*100)}. \\text{ Place decimal 2 spaces left: } ${prod}.`
              });
            }
            break;
          }

          case 'division_remainder': {
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2' || selectedGrade === 'G3') {
              // Basic division facts
              const quotient = (qSeed1 % 9) + 2; // 2 to 10
              const divisor = (qSeed2 % 5) + 2; // 2 to 6
              const product = quotient * divisor;

              generated.push({
                id: i,
                questionStr: `Solve the simple division fact:`,
                mathContent: `${product} \\div ${divisor}`,
                blankSpaceLines: 2,
                answerKey: `${quotient}`,
                stepDetails: `\\text{Think multiplication: } ${divisor} \\times ? = ${product}. \\text{ Answer is } ${quotient}.`
              });
            } else if (selectedGrade === 'G4') {
              // Division with remainders
              const numVal = qSeed1 * 4 + qSeed2 + 10;
              const divisor = Math.max(3, qSeed2 % 6 + 2);
              const q = Math.floor(numVal / divisor);
              const r = numVal % divisor;

              generated.push({
                id: i,
                questionStr: `Evaluate the division problem and state the quotient and remainder (format like: 5 R 2 or simply quotient if remainder is 0):`,
                mathContent: `${numVal} \\div ${divisor}`,
                blankSpaceLines: 3,
                answerKey: r === 0 ? `${q}` : `${q} R ${r}`,
                stepDetails: `\\text{Divide: } ${divisor} \\times ${q} = ${divisor * q}. \\text{ Remainder: } ${numVal} - ${divisor * q} = ${r}. Answer: ${q} R ${r}.`
              });
            } else {
              // Grade 5 & 6: Multi-digit division
              const dividend = (qSeed1 * 12) + 120;
              const divisor = 12;
              const q = Math.floor(dividend / divisor);
              const r = dividend % divisor;

              generated.push({
                id: i,
                questionStr: `Find the exact quotient of this long division:`,
                mathContent: `${dividend} \\div ${divisor}`,
                blankSpaceLines: 4,
                answerKey: r === 0 ? `${q}` : `${q} R ${r}`,
                stepDetails: `\\text{Solving } ${dividend} \\div ${divisor} = ${q}.`
              });
            }
            break;
          }

          case 'word_problems': {
            // Adaptive story word problems
            if (selectedGrade === 'K' || selectedGrade === 'G1' || selectedGrade === 'G2') {
              // Simple single step problems
              const hasItems = qSeed1 + 4;
              const takesAway = (qSeed2 % 3) + 2;
              generated.push({
                id: i,
                questionStr: `Tim has ${hasItems} colorful marbles. Under a playground sandtree, he gives ${takesAway} marbles to his companion classmate. How many marbles does Tim have left now?`,
                blankSpaceLines: 2,
                answerKey: `${hasItems - takesAway}`,
                stepDetails: `\\text{Take away calculation: } ${hasItems} - ${takesAway} = ${hasItems - takesAway} \\text{ marbles remaining.}`
              });
            } else if (selectedGrade === 'G3' || selectedGrade === 'G4') {
              // Multiple groups or simple sharing
              const groupCount = (qSeed1 % 4) + 3; // 3 to 6 groups
              const applesPerGroup = (qSeed2 % 3) + 4; // 4 to 6 apples
              generated.push({
                id: i,
                questionStr: `There are ${groupCount} picnic baskets. Each basket contains exactly ${applesPerGroup} red apples. What is the total number of apples inside all the baskets?`,
                blankSpaceLines: 3,
                answerKey: `${groupCount * applesPerGroup}`,
                stepDetails: `\\text{Equal groups multiplier: } ${groupCount} \\text{ baskets} \\times ${applesPerGroup} \\text{ apples/basket} = ${groupCount * applesPerGroup} \\text{ apples.}`
              });
            } else {
              // G5-6 Fraction sharing or rate
              const totalPizza = 8;
              const spent = (qSeed1 % 3) + 2;
              generated.push({
                id: i,
                questionStr: `A family pizza is divided into ${totalPizza} equal slices. If Emily eats ${spent} slices, write down the fraction representing what remains of the pizza:`,
                blankSpaceLines: 3,
                answerKey: `${totalPizza - spent}/${totalPizza}`,
                stepDetails: `\\text{Emily ate } ${spent} \\text{ slices. Remaining slices: } ${totalPizza} - ${spent} = ${totalPizza - spent}. \\text{ Fraction is } \\frac{${totalPizza - spent}}{${totalPizza}}.`
              });
            }
            break;
          }

          case 'arithmetic':
          default: {
            if (selectedGrade === 'K') {
              // Single-digit addition facts under 10
              const x = (qSeed1 % 5) + 1;
              const y = (qSeed2 % 4) + 1;
              generated.push({
                id: i,
                questionStr: `Add the single-digit numbers:`,
                mathContent: `${x} + ${y}`,
                blankSpaceLines: 1,
                answerKey: `${x + y}`,
                stepDetails: `\\text{Result: } ${x} + ${y} = ${x + y}.`
              });
            } else if (selectedGrade === 'G1') {
              // Double digit plus single digit without regrouping (e.g., 23 + 4 = 27)
              const x1 = (qSeed1 % 3) * 10 + 20; // 20, 30, 40
              const x2 = (qSeed1 % 5); // units (0 to 4)
              const num1 = x1 + x2;
              const num2 = (qSeed2 % 5); // digit under 5 so no regrouping occurs
              const sum = num1 + num2;

              generated.push({
                id: i,
                questionStr: `Add the numbers carefully. No regrouping needed:`,
                mathContent: `${num1} + ${num2}`,
                blankSpaceLines: 2,
                answerKey: `${sum}`,
                stepDetails: `\\text{Add place values separately: } ${num1} + ${num2} = ${sum}.`
              });
            } else if (selectedGrade === 'G2') {
              // 2-digit with regrouping
              const num1 = (qSeed1 % 6) * 10 + 28; // e.g., 28 to 78
              const num2 = (qSeed2 % 7) + 15; // e.g., 15 to 21
              const sum = num1 + num2;

              generated.push({
                id: i,
                questionStr: `Solve the double-digit addition (Regrouping may be required):`,
                mathContent: `${num1} + ${num2}`,
                blankSpaceLines: 3,
                answerKey: `${sum}`,
                stepDetails: `\\text{Regrouping units: }  \\text{Sum is } ${num1} + ${num2} = ${sum}.`
              });
            } else if (selectedGrade === 'G3') {
              // Triple digit addition / subtraction - standard K5 testing
              const num1 = qSeed1 * 12 + 150;
              const num2 = qSeed2 * 8 + 80;
              const isMinus = (i % 2 === 0);
              const answer = isMinus ? num1 - num2 : num1 + num2;

              generated.push({
                id: i,
                questionStr: isMinus ? `Subtract the numbers using triple-digit column subtraction:` : `Add the triple-digit numbers carefully:`,
                mathContent: isMinus ? `${num1} - ${num2}` : `${num1} + ${num2}`,
                blankSpaceLines: 3,
                answerKey: `${answer}`,
                stepDetails: isMinus 
                  ? `\\text{Evaluate: } ${num1} - ${num2} = ${answer}.`
                  : `\\text{Evaluate: } ${num1} + ${num2} = ${answer}.`
              });
            } else if (selectedGrade === 'G4') {
              // Simple multiplication column values
              const x = (qSeed1 % 10) + 3; // 3 to 12
              const y = (qSeed2 % 9) + 3; // 3 to 11
              generated.push({
                id: i,
                questionStr: `Find the product of these values:`,
                mathContent: `${x} \\times ${y}`,
                blankSpaceLines: 2,
                answerKey: `${x * y}`,
                stepDetails: `\\text{Multiplication math: } ${x} \\times ${y} = ${x * y}.`
              });
            } else {
              // G5-6 Order of Operations (PEMDAS/BODMAS) - trademark advanced K5 worksheets
              const val1 = (qSeed1 % 5) + 3; // 3 to 7
              const val2 = (qSeed2 % 4) + 2; // 2 to 5
              const val3 = 2;
              const plusVal = (qSeed1 % 8) + 1;
              const computedAnswer = val1 * val2 - val3 + plusVal;

              generated.push({
                id: i,
                questionStr: `Apply the correct Order of Operations (PEMDAS) to evaluate the numeric expression:`,
                mathContent: `${val1} \\times ${val2} - ${val3} + ${plusVal}`,
                blankSpaceLines: 3,
                answerKey: `${computedAnswer}`,
                stepDetails: `\\text{First solve multiplication: } ${val1} \\times ${val2} = ${val1 * val2}. \\text{ Then subtract and add: } ${val1 * val2} - ${val3} + ${plusVal} = ${computedAnswer}.`
              });
            }
            break;
          }
        }
      }

      const matchedLabel = GRADE_LEVELS.find(g => g.id === selectedGrade)?.label || 'Primary';
      const matchedTopic = TOPICS.find(t => t.id === selectedTopic)?.label || 'Worksheet';
      setWorksheetTitle(`${matchedLabel} ${matchedTopic} — Volume ${seed}`);
      setQuestions(generated);
      
      setAnswersDraft({});
      setSubmittedAnswers(false);
      setEarnedStars(0);
      setScholarName('');
    };

    generateDynamicWorksheet();
  }, [selectedGrade, selectedTopic, questionsCount, seed, selectedCompanion]);

  const handlePrintWorksheet = () => {
    const worksheetElement = document.getElementById('printable-k5-paper');
    if (worksheetElement) {
      // Collect all document stylesheets to perfectly copy the styled tailwind theme context
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${worksheetTitle} (Print Copy)</title>
              <!-- Backup CDN references to guarantee perfect vector typography and padding inside print previews -->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;950&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              ${styleSheets}
              <script>
                tailwind.config = {
                  darkMode: 'class',
                  theme: {
                    extend: {
                      fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                        serif: ['Georgia', 'serif']
                      }
                    }
                  }
                }
              </script>
              <style>
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 15mm;
                  }
                  body {
                    background: white !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .print\\:break-inside-avoid {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }
                }
                body {
                  background: white !important;
                  color: #111827 !important;
                  font-family: 'Inter', sans-serif;
                  padding: 10px !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                /* Robust element stripper */
                .no-print, button, .audio-button, select, input, .companions-panel, .navigation-header {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                  height: 0 !important;
                  width: 0 !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .break-before-page {
                  page-break-before: always !important;
                  break-before: page !important;
                }
                .break-inside-avoid {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                /* Custom styles to force exact visual ledger lines */
                .ledger-lines-grid {
                  opacity: 0.65 !important;
                  border-color: #cbd5e1 !important;
                }
              </style>
            </head>
            <body class="${isKidsTheme ? 'bg-gradient-to-br from-emerald-50/20 to-blue-50/20' : 'bg-white'}">
              <div class="max-w-4xl mx-auto p-4">
                ${worksheetElement.outerHTML}
              </div>
              <script>
                // Execute active element cleanups within the cloned frame
                document.querySelectorAll('.no-print, button, .audio-button, select, input, .companions-panel').forEach(b => b.remove());
                
                // Automatically activate system printer dialogue
                setTimeout(() => {
                  window.print();
                  setTimeout(() => {
                    window.parent.document.body.removeChild(window.frameElement);
                  }, 1200);
                }, 800);
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } else {
      window.print();
    }
  };

  const handlePrintDiploma = () => {
    // Elegant single element print focus helper
    const certElement = document.getElementById('scholastic-diploma-print-area');
    if (certElement) {
      // Find all stylesheets and styled nodes from parent context to duplicate fully rendered theme
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <title>Scholastic Mathematics Diploma — ${scholarName || 'Primary Scholar'}</title>
              ${styleSheets}
              <style>
                body { 
                  background: white !important; 
                  color: black !important; 
                  padding: 24px !important; 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important;
                }
                .no-print, button { display: none !important; }
              </style>
            </head>
            <body class="bg-white">
              <div class="max-w-4xl mx-auto">
                ${certElement.outerHTML}
              </div>
              <script>
                // Strip the print buttons inside the cloned print area context
                const printButtons = document.querySelectorAll('.no-print, button');
                printButtons.forEach(btn => btn.remove());
                
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.frameElement.remove();
                    }, 500);
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  };

  const exportWorksheetBlueprint = () => {
    const dataObj = {
      meta: {
        title: worksheetTitle,
        grade: selectedGrade,
        topic: selectedTopic,
        seedValue: seed,
        classroomCompanion: selectedCompanion
      },
      exercises: questions.map(q => ({
        id: q.id,
        direction: q.questionStr,
        formula: q.mathContent || "",
        key: q.answerKey,
        solution_manual: q.stepDetails || ""
      }))
    };

    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k5_math_worksheet_set_${seed}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csvContent = "Question Number,Direction,Math Formula,Expected Answer,Solution Steps\n";
    
    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const direction = `"${q.questionStr.replace(/"/g, '""')}"`;
      const formula = `"${(q.mathContent || '').replace(/"/g, '""')}"`;
      const expectedAns = `"${q.answerKey.replace(/"/g, '""')}"`;
      const steps = `"${(q.stepDetails || '').replace(/"/g, '""')}"`;
      
      csvContent += `${qNum},${direction},${formula},${expectedAns},${steps}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k5_worksheet_set_${seed}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    let mdContent = `# ${worksheetTitle}\n\n`;
    mdContent += `**School:** ${customSchoolName || 'Primary School Mathematics Sandbox'}\n`;
    mdContent += `**Date:** __________________ | **Student Name:** _________________\n\n`;
    if (customInstructions) {
      mdContent += `> *Instructions:* ${customInstructions}\n\n`;
    }
    mdContent += `---\n\n`;
    
    questions.forEach((q, idx) => {
      mdContent += `### Question ${idx + 1}\n`;
      mdContent += `${q.questionStr}\n\n`;
      if (q.mathContent) {
        mdContent += `$$ ${q.mathContent} $$\n\n`;
      }
      mdContent += `*Your Workspace:*\n\n\n\n`;
      mdContent += `*Answer:* ____________________\n\n`;
      mdContent += `---\n\n`;
    });
    
    mdContent += `\n# ANSWER KEY & SOLUTIONS SET\n\n`;
    questions.forEach((q, idx) => {
      mdContent += `**Q${idx + 1} Correct Answer:** \`${q.answerKey}\`\n`;
      if (q.stepDetails) {
        mdContent += `*Detailed Solution Steps:* \`${q.stepDetails}\`\n\n`;
      }
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k5_worksheet_set_${seed}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleBookmark = (blueprintId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedBlueprints(prev => {
      if (prev.includes(blueprintId)) {
        return prev.filter(id => id !== blueprintId);
      } else {
        return [...prev, blueprintId];
      }
    });
  };

  const handleGradeWorksheet = () => {
    let score = 0;
    questions.forEach(q => {
      if (checkK5Answer(q, answersDraft[q.id])) {
        score++;
      }
    });
    setEarnedStars(score);
    setSubmittedAnswers(true);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="k5worksheets_section">
      
      {/* 🌟 Navigation Hub & Breadcrumbs / Playroom Header */}
      <div className="bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 border border-teal-500/20 rounded-[2.5rem] p-6 md:p-8 space-y-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-1.5">
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold tracking-wide">
              <span>Academic Bench</span>
              <span className="opacity-50">/</span>
              <span className="text-emerald-400">K-5 Math Lab</span>
              <span className="opacity-50">/</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px]">&beta; Live Simulator</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-brand-text tracking-tight flex items-center gap-2">
              <span className="text-teal-400 animate-bounce">🦖</span> K-5 Math Playroom <span className="text-brand-primary">&amp;</span> Workshop
            </h1>
            <p className="text-brand-text-secondary text-sm max-w-2xl font-light">
              Welcome, primary students, elementary tutors, and parents! Click a quick-start template below or use the custom designer panel to render elegant high-contrast workshops.
            </p>
          </div>

          {/* Quick Stats or Active Kid Avatar */}
          <div className="flex items-center gap-4 bg-brand-bg/60 p-4 rounded-2xl border border-brand-border/40 shrink-0 shadow-inner">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl relative">
              <Smile size={24} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-brand-bg" />
            </div>
            <div>
              <div className="text-xs text-brand-text-secondary font-medium">Earned Rewards</div>
              <div className="text-lg font-black text-brand-text flex items-center gap-1.5">
                <span>{earnedStars} <span className="text-teal-400 font-serif">★</span></span>
                <span className="text-[10px] text-zinc-500 font-normal">in interactive mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-select Grade strip */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-brand-text-secondary tracking-widest block font-sans">
            Quick Jump Grade Filter:
          </span>
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map(g => {
              const isActive = selectedGrade === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGrade(g.id);
                    // Automatically choose first suitable topic or reset to a nice topic
                    if (g.id === 'K') setSelectedTopic('counting_kids');
                    else if (g.id === 'G1' || g.id === 'G2') setSelectedTopic('clock_time');
                    else if (g.id === 'G3') setSelectedTopic('money_math');
                    else if (g.id === 'G4') setSelectedTopic('fractions_sum');
                    else setSelectedTopic('geometry');
                    
                    setSubmittedAnswers(false);
                    setAnswersDraft({});
                  }}
                  className={`flex-1 min-w-[70px] py-2 md:py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-transparent text-brand-bg shadow-lg shadow-teal-500/10 font-black scale-105 animate-fade-in'
                      : 'bg-brand-bg/50 border-brand-border/40 hover:bg-brand-surface text-brand-text-secondary hover:text-brand-text'
                  }`}
                >
                  <div className="text-[10px] opacity-75">{g.label}</div>
                  <div className="text-sm font-black tracking-tight mt-0.5">{g.id}</div>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-brand-border/10" />

        {/* Quick Launchpad Templates Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid size={13} className="text-teal-400" />
              <span className="text-[10px] font-black uppercase text-brand-text-secondary tracking-widest font-sans">
                Quick Start Play Templates (1-Click Load)
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: 'Dino Counting',
                badge: 'K - Count',
                grade: 'K',
                topic: 'counting_kids',
                icon: '🦖',
                companion: '🦖',
                count: 6,
                desc: 'Count visual dragons',
                color: 'from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-400'
              },
              {
                title: 'Telling Time',
                badge: 'G2 - Clocks',
                grade: 'G2',
                topic: 'clock_time',
                icon: '⏰',
                companion: '🦖',
                count: 6,
                desc: 'Read analog clock dials',
                color: 'from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-400'
              },
              {
                title: 'Register Math',
                badge: 'G3 - Money',
                grade: 'G3',
                topic: 'money_math',
                icon: '🪙',
                companion: '🦖',
                count: 6,
                desc: 'Calculate coins & change',
                color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-400'
              },
              {
                title: 'Pizza Fractions',
                badge: 'G4 - Visual',
                grade: 'G4',
                topic: 'fractions_sum',
                icon: '🍕',
                companion: '🦖',
                count: 6,
                desc: 'Add circular portion circles',
                color: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-400'
              },
              {
                title: 'Shapes & border',
                badge: 'G5 - Geometry',
                grade: 'G5',
                topic: 'geometry',
                icon: '📐',
                companion: '🦖',
                count: 6,
                desc: 'Area & perimeter math',
                color: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20 text-indigo-400'
              },
              {
                title: 'Decimals Grid',
                badge: 'G6 - Decimals',
                grade: 'G6',
                topic: 'decimals',
                icon: '🧠',
                companion: '🦖',
                count: 8,
                desc: 'Decimal multiplication',
                color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-yellow-400'
              }
            ].map(preset => {
              const isCurrentlySelected = selectedGrade === preset.grade && selectedTopic === preset.topic;
              return (
                <button
                  key={preset.title}
                  onClick={() => {
                    setSelectedGrade(preset.grade);
                    setSelectedTopic(preset.topic);
                    setQuestionsCount(preset.count);
                    setSelectedCompanion(preset.companion);
                    setSeed(Math.floor(Math.random() * 500) + 1);
                    setSubmittedAnswers(false);
                    setAnswersDraft({});
                    setIsInteractive(true);
                  }}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group hover:scale-[1.02] hover:shadow-md h-full justify-between ${
                    isCurrentlySelected 
                      ? 'bg-brand-surface border-teal-500 ring-1 ring-teal-500/30 shadow' 
                      : 'bg-brand-bg/40 hover:bg-brand-surface border-brand-border/40'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-2 gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-bg/80 border truncate max-w-[80px] ${preset.color}`}>
                        {preset.badge}
                      </span>
                      <span className="text-base group-hover:animate-bounce shrink-0">{preset.icon}</span>
                    </div>
                    <div className="font-bold text-xs text-brand-text line-clamp-1">{preset.title}</div>
                    <div className="text-[10px] text-brand-text-secondary mt-1 line-clamp-2 leading-relaxed font-light">
                      {preset.desc}
                    </div>
                  </div>
                  
                  {isCurrentlySelected && (
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-brand-border/10" />

        {/* Expandable 100+ Curriculum Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsCurriculumExpanded(!isCurriculumExpanded);
                if (!isCurriculumExpanded) {
                  setCurriculumPage(1);
                }
              }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-brand-bg/60 border border-brand-border/50 hover:bg-brand-surface hover:border-teal-500/40 text-brand-text transition-all group shadow-inner text-left w-full md:w-auto"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">📚</span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5 flex-wrap">
                  <span>Curriculum Library Catalog</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono">100 Premium Blueprints</span>
                </div>
                <div className="text-[11px] text-brand-text-secondary font-light mt-0.5">
                  {isCurriculumExpanded ? 'Hide' : 'Explore'} the comprehensive primary mathematics lesson catalog
                </div>
              </div>
              <div className="ml-auto md:ml-6 pl-4">
                <ChevronDown
                  size={16}
                  className={`text-brand-text-secondary group-hover:text-teal-400 transition-transform duration-300 ${
                    isCurriculumExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          <AnimatePresence>
            {isCurriculumExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden space-y-6 pt-2"
              >
                {/* Advanced Catalog Filters */}
                <div className="bg-brand-bg/80 border border-brand-border/40 rounded-3xl p-5 md:p-6 space-y-5 shadow-inner">
                  
                  {/* Search and chip shortcuts bar */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Search box column */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary pl-1">
                          🔍 Instant Lesson Blueprint Search Engine
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={curriculumSearchText === '__bookmarked__' ? '' : curriculumSearchText}
                            onChange={(e) => {
                              setCurriculumSearchText(e.target.value);
                              setCurriculumPage(1);
                            }}
                            placeholder={curriculumSearchText === '__bookmarked__' ? "Filtering Favorites. Click click tags to clear filter..." : "Search e.g. Space, Dino, Pizza, Addition, Grade 3..."}
                            className={`w-full border rounded-xl px-3.5 py-2 pl-9 text-xs font-semibold outline-none transition-all ${
                              curriculumSearchText === '__bookmarked__' 
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                                : 'bg-brand-surface/80 border-brand-border/60 hover:border-teal-500/40 focus:border-teal-500/80 text-brand-text placeholder-zinc-500'
                            }`}
                          />
                          <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
                          {curriculumSearchText && (
                            <button
                              onClick={() => {
                                setCurriculumSearchText('');
                                setCurriculumPage(1);
                              }}
                              className="absolute right-3 top-2 text-[9px] font-black uppercase tracking-wider bg-brand-bg/80 hover:bg-brand-border px-2 py-1 rounded text-brand-text-secondary hover:text-brand-text transition-all"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Instant metrics or favorites summary count */}
                      <div className="md:col-span-1 bg-brand-surface/50 border border-brand-border/40 hover:border-teal-500/20 px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all self-end h-10">
                        <div className="flex items-center gap-1.5">
                          <Bookmark size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-black text-brand-text uppercase tracking-widest">My Bookmarked Lessons</span>
                        </div>
                        <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/20">
                          {bookmarkedBlueprints.length} Bookmarked
                        </span>
                      </div>
                    </div>

                    {/* Quick filter shortcut search keywords tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pl-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-text-secondary mr-2">Quick Tags:</span>
                      {[
                        { label: 'All lessons', val: '' },
                        { label: '🦖 Dino', val: 'dinosaur' },
                        { label: '🚀 Space', val: 'space' },
                        { label: '🎂 Bakery', val: 'bakery' },
                        { label: '🦁 Safari', val: 'safari' },
                        { label: '🕵️‍♂️ Detective', val: 'detective' },
                        { label: '⭐ Starred Favs', val: '__bookmarked__' }
                      ].map((chip) => {
                        const isChosen = curriculumSearchText === chip.val;
                        return (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => {
                              setCurriculumSearchText(chip.val);
                              setCurriculumPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight border transition-all ${
                              isChosen 
                                ? 'bg-teal-500/20 border-teal-500 text-teal-400 scale-[1.03]' 
                                : chip.val === '__bookmarked__'
                                ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/25 text-amber-400'
                                : 'bg-brand-surface border-brand-border/40 hover:bg-brand-border hover:border-teal-500/20 text-brand-text-secondary hover:text-brand-text'
                            }`}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dropdown Filters Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                    {/* Grade Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary pl-0.5">Grade Level</label>
                      <select
                        value={curriculumGradeFilter}
                        onChange={(e) => {
                          setCurriculumGradeFilter(e.target.value);
                          setCurriculumPage(1);
                        }}
                        className="w-full bg-brand-surface/80 border border-brand-border/60 hover:border-teal-500/40 focus:border-teal-500/80 rounded-xl px-2.5 py-2 text-xs font-bold text-brand-text outline-none transition-all cursor-pointer"
                      >
                        <option value="All">All Grades (K-6)</option>
                        {GRADE_LEVELS.map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.id})</option>
                        ))}
                      </select>
                    </div>

                    {/* Topic selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary pl-0.5">Core Subject</label>
                      <select
                        value={curriculumTopicFilter}
                        onChange={(e) => {
                          setCurriculumTopicFilter(e.target.value);
                          setCurriculumPage(1);
                        }}
                        className="w-full bg-brand-surface/80 border border-brand-border/60 hover:border-teal-500/40 focus:border-teal-500/80 rounded-xl px-2.5 py-2 text-xs font-bold text-brand-text outline-none transition-all cursor-pointer"
                      >
                        <option value="All">All Topics / Core Subjects</option>
                        {TOPICS.map(t => (
                          <option key={t.id} value={t.id}>{t.label.split(' & ')[0]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary pl-0.5">Complexity Level</label>
                      <select
                        value={curriculumDifficultyFilter}
                        onChange={(e) => {
                          setCurriculumDifficultyFilter(e.target.value as any);
                          setCurriculumPage(1);
                        }}
                        className="w-full bg-brand-surface/80 border border-brand-border/60 hover:border-teal-500/40 focus:border-teal-500/80 rounded-xl px-2.5 py-2 text-xs font-bold text-brand-text outline-none transition-all cursor-pointer"
                      >
                        <option value="All">All Complexity</option>
                        <option value="Easy">Easy (K - Grade 1)</option>
                        <option value="Medium">Medium (Grades 2 - 4)</option>
                        <option value="Hard">Hard (Grades 5 - 6)</option>
                      </select>
                    </div>

                    {/* Sorting selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary pl-0.5">Sort Attribute</label>
                      <select
                        value={curriculumSortBy}
                        onChange={(e) => {
                          setCurriculumSortBy(e.target.value as any);
                          setCurriculumPage(1);
                        }}
                        className="w-full bg-brand-surface/80 border border-brand-border/60 hover:border-teal-500/40 focus:border-teal-500/80 rounded-xl px-2.5 py-2 text-xs font-bold text-brand-text outline-none transition-all cursor-pointer"
                      >
                        <option value="id">Blueprint ID</option>
                        <option value="title">Alphabetical Title</option>
                        <option value="count">Count of Problems</option>
                      </select>
                    </div>

                    {/* Sort Order Button column */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary pl-0.5">Toggle Order</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCurriculumSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          setCurriculumPage(1);
                        }}
                        className="w-full bg-brand-surface/80 hover:bg-brand-border hover:border-teal-500/40 border border-brand-border/60 rounded-xl px-2.5 py-2 text-xs font-bold text-brand-text outline-none transition-all flex items-center justify-center gap-1.5 h-[34px]"
                      >
                        <ArrowUpDown size={11} className="text-teal-400" />
                        <span>{curriculumSortOrder === 'asc' ? 'Ascending ⇅' : 'Descending ⇅'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Programmatic Match Metrics */}
                  {(() => {
                    const getDifficultyForGrade = (g: string) => {
                      if (g === 'K' || g === 'G1') return 'Easy';
                      if (g === 'G2' || g === 'G3' || g === 'G4') return 'Medium';
                      return 'Hard';
                    };

                    const matchedWithDifficulty = ALL_TEMPLATES.map(item => ({
                      ...item,
                      difficulty: getDifficultyForGrade(item.grade)
                    }));

                    const filtered = matchedWithDifficulty.filter(item => {
                      const matchesSearch = curriculumSearchText === '__bookmarked__'
                        ? bookmarkedBlueprints.includes(item.id)
                        : item.title.toLowerCase().includes(curriculumSearchText.toLowerCase()) ||
                          item.desc.toLowerCase().includes(curriculumSearchText.toLowerCase()) ||
                          item.topicLabel.toLowerCase().includes(curriculumSearchText.toLowerCase());
                      const matchesGrade = curriculumGradeFilter === 'All' || item.grade === curriculumGradeFilter;
                      const matchesTopic = curriculumTopicFilter === 'All' || item.topic === curriculumTopicFilter;
                      const matchesDifficulty = curriculumDifficultyFilter === 'All' || item.difficulty === curriculumDifficultyFilter;
                      return matchesSearch && matchesGrade && matchesTopic && matchesDifficulty;
                    });

                    // Perform sort on results
                    const sorted = [...filtered].sort((a, b) => {
                      let fieldA: any = a[curriculumSortBy];
                      let fieldB: any = b[curriculumSortBy];
                      
                      if (curriculumSortBy === 'title') {
                        fieldA = a.title.toLowerCase();
                        fieldB = b.title.toLowerCase();
                      }
                      
                      if (fieldA < fieldB) return curriculumSortOrder === 'asc' ? -1 : 1;
                      if (fieldA > fieldB) return curriculumSortOrder === 'asc' ? 1 : -1;
                      return 0;
                    });

                    const itemsPerPage = 8;
                    const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
                    const pageStart = (curriculumPage - 1) * itemsPerPage;
                    const paginatedItems = sorted.slice(pageStart, pageStart + itemsPerPage);

                    // Dynamic fast action to select random blueprint
                    const selectRandomMatch = () => {
                      if (sorted.length > 0) {
                        const randomItem = sorted[Math.floor(Math.random() * sorted.length)];
                        setSelectedGrade(randomItem.grade);
                        setSelectedTopic(randomItem.topic);
                        setQuestionsCount(randomItem.count);
                        setSelectedCompanion(randomItem.companion);
                        setSeed(randomItem.seed);
                        setSubmittedAnswers(false);
                        setAnswersDraft({});
                        setIsInteractive(true);
                      }
                    };

                    return (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-brand-text-secondary font-medium px-1">
                          <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1 rounded-full border border-brand-border/50">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <span>Found <strong>{sorted.length}</strong> active lesson blueprints matching query</span>
                          </div>

                          {sorted.length > 0 && (
                            <button
                              onClick={selectRandomMatch}
                              className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/20 transition-all shadow-sm"
                            >
                              🎲 Quick Load Random Match
                            </button>
                          )}
                        </div>

                        {sorted.length === 0 ? (
                          <div className="text-center py-10 bg-brand-surface/40 rounded-2xl border border-dashed border-brand-border flex flex-col items-center justify-center gap-2">
                            <span className="text-2xl">🐱</span>
                            <div className="text-sm font-bold text-brand-text">No blueprints found</div>
                            <div className="text-xs text-brand-text-secondary font-light">Try relaxing your search keywords or grade filter tags.</div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                            {paginatedItems.map((preset) => {
                              const isCurrentlySelected = selectedGrade === preset.grade && selectedTopic === preset.topic && seed === preset.seed;
                              const isBookmarked = bookmarkedBlueprints.includes(preset.id);
                              
                              return (
                                <button
                                  key={preset.id}
                                  onClick={() => {
                                    setSelectedGrade(preset.grade);
                                    setSelectedTopic(preset.topic);
                                    setQuestionsCount(preset.count);
                                    setSelectedCompanion(preset.companion);
                                    setSeed(preset.seed);
                                    setSubmittedAnswers(false);
                                    setAnswersDraft({});
                                    setIsInteractive(true);
                                  }}
                                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group hover:scale-[1.02] hover:shadow-lg min-h-[148px] justify-between ${
                                    isCurrentlySelected 
                                      ? 'bg-brand-surface border-teal-500 ring-2 ring-teal-500/20 shadow-md shadow-teal-500/5' 
                                      : 'bg-brand-surface/40 hover:bg-brand-surface border-brand-border/40 hover:border-teal-500/20'
                                  }`}
                                >
                                  <div className="w-full">
                                    <div className="flex items-center justify-between w-full mb-2 gap-1.5">
                                      <div className="flex items-center gap-1">
                                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-bg/80 border truncate ${preset.color}`}>
                                          {preset.badge}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                          preset.difficulty === 'Easy' 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                            : preset.difficulty === 'Medium'
                                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                        }`}>
                                          {preset.difficulty}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1.5 shrink-0 animate-fade-in">
                                        {/* Bookmark trigger star button */}
                                        <div
                                          onClick={(e) => toggleBookmark(preset.id, e)}
                                          className={`p-1 rounded-md border transition-all cursor-pointer ${
                                            isBookmarked 
                                              ? 'bg-amber-400/20 border-amber-400/30 text-amber-400' 
                                              : 'bg-brand-bg/60 border-brand-border/45 text-brand-text-secondary hover:text-amber-400 hover:bg-brand-border/60'
                                          }`}
                                          title={isBookmarked ? "Remove from bookmarks" : "Bookmark lesson blueprint"}
                                        >
                                          <Bookmark size={11} className={isBookmarked ? "fill-amber-400 text-amber-400" : ""} />
                                        </div>
                                        <span className="text-sm group-hover:scale-125 transition-transform">{preset.icon}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="font-extrabold text-xs text-brand-text line-clamp-1 group-hover:text-teal-400 transition-colors pt-0.5">{preset.title}</div>
                                    <div className="text-[10px] text-brand-text-secondary mt-1 line-clamp-2 leading-relaxed font-light">
                                      {preset.desc}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between w-full pt-1.5 mt-2 border-t border-brand-border/20">
                                    <span className="text-[9px] text-zinc-500 font-mono">ID #{preset.id} &bull; {preset.count}Q &bull; {preset.companion}</span>
                                    {isCurrentlySelected ? (
                                      <span className="text-[9px] font-extrabold text-teal-400 flex items-center gap-1 bg-teal-500/10 px-1.5 py-0.5 rounded">Active ★</span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">Load &rarr;</span>
                                    )}
                                  </div>
                                  
                                  {isCurrentlySelected && (
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500 to-emerald-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Pagination Selector Panel */}
                        {sorted.length > itemsPerPage && (
                          <div className="flex items-center justify-between pt-4 border-t border-brand-border/10">
                            <span className="text-xs text-brand-text-secondary font-medium">
                              Page <strong>{curriculumPage}</strong> of {totalPages}
                            </span>
                            
                            <div className="flex gap-2">
                              <button
                                disabled={curriculumPage === 1}
                                onClick={() => setCurriculumPage(prev => Math.max(1, prev - 1))}
                                className="p-2 bg-brand-surface hover:bg-brand-border rounded-xl border border-brand-border/60 text-brand-text-secondary hover:text-brand-text disabled:opacity-30 disabled:hover:bg-brand-surface disabled:hover:text-brand-text-secondary transition-all font-bold"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <button
                                disabled={curriculumPage === totalPages}
                                onClick={() => setCurriculumPage(prev => Math.min(totalPages, prev + 1))}
                                className="p-2 bg-brand-surface hover:bg-brand-border rounded-xl border border-brand-border/60 text-brand-text-secondary hover:text-brand-text disabled:opacity-30 disabled:hover:bg-brand-surface disabled:hover:text-brand-text-secondary transition-all font-bold"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })()}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Control Rail Panel */}
        <div className="space-y-6 lg:col-span-1 bg-brand-surface/40 p-6 md:p-8 rounded-[2rem] border border-brand-border/50 backdrop-blur-md lg:sticky lg:top-24 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto custom-scrollbar pb-6 pr-1.5 print:hidden">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={11} className="text-teal-400 animate-pulse" /> K-5 Interactive Playroom
            </span>
            <h3 className="text-2xl font-black text-brand-text tracking-tight uppercase">K-5 Worksheet Builder</h3>
            <p className="text-brand-text-secondary text-xs font-light leading-relaxed">
              Design and export high-contrast arithmetic workspaces. Perfect for younger kids, parents, and elementary tutoring.
            </p>
          </div>

          <hr className="border-brand-border/30" />

          <div className="space-y-5">
            
            {/* Target Grade level selection tabs */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Primary Target Grade</label>
              <div className="grid grid-cols-4 gap-2">
                {GRADE_LEVELS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedGrade === g.id 
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-400 font-extrabold shadow-sm' 
                        : 'bg-brand-bg/40 border-brand-border hover:bg-brand-surface text-brand-text-secondary'
                    }`}
                  >
                    {g.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Focus list dropdown selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Math Topic Focus</label>
              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-3 text-xs focus:ring-1 focus:ring-teal-500 outline-none cursor-pointer appearance-none font-bold"
                >
                  {TOPICS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Shape companion icon switcher for primary counting */}
            {selectedTopic === 'counting_kids' && (
              <div className="space-y-2 animate-fade-in p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">🦖 Select Counting Companion</label>
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {COMPANIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCompanion(c.id)}
                      className={`p-1.5 rounded-xl border text-base transition-all ${
                        selectedCompanion === c.id 
                          ? 'bg-teal-500/20 border-teal-500 text-white scale-110 shadow' 
                          : 'bg-brand-bg/40 border-brand-border hover:bg-brand-surface text-brand-text-secondary'
                      }`}
                      title={`${c.label}`}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scale and seed configurations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Questions Count</label>
                <input 
                  type="number"
                  min={1}
                  max={25}
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(Math.min(25, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Pattern Seed</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 999) + 1)}
                    className="p-2.5 bg-brand-bg hover:bg-brand-surface border border-brand-border rounded-xl text-xs"
                    title="Randomize worksheet seed"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>

          </div>

          <hr className="border-brand-border/30" />

          {/* Style Configuration Options */}
          <div className="space-y-3.5 pt-1">
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-black block">Playful Nature-Meadow Theme</span>
                <span className="text-[9px] text-brand-text-secondary leading-tight block">Meadow greens with curvy cards</span>
              </div>
              <button
                onClick={() => setIsKidsTheme(!isKidsTheme)}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  isKidsTheme ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isKidsTheme ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-black block">Interactive Solving Mode</span>
                <span className="text-[9px] text-brand-text-secondary leading-tight block">Enter questions directly on screen</span>
              </div>
              <button
                onClick={() => {
                  setIsInteractive(!isInteractive);
                  setAnswersDraft({});
                  setSubmittedAnswers(false);
                  setEarnedStars(0);
                }}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  isInteractive ? 'bg-teal-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isInteractive ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-black block">Pencil Answer Grid Lines</span>
                <span className="text-[9px] text-brand-text-secondary leading-tight block">Render ledger blank grids under statements</span>
              </div>
              <button
                onClick={() => setShowGridWorkspace(!showGridWorkspace)}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  showGridWorkspace ? 'bg-teal-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showGridWorkspace ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-black block">Teacher Disclouse Keys</span>
                <span className="text-[9px] text-brand-text-secondary leading-tight block">Show steps on active screens</span>
              </div>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  showAnswerKey ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showAnswerKey ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-black block">Include Keys in Printable PDF</span>
                <span className="text-[9px] text-brand-text-secondary leading-tight block">Add final key solutions to print file</span>
              </div>
              <button
                onClick={() => setPrintSolutions(!printSolutions)}
                className={`relative inline-flex inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  printSolutions ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  printSolutions ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Collapsible Print Customizer & Styling Accordion */}
            <div className="bg-brand-surface/40 p-4 rounded-2xl border border-brand-border/40 space-y-3 mt-4">
              <button 
                onClick={() => setExpandPrintDesigner(!expandPrintDesigner)}
                className="w-full flex items-center justify-between text-left group outline-none"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={13} className="text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-xs text-brand-text font-black uppercase tracking-wider">✏️ Print Layout Styling</span>
                </div>
                <ChevronDown size={14} className={`text-brand-text-secondary transition-transform duration-200 ${expandPrintDesigner ? 'rotate-180' : ''}`} />
              </button>
              
              {expandPrintDesigner && (
                <div className="pt-2.5 space-y-3.5 border-t border-brand-border/20 animate-fade-in text-xs">
                  {/* Custom School Title */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">Classroom / School Title</label>
                    <input 
                      type="text" 
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      placeholder="e.g. Mrs. Smith's Math Class"
                      className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-teal-500/80 font-medium"
                    />
                  </div>

                  {/* Custom Directions / Teacher Instructions */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">Custom Teacher Note / Instructions</label>
                    <textarea 
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Solve step-by-step. Space is for drawing. Due Friday!"
                      rows={2}
                      className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-2.5 py-1.5 text-xs text-brand-text outline-none focus:border-teal-500/80 font-medium resize-none placeholder-zinc-600"
                    />
                  </div>

                  {/* Font Size & Grid Type select */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">Print Font Size</label>
                      <select 
                        value={printFontSize}
                        onChange={(e) => setPrintFontSize(e.target.value as any)}
                        className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-1.5 text-xs outline-none focus:border-teal-500/85 font-semibold"
                      >
                        <option value="sm">Compact (Small)</option>
                        <option value="base">Standard (Normal)</option>
                        <option value="lg">Large (Younger)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">Writing Workspace</label>
                      <select 
                        value={gridStyle}
                        onChange={(e) => setGridStyle(e.target.value as any)}
                        className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-1.5 text-xs outline-none focus:border-teal-500/85 font-semibold"
                      >
                        <option value="grid">Graph Grid Boxes</option>
                        <option value="lines">Lined Paper Lines</option>
                        <option value="dots">Geometric Dots</option>
                        <option value="blank">Blank Area Workspace</option>
                      </select>
                    </div>
                  </div>

                  {/* Append separate solutions master guide page */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-black text-brand-text block">Separate Answer Key Page</span>
                      <span className="text-[8px] text-brand-text-secondary leading-none">Append full solutions guide to printed copy</span>
                    </div>
                    <button
                      onClick={() => setAppendSolutionsOnPrint(!appendSolutionsOnPrint)}
                      className={`relative inline-flex items-center h-5 w-10 bg-brand-bg rounded-full transition-colors duration-200 border border-brand-border/60 ${
                        appendSolutionsOnPrint ? 'bg-teal-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        appendSolutionsOnPrint ? 'translate-x-[1.2rem]' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-brand-border/30">
            <button
              onClick={handlePrintWorksheet}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-600/20 relative group overflow-hidden"
              title="Print directly or save as vector PDF file"
            >
              <Printer size={14} className="group-hover:scale-110 transition-transform" /> Direct Print / Save PDF
              <div className="absolute top-0 right-0 p-1 px-1.5 bg-amber-500 text-zinc-950 font-black text-[7px] tracking-normal rounded-bl-lg">HQ VECTOR</div>
            </button>

            {/* Direct PDF saving guide annotation */}
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 text-[10px] text-brand-text-secondary leading-relaxed font-sans space-y-1 text-left">
              <p className="font-semibold text-emerald-400 flex items-center gap-1">
                <span>💡</span> <span>Digital PDF &amp; Printer Setup Guide</span>
              </p>
              <p className="font-light">
                Clicking <strong className="text-brand-text">Print / Save PDF</strong> opens your system dialogue. In <strong className="text-brand-text">Destination</strong>:
              </p>
              <ul className="list-disc pl-3.5 space-y-0.5 font-light">
                <li>Choose <strong className="text-brand-text">your physical printer's name</strong> to print active homework sheets instantly.</li>
                <li>Choose <strong className="text-brand-text">"Save as PDF"</strong> or <strong className="text-brand-text">"Microsoft Print to PDF"</strong> to download a digital, pixel-perfect document.</li>
              </ul>
            </div>
            
            <div className="text-[10px] font-black uppercase text-brand-text-secondary tracking-widest pt-2.5 pl-1 text-left">Export Solutions &amp; Formats</div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={exportWorksheetBlueprint}
                className="flex flex-col items-center justify-center gap-1.5 py-2.5 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-semibold text-[10px] uppercase tracking-wider transition-all"
                title="Export JSON lesson blueprint"
              >
                <Download size={13} className="text-teal-400" />
                <span>JSON</span>
              </button>
              
              <button
                onClick={exportToCSV}
                className="flex flex-col items-center justify-center gap-1.5 py-2.5 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-semibold text-[10px] uppercase tracking-wider transition-all"
                title="Export custom CSV data file"
              >
                <FileSpreadsheet size={13} className="text-emerald-400" />
                <span>CSV Table</span>
              </button>

              <button
                onClick={exportToMarkdown}
                className="flex flex-col items-center justify-center gap-1.5 py-2.5 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-semibold text-[10px] uppercase tracking-wider transition-all"
                title="Export clean markdown document file"
              >
                <FileText size={13} className="text-purple-400" />
                <span>MD Doc</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Preview Worksheet Canvas */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Milestone Certified Award Card */}
          {submittedAnswers && isInteractive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 md:p-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 print:hidden"
            >
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="p-1 px-2.5 bg-white/25 rounded-md text-[9px] font-black uppercase tracking-wider">
                    🏆 Certified Milestone Achieved
                  </div>
                </div>
                <h4 className="text-2xl md:text-3xl font-black tracking-tight font-serif">
                  {earnedStars === questionsCount ? '🌟 Mathematical Mastermind!' : '🎉 Awesome Practice Work!'}
                </h4>
                <p className="text-xs text-teal-50 max-w-sm font-medium leading-relaxed">
                  Excellent steps! You got <strong className="font-extrabold">{earnedStars} out of {questionsCount}</strong> questions correct! Customize your certified math trophy certificate below.
                </p>

                {/* Enter Scholar Name Box for diploma creation */}
                <div className="pt-2 text-left">
                  <label className="text-[9px] uppercase font-black tracking-widest text-teal-100 block ml-0.5">Enter Scholar's Full Name (Trophy Certificate):</label>
                  <div className="flex gap-2 max-w-xs pt-1.5">
                    <input 
                      type="text"
                      value={scholarName}
                      onChange={(e) => setScholarName(e.target.value)}
                      placeholder="e.g. Arthur Pendragon"
                      className="w-full px-3 py-1.5 bg-white/10 placeholder:text-white/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 bg-white/10 p-5 rounded-3xl border border-white/25 text-center shrink-0 min-w-[150px]">
                <div className="text-[9px] font-black tracking-widest uppercase text-teal-100">Gold Star Awards</div>
                <div className="text-4xl font-black flex items-center justify-center gap-1 leading-none py-1.5">
                  {earnedStars} <span className="text-yellow-300 animate-pulse">⭐</span>
                </div>
                <button
                  onClick={() => {
                    setAnswersDraft({});
                    setSubmittedAnswers(false);
                    setEarnedStars(0);
                    setScholarName('');
                  }}
                  className="px-3.5 py-1.5 bg-white text-teal-800 rounded-lg text-[9px] font-black uppercase tracking-wider shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Restart Test
                </button>
              </div>
            </motion.div>
          )}

          {/* Interactive Frame Diploma block (visible when submitted with scholarName) */}
          <AnimatePresence>
            {submittedAnswers && scholarName.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="print:block"
              >
                <div 
                  id="scholastic-diploma-print-area"
                  className="p-8 md:p-12 bg-indigo-50/10 border-8 border-yellow-400 rounded-[3rem] text-center space-y-6 relative overflow-hidden shadow-2xl bg-[radial-gradient(#fbfcfd_1px,transparent_1px)] bg-[size:16px_16px]"
                  style={{ borderStyle: 'double' }}
                >
                  {/* Decorative gold background circles */}
                  <div className="absolute top-2 right-2 opacity-5 text-zinc-900 pointer-events-none select-none">
                    <Award size={150} />
                  </div>
                  
                  <div className="flex justify-center flex-col items-center space-y-2">
                    <div className="p-2.5 bg-yellow-400/20 text-yellow-600 rounded-full">
                      <Award size={36} className="animate-spin-slow" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-900">
                      Scholastic Certified Milestone
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-slate-950 font-serif lowercase tracking-wide first-letter:uppercase">
                    Diploma of Mathematics Wisdom
                  </h2>

                  <p className="text-sm text-zinc-600 max-w-xl mx-auto italic font-serif leading-relaxed">
                    This official certificate is proudly awarded with honor to the young scholar listed below for demonstrating outstanding arithmetic precision and brilliant problem reasoning:
                  </p>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl md:text-4xl font-extrabold text-teal-800 underline font-serif tracking-tight decoration-yellow-400 decoration-wavy">
                      {scholarName}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    For successfully completing the rigorous <strong>{GRADE_LEVELS.find(g => g.id === selectedGrade)?.label} {TOPICS.find(t => t.id === selectedTopic)?.label} homework suite</strong> with a marvelous grade score accuracy of {earnedStars} / {questionsCount} stars!
                  </p>

                  <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-6 border-t border-zinc-200">
                    <div className="text-left font-serif text-xs text-zinc-600 space-y-1">
                      <p><strong>Signed by:</strong> <span className="italic text-teal-700 font-bold">The AI Math Coach</span></p>
                      <p className="text-[10px] text-zinc-400">Computational Academic Supervisor</p>
                    </div>
                    <div className="text-right text-xs text-zinc-600 flex flex-col items-end justify-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 text-white flex items-center justify-center font-black animate-pulse shadow-md border-2 border-white select-none">
                        ⭐
                      </div>
                      <span className="text-[9px] uppercase font-black text-yellow-600 mt-1">Official Gold Seal</span>
                    </div>
                  </div>

                  {/* Print Diploma ONLY Action Indicator */}
                  <div className="pt-2 print:hidden no-print">
                    <button
                      onClick={handlePrintDiploma}
                      className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow-lg"
                    >
                      <Printer size={12} /> Print Diploma Frame Only
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Printable Homework Sheet Container */}
          <div 
            className={`transition-all duration-300 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0 ${
              isKidsTheme 
                ? 'bg-gradient-to-br from-emerald-50/70 via-teal-50/75 to-blue-50/70 border-4 border-teal-300 text-slate-800 rounded-[3rem] p-8 md:p-12 border-dashed'
                : 'bg-[#fafafa] border border-zinc-200 text-zinc-900 rounded-[2.5rem] p-8 md:p-12 font-serif'
            }`}
            style={{ fontFamily: isKidsTheme ? '"Inter", system-ui, sans-serif' : '"Georgia", serif' }}
            id="printable-k5-paper"
          >
            
            {isKidsTheme && (
              <div className="absolute top-4 right-10 flex gap-2 opacity-20 text-teal-600 print:hidden select-none">
                <Smile size={28} />
                <Sparkle size={24} className="animate-pulse" />
                <Award size={30} />
              </div>
            )}

            {/* School level worksheets heading */}
            <div className="border-b-2 border-zinc-300/80 pb-6 mb-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <GraduationCap size={16} className={isKidsTheme ? "text-teal-600" : "text-zinc-600"} />
                    <h4 className={`text-[10px] uppercase tracking-[0.25em] font-black ${isKidsTheme ? 'text-teal-600' : 'text-zinc-500'}`}>
                      {customSchoolName || 'Primary School Mathematics Sandbox'}
                    </h4>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{worksheetTitle}</h2>
                </div>
                <div className="text-right text-xs text-zinc-600 space-y-1.5 font-sans">
                  <p className="flex items-center md:justify-end gap-1"><strong>Name:</strong> <span className="border-b border-zinc-400 w-36 inline-block pb-0.5" /></p>
                  <p className="flex items-center md:justify-end gap-1"><strong>Date:</strong> <span className="border-b border-zinc-400 w-24 inline-block pb-0.5" /> <strong>Grade:</strong> <span className="border-b border-zinc-400 w-12 inline-block pb-0.5" /></p>
                </div>
              </div>
            </div>

            {/* Custom Teacher Note / Instructions */}
            {customInstructions && (
              <div className={`mb-8 p-4 rounded-2xl border text-xs leading-relaxed ${
                isKidsTheme 
                  ? 'bg-amber-500/5 border-amber-500/20 text-slate-700 font-sans' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 font-serif italic'
              }`}>
                <span className="text-[9px] uppercase font-black tracking-widest block mb-1 text-amber-600 font-sans">
                  Teacher's Instructions:
                </span>
                {customInstructions}
              </div>
            )}

            {/* Problem card layouts list loop */}
            <div className="space-y-10">
              {questions.map((item, index) => {
                const isCorrect = checkK5Answer(item, answersDraft[item.id]);
                return (
                  <div key={item.id} className="space-y-4 print:break-inside-avoid">
                    <div className="flex items-start gap-4">
                      
                      <span className={`font-sans font-black text-xs px-2.5 py-1 rounded-lg shrink-0 ${
                        isKidsTheme 
                          ? 'bg-teal-500/15 text-teal-700' 
                          : 'bg-zinc-200/80 text-zinc-700'
                      }`}>
                        {index + 1}
                      </span>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className={`p-0.5 font-bold leading-relaxed flex-1 ${
                            printFontSize === 'sm' ? 'text-[13px]' : 
                            printFontSize === 'lg' ? 'text-[18px]' : 
                            'text-[15px]'
                          } ${
                            isKidsTheme ? 'text-slate-800' : 'text-zinc-900'
                          }`}>
                            {item.questionStr}
                          </p>
                          {/* Audio Listen pill */}
                          <SpeakButton text={item.questionStr} />
                        </div>

                        {/* Latex Mathematical Content */}
                        {item.mathContent && (
                          <div className={`py-1 w-fit font-mono font-bold select-all overflow-x-auto ${
                            printFontSize === 'sm' ? 'text-sm' : 
                            printFontSize === 'lg' ? 'text-3xl' : 
                            (isKidsTheme ? 'text-xl' : 'text-2xl')
                          } ${
                            isKidsTheme ? 'text-teal-700 font-sans' : 'text-zinc-950 font-serif'
                          }`}>
                            <Latex>{`$$ ${item.mathContent} $$`}</Latex>
                          </div>
                        )}

                        {/* Visual SVGs */}
                        {item.svgType && (
                          <div className="print:block select-none py-1">
                            <RenderWorksheetSVG type={item.svgType} data={item.svgData} />
                          </div>
                        )}

                        {/* Interactive Solving input field */}
                        {isInteractive && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 print:hidden select-all">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Answer:</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="text"
                                value={answersDraft[item.id] || ''}
                                onChange={(e) => setAnswersDraft({ ...answersDraft, [item.id]: e.target.value })}
                                disabled={submittedAnswers}
                                placeholder="Type answer..."
                                className={`px-4 py-2 border rounded-xl text-xs font-bold w-48 shadow-inner transition-all focus:outline-none focus:ring-1 ${
                                  submittedAnswers 
                                    ? isCorrect 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                      : 'bg-rose-50 border-rose-200 text-rose-800'
                                    : 'bg-white border-zinc-200 focus:border-teal-400 focus:ring-teal-400'
                                }`}
                              />
                              
                              {submittedAnswers && (
                                <span className="inline-flex animate-fade-in shrink-0">
                                  {isCorrect ? (
                                    <CheckCircle size={18} className="text-emerald-500" />
                                  ) : (
                                    <XCircle size={18} className="text-rose-500" />
                                  )}
                                </span>
                              )}
                            </div>
                            
                            {submittedAnswers && !isCorrect && (
                              <p className="text-xs text-rose-600 font-medium">
                                Expected: <code className="bg-rose-50 px-1.5 py-0.5 rounded text-rose-800 font-mono font-bold">{item.answerKey}</code>
                              </p>
                            )}

                            {/* Toggles question scribble crayons canvas drawing drawer */}
                            <button
                              onClick={() => setScribbleOpend({ ...scribbleOpend, [item.id]: !scribbleOpend[item.id] })}
                              className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase transition-all ${
                                scribbleOpend[item.id] 
                                  ? 'bg-pink-100 border-pink-200 text-pink-700' 
                                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                              }`}
                            >
                              {scribbleOpend[item.id] ? '🌸 Hide Crayon Board' : '🖍️ Scribble Tray'}
                            </button>
                          </div>
                        )}

                        {/* Individual sandbox card scribbler drawer inline */}
                        {scribbleOpend[item.id] && isInteractive && (
                          <div className="pt-2 animate-fade-in print:hidden">
                            <ScribbleBox />
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Work ledger lines grid if visible */}
                    {showGridWorkspace && !showAnswerKey && !isInteractive && (
                      <div 
                        className="w-full rounded-2xl border border-zinc-300/40 opacity-50 bg-zinc-50/10"
                        style={{ 
                          height: `${item.blankSpaceLines * 25}px`,
                          backgroundImage: 
                            gridStyle === 'grid'
                              ? 'linear-gradient(#cbd5e1 1.2px, transparent 1.2px), linear-gradient(90deg, #cbd5e1 1.2px, transparent 1.2px)'
                              : gridStyle === 'dots'
                              ? 'radial-gradient(#64748b 1.5px, transparent 1.5px)'
                              : gridStyle === 'blank'
                              ? 'none'
                              : 'linear-gradient(#cbd5e1 1.2px, transparent 1.2px)', // lines
                          backgroundSize: 
                            gridStyle === 'grid'
                              ? '25px 25px, 25px 25px'
                              : gridStyle === 'dots'
                              ? '20px 20px'
                              : '100% 25px',
                          backgroundColor: gridStyle === 'blank' ? '#fafafa' : 'transparent',
                          borderStyle: gridStyle === 'blank' ? 'solid' : 'dashed'
                        }}
                      />
                    )}

                    {/* Display Teacher keys on screen OR in printable sheet if printSolutions enabled */}
                    {(showAnswerKey || (printSolutions)) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1 ml-10 text-[13px] font-sans ${
                          !showAnswerKey && printSolutions ? 'hidden print:block' : ''
                        }`}
                      >
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block font-sans">
                          Expected Answer Ledger
                        </span>
                        <div className="font-serif font-black text-indigo-900 leading-relaxed py-0.5 overflow-x-auto scrollbar-none">
                          <Latex>{`$ \\text{Value: } ${item.answerKey} $`}</Latex>
                        </div>
                        {item.stepDetails && (
                          <div className="text-[11px] text-zinc-650 leading-relaxed italic font-serif opacity-90 overflow-x-auto scrollbar-none">
                            <Latex>{`$ ${item.stepDetails} $`}</Latex>
                          </div>
                        )}
                      </motion.div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Interactive check button inside sheet preview */}
            {isInteractive && !submittedAnswers && questions.length > 0 && (
              <div className="mt-12 flex justify-center print:hidden">
                <button
                  onClick={handleGradeWorksheet}
                  className="px-10 py-4 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Grade Interactive Answers
                </button>
              </div>
            )}

            {/* Print Footer details */}
            <div className="mt-14 pt-6 border-t border-zinc-300 flex justify-between items-center text-[10px] text-zinc-500 font-sans uppercase tracking-wider">
              <span>Primary K-5 Worksheets Suite Core</span>
              <span>Workspace Seed Parameter: {seed}</span>
            </div>

            {/* Separate Answer Key printed page */}
            {appendSolutionsOnPrint && (
              <div className="hidden print:block break-before-page border-t-2 border-dashed border-zinc-400 pt-10 mt-14 font-sans">
                <div className="text-center pb-6 mb-8 border-b-2 border-zinc-200">
                  <h3 className="text-xl font-extrabold uppercase tracking-widest text-[#1a202c]">
                    🎓 Answer Key &amp; Solutions Guide
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {worksheetTitle} &bull; Seed: {seed}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  {questions.map((item, index) => (
                    <div key={`key-${item.id}`} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 break-inside-avoid">
                      <div className="flex items-center gap-2 font-sans font-black text-xs text-zinc-600">
                        <span>Question {index + 1}</span>
                      </div>
                      <p className="font-bold text-zinc-900 leading-snug">{item.questionStr}</p>
                      <div className="font-extrabold text-teal-800 bg-white inline-block px-2.5 py-1.5 rounded-lg border border-teal-200 shadow-sm font-mono text-sm">
                        Correct Answer: {item.answerKey}
                      </div>
                      {item.stepDetails && (
                        <div className="text-xs text-zinc-600 leading-relaxed italic border-t border-zinc-100 pt-1.5 overflow-x-auto scrollbar-none">
                          Step guide: <Latex>{`$ ${item.stepDetails} $`}</Latex>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default K5Worksheets;
