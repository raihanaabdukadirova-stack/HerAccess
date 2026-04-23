import { useState, useEffect, useRef } from “react”;

const STORE = {
user: null, mistakes: [], completedLessons: [], testScores: [], weakTopics: {},
};
function recordMistake(subject, topic, question, correct, given) {
STORE.mistakes.push({ id: Date.now(), subject, topic, question, correct, given, timestamp: new Date().toISOString() });
const key = `${subject}:${topic}`;
STORE.weakTopics[key] = (STORE.weakTopics[key] || 0) + 1;
}
function recordLesson(subjectKey, levelId, score) {
STORE.completedLessons.push({ subjectKey, levelId, score, date: new Date().toISOString() });
}
function recordTestScore(type, score, total, section = “”) {
STORE.testScores.push({ type, score, total, section, date: new Date().toISOString() });
}
function getWeakTopics(limit = 5) {
return Object.entries(STORE.weakTopics).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, v]) => ({ topic: k, count: v }));
}

const SUBJECTS = {
physics: { icon: “⚛️”, color: “#7c3aed”, label: “Physics”, levels: [
{ id: “ph1”, emoji: “🟢”, title: “Elementary Physics”, topics: [“Units & measurements”, “Scalars vs vectors”, “Speed & velocity”, “Newton’s Laws”, “Work & Energy”] },
{ id: “ph2”, emoji: “🔵”, title: “Lower Intermediate”, topics: [“Projectile motion”, “Momentum”, “Sound waves”, “Heat transfer”, “Ohm’s Law”] },
{ id: “ph3”, emoji: “🟡”, title: “Upper Intermediate”, topics: [“Free-body diagrams”, “Work-energy theorem”, “Torque”, “Kirchhoff’s laws”, “Optics”] },
{ id: “ph4”, emoji: “🟠”, title: “Advanced High School”, topics: [“Harmonic motion”, “Thermodynamics”, “Capacitors”, “Photoelectric effect”] },
{ id: “ph5”, emoji: “🔴”, title: “University Level”, topics: [“Lagrangian mechanics”, “Maxwell’s equations”, “Schrödinger equation”, “Special Relativity”] },
]},
math: { icon: “📐”, color: “#ec4899”, label: “Mathematics”, levels: [
{ id: “ma1”, emoji: “🟢”, title: “Elementary Math”, topics: [“Fractions & decimals”, “Percentages”, “Prime numbers”, “Perimeter & area”] },
{ id: “ma2”, emoji: “🔵”, title: “Pre-Algebra”, topics: [“Variables”, “Linear equations”, “Inequalities”, “Ratios”] },
{ id: “ma3”, emoji: “🟡”, title: “Algebra 1”, topics: [“Graphing lines”, “Slope & intercept”, “Systems of equations”, “Functions”] },
{ id: “ma4”, emoji: “🟠”, title: “Geometry”, topics: [“Pythagorean theorem”, “Circles”, “Coordinate geometry”, “Transformations”] },
{ id: “ma5”, emoji: “🔴”, title: “Algebra 2”, topics: [“Quadratic formula”, “Polynomials”, “Logarithms”, “Sequences”] },
{ id: “ma6”, emoji: “🟣”, title: “Calculus”, topics: [“Derivatives”, “Integrals”, “Optimization”, “Limits”] },
]},
biology: { icon: “🧬”, color: “#059669”, label: “Biology”, levels: [
{ id: “bi1”, emoji: “🟢”, title: “Elementary Biology”, topics: [“Characteristics of life”, “Cell basics”, “Human organs”, “Photosynthesis”] },
{ id: “bi2”, emoji: “🔵”, title: “Lower Intermediate”, topics: [“Cell structure”, “Digestive system”, “Respiratory system”, “Basic genetics”] },
{ id: “bi3”, emoji: “🟡”, title: “Upper Intermediate”, topics: [“Mitosis vs meiosis”, “DNA & genes”, “Natural selection”, “Ecosystems”] },
{ id: “bi4”, emoji: “🟠”, title: “Advanced High School”, topics: [“DNA replication”, “Protein synthesis”, “Genetic engineering”, “Speciation”] },
]},
chemistry: { icon: “🧪”, color: “#d97706”, label: “Chemistry”, levels: [
{ id: “ch1”, emoji: “🟢”, title: “Elementary Chemistry”, topics: [“States of matter”, “Atoms & elements”, “Simple reactions”, “Lab safety”] },
{ id: “ch2”, emoji: “🔵”, title: “Lower Intermediate”, topics: [“Atomic structure”, “Periodic table”, “Chemical bonds”, “Balancing equations”] },
{ id: “ch3”, emoji: “🟡”, title: “Upper Intermediate”, topics: [“Stoichiometry”, “Mole concept”, “Acids & bases”, “Periodic trends”] },
{ id: “ch4”, emoji: “🟠”, title: “Advanced High School”, topics: [“Reaction rates”, “Equilibrium”, “Redox reactions”, “Organic chemistry intro”] },
]},
english: { icon: “📖”, color: “#be185d”, label: “English”, levels: [
{ id: “en1”, emoji: “🟢”, title: “Basic English”, topics: [“Parts of speech”, “Basic sentences”, “Common vocabulary”] },
{ id: “en2”, emoji: “🔵”, title: “Elementary English”, topics: [“Tenses”, “Articles”, “Simple paragraphs”] },
{ id: “en3”, emoji: “🟡”, title: “Intermediate English”, topics: [“Conditionals”, “Passive voice”, “Essay structure”, “Inference”] },
{ id: “en4”, emoji: “🟠”, title: “Advanced English”, topics: [“Parallel structure”, “Evidence-based reasoning”, “Argumentative essays”] },
]},
history: { icon: “🏛️”, color: “#1d4ed8”, label: “World History”, levels: [
{ id: “hi1”, emoji: “🟢”, title: “Prehistory & Early Humans”, topics: [“Hunter-gatherers”, “Agricultural Revolution”, “Mesopotamia”, “Ancient Egypt”] },
{ id: “hi2”, emoji: “🔵”, title: “Classical Civilizations”, topics: [“Athenian democracy”, “Roman Empire”, “Maurya Empire”, “Qin Dynasty”] },
{ id: “hi3”, emoji: “🟡”, title: “Middle Ages”, topics: [“Feudal system”, “Crusades”, “Islamic Golden Age”, “Mongol Empire”] },
{ id: “hi4”, emoji: “🟠”, title: “Revolutions Era”, topics: [“Enlightenment”, “American Revolution”, “French Revolution”, “Industrial Revolution”] },
]},
informatics: { icon: “💻”, color: “#6366f1”, label: “Informatics”, levels: [
{ id: “in1”, emoji: “🟢”, title: “Basic Informatics”, topics: [“Hardware vs software”, “CPU & RAM”, “Internet basics”, “Algorithms”] },
{ id: “in2”, emoji: “🔵”, title: “Intro to Programming”, topics: [“Variables”, “Conditions”, “Loops”, “Functions”] },
{ id: “in3”, emoji: “🟡”, title: “Data Structures”, topics: [“Arrays”, “Stacks & queues”, “Linked lists”, “Big O notation”] },
{ id: “in4”, emoji: “🟠”, title: “Advanced Programming”, topics: [“Dynamic programming”, “Graph theory”, “OOP principles”] },
]},
};

const FLASH_SETS = [
{ id: 1, title: “SAT Vocabulary”, subject: “English”, count: 8, cards: [
{ front: “Aberrant”, back: “Departing from the norm; abnormal” },
{ front: “Benevolent”, back: “Well-meaning and generous; kind” },
{ front: “Cacophony”, back: “A harsh, discordant mixture of sounds” },
{ front: “Didactic”, back: “Intended to teach; overly moralistic” },
{ front: “Ephemeral”, back: “Lasting for a very short time; transitory” },
{ front: “Garrulous”, back: “Excessively talkative on trivial matters” },
{ front: “Hubris”, back: “Excessive pride or self-confidence” },
{ front: “Innate”, back: “Inborn; natural; not acquired” },
]},
{ id: 2, title: “Physics Formulas”, subject: “Physics”, count: 6, cards: [
{ front: “Newton’s 2nd Law”, back: “F = ma” },
{ front: “Kinetic Energy”, back: “KE = ½mv²” },
{ front: “Ohm’s Law”, back: “V = IR” },
{ front: “Work”, back: “W = Fd cos θ” },
{ front: “Momentum”, back: “p = mv” },
{ front: “Gravitational PE”, back: “PE = mgh” },
]},
{ id: 3, title: “Biology Key Terms”, subject: “Biology”, count: 6, cards: [
{ front: “Mitosis”, back: “Cell division → 2 identical daughter cells” },
{ front: “Photosynthesis”, back: “6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂” },
{ front: “DNA”, back: “Carrier of genetic information in cells” },
{ front: “Natural Selection”, back: “Favorable traits → more reproduction” },
{ front: “Meiosis”, back: “Cell division → 4 genetically diverse gametes” },
{ front: “Homeostasis”, back: “Maintaining stable internal conditions” },
]},
{ id: 4, title: “IELTS Academic Words”, subject: “English”, count: 8, cards: [
{ front: “Proliferate”, back: “To increase rapidly in number” },
{ front: “Exacerbate”, back: “To make a problem worse” },
{ front: “Ubiquitous”, back: “Present or found everywhere” },
{ front: “Mitigate”, back: “To reduce the impact of something” },
{ front: “Substantiate”, back: “To provide evidence for a claim” },
{ front: “Paramount”, back: “More important than everything else” },
{ front: “Ambiguous”, back: “Open to multiple interpretations” },
{ front: “Dichotomy”, back: “Division into two contrasting parts” },
]},
];

