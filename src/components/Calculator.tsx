
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { HistoryEntry, Explanation, AppTab } from '../types';
import { getFormulaExplanation } from '../services/geminiService';
import { formatNumber } from '../lib/formatters';
import { create, all } from 'mathjs';
import { Copy, Check, Loader, Brain, FlaskConical, AlertCircle, Share2, Volume2, VolumeX, Sliders, Keyboard, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    
    const maxRotate = 4; // Gentle tilt angle
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
        scale: isHovered ? 1.012 : 1,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.5 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className={`${className}`}
    >
      <div style={{ transform: isHovered ? "translateZ(12px)" : "translateZ(0px)", transition: "transform 0.2s ease-out" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

const playClickSound = (() => {
  let audioCtx: AudioContext | null = null;
  return (type: 'tick' | 'sci') => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === 'sci') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.setValueAtTime(1300, now + 0.012);
        gainNode.gain.setValueAtTime(0.016, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0005, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.07);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(750, now + 0.004);
        gainNode.gain.setValueAtTime(0.038, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0005, now + 0.038);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {
      console.warn("Audio Context unsupported or blocked", e);
    }
  };
})();

const math = create(all);
// Add nPr, nCr, and pmt functions
math.import({
  nPr: (n: number, k: number) => math.permutations(n, k),
  nCr: (n: number, k: number) => math.combinations(n, k),
  mod: (a: number, b: number) => a % b,
  pmt: (annualRatePercent: number, termYears: number, principal: number) => {
    const monthlyRate = annualRatePercent / 100 / 12;
    const numberOfPayments = termYears * 12;
    if (isNaN(principal) || isNaN(monthlyRate) || isNaN(numberOfPayments) || principal <= 0 || termYears <= 0) {
      throw new Error("Invalid pmt() args: principal and years must be positive.");
    }
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  },
}, { override: true });


interface CalculatorProps {
  addToHistory: (entry: HistoryEntry) => void;
  expressionToLoad: HistoryEntry | null;
  onExpressionLoaded: () => void;
  setActiveTab: (tab: AppTab) => void;
}

type AngleMode = 'deg' | 'rad' | 'grad';

const SCIENTIFIC_CONSTANTS = [
    { name: 'Speed of Light (c)', value: '299792458', symbol: 'c', unit: 'm/s' },
    { name: 'Planck Constant (h)', value: '6.62607015e-34', symbol: 'h', unit: 'J·s' },
    { name: 'Gravitational Constant (G)', value: '6.67430e-11', symbol: 'G', unit: 'N·m²/kg²' },
    { name: 'Elementary Charge (e)', value: '1.602176634e-19', symbol: 'e', unit: 'C' },
    { name: 'Electron Mass (mₑ)', value: '9.1093837015e-31', symbol: 'mₑ', unit: 'kg' },
    { name: 'Proton Mass (mₚ)', value: '1.67262192369e-27', symbol: 'mₚ', unit: 'kg' },
    { name: 'Avogadro Constant (Nₐ)', value: '6.02214076e23', symbol: 'Nₐ', unit: 'mol⁻¹' },
    { name: 'Boltzmann Constant (k)', value: '1.380649e-23', symbol: 'k', unit: 'J/K' },
    { name: 'Golden Ratio (φ)', value: '1.61803398875', symbol: 'φ', unit: '' },
    { name: 'Vacuum Permittivity (ε₀)', value: '8.8541878128e-12', symbol: 'ε₀', unit: 'F/m' },
    { name: 'Vacuum Permeability (μ₀)', value: '1.25663706212e-6', symbol: 'μ₀', unit: 'N/A²' },
    { name: 'Gas Constant (R)', value: '8.314462618', symbol: 'R', unit: 'J/(mol·K)' },
    { name: 'Faraday Constant (F)', value: '96485.33212', symbol: 'F', unit: 'C/mol' },
    { name: 'Rydberg Constant (R∞)', value: '10973731.568', symbol: 'R∞', unit: 'm⁻¹' },
    { name: 'Fine-structure Constant (α)', value: '7.2973525693e-3', symbol: 'α', unit: '' },
    { name: 'Standard Gravity (g)', value: '9.80665', symbol: 'g', unit: 'm/s²' },
    { name: 'Bohr Radius (a₀)', value: '5.291772109e-11', symbol: 'a₀', unit: 'm' },
    { name: 'Stefan-Boltzmann (σ)', value: '5.670374419e-8', symbol: 'σ', unit: 'W/(m²·K⁴)' },
    { name: 'Wien Constant (b)', value: '0.002897771955', symbol: 'b', unit: 'm·K' },
];

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const LatexRenderer = memo(({ latex }: { latex: string }) => {
  return (
    <div className="math-display">
      <Latex>{`$$${latex}$$`}</Latex>
    </div>
  );
});


const Calculator = ({ addToHistory, expressionToLoad, onExpressionLoaded, setActiveTab }: CalculatorProps) => {
  const [expression, setExpression] = useState(''); // The top, ongoing expression line
  const [currentInput, setCurrentInput] = useState('0'); // The bottom, current input line
  const [isResultState, setIsResultState] = useState(false); // Are we showing a final result?
  
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>('0');
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    try {
      const saved = localStorage.getItem('calc_angleMode');
      return (saved as AngleMode) || 'deg';
    } catch { return 'deg'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('calc_angleMode', angleMode);
    } catch { console.error("Failed to solve angle mode"); }
  }, [angleMode]);
  const [memory, setMemory] = useState<number | null>(null);
  const [isSecond, setIsSecond] = useState(false);
  const [clickVolume, setClickVolume] = useState<'off' | 'tick' | 'sci'>(() => {
    try {
      const saved = localStorage.getItem('calc_clickSound');
      return (saved as 'off' | 'tick' | 'sci') || 'tick';
    } catch { return 'tick'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('calc_clickSound', clickVolume);
    } catch { console.error("Failed to save clickSound"); }
  }, [clickVolume]);

  const triggerClick = useCallback((type: 'tick' | 'sci' = 'tick') => {
    if (clickVolume !== 'off') {
      playClickSound(clickVolume === 'sci' ? 'sci' : type);
    }
  }, [clickVolume]);

  const [calcScale, setCalcScale] = useState<'sm' | 'md' | 'lg' | 'colossal'>(() => {
    try {
      const saved = localStorage.getItem('calc_scale');
      return (saved as 'sm' | 'md' | 'lg' | 'colossal') || 'md';
    } catch { return 'md'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('calc_scale', calcScale);
    } catch { console.error("Failed to save calculator scale"); }
  }, [calcScale]);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [tickerHistory, setTickerHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  }, []);

  const loadPresetFormula = useCallback((formulaExpr: string) => {
    triggerClick('sci');
    setExpression('');
    setCurrentInput(formulaExpr);
    setIsResultState(false);
    setError(null);
    setExplanation(null);
    setIsSecond(false);
    showToast(`Loaded: ${formulaExpr}`);
  }, [triggerClick, showToast]);

  const scaleConfig = useMemo(() => {
    switch (calcScale) {
      case 'sm':
        return {
          btnHeight: 'h-[44px] md:h-[48px]',
          btnGap: 'gap-1.5 md:gap-2 mt-4',
          labelSize: 'text-xs md:text-sm',
          secondLabelSize: 'text-[8px]',
          exprSize: 'text-xs md:text-sm h-6',
          inputSize: 'text-2xl md:text-4xl min-h-[44px]',
          cardPadding: 'p-4',
          cardHeight: 'min-h-[140px]',
          containerClass: 'max-w-md mx-auto lg:mx-0'
        };
      case 'lg':
        return {
          btnHeight: 'h-16 md:h-[72px]',
          btnGap: 'gap-2.5 md:gap-3 mt-6',
          labelSize: 'text-lg font-extrabold',
          secondLabelSize: 'text-xs',
          exprSize: 'text-lg md:text-2xl h-9',
          inputSize: 'text-5xl md:text-7xl min-h-[72px]',
          cardPadding: 'p-8',
          cardHeight: 'min-h-[225px]',
          containerClass: 'max-w-2xl'
        };
      case 'colossal':
        return {
          btnHeight: 'h-20 md:h-24',
          btnGap: 'gap-3 md:gap-4 mt-8',
          labelSize: 'text-xl md:text-2xl font-black',
          secondLabelSize: 'text-sm font-semibold',
          exprSize: 'text-xl md:text-3xl h-10',
          inputSize: 'text-6xl md:text-8xl min-h-[96px]',
          cardPadding: 'p-10',
          cardHeight: 'min-h-[265px]',
          containerClass: 'max-w-3xl'
        };
      case 'md':
      default:
        return {
          btnHeight: 'h-14 md:h-16',
          btnGap: 'gap-2 md:gap-2.5 mt-6',
          labelSize: 'text-base font-bold',
          secondLabelSize: 'text-[10px]',
          exprSize: 'text-base md:text-xl h-8',
          inputSize: 'text-4xl md:text-6xl min-h-[60px]',
          cardPadding: 'p-6',
          cardHeight: 'min-h-[180px]',
          containerClass: ''
        };
    }
  }, [calcScale]);

  const handleCopy = useCallback(() => {
    if (currentInput) {
      navigator.clipboard.writeText(currentInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentInput]);

  const handleShare = useCallback(async () => {
    if (!expression || !currentInput) return;
    const shareText = `${expression} ${currentInput}`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Calculation Result',
                text: shareText
            });
            showToast('Result shared!');
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        navigator.clipboard.writeText(shareText);
        showToast('Calculation copied to clipboard!');
    }
  }, [expression, currentInput, showToast]);

  const parser = useMemo(() => {
    const p = math.parser();
    p.set('degToRad', (angle: number) => angle * Math.PI / 180);
    p.set('gradToRad', (angle: number) => angle * Math.PI / 200);
    p.set('radToDeg', (angle: number) => angle * 180 / Math.PI);
    p.set('radToGrad', (angle: number) => angle * 200 / Math.PI);

    p.evaluate('sin(x)=sin(x)');
    p.evaluate('cos(x)=cos(x)');
    p.evaluate('tan(x)=tan(x)');
    p.evaluate('asin(x)=asin(x)');
    p.evaluate('acos(x)=acos(x)');
    p.evaluate('atan(x)=atan(x)');
    p.evaluate('asinh(x)=asinh(x)');
    p.evaluate('acosh(x)=acosh(x)');
    p.evaluate('atanh(x)=atanh(x)');

    if (angleMode === 'deg') {
        p.evaluate('sin(x) = sin(degToRad(x))');
        p.evaluate('cos(x) = cos(degToRad(x))');
        p.evaluate('tan(x) = tan(degToRad(x))');
        p.evaluate('asin(x) = radToDeg(asin(x))');
        p.evaluate('acos(x) = radToDeg(acos(x))');
        p.evaluate('atan(x) = radToDeg(atan(x))');
    } else if (angleMode === 'grad') {
        p.evaluate('sin(x) = sin(gradToRad(x))');
        p.evaluate('cos(x) = cos(gradToRad(x))');
        p.evaluate('tan(x) = tan(gradToRad(x))');
        p.evaluate('asin(x) = radToGrad(asin(x))');
        p.evaluate('acos(x) = radToGrad(acos(x))');
        p.evaluate('atan(x) = radToGrad(atan(x))');
    }
    return p;
  }, [angleMode]);

  const applyAns = useCallback(() => {
    triggerClick('sci');
    if (isResultState) {
        setExpression('');
        setCurrentInput(lastAnswer);
        setIsResultState(false);
    } else {
        setCurrentInput(prev => (prev === '0' ? lastAnswer : prev + lastAnswer));
    }
  }, [isResultState, lastAnswer, triggerClick]);

  const clear = useCallback(() => {
    triggerClick('tick');
    setExpression('');
    setCurrentInput('0');
    setIsResultState(false);
    setError(null);
    setExplanation(null);
    setIsSecond(false);
  }, [triggerClick]);

  useEffect(() => {
    if (expressionToLoad) {
      setTimeout(() => {
        setExpression('');
        setCurrentInput(expressionToLoad.expression);
        setIsResultState(false);
        setError(null);
        setExplanation(null);
        setIsSecond(false);
        onExpressionLoaded();
      }, 0);
    }
  }, [expressionToLoad, onExpressionLoaded]);

  const handleInput = useCallback((value: string) => {
    triggerClick('tick');
    setError(null);
    if (isResultState) {
      setExpression('');
      setCurrentInput(value);
      setIsResultState(false);
    } else {
      setCurrentInput(prev => {
        if (prev === '0' && value !== '.') {
          return value;
        }
        // Prevent multiple decimals in the last number segment
        const parts = prev.split(/([+\-−×÷(])/);
        const lastPart = parts[parts.length - 1];
        if (value === '.' && lastPart.includes('.')) {
          return prev;
        }
        // Prevent multiple E's in the last number segment
        if (value.toUpperCase() === 'E' && lastPart.toUpperCase().includes('E')) {
            return prev;
        }
        return prev + value;
      });
    }
    if (isSecond) setIsSecond(false);
  }, [isResultState, isSecond, triggerClick]);

  const handleFunction = useCallback((func: string, displayFunc?: string) => {
    triggerClick('sci');
    setError(null);
    const display = displayFunc || func;
    
    if (isResultState) {
        setExpression(`${display}${currentInput})`);
        setCurrentInput(''); 
        setIsResultState(false);
    } else {
        setCurrentInput(prev => {
            if(prev === '0' || prev === '') return `${display}`;
            return `${prev}${display}`;
        });
    }
    if (isSecond) setIsSecond(false);
  }, [currentInput, isResultState, isSecond, triggerClick]);
  
  const backspace = useCallback(() => {
    triggerClick('tick');
    setError(null);
    if (isResultState) {
        clear();
        return;
    }
    setCurrentInput(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, [isResultState, clear, triggerClick]);

  const calculate = useCallback(async () => {
    if (error || isLoading) return;
    
    let fullExpression = (expression + currentInput).trim();
    if (!fullExpression) return;
    
    // Auto-balance parentheses and brackets
    const openParen = (fullExpression.match(/\(/g) || []).length;
    const closeParen = (fullExpression.match(/\)/g) || []).length;
    if (openParen > closeParen) {
        fullExpression += ')'.repeat(openParen - closeParen);
    }
    const openBracket = (fullExpression.match(/\[/g) || []).length;
    const closeBracket = (fullExpression.match(/\]/g) || []).length;
    if (openBracket > closeBracket) {
        fullExpression += ']'.repeat(openBracket - closeBracket);
    }

    setError(null);

    try {
      const sanitizedExpression = fullExpression
        .replace(/π/g, 'pi')
        .replace(/√/g, 'sqrt')
        .replace(/∛/g, 'cbrt')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      const evalResult = parser.evaluate(sanitizedExpression);
      const resultStr = math.format(evalResult, { precision: 10 });
      
      const newHistoryEntry = { expression: fullExpression, result: resultStr, timestamp: new Date().toISOString() };
      addToHistory(newHistoryEntry);
      setTickerHistory(prev => [newHistoryEntry, ...prev].slice(0, 5));
      
      setExpression(fullExpression + ' =');
      setCurrentInput(resultStr);
      setLastAnswer(resultStr);
      setIsResultState(true);
      
      setIsLoading(true);
      setExplanation(null);
      const expl = await getFormulaExplanation(sanitizedExpression);
      setExplanation(expl);
    } catch (e) {
      let errorMessage = 'Invalid Expression'; // Default message
      if (e instanceof Error) {
        if (e.message.includes('Undefined symbol')) {
          const match = e.message.match(/Undefined symbol (.+)/);
          errorMessage = match ? `Unknown function: ${match[1]}` : 'Unknown function or variable';
        } else if (e.message.toLowerCase().includes('parenthesis')) {
          errorMessage = 'Mismatched parentheses';
        } else if (e.message.includes('Invalid pmt() args')) {
          errorMessage = 'Invalid arguments for pmt()';
        } else if (e.message.toLowerCase().includes('divide by zero')) {
          errorMessage = 'Error: Cannot divide by zero';
        } else if (e.message.includes('Value expected')) {
          errorMessage = 'Syntax Error: Check operators';
        } else {
          // Use a cleaner version of other specific mathjs errors
          errorMessage = e.message.split('(')[0].trim();
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSecond(false);
    }
  }, [expression, currentInput, error, isLoading, addToHistory, parser]);

  const handleOp = useCallback((op: string) => {
    triggerClick('tick');
    setError(null);
    if (currentInput === '' && expression.length > 0) {
        // Use regex to robustly replace the last operator
        setExpression(prev => prev.trim().replace(/[+\-−×÷]$/, '').trim() + ` ${op} `);
        return;
    }
    if (isResultState) {
      setExpression(currentInput + ` ${op} `);
      setCurrentInput('');
      setIsResultState(false);
    } else {
      setExpression(prev => (prev + currentInput + ` ${op} `));
      setCurrentInput('');
    }
  }, [currentInput, expression.length, isResultState, triggerClick]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        // Prevent handling events if an input field is focused (e.g. in another tab)
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        // Allow some default browser shortcuts
        if ((event.ctrlKey || event.metaKey) && (event.key === 'r' || event.key === 'c' || event.key === 'v')) {
            return;
        }

        event.preventDefault();
        const key = event.key;

        // Visual press active feedback mapping
        let matchLabel: string | null = null;
        if (key >= '0' && key <= '9') matchLabel = key;
        else if (key === '.') matchLabel = '.';
        else if (key === '+') matchLabel = '+';
        else if (key === '-') matchLabel = '−';
        else if (key === '*') matchLabel = '×';
        else if (key === '/') matchLabel = '÷';
        else if (key === '(') matchLabel = '(';
        else if (key === ')') matchLabel = ')';
        else if (key === 'Enter' || key === '=') matchLabel = '=';
        else if (key === 'Backspace') matchLabel = 'del';
        else if (key === 'Escape') matchLabel = 'AC';
        else if (key.toLowerCase() === 'e') matchLabel = 'e';
        else if (key.toLowerCase() === 'p') matchLabel = 'π';
        else if (key.toLowerCase() === 'a') matchLabel = 'Ans';

        if (matchLabel) {
            setActiveKey(matchLabel);
            setTimeout(() => {
                setActiveKey(null);
            }, 120);
        }

        if (key >= '0' && key <= '9') {
            handleInput(key);
        } else if (key === '.') {
            handleInput('.');
        } else if (key === '+') {
            handleOp('+');
        } else if (key === '-') {
            handleOp('−');
        } else if (key === '*') {
            handleOp('×');
        } else if (key === '/') {
            handleOp('÷');
        } else if (key === '(' || key === '[') {
            handleInput(key);
        } else if (key === ')' || key === ']') {
            handleInput(key);
        } else if (key === ',') {
            handleInput(',');
        } else if (key === '%') {
            handleInput('%');
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clear();
        } else if (key.toLowerCase() === 'e') {
            handleInput('E');
        } else if (key.toLowerCase() === 'i') {
            handleInput('i');
        } else if (key.toLowerCase() === 'a') {
            applyAns();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleInput, handleOp, calculate, backspace, clear, applyAns]);

  const memoryClear = useCallback(() => { triggerClick('tick'); setMemory(null); showToast("Memory cleared"); }, [showToast, triggerClick]);
  const memoryRecall = useCallback(() => { triggerClick('tick'); if(memory !== null) { setCurrentInput(String(memory)); setIsResultState(false); } }, [memory, triggerClick]);
  const memoryAdd = useCallback(() => {
    triggerClick('tick');
    const currentVal = parseFloat(currentInput);
     if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) + currentVal);
        showToast("Value added to memory");
    }
  }, [currentInput, showToast, triggerClick]);
  const memorySubtract = useCallback(() => {
    triggerClick('tick');
    const currentVal = parseFloat(currentInput);
    if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) - currentVal);
        showToast("Value subtracted from memory");
    }
  }, [currentInput, showToast, triggerClick]);
  
  const buttonGrid: { label: string, secondLabel?: string, action: () => void, secondAction?: () => void, variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'clear' | 'num', colSpan?: number, active?: boolean, title?: string, secondTitle?: string }[][] = useMemo(() => [
      [
          { label: '2nd', action: () => setIsSecond(s => !s), variant: 'outline', active: isSecond, title: 'Toggle Secondary Functions' },
          { label: 'π', secondLabel: 'i', action: () => handleInput('π'), secondAction: () => handleInput('i'), variant: 'outline', title: 'Pi (3.141...)', secondTitle: 'Imaginary Unit (i)' },
          { label: 'e', secondLabel: '%', action: () => handleInput('e'), secondAction: () => handleInput('%'), variant: 'outline', title: "Euler's Number (2.718...)", secondTitle: 'Percentage' },
          { label: 'AC', action: clear, variant: 'clear', title: 'All Clear (Esc)' },
          { label: 'del', action: backspace, variant: 'clear', title: 'Delete (Backspace)' },
      ],
      [
          { label: 'MC', action: memoryClear, variant: 'num', title: 'Memory Clear' },
          { label: 'MR', action: memoryRecall, variant: 'num', title: 'Memory Recall' },
          { label: 'M+', action: memoryAdd, variant: 'num', title: 'Memory Add' },
          { label: 'M-', action: memorySubtract, variant: 'num', title: 'Memory Subtract' },
          { label: 'Ans', secondLabel: '±', action: applyAns, secondAction: () => {
              if (currentInput.startsWith('-')) setCurrentInput(currentInput.slice(1));
              else if (currentInput !== '0' && currentInput !== '') setCurrentInput('-' + currentInput);
          }, variant: 'outline', title: 'Last Answer (A)', secondTitle: 'Negate (Plus/Minus)' },
      ],
      [
          { label: 'sin', secondLabel: 'asin', action: () => handleFunction('sin('), secondAction: () => handleFunction('asin('), variant: 'outline', title: 'Sine', secondTitle: 'Inverse Sine (arcsin)' },
          { label: 'cos', secondLabel: 'acos', action: () => handleFunction('cos('), secondAction: () => handleFunction('acos('), variant: 'outline', title: 'Cosine', secondTitle: 'Inverse Cosine (arccos)' },
          { label: 'tan', secondLabel: 'atan', action: () => handleFunction('tan('), secondAction: () => handleFunction('atan('), variant: 'outline', title: 'Tangent', secondTitle: 'Inverse Tangent (arctan)' },
          { label: 'sinh', secondLabel: 'asinh', action: () => handleFunction('sinh('), secondAction: () => handleFunction('asinh('), variant: 'outline', title: 'Hyperbolic Sine', secondTitle: 'Inverse Hyp. Sine' },
          { label: 'cosh', secondLabel: 'acosh', action: () => handleFunction('cosh('), secondAction: () => handleFunction('acosh('), variant: 'outline', title: 'Hyperbolic Cosine', secondTitle: 'Inverse Hyp. Cosine' },
      ],
      [
          { label: 'tanh', secondLabel: 'atanh', action: () => handleFunction('tanh('), secondAction: () => handleFunction('atanh('), variant: 'outline', title: 'Hyperbolic Tangent', secondTitle: 'Inverse Hyp. Tangent' },
          { label: '1/x', secondLabel: 'rand', action: () => handleFunction('1/'), secondAction: () => { setCurrentInput(String(Math.random())); setIsResultState(false); }, variant: 'outline', title: 'Reciprocal', secondTitle: 'Random Number' },
          { label: 'pmt', secondLabel: 'EE', action: () => handleFunction('pmt('), secondAction: () => handleInput('E'), variant: 'outline', title: 'Finance: PMT', secondTitle: 'Exponent (1E3)' },
          { label: 'mean', secondLabel: 'std', action: () => handleFunction('mean(['), secondAction: () => handleFunction('std(['), variant: 'outline', title: 'Mean', secondTitle: 'Std Deviation' },
          { label: 'var', secondLabel: '!', action: () => handleFunction('var(['), secondAction: () => handleInput('!'), variant: 'outline', title: 'Variance', secondTitle: 'Factorial' },
      ],
      [
          { label: 'round', secondLabel: 'ceil', action: () => handleFunction('round('), secondAction: () => handleFunction('ceil('), variant: 'outline', title: 'Round', secondTitle: 'Ceiling' },
          { label: 'floor', secondLabel: 'abs', action: () => handleFunction('floor('), secondAction: () => handleFunction('abs('), variant: 'outline', title: 'Floor', secondTitle: 'Absolute Value' },
          { label: '[,]', secondLabel: '[]', action: () => handleInput(','), secondAction: () => handleFunction('['), variant: 'outline', title: 'Comma', secondTitle: 'Open Array' },
          { label: '[', action: () => handleInput('['), variant: 'outline', title: 'Open Array' },
          { label: ']', action: () => handleInput(']'), variant: 'outline', title: 'Close Array' },
      ],
      [
          { label: 'ln', secondLabel: 'eˣ', action: () => handleFunction('log('), secondAction: () => handleFunction('exp('), variant: 'outline', title: 'Natural Logarithm (ln)', secondTitle: 'Exponential (e^x)' },
          { label: 'log', secondLabel: '10ˣ', action: () => handleFunction('log10('), secondAction: () => handleFunction('pow(10,'), variant: 'outline', title: 'Logarithm (base 10)', secondTitle: 'Power of 10' },
          { label: 'xʸ', secondLabel: 'ʸ√x', action: () => handleInput('^'), secondAction: () => handleFunction('nthRoot('), variant: 'outline', title: 'Power (x^y)', secondTitle: 'N-th Root' },
          { label: 'x²', secondLabel: '√x', action: () => handleInput('^2'), secondAction: () => handleFunction('sqrt('), variant: 'outline', title: 'Square', secondTitle: 'Square Root' },
          { label: 'x³', secondLabel: '∛x', action: () => handleInput('^3'), secondAction: () => handleFunction('cbrt('), variant: 'outline', title: 'Cube', secondTitle: 'Cube Root' },
      ],
      [
          { label: '(', action: () => handleInput('('), variant: 'outline', title: 'Open Parenthesis' },
          { label: ')', action: () => handleInput(')'), variant: 'outline', title: 'Close Parenthesis' },
          { label: 'nCr', secondLabel: 'nPr', action: () => handleFunction('nCr('), secondAction: () => handleFunction('nPr('), variant: 'outline', title: 'Combinations', secondTitle: 'Permutations' },
          { label: 'log₂', secondLabel: '2ˣ', action: () => handleFunction('log2('), secondAction: () => handleFunction('pow(2,'), variant: 'outline', title: 'Logarithm (base 2)', secondTitle: 'Power of 2' },
          { label: 'Γ', action: () => handleFunction('gamma('), variant: 'outline', title: 'Gamma Function' },
      ],
      [
          { label: '7', action: () => handleInput('7'), variant: 'num' },
          { label: '8', action: () => handleInput('8'), variant: 'num' },
          { label: '9', action: () => handleInput('9'), variant: 'num' },
          { label: '÷', action: () => handleOp('÷'), variant: 'secondary', title: 'Divide' },
          { label: 'rnd', action: () => handleFunction('round('), variant: 'outline', title: 'Round to Integer' },
      ],
      [
          { label: '4', action: () => handleInput('4'), variant: 'num' },
          { label: '5', action: () => handleInput('5'), variant: 'num' },
          { label: '6', action: () => handleInput('6'), variant: 'num' },
          { label: '×', action: () => handleOp('×'), variant: 'secondary', title: 'Multiply' },
          { label: 'abs', action: () => handleFunction('abs('), variant: 'outline', title: 'Absolute Value' },
      ],
      [
          { label: '1', action: () => handleInput('1'), variant: 'num' },
          { label: '2', action: () => handleInput('2'), variant: 'num' },
          { label: '3', action: () => handleInput('3'), variant: 'num' },
          { label: '−', action: () => handleOp('−'), variant: 'secondary', title: 'Subtract' },
          { label: '=', action: calculate, variant: 'primary', title: 'Equals (Enter)' },
      ],
      [
          { label: '0', action: () => handleInput('0'), variant: 'num', colSpan: 2 },
          { label: '.', action: () => handleInput('.'), variant: 'num', title: 'Decimal Point' },
          { label: '+', action: () => handleOp('+'), variant: 'secondary', title: 'Add' },
          { label: 'mod', action: () => handleFunction('mod('), variant: 'outline', title: 'Modulo' },
      ]
  ], [isSecond, handleInput, handleOp, handleFunction, calculate, clear, backspace, memoryAdd, memoryClear, memoryRecall, memorySubtract, currentInput, applyAns]);

  const angleModes: { id: AngleMode, label: string }[] = [{ id: 'deg', label: 'DEG' }, { id: 'rad', label: 'RAD' }, { id: 'grad', label: 'GRAD' }];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className={`lg:col-span-3 ${scaleConfig.containerClass} b-max transition-all duration-300`}>
             {/* Dynamic Workspace Preference Strip */}
             <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-surface/20 border border-brand-border/40 px-4 py-3 rounded-2xl mb-4 text-xs select-none">
               <div className="flex items-center gap-2 text-brand-text-secondary">
                 <Sliders size={13} className="text-brand-primary" />
                 <span className="font-black tracking-wider uppercase text-[10px]">Workspace controls</span>
               </div>
               
               <div className="flex flex-wrap items-center gap-3">
                 {/* Scale Selector */}
                 <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-bold text-brand-text-secondary uppercase">Scale:</span>
                   <div className="flex items-center gap-1 bg-brand-surface/50 border border-brand-border/30 rounded-lg p-0.5">
                     {(['sm', 'md', 'lg', 'colossal'] as const).map(scale => (
                       <button
                         key={scale}
                         type="button"
                         onClick={() => { triggerClick('tick'); setCalcScale(scale); }}
                         className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                           calcScale === scale
                             ? 'bg-brand-primary text-brand-bg shadow-sm shadow-brand-primary/20 font-black'
                             : 'text-brand-text-secondary hover:text-brand-text'
                         }`}
                       >
                         {scale === 'colossal' ? 'XL' : scale}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="h-4 w-px bg-brand-border/40 hidden sm:block" />

                 {/* Shortcuts toggle */}
                 <button
                   type="button"
                   onClick={() => { triggerClick('tick'); setIsShortcutsOpen(!isShortcutsOpen); }}
                   className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer uppercase ${
                     isShortcutsOpen 
                       ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary' 
                       : 'border-brand-border/40 text-brand-text-secondary hover:bg-brand-primary/10'
                   }`}
                   title="Toggle visual keyboard shortcuts helper"
                 >
                   <Keyboard size={11} />
                   <span>Shortcuts</span>
                 </button>
               </div>
             </div>

             <TiltCard className={`bg-brand-surface/40 backdrop-blur-xl rounded-3xl ${scaleConfig.cardPadding} text-right ${scaleConfig.cardHeight} flex flex-col justify-between relative border border-brand-border/50 shadow-inner group`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Ticker Tape */}
                <div className="h-16 overflow-y-auto text-right text-xs text-brand-text-secondary pr-1 scrollbar-none font-mono opacity-60">
                    <AnimatePresence initial={false}>
                      {tickerHistory.map((item, index) => (
                          <motion.div 
                            key={item.timestamp + index} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-end gap-2 border-b border-brand-border/10 py-1 last:border-0"
                          >
                              <span className="opacity-50">{item.expression}</span>
                              <span className="text-brand-primary font-bold">{formatNumber(item.result)}</span>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                </div>

                {/* Main Display */}
                <div className="relative pt-4">
                    <div className="flex items-center justify-end gap-3 text-[9px] font-black tracking-[0.2em] mb-2 uppercase select-none">
                        {isSecond && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-yellow-500 text-black px-2 py-0.5 rounded-full font-black">2ND</motion.span>}
                        <span className="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">{angleMode}</span>
                        {memory !== null && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">MEM</motion.span>}
                        
                        {/* Audio Feedback Controller */}
                        <button
                          onClick={() => {
                            const next = clickVolume === 'off' ? 'tick' : clickVolume === 'tick' ? 'sci' : 'off';
                            setClickVolume(next);
                            if (next !== 'off') playClickSound(next);
                          }}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-brand-border/40 hover:bg-brand-primary/10 transition-colors uppercase cursor-pointer"
                          title={`Click audio feedback: ${clickVolume}`}
                        >
                          {clickVolume === 'off' ? <VolumeX size={10} className="text-red-400" /> : <Volume2 size={10} className="text-brand-secondary" />}
                          Clicks: {clickVolume}
                        </button>
                    </div>
                    {/* Expression Line */}
                    <div className={`text-brand-text-secondary ${scaleConfig.exprSize} break-words overflow-x-auto text-right font-mono tracking-tighter opacity-70 scrollbar-none`} style={{ scrollbarWidth: 'none' }}>{expression || ' '}</div>
                    {/* Input/Result Line */}
                    <div className="relative group mt-2">
                        <div className={`font-black text-brand-text break-words ${scaleConfig.inputSize} overflow-x-auto text-right font-mono tracking-tighter leading-none pr-12 scrollbar-none`}>
                            {isResultState ? formatNumber(currentInput) : currentInput}
                        </div>
                        {currentInput !== '0' && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-xl bg-brand-surface border border-brand-border/30 hover:bg-brand-primary hover:text-brand-bg transition-all text-brand-text-secondary shadow-lg cursor-pointer"
                                    title="Share calculation"
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-xl bg-brand-surface border border-brand-border/30 hover:bg-brand-primary hover:text-brand-bg transition-all text-brand-text-secondary shadow-lg cursor-pointer"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                         )}
                    </div>
                     {/* Error Line */}
                    <div className="text-red-400 text-xs font-bold h-4 text-right">
                      {error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.span>}
                    </div>
                </div>
            </TiltCard>
            
             <div className={`grid grid-cols-5 ${scaleConfig.btnGap}`}>
              {buttonGrid.map((row, rowIndex) =>
                row.map((b, colIndex) => {
                  const isPressed = activeKey === b.label || !!(b.secondLabel && activeKey === b.secondLabel) || !!(b.label === 'del' && activeKey === 'del') || !!(b.label === 'AC' && activeKey === 'AC');
                  const labelToShow = isSecond && b.secondLabel ? b.secondLabel : b.label;
                  const titleToShow = isSecond && b.secondTitle ? b.secondTitle : b.title;
                  const isAct = b.active;

                  const getVariantStyles = () => {
                    if (isAct) return 'bg-brand-primary text-brand-bg ring-2 ring-brand-primary/50 shadow-lg shadow-brand-primary/20';
                    switch (b.variant) {
                      case 'primary': // `=`
                        return 'bg-gradient-to-r from-brand-primary to-emerald-500 text-brand-bg font-black text-2xl shadow-lg shadow-brand-primary/10';
                      case 'secondary': // operations
                        return 'bg-brand-surface/90 border border-brand-secondary/30 text-brand-secondary hover:text-white hover:bg-brand-secondary transition-all font-extrabold text-xl shadow-sm';
                      case 'outline': // sci operations
                        return 'bg-brand-surface/40 hover:bg-brand-surface border border-brand-border/45 hover:border-brand-primary/30 text-brand-text-secondary hover:text-brand-text text-sm md:text-sm font-sans tracking-tight';
                      case 'clear': // AC delete
                        return 'bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white hover:shadow-lg hover:shadow-red-500/15 text-sm uppercase tracking-wider font-extrabold';
                      case 'num': // numbers
                      default:
                        return 'bg-brand-surface/60 hover:bg-brand-surface text-brand-text border border-brand-border/25 hover:border-brand-border/60 hover:shadow-md';
                    }
                  };

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className={`col-span-${b.colSpan || 1}`}>
                      <motion.button
                        type="button"
                        onClick={isSecond && b.secondAction ? b.secondAction : b.action}
                        title={titleToShow}
                        whileHover={{ scale: 1.035, y: -1 }}
                        whileTap={{ scale: 0.94, y: 1 }}
                        animate={{
                          scale: isPressed ? 0.92 : 1,
                          y: isPressed ? 2 : 0,
                          boxShadow: isPressed 
                            ? "inset 0 2px 4px rgba(0,0,0,0.35)" 
                            : "0 2px 4px rgba(0,0,0,0.02)"
                        }}
                        transition={{ type: "spring", stiffness: 450, damping: 18 }}
                        className={`relative overflow-hidden w-full ${scaleConfig.btnHeight} flex flex-col items-center justify-center p-2 rounded-2xl text-center transition-all duration-200 select-none outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer ${getVariantStyles()}`}
                      >
                        <span className="relative z-10 flex flex-col items-center justify-center leading-none">
                          {b.secondLabel && !isSecond && (
                            <span className={`${scaleConfig.secondLabelSize} font-mono opacity-50 block uppercase leading-none font-semibold mb-0.5 tracking-wide`}>
                              {b.secondLabel}
                            </span>
                          )}
                          <span className={`font-bold font-sans ${scaleConfig.labelSize}`}>
                            {labelToShow}
                          </span>
                        </span>
                        {/* Reflective shine gradient overlay */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                      </motion.button>
                    </div>
                  );
                })
              )}
            </div>
            
           <div className="flex justify-center gap-2 mt-6 p-1.5 bg-brand-surface/30 rounded-full w-fit mx-auto border border-brand-border/30">
              {angleModes.map(mode => (
                  <button 
                    key={mode.id} 
                    type="button"
                    onClick={() => { triggerClick('tick'); setAngleMode(mode.id); }} 
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${angleMode === mode.id ? 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20 scale-105' : 'text-brand-text-secondary hover:text-brand-text'}`}
                  >
                      {mode.label}
                  </button>
              ))}
          </div>

          {/* Dynamic Keyboard Shortcuts visual legend container */}
          <AnimatePresence>
            {isShortcutsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden mt-6"
              >
                <div className="bg-brand-surface/20 border border-brand-border/30 rounded-3xl p-5 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard size={14} className="text-brand-primary" />
                    <h4 className="text-xs uppercase font-black tracking-widest text-brand-text">Keyboard Shortcuts Legend</h4>
                  </div>
                  <span className="text-[11px] text-brand-text-secondary leading-relaxed block mb-2">
                    The calculator supports direct physical keyboard controls for speed. Press the keys below:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { keys: ['0', '–', '9'], action: 'Numbers' },
                      { keys: ['+'], action: 'Add' },
                      { keys: ['-'], action: 'Subtract' },
                      { keys: ['*'], action: 'Multiply' },
                      { keys: ['/'], action: 'Divide' },
                      { keys: ['Enter', '='], action: 'Calculate' },
                      { keys: ['Backspace'], action: 'Delete' },
                      { keys: ['Escape'], action: 'Clear (AC)' },
                      { keys: ['P'], action: 'Constant Pi' },
                      { keys: ['E'], action: 'Sci Exponent' },
                      { keys: ['A'], action: 'Recall Ans' },
                      { keys: ['(', '['], action: 'Parentheses' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-brand-bg/50 border border-brand-border/25 text-[11px]">
                        <span className="text-brand-text-secondary pr-1 truncate">{item.action}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, kIdx) => (
                            <kbd key={kIdx} className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border/50 text-[10px] font-bold font-mono text-brand-primary shadow-sm leading-none">{k}</kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            <TiltCard className="bg-brand-surface/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl min-h-[440px] flex flex-col relative overflow-hidden group hover:border-brand-primary/30 transition-colors duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none group-hover:bg-brand-primary/20 transition-colors duration-700" />
              <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-brand-text tracking-tight relative z-10">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                    <Brain size={24} />
                </div>
                Formula Explorer
              </h3>
              <div className="flex-grow relative z-10">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent rounded-lg transition-opacity duration-300">
                    <Loader className="animate-spin text-brand-primary" size={48} />
                    <p className="mt-4 text-brand-text-secondary font-medium tracking-wide">Gemini is exploring...</p>
                  </div>
                )}

                {!isLoading && !explanation && (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-brand-text-secondary">
                      <div className="p-4 bg-brand-surface/30 rounded-full mb-4">
                          <FlaskConical size={40} className="text-brand-primary" />
                      </div>
                      <p className="font-extrabold text-brand-text mb-1">Unlock knowledge & explore.</p>
                      <p className="text-xs font-light leading-relaxed mb-6 max-w-sm">Perform calculations or tap a preset below to instantly load equations & explore detailed Gemini AI formula breakdown:</p>
                      
                      <div className="w-full text-left space-y-2 select-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5 mb-2">
                          <Sparkles size={11} />
                          <span>Tap equation preset to try:</span>
                        </span>
                        <div className="grid grid-cols-1 gap-2 w-full">
                          {[
                            { label: 'Trigonometry Identity', val: 'sin(45 deg)^2 + cos(45 deg)^2', badge: 'TRIG' },
                            { label: 'Monthly Mortgage Payment', val: 'pmt(5.5, 30, 350000)', badge: 'FIN' },
                            { label: 'Permutation Pairs', val: 'nPr(8, 3) + nCr(10, 4)', badge: 'MATH' },
                            { label: 'Exponentials & Logarithms', val: 'log(100) * exp(1.5)', badge: 'SCI' },
                            { label: 'Golden Ratio constant identity', val: 'phi^2 - phi', badge: 'CONST' },
                          ].map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => loadPresetFormula(p.val)}
                              className="w-full flex items-center justify-between p-3 rounded-2xl bg-brand-bg/40 hover:bg-brand-primary/10 border border-brand-border/30 hover:border-brand-primary/30 transition-all text-left text-xs text-brand-text group/preset cursor-pointer"
                            >
                              <div className="flex flex-col truncate pr-2">
                                <span className="font-extrabold text-brand-text group-hover/preset:text-brand-primary transition-colors text-[11px]">{p.label}</span>
                                <code className="font-mono text-[10px] text-brand-text-secondary mt-0.5 truncate">{p.val}</code>
                              </div>
                              <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-brand-surface border border-brand-border/25 text-brand-text-secondary/70 group-hover/preset:text-brand-primary group-hover/preset:border-brand-primary/20 shrink-0">{p.badge}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                )}

                {!isLoading && explanation && (
                  <div className="space-y-6 animate-fade-in-down">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className={`text-xl font-bold tracking-tight ${explanation.functionName === 'Error' ? 'text-red-500' : 'text-brand-text'}`}>
                        {explanation.functionName}
                      </h4>
                      {explanation.functionName === 'Error' && (
                        <AlertCircle className="text-red-500" size={20} />
                      )}
                    </div>
                    
                    {explanation.functionName !== 'Error' ? (
                      <>
                        <div className="font-mono bg-brand-bg/50 border border-brand-border/40 p-6 rounded-2xl text-2xl text-center text-brand-primary break-words shadow-inner">
                          <LatexRenderer latex={explanation.latexFormula || explanation.formula} />
                        </div>

                        {explanation.parameters && explanation.parameters.length > 0 && (
                          <div className="bg-brand-bg/30 p-4 rounded-2xl border border-brand-border/30">
                            <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-3 text-brand-text-secondary">Parameters</h5>
                            <div className="space-y-3 text-sm">
                              {explanation.parameters.map(p => (
                                <div key={p.param} className="flex gap-3">
                                  <code className="font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded text-[11px] h-fit mt-0.5">{p.param}</code>
                                  <span className="text-brand-text-secondary leading-relaxed font-light">{p.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-2 text-brand-text-secondary">Description</h5>
                          <p className="text-brand-text-secondary text-sm leading-relaxed font-light">{explanation.description}</p>
                        </div>

                        <div>
                          <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-2 text-brand-text-secondary">Example</h5>
                          <p className="font-mono text-brand-text-secondary italic bg-brand-bg/50 border border-brand-border/30 p-3 rounded-xl text-sm">{explanation.example}</p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl space-y-4">
                        <p className="text-brand-text-secondary text-sm leading-relaxed">
                          {explanation.description}
                        </p>
                        <button 
                          onClick={() => setActiveTab('settings')}
                          className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20 cursor-pointer"
                        >
                          OPEN SETTINGS
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TiltCard>
            
            <TiltCard className="bg-brand-surface/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl overflow-hidden relative group hover:border-brand-secondary/30 transition-colors duration-500">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-[60px] -mr-10 -mb-10 pointer-events-none group-hover:bg-brand-secondary/10 transition-colors duration-700" />
                <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-brand-text tracking-tight relative z-10">
                    <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-xl">
                        <FlaskConical size={24} />
                    </div>
                    Scientific Constants
                </h3>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-3 scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent relative z-10">
                    {SCIENTIFIC_CONSTANTS.map(c => (
                        <div key={c.symbol} onClick={() => handleInput(c.value)} title={`Value: ${c.value} ${c.unit}`} className="flex justify-between items-center p-3 rounded-2xl hover:bg-brand-bg/80 border border-transparent hover:border-brand-border/50 transition-all cursor-pointer group/item">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-brand-text group-hover/item:text-brand-secondary transition-colors">{c.name}</span>
                                <span className="text-[10px] text-brand-text-secondary font-black uppercase tracking-widest mt-0.5">{c.symbol}</span>
                            </div>
                            <span className="font-mono text-brand-text-secondary text-xs bg-brand-bg px-2 py-1 rounded-lg border border-brand-border/30">{c.value}</span>
                        </div>
                    ))}
                </div>
            </TiltCard>
        </div>
      </div>
      {toastMessage && <div className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-down">{toastMessage}</div>}
    </>
  );
};

export default Calculator;