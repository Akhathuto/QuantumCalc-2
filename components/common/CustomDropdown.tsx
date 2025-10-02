import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  value: string;
  label: string;
  Icon: React.ElementType;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ items, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find(item => item.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-between w-full h-12 px-4 py-2 bg-brand-surface border border-brand-border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-brand-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedItem && (
          <span className="flex items-center gap-2">
            <selectedItem.Icon size={18} className="text-brand-primary" />
            <span>{selectedItem.label}</span>
          </span>
        )}
        <ChevronDown size={20} className={`text-brand-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-brand-surface border border-brand-border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto animate-fade-in-down">
          <ul className="py-1">
            {items.map(item => (
              <li key={item.value}>
                <button
                  onClick={() => handleSelect(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 ${selectedValue === item.value ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-border'}`}
                >
                  <item.Icon size={16} className="text-brand-text-secondary" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;