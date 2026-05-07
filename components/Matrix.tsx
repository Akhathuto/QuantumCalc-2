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
        <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold mb-2">{label}</h3>
            
            <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="text-brand-text-secondary">Rows:</span>
                <input type="number" min="1" max="5" value={rows} onChange={e => setRows(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} className="w-12 bg-brand-surface border-gray-600 rounded p-1 text-center" />
                <span className="text-brand-text-secondary ml-2">Cols:</span>
                <input type="number" min="1" max="5" value={cols} onChange={e => setCols(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} className="w-12 bg-brand-surface border-gray-600 rounded p-1 text-center" />
            </div>

            <div className="flex items-center gap-2">
                <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">[</div>
                <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}>
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
                                className={`w-14 h-14 sm:w-16 sm:h-16 bg-gray-900/70 border-gray-600 rounded-md p-1 text-center sm:text-lg font-mono focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 ${isHighlighted ? 'bg-brand-primary/20' : ''}`}
                            />
                        );
                    })}
                </div>
                <div className="text-6xl font-thin text-brand-text-secondary -mt-2 select-none">]</div>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => fillMatrix(setter, 'random', rows, cols)} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Shuffle size={12} /> Random</button>
                <button onClick={() => fillMatrix(setter, 'identity', rows, cols)} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eye size={12} /> Identity</button>
                <button onClick={() => fillMatrix(setter, 'clear', rows, cols)} className="text-xs px-2 py-1 bg-brand-surface hover:bg-brand-border rounded flex items-center gap-1 transition-colors"><Eraser size={12} /> Clear</button>
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
                setResult(`Result: ${math.format(res, {notation: 'fixed', precision: 4})}`);
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

    const matrixButtons = [
        { label: 'A + B', action: () => performOperation((a, b) => math.add(a,b), true) },
        { label: 'A - B', action: () => performOperation((a, b) => math.subtract(a,b), true) },
        { label: 'A × B', action: () => performOperation((a, b) => math.multiply(a,b), true) },
        { label: 'det(A)', action: () => performOperation(a => math.det(a), false) },
        { label: 'inv(A)', action: () => performOperation(a => math.inv(a), false) },
        { label: 'trans(A)', action: () => performOperation(a => math.transpose(a), false) },
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
        <div className="bg-brand-surface/50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary text-center">Matrix Calculator</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center justify-items-center mb-6">
                <MatrixInputGrid 
                    matrix={matrixA} 
                    setter={setMatrixA} 
                    label="Matrix A" 
                    rows={rowsA} 
                    cols={colsA} 
                    setRows={setRowsA} 
                    setCols={setColsA} 
                    highlight={highlight} 
                    setHighlight={setHighlight} 
                    handleCellChange={handleCellChange} 
                    fillMatrix={fillMatrix} 
                />
                <button onClick={swapMatrices} className="p-3 bg-brand-surface hover:bg-brand-border rounded-full transition-colors" title="Swap A and B">
                    <ArrowRightLeft />
                </button>
                <MatrixInputGrid 
                    matrix={matrixB} 
                    setter={setMatrixB} 
                    label="Matrix B" 
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