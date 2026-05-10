import { Shield, Lock, Eye, Server, UserCheck } from 'lucide-react';

const PrivacyProtocol = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-brand-primary/10 text-brand-primary rounded-full mb-4">
                    <Shield size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Privacy Protocol</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    We take your privacy seriously. Here is how we handle and protect your data.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Local-First Architecture</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed">
                        By default, all your mathematical operations, history, and generated models are processed locally in your browser. We do not transmit your basic computing data to external servers. If you choose to log in and sync, your data is securely stored and encrypted in transit to our unified cloud infrastructure.
                    </p>
                </div>

                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <UserCheck size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Data Usage</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed">
                        The data we collect when you use cloud sync is strictly used to provide the service (e.g., cross-device history viewing). We do not sell, rent, or trade your personal information with third parties for their commercial purposes.
                    </p>
                </div>

                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                            <Server size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">AI Integration Transparency</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed">
                        When using AI-powered features (like the Smart Assistant or Formula Explorer), your prompt string is securely transmitted to Google's Gemini API to generate the response. If you provide your own API key, it is stored only in your browser's local storage and never touches our servers.
                    </p>
                </div>

                <div className="bg-brand-surface/50 p-8 rounded-3xl border border-brand-border shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                            <Eye size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text">Your Rights</h2>
                    </div>
                    <p className="text-brand-text-secondary leading-relaxed mb-4">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-text-secondary">
                        <li>Access the personal data we hold about you.</li>
                        <li>Request deletion of your data via the settings menu.</li>
                        <li>Opt-out of cloud sync and use the app entirely offline/locally.</li>
                    </ul>
                </div>
            </div>
            
            <div className="text-center pt-8 border-t border-brand-border text-sm text-brand-text-secondary">
                Last Updated: May 2026
            </div>
        </div>
    );
};

export default PrivacyProtocol;