const ORKHAN_Q = [
{ id:1,  type:“grid”, section:“Geometry”,      q:“In triangle RST, angle R=10° and angle T=50°. Point L lies on RS, point K on ST, and LK is parallel to RT. What is the measure of angle SKL in degrees?”, correctAns:“50”,  exp:“Since LK∥RT, corresponding angles: ∠SKL = ∠T = 50°.” },
{ id:2,  type:“mcq”,  section:“Advanced Math”, q:“The expression x²⁰(x−4)/(5x²) + 4x²⁰/(5x²) is equivalent to (1/5)xᶜ where x>0. What is c?”, opts:[“4”,“5”,“19”,“21”], ans:2, exp:“Simplify: x²¹/(5x²) = (1/5)x¹⁹. So c = 19.” },
{ id:3,  type:“mcq”,  section:“Algebra”,       q:“Which region contains NO solutions to 7x + 4y > 12?”, opts:[“x>0 and y>0”,“x<0 and y>0”,“x<0 and y<0”,“x>0 and y<0”], ans:2, exp:“If both x<0 and y<0, then 7x+4y<0<12. No solutions.” },
{ id:4,  type:“mcq”,  section:“Geometry”,      q:”(x+3)²+(y−4)²=25. Which point lies on this circle?”, opts:[”(−3, 4)”,”(3, −4)”,”(√11+3, √14−4)”,”(√11−3, √14+4)”], ans:3, exp:“Test (√11−3, √14+4): (√11)²+(√14)²=11+14=25 ✓” },
{ id:5,  type:“mcq”,  section:“Advanced Math”, q:“y = −100x² + 2400x + 25600 models revenue. At what x is revenue maximized?”, opts:[“8”,“12”,“24”,“32”], ans:1, exp:“Vertex at x = −b/2a = 2400/200 = 12.” },
{ id:6,  type:“mcq”,  section:“Advanced Math”, q:“Object launched from 0 ft reaches max height 1782 ft at t=9 sec. Height at t=12 sec?”, opts:[“594”,“778”,“1,584”,“970”], ans:2, exp:“h(t)=−22(t−9)²+1782. h(12)=−22(9)+1782=1,584 ft.” },
{ id:7,  type:“grid”, section:“Geometry”,      q:“Two similar cylinders: Vol A=300π (r=10), Vol B=37500π. SA_A=kπ, SA_B=nπ. Find n−k.”, correctAns:“6240”, exp:“Scale=5. k=260, n=6500. n−k=6240.” },
{ id:8,  type:“mcq”,  section:“Algebra”,       q:“12-lb cat: chicken 2.25 cans/8 lbs/day, duck 1.75 cans/9 lbs/day. Equation for c (chicken) and d (duck)?”, opts:[”(1.75/9)c+(2.25/8)d=12”,”(2.25/8)c+(1.75/9)d=12”,”(9/1.75)c+(8/2.25)d=12”,”(8/2.25)c+(9/1.75)d=12”], ans:3, exp:“Each chicken can covers 8/2.25 lbs; duck covers 9/1.75 lbs.” },
{ id:9,  type:“grid”, section:“Advanced Math”, q:“y=aˣ−b passes through (c,7) and (2c,247). What is b?”, correctAns:“9”, exp:”(7+b)²=247+b → b=9 or b=−22. b=9 works: aᶜ=16, a²ᶜ=256=247+9 ✓” },
{ id:10, type:“grid”, section:“Advanced Math”, q:”(x+9) is a factor of f(x). Vertex is (−2.75, d). What is the other zero c?”, correctAns:“3.5”, exp:“Midpoint of zeros = vertex x: (−9+c)/2=−2.75 → c=3.5.” },
{ id:11, type:“mcq”,  section:“Data Analysis”, q:“325 visitors in rooms A, B, C. P(A)=0.48, P(B)=0.16. How many in room C?”, opts:[“25”,“36”,“104”,“117”], ans:3, exp:“P(C)=0.36. 0.36×325=117.” },
{ id:12, type:“grid”, section:“Algebra”,       q:“19.5x + 29.75y = 394 (mulch x, river rock y). How much more per unit did river rock cost than mulch?”, correctAns:“10.25”, exp:“29.75−19.50=10.25.” },
{ id:13, type:“mcq”,  section:“Algebra”,       q:“Bus: $750 for first 2 hrs, $50/hr after. Total for t hrs = $1050. Equation?”, opts:[“750(t−2)+50t=1050”,“750(2t)+50t=1050”,“750+50(t−2)=1050”,“750+50(2t)=1050”], ans:2, exp:“750 + 50(t−2) = 1050.” },
{ id:14, type:“mcq”,  section:“Geometry”,      q:“Right △RST: R+S=90°. sin(R)=4√2/9. What is cos(S)?”, opts:[“4√2/9”,“4√2/7”,“7√2/8”,“9√2/8”], ans:0, exp:“Complementary angles: cos(S)=sin(R)=4√2/9.” },
{ id:15, type:“mcq”,  section:“Algebra”,       q:“g(m)=−0.05m+14.1 models gallons remaining. Gallons used per mile?”, opts:[“0.05”,“14.1”,“20”,“282”], ans:0, exp:“Slope=−0.05 → 0.05 gallons per mile.” },
{ id:16, type:“grid”, section:“Algebra”,       q:“Bank account graph: y=f(x) shows balance after x months. What is the initial deposit (y-intercept)?”, correctAns:“10”, exp:“The y-intercept (x=0) from the graph ≈ $10.” },
{ id:17, type:“grid”, section:“Advanced Math”, q:“y=900ax². Rope of 2.25 in circumference has strength 6378.75 lbs. Strength of 3.50 in rope?”, correctAns:“15435”, exp:“a=1.4. y=900(1.4)(12.25)=15,435 lbs.” },
{ id:18, type:“grid”, section:“Algebra”,       q:“48x+96=r(3x+6). r is a positive integer. If more than one solution exists, what is r?”, correctAns:“16”, exp:“3r=48 → r=16. Check: 6r=96 ✓” },
{ id:19, type:“mcq”,  section:“Algebra”,       q:“0.5t+4=8 models hair growth. Best interpretation of 0.5?”, opts:[“Months to grow 1 inch”,“Inches grown per month”,“Months to reach 8 inches”,“Inches grown in 8 months”], ans:1, exp:“0.5 is the rate: 0.5 inches per month.” },
{ id:20, type:“grid”, section:“Geometry”,      q:“Right circular cone: slant height AB=56 cm, height=28 cm. Volume=kπ cm³. Find k.”, correctAns:“21952”, exp:“r=28√3. V=(1/3)π(2352)(28)=21952π.” },
{ id:21, type:“grid”, section:“Data Analysis”, q:“Momentum graph: at x=2 momentum≈4, at x=6 momentum≈7. Average rate of change from x=2 to x=6?”, correctAns:“0.75”, exp:”(7−4)/(6−2)=3/4=0.75 N·s per second.” },
{ id:22, type:“grid”, section:“Geometry”,      q:“△PQR: P=(7x+9)°, Q=(3x+8)°, R=(4y+3)°. QR extended to S; ∠PRS=(x+y)°. Find x+y.”, correctAns:“37”, exp:“x=2, y=35 via exterior angle theorem. x+y=37.” },
{ id:23, type:“grid”, section:“Advanced Math”, q:“Object from 0 ft, max height 1600 ft at t=10 sec. Height at t=7 sec?”, correctAns:“1456”, exp:“h(t)=−16(t−10)²+1600. h(7)=−144+1600=1456 ft.” },
{ id:24, type:“mcq”,  section:“Advanced Math”, q:“f(x)=ax²+bx+c passes through (10,0) and (−3,0). a is integer >1. Which could be a+b?”, opts:[“−12”,“−6”,“7”,“8”], ans:0, exp:“b=−7a. a+b=−6a. If a=2: −12.” },
{ id:25, type:“mcq”,  section:“Algebra”,       q:“For x>0, f(x)=300% of x. Which describes this function?”, opts:[“Decreasing exponential”,“Decreasing linear”,“Increasing exponential”,“Increasing linear”], ans:3, exp:“f(x)=3x is increasing and linear.” },
{ id:26, type:“grid”, section:“Data Analysis”, q:“2000 attended webinar 1. 65% attended webinar 2. Of those who skipped webinar 2, 31% attended webinar 3. How many attended 1 and 3 but NOT 2?”, correctAns:“217”, exp:“Skipped webinar 2: 700. 31%×700=217.” },
{ id:27, type:“mcq”,  section:“Data Analysis”, q:“June 15: 168 butterflies. Increase from May 1=31.25%. How many on May 1?”, opts:[“128”,“116”,“53”,“5”], ans:0, exp:“168/1.3125=128.” },
{ id:28, type:“mcq”,  section:“Geometry”,      q:“Circle M: (x+6a)²+(y−38a)²=36a². Circle V = M shifted 12a right. Equation of V?”, opts:[”(x+18a)²+(y−38a)²=36a²”,”(x+6a)²+(y−50a)²=36a²”,”(x+6a)²+(y−26a)²=36a²”,”(x−6a)²+(y−38a)²=36a²”], ans:3, exp:“New center: (6a, 38a). Equation: (x−6a)²+(y−38a)²=36a².” },
{ id:29, type:“mcq”,  section:“Geometry”,      q:“Three points define a circle with circumference kπ. From the graph, what is k?”, opts:[“3”,“6”,“9”,“12”], ans:2, exp:“Radius=9/2. Circumference=2π(9/2)=9π. k=9.” },
{ id:30, type:“mcq”,  section:“Data Analysis”, q:“Set A capacitors: 4,7,10,13,16 μF. Set B = Set A + 14 μF each. True about Set B?”, opts:[“Mean=10, Range=12”,“Mean=10, Range=26”,“Mean=24, Range=12”,“Mean=24, Range=26”], ans:2, exp:“Mean increases by 14 → 24. Range unchanged → 12.” },
{ id:31, type:“grid”, section:“Algebra”,       q:“Budget $2800, min 275 books. Paperback=$4.10, Hardcover=$11.10. Max hardcover books?”, correctAns:“238”, exp:“7h≤1672.5 → h≤238.” },
{ id:32, type:“mcq”,  section:“Algebra”,       q:“Total mass of r identical objects is t kg. Total mass of 139r objects?”, opts:[“139−t”,“139+t”,“t/139”,“139t”], ans:3, exp:“Each object=t/r. Total=(t/r)×139r=139t.” },
{ id:33, type:“grid”, section:“Algebra”,       q:“h=9(v−273.15)/5+32. If h=413.33°F, find v in kelvins.”, correctAns:“485”, exp:“413.33−32=381.33. ×5/9=211.85. +273.15≈485 K.” },
{ id:34, type:“mcq”,  section:“Advanced Math”, q:“r(t)=69t−2t². s(t)=r(t)+1. Maximum value of s(t)?”, opts:[“1−(69/2)²”,“1−2(69/4)²”,“1+2(69/4)²”,“1+(69/2)²”], ans:2, exp:“Max of r=2(69/4)². Max of s=1+2(69/4)².” },
{ id:35, type:“mcq”,  section:“Algebra”,       q:“14000=2500+250t (car purchase). Best interpretation of 250?”, opts:[“Down payment”,“Each monthly payment”,“Total paid after t months”,“Number of payments”], ans:1, exp:“250 is the per-payment amount.” },
{ id:36, type:“grid”, section:“Advanced Math”, q:“C(t)=240(53/52)^(t−15)+7. When was C(t)=247?”, correctAns:“15”, exp:“247=240(1)^(t−15)+7 → t=15.” },
{ id:37, type:“mcq”,  section:“Geometry”,      q:“Right triangle QRS, QR=17 (horizontal leg), QR<RS. Length of hypotenuse QS?”, opts:[“17 cos Q”,“17 sin Q”,“17/cos Q”,“17/sin Q”], ans:2, exp:“cos Q=adjacent/hypotenuse=17/QS → QS=17/cos Q.” },
{ id:38, type:“mcq”,  section:“Algebra”,       q:“Machine: 8-in=4n, 9-in=n, 3-in=30 parts. Total=100. Which equation?”, opts:[“8(4n)+9n+3(30)=100”,“8n+9n+3n=100”,“4n+30=100”,“5n+30=100”], ans:3, exp:“n+4n+30=100 → 5n+30=100.” },
{ id:39, type:“grid”, section:“Geometry”,      q:“Regular 87-sided polygon. Each interior angle=(180p)°. Find p.”, correctAns:“0.977”, exp:“Each angle=15300/87≈175.86°. p=175.86/180≈0.977.” },
{ id:40, type:“mcq”,  section:“Data Analysis”, q:“14 salmon weights. A 68-lb salmon added (n=15). Which must be greater?\nI. Median  II. Mean”, opts:[“I only”,“II only”,“I and II”,“Neither”], ans:1, exp:“68 lbs is far above existing values, so mean must increase. Median may not change.” },
];

