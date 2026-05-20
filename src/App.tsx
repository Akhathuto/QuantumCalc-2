
import { useState, useEffect, Suspense, lazy } from 'react';
import { collection, query, where, onSnapshot, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';
import { useAuth } from './components/AuthProvider';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import LandingPage from './components/LandingPage';
import Calculator from './components/Calculator';
import History from './components/History';
import { UnitConverter } from './components/UnitConverter';
import BaseConverter from './components/BaseConverter';
import ProgrammerCalculator from './components/ProgrammerCalculator';
import DateCalculator from './components/DateCalculator';
import About from './components/About';
import Contact from './components/Contact';
import TermsAndLicense from './components/TermsAndLicense';
import Settings from './components/Settings';
import Help from './components/Help';
import { AppTab, HistoryEntry } from './types';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthModal from './components/common/AuthModal';

// Lazy-load components with heavy dependencies (like charting libraries) to prevent startup crashes
const Graph = lazy(() => import('./components/Graph'));
const MathTools = lazy(() => import('./components/MathTools'));
const CurrencyConverter = lazy(() => import('./components/CurrencyConverter'));
const FinancialCalculator = lazy(() => import('./components/FinancialCalculator'));
const HealthCalculator = lazy(() => import('./components/HealthCalculator'));
const TextTools = lazy(() => import('./components/TextTools'));
const DeveloperTools = lazy(() => import('./components/DeveloperTools'));
const StudentTools = lazy(() => import('./components/StudentTools'));
const FloatingAssistant = lazy(() => import('./components/FloatingAssistant'));
const Scratchpad = lazy(() => import('./components/Scratchpad'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const PeriodicTable = lazy(() => import('./components/PeriodicTable'));
const ProfileOnboarding = lazy(() => import('./components/ProfileOnboarding'));

const PrivacyProtocol = lazy(() => import('./components/PrivacyProtocol'));
const CoreLicense = lazy(() => import('./components/CoreLicense'));
const SupportHub = lazy(() => import('./components/SupportHub'));

const App = () => {
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      case 'history':
        TabComponent = <History history={history} loadFromHistory={loadFromHistory} clearHistory={clearHistory} toggleFavorite={toggleFavorite} />;
        break;
      case 'help':
        TabComponent = <Help />;
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
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4 custom-scrollbar">
          <div className="container mx-auto max-w-7xl">
            {renderActiveTab()}
          </div>
        </main>
        <footer className="py-6 border-t border-brand-border/30 shrink-0">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-text-secondary">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <button onClick={() => setActiveTab('privacy')} className="hover:text-brand-text transition-colors">Privacy Protocol</button>
              <button onClick={() => setActiveTab('core-license')} className="hover:text-brand-text transition-colors">Core License</button>
              <button onClick={() => setActiveTab('support')} className="hover:text-brand-text transition-colors">Support Hub</button>
              <button onClick={() => setActiveTab('terms')} className="hover:text-brand-text transition-colors">Terms of Service</button>
            </div>
            <div>Powered by Edgtec 2026</div>
          </div>
        </footer>
      </div>
      <Suspense fallback={null}>
        <FloatingAssistant activeTab={activeTab} setActiveTab={setActiveTab} />
        <Scratchpad />
        <CommandPalette onTabClick={setActiveTab} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Suspense>
    </div>
  );
};

export default App;