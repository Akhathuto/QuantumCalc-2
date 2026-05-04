import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atom, Search, TrendingUp, Thermometer, Layers, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Element {
    number: number;
    symbol: string;
    name: string;
    mass: number;
    category: string;
    group: number;
    period: number;
    color: string;
    electronegativity: number | null;
    atomic_radius: number | null;
    melting_point: number | null; // in K
    boiling_point: number | null; // in K
    density: number | null; // g/cm3
    summary: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'nonmetal': '#4fd1c5',
    'noble gas': '#ed64a6',
    'alkali metal': '#f56565',
    'alkaline earth metal': '#ed8936',
    'metalloid': '#ecc94b',
    'post-transition metal': '#a0aec0',
    'transition metal': '#4299e1',
    'actinide': '#9f7aea',
    'lanthanide': '#805ad5',
};

const getElectronConfiguration = (n: number) => {
    if (n === 24) return '[Ar] 4s1 3d5';
    if (n === 29) return '[Ar] 4s1 3d10';

    const shells = [
        { name: '1s', cap: 2 }, { name: '2s', cap: 2 }, { name: '2p', cap: 6 },
        { name: '3s', cap: 2 }, { name: '3p', cap: 6 }, { name: '4s', cap: 2 },
        { name: '3d', cap: 10 }, { name: '4p', cap: 6 }, { name: '5s', cap: 2 },
        { name: '4d', cap: 10 }, { name: '5p', cap: 6 }
    ];
    let remaining = n;
    const config = [];
    for (const shell of shells) {
        if (remaining <= 0) break;
        const count = Math.min(remaining, shell.cap);
        config.push(`${shell.name}${count}`);
        remaining -= count;
    }
    return config.join(' ');
};

const getShellComposition = (n: number) => {
    const orbitals = [
        { shell: 0, cap: 2 }, // 1s
        { shell: 1, cap: 2 }, // 2s
        { shell: 1, cap: 6 }, // 2p
        { shell: 2, cap: 2 }, // 3s
        { shell: 2, cap: 6 }, // 3p
        { shell: 3, cap: 2 }, // 4s
        { shell: 2, cap: 10 }, // 3d
        { shell: 3, cap: 6 }, // 4p
        { shell: 4, cap: 2 }, // 5s
        { shell: 3, cap: 10 }, // 4d
        { shell: 4, cap: 6 }  // 5p
    ];
    const shells = [0, 0, 0, 0, 0];
    let remaining = n;
    for (const orb of orbitals) {
        const count = Math.min(remaining, orb.cap);
        shells[orb.shell] += count;
        remaining -= count;
        if (remaining <= 0) break;
    }
    return shells.filter(s => s > 0);
};

const BohrModel = ({ n, color }: { n: number, color: string }) => {
    const composition = getShellComposition(n);
    return (
        <div className="relative w-56 h-56 flex items-center justify-center bg-brand-bg/10 rounded-full border border-brand-border/20 backdrop-blur-sm shadow-inner group">
            <motion.div 
                animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [`0 0 20px ${color}40`, `0 0 40px ${color}80`, `0 0 20px ${color}40`]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-[11px] text-white font-black z-20 border-2 border-white/30"
                style={{ 
                    background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
                }}
            >
                {n}+
            </motion.div>
            {composition.map((count, i) => {
                const radius = 35 + i * 20;
                return (
                    <div 
                        key={i} 
                        className="absolute border border-brand-primary/10 rounded-full animate-spin-slow" 
                        style={{ 
                            width: radius * 2, 
                            height: radius * 2, 
                            animationDuration: `${(i + 1) * 12}s`,
                            animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                        }}
                    >
                         {Array.from({ length: count }).map((_, j) => {
                             const angle = (j / count) * 360;
                             return (
                                 <motion.div 
                                     key={j} 
                                     animate={{ scale: [1, 1.2, 1] }}
                                     transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.1 }}
                                     className="absolute w-2.5 h-2.5 rounded-full shadow-lg border border-white/20"
                                     style={{ 
                                         top: 'calc(50% - 5px)', 
                                         left: 'calc(50% - 5px)', 
                                         transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                                         background: `radial-gradient(circle at 30% 30%, ${color}, #fff)`,
                                         boxShadow: `0 0 10px ${color}aa`
                                     }}
                                 />
                             );
                         })}
                    </div>
                );
            })}
            
            {/* Orbital Labels */}
            {composition.map((_, i) => (
                <div 
                    key={`label-${i}`}
                    className="absolute text-[8px] font-black opacity-30 pointer-events-none"
                    style={{ 
                        transform: `translateY(${-35 - i * 20}px)`,
                    }}
                >
                    n={i+1}
                </div>
            ))}
        </div>
    );
};

