import { FileBadge, Scale, Copy, BookOpen } from 'lucide-react';

const CoreLicense = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-secondary/10 text-brand-secondary rounded-full mb-4">
                    <FileBadge size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Core License</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    Terms for usage, distribution, and modification of our core tools.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                            <Scale size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">End User License Agreement</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        By deploying or using this software, you agree to the conditions of this core license. This software is provided "as is", without warranty of any kind, express or implied.
                    </p>
                    <p className="text-brand-text-secondary leading-relaxed">
                        In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from, out of, or in connection with the software.
                    </p>
                </div>

                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                            <Copy size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Usage Limits & Restrictions</h2>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-brand-text-secondary">
                        <li>You may use the Application for personal, educational, or commercial purposes.</li>
                        <li>You may not attempt to reverse engineer or extract source code from compiled production builds.</li>
                        <li>Automated scraping or abusive querying of the Application's API endpoints is strictly prohibited and will result in a ban.</li>
                    </ul>
                </div>

                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Open Source Attributes</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed">
                        Portions of this software draw upon community open-source libraries (e.g., React, Tailwind CSS, Lucide Icons, Math.js, Recharts). We respect and adhere to their respective MIT/Apache licenses. Note that the core proprietary AI integration layers belong to Google DeepMind contexts via the Gemini API when invoked.
                    </p>
                </div>

            </div>
            
            <div className="text-center pt-8 border-t border-brand-border text-sm text-brand-text-secondary">
                Last Updated: May 2026
            </div>
        </div>
    );
};

export default CoreLicense;
