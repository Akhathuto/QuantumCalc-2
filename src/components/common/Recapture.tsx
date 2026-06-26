import React, { useRef, useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion, AnimatePresence } from 'motion/react';
import { Orbit, Fingerprint, Lock, Check, Globe, Shield } from 'lucide-react';

interface RecaptureProps {
  onVerify: (verified: boolean) => void;
  className?: string;
}

export const Recapture: React.FC<RecaptureProps> = ({ onVerify, className = '' }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isProdDomain, setIsProdDomain] = useState(false);
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('dark');

  // Fallback states for non-production workspace environments (e.g. AI Studio development frame)
  const [isChecked, setIsChecked] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [sliderVal, setSliderVal] = useState(10);
  const [targetVal, setTargetVal] = useState(50);
  const [showError, setShowError] = useState(false);
  const challengeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    // Google reCAPTCHA v2 restricts rendering based on registered domains.
    // Check if we are running on the authorized production domain 'qcalc.edgtec.co.za' or standard local dev.
    const isProd = hostname === 'qcalc.edgtec.co.za' || hostname === 'localhost' || hostname === '127.0.0.1';
    setIsProdDomain(isProd);

    // Read theme from localStorage or document class
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setAppTheme(storedTheme);
      } else {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        setAppTheme(hasDarkClass ? 'dark' : 'light');
      }
    } catch {
      setAppTheme('dark');
    }

    generateNewChallenge();
  }, []);

  const generateNewChallenge = () => {
    // Generate target between 30 and 80
    const target = Math.floor(Math.random() * 50) + 30;
    setTargetVal(target);
    setSliderVal(10);
    setShowError(false);
  };

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setIsChecked(true);
    setTimeout(() => {
      setShowChallenge(true);
    }, 400);
  };

  const handleVerifyChallenge = () => {
    const tolerance = 12; // Increased tolerance for much easier usability
    const isCorrect = Math.abs(sliderVal - targetVal) <= tolerance;

    if (isCorrect) {
      setIsVerified(true);
      setShowChallenge(false);
      onVerify(true);
    } else {
      setShowError(true);
      setTimeout(() => {
        generateNewChallenge();
      }, 1000);
    }
  };

  const siteKey = "6LcyhP4sAAAAAOCLqIlZCJHWsxeEaVSszIGHNfZL";

  return (
    <div id="quantum-recapture-container" className={`w-full ${className}`}>
      {isProdDomain ? (
        /* Genuine official Google reCAPTCHA widget for production domain & localhost testing */
        <div className="flex flex-col items-start gap-2 bg-brand-surface/30 p-3 rounded-2xl border border-brand-border/40 sm:max-w-max">
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <Shield size={14} className="text-brand-secondary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">Official Sec-Core Active</span>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-brand-border/60 shadow-lg">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleRecaptchaChange}
              theme={appTheme === 'dark' ? 'dark' : 'light'}
            />
          </div>
          
          <span className="text-[8px] text-brand-text-secondary/60 font-mono tracking-tight px-1 uppercase">
            Domain Verified • Sec-Check by Google
          </span>
        </div>
      ) : (
        /* Elegant fallback with full simulation options for standard preview workspace environments */
        <div className="space-y-3">
          {/* Badge indicator explaining that we are in dev/preview environment and providing seamless bypass */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer bg-brand-surface border-brand-border/60 hover:border-brand-primary/50 shadow-md">
            <div className="flex items-center gap-3" onClick={handleCheckboxClick}>
              {/* Circular verification check */}
              <div className="relative flex items-center justify-center w-6 h-6">
                <AnimatePresence mode="wait">
                  {isVerified ? (
                    <motion.div 
                      key="verified"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.div>
                  ) : isChecked ? (
                    <motion.div 
                      key="loading"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full"
                    />
                  ) : (
                    <motion.div 
                      key="idle"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-5 h-5 rounded-lg border-2 border-brand-border bg-brand-bg/50"
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-black text-brand-text leading-tight tracking-wide">
                  {isVerified ? 'Verification Passed' : 'Quantum Sandbox Recaptcha'}
                </span>
                <span className="text-[8px] text-brand-text-secondary uppercase tracking-[0.15em] opacity-60">
                  {isVerified ? 'Integrity Clear' : 'Preview workspace environment'}
                </span>
              </div>
            </div>

            {/* Orbit security indicator */}
            <div className="flex flex-col items-end opacity-60">
              <div className="flex items-center gap-1 text-brand-primary">
                <Orbit size={12} className={isChecked && !isVerified ? "animate-spin" : ""} />
                <span className="text-[9px] font-black tracking-widest uppercase">DEV-REC</span>
              </div>
              <span className="text-[7px] text-brand-text-secondary uppercase">Local Bypass</span>
            </div>
          </div>

          {/* Quick info-warning indicating why standard widget can't render in high-security sandbox frames */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] leading-tight select-none">
            <Globe size={12} className="shrink-0" />
            <span>
              Official Google reCAPTCHA v2 is active but registered strictly for <strong>qcalc.edgtec.co.za</strong>. Local sandbox validation bypass active.
            </span>
          </div>

          {/* Align challenge simulation */}
          <AnimatePresence>
            {showChallenge && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-bg/95 backdrop-blur-md">
                <motion.div 
                  ref={challengeRef}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-sm bg-brand-surface border border-brand-border/50 rounded-3xl p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-brand-primary/10 p-2.5 rounded-xl text-brand-primary">
                      <Fingerprint size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-text uppercase tracking-widest leading-none">Quantum Phase Align</h4>
                      <p className="text-[8px] text-brand-text-secondary uppercase tracking-widest mt-1">Calibrate orbital coordinates</p>
                    </div>
                  </div>

                  <div className="relative bg-brand-bg/50 border border-brand-border/40 rounded-2xl p-5 mb-5 flex flex-col items-center justify-center">
                    <div className="mb-3 text-center">
                      <p className="text-[9px] font-black uppercase text-brand-text-secondary tracking-wider">
                        {showError ? 'Alignment Error. Re-calibrating...' : 'Align core dot with glowing target'}
                      </p>
                    </div>

                    <div className="relative w-full h-8 bg-brand-surface/40 border border-brand-border rounded-xl px-2 my-2 overflow-hidden flex items-center">
                      <div 
                        className={`absolute top-0 bottom-0 w-8 blur-sm rounded-lg opacity-40 ${showError ? 'bg-red-500' : 'bg-[#00E5FF]'}`}
                        style={{ left: `${targetVal}%`, transform: 'translateX(-50%)' }}
                      />
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-brand-bg shadow-lg ${showError ? 'bg-red-500' : 'bg-[#00E5FF]'}`}
                        style={{ left: `${targetVal}%`, transform: 'translateX(-50%)' }}
                      />

                      <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-primary border-4 border-brand-surface shadow-lg cursor-grab active:cursor-grabbing"
                        animate={{ left: `${sliderVal}%` }}
                        style={{ transform: 'translateX(-50%)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>

                    <div className="w-full mt-3 flex justify-between font-mono text-[8px] text-brand-text-secondary/40 uppercase tracking-widest">
                      <div>Current: {Math.round(sliderVal)}u</div>
                      <div>Target: {targetVal}u</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-brand-text-secondary font-black tracking-widest uppercase">FINE TUNE:</span>
                      <input 
                        type="range"
                        min="10"
                        max="90"
                        value={sliderVal}
                        onChange={(e) => {
                          setSliderVal(Number(e.target.value));
                          if (showError) setShowError(false);
                        }}
                        className="flex-1 accent-brand-primary bg-brand-bg border border-brand-border"
                      />
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => {
                          setShowChallenge(false);
                          setIsChecked(false);
                        }}
                        className="flex-1 py-2.5 bg-brand-bg border border-brand-border hover:border-brand-text-secondary text-brand-text-secondary hover:text-brand-text text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleVerifyChallenge}
                        className="flex-1 py-2.5 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20"
                      >
                        <Lock size={12} />
                        Verify
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
