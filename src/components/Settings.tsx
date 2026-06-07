import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Check, Download, Trash2, GraduationCap, School, User as UserIcon, HardHat, Building2, Save, Cloud, RefreshCw, AlertCircle, Smartphone, Info, Cpu, Sparkles, Clipboard, Activity, Upload, Sliders, Volume2, Compass, Eye, Pin } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { secureStorage, validateApiKey, getGeminiModel } from '../services/geminiService';
import { googleDriveService } from '../services/googleDriveService';
import { motion } from 'motion/react';
import { toolCategories } from './common/toolCategories';
import { dailyGoalService } from '../services/dailyGoalService';
import { Target, Trophy, Flame as FlameIcon, CheckCircle, RotateCcw } from 'lucide-react';
import { Achievements } from './Achievements';

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
    { id: 'cosmic', name: 'Cosmic Slate', color: 'bg-[#030014] border border-[#1e1b4b]' },
    { id: 'mobile-touch', name: 'Mobile Tactile', color: 'bg-black border-2 border-dashed border-blue-400' },
];

interface SettingsProps {
    canInstall?: boolean;
    onInstall?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ canInstall, onInstall }) => {
    const { user, userData, accessToken, signInWithGoogle } = useAuth();
    const [toastMessage, setToastMessage] = useState('');
    const [currentThemeId, setCurrentThemeId] = useState(() => {
        try { return localStorage.getItem('theme') || 'dark'; } catch(e) { return 'dark'; }
    });
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
        try {
            return localStorage.getItem('numberFormat') || 'us';
        } catch {
            return 'us';
        }
    });

    const handleFormatChange = (format: string) => {
        setNumberFormat(format);
        localStorage.setItem('numberFormat', format);
        try {
            window.dispatchEvent(new CustomEvent('numberFormat-change', { detail: { format } }));
        } catch (e) {
            console.warn("Could not dispatch numberFormat-change event", e);
        }
        showToast('Number formatting updated.');
    };

    const [pinnedToolIds, setPinnedToolIds] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('pinnedTools') || '[]');
        } catch {
            return [];
        }
    });

    const [goalData, setGoalData] = useState(() => dailyGoalService.getGoalData());

    useEffect(() => {
        const handlePinnedChange = (e: any) => {
            setPinnedToolIds(e.detail?.pinnedTools || []);
        };
        const handleGoalChange = (e: any) => {
            setGoalData(dailyGoalService.getGoalData());
        };
        window.addEventListener('pinnedTools-change', handlePinnedChange);
        window.addEventListener('dailyGoal-change', handleGoalChange);
        return () => {
            window.removeEventListener('pinnedTools-change', handlePinnedChange);
            window.removeEventListener('dailyGoal-change', handleGoalChange);
        };
    }, []);

    const togglePin = (toolId: string) => {
        let nextPinned: string[];
        if (pinnedToolIds.includes(toolId)) {
            nextPinned = pinnedToolIds.filter(id => id !== toolId);
        } else {
            nextPinned = [...pinnedToolIds, toolId];
        }
        setPinnedToolIds(nextPinned);
        localStorage.setItem('pinnedTools', JSON.stringify(nextPinned));
        window.dispatchEvent(new CustomEvent('pinnedTools-change', { detail: { pinnedTools: nextPinned } }));
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
    const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => { try { return localStorage.getItem('google_drive_auto_sync') === 'true'; } catch(e) { return false; } });
    const [offlineModeEnabled, setOfflineModeEnabled] = useState(() => { try { return localStorage.getItem('offline_mode') === 'true'; } catch(e) { return false; } });

    const handleAutoSyncToggle = () => {
        const nextVal = !autoSyncEnabled;
        setAutoSyncEnabled(nextVal);
        localStorage.setItem('google_drive_auto_sync', nextVal ? 'true' : 'false');
        showToast(nextVal ? "Real-time Google Drive auto-sync is now active!" : "Real-time auto-sync disabled.");
    };

    const handleOfflineModeToggle = () => {
        const nextVal = !offlineModeEnabled;
        setOfflineModeEnabled(nextVal);
        localStorage.setItem('offline_mode', nextVal ? 'true' : 'false');
        if (nextVal) {
            showToast("Sandbox Offline Mode ENABLED. Reloading to bypass Firebase Auth...");
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast("Sandbox Offline Mode DISABLED. Reloading to connect to Firebase Sandbox...");
            setTimeout(() => window.location.reload(), 1500);
        }
    };

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
    const [aiTone, setAiTone] = useState(() => { try { return localStorage.getItem('CUSTOM_AI_TONE') || 'academic'; } catch(e) { return 'academic'; } });
    const [hapticEnabled, setHapticEnabled] = useState(() => { try { return localStorage.getItem('CUSTOM_HAPTIC_ENABLED') === 'true'; } catch { return false; } });
    const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [apiTestMessage, setApiTestMessage] = useState('');
    const [smartInputText, setSmartInputText] = useState('');
    const [extractedKey, setExtractedKey] = useState('');
    
    // Status states for enhanced installation mode
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [isNativeApp, setIsNativeApp] = useState(false);

    // Enhanced math engine & performance controls
    const [decimalPlaces, setDecimalPlaces] = useState(() => { try { return localStorage.getItem('calcDecimalPlaces') || 'auto'; } catch { return 'auto'; } });
    const [angleUnit, setAngleUnit] = useState(() => { try { return localStorage.getItem('calcAngleUnit') || 'rad'; } catch { return 'rad'; } });
    const [soundFXEnabled, setSoundFXEnabled] = useState(() => { try { return localStorage.getItem('allowSoundFX') === 'true'; } catch { return false; } });
    const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(() => { try { return localStorage.getItem('allowVoiceSpeech') === 'true'; } catch { return false; } });
    const [reducedMotionEnabled, setReducedMotionEnabled] = useState(() => { try { return localStorage.getItem('reducedMotion') === 'true'; } catch { return false; } });
    const [maxHistoryRows, setMaxHistoryRows] = useState(() => { try { return localStorage.getItem('calcMaxHistoryRows') || '100'; } catch { return '100'; } });

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                             (navigator as any).standalone || 
                             document.referrer.includes('android-app://');
        const isCapacitor = !!(window as any).Capacitor?.isNative;
        setIsAppInstalled(isStandalone);
        setIsNativeApp(isCapacitor);
    }, []);

    const handleDecimalPlacesChange = (val: string) => {
        setDecimalPlaces(val);
        localStorage.setItem('calcDecimalPlaces', val);
        showToast(`Calculation precision capped at: ${val === 'auto' ? 'Floating Point' : val + ' decimal places'}`);
    };

    const handleAngleUnitChange = (val: string) => {
        setAngleUnit(val);
        localStorage.setItem('calcAngleUnit', val);
        showToast(`Standard angle orientation alignment set to: ${val === 'rad' ? 'Radians' : 'Degrees'}`);
    };

    const handleSoundFXToggle = () => {
        const nextSound = !soundFXEnabled;
        setSoundFXEnabled(nextSound);
        localStorage.setItem('allowSoundFX', nextSound ? 'true' : 'false');
        showToast(nextSound ? "Keypress click sounds initialized!" : "Keypress sound feedback muted.");
    };

    const handleVoiceSpeechToggle = () => {
        const nextVoice = !voiceSpeechEnabled;
        setVoiceSpeechEnabled(nextVoice);
        localStorage.setItem('allowVoiceSpeech', nextVoice ? 'true' : 'false');
        
        if (nextVoice && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance("Vocal feedback engine calibrated.");
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.warn("Speech synthesis issue:", err);
            }
        }
        showToast(nextVoice ? "Virtual tutor vocal feedback activated!" : "Vocal feedback deactivated.");
    };

    const handleReducedMotionToggle = () => {
        const nextMotion = !reducedMotionEnabled;
        setReducedMotionEnabled(nextMotion);
        localStorage.setItem('reducedMotion', nextMotion ? 'true' : 'false');
        
        const root = window.document.documentElement;
        if (nextMotion) {
            root.classList.add('reduced-motion');
        } else {
            root.classList.remove('reduced-motion');
        }
        showToast(nextMotion ? "Reduced motion speed controls applied!" : "Normal transitions restored.");
    };

    const handleMaxHistoryRowsChange = (val: string) => {
        setMaxHistoryRows(val);
        localStorage.setItem('calcMaxHistoryRows', val);
        showToast(`Calculation journal log length capped at: ${val === 'unlimited' ? 'Unlimited' : val + ' items'}`);
    };
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
                    // Extract all non-auth key-value pairs representing all tool states and preferences
                    const dump: Record<string, string> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key !== 'google_access_token' && !key.includes('firebase:authUser') && !key.startsWith('firebase:')) {
                            const val = localStorage.getItem(key);
                            if (val !== null) {
                                dump[key] = val;
                            }
                        }
                    }

                    const fullBackupData = {
                        ...profileData,
                        calcHistory: localStorage.getItem('calcHistory') || '',
                        quantum_notes: localStorage.getItem('quantum_notes') || '',
                        localStorageDump: dump
                    };
                    await googleDriveService.saveProfile(accessToken, fullBackupData);
                    showToast("Workspace profile, custom preferences, and all tools history successfully synced to Google Drive!");
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

                // Restore complete localStorage states if available
                if (driveProfile.localStorageDump) {
                    let keysRestored = 0;
                    Object.entries(driveProfile.localStorageDump).forEach(([key, value]) => {
                        if (key !== 'google_access_token' && !key.includes('firebase:authUser') && !key.startsWith('firebase:')) {
                            localStorage.setItem(key, value);
                            keysRestored++;
                        }
                    });
                    if (keysRestored > 0) {
                        dataRecoveredMessage = `Success! Restored profile, history, and ${keysRestored} active tools partitions from Google Drive!`;
                        countRestored++;
                    }
                } else {
                    if (driveProfile.calcHistory) {
                        localStorage.setItem('calcHistory', driveProfile.calcHistory);
                        countRestored++;
                    }
                    if (driveProfile.quantum_notes) {
                        localStorage.setItem('quantum_notes', driveProfile.quantum_notes);
                        countRestored++;
                    }
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

                        {/* Divider separating details from Achievements grid */}
                        <div className="h-[1px] bg-brand-border/20 my-6" />

                        {/* Achievements & Academic Milestones Grid */}
                        <Achievements />
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

                            {accessToken ? (
                                <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border/40 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h5 className="text-xs font-bold text-brand-text">Real-Time Cloud Auto-Backup</h5>
                                        <p className="text-[10px] text-brand-text-secondary leading-relaxed">Autosaves dynamic workspace state and history on changes.</p>
                                    </div>
                                    <button
                                        onClick={handleAutoSyncToggle}
                                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-all focus:outline-none ${autoSyncEnabled ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-brand-border hover:bg-brand-border/80'}`}
                                    >
                                        <div className={`bg-brand-bg w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex flex-col gap-3">
                                    <div>
                                        <h5 className="text-xs font-bold text-brand-text">Authorize Backups</h5>
                                        <p className="text-[10px] text-brand-text-secondary leading-relaxed">Securely store your custom variables, preferences, and calculations.</p>
                                    </div>
                                    
                                    {window.self !== window.top && (
                                        <p className="text-[9.5px] text-brand-text-secondary bg-brand-bg/60 p-2.5 rounded-xl leading-relaxed">
                                            ⚠️ Sandbox Active. If the popup login fails, click the <strong>Redirect</strong> option or <strong>Open in Full Tab</strong>.
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => signInWithGoogle && signInWithGoogle(false)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold transition-all cursor-pointer min-w-[100px]"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            <span>Popup</span>
                                        </button>
                                        <button
                                            onClick={() => signInWithGoogle && signInWithGoogle(true)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-bg hover:bg-brand-border/40 text-brand-text border border-brand-border/50 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-[100px]"
                                        >
                                            <span>Redirect</span>
                                        </button>
                                    </div>
                                </div>
                            )}

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

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                        <Sliders size={24} />
                    </div>
                    Math & Operations Engine
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-sans">
                    {/* Decimal Precision config */}
                    <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-border/40 flex flex-col justify-between shadow-inner">
                        <div>
                            <span className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                                <Cpu size={16} className="text-brand-primary" />
                                Decimal Places Precision
                            </span>
                            <p className="text-xs text-brand-text-secondary leading-relaxed mb-4 font-light">
                                Calibrate output accuracy. "Auto" allows floating point structures; specific counts force fraction rounding boundaries.
                            </p>
                        </div>
                        <select
                            value={decimalPlaces}
                            onChange={(e) => handleDecimalPlacesChange(e.target.value)}
                            className="bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer w-full font-mono font-medium"
                        >
                            <option value="auto">Floating Point (Auto)</option>
                            <option value="0">0 (Integers Only)</option>
                            <option value="2">2 (Standard Currency/Finance)</option>
                            <option value="4">4 (Precision Scientific)</option>
                            <option value="6">6 (Micro-parameters scale)</option>
                            <option value="8">8 (High Precision Engineering)</option>
                        </select>
                    </div>

                    {/* Angular Trigonometry system default orientation */}
                    <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-border/40 flex flex-col justify-between shadow-inner">
                        <div>
                            <span className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                                <Compass size={16} className="text-blue-500" />
                                Default Angular Measurement
                            </span>
                            <p className="text-xs text-brand-text-secondary leading-relaxed mb-4 font-light">
                                Configures standard trigonometric operations functions orientation. Select between Radians and Degrees.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAngleUnitChange('rad')}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    angleUnit === 'rad' 
                                    ? 'bg-brand-primary border-brand-primary text-brand-bg shadow-md shadow-brand-primary/15' 
                                    : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
                                }`}
                            >
                                Radians (rad)
                            </button>
                            <button
                                onClick={() => handleAngleUnitChange('deg')}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    angleUnit === 'deg' 
                                    ? 'bg-brand-primary border-brand-primary text-brand-bg shadow-md shadow-brand-primary/15' 
                                    : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-primary/30'
                                }`}
                            >
                                Degrees (deg)
                            </button>
                        </div>
                    </div>

                    {/* Calculation History Log Journal constraints */}
                    <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-border/40 flex flex-col justify-between shadow-inner col-span-1 md:col-span-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <span className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                                    <Activity size={16} className="text-emerald-500" />
                                    Calculation History Cap
                                </span>
                                <p className="text-xs text-brand-text-secondary leading-relaxed font-light">
                                    Restrict the total history entries cached locally to maintain optimal operating heap sizes.
                                </p>
                            </div>
                            <div className="w-full md:w-64 shrink-0">
                                <select
                                    value={maxHistoryRows}
                                    onChange={(e) => handleMaxHistoryRowsChange(e.target.value)}
                                    className="bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer w-full font-mono font-medium"
                                >
                                    <option value="25">Max 25 Rows (Resource Saver)</option>
                                    <option value="50">Max 50 Rows (Standard Log)</option>
                                    <option value="100">Max 100 Rows (Extended Log)</option>
                                    <option value="unlimited">Unlimited Retention Rows</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accessibility Toggles Block */}
                <div className="space-y-4 pt-6 border-t border-brand-border/30">
                    <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-3">Accessibility & Keyboard feedback</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Audio Click Feedback */}
                        <div className="flex justify-between items-center bg-brand-bg/40 p-3.5 rounded-2xl border border-brand-border/30">
                            <div>
                                <span className="text-xs text-brand-text font-bold block flex items-center gap-1.5">
                                    <Volume2 size={14} className="text-emerald-500" />
                                    Keyclick Sound FX
                                </span>
                                <span className="text-[10px] text-brand-text-secondary font-light">Audio ticks on buttons click</span>
                            </div>
                            <button
                                onClick={handleSoundFXToggle}
                                className={`relative inline-flex items-center h-5.5 w-11 rounded-full transition-colors duration-300 focus:outline-none shrink-0 cursor-pointer ${
                                    soundFXEnabled ? 'bg-emerald-500' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                                        soundFXEnabled ? 'translate-x-[1.45rem]' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Speech Vocal Synthesis Assistant */}
                        <div className="flex justify-between items-center bg-brand-bg/40 p-3.5 rounded-2xl border border-brand-border/30">
                            <div>
                                <span className="text-xs text-brand-text font-bold block flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-purple-500" />
                                    Speech Assistant Voice
                                </span>
                                <span className="text-[10px] text-brand-text-secondary font-light">Vocalizes calculation results</span>
                            </div>
                            <button
                                onClick={handleVoiceSpeechToggle}
                                className={`relative inline-flex items-center h-5.5 w-11 rounded-full transition-colors duration-300 focus:outline-none shrink-0 cursor-pointer ${
                                    voiceSpeechEnabled ? 'bg-purple-500' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                                        voiceSpeechEnabled ? 'translate-x-[1.45rem]' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Reduced Transitions */}
                        <div className="flex justify-between items-center bg-brand-bg/40 p-3.5 rounded-2xl border border-brand-border/30">
                            <div>
                                <span className="text-xs text-brand-text font-bold block flex items-center gap-1.5">
                                    <Eye size={14} className="text-amber-500" />
                                    Reduced Motion
                                </span>
                                <span className="text-[10px] text-brand-text-secondary font-light">Lower animations overhead</span>
                            </div>
                            <button
                                onClick={handleReducedMotionToggle}
                                className={`relative inline-flex items-center h-5.5 w-11 rounded-full transition-colors duration-300 focus:outline-none shrink-0 cursor-pointer ${
                                    reducedMotionEnabled ? 'bg-amber-500' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                                        reducedMotionEnabled ? 'translate-x-[1.45rem]' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

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

            {/* Daily Calculation Goals & Consistency Section */}
            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden animate-fade-in" id="daily_goal_settings_card">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-2xl font-bold mb-6 text-brand-text flex items-center justify-between">
                    <span className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Target size={24} />
                        </div>
                        Daily Calculation Goal
                    </span>
                    {dailyGoalService.getTodaySolved() >= goalData.target && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold animate-pulse">
                            <Trophy size={14} /> Goal met today!
                        </span>
                    )}
                </h3>

                <p className="text-brand-text-secondary text-sm font-light mb-8">
                    Set a customized target number of arithmetic calculations, science worksheets, or cognitive drills to answer correctly each day. Cultivate a persistent learning habit and watch your consistency grow!
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Circle Progress Ring */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-brand-bg/40 rounded-2xl border border-brand-border/30 relative">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            {/* SVG Progress Ring */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                {/* Track */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    className="stroke-brand-border/10 fill-none"
                                    strokeWidth="8"
                                />
                                {/* Progress dynamic circle */}
                                <motion.circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    className="stroke-emerald-400 fill-none"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 50}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                    animate={{ 
                                        strokeDashoffset: (2 * Math.PI * 50) - (Math.min(100, (dailyGoalService.getTodaySolved() / goalData.target) * 100) / 100) * (2 * Math.PI * 50) 
                                    }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Inner Metric Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black font-mono text-brand-text leading-none">
                                    {dailyGoalService.getTodaySolved()}
                                </span>
                                <div className="w-12 h-[1px] bg-brand-border/40 my-1" />
                                <span className="text-xs font-mono font-black text-emerald-400 leading-none">
                                    Goal: {goalData.target}
                                </span>
                            </div>
                        </div>

                        {/* Percent status */}
                        <div className="text-center mt-4">
                            <span className="text-lg font-black text-brand-text">
                                {Math.round(Math.min(100, (dailyGoalService.getTodaySolved() / goalData.target) * 100))}%
                            </span>
                            <span className="text-xs text-brand-text-secondary block">completed today</span>
                        </div>
                    </div>

                    {/* Settings Controls */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Target selection buttons */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-[0.15em] text-brand-text-secondary mb-3">
                                Set Daily Target Problems Solved
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                                {[3, 5, 10, 15, 20, 25].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            dailyGoalService.setTarget(val);
                                            showToast(`Daily target set to ${val} problems.`);
                                        }}
                                        className={`px-4 py-2.5 rounded-xl font-mono text-sm font-black transition-all cursor-pointer ${
                                            goalData.target === val
                                                ? 'bg-emerald-500 text-brand-bg shadow-md shadow-emerald-500/20'
                                                : 'bg-brand-bg/50 border border-brand-border/60 text-brand-text-secondary hover:text-brand-text hover:border-brand-primary'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                                {/* Custom Numeric controller */}
                                <div className="flex items-center bg-brand-bg/50 border border-brand-border/60 rounded-xl overflow-hidden px-2 h-[41px]">
                                    <span className="text-[10px] font-black uppercase text-brand-text-secondary pr-2">CUSTOM</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={goalData.target}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val > 0) {
                                                dailyGoalService.setTarget(val);
                                            }
                                        }}
                                        className="w-16 bg-transparent text-center border-none p-0 text-brand-text font-mono font-black placeholder-brand-text-secondary/40 focus:outline-none focus:ring-0 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consistency indicators Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Streak Counter Block */}
                            <div className="p-4 bg-brand-bg/40 border border-brand-border/30 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
                                        <FlameIcon size={18} className="fill-amber-500/10" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary block leading-none mb-1">Current Streak</span>
                                        <span className="text-xl font-mono font-black text-amber-500">{goalData.streak} days</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-brand-text-secondary max-w-[100px] text-right leading-tight">
                                    Keep completing goals to protect your streak!
                                </div>
                            </div>

                            {/* Total Days track */}
                            <div className="p-4 bg-brand-bg/40 border border-brand-border/30 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-lg">
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary block leading-none mb-1">Completed Days</span>
                                        <span className="text-xl font-mono font-black text-brand-primary">
                                            {Object.values(goalData.history).filter(solved => solved >= goalData.target).length} Days
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm("Reset current daily statistics and history logs? This action is permanent.")) {
                                            dailyGoalService.saveGoalData({ target: 5, history: {}, streak: 0 });
                                            showToast("Daily statistics and target goals reset.");
                                        }
                                    }}
                                    title="Reset consistency records"
                                    className="p-2 rounded-lg text-brand-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-all"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Weekly consistency timeline */}
                        <div className="bg-brand-bg/20 p-4 border border-brand-border/30 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary block mb-3">
                                Weekly Consistency (Last 7 Days)
                            </span>
                            <div className="grid grid-cols-7 gap-2">
                                {dailyGoalService.getPastWeeklyConsistency().map((dayData, idx) => {
                                    const dateObj = new Date(dayData.date + 'T00:00:00');
                                    const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                                    const isToday = dayData.date === new Date().toISOString().split('T')[0];
                                    
                                    return (
                                        <div key={dayData.date} className={`flex flex-col items-center p-2 rounded-xl border relative ${
                                            isToday 
                                                ? 'bg-brand-primary/5 border-brand-primary/30' 
                                                : dayData.completed 
                                                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                                                    : 'bg-brand-bg/40 border-brand-border/10'
                                        }`}>
                                            <span className="text-[9px] font-black uppercase text-brand-text-secondary leading-none mb-1.5">
                                                {weekday}
                                            </span>
                                            
                                            <div className="mb-1">
                                                {dayData.completed ? (
                                                    <CheckCircle size={16} className="text-emerald-400" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-dashed border-brand-text-secondary/40 flex items-center justify-center">
                                                        <span className="text-[8px] font-mono font-bold text-brand-text-secondary/60">
                                                            {dayData.solved}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <span className="text-[8px] font-mono text-brand-text-secondary/80 mt-0.5">
                                                {dayData.solved}/{dayData.target}
                                            </span>

                                            {isToday && (
                                                <div className="absolute -bottom-1 px-1 bg-brand-primary text-brand-bg text-[7px] font-black uppercase rounded">
                                                    TODAY
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center justify-between">
                    <span className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                            <Pin size={24} className="rotate-45" />
                        </div>
                        Favorites & Pinning
                    </span>
                </h3>

                <p className="text-brand-text-secondary text-sm font-light mb-6">
                    Customize your workspace. Pin your most frequently used academic aids, calculation tools, and unit converters here or by clicking the pin indicators directly in the sidebar for rapid, one-click access.
                </p>

                <div className="space-y-6">
                    {toolCategories.map((category) => (
                        <div key={category.label} className="bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/30">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-4 flex items-center gap-2 animate-fade-in">
                                <category.Icon size={14} className="opacity-70" />
                                {category.label}
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {category.items.map((item) => {
                                    const isPinned = pinnedToolIds.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                togglePin(item.id);
                                                showToast(isPinned ? `Removed ${item.label} from pinned tools.` : `Pinned ${item.label} to the top!`);
                                            }}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                                                isPinned 
                                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-text shadow-sm shadow-brand-primary/5' 
                                                    : 'border-brand-border/50 bg-brand-bg/20 hover:border-brand-primary/30 hover:bg-brand-surface text-brand-text-secondary hover:text-brand-text hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <item.Icon size={16} className={isPinned ? 'text-brand-primary shrink-0' : 'opacity-70 shrink-0 group-hover:scale-110 transition-transform duration-200'} />
                                                <span className="text-sm font-semibold truncate">{item.label}</span>
                                            </div>
                                            <Pin 
                                                size={14} 
                                                className={`transition-all duration-200 shrink-0 ${
                                                    isPinned 
                                                        ? 'text-brand-primary fill-brand-primary scale-110' 
                                                        : 'opacity-40 group-hover:opacity-100 group-hover:text-brand-primary hover:scale-125'
                                                }`} 
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center justify-between">
                    <span className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Smartphone size={24} />
                        </div>
                        Installation Center
                    </span>
                    
                    {/* Active Mode Badge */}
                    <div className="flex gap-2">
                        {isNativeApp ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm animate-pulse">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Android Native Core
                            </span>
                        ) : isAppInstalled ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm animate-pulse">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                Standalone Client Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-surface/80 border border-brand-border text-brand-text-secondary">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Web Portal mode
                            </span>
                        )}
                    </div>
                </h3>

                <div className="space-y-6">
                    {/* Dynamic Installation Hero Panel */}
                    <div className="bg-gradient-to-r from-brand-bg/90 to-brand-bg/50 p-6 rounded-2xl border border-brand-border/45 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-inner relative overflow-hidden">
                        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                        <div className="flex-1 text-center lg:text-left z-10">
                            <span className="text-xs text-brand-primary uppercase font-black tracking-wider">Progressive Native Engine</span>
                            <h4 className="font-bold text-brand-text text-xl mt-1">Unified App Sideload</h4>
                            <p className="text-brand-text-secondary text-sm font-light mt-1.5 max-w-xl">
                                Dock QuantumCalc to your home screen or operating system taskbar. Standalone clients execute on isolated local threads, bypassing browser overhead with optimized page loads, lower latency, and pristine full-screen viewpoints.
                            </p>
                        </div>
                        
                        <div className="z-10 shrink-0 w-full lg:w-auto">
                            {canInstall ? (
                                <button
                                    onClick={onInstall}
                                    className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-bg font-black transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 shadow-brand-primary/25 cursor-pointer"
                                >
                                    <Download size={20} />
                                    <span>Install Dashboard</span>
                                </button>
                            ) : (
                                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-brand-surface border border-brand-border/80 text-sm text-brand-text-secondary font-mono w-full justify-center">
                                        <Check size={16} className="text-emerald-500" />
                                        <span>Standalone-Ready</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logo/Icon Consistency Card */}
                    <div className="p-6 rounded-2xl bg-brand-surface/20 border border-brand-border/30 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-black border border-brand-border/60 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                            {/* Atom-Orbit Icon matching our SVG */}
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full p-2.5">
                                <circle cx="50" cy="50" r="12" fill="#3B82F6" />
                                <ellipse cx="50" cy="50" rx="42" ry="21" fill="none" stroke="#3B82F6" strokeWidth="4" opacity="0.3" />
                                <ellipse cx="50" cy="50" rx="21" ry="42" fill="none" stroke="#A855F7" strokeWidth="4" opacity="0.3" transform="rotate(60 50 50)" />
                                {/* Circuit-like nodes */}
                                <path d="M50 10V22M50 78V90M10 50H22M78 50H90" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="text-center md:text-left">
                            <h5 className="font-bold text-brand-text flex items-center gap-2 justify-center md:justify-start">
                                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                                <span>Premium Icon Continuity</span>
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed mt-1.5 max-w-2xl">
                                We have unified the desktop launch systems and Android device packages! The native application now uses a beautifully optimized <b>High-Res Adaptive Vector Icon</b> that mirrors our premium original <b>QuantumCalc Orbits & Brain-Circuit</b> branding, set elegantly against a sleek matte-black launcher canvas (#0A0A0A).
                            </p>
                        </div>
                    </div>

                    {/* OS Platform Specific installation Guide */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-brand-bg/30 border border-brand-border/30 rounded-2xl">
                            <h5 className="font-bold text-brand-text mb-2.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Android (Capacitor & Web)
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                Click the <span className="font-bold text-brand-primary">"Install Dashboard"</span> button above if available. Alternatively, open Chrome's settings <span className="font-bold text-brand-text">(⋮)</span> and tap <span className="italic text-brand-text">"Add to Home screen"</span> to compiled-install instantly.
                            </p>
                        </div>
                        <div className="p-5 bg-brand-bg/30 border border-brand-border/30 rounded-2xl">
                            <h5 className="font-bold text-brand-text mb-2.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                iOS (Apple Safari)
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                Launch Safari, tap the system <span className="font-bold text-brand-text">Share</span> button (box with up arrow), scroll down, and select <span className="italic text-brand-text">"Add to Home Screen"</span> for complete standalone windowing.
                            </p>
                        </div>
                        <div className="p-5 bg-brand-bg/30 border border-brand-border/30 rounded-2xl">
                            <h5 className="font-bold text-brand-text mb-2.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                PC & Mac Desktops
                            </h5>
                            <p className="text-xs text-brand-text-secondary leading-relaxed">
                                Look for the PWA <span className="font-bold text-brand-text">Install</span> app monitor monitor direct-icon visible on the right side of the address URL bar, or choose "Install QuantumCalc..." inside the browser's main drop-down.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-500/80 leading-relaxed italic">
                            <b>Did you know?</b> PWAs represent the next generation of native software, avoiding clunky system updates entirely. The client retains identical cached datasets, operates lightning fast, takes up under ~1MB, and syncs smoothly.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Cloud size={24} />
                    </div>
                    Network & Connectivity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-brand-text">Sandbox Offline Mode</h4>
                        <p className="text-brand-text-secondary text-sm font-light leading-relaxed">
                            Bypass all Firebase authentication and cloud sync logic on startup. Prevents network errors and iframe origin warnings in isolated preview environments.
                        </p>
                    </div>
                    <div className="flex items-center justify-start md:justify-end">
                        <button
                            onClick={handleOfflineModeToggle}
                            className={`relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg shrink-0 shadow-inner ${
                                offlineModeEnabled ? 'bg-emerald-500' : 'bg-gray-400/50'
                            }`}
                        >
                            <span
                                className={`inline-block w-8 h-8 transform bg-white rounded-full shadow-lg transition-transform duration-500 ease-in-out ${
                                    offlineModeEnabled ? 'translate-x-11' : 'translate-x-1'
                                } flex items-center justify-center`}
                            >
                                {offlineModeEnabled && <Check size={14} className="text-emerald-500" />}
                            </span>
                        </button>
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

