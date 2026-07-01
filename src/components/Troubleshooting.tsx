import React from 'react';
import { Wrench, AlertTriangle, RefreshCw, Database } from 'lucide-react';

const Troubleshooting = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-accent/10 text-brand-accent rounded-full mb-4">
                    <Wrench size={48} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-text tracking-tighter italic">Troubleshooting</h1>
                <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto font-light">
                    Common issues and their solutions. Get back to calculating quickly.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-6 items-start shadow-xl hover:border-brand-accent/30 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text tracking-tighter mb-4">Calculator Returns "Syntax Error"</h3>
                        <p className="text-brand-text-secondary text-base font-medium leading-relaxed mb-4">
                            Ensure you are explicitly defining multiplication between variables and numbers. For example, instead of <code className="bg-brand-bg/80 border border-brand-border px-2 py-1 rounded text-brand-text shadow-inner">2x</code>, use <code className="bg-brand-bg/80 border border-brand-border px-2 py-1 rounded text-brand-text shadow-inner">2*x</code>. Also check for mismatched parentheses.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-6 items-start shadow-xl hover:border-brand-accent/30 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text tracking-tighter mb-4">AI Explanations Are Failing</h3>
                        <p className="text-brand-text-secondary text-base font-medium leading-relaxed mb-4">
                            The Gemini API might be rate-limiting requests or the environment API key is not set correctly. Try waiting 60 seconds and trying again. If you are self-hosting, ensure your <code className="bg-brand-bg/80 border border-brand-border px-2 py-1 rounded text-brand-text shadow-inner">GEMINI_API_KEY</code> is valid.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-6 items-start shadow-xl hover:border-brand-accent/30 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text tracking-tighter mb-4">History Not Syncing Across Devices</h3>
                        <p className="text-brand-text-secondary text-base font-medium leading-relaxed mb-4">
                            History synchronization requires you to be logged in. Ensure you see your profile icon in the header. If you are offline, calculations will be saved locally and synced once a connection is re-established.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-[3rem] p-12 text-center space-y-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
                <h3 className="text-4xl font-black text-brand-accent tracking-tighter italic relative z-10">Still stuck?</h3>
                <p className="text-xl text-brand-text-secondary font-light relative z-10 max-w-2xl mx-auto">If none of these solutions work, try clearing your browser cache or performing a hard reload.</p>
                <div className="pt-6 relative z-10">
                    <button onClick={() => window.location.reload()} className="px-8 py-4 bg-brand-accent text-brand-bg rounded-2xl font-black tracking-widest uppercase text-xs hover:opacity-90 transition-opacity shadow-2xl hover:scale-105 active:scale-95">
                        Reload Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Troubleshooting;
