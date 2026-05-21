import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Sparkles, 
  Download, 
  ChevronDown,
  CheckCircle,
  XCircle,
  Smile,
  GraduationCap,
  Award,
  Sparkle,
  Volume2,
  LayoutGrid
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
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
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
              onClick={() => setColor(c.hex)}
              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs transition-transform hover:scale-110 border ${
                color === c.hex ? 'border-teal-500 scale-105 shadow-sm ring-2 ring-teal-500/20' : 'border-zinc-200'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Color: ${c.hex}`}
            >
              <span className="opacity-95 text-[10px]">{c.emoji}</span>
            </button>
          ))}
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          <button
            onClick={() => setColor('#fdfefe')} // Eraser/White chalk style
            className={`px-2 py-1 rounded-xl text-[9px] font-bold border transition-all ${
              color === '#fdfefe' ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-white border-zinc-200 text-zinc-500'
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
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none animate-fade-in">
        <svg width={Math.min(320, coinsList.length * 38 + 24)} height="52" viewBox={`0 0 ${coinsList.length * 38 + 24} 52`}>
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
    );
  }

  if (type === 'fraction') {
    const { num1, den1, num2 = null, den2 = null } = data;
    
    return (
      <div className="flex justify-center p-4 bg-white rounded-3xl border border-zinc-200/70 w-fit mx-auto shadow-sm my-3 print:bg-white print:shadow-none select-none animate-fade-in">
        <svg width="220" height="90" viewBox="0 0 220 90">
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
            const count = (qSeed1 % 10) + 4; // 4 to 13 items
            generated.push({
              id: i,
              questionStr: `Count the beautiful companion items in the box below carefully. How many can you count?`,
              blankSpaceLines: 1,
              answerKey: `${count}`,
              svgType: 'counting',
              svgData: { count, shape: selectedCompanion },
              stepDetails: `\\text{Counting carefully row by row yields exactly } ${count} \\text{ shapes.}`
            });
            break;
          }

          case 'clock_time': {
            const hrs = (qSeed1 % 12) + 1;
            const minutesList = [0, 5, 15, 25, 30, 45, 50];
            const mins = minutesList[qSeed2 % minutesList.length];
            const displayMins = mins.toString().padStart(2, '0');
            generated.push({
              id: i,
              questionStr: `Look at the clock dial below. What time is shown on the clock face?`,
              blankSpaceLines: 1,
              answerKey: `${hrs}:${displayMins}`,
              svgType: 'clock',
              svgData: { hour: hrs, minute: mins },
              stepDetails: `\\text{The short hand is indicating } ${hrs} \\text{ while the long hand is pointing at the minute value } ${mins}. \\text{ Time: } ${hrs}:${displayMins}.`
            });
            break;
          }

          case 'money_math': {
            const quarters = (qSeed1 % 3) + 1; // 1 to 3
            const dimes = (qSeed2 % 4) + 1; // 1 to 4
            const nickels = (qSeed1 * 2) % 3 + 1; // 1 to 3
            const pennies = (qSeed2 * 3) % 4 + 1; // 1 to 4
            const totalCents = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;

            generated.push({
              id: i,
              questionStr: `How many total cents do you have in the coin collection displayed below? (Quarters are 25¢, Dimes are 10¢, Nickels are 5¢, Pennies are 1¢).`,
              blankSpaceLines: 2,
              answerKey: `${totalCents}`,
              svgType: 'money',
              svgData: { quarters, dimes, nickels, pennies },
              stepDetails: `\\text{Equation: } (${quarters} \\times 25\\phi) + (${dimes} \\times 10\\phi) + (${nickels} \\times 5\\phi) + (${pennies} \\times 1\\phi) = ${quarters * 25} + ${dimes * 10} + ${nickels * 5} + ${pennies} = ${totalCents}\\phi.`
            });
            break;
          }

          case 'fractions_sum': {
            const den1 = Math.max(2, Math.min(qSeed1 % 10, 8));
            const den2 = Math.max(2, Math.min(qSeed2 % 10, 8));
            const num1 = Math.max(1, (qSeed1 % (den1 - 1)) + 1);
            const num2 = Math.max(1, (qSeed2 % (den2 - 1)) + 1);
            
            // LCD Math solver
            const gcdFn = (x: number, y: number): number => (!y ? x : gcdFn(y, x % y));
            const baseD = den1 * den2;
            const baseN = num1 * den2 + num2 * den1;
            const finalGcd = gcdFn(baseN, baseD);
            const finalNum = baseN / finalGcd;
            const finalDen = baseD / finalGcd;

            generated.push({
              id: i,
              questionStr: `Evaluate the visual fractions sum and reduce to simplest form:`,
              mathContent: `\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}`,
              blankSpaceLines: 4,
              answerKey: finalDen === 1 ? `${finalNum}` : `\\frac{${finalNum}}{${finalDen}}`,
              svgType: 'fraction',
              svgData: { num1, den1, num2, den2 },
              stepDetails: `\\text{LCD: } ${baseD}. \\text{ Summed numerator numerics: } ${num1 * den2} + ${num2 * den1} = ${baseN}. \\text{ Reduced: } \\frac{${finalNum}}{${finalDen}}.`
            });
            break;
          }

          case 'geometry': {
            const shapeTypesList = ['rectangle', 'triangle', 'square'];
            const shapeType = shapeTypesList[i % shapeTypesList.length];

            if (shapeType === 'triangle') {
              const base = (qSeed1 % 6) + 4;
              const height = (qSeed2 % 5) + 3;
              const area = 0.5 * base * height;
              const hypo = Math.sqrt(base*base + height*height);
              const perimeter = Math.round(base + height + hypo);
              generated.push({
                id: i,
                questionStr: `Find the perfect Area (in cm²) and approximate rounded Perimeter (in cm) of this right triangle:`,
                blankSpaceLines: 4,
                answerKey: `Area = ${area}, Perimeter = ${perimeter}`,
                svgType: 'geometry',
                svgData: { shapeType: 'triangle', base, height },
                stepDetails: `\\text{Area} = \\frac{1}{2} \\times b \\times h = \\frac{1}{2} \\times ${base} \\times ${height} = ${area}\\text{ cm}^2. \\text{ Perimeter: } ${base} + ${height} + ${hypo.toFixed(1)} \\approx ${perimeter}\\text{ cm}.`
              });
            } else if (shapeType === 'square') {
              const side = (qSeed1 % 5) + 3;
              const area = side * side;
              const perimeter = 4 * side;
              generated.push({
                id: i,
                questionStr: `Calculate the Area (square cm) and Perimeter (cm) of the square shown:`,
                blankSpaceLines: 4,
                answerKey: `Area = ${area}, Perimeter = ${perimeter}`,
                svgType: 'geometry',
                svgData: { shapeType: 'square', side },
                stepDetails: `\\text{Square Area} = s^2 = ${side} \\times ${side} = ${area}\\text{ cm}^2. \\text{ Perimeter} = 4s = 4 \\times ${side} = ${perimeter}\\text{ cm}.`
              });
            } else {
              const length = (qSeed1 % 6) + 4;
              const width = (qSeed2 % 4) + 3;
              const area = length * width;
              const perimeter = 2 * (length + width);
              generated.push({
                id: i,
                questionStr: `Compute the Area (cm²) and Perimeter (cm) of this rectangle layout:`,
                blankSpaceLines: 4,
                answerKey: `Area = ${area}, Perimeter = ${perimeter}`,
                svgType: 'geometry',
                svgData: { shapeType: 'rectangle', length, width },
                stepDetails: `\\text{Area} = L \\times W = ${length} \\times ${width} = ${area}\\text{ cm}^2. \\text{ Perimeter} = 2(L + W) = 2(${length} + ${width}) = ${perimeter}\\text{ cm}.`
              });
            }
            break;
          }

          case 'decimals': {
            const val1 = (qSeed1 * 0.4).toFixed(1);
            const val2 = (qSeed2 * 0.3).toFixed(1);
            const ansDec = (parseFloat(val1) * parseFloat(val2)).toFixed(2);
            generated.push({
              id: i,
              questionStr: `Multiply these numbers with decimal fractions:`,
              mathContent: `${val1} \\times ${val2}`,
              blankSpaceLines: 3,
              answerKey: `${ansDec}`,
              stepDetails: `\\text{Multiply like values then shift decimal point: } ${val1} \\times ${val2} = ${ansDec}.`
            });
            break;
          }

          case 'division_remainder': {
            const numerator = qSeed1 * 13 + qSeed2;
            const denominator = Math.max(3, qSeed2 % 7 + 2);
            const quotient = Math.floor(numerator / denominator);
            const remainder = numerator % denominator;
            generated.push({
              id: i,
              questionStr: `Write the complete quotient and remainder if any (Form: Q R Remainder or just value):`,
              mathContent: `${numerator} \\div ${denominator}`,
              blankSpaceLines: 3,
              answerKey: remainder === 0 ? `${quotient}` : `${quotient} R ${remainder}`,
              stepDetails: `\\text{Solve: } ${denominator} \\times ${quotient} = ${denominator * quotient}. \\text{ Remainder value } = ${numerator} - ${denominator * quotient} = ${remainder}.`
            });
            break;
          }

          case 'word_problems': {
            const countApples = qSeed1 * 3 + 8;
            const students = (qSeed2 % 3) + 3;
            const share = Math.floor(countApples / students);
            const left = countApples % students;
            generated.push({
              id: i,
              questionStr: `Sarah has ${countApples} delicious apples to pack into bags. If she splits them equally among ${students} students, how many apples does each friend get, and how many are left?`,
              blankSpaceLines: 3,
              answerKey: left === 0 ? `${share}` : `${share} with ${left} left`,
              stepDetails: `${countApples} \\div ${students} = ${share} \\text{ apples each with a remainder left of } ${left}.`
            });
            break;
          }

          case 'arithmetic':
          default: {
            const x = qSeed1 * 3 + 12;
            const y = qSeed2 * 2 + 5;
            const resultVal = x + y - 8;
            generated.push({
              id: i,
              questionStr: `Complete the simple arithmetic sum values:`,
              mathContent: `${x} + ${y} - 8`,
              blankSpaceLines: 2,
              answerKey: `${resultVal}`,
              stepDetails: `\\text{Evaluate: } ${x} + ${y} = ${x + y}. \\text{ Subtracting } 8 \\text{ gives outcome parameter } = ${resultVal}.`
            });
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
    window.print();
  };

  const handlePrintDiploma = () => {
    // Elegant single element print focus helper
    const certElement = document.getElementById('scholastic-diploma-print-area');
    if (certElement) {
      const compiledCertHtml = certElement.outerHTML;
      
      // Temporarily write body for printing
      document.body.innerHTML = `
        <html>
          <head>
            <title>Scholastic Mathematics Diploma — ${scholarName || 'Primary Scholar'}</title>
            <style>
              body { background: white; color: black; padding: 20px; font-family: "Georgia", serif; -webkit-print-color-adjust: exact; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            ${compiledCertHtml}
          </body>
        </html>
      `;
      window.print();
      
      // Restore page state
      window.location.reload();
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
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group hover:scale-[1.02] hover:shadow-md ${
                    isCurrentlySelected 
                      ? 'bg-brand-surface border-teal-500 ring-1 ring-teal-500/30 shadow' 
                      : 'bg-brand-bg/40 hover:bg-brand-surface border-brand-border/40'
                  }`}
                >
                  <div className="absolute top-2 right-2 text-lg group-hover:animate-bounce">{preset.icon}</div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-bg/80 border w-fit mb-2 ${preset.color}`}>
                    {preset.badge}
                  </span>
                  <div className="font-bold text-xs text-brand-text line-clamp-1">{preset.title}</div>
                  <div className="text-[10px] text-brand-text-secondary mt-1 line-clamp-2 leading-relaxed font-light">
                    {preset.desc}
                  </div>
                  
                  {isCurrentlySelected && (
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Control Rail Panel */}
        <div className="space-y-6 lg:col-span-1 bg-brand-surface/40 p-6 md:p-8 rounded-[2rem] border border-brand-border/50 backdrop-blur-md sticky top-24 print:hidden">
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

          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-brand-border/30">
            <button
              onClick={handlePrintWorksheet}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary/95 text-brand-bg rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-primary/10"
            >
              <Printer size={13} /> Print Homework Sheet
            </button>
            <button
              onClick={exportWorksheetBlueprint}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Download size={13} /> Export JSON / Blueprint
            </button>
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
                      Primary School Mathematics Sandbox
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
                          <p className={`text-[15px] p-0.5 font-bold leading-relaxed flex-1 ${
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
                            isKidsTheme ? 'text-teal-700 font-sans text-xl' : 'text-zinc-950 font-serif text-2xl'
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
                        className="w-full rounded-2xl border border-zinc-300/50 opacity-50 bg-zinc-50/50"
                        style={{ 
                          height: `${item.blankSpaceLines * 25}px`,
                          backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)',
                          backgroundSize: '100% 25px'
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

          </div>
        </div>

      </div>
    </div>
  );
};

export default K5Worksheets;
