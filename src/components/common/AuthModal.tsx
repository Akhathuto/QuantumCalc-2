import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  History, 
  Cloud, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    error: authError, 
    clearError, 
    loading, 
    user 
  } = useAuth();

  // Tab State: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Reset inputs when tab changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setLocalError(null);
    clearError();
  }, [activeTab, clearError]);

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-transparent', width: 'w-0', score: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3', score };
    if (score <= 3) return { label: 'Moderate (Add uppercase/symbols)', color: 'bg-amber-500', width: 'w-2/3', score };
    return { label: 'Strong Scholar Key', color: 'bg-emerald-500', width: 'w-full', score };
  };

  const strength = getPasswordStrength();
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  const validateForm = () => {
    if (!email || !password) {
      setLocalError('Please fill in all required fields.');
      return false;
    }
    
    // Check email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return false;
    }

    if (activeTab === 'signup') {
      if (!displayName.trim()) {
        setLocalError('Please enter your scholar or user name.');
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return false;
      }
    }

    setLocalError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (activeTab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch (err) {
      // Errors are set and displayed via useAuth context
      console.error("Auth submit failed", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
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
            className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl z-20"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-brand-bg/50 border border-brand-border text-brand-text-secondary hover:text-brand-text transition-colors z-30"
            >
              <X size={20} />
            </button>

            {/* Responsive Split Screen */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px] md:divide-x md:divide-brand-border/30">
              
              {/* Left Column: Visual Introduction & Features */}
              <div className="hidden md:flex md:col-span-5 p-12 flex-col justify-between relative bg-black/20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] border border-brand-primary/20 shadow-inner">
                    <ShieldCheck size={14} /> Identity Gate
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-white leading-tight mb-4">
                      Your Secure <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-400 to-brand-secondary filter drop-shadow-md">
                        Scholar Vault.
                      </span>
                    </h2>
                    <p className="text-brand-text-secondary text-xs font-mono leading-relaxed opacity-80">
                      Sign in or create a scholar account to back up and synchronize formulas, notes, history, and practice exercises across devices.
                    </p>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-6 pt-6">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex gap-4 items-start group">
                        <div className="flex-shrink-0 p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border text-brand-primary shadow-sm">
                          <feature.icon size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-brand-text text-[11px] uppercase tracking-wider mb-0.5">{feature.title}</h4>
                          <p className="text-[11px] text-brand-text-secondary leading-relaxed opacity-75">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-50 pt-8 border-t border-brand-border/20">
                  <ShieldCheck size={12} className="text-brand-text-secondary" />
                  <p className="text-[9px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold">
                    SECURED BY FIREBASE AUTH
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Form */}
              <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                
                {/* Mode Selector Tabs */}
                <div className="flex bg-brand-bg/40 p-1.5 rounded-2xl border border-brand-border/50 max-w-sm mb-8 self-center md:self-start w-full">
                  <button
                    onClick={() => setActiveTab('signin')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTab === 'signin' ? 'bg-brand-primary text-brand-bg shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}
                  >
                    <LogIn size={13} /> Secure Login
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTab === 'signup' ? 'bg-brand-primary text-brand-bg shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}
                  >
                    <UserPlus size={13} /> Create Account
                  </button>
                </div>

                {/* Main Heading for small screens */}
                <div className="md:hidden text-center mb-6">
                  <h3 className="text-2xl font-black text-brand-primary tracking-tight">
                    {activeTab === 'signin' ? 'Welcome Back!' : 'Get Started'}
                  </h3>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    {activeTab === 'signin' ? 'Access your personal academic dashboard.' : 'Register a free scholar account.'}
                  </p>
                </div>

                {/* Form Input Group */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <label htmlFor="auth_displayName" className="block text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        Scholar / User Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/70 pointer-events-none">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          id="auth_displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Marie Curie"
                          className="w-full bg-brand-bg/60 border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary/80 text-xs text-brand-text rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all placeholder:text-brand-text-secondary/35 font-medium"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="auth_email" className="block text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/70 pointer-events-none">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        id="auth_email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. scholar@university.edu"
                        className="w-full bg-brand-bg/60 border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary/80 text-xs text-brand-text rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all placeholder:text-brand-text-secondary/35 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="auth_password" className="block text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/70 pointer-events-none">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="auth_password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={activeTab === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                        className="w-full bg-brand-bg/60 border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary/80 text-xs text-brand-text rounded-xl py-3.5 pl-11 pr-11 outline-none transition-all placeholder:text-brand-text-secondary/35 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-brand-text-secondary/70 hover:text-brand-text transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {activeTab === 'signup' && password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-brand-text-secondary">
                          <span>Password Strength:</span>
                          <span className={`font-bold uppercase tracking-wider ${strength.score >= 4 ? 'text-emerald-400' : strength.score >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-brand-bg/50 rounded-full overflow-hidden border border-brand-border/20">
                          <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {activeTab === 'signup' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label htmlFor="auth_confirmPassword" className="block text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/70 pointer-events-none">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="auth_confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full bg-brand-bg/60 border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary/80 text-xs text-brand-text rounded-xl py-3.5 pl-11 pr-11 outline-none transition-all placeholder:text-brand-text-secondary/35 font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-brand-text-secondary/70 hover:text-brand-text transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmPassword && (
                        <div className="flex items-center gap-1 text-[9px] font-mono mt-1">
                          {doPasswordsMatch ? (
                            <span className="text-emerald-400 flex items-center gap-1">✓ Keys match perfectly</span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">✗ Keys do not match yet</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Errors display */}
                  {(localError || authError) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold flex items-start gap-2.5 mt-2"
                    >
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{localError || authError}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setLocalError(null);
                          clearError();
                        }}
                        className="text-[9px] font-semibold text-red-400 hover:text-white uppercase tracking-wider"
                      >
                        [dismiss]
                      </button>
                    </motion.div>
                  )}

                  {/* Primary Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 bg-brand-primary hover:bg-brand-primary/90 text-brand-bg font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : activeTab === 'signin' ? (
                        <>Sign In Securely <ArrowRight size={14} /></>
                      ) : (
                        <>Complete Registration <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                </form>

                {/* Separator / Social Google Option */}
                <div className="my-6 px-4 flex items-center justify-center gap-3">
                  <div className="h-px bg-brand-border/30 flex-1" />
                  <span className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-[0.2em]">OR AUTHENTICATE SECURELY</span>
                  <div className="h-px bg-brand-border/30 flex-1" />
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3.5 py-3 px-6 bg-white hover:bg-neutral-100 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Connect with Google Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => signInWithGoogle(true)}
                    disabled={loading}
                    className="w-full text-center text-[10px] text-brand-text-secondary hover:underline py-1.5"
                  >
                    Use Google Redirect Mode (fallback if popup is blocked)
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
