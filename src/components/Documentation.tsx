import React from 'react';
import { Book, ChevronRight, Calculator, Activity, BrainCircuit } from 'lucide-react';

const Documentation = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 text-blue-500 rounded-full mb-4">
                    <Book size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Documentation</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    Learn how to leverage the full power of QuantumCalc, from basic arithmetic to AI-powered mathematical analysis.
                </p>
            </div>

            <div className="space-y-8">
                <section className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Calculator className="text-brand-primary" size={24} />
                        <h2 className="text-2xl font-bold text-brand-text">Basic Operations</h2>
                    </div>
                    <div className="space-y-4 text-brand-text-secondary">
                        <p>Our unified calculator uses a standard mathematical parser. You can enter expressions naturally:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Arithmetic:</strong> <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">2 + 2 * (3 - 1)</code></li>
                            <li><strong>Functions:</strong> <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">sin(45 deg)</code> or <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">sqrt(16)</code></li>
                            <li><strong>Constants:</strong> <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">pi * r^2</code></li>
                        </ul>
                    </div>
                </section>

                <section className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-brand-accent" size={24} />
                        <h2 className="text-2xl font-bold text-brand-text">Graphing Capabilities</h2>
                    </div>
                    <div className="space-y-4 text-brand-text-secondary">
                        <p>The graphing module allows plotting multiple functions simultaneously:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Enter functions in terms of <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">x</code> (e.g., <code className="bg-brand-bg px-2 py-1 rounded text-brand-text">x^2 + 2x - 1</code>).</li>
                            <li>Use the zoom controls or mouse wheel to adjust the viewport.</li>
                            <li>Click on intersections and intercepts to see exact coordinates.</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BrainCircuit className="text-purple-500" size={24} />
                        <h2 className="text-2xl font-bold text-brand-text">AI Assistance</h2>
                    </div>
                    <div className="space-y-4 text-brand-text-secondary">
                        <p>QuantumCalc is deeply integrated with Gemini AI for conceptual help:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
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
