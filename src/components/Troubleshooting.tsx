import React from 'react';
import { Wrench, AlertTriangle, RefreshCw, Database } from 'lucide-react';

const Troubleshooting = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-accent/10 text-brand-accent rounded-full mb-4">
                    <Wrench size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Troubleshooting</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    Common issues and their solutions. Get back to calculating quickly.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-brand-surface/50 border border-brand-border rounded-2xl p-6 flex gap-4 items-start shadow-sm hover:border-brand-accent/30 transition-colors">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl mt-1 shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text mb-2">Calculator Returns "Syntax Error"</h3>
                        <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
                            Ensure you are explicitly defining multiplication between variables and numbers. For example, instead of <code className="bg-brand-bg px-1 rounded">2x</code>, use <code className="bg-brand-bg px-1 rounded">2*x</code>. Also check for mismatched parentheses.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-surface/50 border border-brand-border rounded-2xl p-6 flex gap-4 items-start shadow-sm hover:border-brand-accent/30 transition-colors">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl mt-1 shrink-0">
                        <RefreshCw size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text mb-2">AI Explanations Are Failing</h3>
                        <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
                            The Gemini API might be rate-limiting requests or the environment API key is not set correctly. Try waiting 60 seconds and trying again. If you are self-hosting, ensure your <code className="bg-brand-bg px-1 rounded">GEMINI_API_KEY</code> is valid.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-surface/50 border border-brand-border rounded-2xl p-6 flex gap-4 items-start shadow-sm hover:border-brand-accent/30 transition-colors">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl mt-1 shrink-0">
                        <Database size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text mb-2">History Not Syncing Across Devices</h3>
                        <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
                            History synchronization requires you to be logged in. Ensure you see your profile icon in the header. If you are offline, calculations will be saved locally and synced once a connection is re-established.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-3xl p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-brand-accent">Still stuck?</h3>
                <p className="text-brand-text-secondary">If none of these solutions work, try clearing your browser cache or performing a hard reload.</p>
                <div className="pt-4">
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand-accent text-brand-bg rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                        Reload Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Troubleshooting;
