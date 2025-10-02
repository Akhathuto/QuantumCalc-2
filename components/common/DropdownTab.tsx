import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppTab } from '../../types';

interface SubTab {
  id: AppTab;
  label: string;
  Icon: React.ElementType;
}

interface DropdownTabProps {
  label: string;
  Icon: React.ElementType;
  subTabs: SubTab[];
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
}

const DropdownTab: React.FC<DropdownTabProps> = ({ label, Icon, subTabs, activeTab, onTabClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isParentActive = subTabs.some(subTab => subTab.id === activeTab);

  const activeClasses = 'bg-brand-surface text-brand-text';
  const inactiveClasses = 'text-brand-text-secondary hover:bg-brand-surface/70 hover:text-brand-text';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubTabClick = (tabId: AppTab) => {
    onTabClick(tabId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 py-2 px-4 rounded-md font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors duration-200 whitespace-nowrap ${isParentActive ? activeClasses : inactiveClasses}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon size={18} />
        <span>{label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-brand-surface border border-brand-border rounded-lg shadow-2xl z-50 animate-fade-in-down">
          <ul className="py-2">
            {subTabs.map(subTab => (
              <li key={subTab.id}>
                <button
                  onClick={() => handleSubTabClick(subTab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 ${activeTab === subTab.id ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text'}`}
                >
                  <subTab.Icon size={16} />
                  <span>{subTab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownTab;
