
import { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Home, Calculator as CalcIcon, History as HistoryIcon, Compass, Menu } from 'lucide-react';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';
import { useAuth } from './components/AuthProvider';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import LandingPage from './components/LandingPage';
import Calculator from './components/Calculator';
import { AppTab, HistoryEntry } from './types';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthModal from './components/common/AuthModal';
import { triggerCloudSync } from './services/googleDriveService';

// Lazy-load components with heavy dependencies (like charting libraries) to prevent startup crashes
const Graph = lazy(() => import('./components/Graph'));
const MathTools = lazy(() => import('./components/MathTools'));
const CurrencyConverter = lazy(() => import('./components/CurrencyConverter'));
const FinancialCalculator = lazy(() => import('./components/FinancialCalculator'));
const HealthCalculator = lazy(() => import('./components/HealthCalculator'));
const TextTools = lazy(() => import('./components/TextTools'));
const DeveloperTools = lazy(() => import('./components/DeveloperTools'));
const StudentTools = lazy(() => import('./components/StudentTools'));
const K5Worksheets = lazy(() => import('./components/K5Worksheets'));
const FloatingAssistant = lazy(() => import('./components/FloatingAssistant'));
const Scratchpad = lazy(() => import('./components/Scratchpad'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const PeriodicTable = lazy(() => import('./components/PeriodicTable'));
const ProfileOnboarding = lazy(() => import('./components/ProfileOnboarding'));
const FeedbackPage = lazy(() => import('./components/FeedbackPage'));
const ExerciseReference = lazy(() => import('./components/ExerciseReference'));

const PrivacyProtocol = lazy(() => import('./components/PrivacyProtocol'));
const CoreLicense = lazy(() => import('./components/CoreLicense'));
const SupportHub = lazy(() => import('./components/SupportHub'));
const MathSandbox = lazy(() => import('./components/MathSandbox'));
const GoogleCalendar = lazy(() => import('./components/GoogleCalendar'));

// Secondary and lower-usage components lazy loaded to optimize initial bundle size & load times
const History = lazy(() => import('./components/History'));
const UnitConverter = lazy(() => import('./components/UnitConverter').then(m => ({ default: m.UnitConverter })));
const BaseConverter = lazy(() => import('./components/BaseConverter'));
const ProgrammerCalculator = lazy(() => import('./components/ProgrammerCalculator'));
const DateCalculator = lazy(() => import('./components/DateCalculator'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const TermsAndLicense = lazy(() => import('./components/TermsAndLicense'));
const Settings = lazy(() => import('./components/Settings'));
const Help = lazy(() => import('./components/Help'));
const ExploreHub = lazy(() => import('./components/ExploreHub'));

const App = () => {
  const { user, userData, accessToken, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll to top when activeTab changes
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const savedHistory = localStorage.getItem('calcHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Could not parse history from localStorage", error);
      return [];
    }
  });

  const [expressionToLoad, setExpressionToLoad] = useState<HistoryEntry | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);

  // Auto-detect mobile devices and auto-apply Mobile Tactile theme
  useEffect(() => {
    try {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      const currentTheme = localStorage.getItem('theme');
      
      if (isMobileDevice && currentTheme !== 'mobile-touch') {
        window.document.documentElement.setAttribute('class', 'mobile-touch');
        localStorage.setItem('theme', 'mobile-touch');
      } else if (!isMobileDevice && currentTheme) {
        window.document.documentElement.setAttribute('class', currentTheme);
      }
    } catch (e) {
      console.error("Mobile theme setup error", e);
    }
  }, []);

  // Parse sharing tokens for remote workspace syncing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (!shareId) return;

    const fetchShare = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const shareSnap = await getDoc(doc(db, 'shares', shareId));
        if (shareSnap.exists()) {
          const shareData = shareSnap.data();
          setShareToastMessage(`Workspace Loaded: "${shareData.title || 'Shared Preset'}"`);
          
          if (shareData.type === 'calculator') {
            setExpressionToLoad({
              id: shareData.id,
              expression: shareData.expression,
              result: shareData.result,
              timestamp: Date.now().toString(),
              isFavorite: false
            });
            setActiveTab('calculator');
          } else if (shareData.type === 'graphing') {
            setActiveTab('graphing');
            localStorage.setItem('shared_graph_equations', shareData.stateData || '');
          } else if (shareData.type === 'sandbox') {
            setActiveTab('sandbox');
            localStorage.setItem('shared_sandbox_code', shareData.stateData || '');
          }

          // Clean up URL parameters
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.pushState({ path: newUrl }, '', newUrl);

          setTimeout(() => {
            setShareToastMessage(null);
          }, 6000);
        } else {
          console.warn("Shared workspace preset not found or has expired.");
        }
      } catch (e: any) {
        console.error("Shared workspace decoding integrity failure:", e);
      }
    };

    fetchShare();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Trigger automatic cloud backup to Google Drive of all tools state on tab change/navigation
  useEffect(() => {
    if (accessToken) {
      import('./services/googleDriveService').then((m) => {
        m.googleDriveService.triggerAutoSync(accessToken);
      });
    }
  }, [activeTab, accessToken]);

  // Listen for custom trigger-cloud-sync event for real-time saving from any component
  useEffect(() => {
    const handleSync = () => {
      if (accessToken) {
        import('./services/googleDriveService').then((m) => {
          m.googleDriveService.triggerAutoSync(accessToken);
        });
      }
    };
    window.addEventListener('trigger-cloud-sync', handleSync);
    return () => {
      window.removeEventListener('trigger-cloud-sync', handleSync);
    };
  }, [accessToken]);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // User accepted the install prompt
    }
    setDeferredPrompt(null);
  };

  // Sync history from Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    const reconcileGuestHistory = async () => {
      try {
        const localHistoryStr = localStorage.getItem('calcHistory');
        if (!localHistoryStr) return;
        const localHistory: HistoryEntry[] = JSON.parse(localHistoryStr);
        if (localHistory && localHistory.length > 0) {
          console.log(`Reconciling ${localHistory.length} local guest calculations into user account...`);
          const batch = writeBatch(db);
          let itemAdded = false;
          localHistory.forEach((entry) => {
            const entryId = entry.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
            const entryRef = doc(db, 'history', entryId);
            batch.set(entryRef, {
              id: entryId,
              expression: entry.expression,
              result: entry.result,
              timestamp: Number(entry.timestamp) || Date.now(),
              isFavorite: typeof entry.isFavorite === 'boolean' ? entry.isFavorite : false,
              userId: user.uid
            });
            itemAdded = true;
          });
          if (itemAdded) {
            await batch.commit();
            console.log("Guest reconciliation successful!");
          }
          // Once reconciled, clear the guest storage to prevent repeat migrations
          localStorage.removeItem('calcHistory');
        }
      } catch (err: any) {
        console.error("Local-to-Auth history database reconciliation failed:", err instanceof Error ? err.message : String(err));
      }
    };

    reconcileGuestHistory();

    const q = query(collection(db, 'history'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreHistory: HistoryEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreHistory.push({
          id: data.id,
          expression: data.expression,
          result: data.result,
          timestamp: data.timestamp.toString(), // Convert back to string for UI if needed, or keep as number
          isFavorite: data.isFavorite
        });
      });
      // Sort by timestamp descending
      firestoreHistory.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      setHistory(firestoreHistory);
    }, (error: any) => {
      handleFirestoreError(error, OperationType.GET, 'history');
    });

    return () => unsubscribe();
  }, [user]);

  // Save history to localStorage (fallback)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('calcHistory', JSON.stringify(history));
        triggerCloudSync();
      } catch (error) {
        console.error("Failed to save history to localStorage:", error);
      }
    }
  }, [history, user]);

  const addToHistory = async (entry: HistoryEntry) => {
    const newEntry = { ...entry, id: entry.id || Date.now().toString() };
    
    if (user) {
      try {
        await setDoc(doc(db, 'history', newEntry.id), {
          id: newEntry.id,
          expression: newEntry.expression,
          result: newEntry.result,
          timestamp: Number(newEntry.timestamp),
          isFavorite: newEntry.isFavorite || false,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `history/${newEntry.id}`);
      }
    } else {
      setHistory(prev => [newEntry, ...prev].slice(0, 100)); // Keep last 100 entries locally
    }
  };

  const clearHistory = async () => {
    if (user) {
      try {
        const batch = writeBatch(db);
        history.forEach(entry => {
          if (entry.id) {
            batch.delete(doc(db, 'history', entry.id));
          }
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'history');
      }
    } else {
      setHistory([]);
    }
  };
  
  const toggleFavorite = async (timestamp: string) => {
    const entryToToggle = history.find(e => e.timestamp === timestamp);
    if (!entryToToggle) return;

    if (user && entryToToggle.id) {
      try {
        await setDoc(doc(db, 'history', entryToToggle.id), {
          ...entryToToggle,
          timestamp: Number(entryToToggle.timestamp),
          isFavorite: !entryToToggle.isFavorite,
          userId: user.uid
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `history/${entryToToggle.id}`);
      }
    } else {
      setHistory(prev =>
        prev.map(entry =>
          entry.timestamp === timestamp
            ? { ...entry, isFavorite: !entry.isFavorite }
            : entry
        )
      );
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setExpressionToLoad(entry);
    setActiveTab('calculator');
  };

  const handleExpressionLoaded = () => {
    setExpressionToLoad(null);
  };

  const renderActiveTab = () => {
    let TabComponent;

    switch (activeTab) {
      case 'landing':
        TabComponent = <LandingPage onTabClick={setActiveTab} history={history} onLoginClick={() => setIsAuthModalOpen(true)} />;
        break;
      case 'explore':
        TabComponent = <ExploreHub onTabClick={setActiveTab} />;
        break;
      case 'calculator':
        TabComponent = <Calculator addToHistory={addToHistory} expressionToLoad={expressionToLoad} onExpressionLoaded={handleExpressionLoaded} setActiveTab={setActiveTab} />;
        break;
      case 'graphing':
        TabComponent = <Graph onLoginClick={() => setIsAuthModalOpen(true)} />;
        break;
      case 'periodic':
        TabComponent = <PeriodicTable />;
        break;
      case 'math-tools':
        TabComponent = <MathTools onLoginClick={() => setIsAuthModalOpen(true)} />;
        break;
      case 'programmer':
        TabComponent = <ProgrammerCalculator />;
        break;
      case 'units':
        TabComponent = <UnitConverter />;
        break;
      case 'currency':
        TabComponent = <CurrencyConverter setActiveTab={setActiveTab} />;
        break;
      case 'base':
        TabComponent = <BaseConverter />;
        break;
      case 'financial':
        TabComponent = <FinancialCalculator setActiveTab={setActiveTab} />;
        break;
      case 'date':
        TabComponent = <DateCalculator />;
        break;
      case 'health':
        TabComponent = <HealthCalculator />;
        break;
      case 'text':
        TabComponent = <TextTools />;
        break;
      case 'developer':
        TabComponent = <DeveloperTools />;
        break;
      case 'student':
        TabComponent = <StudentTools onLoginClick={() => setIsAuthModalOpen(true)} />;
        break;
      case 'k5worksheets':
        TabComponent = <K5Worksheets />;
        break;
      case 'feedback':
        TabComponent = <FeedbackPage />;
        break;
      case 'exercises':
        TabComponent = <ExerciseReference />;
        break;
      case 'history':
        TabComponent = <History history={history} loadFromHistory={loadFromHistory} clearHistory={clearHistory} toggleFavorite={toggleFavorite} />;
        break;
      case 'help':
        TabComponent = <Help canInstall={!!deferredPrompt} onInstall={installApp} setActiveTab={setActiveTab} />;
        break;
      case 'about':
        TabComponent = <About />;
        break;
      case 'contact':
        TabComponent = <Contact />;
        break;
      case 'settings':
        TabComponent = <Settings canInstall={!!deferredPrompt} onInstall={installApp} />;
        break;
      case 'terms':
        TabComponent = <TermsAndLicense />;
        break;
      case 'privacy':
        TabComponent = <PrivacyProtocol />;
        break;
      case 'core-license':
        TabComponent = <CoreLicense />;
        break;
      case 'support':
        TabComponent = <SupportHub />;
        break;
      case 'sandbox':
        TabComponent = <MathSandbox />;
        break;
      case 'calendar':
        TabComponent = <GoogleCalendar />;
        break;
      default:
        TabComponent = <Calculator addToHistory={addToHistory} expressionToLoad={expressionToLoad} onExpressionLoaded={handleExpressionLoaded} setActiveTab={setActiveTab} />;
    }
    
    // Wrap all tab content in a Suspense boundary to handle lazy-loading
    return (
      <Suspense fallback={<LoadingSpinner />}>
        {TabComponent}
      </Suspense>
    );
  };

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-brand-bg text-brand-text min-h-[100dvh] font-sans flex overflow-hidden">
      <Suspense fallback={null}>
        {user && userData && !userData.onboarded && <ProfileOnboarding />}
      </Suspense>
      <Sidebar activeTab={activeTab} onTabClick={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} canInstall={!!deferredPrompt} onInstall={installApp} />
      <div className="flex-1 flex flex-col min-w-0 max-h-[100dvh] overflow-hidden relative">
        <Header activeTab={activeTab} onTabClick={setActiveTab} onLoginClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-0 pt-4 custom-scrollbar flex flex-col relative w-full overflow-x-hidden">
          <div className="container mx-auto max-w-7xl px-4 flex-1">
            {renderActiveTab()}
          </div>
          <footer className="py-12 pb-32 lg:pb-12 border-t border-brand-border/30 bg-brand-surface/20 shrink-0 mt-16 relative overflow-hidden w-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="container mx-auto max-w-7xl px-4 relative z-10 w-full">
                <div className="flex flex-col md:flex-row gap-12 md:gap-8 mb-12">
                    <div className="space-y-6 flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-transparent flex items-center justify-center border border-brand-primary/30 shadow-inner">
                                <CalcIcon size={20} className="text-brand-primary" />
                            </div>
                            <span className="font-black text-brand-text tracking-[0.2em] uppercase">QuantumCalc</span>
                        </div>
                        <p className="text-sm text-brand-text-secondary max-w-md leading-relaxed px-4 md:px-0">
                            Advanced computational utilities, financial models, and specialized developer tools engineered for speed and precision.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:flex md:flex-row justify-center md:justify-end gap-x-4 gap-y-12 md:gap-16 lg:gap-24 w-full md:w-auto">
                        <div className="space-y-6 text-left flex flex-col items-start min-w-[120px]">
                            <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary">Platform</h4>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setActiveTab('explore')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit py-2">Explore Tools</button>
                                <button onClick={() => setActiveTab('support')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit py-2">Support Hub</button>
                                <button onClick={() => setActiveTab('feedback')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit py-2">Submit Feedback</button>
                            </div>
                        </div>
                        
                        <div className="space-y-6 text-left flex flex-col items-start min-w-[120px]">
                            <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary">Company</h4>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setActiveTab('about')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit py-2">About Us</button>
                                <button onClick={() => setActiveTab('contact')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit py-2">Contact Us</button>
                            </div>
                        </div>

                        <div className="space-y-6 text-left flex flex-col items-start min-w-[120px] col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary">Legal</h4>
                            <div className="grid grid-cols-2 md:flex md:flex-col gap-x-4 gap-y-2 w-full">
                                <button onClick={() => setActiveTab('privacy')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit text-left py-2">Privacy Protocol</button>
                                <button onClick={() => setActiveTab('core-license')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit text-left py-2">Core License</button>
                                <button onClick={() => setActiveTab('terms')} className="text-sm text-brand-text-secondary hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all w-fit text-left py-2">Terms of Service</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-brand-border/30 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-xs text-brand-text-secondary text-center md:text-left">
                        &copy; {new Date().getFullYear()} Edgtec. All rights reserved.
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-brand-text-secondary">
                      <span className="text-[10px] font-mono hover:text-brand-text transition-colors cursor-pointer">STATUS: ONLINE</span>
                      <span className="text-[10px] font-mono text-brand-primary/50 tracking-[0.2em] bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">SYS.VER.2.0</span>
                    </div>
                </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar - Exclusive Mobile Theme Enhancements */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-bg/95 backdrop-blur-2xl border-t border-brand-border/60 px-2 py-3 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.7)] lg:hidden flex items-center justify-around">
        {[
          { id: 'landing', label: 'Home', Icon: Home },
          { id: 'calculator', label: 'Calc', Icon: CalcIcon },
          { id: 'explore', label: 'Explore', Icon: Compass },
          { id: 'history', label: 'History', Icon: HistoryIcon },
          { id: 'menu', label: 'Menu', Icon: Menu }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'menu') {
                  setIsSidebarOpen(true);
                } else {
                  setActiveTab(item.id as AppTab);
                }
              }}
              className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all relative cursor-pointer min-w-[60px] ${
                isActive 
                  ? 'text-brand-primary bg-brand-primary/10' 
                  : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute inset-x-0 inset-y-0 bg-brand-primary/10 rounded-2xl border border-brand-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.Icon size={20} className={`relative z-10 transition-transform ${isActive ? 'scale-110 text-brand-primary' : 'opacity-75'}`} />
              <span className="text-[10px] font-bold mt-1.5 relative z-10 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <FloatingAssistant activeTab={activeTab} setActiveTab={setActiveTab} />
        <Scratchpad />
        <CommandPalette onTabClick={setActiveTab} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Suspense>

      {shareToastMessage && (
        <div className="fixed bottom-6 left-6 z-[200] max-w-sm bg-brand-surface border border-brand-primary/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Quantum Workspace Client</p>
              <p className="text-xs font-bold text-brand-text mt-0.5">{shareToastMessage}</p>
            </div>
          </div>
          <button onClick={() => setShareToastMessage(null)} className="text-brand-text-secondary hover:text-brand-text text-base font-bold ml-2 leading-none">×</button>
        </div>
      )}

    </div>
  );
};

export default App;