import { useState } from 'react';
import { motion } from 'motion/react';
import { 
    BookOpen, 
    Sparkles, 
    Brain, 
    Award, 
    ArrowLeft, 
    ArrowRight, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Zap, 
    Lightbulb, 
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getApiKey } from '../services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";

interface QuizQuestion {
    q: string;
    options: string[];
    correctIdx: number;
    explanation: string;
}

interface Chapter {
    title: string;
    content: string;
}

interface Lesson {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    summary: string;
    chapters: Chapter[];
    derivationSteps: string[];
    quiz: QuizQuestion[];
}

const PREBUILT_LESSONS: Lesson[] = [
    {
        id: 'lin_alg',
        title: 'Linear Algebra & Vector Spaces',
        subject: 'Mathematics',
        difficulty: 'Undergraduate',
        summary: 'Explore vector geometry, span, basis, linear independence, and the topological properties of multi-dimensional spaces.',
        chapters: [
            {
                title: 'Vector Space Foundations',
                content: 'A vector space $V$ over a field $F$ is a set of objects (vectors) closed under two operations: **vector addition** ($u + v \\in V$) and **scalar multiplication** ($c v \\in V$), satisfying the following eight axioms:\n\n1. **Associativity of addition**: $u + (v + w) = (u + v) + w$\n2. **Commutativity of addition**: $u + v = v + u$\n3. **Identity element of addition**: There exists $0 \\in V$ such that $v + 0 = v$\n4. **Inverse elements of addition**: For any $v \\in V$, there exists $-v \\in V$ such that $v + (-v) = 0$\n5. **Identity element of scalar multiplication**: $1v = v$\n6. **Distributivity of scalar multiplication**: $c(u+v) = cu + cv$\n7. **Distributivity of scalar addition**: $(c+d)v = cv + dv$\n8. **Compatibility of scalar multiplication**: $c(dv) = (cd)v$\n\nThese structures form the foundational canvas of linear mathematical representation.'
            },
            {
                title: 'Linear Independence, Span, and Basis',
                content: 'Let $S = \\{v_1, v_2, \\dots, v_n\\}$ be a subset of a vector space $V$.\n\n* **Linear Independence**: The set $S$ is linearly independent if the only solution to the vector equation\n  $$c_1 v_1 + c_2 v_2 + \\dots + c_n v_n = 0$$\n  is the trivial solution: $c_1 = c_2 = \\dots = c_n = 0$. If a non-trivial solution exists, the vectors are dependent.\n* **Span**: The span of $S$ is the set of all linear combinations of the vectors in $S$:\n  $$\\text{Span}(S) = \\left\\{ \\sum_{i=1}^n c_i v_i \\;\\middle|\\; c_i \\in F \\right\\}$$\n* **Basis**: A set $B \\subset V$ is a basis of $V$ if it is linearly independent and spans $V$. The number of vectors in a basis is called the **dimension** of $V$.'
            }
        ],
        derivationSteps: [
            'Objective: Prove that the identity vector in a vector space V is unique.',
            'Assume there exist two identity vectors, $0_1$ and $0_2$, in the vector space V.',
            'By the definition of an additive identity, adding $0_2$ to any vector $v$ yields $v$, so: $0_1 + 0_2 = 0_1$.',
            'Applying commutativity ($u + v = v + u$): $0_1 + 0_2 = 0_2 + 0_1$.',
            'By definition of $0_1$ being an additive identity, adding it to $0_2$ yields: $0_2 + 0_1 = 0_2$.',
            'Thus, transitively, we have $0_1 = 0_1 + 0_2 = 0_2 + 0_1 = 0_2$, proving $0_1 = 0_2$ is unique.'
        ],
        quiz: [
            {
                q: 'Which of the following describes a linearly independent set of vectors?',
                options: [
                    'Every vector in the set can be represented as a linear combination of the other vectors.',
                    'The trivial combination is the only linear combination that equals the zero vector.',
                    'The vectors span the entire infinite vector space.',
                    'None of the vectors are perpendicular to each other.'
                ],
                correctIdx: 1,
                explanation: 'A set is linearly independent if and only if the vector equation c1v1 + c2v2 + ... = 0 has only the unique solution where all scalars are zero.'
            },
            {
                q: 'If a vector space is spanned by a set of 4 vectors, what is the maximum possible dimension of this space?',
                options: [
                    'The dimension is exactly 4.',
                    'The dimension cannot exceed 4.',
                    'The dimension is always infinite.',
                    'The dimension must be exactly 2.'
                ],
                correctIdx: 1,
                explanation: 'The dimension of a vector space (number of vectors in any basis) is at most the number of vectors in any spanning set.'
            }
        ]
    },
    {
        id: 'schrodinger',
        title: 'Quantum Mechanics & Schrödinger Equation',
        subject: 'Physics',
        difficulty: 'Graduate',
        summary: 'Analyze the quantum state of physical systems, wave-particle duality, probabilistic wavefunctions, and first-principles of wave movements.',
        chapters: [
            {
                title: 'The Wavefunction Postulate',
                content: 'In quantum mechanics, the state of a physical system is described completely by a complex-valued wavefunction $\\Psi(x, t)$.\n\nThe physical interpretation of $\\Psi$ is given by Born\'s Postulate: the probability density of finding a particle at position $x$ at time $t$ is equal to the squared magnitude of the wavefunction:\n$$P(x, t) = |\\Psi(x, t)|^2 = \\Psi^*(x, t)\\Psi(x, t)$$\nSince the particle must exist somewhere in space, the wavefunction must satisfy the **normalization condition**:\n$$\\int_{-\\infty}^{\\infty} |\\Psi(x, t)|^2 dx = 1$$'
            },
            {
                title: 'The Schrödinger Equation Formulation',
                content: 'The time-dependent Schrödinger equation governs the wave motion mechanics of quantum particles:\n$$i\\hbar \\frac{\\partial}{\\partial t}\\Psi(x, t) = \\hat{H}\\Psi(x, t)$$\nwhere $i$ is the imaginary unit, $\\hbar = h / 2\\pi$ is the reduced Planck constant, and $\\hat{H}$ is the Hamiltonian operator representing the total energy of the system:\n$$\\hat{H} = -\\frac{\\hbar^2}{2m}\\frac{\\partial^2}{\\partial x^2} + V(x, t)$$\nFor simple conservative systems, we separate variables $\\Psi(x, t) = \\psi(x)e^{-iEt/\\hbar}$ to get the Time-Independent Schrödinger Equation (TISE):\n$$-\\frac{\\hbar^2}{2m} \\frac{d^2}{dx^2}\\psi(x) + V(x)\\psi(x) = E\\psi(x)$$'
            }
        ],
        derivationSteps: [
            'Objective: Formulate the momentum operator in quantum mechanics using first principles.',
            'Consider a free-particle wavefunction traveling as a plane wave: $\\Psi(x, t) = A e^{i(kx - \\omega t)}$.',
            'Substitute quantum energy relationships: $E = \\hbar\\omega$ and momentum $p = \\hbar k$, giving: $\\Psi(x, t) = A e^{\\frac{i}{\\hbar}(px - Et)}$.',
            'Take the spatial derivative of the wavefunction: $\\frac{\\partial}{\\partial x}\\Psi = \\frac{ip}{\\hbar} \\Psi$.',
            'Isolate the momentum variable: $p \\Psi = \\frac{\\hbar}{i} \\frac{\\partial}{\\partial x} \\Psi = -i\\hbar \\frac{\\partial}{\\partial x} \\Psi$.',
            'Thus, we identify the quantum mechanical momentum operator as: $\\hat{p} = -i\\hbar \\frac{\\partial}{\\partial x}$.'
        ],
        quiz: [
            {
                q: 'What is the physical interpretation of the square of the absolute value of the wavefunction?',
                options: [
                    'It represents the absolute physical momentum of the system.',
                    'It represents the energy distribution across Euclidean space.',
                    'It represents the probability density of finding the particle at a given point.',
                    'It represents the physical speed vector of the wavefunction.'
                ],
                correctIdx: 2,
                explanation: 'According to Born-s postulate, |Ψ(x,t)|² is the probability density function for the position coordinates of the particle.'
            },
            {
                q: 'Which operator represents the total mechanical energy in a quantum system?',
                options: [
                    'The Momentum operator.',
                    'The Hamiltonian operator.',
                    'The Born operator.',
                    'The Weyl-Heisenberg operator.'
                ],
                correctIdx: 1,
                explanation: 'The Hamiltonian operator represents the total energy (kinetic + potential) of the quantum particle system.'
            }
        ]
    },
    {
        id: 'back_prop',
        title: 'Deep Learning & Backpropagation',
        subject: 'Computer Science',
        difficulty: 'Graduate',
        summary: 'Deconstruct artificial neural structures, active layer weights, gradients optimization, and algorithmic backpropagation flow.',
        chapters: [
            {
                title: 'The Neural Architecture Layer',
                content: 'A single artificial neuron processes input signals as a weighted vector addition, transforming the sum via a non-linear activation function.\n\nLet $x \\in \\mathbb{R}^d$ be the vector of input activations from layer $L-1$. The pre-activation output $z$ of a neuron in layer $L$ is modeled by:\n$$z = w^T x + b = \\sum_{j=1}^d w_j x_j + b$$\nwhere $w \\in \\mathbb{R}^d$ is the weight matrix vector, and $b \\in \\mathbb{R}$ is the scalar bias.\n\n This scalar pre-activation value is then mapped into a non-linear dimension through an activation function $\\sigma(z)$, such as the Sigmoid, Tanh, or Rectified Linear Unit (ReLU):\n$$a = \\sigma(z) = \\max(0, z)$$'
            },
            {
                title: 'Cost Minimization & Gradients',
                content: 'To train an artificial network, we define a loss objective function $C$ (such as Mean Squared Error) over predicted and ground-truth dimensions.\n\nBackpropagation computes the gradient of the cost function $C$ with respect to every weight $w$ and bias $b$ in the network, leveraging the **multivariable chain rule** from calculus. For a single neuron, the cost gradient depends directly on its pre-activation output $z$:\n$$\\frac{\\partial C}{\\partial w_{jk}^L} = a_k^{L-1} \\delta_j^L$$\nwhere $\\delta_j^L = \\frac{\\partial C}{\\partial z_j^L}$ is the error vector value at layer $L$, computed recursively.'
            }
        ],
        derivationSteps: [
            'Objective: Derive the error factor $\\delta^L$ of the final output layer L using the calculus chain rule.',
            'Let the network loss error function be $C$, and the final output layer pre-activation vector be $z^L$.',
            'By definition, final layer error is defined as: $\\delta^L = \\frac{\\partial C}{\\partial z^L}$.',
            'Insert the final output activation transition: $a^L = \\sigma(z^L)$, where $\\sigma$ is the scalar function.',
            'Apply the multivariable chain rule to split the derivative: $\\delta^L = \\frac{\\partial C}{\\partial a^L} \\cdot \\frac{d a^L}{d z^L}$.',
            'Computing the final derivative yields: $\\delta^L = \\frac{\\partial C}{\\partial a^L} \\odot \\sigma\'(z^L)$ which represents final error.'
        ],
        quiz: [
            {
                q: 'Which calculus concept explains how error signals propagate backward through multiple activation layers?',
                options: [
                    'Implicit Integration.',
                    'The Chain Rule for composite functions.',
                    'Taylor Series expansions.',
                    'Stokes Theorem of vector calculus.'
                ],
                correctIdx: 1,
                explanation: 'Backpropagation uses the multivariate calculus Chain Rule to calculate derivatives of cost with respect to weights/biases layer by layer.'
            },
            {
                q: 'What is the main role of non-linear activation functions in deep learning models?',
                options: [
                    'They restrict networks to positive predictions.',
                    'They speed up calculations by skipping division steps.',
                    'They enable networks to represent complex, non-linear relationships in data.',
                    'They establish physical connections to human nerve models.'
                ],
                correctIdx: 2,
                explanation: 'Without non-linear activation functions, a multi-layer neural network behaves exactly like a single-layer linear model.'
            }
        ]
    },
    {
        id: 'kids_fractions',
        title: 'Intro to Fractions & Visual Pizza Slices',
        subject: 'Mathematics',
        difficulty: 'Primary School',
        summary: 'Understand how sharing pizzas, cakes, and candy lets us discover the magic of fractions! Fully offline-ready.',
        chapters: [
            {
                title: 'What is a Fraction?',
                content: 'A fraction is simply a way to write a **piece or part of a whole object**.\n\nImagine you have a single piping-hot round pizza. It is **1 whole** pizza. If you slice it down the middle, you get **2 equal parts**.\n\nEach part is **one half** of the pizza, written as:\n$$\\frac{1}{2}$$\n\n* **Numerator (Top Number)**: How many parts you are counting or holding. (Here, you have 1 slice)\n* **Denominator (Bottom Number)**: How many equal pieces the whole object was sliced into. (Here, the pizza was cut into 2 total parts)\n\nIf you slice each half again, you get a total of **4 equal parts** (quarters). Each slice is:\n$$\\frac{1}{4}$$\n\nEaten 3 slices of a 4-piece pizza leaves just 1 slice. You ate $\\frac{3}{4}$, with $\\frac{1}{4}$ left for your friends!'
            },
            {
                title: 'Adding Same-Size Slices',
                content: 'Adding fractions is super-simple when the **denominators are the exact same number**.\n\nAssume you have 1 quarter slice ($\\frac{1}{4}$) of a cake on Plate A, and 2 quarter slices ($\\frac{2}{4}$) on Plate B.\n\nBecause both plates have a 4 at the bottom, the slices are **precisely the same size**. So, we can just add the numerators (the top numbers) up directly:\n$$\\frac{1}{4} + \\frac{2}{4} = \\frac{1 + 2}{4} = \\frac{3}{4}$$\n\nIf you have different denominators, like $\\frac{1}{2}$ and $\\frac{1}{4}$, you must slice the half in two first to make them equal quarters! $\\frac{1}{2} = \\frac{2}{4}$. Thus:\n$$\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$$\n\nYou are now an official fraction grandmaster!'
            }
        ],
        derivationSteps: [
            'Objective: Add $1/2$ and $1/4$ together using common denominators.',
            'Observe denominators: 2 and 4 are different, so we cannot combine them directly.',
            'To make them equal, we must scale the smaller denominator (2) to match 4.',
            'Multiply the top and bottom of $1/2$ by 2: $\\frac{1 \\times 2}{2 \\times 2} = \\frac{2}{4}$.',
            'Now substitute back: we have $\\frac{2}{4} + \\frac{1}{4}$. The denominators are identical.',
            'Combine numerators: $2 + 1 = 3$. The denominator remains 4.',
            'Result: $\\frac{3}{4}$ of a cake, demonstrating visual slice combination perfectly!'
        ],
        quiz: [
            {
                q: 'If you divide an apple into 8 equal slices and eat 5 of them, what fraction of the apple is left?',
                options: [
                    '5 / 8 of the apple',
                    '3 / 8 of the apple',
                    '8 / 8 of the apple',
                    '1 / 2 of the apple'
                ],
                correctIdx: 1,
                explanation: 'Eating 5 out of 8 slices leaves 3 slices remaining, which is represented as 3/8.'
            },
            {
                q: 'What is the mathematical result of adding 2/5 and 1/5?',
                options: [
                    '3 / 10',
                    '3 / 5',
                    '2 / 25',
                    '1 / 5'
                ],
                correctIdx: 1,
                explanation: 'Since the denominators are equal, keep them as 5 and add the top numerators: 2 + 1 = 3.'
            }
        ]
    },
    {
        id: 'kids_gravity',
        title: 'Gravity, Space & Orbiting Moons',
        subject: 'Science',
        difficulty: 'Middle School',
        summary: 'Unlock the invisible pull that holds our feet on the ground and guides the Earth around the Sun without flying off!',
        chapters: [
            {
                title: 'The Invisible Pull of Mass',
                content: 'Gravity is an invisible pulling force. **Every single object with mass pulls on every other object.**\n\nBecause our Earth has a massive amount of weight, it pulls continuously on your body, water, houses, and atmosphere to keep them resting securely on the surface!\n\n* **Isaac Newton\'s Apple**: Legend says Sir Isaac Newton sat under an apple tree. When a ripe apple hit the ground, he asked: *Why does the apple fall straight down, instead of drifting sideways or upwards?*\n* **Mass and Strength**: The heavier an object is, the stronger its gravity pulls. Earth is so huge that its pull completely dominates everything we see!'
            },
            {
                title: 'Mass vs Weight & Jumps',
                content: 'Is your **mass** the same as your **weight**? Not quite!\n\n* **Mass**: The literal amount of matter (stuff) inside your body. It is measured in kilograms ($kg$) and **never changes** whether you are on Earth, Mars, or deep in space.\n* **Weight**: The active gravity pull of of a planet acting on your mass. This changes depending on where you travel!\n\nBecause the Moon is much smaller than Earth (it contains only about 1% of Earth\'s mass), its gravity pulls you with only **one-sixth ($1/6$)** of Earth\'s strength.\n\nSince lunar gravity is so weak, you could easily jump **6 times higher** on the Moon than on Earth, even with a heavy space suit!'
            }
        ],
        derivationSteps: [
            'Objective: Understand why planets orbit in circular paths instead of crashing into the Sun.',
            'Consider a planet in space. There are two coexisting actions.',
            'First, the planet has rapid forward speed (inertia) wanting to carry it in a straight line out into deep space.',
            'Second, the Sun has gargantuan mass and gravity, pulling the planet directly towards its center.',
            'Without physical forward velocity, gravity would drag the planet directly into the hot Sun.',
            'Without Sun gravity, the planet would travel straight ahead forever and get lost in icy space.',
            'Because both motions combine perfectly, the planet continuously curves *around* the Sun, forming a stable orbital path.'
        ],
        quiz: [
            {
                q: 'If you travel to Mars, which has weaker gravity than Earth, what happens to your Mass and Weight?',
                options: [
                    'Your Mass decreases, but your Weight stays the same.',
                    'Your Mass stays exactly the same, but your Weight decreases.',
                    'Both your Mass and Weight decrease.',
                    'Both your Mass and Weight stay exactly the same.'
                ],
                correctIdx: 1,
                explanation: 'Mass is the amount of matter in your body, which never changes. Weight is gravity pull, which decreases on Mars since Mars has weaker gravity.'
            },
            {
                q: 'Why does the Moon travel in a circular orbit around the Earth instead of falling into it?',
                options: [
                    'Because magnet shields block gravity in high space.',
                    'Because its forward speed (velocity) perfectly balances the inward gravity pull.',
                    'Because atmospheric winds keep pushing it away from Earth.',
                    'Because the Moon has no gravity of its own.'
                ],
                correctIdx: 1,
                explanation: 'The high forward speed of the Moon balances the Earths gravitational pull, resulting in a continuous circular orbit.'
            }
        ]
    },
    {
        id: 'kids_binary',
        title: 'Computer Code Logic & Binary Bits',
        subject: 'Computer Science',
        difficulty: 'Primary School',
        summary: 'Speak the secret language of computers! Discover how 1s and 0s turn into modern games, audio, and animations completely offline.',
        chapters: [
            {
                title: 'The Language of 1 and 0',
                content: 'Humans communicate using words, letters, and numbers (0 to 9). Computers do not have vocal chords or normal eyes—they are built of microscopic electric switches that can only understand: **electricity ON or electricity OFF**.\n\nWe represent these two settings with two simple digits:\n* **1**: Electric current is ON\n* **0**: Electric current is OFF\n\nThis simple language is called **Binary** (base-2 code). Each individual 1 or 0 is called a **bit** (short for Binary Digit). By combining multiple bits together, we can represent letters, numbers, colors, and game instructions!\n\nFor example, 8 bits joined together make a **byte**! A single byte holds the letter \'A\' (which looks like `01000001` in binary).'
            },
            {
                title: 'Counting in Base-2',
                content: 'How do computers write normal numbers using only 1s and 0s?\n\nIn our human counting system, column values increase 10 times: Ones, Tens, Hundreds, Thousands. In binary, column values **double every step** from right to left:\n* **Eights ($8$) | Fours ($4$) | Twos ($2$) | Ones ($1$)**\n\nLet\'s construct numbers:\n* To write **1**: Put a 1 in the Ones column $\\rightarrow$ `0001`\n* To write **2**: Put a 1 in the Twos column and 0 in Ones $\\rightarrow$ `0010`\n* To write **3**: Put 1 in Twos and 1 in Ones ($2+1=3$) $\\rightarrow$ `0011`\n* To write **5**: Put 1 in Fours, 0 in Twos, and 1 in Ones ($4+1=5$) $\\rightarrow$ `0101`\n\nThis basic binary math is how computers calculate everything instantly!'
            }
        ],
        derivationSteps: [
            'Objective: Translate the computer binary code "1101" into a normal human number.',
            'Identify double column weights from right to left: Ones (1), Twos (2), Fours (4), Eights (8).',
            'Align "1101" with column weights: 1 [Eight] | 1 [Four] | 0 [Two] | 1 [One].',
            'Multiply each active digit: $(1 \\times 8) + (1 \\times 4) + (0 \\times 2) + (1 \\times 1)$.',
            'Add the values together: $8 + 4 + 0 + 1$.',
            'Find final result: $13$. Thus, the computer code "1101" stands for the human number 13!'
        ],
        quiz: [
            {
                q: 'What is the smallest unit of digital memory with a value of either 0 or 1?',
                options: [
                    'A Byte',
                    'A Bit',
                    'A Chip',
                    'A Pixel'
                ],
                correctIdx: 1,
                explanation: 'A bit is short for Binary Digit, and represents a single electric switch state of 0 (off) or 1 (on).'
            },
            {
                q: 'Which binary code correctly represents the human number 4?',
                options: [
                    '0010',
                    '0100',
                    '1000',
                    '0011'
                ],
                correctIdx: 1,
                explanation: 'Represented as columns: 8s, 4s, 2s, 1s. The code 0100 has a 1 in the Fours column only, meaning it equals exactly 4.'
            }
        ]
    }
];

