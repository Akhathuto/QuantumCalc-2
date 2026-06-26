import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Save, Trash2, X, Plus, ChevronRight, StickyNote, 
  Sparkles, Loader2, Share2, Search, Maximize2, Minimize2, 
  Copy, Check, FileDown, BookOpen, Calculator, RefreshCw, Eraser,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { getApiKey, getGeminiModel, getSystemInstructionSuffix } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { triggerCloudSync } from '../services/googleDriveService';
import { localSyncService, SyncState } from '../services/LocalSyncService';
import Latex from 'react-latex-next';

interface Note {
  id: string;
  content: string;
  title: string;
  updatedAt: any;
}

const loadingQuotes = [
  "Factoring mathematical models...",
  "Applying dimensional analysis...",
  "Integrating across dimensional waves...",
  "Optimizing thermodynamic structures...",
  "Decoding raw scratch variables...",
  "Refining KaTeX math equations...",
  "Synthesizing scientific study flashcards..."
];

const MathTemplates = [
  { label: 'Fraction', latex: '\\frac{a}{b}', icon: '÷' },
  { label: 'Sqrt', latex: '\\sqrt{x}', icon: '√' },
  { label: 'Power', latex: 'x^{n}', icon: 'xⁿ' },
  { label: 'Subscript', latex: 'x_{i}', icon: 'xᵢ' },
  { label: 'Integral', latex: '\\int_{a}^{b} f(x)\\,dx', icon: '∫' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n} ', icon: '∑' },
  { label: 'Theta', latex: '\\theta', icon: 'θ' },
  { label: 'Pi', latex: '\\pi', icon: 'π' },
  { label: 'Infinity', latex: '\\infty', icon: '∞' },
  { label: 'Delta', latex: '\\Delta', icon: 'Δ' },
  { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', icon: '[M]' },
  { label: 'Inline Math', latex: '$ $', icon: '$x$' },
  { label: 'Block Math', latex: '$$ $$', icon: '$$x$$' }
];

const Scratchpad: React.FC = () => {
  const { user, isFirebaseUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('quantum_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Enhanced Scratchpad States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'copilot'>('edit');
  const [isWide, setIsWide] = useState(false);
  const [aiCopilotResponse, setAiCopilotResponse] = useState('');
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('scratchpad_font_size');
      return saved ? parseInt(saved, 10) : 12;
    } catch (e) {
      return 12;
    }
  });

  // Persist font size changes
  useEffect(() => {
    try {
      localStorage.setItem('scratchpad_font_size', fontSize.toString());
    } catch (e) {
      console.warn("Could not save scratchpad font size state:", e);
    }
  }, [fontSize]);

  // Local Sync Subscription
  useEffect(() => {
    const unsubscribe = localSyncService.subscribe((state: Partial<SyncState>) => {
      if (state.scratchpad !== undefined && activeNoteId) {
        // Optimistically update the active note with synced content
        setNotes(prevNotes => prevNotes.map(n => 
          n.id === activeNoteId ? { ...n, content: state.scratchpad! } : n
        ));
      }
    });
    return unsubscribe;
  }, [activeNoteId]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  // Auto clean saving timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Clear states when active note changes
  useEffect(() => {
    setAiCopilotResponse('');
    setConfirmOverwrite(false);
    setShowClearConfirm(false);
  }, [activeNoteId]);

  const askAiForNote = async (type: 'refine' | 'explain' | 'exercises' | 'latex' | 'summary' = 'refine') => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note || !note.content.trim()) return;

    setIsAiThinking(true);
    setActiveTab('copilot');
    
    // Cycle through loader status messages
    let statusIndex = 0;
    setAiStatusMessage(loadingQuotes[0]);
    const quoteInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % loadingQuotes.length;
      setAiStatusMessage(loadingQuotes[statusIndex]);
    }, 2500);

    try {
      let promptTask = '';
      switch (type) {
        case 'refine':
          promptTask = "Please refine and polish the writing in this note. Correct any grammar, spelling, or structural issues. Retain and refine all scientific equations or laws, expanding definitions to be more comprehensive and academically robust. Ensure you use proper $ for inline math and $$ for block math LaTeX variables.";
          break;
        case 'explain':
          promptTask = "Create a breakdown of all scientific, mathematical, and technical terms in this note. For each formula or equation, explain its physical/mathematical meaning, variables and parameters, derivation steps, and real-world usefulness. Use plenty of inline/block LaTeX formatting.";
          break;
        case 'exercises':
          promptTask = "Generate 3 highly relevant scientific or mathematical practice questions directly based on the concepts or topics discussed in this note. Write study questions with solved steps in detailed KaTeX formulas so I can check my work. Make these engaging and helpful for study.";
          break;
        case 'latex':
          promptTask = "Analyze mathematical expressions, formulas, and laws in this note, and convert them to standard, pristine LaTeX expressions (wrap inline math with $ and block math with $$). Explain each part of the formula and provide a short proof if available.";
          break;
        case 'summary':
          promptTask = "Synthesize this note into a high-density, high-impact review cheat-sheet. It should contain visual subheadings, bullet-pointed summaries of key lessons, and a central box summarizing formulas and definitions.";
          break;
      }

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please configure your Gemini API key in Settings > Secrets or the local storage console.");
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const userToneSuffix = getSystemInstructionSuffix();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Please perform this task: ${promptTask}\n\nNote Title: ${note.title}\nNote Content:\n${note.content}`,
        config: {
          systemInstruction: `You are the QuantumCalc AI Research Co-Pilot. Your goal is to help students, developers, and engineers digest and perfect their equations and notes. Be concise, highly educational, mathematically robust, and write in clean scientific Markdown. Support complex equations in KaTeX ($ and $$).${userToneSuffix}`,
        }
      });

      const resultText = response.text || "AI quantum core could not compose an answer.";
      setAiCopilotResponse(resultText);
    } catch (err: any) {
      console.error("AI notes insight error:", err);
      setAiCopilotResponse(`### AI Operational Deficit\n${err instanceof Error ? err.message : String(err)}\n\nPlease ensure your Gemini API key is configured correctly in the application's developer parameters or local storage environment.`);
    } finally {
      clearInterval(quoteInterval);
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    if (!user || !isFirebaseUser) {
      try {
        const saved = localStorage.getItem('quantum_notes');
        const localNotes = saved ? JSON.parse(saved) : [];
        setNotes(localNotes);
        if (localNotes.length > 0) {
          setActiveNoteId(current => current || localNotes[0].id);
        }
      } catch (e) {
        console.warn("Failed to load local notes on startup", e);
      }
      return;
    }

    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
      if (notesData.length > 0) {
        setActiveNoteId(current => {
           if (!current) return notesData[0].id;
           return current;
        });
      }
    }, (error: any) => {
      handleFirestoreError(error, OperationType.GET, 'notes');
    });

    return () => unsubscribe();
  }, [user, isFirebaseUser]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Search filtered notes
  const filteredNotes = notes.filter(n => {
    const term = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term);
  });

  const addNote = async () => {
    const newNote = {
      title: 'New Note',
      content: '',
      userId: user?.uid || 'local',
      updatedAt: serverTimestamp()
    };

    if (user && isFirebaseUser) {
      try {
        const docRef = await addDoc(collection(db, 'notes'), newNote);
        setActiveNoteId(docRef.id);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'notes');
      }
    } else {
      const localNote = { ...newNote, id: Date.now().toString(), updatedAt: { seconds: Date.now() / 1000 } } as unknown as Note;
      const updatedNotes = [localNote, ...notes];
      setNotes(updatedNotes);
      try {
        localStorage.setItem('quantum_notes', JSON.stringify(updatedNotes));
        triggerCloudSync();
      } catch (e) {
        console.error("Failed to save notes to localStorage", e);
      }
      setActiveNoteId(localNote.id);
    }
  };

  const updateNote = async (content: string) => {
    if (!activeNoteId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Optimistic update
    const updatedNotesList = notes.map(n => n.id === activeNoteId ? { ...n, content } : n);
    setNotes(updatedNotesList);

    // Broadcast if in a WebRTC session
    if (localSyncService.getRoomId()) {
      localSyncService.broadcast({ scratchpad: content });
    }

    setIsSaving(true);

    if (user && isFirebaseUser) {
      try {
        await updateDoc(doc(db, 'notes', activeNoteId), {
          content,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `notes/${activeNoteId}`);
        setIsSaving(false);
      }
    } else {
      try {
        localStorage.setItem('quantum_notes', JSON.stringify(updatedNotesList));
        triggerCloudSync();
      } catch (e) {
        console.error("Failed to save notes to localStorage", e);
      }
    }

    // Smooth feedback timeout
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const updateNoteTitle = async (id: string, newTitle: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const updatedNotesList = notes.map(n => n.id === id ? { ...n, title: newTitle } : n);
    setNotes(updatedNotesList);
    
    setIsSaving(true);

    if (user && isFirebaseUser) {
      try {
        await updateDoc(doc(db, 'notes', id), {
          title: newTitle,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
        setIsSaving(false);
      }
    } else {
      try {
        localStorage.setItem('quantum_notes', JSON.stringify(updatedNotesList));
        triggerCloudSync();
      } catch (e) {
        console.error("Failed to save notes to localStorage", e);
      }
    }

    // Smooth feedback timeout
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const deleteNote = async (id: string) => {
    if (user && isFirebaseUser) {
      try {
        await deleteDoc(doc(db, 'notes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
      }
    } else {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      try {
        localStorage.setItem('quantum_notes', JSON.stringify(updatedNotes));
        triggerCloudSync();
      } catch (e) {
        console.error("Failed to delete note from localStorage", e);
      }
    }
    if (activeNoteId === id) setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
  };

  // Cursor Inserter Utility
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = activeNote?.content || '';
    
    const newContent = currentContent.substring(0, start) + textToInsert + currentContent.substring(end);
    
    updateNote(newContent);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Local exporter
  const downloadNote = (format: 'md' | 'txt') => {
    if (!activeNote) return;
    const heading = format === 'md' ? `# ${activeNote.title}\n\n` : `${activeNote.title}\n\n`;
    const formatContent = heading + activeNote.content;
    const blob = new Blob([formatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
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
            
            {/* Sidebar Drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 ${isWide ? 'w-full max-w-4xl' : 'w-80 md:w-96'} bg-brand-surface shadow-2xl z-[70] flex flex-col border-r border-brand-border transition-all duration-300`}
            >
              {/* Drawer Title Bar */}
              <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-bg">
                <div className="flex items-center gap-2">
                  <StickyNote className="text-brand-primary animate-pulse" size={20} />
                  <div>
                    <span className="font-bold text-brand-text block text-sm">Quick Scratchpad</span>
                    <span className="text-[9px] text-brand-text-secondary uppercase tracking-widest block font-medium">Math Study Canvas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsWide(!isWide)} 
                    className="hover:bg-brand-border p-1.5 rounded-lg transition-colors text-brand-text-secondary"
                    title={isWide ? "Exit Split Study" : "Split Screen KaTeX Study"}
                  >
                    {isWide ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="hover:bg-brand-border p-1 rounded-lg transition-colors text-brand-text-secondary">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main inner body split-drawer */}
              <div className="flex-1 flex overflow-hidden">
                {/* Micro Note Listing strip */}
                <div className="w-16 border-r border-brand-border flex flex-col items-center py-4 gap-4 bg-brand-bg/40 select-none">
                  <button 
                    onClick={addNote} 
                    className="p-2.5 rounded-full bg-brand-primary text-white hover:scale-110 shadow-md transition-transform"
                    title="Add mathematical note"
                  >
                    <Plus size={18} />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsSearching(!isSearching);
                      if (isSearching) setSearchQuery('');
                    }} 
                    className={`p-2 rounded-xl transition-all ${isSearching ? 'bg-brand-primary/25 text-brand-primary' : 'bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-primary'}`}
                    title="Filter titles"
                  >
                    <Search size={16} />
                  </button>

                  {isSearching && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-1"
                    >
                      <input 
                        type="text"
                        placeholder="Type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-12 text-[10px] p-1 border border-brand-border rounded bg-brand-bg text-brand-text outline-none text-center"
                        autoFocus
                      />
                    </motion.div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-3 px-1 w-full flex flex-col items-center min-h-0 border-t border-brand-border/40 pt-3">
                     {filteredNotes.map(note => (
                       <button 
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 hover:scale-105 border ${activeNoteId === note.id ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:bg-brand-border hover:text-brand-text'}`}
                        title={note.title || "Untitled note"}
                       >
                         <FileText size={18} />
                       </button>
                     ))}
                     {filteredNotes.length === 0 && (
                       <span className="text-[9px] text-brand-text-secondary tracking-tighter text-center italic mt-2">Empty</span>
                     )}
                  </div>
                </div>

                {/* Right Workspace (Editor, Preview, AI Copilot) */}
                <div className="flex-1 flex flex-col bg-brand-surface overflow-hidden">
                  {activeNote ? (
                    <>
                      {/* Editor Sub-Header Title controls */}
                      <div className="p-4 border-b border-brand-border flex items-center justify-between gap-2 bg-brand-bg/20">
                         <input 
                            value={activeNote.title} 
                            onChange={(e) => updateNoteTitle(activeNote.id, e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-brand-text text-sm w-full focus:ring-1 focus:ring-brand-primary rounded px-1 min-w-0"
                            placeholder="Enter study note title..."
                         />
                         
                         {/* Control actions */}
                         <div className="flex items-center gap-1 shrink-0">
                           {/* Clipboard Share icon */}
                           <button 
                             onClick={async () => {
                               const text = `${activeNote.title}\n\n${activeNote.content}`;
                               if (navigator.share) {
                                 try {
                                   await navigator.share({ title: activeNote.title, text });
                                 } catch (err) { console.warn("Share clipboard alternative used."); }
                               } else {
                                 navigator.clipboard.writeText(text);
                                 setIsCopied(true);
                                 setTimeout(() => setIsCopied(false), 2000);
                               }
                             }}
                             className="text-brand-text-secondary hover:bg-brand-border/30 p-1.5 rounded transition-all"
                             title="Share note text"
                           >
                              {isCopied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                           </button>

                           {/* Custom Popup-less Inline Clear action */}
                           {showClearConfirm ? (
                             <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-1.5 py-1 rounded text-[10px]">
                               <button 
                                 onClick={() => { updateNote(''); setShowClearConfirm(false); }} 
                                 className="text-red-400 font-extrabold hover:underline"
                               >
                                 Clear
                               </button>
                               <span className="text-brand-text-secondary">|</span>
                               <button 
                                 onClick={() => setShowClearConfirm(false)} 
                                 className="text-brand-text-secondary hover:underline"
                               >
                                 Cancel
                               </button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => setShowClearConfirm(true)} 
                               className="text-brand-text-secondary hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded transition-all"
                               title="Clear note sheet"
                             >
                               <Eraser size={16} />
                             </button>
                           )}

                           {/* Export to MD/TXT dropdown */}
                           <div className="relative">
                             <button 
                               onClick={() => setShowExportMenu(!showExportMenu)}
                               className={`p-1.5 rounded transition-all ${showExportMenu ? 'bg-brand-border text-brand-primary' : 'text-brand-text-secondary hover:bg-brand-border/30'}`}
                               title="Download document format"
                             >
                               <FileDown size={16} />
                             </button>
                             
                             {showExportMenu && (
                               <>
                                 <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                 <div className="absolute right-0 top-full mt-1 bg-brand-surface border border-brand-border rounded-lg shadow-xl z-20 py-1 w-32 text-xs">
                                   <button 
                                     onClick={() => { downloadNote('md'); setShowExportMenu(false); }}
                                     className="w-full text-left px-3 py-1.5 hover:bg-brand-bg hover:text-brand-primary text-brand-text flex items-center gap-2"
                                   >
                                     <span className="font-bold text-[9px] text-brand-primary bg-brand-primary/10 px-1 rounded uppercase">.MD</span> Markdown
                                   </button>
                                   <button 
                                     onClick={() => { downloadNote('txt'); setShowExportMenu(false); }}
                                     className="w-full text-left px-3 py-1.5 hover:bg-brand-bg hover:text-brand-primary text-brand-text flex items-center gap-2"
                                   >
                                     <span className="font-bold text-[9px] text-brand-text-secondary bg-brand-bg/80 px-1 rounded uppercase">.TXT</span> Plain Text
                                   </button>
                                 </div>
                               </>
                             )}
                           </div>

                           <button 
                             onClick={() => askAiForNote('refine')} 
                             disabled={isAiThinking}
                             className="text-brand-primary hover:bg-brand-primary/10 p-1.5 rounded transition-all disabled:opacity-50 group shrink-0"
                             title="Refine with AI Co-Pilot"
                           >
                             <Sparkles size={16} className="group-hover:rotate-12 transition-transform text-brand-primary" />
                           </button>

                           {/* Font size settings popover */}
                           <div className="relative shrink-0">
                             <button 
                               onClick={() => setShowSettings(!showSettings)}
                               className={`p-1.5 rounded transition-all ${showSettings ? 'bg-brand-border text-brand-primary' : 'text-brand-text-secondary hover:bg-brand-border/30'}`}
                               title="Scratchpad Display Settings"
                             >
                               <Sliders size={16} />
                             </button>

                             {showSettings && (
                               <>
                                 <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                                 <div className="absolute right-0 top-full mt-1 bg-brand-surface border border-brand-border rounded-xl shadow-xl z-20 p-3 w-56 text-xs space-y-3">
                                   <div className="flex items-center justify-between border-b border-brand-border pb-1.5 mb-1 select-none">
                                     <span className="font-extrabold uppercase tracking-widest text-[10px] text-brand-text">View Settings</span>
                                     <span className="text-[10px] font-mono font-bold text-brand-primary">{fontSize}px</span>
                                   </div>
                                   <div className="space-y-1">
                                     <div className="flex justify-between text-[10px] text-brand-text-secondary font-bold select-none">
                                       <span>FONT SIZE</span>
                                       <span>Aa</span>
                                     </div>
                                     <input 
                                       type="range" 
                                       min="11" 
                                       max="24" 
                                       value={fontSize} 
                                       onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                                       className="w-full h-1 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary border border-brand-border/40 focus:outline-none"
                                     />
                                     <div className="flex justify-between text-[9px] text-brand-text-secondary select-none">
                                       <span>Small (11px)</span>
                                       <span>Large (24px)</span>
                                     </div>
                                   </div>
                                 </div>
                               </>
                             )}
                           </div>

                           <button onClick={() => deleteNote(activeNote.id)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded transition-all">
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </div>

                      {/* Mode selection segmented controls */}
                      <div className="flex border-b border-brand-border bg-brand-bg/40 px-3 py-1.5 justify-between items-center select-none text-xs shrink-0">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === 'edit' ? 'bg-brand-surface text-brand-primary border border-brand-border shadow-sm font-bold' : 'text-brand-text-secondary hover:text-brand-text'}`}
                          >
                            Editor
                          </button>
                          <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === 'preview' ? 'bg-brand-surface text-brand-primary border border-brand-border shadow-sm font-bold' : 'text-brand-text-secondary hover:text-brand-text'}`}
                          >
                            KaTeX Preview
                          </button>
                          <button
                            onClick={() => setActiveTab('copilot')}
                            className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${activeTab === 'copilot' ? 'bg-brand-surface text-brand-primary border border-brand-border shadow-sm font-bold' : 'text-brand-text-secondary hover:text-brand-text'}`}
                          >
                            <Sparkles size={12} className={isAiThinking ? "animate-spin text-brand-primary" : "text-brand-primary"} />
                            AI Co-Pilot
                          </button>
                        </div>
                        {isWide && (
                          <div className="text-[10px] text-brand-text-secondary hidden sm:flex items-center gap-1 bg-brand-bg/80 px-2 py-0.5 rounded border border-brand-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Multi-Screen Split Study Active
                          </div>
                        )}
                      </div>

                      {/* Main Workspace Frame container (supports Split screen if wide) */}
                      <div className="flex-1 flex overflow-hidden min-h-0">
                        
                        {/* LEFT COLUMN: ACTIVE EDITOR */}
                        <div className={`flex flex-col min-h-0 ${isWide && activeTab !== 'edit' ? 'w-1/2 border-r border-brand-border' : 'w-full'}`}>
                          
                          {/* Math symbol inserter bar, only on active editor */}
                          <div className="px-3 py-2 bg-brand-bg border-b border-brand-border flex gap-1.5 items-center overflow-x-auto scrollbar-none select-none shrink-0">
                            <span className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                              <Calculator size={10} /> Insert:
                            </span>
                            <div className="flex gap-1">
                              {MathTemplates.map((template, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => insertAtCursor(template.latex)}
                                  className="px-2 py-0.5 text-[10px] rounded bg-brand-surface border border-brand-border hover:border-brand-primary hover:text-brand-primary text-brand-text-secondary transition-all font-mono shrink-0 hover:shadow-xs active:scale-95"
                                  title={template.label}
                                >
                                  {template.icon}
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea 
                            ref={textareaRef}
                            style={{ fontSize: `${fontSize}px` }}
                            className="flex-1 p-4 bg-transparent outline-none resize-none text-brand-text font-mono leading-relaxed overflow-y-auto"
                            placeholder="Draft mathematical scratch notes... Supports normal text, markdown, and KaTeX mathematical notations (e.g. $e = mc^2$ or $$y = mx+c$$). Use the buttons above to insert equations quickly."
                            value={activeNote.content}
                            onChange={(e) => updateNote(e.target.value)}
                          />

                          {/* Footer parameters */}
                          <div className="p-2 border-t border-brand-border bg-brand-bg flex items-center justify-between text-[10px] text-brand-text-secondary shrink-0 select-none">
                            <AnimatePresence mode="wait">
                              {isSaving ? (
                                <motion.div 
                                  key="saving"
                                  initial={{ opacity: 0, y: 3 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -3 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-500"
                                >
                                  <Loader2 size={11} className="animate-spin text-amber-500" />
                                  <span>{user ? 'Syncing to database...' : 'Saving scratchpad...'}</span>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="saved"
                                  initial={{ opacity: 0, y: 3 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -3 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-500"
                                >
                                  <Check size={11} className="text-emerald-500 font-extrabold" />
                                  <span>{user ? 'Synced to database' : 'Saved locally'}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div className="flex items-center gap-1 bg-brand-surface border border-brand-border/40 px-2 py-0.5 rounded font-mono">
                              <Save size={10} />
                              Auto-save active
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN (OR OVERLAY COLUMN): PREVIEW OR CO-PILOT ACTIONS */}
                        {(!isWide || activeTab !== 'edit') && (
                          <div className={`${isWide ? 'w-1/2' : activeTab === 'edit' ? 'hidden' : 'w-full'} flex flex-col min-h-0 bg-brand-surface`}>
                            
                            {/* PREVIEW TAB PANEL */}
                            {activeTab === 'preview' && (
                              <div className="flex-1 p-5 overflow-y-auto bg-brand-bg/15 select-text">
                                <div className="border-b border-brand-border pb-3 mb-4 select-none">
                                  <h2 className="text-lg font-extrabold tracking-tight text-brand-text">{activeNote.title || 'Untitled note'}</h2>
                                  <span className="text-[10px] text-brand-text-secondary">
                                    Last synchronized: {activeNote.updatedAt?.seconds ? new Date(activeNote.updatedAt.seconds * 1000).toLocaleString() : 'Just now'}
                                  </span>
                                </div>
                                {activeNote.content.trim() === '' ? (
                                  <div className="text-xs text-brand-text-secondary italic text-center py-10">
                                    Note is empty. Back-fill or type expressions in the Editor to visualize KaTeX formulas.
                                  </div>
                                ) : (
                                  <div 
                                    style={{ fontSize: `${fontSize}px` }}
                                    className="leading-relaxed whitespace-pre-wrap font-sans break-words text-brand-text"
                                  >
                                    <Latex>{activeNote.content}</Latex>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* CO-PILOT TAB PANEL */}
                            {activeTab === 'copilot' && (
                              <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-brand-bg/30">
                                {isAiThinking ? (
                                  /* Thinking loader panel */
                                  <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center select-none">
                                    <div className="relative mb-4 flex items-center justify-center">
                                      <div className="absolute w-12 h-12 rounded-full border border-dashed border-brand-primary animate-spin opacity-50" />
                                      <Loader2 size={32} className="animate-spin text-brand-primary" />
                                    </div>
                                    <h4 className="font-bold text-xs text-brand-text mb-1 uppercase tracking-widest">Quantum Engine Processing</h4>
                                    <p className="text-[11px] text-brand-text-secondary select-none font-mono animate-pulse">{aiStatusMessage}</p>
                                  </div>
                                ) : aiCopilotResponse ? (
                                  /* AI Result output interface */
                                  <div className="flex-grow flex flex-col min-h-0 gap-3">
                                    <div className="flex-grow overflow-y-auto p-4 bg-brand-surface rounded-xl border border-brand-border shadow-inner text-brand-text text-xs flex flex-col gap-2 min-h-0">
                                      <div className="flex items-center gap-1.5 border-b border-brand-border pb-2 text-brand-primary font-extrabold uppercase tracking-widest text-[9px]">
                                        <Sparkles size={12} /> Quantum Study Solution
                                      </div>
                                      <div className="leading-relaxed whitespace-pre-wrap font-sans break-words select-text">
                                        <Latex>{aiCopilotResponse}</Latex>
                                      </div>
                                    </div>

                                    {/* Action items on AI outputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0 border-t border-brand-border pt-3 select-none">
                                      <button 
                                        onClick={() => {
                                          const original = activeNote.content;
                                          const division = original.trim() ? '\n\n---\n### AI Co-Pilot Expansion\n' : '';
                                          updateNote(original + division + aiCopilotResponse);
                                          setActiveTab('edit');
                                        }}
                                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-brand-primary text-white text-[11px] font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all"
                                      >
                                        <Plus size={12} /> Append to Note
                                      </button>
                                      
                                      <button 
                                        onClick={() => {
                                          if (confirmOverwrite) {
                                            updateNote(aiCopilotResponse);
                                            setConfirmOverwrite(false);
                                            setActiveTab('edit');
                                          } else {
                                            setConfirmOverwrite(true);
                                            setTimeout(() => setConfirmOverwrite(false), 3500);
                                          }
                                        }}
                                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-bold border active:scale-95 transition-all ${confirmOverwrite ? 'bg-amber-500 border-amber-600 text-black animate-whitespace' : 'bg-brand-bg hover:bg-brand-border/60 text-brand-text border-brand-border'}`}
                                      >
                                        <RefreshCw size={12} className={confirmOverwrite ? "animate-spin" : ""} />
                                        {confirmOverwrite ? 'Confirm Overwrite?' : 'Replace Note'}
                                      </button>

                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(aiCopilotResponse);
                                          setIsCopied(true);
                                          setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-text text-[11px] font-bold active:scale-95 transition-all"
                                      >
                                        {isCopied ? <Check size={12} className="text-emerald-400 font-bold" /> : <Copy size={12} />}
                                        {isCopied ? 'Copied' : 'Copy Response'}
                                      </button>
                                    </div>

                                    {/* Link back to prompt list */}
                                    <button 
                                      onClick={() => setAiCopilotResponse('')}
                                      className="text-center text-[10px] text-brand-text-secondary hover:text-brand-primary select-none hover:underline"
                                    >
                                      ← Run another operation
                                    </button>
                                  </div>
                                ) : (
                                  /* Prompts select deck */
                                  <div className="flex-1 flex flex-col justify-center gap-3">
                                    <div className="text-center select-none py-1.5 border-b border-brand-border/40">
                                      <h3 className="text-xs font-extrabold text-brand-text uppercase tracking-widest">AI Research Assistant</h3>
                                      <p className="text-[10px] text-brand-text-secondary">Process notes through standard quantum mathematics scripts</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto w-full max-h-96 overflow-y-auto pr-1">
                                      <button
                                        onClick={() => askAiForNote('refine')}
                                        className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border hover:border-brand-primary/40 bg-brand-surface hover:bg-brand-primary/5 text-left text-xs transition-all hover:shadow-xs group duration-200"
                                      >
                                        <Sparkles size={16} className="text-brand-primary mt-0.5 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <div className="font-bold text-brand-text text-xs">Refine Study Material</div>
                                          <div className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Polish formatting, spacing, grammar, and expand math notation</div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => askAiForNote('explain')}
                                        className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border hover:border-brand-primary/40 bg-brand-surface hover:bg-brand-primary/5 text-left text-xs transition-all hover:shadow-xs group duration-200"
                                      >
                                        <BookOpen size={16} className="text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <div className="font-bold text-brand-text text-xs">Explain Math & Rules</div>
                                          <div className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Derive and explain equations, physics variables, and theorems</div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => askAiForNote('exercises')}
                                        className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border hover:border-brand-primary/40 bg-brand-surface hover:bg-brand-primary/5 text-left text-xs transition-all hover:shadow-xs group duration-200"
                                      >
                                        <Calculator size={16} className="text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <div className="font-bold text-brand-text text-xs">Create Active Exercises</div>
                                          <div className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Generate 3 custom practice problems with solved key indices</div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => askAiForNote('latex')}
                                        className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border hover:border-brand-primary/40 bg-brand-surface hover:bg-brand-primary/5 text-left text-xs transition-all hover:shadow-xs group duration-200"
                                      >
                                        <FileText size={16} className="text-indigo-400 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <div className="font-bold text-brand-text text-xs">Standardize LaTeX Math</div>
                                          <div className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Prettify calculations by formatting variables in standard KaTeX bounds</div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => askAiForNote('summary')}
                                        className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border hover:border-brand-primary/40 bg-brand-surface hover:bg-brand-primary/5 text-left text-xs transition-all hover:shadow-xs group duration-200 col-span-1 sm:col-span-2"
                                      >
                                        <RefreshCw size={16} className="text-purple-400 mt-0.5 animate-pulse" />
                                        <div>
                                          <div className="font-bold text-brand-text text-xs">High-Density Cheat Sheet</div>
                                          <div className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Condense notes into visual takeaways, subheadings, and quick-access parameters</div>
                                        </div>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    </>
                  ) : (
                    /* Initial select notes frame if empty/unselected */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 select-none bg-brand-bg/5">
                      <div className="w-14 h-14 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center text-brand-text-secondary shadow-xs">
                        <StickyNote className="text-brand-primary animate-pulse" size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-text mb-1 uppercase tracking-wider">No Active Study Sheet</h3>
                        <p className="text-[11px] text-brand-text-secondary max-w-xs mx-auto">Create a new math note in the sidebar or select an existing one to begin writing equations.</p>
                      </div>
                      <button 
                        onClick={addNote}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-brand-primary text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                      >
                        <Plus size={14} /> Start Fresh Note
                      </button>
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