const ELEMENTS: Element[] = [
    { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1, color: '#4fd1c5', electronegativity: 2.20, atomic_radius: 37, melting_point: 14.01, boiling_point: 20.28, density: 0.00008988, summary: 'The lightest and most abundant chemical substance in the universe.' },
    { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble gas', group: 18, period: 1, color: '#ed64a6', electronegativity: null, atomic_radius: 32, melting_point: 0.95, boiling_point: 4.22, density: 0.0001785, summary: 'A colorless, odorless, tasteless, non-toxic, inert, monatomic gas.' },
    { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali metal', group: 1, period: 2, color: '#f56565', electronegativity: 0.98, atomic_radius: 134, melting_point: 453.69, boiling_point: 1615, density: 0.534, summary: 'The lightest metal and the lightest solid element.' },
    { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline earth metal', group: 2, period: 2, color: '#ed8936', electronegativity: 1.57, atomic_radius: 90, melting_point: 1560, boiling_point: 2742, density: 1.85, summary: 'A steel-gray, strong, lightweight and brittle alkaline earth metal.' },
    { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2, color: '#ecc94b', electronegativity: 2.04, atomic_radius: 82, melting_point: 2349, boiling_point: 4200, density: 2.34, summary: 'A metalloid element, mostly found in the ore borax.' },
    { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal', group: 14, period: 2, color: '#4fd1c5', electronegativity: 2.55, atomic_radius: 77, melting_point: 3823, boiling_point: 4098, density: 2.267, summary: 'The chemical basis of all known life.' },
    { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal', group: 15, period: 2, color: '#4fd1c5', electronegativity: 3.04, atomic_radius: 75, melting_point: 63.15, boiling_point: 77.36, density: 0.0012506, summary: 'A colorless, odorless, tasteless gas that constitutes about 78% of Earth\'s atmosphere.' },
    { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal', group: 16, period: 2, color: '#4fd1c5', electronegativity: 3.44, atomic_radius: 73, melting_point: 54.36, boiling_point: 90.20, density: 0.001429, summary: 'A highly reactive nonmetal and oxidizing agent.' },
    { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'noble gas', group: 17, period: 2, color: '#ed64a6', electronegativity: 3.98, atomic_radius: 71, melting_point: 53.53, boiling_point: 85.03, density: 0.001696, summary: 'The most electronegative element and is extremely reactive.' },
    { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble gas', group: 18, period: 2, color: '#ed64a6', electronegativity: null, atomic_radius: 69, melting_point: 24.56, boiling_point: 27.07, density: 0.0008999, summary: 'The second-lightest noble gas, it glows reddish-orange in a vacuum discharge tube.' },
    { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali metal', group: 1, period: 3, color: '#f56565', electronegativity: 0.93, atomic_radius: 154, melting_point: 370.87, boiling_point: 1156, density: 0.971, summary: 'A soft, silvery-white, highly reactive alkali metal.' },
    { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline earth metal', group: 2, period: 3, color: '#ed8936', electronegativity: 1.31, atomic_radius: 130, melting_point: 923, boiling_point: 1363, density: 1.738, summary: 'A shiny gray solid which bears a close physical resemblance to the other five alkaline earth metals.' },
    { number: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'post-transition metal', group: 13, period: 3, color: '#a0aec0', electronegativity: 1.61, atomic_radius: 118, melting_point: 933.47, boiling_point: 2792, density: 2.70, summary: 'A silvery-white, soft, non-magnetic and ductile metal in the boron group.' },
    { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid', group: 14, period: 3, color: '#ecc94b', electronegativity: 1.90, atomic_radius: 111, melting_point: 1687, boiling_point: 3538, density: 2.3296, summary: 'A hard and brittle crystalline solid with a blue-grey metallic lustre.' },
    { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal', group: 15, period: 3, color: '#4fd1c5', electronegativity: 2.19, atomic_radius: 106, melting_point: 317.3, boiling_point: 553, density: 1.82, summary: 'Exists in two major forms, white and red phosphorus.' },
    { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal', group: 16, period: 3, color: '#4fd1c5', electronegativity: 2.58, atomic_radius: 102, melting_point: 388.36, boiling_point: 717.8, density: 2.067, summary: 'A bright yellow, brittle solid that is odorless at room temperature.' },
    { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'noble gas', group: 17, period: 3, color: '#ed64a6', electronegativity: 3.16, atomic_radius: 99, melting_point: 171.6, boiling_point: 239.11, density: 0.003214, summary: 'The second-lightest of the halogens, it appears between fluorine and bromine.' },
    { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble gas', group: 18, period: 3, color: '#ed64a6', electronegativity: null, atomic_radius: 97, melting_point: 83.80, boiling_point: 87.30, density: 0.0017837, summary: 'The third-most abundant gas in the Earth\'s atmosphere.' },
    { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali metal', group: 1, period: 4, color: '#f56565', electronegativity: 0.82, atomic_radius: 227, melting_point: 336.5, boiling_point: 1032, density: 0.89, summary: 'A soft silvery-white alkali metal that oxidizes rapidly in air.' },
    { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline earth metal', group: 2, period: 4, color: '#ed8936', electronegativity: 1.00, atomic_radius: 197, melting_point: 1115, boiling_point: 1757, density: 1.54, summary: 'An alkaline earth metal, calcium is the fifth-most abundant element by mass in the Earth\'s crust.' },
    { number: 21, symbol: 'Sc', name: 'Scandium', mass: 44.956, category: 'transition metal', group: 3, period: 4, color: '#4299e1', electronegativity: 1.36, atomic_radius: 162, melting_point: 1814, boiling_point: 3109, density: 2.985, summary: 'A silvery-white metallic d-block element, historically classified as a rare-earth element.' },
    { number: 22, symbol: 'Ti', name: 'Titanium', mass: 47.867, category: 'transition metal', group: 4, period: 4, color: '#4299e1', electronegativity: 1.54, atomic_radius: 147, melting_point: 1941, boiling_point: 3560, density: 4.506, summary: 'A lustrous transition metal with a silver color, low density, and high strength.' },
    { number: 23, symbol: 'V', name: 'Vanadium', mass: 50.942, category: 'transition metal', group: 5, period: 4, color: '#4299e1', electronegativity: 1.63, atomic_radius: 134, melting_point: 2183, boiling_point: 3680, density: 6.0, summary: 'A hard, silvery-grey, malleable transition metal.' },
    { number: 24, symbol: 'Cr', name: 'Chromium', mass: 51.996, category: 'transition metal', group: 6, period: 4, color: '#4299e1', electronegativity: 1.66, atomic_radius: 128, melting_point: 2180, boiling_point: 2944, density: 7.19, summary: 'A steely-grey, lustrous, hard and brittle transition metal.' },
    { number: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, category: 'transition metal', group: 7, period: 4, color: '#4299e1', electronegativity: 1.55, atomic_radius: 127, melting_point: 1519, boiling_point: 2334, density: 7.21, summary: 'Not found as a free element in nature; it is often found in minerals in combination with iron.' },
    { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition metal', group: 8, period: 4, color: '#4299e1', electronegativity: 1.83, atomic_radius: 125, melting_point: 1811, boiling_point: 3134, density: 7.874, summary: 'The most common element on Earth by mass, forming much of Earth\'s outer and inner core.' },
    { number: 27, symbol: 'Co', name: 'Cobalt', mass: 58.933, category: 'transition metal', group: 9, period: 4, color: '#4299e1', electronegativity: 1.88, atomic_radius: 125, melting_point: 1768, boiling_point: 3200, density: 8.9, summary: 'A hard, lustrous, silver-grey metal, cobalt is found in the Earth\'s crust only in chemically combined form.' },
    { number: 28, symbol: 'Ni', name: 'Nickel', mass: 58.693, category: 'transition metal', group: 10, period: 4, color: '#4299e1', electronegativity: 1.91, atomic_radius: 124, melting_point: 1728, boiling_point: 3186, density: 8.908, summary: 'A silvery-white lustrous metal with a slight golden tinge.' },
    { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition metal', group: 11, period: 4, color: '#4299e1', electronegativity: 1.90, atomic_radius: 128, melting_point: 1357.77, boiling_point: 2835, density: 8.96, summary: 'A soft, malleable, and ductile metal with very high thermal and electrical conductivity.' },
    { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition metal', group: 12, period: 4, color: '#4299e1', electronegativity: 1.65, atomic_radius: 134, melting_point: 692.68, boiling_point: 1180, density: 7.14, summary: 'A slightly brittle metal at room temperature and has a blue-silvery appearance when oxidation is removed.' },
    { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, category: 'post-transition metal', group: 13, period: 4, color: '#a0aec0', electronegativity: 1.81, atomic_radius: 135, melting_point: 302.91, boiling_point: 2477, density: 5.91, summary: 'A soft, silvery metal, and elemental gallium is a brittle solid at low temperatures.' },
    { number: 32, symbol: 'Ge', name: 'Germanium', mass: 72.630, category: 'metalloid', group: 14, period: 4, color: '#ecc94b', electronegativity: 2.01, atomic_radius: 122, melting_point: 1211.4, boiling_point: 3106, density: 5.323, summary: 'A lustrous, hard-brittle, grayish-white metalloid in the carbon group.' },
    { number: 33, symbol: 'As', name: 'Arsenic', mass: 74.922, category: 'metalloid', group: 15, period: 4, color: '#ecc94b', electronegativity: 2.18, atomic_radius: 119, melting_point: 1090, boiling_point: 887, density: 5.727, summary: 'A metalloid occurs in many minerals, usually in combination with sulfur and metals.' },
    { number: 34, symbol: 'Se', name: 'Selenium', mass: 78.971, category: 'nonmetal', group: 16, period: 4, color: '#4fd1c5', electronegativity: 2.55, atomic_radius: 117, melting_point: 494, boiling_point: 958, density: 4.81, summary: 'A nonmetal with properties that are intermediate between the elements above and below in the periodic table.' },
    { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, category: 'nonmetal', group: 17, period: 4, color: '#4fd1c5', electronegativity: 2.96, atomic_radius: 114, melting_point: 265.8, boiling_point: 332, density: 3.1028, summary: 'The only nonmetallic element that is liquid at room temperature.' },
    { number: 36, symbol: 'Kr', name: 'Krypton', mass: 83.798, category: 'noble gas', group: 18, period: 4, color: '#ed64a6', electronegativity: 3.00, atomic_radius: 110, melting_point: 115.79, boiling_point: 119.93, density: 0.003733, summary: 'A colorless, odorless, tasteless noble gas that occurs in trace amounts in the atmosphere.' },
    { number: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.468, category: 'alkali metal', group: 1, period: 5, color: '#f56565', electronegativity: 0.82, atomic_radius: 248, melting_point: 312.46, boiling_point: 961, density: 1.532, summary: 'A soft, silvery-white metallic element of the alkali metal group.' },
    { number: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'alkaline earth metal', group: 2, period: 5, color: '#ed8936', electronegativity: 0.95, atomic_radius: 215, melting_point: 1050, boiling_point: 1655, density: 2.64, summary: 'A soft, silver-white, yellowish metallic element that is highly reactive chemically.' },
    { number: 39, symbol: 'Y', name: 'Yttrium', mass: 88.905, category: 'transition metal', group: 3, period: 5, color: '#4299e1', electronegativity: 1.22, atomic_radius: 180, melting_point: 1799, boiling_point: 3609, density: 4.472, summary: 'A silvery-metallic transition metal chemically similar to the lanthanides.' },
    { number: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.224, category: 'transition metal', group: 4, period: 5, color: '#4299e1', electronegativity: 1.33, atomic_radius: 160, melting_point: 2128, boiling_point: 4682, density: 6.52, summary: 'A lustrous, grey-white, strong transition metal that resembles hafnium.' },
    { number: 41, symbol: 'Nb', name: 'Niobium', mass: 92.906, category: 'transition metal', group: 5, period: 5, color: '#4299e1', electronegativity: 1.6, atomic_radius: 146, melting_point: 2750, boiling_point: 5017, density: 8.57, summary: 'A soft, grey, crystalline, ductile transition metal.' },
    { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'transition metal', group: 6, period: 5, color: '#4299e1', electronegativity: 2.16, atomic_radius: 145, melting_point: 2896, boiling_point: 4912, density: 10.28, summary: 'A chemical element with symbol Mo and atomic number 42.' },
    { number: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'transition metal', group: 7, period: 5, color: '#4299e1', electronegativity: 1.9, atomic_radius: 136, melting_point: 2430, boiling_point: 4538, density: 11, summary: 'The first element in the periodic table that has no stable isotopes.' },
    { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.07, category: 'transition metal', group: 8, period: 5, color: '#4299e1', electronegativity: 2.2, atomic_radius: 134, melting_point: 2606, boiling_point: 4423, density: 12.1, summary: 'A rare transition metal in the platinum group.' },
    { number: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.91, category: 'transition metal', group: 9, period: 5, color: '#4299e1', electronegativity: 2.28, atomic_radius: 134, melting_point: 2237, boiling_point: 3968, density: 12.4, summary: 'A rare, silvery-white, hard, corrosion-resistant transition metal.' },
    { number: 46, symbol: 'Pd', name: 'Palladium', mass: 106.42, category: 'transition metal', group: 10, period: 5, color: '#4299e1', electronegativity: 2.20, atomic_radius: 137, melting_point: 1828.05, boiling_point: 3236, density: 12.023, summary: 'A rare and lustrous silvery-white metal discovered in 1803.' },
    { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition metal', group: 11, period: 5, color: '#4299e1', electronegativity: 1.93, atomic_radius: 144, melting_point: 1234.93, boiling_point: 2435, density: 10.501, summary: 'A soft, white, lustrous transition metal, it exhibits the highest electrical conductivity.' },
    { number: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.41, category: 'transition metal', group: 12, period: 5, color: '#4299e1', electronegativity: 1.69, atomic_radius: 151, melting_point: 594.22, boiling_point: 1040, density: 8.65, summary: 'A soft, silvery-white metal that is chemically similar to the other two stable metals in group 12.' },
    { number: 49, symbol: 'In', name: 'Indium', mass: 114.82, category: 'post-transition metal', group: 13, period: 5, color: '#a0aec0', electronegativity: 1.78, atomic_radius: 167, melting_point: 429.75, boiling_point: 2345, density: 7.31, summary: 'A soft, silvery-white metal that looks like tin.' },
    { number: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, category: 'post-transition metal', group: 14, period: 5, color: '#a0aec0', electronegativity: 1.96, atomic_radius: 140, melting_point: 505.08, boiling_point: 2875, density: 7.287, summary: 'A silvery, malleable post-transition metal.' },
    { number: 51, symbol: 'Sb', name: 'Antimony', mass: 121.76, category: 'metalloid', group: 15, period: 5, color: '#ecc94b', electronegativity: 2.05, atomic_radius: 140, melting_point: 903.78, boiling_point: 1860, density: 6.685, summary: 'A lustrous gray metalloid, it is found in nature mainly as the sulfide mineral stibnite.' },
    { number: 52, symbol: 'Te', name: 'Tellurium', mass: 127.6, category: 'metalloid', group: 16, period: 5, color: '#ecc94b', electronegativity: 2.1, atomic_radius: 135, melting_point: 722.66, boiling_point: 1261, density: 6.24, summary: 'A brittle, mildly toxic, rare, silver-white metalloid.' },
    { number: 53, symbol: 'I', name: 'Iodine', mass: 126.90, category: 'nonmetal', group: 17, period: 5, color: '#4fd1c5', electronegativity: 2.66, atomic_radius: 133, melting_point: 386.85, boiling_point: 457.4, density: 4.933, summary: 'The heaviest of the stable halogens.' },
    { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, category: 'noble gas', group: 18, period: 5, color: '#ed64a6', electronegativity: 2.6, atomic_radius: 130, melting_point: 161.4, boiling_point: 165.03, density: 0.005887, summary: 'A colorless, dense, odorless noble gas found in Earth\'s atmosphere in trace amounts.' },
    { number: 55, symbol: 'Cs', name: 'Caesium', mass: 132.91, category: 'alkali metal', group: 1, period: 6, color: '#f56565', electronegativity: 0.79, atomic_radius: 265, melting_point: 301.59, boiling_point: 944, density: 1.93, summary: 'An alkali metal with physical and chemical properties similar to those of rubidium and potassium.' },
    { number: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, category: 'alkaline earth metal', group: 2, period: 6, color: '#ed8936', electronegativity: 0.89, atomic_radius: 222, melting_point: 1000, boiling_point: 2118, density: 3.51, summary: 'A soft, silvery alkaline earth metal.' },
    { number: 74, symbol: 'W', name: 'Tungsten', mass: 183.84, category: 'transition metal', group: 6, period: 6, color: '#4299e1', electronegativity: 2.36, atomic_radius: 139, melting_point: 3695, boiling_point: 5828, density: 19.25, summary: 'A rare metal found naturally on Earth almost exclusively as compounds with other elements.' },
    { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, category: 'transition metal', group: 10, period: 6, color: '#4299e1', electronegativity: 2.28, atomic_radius: 139, melting_point: 2041.4, boiling_point: 4098, density: 21.45, summary: 'A dense, malleable, ductile, highly unreactive, precious, silver-white transition metal.' },
    { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition metal', group: 11, period: 6, color: '#4299e1', electronegativity: 2.4, atomic_radius: 144, melting_point: 1337.33, boiling_point: 3129, density: 19.3, summary: 'A bright, slightly reddish yellow, dense, soft, malleable, and ductile metal.' },
    { number: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, category: 'transition metal', group: 12, period: 6, color: '#4299e1', electronegativity: 2.00, atomic_radius: 151, melting_point: 234.32, boiling_point: 629.88, density: 13.534, summary: 'A heavy, silvery d-block element, mercury is the only metallic element that is liquid at standard conditions.' },
    { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post-transition metal', group: 14, period: 6, color: '#a0aec0', electronegativity: 2.33, atomic_radius: 175, melting_point: 600.61, boiling_point: 2022, density: 11.34, summary: 'A heavy metal that is denser than most common materials.' },
    { number: 83, symbol: 'Bi', name: 'Bismuth', mass: 208.98, category: 'post-transition metal', group: 15, period: 6, color: '#a0aec0', electronegativity: 2.02, atomic_radius: 156, melting_point: 544.7, boiling_point: 1837, density: 9.78, summary: 'A brittle metal with a white, silver-pink hue.' },
    { number: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'post-transition metal', group: 16, period: 6, color: '#a0aec0', electronegativity: 2.0, atomic_radius: 167, melting_point: 527, boiling_point: 1235, density: 9.196, summary: 'A rare and highly radioactive metal with no stable isotopes.' },
    { number: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'metalloid', group: 17, period: 6, color: '#ecc94b', electronegativity: 2.2, atomic_radius: 127, melting_point: 575, boiling_point: 610, density: 7, summary: 'A highly radioactive chemical element with symbol At and atomic number 85.' },
    { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'noble gas', group: 18, period: 6, color: '#ed64a6', electronegativity: 2.2, atomic_radius: 120, melting_point: 202, boiling_point: 211.3, density: 0.00973, summary: 'A radioactive, colorless, odorless, tasteless noble gas.' },
    { number: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'alkali metal', group: 1, period: 7, color: '#f56565', electronegativity: 0.7, atomic_radius: null, melting_point: 300, boiling_point: 950, density: 1.87, summary: 'An alkali metal that is highly radioactive and relatively rare.' },
    { number: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'alkaline earth metal', group: 2, period: 7, color: '#ed8936', electronegativity: 0.9, atomic_radius: null, melting_point: 973, boiling_point: 2010, density: 5.5, summary: 'A pure-white alkaline earth metal that blackens on exposure to air.' },
    { number: 92, symbol: 'U', name: 'Uranium', mass: 238.03, category: 'actinide', group: 3, period: 7, color: '#9f7aea', electronegativity: 1.38, atomic_radius: 138, melting_point: 1405.3, boiling_point: 4404, density: 18.95, summary: 'A silvery-grey metal in the actinide series of the periodic table.' },
    { number: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'actinide', group: 3, period: 7, color: '#9f7aea', electronegativity: 1.28, atomic_radius: 159, melting_point: 912.5, boiling_point: 3501, density: 19.816, summary: 'A transuranic radioactive chemical element with symbol Pu and atomic number 94.' },
];

type ViewMode = 'category' | 'electronegativity' | 'atomic_radius';

const MolarMassCalculator = () => {
    const [formula, setFormula] = useState('');
    const [result, setResult] = useState<{ mass: number; composition: { element: string; mass: number; percent: number }[] } | null>(null);
    const [error, setError] = useState('');

    const calculateMolarMass = () => {
        try {
            setError('');
            if (!formula) return;

            // Simple regex-based parser for common formulas like H2O, H2SO4, (NH4)2SO4
            const parseFormula = (f: string): Record<string, number> => {
                const counts: Record<string, number> = {};
                
                // Handle parentheses first: (NH4)2 -> NH4 twice
                let processed = f;
                const parenRegex = /\(([^)]+)\)(\d*)/g;
                let match;
                while ((match = parenRegex.exec(processed)) !== null) {
                    const sub = match[1];
                    const multiplier = parseInt(match[2] || '1');
                    const subCounts = parseFormula(sub);
                    for (const [sym, count] of Object.entries(subCounts)) {
                        counts[sym] = (counts[sym] || 0) + count * multiplier;
                    }
                    processed = processed.replace(match[0], '');
                }

                const elementRegex = /([A-Z][a-z]?)(\d*)/g;
                while ((match = elementRegex.exec(processed)) !== null) {
                    const sym = match[1];
                    const count = parseInt(match[2] || '1');
                    counts[sym] = (counts[sym] || 0) + count;
                }
                return counts;
            };

            const elementCounts = parseFormula(formula);
            let totalMass = 0;
            const composition: { element: string; mass: number; percent: number }[] = [];

            for (const [sym, count] of Object.entries(elementCounts)) {
                const element = ELEMENTS.find(e => e.symbol === sym);
                if (!element) throw new Error(`Unknown element: ${sym}`);
                const mass = element.mass * count;
                totalMass += mass;
                composition.push({ element: sym, mass, percent: 0 });
            }

            composition.forEach(item => {
                item.percent = (item.mass / totalMass) * 100;
            });

            setResult({ mass: totalMass, composition });
        } catch (e: any) {
            setError(e.message);
            setResult(null);
        }
    };

    return (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex items-center gap-3 relative z-10 mb-5">
                <div className="p-2 bg-brand-primary/10 rounded-xl">
                    <Thermometer className="text-brand-primary rotate-90" size={20} />
                </div>
                <h4 className="font-black text-brand-text uppercase tracking-tighter">Molar Mass Calculator</h4>
            </div>
            <div className="flex gap-2 relative z-10">
                <input 
                    type="text" 
                    value={formula}
                    onChange={e => setFormula(e.target.value)}
                    placeholder="e.g., C6H12O6"
                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none font-mono tracking-widest placeholder:text-brand-text-secondary/50 transition-all font-bold"
                />
                <button 
                    onClick={calculateMolarMass}
                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(66,153,225,0.4)] transition-all active:scale-95"
                >
                    Calc
                </button>
            </div>
            {error && <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mt-2 ml-1">{error}</p>}
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 relative z-10"
                >
                    <div className="p-5 bg-brand-bg/80 rounded-2xl border border-brand-primary/20 backdrop-blur-sm flex justify-between items-center shadow-inner">
                        <div>
                            <span className="text-[10px] text-brand-text-secondary uppercase font-black tracking-widest block mb-0.5">Molecular Weight</span>
                            <span className="text-2xl font-black text-brand-primary font-mono tracking-tighter">{result.mass.toFixed(4)} <span className="text-sm opacity-60">g/mol</span></span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-brand-primary/20 border-r-brand-primary animate-spin-slow" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase font-black text-brand-text-secondary tracking-[0.2em] pl-1">Elemental Composition</p>
                        <div className="grid grid-cols-1 gap-2.5">
                            {result.composition.map(item => (
                                <div key={item.element} className="flex items-center gap-4 bg-brand-bg/40 p-3 rounded-xl border border-brand-border h-12 group/row hover:border-brand-primary/30 transition-all">
                                    <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center font-black text-brand-primary border border-brand-border shadow-md">
                                        {item.element}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter px-0.5 opacity-70">
                                            <span>{item.mass.toFixed(2)} u</span>
                                            <span>{item.percent.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-brand-bg rounded-full overflow-hidden p-[1px] border border-brand-border">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percent}%` }}
                                                className="h-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(66,153,225,0.5)]" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const SolubilityChecker = () => {
    const [cation, setCation] = useState('');
    const [anion, setAnion] = useState('');
    const [result, setResult] = useState<{ soluble: boolean; rule: string } | null>(null);

    const checkSolubility = () => {
        if (!cation || !anion) return;

        // Simplified solubility logic
        let soluble = true;
        let rule = "Generally soluble";

        const cations = cation.toLowerCase();
        const anions = anion.toLowerCase();

        // 1. Nitrates, Acetates, Group 1, Ammonium are always soluble
        if (anions === 'no3' || anions === 'c2h3o2' || cations === 'li' || cations === 'na' || cations === 'k' || cations === 'nh4') {
            soluble = true;
            rule = "Nitrates, Acetates, and Group 1/Ammonium compounds are always soluble.";
        } 
        // 2. Chlorides, Bromides, Iodides
        else if (anions === 'cl' || anions === 'br' || anions === 'i') {
            if (cations === 'ag' || cations === 'pb' || cations === 'hg2') {
                soluble = false;
                rule = "Halides are insoluble when paired with Ag+, Pb2+, or Hg2^2+.";
            } else {
                soluble = true;
                rule = "Most halides are soluble.";
            }
        }
        // 3. Sulfates
        else if (anions === 'so4') {
            if (['ba', 'sr', 'pb', 'ca', 'ag'].includes(cations)) {
                soluble = false;
                rule = "Sulfates of Ba, Sr, Pb, Ca, and Ag are insoluble/slightly soluble.";
            } else {
                soluble = true;
                rule = "Most sulfates are soluble.";
            }
        }
        // 4. Hydroxides, Carbonates, Phosphates, Sulfides
        else if (['co3', 'po4', 'oh', 's'].includes(anions)) {
            // Exceptions already handled in step 1 (Group 1/Ammonium)
            soluble = false;
            rule = "Carbonates, Phosphates, Sulfides, and Hydroxides are generally insoluble.";
        }

        setResult({ soluble, rule });
    };

    return (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full -ml-16 -mt-16 blur-3xl opacity-50" />
            <div className="flex items-center gap-3 relative z-10 mb-5">
                <div className="p-2 bg-brand-primary/10 rounded-xl">
                    <Layers className="text-brand-primary" size={20} />
                </div>
                <h4 className="font-black text-brand-text uppercase tracking-tighter">Solubility Checker</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest ml-1">Cation</label>
                    <select 
                        value={cation}
                        onChange={e => setCation(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                    >
                        <option value="">Select...</option>
                        <option value="li">Li+</option>
                        <option value="na">Na+</option>
                        <option value="k">K+</option>
                        <option value="nh4">NH4+</option>
                        <option value="ag">Ag+</option>
                        <option value="pb">Pb2+</option>
                        <option value="ba">Ba2+</option>
                        <option value="ca">Ca2+</option>
                        <option value="fe">Fe3+</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-brand-text-secondary tracking-widest ml-1">Anion</label>
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
                Check State
            </button>

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
                                {result.soluble ? 'Soluble (aq)' : 'Insoluble (s)'}
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

const PeriodicTable = () => {
    const [selected, setSelected] = useState<Element | null>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('category');
    const [showTrends, setShowTrends] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    const isAnyMatch = useMemo(() => {
        if (!search) return true;
        return ELEMENTS.some(e => 
            e.name.toLowerCase().includes(search.toLowerCase()) || 
            e.symbol.toLowerCase().includes(search.toLowerCase()) ||
            e.number.toString() === search
        );
    }, [search]);

    const getElementStyle = (element: Element) => {
        const isHoveredCat = hoveredCategory === element.category;
        const opacity = (hoveredCategory && !isHoveredCat) ? '0.2' : '1';
        const color = CATEGORY_COLORS[element.category] || element.color;

        if (viewMode === 'category') {
            return {
                background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                borderColor: `${color}44`,
                borderLeftWidth: '4px',
                borderLeftColor: color,
                color: color,
                opacity
            };
        }
        
        if (viewMode === 'electronegativity') {
            if (element.electronegativity === null) return { backgroundColor: '#1a202c', borderLeft: '4px solid #4a5568', opacity };
            const intensity = (element.electronegativity / 4) * 255;
            const trendColor = `rgb(${intensity}, ${intensity * 0.2}, ${255 - intensity})`;
            return { background: `linear-gradient(135deg, ${trendColor}33, ${trendColor}11)`, borderLeft: `4px solid ${trendColor}`, borderColor: `${trendColor}44`, color: trendColor, opacity };
        }

        if (viewMode === 'atomic_radius') {
            if (element.atomic_radius === null) return { backgroundColor: '#1a202c', borderLeft: '4px solid #4a5568', opacity };
            const intensity = (element.atomic_radius / 200) * 255;
            const trendColor = `rgb(${intensity * 0.5}, ${intensity}, ${255 - intensity * 0.5})`;
            return { background: `linear-gradient(135deg, ${trendColor}33, ${trendColor}11)`, borderLeft: `4px solid ${trendColor}`, borderColor: `${trendColor}44`, color: trendColor, opacity };
        }

        return { opacity };
    };

    const getElementProperty = (element: Element) => {
        if (viewMode === 'electronegativity') return element.electronegativity?.toFixed(2) || '-';
        if (viewMode === 'atomic_radius') return element.atomic_radius ? `${element.atomic_radius}pm` : '-';
        return element.number;
    };

    const categories = Array.from(new Set(ELEMENTS.map(e => e.category)));

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-brand-surface/50 p-4 rounded-2xl border border-brand-border">
                <div className="flex items-center gap-4 bg-brand-primary/10 px-6 py-3 rounded-2xl border border-brand-primary/20 shadow-lg">
                    <div className="p-2 bg-brand-primary rounded-lg text-white">
                        <Atom size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-text tracking-tighter uppercase leading-none">Periodic Table</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Chemical Intelligence System</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border h-10 shadow-inner">
                        <button onClick={() => setViewMode('category')} className={`px-4 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'category' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <Layers size={12} /> Standard
                        </button>
                        <button onClick={() => setViewMode('electronegativity')} className={`px-4 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'electronegativity' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <TrendingUp size={12} /> Electronegativity
                        </button>
                        <button onClick={() => setViewMode('atomic_radius')} className={`px-4 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'atomic_radius' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:text-brand-text'}`}>
                            <TrendingUp size={12} className="rotate-90" /> radius
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowTrends(!showTrends)}
                        className={`h-10 px-4 rounded-xl border border-brand-border flex items-center gap-2 text-xs font-bold transition-all ${showTrends ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text'}`}
                    >
                        <BarChart3 size={16} /> {showTrends ? 'Hide' : 'Trends'}
                    </button>

                    <div className="relative flex-1 md:flex-initial min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={16} />
                        <input 
                            type="text"
                            placeholder="Element, Symbol, #..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                </div>
            </div>

            {showTrends && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-brand-surface border border-brand-border rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-brand-text flex items-center gap-2">
                            <BarChart3 size={18} className="text-brand-primary" /> Elemental Trends
                        </h4>
                        <div className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-widest bg-brand-bg px-3 py-1 rounded-full border border-brand-border">
                            Plotting by Atomic Number (Z)
                        </div>
                    </div>
                    <div className="h-72 w-full bg-brand-bg/50 rounded-2xl p-4 border border-brand-border/40">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ELEMENTS.sort((a,b) => a.number - b.number)}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis 
                                    dataKey="number" 
                                    stroke="#4a5568" 
                                    fontSize={10} 
                                    tickFormatter={(val) => `Z=${val}`}
                                    label={{ value: 'Atomic Number', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#718096', fontWeight: 'bold' }} 
                                />
                                <YAxis stroke="#4a5568" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.9)', border: '1px solid #4a5568', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '4px' }}
                                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line 
                                    type="stepAfter" 
                                    dataKey={viewMode === 'electronegativity' ? 'electronegativity' : viewMode === 'atomic_radius' ? 'atomic_radius' : 'mass'} 
                                    stroke="var(--color-primary)" 
                                    strokeWidth={4} 
                                    dot={false}
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-primary)' }}
                                    name={viewMode === 'electronegativity' ? 'Electronegativity' : viewMode === 'atomic_radius' ? 'Radius (pm)' : 'Atomic Mass (u)'}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Trend Legend */}
            {viewMode !== 'category' && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between px-6 py-3 bg-brand-surface border border-brand-border rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                            <BarChart3 size={16} className="text-brand-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-text">
                            {viewMode === 'electronegativity' ? 'Electronegativity Scale (Pauling)' : 'Atomic Radius Scale (pm)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-brand-text-secondary">LOW</span>
                        <div 
                            className="w-32 h-2 rounded-full" 
                            style={{ 
                                background: viewMode === 'electronegativity' 
                                    ? 'linear-gradient(to right, rgb(0, 0, 255), rgb(255, 51, 0))' 
                                    : 'linear-gradient(to right, rgb(0, 255, 127.5), rgb(255, 255, 0))'
                            }} 
                        />
                        <span className="text-[9px] font-bold text-brand-text-secondary">HIGH</span>
                    </div>
                </motion.div>
            )}

            {/* Main Table Grid */}
            <div className="relative overflow-x-auto pb-4 pl-8 scrollbar-thin scrollbar-thumb-brand-primary/20 group">
                <div className="grid grid-cols-18 gap-1.5 min-w-[1250px] p-4 bg-brand-surface/20 rounded-3xl border border-brand-border/30 backdrop-blur-md shadow-2xl">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={`group-${i + 1}`} className="flex items-center justify-center h-8 mb-2">
                            <span className="text-[9px] font-black text-brand-primary opacity-40 tracking-widest uppercase whitespace-nowrap">
                                Group {i + 1}
                            </span>
                        </div>
                    ))}

                    {Array.from({ length: 7 * 18 }).map((_, i) => {
                        const row = Math.floor(i / 18) + 1;
                        const col = (i % 18) + 1;
                        const element = ELEMENTS.find(e => e.period === row && e.group === col);
                        const isMatch = element ? (
                            element.name.toLowerCase().includes(search.toLowerCase()) || 
                            element.symbol.toLowerCase().includes(search.toLowerCase()) ||
                            element.number.toString() === search
                        ) : false;

                        return (
                            <div key={i} className="aspect-square relative group/cell">
                                {col === 1 && (
                                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 flex justify-end">
                                        <span className="text-[9px] font-black text-brand-primary opacity-40 uppercase tracking-widest vertical-text whitespace-nowrap">
                                            Period {row}
                                        </span>
                                    </div>
                                )}
                                {element ? (
                                    <motion.button
                                        whileHover={{ scale: 1.12, zIndex: 10, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelected(element)}
                                        onMouseEnter={() => !search && setHoveredCategory(element.category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                        className={`w-full h-full rounded-xl shadow-lg flex flex-col items-center justify-between p-2.5 border transition-all duration-300 backdrop-blur-md relative overflow-hidden group/element ${selected?.number === element.number ? 'ring-2 ring-white border-transparent scale-110 z-20 shadow-brand-primary/50' : 'border-white/10'} ${(!isMatch && search) ? 'opacity-20 grayscale scale-95 blur-[1px]' : 'opacity-100 shadow-md'}`}
                                        style={getElementStyle(element)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                        
                                        <div className="w-full flex justify-between items-start z-10">
                                            <span className="text-[9px] font-black opacity-40 leading-none">{getElementProperty(element)}</span>
                                            <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: element.color }} />
                                        </div>

                                        <span className="text-lg font-black tracking-tighter z-10 leading-none -mt-1 group-hover/element:scale-110 transition-transform">{element.symbol}</span>
                                        
                                        <span className="text-[7px] font-black uppercase tracking-tight opacity-70 truncate w-full text-center z-10 leading-none">
                                            {element.name}
                                        </span>
                                        
                                        {/* Subtle Glow Background */}
                                        <div 
                                            className="absolute bottom-0 left-0 w-full h-1/3 opacity-30 pointer-events-none blur-xl group-hover/element:opacity-50 transition-opacity"
                                            style={{ backgroundColor: element.color }}
                                        />
                                    </motion.button>
                                ) : (
                                    <div className="w-full h-full border border-brand-border/10 rounded-xl bg-brand-surface/5 flex items-center justify-center group/empty transition-all">
                                        <div className="w-1 h-1 rounded-full bg-brand-border/20 group-hover/empty:scale-150 transition-transform" />
                                        <div className="absolute top-1 left-1 text-[6px] font-black text-brand-text-secondary opacity-[0.05] group-hover/empty:opacity-20 uppercase">
                                            {row}:{col}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap justify-center gap-3 px-4 py-3 bg-brand-surface/20 rounded-2xl border border-brand-border/40">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                    <div 
                        key={cat} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border/40 cursor-default transition-all ${hoveredCategory === cat ? 'bg-brand-primary/10 border-brand-primary/40 scale-105' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-text">{cat}</span>
                    </div>
                ))}
            </div>

            {!isAnyMatch && search && (
                <div className="text-center py-10 text-brand-text-secondary bg-brand-surface/20 rounded-2xl border border-dashed border-brand-border">
                    <p>No elements match your search "<span className="text-brand-primary font-bold">{search}</span>"</p>
                </div>
            )}

            {/* Additional Tools Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                <MolarMassCalculator />
                <SolubilityChecker />
            </div>

            {/* Details Panel */}
            <AnimatePresence mode="wait">
                {selected ? (
                    <motion.div
                        key={selected.number}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-brand-primary/10"
                    >
                        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                            <Atom size={300} />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-10 items-start">
                            {/* Big Element Card */}
                            <div className="w-full lg:w-48 h-48 rounded-3xl flex flex-col items-center justify-center border-2 border-brand-primary shadow-2xl bg-brand-bg relative shrink-0 overflow-hidden" 
                                 style={{ boxShadow: `0 20px 40px ${selected.color}25`, borderColor: selected.color }}>
                                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(45deg, transparent, ${selected.color})` }} />
                                <span className="text-3xl font-mono text-brand-text-secondary mb-1">{selected.number}</span>
                                <span className="text-7xl font-black text-brand-text leading-none">{selected.symbol}</span>
                                <span className="text-base font-mono text-brand-text-secondary mt-2">{selected.mass.toFixed(4)}</span>
                            </div>

                            {/* Property Matrix */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                                    <h4 className="text-4xl font-black text-brand-text tracking-tight">{selected.name}</h4>
                                    <span style={{ backgroundColor: `${selected.color}20`, color: selected.color }} 
                                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current w-fit">
                                        {selected.category}
                                    </span>
                                </div>

                                <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed bg-brand-bg/30 p-4 rounded-xl italic">
                                    "{selected.summary}"
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <DetailStat label="Density" value={selected.density || 'N/A'} unit="g/cm³" max={22.6} icon={Layers} />
                                    <DetailStat label="Melting Point" value={selected.melting_point || 'N/A'} unit="K" max={3800} icon={Thermometer} />
                                    <DetailStat label="Boiling Point" value={selected.boiling_point || 'N/A'} unit="K" max={6000} icon={Thermometer} />
                                    <DetailStat label="Electronegativity" value={selected.electronegativity || 'N/A'} max={4} icon={TrendingUp} />
                                </div>

                                <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-xl backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-black text-brand-primary tracking-widest mb-6 px-1 flex items-center gap-2">
                                        <Atom size={12} /> Quantum Structure
                                    </p>
                                    <div className="flex flex-col md:flex-row items-center gap-12">
                                        <div className="shrink-0 flex justify-center w-full md:w-auto p-4 bg-brand-bg/40 rounded-3xl border border-white/5">
                                            <BohrModel n={selected.number} color={selected.color} />
                                        </div>
                                        <div className="flex-1 space-y-6 w-full">
                                            <div className="p-4 bg-brand-bg/60 rounded-2xl border border-brand-border">
                                                <p className="text-[10px] text-brand-text-secondary uppercase font-black tracking-tighter mb-2">Electron Configuration</p>
                                                <p className="font-mono text-2xl font-black text-brand-text tracking-tighter">
                                                    {getElectronConfiguration(selected.number)}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {getShellComposition(selected.number).map((count, i) => (
                                                    <div key={i} className="flex flex-col items-center group/shell">
                                                        <div className="w-12 h-12 rounded-2xl border-2 border-brand-primary shadow-[inset_0_0_15px_rgba(66,153,225,0.2)] flex flex-col items-center justify-center bg-brand-bg/80 relative overflow-hidden group-hover/shell:scale-110 transition-transform">
                                                            <span className="text-xs font-black text-brand-text leading-none">{count}</span>
                                                            <span className="text-[8px] font-black text-brand-primary uppercase mt-0.5">e⁻</span>
                                                        </div>
                                                        <span className="text-[9px] text-brand-text-secondary mt-1.5 font-black uppercase tracking-widest">n={i+1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4">
                                    <div className="px-4 py-2 bg-brand-bg/50 border border-brand-border rounded-lg text-xs">
                                        <span className="text-brand-text-secondary uppercase text-[8px] block mb-0.5">Atomic Radius</span>
                                        <span className="font-bold">{selected.atomic_radius || 'N/A'} pm</span>
                                    </div>
                                    <div className="px-4 py-2 bg-brand-bg/50 border border-brand-border rounded-lg text-xs">
                                        <span className="text-brand-text-secondary uppercase text-[8px] block mb-0.5">Group / Period</span>
                                        <span className="font-bold">{selected.group} / {selected.period}</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 bg-brand-bg hover:bg-brand-surface rounded-full transition-colors border border-brand-border">✕</button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-brand-surface/30 border border-dashed border-brand-border/50 rounded-2xl p-12 text-center">
                        <div className="mb-4 text-brand-primary opacity-20 flex justify-center">
                            <Atom size={48} />
                        </div>
                        <p className="text-sm text-brand-text-secondary">Select an element to view detailed physical and chemical properties.</p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8 opacity-40 grayscale">
                             {categories.map(cat => (
                                 <div key={cat} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                                     <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ELEMENTS.find(e => e.category === cat)?.color }} />
                                     {cat}
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DetailStat = ({ label, value, icon: Icon, unit, max }: { label: string; value: string | number; icon: any; unit?: string; max?: number }) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    const percent = max && !isNaN(numericValue) ? (numericValue / max) * 100 : 0;

    return (
        <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-border/50 group/stat hover:border-brand-primary/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary group-hover/stat:bg-brand-primary group-hover/stat:text-white transition-colors">
                    <Icon size={12} />
                </div>
                <span className="text-[9px] uppercase font-black text-brand-text-secondary tracking-widest leading-none">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-brand-text tracking-tighter">{value}</span>
                {unit && <span className="text-[10px] font-bold text-brand-text-secondary uppercase">{unit}</span>}
            </div>
            {max && (
                <div className="mt-3 h-1 bg-brand-bg rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percent, 100)}%` }}
                        className="h-full bg-brand-primary shadow-[0_0_8px_rgba(66,153,225,0.4)]" 
                    />
                </div>
            )}
        </div>
    );
};

export default PeriodicTable;
