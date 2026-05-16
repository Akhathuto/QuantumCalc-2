
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  User as UserIcon, 
  Building2, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  School,
  HardHat,
  Braces,
  RefreshCw,
  ShieldCheck,
  Cloud
} from 'lucide-react';

import { googleDriveService } from '../services/googleDriveService';

const roles = [
  { id: 'student', title: 'Student', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'teacher', title: 'Teacher', icon: School, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'business_owner', title: 'Business Owner', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'employee', title: 'Employee', icon: HardHat, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'normal_user', title: 'Personal Use', icon: UserIcon, color: 'text-gray-400', bg: 'bg-gray-400/10' },
];

const ProfileOnboarding: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setRole(roleId);
    if (['student', 'teacher'].includes(roleId)) {
      setStep(2);
    } else {
      setStep(4); // Skip to AI step
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const profileData: any = {
        role,
        onboarded: true,
      };

      if (apiKey.trim()) {
        import('../services/geminiService').then(m => m.secureStorage.setItem('CUSTOM_GEMINI_API_KEY', apiKey.trim()));
      }
      
      if (['student', 'teacher'].includes(role)) {
        profileData.grade = grade || null;
      }
      
      profileData.school = school || null;

      // 1. Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, profileData);

      // 2. Sync to Google Drive if access token is available
      if (accessToken) {
        try {
          await googleDriveService.saveProfile(accessToken, profileData);
          console.log("Profile synced to Google Drive successfully.");
        } catch (driveError: any) {
          if (driveError.message?.includes('401') || driveError.message?.includes('invalid_grant')) {
              console.warn("Drive Access Expired. Profile was saved locally but not synced to Drive.");
          } else {
              console.warn("Profile updated locally. Drive sync failed.", driveError);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-brand-primary/10 text-brand-primary mb-2">
                {user?.photoURL ? (
                   <img src={user.photoURL} alt="Avatar" className="w-16 h-16 rounded-2xl shadow-lg border border-brand-primary/20" />
                ) : (
                   <Braces size={32} />
                )}
              </div>
              <h2 className="text-4xl font-black tracking-tight text-brand-text italic">Welcome, {user?.displayName?.split(' ')[0] || 'Explorer'}</h2>
              <p className="text-brand-text-secondary font-light text-sm max-w-sm mx-auto">
                <span className="flex items-center justify-center gap-1.5 mb-2 text-emerald-500 font-bold">
                  <ShieldCheck size={16} /> Authenticated Securely
                </span>
                Select your primary focus within the workspace to initialize algorithms.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`group relative flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-500 text-left active:scale-95 ${
                      role === r.id 
                        ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10' 
                        : 'bg-brand-surface/40 border-brand-border/60 hover:border-brand-primary/40 hover:bg-brand-surface/60'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${r.bg} ${r.color}`}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <span className="block font-black text-brand-text leading-tight tracking-tight uppercase text-xs mb-1">{r.title}</span>
                      <span className="block text-[10px] text-brand-text-secondary font-light">Customized toolkit</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-2">
                <School size={32} />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-brand-text italic">Context Details</h2>
              <p className="text-brand-text-secondary font-light">Aligning the engines to your specific environment.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Grade or Technical Level</label>
                <input
                  type="text"
                  placeholder="e.g. 10th Grade, Engineering Junior"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-brand-surface/50 border border-brand-border/60 rounded-2xl p-5 text-brand-text focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-brand-text-secondary/30"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Institution / HQ</label>
                <input
                  type="text"
                  placeholder="e.g. Westside Science Academy"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full bg-brand-surface/50 border border-brand-border/60 rounded-2xl p-5 text-brand-text focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-brand-text-secondary/30"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-surface/50 border border-brand-border/60 text-brand-text font-black uppercase tracking-widest text-[10px] hover:bg-brand-surface transition-all"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-brand-primary/20 active:scale-[0.98] transition-all"
              >
                Proceed <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-purple-500/10 text-purple-500 mb-2">
                <Braces size={32} />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-brand-text italic">AI Activation</h2>
              <p className="text-brand-text-secondary font-light">Supercharge QuantumCalc with your own Gemini Vision engine.</p>
            </div>
            
            <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border/60 rounded-[2rem] p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  To provide you with unlimited high-resolution explanations and analysis, we recommend using your own <span className="text-brand-primary font-bold">free API key</span> from Google.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-primary font-bold text-xs hover:underline decoration-2 underline-offset-4"
                >
                  Get your free key here <ChevronRight size={14} />
                </a>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Gemini API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl p-5 text-brand-text font-mono text-sm focus:border-brand-primary/60 outline-none transition-all"
                />
                <p className="text-[9px] text-brand-text-secondary italic">Your key is stored locally and never leaves your device.</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-surface/50 border border-brand-border/60 text-brand-text font-black uppercase tracking-widest text-[10px] hover:bg-brand-surface transition-all"
              >
                <ArrowLeft size={18} /> BACK
              </button>
              <button 
                onClick={() => setStep(4)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-brand-primary/20 active:scale-[0.98] transition-all"
              >
                SKIP OR PROCEED <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-brand-text italic">Final Review</h2>
              <p className="text-brand-text-secondary font-light">Confirming identity parameters before initialization.</p>
            </div>
            <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border/60 rounded-[2rem] p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
                <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Authentication</span>
                <div className="flex items-center gap-2">
                   {user?.photoURL && <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-brand-border" />}
                   <span className="font-bold text-brand-text">{user?.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
                <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Cloud Sync</span>
                <span className="font-bold text-brand-text flex items-center gap-1.5"><Cloud size={14} className="text-brand-primary" /> Google Drive Enabled</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
                <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Selected Role</span>
                <span className="font-black text-brand-primary italic text-lg uppercase tracking-tight">{role.replace('_', ' ')}</span>
              </div>
              {grade && (
                <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
                  <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Expertise Level</span>
                  <span className="font-bold text-brand-text">{grade}</span>
                </div>
              )}
              {school && (
                <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
                  <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">{role === 'student' || role === 'teacher' ? 'Institution' : 'Organization'}</span>
                  <span className="font-bold text-brand-text">{school}</span>
                </div>
              )}
              {(!grade && !school && !['student', 'teacher'].includes(role)) && (
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-1">Entity / Organization (Optional)</label>
                   <input
                     type="text"
                     placeholder="e.g. Acme Innovations"
                     value={school}
                     onChange={(e) => setSchool(e.target.value)}
                     className="w-full bg-brand-bg/50 border border-brand-border/60 rounded-2xl p-5 text-brand-text outline-none focus:border-brand-primary/60 transition-all placeholder:text-brand-text-secondary/30"
                   />
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-surface/50 border border-brand-border/60 text-brand-text font-black uppercase tracking-widest text-[10px] hover:bg-brand-surface transition-all disabled:opacity-50"
              >
                <ArrowLeft size={18} /> BACK
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : (
                  <>
                    INITIALIZE WORKSPACE <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-brand-bg border border-brand-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative"
      >
        <button 
          onClick={() => logout()}
          className="absolute top-6 right-8 text-xs font-bold text-brand-text-secondary hover:text-red-500 transition-colors"
        >
          Logout
        </button>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-border'
              }`} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileOnboarding;
