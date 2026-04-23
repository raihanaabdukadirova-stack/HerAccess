import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash — быстрый и дешёвый, подходит для всех задач платформы
const MODEL = 'gemini-1.5-flash';

async function callGemini(system, userMsg, maxTokens = 1200) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(userMsg);
  const response = result.response;

  if (!response) {
    const err = new Error('Gemini returned empty response');
    err.status = 502;
    throw err;
  }

  return response.text();
}

// POST /api/ai/chat
// body: { system, message, maxTokens? }
export async function chatController(req, res) {
  const { system, message, maxTokens = 1000 } = req.body;

  if (!message?.trim()) {
    return res.status(422).json({ error: 'message is required.' });
  }

  const text = await callGemini(system, message, maxTokens);
  res.json({ text });
}

// POST /api/ai/quiz
// body: { subject, levelTitle, topics, count? }
export async function quizController(req, res) {
  const { subject, levelTitle, topics, count = 10 } = req.body;

  if (!subject || !levelTitle || !Array.isArray(topics)) {
    return res.status(422).json({ error: 'subject, levelTitle, topics[] are required.' });
  }

  try {
    const raw = await callGemini(
      'Generate educational quiz questions as valid JSON only. Return nothing except the JSON array.',
      `Generate ${count} MCQ questions for ${subject} - ${levelTitle}. Topics: ${topics.join(', ')}. Return JSON array: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    const questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json({ questions });
  } catch {
    const questions = topics.slice(0, count).map((t) => ({
      q: `Key concept in "${t}"?`,
      opts: ['Option A', 'Option B (correct)', 'Option C', 'Option D'],
      ans: 1,
      exp: `Covers fundamentals of ${t} in ${subject}.`,
      topic: t,
    }));
    res.json({ questions });
  }
}

// POST /api/ai/weakness-quiz
// body: { weakTopics: [{topic, count}] }
export async function weaknessQuizController(req, res) {
  const { weakTopics } = req.body;

  if (!Array.isArray(weakTopics) || !weakTopics.length) {
    return res.status(422).json({ error: 'weakTopics[] is required.' });
  }

  const list = weakTopics.map((w) => w.topic.split(':')[1] || w.topic).join(', ');

  try {
    const raw = await callGemini(
      'Generate targeted quiz questions as valid JSON only. Return nothing except the JSON array.',
      `10 questions for weak areas: ${list}. Return JSON: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    const questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json({ questions });
  } catch {
    const questions = weakTopics.slice(0, 5).map((w) => ({
      q: `Review: what is key about "${w.topic.split(':')[1] || w.topic}"?`,
      opts: ['Option A', 'Option B', 'Option C', 'Option D'],
      ans: 1,
      exp: `You missed this ${w.count} time(s). Review carefully.`,
      topic: w.topic,
    }));
    res.json({ questions });
  }
}

// POST /api/ai/essay
// body: { essay }
export async function essayController(req, res) {
  const { essay } = req.body;

  if (!essay?.trim() || essay.trim().split(/\s+/).length < 50) {
    return res.status(422).json({ error: 'Essay must be at least 50 words.' });
  }

  try {
    const raw = await callGemini(
      `You are an expert IELTS examiner. Respond ONLY with valid JSON, no markdown, no explanation: {"band":7.0,"task_achievement":7,"coherence":7,"vocabulary":6.5,"grammar":7,"feedback":"2-3 sentences","improvements":["tip1","tip2","tip3"]}`,
      `IELTS Task 2 essay to evaluate:\n\n${essay}`,
      800
    );
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json(result);
  } catch {
    res.status(502).json({ error: 'Could not evaluate essay. Please try again.' });
  }
}
