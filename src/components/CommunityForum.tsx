import React from 'react';
import { MessageCircle, Users, ExternalLink, Hash, ThumbsUp } from 'lucide-react';

const CommunityForum = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-500 rounded-full mb-4">
                    <Users size={48} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-text tracking-tighter italic">Community</h1>
                <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto font-light">
                    Join the QuantumCalc ecosystem. Share worksheets, ask questions, and collaborate with other learners.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-brand-surface/40 backdrop-blur-md border border-[#5865F2]/30 rounded-[2.5rem] p-10 text-center space-y-6 hover:border-[#5865F2]/60 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#5865F2]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#5865F2]/10 transition-colors" />
                    <div className="w-20 h-20 bg-[#5865F2]/10 text-[#5865F2] rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-inner border border-[#5865F2]/20">
                        <MessageCircle size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-brand-text tracking-tighter">Discord Server</h3>
                    <p className="text-brand-text-secondary font-medium leading-relaxed">Join our live chat. Get real-time help and participate in math challenges.</p>
                    <button className="flex items-center justify-center gap-2 mx-auto text-[#5865F2] font-black uppercase tracking-widest text-[10px] mt-6 bg-[#5865F2]/10 px-6 py-3 rounded-xl group-hover:bg-[#5865F2]/20 transition-colors">
                        Join Discord <ExternalLink size={14} />
                    </button>
                </div>

                <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[2.5rem] p-10 text-center space-y-6 hover:border-brand-text/30 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-text/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-text/10 transition-colors" />
                    <div className="w-20 h-20 bg-brand-bg/50 border border-brand-border text-brand-text rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-inner">
                        <Hash size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-brand-text tracking-tighter">GitHub Discussions</h3>
                    <p className="text-brand-text-secondary font-medium leading-relaxed">Propose new features, report bugs, and view the project roadmap.</p>
                    <button className="flex items-center justify-center gap-2 mx-auto text-brand-text font-black uppercase tracking-widest text-[10px] mt-6 bg-brand-bg/50 border border-brand-border px-6 py-3 rounded-xl group-hover:bg-brand-surface transition-colors">
                        View GitHub <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-[3rem] p-10 md:p-14 shadow-xl">
                <h3 className="text-3xl font-black text-brand-text tracking-tighter mb-8">Trending Topics</h3>
                
                <div className="space-y-4">
                    {[
                        { title: "Best formulas for organic chemistry conversions?", replies: 24, likes: 142 },
                        { title: "How to use the P2P Sync room effectively", replies: 12, likes: 89 },
                        { title: "Feature Request: Matrix multiplication", replies: 56, likes: 231 },
                        { title: "Bug: Graphing x^y fails on negative domains", replies: 8, likes: 45 }
                    ].map((topic, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-brand-bg/60 rounded-2xl border border-brand-border/60 hover:border-brand-primary/40 transition-colors cursor-pointer group">
                            <span className="font-bold text-lg text-brand-text mb-4 sm:mb-0 group-hover:text-brand-primary transition-colors">{topic.title}</span>
                            <div className="flex items-center gap-6 text-xs font-bold text-brand-text-secondary">
                                <span className="flex items-center gap-2 bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-border/50 shadow-inner group-hover:text-purple-400 transition-colors"><MessageCircle size={16} /> {topic.replies}</span>
                                <span className="flex items-center gap-2 bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-border/50 shadow-inner group-hover:text-emerald-400 transition-colors"><ThumbsUp size={16} /> {topic.likes}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityForum;