const ORKHAN_Q2 = [
{ id:1,  type:“grid”, section:“Geometry”,      q:“Triangle ABC ~ triangle DEF (A↔D, right angles at C and F). AB = 2.4 × DE. If tan A = 21/20, what is sin D?”, correctAns:“21/29”, exp:“tan A=21/20 → opp=21, adj=20, hyp=29. sin A=21/29. Since A↔D in similar triangles, sin D = sin A = 21/29.” },
{ id:2,  type:“mcq”,  section:“Data Analysis”, q:“A bacteria concentration graph shows growth over time. Approximately how many minutes did it take for concentration to increase from 20 to 30 million cells/mL?”, opts:[“15”,“20”,“30”,“35”], ans:1, exp:“Reading the exponential growth graph: 20 million ≈ x=30 min; 30 million ≈ x=50 min. Difference ≈ 20 minutes.” },
{ id:3,  type:“mcq”,  section:“Advanced Math”, q:“f(x) = |71 − 2x|. For which value of k does f(k) = 3k?”, opts:[“71/5”,“71/2”,“213/5”,“71”], ans:0, exp:“Case 1: 71−2k=3k → k=71/5. Verify: f(71/5)=|71−142/5|=213/5 and 3(71/5)=213/5 ✓” },
{ id:4,  type:“mcq”,  section:“Geometry”,      q:“Right rectangular prism with square base: volume=2,448 cm³, base area=144 cm². What is the area of one lateral face?”, opts:[“17”,“204”,“540”,“816”], ans:1, exp:“h=2448/144=17. Side=√144=12. Lateral face=12×17=204 cm².” },
{ id:5,  type:“grid”, section:“Advanced Math”, q:“Quadratic y=f(x) crosses x-axis at x=39 and x=p. Maximum at (14, m). What is p?”, correctAns:”-11”, exp:“Vertex midpoint of zeros: (39+p)/2=14 → p=−11.” },
{ id:6,  type:“grid”, section:“Advanced Math”, q:”(x+9) is a factor of f(x); x=c is the other zero. Vertex is (−2.75, d). What is c?”, correctAns:“3.5”, exp:”(−9+c)/2=−2.75 → c=3.5.” },
{ id:7,  type:“grid”, section:“Advanced Math”, q:“Vertex of f(x) is (8,−10). Point (7,−12) lies on the parabola. g(x)=4f(x). What is g(0)−f(0)?”, correctAns:”-414”, exp:“f(x)=a(x−8)²−10. f(7)=a−10=−12 → a=−2. f(0)=−2(64)−10=−138. g(0)=4(−138)=−552. g(0)−f(0)=−414.” },
{ id:8,  type:“grid”, section:“Geometry”,      q:“cos A = sin B for acute angles. ∠A=5x+10°, ∠B=40+3x°. What is x?”, correctAns:“5”, exp:“cos A=sin B means A+B=90°. (5x+10)+(40+3x)=90 → 8x=40 → x=5.” },
{ id:9,  type:“mcq”,  section:“Algebra”,       q:“Math tutor: $200 for first month, $150 each additional month. Total revenue R(m) for m months and n students?”, opts:[“R=150mn+50”,“R=150mn+200”,“R=150mn+50n”,“R=150mn+200n”], ans:2, exp:“Per student for m months: 200+150(m−1)=150m+50. For n students: n(150m+50)=150mn+50n.” },
{ id:10, type:“grid”, section:“Data Analysis”, q:“Scatter plot: temperatures (°C) for days after Feb 10. At day 3 (Feb 13)≈8°C, day 5 (Feb 15)≈10°C. Average increase per day?”, correctAns:“1”, exp:“Change=10−8=2°C over 2 days. Rate=1°C per day.” },
{ id:11, type:“grid”, section:“Algebra”,       q:“Table: (−11,−25) and (9,55). Line passes through (1/3, a). What is a? (Round to nearest tenth)”, correctAns:“20.3”, exp:“Slope=(55+25)/(9+11)=4. y-int: 55=36+b → b=19. y=4x+19. At x=1/3: y=4/3+19≈20.3.” },
{ id:12, type:“grid”, section:“Data Analysis”, q:“1,250 attended webinar 1. 68% attended webinar 2. 32% of those who attended 1 and 2 attended webinar 3. How many attended all three?”, correctAns:“272”, exp:“Webinar 2: 0.68×1250=850. All three: 0.32×850=272.” },
{ id:13, type:“mcq”,  section:“Advanced Math”, q:“Graph of y=f(x) shown (y-intercept=1). What is the y-intercept of y=f(x)+13?”, opts:[”(0,−12)”,”(0,14)”,”(1,13)”,”(1,14)”], ans:1, exp:“f(0)=1 (from graph). f(0)+13=14. y-intercept is (0,14).” },
{ id:14, type:“mcq”,  section:“Algebra”,       q:“Minimum value of x is 11 less than 8 times n. Which shows possible values of x?”, opts:[“x ≤ 8n−11”,“x ≥ 8n−11”,“x ≤ 11−8n”,“x ≥ 11−8n”], ans:1, exp:“Minimum of x = 8n−11 → x ≥ 8n−11.” },
{ id:15, type:“mcq”,  section:“Algebra”,       q:“Shaded region shows solutions to −18y < c. Boundary line appears at y=−9. What is c?”, opts:[“162”,“9”,“−9”,“−162”], ans:3, exp:“At boundary y=−9: c=−18(−9)=162. Shading is below y=−9 (y<−9), so −18y>162 → c=−162.” },
{ id:16, type:“mcq”,  section:“Geometry”,      q:“Right triangle RST: RS=168, ST=160, TR=232. △RST ~ △UVW (S↔V, T↔W). What is tan W?”, opts:[“20/29”,“21/29”,“20/21”,“21/20”], ans:3, exp:“Right angle at S. tan T=RS/ST=168/160=21/20. Since T↔W, tan W=21/20.” },
{ id:17, type:“mcq”,  section:“Algebra”,       q:“−3|x−3| = −9x. What are all solutions?”, opts:[“−3/2”,“3/4”,“−3/2 and 3/4”,“3/4 and 3/2”], ans:1, exp:”|x−3|=3x. Case 2: −(x−3)=3x → 3=4x → x=3/4 ✓. Case 1: x=−3/2 fails (3x<0). Only x=3/4.” },
{ id:18, type:“mcq”,  section:“Advanced Math”, q:“z(w)=(0.825)^(2w). z decreases by p% for each increase of 1 in w. What is p?”, opts:[“31.9”,“17.5”,“0.825”,“0.175”], ans:0, exp:“z(w+1)/z(w)=(0.825)²=0.6806. Decrease=31.9%.” },
{ id:19, type:“mcq”,  section:“Geometry”,      q:“x²−4x+y²−8y−80=0. Circle inscribed in a square. What is the perimeter?”, opts:[“20”,“40”,“80”,“320”], ans:2, exp:”(x−2)²+(y−4)²=100. r=10. Side=20. Perimeter=80.” },
{ id:20, type:“mcq”,  section:“Advanced Math”, q:“Which are factors of 4x²+27x−40?\nI. x−8\nII. 4x−5”, opts:[“I only”,“II only”,“I and II”,“Neither I nor II”], ans:1, exp:“4x²+27x−40=(4x−5)(x+8). Factor II (4x−5) ✓. Factor I (x−8) ✗.” },
{ id:21, type:“mcq”,  section:“Geometry”,      q:“Right circular cone: volume=75,600π cm³, base area=3,600π cm². What is the slant height (cm)?”, opts:[“21”,“60”,“63”,“87”], ans:3, exp:“r=60, h=63. Slant=√(3600+3969)=√7569=87.” },
{ id:22, type:“mcq”,  section:“Advanced Math”, q:“Exponential f: f(1)=k. Which form shows k as the coefficient or base?\n(A)35(1.6)^(x+1) (B)56(1.6)^x (C)89.6(1.6)^(x−1) (D)143.36(1.6)^(x−2)”, opts:[“f(x)=35(1.6)^(x+1)”,“f(x)=56(1.6)^x”,“f(x)=89.6(1.6)^(x−1)”,“f(x)=143.36(1.6)^(x−2)”], ans:2, exp:“f(1)=89.6(1.6)⁰=89.6=k. k appears as the coefficient. Answer C.” },
{ id:23, type:“mcq”,  section:“Algebra”,       q:“Line k (from graph) has slope −4/3. Line j is perpendicular to k through (−20,−25). Equation of j?”, opts:[“y=(3/4)x−10”,“y=(3/4)x−40”,“y=(4/3)x−10”,“y=(4/3)x−40”], ans:0, exp:“Perpendicular slope=3/4. y+25=(3/4)(x+20) → y=(3/4)x−10.” },
{ id:24, type:“mcq”,  section:“Data Analysis”, q:“11 temps recorded. 77.2°F removed → 10 temps. Which must be true?\nI. New mean < original mean\nII. New median < original median”, opts:[“I only”,“II only”,“I and II”,“Neither I nor II”], ans:0, exp:“Removing a high value lowers the mean (I ✓). Median shift depends on distribution — not guaranteed (II ✗).” },
{ id:25, type:“mcq”,  section:“Algebra”,       q:“f(x)=50x+24: distance a train traveled x hours after crossing a city border. Best interpretation of 24?”, opts:[“Distance of 24 km between station and city border”,“Speed of 24 km/h after border”,“Total 24 km traveled after border”,“Speed of 24 km/h between station and border”], ans:0, exp:“24 is the y-intercept (x=0): distance already traveled at border = 24 km between station and city border.” },
{ id:26, type:“mcq”,  section:“Geometry”,      q:“Rectangle inscribed in circle: diagonal = 2 × shortest side. Circumference = 114π. Area of rectangle?”, opts:[“57√2”,“57√3”,“3,249√2”,“3,249√3”], ans:3, exp:“r=57, diagonal=114=2s → s=57. l=s√3=57√3. Area=s·l=57·57√3=3249√3.” },
{ id:27, type:“mcq”,  section:“Geometry”,      q:“x²−6x+y²−4y−51=0. Circle inscribed in a square. Perimeter of square?”, opts:[“16”,“32”,“64”,“204”], ans:2, exp:”(x−3)²+(y−2)²=64. r=8. Side=16. Perimeter=64.” },
{ id:28, type:“mcq”,  section:“Advanced Math”, q:“f(x)=k(1.83)^x increases p% per unit x. Which g(x) increases p% per 1/4 unit increase in x?”, opts:[“g(x)=k(1.83^x)^(1/4)”,“g(x)=k(1.83^x)^4”,“g(x)=k(1.83)^(x+1/4)”,“g(x)=k(1.83)^(x−1/4)”], ans:1, exp:“Need g(x+1/4)/g(x)=1.83. If g=k·b^x, then b^(1/4)=1.83 → b=1.83⁴=(1.83^x)⁴. So g(x)=k(1.83^x)^4.” },
{ id:29, type:“grid”, section:“Geometry”,      q:“Line intersects two parallel lines: acute angle=(9x−490)°. Sum of 1 acute + 3 obtuse = (−18x+w)°. What is w?”, correctAns:“1520”, exp:“Obtuse=180−(9x−490)=670−9x. Sum=(9x−490)+3(670−9x)=−18x+1520. w=1520.” },
{ id:30, type:“grid”, section:“Advanced Math”, q:“f(x)=abˣ. If f(n+1)=f(n)+(82/100)f(n), what is b?”, correctAns:“1.82”, exp:“f(n+1)=1.82f(n). Since f(n+1)=ab^(n+1) and f(n)=ab^n, ratio=b=1.82.” },
{ id:31, type:“grid”, section:“Advanced Math”, q:“y=900ax². Circumference 1.75 in → 3,858.75 lbs. What is strength for 7.50 in rope?”, correctAns:“70875”, exp:“a: 3858.75=900a(1.75²)=2756.25a → a=1.4. y=900(1.4)(56.25)=70,875.” },
{ id:32, type:“grid”, section:“Algebra”,       q:“x ≥ −9 represents all solutions to ax−24 ≤ 21. Greatest possible value of a?”, correctAns:”-5”, exp:“ax ≤ 45. For x≥−9: divide by a (negative flips): x≥45/a → 45/a=−9 → a=−5.” },
{ id:33, type:“grid”, section:“Geometry”,      q:“AB=√61, AC=5, CE=35. Right angles at C and E. What is the area of triangle ADE?”, correctAns:“960”, exp:“BC=√(61−25)=6. AE=40. Scale=40/5=8. DE=48. Area=½×40×48=960.” },
{ id:34, type:“grid”, section:“Algebra”,       q:“Graph of line g shown (passes through (0,2) and (1,0), slope=−2). Line k: 154x+py=w is the same line. What is p+w?”, correctAns:“231”, exp:“y=−2x+2 → 2x+y=2. ×77: 154x+77y=154. p=77, w=154. p+w=231.” },
{ id:35, type:“mcq”,  section:“Algebra”,       q:“9x+8y=5. Which could be another equation in a system with at least one solution?\nI. 13.5x+12y=7.5\nII. 13.5x−12y=7.5”, opts:[“I only”,“II only”,“I and II”,“Neither I nor II”], ans:2, exp:“I: 1.5× equation 1 → infinite solutions ✓. II: different slope → one solution ✓. Both valid.” },
{ id:36, type:“mcq”,  section:“Algebra”,       q:“Table: (−12,44),(a,14),(2,b). Linear, y-intercept=(0,−16). What is a+b?”, opts:[“−32”,“−31”,“−22”,“−21”], ans:0, exp:“Slope=−5 (from (0,−16) and (−12,44)). y=−5x−16. a=−6, b=−26. a+b=−32.” },
{ id:37, type:“mcq”,  section:“Advanced Math”, q:“CV²/P=√(PR). When R=18, express P in terms of C and V.”, opts:[“P=CV²/√(18P)”,“P=CV²/√18”,“P=∛(C²V⁴/18)”,“P=∛(18/(C²V⁴))”], ans:2, exp:“Square both sides: C²V⁴/P²=18P → P³=C²V⁴/18 → P=∛(C²V⁴/18).” },
{ id:38, type:“mcq”,  section:“Advanced Math”, q:“f(n)=7(20.44)^(n/4). Term at position 14 is p% more than term at position 10. What is p?”, opts:[“20.44”,“44”,“1,944”,“2,044”], ans:2, exp:“Ratio=f(14)/f(10)=(20.44)^(4/4)=20.44. p=(20.44−1)×100=1944%.” },
{ id:39, type:“mcq”,  section:“Geometry”,      q:“Right square pyramid: total SA=28,160 in², lateral SA=16,060 in². What is the height (inches)?”, opts:[“48”,“55”,“73”,“110”], ans:0, exp:“Base SA=12100, side=110. Each face=4015=½×110×l → l=73. h=√(73²−55²)=√2304=48.” },
{ id:40, type:“grid”, section:“Advanced Math”, q:“6x⁴+17x²+7=(3x²+a)(2x²+b) with a,b positive integers, also =(3x²+c)(2x²+d) with c,d positive nonintegers. What is a+c?”, correctAns:“10.5”, exp:“Integer: (3x²+7)(2x²+1)=6x⁴+17x²+7 ✓ → a=7. Noninteger: solve 3d+2c=17, cd=7/6; c=7/2=3.5. a+c=7+3.5=10.5.” },
];

const SEC_COLORS = { Algebra:”#7c3aed”, “Advanced Math”:”#2563eb”, Geometry:”#059669”, “Data Analysis”:”#d97706” };
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

async function callAI(system, userMsg, maxTokens = 1200) {
const res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: “”,
“anthropic-version”: “2023-06-01”,
“anthropic-dangerous-direct-browser-access”: “true”
},
body: JSON.stringify({ model: “claude-sonnet-4-20250514”, max_tokens: maxTokens, system, messages: [{ role: “user”, content: userMsg }] })
});
const data = await res.json();
return data.content?.map(b => b.text || “”).join(””) || “”;
}

async function generateQuiz(subject, levelTitle, topics, count = 10) {
try {
const text = await callAI(“Generate educational quiz questions as valid JSON only.”,
`Generate ${count} MCQ questions for ${subject} - ${levelTitle}. Topics: ${topics.join(", ")}. Return JSON array: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`, 1500);
return JSON.parse(text.replace(/`json|`/g, “”).trim());
} catch {
return topics.slice(0, Math.min(count, topics.length)).map(t => ({
q: `Key concept in "${t}"?`, opts: [“Option A”, “Option B (correct)”, “Option C”, “Option D”], ans: 1,
exp: `Covers fundamentals of ${t} in ${subject}.`, topic: t
}));
}
}

async function generateWeaknessQuiz(weakTopics) {
const list = weakTopics.map(w => w.topic.split(”:”)[1] || w.topic).join(”, “);
try {
const text = await callAI(“Generate targeted quiz questions as valid JSON only.”,
`10 questions for weak areas: ${list}. Return JSON: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`, 1500);
return JSON.parse(text.replace(/`json|`/g, “”).trim());
} catch {
return weakTopics.slice(0, 5).map(w => ({
q: `Review: what is key about "${w.topic.split(":")[1] || w.topic}"?`,
opts: [“Option A”, “Option B”, “Option C”, “Option D”], ans: 1,
exp: `You missed this ${w.count} time(s). Review carefully.`, topic: w.topic
}));
}
}

