import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Check, Download, Trash2, GraduationCap, School, User as UserIcon, HardHat, Building2, Save, Cloud, RefreshCw, AlertCircle, Smartphone, Info, Cpu, Sparkles, Clipboard, Activity, Upload } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { secureStorage, validateApiKey, getGeminiModel } from '../services/geminiService';
import { googleDriveService } from '../services/googleDriveService';
import { motion } from 'motion/react';

const roles = [
    { id: 'student', title: 'Student', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'teacher', title: 'Teacher', icon: School, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'business_owner', title: 'Business Owner', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'employee', title: 'Employee', icon: HardHat, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'normal_user', title: 'Personal Use', icon: UserIcon, color: 'text-gray-400', bg: 'bg-gray-400/10' },
];

const themes = [
    { id: 'dark', name: 'Original Dark', color: 'bg-[#1a202c]' },
    { id: 'light', name: 'Clean Light', color: 'bg-[#f7fafc]' },
    { id: 'neon', name: 'Neon Night', color: 'bg-black border border-brand-primary' },
    { id: 'royal', name: 'Royal Purple', color: 'bg-[#1a0b2e]' },
    { id: 'terminal', name: 'Matrix Green', color: 'bg-black border border-green-500' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#130019]' },
];

interface SettingsProps {
    canInstall?: boolean;
    onInstall?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ canInstall, onInstall }) => {
    const { user, userData, accessToken } = useAuth();
    const [toastMessage, setToastMessage] = useState('');
    const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                 const root = window.document.documentElement;
                 if (savedTheme !== 'dark') root.className = savedTheme;
                 else root.className = '';
                 return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (error) {
            console.error("Could not access theme from localStorage", error);
            return true;
        }
    });

    const [numberFormat, setNumberFormat] = useState(() => {
        return localStorage.getItem('numberFormat') || 'us';
    });

    const handleFormatChange = (format: string) => {
        setNumberFormat(format);
        localStorage.setItem('numberFormat', format);
        showToast('Number formatting updated.');
    };

    const selectTheme = (themeId: string) => {
        if (themeId === 'dark') {
             window.document.documentElement.removeAttribute('class');
        } else {
             window.document.documentElement.setAttribute('class', themeId);
        }
        localStorage.setItem('theme', themeId);
        setCurrentThemeId(themeId);
        setIsDarkMode(themeId === 'dark');
        showToast(`${themeId.charAt(0).toUpperCase() + themeId.slice(1)} theme applied!`);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.remove('light');
        } else {
            root.classList.add('light');
        }
    }, [isDarkMode]);
    
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleThemeToggle = () => {
        const root = window.document.documentElement;
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        try {
            if (newIsDarkMode) {
                root.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            } else {
                root.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
        } catch (error) {
            console.error("Failed to save theme to localStorage:", error);
            showToast("Could not save theme preference.");
        }
    };

    const handleClearAllData = () => {
        if (window.confirm("Are you sure you want to clear all application data? This action cannot be undone.")) {
            try {
                localStorage.clear();
                showToast("All data cleared successfully. Reloading...");
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Failed to clear localStorage:", error);
                showToast("Failed to clear data.");
            }
        }
    };

    const handleExportData = () => {
        try {
            const data: Record<string, string | null> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) data[key] = localStorage.getItem(key);
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quantumcalc-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            showToast("App data exported successfully!");
        } catch (error) {
            console.error("Export failed", error);
            showToast("Failed to export data.");
        }
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const json = JSON.parse(content);
                if (typeof json !== 'object' || json === null) {
                    throw new Error("Invalid structure. Active payload must be secure JSON map.");
                }

                let keysRestored = 0;
                Object.entries(json).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        localStorage.setItem(key, value);
                        keysRestored++;
                    }
                });

                showToast(`Restored ${keysRestored} active partitions! Resetting interface...`);
                loadStorageUsage();
                setTimeout(() => window.location.reload(), 1500);
            } catch (err: any) {
                console.error("Import failed:", err);
                showToast(`Import aborted: ${err?.message || 'Invalid sandbox JSON formatting.'}`);
            }
        };
        reader.readAsText(file);
    };

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const [editRole, setEditRole] = useState(userData?.role || '');
    const [editGrade, setEditGrade] = useState(userData?.grade || '');
    const [editSchool, setEditSchool] = useState(userData?.school || '');
    const [customApiKey, setCustomApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(() => {
        try { return !!secureStorage.getItem('CUSTOM_GEMINI_API_KEY'); } 
        catch(e) { return false; }
    });

    // Modern Advanced AI Settings States
    const [selectedModel, setSelectedModel] = useState(() => getGeminiModel());
    const [aiTone, setAiTone] = useState(() => localStorage.getItem('CUSTOM_AI_TONE') || 'academic');
    const [hapticEnabled, setHapticEnabled] = useState(() => localStorage.getItem('CUSTOM_HAPTIC_ENABLED') === 'true');
    const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [apiTestMessage, setApiTestMessage] = useState('');
    const [smartInputText, setSmartInputText] = useState('');
    const [extractedKey, setExtractedKey] = useState('');
    const [storageSizes, setStorageSizes] = useState({
        history: 0,
        notes: 0,
        other: 0,
        total: 0
    });

    const loadStorageUsage = () => {
        try {
            const h = localStorage.getItem('calcHistory') || '';
            const n = localStorage.getItem('quantum_notes') || '';
            let totalBytes = 0;
            let otherBytes = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key) || '';
                    const size = (key.length + value.length) * 2;
                    totalBytes += size;
                    if (key !== 'calcHistory' && key !== 'quantum_notes') {
                        otherBytes += size;
                    }
                }
            }
            setStorageSizes({
                history: h.length * 2,
                notes: n.length * 2,
                other: otherBytes,
                total: totalBytes
            });
        } catch (e) {
            console.warn("Storage scan restricted.");
        }
    };

    useEffect(() => {
        loadStorageUsage();
    }, []);

    const handleSaveApiKey = () => {
        try {
            if (customApiKey.trim() === '') {
                secureStorage.removeItem('CUSTOM_GEMINI_API_KEY');
                setIsKeySaved(false);
                setApiTestStatus('idle');
                setApiTestMessage('');
                showToast("API Key removed.");
            } else {
                const trimmedKey = customApiKey.trim();
                if (!trimmedKey.startsWith('AIzaSy')) {
                    showToast("Warning: This may not be a valid Gemini API key. They usually start with 'AIzaSy'.");
                }
                secureStorage.setItem('CUSTOM_GEMINI_API_KEY', trimmedKey);
                setIsKeySaved(true);
                setCustomApiKey('');
                setApiTestStatus('idle');
                setApiTestMessage('');
                showToast("API Key saved securely.");
            }
        } catch (e) {
            showToast("Failed to save API Key.");
        }
    };

    const handleSmartKeyExtract = (text: string) => {
        setSmartInputText(text);
        const regex = /(AIzaSy[A-Za-z0-9_-]{33})/;
        const match = text.match(regex);
        if (match) {
            setExtractedKey(match[1]);
        } else {
            setExtractedKey('');
        }
    };

    const saveExtractedKey = async () => {
        if (!extractedKey) return;
        setApiTestStatus('testing');
        setApiTestMessage('Validating extracted key with prompt probe...');
        const res = await validateApiKey(extractedKey);
        if (res.success) {
            secureStorage.setItem('CUSTOM_GEMINI_API_KEY', extractedKey);
            setIsKeySaved(true);
            setCustomApiKey('');
            setSmartInputText('');
            setExtractedKey('');
            setApiTestStatus('success');
            setApiTestMessage(`Connection verified! Response: "${res.message}"`);
            showToast("Extracted API Key successfully verified & saved!");
        } else {
            setApiTestStatus('failed');
            setApiTestMessage(`Validation failed: ${res.message}`);
            showToast("Extract verification failed. Is this a valid key?");
        }
    };

    const handleTestApiKey = async () => {
        setApiTestStatus('testing');
        setApiTestMessage('Reaching out to Gemini network probe...');
        const storedKey = secureStorage.getItem('CUSTOM_GEMINI_API_KEY');
        const keyToUse = customApiKey.trim() || storedKey || '';
        if (!keyToUse) {
            setApiTestStatus('testing');
            setApiTestMessage('Checking default system backup key...');
            // Check validation with generic empty, which hits the fallback env variable client or server side
            const testFallback = await validateApiKey("");
            if (testFallback.success) {
                setApiTestStatus('success');
                setApiTestMessage(`Standard system key active! Connection is verified: "${testFallback.message}"`);
            } else {
                setApiTestStatus('failed');
                setApiTestMessage(`System default key is currently throttled or offline.`);
            }
            return;
        }

        const res = await validateApiKey(keyToUse);
        if (res.success) {
            setApiTestStatus('success');
            setApiTestMessage(`Success! Gemini API Online. Status response: "${res.message}"`);
        } else {
            setApiTestStatus('failed');
            setApiTestMessage(`Verification failed! Error details: ${res.message}`);
        }
    };

    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        localStorage.setItem('CUSTOM_GEMINI_MODEL', model);
        showToast(`AI Engine set to ${model}`);
    };

    const handleToneChange = (tone: string) => {
        setAiTone(tone);
        localStorage.setItem('CUSTOM_AI_TONE', tone);
        showToast("AI explanation level updated.");
    };

    const handleHapticToggle = () => {
        const nextHaptic = !hapticEnabled;
        setHapticEnabled(nextHaptic);
        localStorage.setItem('CUSTOM_HAPTIC_ENABLED', nextHaptic ? 'true' : 'false');
        if (nextHaptic && navigator.vibrate) {
            try {
                navigator.vibrate([100, 50, 100]);
            } catch (err) {
                console.warn("Haptics not supported on device.");
            }
        }
        showToast(nextHaptic ? "Haptic vibrations enabled!" : "Haptic vibrations disabled.");
    };

    const handlePartialClear = (type: 'history' | 'notes') => {
        if (type === 'history') {
            if (window.confirm("Purge local calculation history? This action is irreversible.")) {
                localStorage.removeItem('calcHistory');
                loadStorageUsage();
                showToast("Calculation logs successfully purged.");
            }
        } else {
            if (window.confirm("Purge all Scratchpad notes? This action is irreversible.")) {
                localStorage.removeItem('quantum_notes');
                loadStorageUsage();
                showToast("Scratchpad files successfully deleted.");
            }
        }
    };

    useEffect(() => {
        if (userData) {
            // Defer updates to avoid synchronous state update warning
            setTimeout(() => {
                setEditRole(userData.role || '');
                setEditGrade(userData.grade || '');
                setEditSchool(userData.school || '');
            }, 0);
        }
    }, [userData]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        try {
            const profileData: any = {
                role: editRole,
                onboarded: true,
            };

            if (['student', 'teacher'].includes(editRole)) {
                profileData.grade = editGrade || null;
            }

            profileData.school = editSchool || null;

            // 1. Update Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, profileData);

            // 2. Sync to Google Drive (including calculations & scratchpad notes cache)
            if (accessToken) {
                try {
                    const fullBackupData = {
                        ...profileData,
                        calcHistory: localStorage.getItem('calcHistory') || '',
                        quantum_notes: localStorage.getItem('quantum_notes') || ''
                    };
                    await googleDriveService.saveProfile(accessToken, fullBackupData);
                    showToast("Profile, History and Notes successfully synced to Google Drive!");
                } catch (driveError: any) {
                    if (driveError.message?.includes('401') || driveError.message?.includes('invalid_grant')) {
                        showToast("Drive Access Expired. Please log out and sign back in to re-link Drive.");
                    } else {
                        showToast("Profile updated locally. Drive sync failed.");
                    }
                }
            } else {
                showToast("Profile updated locally!");
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleRestoreFromDrive = async () => {
        if (!accessToken || !user) {
            showToast("No Google Drive access. Please connect using Google first.");
            return;
        }
        setIsRestoring(true);
        try {
            const driveProfile = await googleDriveService.getProfile(accessToken);
            if (driveProfile) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    role: driveProfile.role,
                    grade: driveProfile.grade,
                    school: driveProfile.school,
                    onboarded: driveProfile.onboarded
                });

                // Restore calculation history & scratchpad notes if they are present in the backup file
                let dataRecoveredMessage = "Profile successfully restored from Google Drive!";
                let countRestored = 0;
                if (driveProfile.calcHistory) {
                    localStorage.setItem('calcHistory', driveProfile.calcHistory);
                    countRestored++;
                }
                if (driveProfile.quantum_notes) {
                    localStorage.setItem('quantum_notes', driveProfile.quantum_notes);
                    countRestored++;
                }

                if (countRestored > 0) {
                    dataRecoveredMessage = "Profile, History, and Notes fully restored from Google Drive! Reloading...";
                }

                showToast(dataRecoveredMessage);
                loadStorageUsage();
                if (countRestored > 0) {
                    setTimeout(() => window.location.reload(), 2000);
                }
            } else {
                showToast("No profile found on your Google Drive.");
            }
        } catch (error: any) {
            if (error.message?.includes('401') || error.message?.includes('invalid_grant')) {
               showToast("Drive Access Expired. Please log out and sign back in to re-link Drive.");
            } else {
               showToast(`Failed to restore from Drive: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsRestoring(false);
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }}} className="max-w-4xl mx-auto space-y-8 pb-20">
            <motion.div variants={sectionVariants} className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4 border border-brand-primary/20">
                    <UserIcon size={14} /> Personalization
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4 tracking-tight flex items-center justify-center gap-4">
                    <Palette size={40} className="text-brand-primary" /> Settings
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto font-light text-lg">
                    Manage your identity, sync preferences, and customize the interface to match your workflow.
                </p>
            </motion.div>
            
            {user && (
                <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                            <UserIcon size={24} />
                        </div>
                        User Profile
                    </h3>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Identity Role</label>
                                <select 
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer appearance-none shadow-inner"
                                >
                                    <option value="">Select Role...</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.title}</option>
                                    ))}
                                </select>
                            </div>
                            {['student', 'teacher'].includes(editRole) && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Grade / Level</label>
                                    <input
                                        type="text"
                                        value={editGrade}
                                        onChange={(e) => setEditGrade(e.target.value)}
                                        placeholder="e.g. 10th Grade"
                                        className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner"
                                    />
                                </div>
                            )}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">
                                    {['student', 'teacher'].includes(editRole) ? 'School / Institution' : 'Company / Organization'}
                                </label>
                                <input
                                    type="text"
                                    value={editSchool}
                                    onChange={(e) => setEditSchool(e.target.value)}
                                    placeholder="Name of your institution"
                                    className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSavingProfile}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-primary text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-primary/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSavingProfile ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm flex flex-col">
                        <h3 className="text-xl font-bold mb-6 text-brand-text flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <Cloud size={20} />
                            </div>
                            Cloud Sync
                        </h3>
                        <div className="flex-1 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl mt-1 ${accessToken ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {accessToken ? <Check size={20} /> : <AlertCircle size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-text mb-1">Google Drive Integration</h4>
                                    <p className="text-brand-text-secondary text-sm font-light leading-relaxed">
                                        {accessToken 
                                            ? "Connected and ready to sync. Your data is encrypted on your personal drive." 
                                            : "Connect your Google account to enable secure cloud backups."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={!accessToken || isSavingProfile}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5 text-brand-text transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50 truncate"
                                >
                                    <RefreshCw size={14} className={isSavingProfile ? 'animate-spin' : ''} />
                                    Manual Sync
                                </button>
                                <button
                                    onClick={handleRestoreFromDrive}
                                    disabled={!accessToken || isRestoring}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5 text-brand-text transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50 truncate"
                                >
                                    {isRestoring ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                    Restore
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm flex flex-col md:col-span-2">
                        <div className="flex flex-col lg:flex-row gap-8 justify-between">
                            {/* Key Setup Side */}
                            <div className="flex-1 space-y-6">
                                <h3 className="text-xl font-bold text-brand-text flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                        <Cpu size={20} />
                                    </div>
                                    Gemini API Custom Integration
                                </h3>

                                <p className="text-brand-text-secondary text-sm font-light leading-relaxed">
                                    Maximize performance, bypass request throttling, and unlock deep explanation logic. Get a free API Key instantly from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 font-medium hover:underline inline-flex items-center gap-1">Google AI Studio <Sparkles size={12} className="inline" /></a>.
                                </p>

                                {isKeySaved ? (
                                    <div className="flex items-center justify-between p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                            <div>
                                                <span className="text-emerald-400 font-semibold text-xs block">CUSTOM KEY VERIFIED & ACTIVE</span>
                                                <span className="text-emerald-500/80 text-[10px] font-mono leading-none">Your securely sandboxed browser keychain is in use.</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                secureStorage.removeItem('CUSTOM_GEMINI_API_KEY');
                                                setIsKeySaved(false);
                                                setApiTestStatus('idle');
                                                setApiTestMessage('');
                                                showToast("Custom key dismantled.");
                                            }}
                                            className="text-[10px] text-rose-400 font-bold hover:underline px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 uppercase"
                                        >
                                            Nuke Key
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                        <AlertCircle className="text-amber-500 shrink-0 animate-bounce" size={18} />
                                        <div>
                                            <span className="text-amber-500 font-bold text-xs block">SYSTEM BACKUP KEY ACTIVE</span>
                                            <span className="text-amber-500/70 text-[10px] leading-none">Utilizing global generic calculation engine capacity.</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider block">Manual Key Input</label>
                                    <input
                                        type="password"
                                        value={customApiKey}
                                        onChange={(e) => setCustomApiKey(e.target.value)}
                                        placeholder={isKeySaved ? "••••••••••••••••••••••••••••••••••••" : "Paste raw Gemini API Key here (AIzaSy...)"}
                                        className="w-full bg-brand-bg border border-brand-border/60 text-brand-text rounded-2xl p-3.5 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/30 font-mono text-sm shadow-inner"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveApiKey}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 transition-all font-bold text-xs uppercase tracking-wider border border-purple-500/20 shadow-md"
                                        >
                                            <Save size={14} />
                                            {isKeySaved ? (customApiKey.trim() === '' ? 'Purge Current' : 'Overrule Key') : 'Save Key'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    if ((window as any).aistudio?.openSelectKey) {
                                                        await (window as any).aistudio.openSelectKey();
                                                        showToast("API Key selection completed.");
                                                    } else {
                                                        showToast("Platform Selector unavailable. Please paste key manually.");
                                                    }
                                                } catch (err) {
                                                    showToast("Failed to open selector.");
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-brand-text transition-all font-bold text-xs uppercase tracking-wider shadow-sm"
                                        >
                                            Use Dialog
                                        </button>
                                    </div>
                                </div>

                                {/* Active connection testing */}
                                <div className="pt-3 border-t border-brand-border/40">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">Diagnostic Probe</span>
                                        <button
                                            onClick={handleTestApiKey}
                                            disabled={apiTestStatus === 'testing'}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            {apiTestStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                                        </button>
                                    </div>

                                    {apiTestStatus !== 'idle' && (
                                        <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 transition-all ${
                                            apiTestStatus === 'testing' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' :
                                            apiTestStatus === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                                            'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                        }`}>
                                            <Activity size={14} className={`shrink-0 mt-0.5 ${apiTestStatus === 'testing' ? 'animate-spin' : ''}`} />
                                            <div>
                                                <span className="font-bold uppercase tracking-wide block mb-0.5">
                                                    {apiTestStatus === 'testing' ? 'CONNECTING PROBE...' : 
                                                     apiTestStatus === 'success' ? 'PROBE SUCCESSFUL ✓' : 'PROBE FAILURE ✗'}
                                                </span>
                                                <p className="opacity-90 leading-normal">{apiTestMessage}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Smart Pasting and Options Side */}
                            <div className="flex-1 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-brand-border/40 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider flex items-center gap-2">
                                        <Clipboard size={16} className="text-purple-400" />
                                        Smart Paste Key Extractor
                                    </h4>
                                    <p className="text-brand-text-secondary text-xs font-light leading-relaxed">
                                        Have a code snippet, JSON configuration, or raw email block containing your key? Simply paste the whole text block below. We will instantly extract, clean, and verify your credentials automatically.
                                    </p>
                                    <textarea
                                        rows={3}
                                        value={smartInputText}
                                        onChange={(e) => handleSmartKeyExtract(e.target.value)}
                                        placeholder="Paste anything here... (e.g., const key = 'AIzaSy...')"
                                        className="w-full bg-brand-bg/60 border border-brand-border/50 text-brand-text rounded-xl p-3 placeholder:text-brand-text-secondary/30 outline-none transition-all text-xs font-mono"
                                    />
                                    {extractedKey && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 5 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden truncate">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
                                                <span className="text-[10px] text-purple-400 font-mono font-semibold truncate">
                                                    Key Extracted: {extractedKey.substring(0, 10)}...{extractedKey.substring(extractedKey.length - 6)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={saveExtractedKey}
                                                className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[10px] uppercase shadow-lg shadow-purple-500/10"
                                            >
                                                Activate Key
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-brand-border/30">
                                    <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Advanced AI Preferences</h4>
                                    
                                    <div className="space-y-3">
                                        {/* Model selection dropdown */}
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-brand-bg/50 p-2.5 rounded-2xl border border-brand-border/30">
                                            <span className="text-xs text-brand-text-secondary pl-1">Target Engine</span>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => handleModelChange(e.target.value)}
                                                className="bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer font-mono"
                                            >
                                                <option value="gemini-3.5-flash">gemini-3.5-flash (Fast & Creative)</option>
                                                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinker)</option>
                                                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Lite)</option>
                                            </select>
                                        </div>

                                        {/* AI Persona/Tone dropdown */}
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-brand-bg/50 p-2.5 rounded-2xl border border-brand-border/30">
                                            <span className="text-xs text-brand-text-secondary pl-1">Explanation Tone</span>
                                            <select
                                                value={aiTone}
                                                onChange={(e) => handleToneChange(e.target.value)}
                                                className="bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                                            >
                                                <option value="academic">Standard Academic Lessons</option>
                                                <option value="student">Friendly Student Tutor</option>
                                                <option value="kid">Curious Kid (Playful Analogies)</option>
                                                <option value="professional">Rigorous Tech Professional</option>
                                            </select>
                                        </div>

                                        {/* Haptics toggling */}
                                        <div className="flex justify-between items-center bg-brand-bg/50 p-3 rounded-2xl border border-brand-border/30">
                                            <div>
                                                <span className="text-xs text-brand-text font-semibold block">Key Haptic Vibrations</span>
                                                <span className="text-[10px] text-brand-text-secondary">Tactile physical screen bumps on keyclicks</span>
                                            </div>
                                            <button
                                                onClick={handleHapticToggle}
                                                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
                                                    hapticEnabled ? 'bg-purple-500' : 'bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                                                        hapticEnabled ? 'translate-x-[1.6rem]' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                        <Sun size={24} />
                    </div>
                    Interface
                </h3>
                
                <div className="bg-brand-bg/60 p-6 rounded-2xl border border-brand-border/40 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner">
                    <div>
                        <h4 className="font-bold text-brand-text text-lg">App Luminosity</h4>
                        <p className="text-brand-text-secondary text-sm font-light mt-1">Force light or dark mode globally.</p>
                    </div>
                    <button
                        onClick={handleThemeToggle}
                        className={`relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg shrink-0 ${
                            isDarkMode ? 'bg-brand-primary/80' : 'bg-gray-400'
                        }`}
                    >
                        <span
                            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow transition-transform duration-500 ease-spring ${
                                isDarkMode ? 'translate-x-[2.2rem]' : 'translate-x-1'
                            }`}
                        />
                        <Sun className={`absolute left-2.5 h-5 w-5 text-yellow-300 transition-opacity ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                        <Moon className={`absolute right-2.5 h-5 w-5 text-brand-bg transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-brand-text mb-4 flex items-center gap-2">
                        Number Formatting
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         <button
                                onClick={() => handleFormatChange('us')}
                                className={`group p-4 rounded-2xl border-2 transition-all text-left ${numberFormat === 'us' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border/50 bg-brand-bg/50 hover:border-brand-primary/30 hover:bg-brand-surface'}`}
                            >
                                <span className={`text-lg font-bold block mb-1 ${numberFormat === 'us' ? 'text-brand-primary' : 'text-brand-text'}`}>
                                    1,000.00
                                </span>
                                <span className={`text-xs font-medium ${numberFormat === 'us' ? 'text-brand-primary/70' : 'text-brand-text-secondary'}`}>
                                    US Standard (1,000.00)
                                </span>
                         </button>
                         <button
                                onClick={() => handleFormatChange('eu')}
                                className={`group p-4 rounded-2xl border-2 transition-all text-left ${numberFormat === 'eu' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border/50 bg-brand-bg/50 hover:border-brand-primary/30 hover:bg-brand-surface'}`}
                            >
                                <span className={`text-lg font-bold block mb-1 ${numberFormat === 'eu' ? 'text-brand-primary' : 'text-brand-text'}`}>
                                    1.000,00
                                </span>
                                <span className={`text-xs font-medium ${numberFormat === 'eu' ? 'text-brand-primary/70' : 'text-brand-text-secondary'}`}>
                                    European Standard (1.000,00)
                                </span>
                         </button>
                    </div>

                    <h4 className="text-sm font-bold text-brand-text mb-4 flex items-center gap-2">
                        Aesthetic Themes
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => selectTheme(theme.id)}
                                className={`group p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${currentThemeId === theme.id ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border/50 bg-brand-bg/50 hover:border-brand-primary/30 hover:bg-brand-surface'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl shadow-md ${theme.color} flex items-center justify-center shrink-0`}>
                                    {currentThemeId === theme.id && <Check className="text-white drop-shadow" size={24} />}
                                </div>
                                <span className={`text-sm font-medium ${currentThemeId === theme.id ? 'text-brand-primary' : 'text-brand-text-secondary group-hover:text-brand-text'}`}>
                                    {theme.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Smartphone size={24} />
                    </div>
                    App Installation
                </h3>
                <div className="space-y-6">
                    <div className="bg-brand-bg/60 p-6 rounded-2xl border border-brand-border/40 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-brand-text text-lg">Install as Desktop/Mobile App</h4>
                            <p className="text-brand-text-secondary text-sm font-light mt-1">Get the native-like experience with offline support and a home screen icon.</p>
                        </div>
                        <button
                            onClick={onInstall}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
                                canInstall 
                                ? 'bg-brand-primary text-brand-bg hover:scale-105 shadow-brand-primary/20' 
                                : 'bg-brand-surface border border-brand-border text-brand-text shadow-none cursor-help'
                            }`}
                        >
                            <Download size={20} />
                            {canInstall ? 'Install Now' : 'Check Browser Support'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-brand-bg/30 border border-brand-border/30 rounded-2xl">
                            <h5 className="font-bold text-brand-text mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Android (Chrome)
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                Click the <span className="font-bold text-brand-text px-1">Install</span> button above, or tap the three dots <span className="font-bold text-brand-text">(⋮)</span> and select <span className="italic text-brand-text">"Add to Home screen"</span>.
                            </p>
                        </div>
                        <div className="p-5 bg-brand-bg/30 border border-brand-border/30 rounded-2xl">
                            <h5 className="font-bold text-brand-text mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                iOS (Safari)
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                Tap the <span className="font-bold text-brand-text">Share</span> icon (box with up arrow) and select <span className="italic text-brand-text">"Add to Home Screen"</span>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-500/80 leading-relaxed italic">
                            <b>Note:</b> Your app is optimized as a PWA (Progressive Web App). It provides the same benefits as an APK but requires less storage and stays updated automatically.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-2xl font-bold mb-4 text-brand-text">Local Storage & Sandboxed Memory</h3>
                <p className="text-brand-text-secondary text-sm font-light leading-relaxed mb-8">
                    View real-time client-side memory partitions stored inside your browser. Clear individual elements to reclaim space or execute a full backup.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Size metric widgets */}
                    <div className="p-5 bg-brand-bg/50 border border-brand-border/40 rounded-2xl flex flex-col justify-between">
                        <div>
                            <span className="text-xs text-brand-text-secondary font-semibold uppercase tracking-wider block mb-1">Calculator History</span>
                            <span className="text-2xl font-mono font-bold text-brand-text">{(storageSizes.history / 1024).toFixed(2)} KB</span>
                        </div>
                        <button 
                            onClick={() => handlePartialClear('history')}
                            disabled={storageSizes.history === 0}
                            className="w-full mt-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-35"
                        >
                            Purge History
                        </button>
                    </div>

                    <div className="p-5 bg-brand-bg/50 border border-brand-border/40 rounded-2xl flex flex-col justify-between">
                        <div>
                            <span className="text-xs text-brand-text-secondary font-semibold uppercase tracking-wider block mb-1">Scratchpad Notes</span>
                            <span className="text-2xl font-mono font-bold text-brand-text">{(storageSizes.notes / 1024).toFixed(2)} KB</span>
                        </div>
                        <button 
                            onClick={() => handlePartialClear('notes')}
                            disabled={storageSizes.notes === 0}
                            className="w-full mt-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-35"
                        >
                            Purge Scratchpad
                        </button>
                    </div>

                    <div className="p-5 bg-brand-bg/50 border border-brand-border/40 rounded-2xl flex flex-col justify-between">
                        <div>
                            <span className="text-xs text-brand-text-secondary font-semibold uppercase tracking-wider block mb-1">Total System Cache</span>
                            <span className="text-2xl font-mono font-bold text-brand-text">{(storageSizes.total / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={loadStorageUsage}
                                className="flex-1 mt-4 py-2 bg-brand-surface border border-brand-border hover:bg-brand-border text-brand-text rounded-xl text-xs font-bold uppercase transition-all"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Storage breakdown visualization */}
                <div className="space-y-2 mb-8 bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/35">
                    <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">Partition Allocation</h4>
                    <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            style={{ width: `${storageSizes.total > 0 ? (storageSizes.history / storageSizes.total) * 100 : 0}%` }} 
                            className="h-full bg-blue-500 transition-all duration-500"
                        />
                        <div 
                            style={{ width: `${storageSizes.total > 0 ? (storageSizes.notes / storageSizes.total) * 100 : 0}%` }} 
                            className="h-full bg-emerald-500 transition-all duration-500"
                        />
                        <div 
                            style={{ width: `${storageSizes.total > 0 ? (storageSizes.other / storageSizes.total) * 100 : 0}%` }} 
                            className="h-full bg-purple-500 transition-all duration-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2 text-[10px] font-mono">
                        <span className="flex items-center gap-1.5 text-blue-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            History: {(storageSizes.history / 1024).toFixed(2)} KB ({storageSizes.total > 0 ? Math.round((storageSizes.history / storageSizes.total) * 100) : 0}%)
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Notes: {(storageSizes.notes / 1024).toFixed(2)} KB ({storageSizes.total > 0 ? Math.round((storageSizes.notes / storageSizes.total) * 100) : 0}%)
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-400">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Metadata: {(storageSizes.other / 1024).toFixed(2)} KB ({storageSizes.total > 0 ? Math.round((storageSizes.other / storageSizes.total) * 100) : 0}%)
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-brand-border/40">
                    <div className="flex flex-col p-6 bg-brand-bg/60 border border-brand-border/40 rounded-2xl">
                        <div className="flex-1">
                            <h4 className="font-bold text-brand-text mb-2 flex items-center gap-2"><Download size={18} className="text-blue-500" /> Export Data Structure</h4>
                            <p className="text-brand-text-secondary text-sm font-light leading-relaxed mb-6">Download a complete snapshot JSON file of your local memory partitions directly from your client environment.</p>
                        </div>
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-bold transition-all text-sm shadow-sm"
                        >
                            <Download size={16} /> Execute Export
                        </button>
                    </div>

                    <div className="flex flex-col p-6 bg-brand-bg/60 border border-brand-border/40 rounded-2xl">
                        <div className="flex-1">
                            <h4 className="font-bold text-brand-text mb-2 flex items-center gap-2"><Upload size={18} className="text-purple-500" /> Import Local Backup</h4>
                            <p className="text-brand-text-secondary text-sm font-light leading-relaxed mb-6">Choose or drop a saved `.json` snapshot file to completely overlay themes, history, and workspace scratchpads.</p>
                        </div>
                        <label className="w-full h-[46px] flex items-center justify-center gap-2 px-4 py-3 bg-brand-surface hover:bg-brand-primary/10 hover:border-brand-primary/50 text-brand-text border border-brand-border rounded-xl font-bold transition-all text-sm cursor-pointer shadow-sm text-center">
                            <Upload size={16} className="text-purple-400" /> Upload JSON File
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportData}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex flex-col p-6 bg-red-500/5 border border-red-500/10 rounded-2xl relative z-10">
                        <div className="flex-1">
                            <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><Trash2 size={18} /> Hard Purge Memory</h4>
                            <p className="text-red-500/80 text-sm font-light leading-relaxed mb-6">Instantly clear your entire sandbox database footprint, themes, and customized models. This physical purge is irreversible.</p>
                        </div>
                        <button
                            onClick={handleClearAllData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all text-sm animate-pulse"
                        >
                            <Trash2 size={16} /> Purge All Database
                        </button>
                    </div>
                </div>
            </motion.div>

            {toastMessage && (
                <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-brand-text text-brand-bg px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in-up font-bold flex items-center gap-3">
                     <Check size={20} className="text-brand-primary" />
                     {toastMessage}
                </div>
            )}
        </motion.div>
    );
};

export default Settings;

