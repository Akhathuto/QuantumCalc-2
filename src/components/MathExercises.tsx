import React, { useState, useEffect } from 'react';
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
  Flame
} from 'lucide-react';
import Latex from 'react-latex-next';

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

const CATEGORIES = ["All Categories", "Calculus & Limits", "Algebraic Systems", "Trig Identities", "Fractions & Core Arithmetic", "Geometry", "Statistics & Probability"];

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

  // Load custom structured generators or premium library values on render/category shift
  useEffect(() => {
    generateDrills(activeCategory, activeLevel);
    setCurrentIdx(0);
    setUserInput('');
    setChecked(false);
    setShowSolution(false);
    setActiveHintIdx(null);
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
      }
    }

    // Category 4: Fractions & Core Arithmetic
    if (cat === 'All Categories' || cat === 'Fractions & Core Arithmetic') {
      deck.push({
        id: 401,
        category: "Fractions & Core Arithmetic",
        difficulty: level,
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
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highStreak) {
        setHighStreak(nextStreak);
        try {
          localStorage.setItem('quantum_drill_highstreak', nextStreak.toString());
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
