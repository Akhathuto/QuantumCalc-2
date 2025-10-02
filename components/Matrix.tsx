import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { create, all } from 'mathjs';
import Button from './common/Button';

const math = create(all);

const Matrix = () => {
    const [size, setSize] = useState(3);
    const [matrixA, setMatrixA] = useState(Array(9).fill(0));
    const [matrixB, setMatrixB] = useState(Array(9).fill(0));
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Example matrices
        if (size === 3) {
            setMatrixA([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            setMatrixB([9, 8, 7, 6, 5, 4, 3, 2, 1]);
        } else {
            setMatrixA([1, 2, 3, 4]);
            setMatrixB([5, 6, 7, 8]);
        }
    }, [size]);

    const handleCellChange = (matrixSetter: Dispatch<SetStateAction<number[]>>, index: number, value: string) => {
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
            const res = b ? op(a, b) : op(a);
            
            if (typeof res === 'number') {
                setResult(`Result: ${res}`);
            } else {
                setResult(math.format(res, { notation: 'fixed', precision: 4 }));
            }
        } catch (e: any) {
            setError(e.message || "An error occurred during calculation.");
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


    const renderMatrixInput = (matrix: number[], setter: Dispatch<SetStateAction<number[]>>) => (
        <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${size}, 1fr)`}}>
            {Array.from({ length: size * size }).map((_, i) => (
                <input
                    key={i}
                    type="number"
                    value={matrix[i] ?? ''}
                    onChange={(e) => handleCellChange(setter, i, e.target.value)}
                    className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 text-center focus:ring-brand-primary focus:border-brand-primary"
                />
            ))}
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Matrix Calculator</h2>
            
            <div className="mb-6">
                <label className="mr-4">Matrix Size:</label>
                <select 
                    value={size} 
                    onChange={e => setSize(parseInt(e.target.value))}
                    className="bg-brand-surface border-gray-600 rounded-md p-2"
                >
                    <option value={2}>2x2</option>
                    <option value={3}>3x3</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">Matrix A</h3>
                    {renderMatrixInput(matrixA, setMatrixA)}
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2">Matrix B</h3>
                    {renderMatrixInput(matrixB, setMatrixB)}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {matrixButtons.map(b => (
                    <Button key={b.label} onClick={b.action} className="bg-brand-primary/80 hover:bg-brand-primary h-14 text-lg">
                        {b.label}
                    </Button>
                ))}
            </div>
            
            <div className="bg-brand-surface/50 p-6 rounded-lg min-h-[150px]">
                <h3 className="text-xl font-bold mb-2 text-brand-accent">Result</h3>
                {error && <p className="text-red-400 font-mono">{error}</p>}
                {result && <pre className="text-lg font-mono whitespace-pre-wrap">{result}</pre>}
                {!error && !result && <p className="text-brand-text-secondary">Select an operation to see the result.</p>}
            </div>
        </div>
    );
};

export default Matrix;