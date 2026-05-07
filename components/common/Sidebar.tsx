import React, { useState } from 'react';
import {
  Home,
  Calculator as CalculatorIcon,
  LineChart,
  Scale,
  Landmark,
  Binary,
  Banknote,
  Calendar,
  History,
  Beaker,
  TestTube,
  HeartPulse,
  FileText,
  Settings as SettingsIcon,
  Wrench,
  Code,
  GraduationCap,
  ChevronRight,
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { AppTab } from '../../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabClick, isOpen, setIsOpen }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Tools': true,
    'Converters': true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleTabClick = (tabId: AppTab) => {
    onTabClick(tabId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home', Icon: Home },
    { id: 'calculator', label: 'Calculator', Icon: CalculatorIcon },
    { id: 'graphing', label: 'Graphing', Icon: LineChart },
    { id: 'history', label: 'History', Icon: History },
  ];

  const toolCategories = [
    {
      label: 'Tools',
      Icon: Wrench,
      items: [
        { id: 'math-tools', label: 'Math Tools', Icon: Beaker },
        { id: 'programmer', label: 'Programmer', Icon: Binary },
        { id: 'periodic', label: 'Periodic Table', Icon: TestTube },
        { id: 'financial', label: 'Financial', Icon: Landmark },
        { id: 'date', label: 'Date & Time', Icon: Calendar },
        { id: 'health', label: 'Health', Icon: HeartPulse },
        { id: 'text', label: 'Text Tools', Icon: FileText },
        { id: 'developer', label: 'Developer', Icon: Code },
        { id: 'student', label: 'Academic', Icon: GraduationCap },
      ]
    },
    {
      label: 'Converters',
      Icon: Scale,
      items: [
        { id: 'units', label: 'Units', Icon: Scale },
        { id: 'currency', label: 'Currency', Icon: Banknote },
        { id: 'base', label: 'Base', Icon: Binary },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-brand-bg/95 backdrop-blur-2xl border-r border-brand-border/50 z-50 flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:shadow-none`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-border/50 shrink-0">
          <div onClick={() => handleTabClick('landing')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <Logo />
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-brand-text-secondary hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            {/* Quick Actions */}
            <button 
                onClick={() => {
                   const ev = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true });
                   document.dispatchEvent(ev);
                   if (window.innerWidth < 1024) setIsOpen(false);
                }} 
                className="w-full mb-6 flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-surface/50 border border-brand-border hover:bg-brand-surface hover:border-brand-primary/30 transition-all group"
            >
                <div className="flex items-center gap-3 text-brand-text-secondary group-hover:text-brand-text">
                    <Search size={18} />
                    <span className="text-sm font-medium">Quick Search</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-bg border border-brand-border text-brand-text-secondary">⌘</kbd>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-bg border border-brand-border text-brand-text-secondary">K</kbd>
                </div>
            </button>


          <div className="space-y-1 mb-8">
            <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] px-3 mb-3 shrink-0">
              Main Menu
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as AppTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  activeTab === item.id 
                    ? 'bg-brand-primary text-brand-bg font-bold shadow-md shadow-brand-primary/20' 
                    : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                }`}
              >
                <item.Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {toolCategories.map((category) => (
              <div key={category.label} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-brand-text-secondary hover:text-brand-text transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <category.Icon size={14} className="opacity-70" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{category.label}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-transform duration-300 opacity-50 group-hover:opacity-100 ${expandedCategories[category.label] ? 'rotate-90' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {expandedCategories[category.label] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1 border-l border-brand-border/30 ml-4 pl-2">
                        {category.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id as AppTab)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${
                              activeTab === item.id 
                                ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                                : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                            }`}
                          >
                            <item.Icon size={16} className={activeTab === item.id ? "text-brand-primary" : "opacity-70"} />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-brand-border/50 bg-brand-bg/50 shrink-0">
           <div className="grid grid-cols-2 gap-2 text-brand-text-secondary">
               <button onClick={() => handleTabClick('help')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'help' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <BookOpen size={14} /> Help
               </button>
               <button onClick={() => handleTabClick('settings')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'settings' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <SettingsIcon size={14} /> Settings
               </button>
           </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
