import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Check, Download, Trash2, GraduationCap, School, User as UserIcon, HardHat, Building2, Save } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { secureStorage } from '../services/geminiService';

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

import { googleDriveService } from '../services/googleDriveService';
import { Cloud, RefreshCw, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
    const { user, userData, accessToken } = useAuth();
    const [toastMessage, setToastMessage] = useState('');
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

    const currentThemeId = localStorage.getItem('theme') || 'dark';

    const selectTheme = (themeId: string) => {
        if (themeId === 'dark') {
             window.document.documentElement.removeAttribute('class');
        } else {
             window.document.documentElement.setAttribute('class', themeId);
        }
        localStorage.setItem('theme', themeId);
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
        if (window.confirm("Are you sure you want to clear all application data? This includes your calculation history, theme preferences, and calculator settings. This action cannot be undone.")) {
            try {
                localStorage.clear();
                showToast("All data cleared successfully. The page will reload.");
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

    const handleSaveApiKey = () => {
        try {
            if (customApiKey.trim() === '') {
                secureStorage.removeItem('CUSTOM_GEMINI_API_KEY');
                setIsKeySaved(false);
                showToast("API Key removed.");
            } else {
                secureStorage.setItem('CUSTOM_GEMINI_API_KEY', customApiKey.trim());
                setIsKeySaved(true);
                setCustomApiKey('');
                showToast("API Key saved securely.");
            }
        } catch (e) {
            showToast("Failed to save API Key.");
        }
    };

    useEffect(() => {
        if (userData) {
            setEditRole(userData.role || '');
            setEditGrade(userData.grade || '');
            setEditSchool(userData.school || '');
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

            // 2. Sync to Google Drive
            if (accessToken) {
                try {
                    await googleDriveService.saveProfile(accessToken, profileData);
                    showToast("Profile updated and synced to Google Drive!");
                } catch (driveError) {
                    showToast("Profile updated locally. Google Drive is not enabled.");
                }
            } else {
                showToast("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Profile update failed", error);
            showToast("Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleRestoreFromDrive = async () => {
        if (!accessToken || !user) return;
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
                showToast("Profile restored from Google Drive!");
            } else {
                showToast("No profile found on your Google Drive.");
            }
        } catch (error) {
            showToast("Restore failed. Google Drive may not be enabled.");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div>
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                    <UserIcon size={14} /> Personalization
                </div>
                <h2 className="text-4xl font-extrabold text-brand-text mb-2 tracking-tight flex items-center justify-center gap-3">
                    <Palette size={36} className="text-brand-primary" /> App Settings
                </h2>
                <p className="text-brand-text-secondary max-w-2xl mx-auto font-light text-lg">
                    Manage your identity, sync preferences, and customize the interface to match your workflow.
                </p>
            </div>
            
             <div className="max-w-3xl mx-auto space-y-8 pb-20">
                {user && (
                    <div className="bg-brand-surface/30 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl">
                        <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                                <UserIcon size={24} />
                            </div>
                            User Profile
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Identity Role</label>
                                    <select 
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="">Select Role...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.title}</option>
                                        ))}
                                    </select>
                                </div>
                                {['student', 'teacher'].includes(editRole) && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Grade / Level</label>
                                        <input
                                            type="text"
                                            value={editGrade}
                                            onChange={(e) => setEditGrade(e.target.value)}
                                            placeholder="e.g. 10th Grade"
                                            className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] ml-1">
                                        {['student', 'teacher'].includes(editRole) ? 'School / Institution' : 'Company / Organization'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editSchool}
                                        onChange={(e) => setEditSchool(e.target.value)}
                                        placeholder="Name of your institution"
                                        className="w-full bg-brand-bg/50 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSavingProfile}
                                className="w-full group flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand-primary text-brand-bg font-black text-lg hover:shadow-xl hover:shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isSavingProfile ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                {isSavingProfile ? 'UPDATING...' : 'SAVE ALL CHANGES'}
                            </button>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="bg-brand-surface/30 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl">
                        <h3 className="text-2xl font-bold mb-6 text-brand-text flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <Cloud size={24} />
                            </div>
                            Cloud Sync
                        </h3>
                        <div className="bg-brand-bg/40 backdrop-blur-sm border border-brand-border/40 rounded-[1.5rem] p-6 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-full ${accessToken ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {accessToken ? <Check size={28} /> : <AlertCircle size={28} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-brand-text tracking-tight italic">Google Drive Integration</h4>
                                    <p className="text-brand-text-secondary text-sm font-light">
                                        {accessToken 
                                            ? "Connected and ready to sync. Your data is encrypted on your personal drive." 
                                            : "Connect your Google account to enable secure cloud backups."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={!accessToken || isSavingProfile}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-black transition-all text-sm disabled:opacity-30 border border-brand-primary/20 uppercase tracking-widest"
                                >
                                    <RefreshCw size={18} className={isSavingProfile ? 'animate-spin' : ''} />
                                    Manual Sync
                                </button>
                                <button
                                    onClick={handleRestoreFromDrive}
                                    disabled={!accessToken || isRestoring}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-brand-border/60 text-brand-text hover:bg-brand-surface/50 transition-all text-sm disabled:opacity-30 font-black uppercase tracking-widest"
                                >
                                    {isRestoring ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                                    Restore Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="bg-brand-surface/30 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl">
                        <h3 className="text-2xl font-bold mb-6 text-brand-text flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                <Cloud size={24} />
                            </div>
                            AI Integration
                        </h3>
                        <div className="bg-brand-bg/40 backdrop-blur-sm border border-brand-border/40 rounded-[1.5rem] p-6 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-full bg-purple-500/10 text-purple-500">
                                    <AlertCircle size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-brand-text tracking-tight italic">Gemini API Key</h4>
                                    <p className="text-brand-text-secondary text-sm font-light">
                                        Set your own Gemini API key to unlock advanced high-quality features, or if you encounter quota limits.
                                    </p>
                                </div>
                            </div>
                            
                            {isKeySaved && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                                    <Check className="text-emerald-500" size={20} />
                                    <span className="text-emerald-500 font-medium text-sm flex-1">Your custom API key is configured and securely stored.</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <input
                                    type="password"
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    placeholder={isKeySaved ? "Enter new key to replace existing..." : "Enter your Gemini API key (AIzaSy...)"}
                                    className="w-full bg-brand-surface border border-brand-border/60 text-brand-text rounded-xl p-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/50 font-mono text-sm"
                                />
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleSaveApiKey}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 font-black transition-all text-sm border border-purple-500/20 uppercase tracking-widest"
                                    >
                                        <Save size={18} />
                                        {isKeySaved ? (customApiKey.trim() === '' ? 'Remove Key' : 'Replace Key') : 'Save Key'}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                if ((window as any).aistudio?.openSelectKey) {
                                                    await (window as any).aistudio.openSelectKey();
                                                    showToast("API Key selection completed.");
                                                } else {
                                                    // Try the old method if available
                                                    showToast("Platform API Key selection is not available.");
                                                }
                                            } catch (err) {
                                                showToast("Failed to open API key selection.");
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-brand-border/60 text-brand-text hover:bg-brand-surface/50 transition-all font-bold text-sm"
                                    >
                                        Use Platform Dialog
                                    </button>
                                </div>
                                <p className="text-xs text-brand-text-secondary font-light">
                                    Your key is stored purely locally in your browser and never sent to our servers.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-brand-surface/30 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl">
                    <h3 className="text-2xl font-bold mb-8 text-brand-text flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-accent/10 text-brand-accent">
                            <Sun size={24} />
                        </div>
                        Interface Core
                    </h3>
                    
                    <div className="flex justify-between items-center bg-brand-bg/40 p-6 rounded-2xl border border-brand-border/40 mb-10">
                        <div>
                            <h4 className="font-bold text-brand-text mb-1">Advanced Theme Toggle</h4>
                            <p className="text-brand-text-secondary text-xs font-light">Force app-wide luminosity mode</p>
                        </div>
                        <button
                            onClick={handleThemeToggle}
                            className={`relative inline-flex items-center h-8 w-14 rounded-full transition-all duration-500 shadow-inner ${
                                isDarkMode ? 'bg-brand-primary' : 'bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-500 ease-spring ${
                                    isDarkMode ? 'translate-x-[1.75rem]' : 'translate-x-[0.25rem]'
                                }`}
                            />
                            <Sun className={`absolute left-2 h-4 w-4 text-yellow-500 transition-opacity ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                            <Moon className={`absolute right-2 h-4 w-4 text-brand-bg transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-brand-primary mb-6 uppercase tracking-[0.3em] flex items-center gap-2 bg-brand-primary/5 w-fit px-3 py-1 rounded-full">
                           <Palette size={14} /> Aesthetic Presets
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => selectTheme(theme.id)}
                                    className={`group relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${currentThemeId === theme.id ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10' : 'border-brand-border bg-brand-bg/50 hover:border-brand-primary/40 hover:bg-brand-bg'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl shadow-xl ${theme.color} flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                        {currentThemeId === theme.id && <Check className="text-white drop-shadow-md" size={28} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentThemeId === theme.id ? 'text-brand-primary' : 'text-brand-text-secondary group-hover:text-brand-text'}`}>
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-brand-surface/30 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16" />
                    <h3 className="text-2xl font-bold mb-8 text-brand-text">Data & Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group flex flex-col justify-between p-6 bg-brand-bg/40 border border-brand-border/40 rounded-3xl hover:border-brand-primary/40 transition-all">
                            <div>
                                <h4 className="font-black text-brand-text italic mb-2">Export Brain</h4>
                                <p className="text-brand-text-secondary text-xs font-light leading-relaxed">Download a complete snapshot of your logic patterns and history for cold storage.</p>
                            </div>
                            <button
                                onClick={handleExportData}
                                className="mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-brand-bg rounded-xl font-black transition-all text-[10px] uppercase tracking-widest border border-brand-primary/20"
                            >
                                <Download size={16} /> Execute Export
                            </button>
                        </div>

                        <div className="flex flex-col justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-3xl hover:border-red-500/30 transition-all">
                            <div>
                                <h4 className="font-black text-red-500 italic mb-2">Nuclear Reset</h4>
                                <p className="text-brand-text-secondary text-xs font-light leading-relaxed">Permanently purge all local memory. This action is instantaneous and irreversible.</p>
                            </div>
                            <button
                                onClick={handleClearAllData}
                                className="mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black transition-all text-[10px] uppercase tracking-widest border border-red-500/20"
                            >
                                <Trash2 size={16} /> Purge Memory
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-12 text-center">
                    <div className="inline-block px-4 py-2 rounded-full bg-brand-surface/50 border border-brand-border/40 mb-6 font-mono text-[10px] tracking-widest text-brand-text-secondary">
                        QUANTUM_OS VERSION_3.0.4_STABLE
                    </div>
                    <div className="flex justify-center gap-10">
                         <a href="#" className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-colors">Privacy Protcol</a>
                         <a href="#" className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-colors">Core License</a>
                         <a href="#" className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-colors">Support Hub</a>
                    </div>
                </div>
            </div>

            {toastMessage && <div className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-down">{toastMessage}</div>}
        </div>
    );
};

export default Settings;
