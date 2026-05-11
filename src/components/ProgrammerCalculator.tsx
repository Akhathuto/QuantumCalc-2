import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    AlertTriangle, 
    Hash, 
    Binary, 
    Hexagon, 
    Table as TableIcon, 
    Type, 
    Cpu, 
    ArrowLeftRight, 
    Delete, 
    RotateCcw,
    Settings2,
    Info,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Base = 'bin' | 'oct' | 'dec' | 'hex';
type WordSize = 8 | 16 | 32 | 64;

interface KeypadProps {
    inputBase: Base;
    currentInputString: string;
    handleInputChange: (base: Base, strValue: string) => void;
    performBitwise: (op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSH' | 'RSH' | 'NEG') => void;
}

const Keypad: React.FC<KeypadProps> = ({ inputBase, currentInputString, handleInputChange, performBitwise }) => {
    const hexButtons = ['A', 'B', 'C', 'D', 'E', 'F'];
    const numButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
    
    const isButtonDisabled = (btn: string) => {
        if (inputBase === 'bin') return !/^[01]$/.test(btn);
        if (inputBase === 'oct') return !/^[0-7]$/.test(btn);
        if (inputBase === 'dec') return !/^[0-9]$/.test(btn);
        return false;
    };

    return (
        <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4 grid grid-cols-6 gap-2 mb-2">
                {hexButtons.map(b => (
                    <button
                        key={b}
                        disabled={inputBase !== 'hex'}
                        onClick={() => handleInputChange('hex', currentInputString + b)}
                        className={`p-3 rounded-lg font-mono font-bold transition-all ${
                            inputBase === 'hex' 
                            ? 'bg-brand-surface hover:bg-brand-primary hover:text-brand-bg text-brand-primary border border-brand-border hover:border-brand-primary shadow-sm' 
                            : 'bg-brand-bg/20 text-brand-text-secondary/10 border border-transparent cursor-not-allowed'
                        }`}
                    >
                        {b}
                    </button>
                ))}
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-3">
                {numButtons.map(b => (
                    <button
                        key={b}
                        disabled={isButtonDisabled(b)}
                        onClick={() => handleInputChange(inputBase, currentInputString + b)}
                        className={`p-5 rounded-2xl font-mono text-2xl font-bold transition-all ${
                            isButtonDisabled(b)
                            ? 'bg-brand-bg/20 text-brand-text-secondary/10 cursor-not-allowed border border-transparent'
                            : 'bg-brand-surface border border-brand-border hover:border-brand-primary hover:text-brand-primary hover:shadow-lg active:scale-95 text-brand-text'
                        } ${b === '0' ? 'col-span-2' : ''}`}
                    >
                        {b}
                    </button>
                ))}
                <button 
                    onClick={() => handleInputChange(inputBase, currentInputString.slice(0, -1))}
                    className="p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                    <Delete size={24} />
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <button onClick={() => performBitwise('LSH')} className="p-4 bg-brand-primary/5 text-brand-primary border border-brand-primary/20 rounded-2xl font-mono text-sm font-bold hover:bg-brand-primary hover:text-brand-bg transition-all shadow-sm">LSH</button>
                <button onClick={() => performBitwise('RSH')} className="p-4 bg-brand-primary/5 text-brand-primary border border-brand-primary/20 rounded-2xl font-mono text-sm font-bold hover:bg-brand-primary hover:text-brand-bg transition-all shadow-sm">RSH</button>
                <button onClick={() => performBitwise('NOT')} className="p-4 bg-brand-primary/5 text-brand-primary border border-brand-primary/20 rounded-2xl font-mono text-sm font-bold hover:bg-brand-primary hover:text-brand-bg transition-all shadow-sm">NOT</button>
                <button onClick={() => performBitwise('NEG')} className="p-4 bg-brand-primary/5 text-brand-primary border border-brand-primary/20 rounded-2xl font-mono text-sm font-bold hover:bg-brand-primary hover:text-brand-bg transition-all shadow-sm">NEG</button>
            </div>
        </div>
    );
};

const ProgrammerCalculator: React.FC = () => {
    const [value, setValue] = useState<bigint>(0n);
    const [floatValue, setFloatValue] = useState<number>(0);
    const [inputBase, setInputBase] = useState<Base>('dec');
    const [wordSize, setWordSize] = useState<WordSize>(64);
    const [isSigned, setIsSigned] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'calc' | 'bits' | 'char' | 'float'>('calc');
    const [history, setHistory] = useState<{ val: bigint; op: string }[]>([]);

    // Floating Point Helpers
    const getFloatData = (val: number, size: 32 | 64) => {
        const buffer = new ArrayBuffer(size / 8);
        const view = new DataView(buffer);
        if (size === 32) view.setFloat32(0, val);
        else view.setFloat64(0, val);
        
        let bin = '';
        for (let i = 0; i < size / 8; i++) {
            bin += view.getUint8(i).toString(2).padStart(8, '0');
        }
        
        if (size === 32) {
            return {
                sign: bin[0],
                exponent: bin.slice(1, 9),
                mantissa: bin.slice(9)
            };
        } else {
            return {
                sign: bin[0],
                exponent: bin.slice(1, 12),
                mantissa: bin.slice(12)
            };
        }
    };

    // Format helpers
    const formatBin = (val: bigint, size: WordSize) => {
        const bin = BigInt.asUintN(size, val).toString(2);
        return bin.padStart(size, '0').replace(/(.{4})/g, '$1 ').trim();
    };

    const formatHex = (val: bigint, size: WordSize) => {
        const hex = BigInt.asUintN(size, val).toString(16).toUpperCase();
        const hexLen = Math.ceil(size / 4);
        return hex.padStart(hexLen, '0');
    };

    const formatOct = (val: bigint, size: WordSize) => {
        return BigInt.asUintN(size, val).toString(8);
    };

    const formatDec = (val: bigint, size: WordSize, signed: boolean) => {
        try {
            return signed ? BigInt.asIntN(size, val).toString(10) : BigInt.asUintN(size, val).toString(10);
        } catch (e) {
            return "0";
        }
    };

    const handleInputChange = useCallback((base: Base, strValue: string) => {
        setError(null);
        setInputBase(base);
        
        if (!strValue.trim()) {
            setValue(0n);
            return;
        }

        try {
            const cleanVal = strValue.replace(/\s/g, '').toLowerCase();
            let parsed: bigint;
            
            if (base === 'bin') {
                if (!/^[01]+$/.test(cleanVal)) throw new Error('Invalid binary');
                parsed = BigInt('0b' + cleanVal);
            } else if (base === 'oct') {
                if (!/^[0-7]+$/.test(cleanVal)) throw new Error('Invalid octal');
                parsed = BigInt('0o' + cleanVal);
            } else if (base === 'hex') {
                if (!/^[0-9a-f]+$/.test(cleanVal)) throw new Error('Invalid hex');
                parsed = BigInt('0x' + cleanVal);
            } else {
                if (!/^-?[0-9]+$/.test(cleanVal)) throw new Error('Invalid decimal');
                parsed = BigInt(cleanVal);
            }
            
            setValue(isSigned ? BigInt.asIntN(wordSize, parsed) : BigInt.asUintN(wordSize, parsed));
        } catch (e) {
            setError(`Invalid ${base} input`);
        }
    }, [wordSize, isSigned]);

    const performBitwise = (op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSH' | 'RSH' | 'NEG') => {
        let newVal = value;
        switch (op) {
            case 'NOT': newVal = ~value; break;
            case 'NEG': newVal = -value; break;
            case 'LSH': newVal = value << 1n; break;
            case 'RSH': newVal = value >> 1n; break;
            default:
                setError(`${op} needs two operands`);
                return;
        }
        const constrained = isSigned ? BigInt.asIntN(wordSize, newVal) : BigInt.asUintN(wordSize, newVal);
        setValue(constrained);
        setHistory(prev => [{ val: constrained, op }, ...prev].slice(0, 5));
    };

    const toggleBit = (index: number) => {
        const mask = 1n << BigInt(index);
        const newVal = value ^ mask;
        setValue(isSigned ? BigInt.asIntN(wordSize, newVal) : BigInt.asUintN(wordSize, newVal));
    };

    const currentInputString = useMemo(() => {
        try {
            switch (inputBase) {
                case 'bin': return BigInt.asUintN(wordSize, value).toString(2);
                case 'oct': return BigInt.asUintN(wordSize, value).toString(8);
                case 'hex': return BigInt.asUintN(wordSize, value).toString(16).toUpperCase();
                case 'dec': return formatDec(value, wordSize, isSigned);
                default: return "0";
            }
        } catch (e) {
            return "0";
        }
    }, [value, inputBase, wordSize, isSigned]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;

            const key = e.key.toLowerCase();
            if (key === 'escape' || (e.ctrlKey && key === 'c')) {
                setValue(0n);
            }
            if (key === 'backspace') {
                const s = currentInputString;
                handleInputChange(inputBase, s.slice(0, -1));
            }
            if (/^[0-9a-f]$/.test(key)) {
                if (inputBase === 'bin' && !/^[01]$/.test(key)) return;
                if (inputBase === 'oct' && !/^[0-7]$/.test(key)) return;
                if (inputBase === 'dec' && !/^[0-9]$/.test(key)) return;
                handleInputChange(inputBase, currentInputString + key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBase, currentInputString, handleInputChange]);

    const renderBitGrid = () => {
        const bits = [];
        for (let i = wordSize - 1; i >= 0; i--) {
            const isActive = (value & (1n << BigInt(i))) !== 0n;
            bits.push(
                <button
                    key={i}
                    onClick={() => toggleBit(i)}
                    className={`h-12 w-full flex flex-col items-center justify-center rounded-lg border transition-all ${
                        isActive 
                        ? 'bg-brand-primary border-brand-primary text-brand-bg shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)] scale-[1.02]' 
                        : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:border-brand-primary/50'
                    }`}
                >
                    <span className="text-[9px] opacity-40 font-mono mb-1">{i}</span>
                    <span className="font-mono font-bold text-base leading-none">{isActive ? '1' : '0'}</span>
                </button>
            );
        }

        return (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 bg-brand-surface/20 rounded-2xl border border-brand-border/50">
                {bits}
            </div>
        );
    };


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-white flex items-center gap-4">
                        <Cpu size={48} className="text-brand-primary animate-pulse" />
                        Programmer Suite
                    </h2>
                    <p className="text-brand-text-secondary font-mono text-lg mt-2 opacity-80">Precision engineering for your digital architecture</p>
                </div>
                
                <div className="flex items-center gap-2 bg-brand-surface/40 p-2 rounded-2xl border border-brand-border/50 backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveView('calc')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-max ${activeView === 'calc' ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/50'}`}
                    >
                        <LayoutGrid size={18} /> Calculator
                    </button>
                    <button 
                        onClick={() => setActiveView('bits')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-max ${activeView === 'bits' ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/50'}`}
                    >
                        <Binary size={18} /> Bits
                    </button>
                    <button 
                        onClick={() => setActiveView('char')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-max ${activeView === 'char' ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/50'}`}
                    >
                        <Type size={18} /> Characters
                    </button>
                    <button 
                        onClick={() => setActiveView('float')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-max ${activeView === 'float' ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-105' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/50'}`}
                    >
                        <TableIcon size={18} /> IEEE 754
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Interaction Area */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-gradient-to-br from-brand-surface/60 to-brand-bg/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-brand-border/60 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -top-24 -right-24 h-64 w-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/10 transition-all duration-700" />
                        
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-10 relative z-10">
                            <div className="flex items-center gap-2 p-1.5 bg-brand-bg/60 rounded-2xl border border-brand-border/40 backdrop-blur-md shadow-inner">
                                {[64, 32, 16, 8].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setWordSize(size as WordSize)}
                                        className={`px-5 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${wordSize === size ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/5'}`}
                                    >
                                        {size}-BIT
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSigned(!isSigned)}
                                    className={`px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase border transition-all duration-300 shadow-sm ${isSigned ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20' : 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary/20'}`}
                                >
                                    {isSigned ? 'SIGNED' : 'UNSIGNED'}
                                </button>
                                <button 
                                    onClick={() => setValue(0n)}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-red-500/20"
                                    title="Reset"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {(['hex', 'dec', 'oct', 'bin'] as Base[]).map((base) => {
                                const isActive = inputBase === base;
                                const baseValue = base === 'hex' ? formatHex(value, wordSize) :
                                                base === 'dec' ? formatDec(value, wordSize, isSigned) :
                                                base === 'oct' ? formatOct(value, wordSize) :
                                                formatBin(value, wordSize);
                                
                                return (
                                    <motion.div 
                                        key={base} 
                                        whileHover={{ x: isActive ? 0 : 5 }}
                                        onClick={() => setInputBase(base)}
                                        className={`group/item flex items-center p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer shadow-sm ${
                                            isActive 
                                            ? 'bg-brand-primary/10 border-brand-primary/40 ring-1 ring-brand-primary/20' 
                                            : 'bg-brand-bg/40 border-transparent hover:border-brand-border/80 hover:bg-brand-bg/60'
                                        }`}
                                    >
                                        <div className="w-16 shrink-0">
                                            <span className={`text-[12px] font-black uppercase tracking-titles font-mono ${isActive ? 'text-brand-primary' : 'text-brand-text-secondary opacity-40 group-hover/item:opacity-70'}`}>
                                                {base}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <span className={`font-mono text-2xl md:text-3xl break-all leading-tight tracking-tight ${isActive ? 'text-brand-primary font-bold' : 'text-brand-text-secondary opacity-90'}`}>
                                                {baseValue}
                                            </span>
                                        </div>
                                        <div className={`ml-6 transition-all duration-500 ${isActive ? 'scale-125 opacity-100' : 'opacity-0 scale-75 group-hover/item:opacity-30'}`}>
                                            {base === 'hex' ? <Hexagon size={24} className="text-brand-primary" /> :
                                             base === 'bin' ? <Binary size={24} className="text-brand-primary" /> :
                                             base === 'dec' ? <Hash size={24} className="text-brand-primary" /> :
                                             <Info size={24} className="text-brand-primary" />}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 flex items-center gap-3 text-red-500 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-md"
                            >
                                <AlertTriangle size={20} />
                                <span className="text-sm font-bold tracking-tight">{error}</span>
                            </motion.div>
                        )}
                    </div>

                    <div className="bg-brand-surface/20 backdrop-blur-sm p-8 rounded-[3rem] border border-brand-border/40 shadow-xl">
                        <AnimatePresence mode="wait">
                            {activeView === 'calc' && (
                                <motion.div 
                                    key="calc"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Keypad 
                                        inputBase={inputBase}
                                        currentInputString={currentInputString}
                                        handleInputChange={handleInputChange}
                                        performBitwise={performBitwise}
                                    />
                                </motion.div>
                            )}
                            {activeView === 'bits' && (
                                <motion.div 
                                    key="bits"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black flex items-center gap-3">
                                            <Binary size={28} className="text-brand-primary" />
                                            Active Bitboard
                                        </h3>
                                        <span className="text-[10px] font-mono font-bold px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20">
                                            {wordSize} BITS TOTAL
                                        </span>
                                    </div>
                                    {renderBitGrid()}
                                    <div className="mt-8 p-6 bg-brand-bg/40 rounded-3xl border border-brand-border/30 flex items-start gap-4">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary mt-1">
                                            <Info size={20} />
                                        </div>
                                        <div>
                                            <p className="text-brand-text font-bold text-sm">Hardware Mapping Guide</p>
                                            <p className="text-brand-text-secondary text-xs mt-1 leading-relaxed">
                                                Bit 0 is the Least Significant Bit (LSB). Toggling bits updates the value across all bases in real-time. 
                                                The word size currently constrains the maximum representable value.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeView === 'char' && (
                                <motion.div 
                                    key="char"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 bg-brand-bg/40 rounded-[2.5rem] border border-brand-border/50 group hover:border-brand-primary/30 transition-colors">
                                            <h4 className="text-[11px] uppercase font-black text-brand-text-secondary tracking-[0.2em] mb-6 flex items-center gap-2 opacity-60">
                                                <Type size={14} className="text-brand-primary" /> Character Identity
                                            </h4>
                                            <div className="flex items-center gap-6">
                                                <div className="h-24 w-24 bg-brand-primary/5 rounded-[1.5rem] flex items-center justify-center text-5xl text-brand-primary font-black border border-brand-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                    {value >= 32n && value <= 126n ? String.fromCharCode(Number(value)) : <span className="text-xl opacity-20">NULL</span>}
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-white">
                                                        {value < 32n ? 'Control Block' : 
                                                         value > 255n ? 'UTF-8 Sequence' : 
                                                         `ASCII Glyph`}
                                                    </p>
                                                    <p className="text-sm text-brand-text-secondary mt-2 font-mono">
                                                        Point Code: <span className="text-brand-primary font-bold">U+{value.toString(16).toUpperCase().padStart(4, '0')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-8 bg-brand-bg/40 rounded-[2.5rem] border border-brand-border/50 group hover:border-brand-primary/30 transition-colors">
                                            <h4 className="text-[11px] uppercase font-black text-brand-text-secondary tracking-[0.2em] mb-6 flex items-center gap-2 opacity-60">
                                                <Settings2 size={14} className="text-brand-primary" /> Encoding Specs
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center group/row">
                                                    <span className="text-xs text-brand-text-secondary group-hover/row:text-white transition-colors">Binary Footprint:</span>
                                                    <span className="font-mono text-sm text-brand-primary font-black">{value < 128n ? '1 BYTE' : value < 2048n ? '2 BYTES' : '3 BYTES'}</span>
                                                </div>
                                                <div className="flex justify-between items-center group/row">
                                                    <span className="text-xs text-brand-text-secondary group-hover/row:text-white transition-colors">Plane Offset:</span>
                                                    <span className="font-mono text-sm text-brand-primary font-black">{value <= 127n ? 'BASIC LATIN' : 'SUPPLEMENTAL'}</span>
                                                </div>
                                                <div className="h-1 bg-brand-border/30 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-brand-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, Number(value) / 256 * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Hash size={80} />
                                        </div>
                                        <h4 className="text-lg font-black mb-4 flex items-center gap-3 text-white">
                                            <ArrowLeftRight size={24} className="text-brand-primary" /> 
                                            Base64 Encoding Context
                                        </h4>
                                        <div className="p-5 bg-brand-bg/80 rounded-[1.5rem] border border-brand-border/40 font-mono text-lg break-all text-brand-primary font-bold shadow-inner">
                                            {btoa(String.fromCharCode(Number(value % 256n)))}
                                        </div>
                                        <p className="mt-4 text-xs text-brand-text-secondary opacity-60 italic">Note: Single-character context displayed for reference.</p>
                                    </div>
                                </motion.div>
                            )}
                            {activeView === 'float' && (
                                <motion.div 
                                    key="float"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 w-full space-y-4">
                                            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Floating Point Input</label>
                                            <input 
                                                type="number"
                                                step="any"
                                                value={floatValue}
                                                onChange={e => setFloatValue(Number(e.target.value))}
                                                className="w-full bg-gray-900/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-2xl font-bold shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {(() => {
                                        const data = getFloatData(floatValue, wordSize === 64 ? 64 : 32);
                                        return (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
                                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 text-center">SIGN</p>
                                                        <p className="text-3xl font-mono text-center font-bold text-red-500">{data.sign}</p>
                                                    </div>
                                                    <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/20">
                                                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 text-center">EXPONENT</p>
                                                        <p className="text-xl font-mono text-center font-bold text-brand-primary break-all">{data.exponent}</p>
                                                    </div>
                                                    <div className="p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/20">
                                                        <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2 text-center">MANTISSA</p>
                                                        <p className="text-xl font-mono text-center font-bold text-brand-accent break-all">{data.mantissa}</p>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-brand-bg/40 rounded-[2.5rem] border border-brand-border shadow-inner">
                                                    <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Unified Hardware Representation</p>
                                                    <div className="font-mono text-sm break-all leading-relaxed opacity-80 text-center tracking-widest">
                                                        <span className="text-red-500 font-bold">{data.sign}</span>
                                                        <span className="text-brand-primary mx-1">{data.exponent}</span>
                                                        <span className="text-brand-accent">{data.mantissa}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Status & Analytics Sidecar */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-brand-surface/40 p-8 rounded-[3rem] border border-brand-border/50 shadow-2xl backdrop-blur-xl">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white border-b border-brand-border/30 pb-4">
                            <RotateCcw size={24} className="text-brand-primary" />
                            Operation Log
                        </h3>
                        {history.length > 0 ? (
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-5 bg-brand-bg/50 rounded-[1.5rem] border border-transparent hover:border-brand-primary/40 hover:bg-brand-bg/80 transition-all cursor-pointer shadow-sm active:scale-95" 
                                        onClick={() => setValue(h.val)}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-brand-primary p-1 bg-brand-primary/10 rounded border border-brand-primary/20 uppercase tracking-widest">{h.op}</span>
                                            <span className="text-[10px] text-brand-text-secondary font-mono opacity-50">ENTRY {history.length - i}</span>
                                        </div>
                                        <div className="text-base font-mono text-brand-text truncate group-hover:text-brand-primary transition-colors font-bold tracking-tight">
                                            0x{formatHex(h.val, wordSize)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6">
                                <div className="h-16 w-16 bg-brand-bg/40 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                                    <Info size={32} />
                                </div>
                                <p className="text-brand-text-secondary text-sm font-medium italic opacity-60">Awaiting your first calculation interaction...</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-brand-surface/40 p-8 rounded-[3rem] border border-brand-border/50 shadow-2xl backdrop-blur-xl group">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white border-b border-brand-border/30 pb-4">
                            <LayoutGrid size={24} className="text-brand-primary" />
                            Data Metrics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group/metric">
                                <span className="text-xs text-brand-text-secondary group-hover/metric:text-white transition-colors">Range Limit:</span>
                                <span className="font-mono text-xs text-brand-text font-bold">2<sup>{wordSize}</sup> - 1</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group/metric">
                                <span className="text-xs text-brand-text-secondary group-hover/metric:text-white transition-colors">JS Infinity Safe:</span>
                                <span className="font-mono text-xs text-brand-accent font-bold">{value <= BigInt(Number.MAX_SAFE_INTEGER) ? 'YES' : 'NO'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group/metric">
                                <span className="text-xs text-brand-text-secondary group-hover/metric:text-white transition-colors">Entropy Density:</span>
                                <span className="font-mono text-xs text-brand-secondary font-bold">{(value.toString(2).length / wordSize * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-8 py-4 bg-brand-primary text-brand-bg rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-3"
                            onClick={() => window.open('https://floating-point-gui.de/', '_blank')}
                        >
                            <TableIcon size={18} /> Hardware Standards
                        </motion.button>
                        <p className="mt-4 text-[10px] text-center text-brand-text-secondary opacity-40 uppercase tracking-widest font-black">QuantumCalc v2.0 Production Suite</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgrammerCalculator;

