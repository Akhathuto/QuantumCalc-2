import React from 'react';
import { Book, ChevronRight, Calculator, Activity, BrainCircuit } from 'lucide-react';

const Documentation = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 text-blue-500 rounded-full mb-4">
                    <Book size={48} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-text tracking-tighter italic">Documentation</h1>
                <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto font-light">
                    Learn how to leverage the full power of QuantumCalc, from basic arithmetic to AI-powered mathematical analysis.
                </p>
            </div>

            <div className="space-y-10">
                <section className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 md:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl shadow-inner">
                            <Calculator size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Basic Operations</h2>
                    </div>
                    <div className="space-y-6 text-brand-text-secondary font-medium text-lg leading-relaxed">
                        <p>Our unified calculator uses a standard mathematical parser. You can enter expressions naturally:</p>
                        <ul className="list-disc list-inside space-y-4 ml-2">
                            <li><strong>Arithmetic:</strong> <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">2 + 2 * (3 - 1)</code></li>
                            <li><strong>Functions:</strong> <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">sin(45 deg)</code> or <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">sqrt(16)</code></li>
                            <li><strong>Constants:</strong> <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">pi * r^2</code></li>
                        </ul>
                    </div>
                </section>

                <section className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 md:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-brand-accent/10 text-brand-accent rounded-2xl shadow-inner">
                            <Activity size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Graphing Capabilities</h2>
                    </div>
                    <div className="space-y-6 text-brand-text-secondary font-medium text-lg leading-relaxed">
                        <p>The graphing module allows plotting multiple functions simultaneously:</p>
                        <ul className="list-disc list-inside space-y-4 ml-2">
                            <li>Enter functions in terms of <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">x</code> (e.g., <code className="bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-lg text-brand-text font-mono text-sm shadow-inner">x^2 + 2x - 1</code>).</li>
                            <li>Use the zoom controls or mouse wheel to adjust the viewport.</li>
                            <li>Click on intersections and intercepts to see exact coordinates.</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 md:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl shadow-inner">
                            <BrainCircuit size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">AI Assistance</h2>
                    </div>
                    <div className="space-y-6 text-brand-text-secondary font-medium text-lg leading-relaxed">
                        <p>QuantumCalc is deeply integrated with Gemini AI for conceptual help:</p>
                        <ul className="list-disc list-inside space-y-4 ml-2">
                            <li><strong>Formula Explanations:</strong> Click the AI sparkle icon next to any history item to get a step-by-step breakdown.</li>
                            <li><strong>Worksheet Generation:</strong> Navigate to the K-5 Worksheets tab and let AI generate practice problems for you.</li>
                            <li><strong>General Math Queries:</strong> Use the floating AI assistant for concept explanations and hints.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Documentation;
