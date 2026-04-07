import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const Settings: React.FC = () => {
    const [toastMessage, setToastMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (error) {
            console.error("Could not access theme from localStorage", error);
            return true; // Default to dark mode
        }
    });

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
                </div>

                <div className="pt-8">
                    <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                        Data Management
                    </h3>
                    <div className="flex justify-between items-center">
                        <p className="text-brand-text-secondary text-sm max-w-md">
                            Clear all locally stored data, including history and preferences.
                        </p>
                        <button
                            onClick={handleClearAllData}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors text-sm"
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>

            {toastMessage && <div className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-down">{toastMessage}</div>}
        </div>
    );
};

export default Settings;
