import React, { useState, useEffect } from 'react';
import { Menu, Search, Cloud, Download } from 'lucide-react';
import Logo from './Logo';
import { AppTab } from '../../types';
import { useAuth } from '../AuthProvider';
import { ScholarCounter } from '../ScholarCounter';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
  onLoginClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabClick, onLoginClick, onMenuClick }) => {
  const { user, userData, accessToken, logout } = useAuth();
  const { isInstallable, installPWA } = usePWAInstall();
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'online' | 'offline' | 'sandbox-offline' | 'error'>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('offline_mode') === 'true') {
        return 'sandbox-offline';
      }
    } catch {
       // Ignore localStorage issues
    }
    return 'checking';
  });

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.status) {
        setFirestoreStatus(detail.status);
      }
    };
    window.addEventListener('firestore-status', handleStatus);
    return () => window.removeEventListener('firestore-status', handleStatus);
  }, []);

  const handleSearchClick = () => {
    const ev = new CustomEvent('open-command-palette');
    window.dispatchEvent(ev);
  };

  const renderStatusPill = () => {
    if (firestoreStatus === 'checking') return null;
    
    if (firestoreStatus === 'online') {
      return (
        <span 
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-teal-500/10 bg-teal-500/5 text-teal-400 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-help"
          title="Securely connected to Google Cloud Sandbox Cloud Firestore."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>Cloud Live</span>
        </span>
      );
    }
    
    if (firestoreStatus === 'sandbox-offline') {
      return (
        <button 
          onClick={() => onTabClick('settings')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-border/80 bg-brand-surface/80 text-brand-text-secondary text-[10px] font-bold uppercase tracking-wider hover:border-brand-primary/50 transition-all shrink-0 cursor-pointer"
          title="Operating in simulated developer offline sandbox mode entirely client-side. Click to manage."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span>Local Sandbox</span>
        </button>
      );
    }
    
    if (firestoreStatus === 'offline' || firestoreStatus === 'error') {
      return (
        <button 
          onClick={() => onTabClick('settings')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/10 hover:border-amber-500/30 transition-all shrink-0 cursor-pointer animate-pulse"
          title="Firebase servers are currently unreachable inside your preview sandbox. Operating safely in local caching mode. Click to read more."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>Offline Sandbox Cache</span>
        </button>
      );
    }

    if (firestoreStatus === 'app-check-error' as any) {
      return (
        <button 
          onClick={() => {
            try {
              localStorage.setItem('enable_app_check', 'false');
              window.location.reload();
            } catch (err) {
              console.error('Failed to disable app check:', err);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/20 hover:border-rose-500/40 transition-all shrink-0 cursor-pointer animate-pulse"
          title="Firebase App Check Blocked (HTTP 403 / Signature Invalid). Click here to auto-disable App Check, reset, and reload the workspace instantly."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>App Check Error (Click to Auto-Fix)</span>
        </button>
      );
    }
    
    return null;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-bg/80 backdrop-blur-xl border-b border-brand-border/50 shrink-0">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-surface/80"
            >
              <Menu size={20} />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-sm">
                <button onClick={() => onTabClick('landing')} className="text-brand-text-secondary hover:text-brand-text font-bold transition-colors">
                  QuantumCalc
                </button>
                {activeTab !== 'landing' && (
                  <>
                    <span className="text-brand-text-secondary/50 font-mono">/</span>
                    <span className="text-brand-primary font-bold capitalize tracking-wide">{activeTab.replace('-', ' ')}</span>
                  </>
                )}
            </div>

            <div className="hidden xl:block">
              <ScholarCounter />
            </div>
            
            <div className="lg:hidden" onClick={() => onTabClick('landing')}>
              <Logo />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
                onClick={handleSearchClick}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-surface/50 border border-brand-border hover:bg-brand-surface hover:border-brand-primary/30 transition-all text-sm text-brand-text-secondary w-64"
            >
                <Search size={16} />
                <span>Search features...</span>
                <div className="ml-auto flex items-center gap-1 opacity-70">
                    <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
                </div>
            </button>
            <button 
                onClick={handleSearchClick}
                className="md:hidden p-2 text-brand-text-secondary hover:text-brand-text bg-brand-surface rounded-lg"
            >
                <Search size={18} />
            </button>

            <div className="w-[1px] h-6 bg-brand-border/50 mx-1 hidden sm:block" />

            {isInstallable && (
              <button
                onClick={installPWA}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-brand-bg rounded-lg font-bold text-xs hover:scale-105 transition-transform"
                title="Install QuantumCalc App"
              >
                <Download size={14} />
                <span>Install App</span>
              </button>
            )}

            {renderStatusPill()}

            {/* Profile badge (completely bypassed login/sign-up screens) */}
            {user ? (
              <div className="flex items-center gap-2">
                {accessToken && (
                  <button 
                    onClick={() => onTabClick('settings')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-colors hidden sm:flex shrink-0"
                    title="Google Drive Sync Active"
                  >
                    <Cloud size={12} className="text-emerald-500 animate-[pulse_2s_infinite]" />
                    <span>Drive Sync Active</span>
                  </button>
                )}
                <button 
                  onClick={() => onTabClick('local-profile')}
                  className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border border-brand-border transition-all hover:border-brand-primary/50 bg-brand-surface"
                >
                  <div className="flex flex-col items-end mr-1 hidden sm:flex">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase">
                      {userData?.role?.replace('_', ' ') || 'Guest'}
                    </span>
                    <span className="text-xs font-black text-brand-text truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <img src={user.photoURL || ''} alt="P" className="w-8 h-8 rounded-full border border-brand-primary/20" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 hover:text-brand-primary font-bold text-xs transition-colors shrink-0"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
