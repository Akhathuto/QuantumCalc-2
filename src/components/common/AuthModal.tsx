import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  Sparkles,
  Database,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Compass
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import firebaseConfig from '../../../firebase-applet-config.json';

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
    error: authError, 
    clearError, 
    loading, 
    user
  } = useAuth();

  // Tab State: 'signin' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [copiedProdHost, setCopiedProdHost] = useState(false);

  // Remember Email State
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('qcalc_remember_email') === 'true';
  });

  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('qcalc_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [rememberMe]);

  useEffect(() => {
    const hasConfigError = (err: string | null) => {
      if (!err) return false;
      const lower = err.toLowerCase();
      return lower.includes('auth/internal-error') || 
             lower.includes('unauthorized-domain') || 
             lower.includes('network-request-failed') ||
             lower.includes('database connection') ||
             lower.includes('initialization failed') ||
             lower.includes('permission-denied') ||
             lower.includes('insufficient permissions');
    };

    if (hasConfigError(authError) || hasConfigError(localError)) {
      setShowTroubleshooter(true);
    }
  }, [authError, localError]);

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Reset inputs when tab changes (supports loading remembered email dynamically)
  useEffect(() => {
    setEmail(rememberMe ? localStorage.getItem('qcalc_saved_email') || '' : '');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setLocalError(null);
    clearError();
  }, [activeTab, clearError, rememberMe]);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Awaiting Credentials', color: 'bg-transparent', width: 'w-0', score: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Light Entropy Key ⚡', color: 'bg-rose-500', width: 'w-1/3', score };
    if (score <= 3) return { label: 'Intermediate Scholar Key 🗝️', color: 'bg-amber-500', width: 'w-2/3', score };
    return { label: 'Cryptosecure Quantum Key 🔒', color: 'bg-emerald-500', width: 'w-full', score };
  };

  const strength = getPasswordStrength();
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  const validateForm = () => {
    if (activeTab === 'forgot') {
      if (!email) {
        setLocalError('Please enter your email address to reset password.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLocalError('Please enter a valid email address.');
        return false;
      }
      setLocalError(null);
      return true;
    }

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
        if (rememberMe) {
          localStorage.setItem('qcalc_remember_email', 'true');
          localStorage.setItem('qcalc_saved_email', email);
        } else {
          localStorage.removeItem('qcalc_remember_email');
          localStorage.removeItem('qcalc_saved_email');
        }
        await signInWithEmail(email, password);
      } else if (activeTab === 'signup') {
        await signUpWithEmail(email, password, displayName);
      } else if (activeTab === 'forgot') {
        await resetPassword(email);
        setLocalError("If an account exists, a password reset link has been sent. Check your inbox.");
      }
    } catch (err) {
      // Errors are set and displayed via useAuth context
      console.error("Auth submit failed", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    if (window.self !== window.top) {
      setLocalError("Embedded Preview Block: Google Sign-in popup will be blocked by iframe cross-origin policies. Please open this app in a new tab, or use Email Sign Up.");
    }
    await signInWithGoogle();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop with elegant glass transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-lg transition-opacity duration-300"
          />

          {/* Modal Card Shell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative w-full max-w-2xl bg-brand-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col md:block"
          >
            {/* Elegant Floating Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-bg/50 border border-brand-border hover:bg-brand-bg hover:border-brand-primary/40 text-brand-text-secondary hover:text-brand-text transition-all z-50 backdrop-blur-md"
              title="Close Authentication View"
            >
              <X size={15} />
            </button>

            {/* Background glowing atmospheres matching theme */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-secondary/8 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Split Screen Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] md:divide-x md:divide-brand-border/15">
              
              {/* Left Column: Mascot, interactive Constellation */}
              <div className="hidden md:flex md:col-span-5 p-6 flex-col justify-between relative bg-black/15">
                <div className="space-y-4">
                  
                  {/* Decorative badge matrix */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[8.5px] font-black uppercase tracking-[0.25em] border border-brand-primary/15 shadow-sm">
                      <Compass size={10} className="spin-slow" /> Let's Venture
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-[8px] font-mono tracking-wider uppercase font-extrabold shadow-sm">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Connected</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Greeting Text */}
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-brand-text leading-tight mb-1 font-sans">
                      {activeTab === 'signin' ? "Welcome back! 👋" : activeTab === 'signup' ? "Get Started! 🚀" : "Unlock keys!"}
                    </h2>
                    <p className="text-brand-text-secondary text-[11px] leading-relaxed opacity-80">
                      Save calculations, keep trace logs, and sync constants across devices.
                    </p>
                  </div>

                  {/* SVG Constellation container */}
                  <QuantumConstellation />

                </div>

                {/* Database Synchronization Status */}
                <div className="flex items-center gap-1.5 opacity-45 pt-3 border-t border-brand-border/10">
                  <Database size={10} className="text-brand-text-secondary" />
                  <p className="text-[7px] text-brand-text-secondary uppercase tracking-[0.18em] font-mono font-bold">
                    CLOUD SYNCED SECURED STORAGE
                  </p>
                </div>
              </div>

              {/* Right Column: Beautiful dynamic form element */}
              <div className="col-span-1 md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-center">
                
                {/* Mode Selector Tabs with shared sliding highlight */}
                <div className="flex bg-brand-bg/50 p-1 rounded-2xl border border-brand-border/40 max-w-sm mb-6 self-center md:self-start w-full relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      clearError();
                      setLocalError(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center relative z-10 ${
                      activeTab === 'signin' || activeTab === 'forgot' 
                        ? 'text-brand-bg font-extrabold' 
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    {(activeTab === 'signin' || activeTab === 'forgot') && (
                      <motion.div
                        layoutId="activeTabSelectorGlow"
                        className="absolute inset-0 bg-brand-primary rounded-xl -z-10 shadow-md"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    <LogIn size={11} /> {activeTab === 'forgot' ? 'Recall Pass' : 'Log In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      clearError();
                      setLocalError(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center relative z-10 ${
                      activeTab === 'signup' 
                        ? 'text-brand-bg font-extrabold' 
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    {activeTab === 'signup' && (
                      <motion.div
                        layoutId="activeTabSelectorGlow"
                        className="absolute inset-0 bg-brand-primary rounded-xl -z-10 shadow-md"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    <UserPlus size={11} /> Sign Up
                  </button>
                </div>

                {/* Friendly Header for Mobile Sizes */}
                <div className="md:hidden text-center mb-5 bg-brand-bg/10 p-3 rounded-2xl border border-brand-border/20">
                  <h3 className="text-lg font-black text-brand-primary tracking-tight">
                    {activeTab === 'signin' ? 'Welcome Back!' : activeTab === 'signup' ? 'Get Registered!' : 'Reset Password'}
                  </h3>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5">
                    {activeTab === 'signin' ? 'Unlock your equations & notes securely.' : activeTab === 'signup' ? 'Ready to formulate the future with peers.' : 'Retrieve your forgotten scholar key.'}
                  </p>
                </div>

                {/* Form Transition Block */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      
                      {/* Name Field (Sign Up Only) */}
                      {activeTab === 'signup' && (
                        <div className="space-y-1" id="field_displayName_container">
                          <label htmlFor="auth_displayName" className="block text-[8.5px] font-mono text-brand-text-secondary uppercase tracking-widest pl-1">
                            Scholar / User Name *
                          </label>
                          <div className="relative group/field">
                            {/* Colorful drop-glowing blur outline ring on focus */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-indigo-500 rounded-xl opacity-0 group-focus-within/field:opacity-20 group-hover/field:opacity-5 transition-opacity duration-300 blur-sm pointer-events-none" />
                            
                            <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/60 group-focus-within/field:text-brand-primary pointer-events-none transition-colors duration-200">
                              <User size={15} />
                            </div>
                            <input
                              type="text"
                              id="auth_displayName"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="e.g. Marie Curie"
                              className="w-full bg-brand-bg/50 border border-brand-border/60 hover:border-brand-primary/45 focus:border-brand-primary focus:bg-brand-bg/80 text-xs text-brand-text rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-brand-text-secondary/30 font-medium"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Field (All Tabs) */}
                      <div className="space-y-1" id="field_email_container">
                        <label htmlFor="auth_email" className="block text-[8.5px] font-mono text-brand-text-secondary uppercase tracking-widest pl-1">
                          Email Address *
                        </label>
                        <div className="relative group/field">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-indigo-500 rounded-xl opacity-0 group-focus-within/field:opacity-20 group-hover/field:opacity-5 transition-opacity duration-300 blur-sm pointer-events-none" />

                          <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/60 group-focus-within/field:text-brand-primary pointer-events-none transition-colors duration-200">
                            <Mail size={15} />
                          </div>
                          <input
                            type="email"
                            id="auth_email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. scholar@university.edu"
                            className="w-full bg-brand-bg/50 border border-brand-border/60 hover:border-brand-primary/45 focus:border-brand-primary focus:bg-brand-bg/80 text-xs text-brand-text rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-brand-text-secondary/30 font-medium"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      {activeTab !== 'forgot' && (
                        <div className="space-y-1" id="field_password_container">
                          <label htmlFor="auth_password" className="block text-[8.5px] font-mono text-brand-text-secondary uppercase tracking-widest pl-1">
                            Password *
                          </label>
                          <div className="relative group/field">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-indigo-500 rounded-xl opacity-0 group-focus-within/field:opacity-20 group-hover/field:opacity-5 transition-opacity duration-300 blur-sm pointer-events-none" />

                            <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/60 group-focus-within/field:text-brand-primary pointer-events-none transition-colors duration-200">
                              <Lock size={15} />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="auth_password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={activeTab === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                              className="w-full bg-brand-bg/50 border border-brand-border/60 hover:border-brand-primary/45 focus:border-brand-primary focus:bg-brand-bg/80 text-xs text-brand-text rounded-xl py-3 pl-11 pr-11 outline-none transition-all placeholder:text-brand-text-secondary/30 font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-4 flex items-center text-brand-text-secondary/60 hover:text-brand-primary transition-colors duration-200"
                            >
                              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>

                          {/* Remember Me Toggle and Forget Password Link (Under input) */}
                          {activeTab === 'signin' && (
                            <div className="flex justify-between items-center px-1 pt-1">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none group/remember">
                                <input
                                  type="checkbox"
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  className="rounded border-brand-border text-brand-primary bg-brand-bg/55 focus:ring-brand-primary focus:ring-1 cursor-pointer h-3.5 w-3.5 transition-all text-xs"
                                />
                                <span className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-wider group-hover/remember:text-brand-text transition-colors duration-200">
                                  Remember Email
                                </span>
                              </label>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setActiveTab('forgot');
                                  clearError();
                                  setLocalError(null);
                                }} 
                                className="text-[9px] text-brand-primary hover:text-white uppercase font-black tracking-wider font-mono transition-colors duration-200"
                              >
                                Forgot Password?
                              </button>
                            </div>
                          )}

                          {/* Entropy and complexity feedback (Sign Up Only) */}
                          {activeTab === 'signup' && password && (
                            <div className="space-y-2 pt-1 pb-1">
                              {/* Entropy strip bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[8.5px] font-mono text-brand-text-secondary bg-brand-bg/30 px-1.5 py-0.5 rounded">
                                  <span>Entropy Security Score:</span>
                                  <span className={`font-bold uppercase tracking-wider ${strength.score >= 4 ? 'text-emerald-400' : strength.score >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                                    {strength.label}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-brand-bg/50 rounded-full overflow-hidden border border-brand-border/15 p-[1px]">
                                  <div className={`h-full transition-all duration-300 rounded-full ${strength.color} ${strength.width}`} />
                                </div>
                              </div>
                              
                              {/* Requirement Checklist */}
                              <div className="grid grid-cols-2 gap-1.5 bg-brand-bg/40 p-2.5 rounded-xl border border-brand-border/20">
                                {[
                                  { label: '6+ Characters', met: password.length >= 6 },
                                  { label: 'Upper Case', met: /[A-Z]/.test(password) },
                                  { label: 'Numeric (0-9)', met: /[0-9]/.test(password) },
                                  { label: 'Symbol ($, @, %)', met: /[^A-Za-z0-9]/.test(password) }
                                ].map((rule, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 select-none text-[8.5px] font-semibold text-brand-text-secondary">
                                    <motion.span 
                                      animate={{ scale: rule.met ? [1, 1.25, 1] : 1 }}
                                      transition={{ duration: 0.18 }}
                                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                                        rule.met 
                                          ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-extrabold' 
                                          : 'bg-brand-bg/25 border-brand-border/30 text-brand-text-secondary/25'
                                      }`}
                                    >
                                      {rule.met ? '✓' : '•'}
                                    </motion.span>
                                    <span className={rule.met ? 'text-emerald-400' : 'opacity-70'}>
                                      {rule.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Confirm Password Field (Sign Up Only) */}
                      {activeTab === 'signup' && (
                        <div className="space-y-1" id="field_confirm_container">
                          <label htmlFor="auth_confirmPassword" className="block text-[8.5px] font-mono text-brand-text-secondary uppercase tracking-widest pl-1">
                            Confirm Password *
                          </label>
                          <div className="relative group/field">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-indigo-500 rounded-xl opacity-0 group-focus-within/field:opacity-20 group-hover/field:opacity-5 transition-opacity duration-300 blur-sm pointer-events-none" />

                            <div className="absolute inset-y-0 left-4 flex items-center text-brand-text-secondary/60 group-focus-within/field:text-brand-primary pointer-events-none transition-colors duration-200">
                              <Lock size={15} />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="auth_confirmPassword"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              className="w-full bg-brand-bg/50 border border-brand-border/60 hover:border-brand-primary/45 focus:border-brand-primary focus:bg-brand-bg/80 text-xs text-brand-text rounded-xl py-3 pl-11 pr-11 outline-none transition-all placeholder:text-brand-text-secondary/30 font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-4 flex items-center text-brand-text-secondary/60 hover:text-brand-primary transition-colors duration-200"
                            >
                              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {confirmPassword && (
                            <div className="flex items-center gap-1.5 text-[8.5px] font-mono mt-0.5 px-1">
                              {doPasswordsMatch ? (
                                <span className="text-emerald-400 flex items-center gap-1">✓ Credentials match seamlessly</span>
                              ) : (
                                <span className="text-rose-400 flex items-center gap-1">✗ Keys must correspond perfectly</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Unified Error Display */}
                      {(localError || authError) && (
                        <div className="space-y-2 mt-1.5" id="error_dialog">
                          <motion.div 
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 rounded-xl bg-red-400/10 border border-red-500/20 text-red-400 text-[10.5px] font-bold flex flex-col gap-2 shadow-inner"
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                              <div className="flex-1 text-red-400 leading-normal">
                                <p>{localError || authError}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setLocalError(null);
                                  clearError();
                                }}
                                className="text-[8.5px] font-black text-red-400 hover:text-white uppercase tracking-wider shrink-0 transition-colors"
                              >
                                [Dismiss]
                              </button>
                            </div>

                            {/* Prompt expansion to show the diagnostics */}
                            <div className="border-t border-red-500/10 pt-2 flex items-center justify-between">
                              <span className="text-[8.5px] font-mono text-rose-400/80 uppercase tracking-wider">Troubleshooting Wizard Active</span>
                              <button
                                type="button"
                                onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                                className="text-[9px] font-black uppercase text-brand-primary hover:text-white tracking-widest flex items-center gap-1.5 transition-colors"
                              >
                                {showTroubleshooter ? (
                                  <>Hide diagnostics <ChevronUp size={11} /></>
                                ) : (
                                  <>Show diagnostics <ChevronDown size={11} /></>
                                )}
                              </button>
                            </div>
                          </motion.div>

                          {/* Diagnostic System Recovery Accordion */}
                          <AnimatePresence>
                            {showTroubleshooter && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-[#0a0d18]/95 border border-brand-primary/20 rounded-xl p-3.5 space-y-3 text-left shadow-lg"
                              >
                                <div className="flex items-center gap-1.5 border-b border-brand-border/20 pb-1.5">
                                  <HelpCircle size={12} className="text-brand-primary animate-pulse" />
                                  <span className="text-[9px] font-mono text-brand-text font-black uppercase tracking-widest">Scholar Rescue Terminal</span>
                                </div>

                                <div className="space-y-3 text-[9px] text-brand-text-secondary leading-normal font-sans">
                                  {/* Step A: Isolated Tab */}
                                  <div className="space-y-1 bg-brand-bg/40 p-2 rounded-lg border border-brand-border/20">
                                    <div className="flex items-center gap-1 font-bold text-brand-text uppercase font-sans">
                                      <span className="text-brand-primary">1.</span> Chrome Iframe Cookieless Sandbox Block
                                    </div>
                                    <p className="opacity-80">
                                      Embedded builders fully block cookies/Popups. Launching in an isolated, top-level browser tab resolves 99% of Google & Firestore authentication blocks immediately.
                                    </p>
                                    <div className="pt-0.5">
                                      <a
                                        href={window.location.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 rounded-md text-brand-primary hover:text-white font-bold transition-all uppercase tracking-wider text-[8.5px]"
                                      >
                                        Launch Isolated Window <ExternalLink size={10} />
                                      </a>
                                    </div>
                                  </div>

                                  {/* Step B: Whitelist Hostnames */}
                                  <div className="space-y-1.5 bg-brand-bg/40 p-2 rounded-lg border border-brand-border/20 font-sans">
                                    <div className="flex items-center gap-1 font-bold text-brand-text uppercase">
                                      <span className="text-brand-primary">2.</span> Authorized Domains Check
                                    </div>
                                    <p className="opacity-80">
                                      Ensure both domains exist under Firebase console authentication settings:
                                    </p>
                                    
                                    <div className="space-y-1">
                                      {/* Current active Host */}
                                      <div className="flex flex-col gap-0.5 bg-black/45 p-1.5 rounded border border-brand-border/10">
                                        <span className="text-[7.5px] font-mono text-brand-text-secondary uppercase">Current Environment Domain:</span>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="font-mono text-[8.5px] text-brand-primary truncate">{window.location.hostname}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(window.location.hostname);
                                              setCopiedHost(true);
                                              setTimeout(() => setCopiedHost(false), 2000);
                                            }}
                                            className="p-1 hover:bg-brand-bg rounded border border-brand-border/30 text-brand-text-secondary hover:text-brand-primary transition-all cursor-pointer shrink-0"
                                            title="Copy active domain"
                                          >
                                            {copiedHost ? <Check size={10} className="text-emerald-400 font-bold" /> : <Copy size={10} />}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Prod Dome */}
                                      <div className="flex flex-col gap-0.5 bg-black/45 p-1.5 rounded border border-brand-border/10">
                                        <span className="text-[7.5px] font-mono text-brand-text-secondary uppercase">Vercel Production Domain:</span>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="font-mono text-[8.5px] text-brand-primary truncate">qcalc.edgtec.co.za</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText('qcalc.edgtec.co.za');
                                              setCopiedProdHost(true);
                                              setTimeout(() => setCopiedProdHost(false), 2000);
                                            }}
                                            className="p-1 hover:bg-brand-bg rounded border border-brand-border/30 text-brand-text-secondary hover:text-brand-primary transition-all cursor-pointer shrink-0"
                                            title="Copy production domain"
                                          >
                                            {copiedProdHost ? <Check size={10} className="text-emerald-400 font-bold" /> : <Copy size={10} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Step C: Toggle Providers */}
                                  <div className="space-y-1 bg-brand-bg/40 p-2 rounded-lg border border-brand-border/20">
                                    <div className="flex items-center gap-1 font-bold text-brand-text uppercase">
                                      <span className="text-brand-primary">3.</span> Providers Active Check
                                    </div>
                                    <p className="opacity-80">
                                      Verify "Email/Password" and "Google" provider toggles are set to Enabled inside original console settings:
                                    </p>
                                    <div className="pt-0.5">
                                      <a
                                        href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[8px] font-bold uppercase text-brand-primary hover:text-white transition-all hover:underline"
                                      >
                                        Open Web Console <ExternalLink size={9} />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Primary Submission Controls */}
                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-6 bg-brand-primary hover:bg-brand-primary/90 text-brand-bg font-black text-[10.5px] uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : activeTab === 'signin' ? (
                            <>Sign In Authenticated <ArrowRight size={13} /></>
                          ) : activeTab === 'signup' ? (
                            <>Complete Scholar Registration <ArrowRight size={13} /></>
                          ) : (
                            <>Dispatch Recovery Link <ArrowRight size={13} /></>
                          )}
                        </button>

                        {/* Back-out option for forgot path */}
                        {activeTab === 'forgot' && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setActiveTab('signin');
                              clearError();
                              setLocalError(null);
                            }} 
                            className="w-full mt-2.5 py-2 text-[9px] text-brand-text-secondary hover:text-white uppercase font-bold tracking-widest transition-colors"
                          >
                            Return to Sign-In
                          </button>
                        )}
                      </div>
                      



                        






                    </form>
                  </motion.div>
                </AnimatePresence>

                {/* Social Authentication Split */}
                <div className="my-5 flex items-center justify-center gap-2 px-2">
                  <div className="h-px bg-brand-border/20 flex-1" />
                  <span className="text-[8px] font-mono text-brand-text-secondary uppercase tracking-[0.18em]">Sovereign Identity Protection</span>
                  <div className="h-px bg-brand-border/20 flex-1" />
                </div>

                <div className="flex flex-col gap-2">
                  {/* Google Authenticate Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-5 bg-white hover:bg-neutral-100 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 select-none" viewBox="0 0 24 24">
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
                    <span>Connect with Google ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                       if (window.self !== window.top) {
                         setLocalError("Google Redirect Sign-In is blocked in embedded contexts. Open this application in a secure standalone tab using the top-right console shortcut window, or log in with password credentials directly.");
                       } else {
                         signInWithGoogle(true);
                       }
                    }}
                    disabled={loading}
                    className="w-full text-center text-[8.5px] text-brand-text-secondary hover:underline hover:text-brand-primary transition-colors py-1 font-mono uppercase tracking-wider"
                  >
                    Google Redirect Fallback (popup blocker bypass)
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
