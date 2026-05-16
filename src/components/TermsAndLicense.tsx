import React from 'react';
import { Shield, FileText } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-brand-surface/30 backdrop-blur-md p-10 rounded-[2.5rem] border border-brand-border/60 group hover:border-brand-primary/40 transition-all duration-500">
        <h3 className="text-2xl font-black mb-8 text-brand-text flex items-center gap-4 tracking-tighter italic">
            <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:rotate-6 transition-transform text-brand-primary">
                <Icon size={24} />
            </div>
            {title}
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-brand-text-secondary/80 leading-relaxed space-y-6 font-light">
            {children}
        </div>
    </div>
);

const TermsAndLicense: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        <Shield size={14} /> Legal Framework
                    </div>
                    <h2 className="text-5xl font-black text-brand-text tracking-tighter italic">
                        Terms & <span className="text-brand-secondary">License</span>
                    </h2>
                    <p className="text-brand-text-secondary font-light text-lg mt-2">
                        Review the operational parameters and governance of the QuantumCalc suite.
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                <Section title="Operational Protocols" icon={Shield}>
                    <p className="text-lg text-brand-text">
                        Welcome to QuantumCalc. This architecture is provided <strong className="italic">"as-is"</strong>, without any warranties regarding precision or absolute truth.
                    </p>
                    <p>
                        The tools provided herein are engineered for informational and educational synchronization. They do not constitute professional financial, medical, or legal directives. While the core engines are optimized for high-fidelity computation, architectural anomalies may occur. 
                    </p>
                    <p>
                        Initialization of this software constitutes agreement that EDGTEC and its architects are not liable for any data degradation or systemic errors resulting from reliance on these computations. Always verify mission-critical data with verified human experts.
                    </p>
                </Section>

                <Section title="MIT License" icon={FileText}>
                    <p>Copyright (c) 2024 - 2026 EDGTEC</p>
                    <p>
                        Permission is hereby granted, free of charge, to any person obtaining a copy
                        of this software and associated documentation files (the "Software"), to deal
                        in the Software without restriction, including without limitation the rights
                        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                        copies of the Software, and to permit persons to whom the Software is
                        furnished to do so, subject to the following conditions:
                    </p>
                    <p>
                        The above copyright notice and this permission notice shall be included in all
                        copies or substantial portions of the Software.
                    </p>
                    <p>
                        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                        SOFTWARE.
                    </p>
                </Section>
            </div>
        </div>
    );
};

export default TermsAndLicense;