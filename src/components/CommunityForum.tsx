import React from 'react';
import { MessageCircle, Users, ExternalLink, Hash, ThumbsUp } from 'lucide-react';

const CommunityForum = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in-down">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-500 rounded-full mb-4">
                    <Users size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight">Community</h1>
                <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                    Join the QuantumCalc ecosystem. Share worksheets, ask questions, and collaborate with other learners.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-3xl p-8 text-center space-y-4 hover:bg-[#5865F2]/20 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-[#5865F2] text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-text">Discord Server</h3>
                    <p className="text-brand-text-secondary">Join our live chat. Get real-time help and participate in math challenges.</p>
                    <button className="flex items-center gap-2 mx-auto text-[#5865F2] font-bold mt-4">
                        Join Discord <ExternalLink size={16} />
                    </button>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 text-center space-y-4 hover:border-brand-text/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-brand-surface border border-brand-border text-brand-text rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                        <Hash size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-text">GitHub Discussions</h3>
                    <p className="text-brand-text-secondary">Propose new features, report bugs, and view the project roadmap.</p>
                    <button className="flex items-center gap-2 mx-auto text-brand-text font-bold mt-4">
                        View GitHub <ExternalLink size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8">
                <h3 className="text-xl font-bold text-brand-text mb-6">Trending Topics</h3>
                
                <div className="space-y-4">
                    {[
                        { title: "Best formulas for organic chemistry conversions?", replies: 24, likes: 142 },
                        { title: "How to use the P2P Sync room effectively", replies: 12, likes: 89 },
                        { title: "Feature Request: Matrix multiplication", replies: 56, likes: 231 },
                        { title: "Bug: Graphing x^y fails on negative domains", replies: 8, likes: 45 }
                    ].map((topic, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brand-bg rounded-2xl border border-brand-border/50 hover:border-brand-primary/30 transition-colors cursor-pointer">
                            <span className="font-medium text-brand-text mb-2 sm:mb-0">{topic.title}</span>
                            <div className="flex items-center gap-4 text-xs font-bold text-brand-text-secondary">
                                <span className="flex items-center gap-1"><MessageCircle size={14} /> {topic.replies}</span>
                                <span className="flex items-center gap-1"><ThumbsUp size={14} /> {topic.likes}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityForum;
