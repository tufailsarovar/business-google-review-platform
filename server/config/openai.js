import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

export const getOpenAIClient = () => {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY is not configured."
    );
  }

  return openai;
};

export default openai;