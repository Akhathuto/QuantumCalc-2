import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Book, 
    Search, 
    Calculator as CalcIcon, 
    Atom, 
    Dna, 
    Globe, 
    Code, 
    Zap,
    GraduationCap,
    Lightbulb
} from 'lucide-react';

const ACADEMIC_CATEGORIES = [
    { id: 'math', name: 'Mathematics', icon: CalcIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'physics', name: 'Physics', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'chemistry', name: 'Chemistry', icon: Atom, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'biology', name: 'Biology', icon: Dna, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'cs', name: 'Computer Science', icon: Code, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'history', name: 'History', icon: Globe, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'language', name: 'Language Arts', icon: Book, color: 'text-red-500', bg: 'bg-red-500/10' }
];

const FORMULAS = {
    math: [
        { name: 'Fractions Basics', formula: '\\text{Fraction} = \\frac{\\text{Numerator (Parts)}}{\\text{Denominator (Whole)}}', description: 'Helps share slices of cake or pizza' },
        { name: 'Area of Rectangle', formula: 'A = L \\times W', description: 'Finds the total flat space inside a box' },
        { name: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Solves quadratic equations of the form ax² + bx + c = 0' },
        { name: 'Pythagorean Theorem', formula: 'a^2 + b^2 = c^2', description: 'Relation between sides of a right-angled triangle' },
        { name: 'Area of Circle', formula: 'A = \\pi r^2', description: 'Total space enclosed by a circle' }
    ],
    physics: [
        { name: 'Moon Weight Law', formula: 'W_{\\text{Moon}} = \\frac{1}{6} W_{\\text{Earth}}', description: 'Calculates how light you will feel on the Moon!' },
        { name: 'Newton\'s Force Law', formula: 'F = m \\times a', description: 'Force equals mass times acceleration' },
        { name: 'Einstein\'s Energy', formula: 'E = mc^2', description: 'Mass-energy equivalence' },
        { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Equation of state for a hypothetical ideal gas' }
    ],
    chemistry: [
        { name: 'Water Molecules', formula: 'H_2O = 2 \\text{ Hydrogen} + 1 \\text{ Oxygen}', description: 'Chemical formula of clean pure water' },
        { name: 'Molarity', formula: 'M = \\frac{n}{V}', description: 'Moles of solute per liter of solution' },
        { name: 'pH Calculation', formula: 'pH = -\\log[H^+]', description: 'Measures the acidity or basicity of a solution' }
    ],
    biology: [
        { name: 'Photosynthesis Cycle', formula: '\\text{CO}_2 + \\text{Water} + \\text{Sun} \\rightarrow \\text{Sugar} + \\text{Oxygen}', description: 'How green tree leaves create fresh air and food' }
    ],
    cs: [
        { name: 'Binary Bit Scale', formula: '1 \\text{ Byte} = 8 \\text{ Bits}', description: 'Scale structure of digital memory storage' }
    ],
    history: [
        { name: 'Scale Factor representation', formula: '\\text{Map Ratio} = 1 : 100,000', description: 'Translates ocean and land dimensions onto flat maps' }
    ],
    language: [
        { name: 'Sentence Structure', formula: '\\text{Subject} + \\text{Verb} + \\text{Object}', description: 'Core structure of English sentences.' },
        { name: 'Simile vs Metaphor', formula: '\\text{Simile uses "like" or "as", Metaphor asserts identity}', description: 'Core figurative language differences.' }
    ]
};

const EXERCISES = {
    math: [
        { q: "If you cut a sweet cake into 6 equal slices and eat 2, what fraction of the cake did you eat? Simplify it!", a: "2/6 which simplifies to 1/3 of the cake", difficulty: 'Kids / Easy' },
        { q: "A square has a side length of 5 cm. What is its Perimeter and its Area?", a: "Perimeter = 20 cm, Area = 25 cm²", difficulty: 'Kids / Easy' },
        { q: "Find the roots of x² - 5x + 6 = 0", a: "x = 2, x = 3", difficulty: 'Medium' },
        { q: "Calculate the derivative of f(x) = x³ + 2x", a: "f'(x) = 3x² + 2", difficulty: 'Medium' },
        { q: "Integrate ∫(2x) dx", a: "x² + C", difficulty: 'Easy' },
        { q: "Solve for y in the system: x + y = 10, x - y = 2", a: "y = 4", difficulty: 'Medium' },
        { q: "Calculate the value of sin(π/2)", a: "1", difficulty: 'Easy' },
        { q: "What is the volume of a sphere with a radius of 3cm? (Leave in terms of π)", a: "36π cm³", difficulty: 'Hard' }
    ],
    physics: [
        { q: "Why do we weigh less on the Moon than on the Earth?", a: "Because the Moon has much less mass and pulls with only 1/6th of Earth's gravity force.", difficulty: 'Kids / Easy' },
        { q: "A car travels 100m in 5s. Find velocity.", a: "20 m/s", difficulty: 'Easy' },
        { q: "Calculate gravitational force between two 1kg masses at 1m.", a: "6.67 × 10⁻¹¹ N", difficulty: 'Hard' },
        { q: "What is the kinetic energy of a 2kg object moving at 3 m/s?", a: "9 Joules", difficulty: 'Medium' },
        { q: "If voltage is 12V and resistance is 4Ω, what is the current?", a: "3 Amperes", difficulty: 'Easy' },
        { q: "Calculate the work done when applying 10N force over 5m.", a: "50 Joules", difficulty: 'Medium' }
    ],
    chemistry: [
        { q: "What are the three core states of water, and how do we get them?", a: "Ice (Solid), Water (Liquid), Steam (Gas). Change by heating/cooling.", difficulty: 'Kids / Easy' },
        { q: "Which three particles make up an atom?", a: "Protons (positive charge), Neutrons (neutral charge), and Electrons (negative charge).", difficulty: 'Kids / Easy' },
        { q: "Balance the equation: H2 + O2 → H2O", a: "2H2 + O2 → 2H2O", difficulty: 'Medium' },
        { q: "What is the pH of pure water at 25°C?", a: "7.0 (Neutral)", difficulty: 'Easy' },
        { q: "How many moles are in 18 grams of H2O?", a: "1 mole (Molar mass of H2O is ~18 g/mol)", difficulty: 'Hard' }
    ],
    biology: [
        { q: "What is green pigment in leaves called, and what does it do?", a: "Chlorophyll. It absorbs sunlight to power food production (Photosynthesis).", difficulty: 'Kids / Easy' },
        { q: "Why do human bodies need red blood cells?", a: "To carry oxygen from your lungs to the rest of your body.", difficulty: 'Kids / Easy' },
        { q: "What is the powerhouse of the cell?", a: "Mitochondria - they generate most of the cell's supply of ATP.", difficulty: 'Medium' },
        { q: "Name the process by which DNA is copied into RNA.", a: "Transcription", difficulty: 'Hard' },
        { q: "How many bones are in the adult human body?", a: "206 bones", difficulty: 'Easy' }
    ],
    cs: [
        { q: "How do you write the normal number 5 in computer binary code?", a: "0101 (Fours column + Ones column = 4 + 1 = 5)", difficulty: 'Kids / Easy' },
        { q: "What is the difference between an If-Else decider and a Loop?", a: "A loop repeats an action multiple times, while If-Else makes a single choice.", difficulty: 'Kids / Easy' },
        { q: "What does HTML stand for?", a: "HyperText Markup Language", difficulty: 'Easy' },
        { q: "Define what a Boolean data type is.", a: "A data type that has one of two possible values (usually denoted true and false).", difficulty: 'Medium' },
        { q: "What is the time complexity of a binary search?", a: "O(log n)", difficulty: 'Hard' }
    ],
    history: [
        { q: "Name the planet in our solar system that is famous for its bright outer rings.", a: "Saturn", difficulty: 'Kids / Easy' },
        { q: "How many oceans are on the planet Earth, and which one is the largest?", a: "There are 5 oceans in total, and the Pacific Ocean is the largest.", difficulty: 'Kids / Easy' },
        { q: "In what year did the Apollo 11 first land humans on the Moon?", a: "1969", difficulty: 'Medium' },
        { q: "Who was the first woman to win a Nobel Prize?", a: "Marie Curie (in 1903 for Physics)", difficulty: 'Medium' },
        { q: "What ancient civilization built the Machu Picchu?", a: "The Inca Empire", difficulty: 'Easy' }
    ],
    language: [
        { q: "What is a noun?", a: "A word that represents a person, place, thing, or idea.", difficulty: 'Kids / Easy' },
        { q: "Identify the verb in: 'The quick brown fox jumps.'", a: "Jumps", difficulty: 'Easy' },
        { q: "What is an oxymoron?", a: "A figure of speech in which apparently contradictory terms appear in conjunction (e.g., deafening silence).", difficulty: 'Medium' },
        { q: "Give an example of alliteration.", a: "Peter Piper picked a peck of pickled peppers.", difficulty: 'Medium' },
        { q: "What is the theme of a story?", a: "The central idea, underlying message, or lesson the author wants to convey.", difficulty: 'Hard' }
    ]
};

const STUDY_NOTES = {
    math: [
        { title: 'Fractions Made Simple', points: [
            'Numerator: The top number. It shows how many pieces you have (e.g., 2 in 2/5).',
            'Denominator: The bottom number. It shows how many pieces the whole is cut into (e.g., 5 in 2/5).',
            'Equivalent Fractions: Fractions that look different but have the same value (e.g., 1/2 is the same as 2/4 and 4/8).',
            'Adding Fractions: If the bottom numbers are the same, just add the top numbers. If they are different, make them the same first!'
        ], tip: 'Always reduce/simplify your final fraction by dividing the top and bottom by their largest common factor!' },
        { title: 'Geometry Shortcuts', points: [
            'Perimeter: The total boundary distance around a shape. Just add all outer side lengths together!',
            'Area of a Rectangle: Length × Width.',
            'Area of a Triangle: 1/2 × Base × Height.',
            'Angles of a Triangle: All three angles in ANY triangle will always add up to exactly 180°.'
        ], tip: 'Think of area as the number of little 1x1 squares that can fit inside the shape.' }
    ],
    physics: [
        { title: 'Newton\'s Force Laws', points: [
            'First Law (Inertia): Objects keep doing what they are doing (resting or moving) unless a force pushes or pulls them.',
            'Second Law (F=ma): Pushing an object harder makes it speed up faster. Heavier things need more force to move.',
            'Third Law (Action & Reaction): For every push, there is an equal and opposite push back (like blowing a balloon and releasing it).'
        ], tip: 'Force is measured in Newtons (N), named after Sir Isaac Newton!' },
        { title: 'Light & Rainbows', points: [
            'Refraction: White light bends when it passes through glass or water, splitting into colors.',
            'The Rainbow Code (ROYGBIV): Red, Orange, Yellow, Green, Blue, Indigo, Violet.',
            'Speed of Light: Light is the fastest thing in the universe, traveling at 300,000 kilometers per second!'
        ], tip: 'Raindrops act as tiny prisms to split sunshine into beautiful rainbows.' }
    ],
    chemistry: [
        { title: 'What is an Atom?', points: [
            'Protons: Positively charged particles in the center (nucleus) of the atom.',
            'Neutrons: Neutral particles (no charge) in the nucleus alongside protons.',
            'Electrons: Tiny negatively charged particles buzzing around the nucleus in shells.',
            'Elements: Materials made of only one kind of atom (like pure Gold, Oxygen, or Carbon).'
        ], tip: 'Everything in the universe (including you!) is made of atoms.' },
        { title: 'States of Matter', points: [
            'Solid: Atoms packed tightly together. Keeps its own shape (like ice or a wooden brick).',
            'Liquid: Atoms can slide around. Takes the shape of the cup/container (like water).',
            'Gas: Atoms zoom around with lots of space. Fills any room completely (like oxygen or steam).'
        ], tip: 'Heating or cooling matter is what changes it from one state to another!' }
    ],
    biology: [
        { title: 'The Tree of Life (Five Kingdoms)', points: [
            'Plants (Plantae): Make their own food using sunlight (Photosynthesis) and have green chlorophyll.',
            'Animals (Animalia): Multicellular creatures that move around and eat other living things.',
            'Fungi: Includes mushrooms, yeasts, and molds. They absorb nutrients from soil or decaying matter.',
            'Protists: Single-celled micro-critters with a nucleus, like amoebas.',
            'Monera (Bacteria): Single-celled microbes without a nucleus. Some are helpful, some cause colds!'
        ], tip: 'Fungi are not plants! They cannot create food from sunlight.' },
        { title: 'Photosynthesis Formula', points: [
            'Plants take in Carbon Dioxide from the air + Water from the roots.',
            'Sunlight acts as the power source inside the green leaves.',
            'The plant creates Sugar (glucose) for food + Oxygen which it releases into the air.',
            'Equation: Carbon Dioxide + Water + Sunlight ➔ Glucose + Oxygen.'
        ], tip: 'This is why trees are so important for humans—they make the oxygen we breathe!' }
    ],
    cs: [
        { title: 'Coding Basics for Kids', points: [
            'Variables: Tiny storage boxes in memory where we hold information (like player_score = 10).',
            'Conditionals (If-Else): Decisions. IF score > 100, show "You Win!", ELSE show "Keep trying!".',
            'Loops: Repeat tasks. REPEAT 5 times to draw a beautiful star shape.',
            'Functions: Saved packages of code we can use over and over by just calling its name.'
        ], tip: 'Programming is just giving a super-detailed recipe to a computer!' },
        { title: 'Binary: Power of 2', points: [
            'Computers only speak in 1s (ON) and 0s (OFF). This is Binary.',
            'Bit: Short for Binary Digit. It is a single 1 or 0.',
            'Byte: A collection of exactly 8 bits. It represents 1 letter or number.',
            'Kilobyte (KB): About 1,000 bytes. Megabyte (MB) is 1,000 KB. Gigabyte (GB) is 1,000 MB.'
        ], tip: 'A text message uses only a few hundred bytes, while a video uses gigabytes!' }
    ],
    history: [
        { title: 'Planets of our Solar System', points: [
            'Inner Rocky Planets: Mercury (closest to Sun), Venus (hottest), Earth (our home), Mars (the red planet).',
            'Outer Gas Giants: Jupiter (largest planet with the red spot), Saturn (has beautiful rings), Uranus (rolls on its side), Neptune (cold and windy).'
        ], tip: 'Use the phrase "My Very Educated Mother Just Served Us Noodles" to remember the order!' },
        { title: 'Continents & Oceans', points: [
            'The Seven Continents: Asia (largest), Africa, North America, South America, Antarctica (coldest), Europe, Australia.',
            'The Five Oceans: Pacific (deepest & largest), Atlantic, Indian, Southern (polar cold), Arctic (smallest).'
        ], tip: 'Over 70% of the Earth is covered in salt water oceans!' }
    ],
    language: [
        { title: 'Parts of Speech', points: [
            'Noun: A person, place, thing, or idea (e.g., dog, city, happiness).',
            'Verb: An action or state of being (e.g., run, is, think).',
            'Adjective: Describes a noun (e.g., red, beautiful, quickly).',
            'Adverb: Describes a verb, adjective, or another adverb (e.g., quickly, very).'
        ], tip: 'Use strong verbs and adjectives to make your writing more vivid!' },
        { title: 'Literary Devices', points: [
            'Simile: Comparing two things using "like" or "as" (e.g., brave as a lion).',
            'Metaphor: Comparing two things directly without "like" or "as" (e.g., time is a thief).',
            'Personification: Giving human qualities to non-human things (e.g., the wind whispered).'
        ], tip: 'Literary devices bring poetry and creative writing to life!' }
    ]
};

const ExerciseReference = () => {
    const [selectedCat, setSelectedCat] = useState('math');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'formulas' | 'exercises' | 'notes'>('formulas');
    const [revealedExercises, setRevealedExercises] = useState<Record<string, boolean>>({});

    const filteredFormulas = (FORMULAS[selectedCat as keyof typeof FORMULAS] || []).filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) || 
        f.description.toLowerCase().includes(search.toLowerCase())
    );

    const filteredExercises = (EXERCISES[selectedCat as keyof typeof EXERCISES] || []).filter(e => 
        e.q.toLowerCase().includes(search.toLowerCase())
    );

    const filteredNotes = (STUDY_NOTES[selectedCat as keyof typeof STUDY_NOTES] || []).filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.points.some(p => p.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-lg shadow-brand-primary/5">
                            <Book size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">Academic Nexus</span>
                    </div>
                    <h1 className="text-6xl font-black text-brand-text leading-none tracking-tightest">
                        Scholastic <br />
                        <span className="text-brand-primary">Repository</span>
                    </h1>
                    <p className="text-xl text-brand-text-secondary max-w-2xl leading-relaxed font-light italic">
                        A curated archive of computational blueprints, universal constants, and cognitive evaluation modules.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-brand-surface/40 px-8 py-6 rounded-[2rem] border border-brand-border/50 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Knowledge Nodes</div>
                        <div className="text-3xl font-black text-brand-text">1,248</div>
                    </div>
                    <div className="bg-brand-primary/5 px-8 py-6 rounded-[2rem] border border-brand-primary/20 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Active Exercises</div>
                        <div className="text-3xl font-black text-brand-primary font-mono">42+</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Category Sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-brand-surface/40 p-6 rounded-[2.5rem] border border-brand-border/50 backdrop-blur-md shadow-xl">
                        <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] mb-6 ml-2">Knowledge Domains</h4>
                        <div className="space-y-2">
                            {ACADEMIC_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${selectedCat === cat.id ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-xl scale-105' : 'bg-brand-bg/40 text-brand-text-secondary border-transparent hover:border-brand-border hover:bg-brand-surface/60'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCat === cat.id ? 'bg-white/20' : cat.bg + ' ' + cat.color}`}>
                                        <cat.icon size={20} />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/20">
                        <div className="flex items-center gap-3 text-brand-primary mb-4">
                            <Lightbulb size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cognitive Tip</span>
                        </div>
                        <p className="text-[11px] text-brand-text-secondary leading-relaxed font-medium">Use the <span className="text-brand-primary">Logic Scratchpad</span> in Student Tools to derive these formulas from first principles.</p>
                    </div>
                </div>

                {/* Listing Area */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Top Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex bg-brand-surface/40 p-1.5 rounded-2xl border border-brand-border/50 w-full md:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('formulas')}
                                className={`flex-1 md:w-40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'formulas' ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'}`}
                            >
                                Formula Matrix
                            </button>
                            <button
                                onClick={() => setActiveTab('exercises')}
                                className={`flex-1 md:w-40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'exercises' ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'}`}
                            >
                                Practice Modules
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 md:w-40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'}`}
                            >
                                Syllabus Notes
                            </button>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filter repository..."
                                className="w-full bg-brand-surface/40 border-2 border-brand-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCat + activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {activeTab === 'formulas' ? (
                                filteredFormulas.length > 0 ? (
                                    filteredFormulas.map((f, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 hover:border-brand-primary/50 transition-all group/card shadow-xl"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-lg font-black text-brand-text tracking-tight group-hover/card:text-brand-primary transition-colors">{f.name}</h3>
                                                <div className="p-2 bg-brand-bg/50 rounded-lg text-brand-text-secondary/30 group-hover/card:text-brand-primary transition-colors">
                                                    <Zap size={14} />
                                                </div>
                                            </div>
                                            <div className="bg-brand-bg/60 p-6 rounded-2xl border border-brand-border/50 mb-6 flex items-center justify-center min-h-[100px] shadow-inner">
                                                <div className="text-xl font-mono text-brand-text tracking-widest text-center">
                                                    {f.formula}
                                                </div>
                                            </div>
                                            <p className="text-sm text-brand-text-secondary leading-relaxed font-light line-clamp-2 italic opacity-80">{f.description}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 text-center opacity-20">
                                        <Search size={64} className="mx-auto mb-6" />
                                        <div className="text-[10px] font-black uppercase tracking-[0.6em]">Zero matches in current domain</div>
                                    </div>
                                )
                            ) : activeTab === 'exercises' ? (
                                filteredExercises.length > 0 ? (
                                    filteredExercises.map((e, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl space-y-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Active Evaluator</span>
                                                </div>
                                                <div className="px-3 py-1 bg-brand-bg/50 rounded-full border border-brand-border text-[9px] font-black uppercase tracking-widest text-brand-text-secondary">
                                                    {e.difficulty}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-lg font-black text-brand-text tracking-tight leading-tight">{e.q}</p>
                                                {!revealedExercises[`${selectedCat}_${i}`] ? (
                                                    <button 
                                                        onClick={() => setRevealedExercises({...revealedExercises, [`${selectedCat}_${i}`]: true})} 
                                                        className="w-full py-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-xs font-black uppercase tracking-widest text-brand-text-secondary hover:text-brand-text transition-all mt-4"
                                                    >
                                                        Reveal Answer
                                                    </button>
                                                ) : (
                                                    <div className="pt-6 border-t border-brand-border/20 animate-fade-in">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-[9px] font-black text-brand-text-secondary/40 uppercase tracking-[0.4em]">Computational Result</div>
                                                            <button 
                                                                onClick={() => setRevealedExercises({...revealedExercises, [`${selectedCat}_${i}`]: false})}
                                                                className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors"
                                                            >
                                                                Hide
                                                            </button>
                                                        </div>
                                                        <div className="text-md font-mono text-emerald-400 font-bold bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 shadow-inner">
                                                            {e.a}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 text-center opacity-20">
                                        <GraduationCap size={64} className="mx-auto mb-6" />
                                        <div className="text-[10px] font-black uppercase tracking-[0.6em]">Modular content currently offline</div>
                                    </div>
                                )
                            ) : (
                                filteredNotes.length > 0 ? (
                                    filteredNotes.map((n, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 shadow-xl space-y-6 flex flex-col justify-between"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary shadow-sm">
                                                        <Book size={16} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-brand-primary uppercase tracking-widest">Syllabus Study Card</h4>
                                                        <p className="text-[9px] text-brand-text-secondary font-mono tracking-widest uppercase mt-0.5">Reference Sheet</p>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-black text-brand-text leading-tight tracking-tight border-b border-brand-border/20 pb-2">{n.title}</h3>

                                                <ul className="space-y-3.5">
                                                    {n.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="flex gap-3 text-xs text-brand-text-secondary leading-relaxed font-medium">
                                                            <span className="font-mono text-[10px] text-brand-primary font-black pt-0.5">0{pIdx + 1}</span>
                                                            <p>{pt}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mt-4 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                                                <div className="flex items-center gap-2 mb-1.5 font-mono text-[9px] uppercase tracking-widest text-brand-primary font-bold">
                                                    <Lightbulb size={12} /> Expert Revision Tip
                                                </div>
                                                <p className="text-[11px] text-brand-text-secondary font-light italic leading-relaxed">{n.tip}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 text-center opacity-20">
                                        <Book size={64} className="mx-auto mb-6 text-brand-primary/60" />
                                        <div className="text-[10px] font-black uppercase tracking-[0.6em]">Zero Study notes found</div>
                                    </div>
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExerciseReference;
