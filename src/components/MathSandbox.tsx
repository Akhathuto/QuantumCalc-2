import React, { useState, useEffect, useRef, useCallback } from 'react';
import { create, all } from 'mathjs';
import { 
    Terminal, Play, Copy, Check, Share2, 
    RefreshCw, Cpu, ChevronRight, FileCode, Plus, Trash,
    Radio, Users, WifiOff, Send, CheckSquare, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot } from 'firebase/firestore';

const math = create(all, { number: 'BigNumber', precision: 64 });

interface Parameter {
    name: string;
    value: string;
    description: string;
}

interface SandboxPreset {
    name: string;
    description: string;
    code: string;
    parameters: Parameter[];
}

const PRESETS: SandboxPreset[] = [
    {
        name: "Newton's Root Finder",
        description: "Applies Newton-Raphson method iteratively to solve f(x) = 0 for user defined function, x0 and iterations.",
        code: `// Define variables and initial state
var x = x0;
var logs = [];

for i = 1 to steps do
  // Evaluate the function and its derivative at current x
  var f_val = evaluate(expr, { x: x });
  var f_prime = evaluate(deriv, { x: x });
  
  if abs(f_prime) < 1e-12 then
    logs = concat(logs, "Step " + i + ": Derivative zero, aborted");
    break;
  end;
  
  var next_x = x - f_val / f_prime;
  logs = concat(logs, "Step " + i + ": x = " + round(x, 6) + " | f(x) = " + round(f_val, 6));
  x = next_x;
end;

// Return final results map
{
  result: x,
  steps: logs
}`,
        parameters: [
            { name: "expr", value: "x^2 - 5", description: "Target Equation function f(x)" },
            { name: "deriv", value: "2x", description: "First Derivative f'(x)" },
            { name: "x0", value: "2.0", description: "Initial guess approximation" },
            { name: "steps", value: "6", description: "Maximum iteration guard" }
        ]
    },
    {
        name: "Trapezoid Rule Integration",
        description: "Numerically integrates an algebraic equation using discrete trapezoidal bands.",
        code: `// Compute step interval width
var h = (b - a) / n;
var sum = 0.5 * (evaluate(expr, { x: a }) + evaluate(expr, { x: b }));

var logs = [];
logs = concat(logs, "Bound a: f(" + a + ") = " + round(evaluate(expr, { x: a }), 5));

for i = 1 to n - 1 do
  var x_val = a + i * h;
  var f_x = evaluate(expr, { x: x_val });
  sum = sum + f_x;
  logs = concat(logs, "X_i = " + round(x_val, 3) + " | f(x) = " + round(f_x, 5));
end;

logs = concat(logs, "Bound b: f(" + b + ") = " + round(evaluate(expr, { x: b }), 5));

{
  result: sum * h,
  steps: logs
}`,
        parameters: [
            { name: "expr", value: "sin(x) + x^2", description: "Function formula to integrate" },
            { name: "a", value: "0", description: "Lower bound integration limit" },
            { name: "b", value: "3.14159", description: "Upper bound integration limit" },
            { name: "n", value: "10", description: "Quantity of trapezoid intervals" }
        ]
    },
    {
        name: "Fibonacci Sequence Builder",
        description: "Generates custom Fibonacci outputs dynamically using custom parameters for limit bounds.",
        code: `var sequence = [1, 1];
var logs = ["1: F = 1", "2: F = 1"];

var count = limit;
if count < 2 then
  count = 2;
end;

for i = 3 to count do
  var next_val = sequence[i-1] + sequence[i-2];
  sequence = concat(sequence, next_val);
  logs = concat(logs, i + ": F = " + next_val);
end;

{
  result: sequence[count],
  steps: logs
}`,
        parameters: [
            { name: "limit", value: "12", description: "Maximum Fibonacci terms to compile" }
        ]
    },
    {
        name: "Compound Interest Workspace",
        description: "Iteratively tallies periodic visual growth metrics and prints compounding updates.",
        code: `var balance = principal;
var rate_fraction = rate / 100;
var logs = [];

for year = 1 to duration do
  var interest = balance * rate_fraction;
  balance = balance + interest + contribution * 12;
  logs = concat(logs, "Year " + year + ": Interest: +" + round(interest, 2) + " | Balance: " + round(balance, 2));
end;

{
  result: balance,
  steps: logs
}`,
        parameters: [
            { name: "principal", value: "10000", description: "Initial setup balance" },
            { name: "rate", value: "6.5", description: "Annual nominal interest yield percent" },
            { name: "contribution", value: "200", description: "Monthly saving contribution level" },
            { name: "duration", value: "10", description: "Timeline longevity in years" }
        ]
    }
];

