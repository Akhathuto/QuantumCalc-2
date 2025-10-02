import React from 'react';
import { Shield, FileText } from 'lucide-react';

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

const TermsAndLicense: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Terms of Use & License</h2>
            <div className="space-y-8">
                <Section title="Terms of Use" icon={Shield}>
                    <p>
                        Welcome to QuantumCalc. This application is provided as-is, without any warranties or guarantees of any kind.
                    </p>
                    <p>
                        The calculators and tools provided here are intended for informational and educational purposes only. They are not a substitute for professional financial, medical, or legal advice. While we strive for accuracy, we cannot guarantee that the calculations are free from errors or suitable for your specific needs.
                    </p>
                    <p>
                        By using this application, you agree that the creators and maintainers are not liable for any damages or losses arising from your use of, or reliance on, the information provided. Always verify critical calculations with a qualified professional.
                    </p>
                </Section>

                <Section title="MIT License" icon={FileText}>
                    <p>Copyright (c) 2024 EDGTEC</p>
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