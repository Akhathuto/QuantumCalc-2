import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  Trash2, 
  ArrowLeft,
  GraduationCap,
  School,
  Briefcase
} from 'lucide-react';

const AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', label: 'Scholar Elena' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', label: 'Researcher David' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', label: 'Educator Sarah' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', label: 'Analyst Marcus' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', label: 'Scientist Chloe' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80', label: 'Engineer James' },
];

interface LocalProfilePageProps {
  onBackToTools: () => void;
}

export const LocalProfilePage: React.FC<LocalProfilePageProps> = ({ onBackToTools }) => {
  const { 
    user, 
    userData, 
    localAccounts = [], 
    signUpLocal, 
    signInLocal, 
    deleteLocalAccount, 
    logout 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
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

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!email || !password || !username) {
          throw new Error("Please fill out all required fields.");
        }
        if (password.length < 4) {
          throw new Error("Local password must be at least 4 characters.");
        }
        if (signUpLocal) {
          await signUpLocal(username, email, password, role, grade, schoolName, selectedAvatar);
          setSuccessMsg(`Welcome, ${username}! Your local profile has been created successfully.`);
          setTimeout(() => {
            onBackToTools();
          }, 1500);
        }
      } else {
        if (!email || !password) {
          throw new Error("Please enter your email and password.");
        }
        if (signInLocal) {
          await signInLocal(email, password);
          setSuccessMsg("Logged in successfully!");
          setTimeout(() => {
            onBackToTools();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (acc: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      if (signInLocal) {
        await signInLocal(acc.email, acc.password);
        setSuccessMsg(`Switched to profile: ${acc.displayName}`);
        setTimeout(() => {
          onBackToTools();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Quick switch failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = (e: React.MouseEvent, accEmail: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the local profile for ${accEmail}? All local configurations for this profile will be removed.`)) {
      if (deleteLocalAccount) {
        deleteLocalAccount(accEmail);
        setSuccessMsg("Local account removed.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="local-auth-page">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBackToTools}
          className="flex items-center gap-2 text-sm font-bold text-brand-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
          Sandbox Mode Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Information & Quick-switch list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-surface/40 p-6 rounded-3xl border border-brand-border/40 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-brand-text mb-3 flex items-center gap-2">
              <Shield size={20} className="text-brand-primary" />
              Local Device Accounts
            </h3>
            <p className="text-sm text-brand-text-secondary font-light leading-relaxed mb-6">
              Create offline-first academic profiles that run inside your browser's private sandboxed cache. Securely separate your settings, math goals, and calculation histories.
            </p>

            {localAccounts.length > 0 ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Profiles on this device
                </label>
                {localAccounts.map((acc) => {
                  const isActive = user?.email === acc.email;
                  return (
                    <div 
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-brand-primary/10 border-brand-primary/40 shadow-inner' 
                          : 'bg-brand-bg/50 border-brand-border/40 hover:border-brand-primary/30 hover:bg-brand-surface/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={acc.avatar} 
                          alt={acc.displayName} 
                          className="w-10 h-10 rounded-full object-cover border border-brand-primary/20 shrink-0" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-brand-text truncate leading-tight">
                            {acc.displayName}
                          </h4>
                          <p className="text-xs text-brand-text-secondary font-mono truncate">
                            {acc.role} • {acc.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isActive && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Active
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteAccount(e, acc.email)}
                          className="p-1.5 rounded-lg text-brand-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-brand-bg/40 border border-dashed border-brand-border/60 text-center">
                <UserIcon size={24} className="mx-auto text-brand-text-secondary mb-2 opacity-50" />
                <p className="text-xs text-brand-text-secondary">No local accounts stored on this device. Create one using the form!</p>
              </div>
            )}
          </div>

          {user && (
            <div className="bg-brand-surface/40 p-6 rounded-3xl border border-brand-border/40 backdrop-blur-sm flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[9.5px] font-black text-brand-primary uppercase tracking-widest">Logged In As</span>
                <h4 className="font-bold text-brand-text truncate">{user.displayName}</h4>
                <p className="text-xs text-brand-text-secondary truncate">{user.email}</p>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setSuccessMsg("Logged out.");
                }}
                className="px-4 py-2 bg-brand-surface border border-brand-border hover:border-red-500/30 hover:bg-red-500/5 text-brand-text hover:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Sign In / Sign Up Form */}
        <div className="lg:col-span-7">
          <div className="bg-brand-surface/40 p-8 rounded-3xl border border-brand-border/50 shadow-xl backdrop-blur-md relative overflow-hidden">
            {/* Top background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-3 border border-brand-primary/20">
                {mode === 'signup' ? <UserPlus size={12} /> : <LogIn size={12} />}
                <span>{mode === 'signup' ? 'Create Local Identity' : 'Local Authentication'}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
                {mode === 'signup' ? 'Sign Up Locally' : 'Log In locally'}
              </h2>
              <p className="text-sm text-brand-text-secondary font-light mt-1">
                {mode === 'signup' 
                  ? 'Set up a personalized, self-contained educational profile' 
                  : 'Enter your credentials to restore your local sandbox workspace'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                <Check size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLocalSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Username</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Marie Curie"
                      required
                      className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-12 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@quantumcalc.edu"
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-12 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-12 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Identity Role</label>
                      <div className="relative">
                        <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-11 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Educator / Teacher</option>
                          <option value="developer">Developer</option>
                          <option value="researcher">Researcher</option>
                          <option value="financial_analyst">Financial Analyst</option>
                        </select>
                      </div>
                    </div>

                    {['student', 'teacher'].includes(role) && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Grade / Level</label>
                        <div className="relative">
                          <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                          <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="e.g. 11th Grade"
                            className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-11 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">
                      {['student', 'teacher'].includes(role) ? 'School / Institution' : 'Company / Organization'}
                    </label>
                    <div className="relative">
                      {['student', 'teacher'].includes(role) ? (
                        <School size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                      ) : (
                        <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary opacity-60" />
                      )}
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder={['student', 'teacher'].includes(role) ? 'Quantum Tech Academy' : 'Stark Industries'}
                        className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl py-4 pl-11 pr-4 text-brand-text outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider ml-1">Select Avatar</label>
                    <div className="grid grid-cols-6 gap-3">
                      {AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.url)}
                          className={`relative p-0.5 rounded-full overflow-hidden transition-all duration-200 cursor-pointer ${
                            selectedAvatar === av.url 
                              ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-brand-bg scale-105' 
                              : 'opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full rounded-full object-cover aspect-square" />
                          {selectedAvatar === av.url && (
                            <div className="absolute inset-0 bg-brand-primary/10 rounded-full flex items-center justify-center">
                              <div className="bg-brand-primary text-brand-bg rounded-full p-0.5">
                                <Check size={8} className="stroke-[3]" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-primary text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-primary/20 active:scale-[0.99] transition-all disabled:opacity-50 text-sm tracking-wide mt-6 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" />
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account & Log In</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Log In to Workspace</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-brand-border/30 text-center">
              <button
                onClick={handleToggleMode}
                className="text-xs text-brand-text-secondary hover:text-brand-primary transition-all cursor-pointer font-medium"
              >
                {mode === 'signup' 
                  ? "Already have a local profile? Log in here" 
                  : "New to sandbox? Create a custom local profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
