import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database,
  Compass, 
  Sparkles,
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
    resetPassword,
    loading, 
    user,
    error,
    clearError,
    signInSimulated
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showReset, setShowReset] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
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

    if (isSignUp && !displayName) {
      setLocalError("Please enter a display name.");
      return;
    }

    if (isSignUp && !isVerified) {
      setLocalError("Please complete the Quantum Recapture human verification.");
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
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
                  <p className="text-[10px] text-brand-text-secondary mt-1">Connect using Google SSO or create a secure email keyphrase.</p>
                </div>

                {/* Tab Toggles */}
                <div className="flex bg-brand-bg/60 p-1 rounded-xl border border-brand-border/30 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('google');
                      setLocalError(null);
                    }}
                    className={`flex-1 py-1.5 text-center font-extrabold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                      activeTab === 'google'
                        ? 'bg-brand-surface text-brand-primary shadow-sm border border-brand-border/25'
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    Google SSO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email');
                      setLocalError(null);
                    }}
                    className={`flex-1 py-1.5 text-center font-extrabold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                      activeTab === 'email'
                        ? 'bg-brand-surface text-brand-secondary shadow-sm border border-brand-border/25'
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    Email Method
                  </button>
                </div>

                {activeTab === 'google' ? (
                  <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                    {window.self !== window.top && (
                      <div className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-brand-text-secondary text-[10px] leading-relaxed space-y-1">
                        <p className="font-bold text-brand-primary text-[10.5px]">🛡️ Sandbox Frame Detected</p>
                        <p>
                          Browsers strictly block iframe identity tokens (causing <strong>auth/internal-error</strong>). 
                          To use SSO, click below to open in a clean window:
                        </p>
                        <div className="pt-2">
                          <a 
                            href={window.location.href} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex w-full items-center justify-center gap-1.5 py-2 px-3 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 text-brand-primary rounded-lg text-[9.5px] font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-sm"
                          >
                            🚀 Launch App in New Tab ↗
                          </a>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full h-11 flex items-center justify-center gap-2.5 px-5 bg-white hover:bg-neutral-100 text-black font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Connect with Google ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleRedirectSignIn}
                      disabled={loading}
                      className="w-full h-10 flex items-center justify-center gap-2.5 px-5 bg-brand-bg hover:bg-brand-border/30 text-brand-text border border-brand-border/50 font-extrabold text-[9px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      title="Sign in with Redirect"
                    >
                      <span>Direct Redirect Method</span>
                    </button>

                    {signInSimulated && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocalError(null);
                          if (clearError) clearError();
                          signInSimulated();
                        }}
                        className="w-full h-10 mt-1 flex items-center justify-center gap-2 px-5 bg-brand-secondary/15 hover:bg-brand-secondary/25 border border-brand-secondary/35 text-brand-secondary font-extrabold text-[9.5px] uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-secondary/5 animate-pulse"
                        title="Bypass login constraints in this staging frame"
                      >
                        <Sparkles size={11} />
                        <span>Bypass Login (Sandbox Mode)</span>
                      </button>
                    )}

                    <p className="text-[8.5px] text-center text-brand-text-secondary mt-1">
                      * Redirect acts as a native fallback bypassing browser policies.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 w-full max-w-sm mx-auto">
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
                              setLocalError(null);
                              setIsVerified(false);
                            }}
                            className="text-brand-secondary hover:underline cursor-pointer font-bold"
                          >
                            {isSignUp ? "Already have an account? Sign In" : "Need an account? Get Started"}
                          </button>
                        </div>

                        {isSignUp && (
                          <div className="py-1">
                            <Recapture onVerify={setIsVerified} />
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading || (isSignUp && !isVerified)}
                          className={`w-full h-10 mt-1 flex items-center justify-center font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all cursor-pointer ${loading || (isSignUp && !isVerified) ? 'bg-brand-secondary/40 text-brand-bg/60 opacity-50 cursor-not-allowed' : 'bg-brand-secondary hover:bg-brand-secondary/90 text-brand-bg'}`}
                        >
                          <span>{loading ? "Authenticating Master Signature..." : isSignUp ? "Establish Secure Account" : "Access Workspace"}</span>
                        </button>
                      </div>
                    )}
                  </form>
                )}

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
