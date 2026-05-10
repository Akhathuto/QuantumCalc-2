import React, { useState, useMemo } from 'react';
import { Hash, CaseSensitive, Replace, FileText } from 'lucide-react';

// Reusable UI Components
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 flex items-center gap-2 rounded-md font-semibold transition-colors text-sm ${isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}
    >
        <Icon size={16} />
        {label}
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
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-sans resize-y"
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
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-sans resize-y"
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
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-sans resize-y"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Find</label>
                    <input type="text" value={find} onChange={e => setFind(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Replace With</label>
                    <input type="text" value={replace} onChange={e => setReplace(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary bg-gray-900 border-gray-600" />
                    <span className="text-sm">Match Case</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary bg-gray-900 border-gray-600" />
                    <span className="text-sm">Use Regex</span>
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
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-32 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-sans resize-y"
            />
            
            <div>
                <label className="block text-sm font-medium mb-1">Operation</label>
                <select value={hashType} onChange={e => setHashType(e.target.value)} className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border">
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

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Text Tools</h2>
            
            <div className="flex justify-center flex-wrap gap-2 mb-6">
                {tools.map(tool => (
                     <SubNavButton 
                        key={tool.id}
                        label={tool.label} 
                        icon={tool.Icon}
                        isActive={activeTool === tool.id} 
                        onClick={() => setActiveTool(tool.id)} 
                     />
                ))}
            </div>

            {renderTool()}
        </div>
    );
};

export default TextTools;
