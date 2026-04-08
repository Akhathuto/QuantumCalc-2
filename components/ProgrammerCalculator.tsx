import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

type Base = 'bin' | 'oct' | 'dec' | 'hex';
type WordSize = 8 | 16 | 32 | 64;

const ProgrammerCalculator: React.FC = () => {
    const [value, setValue] = useState<bigint>(0n);
    const [inputBase, setInputBase] = useState<Base>('dec');
    const [wordSize, setWordSize] = useState<WordSize>(64);
    const [error, setError] = useState<string | null>(null);

    // Format helpers
    const formatBin = (val: bigint, size: WordSize) => {
        let bin = BigInt.asUintN(size, val).toString(2);
        return bin.padStart(size, '0').replace(/(.{4})/g, '$1 ').trim();
    };

    const formatHex = (val: bigint, size: WordSize) => {
        let hex = BigInt.asUintN(size, val).toString(16).toUpperCase();
        return hex;
    };

    const formatOct = (val: bigint, size: WordSize) => {
        return BigInt.asUintN(size, val).toString(8);
    };

    const formatDec = (val: bigint, size: WordSize) => {
        return BigInt.asIntN(size, val).toString(10);
    };

    const handleInputChange = (base: Base, strValue: string) => {
        setError(null);
        setInputBase(base);
        
        if (!strValue.trim()) {
            setValue(0n);
            return;
        }

        try {
            let cleanVal = strValue.replace(/\s/g, '').toLowerCase();
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
            
            // Apply word size constraint
            setValue(BigInt.asIntN(wordSize, parsed));
        } catch (e) {
            setError(`Invalid ${base} input`);
        }
    };

    const performBitwise = (op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSH' | 'RSH') => {
        // For a real calculator we'd need a second operand for AND/OR/XOR/LSH/RSH.
        // For simplicity in this UI, we'll just implement NOT and shifts by 1.
        let newVal = value;
        switch (op) {
            case 'NOT':
                newVal = ~value;
                break;
            case 'LSH':
                newVal = value << 1n;
                break;
            case 'RSH':
                newVal = value >> 1n;
                break;
            default:
                setError(`${op} requires two operands (Not fully implemented in this simple view)`);
                return;
        }
        setValue(BigInt.asIntN(wordSize, newVal));
    };

    const currentInputString = useMemo(() => {
        switch (inputBase) {
            case 'bin': return BigInt.asUintN(wordSize, value).toString(2);
            case 'oct': return BigInt.asUintN(wordSize, value).toString(8);
            case 'hex': return BigInt.asUintN(wordSize, value).toString(16).toUpperCase();
            case 'dec': return BigInt.asIntN(wordSize, value).toString(10);
        }
    }, [value, inputBase, wordSize]);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Programmer Calculator</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Displays */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                                {[64, 32, 16, 8].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setWordSize(size as WordSize)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${wordSize === size ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        {size}-bit
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {(['hex', 'dec', 'oct', 'bin'] as Base[]).map((base) => (
                                <div 
                                    key={base} 
                                    className={`p-3 rounded-md border cursor-pointer transition-colors ${inputBase === base ? 'border-brand-primary bg-brand-primary/10' : 'border-transparent hover:bg-gray-800/50'}`}
                                    onClick={() => setInputBase(base)}
                                >
                                    <div className="flex text-sm text-brand-text-secondary uppercase font-bold mb-1 w-12">
                                        {base}
                                    </div>
                                    <input
                                        type="text"
                                        value={inputBase === base ? currentInputString : (
                                            base === 'hex' ? formatHex(value, wordSize) :
                                            base === 'dec' ? formatDec(value, wordSize) :
                                            base === 'oct' ? formatOct(value, wordSize) :
                                            formatBin(value, wordSize)
                                        )}
                                        onChange={(e) => handleInputChange(base, e.target.value)}
                                        className="w-full bg-transparent border-none p-0 font-mono text-lg focus:ring-0 text-brand-text break-all"
                                        spellCheck="false"
                                    />
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="mt-4 flex items-center gap-2 text-red-400 p-3 bg-red-900/50 rounded-md">
                                <AlertTriangle size={20} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Bitwise Operations */}
                <div className="space-y-4">
                    <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border h-full">
                        <h3 className="text-lg font-semibold mb-4 text-brand-text-secondary">Bitwise Operations</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => performBitwise('NOT')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md font-mono font-bold text-brand-primary transition-colors">NOT</button>
                            <button onClick={() => performBitwise('LSH')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md font-mono font-bold text-brand-primary transition-colors">LSH &lt;&lt;</button>
                            <button onClick={() => performBitwise('RSH')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md font-mono font-bold text-brand-primary transition-colors">RSH &gt;&gt;</button>
                            
                            <button onClick={() => setValue(0n)} className="p-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md font-bold transition-colors">CLEAR</button>
                        </div>
                        
                        <div className="mt-8">
                             <h3 className="text-sm font-semibold mb-2 text-brand-text-secondary">Quick Toggles</h3>
                             <p className="text-xs text-gray-500">
                                 Select a base on the left and type to input. Use the buttons above for quick bitwise NOT and shifts.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgrammerCalculator;
