import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database,
  Compass, 
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../AuthProvider';

// Aesthetic animated SVG constellation representing Quantum & Calculation space
const QuantumConstellation: React.FC = () => {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden my-1 select-none">
      <svg className="w-28 h-28 opacity-80" viewBox="0 0 200 200">
        {/* Ambient Orbiting Paths */}
        <motion.ellipse 
          cx="100" cy="100" rx="80" ry="25"
          stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.25"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.ellipse 
          cx="100" cy="100" rx="80" ry="25"
          stroke="var(--color-secondary)" strokeWidth="1" fill="none" opacity="0.25"
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <motion.ellipse 
          cx="100" cy="100" rx="30" ry="75"
          stroke="var(--color-accent)" strokeWidth="1" fill="none" opacity="0.2"
          animate={{ rotate: 180 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbit Electrons */}
        <motion.circle 
          cx="100" cy="100" r="4" 
          fill="var(--color-primary)"
          animate={{ 
            x: [0, 80 * Math.cos(0), 80 * Math.cos(Math.PI/2), 80 * Math.cos(Math.PI), 80 * Math.cos(3*Math.PI/2), 0],
            y: [0, 25 * Math.sin(0), 25 * Math.sin(Math.PI/2), 25 * Math.sin(Math.PI), 25 * Math.sin(3*Math.PI/2), 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle 
          cx="100" cy="100" r="3.5" 
          fill="var(--color-secondary)"
          animate={{ 
            x: [0, 80 * Math.cos(0), 80 * Math.cos(-Math.PI/2), 80 * Math.cos(-Math.PI), 80 * Math.cos(-3*Math.PI/2), 0],
            y: [0, 25 * Math.sin(0), 25 * Math.sin(-Math.PI/2), 25 * Math.sin(-Math.PI), 25 * Math.sin(-3*Math.PI/2), 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />

        {/* Central Glowing Atom Nucleus */}
        <circle cx="100" cy="100" r="12" fill="url(#coreGradient)" />
        <circle cx="100" cy="100" r="6" fill="var(--color-primary)" className="animate-pulse" />

        {/* Gradients */}
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating Sparkles inside left column */}
      <div className="absolute top-4 left-6 animate-bounce text-brand-primary opacity-60">
        <Sparkles size={14} />
      </div>
      <div className="absolute bottom-6 right-8 animate-pulse text-brand-secondary opacity-55">
        <Sparkles size={11} />
      </div>
    </div>
  );
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    signInWithGoogle, 
    loading, 
    user
  } = useAuth();
  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-lg transition-opacity duration-300"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative w-full max-w-2xl bg-brand-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col md:block"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-bg/50 border border-brand-border hover:bg-brand-bg hover:border-brand-primary/40 text-brand-text-secondary hover:text-brand-text transition-all z-50 backdrop-blur-md"
              title="Close Authentication View"
            >
              <X size={15} />
            </button>

            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-secondary/8 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] md:divide-x md:divide-brand-border/15">
              <div className="hidden md:flex md:col-span-5 p-6 flex-col justify-between relative bg-black/15">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[8.5px] font-black uppercase tracking-[0.25em] border border-brand-primary/15 shadow-sm">
                      <Compass size={10} className="spin-slow" /> Let's Venture
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-brand-text leading-tight mb-1 font-sans">
                      Welcome! 👋
                    </h2>
                    <p className="text-brand-text-secondary text-[11px] leading-relaxed opacity-80">
                      Sync your data securely with centralized authentication.
                    </p>
                  </div>
                  <QuantumConstellation />
                </div>
                <div className="flex items-center gap-1.5 opacity-45 pt-3 border-t border-brand-border/10">
                  <Database size={10} className="text-brand-text-secondary" />
                  <p className="text-[7px] text-brand-text-secondary uppercase tracking-[0.18em] font-mono font-bold">
                    CLOUD SYNCED SECURED STORAGE
                  </p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-center items-center">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-black text-brand-primary tracking-tight">Access Your Workspace</h3>
                  <p className="text-[10px] text-brand-text-secondary mt-1">Connect with your identity to enable cloud features.</p>
                </div>
                <div className="w-full my-5 flex items-center justify-center gap-2 px-2">
                  <div className="h-px bg-brand-border/20 flex-1" />
                  <span className="text-[8px] font-mono text-brand-text-secondary uppercase tracking-[0.18em]">Sovereign Identity Protection</span>
                  <div className="h-px bg-brand-border/20 flex-1" />
                </div>

                <div className="flex flex-col gap-2 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-5 bg-white hover:bg-neutral-100 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Connect with Google ID</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
