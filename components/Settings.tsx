import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Check, Download, Trash2, GraduationCap, School, User as UserIcon, HardHat, Building2, Save, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { secureStorage } from '../services/geminiService';
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
                const trimmedKey = customApiKey.trim();
                if (!trimmedKey.startsWith('AIzaSy')) {
                    showToast("Warning: This may not be a valid Gemini API key. They usually start with 'AIzaSy'.", );
                }
                secureStorage.setItem('CUSTOM_GEMINI_API_KEY', trimmedKey);
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
                    showToast("Profile updated and synced to Drive!");
                } catch (driveError) {
                    showToast("Profile updated locally. Drive sync failed.");
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

                    <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm flex flex-col">
                        <h3 className="text-xl font-bold mb-6 text-brand-text flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                <AlertCircle size={20} />
                            </div>
                            API Keys
                        </h3>
                        <div className="flex-1 space-y-4">
                            <p className="text-brand-text-secondary text-sm font-light leading-relaxed mb-4">
                                Set your own Gemini API key to unlock advanced features or if you encounter quota limits.
                            </p>
                            
                            {isKeySaved ? (
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <span className="text-emerald-500 font-medium text-xs">Custom API key is active.</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <AlertCircle className="text-amber-500 shrink-0" size={16} />
                                    <span className="text-amber-500 font-medium text-xs">System default key used.</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <input
                                    type="password"
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    placeholder={isKeySaved ? "Enter new key to replace..." : "Gemini API key (AIzaSy...)"}
                                    className="w-full bg-brand-bg border border-brand-border/60 text-brand-text rounded-xl p-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-text-secondary/50 font-mono text-sm"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveApiKey}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-all font-bold text-xs uppercase tracking-wider border border-purple-500/20"
                                    >
                                        <Save size={14} />
                                        {isKeySaved ? (customApiKey.trim() === '' ? 'Remove' : 'Replace') : 'Save'}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                if ((window as any).aistudio?.openSelectKey) {
                                                    await (window as any).aistudio.openSelectKey();
                                                    showToast("API Key selection completed.");
                                                } else {
                                                    showToast("Platform Dialog unavailable.");
                                                }
                                            } catch (err) {
                                                showToast("Failed to open selector.");
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-brand-text transition-all font-bold text-xs uppercase tracking-wider"
                                    >
                                        Use Dialog
                                    </button>
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

            <motion.div variants={sectionVariants} className="bg-brand-surface/40 p-6 md:p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-2xl font-bold mb-8 text-brand-text">Data & Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col p-6 bg-brand-bg/60 border border-brand-border/40 rounded-2xl">
                        <div className="flex-1">
                            <h4 className="font-bold text-brand-text mb-2 flex items-center gap-2"><Download size={18} className="text-blue-500" /> Export Data</h4>
                            <p className="text-brand-text-secondary text-sm font-light leading-relaxed mb-6">Download a complete snapshot of your calculation history and preferences.</p>
                        </div>
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-bold transition-all text-sm"
                        >
                            <Download size={16} /> Execute Export
                        </button>
                    </div>

                    <div className="flex flex-col p-6 bg-red-500/5 border border-red-500/10 rounded-2xl relative z-10">
                        <div className="flex-1">
                            <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><Trash2 size={18} /> Reset Application</h4>
                            <p className="text-red-500/80 text-sm font-light leading-relaxed mb-6">Permanently purge all local memory. This action is instantaneous and irreversible.</p>
                        </div>
                        <button
                            onClick={handleClearAllData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all text-sm"
                        >
                            <Trash2 size={16} /> Purge Memory
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