// ─── CSS ────────────────────────────────────────────────────────────────────
const G = `@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0} :root{ --p:#6d28d9;--p2:#8b5cf6;--p3:#ede9fe;--p4:#f5f3ff; --pink:#db2777;--pink2:#fce7f3; --w:#fff;--g50:#fafafa;--g100:#f4f4f5;--g200:#e4e4e7; --g400:#a1a1aa;--g600:#52525b;--g800:#1c1917; --r:14px;--sh:0 4px 20px rgba(109,40,217,.08);--shm:0 8px 36px rgba(109,40,217,.14); } body{font-family:'Outfit',sans-serif;background:var(--w);color:var(--g800);-webkit-font-smoothing:antialiased} .app{min-height:100vh;display:flex;flex-direction:column} .nav{position:sticky;top:0;z-index:200;background:rgba(255,255,255,.97);backdrop-filter:blur(16px);border-bottom:1px solid var(--g200);padding:0 16px;display:flex;align-items:center;justify-content:space-between;height:56px} .brand{display:flex;align-items:center;gap:8px;cursor:pointer} .bi{width:30px;height:30px;background:linear-gradient(135deg,#6d28d9,#db2777);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px} .bn{font-family:'Lora',serif;font-size:17px;font-weight:700;background:linear-gradient(135deg,#6d28d9,#db2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent} .navl{display:flex;gap:2px;align-items:center} .nb{background:none;border:none;padding:5px 9px;border-radius:7px;font-size:12.5px;font-weight:500;color:var(--g600);cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;transition:all .15s} .nb:hover{background:var(--p4);color:var(--p)} .nb.act{background:var(--p4);color:var(--p);font-weight:600} .nb.cta{background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;padding:5px 14px} .ham{display:none;background:none;border:none;cursor:pointer;color:var(--g800);padding:4px} @media(max-width:700px){.navl{display:none}.navl.open{display:flex;flex-direction:column;position:fixed;top:56px;left:0;right:0;background:#fff;border-bottom:1px solid var(--g200);padding:10px 14px;z-index:199;gap:2px}.ham{display:block}} .page{flex:1;padding-bottom:48px} .wrap{max-width:1080px;margin:0 auto;padding:0 18px} .ph{font-family:'Lora',serif;font-size:clamp(20px,4vw,30px);font-weight:700;margin-bottom:6px} .ps{font-size:13px;color:var(--g400);margin-bottom:24px} .hero{background:linear-gradient(145deg,#faf5ff 0%,#ede9fe 40%,#fce7f3 100%);padding:72px 18px 56px;text-align:center;position:relative;overflow:hidden} .hero::after{content:'';position:absolute;bottom:-80px;left:50%;transform:translateX(-50%);width:600px;height:180px;background:radial-gradient(ellipse,rgba(139,92,246,.15) 0%,transparent 70%);pointer-events:none} .badge{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1px solid #c4b5fd;border-radius:999px;padding:5px 14px;font-size:11px;font-weight:700;color:var(--p);letter-spacing:.4px;text-transform:uppercase;margin-bottom:22px} .hero h1{font-family:'Lora',serif;font-size:clamp(30px,6vw,56px);font-weight:700;line-height:1.18;margin-bottom:18px} .hero h1 em{font-style:normal;background:linear-gradient(135deg,#6d28d9,#db2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent} .hero p{font-size:clamp(14px,2vw,17px);color:var(--g600);max-width:520px;margin:0 auto 30px;line-height:1.75} .hbtns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap} .btn{display:inline-flex;align-items:center;gap:6px;padding:12px 26px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;border:none;font-family:'Outfit',sans-serif;transition:all .2s} .btn-p{background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;box-shadow:0 4px 18px rgba(109,40,217,.28)} .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(109,40,217,.38)} .btn-o{background:#fff;color:var(--p);border:2px solid #c4b5fd} .btn-o:hover{background:var(--p4)} .btn-sm{padding:8px 18px;font-size:13px;border-radius:999px;font-weight:600;cursor:pointer;border:none;font-family:'Outfit',sans-serif;transition:all .15s} .bsp{background:var(--p);color:#fff} .bso{background:#fff;color:var(--p);border:2px solid #c4b5fd} .stats{display:flex;justify-content:center;gap:36px;padding:28px 18px;background:#fff;border-bottom:1px solid var(--g100);flex-wrap:wrap} .stat .n{font-family:'Lora',serif;font-size:26px;font-weight:700;background:linear-gradient(135deg,#6d28d9,#db2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent} .stat .l{font-size:11px;color:var(--g400);font-weight:500;margin-top:2px;text-transform:uppercase;letter-spacing:.4px} .card{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:20px;transition:all .2s} .card:hover{border-color:#c4b5fd;box-shadow:var(--sh)} .g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px} .g3{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px} .pbar{height:8px;background:var(--g100);border-radius:999px;overflow:hidden;flex:1} .pfill{height:100%;border-radius:999px;background:linear-gradient(90deg,#6d28d9,#db2777);transition:width .7s} .prow{display:flex;align-items:center;gap:10px;margin-bottom:10px} .plbl{font-size:12px;min-width:110px;color:var(--g600)} .ppct{font-size:11px;font-weight:700;color:var(--p);min-width:32px;text-align:right} .qcard{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:22px} .qtxt{font-size:15px;font-weight:600;margin-bottom:16px;line-height:1.55;white-space:pre-wrap} .qopts{display:flex;flex-direction:column;gap:9px} .qopt{background:var(--g50);border:2px solid var(--g200);border-radius:10px;padding:11px 15px;font-size:13px;cursor:pointer;text-align:left;transition:all .15s;font-family:'Outfit',sans-serif;width:100%} .qopt:hover:not(:disabled){border-color:#c4b5fd;background:var(--p4)} .qopt.correct{border-color:#059669!important;background:#f0fdf4!important;color:#065f46} .qopt.wrong{border-color:#dc2626!important;background:#fef2f2!important;color:#991b1b} .qopt.sel{border-color:var(--p2);background:var(--p4)} .qexp{margin-top:13px;background:var(--p4);border-left:3px solid var(--p2);padding:10px 13px;border-radius:0 8px 8px 0;font-size:12.5px;line-height:1.65} .qnav{display:flex;justify-content:space-between;align-items:center;margin-top:14px} .tutor-wrap{display:flex;flex-direction:column;height:calc(100vh - 56px);max-width:760px;margin:0 auto;padding:0 18px} .chat-area{flex:1;overflow-y:auto;padding:16px 0;display:flex;flex-direction:column;gap:11px} .msg{max-width:82%;padding:11px 15px;border-radius:16px;font-size:13.5px;line-height:1.65} .msg.ai{background:var(--p4);border:1px solid rgba(196,181,253,.4);align-self:flex-start;border-bottom-left-radius:3px} .msg.usr{background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:#fff;align-self:flex-end;border-bottom-right-radius:3px} .mname{font-size:10px;font-weight:700;color:var(--p);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px} .typing{display:flex;gap:4px;align-items:center} .dot{width:6px;height:6px;background:var(--p2);border-radius:50%;animation:bou 1.2s infinite} .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s} @keyframes bou{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}} .cinrow{display:flex;gap:8px;padding:12px 0;border-top:1px solid var(--g200)} .cin{flex:1;border:2px solid var(--g200);border-radius:12px;padding:11px 14px;font-size:13.5px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s;resize:none;min-height:46px;max-height:120px} .cin:focus{border-color:#c4b5fd} .csend{background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;border:none;border-radius:12px;padding:0 16px;font-size:17px;cursor:pointer;min-width:46px} .csend:disabled{opacity:.45} .chips{display:flex;gap:7px;flex-wrap:wrap;padding-bottom:10px} .chip{background:var(--p4);color:var(--p);border:1px solid #c4b5fd;border-radius:999px;padding:5px 12px;font-size:11.5px;font-weight:500;cursor:pointer;transition:all .15s} .chip:hover{background:var(--p);color:#fff} .scard{background:#fff;border:2px solid var(--g200);border-radius:var(--r);padding:18px 14px;text-align:center;cursor:pointer;transition:all .18s} .scard:hover,.scard.act{border-color:var(--p);background:var(--p4)} .litem{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:16px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .18s;margin-bottom:9px} .litem:hover{border-color:#c4b5fd;box-shadow:var(--sh)} .tchip{background:var(--p4);color:var(--p);font-size:10.5px;padding:2px 8px;border-radius:999px;font-weight:500} .tag{display:inline-block;background:var(--p4);color:var(--p);font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.3px} .back-btn{background:none;border:none;color:var(--p);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;margin-bottom:16px;font-family:'Outfit',sans-serif;padding:0} .alert{padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:14px;line-height:1.55} .ai{background:var(--p4);border:1px solid #c4b5fd;color:var(--p)} .aw{background:#fffbeb;border:1px solid #fcd34d;color:#92400e} .lds{display:inline-flex;gap:5px;align-items:center} .ld{width:7px;height:7px;border-radius:50%;background:var(--p2);animation:bou 1.2s infinite} .ld:nth-child(2){animation-delay:.15s}.ld:nth-child(3){animation-delay:.3s} .shed{font-family:'Lora',serif;font-size:17px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px} .dstat{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:18px} .dsv{font-family:'Lora',serif;font-size:30px;font-weight:700;background:linear-gradient(135deg,#6d28d9,#db2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent} .dsl{font-size:11.5px;color:var(--g400);margin-top:3px;text-transform:uppercase;letter-spacing:.4px} .mitem{padding:12px 14px;background:var(--g50);border-radius:8px;border:1px solid var(--g200);margin-bottom:8px} .fcard{background:#fff;border-radius:18px;box-shadow:var(--shm);padding:38px 28px;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;border:2px solid var(--g100);transition:transform .2s} .fcard:hover{transform:scale(1.01)} .fcard.flipped{background:var(--p4);border-color:#c4b5fd} .fset{background:#fff;border:2px solid var(--g200);border-radius:var(--r);padding:16px;cursor:pointer;transition:all .18s} .fset:hover{border-color:var(--p);box-shadow:var(--sh)} .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#faf5ff,#ede9fe,#fce7f3);padding:20px} .auth-card{background:#fff;border-radius:22px;padding:38px 32px;width:100%;max-width:380px;box-shadow:var(--shm)} .afield{margin-bottom:13px} .afield label{font-size:12px;font-weight:600;color:var(--g600);display:block;margin-bottom:5px} .afield input{width:100%;border:2px solid var(--g200);border-radius:9px;padding:10px 13px;font-size:13.5px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s} .afield input:focus{border-color:#c4b5fd} .sat-tab{padding:8px 16px;border-radius:999px;border:2px solid var(--g200);background:#fff;font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s;color:var(--g600)} .sat-tab.act{border-color:var(--p);background:var(--p4);color:var(--p)} .ielts-sec{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:18px;cursor:pointer;transition:all .18s} .ielts-sec:hover{border-color:#c4b5fd;box-shadow:var(--sh)} .passbox{background:var(--g50);border:1px solid var(--g200);border-radius:8px;padding:18px;font-size:13px;line-height:1.85;max-height:320px;overflow-y:auto;margin-bottom:18px;color:var(--g600)} .band-badge{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6d28d9,#db2777);color:#fff;padding:10px 22px;border-radius:999px;font-weight:700;font-size:17px;margin:14px 0} .sscore{background:var(--p4);border-radius:8px;padding:10px 14px;text-align:center} .essay-area{width:100%;border:2px solid var(--g200);border-radius:10px;padding:12px 14px;font-size:13.5px;font-family:'Outfit',sans-serif;min-height:200px;outline:none;resize:vertical;transition:border-color .2s} .essay-area:focus{border-color:#c4b5fd} .etbar{position:sticky;top:56px;z-index:100;background:#fff;border-bottom:2px solid var(--p3);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 2px 8px rgba(109,40,217,.08)} .tbox{display:flex;align-items:center;background:var(--g800);color:#fff;border-radius:8px;padding:7px 14px;font-family:'Lora',serif;font-size:18px;font-weight:700;letter-spacing:1px;min-width:88px;justify-content:center} .tbox.warn{background:#991b1b}.tbox.paused{background:#92400e} .pbtn{background:#d97706;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif} .pbtn.res{background:#059669} .sbtn{background:var(--p);color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif} .pstrip{height:3px;background:var(--g200)} .pfstrip{height:100%;background:linear-gradient(90deg,var(--p),#ec4899);transition:width .4s} .ebody{max-width:920px;margin:0 auto;padding:20px 16px 60px;display:flex;gap:20px;align-items:flex-start} .qpanel{flex:1;min-width:0} .navpanel{width:200px;flex-shrink:0;position:sticky;top:130px} .navc{background:#fff;border-radius:var(--r);padding:16px;box-shadow:var(--sh);border:1px solid var(--p3)} .qng{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:14px} .qnb{width:100%;aspect-ratio:1;border-radius:6px;border:1.5px solid var(--g200);background:#fff;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--g400);font-family:'Outfit',sans-serif;transition:all .12s} .qnb:hover{border-color:var(--p2);color:var(--p)} .qnb.done{background:var(--p);border-color:var(--p);color:#fff} .qnb.cur{border-color:#d97706;box-shadow:0 0 0 2px rgba(217,119,6,.3)} .qnb.done.cur{background:#5b21b6;border-color:#5b21b6} .qchdr{background:#fff;border-radius:var(--r);padding:24px;box-shadow:var(--sh);border:1px solid var(--g200);margin-bottom:16px} .qhdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px} .stag{font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;color:#fff;text-transform:uppercase;letter-spacing:.4px} .ttag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--g100);color:var(--g400);text-transform:uppercase} .qtext{font-size:14.5px;line-height:1.85;color:var(--g800);margin-bottom:20px;white-space:pre-wrap} .eopt{background:var(--g50);border:2px solid var(--g200);border-radius:10px;padding:12px 16px;font-size:13.5px;cursor:pointer;text-align:left;transition:all .14s;font-family:'Outfit',sans-serif;width:100%;color:var(--g800);display:flex;align-items:flex-start;gap:10px;line-height:1.55;margin-bottom:9px} .eopt:hover{border-color:var(--p2);background:var(--p4)} .eopt.sel{border-color:var(--p2);background:var(--p4);color:var(--p)} .eltr{font-weight:700;min-width:18px;color:var(--g400);font-size:13px;margin-top:1px} .eopt.sel .eltr{color:var(--p)} .ginput{border:2px solid var(--g200);border-radius:10px;padding:12px 16px;font-size:18px;font-weight:700;font-family:'Outfit',sans-serif;outline:none;width:200px;color:var(--g800);transition:border-color .2s;text-align:center;letter-spacing:1px} .ginput:focus{border-color:var(--p2);box-shadow:0 0 0 3px rgba(124,58,237,.1)} .ginput.hv{border-color:var(--p2);background:var(--p4)} .fbtn{background:#fffbeb;color:#d97706;border:2px solid #fcd34d;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif} .fbtn.fl{background:#fef3c7;border-color:#d97706} .qnavb{display:flex;justify-content:space-between;align-items:center;gap:10px} .nprev{background:var(--g100);color:var(--g600);padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Outfit',sans-serif} .nprev:disabled{opacity:.3;cursor:not-allowed} .nnext{background:var(--p);color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Outfit',sans-serif} .rpage{min-height:100vh;background:linear-gradient(145deg,#f5f3ff,#fce7f3);padding:32px 16px} .shero{background:linear-gradient(135deg,#4c1d95,#7c3aed,#c026d3);border-radius:20px;padding:40px 32px;text-align:center;color:#fff;margin-bottom:24px} .snum{font-family:'Lora',serif;font-size:clamp(56px,10vw,80px);font-weight:700;line-height:1;margin-bottom:6px} .secbar{display:flex;align-items:center;gap:10px;margin-bottom:10px} .secbb{flex:1;height:8px;background:var(--g100);border-radius:999px;overflow:hidden} .secbf{height:100%;border-radius:999px;transition:width .7s} .ritem{padding:14px;border-radius:10px;border:1.5px solid var(--g200);margin-bottom:10px} .ritem.c{border-color:#86efac;background:#f0fdf4} .ritem.w{border-color:#fca5a5;background:#fef2f2} .ritem.s{border-color:#fcd34d;background:#fffbeb} .poverlay{position:fixed;inset:0;background:rgba(30,27,75,.92);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)} .pcard{background:#fff;border-radius:20px;padding:48px 40px;text-align:center;max-width:360px;width:90%} .modalbg{position:fixed;inset:0;background:rgba(30,27,75,.75);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)} .modal{background:#fff;border-radius:18px;padding:36px 30px;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2)} @media(max-width:700px){.ebody{flex-direction:column}.navpanel{width:100%;position:static}}`;

