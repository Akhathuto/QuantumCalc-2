import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: '0-9', description: 'Enter numbers' },
    { key: '+, -, *, /', description: 'Add, subtract, multiply, divide' },
    { key: 'Enter', description: 'Calculate result' },
    { key: 'Escape', description: 'Clear everything' },
    { key: 'Backspace', description: 'Delete last digit' },
    { key: 'Delete', description: 'Clear current input' },
    { key: 'c', description: 'Clear (when not focused on input)' },
    { key: 'Ctrl+C', description: 'Copy result to clipboard' },
    { key: 'm', description: 'Memory Add (M+)' },
    { key: 'Shift+M', description: 'Memory Recall (MR)' },
    { key: 'Ctrl+M', description: 'Memory Clear (MC)' },
    { key: '?', description: 'Toggle this help panel' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-full shadow-lg transition-all z-40"
        title="Keyboard Shortcuts"
        aria-label="Show keyboard shortcuts"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-primary">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-brand-border rounded-md transition-colors"
                title="Close shortcuts"
                aria-label="Close keyboard shortcuts dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3 pb-2 border-b border-brand-border/30">
                  <kbd className="bg-brand-primary/20 px-2 py-1 rounded text-sm font-mono font-semibold text-brand-primary whitespace-nowrap">
                    {shortcut.key}
                  </kbd>
                  <span className="text-sm text-brand-text-secondary flex-1">{shortcut.description}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-brand-text-secondary mt-4">
              💡 Tip: Press <kbd className="bg-brand-primary/20 px-1 rounded text-xs">?</kbd> anytime to toggle this panel
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
