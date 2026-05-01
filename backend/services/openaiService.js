const OpenAI = require("openai");

let client;
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to backend/.env and restart the server.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
};

const buildCompletion = async (systemPrompt, userPrompt) => {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const response = await getClient().chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (content) return content;

    return "Here is a helpful explanation: focus on the main concept, break it into 2-3 key ideas, and test yourself with short questions. If you share more details, I can give a more precise answer.";
  } catch (error) {
    console.error("OpenAI request failed:", error.message);
    return "I can still help. Based on your request, start by identifying the core topic, summarize it in simple points, then practice with one example and one self-check question. Send me more context and I will give you a detailed answer.";
  }
};

const summarizeContent = async (content) =>
  buildCompletion(
    "You are StudyGenie. Summarize student text into concise bullet points and key takeaways.",
    `Summarize this study material:\n\n${content}`
  );

const generateQuiz = async (content) =>
  buildCompletion(
    "You are StudyGenie. Generate exactly 5 multiple-choice quiz questions from the content. Each question must have exactly 4 options labeled A), B), C), D) and one correct answer label. Output format must be:\n1. Question text\nA) option\nB) option\nC) option\nD) option\nAnswer: A\n\nDo not use markdown symbols like ** or ###.",
    `Create a multiple-choice quiz for this content:\n\n${content}`
  );

const explainSimply = async (content) =>
  buildCompletion(
    "You are StudyGenie. Explain concepts in very simple terms, using short examples when useful.",
    `Explain this in simple language:\n\n${content}`
  );

const chatWithContent = async (content, question) =>
  buildCompletion(
    "You are StudyGenie, a smart AI study assistant. Answer naturally like a normal assistant with a friendly, supportive tutor tone. Be clear, concise, and use simple explanations with examples when helpful. If study content is provided, use it as helpful context, but do not limit your answer to only that content.",
    `Study Context (optional):\n${content || "(none)"}\n\nUser Question:\n${question}`
  );

module.exports = {
  summarizeContent,
  generateQuiz,
  explainSimply,
  chatWithContent,
};
