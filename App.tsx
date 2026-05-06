
import { useState, useEffect, Suspense } from 'react';
import { collection, query, where, onSnapshot, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './components/AuthProvider';
import Header from './components/common/Header';
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
import Graph from './components/Graph';
import MathTools from './components/MathTools';
import CurrencyConverter from './components/CurrencyConverter';
import FinancialCalculator from './components/FinancialCalculator';
import HealthCalculator from './components/HealthCalculator';
import TextTools from './components/TextTools';
import DeveloperTools from './components/DeveloperTools';
import StudentTools from './components/StudentTools';
import FloatingAssistant from './components/FloatingAssistant';
import Scratchpad from './components/Scratchpad';
import CommandPalette from './components/CommandPalette';
import PeriodicTable from './components/PeriodicTable';
import ProfileOnboarding from './components/ProfileOnboarding';

import PrivacyProtocol from './components/PrivacyProtocol';
import CoreLicense from './components/CoreLicense';
import SupportHub from './components/SupportHub';

const App = () => {
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
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
    }, (error) => {
      console.error("Error fetching history from Firestore:", error);
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
        console.error("Error adding history to Firestore:", error);
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
        console.error("Error clearing history from Firestore:", error);
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
        console.error("Error toggling favorite in Firestore:", error);
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
        TabComponent = <LandingPage onTabClick={setActiveTab} onLoginClick={() => setIsAuthModalOpen(true)} history={history} />;
        break;
      case 'calculator':
        TabComponent = <Calculator addToHistory={addToHistory} expressionToLoad={expressionToLoad} onExpressionLoaded={handleExpressionLoaded} />;
        break;
      case 'graphing':
        TabComponent = <Graph />;
        break;
      case 'periodic':
        TabComponent = <PeriodicTable />;
        break;
      case 'math-tools':
        TabComponent = <MathTools />;
        break;
      case 'programmer':
        TabComponent = <ProgrammerCalculator />;
        break;
      case 'units':
        TabComponent = <UnitConverter />;
        break;
      case 'currency':
        TabComponent = <CurrencyConverter />;
        break;
      case 'base':
        TabComponent = <BaseConverter />;
        break;
      case 'financial':
        TabComponent = <FinancialCalculator />;
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
        TabComponent = <StudentTools />;
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
        TabComponent = <Settings />;
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
        TabComponent = <Calculator addToHistory={addToHistory} expressionToLoad={expressionToLoad} onExpressionLoaded={handleExpressionLoaded} />;
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
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans flex flex-col">
      {user && userData && !userData.onboarded && <ProfileOnboarding />}
      <Header activeTab={activeTab} onTabClick={setActiveTab} onLoginClick={() => setIsAuthModalOpen(true)} />
      <main className="container mx-auto px-4 pb-8 flex-1">
        {renderActiveTab()}
      </main>
      <FloatingAssistant activeTab={activeTab} setActiveTab={setActiveTab} />
      <Scratchpad />
      <CommandPalette onTabClick={setActiveTab} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <footer className="py-6 border-t border-brand-border/30 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-text-secondary">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab('privacy')} className="hover:text-brand-text transition-colors">Privacy Protocol</button>
            <button onClick={() => setActiveTab('core-license')} className="hover:text-brand-text transition-colors">Core License</button>
            <button onClick={() => setActiveTab('support')} className="hover:text-brand-text transition-colors">Support Hub</button>
            <button onClick={() => setActiveTab('terms')} className="hover:text-brand-text transition-colors">Terms of Service</button>
          </div>
          <div>Powered by Edgtec 2025</div>
        </div>
      </footer>
    </div>
  );
};

export default App;