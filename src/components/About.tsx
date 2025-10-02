
import React from 'react';
import { Info, BrainCircuit, Layers, GitBranch } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-brand-surface/50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-brand-accent flex items-center gap-2">
            <Icon size={22} />
            {title}
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-brand-text-secondary space-y-4">
            {children}
        </div>
    </div>
);

const About: React.FC = () => {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-brand-primary tracking-tight">About QuantumCalc</h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-brand-text-secondary">
                    A modern, feature-rich calculator designed for a wide range of mathematical and practical tasks.
                </p>
            </div>
            <div className="space-y-8">
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
