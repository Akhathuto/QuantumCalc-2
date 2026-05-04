
import React from 'react';
import {
  Home,
  Calculator as CalculatorIcon,
  LineChart,
  Scale,
  Landmark,
  Binary,
  Banknote,
  Calendar,
  History,
  Info,
  Beaker,
  TestTube,
  HeartPulse,
  MoreHorizontal,
  FileText,
  Settings as SettingsIcon,
  HelpCircle,
  Wrench,
  Code,
  GraduationCap,
  Mail,
  LogOut,
  LogIn
} from 'lucide-react';

import Logo from './Logo';
import Tab from './Tab';
import DropdownTab from './DropdownTab';
import { AppTab } from '../../types';
import { useAuth } from '../AuthProvider';

interface HeaderProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabClick }) => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <header className="bg-brand-surface/70 backdrop-blur-sm p-4 rounded-b-xl shadow-lg sticky top-0 z-40 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div onClick={() => onTabClick('landing')} className="cursor-pointer">
          <Logo />
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <Tab
            label="Home"
            Icon={Home}
            isActive={activeTab === 'landing'}
            onClick={() => onTabClick('landing')}
          />
          <Tab
            label="Calculator"
            Icon={CalculatorIcon}
            isActive={activeTab === 'calculator'}
            onClick={() => onTabClick('calculator')}
          />
          <Tab
            label="Graphing"
            Icon={LineChart}
            isActive={activeTab === 'graphing'}
            onClick={() => onTabClick('graphing')}
          />
          <DropdownTab
            label="Tools"
            Icon={Wrench}
            activeTab={activeTab}
            onTabClick={onTabClick}
            subTabs={[
              { id: 'math-tools', label: 'Math Tools', Icon: Beaker },
              { id: 'programmer', label: 'Programmer', Icon: Binary },
              { id: 'financial', label: 'Financial', Icon: Landmark },
              { id: 'date', label: 'Date & Time', Icon: Calendar },
              { id: 'health', label: 'Health', Icon: HeartPulse },
              { id: 'text', label: 'Text Tools', Icon: FileText },
              { id: 'developer', label: 'Developer Tools', Icon: Code },
              { id: 'student', label: 'Student Tools', Icon: GraduationCap },
            ]}
          />
          <DropdownTab
            label="Converters"
            Icon={TestTube}
            activeTab={activeTab}
            onTabClick={onTabClick}
            subTabs={[
              { id: 'units', label: 'Unit Converter', Icon: Scale },
              { id: 'currency', label: 'Currency Converter', Icon: Banknote },
              { id: 'base', label: 'Base Converter', Icon: Binary },
            ]}
          />
          <DropdownTab
            label="More"
            Icon={MoreHorizontal}
            activeTab={activeTab}
            onTabClick={onTabClick}
            subTabs={[
              { id: 'history', label: 'History', Icon: History },
              { id: 'help', label: 'Help & FAQ', Icon: HelpCircle },
              { id: 'about', label: 'About', Icon: Info },
              { id: 'contact', label: 'Contact', Icon: Mail },
              { id: 'settings', label: 'Settings', Icon: SettingsIcon },
              { id: 'terms', label: 'Terms & License', Icon: FileText },
            ]}
          />
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-brand-text-secondary hover:bg-brand-surface hover:text-brand-primary"
              title={`Logged in as ${user.displayName || user.email}`}
            >
              <img src={user.photoURL || ''} alt="Profile" className="w-6 h-6 rounded-full" />
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-brand-text-secondary hover:bg-brand-surface hover:text-brand-primary"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline text-sm font-medium">Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
