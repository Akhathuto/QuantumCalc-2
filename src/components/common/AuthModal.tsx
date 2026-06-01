import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database,
  Compass, 
  Sparkles,
  Shield,
  GraduationCap,
  School,
  Building2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { Recapture } from './Recapture';

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
    signUpWithEmail,
    signInWithEmail,
    signInGuest,
    resetPassword,
    loading, 
    user,
    error,
    clearError,
    signInSimulated
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'email' | 'guest'>('guest');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [googleMode, setGoogleMode] = useState<'signin' | 'signup'>('signin');
  const [showReset, setShowReset] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Custom states for data collection on sign-up
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<string>('student');
  const [grade, setGrade] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [primaryInterest, setPrimaryInterest] = useState<string>('general');
  
  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLocalError("Sign in was cancelled.");
      }
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle(true);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLocalError("Sign in was cancelled.");
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSent(false);

    if (!email) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (showReset) {
      try {
        await resetPassword(email);
        setResetSent(true);
      } catch (err: any) {
        setLocalError(err.message || "Failed to trigger reset email.");
      }
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    if (isSignUp) {
      if (!displayName) {
        setLocalError("Please enter your full name.");
        return;
      }
      if (signUpStep === 1) {
        setSignUpStep(2);
        return;
      }
      if (!isVerified) {
        setLocalError("Please complete the Quantum Recapture human verification.");
        return;
      }
    }

    try {
      if (isSignUp) {
        const extraData = {
          role,
          grade: ['student', 'teacher'].includes(role) ? grade : null,
          school: school || null,
          primaryInterest,
          onboarded: true
        };
        await signUpWithEmail(email, password, displayName, extraData);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLocalError("Sign in was cancelled.");
      } else {
        setLocalError(err.message || "Authentication attempt failed.");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (clearError) clearError();
      setLocalError(null);
      setResetSent(false);
      setShowReset(false);
    }
  }, [isOpen, clearError]);

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Combined error message priority (global AuthProvider error vs local UI error)
  const displayError = error || localError;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md transition-opacity duration-300"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-2xl bg-brand-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col md:block"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-bg/40 border border-brand-border hover:bg-brand-bg hover:border-brand-primary/40 text-brand-text-secondary hover:text-brand-text transition-all z-50 backdrop-blur-md cursor-pointer"
              title="Close Authentication View"
            >
              <X size={15} />
            </button>

            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-secondary/8 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px] md:divide-x md:divide-brand-border/15">
              <div className="hidden md:flex md:col-span-5 p-6 flex-col justify-between relative bg-black/15">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[8.5px] font-black uppercase tracking-[0.25em] border border-brand-primary/15 shadow-sm">
                      <Compass size={10} className="spin-slow" /> Space Explorer
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-brand-text leading-tight mb-1 font-sans">
                      Welcome! 👋
                    </h2>
                    <p className="text-brand-text-secondary text-[11px] leading-relaxed opacity-80">
                      Sync your computations, quantum calculations, notes, and profiles securely.
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

              <div className="col-span-1 md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-center">
                <div className="text-center mb-5">
                  <h3 className="text-base font-black text-brand-text tracking-tight uppercase tracking-wider">Access Your Workspace</h3>
                  <p className="text-[10px] text-brand-text-secondary mt-1">Select your preferred login pipeline to preserve your profiles and computations.</p>
                </div>

                {/* Enhanced Tab Toggles with custom indicators */}
                <div className="flex bg-brand-bg/65 p-1 rounded-xl border border-brand-border/30 mb-6 relative select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('guest');
                      setLocalError(null);
                    }}
                    className={`flex-1 py-2 px-1 text-center font-black text-[9px] uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer relative flex flex-col items-center justify-center gap-0.5 ${
                      activeTab === 'guest'
                        ? 'bg-brand-surface text-brand-secondary shadow-md border border-brand-border/20 scale-[1.02]'
                        : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/20'
                    }`}
                  >
                    <span>Guest Access</span>
                    <span className="text-[8px] scale-75 opacity-85 text-brand-secondary font-mono tracking-normal lowercase">⚡ iframe safe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('google');
                      setLocalError(null);
                    }}
                    className={`flex-1 py-2 px-1 text-center font-black text-[9px] uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer relative flex flex-col items-center justify-center gap-0.5 ${
                      activeTab === 'google'
                        ? 'bg-brand-surface text-brand-primary shadow-md border border-brand-border/20 scale-[1.02]'
                        : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/20'
                    }`}
                  >
                    <span>Google SSO</span>
                    <span className="text-[8px] scale-75 opacity-85 text-brand-primary font-mono tracking-normal lowercase">🚀 live popups</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email');
                      setLocalError(null);
                    }}
                    className={`flex-1 py-2 px-1 text-center font-black text-[9px] uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer relative flex flex-col items-center justify-center gap-0.5 ${
                      activeTab === 'email'
                        ? 'bg-brand-surface text-brand-secondary shadow-md border border-brand-border/20 scale-[1.02]'
                        : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/20'
                    }`}
                  >
                    <span>Email Key</span>
                    <span className="text-[8px] scale-75 opacity-85 text-[#9C27B0] font-mono tracking-normal lowercase">🔒 sandbox ok</span>
                  </button>
                </div>

                {/* Animated tab view transitions */}
                <div className="min-h-[250px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {activeTab === 'guest' && (
                      <motion.div
                        key="guest-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="w-full flex flex-col gap-4 text-center py-2"
                      >
                        <div className="p-4 bg-brand-secondary/8 rounded-xl border border-brand-secondary/20 text-brand-text-secondary text-[11px] leading-relaxed space-y-2">
                          <div className="w-10 h-10 mx-auto bg-brand-secondary/20 text-brand-secondary rounded-full flex items-center justify-center mb-1">
                            <Sparkles size={18} className="animate-spin-slow" />
                          </div>
                          <p className="font-extrabold text-brand-secondary text-[11px] uppercase tracking-wider">Authentic Firebase Guest Access</p>
                          <p className="opacity-95 text-[10px]">
                            Provisions an authentic guest signature securely stored in Firebase Firestore. 100% compliant with standard sandbox iframes!
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            setLocalError(null);
                            try {
                              await signInGuest();
                            } catch (err: any) {
                              setLocalError(err.message || "Guest authentication failed.");
                            }
                          }}
                          disabled={loading}
                          className="w-full h-11 flex items-center justify-center gap-2 px-5 bg-brand-secondary hover:bg-brand-secondary/95 text-brand-bg font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-lg shadow-brand-secondary/20 hover:shadow-brand-secondary/35 transition-all text-center cursor-pointer disabled:opacity-50"
                        >
                          <span>{loading ? "Authenticating Session Identity..." : "Initialize Free Guest Token"}</span>
                        </button>
                        
                        <p className="text-[8.5px] text-zinc-500 max-w-xs mx-auto">
                          * Your sandbox workspace data persists inside your local session automatically.
                        </p>
                      </motion.div>
                    )}

                    {activeTab === 'google' && (
                      <motion.div
                        key="google-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="w-full flex flex-col gap-4 text-center"
                      >
                        {window.self !== window.top ? (
                          <div className="p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/25 text-brand-text-secondary text-[11px] leading-relaxed space-y-2 text-center shadow-inner">
                            <div className="w-10 h-10 mx-auto bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mb-2 animate-pulse">
                              <Shield size={20} className="text-brand-primary" />
                            </div>
                            <p className="font-extrabold text-brand-primary text-[11px] uppercase tracking-widest">Workspace Cross-Origin Sandbox</p>
                            <p className="opacity-90">
                              Browsers securely restrict cross-origin popup auth tokens within iframe contexts (throwing <strong>auth/popup-closed-by-user</strong> blocks).
                            </p>
                            <div className="pt-2 pb-1.5">
                              <a 
                                href={window.location.href} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex w-full items-center justify-center gap-2 py-3.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-brand-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 active:translate-y-0"
                              >
                                🚀 Open Workspace in Full Tab ↗
                              </a>
                            </div>
                            
                            <p className="text-[8.5px] text-zinc-400">
                              Alternatively, toggle above to <strong>Guest Access</strong> or <strong>Email Method</strong> to log in directly here.
                            </p>

                            {signInSimulated && (
                              <div className="mt-2.5 pt-2.5 border-t border-brand-primary/10">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocalError(null);
                                    if (clearError) clearError();
                                    signInSimulated();
                                  }}
                                  className="w-full py-2 bg-brand-bg/50 hover:bg-brand-bg border border-brand-primary/20 hover:border-brand-primary/40 text-brand-primary rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer hover:shadow-inner"
                                >
                                  ✨ Fast Staging Bypass (Sandbox Mode)
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3.5 py-1">
                            {/* Inner google sub-toggle */}
                            <div className="flex bg-brand-bg/50 p-1 rounded-xl border border-brand-border/25 max-w-[190px] mx-auto select-none mb-1">
                              <button
                                type="button"
                                onClick={() => setGoogleMode('signin')}
                                className={`flex-1 py-1 px-2.5 text-center font-black text-[8.5px] uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                                  googleMode === 'signin'
                                    ? 'bg-brand-surface text-brand-primary border border-brand-border/20 shadow-sm'
                                    : 'text-brand-text-secondary hover:text-brand-text'
                                }`}
                              >
                                Sign In
                              </button>
                              <button
                                type="button"
                                onClick={() => setGoogleMode('signup')}
                                className={`flex-1 py-1 px-2.5 text-center font-black text-[8.5px] uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                                  googleMode === 'signup'
                                    ? 'bg-brand-surface text-brand-primary border border-brand-border/20 shadow-sm'
                                    : 'text-brand-text-secondary hover:text-brand-text'
                                }`}
                              >
                                Sign Up
                              </button>
                            </div>

                            <div className="text-center max-w-xs mx-auto mb-1">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-text">
                                {googleMode === 'signin' ? "Access Workspace" : "Create Scholar Profile"}
                              </h4>
                              <p className="text-[9.5px] text-brand-text-secondary mt-0.5 leading-relaxed">
                                {googleMode === 'signin' 
                                  ? "Sign in with Google to synchronize your formulas, computation history and active settings."
                                  : "Instantiate a new secure scholar cloud profile synchronized instantly with Google SSO."
                                }
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={loading}
                              className="w-full h-11 flex items-center justify-center gap-2.5 px-5 bg-white hover:bg-neutral-100 text-black font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              <span>{googleMode === 'signin' ? "Google ID Sign In" : "Google ID Sign Up"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleGoogleRedirectSignIn}
                              disabled={loading}
                              className="w-full h-10 flex items-center justify-center gap-2.5 px-5 bg-brand-bg hover:bg-brand-border/40 text-brand-text border border-brand-border/60 font-extrabold text-[9px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                              title="Sign in with Redirect Alternative"
                            >
                              <span>{googleMode === 'signin' ? "Direct Redirect Login" : "Direct Redirect Register"}</span>
                            </button>
                            
                            <p className="text-[8.5px] text-center text-brand-text-secondary">
                              * Fallback direct redirect method maps secure cross-origin tokens bypass rules.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'email' && (
                      <motion.div
                        key="email-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="w-full"
                      >
                        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3.5 w-full max-w-sm mx-auto">
                          {showReset ? (
                            <div className="space-y-3">
                              <div className="text-left">
                                <p className="text-[9.5px] font-bold text-brand-text-secondary uppercase tracking-widest">Reset Passphrase</p>
                                <p className="text-[10px] text-brand-text-secondary mt-0.5">We will send a secure passphrase reset link to your email.</p>
                              </div>
                              <div>
                                <input
                                  type="email"
                                  placeholder="Your Registered Email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-brand-bg/70 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/60 focus:outline-none focus:border-brand-secondary/80 focus:ring-1 focus:ring-brand-secondary/25 transition-all"
                                />
                              </div>
                              {resetSent && (
                                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-200 text-xs font-mono text-left">
                                  ✓ Password reset link has been dispatched to your inbox.
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowReset(false);
                                    setLocalError(null);
                                  }}
                                  className="text-[9px] font-black uppercase tracking-wider text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer"
                                >
                                  ← Back to Login
                                </button>
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="bg-brand-secondary hover:bg-brand-secondary/90 text-brand-bg font-extrabold text-[9.5px] uppercase tracking-widest py-2.5 px-4 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                                >
                                  {loading ? "Sending..." : "Dispatch Link"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(!isSignUp || signUpStep === 1) && (
                                <>
                                  {isSignUp && (
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Your Full Name"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-brand-bg/70 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/60 focus:outline-none focus:border-brand-secondary/80 focus:ring-1 focus:ring-brand-secondary/25 transition-all"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <input
                                      type="email"
                                      placeholder="Email Address"
                                      required
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="w-full px-3.5 py-2.5 bg-brand-bg/70 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/60 focus:outline-none focus:border-brand-secondary/80 focus:ring-1 focus:ring-brand-secondary/25 transition-all"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="password"
                                      placeholder="Password Passphrase"
                                      required
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      className="w-full px-3.5 py-2.5 bg-brand-bg/70 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-xl text-xs placeholder-brand-text-secondary/60 focus:outline-none focus:border-brand-secondary/80 focus:ring-1 focus:ring-brand-secondary/25 transition-all"
                                    />
                                  </div>
                                </>
                              )}

                              {isSignUp && signUpStep === 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-3 text-left bg-brand-bg/30 p-3 rounded-xl border border-brand-border/20"
                                >
                                  <div>
                                    <label className="block text-[9.5px] font-black uppercase tracking-wider text-brand-text mb-1.5 flex items-center gap-1">
                                      <GraduationCap size={11} className="text-brand-secondary" />
                                      Academic/Professional Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {[
                                        { id: 'student', title: 'Student', icon: GraduationCap },
                                        { id: 'teacher', title: 'Teacher/Educator', icon: School },
                                        { id: 'researcher', title: 'Researcher', icon: Compass },
                                        { id: 'business_owner', title: 'Professional/Biz', icon: Building2 },
                                      ].map((r) => (
                                        <button
                                          key={r.id}
                                          type="button"
                                          onClick={() => setRole(r.id)}
                                          className={`py-1.5 px-2 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                                            role === r.id
                                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                              : 'bg-brand-bg/50 border-brand-border/30 text-brand-text-secondary hover:text-brand-text hover:border-brand-border/70'
                                          }`}
                                        >
                                          <r.icon size={11} />
                                          <span className="truncate">{r.title}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {['student', 'teacher'].includes(role) && (
                                    <div>
                                      <label className="block text-[9.5px] font-black uppercase tracking-wider text-brand-text mb-1 flex items-center gap-1">
                                        <School size={11} className="text-brand-primary" />
                                        Educational Grade level
                                      </label>
                                      <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-brand-bg/85 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-lg text-xs focus:outline-none focus:border-brand-primary/80 transition-all font-mono"
                                      >
                                        <option value="">-- Choose Division --</option>
                                        <option value="k5">Primary / K-5 Elementary</option>
                                        <option value="middle">Middle School (6-8)</option>
                                        <option value="high">High School (9-12)</option>
                                        <option value="undergrad">Undergraduate (College)</option>
                                        <option value="postgrad">Postgraduate / PH.D</option>
                                      </select>
                                    </div>
                                  )}

                                  <div>
                                    <label className="block text-[9.5px] font-black uppercase tracking-wider text-brand-text mb-1 flex items-center gap-1">
                                      <BookOpen size={11} className="text-brand-secondary" />
                                      Primary Math Interest
                                    </label>
                                    <select
                                      value={primaryInterest}
                                      onChange={(e) => setPrimaryInterest(e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-brand-bg/85 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-lg text-xs focus:outline-none focus:border-brand-secondary/80 transition-all font-mono"
                                    >
                                      <option value="general">Comprehensive & General Math</option>
                                      <option value="bases">Base Conversions & Binary Logic</option>
                                      <option value="calculus">Algebra, Formulae, & Calculus</option>
                                      <option value="statistics">Finance, Statistics, & Graphs</option>
                                      <option value="physics">Physics & Quantum Theory</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[9.5px] font-black uppercase tracking-wider text-brand-text mb-1">
                                      Institution / School Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Cambridge Academy, MIT, Optional"
                                      value={school}
                                      onChange={(e) => setSchool(e.target.value)}
                                      className="w-full px-3 py-1.5 bg-brand-bg/70 border border-brand-border/40 hover:border-brand-border text-brand-text rounded-lg text-xs placeholder-brand-text-secondary/50 focus:outline-none focus:border-brand-primary/80 transition-all"
                                    />
                                  </div>
                                </motion.div>
                              )}

                              <div className="flex items-center justify-between pt-1 text-[8.5px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowReset(true);
                                    setLocalError(null);
                                  }}
                                  className="text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer"
                                >
                                  Forgot Passphrase?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setSignUpStep(1);
                                    setLocalError(null);
                                    setIsVerified(false);
                                  }}
                                  className="text-brand-secondary hover:underline cursor-pointer font-bold"
                                >
                                  {isSignUp ? "Already have an account? Sign In" : "Need an account? Get Started"}
                                </button>
                              </div>

                              {isSignUp && signUpStep === 2 && (
                                <div className="py-1">
                                  <Recapture onVerify={setIsVerified} />
                                </div>
                              )}

                              <div className="flex gap-2 w-full mt-1.5">
                                {isSignUp && signUpStep === 2 && (
                                  <button
                                    type="button"
                                    onClick={() => setSignUpStep(1)}
                                    className="px-3.5 bg-brand-bg hover:bg-brand-border/30 border border-brand-border/50 text-brand-text font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                                  >
                                    <ArrowLeft size={12} />
                                    Back
                                  </button>
                                )}

                                <button
                                  type="submit"
                                  disabled={loading || (isSignUp && signUpStep === 2 && !isVerified)}
                                  className={`flex-1 h-10 flex items-center justify-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all cursor-pointer ${
                                    loading || (isSignUp && signUpStep === 2 && !isVerified) 
                                      ? 'bg-brand-secondary/40 text-brand-bg/60 opacity-50 cursor-not-allowed' 
                                      : 'bg-brand-secondary hover:bg-brand-secondary/90 text-brand-bg'
                                  }`}
                                >
                                  {isSignUp ? (
                                    signUpStep === 1 ? (
                                      <>
                                        <span>Next: Core Details</span>
                                        <ArrowRight size={12} />
                                      </>
                                    ) : (
                                      <span>{loading ? "Establishing System..." : "Establish Secure Account"}</span>
                                    )
                                  ) : (
                                    <span>Access Workspace</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {displayError && (
                  <div className="mt-4 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-200 text-xs text-left w-full max-w-sm mx-auto border-l-4 border-l-red-500 space-y-2.5 font-mono">
                    <p className="font-extrabold flex items-center gap-1.5 text-red-400 text-[9.5px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      System Access Interrupted
                    </p>
                    <p className="text-[9.5px] text-red-300/90 leading-relaxed">
                      {displayError}
                    </p>
                    {signInSimulated && (
                      <div className="pt-2 border-t border-red-500/15">
                        <button
                          type="button"
                          onClick={() => {
                            setLocalError(null);
                            if (clearError) clearError();
                            signInSimulated();
                          }}
                          className="w-full px-3 py-2 bg-brand-secondary hover:bg-brand-secondary/95 text-brand-bg font-black text-[9px] tracking-widest uppercase rounded-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-brand-secondary/15"
                        >
                          <Sparkles size={10} />
                          Unlock Sandbox Workspace
                        </button>
                      </div>
                    )}
                    {activeTab === 'google' && (
                      <p className="text-[8.5px] text-brand-text-secondary leading-normal pt-1 border-t border-red-500/10 font-sans">
                        Tip: Open this application in a <strong>new browser tab</strong> or use the <strong>Email Method</strong> to immediately bypass security restrictions.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
