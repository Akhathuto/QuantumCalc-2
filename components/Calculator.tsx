
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import type { ReactNode } from 'react';
import { HistoryEntry, Explanation } from '../types';
import { getFormulaExplanation } from '../services/geminiService';
import Button from './common/Button';
import { create, all } from 'mathjs';
import { Loader, Brain, FlaskConical } from 'lucide-react';

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

const LatexRenderer = memo(({ latex }: { latex: string }) => {
  // A basic recursive parser for a subset of LaTeX to handle nested structures.
  const parseLatex = (str: string, keyPrefix: string = 'l'): ReactNode[] => {
    const result: ReactNode[] = [];
    let i = 0;
    let key = 0;

    const parseGroup = (): string => {
      let braceCount = 1;
      let content = '';
      i++; // Skip opening brace '{'
      while (i < str.length && braceCount > 0) {
        if (str[i] === '{') braceCount++;
        else if (str[i] === '}') braceCount--;
        
        if (braceCount > 0) {
          content += str[i];
        }
        i++;
      }
      return content;
    };

    while (i < str.length) {
      const char = str[i];

      if (char === '^' || char === '_') {
        const Tag = char === '^' ? 'sup' : 'sub';
        i++;
        let content;
        if (str[i] === '{') {
          const groupContent = parseGroup();
          content = parseLatex(groupContent, `${keyPrefix}-${key}-s`);
        } else {
          content = str[i];
          i++;
        }
        result.push(<Tag key={`${keyPrefix}-${key++}`} className="text-[0.7em] mx-px">{content}</Tag>);
      } else if (char === '\\') {
        let command = '';
        i++;
        while (i < str.length && /[a-zA-Z]/.test(str[i])) {
          command += str[i];
          i++;
        }
        
        const symbols: Record<string, string> = {
          'theta': 'θ', 'pi': 'π', 'phi': 'φ', 'Delta': 'Δ', 'pm': '±',
          'times': '×', 'div': '÷', 'cdot': '·'
        };

        if (command === 'sqrt') {
          let content;
          if (str[i] === '{') {
            const groupContent = parseGroup();
            content = parseLatex(groupContent, `${keyPrefix}-${key}-sqrt`);
          } else {
            content = str[i];
            i++;
          }
          result.push(
            <span key={`${keyPrefix}-${key++}`} className="inline-flex items-center">
              <span className="text-2xl">&radic;</span>
              <span className="border-t border-current -ml-1 pl-1">{content}</span>
            </span>
          );
        } else if (command === 'frac') {
          const numerator = str[i] === '{' ? parseGroup() : '';
          const denominator = str[i] === '{' ? parseGroup() : '';
          result.push(
            <span key={`${keyPrefix}-${key++}`} className="inline-flex flex-col items-center text-center mx-1 leading-none align-middle">
              <span className="border-b border-current pb-1 px-1">{parseLatex(numerator, `${keyPrefix}-${key}-n`)}</span>
              <span className="pt-1 px-1">{parseLatex(denominator, `${keyPrefix}-${key}-d`)}</span>
            </span>
          );
        } else if (symbols[command]) {
          result.push(<span key={`${keyPrefix}-${key++}`}>{symbols[command]}</span>);
        } else {
          result.push(<span key={`${keyPrefix}-${key++}`}>\{command}</span>);
        }
      } else {
        let text = '';
        while (i < str.length && !'\\^_'.includes(str[i])) {
          text += str[i];
          i++;
        }
        result.push(text);
      }
    }
    return result;
  };
  
  return <>{parseLatex(latex)}</>;
});


