import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Zap, 
  Sparkles, 
  Crown, 
  Target, 
  Compass, 
  CheckCircle2, 
  Calendar,
  Lock,
  Share2,
  Info
} from 'lucide-react';
import { dailyGoalService } from '../services/dailyGoalService';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  checkUnlocked: (data: {
    history: Record<string, number>;
    target: number;
    streak: number;
    completedDays: number;
    totalSolved: number;
    todaySolved: number;
    maxSingleDay: number;
  }) => boolean;
  requirementText: string;
}

const BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Broke the barrier and completed your first verified calculation!',
    icon: Sparkles,
    color: '#0ea5e9', // Class-based gradient will handle visual, color is for metadata
    bgClass: 'from-[#0ea5e9]/10 to-[#2563eb]/5 border-[#0ea5e9]/30 text-[#0ea5e9]',
    borderClass: 'border-[#0ea5e9]/40',
    textClass: 'text-sky-400',
    requirementText: 'Solve 1+ problems historically.',
    checkUnlocked: ({ totalSolved }) => totalSolved >= 1,
  },
  {
    id: 'daily_champion',
    title: 'Daily Champion',
    description: 'Met or exceeded your calculated target for today.',
    icon: Target,
    color: '#10b981',
    bgClass: 'from-[#10b981]/10 to-[#059669]/5 border-[#10b981]/30 text-[#10b981]',
    borderClass: 'border-[#10b981]/40',
    textClass: 'text-emerald-400',
    requirementText: "Complete today's daily target.",
    checkUnlocked: ({ todaySolved, target }) => todaySolved >= target,
  },
  {
    id: 'habit_spark',
    title: 'On the Map',
    description: 'Completed your full daily calculation target on 3 unique days!',
    icon: BookOpenIconFallback(), // Custom inline helper or simple icon
    color: '#f59e0b',
    bgClass: 'from-[#f59e0b]/10 to-[#d97706]/5 border-[#f59e0b]/30 text-[#f59e0b]',
    borderClass: 'border-[#f59e0b]/40',
    textClass: 'text-amber-400',
    requirementText: 'Meet daily target on 3 unique days.',
    checkUnlocked: ({ completedDays }) => completedDays >= 3,
  },
  {
    id: 'flame_keeper',
    title: 'Habit Flame',
    description: 'Set your mind ablaze with a solid 3-day target streak.',
    icon: Flame,
    color: '#f43f5e',
    bgClass: 'from-[#f43f5e]/10 to-[#e11d48]/5 border-[#f43f5e]/30 text-[#f43f5e]',
    borderClass: 'border-[#f43f5e]/40',
    textClass: 'text-[#f43f5e]',
    requirementText: 'Maintain a 3+ day streak.',
    checkUnlocked: ({ streak }) => streak >= 3,
  },
  {
    id: 'unstoppable_force',
    title: 'Supernova',
    description: 'Calculations on consecutive days. A full week of cognitive supremacy!',
    icon: Zap,
    color: '#a855f7',
    bgClass: 'from-[#a855f7]/10 to-[#7c3aed]/5 border-[#a855f7]/30 text-[#a855f7]',
    borderClass: 'border-[#a855f7]/40',
    textClass: 'text-purple-400',
    requirementText: 'Maintain a 7+ day streak.',
    checkUnlocked: ({ streak }) => streak >= 7,
  },
  {
    id: 'scholar_triumph',
    title: 'Dedicated Scholar',
    description: 'Pushed through and hit your target goal on 10 separate days.',
    icon: Trophy,
    color: '#10b981',
    bgClass: 'from-[#eab308]/10 to-[#ca8a04]/5 border-[#eab308]/30 text-[#eab308]',
    borderClass: 'border-[#eab308]/40',
    textClass: 'text-[#eab308]',
    requirementText: 'Meet daily target on 10 unique days.',
    checkUnlocked: ({ completedDays }) => completedDays >= 10,
  },
  {
    id: 'overachiever',
    title: 'Limit Breaker',
    description: 'Shattered your target limits. Solved over double your default goal in one day!',
    icon: Compass,
    color: '#3b82f6',
    bgClass: 'from-[#3b82f6]/10 to-[#1d4ed8]/5 border-[#3b82f6]/30 text-[#3b82f6]',
    borderClass: 'border-[#3b82f6]/40',
    textClass: 'text-blue-400',
    requirementText: 'Solve 2x your target in a single day.',
    checkUnlocked: ({ maxSingleDay, target }) => maxSingleDay >= target * 2,
  },
  {
    id: 'titan_century',
    title: 'Century Mind',
    description: 'You have entered the academic pantheon with over 100 historical solutions!',
    icon: Crown,
    color: '#ca8a04',
    bgClass: 'from-[#ca8a04]/10 to-[#a16207]/5 border-[#ca8a04]/30 text-[#ca8a04]',
    borderClass: 'border-[#ca8a04]/40',
    textClass: 'text-yellow-500',
    requirementText: 'Solve 100+ total problems historically.',
    checkUnlocked: ({ totalSolved }) => totalSolved >= 100,
  },
];

