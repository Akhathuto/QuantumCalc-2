import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GraduationCap, History, Cloud, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
    onClose();
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

            <div className="p-8 md:p-12">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                  <GraduationCap size={14} /> Authentication Portal
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-brand-text leading-tight mb-4">
                  Elevate your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Workspace.</span>
                </h2>
                <p className="text-brand-text-secondary text-lg font-light leading-relaxed">
                  Join a community of students and engineers using QuantumCalc to solve the impossible.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-6 mb-12">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 rounded-xl bg-brand-surface-secondary border border-brand-border text-brand-primary group-hover:scale-110 transition-transform">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-text text-sm uppercase tracking-tight">{feature.title}</h4>
                      <p className="text-sm text-brand-text-secondary font-light">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-4 py-5 px-8 bg-brand-text text-brand-bg rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-brand-text-secondary uppercase tracking-widest opacity-50">
                  By connecting, you agree to our terms and privacy protocols.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
