/* =========================================================
   Night Before Exam — content
   Each level: subject, setting (home | hall), chapters with
   study text, golden words, and questions [q, correct, ...wrong].
   ========================================================= */
window.NBE_DATA = (() => {
  const SSC = [
    {
      name: 'Motion & Force', bn: 'গতি ও বল', ico: '🚀',
      text: "A body stays at rest or keeps moving uniformly unless an external force acts on it. This property is called inertia, and it is Newton's first law. The second law says force equals mass times acceleration, F = ma, and force is measured in newtons. Momentum is mass times velocity. The third law: for every action there is an equal and opposite reaction. Near Earth's surface, g is about 9.8 m/s². The slope of a velocity–time graph gives acceleration.",
      gold: ['inertia', 'newtons', 'momentum', 'reaction', '9.8', 'acceleration'],
      qs: [
        ['SI unit of force?', 'Newton', 'Joule', 'Watt', 'Pascal'],
        ['Acceleration due to gravity on Earth is about…', '9.8 m/s²', '3.0 m/s²', '98 m/s²', '1.6 m/s²'],
        ["Newton's third law is about…", 'Action and reaction', 'Inertia', 'F = ma', 'Gravitation'],
        ['Momentum equals…', 'Mass × velocity', 'Mass × acceleration', 'Force × distance', 'Velocity ÷ time'],
        ['A body at rest wants to stay at rest. This is…', 'Inertia', 'Friction', 'Impulse', 'Power'],
        ['Slope of a velocity–time graph gives…', 'Acceleration', 'Displacement', 'Distance', 'Momentum'],
      ],
    },
    {
      name: 'Waves & Sound', bn: 'তরঙ্গ ও শব্দ', ico: '🔊',
      text: "Sound is a mechanical wave, so it needs a medium and cannot travel through a vacuum. In air, sound waves are longitudinal, made of compressions and rarefactions. Frequency is measured in hertz. Humans hear roughly 20 Hz to 20 kHz; below is infrasound, above is ultrasound. Sound travels at about 340 m/s in air, faster in water, and fastest in solids. A reflected sound heard after a short delay is called an echo.",
      gold: ['vacuum', 'longitudinal', 'hertz', '340', 'echo', 'medium'],
      qs: [
        ['Sound cannot travel through…', 'Vacuum', 'Water', 'Steel', 'Air'],
        ['Unit of frequency?', 'Hertz', 'Decibel', 'Newton', 'Tesla'],
        ['Speed of sound in air is about…', '340 m/s', '3×10⁸ m/s', '34 m/s', '3400 km/s'],
        ['Human audible range?', '20 Hz – 20 kHz', '2 Hz – 200 Hz', '20 kHz – 200 kHz', '0 – 20 Hz'],
        ['A reflected sound heard after a delay is…', 'An echo', 'Resonance', 'Pitch', 'Timbre'],
        ['Sound waves in air are…', 'Longitudinal', 'Transverse', 'Electromagnetic', 'Circular'],
      ],
    },
    {
      name: 'Current Electricity', bn: 'চল বিদ্যুৎ', ico: '⚡',
      text: "Electric current is the flow of charge, measured in amperes. Ohm's law states V = IR, and resistance is measured in ohms. Metals like copper are good conductors, while rubber, glass and wood are insulators. When resistors are connected in series, their resistances add up. The electricity bill counts energy in kilowatt-hours: 1 kWh is a unit of energy, not power.",
      gold: ['charge', 'ohms', 'copper', 'series', 'kilowatt-hours', 'amperes,'],
      qs: [
        ["Ohm's law: V = ?", 'IR', 'I / R', 'R / I', 'I²R'],
        ['Unit of resistance?', 'Ohm', 'Ampere', 'Volt', 'Coulomb'],
        ['Resistors in series — total resistance…', 'Adds up', 'Decreases', 'Equals the smallest', 'Becomes zero'],
        ['1 kWh is a unit of…', 'Energy', 'Power', 'Current', 'Charge'],
        ['Which is a good conductor?', 'Copper', 'Rubber', 'Glass', 'Wood'],
        ['Electric current is the flow of…', 'Charge', 'Heat', 'Light', 'Mass'],
      ],
    },
    {
      name: 'Heat & Temperature', bn: 'তাপ ও তাপমাত্রা', ico: '🔥',
      text: "Heat is a form of energy, so its SI unit is the joule. Heat moves by conduction, convection and radiation — only radiation works without any medium, which is how sunlight reaches Earth. Absolute zero, 0 K, equals −273 °C. Pure water boils at 100 °C at sea level and ice melts at 0 °C. A thermos flask works by reducing all three modes of heat transfer.",
      gold: ['joule', 'radiation', '−273', '100', 'thermos', 'conduction'],
      qs: [
        ['Pure water boils at sea level at…', '100 °C', '0 °C', '50 °C', '212 °C'],
        ['Heat transfer that needs no medium?', 'Radiation', 'Conduction', 'Convection', 'Diffusion'],
        ['SI unit of heat?', 'Joule', 'Calorie', 'Kelvin', 'Watt'],
        ['0 K is equal to…', '−273 °C', '0 °C', '−100 °C', '273 °C'],
        ['A thermos flask reduces…', 'All heat transfer', 'Only radiation', 'Only convection', 'Only pressure'],
        ['Ice melts at…', '0 °C', '4 °C', '−10 °C', '32 °C'],
      ],
    },
    {
      name: 'Light & Optics', bn: 'আলো', ico: '💡',
      text: "Light travels at about 3×10⁸ m/s in vacuum. When light passes from air into water it bends — this is refraction. A prism splits white light into colours by dispersion. A convex lens is a converging lens; a concave lens diverges light. A plane mirror forms a virtual, erect image. The sky looks blue because air molecules scatter blue light more than red — this is scattering.",
      gold: ['3×10⁸', 'refraction', 'dispersion', 'converging', 'virtual', 'scattering'],
      qs: [
        ['Speed of light in vacuum is about…', '3×10⁸ m/s', '3×10⁵ m/s', '340 m/s', '3×10¹² m/s'],
        ['Splitting white light into colours is…', 'Dispersion', 'Reflection', 'Diffraction', 'Polarisation'],
        ['A convex lens is also called a…', 'Converging lens', 'Diverging lens', 'Plane lens', 'Concave mirror'],
        ['Image in a plane mirror is…', 'Virtual and erect', 'Real and inverted', 'Real and erect', 'Magnified'],
        ['Light bending as it enters water is…', 'Refraction', 'Reflection', 'Dispersion', 'Scattering'],
        ['The sky looks blue because of…', 'Scattering', 'Refraction', 'Reflection', 'Absorption'],
      ],
    },
  ];

  const HSC = [
    {
      name: 'Vectors', bn: 'ভেক্টর', ico: '🧭',
      text: "A vector has both magnitude and direction; a scalar has only magnitude. Displacement, velocity and force are vectors, while mass, time and work are scalars. The dot product A·B = AB cos θ gives a scalar. The cross product A×B = AB sin θ gives a vector perpendicular to both. If two vectors are perpendicular, their dot product is zero. A unit vector has magnitude one.",
      gold: ['magnitude', 'scalar', 'cos', 'perpendicular', 'unit'],
      qs: [
        ['Which one is a vector?', 'Velocity', 'Mass', 'Time', 'Work'],
        ['A·B equals…', 'AB cos θ', 'AB sin θ', 'A + B', 'A ÷ B'],
        ['If A ⟂ B, then A·B = ?', '0', '1', 'AB', '∞'],
        ['The cross product of two vectors is a…', 'Vector', 'Scalar', 'Pure number', 'Always zero'],
        ['Magnitude of a unit vector?', '1', '0', 'Depends on direction', '10'],
      ],
    },
    {
      name: 'Newtonian Mechanics', bn: 'নিউটনিয়ান বলবিদ্যা', ico: '🍎',
      text: "Impulse equals force multiplied by time, and it equals the change in momentum. In a collision with no external force, total momentum is conserved. Torque is the turning effect of a force, τ = r × F. Centripetal force mv²/r points toward the centre of a circular path. Angular momentum is conserved when no external torque acts — that's why a spinning skater speeds up when pulling the arms in.",
      gold: ['Impulse', 'conserved', 'Torque', 'Centripetal', 'Angular'],
      qs: [
        ['Impulse equals…', 'Change in momentum', 'Change in energy', 'Mass × speed²', 'Power × time'],
        ['Centripetal force formula?', 'mv²/r', 'mvr', 'mr/v²', 'm²v/r'],
        ['The turning effect of a force is…', 'Torque', 'Impulse', 'Inertia', 'Strain'],
        ['With no external force, total momentum is…', 'Conserved', 'Doubled', 'Always zero', 'Lost as heat'],
        ['A skater pulls the arms in and spins faster because…', 'Angular momentum is conserved', 'Friction increases', 'Gravity drops', 'Energy is created'],
      ],
    },
    {
      name: 'Work, Energy & Power', bn: 'কাজ, শক্তি ও ক্ষমতা', ico: '⚙️',
      text: "Work is done when a force moves an object: W = Fs cos θ, measured in joules. Kinetic energy is ½mv² and potential energy near Earth is mgh. Power is the rate of doing work, measured in watts; one horsepower is about 746 W. Energy cannot be created or destroyed, only converted — the law of conservation of energy. If the force is perpendicular to motion, the work done is zero.",
      gold: ['joules', '½mv²', 'mgh', 'watts', '746', 'conservation'],
      qs: [
        ['Kinetic energy = ?', '½mv²', 'mgh', 'mv', 'Fs'],
        ['Unit of power?', 'Watt', 'Joule', 'Newton', 'Pascal'],
        ['1 horsepower is about…', '746 W', '100 W', '1000 J', '9.8 W'],
        ['A force perpendicular to motion does work equal to…', 'Zero', 'Maximum', 'Negative infinity', 'mg'],
        ["Potential energy near Earth's surface?", 'mgh', '½mv²', 'mg/h', 'm/gh'],
      ],
    },
    {
      name: 'Gravitation', bn: 'মহাকর্ষ ও অভিকর্ষ', ico: '🪐',
      text: "Newton's law of gravitation: F = Gm₁m₂/r². The universal gravitational constant G is about 6.67×10⁻¹¹ N m²/kg². The value of g decreases as you go higher above Earth, and is zero at Earth's centre. Escape velocity from Earth is about 11.2 km/s. A geostationary satellite has a period of 24 hours. Kepler's laws describe planetary orbits as ellipses.",
      gold: ['6.67×10⁻¹¹', 'decreases', 'zero', '11.2', 'geostationary', 'ellipses'],
      qs: [
        ['Escape velocity from Earth?', '11.2 km/s', '7.9 km/s', '3×10⁸ m/s', '340 m/s'],
        ['Value of G?', '6.67×10⁻¹¹ N m²/kg²', '9.8 m/s²', '6.02×10²³', '1.6×10⁻¹⁹ C'],
        ['Gravitational force varies with distance as…', '1/r²', 'r²', '1/r', 'r'],
        ['Period of a geostationary satellite?', '24 hours', '12 hours', '1 hour', '365 days'],
        ["At Earth's centre, g is…", 'Zero', 'Maximum', '9.8 m/s²', 'Infinite'],
      ],
    },
    {
      name: 'Periodic Motion', bn: 'পর্যাবৃত্ত গতি', ico: '⏱️',
      text: "In simple harmonic motion, acceleration is proportional to displacement and points toward the mean position: a = −ω²x. A simple pendulum's period is T = 2π√(L/g), so it does not depend on the bob's mass. Speed is maximum at the mean position and zero at the extremes. Frequency is 1/T. A seconds pendulum has a period of 2 seconds.",
      gold: ['displacement', '2π√(L/g),', 'mass.', 'mean', 'seconds'],
      qs: [
        ['Period of a simple pendulum?', '2π√(L/g)', '2π√(g/L)', '√(Lg)', '2πLg'],
        ['In SHM, speed is maximum at the…', 'Mean position', 'Extreme position', 'Halfway point', 'Never'],
        ["Does a pendulum's period depend on the bob's mass?", 'No', 'Yes, heavier is faster', 'Yes, heavier is slower', 'Only on Fridays'],
        ['Period of a seconds pendulum?', '2 s', '1 s', '60 s', '0.5 s'],
        ['In SHM, acceleration is proportional to…', 'Displacement', 'Velocity', 'Time', 'Mass'],
      ],
    },
  ];

  const EEE = [
    {
      name: 'Circuit Laws', bn: 'KCL · KVL · Thevenin', ico: '🔌',
      text: "Kirchhoff's Current Law: the sum of currents entering a node equals the sum leaving — charge is conserved. Kirchhoff's Voltage Law: the algebraic sum of voltages around any closed loop is zero — energy is conserved. For resistors in parallel, 1/R = 1/R₁ + 1/R₂. Thevenin's theorem replaces a network with a voltage source in series with a resistance. Maximum power is transferred when the load resistance equals the source resistance.",
      gold: ['node', 'loop', 'parallel,', "Thevenin's", 'equals'],
      qs: [
        ['KCL is based on conservation of…', 'Charge', 'Energy', 'Momentum', 'Mass'],
        ['KVL: the sum of voltages around a closed loop is…', 'Zero', 'Infinite', 'Equal to the current', 'Always 5 V'],
        ['Two 10 Ω resistors in parallel give…', '5 Ω', '20 Ω', '10 Ω', '100 Ω'],
        ['A Thevenin equivalent is a voltage source in…', 'Series with a resistance', 'Parallel with a resistance', 'Series with a capacitor', 'Parallel with a diode'],
        ['Maximum power transfer happens when R_load =', 'R_source', '0', '∞', '2 × R_source'],
      ],
    },
    {
      name: 'AC Circuits', bn: 'RMS · reactance · resonance', ico: '〰️',
      text: "In Bangladesh the mains supply is 220 V at 50 Hz. The RMS value of a sine wave is its peak divided by √2. Inductive reactance X_L = 2πfL rises with frequency, while capacitive reactance X_C = 1/(2πfC) falls with frequency. At resonance in an RLC circuit, X_L = X_C. Power factor is cos φ; a purely resistive load has a power factor of 1.",
      gold: ['50', '√2.', 'reactance', 'resonance', 'factor'],
      qs: [
        ['Mains frequency in Bangladesh?', '50 Hz', '60 Hz', '220 Hz', '100 Hz'],
        ['RMS value of a sine wave =', 'Peak / √2', 'Peak × 2', 'Peak / 2', 'Peak²'],
        ['Capacitive reactance when frequency increases?', 'Decreases', 'Increases', 'Stays the same', 'Becomes negative'],
        ['At RLC resonance…', 'X_L = X_C', 'R = 0', 'Current = 0', 'f = 0'],
        ['Power factor of a pure resistor?', '1', '0', '0.5', '−1'],
      ],
    },
    {
      name: 'Diodes', bn: 'p-n junction · rectifiers', ico: '🔺',
      text: "A p-n junction diode conducts in forward bias and blocks in reverse bias. A silicon diode needs about 0.7 V to turn on; germanium needs about 0.3 V. A half-wave rectifier uses one diode, while a full-wave bridge rectifier uses four. A Zener diode is operated in reverse breakdown to regulate voltage. An LED emits light when forward biased.",
      gold: ['forward', '0.7', 'four.', 'Zener', 'LED'],
      qs: [
        ['Cut-in voltage of a silicon diode?', '≈0.7 V', '≈0.3 V', '≈5 V', '≈12 V'],
        ['A bridge rectifier uses how many diodes?', '4', '1', '2', '8'],
        ['A Zener diode is mainly used for…', 'Voltage regulation', 'Amplification', 'Light emission', 'Storing charge'],
        ['A diode conducts mainly in…', 'Forward bias', 'Reverse bias', 'No bias', 'Both equally'],
        ['An LED emits light when…', 'Forward biased', 'Reverse biased', 'Cooled down', 'Unplugged'],
      ],
    },
    {
      name: 'Transistors', bn: 'BJT · MOSFET', ico: '🔀',
      text: "A BJT has three terminals: emitter, base and collector. Its current gain is β = I_C / I_B. In the active region a BJT amplifies; in saturation and cut-off it acts as a switch. A MOSFET is voltage-controlled, with gate, drain and source, and its gate draws almost no current. The common-emitter configuration is the most popular amplifier because it gives both voltage and current gain.",
      gold: ['emitter,', 'β', 'active', 'MOSFET', 'common-emitter'],
      qs: [
        ['BJT current gain β =', 'I_C / I_B', 'I_B / I_C', 'I_E × I_B', 'V_CE / I_C'],
        ['Terminals of a MOSFET?', 'Gate, drain, source', 'Base, emitter, collector', 'Anode, cathode, gate', 'Live, neutral, earth'],
        ['For amplification, a BJT works in the…', 'Active region', 'Saturation region', 'Cut-off region', 'Breakdown region'],
        ['Most popular BJT amplifier configuration?', 'Common emitter', 'Common collector', 'Common base', 'Common room'],
        ['A MOSFET is controlled by…', 'Gate voltage', 'Base current', 'Temperature only', 'A magnet'],
      ],
    },
    {
      name: 'Digital Logic', bn: 'gates · binary · flip-flops', ico: '🔢',
      text: "NAND and NOR are universal gates — any digital circuit can be built from them alone. An XOR gate outputs 1 when its inputs are different. De Morgan's law says (A·B)' = A' + B'. A flip-flop stores one bit of memory. The binary number 1010 equals decimal 10. A multiplexer selects one of many inputs and sends it to the output.",
      gold: ['universal', 'XOR', "Morgan's", 'flip-flop', '1010'],
      qs: [
        ['The universal gates are…', 'NAND and NOR', 'AND and OR', 'XOR and XNOR', 'NOT and Buffer'],
        ['XOR outputs 1 when the inputs are…', 'Different', 'Both 1', 'Both 0', 'Always'],
        ['Binary 1010 in decimal?', '10', '12', '5', '1010'],
        ['A flip-flop stores…', '1 bit', '1 byte', '1 KB', 'Nothing, it just flips'],
        ["(A·B)' equals…", "A' + B'", "A' · B'", 'A + B', 'A · B'],
      ],
    },
  ];

  const CSE = [
    {
      name: 'Complexity', bn: 'Big-O analysis', ico: '⏱️',
      text: "Big-O describes how running time grows with the input size n. Binary search runs in O(log n), while linear search runs in O(n). Accessing an array element by index is O(1). Two nested loops over n items usually give O(n²). Merge sort is O(n log n) in every case. Space complexity measures the extra memory an algorithm needs.",
      gold: ['Big-O', 'O(log', 'O(1).', 'O(n²).', 'Space'],
      qs: [
        ['Time complexity of binary search?', 'O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
        ['Accessing an array element by index?', 'O(1)', 'O(n)', 'O(log n)', 'O(n!)'],
        ['Two nested loops over n items usually give…', 'O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
        ['Worst case of merge sort?', 'O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        ['Worst case of linear search?', 'O(n)', 'O(1)', 'O(log n)', 'O(n³)'],
      ],
    },
    {
      name: 'Stacks, Queues & Lists', bn: 'linear data structures', ico: '📚',
      text: "A stack is LIFO — last in, first out — with push and pop. A queue is FIFO — first in, first out — with enqueue and dequeue. Function calls and recursion use the call stack, while BFS uses a queue. A linked list stores nodes connected by pointers, so inserting at the head is O(1) but finding the k-th element is O(n). Undo in a text editor is a classic stack.",
      gold: ['LIFO', 'FIFO', 'recursion', 'pointers,', 'Undo'],
      qs: [
        ['A stack follows…', 'LIFO', 'FIFO', 'Random order', 'Alphabetical order'],
        ['Which data structure does BFS use?', 'Queue', 'Stack', 'Heap', 'Hash map'],
        ['Recursion internally uses the…', 'Call stack', 'Queue', 'Graph', 'Recycle bin'],
        ['Inserting at the head of a linked list?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        ['Undo (Ctrl+Z) is best modelled by a…', 'Stack', 'Queue', 'Tree', 'Array of vibes'],
      ],
    },
    {
      name: 'Trees', bn: 'BST · heaps', ico: '🌳',
      text: "A binary search tree keeps smaller keys on the left and larger keys on the right. An in-order traversal of a BST gives the keys in sorted order. Search in a balanced BST takes O(log n), but a skewed BST can degrade to O(n). A heap is a complete binary tree used for priority queues; in a max-heap the largest element sits at the root. A tree with n nodes has n − 1 edges.",
      gold: ['left', 'in-order', 'balanced', 'heap', 'edges.'],
      qs: [
        ['In-order traversal of a BST gives…', 'Sorted order', 'Reverse insertion order', 'Random order', 'Level order'],
        ['In a max-heap, the largest element is at…', 'The root', 'A leaf', 'The middle', 'Nowhere'],
        ['A tree with n nodes has how many edges?', 'n − 1', 'n', 'n + 1', '2n'],
        ['Search in a skewed BST can degrade to…', 'O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
        ['Priority queues are usually built with a…', 'Heap', 'Stack', 'Plain linked list', 'Queue of queues'],
      ],
    },
    {
      name: 'Sorting', bn: 'bubble · quick · merge', ico: '🔃',
      text: "Bubble sort repeatedly swaps adjacent elements and is O(n²). Quick sort picks a pivot; it averages O(n log n) but its worst case is O(n²). Merge sort divides, sorts and merges, always in O(n log n), but needs extra memory. A sort is stable if equal elements keep their relative order — merge sort is stable. Comparison-based sorting can't beat O(n log n) in the worst case.",
      gold: ['adjacent', 'pivot;', 'merges,', 'stable', 'Comparison-based'],
      qs: [
        ['Worst case of quick sort?', 'O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
        ['Which sort uses a pivot?', 'Quick sort', 'Merge sort', 'Bubble sort', 'Counting sort'],
        ['Bubble sort compares…', 'Adjacent elements', 'Random elements', 'Only first and last', 'Nothing, it just bubbles'],
        ['Which of these is stable?', 'Merge sort', 'Quick sort (typical)', 'Heap sort', 'Selection sort'],
        ['Lower bound for comparison sorting?', 'O(n log n)', 'O(n)', 'O(log n)', 'O(1)'],
      ],
    },
    {
      name: 'Graphs', bn: 'BFS · DFS · Dijkstra', ico: '🕸️',
      text: "A graph has vertices and edges. BFS explores level by level using a queue and finds shortest paths in unweighted graphs. DFS goes deep first using a stack or recursion. Dijkstra's algorithm finds shortest paths when all edge weights are non-negative. A tree is a connected graph with no cycles. Topological sort works only on a directed acyclic graph (DAG).",
      gold: ['vertices', 'BFS', 'DFS', "Dijkstra's", '(DAG).'],
      qs: [
        ['Shortest path in an unweighted graph?', 'BFS', 'DFS', 'Bubble sort', 'Binary search'],
        ["Dijkstra's algorithm fails with…", 'Negative edge weights', 'Positive weights', 'Undirected graphs', 'Small graphs'],
        ['Topological sort needs a…', 'DAG', 'Complete graph', 'Cyclic graph', 'Tree with cycles'],
        ['DFS is naturally implemented with…', 'A stack / recursion', 'A queue', 'A heap', 'A hash table'],
        ['A tree is a connected graph with…', 'No cycles', 'Exactly one cycle', 'Every possible edge', 'No vertices'],
      ],
    },
  ];

  const ME = [
    {
      name: 'Laws of Thermodynamics', bn: 'zeroth to third', ico: '🔥',
      text: "The first law says energy is conserved: Q = ΔU + W. The second law says heat cannot flow from cold to hot on its own, and no heat engine can be 100% efficient. The entropy of an isolated system never decreases. The zeroth law defines temperature through thermal equilibrium. The third law says entropy approaches zero at absolute zero.",
      gold: ['conserved:', 'second', 'entropy', 'zeroth', 'absolute'],
      qs: [
        ['The first law of thermodynamics is about…', 'Conservation of energy', 'Entropy', 'Defining temperature', 'Absolute zero'],
        ['Which law defines temperature via thermal equilibrium?', 'Zeroth law', 'First law', 'Second law', 'Third law'],
        ['The entropy of an isolated system…', 'Never decreases', 'Always decreases', 'Is always zero', 'Is a vector'],
        ['A 100% efficient heat engine violates the…', 'Second law', 'First law', 'Zeroth law', "Hooke's law"],
        ['Q = ΔU + W is the…', 'First law', 'Second law', 'Bernoulli equation', "Ohm's law"],
      ],
    },
    {
      name: 'Cycles & IC Engines', bn: 'Carnot · Otto · Diesel', ico: '🚗',
      text: "Carnot efficiency is 1 − T_cold/T_hot, with temperatures in kelvin, and it is the maximum possible. Petrol engines follow the Otto cycle and use spark ignition; diesel engines follow the Diesel cycle and use compression ignition. A four-stroke engine has suction, compression, power and exhaust strokes. A higher compression ratio means higher Otto efficiency.",
      gold: ['Carnot', 'kelvin,', 'Otto', 'compression', 'four-stroke'],
      qs: [
        ['Carnot efficiency =', '1 − T_cold/T_hot', 'T_cold/T_hot', '1 + T_hot/T_cold', 'T_hot − T_cold'],
        ['Petrol engines work on the…', 'Otto cycle', 'Diesel cycle', 'Rankine cycle', 'Brayton cycle'],
        ['Diesel engines use…', 'Compression ignition', 'Spark ignition', 'Solar ignition', 'Matchsticks'],
        ['Strokes of a 4-stroke engine, in order?', 'Suction, compression, power, exhaust', 'Power, suction, exhaust, compression', 'Compression, suction, exhaust, power', 'Exhaust, power, suction, compression'],
        ['In the Carnot formula, temperatures must be in…', 'Kelvin', 'Celsius', 'Fahrenheit', 'Vibes'],
      ],
    },
    {
      name: 'Fluid Mechanics', bn: 'pressure · Bernoulli · flow', ico: '💧',
      text: "Pressure in a fluid increases with depth: P = ρgh. Bernoulli's equation says that along a streamline, pressure plus kinetic plus potential energy per volume is constant, so faster flow means lower pressure. The continuity equation A₁v₁ = A₂v₂ means a narrower pipe gives faster flow. A Reynolds number below about 2000 means laminar flow; high values mean turbulent flow. Viscosity is a fluid's resistance to flow.",
      gold: ['ρgh.', "Bernoulli's", 'continuity', 'laminar', 'Viscosity'],
      qs: [
        ['Pressure at depth h in a fluid?', 'ρgh', 'ρ/gh', 'mgh', '½ρv'],
        ['Narrower pipe section, same flow — the speed…', 'Increases', 'Decreases', 'Stays the same', 'Becomes zero'],
        ['A low Reynolds number means…', 'Laminar flow', 'Turbulent flow', 'No flow', 'Supersonic flow'],
        ['Bernoulli: faster flow means the pressure…', 'Drops', 'Rises', 'Doubles', "Doesn't care"],
        ["A fluid's resistance to flow is…", 'Viscosity', 'Density', 'Buoyancy', 'Surface tension'],
      ],
    },
    {
      name: 'Strength of Materials', bn: 'stress · strain · safety', ico: '🏋️',
      text: "Stress is force per unit area, σ = F/A, measured in pascals. Strain is the change in length divided by the original length, so it has no unit. Hooke's law: within the elastic limit, stress is proportional to strain, and the ratio is Young's modulus E. Ductile materials like mild steel stretch a lot before breaking; brittle materials like cast iron snap. Factor of safety = ultimate stress / working stress.",
      gold: ['pascals.', 'unit.', "Young's", 'Ductile', 'safety'],
      qs: [
        ['Stress =', 'Force / Area', 'Area / Force', 'Force × Length', 'Change in length'],
        ['Unit of strain?', 'No unit', 'Pascal', 'Newton', 'Metre'],
        ['Stress ÷ strain in the elastic region is…', "Young's modulus", "Poisson's ratio", 'Factor of safety', 'Bulk density'],
        ['Which material is brittle?', 'Cast iron', 'Mild steel', 'Copper', 'Gold'],
        ['Factor of safety =', 'Ultimate stress / working stress', 'Working / ultimate stress', 'Stress × strain', 'Load / area'],
      ],
    },
    {
      name: 'Heat Transfer', bn: 'conduction · convection · radiation', ico: '🌡️',
      text: "Conduction follows Fourier's law: q = −kA dT/dx, where k is thermal conductivity. Convection follows Newton's law of cooling: q = hA(T_s − T_∞). Radiation follows the Stefan–Boltzmann law: q = εσT⁴. A black body has an emissivity of 1. Insulators have low thermal conductivity. Fins increase the surface area to boost heat transfer.",
      gold: ["Fourier's", 'cooling:', 'Stefan–Boltzmann', 'emissivity', 'Fins'],
      qs: [
        ['Conduction is governed by…', "Fourier's law", "Newton's law of cooling", 'Stefan–Boltzmann law', "Ohm's law"],
        ['Radiation heat transfer is proportional to…', 'T⁴', 'T', 'T²', '1/T'],
        ['Emissivity of a black body?', '1', '0', '0.5', 'Depends on its mood'],
        ['Fins are used to…', 'Increase heat transfer area', 'Reduce weight only', 'Look cool', 'Stop convection'],
        ['Convection is described by…', "Newton's law of cooling", "Fourier's law", "Hooke's law", "Pascal's law"],
      ],
    },
  ];

  const LEVELS = {
    ssc: {
      id: 'ssc', tag: 'SSC', title: 'SSC Board Exam', ico: '🎒', setting: 'home', scale: 'gpa',
      subject: 'Physics', paperHead: 'Secondary School Certificate Examination',
      blurb: 'Class 10. Board exam. Golden A+ or golden tears.',
      poster: ['F = ma', '(probably)'], chapters: SSC,
    },
    hsc: {
      id: 'hsc', tag: 'HSC', title: 'HSC Board Exam', ico: '📘', setting: 'home', scale: 'gpa',
      subject: 'Physics 1st Paper', paperHead: 'Higher Secondary Certificate Examination',
      blurb: 'The exam that decides admission season. No pressure.',
      poster: ['T = 2π√(L/g)', '(why tho)'], chapters: HSC,
    },
    eee: {
      id: 'eee', tag: 'EEE', title: 'EEE Semester Final', ico: '⚡', setting: 'hall', scale: 'cgpa', uni: true,
      subject: 'Electrical Circuits & Electronics', paperHead: 'B.Sc. Engineering · Semester Final',
      blurb: 'Circuits, diodes, and a calculator with 3% battery.',
      poster: ['V = IR', '(the only one I know)'], chapters: EEE,
    },
    cse: {
      id: 'cse', tag: 'CSE', title: 'CSE Semester Final', ico: '💻', setting: 'hall', scale: 'cgpa', uni: true,
      subject: 'Data Structures & Algorithms', paperHead: 'B.Sc. Engineering · Semester Final',
      blurb: 'You can invert a binary tree. Can you invert your sleep schedule?',
      poster: ['O(n log n)', '(my life: O(n!))'], chapters: CSE,
    },
    me: {
      id: 'me', tag: 'ME', title: 'Mechanical Semester Final', ico: '⚙️', setting: 'hall', scale: 'cgpa', uni: true,
      subject: 'Thermo, Fluids & Materials', paperHead: 'B.Sc. Engineering · Semester Final',
      blurb: 'Entropy always increases. So does your stress.',
      poster: ['PV = nRT', '(Pressure Very high)'], chapters: ME,
    },
  };

  const JOKE_OPTIONS = {
    home: ['Ammu jane', 'Sir did not teach this', 'Option C (always C)', 'All of the above (vibes)', 'Ask the topper', '42', 'Allah bhorsha'],
    hall: ['Ask the CR', "It's in the senior's slides", 'Depends 🤷', 'Out of syllabus (I hope)', 'Proof is trivial', '42', 'Will check after exam'],
  };

  const THOUGHTS = {
    common: [
      "Why didn't I start last week?",
      'If I sleep now, I wake up a genius. Right?',
      'One more chapter. Then sleep. (lie)',
      'Is the syllabus getting longer?',
      'What if the exam is easy? 🥹',
      'I should have been a farmer.',
      'Bro just read the question paper in my dream.',
    ],
    home: [
      'Ammu will ask about the result…',
      'Golden A+ or golden tears?',
      'Why did I pay for coaching?',
      'Khala will ask my GPA at the next dawat.',
    ],
    hall: [
      'CGPA is just a number. Right?',
      'Should I switch to BBA?',
      'Roommate is sleeping peacefully. Rage.',
      'Attendance is short too… 💀',
      'Senior said "ez paper". Senior lies.',
    ],
  };

  const NOTIFS = {
    common: [
      ['📸', 'Insta', 'Your crush just posted a story 👀'],
      ['🎬', 'YouTube', '"I studied ONE night and topped" — new video'],
      ['🎮', 'BattleZone', 'Your squad is waiting! One match only 🔥'],
      ['🛵', 'FoodDash', 'Midnight craving? 50% off kacchi 🍛'],
      ['📺', 'StreamFlix', 'Your show just dropped a new season.'],
      ['🔥', 'Trending', '#ExamPostponed (source: trust me)'],
      ['🎵', 'Music', 'Lo-fi beats to panic/study to'],
      ['📶', 'Telco', 'Your data pack expires in 2 hours!'],
      ['🏏', 'Cricket', 'Bangladesh need 12 off 6 balls!!'],
      ['💸', 'Wallet', 'You received ৳0.00 cashback 🎉'],
      ['👻', 'Unknown', 'Hi. Are you awake? 🙂'],
    ],
    home: [
      ['💬', 'Class group', '47 new messages: "bhai kichu porsos??"'],
      ['👩', 'Ammu', 'Ghumai ja, onek raat hoise.'],
      ['🧑‍🏫', 'Coaching Sir', 'Last-minute suggestion PDF (৳200)'],
      ['🌸', 'Family group', 'Fupi sent 12 "Good Night" flowers'],
    ],
    hall: [
      ['💬', 'Batch group', '"Syllabus e ki ki ase?" — 1 hour before exam'],
      ['📢', 'CR', 'Room changed to 304 → 403 → 304 again'],
      ['👩', 'Ammu', 'Kheyecho baba? Ghumao.'],
      ['📁', 'Senior', 'Shared "Final_FINAL_v3_real.pdf"'],
      ['🍳', 'Hall canteen', 'Khichuri is OVER. Come tomorrow.'],
    ],
  };

  const FRIENDS = ['Rafi', 'Nusrat', 'Tanvir', 'Mim', 'Shakil', 'Tasnim', 'Arnob', 'Priya', 'Sajid', 'Raisa'];

  return { LEVELS, JOKE_OPTIONS, THOUGHTS, NOTIFS, FRIENDS };
})();