function BookOpenIconFallback() {
  return Calendar; // Reuse standard icons to ensure reliability
}

export const Achievements: React.FC = () => {
  const [goalData, setGoalData] = useState(() => dailyGoalService.getGoalData());
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const handleGoalChange = () => {
      setGoalData(dailyGoalService.getGoalData());
    };
    window.addEventListener('dailyGoal-change', handleGoalChange);
    return () => {
      window.removeEventListener('dailyGoal-change', handleGoalChange);
    };
  }, []);

  // Compute stats for check
  const historyEntries = Object.entries(goalData.history);
  const totalSolved = historyEntries.reduce((sum, [, count]) => sum + count, 0);
  const completedDays = historyEntries.filter(([, count]) => count >= goalData.target).length;
  const todaySolved = dailyGoalService.getTodaySolved();
  const maxSingleDay = historyEntries.length > 0 ? Math.max(...historyEntries.map(([, count]) => count)) : 0;

  const statsContext = {
    history: goalData.history,
    target: goalData.target,
    streak: goalData.streak,
    completedDays,
    totalSolved,
    todaySolved,
    maxSingleDay,
  };

  const unlockedBadges = BADGES.filter(badge => badge.checkUnlocked(statsContext));
  const unlockedPercent = BADGES.length > 0 ? Math.round((unlockedBadges.length / BADGES.length) * 100) : 0;

  return (
    <div className="space-y-6" id="quantum_achievements_grid_view">
      {/* Achievements Header with micro stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-brand-bg/40 border border-brand-border/30 rounded-2xl">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Cognitive Milestones</div>
          <h4 className="text-lg font-black text-brand-text">Awards & Achievements</h4>
          <p className="text-xs text-brand-text-secondary leading-normal font-light">
            Each correct solution across worksheets, math practices, or brain gym modules counts toward unlocking premium academic badges.
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="sm:text-right shrink-0 space-y-1.5 min-w-[140px]">
          <div className="flex justify-between sm:justify-end gap-3 text-xs font-black">
            <span className="text-brand-text-secondary uppercase">Progress:</span>
            <span className="text-brand-primary font-mono">{unlockedBadges.length} / {BADGES.length}</span>
          </div>
          <div className="h-2 bg-brand-border/20 rounded-full overflow-hidden w-full sm:w-36">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${unlockedPercent}%` }}
              className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 rounded-full"
            />
          </div>
          <span className="text-[9px] font-medium text-brand-text-secondary/80 block">
            {unlockedPercent}% Academy completed
          </span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = badge.checkUnlocked(statsContext);
          const IconComponent = badge.icon;
          
          return (
            <motion.div
              layoutId={`badge-container-${badge.id}`}
              onClick={() => setActiveBadge(badge)}
              key={badge.id}
              whileHover={{ y: isUnlocked ? -4 : 0, scale: isUnlocked ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all select-none relative overflow-hidden group ${
                isUnlocked 
                  ? `bg-gradient-to-br ${badge.bgClass} shadow-md` 
                  : 'bg-brand-surface/20 border-brand-border/20 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Radial gradient backing for shine */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* Lock Badge overlay */}
              {!isUnlocked && (
                <div className="absolute top-2 right-2 p-1 rounded-md bg-brand-border/10 text-brand-text-secondary/40">
                  <Lock size={10} />
                </div>
              )}

              {/* Badge Icon Display */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 scale-100 group-hover:scale-105 transition-transform ${
                isUnlocked 
                  ? `${badge.textClass} bg-brand-bg/50 border border-white/5` 
                  : 'text-brand-text-secondary/30 bg-brand-bg/20'
              }`}>
                <IconComponent size={22} className={isUnlocked ? "animate-pulse" : ""} />
              </div>

              {/* Titles */}
              <h5 className={`text-xs font-black tracking-tight leading-snug ${isUnlocked ? 'text-brand-text' : 'text-brand-text-secondary/50'}`}>
                {badge.title}
              </h5>
              <span className="text-[8px] font-mono mt-1 text-brand-text-secondary/60 leading-tight">
                {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed view Modal Popup */}
      <AnimatePresence>
        {activeBadge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveBadge(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm bg-brand-surface rounded-[2rem] border-2 ${
                activeBadge.checkUnlocked(statsContext) ? activeBadge.borderClass : 'border-brand-border/60'
              } p-6 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />

              {/* Close helper button */}
              <button 
                onClick={() => setActiveBadge(null)}
                className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-text-secondary hover:text-brand-text border border-brand-border/40 hover:border-brand-primary/30 px-2 py-1 rounded-lg cursor-pointer transition-colors"
              >
                ESC
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                {/* Large visual Badge circle */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border ${
                  activeBadge.checkUnlocked(statsContext) 
                    ? `bg-gradient-to-br ${activeBadge.bgClass} ${activeBadge.borderClass} ${activeBadge.textClass}` 
                    : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary/30'
                }`}>
                  {React.createElement(activeBadge.icon, { size: 36 })}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-black uppercase tracking-widest text-brand-primary mb-3">
                  {activeBadge.checkUnlocked(statsContext) ? '🏆 Achievement Unlocked' : '🔒 Locked Achievement'}
                </div>

                <h3 className="text-lg font-black text-brand-text tracking-tight mb-1.5">{activeBadge.title}</h3>
                <p className="text-xs text-brand-text-secondary font-light leading-relaxed max-w-xs mb-5">
                  {activeBadge.description}
                </p>

                {/* Criteria section */}
                <div className="w-full bg-brand-bg/45 border border-brand-border/40 rounded-xl p-3.5 text-left space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[9px] uppercase tracking-wider text-brand-text-secondary/80">
                    <Info size={11} className="text-brand-primary" /> Badge Criteria Rule
                  </div>
                  <p className="text-xs font-mono text-brand-text font-bold leading-none">
                    {activeBadge.requirementText}
                  </p>
                  
                  {/* Current values metric */}
                  <div className="pt-2 border-t border-brand-border/30 flex justify-between text-[10px] text-brand-text-secondary font-medium">
                    <span>Your overall total solutions:</span>
                    <span className="font-mono font-black text-brand-text">{totalSolved}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-text-secondary font-medium">
                    <span>Completed challenge days:</span>
                    <span className="font-mono font-black text-brand-text">{completedDays} days</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-text-secondary font-medium">
                    <span>Active streak record:</span>
                    <span className="font-mono font-black text-amber-500">🔥 {goalData.streak} days</span>
                  </div>
                </div>

                {/* Bottom interactive close */}
                <button
                  onClick={() => setActiveBadge(null)}
                  className="w-full py-3 mt-5 bg-brand-surface border border-brand-border hover:border-brand-primary/30 rounded-xl text-xs font-black uppercase tracking-widest text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer"
                >
                  Return to Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
