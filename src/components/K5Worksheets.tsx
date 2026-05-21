import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, 
  Sparkles, 
  Download, 
  ChevronDown
} from 'lucide-react';
import Latex from 'react-latex-next';

interface WorksheetQuestion {
  id: number;
  questionStr: string;
  mathContent?: string;
  blankSpaceLines: number;
  answerKey: string;
  stepDetails?: string;
}

const GRADE_LEVELS = [
  { id: 'K', label: "Kindergarten", num: 0 },
  { id: 'G1', label: "Grade 1", num: 1 },
  { id: 'G2', label: "Grade 2", num: 2 },
  { id: 'G3', label: "Grade 3", num: 3 },
  { id: 'G4', label: "Grade 4", num: 4 },
  { id: 'G5', label: "Grade 5", num: 5 },
  { id: 'G6', label: "Grade 6 (Middle)", num: 6 }
];

const TOPICS = [
  { id: 'arithmetic', label: "Simple Addition & Division" },
  { id: 'division_remainder', label: "Long Division with Remainders" },
  { id: 'decimals', label: "Decimals Multiplication" },
  { id: 'fractions_sum', label: "Fraction Additions / LCD" },
  { id: 'geometry', label: "Area & Perimeter Shapes" },
  { id: 'word_problems', label: "Logical Word Problems" }
];

