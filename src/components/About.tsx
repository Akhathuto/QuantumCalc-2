
import React from 'react';
import { Info, BrainCircuit, Layers, GitBranch, Globe } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-brand-surface/30 backdrop-blur-md p-10 rounded-[2.5rem] border border-brand-border/60 group hover:border-brand-primary/40 transition-all duration-500">
        <h3 className="text-2xl font-black mb-8 text-brand-text flex items-center gap-4 tracking-tighter italic">
            <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:rotate-6 transition-transform">
                <Icon size={24} />
            </div>
            {title}
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-brand-text-secondary/80 leading-relaxed space-y-6 font-light">
            {children}
        </div>
    </div>
);

const About: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-20 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 mx-auto">
                    <Info size={14} /> Intelligence Core
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-brand-text tracking-tighter leading-none italic">
                    About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">QuantumCalc</span>
                </h2>
                <p className="max-w-2xl mx-auto text-xl text-brand-text-secondary font-light">
                    A hyper-advanced, modular intelligence suite designed for the next generation of engineers, students, and architects.
                </p>
                <div className="h-px w-24 bg-brand-primary/40 mx-auto mt-12" />
            </div>

            <div className="space-y-12">
                <Section title="The Vision: EDGTEC" icon={Globe}>
                    <p className="text-lg">
                        <strong className="text-brand-primary">EDGTEC</strong> is the parent architecture behind QuantumCalc. Engineered in South Africa, EDGTEC is a <strong className="text-brand-text">100% black youth-owned enterprise</strong> focused on breaking scientific boundaries.
                    </p>
                    <p>
                        We are a collective of digital architects, data scientists, and creative engineers. We believe that computation should be a seamless extension of human intent—a partnership that amplifies creativity and accelerates discovery.
                    </p>
                    <div className="mt-8 bg-brand-bg/50 p-6 rounded-3xl border border-brand-border/60 shadow-inner">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-6">Core Registry</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <span className="block text-[10px] text-brand-text-secondary uppercase tracking-widest opacity-50">Entity</span>
                                <span className="block font-black text-brand-text text-xs">EDGTEC</span>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-[10px] text-brand-text-secondary uppercase tracking-widest opacity-50">Registration</span>
                                <span className="block font-black text-brand-text text-xs">2025/534716/07</span>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-[10px] text-brand-text-secondary uppercase tracking-widest opacity-50">Network ID</span>
                                <span className="block font-black text-brand-text text-xs">MAAA1626554</span>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Our Mission" icon={Info}>
                    <p>
                        QuantumCalc aims to be a comprehensive and intuitive tool for students, professionals, and enthusiasts. We provide a suite of powerful calculators in a clean, modern interface, moving beyond simple arithmetic to support complex mathematical operations, data visualization, and practical everyday calculations.
                    </p>
                    <p>
                        Our integration with the Gemini API for the "Formula Explorer" is a step towards making learning interactive and accessible, providing explanations for mathematical functions as you use them.
                    </p>
                </Section>

                <Section title="Core Features" icon={Layers}>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Scientific Calculator:</strong> A powerful calculator with memory functions, angle modes, and a wide array of scientific functions. Features an AI-powered "Formula Explorer" to explain mathematical concepts.
                        </li>
                        <li>
                            <strong>Graphing & Charting:</strong> Visualize data with a function plotter, scatter plots, bar charts, and pie charts.
                        </li>
                        <li>
                            <strong>Advanced Math Tools:</strong> Includes dedicated modules for Matrix operations, Statistical analysis, and solving Linear/Quadratic Equations.
                        </li>
                        <li>
                            <strong>Versatile Converters:</strong> A collection of converters for Units (Length, Mass, etc.), Currency (with live exchange rates), Percentages, and Number Bases.
                        </li>
                         <li>
                            <strong>Financial Calculators:</strong> Tools for calculating loan payments, compound interest, and more to assist with financial planning.
                        </li>
                        <li>
                            <strong>Utility Calculators:</strong> Practical tools for Date calculations, and Health metrics like BMI and BMR.
                        </li>
                    </ul>
                </Section>

                <Section title="Technology Stack" icon={BrainCircuit}>
                     <p>
                        QuantumCalc is built using a modern frontend stack to ensure a fast, responsive, and reliable user experience.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Framework:</strong> React with TypeScript</li>
                        <li><strong>Styling:</strong> Tailwind CSS</li>
                        <li><strong>Charting:</strong> Recharts</li>
                        <li><strong>Math Engine:</strong> math.js</li>
                        <li><strong>AI Integration:</strong> Google Gemini API</li>
                    </ul>
                </Section>
                
                <Section title="Open Source" icon={GitBranch}>
                    <p>
                        This project is open source and available under the MIT License. We encourage you to explore the code, report issues, and contribute to its development. You can find the source code and license details in the "Terms & License" section.
                    </p>
                </Section>
            </div>
        </div>
    );
};

export default About;
