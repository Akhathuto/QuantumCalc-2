import React, { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
            console.error("Error submitting contact form:", error);
            alert("There was an error sending your message. Please try again.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-brand-primary tracking-tight">Contact Edgtec</h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-brand-text-secondary">
                    Have questions, feedback, or need support? We'd love to hear from you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-border">
                        <h3 className="text-xl font-bold mb-6 text-brand-accent">Get in Touch</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-text">Email</h4>
                                    <p className="text-brand-text-secondary text-sm mt-1">r.lepheane@outlook.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-text">Office</h4>
                                    <p className="text-brand-text-secondary text-sm mt-1">
                                        Springs, Gauteng<br />
                                        South Africa
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2">
                    <div className="bg-brand-surface/50 p-8 rounded-lg border border-brand-border">
                        <h3 className="text-2xl font-bold mb-6 text-brand-text">Send us a Message</h3>
                        
                        {isSubmitted ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-lg text-center">
                                <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-900/70 p-3 rounded-md border border-brand-border focus:border-brand-primary outline-none text-brand-text transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-900/70 p-3 rounded-md border border-brand-border focus:border-brand-primary outline-none text-brand-text transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-brand-text-secondary mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-900/70 p-3 rounded-md border border-brand-border focus:border-brand-primary outline-none text-brand-text transition-colors"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-brand-text-secondary mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full bg-gray-900/70 p-3 rounded-md border border-brand-border focus:border-brand-primary outline-none text-brand-text transition-colors resize-y"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
