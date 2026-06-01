import React, { useState, useMemo, useEffect } from 'react';
import { 
    Braces, 
    Key,
    Code, 
    Lock, 
    RefreshCw, 
    Layers, 
    Clock, 
    Palette, 
    CaseSensitive,
    Copy,
    Check,
    Terminal,
    AlertTriangle,
    Fingerprint,
    Link,
    ChevronDown,
    AlignLeft,
    Calendar,
    FileText
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import cronstrue from 'cronstrue';
import cronParser from 'cron-parser';
import ReactMarkdown from 'react-markdown';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-500' : 'bg-brand-bg/50 text-brand-text-secondary hover:text-white'}`}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
    );
};

const EncoderDecoder = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'b64' | 'url' | 'html'>('b64');

    const handleEncode = () => {
        try {
            if (mode === 'b64') setOutput(window.btoa(input));
            else if (mode === 'url') setOutput(encodeURIComponent(input));
            else setOutput(input.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m)));
        } catch (e) {
            setOutput('Encoding failed: Check input format');
        }
    };

    const handleDecode = () => {
        try {
            if (mode === 'b64') setOutput(window.atob(input));
            else if (mode === 'url') setOutput(decodeURIComponent(input));
            else {
                const doc = new DOMParser().parseFromString(input, "text/html");
                setOutput(doc.documentElement.textContent || "");
            }
        } catch (e) {
            setOutput('Decoding failed: Check input format');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-brand-bg/40 rounded-xl border border-brand-border/40 w-fit">
                {(['b64', 'url', 'html'] as const).map(m => (
                    <button 
                        key={m}
                        onClick={() => setMode(m)}
                        className={`text-[10px] px-4 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-brand-primary text-brand-bg shadow-md' : 'text-brand-text-secondary hover:text-white'}`}
                    >
                        {m === 'b64' ? 'Base64' : m.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Source Input</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Enter text to process..."
                        className="w-full h-64 bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary ring-0 outline-none font-mono text-sm leading-relaxed transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Processed Result</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Resolution will appear here..."
                        className="w-full h-64 bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/20 font-mono text-sm leading-relaxed text-brand-primary shadow-inner"
                    />
                </div>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={handleEncode} 
                    className="flex-1 py-4 bg-brand-primary text-brand-bg rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Encode Data
                </button>
                <button 
                    onClick={handleDecode} 
                    className="flex-1 py-4 bg-brand-surface border border-brand-border rounded-2xl font-black uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                >
                    Decode Data
                </button>
            </div>
        </div>
    );
};

const Hasher = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512'>('SHA-256');

    const generateHash = async () => {
        if (!input) return;
        const msgUint8 = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setOutput(hashHex);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex gap-2 p-1 bg-brand-bg/40 rounded-xl border border-brand-border/40 w-fit">
                {(['SHA-256', 'SHA-512'] as const).map(a => (
                    <button 
                        key={a}
                        onClick={() => setAlgorithm(a)}
                        className={`text-[10px] px-4 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all ${algorithm === a ? 'bg-brand-primary text-brand-bg' : 'text-brand-text-secondary hover:text-white'}`}
                    >
                        {a}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Enter string to hash with ${algorithm}...`}
                    className="w-full h-48 bg-brand-bg/50 p-6 rounded-[2.5rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner"
                />
                <button 
                    onClick={generateHash} 
                    className="w-full py-5 bg-brand-primary text-brand-bg rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                >
                    <RefreshCw size={20} /> Generate Cryptographic Hash
                </button>
                {output && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-brand-bg rounded-[2rem] border border-brand-border font-mono text-sm break-all text-brand-primary relative group"
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={output} />
                        </div>
                        <p className="text-[10px] uppercase font-black text-brand-text-secondary tracking-widest mb-2">Checksum Output</p>
                        {output}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const JsonFormatter = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const handleFormat = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError('');
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (err: any) {
            setError(err.message || 'Invalid JSON syntax detected');
            setOutput('');
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) return;
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (err: any) {
            setError(err.message || 'Invalid JSON syntax');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Input JSON Fragment</label>
                    <button onClick={() => setInput('')} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300">Clear</button>
                </div>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder='{"id": 1, "status": "active"}'
                    className="w-full h-[32rem] bg-brand-bg/50 p-6 rounded-[3rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm leading-relaxed shadow-inner resize-none"
                />
                <div className="flex gap-3">
                    <button 
                        onClick={handleFormat}
                        className="flex-1 py-4 bg-brand-primary text-brand-bg rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Beautify
                    </button>
                    <button 
                        onClick={handleMinify}
                        className="flex-1 py-4 bg-brand-surface border border-brand-border rounded-2xl font-black uppercase tracking-widest hover:border-brand-primary transition-all"
                    >
                        Minify
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Validated Viewport</label>
                    {output && <CopyButton text={output} />}
                </div>
                {error ? (
                    <div className="w-full h-[32rem] bg-red-500/5 border border-red-500/30 p-8 rounded-[3rem] text-red-400 font-mono text-sm overflow-auto backdrop-blur-md text-wrap break-all">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} />
                            <span className="font-bold uppercase tracking-widest text-xs">Syntax Error</span>
                        </div>
                        {error}
                    </div>
                ) : (
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Formatted structure will resolve here..."
                        className="w-full h-[32rem] bg-brand-bg/60 p-8 rounded-[3rem] border border-brand-border font-mono text-sm leading-relaxed text-brand-accent shadow-inner resize-none"
                    />
                )}
            </div>
        </div>
    );
};

const EpochConverter = () => {
    // Standard practice to initialize with static if possible, or use a function
    const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / 1000).toString());
    
    const date = useMemo(() => {
        try {
            const e = Number(epoch);
            if (isNaN(e)) return null;
            // Handle both seconds and milliseconds
            const d = new Date(e > 100000000000 ? e : e * 1000);
            const now = new Date();
            return {
                iso: d.toISOString(),
                local: d.toLocaleString(),
                utc: d.toUTCString(),
                relative: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                    Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 
                    'day'
                )
            };
        } catch { return null; }
    }, [epoch]);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Unix Timestamp (Epoch)</label>
                <div className="flex gap-3">
                    <input 
                        type="text"
                        value={epoch}
                        onChange={e => setEpoch(e.target.value)}
                        className="flex-1 bg-brand-bg/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-xl font-bold shadow-inner"
                    />
                    <button 
                        onClick={() => setEpoch(Math.floor(Date.now() / 1000).toString())}
                        className="px-6 bg-brand-surface border border-brand-border rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-brand-primary transition-all"
                    >
                        Current
                    </button>
                </div>
            </div>

            {date && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: 'ISO 8601', value: date.iso },
                        { label: 'Local Time', value: date.local },
                        { label: 'UTC Format', value: date.utc },
                        { label: 'Relative Estimate', value: date.relative }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-brand-bg/40 rounded-2xl border border-brand-border/60 hover:border-brand-primary/30 transition-all group relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={item.value} />
                            </div>
                            <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{item.label}</p>
                            <p className="font-mono text-sm text-brand-text truncate pr-8">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CaseConverter = () => {
    const [text, setText] = useState('');
    
    const conversions = useMemo(() => {
        if (!text.trim()) return [];
        const words = text.split(/[^a-zA-Z0-9]+/).filter(Boolean);
        if (words.length === 0) return [];

        const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        const snake = words.join('_').toLowerCase();
        const kebab = words.join('-').toLowerCase();
        const constant = words.join('_').toUpperCase();

        return [
            { label: 'camelCase', value: camel },
            { label: 'PascalCase', value: pascal },
            { label: 'snake_case', value: snake },
            { label: 'kebab-case', value: kebab },
            { label: 'CONSTANT_CASE', value: constant },
        ];
    }, [text]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Variable / Path Input</label>
                <input 
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Enter keywords or phrases..."
                    className="w-full bg-brand-bg/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-xl font-bold shadow-inner"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversions.map((conv, i) => (
                    <div key={i} className="p-6 bg-brand-surface/40 rounded-2xl border border-brand-border/60 hover:border-brand-primary/30 transition-all group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={conv.value} />
                        </div>
                        <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{conv.label}</p>
                        <p className="font-mono text-sm text-brand-text truncate pr-8">{conv.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ColorSuite = () => {
    const [color, setColor] = useState('#6366f1');
    
    const colorData = useMemo(() => {
        // Simple hex/rgb conversion
        const hex = color.startsWith('#') ? color : '#6366f1';
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const b = parseInt(hex.slice(5, 7), 16) || 0;
        
        // Luminance for contrast
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const isLight = lum > 0.5;

        return {
            hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: 'Calculating...', // Simplified for now
            isLight
        };
    }, [color]);

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Color Specification</label>
                    <div className="flex gap-4">
                        <input 
                            type="color"
                            value={colorData.hex}
                            onChange={e => setColor(e.target.value)}
                            className="h-20 w-20 rounded-2xl border-4 border-brand-border cursor-pointer bg-transparent overflow-hidden"
                        />
                        <input 
                            type="text"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="flex-1 bg-brand-bg/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-2xl font-bold shadow-inner"
                        />
                    </div>
                </div>
                
                <div 
                    className="h-48 rounded-[3rem] border border-brand-border shadow-2xl flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: colorData.hex }}
                >
                    <span className={`font-black text-3xl tracking-tighter ${colorData.isLight ? 'text-black' : 'text-white'}`}>
                        PREVIEW REVEALED
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Hex Code', value: colorData.hex },
                    { label: 'RGB Vector', value: colorData.rgb },
                    { label: 'Contrast Ratio', value: colorData.isLight ? 'Light (Dark UI)' : 'Dark (Light UI)' }
                ].map((item, i) => (
                    <div key={i} className="p-8 bg-brand-surface/40 rounded-[2rem] border border-brand-border/60 hover:border-brand-primary/30 transition-all group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={item.value} />
                        </div>
                        <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-3">{item.label}</p>
                        <p className="font-mono text-lg text-brand-text font-bold">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VisualDiff = () => {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    
    // Simple line-by-line diff
    const diffResult = useMemo(() => {
        const leftLines = left.split('\n');
        const rightLines = right.split('\n');
        const max = Math.max(leftLines.length, rightLines.length);
        
        const lines = [];
        for (let i = 0; i < max; i++) {
            const l = leftLines[i] || '';
            const r = rightLines[i] || '';
            lines.push({
                left: l,
                right: r,
                isDifferent: l !== r
            });
        }
        return lines;
    }, [left, right]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Baseline Sequence</label>
                    <textarea
                        value={left}
                        onChange={e => setLeft(e.target.value)}
                        placeholder="Paste original content..."
                        className="w-full h-48 bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Mutation Sequence</label>
                    <textarea
                        value={right}
                        onChange={e => setRight(e.target.value)}
                        placeholder="Paste modified content..."
                        className="w-full h-48 bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
                    />
                </div>
            </div>

            <div className="bg-brand-bg/60 p-8 rounded-[3rem] border border-brand-border shadow-inner max-h-[30rem] overflow-auto">
                <div className="space-y-1 font-mono text-xs">
                    {diffResult.map((line, i) => (
                        <div key={i} className={`grid grid-cols-2 gap-4 p-1 rounded transition-colors ${line.isDifferent ? 'bg-brand-primary/5' : ''}`}>
                            <div className={`p-2 rounded overflow-hidden whitespace-pre-wrap ${line.isDifferent ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-brand-text-secondary opacity-60'}`}>
                                <span className="opacity-20 mr-2">{i + 1}</span> {line.left}
                            </div>
                            <div className={`p-2 rounded overflow-hidden whitespace-pre-wrap ${line.isDifferent ? 'bg-green-500/10 text-green-400 border border-green-500/20 font-bold' : 'text-brand-text-secondary opacity-60'}`}>
                                <span className="opacity-20 mr-2">{i + 1}</span> {line.right}
                            </div>
                        </div>
                    ))}
                    {diffResult.length === 0 && <p className="text-center opacity-20 py-20 italic">Awaiting comparison data streams...</p>}
                </div>
            </div>
        </div>
    );
};

const JwtDecoder = () => {
    const [token, setToken] = useState('');

    const decoded = useMemo(() => {
        if (!token.trim()) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Invalid JWT format - standard JWTs require 3 segments separated by dots.');

            const decodeBase64Url = (str: string) => {
                let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) base64 += '=';
                return decodeURIComponent(escape(atob(base64)));
            };

            const header = JSON.parse(decodeBase64Url(parts[0]));
            const payload = JSON.parse(decodeBase64Url(parts[1]));

            return { header, payload, error: null };
        } catch (err: any) {
            return { header: null, payload: null, error: err.message || 'Failed to decode JWT sequence' };
        }
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Encoded Token String</label>
                <textarea
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full h-32 bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner break-all resize-none"
                />
            </div>
            
            <AnimatePresence mode="wait">
                {decoded?.error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-mono mb-4"
                    >
                        {decoded.error}
                    </motion.div>
                )}
            </AnimatePresence>

            {decoded && !decoded.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Header Meta</label>
                            <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
                        </div>
                        <pre className="w-full bg-brand-bg/40 p-6 rounded-[2.5rem] border border-brand-border font-mono text-xs overflow-auto text-pink-400 min-h-[15rem]">
                            {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Payload Logic</label>
                            <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
                        </div>
                        <pre className="w-full bg-brand-bg/40 p-6 rounded-[2.5rem] border border-brand-border font-mono text-xs overflow-auto text-brand-primary min-h-[15rem]">
                            {JSON.stringify(decoded.payload, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

const RegexTester = () => {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('');

    const result = useMemo(() => {
        if (!pattern) return { matches: [], error: null };
        try {
            const regex = new RegExp(pattern, flags);
            const matches = [];
            let match;
            
            if (flags.includes('g')) {
                let safety = 0;
                while ((match = regex.exec(testString)) !== null && safety < 1000) {
                    safety++;
                    matches.push({ value: match[0], index: match.index });
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                }
            } else {
                match = regex.exec(testString);
                if (match) matches.push({ value: match[0], index: match.index });
            }
            
            return { matches, error: null };
        } catch (err: any) {
            return { matches: [], error: err.message };
        }
    }, [pattern, flags, testString]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">RegExp Pattern</label>
                    <div className="flex items-center bg-brand-bg/50 rounded-2xl border border-brand-border focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20 transition-all shadow-inner px-4 overflow-hidden">
                        <span className="text-brand-text-secondary font-mono opacity-30 text-xl">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={e => setPattern(e.target.value)}
                            placeholder="[a-z0-9]+"
                            className="w-full bg-transparent p-4 outline-none font-mono text-lg text-brand-primary font-bold"
                        />
                        <span className="text-brand-text-secondary font-mono opacity-30 text-xl">/</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Flags</label>
                    <input
                        type="text"
                        value={flags}
                        onChange={e => setFlags(e.target.value)}
                        placeholder="gim..."
                        className="w-full bg-brand-bg/50 p-4 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-lg text-brand-secondary shadow-inner"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Test Corpus</label>
                    <textarea
                        value={testString}
                        onChange={e => setTestString(e.target.value)}
                        placeholder="Paste text to test against logic..."
                        className="w-full h-64 bg-brand-bg/50 p-6 rounded-[2.5rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Execution Results</label>
                    <div className="w-full h-64 bg-brand-bg/40 p-6 rounded-[2.5rem] border border-brand-border overflow-auto shadow-inner">
                        {result.error ? (
                            <div className="text-red-400 font-mono text-xs">{result.error}</div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{result.matches.length} SELECTIONS FOUND</p>
                                {result.matches.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                        <span className="text-[9px] font-black opacity-30">#{i+1}</span>
                                        <span className="font-mono text-brand-primary text-sm font-bold">"{m.value}"</span>
                                        <span className="ml-auto text-[9px] font-mono opacity-40">IDX: {m.index}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UuidGenerator = () => {
    const [uuids, setUuids] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(5);

    const generate = React.useCallback(() => {
        const newUuids = Array.from({ length: quantity }, () => crypto.randomUUID());
        setUuids(newUuids);
    }, [quantity]);

    React.useEffect(() => {
        generate();
    }, [generate]);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4 items-end">
                <div className="space-y-4 flex-1">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Quantity Remaining (1-100)</label>
                    <input 
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value) || 1)}
                        className="w-full bg-brand-bg/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-xl font-bold shadow-inner"
                    />
                </div>
                <button 
                    onClick={generate} 
                    className="h-[76px] px-8 bg-brand-primary text-brand-bg rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                >
                    <RefreshCw size={20} /> Generate
                </button>
            </div>

            <div className="space-y-3 max-h-[30rem] overflow-auto pr-2 custom-scrollbar">
                {uuids.map((uuid, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-brand-surface/40 rounded-xl border border-brand-border/60 hover:border-brand-primary/30 transition-all group relative">
                        <span className="font-mono text-brand-text block tracking-wider">{uuid}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2">
                            <CopyButton text={uuid} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UrlParser = () => {
    const [urlInput, setUrlInput] = useState('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    
    const parsed = useMemo(() => {
        if (!urlInput.trim()) return null;
        try {
            const u = new URL(urlInput);
            const params: Record<string, string> = {};
            u.searchParams.forEach((v, k) => { params[k] = v; });
            return {
                href: u.href,
                protocol: u.protocol,
                host: u.host,
                hostname: u.hostname,
                port: u.port,
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
                username: u.username,
                password: u.password,
                params
            };
        } catch {
            return null;
        }
    }, [urlInput]);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">URL String</label>
                <textarea
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-bg/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner break-all resize-none h-24"
                />
            </div>

            {parsed ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Protocol', value: parsed.protocol },
                        { label: 'Hostname', value: parsed.hostname },
                        { label: 'Port', value: parsed.port || '(default)' },
                        { label: 'Path', value: parsed.pathname },
                        { label: 'Query Str', value: parsed.search },
                        { label: 'Hash Fragment', value: parsed.hash },
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-brand-surface/40 rounded-2xl border border-brand-border/60 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={item.value} />
                            </div>
                            <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{item.label}</p>
                            <p className="font-mono text-sm text-brand-text truncate pr-8">{item.value || <span className="opacity-30 italic">none</span>}</p>
                        </div>
                    ))}

                    {Object.keys(parsed.params).length > 0 && (
                        <div className="lg:col-span-3 space-y-4 mt-4">
                            <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Search Params Breakdown</label>
                            <div className="bg-brand-bg/60 rounded-[2rem] border border-brand-border shadow-inner p-6">
                                <div className="space-y-2">
                                    {Object.entries(parsed.params).map(([k, v], i) => (
                                        <div key={i} className="grid grid-cols-3 gap-4 p-3 bg-brand-surface/40 rounded-xl border border-brand-border/40">
                                            <div className="font-black text-[10px] uppercase text-brand-primary tracking-wider truncate">{k}</div>
                                            <div className="col-span-2 font-mono text-sm text-brand-text break-all">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-8 text-center bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 font-mono text-sm">
                    Invalid URL syntax. Ensure you include a valid protocol (e.g., https://)
                </div>
            )}
        </div>
    );
};


const CronParserTool = () => {
    const [input, setInput] = useState('*/5 * * * *');
    const [explanation, setExplanation] = useState('');
    const [nextRuns, setNextRuns] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            if (!input.trim()) {
                setExplanation('');
                setNextRuns([]);
                setError('');
                return;
            }
            const desc = cronstrue.toString(input, { throwExceptionOnParseError: true });
            setExplanation(desc);
            
            const interval = cronParser.parseExpression(input);
            const runs = [];
            for (let i = 0; i < 5; i++) {
                runs.push(interval.next().toString());
            }
            setNextRuns(runs);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Invalid cron expression format');
            setExplanation('');
            setNextRuns([]);
        }
    }, [input]);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Cron Expression</label>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="* * * * *"
                    className="w-full bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary ring-0 outline-none font-mono text-xl text-center shadow-inner tracking-[0.5em]"
                />
            </div>
            
            {error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-[2rem] text-red-500 flex items-center gap-3 font-mono text-sm shadow-inner">
                    <AlertTriangle size={16} /> {error}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-8 bg-brand-primary/10 border border-brand-primary/30 rounded-[2.5rem] shadow-xl text-center">
                        <div className="text-[10px] uppercase font-black text-brand-primary tracking-widest mb-3">Human Readable Interval</div>
                        <h4 className="text-2xl font-black text-brand-text">{explanation}</h4>
                    </div>
                    
                    <div className="bg-brand-bg border border-brand-border p-6 rounded-[2rem] space-y-4 shadow-inner">
                        <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2 border-b border-brand-border/30 pb-3 flex items-center gap-2">
                            <Clock size={12} className="text-brand-primary" /> Next Predicted Executions
                        </div>
                        <div className="space-y-2">
                            {nextRuns.map((time, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl border border-brand-border/20 font-mono text-sm">
                                    <span className="text-brand-text-secondary text-xs">Run {i + 1}</span>
                                    <span className="text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg">{time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LoremGenerator = () => {
    const [paragraphs, setParagraphs] = useState(3);
    const [output, setOutput] = useState('');
    const generate = React.useCallback(() => {
        const corpus = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];
        
        const result = Array.from({ length: paragraphs }).map(() => {
            const sentenceCount = 4 + Math.floor(Math.random() * 4);
            const sentences = Array.from({ length: sentenceCount }).map(() => {
                const wordCount = 6 + Math.floor(Math.random() * 8);
                const words = Array.from({ length: wordCount }).map(() => corpus[Math.floor(Math.random() * corpus.length)]);
                words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
                return words.join(' ') + '.';
            });
            return sentences.join(' ');
        });
        setOutput(result.join('\n\n'));
    }, [paragraphs]);
    
    useEffect(() => { generate(); }, [generate]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="space-y-2 flex-1 w-full">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Paragraph Count</label>
                    <div className="flex items-center gap-4 bg-brand-surface/40 p-2 rounded-[1.5rem] border border-brand-border/50">
                        <input type="range" min="1" max="20" value={paragraphs} onChange={e => setParagraphs(parseInt(e.target.value))} className="flex-1 accent-brand-primary ml-4" />
                        <span className="w-12 h-12 bg-brand-primary text-brand-bg rounded-xl flex items-center justify-center font-black text-lg">{paragraphs}</span>
                    </div>
                </div>
                <button onClick={generate} className="px-8 h-16 w-full md:w-auto bg-brand-surface border border-brand-border rounded-[1.5rem] font-black uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary group transition-all shrink-0">
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 inline-block mr-3" /> Regenerate
                </button>
            </div>
            
            <div className="relative">
                <div className="absolute top-4 right-4 z-10"><CopyButton text={output} /></div>
                <textarea
                    readOnly
                    value={output}
                    className="w-full h-80 bg-brand-bg/50 p-8 pt-16 rounded-[2rem] border border-brand-border ring-0 outline-none text-brand-text font-serif text-lg leading-relaxed shadow-inner custom-scrollbar"
                />
            </div>
        </div>
    );
};

const MarkdownPreviewer = () => {
    const [input, setInput] = useState('# Hello Developer\n\nWrite your **markdown** here to preview it in real-time.\n\n- Quick rendering\n- GitHub flavored syntax\n\n```js\nconsole.log("Syntax highlighting included!");\n```');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
            <div className="space-y-2 flex flex-col h-full">
                <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em]">Markdown Editor</label>
                    <CopyButton text={input} />
                </div>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full flex-1 bg-brand-bg/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm leading-relaxed shadow-inner min-h-[400px] resize-none"
                    placeholder="Enter markdown..."
                />
            </div>
            <div className="space-y-2 flex flex-col h-full">
                <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Rendered Preview</label>
                </div>
                <div className="w-full flex-1 bg-brand-surface/30 p-8 rounded-[2rem] border border-brand-border/50 shadow-inner overflow-auto min-h-[400px] prose prose-invert prose-brand max-w-none">
                    <ReactMarkdown>{input}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};


const tools = [
    { id: 'json', label: 'JSON Formatter', Icon: Braces, desc: 'Format, minify, and validate JSON data.', category: 'Formatting' },
    { id: 'jwt', label: 'JWT Decoder', Icon: Key, desc: 'Decode JSON Web Tokens and inspect payloads.', category: 'Security' },
    { id: 'uuid', label: 'UUID Gen', Icon: Fingerprint, desc: 'Generate standard v4 cryptographic UUIDs.', category: 'Utilities' },
    { id: 'url', label: 'URL Parser', Icon: Link, desc: 'Break down complex URLs into specific components.', category: 'Utilities' },
    { id: 'encoder', label: 'Encoders', Icon: Layers, desc: 'Base64, URL encoding, and HTML entities.', category: 'Formatting' },
    { id: 'regex', label: 'Regex Tester', Icon: Terminal, desc: 'Test regular expressions against practice text.', category: 'Testing' },
    { id: 'diff', label: 'Text Diff', Icon: Code, desc: 'Compare strings and source code side-by-side.', category: 'Testing' },
    { id: 'color', label: 'Color Suite', Icon: Palette, desc: 'Inspect colors and compute contrast ratios.', category: 'Design' },
    { id: 'hasher', label: 'Hash Generator', Icon: Lock, desc: 'Generate SHA-256 and SHA-512 checksums.', category: 'Security' },
    { id: 'epoch', label: 'Epoch Time', Icon: Clock, desc: 'Convert Unix timestamps to human-readable.', category: 'Utilities' },
    { id: 'case', label: 'String Case', Icon: CaseSensitive, desc: 'camelCase, snake_case, CONSTANT variables.', category: 'Formatting' },
    { id: 'cron', label: 'Cron Parser', Icon: Calendar, desc: 'Explain crons and predict next executions.', category: 'Utilities' },
    { id: 'lorem', label: 'Lorem Ipsum', Icon: AlignLeft, desc: 'Generate placeholder text dynamically.', category: 'Formatting' },
    { id: 'markdown', label: 'Markdown Preview', Icon: FileText, desc: 'Live preview GitHub flavored markdown.', category: 'Formatting' },
];

const DeveloperTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState('json');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTools = useMemo(() => 
        tools.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    const renderTool = () => {
        let component = null;
        switch (activeTool) {
            case 'json': component = <JsonFormatter />; break;
            case 'jwt': component = <JwtDecoder />; break;
            case 'uuid': component = <UuidGenerator />; break;
            case 'url': component = <UrlParser />; break;
            case 'encoder': component = <EncoderDecoder />; break;
            case 'hasher': component = <Hasher />; break;
            case 'epoch': component = <EpochConverter />; break;
            case 'case': component = <CaseConverter />; break;
            case 'regex': component = <RegexTester />; break;
            case 'diff': component = <VisualDiff />; break;
            case 'color': component = <ColorSuite />; break;
            case 'cron': component = <CronParserTool />; break;
            case 'lorem': component = <LoremGenerator />; break;
            case 'markdown': component = <MarkdownPreviewer />; break;
        }

        return (
            <motion.div
                key={activeTool}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-brand-surface/10 border border-brand-border/30 rounded-[3rem] p-8 md:p-12 shadow-inner"
            >
                <div className="mb-10 pb-6 border-b border-brand-border/20">
                    <h3 className="text-2xl font-black text-white">{activeToolData?.label}</h3>
                    <p className="text-brand-text-secondary text-sm mt-1">{activeToolData?.desc}</p>
                </div>
                {component}
            </motion.div>
        );
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
                    <Code size={14} /> Local Utilities
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Developer Workspace
                </h2>
                <p className="text-brand-text-secondary mt-4 max-w-2xl font-mono text-sm leading-relaxed">
                    A suite of high-performance tools for string manipulation, data formatting, and cryptographic operations. Data never leaves your browser.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0 md:sticky top-[100px] z-30 mb-4 md:mb-0">
                    <div className="flex flex-col gap-4">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search tools..."
                            className="w-full bg-brand-surface/20 border border-brand-border rounded-2xl p-4 text-sm text-white focus:border-brand-primary outline-none hidden md:block"
                        />

                        {/* Mobile Navigation Dropdown */}
                        <div className="md:hidden sticky top-2 z-40 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="rounded-2xl bg-brand-surface/95 border border-brand-primary/20 backdrop-blur-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] shadow-brand-bg">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <div className="flex items-center gap-2">
                                        <Code size={14} className="text-brand-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Utility</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{filteredTools.find(t => t.id === activeTool)?.label || 'Select Tool'}</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={activeTool}
                                        onChange={(e) => setActiveTool(e.target.value)}
                                        className="w-full appearance-none bg-brand-bg border border-brand-border/50 hover:border-brand-primary/50 text-brand-text text-sm font-bold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                                    >
                                        {Object.entries(
                                            filteredTools.reduce((acc, tool) => {
                                                if (!acc[tool.category]) acc[tool.category] = [];
                                                acc[tool.category].push(tool);
                                                return acc;
                                            }, {} as Record<string, typeof filteredTools>)
                                        ).map(([category, catTools]) => (
                                            <optgroup key={category} label={category} className="bg-brand-surface font-black text-brand-text-secondary">
                                                {catTools.map(tool => (
                                                    <option key={tool.id} value={tool.id} className="bg-brand-bg text-brand-text font-bold">
                                                        {tool.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-brand-text">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation List */}
                        <div className="hidden md:flex flex-col gap-8 pb-0 mask-fade-edges hover:no-scrollbar overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                            {Object.entries(
                                filteredTools.reduce((acc, tool) => {
                                    if (!acc[tool.category]) acc[tool.category] = [];
                                    acc[tool.category].push(tool);
                                    return acc;
                                }, {} as Record<string, typeof filteredTools>)
                            ).map(([category, catTools]) => (
                                <div key={category} className="space-y-4">
                                    <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2 px-1">
                                        {category}
                                    </div>
                                    <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                                        {catTools.map(tool => {
                                            const Icon = tool.Icon;
                                            const isActive = activeTool === tool.id;
                                            return (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => setActiveTool(tool.id)}
                                                    className={`group flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-300 w-full text-left
                                                        ${isActive 
                                                            ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-[1.02]' 
                                                            : 'bg-brand-surface/20 text-brand-text-secondary hover:bg-brand-surface/40 hover:text-brand-text hover:translate-x-1'
                                                        }`}
                                                >
                                                    <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-brand-bg/20' : 'bg-brand-bg/30 group-hover:bg-brand-bg/60'}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="font-black text-sm uppercase tracking-wider">{tool.label}</div>
                                                        <div className={`text-[10px] font-mono mt-1 opacity-70 truncate ${isActive ? 'text-brand-bg/80' : ''}`}>
                                                            {tool.desc}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0 pb-20">
                    <div className="mb-8 pb-6 border-b border-brand-border/40">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            {activeToolData?.Icon && React.createElement(activeToolData.Icon, { size: 28, className: "text-brand-primary" })}
                            {activeToolData?.label}
                        </h3>
                        <p className="text-brand-text-secondary font-mono text-xs mt-2 opacity-80">
                            {activeToolData?.desc}
                        </p>
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

export default DeveloperTools;

