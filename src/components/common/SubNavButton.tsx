import React from 'react';
import { motion } from 'motion/react';

interface SubNavButtonProps {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    layoutId?: string;
}

const SubNavButton: React.FC<SubNavButtonProps> = ({ label, icon: Icon, isActive, onClick, layoutId }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 px-4 py-3 md:py-4 md:justify-start justify-center flex items-center gap-3 rounded-xl font-bold transition-all duration-300 text-sm min-w-[140px] md:min-w-0 w-full relative ${
            isActive 
                ? 'text-brand-primary' 
                : 'text-brand-text-secondary hover:text-white hover:bg-brand-surface/50'
        }`}
    >
        {isActive && (
            <motion.div 
                layoutId={layoutId}
                className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <Icon size={18} className="relative z-10" />
        <span className="relative z-10">{label}</span>
    </button>
);

export default SubNavButton;
