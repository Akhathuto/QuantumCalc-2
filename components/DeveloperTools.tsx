import React, { useState, useMemo } from 'react';
import { Braces, Key, Regex, Code, Lock, RefreshCw, Layers } from 'lucide-react';

// Reusable UI Components
const SubNavButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-5 py-3 flex items-center gap-2.5 rounded-xl font-bold transition-all duration-300 text-sm ${
            isActive 
                ? 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20 scale-105' 
                : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

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
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="flex gap-2">
                {(['b64', 'url', 'html'] as const).map(m => (
                    <button 
                        key={m}
                        onClick={() => setMode(m)}
                        className={`text-xs px-3 py-1 rounded-full border ${mode === m ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-border text-brand-text-secondary'}`}
                    >
                        {m.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter text..."
                    className="h-48 bg-gray-900/70 p-4 rounded-md border border-brand-border font-mono text-sm"
                />
                <textarea
                    readOnly
                    value={output}
                    placeholder="Result will appear here..."
                    className="h-48 bg-gray-900/70 p-4 rounded-md border border-brand-border font-mono text-sm text-brand-accent"
                />
            </div>
            <div className="flex gap-2">
                <button onClick={handleEncode} className="flex-1 py-2 bg-brand-primary rounded-md font-bold">Encode</button>
                <button onClick={handleDecode} className="flex-1 py-2 bg-brand-secondary rounded-md font-bold">Decode</button>
            </div>
        </div>
    );
};

const Hasher = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const generateHash = async () => {
        if (!input) return;
        const msgUint8 = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setOutput(hashHex);
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4 text-center">
            <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter string to hash (SHA-256)..."
                className="w-full h-32 bg-gray-900/70 p-4 rounded-md border border-brand-border font-mono text-sm"
            />
            <button onClick={generateHash} className="w-full py-2 bg-brand-accent rounded-md font-bold flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Generate SHA-256 Hash
            </button>
            {output && (
                <div className="p-4 bg-brand-bg rounded border border-brand-border font-mono text-sm break-all text-brand-primary">
                    {output}
                </div>
            )}
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
            setError(err.message || 'Invalid JSON');
            setOutput('');
        }
    };

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-brand-text-secondary">Input JSON</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full h-64 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono text-sm resize-y"
                    />
                    <button 
                        onClick={handleFormat}
                        className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-md font-semibold transition-colors"
                    >
                        Format / Validate
                    </button>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-brand-text-secondary">Output</label>
                    {error ? (
                        <div className="w-full h-64 bg-red-900/20 border border-red-500/50 p-4 rounded-md text-red-400 font-mono text-sm overflow-auto">
                            {error}
                        </div>
                    ) : (
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Formatted JSON will appear here..."
                            className="w-full h-64 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono text-sm resize-y text-brand-accent"
                        />
                    )}
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
            if (parts.length !== 3) throw new Error('Invalid JWT format');

            const decodeBase64Url = (str: string) => {
                let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) base64 += '=';
                return decodeURIComponent(escape(atob(base64)));
            };

            const header = JSON.parse(decodeBase64Url(parts[0]));
            const payload = JSON.parse(decodeBase64Url(parts[1]));

            return { header, payload, error: null };
        } catch (err: any) {
            return { header: null, payload: null, error: err.message || 'Failed to decode JWT' };
        }
    }, [token]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-brand-text-secondary">JWT Token</label>
                <textarea
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full h-24 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono text-sm resize-y break-all"
                />
            </div>
            
            {decoded?.error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                    {decoded.error}
                </div>
            )}

            {decoded && !decoded.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-text-secondary">Header</label>
                        <pre className="w-full bg-gray-900/70 p-4 rounded-md border border-brand-border font-mono text-sm overflow-auto text-pink-400">
                            {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-text-secondary">Payload</label>
                        <pre className="w-full bg-gray-900/70 p-4 rounded-md border border-brand-border font-mono text-sm overflow-auto text-purple-400">
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
                while ((match = regex.exec(testString)) !== null) {
                    matches.push({
                        value: match[0],
                        index: match.index,
                        groups: match.groups
                    });
                    // Prevent infinite loops with zero-length matches
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                }
            } else {
                match = regex.exec(testString);
                if (match) {
                    matches.push({
                        value: match[0],
                        index: match.index,
                        groups: match.groups
                    });
                }
            }
            
            return { matches, error: null };
        } catch (err: any) {
            return { matches: [], error: err.message };
        }
    }, [pattern, flags, testString]);

    return (
        <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                    <label className="block text-sm font-medium text-brand-text-secondary">Regular Expression</label>
                    <div className="flex items-center bg-gray-900/70 rounded-md border border-brand-border focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
                        <span className="px-3 text-brand-text-secondary font-mono">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={e => setPattern(e.target.value)}
                            placeholder="pattern"
                            className="w-full bg-transparent p-2 outline-none font-mono text-sm"
                        />
                        <span className="px-3 text-brand-text-secondary font-mono">/</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-brand-text-secondary">Flags</label>
                    <input
                        type="text"
                        value={flags}
                        onChange={e => setFlags(e.target.value)}
                        placeholder="g, i, m..."
                        className="w-full bg-gray-900/70 p-2 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-brand-text-secondary">Test String</label>
                <textarea
                    value={testString}
                    onChange={e => setTestString(e.target.value)}
                    placeholder="Enter text to test your regex against..."
                    className="w-full h-32 bg-gray-900/70 p-4 rounded-md border border-brand-border focus:ring-brand-primary focus:border-brand-primary font-mono text-sm resize-y"
                />
            </div>

            {result.error ? (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                    {result.error}
                </div>
            ) : (
                <div className="bg-brand-bg p-4 rounded-lg">
                    <p className="text-sm text-brand-text-secondary mb-2">
                        {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'} found
                    </p>
                    {result.matches.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-auto">
                            {result.matches.map((m, i) => (
                                <div key={i} className="p-2 bg-brand-surface/50 rounded border border-brand-border/50 font-mono text-sm">
                                    <span className="text-brand-text-secondary mr-2">Match {i + 1}:</span>
                                    <span className="text-brand-accent">{m.value}</span>
                                    <span className="text-brand-text-secondary ml-4 text-xs">Index: {m.index}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DeveloperTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState('json');

    const tools = [
        { id: 'json', label: 'JSON Formatter', Icon: Braces },
        { id: 'jwt', label: 'JWT Decoder', Icon: Key },
        { id: 'regex', label: 'Regex Tester', Icon: Regex },
        { id: 'encoder', label: 'Encoder/Decoder', Icon: Layers },
        { id: 'hasher', label: 'SHA-256 Hasher', Icon: Lock },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'json': return <JsonFormatter />;
            case 'jwt': return <JwtDecoder />;
            case 'regex': return <RegexTester />;
            case 'encoder': return <EncoderDecoder />;
            case 'hasher': return <Hasher />;
            default: return null;
        }
    };

    return (
        <div>
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Code size={14} /> Developer Workspace
                </div>
                <h2 className="text-4xl font-extrabold text-brand-text mb-2 tracking-tight flex items-center justify-center gap-3">
                    <Braces size={36} className="text-brand-primary" /> Engineering Suite
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto font-light text-lg">
                    Production-grade tools for modern developers. Encode, decode, format, and hash with ease.
                </p>
            </div>
            
            <div className="sticky top-[80px] z-30 bg-brand-bg/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 mb-8">
                <div className="flex overflow-x-auto no-scrollbar gap-3 py-2 mask-fade-edges">
                    <div className="flex gap-2 mx-auto sm:justify-center min-w-max px-2">
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

            <div className="bg-brand-surface/30 p-4 md:p-8 rounded-[2rem] border border-brand-border/50 shadow-2xl">
                {renderTool()}
            </div>
        </div>
    );
};

export default DeveloperTools;
