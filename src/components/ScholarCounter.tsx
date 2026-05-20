import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Wifi } from 'lucide-react';
import { useAuth } from './AuthProvider';

export const ScholarCounter: React.FC = () => {
    const { totalScholars } = useAuth();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 bg-brand-surface/30 backdrop-blur-md border border-brand-border/50 rounded-full group cursor-help transition-all hover:bg-brand-surface/50"
            title="Total registered scholars in the Quantum Network"
        >
            <div className="relative">
                <Users size={14} className="text-brand-primary transition-transform group-hover:scale-110" />
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-primary rounded-full -z-10"
                />
            </div>

            <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                    <motion.span 
                        key={totalScholars}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="font-mono text-xs font-black tracking-wider text-brand-text"
                    >
                        {totalScholars.toLocaleString()}
                    </motion.span>
                </AnimatePresence>
                
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary tracking-widest whitespace-nowrap">
                    Scholars Joined
                </span>
            </div>

            <div className="w-[1px] h-3 bg-brand-border/50" />

            <div className="flex items-center gap-1.5">
                <Wifi size={10} className="text-brand-primary animate-pulse" />
                <span className="text-[9px] uppercase font-bold text-brand-primary/80 tracking-widest">
                    Live
                </span>
            </div>
        </motion.div>
    );
};
