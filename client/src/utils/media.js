/**
 * Медиа-конфиг для Her Access.
 *
 * В dev: файлы лежат в client/public/media/ и отдаются Vite dev-сервером.
 * В проде: VITE_MEDIA_URL указывает на CDN/S3 бакет.
 *
 * Структура папок:
 *   client/public/media/
 *     videos/
 *       physics_ph1.mp4
 *       math_ma1.mp4
 *       ...
 *     audio/
 *       ielts_listening_s1.mp3
 *       ielts_listening_s2.mp3
 *       ...
 *
 * Переключение на CDN: задать VITE_MEDIA_URL=https://cdn.heraccess.io
 * Тогда все пути автоматически станут абсолютными.
 */

const BASE = import.meta.env.VITE_MEDIA_URL ?? '';

export function videoUrl(subjectKey, levelId) {
  return `${BASE}/media/videos/${subjectKey}_${levelId}.mp4`;
}

export function audioUrl(name) {
  return `${BASE}/media/audio/${name}`;
}

// ─── Метаданные уроков ────────────────────────────────────────────────────────
// title и description для плеера; duration — подсказка пока файл грузится

export const LESSON_META = {
  physics: {
    ph1: { title: 'Introduction to Physics', duration: '~12 min' },
    ph2: { title: 'Motion & Momentum', duration: '~15 min' },
    ph3: { title: 'Forces & Energy', duration: '~14 min' },
    ph4: { title: 'Waves & Thermodynamics', duration: '~16 min' },
    ph5: { title: 'Modern Physics', duration: '~18 min' },
  },
  math: {
    ma1: { title: 'Fractions, Decimals & Percentages', duration: '~10 min' },
    ma2: { title: 'Pre-Algebra Foundations', duration: '~12 min' },
    ma3: { title: 'Linear Equations & Graphs', duration: '~14 min' },
    ma4: { title: 'Geometry Essentials', duration: '~13 min' },
    ma5: { title: 'Algebra 2 — Quadratics & Logs', duration: '~16 min' },
    ma6: { title: 'Introduction to Calculus', duration: '~18 min' },
  },
  biology: {
    bi1: { title: 'What Is Life? Cells & Organisms', duration: '~11 min' },
    bi2: { title: 'Body Systems', duration: '~13 min' },
    bi3: { title: 'Genetics & Evolution', duration: '~15 min' },
    bi4: { title: 'Molecular Biology', duration: '~17 min' },
  },
  chemistry: {
    ch1: { title: 'Matter & Reactions', duration: '~10 min' },
    ch2: { title: 'Atoms & the Periodic Table', duration: '~13 min' },
    ch3: { title: 'Stoichiometry & Acids', duration: '~15 min' },
    ch4: { title: 'Kinetics & Equilibrium', duration: '~16 min' },
  },
  english: {
    en1: { title: 'Grammar Foundations', duration: '~9 min' },
    en2: { title: 'Tenses & Articles', duration: '~11 min' },
    en3: { title: 'Writing & Inference', duration: '~14 min' },
    en4: { title: 'Advanced Rhetoric', duration: '~15 min' },
  },
  history: {
    hi1: { title: 'Prehistory & Early Civilizations', duration: '~12 min' },
    hi2: { title: 'Classical World', duration: '~14 min' },
    hi3: { title: 'Middle Ages', duration: '~13 min' },
    hi4: { title: 'Age of Revolutions', duration: '~15 min' },
  },
  informatics: {
    in1: { title: 'How Computers Work', duration: '~10 min' },
    in2: { title: 'Programming Basics', duration: '~12 min' },
    in3: { title: 'Data Structures', duration: '~14 min' },
    in4: { title: 'Algorithms & OOP', duration: '~16 min' },
  },
};

// ─── IELTS Listening секции ───────────────────────────────────────────────────

export const LISTENING_SECTIONS = [
  {
    id: 's1',
    title: 'Section 1 — Travel Agency Conversation',
    file: 'ielts_listening_s1.mp3',
    questions: [
      {
        id: 'ls1q1',
        text: 'What is the departure city mentioned in the conversation?',
        options: ['London', 'Manchester', 'Birmingham', 'Leeds'],
        answer: 'London',
        explanation: 'The agent confirms the departure from London Heathrow.',
      },
      {
        id: 'ls1q2',
        text: 'How many nights is the hotel booking for?',
        options: ['5', '7', '10', '14'],
        answer: '7',
        explanation: 'Seven nights are confirmed for the hotel stay.',
      },
      {
        id: 'ls1q3',
        text: 'What type of room does the customer request?',
        options: ['Single', 'Double', 'Twin', 'Suite'],
        answer: 'Twin',
        explanation: 'The customer specifically asks for a twin room.',
      },
      {
        id: 'ls1q4',
        text: 'What is included in the package price?',
        options: [
          'Flights only',
          'Hotel only',
          'Flights and hotel',
          'Flights, hotel and transfers',
        ],
        answer: 'Flights, hotel and transfers',
        explanation: 'The agent explains the all-inclusive package price.',
      },
      {
        id: 'ls1q5',
        text: 'When does the customer need to pay the deposit?',
        options: ['Within 24 hours', 'Within 48 hours', 'Within a week', 'At check-in'],
        answer: 'Within 48 hours',
        explanation: 'A 48-hour window is given to secure the booking with a deposit.',
      },
    ],
  },
  {
    id: 's2',
    title: 'Section 2 — Campus Facilities Tour',
    file: 'ielts_listening_s2.mp3',
    questions: [
      {
        id: 'ls2q1',
        text: 'Where is the main library located?',
        options: ['North campus', 'South campus', 'East wing', 'Central building'],
        answer: 'Central building',
        explanation: 'The guide states the library is in the central building.',
      },
      {
        id: 'ls2q2',
        text: 'Until what time is the sports centre open on weekdays?',
        options: ['8pm', '9pm', '10pm', '11pm'],
        answer: '10pm',
        explanation: 'Weekday closing time for the sports centre is 10pm.',
      },
      {
        id: 'ls2q3',
        text: 'What is required to access the computer lab?',
        options: ['Student ID', 'Password only', 'Staff approval', 'Booking in advance'],
        answer: 'Student ID',
        explanation: 'A valid student ID must be shown at the lab entrance.',
      },
    ],
  },
];
