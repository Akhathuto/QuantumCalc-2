import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import { Shuffle, Eye, Eraser, ArrowRightLeft, Copy, ShieldCheck, Table } from 'lucide-react';
import { motion } from 'motion/react';

const math = create(all, { number: 'BigNumber', precision: 64 });

interface MatrixInputGridProps {
    matrix: number[];
    setter: React.Dispatch<React.SetStateAction<number[]>>;
    label: string;
    rows: number;
    cols: number;
    highlight: { row: number | null, col: number | null };
    setHighlight: React.Dispatch<React.SetStateAction<{ row: number | null, col: number | null }>>;
    handleCellChange: (matrixSetter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: string) => void;
    fillMatrix: (setter: React.Dispatch<React.SetStateAction<number[]>>, type: 'random' | 'identity' | 'clear', rows: number, cols: number) => void;
    setRows: (val: number) => void;
    setCols: (val: number) => void;
}

const MatrixInputGrid: React.FC<MatrixInputGridProps> = ({ matrix, setter, label, rows, cols, highlight, setHighlight, handleCellChange, fillMatrix, setRows, setCols }) => {
    return (
        <div className="flex flex-col items-center gap-4 bg-brand-surface p-6 rounded-3xl border border-brand-border h-full w-full max-w-sm">
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary italic">{label}</span>
                <div className="flex items-center gap-3 text-[10px] font-mono text-brand-text-secondary uppercase">
                    <div className="flex items-center gap-1">
                        <span>R:</span>
                        <input type="number" min="1" max="5" value={rows} onChange={e => setRows(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} className="w-10 bg-brand-bg border border-brand-border rounded px-1 py-0.5 text-center focus:border-brand-primary outline-none" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span>C:</span>
                        <input type="number" min="1" max="5" value={cols} onChange={e => setCols(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} className="w-10 bg-brand-bg border border-brand-border rounded px-1 py-0.5 text-center focus:border-brand-primary outline-none" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 relative px-6">
                <div className="text-8xl font-thin text-brand-text/10 -mt-2 select-none absolute left-0">[</div>
                <div className={`grid gap-2 relative z-10`} style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}>
                    {Array.from({ length: rows * cols }).map((_, i) => {
                        const rowIndex = Math.floor(i / cols);
                        const colIndex = i % cols;
                        const isHighlighted = highlight.row === rowIndex || highlight.col === colIndex;

                        return (
                            <input
                                key={i}
                                type="number"
                                value={matrix[i] ?? ''}
                                onChange={(e) => handleCellChange(setter, i, e.target.value)}
                                onFocus={() => setHighlight({ row: rowIndex, col: colIndex })}
                                onBlur={() => setHighlight({ row: null, col: null })}
                                className={`w-10 h-10 sm:w-12 sm:h-12 bg-brand-bg border border-brand-border rounded-lg p-1 text-center sm:text-lg font-mono focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200 ${isHighlighted ? 'bg-brand-primary/10 border-brand-primary/30' : ''}`}
                            />
                        );
                    })}
                </div>
                <div className="text-8xl font-thin text-brand-text/10 -mt-2 select-none absolute right-0">]</div>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => fillMatrix(setter, 'random', rows, cols)} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors"><Shuffle size={12} /> Random</button>
                <button onClick={() => fillMatrix(setter, 'identity', rows, cols)} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors"><Eye size={12} /> Unit</button>
                <button onClick={() => fillMatrix(setter, 'clear', rows, cols)} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors"><Eraser size={12} /> Clear</button>
            </div>
        </div>
    );
};

