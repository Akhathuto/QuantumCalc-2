import React, { useState } from 'react';
import {
    Calculator,
    LineChart,
    HelpCircle,
    ChevronDown,
    Beaker,
    GraduationCap,
    Code
} from 'lucide-react';

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  startOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon: Icon, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <div className="border border-brand-border rounded-2xl bg-brand-surface/40 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-brand-surface/60 focus:outline-none transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Icon size={22} />
                  </div>
                  <span className="font-bold text-lg text-brand-text">
                      {title}
                  </span>
                </div>
                <ChevronDown size={20} className={`text-brand-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-brand-text-secondary prose prose-invert prose-sm max-w-none text-base leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Help: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono uppercase tracking-widest mb-2">
                    <HelpCircle size={14} /> Knowledge Base
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Help & Documentation</h2>
                <p className="max-w-xl mx-auto text-lg text-brand-text-secondary font-light">
                    Everything you need to master QuantumCalc and unlock its full potential for mathematics, science, and development.
                </p>
            </div>
            
            <div className="space-y-4">
                <AccordionItem title="Getting Started & Cloud Sync" icon={HelpCircle} startOpen={true}>
                    <h4>How do I save my preferences across devices?</h4>
                    <p>
                        QuantumCalc supports <strong>Google Drive integration</strong> for cloud sync! By logging in and opening <strong>Settings</strong>, you can securely sync your profile, active tools, and preferences to your personal Google Drive account. When you use QuantumCalc on another device, just click "Restore from Google Drive" in Settings.
                    </p>
                    <h4>How does History work?</h4>
                    <p>
                        Every calculation you perform is automatically saved to your History. You can access it by clicking the <strong>History</strong> button in the left sidebar. If you are signed in, your History is securely backed up and synced to the cloud. You can click any past calculation to load it back into the calculator, or use the "Star" icon to favorite a calculation for easy access later.
                    </p>
                    <h4>How do the AI features like the Tutor and Formula Explorer work?</h4>
                    <p>
                        QuantumCalc's AI capabilities are powered by advanced language models that interpret your equations and provide step-by-step guidance.
                    </p>
                    <ul>
                      <li>The <strong>Formula Explorer</strong> automatically analyzes scientific functions (like `sin`, `log`, `sqrt`) as you use them in the calculator.</li>
                      <li>The <strong>Nolo AI Tutor</strong> (found in Student Tools) is designed to help you think through problems, rather than just giving you the answer.</li>
                    </ul>
                </AccordionItem>
                
                 <AccordionItem title="Core Engineering Calculator" icon={Calculator}>
                    <p>
                        The primary calculator is an advanced engineering tool designed for both simple and complex expressions.
                    </p>
                    <ul>
                        <li><strong>Basic Operations:</strong> Use the standard numpad and operator keys. It respects standard order of operations (PEMDAS).</li>
                        <li><strong>Alternate Functions (2nd Key):</strong> Press the "2nd" key at the top left to reveal inverse trigonometric functions (asin, acos), hyperbolic functions, and higher-order roots/powers.</li>
                        <li><strong>Memory Register:</strong> Store temporary values using the "M" keys.
                            <ul>
                                <li><strong>MC:</strong> Clear Memory to 0.</li>
                                <li><strong>MR:</strong> Recall Memory into the current expression.</li>
                                <li><strong>M+:</strong> Add the current screen value to the stored memory.</li>
                                <li><strong>M-:</strong> Subtract the current screen value from stored memory.</li>
                            </ul>
                        </li>
                        <li><strong>Expression Engine:</strong> You can type complex inline expressions using the keyboard, such as `2 * (sin(45) + 3)`.</li>
                    </ul>
                </AccordionItem>

                <AccordionItem title="Graphing & Data Visualization" icon={LineChart}>
                     <p>
                        Visualize data comprehensively using our built-in graphing suite.
                    </p>
                    <ul>
                        <li><strong>Function Plotting:</strong> Type a mathematical expression using "x" (e.g., <code>sin(x)</code> or <code>x^2 - 4</code>). You can define a custom domain (X-axis start and end points) and update the graph in real time.</li>
                        <li><strong>Scatter Plots:</strong> Paste or type raw data points (one coordinate pair per line). E.g., <code>1, 5</code> and <code>2, 10</code>. Use a comma, space, or semicolon to separate the X and Y values.</li>
                        <li><strong>Bar & Pie Charts:</strong> Perfect for categorical data. Input a label and a value per line, separated by a comma (e.g., <code>Revenue, 50000</code>).</li>
                        <li><strong>Export:</strong> Click "Export as PNG" to instantly download a high-resolution image of your rendered chart.</li>
                    </ul>
                </AccordionItem>

                 <AccordionItem title="Math Toolset & Equations" icon={Beaker}>
                     <p>
                        A specialized suite for algebra, geometry, statistics, and discrete mathematics.
                     </p>
                     <ul>
                        <li><strong>Matrix Calculator:</strong> Add, multiply, and subtract 2x2 or 3x3 matrices.</li>
                        <li><strong>Statistics:</strong> Enter a space or comma-separated list of numbers to instantly generate Mean, Median, Mode, Standard Deviation, Variance, and Confidence Intervals.</li>
                        <li><strong>Equation Solver:</strong> Type any linear (<code>3x - 12 = 0</code>) or quadratic equation (<code>x^2 + 5x + 6 = 0</code>) to get step-by-step solutions for 'x'.</li>
                        <li><strong>Fractions & Ratios:</strong> Simplifies complex fractions and solves ratio proportions (A/B = C/D).</li>
                        <li><strong>Factors & Primes:</strong> Quickly determine prime factorization, GCF/LCM for up to three numbers, and test specific numbers for primality.</li>
                    </ul>
                </AccordionItem>

                <AccordionItem title="Student & Academic Tools" icon={GraduationCap}>
                    <p>
                        Tools designed strictly for the academic workflow, helping you focus and organize your study materials.
                    </p>
                    <ul>
                        <li><strong>Scratchpad:</strong> A globally accessible notepad! Need to write down a partial answer before solving the rest? Click the <strong>Scratchpad</strong> button anywhere in the app to take quick notes.</li>
                        <li><strong>Periodic Table:</strong> An interactive chemistry reference. Search for elements by name, atomic number, or symbol to view their comprehensive properties (Molar Mass, Electronegativity, etc.).</li>
                        <li><strong>GPA & Grades:</strong> A robust GPA calculator that helps you determine what score you need on your final exam to maintain or hit your target GPA.</li>
                        <li><strong>Pomodoro Timer:</strong> Study effectively using timed intervals (e.g., 25 minutes of work followed by a 5-minute break).</li>
                        <li><strong>Citation Generator:</strong> Generates flawless APA 7th and MLA 9th citations for your research papers.</li>
                        <li><strong>Flashcards:</strong> Create study decks directly in QuantumCalc to review formulas and concepts before an exam.</li>
                    </ul>
                </AccordionItem>

                <AccordionItem title="Developer & Programmer Tools" icon={Code}>
                    <p>
                        Utilities crafted for software engineers, saving you from switching between browser tabs.
                    </p>
                    <ul>
                        <li><strong>Programmer Calculator:</strong> Calculate directly in Hexadecimal, Decimal, Octal, or Binary modes. It fully supports Word Size toggling (8-bit to 64-bit) and Bitwise operations (AND, OR, XOR, shifts).</li>
                        <li><strong>JSON Formatter:</strong> Paste messy JSON to easily minify, beautify, and validate its structure.</li>
                        <li><strong>JWT Decoder:</strong> Paste a JSON Web Token to decode the Header and Payload instantly without sending it over the network.</li>
                        <li><strong>Text & Hash Tools:</strong> Convert text cases (camelCase, snake_case) and generate secure hashes (MD5, SHA-256) locally.</li>
                    </ul>
                </AccordionItem>
            </div>
        </div>
    );
};

export default Help;
