
import { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/common/Header';
import Calculator from './components/Calculator';
import History from './components/History';
import { UnitConverter } from './components/UnitConverter';
import BaseConverter from './components/BaseConverter';
import DateCalculator from './components/DateCalculator';
import About from './components/About';
import TermsAndLicense from './components/TermsAndLicense';
import Settings from './components/Settings';
import Help from './components/Help';
import { AppTab, HistoryEntry } from './types';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-load components with heavy dependencies (like charting libraries) to prevent startup crashes
const Graph = lazy(() => import('./components/Graph'));
const MathTools = lazy(() => import('./components/MathTools'));
const CurrencyConverter = lazy(() => import('./components/CurrencyConverter'));
const FinancialCalculator = lazy(() => import('./components/FinancialCalculator'));
const HealthCalculator = lazy(() => import('./components/HealthCalculator'));

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('calculator');
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

  useEffect(() => {
    try {
      localStorage.setItem('calcHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  }, [history]);

  const addToHistory = (entry: HistoryEntry) => {
    setHistory(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  };

  const clearHistory = () => {
    setHistory([]);
  };
  
  const toggleFavorite = (timestamp: string) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.timestamp === timestamp
          ? { ...entry, isFavorite: !entry.isFavorite }
          : entry
      )
    );
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
      case 'calculator':
        TabComponent = <Calculator addToHistory={addToHistory} expressionToLoad={expressionToLoad} onExpressionLoaded={handleExpressionLoaded} />;
        break;
      case 'graphing':
        TabComponent = <Graph />;
        break;
      case 'math-tools':
        TabComponent = <MathTools />;
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
      case 'history':
        TabComponent = <History history={history} loadFromHistory={loadFromHistory} clearHistory={clearHistory} toggleFavorite={toggleFavorite} />;
        break;
      case 'help':
        TabComponent = <Help />;
        break;
      case 'about':
        TabComponent = <About />;
        break;
      case 'settings':
        TabComponent = <Settings />;
        break;
      case 'terms':
        TabComponent = <TermsAndLicense />;
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

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      <Header activeTab={activeTab} onTabClick={setActiveTab} />
      <main className="container mx-auto px-4 pb-8">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default App;