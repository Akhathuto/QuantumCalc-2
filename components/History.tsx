import { useState, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { HistoryEntry } from '../types';
import { Star, Search, Download } from 'lucide-react';

interface HistoryProps {
  history: HistoryEntry[];
  loadFromHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  toggleFavorite: (timestamp: string) => void;
}

const History = ({ history, loadFromHistory, clearHistory, toggleFavorite }: HistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedHistory = useMemo(() => {
    const filtered = history.filter(item =>
      item.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      // Pinned items first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Then sort by date
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [history, searchTerm]);

  const handleFavoriteClick = (e: MouseEvent, timestamp: string) => {
    e.stopPropagation(); // Prevent loading the history item when clicking the star
    toggleFavorite(timestamp);
  };

  const exportHistory = (format: 'csv' | 'json') => {
      if (history.length === 0) return;

      let content = '';
      let mimeType = '';
      let fileName = '';

      if (format === 'json') {
        content = JSON.stringify(history, null, 2);
        mimeType = 'application/json';
        fileName = 'quantum_calc_history.json';
      } else { // csv
        const header = '"Timestamp","Expression","Result","Is Favorite"\n';
        const rows = history.map(entry => {
          const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
          return [
            escapeCsv(entry.timestamp),
            escapeCsv(entry.expression),
            escapeCsv(entry.result),
            entry.isFavorite ? 'true' : 'false'
          ].join(',');
        }).join('\n');
        content = header + rows;
        mimeType = 'text/csv;charset=utf-8;';
        fileName = 'quantum_calc_history.csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-brand-primary">Calculation History</h2>
        {history.length > 0 && (
          <div className="flex gap-2">
            <button
                onClick={() => exportHistory('csv')}
                className="flex items-center gap-2 px-3 py-2 bg-brand-accent/80 hover:bg-brand-accent text-white rounded-md text-sm font-semibold transition-colors"
                title="Export as CSV"
            >
                <Download size={16} /> Export CSV
            </button>
            <button
                onClick={() => exportHistory('json')}
                className="flex items-center gap-2 px-3 py-2 bg-brand-primary/80 hover:bg-brand-primary text-white rounded-md text-sm font-semibold transition-colors"
                title="Export as JSON"
            >
                <Download size={16} /> Export JSON
            </button>
            <button 
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-md text-sm font-semibold transition-colors"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={20} />
          <input
            type="text"
            placeholder="Search by expression or result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border rounded-md p-2 pl-10 focus:ring-brand-primary focus:border-brand-primary"
            aria-label="Search calculation history"
          />
        </div>
      )}

      {history.length === 0 ? (
        <p className="text-center text-brand-text-secondary py-16">No calculations yet. Go make some history!</p>
      ) : filteredAndSortedHistory.length === 0 ? (
        <p className="text-center text-brand-text-secondary py-16">No matching calculations found for "{searchTerm}".</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredAndSortedHistory.map((item) => (
            <div
              key={item.timestamp}
              className={`bg-brand-surface/50 p-4 rounded-lg cursor-pointer hover:bg-brand-surface transition-colors relative ${item.isFavorite ? 'border-l-4 border-yellow-500' : ''}`}
              onClick={() => loadFromHistory(item)}
            >
              <button
                onClick={(e) => handleFavoriteClick(e, item.timestamp)}
                className="absolute top-3 right-3 p-1 text-brand-text-secondary hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full"
                aria-label={item.isFavorite ? "Unfavorite this calculation" : "Favorite this calculation"}
                title={item.isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star size={18} fill={item.isFavorite ? 'currentColor' : 'none'} className={item.isFavorite ? 'text-yellow-400' : ''} />
              </button>
              <p className="text-sm text-brand-text-secondary pr-8">
                {new Date(item.timestamp).toLocaleString()}
              </p>
              <p className="font-mono text-lg text-brand-text truncate" title={item.expression}>{item.expression}</p>
              <p className="font-mono text-xl font-bold text-brand-accent truncate" title={item.result}>= {item.result}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;