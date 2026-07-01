import { LifeBuoy, MessageCircle, Mail, Book, Wrench } from 'lucide-react';
import { AppTab } from '../types';

interface SupportHubProps {
    onNavigate: (tab: AppTab) => void;
}

const SupportHub = ({ onNavigate }: SupportHubProps) => {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-16 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-primary/10 text-brand-primary rounded-full mb-4">
                    <LifeBuoy size={48} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-text tracking-tight italic">Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span></h1>
                <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto font-light">
                    Need help with the calculator suite? We've got resources and direct contacts to get you moving.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* FAQ / Docs */}
                <div className="bg-brand-surface/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-brand-border hover:border-blue-500/30 transition-all shadow-xl group cursor-pointer relative overflow-hidden" onClick={() => onNavigate('docs')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                            <Book size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Documentation</h2>
                    </div>
                    <p className="text-brand-text-secondary font-medium leading-relaxed mb-8">
                        Browse our extensive guides on how to use advanced features, format complex equations, and trigger the AI assistant correctly.
                    </p>
                    <button className="text-blue-500 font-bold uppercase tracking-widest text-[10px] hover:text-blue-400 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">View Documentation →</button>
                </div>

                {/* Troubleshooting */}
                <div className="bg-brand-surface/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-brand-border hover:border-brand-accent/30 transition-all shadow-xl group cursor-pointer relative overflow-hidden" onClick={() => onNavigate('troubleshooting')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl group-hover:bg-brand-accent/10 transition-colors pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-brand-accent/10 text-brand-accent rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                            <Wrench size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Troubleshooting</h2>
                    </div>
                    <p className="text-brand-text-secondary font-medium leading-relaxed mb-8">
                        Having issues with graph rendering, history sync, or AI processing? Check our common technical troubleshooting steps.
                    </p>
                    <button className="text-brand-accent font-bold uppercase tracking-widest text-[10px] hover:text-brand-accent/80 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">View Common Fixes →</button>
                </div>

                {/* Community */}
                <div className="bg-brand-surface/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-brand-border hover:border-purple-500/30 transition-all shadow-xl group cursor-pointer relative overflow-hidden" onClick={() => onNavigate('community')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                            <MessageCircle size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Community Forum</h2>
                    </div>
                    <p className="text-brand-text-secondary font-medium leading-relaxed mb-8">
                        Join other students, developers, and educators. Share your custom formulas, ask for math help, or report bugs.
                    </p>
                    <button className="text-purple-500 font-bold uppercase tracking-widest text-[10px] hover:text-purple-400 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">Join the Discussion →</button>
                </div>

                {/* Direct Contact */}
                <div className="bg-brand-surface/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-brand-border hover:border-emerald-500/30 transition-all shadow-xl group cursor-pointer relative overflow-hidden" onClick={() => onNavigate('contact')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                            <Mail size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-brand-text tracking-tighter">Contact Support</h2>
                    </div>
                    <p className="text-brand-text-secondary font-medium leading-relaxed mb-8">
                        Need account assistance or have a private inquiry? Send our support team a direct message for prioritized handling.
                    </p>
                    <button className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] hover:text-emerald-400 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">Email Us →</button>
                </div>
            </div>
            
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                <div className="flex-1 space-y-3">
                    <h3 className="text-3xl font-black text-brand-text tracking-tighter">System Status Map</h3>
                    <p className="text-lg text-brand-text-secondary font-light">Check the operational status of our AI APIs, cloud sync endpoints, and database routing.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-brand-surface rounded-2xl border border-brand-border shadow-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold tracking-[0.2em] text-brand-text text-[10px] uppercase">All Systems Operational</span>
                </div>
            </div>
        </div>
    );
};

export default SupportHub;
