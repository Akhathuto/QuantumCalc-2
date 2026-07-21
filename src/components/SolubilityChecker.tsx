import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers } from 'lucide-react';

export const SolubilityChecker = () => {
    const [cation, setCation] = useState('');
    const [anion, setAnion] = useState('');
    const [result, setResult] = useState<{ soluble: boolean; rule: string } | null>(null);

    const checkSolubility = () => {
        if (!cation || !anion) return;

        let soluble = true;
        let rule = "Generally soluble";

        const cations = cation.toLowerCase();
        const anions = anion.toLowerCase();

        if (anions === 'no3' || anions === 'c2h3o2' || cations === 'li' || cations === 'na' || cations === 'k' || cations === 'nh4') {
            soluble = true;
            rule = "Nitrates, Acetates, and Group 1 / Ammonium compounds are always soluble without exception.";
        } 
        else if (anions === 'cl' || anions === 'br' || anions === 'i') {
            if (cations === 'ag' || cations === 'pb' || cations === 'hg2') {
                soluble = false;
                rule = "Chlorides, Bromides, and Iodides are insoluble when paired with Silver (Ag+), Lead (Pb2+), or Mercury (Hg2^2+).";
            } else {
                soluble = true;
                rule = "Most halides are highly soluble in aqueous solutions.";
            }
        }
        else if (anions === 'so4') {
            if (['ba', 'sr', 'pb', 'ca', 'ag'].includes(cations)) {
                soluble = false;
                rule = "Sulfates of Barium, Strontium, Lead, Calcium, and Silver form precipitates and are insoluble or only slightly soluble.";
            } else {
                soluble = true;
                rule = "Most sulfates are soluble.";
            }
        }
        else if (['co3', 'po4', 'oh', 's'].includes(anions)) {
            soluble = false;
            rule = "Carbonates, Phosphates, Sulfides, and Hydroxides are generally insoluble, except when paired with Alkali Metals or Ammonium.";
        }

        setResult({ soluble, rule });
    };

    return (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group min-h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full -ml-16 -mt-16 blur-3xl opacity-50" />
            
            <div>
                <div className="flex items-center gap-3 relative z-10 mb-5">
                    <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <Layers size={20} />
                    </div>
                    <h4 className="font-black text-brand-text uppercase tracking-tighter">Solubility Rules Checker</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest ml-1">Cation (+ charge)</label>
                        <select 
                            value={cation}
                            onChange={e => setCation(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                        >
                            <option value="">Select...</option>
                            <option value="li">Li+ (Lithium)</option>
                            <option value="na">Na+ (Sodium)</option>
                            <option value="k">K+ (Potassium)</option>
                            <option value="nh4">NH4+ (Ammonium)</option>
                            <option value="ag">Ag+ (Silver)</option>
                            <option value="pb">Pb2+ (Lead)</option>
                            <option value="ba">Ba2+ (Barium)</option>
                            <option value="ca">Ca2+ (Calcium)</option>
                            <option value="fe">Fe3+ (Iron III)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest ml-1">Anion (- charge)</label>
                        <select 
                            value={anion}
                            onChange={e => setAnion(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                        >
                            <option value="">Select...</option>
                            <option value="no3">NO3- (Nitrate)</option>
                            <option value="cl">Cl- (Chloride)</option>
                            <option value="so4">SO4^2- (Sulfate)</option>
                            <option value="co3">CO3^2- (Carbonate)</option>
                            <option value="oh">OH- (Hydroxide)</option>
                            <option value="po4">PO4^3- (Phosphate)</option>
                            <option value="s">S^2- (Sulfide)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={checkSolubility}
                    disabled={!cation || !anion}
                    className="w-full mt-4 bg-brand-bg hover:bg-brand-primary hover:text-white border border-brand-border hover:border-brand-primary rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                >
                    Check Solubility State
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`mt-4 p-4 rounded-2xl border ${result.soluble ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${result.soluble ? 'bg-green-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${result.soluble ? 'text-green-500' : 'text-red-500'}`}>
                                {result.soluble ? 'Soluble (aq)' : 'Insoluble (s) - Precipitates'}
                            </span>
                        </div>
                        <p className="text-[10px] text-brand-text-secondary leading-relaxed font-medium">
                            {result.rule}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
