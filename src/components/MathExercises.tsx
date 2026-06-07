import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Timer, 
  Check, 
  ArrowRight,
  Flame,
  Eraser,
  PenTool,
  Brain,
  X,
  Compass
} from 'lucide-react';
import Latex from 'react-latex-next';
import ReactMarkdown from 'react-markdown';
import { getExerciseAiExplanation } from '../services/geminiService';
import { triggerCloudSync } from '../services/googleDriveService';
import { dailyGoalService } from '../services/dailyGoalService';

interface DrillProblem {
  id: number;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  title: string;
  latexQuery: string;
  correctAnswer: string[];
  hints: string[];
  stepByStepSolution: string;
}

const CATEGORIES = ["All Categories", "Calculus & Limits", "Algebraic Systems", "Trig Identities", "Fractions & Core Arithmetic", "Geometry", "Statistics & Probability", "Linear Algebra", "Complex Numbers", "Differential Equations"];

export const MathExercises: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [activeLevel, setActiveLevel] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [problems, setProblems] = useState<DrillProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeHintIdx, setActiveHintIdx] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  
  // Game stats
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('quantum_drill_highstreak') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerActive = true;

  // AI Coach state integrations
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Scratchpad interactive state integrations
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [brushColor, setBrushColor] = useState('#818cf8'); // Indigo
  const [brushSize, setBrushSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const coords = getCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    // Prevent scrolling on mobile when drawing
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Adjust canvas size when scratchpad is opened
  useEffect(() => {
    if (showScratchpad && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 450;
      canvas.height = rect.height || 260;
    }
  }, [showScratchpad]);

  const fetchAiTutorHelp = async () => {
    if (!currentProblem) return;
    setAiLoading(true);
    setAiError(null);
    setAiAnswer(null);
    setShowAiPanel(true);
    try {
      const response = await getExerciseAiExplanation(
        currentProblem.category,
        currentProblem.title,
        currentProblem.latexQuery
      );
      setAiAnswer(response);
    } catch (err: any) {
      console.error("Math exercises coach error:", err instanceof Error ? err.message : String(err));
      setAiError(err?.message || "Could not reach the AI Coach at this moment.");
    } finally {
      setAiLoading(false);
    }
  };

  // Load custom structured generators or premium library values on render/category shift
  useEffect(() => {
    generateDrills(activeCategory, activeLevel);
    setCurrentIdx(0);
    setUserInput('');
    setChecked(false);
    setShowSolution(false);
    setActiveHintIdx(null);
    setAiAnswer(null);
    setAiError(null);
    setShowAiPanel(false);
    clearCanvas();
  }, [activeCategory, activeLevel]);

  // Integrated timer ticks
  useEffect(() => {
    let timer: any;
    if (timerActive) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

  const generateDrills = (cat: string, level: 'basic' | 'intermediate' | 'advanced') => {
    // Generates a parameterized list of mathematical drills
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const c = Math.floor(Math.random() * 6) + 1;

    const deck: DrillProblem[] = [];

    // Category 1: Calculus
    if (cat === 'All Categories' || cat === 'Calculus & Limits') {
      if (level === 'basic') {
        deck.push({
          id: 101,
          category: "Calculus & Limits",
          difficulty: 'basic',
          title: "Limit of elementary polynomial",
          latexQuery: `\\lim_{x \\to ${a}} (2x + 5)`,
          correctAnswer: [`${2 * a + 5}`],
          hints: [
            "We can apply the direct substitution property.",
            `Replace each instance of variable $x$ with scalar equivalent value $${a}$.`,
            `Calculate $2(${a}) + 5$.`
          ],
          stepByStepSolution: `Apply direct evaluation: \\lim_{x \\to ${a}} (2x + 5) = 2(${a}) + 5 = ${2 * a + 5}.`
        });
        deck.push({
          id: 102,
          category: "Calculus & Limits",
          difficulty: 'basic',
          title: "Standard derivative operation",
          latexQuery: `\\frac{d}{dx}[${a}x^2 + ${b}x]`,
          correctAnswer: [`${2 * a}x + ${b}`, `${2 * a}*x + ${b}`],
          hints: [
            "Use the Sum Rule to separate the components.",
            "Apply the Power Rule: $d/dx[x^n] = n \\cdot x^{n-1}$.",
            `The derivative of $${a}x^2$ is $${2 * a}x$. The derivative of $${b}x$ is $${b}$.`
          ],
          stepByStepSolution: `\\frac{d}{dx}[${a}x^2 + ${b}x] = ${a}(2x) + ${b}(1) = ${2 * a}x + ${b}.`
        });
        deck.push({
          id: 105,
          category: "Calculus & Limits",
          difficulty: 'basic',
          title: "Limit of rational expression",
          latexQuery: `\\lim_{x \\to ${a}} \\frac{x^2 - ${a*a}}{x - ${a}}`,
          correctAnswer: [`${2 * a}`],
          hints: [
            "Factor the numerator using difference of squares: $x^2 - a^2 = (x - a)(x + a)$.",
            "Cancel the common term $(x - a)$ in both numerator and denominator.",
            `Substituting $x = ${a}$ into the simplified expression $x + ${a}$ yields $${a} + ${a}$.`
          ],
          stepByStepSolution: `\\lim_{x \\to ${a}} \\frac{x^2 - ${a*a}}{x - ${a}} = \\lim_{x \\to ${a}} (x + ${a}) = ${a} + ${a} = ${2 * a}.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 103,
          category: "Calculus & Limits",
          difficulty: 'intermediate',
          title: "Derivative of trigonometric composition (Chain Rule)",
          latexQuery: `\\frac{d}{dx}[\\sin(${a}x)]`,
          correctAnswer: [`${a}\\cos(${a}x)`, `${a}*cos(${a}*x)`],
          hints: [
            "This requires standard application of the Chain Rule.",
            "Let nested variable $u = ${a}x$. The outer derivative of $\\sin(u)$ is $\\cos(u)$.",
            "Multiply the result by derivative of internal element $u$ ($d/dx[${a}x] = ${a}$)."
          ],
          stepByStepSolution: `\\text{Derivative yields: } ${a} \\cdot \\cos(${a}x).`
        });
        deck.push({
          id: 106,
          category: "Calculus & Limits",
          difficulty: 'intermediate',
          title: "Derivative of exponential composition",
          latexQuery: `\\frac{d}{dx}[x e^{${a}x}]`,
          correctAnswer: [`e^{${a}x}(1+${a}x)`, `e^{${a}x}(${a}x+1)`, `(${a}x+1)e^{${a}x}`, `(1+${a}x)e^{${a}x}`],
          hints: [
            "Use the Product Rule: $(uv)' = u'v + uv'$.",
            `Let $u = x$ and $v = e^{${a}x}$. Thus $u' = 1$ and $v' = ${a}e^{${a}x}$.`,
            "Combine terms and factor out the common exponential part."
          ],
          stepByStepSolution: `\\frac{d}{dx}[x e^{${a}x}] = (1)e^{${a}x} + x(${a}e^{${a}x}) = e^{${a}x}(1 + ${a}x).`
        });
      } else {
        deck.push({
          id: 104,
          category: "Calculus & Limits",
          difficulty: 'advanced',
          title: "Indefinite integral by substitution",
          latexQuery: `\\int 2x e^{x^2} dx`,
          correctAnswer: [`e^{x^2} + C`, `e^(x^2)+C`, `e^{x^2}`],
          hints: [
            "Use standard logical $u$-substitution.",
            "Setting $u = x^2$ yields differential parameter $du = 2x dx$.",
            "The simplified integral is $\\int e^u du = e^u + C$."
          ],
          stepByStepSolution: `\\int 2x e^{x^2} dx = \\int e^u du = e^{x^2} + C.`
        });
        deck.push({
          id: 107,
          category: "Calculus & Limits",
          difficulty: 'advanced',
          title: "Definite Integral of Linear Function",
          latexQuery: `\\int_{0}^{${a}} (2x + ${b}) dx`,
          correctAnswer: [`${a * a + b * a}`],
          hints: [
            `Find the antiderivative of $2x + ${b}$, which is $x^2 + ${b}x$.`,
            `Evaluate the antiderivative at the upper bound $x = ${a}$.`,
            "Evaluate at the lower bound $x = 0$ (which is $0$) and subtract."
          ],
          stepByStepSolution: `\\int_{0}^{${a}} (2x + ${b}) dx = \\left[ x^2 + ${b}x \\right]_{0}^{${a}} = (${a})^2 + ${b}(${a}) - 0 = ${a * a + b * a}.`
        });
      }
    }

    // Category 2: Algebraic Systems
    if (cat === 'All Categories' || cat === 'Algebraic Systems') {
      if (level === 'basic') {
        deck.push({
          id: 201,
          category: "Algebraic Systems",
          difficulty: 'basic',
          title: "Solve linear single-variable formula",
          latexQuery: `${a}x - ${b} = ${a * c - b}`,
          correctAnswer: [`${c}`, `x=${c}`],
          hints: [
            `Isolate variable $x$ term on the left side by adding $${b}$ to both sides.`,
            `This yields active equivalence $${a}x = ${a * c}$.`,
            `Divide both components by $${a}$ to establish the terminal unit value.`
          ],
          stepByStepSolution: `Add ${b}: ${a}x = ${a * c} \\Rightarrow \\text{Divide by } ${a}: x = ${c}.`
        });
        deck.push({
          id: 204,
          category: "Algebraic Systems",
          difficulty: 'basic',
          title: "Solve proportion equation",
          latexQuery: `\\frac{x}{${a}} = \\frac{${b}}{2}`,
          correctAnswer: [`${(a * b) / 2}`],
          hints: [
            "Cross-multiply components to solve for the unknown x.",
            `Multiply $x$ by 2 and $${a}$ by $${b}$.`,
            `Divide the product $${a * b}$ by 2.`
          ],
          stepByStepSolution: `2x = ${a} \\cdot ${b} = ${a * b} \\Rightarrow x = \\frac{${a * b}}{2} = ${(a * b) / 2}.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 202,
          category: "Algebraic Systems",
          difficulty: 'intermediate',
          title: "Solve standard roots of factored quadratic",
          latexQuery: `x^2 - ${a + b}x + ${a * b} = 0`,
          correctAnswer: [`${Math.min(a, b)}, ${Math.max(a, b)}`, `${Math.min(a, b)},${Math.max(a, b)}`],
          hints: [
            "This can be easily solved using standard trinomial factoring.",
            `Notice that $(-${a}) + (-${b}) = -${a + b}$ and $(-${a}) \\times (-${b}) = ${a * b}$.`,
            "Rewrite expression as $(x - p)(x - q) = 0$."
          ],
          stepByStepSolution: `Factorized format: (x - ${a})(x - ${b}) = 0. \\text{ Roots: } x = ${a}, ${b}.`
        });
        deck.push({
          id: 205,
          category: "Algebraic Systems",
          difficulty: 'intermediate',
          title: "Solve linear system by elimination",
          latexQuery: `\\begin{cases} x + y = ${a + b} \\\\ x - y = ${Math.abs(a - b)} \\end{cases} \\quad \\text{Solve for } x`,
          correctAnswer: [`${Math.max(a, b)}`],
          hints: [
            "Add the two equations together to eliminate y.",
            `Adding yields: $2x = ${a + b} + ${Math.abs(a - b)}$.`,
            "Divide the combined value by 2 to isolate x."
          ],
          stepByStepSolution: `(x + y) + (x - y) = 2x = ${a + b + Math.abs(a - b)} \\Rightarrow x = ${Math.max(a, b)}.`
        });
      } else {
        deck.push({
          id: 203,
          category: "Algebraic Systems",
          difficulty: 'advanced',
          title: "Sum of roots of system using Vieta's Formula",
          latexQuery: `3x^2 - ${a * 3}x + ${b} = 0`,
          correctAnswer: [`${a}`],
          hints: [
            "Vieta's Formulas declare connection boundaries between quadratic parameters and direct roots.",
            "The sum of roots $x_1 + x_2$ is always equal to $-b/a$.",
            `In this equation, $a=3$ and $b=-${a * 3}$. Calculate $-(-${a * 3})/3$.`
          ],
          stepByStepSolution: `\\text{According to Vieta's identities, sum of roots: } S = \\frac{-(-${a * 3})}{3} = ${a}.`
        });
        deck.push({
          id: 206,
          category: "Algebraic Systems",
          difficulty: 'advanced',
          title: "Discriminant of quadratic equation",
          latexQuery: `x^2 + ${2 * a}x + ${a * a - b} = 0 \\quad \\text{Find discriminant } \\Delta`,
          correctAnswer: [`${4 * b}`],
          hints: [
            "The discriminant formula is $\\Delta = B^2 - 4AC$.",
            `Identify parameters: $A = 1$, $B = ${2 * a}$, and $C = ${a * a - b}$.`,
            `Evaluate $(${2 * a})^2 - 4(1)(${a * a - b})$.`
          ],
          stepByStepSolution: `\\Delta = (${2 * a})^2 - 4(1)(${a * a - b}) = ${4 * a * a} - ${4 * a * a} + ${4 * b} = ${4 * b}.`
        });
      }
    }

    // Category 3: Trig Identities
    if (cat === 'All Categories' || cat === 'Trig Identities') {
      if (level === 'basic') {
        deck.push({
          id: 301,
          category: "Trig Identities",
          difficulty: 'basic',
          title: "Evaluate Pythagoras Identity",
          latexQuery: `\\sin^2(\\theta) + \\cos^2(\\theta)`,
          correctAnswer: ["1"],
          hints: [
            "This is the most famous trigonometric identity.",
            "It holds true for any real or complex angle theta.",
            "The output value is a constant."
          ],
          stepByStepSolution: `\\text{The standard Pythagorean Identity simplifies to 1 for all inputs.}`
        });
        deck.push({
          id: 304,
          category: "Trig Identities",
          difficulty: 'basic',
          title: "Product of sine and cosecant",
          latexQuery: `\\sin(\\theta) \\cdot \\csc(\\theta)`,
          correctAnswer: ["1"],
          hints: [
            "Recall that cosecant is the reciprocal of sine.",
            "Write cosecant as $1 / \\sin(\\theta)$.",
            "Multiply and simplify."
          ],
          stepByStepSolution: `\\sin(\\theta) \\cdot \\csc(\\theta) = \\sin(\\theta) \\cdot \\frac{1}{\\sin(\\theta)} = 1.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 302,
          category: "Trig Identities",
          difficulty: 'intermediate',
          title: "Double angle identity reduction",
          latexQuery: `2\\sin(${a}\\phi)\\cos(${a}\\phi)`,
          correctAnswer: [`sin(${2 * a}\\phi)`, `sin(${2 * a}*\\phi)`],
          hints: [
            "This matches the general identity: $2\\sin(W)\\cos(W) = \\sin(2W)$.",
            `Replace $W$ with physical argument $${a}\\phi$.`,
            `The argument inside sine becomes $2 \\times ${a}\\phi$.`
          ],
          stepByStepSolution: `2\\sin(${a}\\phi)\\cos(${a}\\phi) = \\sin(2 \\cdot ${a}\\phi) = \\sin(${2 * a}\\phi).`
        });
        deck.push({
          id: 305,
          category: "Trig Identities",
          difficulty: 'intermediate',
          title: "Angle addition formula",
          latexQuery: `\\sin(x)\\cos(${a}x) + \\cos(x)\\sin(${a}x)`,
          correctAnswer: [`sin(${a + 1}x)`, `sin(${a + 1}*x)`],
          hints: [
            "This fits the angle addition identity: $\\sin(A)\\cos(B) + \\cos(A)\\sin(B) = \\sin(A + B)$.",
            `Identify components: $A = x$ and $B = ${a}x$.`,
            "Add the arguments together inside the sine function."
          ],
          stepByStepSolution: `\\sin(x)\\cos(${a}x) + \\cos(x)\\sin(${a}x) = \\sin(x + ${a}x) = \\sin(${a + 1}x).`
        });
      } else {
        deck.push({
          id: 303,
          category: "Trig Identities",
          difficulty: 'advanced',
          title: "Convert cotangent combination",
          latexQuery: `\\tan(x) \\cdot \\cot(x)`,
          correctAnswer: ["1"],
          hints: [
            "Recall that cotangent is the reciprocal of tangent.",
            "Write tangent as $\\sin/\\cos$ and cotangent as $\\cos/\\sin$.",
            "Multiply them together to see what cancels."
          ],
          stepByStepSolution: `\\tan(x) \\cdot \\cot(x) = \\tan(x) \\cdot \\frac{1}{\\tan(x)} = 1.`
        });
        deck.push({
          id: 306,
          category: "Trig Identities",
          difficulty: 'advanced',
          title: "Trigonometric equation primary route",
          latexQuery: `2\\sin(x) - \\sqrt{3} = 0 \\quad \\text{for } 0 \\le x < \\pi`,
          correctAnswer: [`pi/3, 2pi/3`, `pi/3,2pi/3`, `pi/3`,`2pi/3`],
          hints: [
            "Isolate $\\sin(x)$ to find the target outputs.",
            "This yields $\\sin(x) = \\frac{\\sqrt{3}}{2}$.",
            "Find the standard angles in the first and second quadrant."
          ],
          stepByStepSolution: `2\\sin(x) = \\sqrt{3} \\Rightarrow \\sin(x) = \\frac{\\sqrt{3}}{2} \\Rightarrow x = \\frac{\\pi}{3}, \\frac{2\\pi}{3}.`
        });
      }
    }

    // Category 4: Fractions & Core Arithmetic
    if (cat === 'All Categories' || cat === 'Fractions & Core Arithmetic') {
      if (level === 'basic') {
        deck.push({
          id: 402,
          category: "Fractions & Core Arithmetic",
          difficulty: 'basic',
          title: "Add fractions with unlike denominators",
          latexQuery: `\\frac{1}{${a}} + \\frac{1}{${a + 1}}`,
          correctAnswer: [`${2 * a + 1}/${a * (a + 1)}`],
          hints: [
            `Find the least common denominator, which is $${a} \\cdot ${a + 1} = ${a * (a + 1)}$.`,
            "Rewrite both fractions with the common denominator.",
            `Add the numerators together: $${a + 1} + ${a}$.`
          ],
          stepByStepSolution: `\\frac{1}{${a}} + \\frac{1}{${a + 1}} = \\frac{${a + 1}}{${a * (a + 1)}} + \\frac{${a}}{${a * (a + 1)}} = \\frac{${2 * a + 1}}{${a * (a + 1)}}.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 401,
          category: "Fractions & Core Arithmetic",
          difficulty: 'intermediate',
          title: "Multiplying fractions with reduction",
          latexQuery: `\\frac{${a}}{3} \\cdot \\frac{6}{${a === 2 ? 5 : a - 1}}`,
          correctAnswer: [`${(a * 6) / (3 * (a === 2 ? 5 : a - 1)) % 1 === 0 ? (a * 6) / (3 * (a === 2 ? 5 : a - 1)) : `${a * 2}/${a === 2 ? 5 : a - 1}`}`],
          hints: [
            "Multiply numerators together, then multiply denominators separately.",
            `The product is $(${a} \\times 6) / (3 \\times ${a === 2 ? 5 : a - 1})$.`,
            "Reduce the fraction to its simplified prime format."
          ],
          stepByStepSolution: `\\frac{${a}}{3} \\cdot \\frac{6}{${a === 2 ? 5 : a - 1}} = \\frac{${6 * a}}{${3 * (a === 2 ? 5 : a - 1)}} = \\frac{${2 * a}}{${a === 2 ? 5 : a - 1}}.`
        });
        deck.push({
          id: 403,
          category: "Fractions & Core Arithmetic",
          difficulty: 'intermediate',
          title: "Solve relative fraction balance",
          latexQuery: `\\frac{x - ${b}}{${a}} = 3`,
          correctAnswer: [`${3 * a + b}`],
          hints: [
            `Multiply both sides of the equation by $${a}$ to clear the fraction.`,
            `This leaves $x - ${b} = ${3 * a}$.`,
            `Add $${b}$ to both sides to solve for x.`
          ],
          stepByStepSolution: `x - ${b} = 3 \\cdot ${a} = ${3 * a} \\Rightarrow x = ${3 * a} + ${b} = ${3 * a + b}.`
        });
      } else {
        deck.push({
          id: 404,
          category: "Fractions & Core Arithmetic",
          difficulty: 'advanced',
          title: "Simplifying complex continued fraction",
          latexQuery: `\\cfrac{1}{1 + \\cfrac{1}{${c}}}`,
          correctAnswer: [`${c}/${c + 1}`],
          hints: [
            `Simplify the inner denominator $1 + 1/${c}$ first.`,
            `This expression expands to $\\frac{${c} + 1}{${c}}$.`,
            "Find the reciprocal of that fraction to solve the puzzle."
          ],
          stepByStepSolution: `1 + \\frac{1}{${c}} = \\frac{${c} + 1}{${c}} \\Rightarrow \\cfrac{1}{\\left(\\frac{${c}+1}{${c}}\\right)} = \\frac{${c}}{${c}+1}.`
        });
      }
    }

    // Category 5: Geometry
    if (cat === 'All Categories' || cat === 'Geometry') {
      if (level === 'basic') {
        deck.push({
          id: 501,
          category: "Geometry",
          difficulty: 'basic',
          title: "Area of a right triangle",
          latexQuery: `\\text{Area of right } \\triangle \\text{ with base } ${a} \\text{ and height } ${b}`,
          correctAnswer: [`${(a * b) / 2}`],
          hints: [
            "The area of a triangle is half the product of its base and height.",
            "Calculate $0.5 \\times \\text{base} \\times \\text{height}$.",
            `Calculate $0.5 \\times ${a} \\times ${b}$.`
          ],
          stepByStepSolution: `A = \\frac{1}{2}bh = \\frac{1}{2}(${a})(${b}) = ${(a * b) / 2}.`
        });
        deck.push({
          id: 504,
          category: "Geometry",
          difficulty: 'basic',
          title: "Perimeter of rectangle",
          latexQuery: `\\text{Perimeter of rectangle with length } ${a + c} \\text{ and width } ${c}`,
          correctAnswer: [`${2 * (a + c) + 2 * c}`],
          hints: [
            "The formula for the perimeter of a rectangle is $P = 2(L + W)$.",
            `Add the length $${a + c}$ and the width $${c}$.`,
            "Multiply the sum by 2."
          ],
          stepByStepSolution: `P = 2(L + W) = 2(${a + c} + ${c}) = 2(${a + 2 * c}) = ${2 * (a + c) + 2 * c}.`
        });
      } else if (level === 'intermediate') {
        const sideC = Math.sqrt(a * a + b * b);
        const formatSide = sideC % 1 === 0 ? `${sideC}` : `\\sqrt{${a * a + b * b}}`;
        deck.push({
          id: 502,
          category: "Geometry",
          difficulty: 'intermediate',
          title: "Pythagorean Theorem",
          latexQuery: `\\text{Hypotenuse of right } \\triangle \\text{ with legs } ${a}, ${b}`,
          correctAnswer: [`${sideC % 1 === 0 ? sideC : `sqrt(${a*a + b*b})`}`],
          hints: [
            "Use the Pythagorean theorem: $a^2 + b^2 = c^2$.",
            `Calculate $${a}^2 + ${b}^2$.`,
            "Take the square root of the sum."
          ],
          stepByStepSolution: `c^2 = a^2 + b^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}. \\quad c = ${formatSide}.`
        });
        deck.push({
          id: 505,
          category: "Geometry",
          difficulty: 'intermediate',
          title: "Area of a Circle",
          latexQuery: `\\text{Area of circle with radius } r = ${c} \\quad \\text{in terms of } \\pi`,
          correctAnswer: [`${c * c}\\pi`, `${c * c}pi`, `${c * c}*pi`],
          hints: [
            "The formula for the area of a circle is $A = \\pi r^2$.",
            `Square the radius: $r^2 = ${c}^2 = ${c * c}$.`,
            "Multiply by pi."
          ],
          stepByStepSolution: `A = \\pi r^2 = \\pi (${c})^2 = ${c * c}\\pi.`
        });
      } else {
        deck.push({
          id: 503,
          category: "Geometry",
          difficulty: 'advanced',
          title: "Volume of a cylinder",
          latexQuery: `\\text{Cylinder Volume } (r = ${a}, h = ${b}) \\quad \\text{in terms of } \\pi`,
          correctAnswer: [`${a * a * b}\\pi`, `${a * a * b}pi`, `${a * a * b}*pi`],
          hints: [
            "The volume formula for a cylinder is $V = \\pi r^2 h$.",
            `Square the radius: $r^2 = ${a}^2 = ${a * a}$.`,
            `Multiply by height $h = ${b}$ and append $\\pi$.`
          ],
          stepByStepSolution: `V = \\pi r^2 h = \\pi (${a})^2 (${b}) = ${a * a * b}\\pi.`
        });
        deck.push({
          id: 506,
          category: "Geometry",
          difficulty: 'advanced',
          title: "Surface area of sphere",
          latexQuery: `\\text{Surface Area of sphere with radius } r = ${a} \\quad \\text{in terms of } \\pi`,
          correctAnswer: [`${4 * a * a}\\pi`, `${4 * a * a}pi`, `${4 * a * a}*pi`],
          hints: [
            "The formula for the surface area of a sphere is $A = 4\\pi r^2$.",
            `Square the radius: $r^2 = ${a}^2 = ${a * a}$.`,
            "Multiply by 4 and append pi."
          ],
          stepByStepSolution: `A = 4\\pi r^2 = 4\\pi (${a})^2 = 4(${a * a})\\pi = ${4 * a * a}\\pi.`
        });
      }
    }

    // Category 6: Statistics & Probability
    if (cat === 'All Categories' || cat === 'Statistics & Probability') {
      if (level === 'basic') {
        deck.push({
          id: 601,
          category: "Statistics & Probability",
          difficulty: 'basic',
          title: "Arithmetic Mean",
          latexQuery: `\\text{Mean of } \\{ ${a}, ${b}, ${c} \\}`,
          correctAnswer: [`${(a + b + c) / 3}`],
          hints: [
            "The mean is the sum of the numbers divided by the count.",
            `Sum the numbers: $${a} + ${b} + ${c} = ${a + b + c}$.`,
            `Divide the sum by 3 (the total number of items).`
          ],
          stepByStepSolution: `\\text{Mean} = \\frac{${a} + ${b} + ${c}}{3} = \\frac{${a + b + c}}{3} = ${(a + b + c) / 3}.`
        });
        deck.push({
          id: 604,
          category: "Statistics & Probability",
          difficulty: 'basic',
          title: "Range of a set",
          latexQuery: `\\text{Range of } \\{ ${a}, ${a + c}, ${a - 1} \\}`,
          correctAnswer: [`${c + 1}`],
          hints: [
            "The range is the difference between the maximum and minimum values in a dataset.",
            `Identify the maximum value: $${a + c}$.`,
            `Identify the minimum value: $${a - 1}$. Subtract it from the maximum.`
          ],
          stepByStepSolution: `\\text{Range} = \\text{Max} - \\text{Min} = ${a + c} - (${a - 1}) = ${c + 1}.`
        });
      } else if (level === 'intermediate') {
        const total = a + b;
        deck.push({
          id: 602,
          category: "Statistics & Probability",
          difficulty: 'intermediate',
          title: "Probability of basic event",
          latexQuery: `\\text{Probability of picking red from } ${a} \\text{ red, } ${b} \\text{ blue}`,
          correctAnswer: [`${a}/${total}`],
          hints: [
            "Probability is (Target Outcomes) / (Total Outcomes).",
            `Target outcomes (red) = $${a}$. Total outcomes = $${a} + ${b} = ${total}$.`,
            `The probability is $${a} / ${total}$.`
          ],
          stepByStepSolution: `P(\\text{red}) = \\frac{\\text{red}}{\\text{total}} = \\frac{${a}}{${a} + ${b}} = \\frac{${a}}{${total}}.`
        });
        deck.push({
          id: 605,
          category: "Statistics & Probability",
          difficulty: 'intermediate',
          title: "Median of a dataset",
          latexQuery: `\\text{Median of } \\{ ${a}, ${a + 2}, ${a + 4} \\}`,
          correctAnswer: [`${a + 2}`],
          hints: [
            "The median is the middle value when the data is sorted in ascending order.",
            `The sorted list is already: $${a}$, $${a + 2}$, $${a + 4}$.`,
            "Identify the middle element."
          ],
          stepByStepSolution: `\\text{The sorted dataset contains 3 items. The middle element is } ${a + 2}.`
        });
      } else {
        const permResult = a * (a - 1) * (a - 2);
        deck.push({
          id: 603,
          category: "Statistics & Probability",
          difficulty: 'advanced',
          title: "Permutations",
          latexQuery: `P(${a}, 3) \\text{ or } {}^{${a}}P_3`,
          correctAnswer: [`${permResult}`],
          hints: [
            "Permutations formula: $P(n, k) = \\frac{n!}{(n - k)!}$.",
            "This simplifies to multiplying descending terms: $n \\times (n - 1) \\times (n - 2)$.",
            `Calculate $${a} \\times ${a - 1} \\times ${a - 2}$.`
          ],
          stepByStepSolution: `P(${a}, 3) = \\frac{${a}!}{(${a} - 3)!} = ${a} \\times ${a - 1} \\times ${a - 2} = ${permResult}.`
        });
        deck.push({
          id: 606,
          category: "Statistics & Probability",
          difficulty: 'advanced',
          title: "Combinations calculation",
          latexQuery: `C(${a}, 2) \\text{ or } \\binom{${a}}{2}`,
          correctAnswer: [`${(a * (a - 1)) / 2}`],
          hints: [
            "The combinations formula is $C(n, k) = \\frac{n!}{k!(n - k)!}$.",
            "For $k = 2$, this simplifies to $\\frac{n(n - 1)}{2}$.",
            `Evaluate $(${a} \\times ${a - 1}) / 2$.`
          ],
          stepByStepSolution: `\\binom{${a}}{2} = \frac{${a} \\cdot ${a - 1}}{2} = ${(a * (a - 1)) / 2}.`
        });
      }
    }

    // Category 7: Linear Algebra
    if (cat === 'All Categories' || cat === 'Linear Algebra') {
      if (level === 'basic') {
        deck.push({
          id: 701,
          category: "Linear Algebra",
          difficulty: 'basic',
          title: "Dot Product",
          latexQuery: `[${a}, ${b}] \\cdot [${c}, ${a}]`,
          correctAnswer: [`${a * c + b * a}`],
          hints: [
            "Multiply corresponding components and add them together.",
            `Calculate $(${a} \\times ${c}) + (${b} \\times ${a})$.`,
            `The result is ${a * c} + ${b * a}.`
          ],
          stepByStepSolution: `(${a})(${c}) + (${b})(${a}) = ${a * c} + ${b * a} = ${a * c + b * a}.`
        });
        deck.push({
          id: 704,
          category: "Linear Algebra",
          difficulty: 'basic',
          title: "Scalar Vector Multiplication",
          latexQuery: `3 \\cdot [${a}, -${b}]`,
          correctAnswer: [`[${3 * a},-${3 * b}]`, `[${3 * a}, -${3 * b}]`],
          hints: [
            "Multiply each component of the vector by the scalar multiplier.",
            `Calculate $3 \\times ${a}$ and $3 \\times (-${b})$.`,
            "Format the response inside standard square brackets [u, v]."
          ],
          stepByStepSolution: `3 \\cdot [${a}, -${b}] = [3 \\cdot ${a}, 3 \\cdot (-${b})] = [${3 * a}, -${3 * b}].`
        });
      } else if (level === 'intermediate') {
        const det2x2 = a * c - b * b;
        deck.push({
          id: 702,
          category: "Linear Algebra",
          difficulty: 'intermediate',
          title: "Determinant of 2x2 Matrix",
          latexQuery: `\\det \\begin{pmatrix} ${a} & ${b} \\\\ ${b} & ${c} \\end{pmatrix}`,
          correctAnswer: [`${det2x2}`],
          hints: [
            "The determinant of a 2x2 matrix is ad - bc.",
            `Calculate $(${a} \\times ${c}) - (${b} \\times ${b})$.`,
            `The result is ${a * c} - ${b * b}.`
          ],
          stepByStepSolution: `\\det = (${a})(${c}) - (${b})(${b}) = ${a * c} - ${b * b} = ${det2x2}.`
        });
        deck.push({
          id: 705,
          category: "Linear Algebra",
          difficulty: 'intermediate',
          title: "Orthogonal vectors check",
          latexQuery: `\\text{Find } x \\text{ such that } [x, ${a}] \\text{ and } [4, -2] \\text{ are orthogonal}`,
          correctAnswer: [`${a / 2}`],
          hints: [
            "Two vectors are orthogonal if their dot product is equal to 0.",
            `Perform dot product: $4x + (${a} \\cdot -2) = 0$.`,
            `Solve the equation: $4x - ${2 * a} = 0$.`
          ],
          stepByStepSolution: `4x - ${2 * a} = 0 \\Rightarrow 4x = ${2 * a} \\Rightarrow x = \\frac{${2 * a}}{4} = ${a / 2}.`
        });
      } else {
        const trace = a + c + a;
        deck.push({
          id: 703,
          category: "Linear Algebra",
          difficulty: 'advanced',
          title: "Trace of 3x3 Matrix",
          latexQuery: `\\text{Tr} \\begin{pmatrix} ${a} & 1 & 2 \\\\ 3 & ${c} & 4 \\\\ 5 & 6 & ${a} \\end{pmatrix}`,
          correctAnswer: [`${trace}`],
          hints: [
            "The trace is the sum of the elements on the main diagonal.",
            `Add the diagonal elements: ${a} + ${c} + ${a}.`,
            `The result is ${trace}.`
          ],
          stepByStepSolution: `\\text{Tr} = ${a} + ${c} + ${a} = ${trace}.`
        });
        deck.push({
          id: 706,
          category: "Linear Algebra",
          difficulty: 'advanced',
          title: "Eigenvalues of diagonal matrix",
          latexQuery: `\\text{Eigenvalues of } \\begin{pmatrix} ${a} & 0 \\\\ 0 & ${c} \\end{pmatrix}`,
          correctAnswer: [`${Math.min(a, c)}, ${Math.max(a, c)}`, `${Math.min(a, c)},${Math.max(a, c)}`],
          hints: [
            "For a diagonal matrix, the eigenvalues are simply the elements on the main diagonal.",
            "Identify the main diagonal elements.",
            "Format the response with the smaller root first, e.g., u, v."
          ],
          stepByStepSolution: `\\text{The eigenvalues of a diagonal matrix match its diagonal entries: } \\lambda = ${Math.min(a, c)}, ${Math.max(a, c)}.`
        });
      }
    }

    // Category 8: Complex Numbers
    if (cat === 'All Categories' || cat === 'Complex Numbers') {
      if (level === 'basic') {
        deck.push({
          id: 801,
          category: "Complex Numbers",
          difficulty: 'basic',
          title: "Addition of Complex Numbers",
          latexQuery: `(${a} + ${b}i) + (${c} - ${b - 1}i)`,
          correctAnswer: [`${a + c} + 1i`, `${a + c}+i`, `${a + c} + i`],
          hints: [
            "Add the real parts together, and add the imaginary parts together.",
            `Real part: ${a} + ${c}.`,
            `Imaginary part: ${b} - ${b - 1}.`
          ],
          stepByStepSolution: `(${a} + ${c}) + (${b} - ${b - 1})i = ${a + c} + 1i.`
        });
        deck.push({
          id: 804,
          category: "Complex Numbers",
          difficulty: 'basic',
          title: "Modulus of complex number",
          latexQuery: `|3 + 4i|`,
          correctAnswer: ["5"],
          hints: [
            "The modulus of a + bi is the square root of (a^2 + b^2).",
            "Square the real and imaginary parts: 3^2 + 4^2 = 9 + 16 = 25.",
            "Take the square root of 25."
          ],
          stepByStepSolution: `|3 + 4i| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 802,
          category: "Complex Numbers",
          difficulty: 'intermediate',
          title: "Multiplication of Complex Numbers",
          latexQuery: `(${a} + i)(${b} - i)`,
          correctAnswer: [`${a * b + 1} + ${b - a}i`, `${a * b + 1}+${b - a}i`],
          hints: [
            "Use FOIL (First, Outer, Inner, Last) method.",
            `Recall that $i^2 = -1$.`,
            `Calculate $(${a})(${b}) + (${a})(-i) + (i)(${b}) + (i)(-i)$.`
          ],
          stepByStepSolution: `(${a})(${b}) - ${a}i + ${b}i - i^2 = ${a * b} + ${b - a}i - (-1) = ${a * b + 1} + ${b - a}i.`
        });
        deck.push({
          id: 805,
          category: "Complex Numbers",
          difficulty: 'intermediate',
          title: "Complex conjugate product",
          latexQuery: `(${a} + ${b}i)(${a} - ${b}i)`,
          correctAnswer: [`${a * a + b * b}`],
          hints: [
            "Multiplying a complex number by its conjugate yields (u + vi)(u - vi) = u^2 + v^2.",
            `Assess values: u = ${a} and v = ${b}.`,
            `Evaluate $${a}^2 + ${b}^2 = ${a * a} + ${b * b}$.`
          ],
          stepByStepSolution: `(${a} + ${b}i)(${a} - ${b}i) = ${a}^2 - (${b}i)^2 = ${a * a} + ${b * b} = ${a * a + b * b}.`
        });
      } else {
        deck.push({
          id: 803,
          category: "Complex Numbers",
          difficulty: 'advanced',
          title: "Division of Complex Numbers",
          latexQuery: `\\frac{${a}}{${b}i}`,
          correctAnswer: [`-${a}/${b}i`, `-${a / b}i`, `${-a}/${b}i`],
          hints: [
            "Multiply the numerator and denominator by the complex conjugate of the denominator.",
            "The complex conjugate of $bi$ is $-bi$.",
            `Recall that $i^2 = -1$.`
          ],
          stepByStepSolution: `\\frac{${a} \\cdot (-${b}i)}{${b}i \\cdot (-${b}i)} = \\frac{-${a * b}i}{-${b * b}i^2} = \\frac{-${a * b}i}{${b * b}} = -\\frac{${a}}{${b}}i.`
        });
        deck.push({
          id: 806,
          category: "Complex Numbers",
          difficulty: 'advanced',
          title: "Imaginary power reduction",
          latexQuery: `i^{${4 * a + 3}}`,
          correctAnswer: ["-i"],
          hints: [
            "Powers of i cycle in a period of 4: i^1 = i, i^2 = -1, i^3 = -i, i^4 = 1.",
            "Divide the exponent by 4 and find the remainder.",
            `The remainder of $${4 * a + 3} \\div 4$ is 3, which corresponds to $i^3$.`
          ],
          stepByStepSolution: `i^{${4 * a + 3}} = (i^4)^{${a}} \\cdot i^3 = (1) \\cdot (-i) = -i.`
        });
      }
    }

    // Category 9: Differential Equations
    if (cat === 'All Categories' || cat === 'Differential Equations') {
      if (level === 'basic') {
        deck.push({
          id: 901,
          category: "Differential Equations",
          difficulty: 'basic',
          title: "Separation of Variables",
          latexQuery: `\\frac{dy}{dx} = ${a}x`,
          correctAnswer: [`${a / 2}x^2 + C`, `${a / 2}x^2+C`],
          hints: [
            "Separate the variables: $dy = ${a}x dx$.",
            "Integrate both sides.",
            "Remember to add the constant of integration, C."
          ],
          stepByStepSolution: `\\int dy = \\int ${a}x dx \\Rightarrow y = \\frac{${a}}{2}x^2 + C.`
        });
        deck.push({
          id: 904,
          category: "Differential Equations",
          difficulty: 'basic',
          title: "Order of differential equation",
          latexQuery: `\\left(\\frac{d^2y}{dx^2}\\right)^3 + 5\\left(\\frac{dy}{dx}\\right)^4 + y = 0 \\quad \\text{Find order}`,
          correctAnswer: ["2"],
          hints: [
            "The order of a differential equation is the highest derivative present in the equation.",
            "Identify the derivatives: first-order dy/dx and second-order d^2y/dx^2.",
            "The highest derivative order is 2."
          ],
          stepByStepSolution: `\\text{The highest derivative in the equation is of the second order, so order = } 2.`
        });
      } else if (level === 'intermediate') {
        deck.push({
          id: 902,
          category: "Differential Equations",
          difficulty: 'intermediate',
          title: "Integrating Factor",
          latexQuery: `y' + \\frac{1}{x}y = ${a}`,
          correctAnswer: [`x`],
          hints: [
            "The equation is in standard linear form $y' + P(x)y = Q(x)$.",
            "The integrating factor is $\\mu(x) = e^{\\int P(x)dx}$.",
            `Calculate $e^{\\int (1/x)dx}$.`
          ],
          stepByStepSolution: `\\mu(x) = e^{\\int \\frac{1}{x}dx} = e^{\\ln(x)} = x.`
        });
        deck.push({
          id: 905,
          category: "Differential Equations",
          difficulty: 'intermediate',
          title: "First order homogeneous decay",
          latexQuery: `y' - ${a}y = 0`,
          correctAnswer: [`Ce^{${a}x}`, `C*e^{${a}x}`, `c*e^{${a}x}`, `ce^{${a}x}`],
          hints: [
            "This is a first-order linear homogeneous differential equation.",
            `Write as $dy/y = ${a} dx$ and integrate both sides.`,
            `The solution is an exponential function of the form $Ce^{kx}$ where $k = ${a}$.`
          ],
          stepByStepSolution: `\\ln|y| = ${a}x + C_1 \\Rightarrow y = Ce^{${a}x}.`
        });
      } else {
        deck.push({
          id: 903,
          category: "Differential Equations",
          difficulty: 'advanced',
          title: "Characteristic Equation",
          latexQuery: `y'' - ${a * 2}y' + ${a * a}y = 0`,
          correctAnswer: [`r^2 - ${a * 2}r + ${a * a} = 0`, `r^2-${a * 2}r+${a * a}=0`],
          hints: [
            "Assume a solution of the form $y = e^{rx}$.",
            "Substitute $y = e^{rx}$, $y' = re^{rx}$, and $y'' = r^2e^{rx}$ into the differential equation.",
            "Divide out the common factor $e^{rx}$."
          ],
          stepByStepSolution: `r^2e^{rx} - ${a * 2}re^{rx} + ${a * a}e^{rx} = 0 \\Rightarrow e^{rx}(r^2 - ${a * 2}r + ${a * a}) = 0 \\Rightarrow r^2 - ${a * 2}r + ${a * a} = 0.`
        });
        deck.push({
          id: 906,
          category: "Differential Equations",
          difficulty: 'advanced',
          title: "Second order general solution",
          latexQuery: `y'' - 5y' + 6y = 0 \\quad \\text{with roots } (r - 2)(r - 3) = 0`,
          correctAnswer: [`C_1e^{2x} + C_2e^{3x}`, `C_1e^{2x}+C_2e^{3x}`],
          hints: [
            "Since the characteristic equation has distinct real roots r1=2 and r2=3.",
            "The general solution is of the form C1 * e^(r1 * x) + C2 * e^(r2 * x).",
            "Substitute the roots to formulate the result."
          ],
          stepByStepSolution: `\\text{Since general solution for distinct roots } r_1, r_2 \\text{ is } C_1e^{r_1 x} + C_2e^{r_2 x} \\Rightarrow y = C_1e^{2x} + C_2e^{3x}.`
        });
      }
    }

    // Fallback if empty
    if (deck.length === 0) {
      deck.push({
        id: 999,
        category: "Calculus & Limits",
        difficulty: 'basic',
        title: "Solve basic additive balance",
        latexQuery: `x + 12 = 25`,
        correctAnswer: ["13"],
        hints: ["Subtract 12 from 25"],
        stepByStepSolution: `x = 25 - 12 = 13.`
      });
    }

    setProblems(deck);
  };

  const currentProblem = problems[currentIdx] || null;

  const checkAnswer = () => {
    if (!currentProblem || checked) return;

    const sanitizedUser = userInput.trim().toLowerCase().replace(/\s+/g, '');
    const isAnswerCorrect = currentProblem.correctAnswer.some(ans => {
      const sanitizedAns = ans.toLowerCase().replace(/\s+/g, '');
      return sanitizedUser === sanitizedAns || sanitizedUser.includes(`x=${sanitizedAns}`);
    });

    setChecked(true);
    setIsCorrect(isAnswerCorrect);
    setTotalAnswered(prev => prev + 1);

    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      dailyGoalService.incrementSolved(1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highStreak) {
        setHighStreak(nextStreak);
        try {
          localStorage.setItem('quantum_drill_highstreak', nextStreak.toString());
          triggerCloudSync();
        } catch (e) {
          console.warn("Storage write restricted.", e);
        }
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setUserInput('');
    setChecked(false);
    setShowSolution(false);
    setActiveHintIdx(null);
    setAiAnswer(null);
    setAiError(null);
    setShowAiPanel(false);
    clearCanvas();
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Regenerate fresh set
      generateDrills(activeCategory, activeLevel);
      setCurrentIdx(0);
    }
  };

  const triggerResetStats = () => {
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setTimeElapsed(0);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto" id="mathexercises_section">
      <div className="bg-brand-surface/40 p-8 md:p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        {/* Top metrics bar */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-brand-border/40">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <Award size={11} /> Math-Exercises Interactive Trainer
            </span>
            <h3 className="text-3xl font-black text-brand-text tracking-tight">
              Calculus & Algebra Drills
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Real-time stats widgets */}
            <div className="px-4 py-2 bg-brand-bg/60 border border-brand-border/40 rounded-2xl flex items-center gap-2.5 shadow-inner">
              <Timer size={14} className="text-indigo-400" />
              <div className="text-xs font-mono">
                <span className="text-brand-text-secondary">Elapsed:</span>{' '}
                <span className="text-brand-text font-bold">
                  {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
                </span>
              </div>
            </div>

            <div className="px-4 py-2 bg-brand-bg/60 border border-brand-border/40 rounded-2xl flex items-center gap-2.5 shadow-inner">
              <Flame size={14} className="text-amber-500" />
              <div className="text-xs font-mono">
                <span className="text-brand-text-secondary">Streak:</span>{' '}
                <span className="text-amber-400 font-bold">{streak}</span>
                <span className="text-brand-text-secondary text-[10px] ml-1.5">Best: {highStreak}</span>
              </div>
            </div>

            <div className="px-4 py-2 bg-brand-bg/60 border border-brand-border/40 rounded-2xl flex items-center gap-2.5 shadow-inner">
              <Check size={14} className="text-emerald-400" />
              <div className="text-xs font-mono">
                <span className="text-brand-text-secondary">Accuracy:</span>{' '}
                <span className="text-emerald-400 font-bold">
                  {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%
                </span>
                <span className="text-brand-text-secondary text-[10px] ml-1.5">({score}/{totalAnswered})</span>
              </div>
            </div>

            <button
              onClick={triggerResetStats}
              title="Reset metrics clock"
              className="p-2 bg-brand-bg hover:bg-brand-surface rounded-xl border border-brand-border/50 text-brand-text-secondary hover:text-brand-text transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2 pt-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium border transition-all ${
                activeCategory === cat 
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-bold shadow-md' 
                  : 'bg-brand-bg/40 border-brand-border/50 text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Level toggle controls */}
        <div className="flex items-center gap-2 mt-4 bg-brand-bg/30 p-1 rounded-2xl border border-brand-border/40 w-fit">
          {(['basic', 'intermediate', 'advanced'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeLevel === lvl 
                  ? 'bg-brand-primary text-brand-bg font-bold shadow-sm' 
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Primary Interactive Drill Card */}
        <div className="mt-8 relative min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {currentProblem ? (
              <motion.div
                key={currentProblem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 text-brand-text-secondary mb-1">
                    <span className="font-mono text-[10px] bg-brand-bg px-2 py-1 rounded-lg border border-brand-border/55 text-indigo-400">
                      {currentProblem.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">• {currentProblem.title}</span>
                  </div>
                  
                  {/* The LaTeX expression query */}
                  <div className="py-10 bg-brand-bg/70 rounded-3xl border border-brand-border/60 flex items-center justify-center shadow-inner overflow-x-auto px-4">
                    <div className="text-3xl font-black text-brand-text font-mono text-center scrollbar-none">
                      <Latex>{`$$ ${currentProblem.latexQuery} $$`}</Latex>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tools Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-bg/40 p-3 rounded-2xl border border-brand-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowScratchpad(!showScratchpad)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                        showScratchpad 
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500' 
                          : 'bg-brand-bg hover:bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text'
                      }`}
                    >
                      <PenTool size={11} />
                      {showScratchpad ? 'Hide Scratchpad' : 'Show Scratchpad'}
                    </button>
                    <button
                      onClick={fetchAiTutorHelp}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 rounded-xl text-[10px] text-indigo-400 font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Brain size={11} className={aiLoading ? "animate-spin" : ""} />
                      {aiLoading ? "Consulting Coach..." : "Consult AI Math Coach"}
                    </button>
                  </div>
                  {showScratchpad && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-brand-bg/60 px-2 py-1 rounded-lg border border-brand-border/40">
                        <span className="text-[9px] font-bold text-brand-text-secondary uppercase">Ink:</span>
                        {['#818cf8', '#fbbf24', '#34d399', '#ffffff'].map(c => (
                          <button
                            key={c}
                            onClick={() => setBrushColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-3.5 h-3.5 rounded-full border transition-all ${
                              brushColor === c ? 'ring-2 ring-indigo-400 border-transparent scale-110' : 'border-transparent hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 bg-brand-bg/60 px-2 py-1 rounded-lg border border-brand-border/40 text-[9px]">
                        <span className="font-bold text-brand-text-secondary uppercase">Size:</span>
                        {[2, 4, 6].map(sz => (
                          <button
                            key={sz}
                            onClick={() => setBrushSize(sz)}
                            className={`px-1.5 py-0.5 rounded transition-all font-mono font-bold ${
                              brushSize === sz ? 'bg-indigo-500/20 text-indigo-400' : 'text-brand-text-secondary hover:text-brand-text'
                            }`}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={clearCanvas}
                        className="p-1 px-2.5 bg-brand-bg hover:bg-brand-surface border border-brand-border/60 text-brand-text-secondary hover:text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <Eraser size={10} /> Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Scratchpad Canvas Panel */}
                <AnimatePresence>
                  {showScratchpad && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-brand-surface/70 rounded-3xl border border-brand-border/60 space-y-2">
                        <div className="text-[9px] font-black text-brand-text-secondary/55 uppercase tracking-widest flex items-center gap-1">
                          <Compass size={11} className="text-amber-500 animate-pulse" /> Interactive Canvas (Mouse / Touch draw to formulate derivatives or calculations)
                        </div>
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-56 bg-brand-bg/95 rounded-2xl cursor-crosshair border border-brand-border/60 shadow-inner block"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI Coach Assistant Guidance Overlay */}
                <AnimatePresence>
                  {showAiPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="p-6 bg-indigo-950/25 border border-indigo-500/20 rounded-[2rem] space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <button
                          onClick={() => setShowAiPanel(false)}
                          className="p-1.5 rounded-full bg-brand-bg hover:bg-brand-surface text-brand-text-secondary hover:text-brand-text border border-brand-border transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5 text-indigo-400">
                        <Brain size={18} className="animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest font-mono">Quantum AI Math Coach Live Feedback</span>
                      </div>
                      
                      {aiLoading ? (
                        <div className="space-y-4 py-3 animate-pulse">
                          <div className="h-4 bg-indigo-500/10 rounded-full w-2/3"></div>
                          <div className="h-4 bg-indigo-500/10 rounded-full w-4/5"></div>
                          <div className="h-4 bg-indigo-500/10 rounded-full w-1/2"></div>
                        </div>
                      ) : aiError ? (
                        <div className="text-xs text-rose-400 font-mono py-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                          ⚠️ {aiError}
                        </div>
                      ) : aiAnswer ? (
                        <div className="text-xs text-brand-text-secondary leading-relaxed font-light font-sans whitespace-pre-line py-1 prose prose-invert max-w-none">
                          <div className="markdown-body">
                            <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer prompt controls */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={checked}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkAnswer();
                      }}
                      placeholder={checked ? "Submitted" : "Type final value/expression (e.g. 15 or 3cos(3x))..."}
                      className="flex-1 bg-brand-bg/90 border border-brand-border text-brand-text rounded-2xl py-3.5 px-5 font-mono text-sm focus:ring-2 focus:ring-brand-primary outline-none shadow-sm disabled:opacity-50"
                    />
                    {!checked ? (
                      <button
                        onClick={checkAnswer}
                        disabled={!userInput.trim()}
                        className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-brand-bg rounded-2xl font-black uppercase tracking-wider text-xs transition-all disabled:opacity-40 shadow-lg shadow-brand-primary/15 shrink-0"
                      >
                        Submit Target
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 group shrink-0"
                      >
                        Next Exercise <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>

                  {/* Submission results alerts */}
                  <AnimatePresence>
                    {checked && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border flex items-center gap-3 ${
                          isCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
                            <div className="text-xs">
                              <span className="font-bold">Correct Answer!</span> Perfect matching. +1 point applied.
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle size={18} className="shrink-0" />
                            <div className="text-xs flex-1">
                              <span className="font-bold">Incorrect derivation.</span> Expected forms: <span className="font-mono bg-brand-bg px-2 py-0.5 rounded border border-brand-border text-brand-text">{currentProblem.correctAnswer.join(" or ")}</span>
                            </div>
                            <button
                              onClick={() => setShowSolution(!showSolution)}
                              className="px-3 py-1 bg-rose-500/15 border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase hover:bg-rose-500/25 transition-all text-rose-400"
                            >
                              Show Stepped Solution
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progressive Hints Section */}
                <div className="pt-4 border-t border-brand-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-text-secondary uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <HelpCircle size={12} /> Guided Clue Bank
                    </span>
                    <div className="flex gap-1">
                      {currentProblem.hints.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveHintIdx(idx)}
                          className={`w-7 h-7 rounded-xl text-xs font-mono font-bold border transition-all ${
                            activeHintIdx === idx 
                              ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-500' 
                              : 'bg-brand-bg hover:bg-brand-surface border-brand-border text-brand-text-secondary'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeHintIdx !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-yellow-500/5 border border-yellow-500/10 text-yellow-500 rounded-2xl text-xs font-light leading-relaxed flex gap-2.5 items-start"
                      >
                        <Sparkles size={14} className="shrink-0 text-yellow-500 mt-0.5 animate-spin" />
                        <div>
                          <strong className="block mb-1 text-[10px] uppercase tracking-wider font-extrabold text-yellow-600">Clue {activeHintIdx + 1}</strong>
                          <Latex>{`$ ${currentProblem.hints[activeHintIdx]} $`}</Latex>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dynamic Step-by-Step Solution Card */}
                {showSolution && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-brand-bg rounded-2xl border border-brand-border space-y-3"
                  >
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono block">Complete Analytical Proof</span>
                    <div className="text-xs text-brand-text leading-relaxed font-mono whitespace-pre-line py-2">
                      <Latex>{`$ ${currentProblem.stepByStepSolution} $`}</Latex>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <div className="text-center py-20 text-brand-text-secondary">
                No active target exercises loaded. Adjust category selection parameters above.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
export default MathExercises;