const LessonsHub = ({ onLoginClick }: { onLoginClick: () => void }) => {
    // Nav & selections
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [activeChapterIdx, setActiveChapterIdx] = useState(0);
    const [derivationStep, setDerivationStep] = useState(0);
    
    // Quiz state
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [quizGraded, setQuizGraded] = useState(false);
    const [score, setScore] = useState(0);
    const [scholarRank, setScholarRank] = useState('');

    // AI custom lesson planner generators
    const [aiSubject, setAiSubject] = useState('');
    const [aiDifficulty, setAiDifficulty] = useState('Undergraduate');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiLessons, setAiLessons] = useState<Lesson[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load custom AI lesson schema
    const generateAiLesson = async () => {
        if (!aiSubject.trim()) return;
        setIsGenerating(true);
        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                onLoginClick();
                throw new Error("Gemini API key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `Construct an interactive textbook lesson about: "${aiSubject}". 
            Target Academic Level: ${aiDifficulty}.
            Formatting: Return a strict single JSON object structure. 
            Do NOT include markdown block wrappers except standard JSON response parameters. Use LaTeX syntax mathematically where appropriate ($ for inline, $$ for display). Keep content highly rigorous, academic, and detailed.
            Return exactly this structure:
            {
                "id": "${aiSubject.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}",
                "title": "${aiSubject}",
                "subject": "AI Research",
                "difficulty": "${aiDifficulty}",
                "summary": "High-level text mapping out the first principles of the topic...",
                "chapters": [
                    { "title": "First Principles & Background", "content": "Rigorously explain first principles here..." },
                    { "title": "Main Structural Analysis", "content": "Explain formulas, components, structures here..." }
                ],
                "derivationSteps": [
                    "Objective: Prove the core formula of this subject.",
                    "Define base assumptions...",
                    "Introduce mechanical changes...",
                    "Conclude with final mathematical resolution..."
                ],
                "quiz": [
                    {
                        "q": "Thought-provoking multiple choice question 1?",
                        "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
                        "correctIdx": 0,
                        "explanation": "Calculation explanation text..."
                    },
                    {
                        "q": "Thought-provoking multiple choice question 2?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctIdx": 1,
                        "explanation": "Calculus explanation text..."
                    }
                ]
            }`;

            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            subject: { type: Type.STRING },
                            difficulty: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            chapters: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        content: { type: Type.STRING }
                                    },
                                    required: ["title", "content"]
                                }
                            },
                            derivationSteps: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            quiz: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        q: { type: Type.STRING },
                                        options: {
                                            type: Type.ARRAY,
                                            items: { type: Type.STRING }
                                        },
                                        correctIdx: { type: Type.INTEGER },
                                        explanation: { type: Type.STRING }
                                    },
                                    required: ["q", "options", "correctIdx", "explanation"]
                                }
                            }
                        },
                        required: ["id", "title", "subject", "difficulty", "summary", "chapters", "derivationSteps", "quiz"]
                    }
                }
            });
            
            const rawText = response.text || '{}';
            const parsed = JSON.parse(rawText) as Lesson;
            setAiLessons(prev => [parsed, ...prev]);
            setSelectedLesson(parsed);
            setActiveChapterIdx(0);
            setDerivationStep(0);
            setSelectedAnswers({});
            setQuizGraded(false);
            setScore(0);
            setScholarRank('');
            setAiSubject('');
        } catch (error) {
            console.error("AI Lesson Generator encountered error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerSelect = (qIdx: number, optIdx: number) => {
        if (quizGraded) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [qIdx]: optIdx
        }));
    };

    const gradeQuiz = () => {
        if (!selectedLesson) return;
        let points = 0;
        selectedLesson.quiz.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctIdx) {
                points++;
            }
        });
        setScore(points);
        setQuizGraded(true);

        const percentage = (points / selectedLesson.quiz.length) * 100;
        if (percentage === 100) setScholarRank('Gold Scholar (Summa Cum Laude)');
        else if (percentage >= 60) setScholarRank('Silver Scholar (Cum Laude)');
        else setScholarRank('Bronze Scholar (Audit Credit)');
    };

    const allLessons = [...aiLessons, ...PREBUILT_LESSONS];
    const filteredLessons = allLessons.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-lg shadow-brand-primary/5">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">Liaison Syllabus</span>
                    </div>
                    <h1 className="text-6xl font-black text-brand-text leading-none tracking-tightest">
                        Academic <br />
                        <span className="text-brand-primary">Co-Pilot Lessons</span>
                    </h1>
                    <p className="text-xl text-brand-text-secondary max-w-2xl leading-relaxed font-light italic">
                        Engaging mathematical textbooks, interactive quantum mechanics, first-principles logic derivations, and an AI Syllabus builder.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-brand-surface/40 px-8 py-6 rounded-[2rem] border border-brand-border/50 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Chapters Library</div>
                        <div className="text-3xl font-black text-brand-text">{allLessons.length}</div>
                    </div>
                    <div className="bg-brand-primary/5 px-8 py-6 rounded-[2rem] border border-brand-primary/20 backdrop-blur-md">
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Knowledge Rank</div>
                        <div className="text-2xl font-black text-brand-primary font-mono">Gold Scholar</div>
                    </div>
                </div>
            </div>

            {selectedLesson ? (
                // --- LESSON SCREEN ---
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Lesson Navigation sidebar */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
                        <button
                            onClick={() => setSelectedLesson(null)}
                            className="flex items-center gap-3 px-6 py-4 bg-brand-surface rounded-2xl border border-brand-border hover:border-brand-primary/50 text-sm font-black uppercase tracking-wider text-brand-text transition-all w-full shadow-lg hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft size={16} /> Close Document Room
                        </button>

                        <div className="bg-brand-surface/40 p-6 rounded-[2.5rem] border border-brand-border/50 backdrop-blur-md shadow-xl space-y-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2 block">{selectedLesson.subject} [{selectedLesson.difficulty}]</span>
                                <h3 className="text-2xl font-black text-brand-text mb-4 leading-tight tracking-tight">{selectedLesson.title}</h3>
                                <p className="text-sm text-brand-text-secondary font-light leading-relaxed italic opacity-85">{selectedLesson.summary}</p>
                            </div>

                            <hr className="border-brand-border/30" />

                            <div>
                                <h4 className="text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.4em] mb-4">Syllabus Chapters</h4>
                                <div className="space-y-2">
                                    {selectedLesson.chapters.map((ch, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setActiveChapterIdx(idx); }}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left border ${activeChapterIdx === idx ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-xl scale-[1.03]' : 'bg-brand-bg/40 border-transparent text-brand-text-secondary hover:border-brand-border hover:bg-brand-surface/60'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${activeChapterIdx === idx ? 'bg-white/20' : 'bg-brand-surface border border-brand-border text-brand-primary'}`}>
                                                    0{idx + 1}
                                                </div>
                                                <span className="font-bold text-sm tracking-tight truncate max-w-[180px]">{ch.title}</span>
                                            </div>
                                            <ChevronRightIcon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Derivation Steps Component */}
                        <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/20 space-y-6">
                            <div className="flex items-center gap-3 text-brand-primary">
                                <Brain size={20} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Interactive Derivation Matrix</span>
                            </div>

                            <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-border/50 min-h-[140px] flex flex-col justify-between shadow-inner">
                                <p className="text-[11px] text-brand-text-secondary leading-relaxed font-mono">
                                    {selectedLesson.derivationSteps[derivationStep]}
                                </p>
                                <div className="text-[9px] text-brand-primary font-bold uppercase tracking-widest mt-4 flex items-center justify-between">
                                    <span>Step {derivationStep + 1} of {selectedLesson.derivationSteps.length}</span>
                                    {derivationStep === selectedLesson.derivationSteps.length - 1 && (
                                        <span className="text-emerald-500 animate-pulse">// Complete</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDerivationStep(prev => Math.max(0, prev - 1))}
                                    disabled={derivationStep === 0}
                                    className="flex-1 py-3 bg-brand-surface hover:bg-brand-bg border border-brand-border hover:border-brand-primary/30 max-h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-text-secondary hover:text-brand-text disabled:opacity-30 transition-all active:scale-95"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setDerivationStep(prev => Math.min(selectedLesson.derivationSteps.length - 1, prev + 1))}
                                    disabled={derivationStep === selectedLesson.derivationSteps.length - 1}
                                    className="flex-1 py-3 bg-brand-primary text-brand-bg max-h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lesson content details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Main Chapter Text */}
                        <motion.div
                            key={activeChapterIdx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center pb-6 border-b border-brand-border/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Module Textbook</span>
                                </div>
                                <span className="font-mono text-xs opacity-30 uppercase tracking-widest">CHAPTER 0{activeChapterIdx + 1} // SYLLABUS</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-brand-text leading-tight tracking-tight border-l-4 border-brand-primary pl-6">
                                {selectedLesson.chapters[activeChapterIdx].title}
                            </h2>

                            <div className="prose prose-invert prose-brand max-w-none text-brand-text-secondary leading-relaxed text-md font-light space-y-6">
                                <ReactMarkdown>{selectedLesson.chapters[activeChapterIdx].content}</ReactMarkdown>
                            </div>
                        </motion.div>

                        {/* Core Practice Assessment Quiz */}
                        <div className="bg-brand-surface/40 p-12 rounded-[3.5rem] border border-brand-border/50 backdrop-blur-md shadow-2xl space-y-10">
                            <div className="flex items-center justify-between border-b border-brand-border/20 pb-6">
                                <div className="flex items-center gap-3">
                                    <Zap size={20} className="text-brand-primary animate-pulse" />
                                    <div>
                                        <h4 className="text-lg font-black text-brand-text uppercase tracking-widest leading-none">Instant Evaluation Matrix</h4>
                                        <p className="text-[9px] text-brand-text-secondary font-mono tracking-widest uppercase mt-1">Multi-Choice Grading Block</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                                    <Award size={18} className="text-brand-primary" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                {selectedLesson.quiz.map((q, qIdx) => (
                                    <div key={qIdx} className="space-y-4">
                                        <div className="flex gap-3">
                                            <span className="font-mono text-xs text-brand-primary font-black pt-1">Q0{qIdx + 1}</span>
                                            <p className="font-bold text-md text-brand-text leading-relaxed">{q.q}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => {
                                                const isSelected = selectedAnswers[qIdx] === oIdx;
                                                const isCorrectAns = q.correctIdx === oIdx;
                                                
                                                let borderStyle = 'border-brand-border/50 hover:border-brand-primary/50';
                                                let bgStyle = 'bg-brand-bg/40';
                                                let iconComponent = null;

                                                if (isSelected) {
                                                    borderStyle = 'border-brand-primary bg-brand-primary/5';
                                                }

                                                if (quizGraded) {
                                                    if (isCorrectAns) {
                                                        borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-500';
                                                        bgStyle = 'bg-emerald-500/5';
                                                        iconComponent = <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
                                                    } else if (isSelected) {
                                                        borderStyle = 'border-red-500 bg-red-500/10 text-red-500';
                                                        bgStyle = 'bg-red-500/5';
                                                        iconComponent = <XCircle size={16} className="text-red-500 shrink-0" />;
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                                                        disabled={quizGraded}
                                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left font-medium text-sm gap-4 cursor-pointer hover:scale-[1.01] ${borderStyle} ${bgStyle}`}
                                                    >
                                                        <span>{opt}</span>
                                                        {iconComponent}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {quizGraded && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 rounded-2xl bg-brand-surface border border-brand-border font-light italic text-xs leading-relaxed text-brand-text-secondary"
                                            >
                                                <div className="flex items-center gap-2 mb-2 font-mono text-[9px] uppercase tracking-widest text-brand-primary">
                                                    <Lightbulb size={12} /> Solution Derivation
                                                </div>
                                                {q.explanation}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {quizGraded ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-10 rounded-[2.5rem] bg-brand-primary/5 border-2 border-brand-primary/20 text-center space-y-4"
                                >
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Grade Report convergent</div>
                                    <div className="text-6xl font-black text-brand-text font-mono tracking-tight">{score} // {selectedLesson.quiz.length}</div>
                                    <div className="text-sm font-bold text-emerald-500 capitalize tracking-widest flex items-center justify-center gap-2">
                                        <Award size={16} /> {scholarRank}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedAnswers({});
                                            setQuizGraded(false);
                                            setScore(0);
                                            setScholarRank('');
                                        }}
                                        className="mt-6 px-10 py-4 bg-brand-primary text-brand-bg rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Re-evaluate Lesson
                                    </button>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={gradeQuiz}
                                    disabled={Object.keys(selectedAnswers).length < selectedLesson.quiz.length}
                                    className="w-full py-5 bg-brand-primary text-brand-bg disabled:opacity-50 disabled:grayscale font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-2xl shadow-brand-primary/30 active:scale-95 transition-all"
                                >
                                    Grade Interactive Examination
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // --- LESSONS HUB HOME (GRID) ---
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Lesson Generation Tools Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-surface/40 p-10 rounded-[3rem] border border-brand-border/50 backdrop-blur-md shadow-2xl space-y-6">
                            <div className="flex items-center gap-3">
                                <Sparkles size={24} className="text-brand-primary animate-pulse" />
                                <div>
                                    <h4 className="font-black text-brand-text text-lg uppercase tracking-widest leading-none">AI Syllabus Builder</h4>
                                    <p className="text-[9px] text-brand-text-secondary uppercase tracking-widest font-mono mt-1">First-Principles Generator</p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-brand-text-secondary leading-relaxed italic font-light opacity-80">
                                Construct a complete, rigorous, and custom interactive academic syllabus for any topic instantly.
                            </p>

                            <hr className="border-brand-border/30" />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-1">Syllabus Topic</label>
                                    <input
                                        type="text"
                                        value={aiSubject}
                                        onChange={e => setAiSubject(e.target.value)}
                                        placeholder="e.g. Einstein Relativity, Thermodynamics"
                                        className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all placeholder:opacity-30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-brand-text-secondary uppercase tracking-[0.3em] ml-1">Academic Intensity</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Undergraduate', 'Graduate', 'Doctorate'].map(dif => (
                                            <button
                                                key={dif}
                                                onClick={() => setAiDifficulty(dif)}
                                                className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${aiDifficulty === dif ? 'bg-brand-text text-brand-bg border-brand-text shadow-lg' : 'bg-brand-bg/40 border-brand-border/30 text-brand-text-secondary hover:text-brand-text'}`}
                                            >
                                                {dif}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={generateAiLesson}
                                    disabled={isGenerating || !aiSubject.trim()}
                                    className="w-full py-4 bg-brand-primary disabled:opacity-45 text-brand-bg font-black uppercase tracking-[0.4em] text-[10px] rounded-xl shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {isGenerating ? 'Drafting Syllabus...' : 'Construct custom Syllabus'}
                                </motion.button>
                            </div>
                        </div>

                        <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/20">
                            <div className="flex items-center gap-3 text-brand-primary mb-4">
                                <Lightbulb size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Cognitive Blueprint</span>
                            </div>
                            <p className="text-[11px] text-brand-text-secondary leading-relaxed font-light italic">
                                Read through textbook chapters from Academic Nexus, then take the <span className="text-brand-primary">Instant Evaluation</span> to earn points and level up your scholar ranking.
                            </p>
                        </div>
                    </div>

                    {/* Lesson Library */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex bg-brand-surface/40 p-1 rounded-2xl border border-brand-border/50 items-center">
                                <span className="px-6 text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Core Catalog</span>
                            </div>

                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Filter textbooks..."
                                    className="w-full bg-brand-surface/40 border-2 border-brand-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Grid Card List */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredLessons.length > 0 ? (
                                filteredLessons.map((les, idx) => (
                                    <motion.div
                                        key={les.id}
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            setSelectedLesson(les);
                                            setActiveChapterIdx(0);
                                            setDerivationStep(0);
                                            setSelectedAnswers({});
                                            setQuizGraded(false);
                                            setScore(0);
                                            setScholarRank('');
                                        }}
                                        className="bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-border/50 hover:border-brand-primary/50 cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group/card flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-brand-primary" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{les.subject}</span>
                                                </div>
                                                <div className="px-3 py-1 bg-brand-bg/50 border border-brand-border text-[8px] font-black uppercase tracking-widest text-brand-text-secondary rounded-full">
                                                    {les.difficulty}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-brand-text tracking-tight group-hover/card:text-brand-primary transition-colors leading-snug">
                                                {les.title}
                                            </h3>

                                            <p className="text-xs text-brand-text-secondary italic font-light leading-relaxed mb-6 opacity-85 line-clamp-3">
                                                {les.summary}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-brand-border/20 flex items-center justify-between">
                                            <span className="text-[10px] font-mono opacity-35 uppercase tracking-wider">// OPEN MODULE</span>
                                            <div className="p-3 bg-brand-primary text-brand-bg rounded-xl group-hover/card:scale-110 transition-all shadow-lg shadow-brand-primary/10">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-40 text-center opacity-30">
                                    <Search size={64} className="mx-auto mb-6 text-brand-primary" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.6em]">Zero matches in study catalog</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple ChevronRight icon implementation to replace unused main ones if needed
const ChevronRightIcon = ({ size }: { size: number }) => (
    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={size} />
    </div>
);

export default LessonsHub;
