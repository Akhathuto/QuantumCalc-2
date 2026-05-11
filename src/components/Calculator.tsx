
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { HistoryEntry, Explanation, AppTab } from '../types';
import { getFormulaExplanation } from '../services/geminiService';
import { formatNumber } from '../lib/formatters';
import Button from './common/Button';
import { create, all } from 'mathjs';
import { Copy, Check, Loader, Brain, FlaskConical, AlertCircle, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const math = create(all);
// Add nPr, nCr, and pmt functions
math.import({
  nPr: (n: number, k: number) => math.permutations(n, k),
  nCr: (n: number, k: number) => math.combinations(n, k),
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
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    try {
      const saved = localStorage.getItem('calc_angleMode');
      return (saved as AngleMode) || 'deg';
    } catch { return 'deg'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('calc_angleMode', angleMode);
    } catch { console.error("Failed to save angle mode"); }
  }, [angleMode]);
  const [memory, setMemory] = useState<number | null>(null);
  const [isSecond, setIsSecond] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tickerHistory, setTickerHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  }, []);

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

  const clear = useCallback(() => {
    setExpression('');
    setCurrentInput('0');
    setIsResultState(false);
    setError(null);
    setExplanation(null);
    setIsSecond(false);
  }, []);

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
  }, [isResultState, isSecond]);

  const handleFunction = useCallback((func: string, displayFunc?: string) => {
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
  }, [currentInput, isResultState, isSecond]);
  
  const backspace = useCallback(() => {
    setError(null);
    if (isResultState) {
        clear();
        return;
    }
    setCurrentInput(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, [isResultState, clear]);

  const calculate = useCallback(async () => {
    if (error || isLoading) return;
    
    let fullExpression = (expression + currentInput).trim();
    if (!fullExpression) return;
    
    // Auto-balance parentheses
    const openParen = (fullExpression.match(/\(/g) || []).length;
    const closeParen = (fullExpression.match(/\)/g) || []).length;
    if (openParen > closeParen) {
        fullExpression += ')'.repeat(openParen - closeParen);
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
  }, [currentInput, expression.length, isResultState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        // Prevent handling events if an input field is focused (e.g. in another tab)
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        event.preventDefault();
        const key = event.key;

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
        } else if (key === '(') {
            handleInput('(');
        } else if (key === ')') {
            handleInput(')');
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clear();
        } else if (key.toLowerCase() === 'e') {
            handleInput('E');
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleInput, handleOp, calculate, backspace, clear]);

  const memoryClear = useCallback(() => { setMemory(null); showToast("Memory cleared"); }, [showToast]);
  const memoryRecall = useCallback(() => { if(memory !== null) { setCurrentInput(String(memory)); setIsResultState(false); } }, [memory]);
  const memoryAdd = useCallback(() => {
    const currentVal = parseFloat(currentInput);
     if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) + currentVal);
        showToast("Value added to memory");
    }
  }, [currentInput, showToast]);
  const memorySubtract = useCallback(() => {
    const currentVal = parseFloat(currentInput);
    if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) - currentVal);
        showToast("Value subtracted from memory");
    }
  }, [currentInput, showToast]);
  
  const styles = useMemo(() => ({
    op: 'bg-brand-secondary hover:bg-orange-500 text-white font-black',
    mem: 'bg-brand-surface border border-brand-border hover:bg-brand-border text-brand-text-secondary text-xs',
    clear: 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20',
    num: 'bg-brand-surface/40 hover:bg-brand-surface text-brand-text font-bold border border-brand-border/30',
    func: 'bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-brand-bg font-bold border border-brand-primary/20',
    active: 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20',
  }), []);

  const buttonGrid: { label: string, secondLabel?: string, action: () => void, secondAction?: () => void, className: string, colSpan?: number, active?: boolean, title?: string, secondTitle?: string }[][] = useMemo(() => [
      [
          { label: '2nd', action: () => setIsSecond(s => !s), className: styles.func, active: isSecond, title: 'Toggle Secondary Functions' },
          { label: 'π', action: () => handleInput('π'), className: styles.func, title: 'Pi (3.141...)' },
          { label: 'e', action: () => handleInput('e'), className: styles.func, title: "Euler's Number (2.718...)" },
          { label: 'AC', action: clear, className: styles.clear, title: 'All Clear (Esc)' },
          { label: 'del', action: backspace, className: styles.clear, title: 'Delete (Backspace)' },
      ],
      [
          { label: 'x²', secondLabel: 'x³', action: () => handleInput('^2'), secondAction: () => handleInput('^3'), className: styles.func, title: 'Square (x^2)', secondTitle: 'Cube (x^3)' },
          { label: '1/x', secondLabel: 'rand', action: () => handleInput('^(-1)'), secondAction: () => { setCurrentInput(String(Math.random())); setIsResultState(false); }, className: styles.func, title: 'Reciprocal (1/x)', secondTitle: 'Random Number' },
          { label: '√', secondLabel: '∛', action: () => handleFunction('sqrt(', '√('), secondAction: () => handleFunction('cbrt(', '∛('), className: styles.func, title: 'Square Root (sqrt)', secondTitle: 'Cube Root (cbrt)' },
          { label: '(', action: () => handleInput('('), className: styles.func, title: 'Open Parenthesis' },
          { label: ')', action: () => handleInput(')'), className: styles.func, title: 'Close Parenthesis' },
      ],
      [
          { label: 'sin', secondLabel: 'asin', action: () => handleFunction('sin('), secondAction: () => handleFunction('asin('), className: styles.func, title: 'Sine', secondTitle: 'Inverse Sine (arcsin)' },
          { label: 'cos', secondLabel: 'acos', action: () => handleFunction('cos('), secondAction: () => handleFunction('acos('), className: styles.func, title: 'Cosine', secondTitle: 'Inverse Cosine (arccos)' },
          { label: 'tan', secondLabel: 'atan', action: () => handleFunction('tan('), secondAction: () => handleFunction('atan('), className: styles.func, title: 'Tangent', secondTitle: 'Inverse Tangent (arctan)' },
          { label: 'log', secondLabel: 'log₂', action: () => handleFunction('log10('), secondAction: () => handleFunction('log2('), className: styles.func, title: 'Logarithm (base 10)', secondTitle: 'Logarithm (base 2)' },
          { label: 'ln', action: () => handleFunction('log('), className: styles.func, title: 'Natural Logarithm (ln)' },
      ],
      [
          { label: 'MC', action: memoryClear, className: styles.mem, title: 'Memory Clear' },
          { label: 'MR', action: memoryRecall, className: styles.mem, title: 'Memory Recall' },
          { label: 'M+', action: memoryAdd, className: styles.mem, title: 'Memory Add' },
          { label: 'M-', action: memorySubtract, className: styles.mem, title: 'Memory Subtract' },
          { label: 'EE', action: () => handleInput('E'), className: styles.func, title: 'Exponent (e.g. 1.23E4)' },
      ],
       [
          { label: '7', action: () => handleInput('7'), className: styles.num },
          { label: '8', action: () => handleInput('8'), className: styles.num },
          { label: '9', action: () => handleInput('9'), className: styles.num },
          { label: '÷', action: () => handleOp('÷'), className: styles.op, title: 'Divide' },
          { label: '%', action: () => handleInput('%'), className: styles.func, title: 'Percentage' },
      ],
      [
          { label: '4', action: () => handleInput('4'), className: styles.num },
          { label: '5', action: () => handleInput('5'), className: styles.num },
          { label: '6', action: () => handleInput('6'), className: styles.num },
          { label: '×', action: () => handleOp('×'), className: styles.op, title: 'Multiply' },
          { label: '(', action: () => handleInput('('), className: styles.func, title: 'Open Parenthesis' },
      ],
      [
          { label: '1', action: () => handleInput('1'), className: styles.num },
          { label: '2', action: () => handleInput('2'), className: styles.num },
          { label: '3', action: () => handleInput('3'), className: styles.num },
          { label: '−', action: () => handleOp('−'), className: styles.op, title: 'Subtract' },
          { label: ')', action: () => handleInput(')'), className: styles.func, title: 'Close Parenthesis' },
      ],
      [
          { label: '0', action: () => handleInput('0'), className: styles.num, colSpan: 2 },
          { label: '.', action: () => handleInput('.'), className: styles.num, title: 'Decimal Point' },
          { label: '+', action: () => handleOp('+'), className: styles.op, title: 'Add' },
          { label: '=', action: calculate, className: styles.op, title: 'Equals (Enter)' },
      ]
  ], [styles, isSecond, handleInput, handleOp, handleFunction, calculate, clear, backspace, memoryAdd, memoryClear, memoryRecall, memorySubtract]);

  const angleModes: { id: AngleMode, label: string }[] = [{ id: 'deg', label: 'DEG' }, { id: 'rad', label: 'RAD' }, { id: 'grad', label: 'GRAD' }];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <div className="bg-brand-surface/40 backdrop-blur-xl rounded-3xl p-6 text-right min-h-[180px] flex flex-col justify-between relative border border-brand-border/50 shadow-inner group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Ticker Tape */}
                <div className="h-16 overflow-y-auto text-right text-xs text-brand-text-secondary pr-1 scrollbar-none font-mono opacity-60">
                    <AnimatePresence initial={false}>
                      {tickerHistory.map((item, index) => (
                          <motion.div 
                            key={item.timestamp + index} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-end gap-2"
                          >
                              <span className="opacity-50">{item.expression}</span>
                              <span className="text-brand-primary font-bold">{formatNumber(item.result)}</span>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                </div>

                {/* Main Display */}
                <div className="relative pt-2">
                    <div className="flex items-center justify-end gap-4 text-[10px] font-black tracking-widest mb-1">
                        {isSecond && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-sm">2ND</motion.span>}
                        <span className="text-brand-primary opacity-80">{angleMode.toUpperCase()}</span>
                        {memory !== null && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-cyan-400">MEM</motion.span>}
                    </div>
                    {/* Expression Line */}
                    <div className="text-brand-text-secondary text-lg break-words h-7 overflow-x-auto text-right font-mono tracking-tighter opacity-70" style={{ scrollbarWidth: 'none' }}>{expression || ' '}</div>
                    {/* Input/Result Line */}
                    <div className="relative group">
                        <div className="text-5xl font-black text-brand-text break-words min-h-[60px] overflow-x-auto text-right font-mono tracking-tighter leading-none pr-16">
                            {isResultState ? formatNumber(currentInput) : currentInput}
                        </div>
                        {currentInput !== '0' && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleShare}
                                    className="p-1.5 rounded-lg hover:bg-brand-surface/40 transition-all text-brand-text-secondary hover:text-brand-primary"
                                    title="Share calculation"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 rounded-lg hover:bg-brand-surface/40 transition-all text-brand-text-secondary hover:text-brand-primary"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                         )}
                    </div>
                     {/* Error Line */}
                    <div className="text-red-400 text-xs font-bold h-4 text-right">
                      {error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.span>}
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-5 gap-2">
              {buttonGrid.map((row, rowIndex) =>
                row.map((b, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} className={`col-span-${b.colSpan || 1}`}>
                    <Button
                      onClick={isSecond && b.secondAction ? b.secondAction : b.action}
                      className={`${b.active ? styles.active : b.className} h-12 text-base w-full`}
                      title={isSecond && b.secondTitle ? b.secondTitle : b.title}
                    >
                      {isSecond && b.secondLabel ? b.secondLabel : b.label}
                    </Button>
                  </div>
                ))
              )}
            </div>
            
           <div className="flex justify-center gap-2 mt-4">
              {angleModes.map(mode => (
                  <button key={mode.id} onClick={() => setAngleMode(mode.id)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${angleMode === mode.id ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-gray-600'}`}>
                      {mode.label}
                  </button>
              ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-brand-surface/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl min-h-[440px] flex flex-col relative overflow-hidden group hover:border-brand-primary/30 transition-colors duration-500">
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
                  <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                      <div className="p-4 bg-brand-surface/50 rounded-full mb-6">
                          <FlaskConical size={48} className="opacity-50 text-brand-secondary" />
                      </div>
                      <p className="font-bold text-lg text-brand-text mb-2">Unlock knowledge.</p>
                      <p className="text-sm font-light max-w-[200px] leading-relaxed">Perform a calculation using a scientific function (like sqrt, sin, log) to see a detailed explanation here.</p>
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
                          className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                        >
                          OPEN SETTINGS
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-brand-surface/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl overflow-hidden relative group hover:border-brand-secondary/30 transition-colors duration-500">
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
            </div>
        </div>
      </div>
      {toastMessage && <div className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-down">{toastMessage}</div>}
    </>
  );
};

export default Calculator;