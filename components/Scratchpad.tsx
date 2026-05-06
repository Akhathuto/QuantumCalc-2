import React, { useState, useEffect } from 'react';
import { FileText, Save, Trash2, X, Plus, ChevronRight, StickyNote, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface Note {
  id: string;
  content: string;
  title: string;
  updatedAt: any;
}

const Scratchpad: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const askAiForNote = async () => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note || !note.content.trim()) return;

    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please analyze, refine, or explain the following mathematical/scientific note content. Make it professional and clear: \n\n${note.content}`,
        config: {
          systemInstruction: "You are the QuantumCalc AI Research Assistant. Your goal is to help students and engineers refine their notes, explain complex formulas, and provide insights. Be concise but insightful.",
        }
      });

      const refinedText = response.text || "AI could not process this note.";
      const newContent = `${note.content}\n\n--- AI INSIGHT ---\n${refinedText}`;
      updateNote(newContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('quantum_notes');
      if (saved) setNotes(JSON.parse(saved));
      return;
    }

    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
      if (notesData.length > 0 && !activeNoteId) setActiveNoteId(notesData[0].id);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const addNote = async () => {
    const newNote = {
      title: 'New Note',
      content: '',
      userId: user?.uid || 'local',
      updatedAt: serverTimestamp()
    };

    if (user) {
      const docRef = await addDoc(collection(db, 'notes'), newNote);
      setActiveNoteId(docRef.id);
    } else {
      const localNote = { ...newNote, id: Date.now().toString(), updatedAt: { seconds: Date.now() / 1000 } };
      const updatedNotes = [localNote, ...notes];
      setNotes(updatedNotes);
      localStorage.setItem('quantum_notes', JSON.stringify(updatedNotes));
      setActiveNoteId(localNote.id);
    }
  };

  const updateNote = async (content: string) => {
    if (!activeNoteId) return;
    
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content } : n));

    if (user) {
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'notes', activeNoteId), {
          content,
          updatedAt: serverTimestamp()
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      localStorage.setItem('quantum_notes', JSON.stringify(notes));
    }
  };

  const deleteNote = async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, 'notes', id));
    } else {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('quantum_notes', JSON.stringify(updatedNotes));
    }
    if (activeNoteId === id) setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
  };

  return (
    <>
      {/* Edge Trigger */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-brand-surface border border-l-0 border-brand-border p-2 rounded-r-xl shadow-xl hover:bg-brand-primary/10 text-brand-text-secondary hover:text-brand-primary transition-all"
        >
          <ChevronRight size={20} />
          <div className="absolute -rotate-90 left-[-15px] top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-tighter font-bold opacity-30">Scratchpad</div>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 md:w-96 bg-brand-surface shadow-2xl z-[70] flex flex-col border-r border-brand-border"
            >
              <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-bg">
                <div className="flex items-center gap-2">
                  <StickyNote className="text-brand-primary" size={20} />
                  <span className="font-bold text-brand-text">Quick Scratchpad</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-brand-border p-1 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Note List */}
                <div className="w-16 border-r border-brand-border flex flex-col items-center py-4 gap-4 bg-brand-surface">
                  <button onClick={addNote} className="p-2 rounded-full bg-brand-primary text-white hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </button>
                  <div className="flex-1 overflow-y-auto space-y-3 px-1">
                     {notes.map(note => (
                       <button 
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeNoteId === note.id ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-bg text-brand-text-secondary hover:bg-brand-border'}`}
                       >
                         <FileText size={18} />
                       </button>
                     ))}
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col bg-brand-surface">
                  {activeNote ? (
                    <>
                      <div className="p-4 border-b border-brand-border flex items-center justify-between">
                         <input 
                            value={activeNote.title} 
                            onChange={(e) => {
                                const newTitle = e.target.value;
                                setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title: newTitle } : n));
                            }}
                            className="bg-transparent border-none outline-none font-bold text-brand-text w-full"
                         />
                         <div className="flex items-center gap-1">
                           <button 
                             onClick={askAiForNote} 
                             disabled={isAiThinking}
                             className="text-brand-primary hover:bg-brand-primary/10 p-1.5 rounded transition-colors disabled:opacity-50"
                             title="AI Research Assistant"
                           >
                             {isAiThinking ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                           </button>
                           <button onClick={() => deleteNote(activeNote.id)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded">
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </div>
                      <textarea 
                        className="flex-1 p-4 bg-transparent outline-none resize-none text-brand-text font-mono text-sm leading-relaxed"
                        placeholder="Start typing your scratch notes..."
                        value={activeNote.content}
                        onChange={(e) => updateNote(e.target.value)}
                      />
                      <div className="p-2 border-t border-brand-border bg-brand-bg flex items-center justify-between">
                        <span className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-bold">
                          {isSaving ? 'Saving...' : 'Saved to cloud'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-brand-text-secondary">
                          <Save size={10} />
                          Auto-save enabled
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <div className="w-12 h-12 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center text-brand-text-secondary">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm text-brand-text-secondary">Select a note or create a new one to start writing.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Scratchpad;
