/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import { Shuffle, Eye, Eraser, ArrowRightLeft } from 'lucide-react';
import Button from './common/Button';

const math = create(all, { number: 'BigNumber', precision: 64 });

interface MatrixInputGridProps {
    matrix: number[];
    setter: React.Dispatch<React.SetStateAction<number[]>>;
    label: string;
    size: number;
    highlight: { row: number | null, col: number | null };
    setHighlight: React.Dispatch<React.SetStateAction<{ row: number | null, col: number | null }>>;
    handleCellChange: (matrixSetter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: string) => void;
    fillMatrix: (setter: React.Dispatch<React.SetStateAction<number[]>>, type: 'random' | 'identity' | 'clear') => void;
}

const MatrixInputGrid: React.FC<MatrixInputGridProps> = ({ matrix, setter, label, size, highlight, setHighlight, handleCellChange, fillMatrix }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold mb-2">{label}</h3>
            <div className="flex items-center gap-2">
                <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">[</div>
                <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`}}>
                    {Array.from({ length: size * size }).map((_, i) => {
                        const rowIndex = Math.floor(i / size);
                        const colIndex = i % size;
                        const isHighlighted = highlight.row === rowIndex || highlight.col === colIndex;

                        return (
                            <input
                                key={i}
                                type="number"
                                value={matrix[i] ?? ''}
                                onChange={(e) => handleCellChange(setter, i, e.target.value)}
                                onFocus={() => setHighlight({ row: rowIndex, col: colIndex })}
                                onBlur={() => setHighlight({ row: null, col: null })}
                                className={`w-16 h-16 bg-gray-900/70 border-gray-600 rounded-md p-2 text-center text-lg font-mono focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 ${isHighlighted ? 'bg-brand-primary/20' : ''}`}
                            />
                        );
                    })}
                </div>
                <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">]</div>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => fillMatrix(setter, 'random')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Shuffle size={12} /> Random</button>
                <button onClick={() => fillMatrix(setter, 'identity')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eye size={12} /> Identity</button>
                <button onClick={() => fillMatrix(setter, 'clear')} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eraser size={12} /> Clear</button>
            </div>
        </div>
    );
};

const Matrix = () => {
    const [size, setSize] = useState(3);
    const [matrixA, setMatrixA] = useState(Array(9).fill(0));
    const [matrixB, setMatrixB] = useState(Array(9).fill(0));
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [highlight, setHighlight] = useState<{row: number | null, col: number | null}>({ row: null, col: null });

    useEffect(() => {
        const newSize = size * size;
        setMatrixA(prev => [...prev, ...Array(newSize).fill(0)].slice(0, newSize));
        setMatrixB(prev => [...prev, ...Array(newSize).fill(0)].slice(0, newSize));
        
        if (size === 3) {
            setMatrixA([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            setMatrixB([9, 8, 7, 6, 5, 4, 3, 2, 1]);
        } else {
            setMatrixA([1, 2, 3, 4]);
            setMatrixB([5, 6, 7, 8]);
        }
    }, [size]);

    const handleCellChange = (matrixSetter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: string) => {
        matrixSetter(prev => {
            const newMatrix = [...prev];
            newMatrix[index] = value === '' ? 0 : parseFloat(value);
            return newMatrix;
        });
    };

    const getMatrix = (values: number[]) => {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix.push(values.slice(i * size, i * size + size));
        }
        return matrix;
    };

    const performOperation = (op: (a: any, b?: any) => any, requiresB: boolean = false) => {
        try {
            setError(null);
            const a = getMatrix(matrixA);
            const b = requiresB ? getMatrix(matrixB) : undefined;
            const res = b ? op(math.matrix(a), math.matrix(b)) : op(math.matrix(a));
            
            if (typeof res === 'number' || math.isBigNumber(res)) {
                setResult(`Result: ${math.format(res, {notation: 'fixed', precision: 4})}`);
            } else {
                setResult(math.format(res, { notation: 'fixed', precision: 4 }));
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "An error occurred.";
            setError(msg);
            setResult(null);
        }
    };

    const matrixButtons = [
        { label: 'A + B', action: () => performOperation((a, b) => math.add(a,b), true) },
        { label: 'A - B', action: () => performOperation((a, b) => math.subtract(a,b), true) },
        { label: 'A × B', action: () => performOperation((a, b) => math.multiply(a,b), true) },
        { label: 'det(A)', action: () => performOperation(a => math.det(a), false) },
        { label: 'inv(A)', action: () => performOperation(a => math.inv(a), false) },
        { label: 'trans(A)', action: () => performOperation(a => math.transpose(a), false) },
    ];
    
    const swapMatrices = () => {
        const temp = [...matrixA];
        setMatrixA([...matrixB]);
        setMatrixB(temp);
    };

    const fillMatrix = (setter: React.Dispatch<React.SetStateAction<number[]>>, type: 'random' | 'identity' | 'clear') => {
        const newMatrix = Array(size * size).fill(0);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const index = i * size + j;
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
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary text-center">Matrix Calculator</h2>
            
            <div className="mb-6 flex justify-center items-center gap-4">
                <label className="text-brand-text-secondary">Matrix Size:</label>
                <select 
                    value={size} 
                    onChange={e => setSize(parseInt(e.target.value))}
                    className="bg-brand-surface border-gray-600 rounded-md p-2"
                >
                    <option value={2}>2x2</option>
                    <option value={3}>3x3</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center justify-items-center mb-6">
                <MatrixInputGrid matrix={matrixA} setter={setMatrixA} label="Matrix A" size={size} highlight={highlight} setHighlight={setHighlight} handleCellChange={handleCellChange} fillMatrix={fillMatrix} />
                <button onClick={swapMatrices} className="p-3 bg-brand-surface hover:bg-brand-border rounded-full transition-colors" title="Swap A and B">
                    <ArrowRightLeft />
                </button>
                <MatrixInputGrid matrix={matrixB} setter={setMatrixB} label="Matrix B" size={size} highlight={highlight} setHighlight={setHighlight} handleCellChange={handleCellChange} fillMatrix={fillMatrix} />
            </div>

            <div className="border-t border-brand-border my-6"></div>

            <h3 className="text-xl font-semibold mb-4 text-center">Operations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 max-w-4xl mx-auto">
                 {matrixButtons.map(b => (
                    <Button key={b.label} onClick={b.action} className="bg-brand-primary/80 hover:bg-brand-primary h-14 text-lg">
                        {b.label}
                    </Button>
                ))}
            </div>
            
            <div className="bg-brand-bg p-6 rounded-lg min-h-[150px]">
                <h3 className="text-xl font-bold mb-2 text-brand-accent">Result</h3>
                {error && <p className="text-red-400 font-mono">{error}</p>}
                {result && <pre className="text-lg font-mono whitespace-pre-wrap">{result}</pre>}
                {!error && !result && <p className="text-brand-text-secondary">Select an operation to see the result.</p>}
            </div>
        </div>
    );
};

export default Matrix;