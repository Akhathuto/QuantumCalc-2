
import React from 'react';
import {
  Calculator as CalculatorIcon,
  LineChart,
  Table,
  BarChart,
  FunctionSquare,
  Scale,
  Landmark,
  Percent,
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
} from 'lucide-react';

import Logo from './Logo';
import Tab from './Tab';
import DropdownTab from './DropdownTab';
import { AppTab } from '../../types';

interface HeaderProps {
  activeTab: AppTab;
  onTabClick: (tabId: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabClick }) => {
  return (
    <header className="bg-brand-surface/70 backdrop-blur-sm p-4 rounded-b-xl shadow-lg sticky top-0 z-40 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div onClick={() => onTabClick('calculator')}>
          <Logo />
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
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
          <Tab
            label="Math Tools"
            Icon={Beaker}
            isActive={activeTab === 'math-tools'}
            onClick={() => onTabClick('math-tools')}
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
          <Tab
            label="Financial"
            Icon={Landmark}
            isActive={activeTab === 'financial'}
            onClick={() => onTabClick('financial')}
          />
          <Tab
            label="Date"
            Icon={Calendar}
            isActive={activeTab === 'date'}
            onClick={() => onTabClick('date')}
          />
          <Tab
            label="Health"
            Icon={HeartPulse}
            isActive={activeTab === 'health'}
            onClick={() => onTabClick('health')}
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
              { id: 'settings', label: 'Settings', Icon: SettingsIcon },
              { id: 'terms', label: 'Terms & License', Icon: FileText },
            ]}
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
