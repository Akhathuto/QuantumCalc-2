import { useState } from 'react';
import { Book, Search, Copy, Info, Atom, Zap, FunctionSquare, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface Formula {
    id: string;
    name: string;
    formula: string;
    latex: string;
    description: string;
    category: 'Physics' | 'Chemistry' | 'Math' | 'Constants';
    variables: string[];
}

const FORMULAS: Formula[] = [
    // Math
    { id: 'quadratic', name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Solves for the roots of a quadratic equation ax² + bx + c = 0.', category: 'Math', variables: ['a, b, c (Coefficients)', 'x (Roots)'] },
    { id: 'pythagoras', name: 'Pythagorean Theorem', formula: 'a² + b² = c²', latex: 'a^2 + b^2 = c^2', description: 'In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.', category: 'Math', variables: ['a, b (Legs)', 'c (Hypotenuse)'] },
    { id: 'euler', name: 'Euler\'s Identity', formula: 'e^iπ + 1 = 0', latex: 'e^{i\\pi} + 1 = 0', description: 'Relates five fundamental mathematical constants.', category: 'Math', variables: [] },
    { id: 'area_circle', name: 'Area of a Circle', formula: 'A = πr²', latex: 'A = \\pi r^2', description: 'Calculates the area of a circle with a given radius.', category: 'Math', variables: ['A (Area)', 'r (Radius)', 'π (Pi)'] },
    { id: 'volume_sphere', name: 'Volume of a Sphere', formula: 'V = ⁴/₃πr³', latex: 'V = \\frac{4}{3}\\pi r^3', description: 'Calculates the volume of a sphere.', category: 'Math', variables: ['V (Volume)', 'r (Radius)'] },
    
    // Physics
    { id: 'relativity', name: 'Mass-Energy Equivalence', formula: 'E = mc²', latex: 'E = mc^2', description: 'Mass and energy are proportional and can be converted into each other.', category: 'Physics', variables: ['E (Energy)', 'm (Mass)', 'c (Speed of Light)'] },
    { id: 'force', name: 'Newton\'s Second Law', formula: 'F = ma', latex: 'F = ma', description: 'The force acting on an object is equal to its mass times its acceleration.', category: 'Physics', variables: ['F (Force)', 'm (Mass)', 'a (Acceleration)'] },
    { id: 'gravity', name: 'Universal Gravitation', formula: 'F = G(m₁m₂/r²)', latex: 'F = G\\frac{m_1 m_2}{r^2}', description: 'Every particle attracts every other particle with a force directly proportional to the product of their masses.', category: 'Physics', variables: ['F (Force)', 'G (Gravitational Constant)', 'm (Masses)', 'r (Distance)'] },
    { id: 'kinematics_1', name: 'Kinematics: Velocity', formula: 'v = v₀ + at', latex: 'v = v_0 + at', description: 'Calculates final velocity over time given constant acceleration.', category: 'Physics', variables: ['v (Final Velocity)', 'v_0 (Initial Velocity)', 'a (Acceleration)', 't (Time)'] },
    { id: 'kinematics_2', name: 'Kinematics: Displacement', formula: 'Δx = v₀t + ½at²', latex: '\\Delta x = v_0 t + \\frac{1}{2}at^2', description: 'Calculates displacement given initial velocity, acceleration, and time.', category: 'Physics', variables: ['Δx (Displacement)', 'v_0 (Initial)', 'a (Acceleration)', 't (Time)'] },
    { id: 'kinetic_energy', name: 'Kinetic Energy', formula: 'KE = ½mv²', latex: 'KE = \\frac{1}{2}mv^2', description: 'Energy that an object possesses due to its motion.', category: 'Physics', variables: ['KE (Kinetic Energy)', 'm (Mass)', 'v (Velocity)'] },
    { id: 'hookes_law', name: 'Hooke\'s Law', formula: 'F = -kx', latex: 'F = -kx', description: 'Force needed to extend or compress a spring by some distance.', category: 'Physics', variables: ['F (Force)', 'k (Spring Constant)', 'x (Displacement)'] },
    { id: 'ohms_law', name: 'Ohm\'s Law', formula: 'V = IR', latex: 'V = IR', description: 'Voltage across a conductor is proportional to the current through it.', category: 'Physics', variables: ['V (Voltage)', 'I (Current)', 'R (Resistance)'] },

    // Chemistry
    { id: 'ideal_gas', name: 'Ideal Gas Law', formula: 'PV = nRT', latex: 'PV = nRT', description: 'The state of a hypothetical ideal gas.', category: 'Chemistry', variables: ['P (Pressure)', 'V (Volume)', 'n (Moles)', 'R (Gas Constant)', 'T (Temperature)'] },
    { id: 'combined_gas', name: 'Combined Gas Law', formula: 'P₁V₁/T₁ = P₂V₂/T₂', latex: '\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}', description: 'Ratio of the product of pressure and volume and the absolute temperature of a gas is equal to a constant.', category: 'Chemistry', variables: ['P (Pressure)', 'V (Volume)', 'T (Temperature)'] },
    { id: 'molarity', name: 'Molarity', formula: 'M = n / V', latex: 'M = \\frac{n}{V}', description: 'Concentration of a chemical species, in particular of a solute in a solution.', category: 'Chemistry', variables: ['M (Molarity)', 'n (Moles of solute)', 'V (Volume of solution)'] },
    { id: 'ph_calc', name: 'pH Calculation', formula: 'pH = -log₁₀[H⁺]', latex: 'pH = -\\log_{10}[H^+]', description: 'Calculates the acidity (pH) of a solution.', category: 'Chemistry', variables: ['pH', '[H⁺] (Hydrogen ion concentration)'] },

    // Constants
    { id: 'light_speed', name: 'Speed of Light', formula: 'c = 299,792,458 m/s', latex: 'c \\approx 3 \\times 10^8 \\text{ m/s}', description: 'Universal physical constant in many areas of physics.', category: 'Constants', variables: [] },
    { id: 'planck', name: 'Planck Constant', formula: 'h = 6.62607015 × 10⁻³⁴ J·s', latex: 'h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}', description: 'Relates the energy of a photon to its frequency.', category: 'Constants', variables: [] },
    { id: 'avogadro', name: 'Avogadro\'s Number', formula: 'Nₐ = 6.02214076 × 10²³ mol⁻¹', latex: 'N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}', description: 'Number of constituent particles in one mole of a substance.', category: 'Constants', variables: [] },
    { id: 'gravitational_const', name: 'Gravitational Constant', formula: 'G = 6.67430 × 10⁻¹¹ N⋅m²/kg²', latex: 'G = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2', description: 'Empirical physical constant involved in the calculation of gravitational effects.', category: 'Constants', variables: [] },
    { id: 'gas_constant', name: 'Ideal Gas Constant', formula: 'R = 8.314462618 J/(mol·K)', latex: 'R = 8.314 \\text{ J}/(\\text{mol}\\cdot\\text{K})', description: 'Constant in the equation of state of an ideal gas.', category: 'Constants', variables: [] },
];

const FormulaLibrary = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Formula['category'] | 'All'>('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredFormulas = FORMULAS.filter(f => 
        (selectedCategory === 'All' || f.category === selectedCategory) &&
        (f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()))
    );

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const categories = [
        { id: 'All', icon: Book },
        { id: 'Math', icon: FunctionSquare },
        { id: 'Physics', icon: Zap },
        { id: 'Chemistry', icon: Atom },
        { id: 'Constants', icon: Compass },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-surface/50 p-4 rounded-2xl border border-brand-border shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-bg text-brand-text-secondary hover:bg-brand-border'}`}
                        >
                            <cat.icon size={16} />
                            {cat.id}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={16} />
                    <input 
                        type="text"
                        placeholder="Search formulas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredFormulas.map((formula) => (
                        <motion.div
                            layout
                            key={formula.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:shadow-xl hover:border-brand-primary/50 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                                    formula.category === 'Math' ? 'bg-blue-500/10 text-blue-400' :
                                    formula.category === 'Physics' ? 'bg-yellow-500/10 text-yellow-400' :
                                    formula.category === 'Chemistry' ? 'bg-green-500/10 text-green-400' :
                                    'bg-purple-500/10 text-purple-400'
                                }`}>
                                    {formula.category}
                                </span>
                                <button 
                                    onClick={() => copyToClipboard(formula.formula, formula.id)}
                                    className="text-brand-text-secondary hover:text-brand-primary transition-colors p-1"
                                    title="Copy formula"
                                >
                                    {copiedId === formula.id ? '✅' : <Copy size={16} />}
                                </button>
                            </div>
                            
                            <h3 className="text-lg font-extrabold text-brand-text mb-1 group-hover:text-brand-primary transition-colors">{formula.name}</h3>
                            <div className="bg-brand-bg p-4 rounded-xl my-4 text-center border border-brand-border/50 group-hover:border-brand-primary/30 transition-colors overflow-hidden">
                                <div className="text-xl font-bold text-brand-accent">
                                    <Latex>{`$${formula.latex}$`}</Latex>
                                </div>
                            </div>
                            <p className="text-sm text-brand-text-secondary flex-1">{formula.description}</p>
                            
                            {formula.variables.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-brand-border space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary uppercase tracking-widest">
                                        <Info size={12} />
                                        <span>Variables</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formula.variables.map(v => (
                                            <span key={v} className="text-[10px] bg-brand-bg px-2 py-1 rounded-md border border-brand-border text-brand-text-secondary">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {filteredFormulas.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <Book className="mx-auto text-brand-text-secondary opacity-20" size={64} />
                    <div className="text-brand-text-secondary">
                        <p className="text-xl font-bold">No formulas found</p>
                        <p>Try searching for common terms like "energy", "force", or "pi"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormulaLibrary;
