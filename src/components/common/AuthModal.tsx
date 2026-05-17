import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Cloud, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, error, clearError, loading, user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const features = [
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Your calculations and data are synced across all your devices seamlessly.'
    },
    {
      icon: History,
      title: 'Infinite History',
      description: 'Never lose a calculation. Access your full history of computations anytime.'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Access',
      description: 'Enterprise-grade security ensuring your academic and professional data is safe.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Top Graphics */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-brand-bg/50 border border-brand-border text-brand-text-secondary hover:text-brand-text transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-10 md:p-14">
              <div className="mb-12">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-brand-primary/20 shadow-inner"
                >
                  <ShieldCheck size={14} /> Identity Provider
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1] mb-6">
                  Access your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-400 to-brand-secondary filter drop-shadow-md">
                    Secure Vault.
                  </span>
                </h2>
                <p className="text-brand-text-secondary text-base font-mono opacity-80 leading-relaxed max-w-sm">
                  Authenticate to enable end-to-end encrypted Google Drive synchronization and persistent session states.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-6 mb-12">
                {features.map((feature, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    key={idx} 
                    className="flex items-start gap-5 group"
                  >
                    <div className="flex-shrink-0 mt-1 p-3 rounded-2xl bg-brand-bg/50 border border-brand-border text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-bg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-brand-text text-sm uppercase tracking-widest mb-1 group-hover:text-brand-primary transition-colors">{feature.title}</h4>
                      <p className="text-sm text-brand-text-secondary font-medium leading-relaxed opacity-80">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Area */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-5 pt-6 border-t border-brand-border/40"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-start gap-3"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{error}</p>
                      <button 
                        onClick={clearError}
                        className="mt-2 text-[10px] uppercase tracking-widest hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full relative overflow-hidden flex items-center justify-center gap-4 py-5 px-8 bg-white text-black rounded-2xl font-black text-[13px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  {loading ? (
                    <RefreshCw size={20} className="animate-spin relative z-10" />
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0 relative z-10" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span className="relative z-10">{loading ? 'Authenticating...' : 'Continue with Google'}</span>
                  {!loading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />}
                </button>
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck size={12} className="text-brand-text-secondary" />
                    <p className="text-center text-[9px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold">
                      End-to-End Encryption Enabled
                    </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
