import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, BrainCircuit, X, Bot, Sparkles, Command, Send, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab } from '../types';
import { getApiKey, getGeminiModel } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface FloatingAssistantProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onQuickSolve?: (expression: string) => void;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  const askAi = async (query: string) => {
    if (!query.trim()) return;
    
    setIsThinking(true);
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInputValue('');
    
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: "I need a Gemini API key to assist you. Please configure it in your Settings to unlock my abilities." 
        }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelName = getGeminiModel();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: query,
        config: {
          systemInstruction: `You are the QuantumCalc AI Research Assistant. You are currently helping the user in the "${activeTab}" section of the app. Provide clear, concise, and educational answers, formatted nicely using Markdown. If you provide steps or code or math, format it properly. If the user wants to solve a complex math problem, provide the answer directly and explain how to get more details in the 'Student Tools' tab. You help with navigation, quick math, tool explanations, and general knowledge.`,
        }
      });
      
      const text = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (err: any) {
      console.error("AI Error:", err);
      let errorMsg = "Service temporarily unavailable.";
      if (err?.message?.includes('API_KEY_INVALID')) {
        errorMsg = "Your API key seems invalid. Please check your settings.";
      } else if (err?.message?.includes('quota')) {
        errorMsg = "API quota reached. You can add your own key in Settings to keep going!";
      }
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsThinking(false);
    }
  };

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

      recognitionRef.current = rec;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
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

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg/50 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary shadow-inner border border-brand-primary/20">
                      <Sparkles size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text">Quantum AI Companion</p>
                        <p className="text-xs text-brand-text-secondary mt-1 px-4 leading-relaxed">Ask anything or select a quick topic below:</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2 px-2">
                      {[
                        `Explain features on '${activeTab}'`,
                        "What is 25% of 150?",
                        "Solve quadratic: x² - 5x + 6 = 0",
                        "Fundamental physical constants"
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => askAi(prompt)}
                          className="flex items-center justify-between text-left px-3 py-2 rounded-xl bg-brand-surface border border-brand-border/70 hover:border-brand-primary/50 hover:bg-brand-primary/5 text-xs text-brand-text transition-all group cursor-pointer"
                        >
                          <span className="truncate">{prompt}</span>
                          <ArrowDownRight size={13} className="text-brand-text-secondary group-hover:text-brand-primary transition-colors shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none shadow-sm' : 'bg-brand-surface border border-brand-border text-brand-text rounded-tl-none overflow-x-auto shadow-sm'}`}>
                      {m.role === 'user' ? (
                        m.text
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-brand-bg/50 prose-pre:border prose-pre:border-brand-border prose-pre:rounded-lg">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isThinking && (
                   <div className="flex justify-start">
                    <div className="bg-brand-surface border border-brand-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-brand-text-secondary">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="font-mono text-[10px] ml-1">Analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Interaction Bar */}
              <div className="p-3 bg-brand-surface border-t border-brand-border">
                 {transcript && isListening && (
                   <div className="text-[10px] text-brand-primary font-mono mb-2 animate-pulse truncate uppercase tracking-widest bg-brand-primary/5 p-1 rounded">
                     Listening: {transcript}
                   </div>
                 )}
                <div className="flex gap-2">
                  <button 
                    onClick={toggleListening}
                    title={isListening ? "Stop Voice Input" : "Voice Input"}
                    className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'}`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <div className="flex-1 relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="Ask me anything..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-brand-bg/60 border border-brand-border rounded-xl pl-3 pr-9 py-2 text-xs outline-none focus:border-brand-primary text-brand-text placeholder:text-brand-text-secondary/60"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          askAi(inputValue);
                        }
                      }}
                    />
                    <button
                      onClick={() => inputValue.trim() && askAi(inputValue)}
                      disabled={!inputValue.trim()}
                      className="absolute right-2 p-1 text-brand-text-secondary hover:text-brand-primary disabled:opacity-30 disabled:hover:text-brand-text-secondary transition-colors"
                    >
                      <Send size={14} />
                    </button>
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
