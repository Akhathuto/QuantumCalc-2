import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, Award } from 'lucide-react';
import { ELEMENTS } from './PeriodicTableData';

interface Question {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export const ChemistryQuiz = () => {
    const [quizActive, setQuizActive] = useState(false);
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const generateQuestions = () => {
        const generated: Question[] = [];
        const shuffled = [...ELEMENTS].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < 5; i++) {
            const target = shuffled[i % shuffled.length];
            const type = i % 4; // 4 different types of questions
            
            let questionText = '';
            let correctAnswer = '';
            let explanation = '';
            let options: string[] = [];

            if (type === 0) {
                questionText = `Which element has the chemical symbol "${target.symbol}"?`;
                correctAnswer = target.name;
                explanation = `${target.name} is represented by the symbol "${target.symbol}". It has atomic number ${target.number}.`;
                
                const wrongOptions = ELEMENTS
                    .filter(e => e.symbol !== target.symbol)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(e => e.name);
                options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
            } else if (type === 1) {
                questionText = `What is the atomic number of ${target.name}?`;
                correctAnswer = String(target.number);
                explanation = `${target.name} has the atomic number ${target.number}, meaning its nucleus contains ${target.number} proton(s).`;
                
                const wrongOptions = ELEMENTS
                    .filter(e => e.number !== target.number)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(e => String(e.number));
                options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
            } else if (type === 2) {
                questionText = `Which of these categories does ${target.name} (${target.symbol}) belong to?`;
                correctAnswer = target.category;
                explanation = `${target.name} is classified under the "${target.category}" category in the periodic table.`;
                
                const uniqueCategories = Array.from(new Set(ELEMENTS.map(e => e.category)));
                const wrongOptions = uniqueCategories
                    .filter(c => c !== target.category)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
            } else {
                // Electronegativity comparison
                const candidateSubset = ELEMENTS.filter(e => e.electronegativity !== null).sort(() => 0.5 - Math.random()).slice(0, 4);
                const sorted = [...candidateSubset].sort((a, b) => (b.electronegativity || 0) - (a.electronegativity || 0));
                const winner = sorted[0];
                
                questionText = `Which of the following elements has the HIGHEST electronegativity?`;
                correctAnswer = winner.name;
                explanation = `${winner.name} has a high electronegativity of ${winner.electronegativity} on the Pauling scale, drawing electrons strongly toward itself.`;
                options = candidateSubset.map(e => e.name);
            }
            
            generated.push({
                question: questionText,
                options,
                answer: correctAnswer,
                explanation
            });
        }
        return generated;
    };

    const startQuiz = () => {
        const qList = generateQuestions();
        setQuestions(qList);
        setScore(0);
        setQuestionIndex(0);
        setSelectedOption(null);
        setAnswered(false);
        setQuizActive(true);
    };

    const handleAnswerSelect = (option: string) => {
        if (answered) return;
        setSelectedOption(option);
        setAnswered(true);
        if (option === questions[questionIndex].answer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setAnswered(false);
        setQuestionIndex(prev => prev + 1);
    };

    const currentQuestion = questions[questionIndex];

    return (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group min-h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            {!quizActive ? (
                <div className="text-center py-8 my-auto space-y-5">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-brand-primary/20">
                        <HelpCircle className="text-brand-primary animate-bounce-slow" size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg text-brand-text uppercase tracking-tight">Atomic Trivia Academy</h4>
                        <p className="text-xs text-brand-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed">
                            Test your chemistry skills with procedurally generated quizzes on symbols, categories, trends, and numbers!
                        </p>
                    </div>
                    <button 
                        onClick={startQuiz}
                        className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(66,153,225,0.4)] transition-all active:scale-95 text-xs mx-auto flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Start Training
                    </button>
                </div>
            ) : questionIndex < questions.length ? (
                <div className="space-y-4 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-primary mb-3">
                            <span>Question {questionIndex + 1} of {questions.length}</span>
                            <span className="bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">Score: {score}</span>
                        </div>
                        <h5 className="font-bold text-brand-text text-sm leading-relaxed mb-4">{currentQuestion.question}</h5>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {currentQuestion.options.map((opt, idx) => {
                                let btnStyle = "border-brand-border hover:border-brand-primary/40 bg-brand-bg/40 text-brand-text";
                                if (answered) {
                                    if (opt === currentQuestion.answer) {
                                        btnStyle = "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
                                    } else if (opt === selectedOption) {
                                        btnStyle = "bg-red-500/10 border-red-500 text-red-500";
                                    } else {
                                        btnStyle = "border-brand-border opacity-55";
                                    }
                                }
                                return (
                                    <button
                                        key={idx}
                                        disabled={answered}
                                        onClick={() => handleAnswerSelect(opt)}
                                        className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                                    >
                                        <span>{opt}</span>
                                        {answered && opt === currentQuestion.answer && <CheckCircle2 size={14} className="shrink-0" />}
                                        {answered && opt === selectedOption && opt !== currentQuestion.answer && <XCircle size={14} className="shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence>
                        {answered && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 bg-brand-bg/60 border border-brand-border rounded-xl space-y-3"
                            >
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0 mt-0.5">
                                        <Info size={12} />
                                    </div>
                                    <p className="text-[10px] text-brand-text-secondary leading-normal font-medium italic">
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full bg-brand-primary text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                                >
                                    {questionIndex === questions.length - 1 ? "View Results" : "Next Question"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-6 my-auto space-y-5">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                        <Award className="text-amber-500 animate-bounce-slow" size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg text-brand-text uppercase tracking-tight">Training Complete!</h4>
                        <p className="text-xs text-brand-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed">
                            You scored <span className="text-brand-primary font-black text-sm">{score} out of {questions.length}</span>.
                            {score === questions.length ? " Absolute flawless mastery!" : " Great practice session. Keep refining your elemental recall!"}
                        </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button 
                            onClick={startQuiz}
                            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-tighter hover:shadow-md transition-all text-[10px]"
                        >
                            Retake Quiz
                        </button>
                        <button 
                            onClick={() => setQuizActive(false)}
                            className="bg-brand-bg text-brand-text-secondary border border-brand-border px-6 py-2.5 rounded-xl font-black uppercase tracking-tighter hover:text-brand-text transition-all text-[10px]"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
