export const SUBJECTS = {
  physics: {
    icon: "⚛️", color: "#7c3aed", label: "Physics", levels: [
      { id: "ph1", emoji: "🟢", title: "Elementary Physics", topics: ["Units & measurements", "Scalars vs vectors", "Speed & velocity", "Newton's Laws", "Work & Energy"] },
      { id: "ph2", emoji: "🔵", title: "Lower Intermediate", topics: ["Projectile motion", "Momentum", "Sound waves", "Heat transfer", "Ohm's Law"] },
      { id: "ph3", emoji: "🟡", title: "Upper Intermediate", topics: ["Free-body diagrams", "Work-energy theorem", "Torque", "Kirchhoff's laws", "Optics"] },
      { id: "ph4", emoji: "🟠", title: "Advanced High School", topics: ["Harmonic motion", "Thermodynamics", "Capacitors", "Photoelectric effect"] },
      { id: "ph5", emoji: "🔴", title: "University Level", topics: ["Lagrangian mechanics", "Maxwell's equations", "Schrödinger equation", "Special Relativity"] },
    ],
  },
  math: {
    icon: "📐", color: "#ec4899", label: "Mathematics", levels: [
      { id: "ma1", emoji: "🟢", title: "Elementary Math", topics: ["Fractions & decimals", "Percentages", "Prime numbers", "Perimeter & area"] },
      { id: "ma2", emoji: "🔵", title: "Pre-Algebra", topics: ["Variables", "Linear equations", "Inequalities", "Ratios"] },
      { id: "ma3", emoji: "🟡", title: "Algebra 1", topics: ["Graphing lines", "Slope & intercept", "Systems of equations", "Functions"] },
      { id: "ma4", emoji: "🟠", title: "Geometry", topics: ["Pythagorean theorem", "Circles", "Coordinate geometry", "Transformations"] },
      { id: "ma5", emoji: "🔴", title: "Algebra 2", topics: ["Quadratic formula", "Polynomials", "Logarithms", "Sequences"] },
      { id: "ma6", emoji: "🟣", title: "Calculus", topics: ["Derivatives", "Integrals", "Optimization", "Limits"] },
    ],
  },
  biology: {
    icon: "🧬", color: "#059669", label: "Biology", levels: [
      { id: "bi1", emoji: "🟢", title: "Elementary Biology", topics: ["Characteristics of life", "Cell basics", "Human organs", "Photosynthesis"] },
      { id: "bi2", emoji: "🔵", title: "Lower Intermediate", topics: ["Cell structure", "Digestive system", "Respiratory system", "Basic genetics"] },
      { id: "bi3", emoji: "🟡", title: "Upper Intermediate", topics: ["Mitosis vs meiosis", "DNA & genes", "Natural selection", "Ecosystems"] },
      { id: "bi4", emoji: "🟠", title: "Advanced High School", topics: ["DNA replication", "Protein synthesis", "Genetic engineering", "Speciation"] },
    ],
  },
  chemistry: {
    icon: "🧪", color: "#d97706", label: "Chemistry", levels: [
      { id: "ch1", emoji: "🟢", title: "Elementary Chemistry", topics: ["States of matter", "Atoms & elements", "Simple reactions", "Lab safety"] },
      { id: "ch2", emoji: "🔵", title: "Lower Intermediate", topics: ["Atomic structure", "Periodic table", "Chemical bonds", "Balancing equations"] },
      { id: "ch3", emoji: "🟡", title: "Upper Intermediate", topics: ["Stoichiometry", "Mole concept", "Acids & bases", "Periodic trends"] },
      { id: "ch4", emoji: "🟠", title: "Advanced High School", topics: ["Reaction rates", "Equilibrium", "Redox reactions", "Organic chemistry intro"] },
    ],
  },
  english: {
    icon: "📖", color: "#be185d", label: "English", levels: [
      { id: "en1", emoji: "🟢", title: "Basic English", topics: ["Parts of speech", "Basic sentences", "Common vocabulary"] },
      { id: "en2", emoji: "🔵", title: "Elementary English", topics: ["Tenses", "Articles", "Simple paragraphs"] },
      { id: "en3", emoji: "🟡", title: "Intermediate English", topics: ["Conditionals", "Passive voice", "Essay structure", "Inference"] },
      { id: "en4", emoji: "🟠", title: "Advanced English", topics: ["Parallel structure", "Evidence-based reasoning", "Argumentative essays"] },
    ],
  },
  history: {
    icon: "🏛️", color: "#1d4ed8", label: "World History", levels: [
      { id: "hi1", emoji: "🟢", title: "Prehistory & Early Humans", topics: ["Hunter-gatherers", "Agricultural Revolution", "Mesopotamia", "Ancient Egypt"] },
      { id: "hi2", emoji: "🔵", title: "Classical Civilizations", topics: ["Athenian democracy", "Roman Empire", "Maurya Empire", "Qin Dynasty"] },
      { id: "hi3", emoji: "🟡", title: "Middle Ages", topics: ["Feudal system", "Crusades", "Islamic Golden Age", "Mongol Empire"] },
      { id: "hi4", emoji: "🟠", title: "Revolutions Era", topics: ["Enlightenment", "American Revolution", "French Revolution", "Industrial Revolution"] },
    ],
  },
  informatics: {
    icon: "💻", color: "#6366f1", label: "Informatics", levels: [
      { id: "in1", emoji: "🟢", title: "Basic Informatics", topics: ["Hardware vs software", "CPU & RAM", "Internet basics", "Algorithms"] },
      { id: "in2", emoji: "🔵", title: "Intro to Programming", topics: ["Variables", "Conditions", "Loops", "Functions"] },
      { id: "in3", emoji: "🟡", title: "Data Structures", topics: ["Arrays", "Stacks & queues", "Linked lists", "Big O notation"] },
      { id: "in4", emoji: "🟠", title: "Advanced Programming", topics: ["Dynamic programming", "Graph theory", "OOP principles"] },
    ],
  },
};