const Matrix = () => {
    const [rowsA, setRowsA] = useState(3);
    const [colsA, setColsA] = useState(3);
    const [rowsB, setRowsB] = useState(3);
    const [colsB, setColsB] = useState(3);
    const [matrixA, setMatrixA] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const [matrixB, setMatrixB] = useState<number[]>([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [highlight, setHighlight] = useState<{row: number | null, col: number | null}>({ row: null, col: null });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMatrixA(prev => {
            const newMatrix = Array(rowsA * colsA).fill(0);
            for (let i = 0; i < Math.min(prev.length, newMatrix.length); i++) newMatrix[i] = prev[i];
            return newMatrix;
        });
    }, [rowsA, colsA]);

    useEffect(() => {
        setMatrixB(prev => {
            const newMatrix = Array(rowsB * colsB).fill(0);
            for (let i = 0; i < Math.min(prev.length, newMatrix.length); i++) newMatrix[i] = prev[i];
            return newMatrix;
        });
    }, [rowsB, colsB]);

    const handleCellChange = (matrixSetter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: string) => {
        matrixSetter(prev => {
            const newMatrix = [...prev];
            newMatrix[index] = value === '' ? 0 : parseFloat(value);
            return newMatrix;
        });
    };

    const getMatrix = (values: number[], rows: number, cols: number) => {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push(values.slice(i * cols, i * cols + cols));
        }
        return matrix;
    };

    const performOperation = (op: (a: any, b?: any) => any, requiresB: boolean = false) => {
        try {
            setError(null);
            const a = getMatrix(matrixA, rowsA, colsA);
            const b = requiresB ? getMatrix(matrixB, rowsB, colsB) : undefined;
            const res = b ? op(math.matrix(a), math.matrix(b)) : op(math.matrix(a));
            
            if (typeof res === 'number' || math.isBigNumber(res)) {
                setResult(`${math.format(res, {notation: 'fixed', precision: 4})}`);
            } else {
                setResult(math.format(res, { notation: 'fixed', precision: 4 }));
            }
        } catch (e: unknown) {
            let msg = e instanceof Error ? e.message : "An error occurred.";
            if (msg.includes('Dimension mismatch')) {
                 if (requiresB) {
                     msg = `Error: Dimension mismatch. Check if the matrices are compatible for this operation. For multiplication, cols of A must equal rows of B.`;
                 } else {
                     msg = `Error: Dimension mismatch. This operation may require a square matrix.`;
                 }
            }
            setError(msg);
            setResult(null);
        }
    };

    const copyResult = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const matrixButtons = [
        { label: 'A + B', action: () => performOperation((a, b) => math.add(a,b), true), cat: 'Linear' },
        { label: 'A - B', action: () => performOperation((a, b) => math.subtract(a,b), true), cat: 'Linear' },
        { label: 'A × B', action: () => performOperation((a, b) => math.multiply(a,b), true), cat: 'Linear' },
        { label: 'det(A)', action: () => performOperation(a => math.det(a), false), cat: 'Scalar' },
        { label: 'inv(A)', action: () => performOperation(a => math.inv(a), false), cat: 'Inversion' },
        { label: 'trans(A)', action: () => performOperation(a => math.transpose(a), false), cat: 'Transform' },
    ];
    
    const swapMatrices = () => {
        const tempA = [...matrixA];
        const tempRowsA = rowsA;
        const tempColsA = colsA;

        setMatrixA([...matrixB]);
        setRowsA(rowsB);
        setColsA(colsB);

        setMatrixB(tempA);
        setRowsB(tempRowsA);
        setColsB(tempColsA);
    };

    const fillMatrix = (setter: React.Dispatch<React.SetStateAction<number[]>>, type: 'random' | 'identity' | 'clear', rows: number, cols: number) => {
        const newMatrix = Array(rows * cols).fill(0);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const index = i * cols + j;
                if (type === 'random') {
                    newMatrix[index] = Math.floor(Math.random() * 10);
                } else if (type === 'identity') {
                    newMatrix[index] = (i === j) ? 1 : 0;
                } // 'clear' is default (fill(0))
            }
        }
        setter(newMatrix);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 items-center justify-items-center">
                <MatrixInputGrid 
                    matrix={matrixA} 
                    setter={setMatrixA} 
                    label="Active Register A" 
                    rows={rowsA} 
                    cols={colsA} 
                    setRows={setRowsA} 
                    setCols={setColsA} 
                    highlight={highlight} 
                    setHighlight={setHighlight} 
                    handleCellChange={handleCellChange} 
                    fillMatrix={fillMatrix} 
                />
                
                <div className="flex flex-col items-center gap-4">
                    <div className="h-px w-8 bg-brand-border"></div>
                    <button onClick={swapMatrices} className="p-4 bg-brand-surface border border-brand-border hover:bg-brand-bg hover:border-brand_primary text-brand-text-secondary hover:text-brand-primary rounded-2xl transition-all shadow-xl" title="Swap A and B">
                        <ArrowRightLeft size={24} />
                    </button>
                    <div className="h-px w-8 bg-brand-border"></div>
                </div>

                <MatrixInputGrid 
                    matrix={matrixB} 
                    setter={setMatrixB} 
                    label="Active Register B" 
                    rows={rowsB} 
                    cols={colsB} 
                    setRows={setRowsB} 
                    setCols={setColsB} 
                    highlight={highlight} 
                    setHighlight={setHighlight} 
                    handleCellChange={handleCellChange} 
                    fillMatrix={fillMatrix} 
                />
            </div>

            <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Command Execution Palette</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {matrixButtons.map(b => (
                        <button 
                            key={b.label} 
                            onClick={b.action} 
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-brand-bg border border-brand-border rounded-2xl hover:border-brand-primary transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                                <ArrowRightLeft className="rotate-45" size={40} />
                            </div>
                            <span className="text-xl font-black text-brand-text tracking-tighter">{b.label}</span>
                            <span className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-widest">{b.cat}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 via-transparent to-brand-primary/20 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-brand-bg border-4 border-brand-surface p-8 rounded-[2.5rem] min-h-[220px] flex flex-col items-center justify-center text-center overflow-hidden"
                >
                    <div className="absolute top-0 left-0 p-6 opacity-5">
                        <Table size={120} />
                    </div>
                    
                    <div className="relative z-10 w-full">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-brand-border"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-text-secondary italic">Output Stream</h3>
                            <div className="h-px flex-1 bg-brand-border"></div>
                        </div>

                        {error ? (
                            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl">
                                <p className="text-red-400 font-mono text-sm leading-relaxed uppercase tracking-tight">{error}</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                <pre className="text-2xl md:text-3xl font-black text-brand-text font-mono whitespace-pre-wrap tracking-tighter overflow-x-auto scrollbar-hide py-4 leading-tight">
                                    {result}
                                </pre>
                                <button 
                                    onClick={copyResult}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {copied ? <ShieldCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {copied ? 'Captured' : 'Capture Buffer'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 opacity-30">
                                <p className="text-2xl font-black text-brand-text uppercase tracking-tighter italic">Idle State</p>
                                <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.3em]">Awaiting Vector Instructions</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Matrix;
