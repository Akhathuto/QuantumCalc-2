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
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Logo from './Logo';
import Tab from './Tab';
import { AppTab } from '../../types';
import { useAuth } from '../AuthProvider';

interface HeaderProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabClick }) => {
  const { user, userData, signInWithGoogle, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleTabClick = (tabId: AppTab) => {
    onTabClick(tabId);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navItems = [
    { id: 'landing', label: 'Home', Icon: Home },
    { id: 'calculator', label: 'Calculator', Icon: CalculatorIcon },
    { id: 'graphing', label: 'Graphing', Icon: LineChart },
  ];

  const toolCategories = [
    {
      label: 'Tools',
      Icon: Wrench,
      items: [
        { id: 'math-tools', label: 'Math Tools', Icon: Beaker },
        { id: 'programmer', label: 'Programmer', Icon: Binary },
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
      Icon: TestTube,
      items: [
        { id: 'units', label: 'Units', Icon: Scale },
        { id: 'currency', label: 'Currency', Icon: Banknote },
        { id: 'base', label: 'Base', Icon: Binary },
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/80 backdrop-blur-xl border-b border-brand-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div onClick={() => handleTabClick('landing')}>
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Tab
                key={item.id}
                label={item.label}
                Icon={item.Icon}
                isActive={activeTab === item.id}
                onClick={() => handleTabClick(item.id as AppTab)}
              />
            ))}

            {toolCategories.map((category) => (
              <div 
                key={category.label} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(category.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  category.items.some(i => i.id === activeTab)
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                }`}>
                  <category.Icon size={18} />
                  {category.label}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === category.label ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === category.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-brand-bg border border-brand-border rounded-2xl shadow-2xl p-3 grid grid-cols-1 gap-1"
                    >
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id as AppTab)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                            activeTab === item.id 
                              ? 'bg-brand-primary text-brand-bg font-bold' 
                              : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text'
                          }`}
                        >
                          <item.Icon size={18} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div className="w-[1px] h-6 bg-brand-border/50 mx-2" />

            {/* Auth/Profile Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleTabClick('settings')}
                  className={`flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border border-brand-border transition-all hover:border-brand-primary/50 ${activeTab === 'settings' ? 'bg-brand-primary/10 border-brand-primary' : 'bg-brand-surface'}`}
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase">
                      {userData?.role?.replace('_', ' ') || 'Guest'}
                    </span>
                    <span className="text-xs font-black text-brand-text">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <img src={user.photoURL || ''} alt="P" className="w-8 h-8 rounded-full border-2 border-brand-primary/20" />
                </button>
                <button 
                  onClick={logout}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-brand-bg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
              >
                <LogIn size={18} />
                <span>Connect</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-4">
            {user && (
               <img 
                 src={user.photoURL || ''} 
                 alt="P" 
                 className="w-8 h-8 rounded-full border border-brand-primary/30"
                 onClick={() => handleTabClick('settings')}
               />
            )}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Integration */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-brand-border bg-brand-bg overflow-hidden"
          >
            <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Main Links */}
              <div className="grid grid-cols-2 gap-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id as AppTab)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      activeTab === item.id 
                        ? 'bg-brand-primary text-brand-bg border-brand-primary font-bold' 
                        : 'bg-brand-surface border-brand-border text-brand-text-secondary'
                    }`}
                  >
                    <item.Icon size={24} />
                    <span className="text-xs uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
                <button
                    onClick={() => handleTabClick('history')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      activeTab === 'history' 
                        ? 'bg-brand-primary text-brand-bg border-brand-primary font-bold' 
                        : 'bg-brand-surface border-brand-border text-brand-text-secondary'
                    }`}
                  >
                    <History size={24} />
                    <span className="text-xs uppercase tracking-widest">History</span>
                </button>
              </div>

              {/* Categories */}
              {toolCategories.map(category => (
                <div key={category.label} className="space-y-3">
                  <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-2">
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-1 gap-1">
                    {category.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id as AppTab)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeTab === item.id 
                            ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                            : 'text-brand-text-secondary hover:bg-brand-surface'
                        }`}
                      >
                        <item.Icon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Account/Settings Info */}
              <div className="pt-4 border-t border-brand-border/50">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleTabClick('settings')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      activeTab === 'settings' 
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                        : 'bg-brand-surface border-brand-border text-brand-text'
                    }`}
                  >
                    <SettingsIcon size={20} />
                    <span className="font-bold">Settings & Account</span>
                  </button>
                  {user ? (
                    <button
                      onClick={logout}
                      className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold"
                    >
                      <LogOut size={20} /> Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-brand-primary text-brand-bg font-bold"
                    >
                      <LogIn size={20} /> Connect Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
