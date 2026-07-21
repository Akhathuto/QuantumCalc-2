import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthProvider';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Shield, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    signUpWithEmail, 
    signInWithEmail, 
    logout 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (signUpWithEmail) {
          await signUpWithEmail(email, password, username);
          setSuccessMsg('Account registered successfully!');
          setTimeout(() => onClose(), 1500);
        }
      } else {
        if (signInWithEmail) {
          await signInWithEmail(email, password);
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-overlay">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-md bg-brand-surface/90 border border-brand-border/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl z-10 max-h-[90vh] flex flex-col"
      >
        {/* Top bar */}
        <div className="p-6 border-b border-brand-border/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-text text-base leading-tight">QuantumCalc Account</h3>
              <p className="text-xs text-brand-text-secondary">Sign up or log in to sync your data</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-brand-bg text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
              
              {(errorMsg.includes('firebase-app-check-token-is-invalid') ||
                errorMsg.includes('AppCheck') ||
                errorMsg.includes('app-check') ||
                errorMsg.includes('App Check') ||
                errorMsg.includes('token-is-invalid') ||
                errorMsg.includes('AppCheck') ||
                errorMsg.includes('app_check')) && (
                <div className="p-3.5 bg-brand-primary/10 border border-brand-primary/25 rounded-2xl space-y-2.5 text-xs animate-fade-in">
                  <p className="text-brand-text font-medium leading-relaxed">
                    🔒 <strong className="text-brand-primary">Sandbox Environment Notice</strong>: Standard security signatures are restricted within this sandboxed preview iframe. Click below to bypass verification and activate dynamic offline sandbox mode instantly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem('offline_mode', 'true');
                        localStorage.setItem('enable_app_check', 'false');
                        setSuccessMsg('Sandbox successfully unlocked! Refreshing workspace...');
                        setErrorMsg(null);
                        setTimeout(() => {
                          window.location.reload();
                        }, 1200);
                      } catch (e) {
                        console.error('Failed to unlock sandbox:', e);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-primary text-brand-bg font-black uppercase tracking-wider text-[10px] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-brand-primary/10"
                  >
                    🔓 Unlock Sandbox Workspace (Enable Offline Mode)
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-text">
                  {mode === 'signup' ? 'Create Account' : 'Log In'}
                </h4>
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetMessages(); }}
                  className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Username</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 pl-9 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 pl-9 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 pl-9 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-primary text-brand-bg text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" />
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus size={14} />
                    <span>Create Account</span>
                  </>
                ) : (
                  <>
                    <LogIn size={14} />
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        {user && (
          <div className="p-4 bg-brand-bg/60 border-t border-brand-border/30 flex items-center justify-between shrink-0 text-xs px-6">
            <div className="flex items-center gap-2 min-w-0">
              <img src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} alt="" className="w-6 h-6 rounded-full object-cover border border-brand-primary/20" />
              <p className="text-brand-text truncate font-bold">Logged in as {user.displayName}</p>
            </div>
            <button
              onClick={() => { logout(); setSuccessMsg('Logged out successfully.'); }}
              className="text-red-400 font-black uppercase tracking-wider hover:underline cursor-pointer text-[10px]"
            >
              Sign out
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthModal;
