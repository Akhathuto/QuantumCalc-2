import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await addDoc(collection(db, 'contact_messages'), {
                ...formData,
                createdAt: new Date(),
                status: 'new'
            });
            
            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'contact_messages');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 mx-auto">
                    <Mail size={14} /> Communication Hub
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-brand-text tracking-tighter italic">
                    Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">EDGTEC</span>
                </h2>
                <p className="max-w-2xl mx-auto text-xl text-brand-text-secondary font-light">
                    Have questions, feedback, or need technical support? 
                    Our neural network is ready to receive your signal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Contact Information */}
                <div className="md:col-span-4 space-y-8">
                    <div className="bg-brand-surface/30 backdrop-blur-md p-10 rounded-[2.5rem] border border-brand-border/60 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                        
                        <h3 className="text-[10px] font-black mb-10 text-brand-primary uppercase tracking-[0.4em] italic">Direct Channels</h3>
                        
                        <div className="space-y-10">
                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-brand-primary/10 p-4 rounded-2xl text-brand-primary group-hover/item:rotate-6 transition-transform shadow-inner">
                                    <Mail size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest opacity-50">Encryption / Email</h4>
                                    <p className="text-brand-text font-black text-sm tracking-tight">r.lepheane@outlook.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-brand-secondary/10 p-4 rounded-2xl text-brand-secondary group-hover/item:rotate-6 transition-transform shadow-inner">
                                    <MapPin size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest opacity-50">Base of Operations</h4>
                                    <p className="text-brand-text font-black text-sm tracking-tight leading-relaxed">
                                        Springs, Gauteng<br />
                                        South Africa
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t border-brand-border/40 flex items-center justify-between">
                            <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest opacity-40">System Status</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Optimal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-8">
                    <div className="bg-brand-surface/40 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] border border-brand-border/60 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <h3 className="text-3xl font-black mb-10 text-brand-text tracking-tighter italic">Message Dispatch</h3>
                        
                        {isSubmitted ? (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-12 rounded-[2rem] text-center space-y-4">
                                <CheckCircle2 size={48} className="mx-auto mb-4" />
                                <h4 className="text-2xl font-black italic">Transmission Received</h4>
                                <p className="text-brand-text-secondary font-light">Thank you for reaching out. Our team will decrypt and respond shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="name" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Identity</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/60 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none text-brand-text transition-all placeholder:text-brand-text-secondary/30 font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="email" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Digital Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/60 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none text-brand-text transition-all placeholder:text-brand-text-secondary/30 font-medium"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label htmlFor="subject" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Subject Vector</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/60 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none text-brand-text transition-all placeholder:text-brand-text-secondary/30 font-medium"
                                        placeholder="What is this regarding?"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="message" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Transmission Content</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/60 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none text-brand-text transition-all placeholder:text-brand-text-secondary/30 font-medium resize-none"
                                        placeholder="Describe your request in detail..."
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="relative group/btn w-full md:w-auto overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-brand-primary rounded-2xl blur-lg opacity-20 group-hover/btn:opacity-50 transition-opacity" />
                                        <div className="relative flex items-center justify-center gap-3 px-12 py-5 bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                                            <Send size={18} />
                                            Dispatch Message
                                        </div>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
