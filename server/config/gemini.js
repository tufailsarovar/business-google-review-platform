import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const gemini = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

export const getGeminiClient = () => {
  if (!gemini) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  return gemini;
};

export default gemini;