export const K5Worksheets: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('G3');
  const [selectedTopic, setSelectedTopic] = useState('arithmetic');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [seed, setSeed] = useState(1);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showGridWorkspace, setShowGridWorkspace] = useState(true);
  const [questions, setQuestions] = useState<WorksheetQuestion[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState('Grade 3 Mathematics Worksheet');

  useEffect(() => {
    const generateDynamicWorksheet = () => {
      const generated: WorksheetQuestion[] = [];
      const gradeNum = GRADE_LEVELS.find(g => g.id === selectedGrade)?.num ?? 3;
      const baseVal = seed * 3 + gradeNum * 2;

      for (let i = 1; i <= questionsCount; i++) {
        const qSeed1 = (baseVal * i + 17) % 19 + 2;
        const qSeed2 = (baseVal * i * 7 + 13) % 13 + 3;

        switch (selectedTopic) {
          case 'decimals': {
            const val1 = (qSeed1 * 0.4).toFixed(1);
            const val2 = (qSeed2 * 0.6).toFixed(1);
            const ansDec = (parseFloat(val1) * parseFloat(val2)).toFixed(2);
            generated.push({
              id: i,
              questionStr: `Find the scalar product of decimal multipliers:`,
              mathContent: `${val1} \\times ${val2}`,
              blankSpaceLines: 3,
              answerKey: `${ansDec}`,
              stepDetails: `\\text{Vertical multiplication: } ${val1} \\times ${val2} = ${ansDec}.`
            });
            break;
          }

          case 'division_remainder': {
            const numerator = qSeed1 * 13 + qSeed2;
            const denominator = qSeed2;
            const quotient = Math.floor(numerator / denominator);
            const remainder = numerator % denominator;
            generated.push({
              id: i,
              questionStr: `Perform the long division step and find the exact remainder if applicable:`,
              mathContent: `${numerator} \\div ${denominator}`,
              blankSpaceLines: 5,
              answerKey: `${quotient} \\text{ R } ${remainder}`,
              stepDetails: `\\text{Solve: } ${denominator} \\times ${quotient} = ${denominator * quotient}. \\text{ Remainder: } ${numerator} - ${denominator * quotient} = ${remainder}.`
            });
            break;
          }

          case 'fractions_sum': {
            const den1 = Math.min(qSeed1, 8);
            const den2 = Math.min(qSeed2, 8);
            const num1 = Math.max(1, qSeed1 % den1);
            const num2 = Math.max(1, qSeed2 % den2);
            // Simple addition
            const lcd = den1 * den2;
            const sumNum = num1 * den2 + num2 * den1;
            generated.push({
              id: i,
              questionStr: `Add the fractions together and reduce to primary form:`,
              mathContent: `\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}`,
              blankSpaceLines: 4,
              answerKey: `\\frac{${sumNum}}{${lcd}}`,
              stepDetails: `\\text{Least Common Denominator: } ${lcd}. \\text{ Combined numerators: } ${num1 * den2} + ${num2 * den1} = ${sumNum}.`
            });
            break;
          }

          case 'geometry': {
            const length = qSeed1 + 4;
            const width = qSeed2 + 2;
            const area = length * width;
            const perimeter = 2 * (length + width);
            generated.push({
              id: i,
              questionStr: `A rectangle has Length = ${length} cm and Width = ${width} cm. Calculate its Area and Perimeter:`,
              blankSpaceLines: 4,
              answerKey: `\\text{Area: } ${area} \\text{ cm}^2, \\text{ Perimeter: } ${perimeter} \\text{ cm}`,
              stepDetails: `\\text{Area} = L \\times W = ${length} \\times ${width} = ${area}. \\text{ Perimeter} = 2(L + W) = 2(${length} + ${width}) = ${perimeter}.`
            });
            break;
          }

          case 'word_problems': {
            const counts = qSeed1 * 4;
            const pieces = qSeed2 + 1;
            generated.push({
              id: i,
              questionStr: `Mrs. Gable has ${counts} apples. She distributes them equally among her ${pieces} children. How many apples does each child get, and how many are left over?`,
              blankSpaceLines: 4,
              answerKey: `${Math.floor(counts / pieces)} \\text{ apples each, } ${counts % pieces} \\text{ left over}`,
              stepDetails: `${counts} \\div ${pieces} = ${Math.floor(counts / pieces)} \\text{ remaining } ${counts % pieces}.`
            });
            break;
          }

          case 'arithmetic':
          default: {
            const xVal = qSeed1 * 5;
            const yVal = qSeed2 * 4;
            generated.push({
              id: i,
              questionStr: `Solve the arithmetic equation:`,
              mathContent: `${xVal} + ${yVal} - ${qSeed1}`,
              blankSpaceLines: 2,
              answerKey: `${xVal + yVal - qSeed1}`,
              stepDetails: `${xVal} + ${yVal} = ${xVal + yVal}. \\text{ Decreasing } ${qSeed1} = ${xVal + yVal - qSeed1}.`
            });
            break;
          }
        }
      }

      const matchedLabel = GRADE_LEVELS.find(g => g.id === selectedGrade)?.label || 'Primary';
      const matchedTopic = TOPICS.find(t => t.id === selectedTopic)?.label || 'Worksheet';
      setWorksheetTitle(`${matchedLabel} ${matchedTopic} — Set ${seed}`);
      setQuestions(generated);
    };

    generateDynamicWorksheet();
  }, [selectedGrade, selectedTopic, questionsCount, seed]);

  const handlePrint = () => {
    // Elegant native printable support
    const printWindow = window.print;
    if (typeof printWindow === 'function') {
      printWindow();
    }
  };

  const generatePDFMock = () => {
    // Highly robust simulated PDF downloader
    const fileContent = JSON.stringify({
      title: worksheetTitle,
      grade: selectedGrade,
      topic: selectedTopic,
      questions: questions.map(q => ({
        id: q.id,
        q: q.questionStr,
        formula: q.mathContent,
        solution: q.answerKey
      }))
    }, null, 2);

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `K5_Worksheet_Set_${seed}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto" id="k5worksheets_section">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side Parameters Pane */}
        <div className="space-y-6 lg:col-span-1 bg-brand-surface/40 p-6 md:p-8 rounded-[2rem] border border-brand-border/50 backdrop-blur-md sticky top-24">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={11} /> K5 Worksheet Studio
            </span>
            <h3 className="text-xl font-bold text-brand-text">Worksheet Studio</h3>
            <p className="text-brand-text-secondary text-xs font-light leading-relaxed">
              Generate infinite, randomly parameterised high-contrast physical math worksheets suitable for K-5 and middle schoolers.
            </p>
          </div>

          <hr className="border-brand-border/40" />

          {/* Grade selection */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Target Grade</label>
            <div className="grid grid-cols-4 gap-2">
              {GRADE_LEVELS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  title={g.label}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedGrade === g.id 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                      : 'bg-brand-bg/40 border-brand-border hover:bg-brand-surface text-brand-text-secondary'
                  }`}
                >
                  {g.id}
                </button>
              ))}
            </div>
          </div>

          {/* Topic selections */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Syllabus Topic</label>
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-3 text-xs focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer appearance-none font-medium"
              >
                {TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Equations</label>
              <input 
                type="number"
                min={1}
                max={25}
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Math.min(25, Math.max(1, parseInt(e.target.value) || 5)))}
                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Random Seed</label>
              <div className="flex gap-1.5">
                <input 
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 999) + 1)}
                  className="px-3 bg-brand-bg hover:bg-brand-surface border border-brand-border rounded-xl text-[10px] text-brand-text-secondary"
                  title="Shuffle Seed"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic checkbox switches */}
          <div className="space-y-3.5 pt-4 border-t border-brand-border/30">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-bold block">Grid Workspace</span>
                <span className="text-[10px] text-brand-text-secondary">Shows aligned math ledger lines for students</span>
              </div>
              <button
                onClick={() => setShowGridWorkspace(!showGridWorkspace)}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  showGridWorkspace ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showGridWorkspace ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-text font-bold block">Reveal Answer Key</span>
                <span className="text-[10px] text-brand-text-secondary">Highlight complete step parameters inline</span>
              </div>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors duration-200 ${
                  showAnswerKey ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showAnswerKey ? 'translate-x-[1.2rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-brand-border/30">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary/95 text-brand-bg rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-primary/10"
            >
              <Printer size={13} /> Print Worksheet
            </button>
            <button
              onClick={generatePDFMock}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Download size={13} /> Export JSON / PDF Snapshot
            </button>
          </div>

        </div>

        {/* Right Side Worksheet Preview Parchment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Printable parchment wrapper */}
          <div 
            className="bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden" 
            style={{ fontFamily: '"Georgia", serif' }}
            id="printable-k5-paper"
          >
            {/* Real aesthetic design: K5 grade header layout format */}
            <div className="border-b-2 border-zinc-400 pb-6 mb-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-sans font-black">Grade School Academics Sandbox</h4>
                  <h2 className="text-3xl font-serif font-extrabold text-zinc-900">{worksheetTitle}</h2>
                </div>
                <div className="text-xs text-zinc-600 space-y-1 font-sans text-right">
                  <p><strong>Name:</strong> ____________________________________</p>
                  <p><strong>Date:</strong> ____________________ <strong>Score:</strong> ______</p>
                </div>
              </div>
            </div>

            {/* Rendered dynamic list of problems */}
            <div className="space-y-10">
              {questions.map((item, index) => (
                <div key={item.id} className="space-y-3 print:break-inside-avoid">
                  <div className="flex items-start gap-4">
                    <span className="font-sans font-bold text-sm text-zinc-600 bg-zinc-200/60 px-2.5 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-[15px] font-medium leading-relaxed font-serif text-zinc-800">
                        {item.questionStr}
                      </p>
                      
                      {item.mathContent && (
                        <div className="py-2 overflow-x-auto text-xl font-serif font-black tracking-wide text-zinc-805">
                          <Latex>{`$$ ${item.mathContent} $$`}</Latex>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid Lines Workspace for students to calculate inside */}
                  {showGridWorkspace && !showAnswerKey && (
                    <div 
                      className="w-full rounded-xl border border-zinc-300 opacity-60 overflow-hidden bg-zinc-100"
                      style={{ 
                        height: `${item.blankSpaceLines * 30}px`,
                        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '100% 30px'
                      }}
                    />
                  )}

                  {/* Highlighted answer key */}
                  {showAnswerKey && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-indigo-50 rounded-xl border border-indigo-150 space-y-1 font-sans"
                    >
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block font-sans">Model Answer & Steps</span>
                      <div className="text-sm font-serif font-bold text-indigo-900 leading-relaxed overflow-x-auto scrollbar-none">
                        <Latex>{`$ \\text{Value: } ${item.answerKey} $`}</Latex>
                      </div>
                      {item.stepDetails && (
                        <div className="text-xs text-zinc-600 leading-relaxed italic font-serif opacity-90 overflow-x-auto scrollbar-none">
                          <Latex>{`$ ${item.stepDetails} $`}</Latex>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Small Footer Notice */}
            <div className="mt-12 pt-6 border-t border-zinc-300 flex justify-between items-center text-[10px] text-zinc-500 font-sans uppercase tracking-wider">
              <span>Sandbox K5 Worksheets Suite</span>
              <span>Generated in environment seed {seed}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default K5Worksheets;
