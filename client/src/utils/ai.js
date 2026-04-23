export async function callAI(system, userMsg, maxTokens = 1200) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

export async function generateQuiz(subject, levelTitle, topics, count = 10) {
  try {
    const text = await callAI(
      "Generate educational quiz questions as valid JSON only.",
      `Generate ${count} MCQ questions for ${subject} - ${levelTitle}. Topics: ${topics.join(", ")}. Return JSON array: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return topics.slice(0, Math.min(count, topics.length)).map((t) => ({
      q: `Key concept in "${t}"?`,
      opts: ["Option A", "Option B (correct)", "Option C", "Option D"],
      ans: 1,
      exp: `Covers fundamentals of ${t} in ${subject}.`,
      topic: t,
    }));
  }
}

export async function generateWeaknessQuiz(weakTopics) {
  const list = weakTopics.map((w) => w.topic.split(":")[1] || w.topic).join(", ");
  try {
    const text = await callAI(
      "Generate targeted quiz questions as valid JSON only.",
      `10 questions for weak areas: ${list}. Return JSON: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return weakTopics.slice(0, 5).map((w) => ({
      q: `Review: what is key about "${w.topic.split(":")[1] || w.topic}"?`,
      opts: ["Option A", "Option B", "Option C", "Option D"],
      ans: 1,
      exp: `You missed this ${w.count} time(s). Review carefully.`,
      topic: w.topic,
    }));
  }
}

export const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
