import { LifeBuoy, MessageCircle, Mail, Book, Wrench } from 'lucide-react';

const SupportHub = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-primary/10 text-brand-primary rounded-full mb-4">
                    <LifeBuoy size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Support Hub</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    Need help with the calculator suite? We've got resources and direct contacts to get you moving.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* FAQ / Docs */}
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border hover:border-brand-primary/30 transition-all shadow-lg group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Book size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Documentation</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-6">
                        Browse our extensive guides on how to use advanced features, format complex equations, and trigger the AI assistant correctly.
                    </p>
                    <button className="text-blue-500 font-bold hover:text-blue-400">View Documentation →</button>
                </div>

                {/* Troubleshooting */}
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border hover:border-brand-accent/30 transition-all shadow-lg group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl group-hover:scale-110 transition-transform">
                            <Wrench size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Troubleshooting</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-6">
                        Having issues with graph rendering, history sync, or AI processing? Check our common technical troubleshooting steps.
                    </p>
                    <button className="text-brand-accent font-bold hover:text-brand-accent/80">View Common Fixes →</button>
                </div>

                {/* Community */}
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border hover:border-purple-500/30 transition-all shadow-lg group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                            <MessageCircle size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Community Forum</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-6">
                        Join other students, developers, and educators. Share your custom formulas, ask for math help, or report bugs.
                    </p>
                    <button className="text-purple-500 font-bold hover:text-purple-400">Join the Discussion →</button>
                </div>

                {/* Direct Contact */}
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border hover:border-emerald-500/30 transition-all shadow-lg group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Mail size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Contact Support</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-6">
                        Need account assistance or have a private inquiry? Send our support team a direct message for prioritized handling.
                    </p>
                    <button className="text-emerald-500 font-bold hover:text-emerald-400">Email Us →</button>
                </div>
            </div>
            
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-brand-text">Status Map</h3>
                    <p className="text-sm text-brand-text-secondary">Check the operational status of our AI APIs, cloud sync endpoints, and database.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-brand-surface rounded-2xl border border-brand-border shadow-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold tracking-widest text-brand-text text-sm uppercase">All Systems Operational</span>
                </div>
            </div>
        </div>
    );
};

export default SupportHub;
