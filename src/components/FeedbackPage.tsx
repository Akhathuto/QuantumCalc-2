import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Star, Users, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const FeedbackPage = () => {
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('');
    const [survey, setSurvey] = useState({
        usefulFeatures: '',
        improvement: '',
        missingTools: '',
        experience: 'great'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const feedbackId = `FB-${Date.now()}`;
            await setDoc(doc(collection(db, 'feedback'), feedbackId), {
                rating,
                category,
                experience: survey.experience,
                usefulFeatures: survey.usefulFeatures,
                improvement: survey.improvement,
                missingTools: survey.missingTools,
                createdAt: serverTimestamp(),
                userId: user?.uid || null
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            handleFirestoreError(error, OperationType.CREATE, 'feedback');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Sparkles size={400} />
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-brand-surface/40 p-16 rounded-[4rem] border border-brand-border/50 text-center backdrop-blur-3xl shadow-2xl relative z-10"
                >
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-emerald-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-brand-text mb-6 tracking-tight">Report Transmitted</h2>
                    <p className="text-brand-text-secondary text-lg leading-relaxed mb-12 opacity-80">
                        Your insights have been successfully ingested into our optimization matrix. We appreciate your contribution to the academic ecosystem.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="px-12 py-5 bg-brand-primary text-brand-bg font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/30"
                    >
                        Return to Console
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12 bg-brand-bg relative custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-16 py-12">
                {/* Header Section */}
                <div className="space-y-6 text-center md:text-left relative">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-center md:justify-start gap-4 mb-4"
                    >
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">Stakeholder Engagement</span>
                    </motion.div>
                    <h1 className="text-6xl font-black text-brand-text tracking-tightest leading-none">
                        Academic Experience <br />
                        <span className="text-brand-primary">Feedback Survey</span>
                    </h1>
                    <p className="text-xl text-brand-text-secondary max-w-3xl leading-relaxed font-light italic">
                        Help us architect the ultimate computational environment for students. Your data points drive our evolutionary roadmap.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Survey Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 space-y-10"
                    >
                        <form onSubmit={handleSubmit} className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl space-y-12">
                            {/* Satisfaction Metric */}
                            <div className="space-y-6">
                                <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Overall Satisfaction Quotient</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            onMouseEnter={() => setRating(s)}
                                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${rating >= s ? 'bg-brand-primary text-brand-bg shadow-lg scale-110' : 'bg-brand-bg/50 text-brand-text-secondary hover:bg-brand-primary/10 border border-brand-border'}`}
                                        >
                                            <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Survey Questions */}
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Classification</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl p-5 text-sm font-bold text-brand-text outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="ui">User Interface / UX</option>
                                        <option value="tools">Tool Performance</option>
                                        <option value="features">New Feature Request</option>
                                        <option value="bug">Terminal / Logic Error</option>
                                        <option value="other">Other Observations</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Platform Experience</label>
                                    <div className="flex bg-brand-bg/50 p-2 rounded-2xl border border-brand-border">
                                        {['great', 'neutral', 'difficult'].map((lev) => (
                                            <button
                                                key={lev}
                                                type="button"
                                                onClick={() => setSurvey({...survey, experience: lev})}
                                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${survey.experience === lev ? 'bg-brand-bg text-brand-primary shadow-xl' : 'text-brand-text-secondary hover:text-brand-text'}`}
                                            >
                                                {lev}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Most Validated Features</label>
                                    <textarea 
                                        required
                                        value={survey.usefulFeatures}
                                        onChange={(e) => setSurvey({...survey, usefulFeatures: e.target.value})}
                                        placeholder="Which tools have provided the highest academic utility?"
                                        className="w-full bg-brand-bg/40 border border-brand-border rounded-3xl p-6 text-sm font-medium text-brand-text focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all h-32 resize-none placeholder:opacity-30"
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Optimizations & Refinements</label>
                                    <textarea 
                                        required
                                        value={survey.improvement}
                                        onChange={(e) => setSurvey({...survey, improvement: e.target.value})}
                                        placeholder="How can we further enhance the computational flow?"
                                        className="w-full bg-brand-bg/40 border border-brand-border rounded-3xl p-6 text-sm font-medium text-brand-text focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all h-32 resize-none placeholder:opacity-30"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] ml-2">Missing Capabilities</label>
                                    <textarea 
                                        value={survey.missingTools}
                                        onChange={(e) => setSurvey({...survey, missingTools: e.target.value})}
                                        placeholder="Are there specific modules currently absent from the workspace?"
                                        className="w-full bg-brand-bg/40 border border-brand-border rounded-3xl p-6 text-sm font-medium text-brand-text focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all h-32 resize-none placeholder:opacity-30"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-8 bg-brand-text text-brand-bg font-black uppercase tracking-[0.6em] text-xs rounded-3xl hover:bg-brand-primary hover:text-white transition-all shadow-2xl flex items-center justify-center gap-6 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <Sparkles className="animate-spin" size={24} />
                                ) : (
                                    <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                )}
                                <span>{loading ? "Transmitting..." : "Broadcast Feedback Package"}</span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl space-y-8">
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                <Brain size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-brand-text tracking-tightest">Evolutionary <br /> Intelligence</h3>
                            <p className="text-sm text-brand-text-secondary leading-relaxed font-light opacity-80">
                                Your feedback is not merely stored; it is analyzed to prioritize hardware integration, logic refinements, and UI optimizations. Every submission directly influences the next build cycle.
                            </p>
                            <div className="pt-8 border-t border-brand-border/20 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-text-secondary">Community-Driven Roadmap</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-text-secondary">Active Development Phase</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 p-10 rounded-[3rem] border border-emerald-500/20 space-y-6">
                            <div className="flex items-center gap-4 text-emerald-500">
                                <AlertCircle size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Privacy Protocol</span>
                            </div>
                            <p className="text-[11px] text-brand-text-secondary/70 leading-relaxed font-mono uppercase tracking-wider">
                                All telemetry data is anonymized. No personal academic records are shared during the transmission of this feedback package.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
