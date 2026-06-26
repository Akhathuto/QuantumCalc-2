import React, { useState, useEffect, useRef } from 'react';
import { create, all } from 'mathjs';
import { 
  Shuffle, Eye, Eraser, ArrowRightLeft, Copy, ShieldCheck, Table, 
  Compass, Play, RotateCcw, HelpCircle, Activity, Box, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const MatrixInputGrid: React.FC<MatrixInputGridProps> = ({ 
  matrix, setter, label, rows, cols, highlight, setHighlight, handleCellChange, fillMatrix, setRows, setCols 
}) => {
  return (
    <div className="flex flex-col items-center gap-4 bg-brand-surface p-6 rounded-3xl border border-brand-border h-full w-full max-w-sm relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary/20 via-brand-primary/5 to-transparent pointer-events-none" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary italic">{label}</span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-brand-text-secondary uppercase">
          <div className="flex items-center gap-1">
            <span>R:</span>
            <input 
              type="number" 
              min="1" 
              max="5" 
              value={rows} 
              onChange={e => setRows(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} 
              className="w-10 bg-brand-bg border border-brand-border rounded px-1 py-0.5 text-center focus:border-brand-primary outline-none" 
            />
          </div>
          <div className="flex items-center gap-1">
            <span>C:</span>
            <input 
              type="number" 
              min="1" 
              max="5" 
              value={cols} 
              onChange={e => setCols(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))} 
              className="w-10 bg-brand-bg border border-brand-border rounded px-1 py-0.5 text-center focus:border-brand-primary outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative px-6 py-2">
        <div className="text-8xl font-thin text-brand-text/10 -mt-2 select-none absolute left-0">[</div>
        <div className="grid gap-2 relative z-10" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
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
        <button 
          onClick={() => fillMatrix(setter, 'random', rows, cols)} 
          className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors cursor-pointer"
        >
          <Shuffle size={12} /> Random
        </button>
        <button 
          onClick={() => fillMatrix(setter, 'identity', rows, cols)} 
          className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors cursor-pointer"
        >
          <Eye size={12} /> Unit
        </button>
        <button 
          onClick={() => fillMatrix(setter, 'clear', rows, cols)} 
          className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg flex items-center gap-1 border border-brand-border transition-colors cursor-pointer"
        >
          <Eraser size={12} /> Clear
        </button>
      </div>
    </div>
  );
};

// Eigenvalue calculation model
interface EigenInfo {
  lambda1: number;
  lambda2: number;
  v1: [number, number] | null;
  v2: [number, number] | null;
  hasComplex: boolean;
  charEq: string;
}

const computeEigenvalues2D = (a: number, b: number, c: number, d: number): EigenInfo => {
  const trace = a + d;
  const det = a * d - b * c;
  const discriminant = trace * trace - 4 * det;

  let lambda1 = 0;
  let lambda2 = 0;
  let v1: [number, number] | null = null;
  let v2: [number, number] | null = null;
  let hasComplex = false;

  if (discriminant >= 0) {
    lambda1 = (trace + Math.sqrt(discriminant)) / 2;
    lambda2 = (trace - Math.sqrt(discriminant)) / 2;

    // Helper for eigenvector
    const getEigenvector = (lam: number): [number, number] => {
      // (a - lam)*x + b*y = 0
      // If b is non-zero
      if (Math.abs(b) > 1e-6) {
        const x = b;
        const y = lam - a;
        const len = Math.sqrt(x*x + y*y);
        return len > 0 ? [x/len, y/len] : [1, 0];
      }
      // If c is non-zero
      if (Math.abs(c) > 1e-6) {
        const x = lam - d;
        const y = c;
        const len = Math.sqrt(x*x + y*y);
        return len > 0 ? [x/len, y/len] : [0, 1];
      }
      // Diagonal matrix
      if (Math.abs(lam - a) < 1e-6) {
        return [1, 0];
      }
      return [0, 1];
    };

    v1 = getEigenvector(lambda1);
    v2 = getEigenvector(lambda2);
  } else {
    hasComplex = true;
    lambda1 = trace / 2; // Real part
    lambda2 = Math.sqrt(-discriminant) / 2; // Imaginary part
  }

  // Characteristic equation string
  const traceStr = trace >= 0 ? `- ${trace.toFixed(2)}` : `+ ${Math.abs(trace).toFixed(2)}`;
  const detStr = det >= 0 ? `+ ${det.toFixed(2)}` : `- ${Math.abs(det).toFixed(2)}`;
  const charEq = `λ² ${traceStr}λ ${detStr} = 0`;

  return { lambda1, lambda2, v1, v2, hasComplex, charEq };
};

const Matrix = () => {
  const [activeTab, setActiveTab] = useState<'arithmetic' | 'playground' | 'transformation'>('arithmetic');
  
  // Matrix State
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

  // Vector Space State
  const [vectorU, setVectorU] = useState<[number, number, number]>([3, 2, 0]);
  const [vectorV, setVectorV] = useState<[number, number, number]>([-1, 4, 0]);
  const vectorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dragVector, setDragVector] = useState<'U' | 'V' | null>(null);

  // 2D Transformation state
  const [transMatrix, setTransMatrix] = useState<[number, number, number, number]>([1.5, 0.5, -0.2, 1.2]); // [a, b, c, d]
  const [morphProgress, setMorphProgress] = useState(1); // 0 to 1
  const [isMorphing, setIsMorphing] = useState(false);
  const transformCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

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

  // Handle cell entry
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

  // --- DRAW VECTOR SPACE ---
  useEffect(() => {
    if (activeTab !== 'playground') return;
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset resolution
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const originX = w / 2;
    const originY = h / 2;
    const scale = Math.min(w, h) / 12; // 12 units across grid

    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      // Verticals
      ctx.beginPath();
      ctx.moveTo(originX + i * scale, 0);
      ctx.lineTo(originX + i * scale, h);
      ctx.stroke();

      // Horizontals
      ctx.beginPath();
      ctx.moveTo(0, originY + i * scale);
      ctx.lineTo(w, originY + i * scale);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Helper to draw arrows
    const drawArrow = (x: number, y: number, color: string, label: string) => {
      const targetX = originX + x * scale;
      const targetY = originY - y * scale; // invert Y for standard Cartesian

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      // Draw vector line
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(targetY - originY, targetX - originX);
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(targetX - 12 * Math.cos(angle - Math.PI/6), targetY - 12 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(targetX - 12 * Math.cos(angle + Math.PI/6), targetY - 12 * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fill();

      // Text label
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#f0f6fc';
      ctx.fillText(label, targetX + 10 * Math.cos(angle), targetY + 10 * Math.sin(angle));

      // Handle dot at end for dragging
      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // Draw Parallelogram (representing Cross Product area / Addition)
    const sumX = vectorU[0] + vectorV[0];
    const sumY = vectorU[1] + vectorV[1];
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    
    // U -> Sum
    ctx.beginPath();
    ctx.moveTo(originX + vectorU[0] * scale, originY - vectorU[1] * scale);
    ctx.lineTo(originX + sumX * scale, originY - sumY * scale);
    ctx.stroke();

    // V -> Sum
    ctx.beginPath();
    ctx.moveTo(originX + vectorV[0] * scale, originY - vectorV[1] * scale);
    ctx.lineTo(originX + sumX * scale, originY - sumY * scale);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    // Draw U
    drawArrow(vectorU[0], vectorU[1], '#a855f7', 'U'); // Purple

    // Draw V
    drawArrow(vectorV[0], vectorV[1], '#06b6d4', 'V'); // Cyan

  }, [vectorU, vectorV, activeTab]);

  // Vector dragging logic
  const handleVectorMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const originX = canvas.clientWidth / 2;
    const originY = canvas.clientHeight / 2;
    const scale = Math.min(canvas.clientWidth, canvas.clientHeight) / 12;

    // Vector ends
    const endUX = originX + vectorU[0] * scale;
    const endUY = originY - vectorU[1] * scale;
    const endVX = originX + vectorV[0] * scale;
    const endVY = originY - vectorV[1] * scale;

    const distU = Math.sqrt((x - endUX)**2 + (y - endUY)**2);
    const distV = Math.sqrt((x - endVX)**2 + (y - endVY)**2);

    if (distU < 15) {
      setDragVector('U');
    } else if (distV < 15) {
      setDragVector('V');
    }
  };

  const handleVectorMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragVector) return;
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const originX = canvas.clientWidth / 2;
    const originY = canvas.clientHeight / 2;
    const scale = Math.min(canvas.clientWidth, canvas.clientHeight) / 12;

    // Standard Cartesian Coordinates rounded to 1 decimal
    const nextX = Math.max(-5, Math.min(5, Math.round(((x - originX) / scale) * 10) / 10));
    const nextY = Math.max(-5, Math.min(5, Math.round(((originY - y) / scale) * 10) / 10));

    if (dragVector === 'U') {
      setVectorU([nextX, nextY, vectorU[2]]);
    } else if (dragVector === 'V') {
      setVectorV([nextX, nextY, vectorV[2]]);
    }
  };

  const handleVectorMouseUp = () => {
    setDragVector(null);
  };

  // --- TRANSFORMATION PLAYGROUND ANIMATION & GRID RENDER ---
  useEffect(() => {
    if (activeTab !== 'transformation') return;
    const canvas = transformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const originX = w / 2;
    const originY = h / 2;
    const scale = Math.min(w, h) / 10; // 10 units wide default grid

    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Grid coordinates
    const gridRange = 6;

    // Linear Transformation matrix interpolation based on morphProgress
    // Identity = [1, 0, 0, 1]
    const currentA = 1 + (transMatrix[0] - 1) * morphProgress;
    const currentB = 0 + (transMatrix[1] - 0) * morphProgress;
    const currentC = 0 + (transMatrix[2] - 0) * morphProgress;
    const currentD = 1 + (transMatrix[3] - 1) * morphProgress;

    // Helper to transform points: x' = a*x + b*y, y' = c*x + d*y
    const transformPoint = (x: number, y: number): [number, number] => {
      const tx = currentA * x + currentB * y;
      const ty = currentC * x + currentD * y;
      return [originX + tx * scale, originY - ty * scale]; // Cartesian inverted Y
    };

    // Draw Transformed Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = -gridRange; i <= gridRange; i++) {
      // Draw grid lines along X (varying Y, fixed X)
      ctx.beginPath();
      const [startX, startY] = transformPoint(i, -gridRange);
      ctx.moveTo(startX, startY);
      for (let j = -gridRange + 1; j <= gridRange; j++) {
        const [nx, ny] = transformPoint(i, j);
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();

      // Draw grid lines along Y (varying X, fixed Y)
      ctx.beginPath();
      const [startX2, startY2] = transformPoint(-gridRange, i);
      ctx.moveTo(startX2, startY2);
      for (let j = -gridRange + 1; j <= gridRange; j++) {
        const [nx, ny] = transformPoint(j, i);
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }

    // Draw Main Axes (transformed!)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    
    // X Axis
    ctx.beginPath();
    const [axStart, axEndY] = transformPoint(-gridRange, 0);
    ctx.moveTo(axStart, axEndY);
    const [axEnd, axEndY2] = transformPoint(gridRange, 0);
    ctx.lineTo(axEnd, axEndY2);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    const [ayStartX, ayStart] = transformPoint(0, -gridRange);
    ctx.moveTo(ayStartX, ayStart);
    const [ayEndX, ayEnd] = transformPoint(0, gridRange);
    ctx.lineTo(ayEndX, ayEnd);
    ctx.stroke();

    // Draw original Unit Square as reference (dashed outline)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.rect(originX, originY - 1 * scale, 1 * scale, 1 * scale);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    // Draw Transformed Unit Box (Filled with modern glass gradient)
    ctx.fillStyle = 'rgba(22, 163, 74, 0.15)'; // translucent green
    ctx.strokeStyle = '#16a34a'; // solid green border
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const [p0x, p0y] = transformPoint(0, 0);
    const [p1x, p1y] = transformPoint(1, 0);
    const [p2x, p2y] = transformPoint(1, 1);
    const [p3x, p3y] = transformPoint(0, 1);
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw basis vectors i_hat & j_hat
    const drawBasisVector = (targetX: number, targetY: number, color: string, name: string) => {
      const [tx, ty] = transformPoint(targetX, targetY);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      const angle = Math.atan2(ty - p0y, tx - p0x);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 10 * Math.cos(angle - Math.PI/6), ty - 10 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(tx - 10 * Math.cos(angle + Math.PI/6), ty - 10 * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fill();

      // Text basis label
      ctx.font = 'black 12px monospace';
      ctx.fillStyle = color;
      ctx.fillText(name, tx + 8 * Math.cos(angle), ty + 8 * Math.sin(angle));
    };

    // Draw i_hat transformed (original: [1, 0])
    drawBasisVector(1, 0, '#3b82f6', 'î'); // Blue
    // Draw j_hat transformed (original: [0, 1])
    drawBasisVector(0, 1, '#f43f5e', 'ĵ'); // Rose

    // Render Eigenvectors overlaid if available
    const eigen = computeEigenvalues2D(transMatrix[0], transMatrix[1], transMatrix[2], transMatrix[3]);
    if (!eigen.hasComplex) {
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);

      // Eigenvector 1 (Orange-Yellow)
      if (eigen.v1) {
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        const [e1x1, e1y1] = transformPoint(-eigen.v1[0]*4, -eigen.v1[1]*4);
        const [e1x2, e1y2] = transformPoint(eigen.v1[0]*4, eigen.v1[1]*4);
        ctx.moveTo(e1x1, e1y1);
        ctx.lineTo(e1x2, e1y2);
        ctx.stroke();
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`v1`, e1x2 + 5, e1y2);
      }

      // Eigenvector 2 (Teal-Cyan)
      if (eigen.v2) {
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        const [e2x1, e2y1] = transformPoint(-eigen.v2[0]*4, -eigen.v2[1]*4);
        const [e2x2, e2y2] = transformPoint(eigen.v2[0]*4, eigen.v2[1]*4);
        ctx.moveTo(e2x1, e2y1);
        ctx.lineTo(e2x2, e2y2);
        ctx.stroke();
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`v2`, e2x2 + 5, e2y2);
      }
      ctx.setLineDash([]);
    }

  }, [transMatrix, morphProgress, activeTab]);

  // Handle Morph Trigger Animation
  const startMorphAnimation = () => {
    if (isMorphing) return;
    setIsMorphing(true);
    let startTimestamp: number | null = null;
    const duration = 1200; // ms

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percentage = Math.min(progress / duration, 1);

      // Ease-in-out formula
      const ease = percentage < 0.5 
        ? 2 * percentage * percentage 
        : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

      setMorphProgress(ease);

      if (progress < duration) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setIsMorphing(false);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  const resetMorphAnimation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setMorphProgress(0);
    setIsMorphing(false);
  };

  const handleTransCellChange = (index: number, value: string) => {
    setTransMatrix(prev => {
      const next = [...prev] as [number, number, number, number];
      next[index] = value === '' ? 0 : parseFloat(value);
      return next;
    });
  };

  const handleTransPreset = (preset: 'shear' | 'rotate' | 'scale' | 'reflect' | 'identity') => {
    resetMorphAnimation();
    if (preset === 'shear') {
      setTransMatrix([1, 1.2, 0, 1]);
    } else if (preset === 'rotate') {
      // 45 degrees
      const rad = Math.PI / 4;
      setTransMatrix([Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)]);
    } else if (preset === 'scale') {
      setTransMatrix([1.5, 0, 0, 0.8]);
    } else if (preset === 'reflect') {
      setTransMatrix([1, 0, 0, -1]); // Reflect over X axis
    } else {
      setTransMatrix([1, 0, 0, 1]); // Identity
    }
    setMorphProgress(1);
  };

  // Pre-calculate vector properties
  const vecResult = React.useMemo(() => {
    const magU = Math.sqrt(vectorU[0]**2 + vectorU[1]**2 + vectorU[2]**2);
    const magV = Math.sqrt(vectorV[0]**2 + vectorV[1]**2 + vectorV[2]**2);
    const dot = vectorU[0] * vectorV[0] + vectorU[1] * vectorV[1] + vectorU[2] * vectorV[2];
    
    // Cross Product (3D)
    const cross: [number, number, number] = [
      vectorU[1] * vectorV[2] - vectorU[2] * vectorV[1],
      vectorU[2] * vectorV[0] - vectorU[0] * vectorV[2],
      vectorU[0] * vectorV[1] - vectorU[1] * vectorV[0]
    ];
    const magCross = Math.sqrt(cross[0]**2 + cross[1]**2 + cross[2]**2);

    // Angle (degrees)
    const angleRad = (magU * magV) > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / (magU * magV)))) : 0;
    const angleDeg = (angleRad * 180) / Math.PI;

    // Projection of U onto V
    let projOfUOnV: [number, number, number] = [0, 0, 0];
    if (magV > 1e-6) {
      const coeff = dot / (magV ** 2);
      projOfUOnV = [vectorV[0] * coeff, vectorV[1] * coeff, vectorV[2] * coeff];
    }

    return { magU, magV, dot, cross, magCross, angleDeg, projOfUOnV };
  }, [vectorU, vectorV]);

  // Eigen information calculate
  const eigenInfo = React.useMemo(() => {
    return computeEigenvalues2D(transMatrix[0], transMatrix[1], transMatrix[2], transMatrix[3]);
  }, [transMatrix]);

  return (
    <div className="space-y-8 pb-12">
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 justify-center bg-brand-surface p-1.5 rounded-2xl border border-brand-border/60 max-w-lg mx-auto">
        <button 
          onClick={() => setActiveTab('arithmetic')} 
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'arithmetic' ? 'bg-brand-primary text-black font-semibold' : 'text-brand-text-secondary hover:text-brand-text'}`}
        >
          <Table size={12} /> Matrix Arithmetic
        </button>
        <button 
          onClick={() => setActiveTab('playground')} 
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'playground' ? 'bg-brand-primary text-black font-semibold' : 'text-brand-text-secondary hover:text-brand-text'}`}
        >
          <Compass size={12} /> Vector Field Sandbox
        </button>
        <button 
          onClick={() => setActiveTab('transformation')} 
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'transformation' ? 'bg-brand-primary text-black font-semibold' : 'text-brand-text-secondary hover:text-brand-text'}`}
        >
          <Box size={12} /> Linear Transformation Space
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'arithmetic' && (
          <motion.div
            key="arithmetic"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
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
                <button 
                  onClick={swapMatrices} 
                  className="p-4 bg-brand-surface border border-brand-border hover:bg-brand-bg hover:border-brand-primary text-brand-text-secondary hover:text-brand-primary rounded-2xl transition-all shadow-xl cursor-pointer" 
                  title="Swap A and B"
                >
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
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-brand-bg border border-brand-border rounded-2xl hover:border-brand-primary transition-all group overflow-hidden relative cursor-pointer"
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
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
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
          </motion.div>
        )}

        {activeTab === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Vector Controls & Values */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Vector Elements</h3>
                </div>

                {/* Vector U */}
                <div className="space-y-3 p-4 bg-brand-bg border border-brand-border/60 rounded-2xl relative">
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Vector U</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">U_x (horizontal)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorU[0]} 
                        onChange={e => setVectorU([parseFloat(e.target.value) || 0, vectorU[1], vectorU[2]])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">U_y (vertical)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorU[1]} 
                        onChange={e => setVectorU([vectorU[0], parseFloat(e.target.value) || 0, vectorU[2]])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">U_z (depth)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorU[2]} 
                        onChange={e => setVectorU([vectorU[0], vectorU[1], parseFloat(e.target.value) || 0])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Vector V */}
                <div className="space-y-3 p-4 bg-brand-bg border border-brand-border/60 rounded-2xl relative">
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Vector V</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">V_x (horizontal)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorV[0]} 
                        onChange={e => setVectorV([parseFloat(e.target.value) || 0, vectorV[1], vectorV[2]])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">V_y (vertical)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorV[1]} 
                        onChange={e => setVectorV([vectorV[0], parseFloat(e.target.value) || 0, vectorV[2]])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-brand-text-secondary">V_z (depth)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={vectorV[2]} 
                        onChange={e => setVectorV([vectorV[0], vectorV[1], parseFloat(e.target.value) || 0])}
                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm font-mono focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vector Analysis Results */}
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem] space-y-4 font-mono">
                <div className="flex items-center gap-3 border-b border-brand-border/40 pb-2">
                  <Activity size={14} className="text-brand-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-text">Calculated Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40">
                    <div className="text-[9px] text-brand-text-secondary">MAGNITUDE |U|</div>
                    <div className="text-lg font-bold text-brand-text">{vecResult.magU.toFixed(4)}</div>
                  </div>
                  <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40">
                    <div className="text-[9px] text-brand-text-secondary">MAGNITUDE |V|</div>
                    <div className="text-lg font-bold text-brand-text">{vecResult.magV.toFixed(4)}</div>
                  </div>
                  <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40 col-span-2">
                    <div className="text-[9px] text-brand-text-secondary">DOT PRODUCT (U · V)</div>
                    <div className="text-lg font-bold text-brand-primary">{vecResult.dot.toFixed(4)}</div>
                    <p className="text-[8px] text-brand-text-secondary italic mt-1">
                      {vecResult.dot === 0 ? "Ortho-normal (90° orthogonal vectors)" : vecResult.dot > 0 ? "Acute relative orientation" : "Obtuse relative orientation"}
                    </p>
                  </div>
                  <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40 col-span-2">
                    <div className="text-[9px] text-brand-text-secondary">CROSS PRODUCT (U × V)</div>
                    <div className="text-sm font-bold text-brand-accent">
                      [{vecResult.cross[0].toFixed(2)}, {vecResult.cross[1].toFixed(2)}, {vecResult.cross[2].toFixed(2)}]
                    </div>
                    <div className="text-[10px] text-brand-text-secondary mt-1">
                      Area of parallelogram: <span className="font-bold text-brand-text">{vecResult.magCross.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40 col-span-2">
                    <div className="text-[9px] text-brand-text-secondary">SUBTENDED ANGLE (θ)</div>
                    <div className="text-lg font-bold text-brand-text">{vecResult.angleDeg.toFixed(2)}°</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Grid interactive element */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <div className="flex-1 bg-brand-surface border border-brand-border rounded-[2.5rem] p-6 flex flex-col h-full relative overflow-hidden shadow-inner">
                <div className="absolute top-4 left-6 z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary italic">Live Coordinate Canvas</div>
                  <div className="text-[9px] font-mono text-brand-text-secondary">DRAG TERMINALS TO CHANGE VALUES</div>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <canvas 
                    ref={vectorCanvasRef} 
                    onMouseDown={handleVectorMouseDown}
                    onMouseMove={handleVectorMouseMove}
                    onMouseUp={handleVectorMouseUp}
                    onMouseLeave={handleVectorMouseUp}
                    className="w-full h-full aspect-square max-w-[450px] rounded-3xl border border-brand-border/40 shadow-2xl cursor-crosshair"
                  />
                </div>

                <div className="mt-4 p-3 bg-brand-bg/40 border border-brand-border rounded-xl text-center">
                  <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest italic">
                    Grid lines are spaced 1 unit apart. Magnitude matches Euclidean distance directly in space.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transformation' && (
          <motion.div
            key="transformation"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left controller panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text italic">Matrix Matrix [T]</h3>
                  </div>
                  <span className="text-[9px] font-mono text-brand-primary font-bold">2D_OPERATORS</span>
                </div>

                {/* 2x2 Transform entries */}
                <div className="flex justify-center items-center gap-4 relative px-8 py-4">
                  <div className="text-8xl font-thin text-brand-text/15 select-none absolute left-0">[</div>
                  <div className="grid grid-cols-2 gap-4 w-48 relative z-10 font-mono">
                    <div>
                      <span className="text-[8px] text-brand-text-secondary block mb-0.5">X-basis X (a)</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={transMatrix[0]} 
                        onChange={(e) => handleTransCellChange(0, e.target.value)}
                        className="w-full text-center bg-brand-bg border border-brand-border rounded-lg py-2 font-black text-blue-400 focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-brand-text-secondary block mb-0.5">Y-basis X (b)</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={transMatrix[1]} 
                        onChange={(e) => handleTransCellChange(1, e.target.value)}
                        className="w-full text-center bg-brand-bg border border-brand-border rounded-lg py-2 font-black text-rose-400 focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-brand-text-secondary block mb-0.5">X-basis Y (c)</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={transMatrix[2]} 
                        onChange={(e) => handleTransCellChange(2, e.target.value)}
                        className="w-full text-center bg-brand-bg border border-brand-border rounded-lg py-2 font-black text-blue-400 focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-brand-text-secondary block mb-0.5">Y-basis Y (d)</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={transMatrix[3]} 
                        onChange={(e) => handleTransCellChange(3, e.target.value)}
                        className="w-full text-center bg-brand-bg border border-brand-border rounded-lg py-2 font-black text-rose-400 focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-8xl font-thin text-brand-text/15 select-none absolute right-0">]</div>
                </div>

                {/* Animation Trigger & Slide Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-text-secondary uppercase">Transition Morph</span>
                    <span className="font-mono text-brand-primary">{(morphProgress * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={morphProgress}
                    onChange={e => {
                      resetMorphAnimation();
                      setMorphProgress(parseFloat(e.target.value));
                    }}
                    className="w-full accent-brand-primary bg-brand-bg h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={startMorphAnimation}
                      disabled={isMorphing}
                      className="flex-1 py-2 px-3 bg-brand-primary text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Play size={12} /> Morph Space
                    </button>
                    <button 
                      onClick={resetMorphAnimation}
                      className="py-2 px-3 bg-brand-surface border border-brand-border rounded-lg text-xs hover:bg-brand-border transition-colors cursor-pointer"
                      title="Reset state"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>

                {/* Classical Transformation Presets */}
                <div className="space-y-2 border-t border-brand-border/40 pt-4">
                  <span className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest">Operator Presets</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button onClick={() => handleTransPreset('identity')} className="py-1.5 px-2 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-text hover:border-brand-primary transition-all font-mono cursor-pointer">Identity</button>
                    <button onClick={() => handleTransPreset('shear')} className="py-1.5 px-2 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-text hover:border-brand-primary transition-all font-mono cursor-pointer">Shear (1.2)</button>
                    <button onClick={() => handleTransPreset('rotate')} className="py-1.5 px-2 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-text hover:border-brand-primary transition-all font-mono cursor-pointer">Rotate (45°)</button>
                    <button onClick={() => handleTransPreset('scale')} className="py-1.5 px-2 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-text hover:border-brand-primary transition-all font-mono cursor-pointer">Scale (Aniso)</button>
                    <button onClick={() => handleTransPreset('reflect')} className="py-1.5 px-2 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-text hover:border-brand-primary transition-all font-mono cursor-pointer">Reflect Y-axis</button>
                  </div>
                </div>
              </div>

              {/* Eigen Solver and characteristic equation output */}
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-brand-text tracking-wider">
                  <Sparkles size={14} className="text-brand-accent animate-pulse" />
                  <span>Eigen Resolution Stream</span>
                </div>

                <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-brand-text-secondary uppercase">Characteristic Eq</span>
                    <div className="text-sm font-black text-brand-text">{eigenInfo.charEq}</div>
                  </div>

                  {eigenInfo.hasComplex ? (
                    <div className="bg-brand-primary/5 p-2 rounded-lg border border-brand-primary/10">
                      <span className="text-[9px] text-brand-text-secondary uppercase">Complex Eigenvalues</span>
                      <div className="text-brand-text-secondary text-[11px] leading-relaxed mt-1">
                        λ = {eigenInfo.lambda1.toFixed(2)} ± {eigenInfo.lambda2.toFixed(2)}i
                        <p className="text-[9px] text-amber-300 italic mt-1">Eigenvalues are complex conjugate conjugates; grid rotates without invariant real vectors.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-brand-text-secondary uppercase">λ₁ (Eigenvalue 1)</span>
                        <div className="text-sm font-bold text-amber-500">
                          {eigenInfo.lambda1.toFixed(4)}
                        </div>
                        {eigenInfo.v1 && (
                          <div className="text-[10px] text-brand-text-secondary">
                            Vector v1: [{eigenInfo.v1[0].toFixed(3)}, {eigenInfo.v1[1].toFixed(3)}]
                          </div>
                        )}
                      </div>

                      <div className="border-t border-brand-border/40 pt-2">
                        <span className="text-[9px] text-brand-text-secondary uppercase">λ₂ (Eigenvalue 2)</span>
                        <div className="text-sm font-bold text-emerald-500">
                          {eigenInfo.lambda2.toFixed(4)}
                        </div>
                        {eigenInfo.v2 && (
                          <div className="text-[10px] text-brand-text-secondary">
                            Vector v2: [{eigenInfo.v2[0].toFixed(3)}, {eigenInfo.v2[1].toFixed(3)}]
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual grid transform canvas */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <div className="flex-1 bg-brand-surface border border-brand-border rounded-[2.5rem] p-6 flex flex-col h-full relative overflow-hidden shadow-inner">
                <div className="absolute top-4 left-6 z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent italic font-sans">Linear Transformation Grid</div>
                  <div className="text-[9px] font-mono text-brand-text-secondary">
                    Blue = î basis, Rose = ĵ basis, Dotted lines = Eigenvectors (invariant lines)
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <canvas 
                    ref={transformCanvasRef} 
                    className="w-full h-full aspect-square max-w-[450px] rounded-3xl border border-brand-border/40 shadow-2xl"
                  />
                </div>

                <div className="mt-4 p-3 bg-brand-bg/40 border border-brand-border rounded-xl text-center">
                  <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest italic font-mono">
                    Morphed basis space: î maps to [{transMatrix[0].toFixed(1)}, {transMatrix[2].toFixed(1)}], ĵ maps to [{transMatrix[1].toFixed(1)}, {transMatrix[3].toFixed(1)}].
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Matrix;
