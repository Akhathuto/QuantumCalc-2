import { useState, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { HistoryEntry } from '../types';
import { Star, Search, Download, History as HistoryIcon } from 'lucide-react';

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
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <Star size={14} /> Logic Logs
            </div>
            <h2 className="text-4xl font-extrabold text-brand-text mb-2 tracking-tight flex items-center gap-3">
                Calculation History
            </h2>
            <p className="text-brand-text-secondary font-light text-lg">
                Your past computations and architectural discoveries, preserved in memory.
            </p>
        </div>
        {history.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
                onClick={() => exportHistory('csv')}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary/30 text-brand-text-secondary hover:text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                title="Export as CSV"
            >
                <Download size={14} /> CSV
            </button>
            <button
                onClick={() => exportHistory('json')}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary/30 text-brand-text-secondary hover:text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                title="Export as JSON"
            >
                <Download size={14} /> JSON
            </button>
            <button 
              onClick={clearHistory}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Purge All
            </button>
          </div>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-brand-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-50" size={20} />
          <input
            type="text"
            placeholder="Search log entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface/30 backdrop-blur-sm border border-brand-border/60 rounded-2xl p-4 pl-12 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-brand-text-secondary/40 font-medium"
            aria-label="Search calculation history"
          />
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-24 bg-brand-surface/20 rounded-[2.5rem] border border-dashed border-brand-border/50">
            <div className="inline-block p-4 rounded-3xl bg-brand-surface/50 text-brand-text-secondary mb-6">
                <HistoryIcon size={48} />
            </div>
            <p className="text-xl font-light text-brand-text-secondary">No computations found in the stream.</p>
            <p className="text-sm text-brand-text-secondary/50 mt-2">Initialize the engines to begin logging.</p>
        </div>
      ) : filteredAndSortedHistory.length === 0 ? (
        <p className="text-center text-brand-text-secondary py-16">No log entries matching "{searchTerm}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredAndSortedHistory.map((item) => (
            <div
              key={item.timestamp}
              className={`group relative bg-brand-surface/30 backdrop-blur-sm p-6 rounded-[2rem] border border-brand-border/40 cursor-pointer hover:bg-brand-surface/50 hover:border-brand-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 active:scale-[0.98] ${item.isFavorite ? 'ring-1 ring-brand-secondary/30' : ''}`}
              onClick={() => loadFromHistory(item)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <button
                onClick={(e) => handleFavoriteClick(e, item.timestamp)}
                className="absolute top-4 right-4 p-2 text-brand-text-secondary hover:text-brand-secondary transition-all z-10 rounded-xl hover:bg-brand-secondary/10"
                aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star size={20} fill={item.isFavorite ? 'currentColor' : 'none'} className={item.isFavorite ? 'text-brand-secondary' : 'opacity-40 group-hover:opacity-100'} />
              </button>

              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-brand-primary/10 text-brand-primary">
                        <HistoryIcon size={12} />
                    </div>
                    <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest opacity-60">
                        {new Date(item.timestamp).toLocaleString()}
                    </span>
                </div>
                
                <div className="space-y-1">
                    <p className="font-mono text-sm text-brand-text-secondary truncate pr-8 opacity-70 group-hover:opacity-100 transition-opacity" title={item.expression}>
                        {item.expression}
                    </p>
                    <p className="font-mono text-2xl font-black text-brand-text truncate tracking-tighter" title={item.result}>
                        <span className="text-brand-primary opacity-50 mr-2">=</span> {item.result}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;