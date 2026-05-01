import api from "./client";

const BASE_API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8080/api");
const CHAT_PROXY_URL = `${BASE_API_URL}/chat`;

export const getSummary = async (content) => {
  const { data } = await api.post("/ai/summary", { content });
  return data;
};

export const getQuiz = async (content) => {
  const { data } = await api.post("/ai/quiz", { content });
  return data;
};

export const getExplanation = async (content) => {
  const { data } = await api.post("/ai/explain", { content });
  return data;
};

export const chatWithContent = async (content, question) => {
  const message = question?.trim() || content?.trim();
  const response = await fetch(CHAT_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Chat request failed");
  }

  return data;
};