// ─── QuizEngine ──────────────────────────────────────────────────────────────
function QuizEngine({ questions, subject, levelTitle, onComplete, onBack }) {
const [idx, setIdx] = useState(0);
const [answered, setAnswered] = useState(null);
const [score, setScore] = useState(0);
const [done, setDone] = useState(false);
const [results, setResults] = useState([]);
if (!questions || questions.length === 0) return <div style={{ textAlign: “center”, padding: “40px”, color: “var(–g400)” }}>No questions available.</div>;
const q = questions[idx]; const total = questions.length;
function answer(i) {
if (answered !== null) return; setAnswered(i);
if (i === q.ans) setScore(s => s + 1); else recordMistake(subject, q.topic || levelTitle, q.q, q.opts[q.ans], q.opts[i]);
setResults(r => […r, { question: q, chosen: i, correct: i === q.ans }]);
}
function next() {
if (idx >= total - 1) { recordLesson(subject, levelTitle, score + (answered === q.ans ? 1 : 0)); setDone(true); }
else { setIdx(i => i + 1); setAnswered(null); }
}
if (done) {
const fs = results.filter(r => r.correct).length; const pct = Math.round((fs / total) * 100);
return (
<div style={{ textAlign: “center”, padding: “24px 0” }}>
<div style={{ fontSize: 40, marginBottom: 14 }}>{pct >= 80 ? “🎉” : pct >= 60 ? “💪” : “📖”}</div>
<div className=“ph” style={{ fontSize: 22, marginBottom: 8 }}>Quiz Complete!</div>
<div style={{ display: “inline-flex”, alignItems: “center”, gap: 8, background: “linear-gradient(135deg,#6d28d9,#db2777)”, color: “#fff”, padding: “12px 26px”, borderRadius: 999, fontWeight: 700, fontSize: 18, margin: “12px 0 20px” }}>{fs}/{total} ({pct}%)</div>
{pct < 80 && <div className=“alert aw” style={{ maxWidth: 460, margin: “0 auto 16px” }}>📌 {total - fs} mistake(s) saved to your Dashboard weakness tracker!</div>}
<div style={{ background: “var(–g50)”, borderRadius: “var(–r)”, padding: 16, maxWidth: 500, margin: “0 auto 20px”, textAlign: “left” }}>
{results.map((r, i) => (
<div key={i} style={{ padding: “8px 10px”, borderRadius: 8, background: “#fff”, border: `1px solid ${r.correct ? "#86efac" : "#fca5a5"}`, marginBottom: 7 }}>
<div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{r.question.q}</div>
<div style={{ fontSize: 11.5, color: r.correct ? “#059669” : “#dc2626” }}>{r.correct ? “✓ “ : “✗ “}Your answer: {r.question.opts[r.chosen]}{!r.correct && <span style={{ color: “var(–g600)” }}> → Correct: {r.question.opts[r.question.ans]}</span>}</div>
{!r.correct && <div style={{ fontSize: 11, color: “var(–g400)”, marginTop: 3 }}>💡 {r.question.exp}</div>}
</div>
))}
</div>
<div style={{ display: “flex”, gap: 10, justifyContent: “center”, flexWrap: “wrap” }}>
{onBack && <button className="btn-sm bso" onClick={onBack}>← Back</button>}
<button className=“btn-sm bsp” onClick={() => onComplete && onComplete(fs, total)}>Continue →</button>
</div>
</div>
);
}
return (
<div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 12 }}>
<span className="tag">{subject} · {levelTitle}</span>
<span style={{ fontSize: 12, color: “var(–g400)”, fontWeight: 600 }}>Q {idx + 1}/{total}</span>
</div>
<div className=“pbar” style={{ marginBottom: 18 }}><div className=“pfill” style={{ width: `${(idx / total) * 100}%` }} /></div>
<div className="qcard">
<div className="qtxt">{q.q}</div>
<div className="qopts">
{q.opts.map((opt, i) => (
<button key={i} className={`qopt${answered !== null ? (i === q.ans ? " correct" : i === answered ? " wrong" : "") : ""}`} onClick={() => answer(i)} disabled={answered !== null}>
<span style={{ fontWeight: 700, marginRight: 8, color: “var(–g400)” }}>{String.fromCharCode(65 + i)}.</span>{opt}
</button>
))}
</div>
{answered !== null && <div className="qexp">💡 {q.exp}</div>}
<div className="qnav">
<span style={{ fontSize: 12, color: “var(–g400)” }}>Score: {score}/{idx + (answered !== null ? 1 : 0)}</span>
{answered !== null && <button className="btn-sm bsp" onClick={next}>{idx >= total - 1 ? “Finish →” : “Next →”}</button>}
</div>
</div>
</div>
);
}

// ─── Orkhan Exam ────────────────────────────────────────────────────────────
function OrxhanExam({ onBack }) {
const [phase, setPhase] = useState(“intro”);
const [cur, setCur] = useState(0);
const [answers, setAnswers] = useState({});
const [grids, setGrids] = useState({});
const [flagged, setFlagged] = useState(new Set());
const [timeLeft, setTimeLeft] = useState(3600);
const [paused, setPaused] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const timerRef = useRef(null);

useEffect(() => {
if (phase !== “test” || paused) return;
timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase(“results”); return 0; } return t - 1; }), 1000);
return () => clearInterval(timerRef.current);
}, [phase, paused]);

function start() { setPhase(“test”); setAnswers({}); setGrids({}); setFlagged(new Set()); setTimeLeft(3600); setPaused(false); }
function toggleFlag(id) { setFlagged(f => { const n = new Set(f); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
function submit() { clearInterval(timerRef.current); setShowConfirm(false); setPhase(“results”); }

const q = ORKHAN_Q[cur];
const answered = Object.keys(answers).length;

function calcResults() {
let correct = 0, wrong = 0, skipped = 0;
const bySection = {};
ORKHAN_Q.forEach(q => {
const given = answers[q.id];
const isCorrect = q.type === “mcq” ? given === q.ans : String(given || “”).trim() === String(q.correctAns);
if (given === undefined || given === “”) skipped++; else if (isCorrect) correct++; else { wrong++; recordMistake(“SAT Math”, q.section, q.q.slice(0, 60), q.type === “mcq” ? q.opts[q.ans] : q.correctAns, q.type === “mcq” ? (q.opts[given] || “?”) : given); }
if (!bySection[q.section]) bySection[q.section] = { correct: 0, total: 0 };
bySection[q.section].total++;
if (isCorrect) bySection[q.section].correct++;
});
return { correct, wrong, skipped, bySection };
}

if (phase === “intro”) return (
<div className=“wrap” style={{ paddingTop: 28 }}>
<button className="back-btn" onClick={onBack}>← Back to SAT</button>
<div style={{ background: “linear-gradient(145deg,#f5f3ff,#ede9fe,#fce7f3)”, borderRadius: 20, padding: “36px 28px”, maxWidth: 560, margin: “0 auto”, textAlign: “center”, boxShadow: “var(–shm)” }}>
<div style={{ display: “inline-flex”, alignItems: “center”, gap: 6, background: “var(–p4)”, border: “1px solid #c4b5fd”, borderRadius: 999, padding: “6px 14px”, fontSize: 11, fontWeight: 700, color: “var(–p)”, textTransform: “uppercase”, letterSpacing: .5, marginBottom: 20 }}>💜 Her Access · SAT Practice</div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Orkhan Khalilzade</div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 17, fontWeight: 600, color: “var(–p)”, marginBottom: 20 }}>SAT Math — Exam 1</div>
<div style={{ display: “flex”, gap: 10, justifyContent: “center”, flexWrap: “wrap”, marginBottom: 22 }}>
{[[“40”, “Questions”], [“60 min”, “Time Limit”], [“MCQ + Grid”, “Types”], [“4”, “Sections”]].map(([v, l]) => (
<div key={l} style={{ background: “#fff”, border: “1px solid var(–p3)”, borderRadius: 10, padding: “10px 16px”, textAlign: “center”, minWidth: 80 }}>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 20, fontWeight: 700, color: “var(–p)” }}>{v}</div>
<div style={{ fontSize: 10, color: “var(–g400)”, textTransform: “uppercase”, letterSpacing: .5 }}>{l}</div>
</div>
))}
</div>
<div style={{ background: “var(–g50)”, borderRadius: 12, padding: 16, textAlign: “left”, marginBottom: 22 }}>
{[“60 minutes — timer pauses when you click Pause”, “Navigate freely between all 40 questions”, “Flag questions to review before submitting”, “MCQ: select A–D. Grid-in: type your answer”, “Full score report with section breakdown after”].map((r, i) => (
<div key={i} style={{ display: “flex”, gap: 8, fontSize: 13, color: “var(–g600)”, marginBottom: 6, lineHeight: 1.5 }}>
<span style={{ color: “var(–p)”, fontWeight: 700 }}>•</span>{r}
</div>
))}
</div>
<button className=“btn btn-p” style={{ width: “100%”, justifyContent: “center”, fontSize: 15 }} onClick={start}>Start Exam →</button>
</div>
</div>
);

if (phase === “results”) {
const { correct, wrong, skipped, bySection } = calcResults();
const pct = Math.round((correct / 40) * 100);
const timeUsed = 3600 - timeLeft;
recordTestScore(“sat_orkhan_exam1”, correct, 40, “Orkhan Exam 1”);
return (
<div className="rpage">
<div style={{ maxWidth: 860, margin: “0 auto” }}>
<div className="shero">
<div style={{ fontSize: 12, fontWeight: 700, textTransform: “uppercase”, letterSpacing: 1, opacity: .8, marginBottom: 12 }}>Orkhan Exam 1 · SAT Math</div>
<div className="snum">{correct}</div>
<div style={{ fontSize: 18, opacity: .8, marginBottom: 16 }}>out of 40 questions</div>
<div style={{ display: “inline-block”, background: “rgba(255,255,255,.15)”, borderRadius: 999, padding: “8px 24px”, fontSize: 16, fontWeight: 700 }}>{pct}% Correct</div>
</div>
<div className=“g2” style={{ marginBottom: 20 }}>
{[[`${correct} ✓`, “Correct”, “#15803d”], [`${wrong} ✗`, “Wrong”, “#b91c1c”], [`${skipped}`, “Skipped”, “#92400e”], [fmtTime(timeUsed), “Time Used”, “#1d4ed8”]].map(([v, l, c]) => (
<div key={l} className="dstat"><div className=“dsv” style={{ color: c, WebkitTextFillColor: c }}>{v}</div><div className="dsl">{l}</div></div>
))}
</div>
<div className=“card” style={{ marginBottom: 16 }}>
<div className="shed">📊 Section Breakdown</div>
{Object.entries(bySection).map(([sec, data]) => {
const p = Math.round((data.correct / data.total) * 100);
const color = SEC_COLORS[sec] || “#6d28d9”;
return (
<div key={sec} className="secbar">
<span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 120, color: “var(–g600)” }}>{sec}</span>
<div className="secbb"><div className=“secbf” style={{ width: `${p}%`, background: color }} /></div>
<span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 40, textAlign: “right” }}>{data.correct}/{data.total}</span>
</div>
);
})}
</div>
<div className=“card” style={{ marginBottom: 16 }}>
<div className="shed">📋 Full Answer Review</div>
{ORKHAN_Q.map(q => {
const given = answers[q.id];
const isSkipped = given === undefined || given === “”;
const isCorrect = !isSkipped && (q.type === “mcq” ? given === q.ans : String(given).trim() === String(q.correctAns));
const status = isSkipped ? “s” : isCorrect ? “c” : “w”;
const givenText = isSkipped ? “—” : q.type === “mcq” ? `${String.fromCharCode(65 + given)}. ${q.opts[given]}` : given;
const correctText = q.type === “mcq” ? `${String.fromCharCode(65 + q.ans)}. ${q.opts[q.ans]}` : q.correctAns;
return (
<div key={q.id} className={`ritem ${status}`} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}><b>Q{q.id}.</b> {q.q.length > 140 ? q.q.slice(0, 140) + “…” : q.q}</div>
<div style={{ display: “flex”, gap: 6, flexWrap: “wrap”, alignItems: “center”, marginBottom: isCorrect ? 0 : 6 }}>
<span style={{ fontSize: 11, fontWeight: 700, padding: “2px 9px”, borderRadius: 999, background: status === “c” ? “#dcfce7” : status === “w” ? “#fee2e2” : “#fef9c3”, color: status === “c” ? “#15803d” : status === “w” ? “#b91c1c” : “#854d0e” }}>
{status === “c” ? “✓ Correct” : status === “w” ? “✗ Wrong” : “⚠ Skipped”}
</span>
<span style={{ fontSize: 11, background: “var(–p4)”, color: “var(–p)”, padding: “2px 9px”, borderRadius: 999, fontWeight: 600 }}>{q.section}</span>
</div>
{!isCorrect && <div style={{ fontSize: 12, color: “var(–g600)”, lineHeight: 1.6 }}>
{!isSkipped && <span>Your answer: <b style={{ color: “#b91c1c” }}>{givenText}</b> · </span>}
Correct: <b style={{ color: “#15803d” }}>{correctText}</b><br />
<span style={{ color: “var(–g400)” }}>💡 {q.exp}</span>
</div>}
</div>
);
})}
</div>
<div style={{ display: “flex”, gap: 10, justifyContent: “center”, flexWrap: “wrap”, paddingBottom: 32 }}>
<button className=“btn btn-o” onClick={() => { setPhase(“intro”); setCur(0); }}>↺ Retake</button>
<button className="btn btn-p" onClick={onBack}>← Back to SAT</button>
</div>
</div>
</div>
);
}

return (
<>
{paused && (
<div className="poverlay">
<div className="pcard">
<div style={{ fontSize: 40, marginBottom: 12 }}>⏸</div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Test Paused</div>
<p style={{ fontSize: 13.5, color: “var(–g600)”, marginBottom: 24, lineHeight: 1.6 }}>Your progress is saved. Click Resume to continue.</p>
<div style={{ background: “var(–g50)”, borderRadius: 10, padding: “10px 20px”, fontFamily: “‘Lora’,serif”, fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{fmtTime(timeLeft)} remaining</div>
<button className=“pbtn res” style={{ fontSize: 14, padding: “11px 28px”, width: “100%”, borderRadius: 999 }} onClick={() => setPaused(false)}>▶ Resume</button>
</div>
</div>
)}
{showConfirm && (
<div className="modalbg">
<div className="modal">
<div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
<h3 style={{ fontFamily: “‘Lora’,serif”, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Submit Test?</h3>
<p style={{ fontSize: 13.5, color: “var(–g600)”, marginBottom: 22, lineHeight: 1.6 }}>{answered}/40 answered. {40 - answered > 0 ? `${40 - answered} unanswered.` : “”} Cannot be undone.</p>
<div style={{ display: “flex”, gap: 10, justifyContent: “center” }}>
<button style={{ padding: “11px 24px”, borderRadius: 999, fontSize: 13.5, fontWeight: 700, cursor: “pointer”, border: “none”, background: “var(–g100)”, color: “var(–g600)”, fontFamily: “‘Outfit’,sans-serif” }} onClick={() => setShowConfirm(false)}>Keep Going</button>
<button style={{ padding: “11px 24px”, borderRadius: 999, fontSize: 13.5, fontWeight: 700, cursor: “pointer”, border: “none”, background: “var(–p)”, color: “#fff”, fontFamily: “‘Outfit’,sans-serif” }} onClick={submit}>Submit →</button>
</div>
</div>
</div>
)}
<div className="etbar">
<div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 14, fontWeight: 700, color: “var(–p)” }}>Orkhan Exam 1</div>
<div style={{ fontSize: 11, color: “var(–g400)” }}>SAT Math · 40 Questions</div>
</div>
<div className={`tbox ${timeLeft < 300 ? "warn" : ""} ${paused ? "paused" : ""}`}>{paused ? “PAUSED” : fmtTime(timeLeft)}</div>
<div style={{ display: “flex”, gap: 8 }}>
<button className={`pbtn ${paused ? "res" : ""}`} onClick={() => setPaused(p => !p)}>{paused ? “▶ Resume” : “⏸ Pause”}</button>
<button className=“sbtn” onClick={() => setShowConfirm(true)}>Submit</button>
</div>
</div>
<div className="pstrip"><div className=“pfstrip” style={{ width: `${(answered / 40) * 100}%` }} /></div>
<div className="ebody">
<div className="qpanel">
<div className="qchdr">
<div className="qhdr">
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<span style={{ fontFamily: “‘Lora’,serif”, fontSize: 20, fontWeight: 700 }}>Q{q.id}</span>
<span className="ttag">{q.type === “grid” ? “Grid-in” : “Multiple Choice”}</span>
</div>
<div style={{ display: “flex”, gap: 8, alignItems: “center” }}>
<span className=“stag” style={{ background: SEC_COLORS[q.section] || “#6d28d9” }}>{q.section}</span>
<button className={`fbtn ${flagged.has(q.id) ? "fl" : ""}`} onClick={() => toggleFlag(q.id)}>{flagged.has(q.id) ? “🚩 Flagged” : “🏳 Flag”}</button>
</div>
</div>
<div className="qtext">{q.q}</div>
{q.type === “mcq” ? (
q.opts.map((opt, i) => (
<button key={i} className={`eopt ${answers[q.id] === i ? "sel" : ""}`} onClick={() => setAnswers(a => ({ …a, [q.id]: i }))}>
<span className="eltr">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
</button>
))
) : (
<div style={{ display: “flex”, flexDirection: “column”, gap: 8 }}>
<div style={{ fontSize: 12, fontWeight: 600, color: “var(–g400)”, textTransform: “uppercase”, letterSpacing: .4 }}>Enter your answer</div>
<input type=“text” className={`ginput ${grids[q.id] ? "hv" : ""}`} placeholder=“Your answer”
value={grids[q.id] || “”} onChange={e => { setGrids(g => ({ …g, [q.id]: e.target.value })); setAnswers(a => ({ …a, [q.id]: e.target.value })); }} />
<div style={{ fontSize: 11.5, color: “var(–g400)”, lineHeight: 1.5 }}>Enter a number or decimal. No units or degree symbols.</div>
</div>
)}
</div>
<div className="qnavb">
<button className=“nprev” onClick={() => setCur(c => c - 1)} disabled={cur === 0}>← Prev</button>
<span style={{ fontSize: 12, color: “var(–g400)”, fontWeight: 600 }}>{answered}/40</span>
{cur < 39 ? <button className=“nnext” onClick={() => setCur(c => c + 1)}>Next →</button>
: <button className=“nnext” onClick={() => setShowConfirm(true)}>Submit →</button>}
</div>
</div>
<div className="navpanel">
<div className="navc">
<div style={{ fontSize: 11, fontWeight: 700, color: “var(–g400)”, textTransform: “uppercase”, letterSpacing: .5, marginBottom: 12 }}>Navigator</div>
<div className="qng">
{ORKHAN_Q.map((qq, i) => (
<button key={qq.id} className={`qnb ${answers[qq.id] !== undefined && answers[qq.id] !== "" ? "done" : ""} ${i === cur ? "cur" : ""}`} onClick={() => setCur(i)} title={flagged.has(qq.id) ? “Flagged” : “”}>
{flagged.has(qq.id) ? “🚩” : qq.id}
</button>
))}
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 5 }}>
{[[“var(–p)”, “Answered”, answered], [“var(–g200)”, “Unanswered”, 40 - answered]].map(([c, l, n]) => (
<div key={l} style={{ display: “flex”, alignItems: “center”, gap: 6, fontSize: 11, color: “var(–g400)” }}>
<div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l} ({n})
</div>
))}
<div style={{ display: “flex”, alignItems: “center”, gap: 6, fontSize: 11, color: “var(–g400)” }}>
<span style={{ fontSize: 10 }}>🚩</span>Flagged ({flagged.size})
</div>
</div>
<div style={{ marginTop: 12, paddingTop: 12, borderTop: “1px solid var(–g100)” }}>
<div style={{ fontSize: 11, fontWeight: 700, color: “var(–g400)”, textTransform: “uppercase”, letterSpacing: .4, marginBottom: 8 }}>Sections</div>
{Object.entries(SEC_COLORS).map(([s, c]) => (
<div key={s} style={{ display: “flex”, alignItems: “center”, gap: 6, fontSize: 11, color: “var(–g600)”, marginBottom: 4 }}>
<div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />{s}
</div>
))}
</div>
</div>
</div>
</div>
</>
);
}

// ─── SAT Page ────────────────────────────────────────────────────────────────
const SAT_LESSONS = {
rw: { label: “Reading & Writing”, sections: [
{ id: “transitions”, title: “Transitions”, content: “Transition words show the logical relationship between ideas.\n\n**Addition:** furthermore, moreover, in addition\n**Contrast:** however, nevertheless, on the other hand\n**Cause & Effect:** therefore, thus, consequently\n**Example:** for instance, specifically\n**Concession:** admittedly, granted\n\nStrategy: Read both sentences first, identify the relationship, then match to a transition type.” },
{ id: “punctuation”, title: “Punctuation”, content: “**Commas:** separate list items, join clauses with conjunctions, set off non-essential info.\n\n**Semicolons:** join two independent clauses. Never use before and/but/or.\n\n**Colons:** introduce a list or explanation — must follow a complete sentence.\n\n**Dashes:** add emphasis or set off information.\n\nSAT tip: If a semicolon appears in an answer, both sides must be complete sentences.” },
{ id: “concision”, title: “Concision & Style”, content: “Choose the shortest answer that preserves full meaning.\n\n**Redundancy errors:**\n’The reason is because’ → ‘The reason is that’\n’Past history’ → ‘history’\n’Free gift’ → ‘gift’\n\nIf two options mean the same thing, pick the shorter one.” },
{ id: “inference”, title: “Inference & Evidence”, content: “Inference questions ask what the text implies but does not state directly.\n\nStrategy:\n1. Look for clues in word choice, tone, and context.\n2. Your answer must be supported by the text.\n3. Avoid answers that go beyond what the text suggests.\n\nAlways ask: ‘Where in the text does it say this?’” },
]},
math: { label: “Math”, sections: [
{ id: “linear”, title: “Linear Equations”, content: “**Form:** ax + b = c. Isolate the variable with equal operations on both sides.\n\n**Systems:** Substitution or elimination.\n\n**Inequalities:** Flip the sign when multiplying/dividing by a negative.\n\n**Line:** y = mx + b. m = slope, b = y-intercept.” },
{ id: “quadratics”, title: “Quadratics & Functions”, content: “**Standard form:** ax² + bx + c = 0\n\n**Solving:** Factor, quadratic formula, or complete the square.\n\n**Vertex form:** y = a(x−h)² + k. Vertex is (h,k).\n\n**Discriminant b²−4ac:** >0 = two solutions, =0 = one, <0 = none.” },
{ id: “geometry”, title: “Geometry & Trig”, content: “**Triangles:** Area=½bh. a²+b²=c². Angles sum to 180°.\n\n**Circles:** Area=πr². Circumference=2πr.\n\n**SOHCAHTOA:** sin=opp/hyp, cos=adj/hyp, tan=opp/adj.\n\n**Cone volume:** (1/3)πr²h.” },
{ id: “data”, title: “Data & Statistics”, content: “**Center:** Mean=sum÷count. Median=middle when sorted.\n\n**Probability:** P(event)=favorable/total.\nP(A and B)=P(A)×P(B) if independent.\n\n**Percent change:** (new−old)/old × 100.\n\nRead graph axes carefully — don’t over-complicate.” },
]},
};

function SATPage({ setPage }) {
const [view, setView] = useState(“menu”);
const [sec, setSec] = useState(“rw”);
const [topic, setTopic] = useState(0);
const tc = SAT_LESSONS[sec];

if (view === “exam”) return <div className="page"><OrxhanExam onBack={() => setView(“menu”)} /></div>;

if (view === “learn”) return (
<div className="page">
<div className=“wrap” style={{ paddingTop: 28 }}>
<button className=“back-btn” onClick={() => setView(“menu”)}>← Back to SAT</button>
<div className="ph">📚 SAT Lessons</div>
<div className="ps">Text-based lessons — structured and clear.</div>
<div style={{ display: “flex”, gap: 8, marginBottom: 18, flexWrap: “wrap” }}>
{Object.entries(SAT_LESSONS).map(([k, s]) => <button key={k} className={`sat-tab ${sec === k ? "act" : ""}`} onClick={() => { setSec(k); setTopic(0); }}>{s.label}</button>)}
</div>
<div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, marginBottom: 20 }}>
{tc.sections.map((s, i) => <button key={s.id} className={`sat-tab ${topic === i ? "act" : ""}`} onClick={() => setTopic(i)}>{s.title}</button>)}
</div>
<div className=“card” style={{ marginBottom: 14 }}>
<h4 style={{ fontFamily: “‘Lora’,serif”, fontSize: 16, fontWeight: 700, marginBottom: 12, color: “var(–p)” }}>{tc.sections[topic].title}</h4>
<div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: “pre-wrap”, color: “var(–g600)” }} dangerouslySetInnerHTML={{ __html: tc.sections[topic].content.replace(/**(.*?)**/g, “<strong>$1</strong>”).replace(/\n/g, “<br/>”) }} />
</div>
<div style={{ display: “flex”, gap: 8 }}>
{topic > 0 && <button className=“btn-sm bso” onClick={() => setTopic(i => i - 1)}>← Prev</button>}
{topic < tc.sections.length - 1 && <button className=“btn-sm bsp” onClick={() => setTopic(i => i + 1)}>Next →</button>}
</div>
</div>
</div>
);

return (
<div className="page">
<div className=“wrap” style={{ paddingTop: 28 }}>
<div className="ph">🎓 SAT Preparation</div>
<div className="ps">Study lessons first, then take the full practice exam.</div>
<div className=“g2” style={{ marginBottom: 24 }}>
<div className=“card” style={{ cursor: “pointer”, border: “2px solid var(–p3)” }} onClick={() => setView(“learn”)}>
<div style={{ fontSize: 28, marginBottom: 10 }}>📚</div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>SAT Lessons</div>
<div style={{ fontSize: 13, color: “var(–g600)”, lineHeight: 1.6, marginBottom: 14 }}>Structured text lessons covering all SAT topics — Reading & Writing and Math.</div>
<button className="btn-sm bsp">Open Lessons →</button>
</div>
<div style={{ background: “linear-gradient(135deg,#4c1d95,#7c3aed)”, borderRadius: “var(–r)”, padding: 24, color: “#fff”, cursor: “pointer”, position: “relative”, overflow: “hidden” }} onClick={() => setView(“exam”)}>
<div style={{ position: “absolute”, right: 16, top: “50%”, transform: “translateY(-50%)”, fontSize: 56, opacity: .15 }}>📝</div>
<div style={{ fontSize: 28, marginBottom: 10 }}>📝</div>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Orkhan Khalilzade</div>
<div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, opacity: .9 }}>SAT Math — Exam 1</div>
<div style={{ fontSize: 13, opacity: .8, lineHeight: 1.6, marginBottom: 14 }}>40 real SAT Math questions · 60-min timer with pause · Full score report</div>
<div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, marginBottom: 16 }}>
{[“40 Questions”, “60 Minutes”, “MCQ + Grid-in”, “4 Sections”].map(l => <span key={l} style={{ background: “rgba(255,255,255,.15)”, borderRadius: 999, padding: “3px 10px”, fontSize: 11, fontWeight: 600 }}>{l}</span>)}
</div>
<button style={{ background: “#fff”, color: “var(–p)”, border: “none”, borderRadius: 999, padding: “9px 22px”, fontSize: 13, fontWeight: 700, cursor: “pointer”, fontFamily: “‘Outfit’,sans-serif” }}>Start Exam →</button>
</div>
</div>
<div className="alert ai">💡 <strong>Tip:</strong> Study the lessons first, then take the exam. Mistakes are saved to your Dashboard for weakness-based review.</div>
</div>
</div>
);
}

// ─── Other Pages ─────────────────────────────────────────────────────────────
function LessonPage({ lesson, setPage }) {
const [phase, setPhase] = useState(“content”);
const [questions, setQuestions] = useState([]);
const { subject, level } = lesson;
const sd = SUBJECTS[subject];
async function startQuiz() { setPhase(“loading”); const qs = await generateQuiz(sd.label, level.title, level.topics, 10); setQuestions(qs); setPhase(“quiz”); }
return (
<div className="page"><div className=“wrap” style={{ paddingTop: 28 }}>
<button className=“back-btn” onClick={() => setPage(“subjects”)}>← Back to Subjects</button>
{phase === “content” && (<>
<div style={{ display: “flex”, gap: 7, marginBottom: 10 }}><span className="tag">{sd.label}</span><span className=“tag” style={{ background: “var(–pink2)”, color: “var(–pink)” }}>{level.emoji} {level.title}</span></div>
<div className="ph">{level.title}</div>
<div style={{ background: “linear-gradient(135deg,#1a003a,#2d0058)”, borderRadius: “var(–r)”, aspectRatio: “16/9”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, gap: 12, marginBottom: 22, maxWidth: 680 }}>
<div style={{ width: 60, height: 60, background: “rgba(255,255,255,.15)”, borderRadius: “50%”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 22 }}>▶</div>
<div style={{ color: “rgba(255,255,255,.7)”, fontSize: 13 }}>Video lesson — tap to play</div>
</div>
<div className="shed">📋 Topics Covered</div>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 8, marginBottom: 22 }}>{level.topics.map(t => <span key={t} style={{ background: “var(–g100)”, color: “var(–g600)”, fontSize: 12.5, padding: “5px 12px”, borderRadius: 999 }}>{t}</span>)}</div>
<div className=“alert ai” style={{ maxWidth: 560 }}>🧠 After reviewing, take the AI-generated quiz — 10 questions based on exactly these topics.</div>
<div style={{ marginTop: 20, display: “flex”, gap: 10, flexWrap: “wrap” }}>
<button className="btn btn-p" onClick={startQuiz}>Start 10-Question Quiz →</button>
<button className=“btn btn-o” onClick={() => setPage(“subjects”)}>Back</button>
</div>
</>)}
{phase === “loading” && <div style={{ textAlign: “center”, padding: “60px 20px” }}><div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div><div style={{ fontFamily: “‘Lora’,serif”, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Generating your quiz…</div><div className="lds"><div className="ld" /><div className="ld" /><div className="ld" /></div></div>}
{phase === “quiz” && <><div className="shed">🧠 AI Quiz — {level.title}</div><QuizEngine questions={questions} subject={sd.label} levelTitle={level.title} onBack={() => setPage(“subjects”)} onComplete={(s, t) => { recordTestScore(“lesson_quiz”, s, t, `${sd.label}—${level.title}`); setPhase(“done”); }} /></>}
{phase === “done” && <div style={{ textAlign: “center”, padding: “40px 20px” }}><div style={{ fontSize: 36, marginBottom: 12 }}>✅</div><div className=“ph” style={{ fontSize: 20, marginBottom: 8 }}>Lesson Complete!</div><div style={{ display: “flex”, gap: 10, justifyContent: “center”, flexWrap: “wrap” }}><button className=“btn btn-o” onClick={() => setPage(“subjects”)}>More Subjects</button><button className=“btn btn-p” onClick={() => setPage(“dashboard”)}>Dashboard →</button></div></div>}
</div></div>
);
}

function SubjectsPage({ setPage, setLesson }) {
const [active, setActive] = useState(“physics”);
const s = SUBJECTS[active];
return (
<div className="page"><div className=“wrap” style={{ paddingTop: 28 }}>
<div className="ph">📚 Subjects</div><div className="ps">Choose a subject, pick a level, start learning.</div>
<div className=“g3” style={{ marginBottom: 28 }}>{Object.entries(SUBJECTS).map(([k, sv]) => <div key={k} className={`scard ${active === k ? "act" : ""}`} onClick={() => setActive(k)}><div style={{ fontSize: 26, marginBottom: 7 }}>{sv.icon}</div><div style={{ fontSize: 12, fontWeight: 600, color: “var(–g600)” }}>{sv.label}</div></div>)}</div>
<div className="shed">{s.icon} {s.label}</div>
{s.levels.map(lv => (
<div key={lv.id} className=“litem” onClick={() => { setLesson({ subject: active, level: lv }); setPage(“lesson”); }}>
<div style={{ fontSize: 18, minWidth: 24 }}>{lv.emoji}</div>
<div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 7 }}>{lv.title}</div><div style={{ display: “flex”, flexWrap: “wrap”, gap: 4 }}>{lv.topics.slice(0, 4).map(t => <span key={t} className="tchip">{t}</span>)}{lv.topics.length > 4 && <span className="tchip">+{lv.topics.length - 4}</span>}</div></div>
<span style={{ color: “var(–g400)”, fontSize: 18 }}>›</span>
</div>
))}
</div></div>
);
}

function TutorPage() {
const [msgs, setMsgs] = useState([{ role: “ai”, text: “Hi! I’m your AI tutor 💜 I cover Physics, Math, Biology, Chemistry, History, Geography, English, Informatics — plus SAT & IELTS prep. Ask me anything!” }]);
const [input, setInput] = useState(””); const [loading, setLoading] = useState(false);
const bottomRef = useRef(null);
useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: “smooth” }); }, [msgs, loading]);
async function send(text) {
const q = text || input.trim(); if (!q) return; setInput(””); setMsgs(m => […m, { role: “usr”, text: q }]); setLoading(true);
try {
const history = msgs.map(m => ({ role: m.role === “ai” ? “assistant” : “user”, content: m.text }));
const reply = await callAI(“You are a warm expert AI tutor for ‘Her Access’ — free education for girls. Teach all subjects and SAT/IELTS prep. Explain step-by-step, use examples, be encouraging, keep responses concise for mobile.”, […history, { role: “user”, content: q }].map(m => `${m.role}: ${m.content}`).join(”\n\n”), 1000);
setMsgs(m => […m, { role: “ai”, text: reply }]);
} catch { setMsgs(m => […m, { role: “ai”, text: “Connection issue — please try again.” }]); }
finally { setLoading(false); }
}
return (
<div className="tutor-wrap">
<div style={{ padding: “14px 0 8px” }}><div className=“ph” style={{ fontSize: 20 }}>🤖 AI Tutor</div><div className=“ps” style={{ marginBottom: 8 }}>Step-by-step answers, any subject.</div></div>
<div className="chips">{[“Explain Newton’s Laws”, “Solve: 2x+5=13”, “DNA replication?”, “IELTS essay tips”, “SAT quadratics”, “What caused WWI?”].map(c => <span key={c} className=“chip” onClick={() => send(c)}>{c}</span>)}</div>
<div className="chat-area">
{msgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.role === “ai” && <div className="mname">Her Access AI</div>}<div style={{ whiteSpace: “pre-wrap” }}>{m.text}</div></div>)}
{loading && <div className="msg ai"><div className="mname">Her Access AI</div><div className="typing"><div className="dot" /><div className="dot" /><div className="dot" /></div></div>}
<div ref={bottomRef} />
</div>
<div className="cinrow">
<textarea className=“cin” placeholder=“Ask anything…” value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === “Enter” && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} />
<button className=“csend” onClick={() => send()} disabled={loading || !input.trim()}>↑</button>
</div>
</div>
);
}

function IELTSPage({ setPage }) {
const [section, setSection] = useState(“menu”);
const [rAnswers, setRAnswers] = useState({});
const [rDone, setRDone] = useState(false);
const [essay, setEssay] = useState(””); const [checking, setChecking] = useState(false); const [essayResult, setEssayResult] = useState(null);
const PASSAGE = {
title: “The Impact of Urbanization on Biodiversity”,
text: `Urban expansion has become one of the most significant drivers of biodiversity loss worldwide. As cities grow, natural habitats are fragmented, forcing wildlife into increasingly isolated patches. Research across twelve major cities found native bird species declined by 34% within a decade of urban development reaching their habitat boundaries.

However, not all species suffer. “Urban adapters” show remarkable plasticity — the peregrine falcon rebounded by nesting on skyscrapers; foxes colonized European cities exploiting food waste.

Green corridors — vegetation strips connecting parks — allow species to migrate through urban areas. Studies in Singapore and Melbourne show well-designed green infrastructure can support up to 60% of native species found rurally.

“Biophilic cities” designed to foster human-nature interaction have gained traction among policymakers. Critics caution that parks cannot replicate natural ecosystem complexity, and habitat destruction must be addressed through land-use policy.`, questions: [ { id: "q1", text: "Average decline in native bird species near urban areas?", options: ["24%", "34%", "44%", "54%"], answer: "34%", explanation: "Paragraph 1: 'declined by an average of 34%'" }, { id: "q2", text: "'Urban adapters' refers to:", options: ["City planners", "Species thriving in cities", "Endangered birds", "Environmental policies"], answer: "Species thriving in cities", explanation: "Defined as organisms showing 'remarkable plasticity in adjusting to city environments'" }, { id: "q3", text: "Which is TRUE about green corridors?", options: ["Only effective in large cities", "Eliminate biodiversity loss", "Allow species to migrate through cities", "Opposed by policymakers"], answer: "Allow species to migrate through cities", explanation: "'Allow species to migrate safely through urban matrices'" }, { id: "q4", text: "Green infrastructure supports up to what % of native species?", options: ["40%", "50%", "60%", "70%"], answer: "60%", explanation: "'Can support up to 60% of native species'" }, { id: "q5", text: "Author's tone presenting critics' views?", options: ["Dismissive", "Balanced and objective", "Strongly supportive", "Sarcastic"], answer: "Balanced and objective", explanation: "Critics' views are presented fairly without dismissal" }, ] }; async function checkEssay() { if (essay.trim().split(/\s+/).length < 50) return; setChecking(true); setEssayResult(null); try { const text = await callAI("You are an expert IELTS examiner. Respond ONLY with valid JSON: {\"band\":7.0,\"task_achievement\":7,\"coherence\":7,\"vocabulary\":6.5,\"grammar\":7,\"feedback\":\"2-3 sentences\",\"improvements\":[\"tip1\",\"tip2\",\"tip3\"]}", `IELTS Task 2:\n\n${essay}`, 800); setEssayResult(JSON.parse(text.replace(/```json|```/g, "").trim())); recordTestScore("ielts_writing", 0, 9, "Writing"); } catch { setEssayResult({ band: "—", feedback: "Unable to evaluate. Try again.", improvements: [] }); } finally { setChecking(false); } } const rScore = rDone ? PASSAGE.questions.filter(q => rAnswers[q.id] === q.answer).length : 0; if (section === "menu") return <div className="page"><div className="wrap" style={{ paddingTop: 28 }}><div className="ph">🇬🇧 IELTS Preparation</div><div className="ps">Cambridge-style tests, AI essay checker, speaking trainer.</div><div className="g2">{[{ id: "reading", icon: "📖", title: "Academic Reading", desc: "Passages · 5 questions · Auto-scored" }, { id: "writing", icon: "✍️", title: "Writing Task 2", desc: "AI essay checker · Band 0–9 · Feedback" }, { id: "listening", icon: "🎧", title: "Listening Test", desc: "Audio player · Section questions" }, { id: "speaking", icon: "🎤", title: "Speaking Trainer", desc: "AI conversation · Fluency feedback" }].map(s => <div key={s.id} className="ielts-sec" onClick={() => setSection(s.id)}><div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{s.title}</div><div style={{ fontSize: 12, color: "var(--g400)", lineHeight: 1.5 }}>{s.desc}</div></div>)}</div></div></div>; if (section === "reading") return ( <div className="page"><div className="wrap" style={{ paddingTop: 28 }}> <button className="back-btn" onClick={() => { setSection("menu"); setRDone(false); setRAnswers({}); }}>← Back to IELTS</button> <div className="ph">📖 IELTS Academic Reading</div> <div className="passbox"><div style={{ fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{PASSAGE.title}</div>{PASSAGE.text}</div> {!rDone ? (<> <div className="shed">Questions</div> {PASSAGE.questions.map((q, i) => <div key={q.id} className="qcard" style={{ marginBottom: 12 }}><div className="qtxt">{i + 1}. {q.text}</div><div className="qopts">{q.options.map((opt, oi) => <button key={oi} className={`qopt ${rAnswers[q.id] === opt ? “sel” : “”}`} onClick={() => setRAnswers(a => ({ ...a, [q.id]: opt }))}><span style={{ fontWeight: 700, marginRight: 8, color: "var(--g400)" }}>{String.fromCharCode(65 + oi)}.</span>{opt}</button>)}</div></div>)} <button className="btn btn-p" onClick={() => { PASSAGE.questions.forEach(q => { if (rAnswers[q.id] !== q.answer) recordMistake("IELTS", "Reading", q.text, q.answer, rAnswers[q.id] || "unanswered"); }); setRDone(true); }}>Submit Reading →</button> </>) : ( <div style={{ textAlign: "center", padding: "24px 0" }}> <div style={{ fontSize: 36, marginBottom: 12 }}>{rScore >= 4 ? "🎉" : "💪"}</div> <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>Reading Complete!</div> <div className="band-badge">Score: {rScore} / {PASSAGE.questions.length}</div> {PASSAGE.questions.map((q, i) => { const correct = rAnswers[q.id] === q.answer; return <div key={q.id} style={{ background: correct ? "#f0fdf4" : "#fef2f2", border: `1px solid ${correct ? “#86efac” : “#fca5a5”}`, borderRadius: 10, padding: "10px 14px", textAlign: "left", marginBottom: 8, maxWidth: 520, margin: "8px auto" }}><div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{i + 1}. {q.text}</div><div style={{ fontSize: 11.5, color: correct ? "#059669" : "#dc2626" }}>{correct ? "✓ Correct" : `✗ You: ${rAnswers[q.id] || “unanswered”} → Correct: ${q.answer}`}</div>{!correct && <div style={{ fontSize: 11, color: “var(–g400)”, marginTop: 3 }}>💡 {q.explanation}</div>}</div>; })}
<button className=“btn btn-o” style={{ marginTop: 16 }} onClick={() => { setRDone(false); setRAnswers({}); }}>Retry</button>
</div>
)}
</div></div>
);
if (section === “writing”) return (
<div className="page"><div className=“wrap” style={{ paddingTop: 28 }}>
<button className=“back-btn” onClick={() => { setSection(“menu”); setEssayResult(null); setEssay(””); }}>← Back to IELTS</button>
<div className="ph">✍️ IELTS Writing Task 2</div>
<div className=“card” style={{ marginBottom: 16 }}><h4 style={{ fontFamily: “‘Lora’,serif”, fontSize: 15, fontWeight: 700, marginBottom: 10, color: “var(–p)” }}>Task 2 Question</h4><div style={{ fontSize: 13.5, lineHeight: 1.8 }}>Some people believe technology has made friendships easier to maintain, while others argue it has made relationships more superficial. Discuss both views and give your opinion. Write at least 250 words.</div></div>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 7 }}><label style={{ fontSize: 13, fontWeight: 600, color: “var(–g600)” }}>Your Essay</label><span style={{ fontSize: 12, color: “var(–g400)” }}>{essay.split(/\s+/).filter(Boolean).length} words</span></div>
<textarea className=“essay-area” placeholder=“Write your essay…” value={essay} onChange={e => setEssay(e.target.value)} />
<div style={{ display: “flex”, justifyContent: “flex-end”, marginTop: 10 }}><button className=“btn btn-p” onClick={checkEssay} disabled={checking || essay.trim().split(/\s+/).length < 50}>{checking ? “Checking…” : “Check Essay →”}</button></div>
{essayResult && (<div style={{ marginTop: 22 }}>
<div className="band-badge">Band Score: {essayResult.band}</div>
{essayResult.task_achievement && <div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, margin: “12px 0” }}>{[[“Task Achievement”, essayResult.task_achievement], [“Coherence”, essayResult.coherence], [“Vocabulary”, essayResult.vocabulary], [“Grammar”, essayResult.grammar]].map(([k, v]) => <div key={k} className="sscore"><div style={{ fontSize: 20, fontWeight: 700, color: “var(–p)” }}>{v}</div><div style={{ fontSize: 10, color: “var(–g400)”, lineHeight: 1.3 }}>{k}</div></div>)}</div>}
<div style={{ background: “var(–p4)”, borderLeft: “3px solid var(–p2)”, padding: “12px 14px”, borderRadius: “0 8px 8px 0”, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{essayResult.feedback}</div>
{essayResult.improvements?.length > 0 && <div>{essayResult.improvements.map((tip, i) => <div key={i} style={{ display: “flex”, gap: 8, fontSize: 13, marginBottom: 7, color: “var(–g600)” }}><span style={{ color: “var(–p)”, fontWeight: 700 }}>{i + 1}.</span>{tip}</div>)}</div>}
</div>)}
</div></div>
);
if (section === “listening”) return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}><button className=“back-btn” onClick={() => setSection(“menu”)}>← Back</button><div className="ph">🎧 IELTS Listening</div><div style={{ background: “var(–g100)”, borderRadius: “var(–r)”, padding: 20, textAlign: “center”, marginTop: 14 }}><div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Section 1 — Conversation at a travel agency</div><button style={{ background: “var(–p)”, color: “#fff”, border: “none”, borderRadius: 999, padding: “8px 18px”, fontSize: 13, fontWeight: 600, cursor: “pointer” }}>▶ Play Audio</button></div></div></div>;
return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}><button className=“back-btn” onClick={() => setSection(“menu”)}>← Back</button><div className="ph">🎤 IELTS Speaking Trainer</div><div className=“card” style={{ marginBottom: 20 }}><h4 style={{ fontFamily: “‘Lora’,serif”, fontSize: 15, fontWeight: 700, marginBottom: 10, color: “var(–p)” }}>Speaking Part 2</h4><div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: “pre-wrap” }}>{“Describe a time when you helped someone.\n\nYou should say:\n• Who you helped\n• What you did\n• Why you helped them\n\nSpeak for 1–2 minutes.”}</div></div><div className=“alert ai” style={{ marginBottom: 16 }}>💡 Write your response in the AI Tutor for instant fluency feedback.</div><button className=“btn btn-p” onClick={() => setPage(“tutor”)}>Open AI Tutor →</button></div></div>;
}

function FlashcardsPage() {
const [activeSet, setActiveSet] = useState(null); const [cardIdx, setCardIdx] = useState(0); const [flipped, setFlipped] = useState(false);
const [nf, setNf] = useState(””); const [nb, setNb] = useState(””); const [custom, setCustom] = useState([]);
if (activeSet) {
const cards = activeSet.id === “custom” ? custom : activeSet.cards;
const card = cards[cardIdx % Math.max(1, cards.length)];
return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}>
<button className=“back-btn” onClick={() => { setActiveSet(null); setCardIdx(0); setFlipped(false); }}>← Back</button>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 18 }}><div><div className=“ph” style={{ fontSize: 20 }}>{activeSet.title}</div><div style={{ fontSize: 12, color: “var(–g400)” }}>{cards.length} cards · {cardIdx % Math.max(1, cards.length) + 1}/{cards.length}</div></div><span className="tag">{activeSet.subject}</span></div>
{cards.length === 0 ? <div style={{ textAlign: “center”, padding: “40px”, color: “var(–g400)” }}>🃏 No cards yet!</div> : <div className={`fcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)} style={{ marginBottom: 20 }}><div style={{ fontSize: 10, fontWeight: 700, textTransform: “uppercase”, letterSpacing: 1, color: “var(–g400)”, marginBottom: 14 }}>{flipped ? “Answer” : “Question”}</div><div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.45 }}>{flipped ? card.back : card.front}</div><div style={{ fontSize: 11, color: “var(–g400)”, marginTop: 14 }}>{flipped ? “” : “Tap to flip”}</div></div>}
{cards.length > 0 && <div style={{ display: “flex”, justifyContent: “center”, gap: 10, marginBottom: 22 }}><button className=“btn-sm bso” onClick={() => { setCardIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false); }}>← Prev</button><button className=“btn-sm bsp” onClick={() => { setCardIdx(i => (i + 1) % cards.length); setFlipped(false); }}>Next →</button></div>}
{activeSet.id === “custom” && <div className="card"><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>➕ Add Card</div><input style={{ width: “100%”, border: “2px solid var(–g200)”, borderRadius: 9, padding: “9px 12px”, fontSize: 13, fontFamily: “‘Outfit’,sans-serif”, outline: “none”, marginBottom: 8 }} placeholder=“Front” value={nf} onChange={e => setNf(e.target.value)} /><input style={{ width: “100%”, border: “2px solid var(–g200)”, borderRadius: 9, padding: “9px 12px”, fontSize: 13, fontFamily: “‘Outfit’,sans-serif”, outline: “none”, marginBottom: 10 }} placeholder=“Back” value={nb} onChange={e => setNb(e.target.value)} /><button className=“btn-sm bsp” onClick={() => { if (nf && nb) { setCustom(c => […c, { front: nf, back: nb }]); setNf(””); setNb(””); } }}>Add Card</button></div>}
</div></div>;
}
return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}><div className="ph">🃏 Flashcards</div><div className="ps">Spaced-repetition learning — curated sets or create your own.</div><button className=“btn btn-p” style={{ marginBottom: 22, fontSize: 13, padding: “10px 22px” }} onClick={() => setActiveSet({ id: “custom”, title: “My Set”, subject: “Custom” })}>➕ Create New Set</button><div className="g3">{FLASH_SETS.map(s => <div key={s.id} className=“fset” onClick={() => setActiveSet(s)}><h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{s.title}</h4><p style={{ fontSize: 11.5, color: “var(–g400)” }}>{s.subject}</p><span style={{ fontSize: 10.5, background: “var(–p4)”, color: “var(–p)”, padding: “2px 8px”, borderRadius: 999, fontWeight: 700, display: “inline-block”, marginTop: 7 }}>{s.count} cards</span></div>)}</div></div></div>;
}

function DashboardPage({ user, setPage }) {
const [view, setView] = useState(“main”); const [wqs, setWqs] = useState([]); const [lw, setLw] = useState(false);
const weak = getWeakTopics(6); const completed = STORE.completedLessons.length; const testCount = STORE.testScores.length; const mistakeCount = STORE.mistakes.length;
const sp = Object.entries(SUBJECTS).map(([k, s]) => { const sl = STORE.completedLessons.filter(l => l.subjectKey === k); return { key: k, label: s.label, pct: Math.round((sl.length / s.levels.length) * 100), c: sl.length, t: s.levels.length }; });
async function startWT() { if (!weak.length) return; setLw(true); const qs = await generateWeaknessQuiz(weak); setWqs(qs); setLw(false); setView(“weakness”); }
if (view === “weakness”) return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}><button className=“back-btn” onClick={() => setView(“main”)}>← Back to Dashboard</button><div className="ph">🎯 Weakness-Based Quiz</div><div className="ps">Personalized questions from your mistake history.</div><QuizEngine questions={wqs} subject=“Mixed” levelTitle=“Your Weak Topics” onBack={() => setView(“main”)} onComplete={(s, t) => { recordTestScore(“weakness”, s, t, “Weakness Test”); setView(“main”); }} /></div></div>;
return <div className="page"><div className=“wrap” style={{ paddingTop: 28 }}>
<div className="ph">👋 {user?.name || “Student”}’s Dashboard</div><div className="ps">Your learning progress, mistakes & personalized tests.</div>
<div className=“g2” style={{ marginBottom: 20 }}>{[[completed.toString(), “Lessons Completed”], [`${Math.min(completed + 1, 7)} 🔥`, “Day Streak”], [testCount.toString(), “Tests Taken”], [mistakeCount.toString(), “Mistakes Logged”]].map(([v, l]) => <div key={l} className="dstat"><div className="dsv">{v}</div><div className="dsl">{l}</div></div>)}</div>
{weak.length > 0 && <div style={{ background: “linear-gradient(135deg,#fdf4ff,#fce7f3)”, border: “1px solid #e9d5ff”, borderRadius: “var(–r)”, padding: 18, marginBottom: 18 }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>🎯 Weakness Practice Available</div><p style={{ fontSize: 13, color: “var(–g600)”, marginBottom: 12 }}>Weak areas: {weak.slice(0, 3).map(w => w.topic.split(”:”)[1]).join(”, “)}.</p><button className=“btn btn-p” style={{ fontSize: 13, padding: “9px 20px” }} onClick={startWT} disabled={lw}>{lw ? “Generating…” : “Start Weakness Test →”}</button></div>}
{!weak.length && !completed && <div className=“alert ai” style={{ marginBottom: 18 }}>👋 Complete lessons to build your profile! <button className=“btn-sm bsp” style={{ marginLeft: 10 }} onClick={() => setPage(“subjects”)}>Start →</button></div>}
<div className=“card” style={{ marginBottom: 14 }}><div className="shed">📊 Subject Progress</div>{sp.map(s => <div key={s.key} className="prow"><span className="plbl">{s.label}</span><div className="pbar"><div className=“pfill” style={{ width: `${s.pct}%` }} /></div><span className="ppct">{s.c}/{s.t}</span></div>)}</div>
{STORE.mistakes.length > 0 && <div className=“card” style={{ marginBottom: 14 }}><div className="shed">❌ Recent Mistakes</div>{STORE.mistakes.slice(-5).reverse().map(m => <div key={m.id} className="mitem"><div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.45 }}>{m.question}</div><div style={{ display: “flex”, gap: 8, flexWrap: “wrap” }}><span style={{ fontSize: 10.5, padding: “2px 8px”, borderRadius: 999, fontWeight: 600, background: “#fef2f2”, color: “#991b1b” }}>You: {m.given}</span><span style={{ fontSize: 10.5, padding: “2px 8px”, borderRadius: 999, fontWeight: 600, background: “#f0fdf4”, color: “#065f46” }}>Correct: {m.correct}</span><span style={{ fontSize: 10.5, padding: “2px 8px”, borderRadius: 999, fontWeight: 600, background: “var(–p4)”, color: “var(–p)” }}>{m.subject} · {m.topic}</span></div></div>)}</div>}
{STORE.testScores.length > 0 && <div className="card"><div className="shed">📝 Test History</div>{STORE.testScores.slice(-6).reverse().map((ts, i) => <div key={i} style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, padding: “9px 0”, borderBottom: “1px solid var(–g100)” }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{ts.type.replace(/_/g, “ “).toUpperCase()}{ts.section && ` · ${ts.section}`}</div><div style={{ fontSize: 11, color: “var(–g400)” }}>{new Date(ts.date).toLocaleDateString()}</div></div><div style={{ fontSize: 15, fontWeight: 700, color: “var(–p)” }}>{ts.score}/{ts.total}</div></div>)}</div>}

  </div></div>;
}

function AuthPage({ mode, setPage, setUser }) {
const [form, setForm] = useState({ name: “”, email: “”, password: “” }); const [error, setError] = useState(””);
function submit() {
if (!form.email || !form.password) { setError(“Please fill all fields.”); return; }
if (mode === “register” && !form.name) { setError(“Please enter your name.”); return; }
const u = { name: form.name || form.email.split(”@”)[0], email: form.email };
STORE.user = u; setUser(u); setPage(“dashboard”);
}
return <div className="auth-wrap"><div className="auth-card">
<div style={{ width: 46, height: 46, background: “linear-gradient(135deg,#6d28d9,#db2777)”, borderRadius: 12, display: “flex”, alignItems: “center”, justifyContent: “center”, color: “#fff”, fontSize: 20, margin: “0 auto 14px” }}>💜</div>
<h2 style={{ fontFamily: “‘Lora’,serif”, fontSize: 24, fontWeight: 700, textAlign: “center”, marginBottom: 5 }}>{mode === “login” ? “Welcome back” : “Join Her Access”}</h2>
<p style={{ textAlign: “center”, fontSize: 13, color: “var(–g400)”, marginBottom: 26 }}>{mode === “login” ? “Sign in to continue” : “Free education for every girl”}</p>
{mode === “register” && <div className="afield"><label>Your Name</label><input placeholder=“e.g. Fatima” value={form.name} onChange={e => setForm(f => ({ …f, name: e.target.value }))} /></div>}
<div className="afield"><label>Email</label><input type=“email” placeholder=“you@email.com” value={form.email} onChange={e => setForm(f => ({ …f, email: e.target.value }))} /></div>
<div className="afield"><label>Password</label><input type=“password” placeholder=”••••••••” value={form.password} onChange={e => setForm(f => ({ …f, password: e.target.value }))} /></div>
{error && <div style={{ color: “#dc2626”, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
<button className=“btn btn-p” style={{ width: “100%”, borderRadius: 12, justifyContent: “center” }} onClick={submit}>{mode === “login” ? “Sign In” : “Create Free Account”}</button>
<div style={{ textAlign: “center”, marginTop: 16, fontSize: 12.5, color: “var(–g600)” }}>{mode === “login” ? <>{`No account? `}<span style={{ color: “var(–p)”, fontWeight: 600, cursor: “pointer” }} onClick={() => setPage(“register”)}>Sign up free</span></> : <>{`Have account? `}<span style={{ color: “var(–p)”, fontWeight: 600, cursor: “pointer” }} onClick={() => setPage(“login”)}>Sign in</span></>}</div>

  </div></div>;
}

function HomePage({ setPage, user }) {
return <div className="page">
<div className="hero">
<div className="badge">💜 Free · Global · AI-Powered</div>
<h1>Knowledge is your<br /><em>greatest freedom</em></h1>
<p>Her Access gives girls in restricted regions free, world-class education — from basics to university level, powered by AI that learns from your mistakes.</p>
<div className="hbtns">
<button className=“btn btn-p” onClick={() => setPage(user ? “subjects” : “register”)}>{user ? “Continue Learning →” : “Start Learning — Free”}</button>
<button className=“btn btn-o” onClick={() => setPage(“tutor”)}>Ask AI Tutor</button>
</div>
</div>
<div className="stats">{[[“8”, “Subjects”], [“SAT & IELTS”, “Test Prep”], [“AI”, “Tutor 24/7”], [“0”, “Cost”]].map(([n, l]) => <div key={l} className="stat"><div className="n">{n}</div><div className="l">{l}</div></div>)}</div>
<div style={{ padding: “52px 18px”, background: “var(–g50)” }}>
<div style={{ maxWidth: 1080, margin: “0 auto” }}>
<div style={{ textAlign: “center”, marginBottom: 32 }}>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: “clamp(22px,4vw,32px)”, fontWeight: 700, marginBottom: 10 }}>Everything you need to succeed</div>
<div style={{ color: “var(–g400)”, fontSize: 14, maxWidth: 480, margin: “0 auto” }}>Lessons, AI quizzes, SAT & IELTS, AI tutor, real practice tests, and smart progress tracking.</div>
</div>
<div className="g2">
{[[“🧠”, “AI-Generated Quizzes”, “10 questions per lesson, created by AI from exactly your topics.”], [“🎯”, “Weakness-Based Tests”, “Mistakes are saved and used to build personalized review tests.”], [“📊”, “Real Progress Tracking”, “Per-subject progress, mistake history, and personalized recommendations.”], [“📝”, “Orkhan SAT Exam 1”, “40 real SAT Math questions with 60-min timer, pause, and full score report.”], [“🤖”, “AI Tutor (24/7)”, “Step-by-step answers in any subject, any time.”], [“🃏”, “Smart Flashcards”, “Spaced repetition sets for vocabulary, formulas, and more.”]].map(([icon, title, desc]) => <div key={title} className="card"><div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{title}</div><div style={{ fontSize: 12.5, color: “var(–g600)”, lineHeight: 1.65 }}>{desc}</div></div>)}
</div>
</div>
</div>
<div style={{ padding: “52px 18px”, textAlign: “center”, background: “linear-gradient(145deg,#faf5ff,#fce7f3)” }}>
<div style={{ fontFamily: “‘Lora’,serif”, fontSize: “clamp(22px,4vw,32px)”, fontWeight: 700, marginBottom: 12 }}>Your future starts today.</div>
<p style={{ color: “var(–g600)”, maxWidth: 460, margin: “0 auto 24px”, fontSize: 14, lineHeight: 1.75 }}>Join thousands of girls building brighter futures. No cost, no barriers, no limits.</p>
<button className=“btn btn-p” onClick={() => setPage(user ? “subjects” : “register”)}>{user ? “Go to My Dashboard” : “Create Free Account”}</button>
</div>

  </div>;
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function HerAccessV4() {
const [page, setPage] = useState(“home”);
const [user, setUser] = useState(null);
const [lesson, setLesson] = useState(null);
const [menuOpen, setMenuOpen] = useState(false);
const NAV = [{ id: “home”, label: “Home” }, { id: “subjects”, label: “Subjects” }, { id: “sat”, label: “SAT” }, { id: “ielts”, label: “IELTS” }, { id: “tutor”, label: “AI Tutor” }, { id: “flashcards”, label: “Flashcards” }, { id: “dashboard”, label: “Dashboard” }];
function nav(p) { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); }
return (
<>
<style>{G}</style>
<div className="app">
<nav className="nav">
<div className=“brand” onClick={() => nav(“home”)}><div className="bi">💜</div><div className="bn">Her Access</div></div>
<div className={`navl ${menuOpen ? "open" : ""}`}>
{NAV.map(n => <button key={n.id} className={`nb ${page === n.id ? "act" : ""}`} onClick={() => nav(n.id)}>{n.label}</button>)}
{!user ? <button className=“nb cta” onClick={() => nav(“register”)}>Get Started</button> : <button className=“nb cta” onClick={() => { setUser(null); STORE.user = null; nav(“home”); }}>Sign Out</button>}
</div>
<button className=“ham” onClick={() => setMenuOpen(o => !o)}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">{menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}</svg>
</button>
</nav>
{page === “home” && <HomePage setPage={nav} user={user} />}
{page === “subjects” && <SubjectsPage setPage={nav} setLesson={setLesson} />}
{page === “lesson” && lesson && <LessonPage lesson={lesson} setPage={nav} />}
{page === “tutor” && <TutorPage />}
{page === “sat” && <SATPage setPage={nav} />}
{page === “ielts” && <IELTSPage setPage={nav} />}
{page === “flashcards” && <FlashcardsPage />}
{page === “dashboard” && <DashboardPage user={user} setPage={nav} />}
{(page === “login” || page === “register”) && <AuthPage mode={page} setPage={nav} setUser={setUser} />}
</div>
</>
);
}
