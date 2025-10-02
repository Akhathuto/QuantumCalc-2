import React, { useState } from 'react';
import {
    Calculator,
    LineChart,
    BrainCircuit,
    KeyRound,
    HelpCircle,
    ChevronDown,
    Beaker,
    TestTube,
    Landmark,
    HeartPulse,
    Calendar
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
        <div className="border-b border-brand-border last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-brand-surface/50 focus:outline-none focus:bg-brand-surface/50"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-3 font-semibold text-lg text-brand-text">
                    <Icon size={20} className="text-brand-primary" />
                    {title}
                </span>
                <ChevronDown size={20} className={`text-brand-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-brand-text-secondary prose prose-invert prose-sm max-w-none">
                    {children}
                </div>
            )}
        </div>
    );
};


const Help: React.FC = () => {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-brand-primary tracking-tight">Help & FAQ</h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-brand-text-secondary">
                    Your guide to getting the most out of QuantumCalc.
                </p>
            </div>
            <div className="bg-brand-surface/50 rounded-lg max-w-4xl mx-auto">
                <AccordionItem title="Frequently Asked Questions" icon={HelpCircle} startOpen={true}>
                    <h4>How do the AI features like Formula Explorer work?</h4>
                    <p>
                        The AI features are powered by Google's Gemini API. They are enabled by default if the application is configured correctly by the administrator. There's no need for you to provide an API key. Simply perform a calculation using a scientific function (like sqrt, sin, log) to see a detailed explanation in the "Formula Explorer" panel on the calculator page.
                    </p>
                    <h4>Is my data private?</h4>
                    <p>
                        Yes. All your data, including calculation history, is stored locally in your browser. It is not uploaded to any server, ensuring your privacy.
                    </p>
                    <h4>How do I see my past calculations?</h4>
                    <p>
                        Navigate to <strong>More &gt; History</strong> to see a list of your recent calculations. You can click on any entry to load it back into the calculator or mark it as a "favorite" to pin it to the top.
                    </p>
                </AccordionItem>
                 <AccordionItem title="Scientific Calculator" icon={Calculator}>
                    <p>
                        The main calculator is a powerful tool with many functions.
                    </p>
                    <ul>
                        <li><strong>Basic Operations:</strong> Use the number pad and operator keys for standard arithmetic.</li>
                        <li><strong>2nd Key:</strong> Press the "2nd" key to access alternate functions shown above the main buttons (e.g., x³ instead of x², asin instead of sin).</li>
                        <li><strong>Memory:</strong> Use the "M" keys to store and recall numbers:
                            <ul>
                                <li><strong>MC:</strong> Memory Clear - sets memory to zero.</li>
                                <li><strong>MR:</strong> Memory Recall - inserts the stored number.</li>
                                <li><strong>M+:</strong> Memory Add - adds the current number to memory.</li>
                                <li><strong>M-:</strong> Memory Subtract - subtracts the current number from memory.</li>
                            </ul>
                        </li>
                        <li><strong>Formula Explorer:</strong> After performing a calculation with a function (like <code>sqrt(16)</code>), the panel on the right will show an AI-generated explanation of the function, its formula, and an example.</li>
                    </ul>
                </AccordionItem>
                <AccordionItem title="Graphing Suite" icon={LineChart}>
                     <p>
                        Visualize data with four different chart types.
                    </p>
                    <ul>
                        <li><strong>Function Plot:</strong> Enter a mathematical expression using "x" as the variable (e.g., <code>sin(x)</code> or <code>x^3 - 2x</code>). Adjust the X-axis range as needed.</li>
                        <li><strong>Scatter Plot:</strong> Input data points with one X,Y pair per line. You can separate values with a comma, space, or semicolon (e.g., <code>1, 5</code> or <code>2; 8</code>).</li>
                        <li><strong>Bar & Pie Charts:</strong> Input categorical data with one label-value pair per line, separated by a comma (e.g., <code>Apples, 50</code>).</li>
                        <li><strong>Exporting:</strong> All charts can be exported as a PNG image using the "Export as PNG" button.</li>
                    </ul>
                </AccordionItem>
                 <AccordionItem title="Math Tools" icon={Beaker}>
                     <ul>
                        <li><strong>Matrix Calculator:</strong> Select a size (2x2 or 3x3), input your values for Matrix A and B, and select an operation to perform.</li>
                        <li><strong>Statistics Calculator:</strong> Enter a list of numbers separated by spaces or commas to get a full statistical analysis, including mean, median, and standard deviation.</li>
                        <li><strong>Equation Solver:</strong> Enter a linear (e.g., <code>2x-10=0</code>) or quadratic (e.g., <code>x^2-4=0</code>) equation to find the value(s) of 'x'. A step-by-step breakdown of the formula used is also provided.</li>
                    </ul>
                </AccordionItem>
                <AccordionItem title="Converters" icon={TestTube}>
                    <p>
                        The app includes a variety of converters for different needs.
                    </p>
                     <ul>
                        <li><strong>Unit/Currency/Base:</strong> Select the 'From' and 'To' units/currencies/bases. As you type in one field, the other will update in real-time.</li>
                        <li><strong>Percentage:</strong> Includes three common percentage calculation types. Simply fill in the blanks in the sentences to get your result.</li>
                    </ul>
                </AccordionItem>
                 <AccordionItem title="Financial, Date & Health" icon={Landmark}>
                    <p>
                        These sections contain specialized calculators for everyday life.
                    </p>
                     <ul>
                        <li><strong>Financial:</strong> Select a calculator type from the dropdown (e.g., Loan, Compound Interest). Fill in the required fields to get a detailed breakdown and, where applicable, a chart visualizing the results over time.</li>
                        <li><strong>Date:</strong> Calculate the duration between two dates or add/subtract a period of time from a specific date.</li>
                        <li><strong>Health:</strong> Calculate your BMI, BMR, and recommended daily calorie intake. You can switch between Metric and Imperial units.</li>
                    </ul>
                </AccordionItem>
            </div>
        </div>
    );
};

export default Help;