const Calculator = ({ addToHistory, expressionToLoad, onExpressionLoaded }: CalculatorProps) => {
  const [expression, setExpression] = useState(''); // The top, ongoing expression line
  const [currentInput, setCurrentInput] = useState('0'); // The bottom, current input line
  const [isResultState, setIsResultState] = useState(false); // Are we showing a final result?
  
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [memory, setMemory] = useState<number | null>(null);
  const [isSecond, setIsSecond] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tickerHistory, setTickerHistory] = useState<HistoryEntry[]>([]);

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
      clear();
      setCurrentInput(expressionToLoad.expression);
      onExpressionLoaded();
    }
  }, [expressionToLoad, onExpressionLoaded, clear]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  };

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
    } catch (e: any) {
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

  const handleOp = (op: string) => {
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
  };

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

  const memoryClear = () => { setMemory(null); showToast("Memory cleared"); };
  const memoryRecall = () => { if(memory !== null) { setCurrentInput(String(memory)); setIsResultState(false); } };
  const memoryStore = () => {
    const valToStore = parseFloat(currentInput);
    if (!isNaN(valToStore)) {
        setMemory(valToStore);
        showToast("Value stored in memory");
    }
  };
  const memoryAdd = () => {
    const currentVal = parseFloat(currentInput);
     if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) + currentVal);
        showToast("Value added to memory");
    }
  };
  const memorySubtract = () => {
    const currentVal = parseFloat(currentInput);
    if (!isNaN(currentVal)) {
        setMemory(prev => (prev || 0) - currentVal);
        showToast("Value subtracted from memory");
    }
  };
  
  const styles = {
    op: 'bg-brand-secondary hover:bg-orange-500 text-white',
    mem: 'bg-teal-600 hover:bg-teal-500 text-white',
    clear: 'bg-red-500/80 hover:bg-red-500 text-white',
    num: 'bg-brand-surface hover:bg-gray-600 text-brand-text',
    func: 'bg-brand-primary/80 hover:bg-brand-primary text-white',
    active: 'bg-brand-primary text-white',
  };

  const buttonGrid: { label: string, secondLabel?: string, action: any, secondAction?: any, className: string, colSpan?: number, active?: boolean, title?: string, secondTitle?: string }[][] = [
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
          { label: 'sinh', secondLabel: 'asinh', action: () => handleFunction('sinh('), secondAction: () => handleFunction('asinh('), className: styles.func, title: 'Hyperbolic Sine', secondTitle: 'Inverse Hyperbolic Sine' },
          { label: 'cosh', secondLabel: 'acosh', action: () => handleFunction('cosh('), secondAction: () => handleFunction('acosh('), className: styles.func, title: 'Hyperbolic Cosine', secondTitle: 'Inverse Hyperbolic Cosine' },
          { label: 'tanh', secondLabel: 'atanh', action: () => handleFunction('tanh('), secondAction: () => handleFunction('atanh('), className: styles.func, title: 'Hyperbolic Tangent', secondTitle: 'Inverse Hyperbolic Tangent' },
          { label: 'nCr', action: () => handleFunction('nCr('), className: styles.func, title: 'Combinations' },
          { label: 'nPr', action: () => handleFunction('nPr('), className: styles.func, title: 'Permutations' },
      ],
       [
          { label: '7', action: () => handleInput('7'), className: styles.num },
          { label: '8', action: () => handleInput('8'), className: styles.num },
          { label: '9', action: () => handleInput('9'), className: styles.num },
          { label: '÷', action: () => handleOp('÷'), className: styles.op, title: 'Divide' },
          { label: 'MC', action: memoryClear, className: styles.mem, title: 'Memory Clear' },
      ],
      [
          { label: '4', action: () => handleInput('4'), className: styles.num },
          { label: '5', action: () => handleInput('5'), className: styles.num },
          { label: '6', action: () => handleInput('6'), className: styles.num },
          { label: '×', action: () => handleOp('×'), className: styles.op, title: 'Multiply' },
          { label: 'MR', action: memoryRecall, className: styles.mem, title: 'Memory Recall' },
      ],
      [
          { label: '1', action: () => handleInput('1'), className: styles.num },
          { label: '2', action: () => handleInput('2'), className: styles.num },
          { label: '3', action: () => handleInput('3'), className: styles.num },
          { label: '−', action: () => handleOp('−'), className: styles.op, title: 'Subtract' },
          { label: 'M+', action: memoryAdd, className: styles.mem, title: 'Memory Add' },
      ],
      [
          { label: '0', action: () => handleInput('0'), className: styles.num, colSpan: 2 },
          { label: '.', action: () => handleInput('.'), className: styles.num, title: 'Decimal Point' },
          { label: '+', action: () => handleOp('+'), className: styles.op, title: 'Add' },
          { label: 'M-', action: memorySubtract, className: styles.mem, title: 'Memory Subtract' },
      ],
      [
          { label: '%', action: () => handleInput('%'), className: styles.func, title: 'Percentage' },
          { label: 'EE', action: () => handleInput('E'), className: styles.func, title: 'Exponent (e.g. 1.23E4)' },
          { label: '=', action: calculate, className: styles.op, colSpan: 3, title: 'Equals (Enter)' },
      ]
  ];

  const angleModes: { id: AngleMode, label: string }[] = [{ id: 'deg', label: 'DEG' }, { id: 'rad', label: 'RAD' }, { id: 'grad', label: 'GRAD' }];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <div className="bg-gray-900/50 rounded-lg p-4 text-right min-h-[160px] flex flex-col justify-between relative border border-brand-border">
                {/* Ticker Tape */}
                <div className="h-20 overflow-y-auto text-right text-sm text-brand-text-secondary pr-1 scrollbar-thin scrollbar-thumb-brand-surface">
                    {tickerHistory.map((item, index) => (
                        <div key={item.timestamp + index} className="opacity-70 animate-fade-in-down">
                            <span className="truncate">{item.expression} = </span>
                            <span className="font-semibold">{item.result}</span>
                        </div>
                    ))}
                </div>

                {/* Main Display */}
                <div className="border-t border-brand-border/50 pt-2 relative">
                    <div className="absolute top-2 left-3 flex items-center gap-4 text-xs font-bold z-10">
                        {isSecond && <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded animate-fade-in-down">2nd</span>}
                        <span className="text-brand-primary">{angleMode.toUpperCase()}</span>
                        {memory !== null && <span className="text-teal-400 animate-fade-in-down">M</span>}
                    </div>
                    {/* Expression Line */}
                    <div className="text-brand-text-secondary text-xl break-words h-7 overflow-x-auto text-right font-mono transition-opacity duration-300" style={{ scrollbarWidth: 'none' }}>{expression || ' '}</div>
                    {/* Input/Result Line */}
                    <div className="text-4xl font-bold text-brand-text break-words min-h-[48px] overflow-x-auto text-right font-mono transition-all duration-200">
                        {currentInput}
                    </div>
                     {/* Error Line */}
                    <div className="text-red-400 text-sm font-semibold h-5 text-right transition-opacity duration-300">
                      {error && <span className="animate-fade-in-down">{error}</span>}
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
        
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-surface/50 p-6 rounded-lg min-h-[400px] flex flex-col">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-brand-primary">
                <Brain /> Formula Explorer
              </h3>
              <div className="flex-grow relative">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-surface/50 rounded-lg transition-opacity duration-300">
                    <Loader className="animate-spin text-brand-primary" size={48} />
                    <p className="mt-4 text-brand-text-secondary">Gemini is exploring...</p>
                  </div>
                )}

                {!isLoading && !explanation && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                      <FlaskConical size={48} className="mb-4 opacity-50" />
                      <p className="font-semibold">Unlock knowledge with every calculation.</p>
                      <p className="text-sm">Perform a calculation using a scientific function (like sqrt, sin, log) to see a detailed explanation here.</p>
                  </div>
                )}

                {!isLoading && explanation && (
                  <div className="space-y-4 animate-fade-in-down">
                    <h4 className="text-xl font-semibold text-brand-accent">{explanation.functionName}</h4>
                    
                    <div className="font-mono bg-brand-bg p-4 rounded-md text-2xl text-center text-brand-secondary break-words">
                      <LatexRenderer latex={explanation.latexFormula || explanation.formula} />
                    </div>

                    {explanation.parameters && explanation.parameters.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Parameters:</h5>
                        <div className="space-y-2 text-sm">
                          {explanation.parameters.map(p => (
                            <div key={p.param} className="flex">
                              <code className="font-bold text-brand-secondary w-12 flex-shrink-0">{p.param}</code>
                              <span className="text-brand-text-secondary">{p.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-semibold mb-2">Description:</h5>
                      <p className="text-brand-text-secondary text-sm">{explanation.description}</p>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-2">Example:</h5>
                      <p className="font-mono text-brand-text-secondary italic bg-brand-bg p-2 rounded-md text-sm">{explanation.example}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-brand-primary"><FlaskConical /> Scientific Constants</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {SCIENTIFIC_CONSTANTS.map(c => (
                        <div key={c.symbol} onClick={() => handleInput(c.value)} title={`Value: ${c.value} ${c.unit}`} className="flex justify-between items-center p-2 rounded-md hover:bg-brand-surface cursor-pointer">
                            <div>
                                <span className="font-semibold">{c.name}</span>
                                <span className="text-sm text-brand-text-secondary ml-2">{`(${c.symbol})`}</span>
                            </div>
                            <span className="font-mono text-brand-accent text-sm">{c.value}</span>
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