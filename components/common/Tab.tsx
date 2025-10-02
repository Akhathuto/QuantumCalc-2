import type { ElementType } from 'react';

interface TabProps {
  label: string;
  Icon: ElementType;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, Icon, isActive, onClick }: TabProps) => {
  const activeClasses = 'bg-brand-surface text-brand-text';
  const inactiveClasses = 'text-brand-text-secondary hover:bg-brand-surface/70 hover:text-brand-text';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-2 px-4 rounded-md font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors duration-200 whitespace-nowrap ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

export default Tab;