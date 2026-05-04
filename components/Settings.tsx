import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Check, Download, Trash2, ArrowUpRight } from 'lucide-react';

const themes = [
    { id: 'dark', name: 'Original Dark', color: 'bg-[#1a202c]' },
    { id: 'light', name: 'Clean Light', color: 'bg-[#f7fafc]' },
    { id: 'neon', name: 'Neon Night', color: 'bg-black border border-brand-primary' },
    { id: 'royal', name: 'Royal Purple', color: 'bg-[#1a0b2e]' },
    { id: 'terminal', name: 'Matrix Green', color: 'bg-black border border-green-500' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#130019]' },
];

const Settings: React.FC = () => {
    const [toastMessage, setToastMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                 // Initialize correctly based on saved theme
                 const root = window.document.documentElement;
                 if (savedTheme !== 'dark') root.className = savedTheme;
                 else root.className = '';
                 return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (error) {
            console.error("Could not access theme from localStorage", error);
            return true; // Default to dark mode
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

    // Effect for Theme (only for initial class application if needed, but usually handled by handleThemeToggle)
    // Actually, we should apply the class on mount if it's not already there.
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

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Settings</h2>
            
             <div className="bg-brand-surface/50 p-6 rounded-lg max-w-2xl mx-auto space-y-8 divide-y divide-brand-border">
                <div className="pb-8">
                    <h3 className="text-xl font-bold mb-4 text-brand-accent flex items-center gap-2">
                        <Sun /> Appearance
                    </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-brand-text-secondary text-sm max-w-md">
                            Manually switch between light and dark themes. This will override your system setting.
                        </p>
                        <button
                            onClick={handleThemeToggle}
                            role="switch"
                            aria-checked={isDarkMode}
                            aria-label="Theme toggle"
                            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary ${
                                isDarkMode ? 'bg-brand-primary' : 'bg-gray-400'
                            }`}
                        >
                            <span className="sr-only">Switch to {isDarkMode ? 'light' : 'dark'} mode</span>
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                            <Sun className={`absolute left-1.5 h-4 w-4 text-yellow-300 transition-opacity ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                            <Moon className={`absolute right-1.5 h-4 w-4 text-white transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                    </div>

                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-brand-text mb-4 uppercase tracking-widest flex items-center gap-2">
                           <Palette size={16} /> Advanced Themes
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => selectTheme(theme.id)}
                                    className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${currentThemeId === theme.id ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border bg-brand-surface hover:border-brand-primary/30'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full shadow-lg ${theme.color} flex items-center justify-center`}>
                                        {currentThemeId === theme.id && <Check className="text-white" size={20} />}
                                    </div>
                                    <span className={`text-xs font-bold ${currentThemeId === theme.id ? 'text-brand-primary' : 'text-brand-text-secondary group-hover:text-brand-text'}`}>
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <h3 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
                        Data Management
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-brand-surface border border-brand-border rounded-xl">
                            <div>
                                <h4 className="font-bold text-brand-text">Export Backup</h4>
                                <p className="text-brand-text-secondary text-xs">Download all your data (History, Notes, Settings) as a JSON file.</p>
                            </div>
                            <button
                                onClick={handleExportData}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold transition-all text-sm"
                            >
                                <Download size={16} /> Export
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-brand-surface border border-brand-border rounded-xl">
                            <div>
                                <h4 className="font-bold text-red-400">Clear All Data</h4>
                                <p className="text-brand-text-secondary text-xs">Permanently remove everything from local storage.</p>
                            </div>
                            <button
                                onClick={handleClearAllData}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all text-sm"
                            >
                                <Trash2 size={16} /> Reset App
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 text-center">
                    <p className="text-brand-text-secondary text-xs italic">QuantumCalc v3.0 Premium Experience</p>
                    <div className="mt-2 flex justify-center gap-4">
                         <a href="#" className="text-brand-primary text-xs flex items-center gap-1 hover:underline">Privacy Policy <ArrowUpRight size={10} /></a>
                         <a href="#" className="text-brand-primary text-xs flex items-center gap-1 hover:underline">Terms of Service <ArrowUpRight size={10} /></a>
                    </div>
                </div>
            </div>

            {toastMessage && <div className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-down">{toastMessage}</div>}
        </div>
    );
};

export default Settings;
