import React, { useState, useEffect } from 'react';
import {
  Home,
  Calculator as CalculatorIcon,
  LineChart,
  Calendar,
  History,
  Settings as SettingsIcon,
  ChevronRight,
  X,
  Search,
  BookOpen,
  Smartphone,
  MessageSquare,
  Compass,
  Info,
  Pin,
  PinOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { AppTab } from '../../types';
import { toolCategories } from './toolCategories';
import { dailyGoalService } from '../../services/dailyGoalService';
import { Target, Flame } from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

const navItems = [
  { id: 'landing', label: 'Home', Icon: Home },
  { id: 'explore', label: 'Explore Hub', Icon: Compass },
  { id: 'calculator', label: 'Calculator', Icon: CalculatorIcon },
  { id: 'graphing', label: 'Graphing', Icon: LineChart },
  { id: 'history', label: 'History', Icon: History },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabClick, isOpen, setIsOpen, canInstall, onInstall }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Tools': true,
    'Converters': true
  });

  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pinnedTools');
      return stored ? JSON.parse(stored) : [];
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

  const unpinTool = (toolId: string) => {
    const nextPinned = pinnedToolIds.filter(id => id !== toolId);
    setPinnedToolIds(nextPinned);
    localStorage.setItem('pinnedTools', JSON.stringify(nextPinned));
    window.dispatchEvent(new CustomEvent('pinnedTools-change', { detail: { pinnedTools: nextPinned } }));
  };

  const flatTools = toolCategories.flatMap(c => c.items);
  const pinnedToolsList = pinnedToolIds
    .map(id => flatTools.find(t => t.id === id))
    .filter(Boolean) as typeof toolCategories[0]['items'];

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


          {pinnedToolsList.length > 0 && (
            <div className="space-y-1 mb-6">
              <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.2em] px-3 mb-2 shrink-0 flex items-center justify-between pointer-events-none">
                <span>Pinned Tools</span>
                <Pin size={12} className="text-brand-primary fill-brand-primary/20" />
              </div>
              {pinnedToolsList.map((item) => (
                <div key={item.id} className="relative group flex items-center">
                  <button
                    onClick={() => handleTabClick(item.id as AppTab)}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                      activeTab === item.id 
                        ? 'bg-brand-primary text-brand-bg font-bold shadow-md shadow-brand-primary/20' 
                        : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                    }`}
                  >
                    <item.Icon size={18} className={activeTab === item.id ? "text-brand-bg shrink-0" : "text-brand-text-secondary shrink-0 opacity-80 group-hover:opacity-100 group-hover:text-brand-text"} />
                    <span className="text-sm truncate pr-6">{item.label}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unpinTool(item.id);
                    }}
                    title="Unpin tool"
                    className="absolute right-2 p-1.5 rounded-lg text-brand-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                  >
                    <PinOff size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                        {category.items.map((item) => {
                          const isPinned = pinnedToolIds.includes(item.id);
                          return (
                            <div key={item.id} className="relative group flex items-center w-full">
                              <button
                                onClick={() => handleTabClick(item.id as AppTab)}
                                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${
                                  activeTab === item.id 
                                    ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                                    : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                                }`}
                              >
                                <item.Icon size={16} className={activeTab === item.id ? "text-brand-primary shrink-0" : "opacity-70 shrink-0 group-hover:opacity-100 group-hover:text-brand-text"} />
                                <span className="text-sm truncate mr-6">{item.label}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPinned) {
                                    unpinTool(item.id);
                                  } else {
                                    const nextPinned = [...pinnedToolIds, item.id];
                                    setPinnedToolIds(nextPinned);
                                    localStorage.setItem('pinnedTools', JSON.stringify(nextPinned));
                                    window.dispatchEvent(new CustomEvent('pinnedTools-change', { detail: { pinnedTools: nextPinned } }));
                                  }
                                }}
                                title={isPinned ? "Unpin tool" : "Pin tool"}
                                className={`absolute right-2 p-1 rounded-lg text-brand-text-secondary hover:text-brand-primary transition-all duration-150 cursor-pointer ${
                                  isPinned ? 'opacity-100 text-brand-primary' : 'opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <Pin size={13} className={isPinned ? "fill-brand-primary" : ""} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-brand-border/50 bg-brand-bg/50 shrink-0 space-y-3">
           {/* Daily Goals Micro Progress Ring */}
           <div 
             onClick={() => handleTabClick('settings')}
             className="flex items-center gap-3 p-3 bg-brand-surface/40 hover:bg-brand-surface border border-brand-border/40 hover:border-brand-primary/30 rounded-2xl transition-all cursor-pointer group"
             title="Configure Daily Calculation Target"
           >
             <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                 <circle
                   cx="20"
                   cy="20"
                   r="16"
                   className="stroke-brand-border/20 fill-none"
                   strokeWidth="3.5"
                 />
                 <circle
                   cx="20"
                   cy="20"
                   r="16"
                   className="stroke-emerald-400 fill-none"
                   strokeWidth="3.5"
                   strokeDasharray={2 * Math.PI * 16}
                   strokeDashoffset={(2 * Math.PI * 16) - (Math.min(100, (dailyGoalService.getTodaySolved() / goalData.target) * 100) / 100) * (2 * Math.PI * 16)}
                   strokeLinecap="round"
                 />
               </svg>
               <Target size={12} className="absolute text-brand-text-secondary group-hover:text-emerald-400 transition-colors" />
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between gap-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.05em] text-brand-text">Daily Math Goal</span>
                 {goalData.streak > 0 && (
                   <span className="text-[9px] font-mono font-black text-amber-500 flex items-center gap-0.5 shrink-0" title="Consistency streak days">
                     <Flame size={10} className="fill-amber-500/10 shrink-0" /> {goalData.streak}d
                   </span>
                 )}
               </div>
               <div className="flex items-center justify-between text-[11px] font-mono font-bold leading-none mt-1">
                 <span className="text-brand-text-secondary">Progress</span>
                 <span className={`${dailyGoalService.getTodaySolved() >= goalData.target ? 'text-emerald-400' : 'text-brand-text'}`}>
                   {dailyGoalService.getTodaySolved()} / {goalData.target}
                 </span>
               </div>
             </div>
           </div>

           {canInstall && (
             <button 
                onClick={onInstall}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-bg font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
               <Smartphone size={18} />
               <span>Install App</span>
             </button>
           )}
           <div className="grid grid-cols-2 gap-2 text-brand-text-secondary">
               <button onClick={() => handleTabClick('help')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'help' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <BookOpen size={14} /> Help
               </button>
               <button onClick={() => handleTabClick('settings')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'settings' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <SettingsIcon size={14} /> Settings
               </button>
               <button onClick={() => handleTabClick('about')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'about' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <Info size={14} /> About
               </button>
               <button onClick={() => handleTabClick('feedback')} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:text-brand-text hover:bg-brand-surface ${activeTab === 'feedback' ? 'bg-brand-surface text-brand-text' : ''}`}>
                   <MessageSquare size={14} /> Feedback
               </button>
           </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
