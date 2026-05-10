import React, { useState, useMemo } from 'react';
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
    Wand2,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Reusable UI Components
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-6 py-3.5 flex items-center gap-3 rounded-2xl font-black transition-all duration-300 text-xs tracking-widest uppercase ${
            isActive 
                ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20 scale-105' 
                : 'bg-brand-surface/40 border border-brand-border/40 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
        }`}
    >
        <Icon size={16} />
        {label}
    </button>
);

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
                        className="w-full h-64 bg-gray-900/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary ring-0 outline-none font-mono text-sm leading-relaxed transition-all shadow-inner"
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
                    className="w-full h-48 bg-gray-900/50 p-6 rounded-[2.5rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner"
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
                    className="w-full h-[32rem] bg-gray-900/50 p-6 rounded-[3rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm leading-relaxed shadow-inner resize-none"
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
                        className="flex-1 bg-gray-900/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-xl font-bold shadow-inner"
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
                    className="w-full bg-gray-900/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-xl font-bold shadow-inner"
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
                            className="flex-1 bg-gray-900/50 p-6 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-2xl font-bold shadow-inner"
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
                        className="w-full h-48 bg-gray-900/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] ml-2">Mutation Sequence</label>
                    <textarea
                        value={right}
                        onChange={e => setRight(e.target.value)}
                        placeholder="Paste modified content..."
                        className="w-full h-48 bg-gray-900/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
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
                    className="w-full h-32 bg-gray-900/50 p-6 rounded-[2rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner break-all resize-none"
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
                    <div className="flex items-center bg-gray-900/50 rounded-2xl border border-brand-border focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20 transition-all shadow-inner px-4 overflow-hidden">
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
                        className="w-full bg-gray-900/50 p-4 rounded-2xl border border-brand-border focus:border-brand-primary outline-none font-mono text-lg text-brand-secondary shadow-inner"
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
                        className="w-full h-64 bg-gray-900/50 p-6 rounded-[2.5rem] border border-brand-border focus:border-brand-primary outline-none font-mono text-sm shadow-inner resize-none"
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


const DeveloperTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState('json');

    const tools = [
        { id: 'json', label: 'Formatter', Icon: Braces },
        { id: 'jwt', label: 'JWT', Icon: Key },
        { id: 'encoder', label: 'Encoder', Icon: Layers },
        { id: 'regex', label: 'Regex', Icon: Terminal },
        { id: 'diff', label: 'Diff', Icon: Code },
        { id: 'color', label: 'Color', Icon: Palette },
        { id: 'hasher', label: 'Hasher', Icon: Lock },
        { id: 'epoch', label: 'Epoch', Icon: Clock },
        { id: 'case', label: 'Naming', Icon: CaseSensitive },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'json': return <JsonFormatter />;
            case 'jwt': return <JwtDecoder />;
            case 'encoder': return <EncoderDecoder />;
            case 'hasher': return <Hasher />;
            case 'epoch': return <EpochConverter />;
            case 'case': return <CaseConverter />;
            case 'regex': return <RegexTester />;
            case 'diff': return <VisualDiff />;
            case 'color': return <ColorSuite />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-12 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-brand-primary/20"
                >
                    <Code size={14} /> Engineering Protocol
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight flex items-center justify-center gap-4">
                    Developer Workspace
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto font-mono text-lg opacity-80 decoration-brand-primary underline-offset-8">
                    High-performance utilities for modern logic architectures.
                </p>
            </div>
            
            <div className="sticky top-[80px] z-30 bg-brand-bg/95 backdrop-blur-xl pb-6 pt-2 mb-10 border-b border-brand-border/20 -mx-4 px-4 overflow-hidden">
                <div className="flex overflow-x-auto no-scrollbar gap-4 py-2 px-2 mask-fade-edges justify-center">
                    <div className="flex gap-3 min-w-max">
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
                </div>
            </div>

            <motion.div 
                key={activeTool}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-brand-surface/20 p-6 md:p-12 rounded-[3.5rem] border border-brand-border/40 shadow-inner backdrop-blur-sm min-h-[40rem]"
            >
                {renderTool()}
            </motion.div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <div className="p-6 bg-brand-surface/30 rounded-3xl border border-brand-border/40 flex items-center gap-4">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><Wand2 size={20} /></div>
                    <div className="text-xs font-mono">Real-time local processing</div>
                </div>
                <div className="p-6 bg-brand-surface/30 rounded-3xl border border-brand-border/40 flex items-center gap-4">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><Lock size={20} /></div>
                    <div className="text-xs font-mono">Zero-data retention policy</div>
                </div>
                <div className="p-6 bg-brand-surface/30 rounded-3xl border border-brand-border/40 flex items-center gap-4">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><RefreshCw size={20} /></div>
                    <div className="text-xs font-mono">Multi-threaded algorithms</div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperTools;

