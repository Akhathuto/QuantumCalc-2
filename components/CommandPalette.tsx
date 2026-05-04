/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  Settings, 
  History, 
  Calculator, 
  LineChart, 
  Zap, 
  Command,
  ArrowRight,
  Palette,
  Layout,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab } from '../types';

interface CommandPaletteProps {
  onTabClick: (tabId: AppTab) => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  category: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onTabClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs: {id: AppTab, name: string, icon: any}[] = [
    { id: 'calculator', name: 'Scientific Calculator', icon: Calculator },
    { id: 'graphing', name: 'Graphing Mode', icon: LineChart },
    { id: 'student', name: 'Student Workspace', icon: Terminal },
    { id: 'programmer', name: 'Dev Pro', icon: Zap },
    { id: 'math-tools', name: 'Mathematical Tools', icon: Settings },
    { id: 'units', name: 'Unit Converter', icon: Settings },
    { id: 'financial', name: 'Finance Calculator', icon: Settings },
    { id: 'currency', name: 'Currency Converter', icon: Settings },
    { id: 'date', name: 'Date Calculator', icon: Settings },
    { id: 'text', name: 'Text Tools', icon: Settings },
    { id: 'developer', name: 'Dev SDK', icon: Terminal },
    { id: 'periodic', name: 'Periodic Table', icon: Settings },
    { id: 'history', name: 'Calculation History', icon: History },
    { id: 'settings', name: 'App Settings', icon: Settings },
    { id: 'help', name: 'Help & Docs', icon: HelpCircle },
  ];

  const themes = [
    { id: 'dark', name: 'Default Dark', color: 'bg-[#1a202c]' },
    { id: 'light', name: 'Clean Light', color: 'bg-[#f7fafc]' },
    { id: 'neon', name: 'Neon Night', color: 'bg-black' },
    { id: 'royal', name: 'Royal Purple', color: 'bg-[#1a0b2e]' },
    { id: 'terminal', name: 'Classic Matrix', color: 'bg-black' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#130019]' },
  ];

  const applyTheme = (themeId: string) => {
    if (themeId === 'dark') {
      window.document.documentElement.removeAttribute('class');
    } else {
      window.document.documentElement.setAttribute('class', themeId);
    }
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  const commands: CommandItem[] = [
    ...tabs.map(tab => ({
      id: `tab-${tab.id}`,
      title: `Switch to ${tab.name}`,
      description: `Navigate to the ${tab.name} module`,
      icon: tab.icon,
      action: () => { onTabClick(tab.id); setIsOpen(false); },
      category: 'Navigation'
    })),
    ...themes.map(theme => ({
      id: `theme-${theme.id}`,
      title: `Apply ${theme.name} Theme`,
      description: `Change the look of QuantumCalc to ${theme.name}`,
      icon: Palette,
      action: () => applyTheme(theme.id),
      category: 'Appearance'
    }))
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-[201] overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-brand-border bg-brand-bg/50">
              <Search className="text-brand-text-secondary" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search command palette... (↑/↓ to navigate)"
                className="bg-transparent border-none outline-none text-lg text-brand-text w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-brand-border text-brand-text-secondary text-[10px] uppercase font-bold tracking-widest">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isActive = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? 'bg-brand-primary text-white shadow-lg' : 'bg-transparent text-brand-text-secondary hover:bg-brand-bg'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-brand-bg text-brand-primary'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">{cmd.title}</p>
                            <p className={`text-[10px] ${isActive ? 'text-white/70' : 'text-brand-text-secondary'}`}>{cmd.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-brand-border'}`}>{cmd.category}</span>
                            <ArrowRight size={14} className={isActive ? 'opacity-100' : 'opacity-0'} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                   <Layout className="mx-auto text-brand-text-secondary opacity-20" size={48} />
                   <div className="text-brand-text-secondary">
                      <p className="font-bold">No results found for "{search}"</p>
                      <p className="text-sm">Try searching for "theme", "history", or "student"</p>
                   </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-brand-border bg-brand-bg/50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <span className="bg-brand-border px-1.5 py-0.5 rounded border border-brand-border/50">Enter</span>
                        <span>Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="bg-brand-border px-1.5 py-0.5 rounded border border-brand-border/50">↑↓</span>
                        <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="bg-brand-border px-1.5 py-0.5 rounded border border-brand-border/50">Esc</span>
                        <span>Close</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="text-brand-primary animate-pulse" size={14} />
                    <span className="text-[10px] text-brand-primary font-bold italic">Quantum v3.0</span>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
