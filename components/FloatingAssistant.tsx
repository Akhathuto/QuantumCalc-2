import React, { useState, useEffect } from 'react';
import { Mic, MicOff, BrainCircuit, X, Bot, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab } from '../types';
import { GoogleGenAI } from "@google/genai";

interface FloatingAssistantProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onQuickSolve?: (expression: string) => void;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(resultTranscript.toLowerCase());
          setIsListening(false);
        }
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      setRecognition(rec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceCommand = (cmd: string) => {
    if (cmd.includes('calculator') || cmd.includes('calc')) setActiveTab('calculator');
    else if (cmd.includes('graph')) setActiveTab('graphing');
    else if (cmd.includes('student') || cmd.includes('school')) setActiveTab('student');
    else if (cmd.includes('history')) setActiveTab('history');
    else if (cmd.includes('setting')) setActiveTab('settings');
    else if (cmd.includes('financial') || cmd.includes('loan')) setActiveTab('financial');
    else if (cmd.includes('about')) setActiveTab('about');
    else if (cmd.includes('contact')) setActiveTab('contact');
    
    // Quick Solve intent
    if (cmd.includes('solve') || cmd.includes('calculate')) {
       askAi(cmd);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setTranscript('');
      recognition?.start();
      setIsListening(true);
    }
  };

  const askAi = async (query: string) => {
    if (!query.trim()) return;
    
    setIsThinking(true);
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          systemInstruction: "You are the QuantumCalc Floating Assistant. Keep answers extremely brief (max 2 sentences). If the user wants to solve a math problem, provide the answer directly and explain how to get more details in the 'Student Tools' tab. You help with navigation and quick math.",
        }
      });
      
      const text = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Service temporarily unavailable." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="w-80 md:w-96 h-[450px] bg-brand-surface border border-brand-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Voice Bar */}
              <div className="p-4 bg-brand-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={20} />
                  <span className="font-bold text-sm">Quantum Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg/50">
                {messages.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                      <Sparkles size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text">How can I help you?</p>
                        <p className="text-xs text-brand-text-secondary mt-1 px-4">Try "Open Calculator" or "What is 25% of 150?"</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-brand-surface border border-brand-border text-brand-text rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                   <div className="flex justify-start">
                    <div className="bg-brand-surface border border-brand-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="p-4 bg-brand-surface border-t border-brand-border">
                 {transcript && isListening && (
                   <div className="text-[10px] text-brand-primary font-mono mb-2 animate-pulse truncate uppercase tracking-widest bg-brand-primary/5 p-1 rounded">
                     Listening: {transcript}
                   </div>
                 )}
                <div className="flex gap-2">
                  <button 
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'}`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Ask me anything..."
                      className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          askAi((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Command className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global FAB */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-brand-surface text-brand-primary border-2 border-brand-primary rotate-90' : 'bg-brand-primary text-white'}`}
        >
          {isOpen ? <X size={28} /> : <BrainCircuit size={28} />}
          {!isOpen && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-brand-bg flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default FloatingAssistant;
