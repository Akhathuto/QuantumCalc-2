import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  AlertCircle, 
  Trash2, 
  Chrome, 
  HelpCircle,
  Sparkles,
  School,
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', label: 'Elena' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', label: 'David' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', label: 'Sarah' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', label: 'Marcus' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', label: 'Chloe' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80', label: 'James' },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    localAccounts = [], 
    signUpLocal, 
    signInLocal, 
    deleteLocalAccount, 
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    logout 
  } = useAuth();

  const [authType, setAuthType] = useState<'local' | 'firebase'>('local');
  const [localMode, setLocalMode] = useState<'signin' | 'signup'>('signin');
  const [firebaseMode, setFirebaseMode] = useState<'signin' | 'signup'>('signin');

  // Input Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');
  const [grade, setGrade] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLocalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (localMode === 'signup') {
        if (!username || !email || !password) {
          throw new Error('Please fill out all required fields.');
        }
        if (password.length < 4) {
          throw new Error('Password must be at least 4 characters long.');
        }
        if (signUpLocal) {
          await signUpLocal(username, email, password, role, grade, schoolName, selectedAvatar);
          setSuccessMsg(`Welcome, ${username}! Local profile successfully registered.`);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        if (!email || !password) {
          throw new Error('Please provide email and password.');
        }
        if (signInLocal) {
          await signInLocal(email, password);
          setSuccessMsg('Successfully connected locally!');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (firebaseMode === 'signup') {
        if (signUpWithEmail) {
          await signUpWithEmail(email, password, username);
          setSuccessMsg('Cloud account registered! Check your email to verify.');
          setTimeout(() => onClose(), 1500);
        }
      } else {
        if (signInWithEmail) {
          await signInWithEmail(email, password);
          setSuccessMsg('Cloud account logged in!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Cloud authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (signInWithGoogle) {
        await signInWithGoogle();
        setSuccessMsg('Signed in with Google!');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    }
  };

  const handleQuickSwitch = async (acc: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (signInLocal) {
        await signInLocal(acc.email, acc.password);
        setSuccessMsg(`Switched to: ${acc.displayName}`);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch profile.');
    }
  };

  const handleDeleteLocal = (e: React.MouseEvent, accEmail: string) => {
    e.stopPropagation();
    if (window.confirm(`Remove local profile for ${accEmail}? This deletes custom user statistics.`)) {
      if (deleteLocalAccount) {
        deleteLocalAccount(accEmail);
        setSuccessMsg('Profile removed.');
      }
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
        className="relative w-full max-w-2xl bg-brand-surface/90 border border-brand-border/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl z-10 max-h-[90vh] flex flex-col"
      >
        {/* Top bar */}
        <div className="p-6 border-b border-brand-border/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-text text-base leading-tight">QuantumCalc Authentication</h3>
              <p className="text-xs text-brand-text-secondary">Switch, sign up, or login to your profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-brand-bg text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex gap-2 shrink-0 bg-brand-surface/40">
          <button
            onClick={() => { setAuthType('local'); resetMessages(); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              authType === 'local'
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-black shadow-inner'
                : 'bg-transparent border-transparent text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Offline Sandbox (Local User)
          </button>
          <button
            onClick={() => { setAuthType('firebase'); resetMessages(); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              authType === 'firebase'
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-black shadow-inner'
                : 'bg-transparent border-transparent text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Cloud Portal (Sync / Backup)
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authType === 'local' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Local Profiles Column */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-primary mb-3">Saved on this device</h4>
                  
                  {localAccounts.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {localAccounts.map((acc) => {
                        const isActive = user?.email === acc.email;
                        return (
                          <div
                            key={acc.email}
                            onClick={() => handleQuickSwitch(acc)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                              isActive
                                ? 'bg-brand-primary/10 border-brand-primary/30'
                                : 'bg-brand-surface/60 border-brand-border/30 hover:border-brand-primary/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={acc.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-brand-primary/20" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-brand-text truncate leading-none mb-1">{acc.displayName}</h5>
                                <p className="text-[10px] text-brand-text-secondary truncate">{acc.role}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteLocal(e, acc.email)}
                              className="p-1 text-brand-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete profile"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center border border-dashed border-brand-border/40 rounded-xl">
                      <p className="text-[11px] text-brand-text-secondary">No sandbox profiles here yet.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={14} className="text-brand-primary mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-brand-text">Sandbox Mode</h5>
                      <p className="text-[11px] text-brand-text-secondary leading-normal mt-0.5">
                        Sandbox accounts are kept offline inside your browser's private local state. Perfect for fast testing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <form onSubmit={handleLocalAuth} className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-text">
                    {localMode === 'signup' ? 'Create local profile' : 'Log in to local account'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setLocalMode(localMode === 'signin' ? 'signup' : 'signin'); resetMessages(); }}
                    className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    {localMode === 'signup' ? 'Use existing local account' : 'Register brand new profile'}
                  </button>
                </div>

                {localMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Username</label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. Marie Curie"
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
                      placeholder="student@sandbox.org"
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

                {localMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Role</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 px-3 text-brand-text outline-none text-xs cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Educator</option>
                          <option value="developer">Developer</option>
                          <option value="researcher">Researcher</option>
                          <option value="financial_analyst">Analyst</option>
                        </select>
                      </div>

                      {['student', 'teacher'].includes(role) && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Grade</label>
                          <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="e.g. 11th Grade"
                            className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 px-3 text-brand-text outline-none text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">
                        {['student', 'teacher'].includes(role) ? 'School / College' : 'Organization'}
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Science Academy"
                        className="w-full bg-brand-bg border border-brand-border/60 rounded-xl py-2.5 px-3 text-brand-text outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Choose Avatar</label>
                      <div className="grid grid-cols-6 gap-2">
                        {AVATARS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.url)}
                            className={`relative p-0.5 rounded-full overflow-hidden transition-all shrink-0 aspect-square cursor-pointer ${
                              selectedAvatar === av.url ? 'ring-2 ring-brand-primary' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={av.url} alt="" className="w-full h-full rounded-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-primary text-brand-bg text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" />
                  ) : localMode === 'signup' ? (
                    <>
                      <UserPlus size={14} />
                      <span>Register Sandbox User</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>Connect Sandbox Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Sign In Banner */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-[0.99] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Chrome size={16} className="text-[#4285F4]" />
                  <span>Continue with Google Cloud Sync</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brand-border/30"></div>
                <span className="flex-shrink mx-4 text-[10px] text-brand-text-secondary font-black uppercase tracking-widest">or login with email</span>
                <div className="flex-grow border-t border-brand-border/30"></div>
              </div>

              {/* Standard Email Auth */}
              <form onSubmit={handleFirebaseAuth} className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-text">
                    {firebaseMode === 'signup' ? 'Cloud Registration' : 'Cloud Login'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setFirebaseMode(firebaseMode === 'signin' ? 'signup' : 'signin'); resetMessages(); }}
                    className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    {firebaseMode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </div>

                {firebaseMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-brand-text-secondary uppercase ml-1">Username</label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Marie Curie"
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
                      placeholder="student@cloud.com"
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
                  ) : firebaseMode === 'signup' ? (
                    <>
                      <UserPlus size={14} />
                      <span>Create Cloud Account</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>Secure Log In</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
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