const MathSandbox: React.FC = () => {
    const { user } = useAuth();
    const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
    const [code, setCode] = useState<string>('');
    const [params, setParams] = useState<Parameter[]>([]);
    const [executionLogs, setExecutionLogs] = useState<string[]>([]);
    const [result, setResult] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // --- Off-Grid Local Collaboration Sync ---
    const [collabRoom, setCollabRoom] = useState<string>('');
    const [nickname, setNickname] = useState<string>(() => `Peer_${Math.floor(100 + Math.random() * 900)}`);
    const [isCollabActive, setIsCollabActive] = useState<boolean>(false);
    const [peers, setPeers] = useState<{ id: string; name: string; lastSeen: number }[]>([]);
    const [autoSync, setAutoSync] = useState<boolean>(false);
    const [incomingPayload, setIncomingPayload] = useState<{ code: string; params: Parameter[]; sender: string } | null>(null);
    const [collabStatus, setCollabStatus] = useState<'offline' | 'online'>('offline');
    
    const broadcastRef = useRef<BroadcastChannel | null>(null);
    const myIdRef = useRef<string>(`peer_${Math.random().toString(36).substring(2, 9)}`);
    const isLocalChangeRef = useRef<boolean>(true);

    // Sync Workspace to active peers (Local + Cloud)
    const broadcastWorkspace = useCallback(async (currentCode: string, currentParams: Parameter[]) => {
        if (!isCollabActive) return;
        
        // Mark as our own transmit to avoid echo loops
        isLocalChangeRef.current = false;
        setTimeout(() => { isLocalChangeRef.current = true; }, 500);

        const payload = {
            type: 'CODE_BROADCAST',
            id: myIdRef.current,
            sender: nickname,
            code: currentCode,
            params: currentParams,
            timestamp: Date.now()
        };

        // 1. Send via local off-grid BroadcastChannel
        if (broadcastRef.current) {
            broadcastRef.current.postMessage(payload);
        }

        // 2. Send via Firestore if we have a room code and online connection
        if (collabRoom.trim() && collabStatus === 'online') {
            try {
                await setDoc(doc(db, 'collab_rooms', collabRoom.trim().toUpperCase()), {
                    code: currentCode,
                    params: currentParams,
                    sender: nickname,
                    senderId: myIdRef.current,
                    timestamp: Date.now()
                });
            } catch (err) {
                console.warn("[Collab] Firestore write skipped or failed:", err);
            }
        }
    }, [isCollabActive, nickname, collabRoom, collabStatus]);

    // Auto-broadcast edits when code or params change (debounced slightly or handled on button/blur)
    // To keep performance high and avoid excess firestore writes, let's broadcast on code change or parameters change
    useEffect(() => {
        if (isCollabActive && isLocalChangeRef.current) {
            const timer = setTimeout(() => {
                broadcastWorkspace(code, params);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [code, params, isCollabActive, broadcastWorkspace]);

    // Handle peer heartbeat discovery and incoming messages
    useEffect(() => {
        if (!isCollabActive) {
            if (broadcastRef.current) {
                broadcastRef.current.close();
                broadcastRef.current = null;
            }
            setPeers([]);
            setIncomingPayload(null);
            return;
        }

        // Initialize BroadcastChannel
        const channelName = collabRoom.trim() ? `quantum_collab_${collabRoom.trim().toUpperCase()}` : 'quantum_collab_global';
        const channel = new BroadcastChannel(channelName);
        broadcastRef.current = channel;

        // Peer mapping helper
        const activePeersMap: Record<string, { name: string; lastSeen: number }> = {};

        const handleMessage = (msg: any) => {
            const data = msg.data;
            if (!data || data.id === myIdRef.current) return;

            if (data.type === 'PING') {
                activePeersMap[data.id] = { name: data.sender, lastSeen: Date.now() };
                channel.postMessage({
                    type: 'PONG',
                    id: myIdRef.current,
                    sender: nickname,
                    timestamp: Date.now()
                });
            } else if (data.type === 'PONG') {
                activePeersMap[data.id] = { name: data.sender, lastSeen: Date.now() };
            } else if (data.type === 'CODE_BROADCAST') {
                // Update workspace if auto-sync is on, otherwise show toast notification
                if (autoSync) {
                    isLocalChangeRef.current = false;
                    setCode(data.code);
                    setParams(data.params);
                    setTimeout(() => { isLocalChangeRef.current = true; }, 500);
                } else {
                    setIncomingPayload({
                        code: data.code,
                        params: data.params,
                        sender: data.sender
                    });
                }
            }
        };

        channel.onmessage = handleMessage;

        // Listen to Firestore Room if online
        let unsubscribeFirestore: (() => void) | null = null;
        if (collabRoom.trim()) {
            setCollabStatus('online'); // assume online to start
            try {
                unsubscribeFirestore = onSnapshot(doc(db, 'collab_rooms', collabRoom.trim().toUpperCase()), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        if (data && data.senderId !== myIdRef.current) {
                            if (autoSync) {
                                isLocalChangeRef.current = false;
                                setCode(data.code);
                                setParams(data.params);
                                setTimeout(() => { isLocalChangeRef.current = true; }, 500);
                            } else {
                                setIncomingPayload({
                                    code: data.code,
                                    params: data.params,
                                    sender: data.sender
                                });
                            }
                        }
                    }
                }, (error) => {
                    console.warn("[Collab] Firestore room connection failed, falling back to off-grid local subnet mode.", error);
                    setCollabStatus('offline');
                });
            } catch (err) {
                setCollabStatus('offline');
            }
        } else {
            setCollabStatus('offline');
        }

        // Heartbeat interval
        const heartbeatInterval = setInterval(() => {
            // Ping peers
            channel.postMessage({
                type: 'PING',
                id: myIdRef.current,
                sender: nickname,
                timestamp: Date.now()
            });

            // Purge dead peers (older than 6 seconds)
            const now = Date.now();
            const currentPeers = Object.entries(activePeersMap)
                .filter(([_, info]) => now - info.lastSeen < 6000)
                .map(([id, info]) => ({ id, name: info.name, lastSeen: info.lastSeen }));
            setPeers(currentPeers);
        }, 2000);

        return () => {
            clearInterval(heartbeatInterval);
            if (unsubscribeFirestore) unsubscribeFirestore();
            channel.close();
            broadcastRef.current = null;
        };
    }, [isCollabActive, collabRoom, nickname, autoSync]);

    // Initial load from Preset or share state if stored
    useEffect(() => {
        const sharedValue = localStorage.getItem('shared_sandbox_code');
        if (sharedValue) {
            try {
                const parsed = JSON.parse(sharedValue);
                setCode(parsed.code || '');
                setParams(parsed.params || []);
                localStorage.removeItem('shared_sandbox_code');
                return;
            } catch (e) {
                console.error("Failed to restore shared sandbox", e);
            }
        }
        
        // Match default preset on boot
        const preset = PRESETS[selectedPresetIndex];
        setCode(preset.code);
        setParams(JSON.parse(JSON.stringify(preset.parameters)));
    }, [selectedPresetIndex]);

    const handlePresetChange = (idx: number) => {
        setSelectedPresetIndex(idx);
    };

    const runScript = () => {
        setIsExecuting(true);
        setErrorMessage(null);
        setExecutionLogs([]);
        setResult('');

        setTimeout(() => {
            try {
                // Initialize clean evaluation context parser namespace
                const scope: Record<string, any> = {};
                
                // Add default custom functions for script convenience
                scope.evaluate = (expressionStr: string, localScope: Record<string, any>) => {
                    const fullScope = { ...scope, ...localScope };
                    return math.evaluate(expressionStr, fullScope);
                };
                scope.concat = (arr: any[], val: any) => {
                    return [...arr, val];
                };
                scope.round = (val: any, precision: number) => {
                    if (typeof val === 'number') {
                        return parseFloat(val.toFixed(precision));
                    }
                    return val;
                };

                // Compile script arguments into evaluation scope
                params.forEach(p => {
                    const numVal = parseFloat(p.value);
                    scope[p.name] = isNaN(numVal) ? p.value : numVal;
                });

                // Let's create an intuitive executor that parses instructions step-by-step 
                // using Math.js evaluations to ensure mathematical expressiveness
                // Parse standard loop block syntax manually:
                // format: for i = start to end do ... end;
                const parsedCode = code;

                // Support parsing basic `for` loop strings securely:
                // Convert simple custom user syntax blocks like:
                // "for i = 1 to limit do ... end;"
                // to a custom JS execution pattern
                // Let's support a mini scripting compiler using MathJS scopes:
                const lines = parsedCode.split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0 && !l.startsWith('//'));

                // We evaluate statements in sequence. Any line starting with "var" defines/updates a scope parameter
                // We support loops dynamically.
                let instructionIndex = 0;
                while (instructionIndex < lines.length) {
                    const line = lines[instructionIndex];
                    
                    if (line.startsWith('for ')) {
                        // Scan matching `end;` loop bound range
                        const loopMatch = line.match(/for\s+(\w+)\s*=\s*([a-zA-Z0-9_+-]+)\s+to\s+([a-zA-Z0-9_+-]+)\s+do/);
                        if (loopMatch) {
                            const loopVarName = loopMatch[1];
                            const startExpr = loopMatch[2];
                            const endExpr = loopMatch[3];

                            const startVal = typeof scope[startExpr] !== 'undefined' ? Number(scope[startExpr]) : Number(startExpr);
                            const endVal = typeof scope[endExpr] !== 'undefined' ? Number(scope[endExpr]) : Number(endExpr);

                            // Find target loop content until matching `end;`
                            const loopLines: string[] = [];
                            let depth = 1;
                            let scanIndex = instructionIndex + 1;
                            while (scanIndex < lines.length && depth > 0) {
                                const scanLine = lines[scanIndex];
                                if (scanLine.startsWith('for ')) depth++;
                                if (scanLine === 'end;') {
                                    depth--;
                                    if (depth === 0) break;
                                }
                                loopLines.push(scanLine);
                                scanIndex++;
                            }

                            if (isNaN(startVal) || isNaN(endVal)) {
                                throw new Error(`Invalid range parameters in loop: ${startExpr} to ${endExpr}`);
                            }

                            // Run loop cycles
                            for (let currentVal = startVal; currentVal <= endVal; currentVal++) {
                                scope[loopVarName] = currentVal;
                                evaluateLines(loopLines, scope);
                            }

                            instructionIndex = scanIndex + 1;
                            continue;
                        }
                    }

                    if (line.startsWith('{')) {
                        // Return block
                        let scanIndex = instructionIndex;
                        let returnBlockStr = "";
                        while (scanIndex < lines.length) {
                            returnBlockStr += lines[scanIndex];
                            scanIndex++;
                        }
                        // Evaluate and parse final output payload map object
                        const output = math.evaluate(returnBlockStr, scope);
                        if (output && typeof output === 'object') {
                            if (output.result !== undefined) {
                                setResult(String(output.result));
                            }
                            if (output.steps && Array.isArray(output.steps)) {
                                setExecutionLogs(output.steps.map((s: any) => String(s)));
                            } else if (output.steps && typeof output.steps === 'object') {
                                // Convert array representations
                                const logItems = Object.values(output.steps);
                                setExecutionLogs(logItems.map((s: any) => String(s)));
                            }
                        } else {
                            setResult(String(output));
                        }
                        break;
                    }

                    // Otherwise evaluate single standard instruction assignment line
                    evaluateLine(line, scope);
                    instructionIndex++;
                }

                setIsExecuting(false);
            } catch (err: any) {
                console.error("Interpreter compilation error:", err);
                setErrorMessage(`Compile Error: ${err.message || err.toString()}`);
                setIsExecuting(false);
            }
        }, 1200);
    };

    const evaluateLines = (lines: string[], scope: Record<string, any>) => {
        lines.forEach(line => {
            evaluateLine(line, scope);
        });
    };

    const evaluateLine = (line: string, scope: Record<string, any>) => {
        if (!line || line.startsWith('//') || line === 'end;') return;
        
        let cleanedLine = line;
        if (cleanedLine.startsWith('var ')) {
            cleanedLine = cleanedLine.slice(4);
        }

        const partIdx = cleanedLine.indexOf('=');
        if (partIdx !== -1) {
            const varName = cleanedLine.substring(0, partIdx).trim();
            const expressionStr = cleanedLine.substring(partIdx + 1).trim();
            
            // Clean up trailing semicolon if any
            let targetExpr = expressionStr;
            if (targetExpr.endsWith(';')) {
                targetExpr = targetExpr.slice(0, -1);
            }

            scope[varName] = math.evaluate(targetExpr, scope);
        } else {
            // Evaluated line without assignment
            let targetExpr = cleanedLine;
            if (targetExpr.endsWith(';')) {
                targetExpr = targetExpr.slice(0, -1);
            }
            math.evaluate(targetExpr, scope);
        }
    };

    const addParam = () => {
        setParams(prev => [...prev, { name: 'paramRef_' + (prev.length + 1), value: '1.0', description: 'User argument' }]);
    };

    const removeParam = (idx: number) => {
        setParams(prev => prev.filter((_, i) => i !== idx));
    };

    const handleParamChange = (idx: number, field: keyof Parameter, val: string) => {
        setParams(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
    };

    const createShareableWorkspace = async () => {
        setIsSharing(true);
        try {
            const statePayload = JSON.stringify({ code, params });
            const shareDoc = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                type: 'sandbox',
                title: `${PRESETS[selectedPresetIndex]?.name} Template Custom Workspace`,
                expression: `${params.length} active script arguments`,
                result: result || 'Compiled OK',
                stateData: statePayload,
                createdAt: serverTimestamp(),
                userId: user?.uid || 'anonymous'
            };

            await addDoc(collection(db, 'shares'), shareDoc);
            
            const link = `${window.location.origin}/?share=${shareDoc.id}`;
            setShareUrl(link);
            setLinkToClipboard(link);
        } catch (e: any) {
            console.error(e);
            alert("Could not generate shareable link. Please check your network or make sure database rules permit writes.");
        }
        setIsSharing(false);
    };

    const setLinkToClipboard = (linkStr: string) => {
        navigator.clipboard.writeText(linkStr);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Incoming Broadcast Banner */}
            <AnimatePresence>
                {incomingPayload && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-brand-primary/10 border border-brand-primary/40 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-semibold text-brand-text mb-4 shadow-lg backdrop-blur"
                    >
                        <div className="flex items-center gap-2.5">
                            <Bell size={16} className="text-brand-primary animate-bounce shrink-0" />
                            <span>
                                Peer <strong>{incomingPayload.sender}</strong> has shared their workspace ({incomingPayload.params.length} variables).
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    isLocalChangeRef.current = false;
                                    setCode(incomingPayload.code);
                                    setParams(incomingPayload.params);
                                    setTimeout(() => { isLocalChangeRef.current = true; }, 500);
                                    setIncomingPayload(null);
                                }}
                                className="px-3 py-1.5 bg-brand-primary text-brand-bg hover:brightness-110 font-black uppercase rounded-lg text-[9px] cursor-pointer"
                            >
                                Apply Workspace
                            </button>
                            <button
                                onClick={() => setIncomingPayload(null)}
                                className="px-3 py-1.5 bg-brand-surface border border-brand-border hover:bg-brand-border/30 rounded-lg text-[9px] text-brand-text-secondary cursor-pointer font-bold"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-brand-primary">
                        <Terminal size={22} className="animate-pulse" />
                        <h2 className="text-xl font-black uppercase tracking-widest italic">Math Programmable Sandbox</h2>
                    </div>
                    <p className="text-xs text-brand-text-secondary mt-1">
                        A safe, local userscript compiler using sandboxed math expressions. Declare parameters, iterate with loops, and output outcomes.
                    </p>
                </div>
                
                {/* Presets Grid */}
                <div className="flex flex-wrap gap-2 items-center bg-brand-surface/30 p-1.5 rounded-xl border border-brand-border/40">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-text-secondary px-3 italic">Presets:</span>
                    {PRESETS.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => handlePresetChange(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPresetIndex === idx ? 'bg-brand-primary text-white shadow' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface'}`}
                        >
                            {p.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Compiler Left Block: Code Editor & Fields */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-brand-surface border border-brand-border/40 rounded-[2rem] p-6 space-y-4 shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
                            <div className="flex items-center gap-2">
                                <FileCode size={16} className="text-brand-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text italic">Script Core Source</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[9px] font-mono text-brand-text-secondary font-black">JS_INTERPRETER_ACTIVE</span>
                            </div>
                        </div>

                        {/* Preset Info */}
                        <div className="bg-brand-bg/50 border border-brand-border/40 p-4 rounded-xl text-xs text-brand-text-secondary leading-relaxed">
                            <span className="font-bold text-brand-text uppercase tracking-wider block mb-1">{PRESETS[selectedPresetIndex]?.name}</span>
                            {PRESETS[selectedPresetIndex]?.description}
                        </div>

                        {/* Script Editor Pane */}
                        <div className="relative group">
                            <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-brand-text-secondary select-none opacity-40 group-focus-within:opacity-100 uppercase">
                                TSX
                            </div>
                            <textarea
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                rows={14}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 font-mono text-xs leading-relaxed focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-brand-text custom-scrollbar resize-none"
                                placeholder="// Write custom compiler mathematical statements..."
                            />
                        </div>

                        {/* Run Execution Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            <button
                                onClick={runScript}
                                disabled={isExecuting}
                                className="px-6 py-3 bg-brand-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2 disabled:opacity-40"
                            >
                                {isExecuting ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                                {isExecuting ? 'Executing kernel...' : 'Run Simulation'}
                            </button>

                            <button
                                onClick={createShareableWorkspace}
                                disabled={isSharing}
                                className="px-4 py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary/30 text-brand-text font-black uppercase tracking-widest text-[9px] rounded-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                {isSharing ? <RefreshCw size={11} className="animate-spin" /> : <Share2 size={11} />}
                                Share Workspace
                            </button>
                        </div>

                        {/* Link Copy Pane */}
                        {shareUrl && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-brand-bg border border-brand-primary/30 p-3.5 rounded-xl flex items-center justify-between gap-3 overflow-hidden"
                            >
                                <span className="text-[10px] font-sans font-bold text-brand-text truncate mr-2 select-all">{shareUrl}</span>
                                <button
                                    onClick={() => setLinkToClipboard(shareUrl)}
                                    className="px-3 py-1.5 bg-brand-primary text-white hover:brightness-110 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0"
                                >
                                    {copiedLink ? <Check size={10} /> : <Copy size={10} />}
                                    {copiedLink ? 'Copied' : 'Copy'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Compiler Right Block: Parameters Configuration & Output Panel */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Workspace Variable Configuration */}
                    <div className="bg-brand-surface border border-brand-border/40 rounded-[2rem] p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
                            <div className="flex items-center gap-2">
                                <Cpu size={16} className="text-brand-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text italic">Parameter Sandbox Scope</span>
                            </div>
                            <button
                                onClick={addParam}
                                className="p-1 text-brand-primary hover:bg-brand-bg rounded border border-brand-border/30 hover:border-brand-primary/30"
                                title="Add customizable argument variable"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Parameter Inputs Custom Grid list */}
                        <div className="space-y-3 max-h-[175px] overflow-y-auto custom-scrollbar pr-1.5">
                            {params.length === 0 ? (
                                <p className="text-[10px] text-center text-brand-text-secondary uppercase tracking-widest italic py-4">No variable arguments active</p>
                            ) : (
                                params.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-brand-bg/40 p-2.5 rounded-xl border border-brand-border/40 relative group/p text-xs">
                                        <input
                                            type="text"
                                            value={p.name}
                                            onChange={e => handleParamChange(idx, 'name', e.target.value)}
                                            className="w-16 bg-brand-bg border border-brand-border text-center rounded font-mono text-[10px] text-brand-accent font-bold py-1 focus:ring-1 focus:ring-brand-primary outline-none"
                                            placeholder="name"
                                            title="Rename argument parameter"
                                        />
                                        <span className="text-brand-text-secondary font-mono">=</span>
                                        <input
                                            type="text"
                                            value={p.value}
                                            onChange={e => handleParamChange(idx, 'value', e.target.value)}
                                            className="w-20 bg-brand-bg border border-brand-border rounded font-mono text-[10px] py-1 text-center font-bold text-brand-text focus:ring-1 focus:ring-brand-primary outline-none"
                                            placeholder="value"
                                        />
                                        <input
                                            type="text"
                                            value={p.description}
                                            onChange={e => handleParamChange(idx, 'description', e.target.value)}
                                            className="flex-grow bg-transparent border-0 text-[10px] text-brand-text-secondary placeholder:opacity-40 italic focus:outline-none focus:ring-0 truncate"
                                            placeholder="Descriptor context"
                                        />
                                        <button
                                            onClick={() => removeParam(idx)}
                                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 rounded opacity-0 group-hover/p:opacity-100 transition-opacity"
                                            title="Remove this variable"
                                        >
                                            <Trash size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Simulation Console Screen Output Panel */}
                    <div className="bg-brand-surface border border-brand-border/40 rounded-[2rem] p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-brand-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text italic">Simulation Matrix Console</span>
                            </div>
                        </div>

                        {/* Error Alert Display block */}
                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 font-mono text-xs select-text">
                                {errorMessage}
                            </div>
                        )}

                        {/* Simulation Result Core Widget */}
                        <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-sm overflow-hidden min-h-[140px]">
                            {isExecuting ? (
                                <div className="space-y-2 text-center">
                                    <RefreshCw className="animate-spin text-brand-primary mx-auto mb-2" size={24} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-secondary animate-pulse">Engaging arithmetic pipelines...</p>
                                </div>
                            ) : result ? (
                                <div className="text-center space-y-1 select-text">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary block italic">Evaluated Output</span>
                                    <div className="text-4xl font-black text-brand-text tracking-tighter font-mono">{result}</div>
                                </div>
                            ) : (
                                <div className="text-center text-brand-text-secondary/30 uppercase tracking-[0.3em] font-black text-[9px]">
                                    Awaiting script run
                                </div>
                            )}
                        </div>

                        {/* Console Log Buffer Array list */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-brand-text-secondary block italic">Trace Buffer steps Log:</span>
                            <div className="bg-brand-bg/80 border border-brand-border rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] text-brand-text/90 leading-relaxed space-y-1.5 select-text">
                                {executionLogs.length === 0 ? (
                                    <span className="text-brand-text-secondary opacity-30 italic block text-center mt-12 select-none uppercase tracking-widest">Console remains sterile</span>
                                ) : (
                                    executionLogs.map((log, i) => (
                                        <div key={i} className="flex gap-2">
                                            <ChevronRight size={11} className="text-brand-primary shrink-0 mt-0.5" />
                                            <span>{log}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Off-Grid Collab Sync Console */}
                    <div className="bg-brand-surface border border-brand-border/40 rounded-[2rem] p-6 space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-[40px] pointer-events-none" />
                        <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
                            <div className="flex items-center gap-2">
                                <Radio size={16} className={`text-brand-accent ${isCollabActive ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text italic">Off-Grid Peer Sync</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isCollabActive ? 'bg-green-500 animate-ping' : 'bg-brand-text-secondary'}`}></span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-secondary font-mono">
                                    {isCollabActive ? (collabStatus === 'online' ? 'REALTIME_HYBRID_ON' : 'OFFGRID_LOCAL_ON') : 'OFFLINE'}
                                </span>
                            </div>
                        </div>

                        {!isCollabActive ? (
                            <div className="space-y-4">
                                <p className="text-[10px] text-brand-text-secondary leading-relaxed uppercase tracking-wide">
                                    Link classrooms or local browser instances completely offline using BroadcastChannel, or sync via cloud snapshot rooms.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-brand-text-secondary mb-1">Room Identifier (Optional)</label>
                                        <input
                                            type="text"
                                            value={collabRoom}
                                            onChange={e => setCollabRoom(e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 font-mono text-[10px] text-brand-accent font-bold uppercase focus:ring-1 focus:ring-brand-primary outline-none"
                                            placeholder="e.g. CLASS-10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-brand-text-secondary mb-1">Your Handle / Nickname</label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={e => setNickname(e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 font-mono text-[10px] text-brand-text font-bold focus:ring-1 focus:ring-brand-primary outline-none"
                                            placeholder="Nickname"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCollabActive(true)}
                                    className="w-full py-2.5 bg-brand-accent hover:brightness-110 text-white font-black uppercase tracking-widest text-[9px] rounded-xl active:scale-95 transition-all shadow-md shadow-brand-accent/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Radio size={12} /> Activate Sync Engine
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-brand-bg/60 border border-brand-border/40 px-3.5 py-2.5 rounded-xl">
                                    <div className="space-y-0.5">
                                        <span className="text-[8px] text-brand-text-secondary uppercase block font-bold">Connected Room</span>
                                        <span className="text-xs font-black font-mono text-brand-accent">{collabRoom ? collabRoom.toUpperCase() : 'GLOBAL_LOBBY'}</span>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <span className="text-[8px] text-brand-text-secondary uppercase block font-bold">My Nickname</span>
                                        <span className="text-xs font-black font-mono text-brand-text">{nickname}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-brand-text-secondary italic flex items-center gap-1.5">
                                            <Users size={12} /> Connected Peers ({peers.length})
                                        </span>
                                        <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-brand-text-secondary cursor-pointer select-none">
                                            <input 
                                                type="checkbox"
                                                checked={autoSync}
                                                onChange={e => setAutoSync(e.target.checked)}
                                                className="rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-0 w-3 h-3"
                                            />
                                            Auto-Pull Edits
                                        </label>
                                    </div>

                                    {peers.length === 0 ? (
                                        <div className="p-4 bg-brand-bg/40 border border-brand-border/40 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                                            <WifiOff size={24} className="text-brand-text-secondary opacity-35 mb-1.5" />
                                            <p className="text-[9px] font-black text-brand-text-secondary/50 uppercase tracking-widest leading-none">Scanning for nearby classmates...</p>
                                            <p className="text-[8px] text-brand-text-secondary/40 mt-1">Open another tab/window on this Room code to test!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                                            {peers.map((peer, i) => (
                                                <div key={i} className="flex items-center justify-between bg-brand-bg p-2 rounded-lg border border-brand-border/60 text-[10px]">
                                                    <span className="font-mono font-bold text-brand-text truncate pr-1">{peer.name}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse"></span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        onClick={() => broadcastWorkspace(code, params)}
                                        className="py-2 bg-brand-primary text-black font-black uppercase tracking-widest text-[9px] rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title="Broadcast current workspace parameters and code to peers"
                                    >
                                        <Send size={10} /> Push Workspace
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCollabActive(false);
                                            setIncomingPayload(null);
                                        }}
                                        className="py-2 bg-brand-surface border border-brand-border hover:border-red-400/30 text-brand-text-secondary hover:text-red-400 font-black uppercase tracking-widest text-[9px] rounded-lg active:scale-95 transition-all cursor-pointer"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MathSandbox;
