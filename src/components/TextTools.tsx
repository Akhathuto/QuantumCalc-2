import React, { useState, useMemo } from 'react';
import { Hash, CaseSensitive, Replace, FileText, Type, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

// Reusable UI Components
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void; layoutId?: string }> = ({ label, icon: Icon, isActive, onClick, layoutId }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-4 py-3 md:py-4 md:justify-start justify-center flex items-center gap-3 rounded-xl font-bold transition-all duration-300 text-sm min-w-[140px] md:min-w-0 w-full relative ${
            isActive 
                ? 'text-brand-primary' 
                : 'text-brand-text-secondary hover:text-white hover:bg-brand-surface/50'
        }`}
    >
        {isActive && (
            <motion.div 
                layoutId={layoutId}
                className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <Icon size={18} className="relative z-10" />
        <span className="relative z-10">{label}</span>
    </button>
);

const ResultCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
    <div className="bg-brand-bg p-4 rounded-lg text-center flex-1">
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-brand-accent my-1 break-words">{value}</p>
        {description && <p className="text-xs text-brand-text-secondary">{description}</p>}
    </div>
);

const WordCounter = () => {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
        const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
        
        // Average reading speed is ~200-250 words per minute
        const readingTimeMin = Math.ceil(words / 225);

        return { words, chars, charsNoSpaces, paragraphs, sentences, readingTimeMin };
    }, [text]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border/40 space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-2xl p-4 focus:ring-2 focus:ring-brand-primary outline-none font-sans resize-y transition-all placeholder:text-brand-text-secondary/35"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ResultCard title="Words" value={stats.words} />
                <ResultCard title="Characters" value={stats.chars} />
                <ResultCard title="Characters (No Spaces)" value={stats.charsNoSpaces} />
                <ResultCard title="Sentences" value={stats.sentences} />
                <ResultCard title="Paragraphs" value={stats.paragraphs} />
                <ResultCard title="Reading Time" value={`~${stats.readingTimeMin} min`} />
            </div>
        </div>
    );
};

const CaseConverter = () => {
    const [text, setText] = useState('');

    const convertCase = (type: string) => {
        switch (type) {
            case 'upper':
                setText(text.toUpperCase());
                break;
            case 'lower':
                setText(text.toLowerCase());
                break;
            case 'title':
                setText(text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
                break;
            case 'sentence':
                setText(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
                break;
            case 'camel':
                setText(text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                }).replace(/\s+/g, ''));
                break;
            case 'snake':
                setText(text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '');
                break;
            case 'kebab':
                setText(text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '');
                break;
        }
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border/40 space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-2xl p-4 focus:ring-2 focus:ring-brand-primary outline-none font-sans resize-y transition-all placeholder:text-brand-text-secondary/35"
            />
            <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => convertCase('upper')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">UPPERCASE</button>
                <button onClick={() => convertCase('lower')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">lowercase</button>
                <button onClick={() => convertCase('title')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">Title Case</button>
                <button onClick={() => convertCase('sentence')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">Sentence case</button>
                <button onClick={() => convertCase('camel')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">camelCase</button>
                <button onClick={() => convertCase('snake')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">snake_case</button>
                <button onClick={() => convertCase('kebab')} className="px-4 py-2 bg-brand-bg hover:bg-brand-primary rounded-md transition-colors">kebab-case</button>
            </div>
        </div>
    );
};

const FindAndReplace = () => {
    const [text, setText] = useState('');
    const [find, setFind] = useState('');
    const [replace, setReplace] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);

    const handleReplace = () => {
        if (!find) return;
        try {
            let flags = 'g';
            if (!matchCase) flags += 'i';
            
            let searchPattern;
            if (useRegex) {
                searchPattern = new RegExp(find, flags);
            } else {
                // Escape regex characters if not using regex
                const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                searchPattern = new RegExp(escapedFind, flags);
            }
            
            setText(text.replace(searchPattern, replace));
        } catch (e) {
            alert("Invalid Regular Expression");
        }
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border/40 space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-2xl p-4 focus:ring-2 focus:ring-brand-primary outline-none font-sans resize-y transition-all placeholder:text-brand-text-secondary/35"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Find</label>
                    <input type="text" value={find} onChange={e => setFind(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-xl p-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-mono" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Replace With</label>
                    <input type="text" value={replace} onChange={e => setReplace(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-xl p-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="rounded border-brand-border text-brand-primary bg-brand-bg focus:ring-brand-primary/50 cursor-pointer h-4 w-4 transition-all" />
                    <span className="text-sm text-brand-text-secondary">Match Case</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} className="rounded border-brand-border text-brand-primary bg-brand-bg focus:ring-brand-primary/50 cursor-pointer h-4 w-4 transition-all" />
                    <span className="text-sm text-brand-text-secondary">Use Regex</span>
                </label>
            </div>
            <button onClick={handleReplace} className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-md font-semibold transition-colors">
                Replace All
            </button>
        </div>
    );
};

const HashGenerator = () => {
    const [text, setText] = useState('');
    const [hashType, setHashType] = useState('base64');
    const [copied, setCopied] = useState(false);
    
    const result = useMemo(() => {
        if (!text) return '';
        try {
            if (hashType === 'base64') {
                return btoa(unescape(encodeURIComponent(text)));
            } else if (hashType === 'base64decode') {
                return decodeURIComponent(escape(atob(text)));
            } else if (hashType === 'urlencode') {
                return encodeURIComponent(text);
            } else if (hashType === 'urldecode') {
                return decodeURIComponent(text);
            }
            return 'Not implemented in browser';
        } catch (e) {
            return 'Error: Invalid input for decoding';
        }
    }, [text, hashType]);

    const handleCopy = () => {
        if (result && !result.startsWith('Error')) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-2xl border border-brand-border/40 space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-32 bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-2xl p-4 focus:ring-2 focus:ring-brand-primary outline-none font-sans resize-y transition-all placeholder:text-brand-text-secondary/35"
            />
            
            <div>
                <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Operation</label>
                <select value={hashType} onChange={e => setHashType(e.target.value)} className="w-full bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-xl p-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer">
                    <option value="base64">Base64 Encode</option>
                    <option value="base64decode">Base64 Decode</option>
                    <option value="urlencode">URL Encode</option>
                    <option value="urldecode">URL Decode</option>
                </select>
            </div>

            <div className="bg-brand-bg p-4 rounded-lg relative group">
                <p className="text-sm text-brand-text-secondary mb-2">Result</p>
                <div className="flex items-start justify-between gap-4">
                    <p className="font-mono break-all text-brand-accent">{result || 'Waiting for input...'}</p>
                    {result && !result.startsWith('Error') && (
                        <button
                            onClick={handleCopy}
                            className="p-2 bg-brand-surface hover:bg-brand-primary rounded-md transition-colors text-white mt-1 shrink-0"
                            title="Copy to clipboard"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TextTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState('wordcount');

    const tools = [
        { id: 'wordcount', label: 'Word Counter', Icon: FileText },
        { id: 'case', label: 'Case Converter', Icon: CaseSensitive },
        { id: 'replace', label: 'Find & Replace', Icon: Replace },
        { id: 'hash', label: 'Encoders/Decoders', Icon: Hash },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'wordcount': return <WordCounter />;
            case 'case': return <CaseConverter />;
            case 'replace': return <FindAndReplace />;
            case 'hash': return <HashGenerator />;
            default: return null;
        }
    };

    const activeToolData = tools.find(t => t.id === activeTool);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-12 md:mb-16">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-mono mb-4 border border-brand-primary/20"
                >
                    <Type size={14} /> Text Protocol
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Text Processing
                </h2>
                <p className="text-brand-text-secondary mt-4 max-w-2xl font-mono text-sm leading-relaxed">
                    A suite of high-performance tools for string manipulation, data formatting, and textual operations. Data never leaves your browser.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                <div className="w-full md:w-64 flex-shrink-0 md:sticky top-[100px] z-30 mb-4 md:mb-0">
                    {/* Mobile Navigation Dropdown */}
                    <div className="md:hidden sticky top-2 z-40 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="rounded-2xl bg-brand-surface/95 border border-brand-primary/20 backdrop-blur-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] shadow-brand-bg">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Type size={14} className="text-brand-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Text Engine</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{tools.find(t => t.id === activeTool)?.label}</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={activeTool}
                                    onChange={(e) => setActiveTool(e.target.value)}
                                    className="w-full appearance-none bg-brand-bg border border-brand-border/50 hover:border-brand-primary/50 text-brand-text text-sm font-bold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                                >
                                    {tools.map(tool => (
                                        <option key={tool.id} value={tool.id} className="bg-brand-bg text-brand-text font-bold">
                                            {tool.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-brand-text">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation List */}
                    <div className="hidden md:flex flex-col gap-2 pb-0 mask-fade-edges hover:no-scrollbar overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                        <div className="flex flex-col gap-2">
                            {tools.map(tool => (
                                 <SubNavButton 
                                    key={tool.id}
                                    label={tool.label} 
                                    icon={tool.Icon}
                                    isActive={activeTool === tool.id} 
                                    onClick={() => setActiveTool(tool.id)} 
                                    layoutId="textNavActive"
                                 />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-w-0 pb-20">
                    <div className="mb-8 pb-6 border-b border-brand-border/40">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            {activeToolData?.Icon && React.createElement(activeToolData.Icon, { size: 28, className: "text-brand-primary" })}
                            {activeToolData?.label}
                        </h3>
                    </div>

                    <motion.div 
                        key={activeTool}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-brand-surface/20 p-6 md:p-10 rounded-[2.5rem] border border-brand-border/40 shadow-inner backdrop-blur-sm"
                    >
                        {renderTool()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TextTools;
