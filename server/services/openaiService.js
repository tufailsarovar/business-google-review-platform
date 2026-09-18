import gemini, { getGeminiClient } from "../config/gemini.js";

const getModel = () =>
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const cleanText = (value) => String(value || "").trim();

const cleanKeywords = (keywords) =>
  Array.isArray(keywords)
    ? keywords
        .map((keyword) => cleanText(keyword))
        .filter(Boolean)
        .slice(0, 10)
    : [];

/* =========================================================
   EXTRACT GEMINI TEXT SAFELY
   ========================================================= */

const extractResponseText = (response) => {
  // Normal SDK response
  if (typeof response?.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  // Fallback: extract text directly from candidates
  const parts = response?.candidates?.[0]?.content?.parts || [];

  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("")
    .trim();

  return text;
};

/* =========================================================
   GENERATE REVIEW
   ========================================================= */

export const generateReviewSuggestion = async ({
  businessName,
  category,
  description,
  rating,
  keywords = [],
  customerName = "",
  reviewTemplate = "",
}) => {
  try {
    const client = gemini || getGeminiClient();

    const normalizedRating = Number(rating);

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error("Rating must be between 1 and 5.");
    }

    const safeBusinessName = cleanText(businessName) || "the business";

    const safeCategory = cleanText(category);

    const safeDescription = cleanText(description);

    const safeCustomerName = cleanText(customerName);

    const safeKeywords = cleanKeywords(keywords);

    const safeTemplate = cleanText(reviewTemplate);

    const ratingTone =
      normalizedRating >= 4
        ? "positive and appreciative"
        : normalizedRating === 3
          ? "balanced, honest, and neutral"
          : "honest and constructive";

    const keywordText =
      safeKeywords.length > 0
        ? safeKeywords.join(", ")
        : "No specific keywords were provided.";

    const templateSection = safeTemplate
      ? `
Admin review template:
${safeTemplate}

Use this only as a writing guide.
Do not copy it word-for-word.
Rewrite it naturally.
`
      : `
No admin review template is available.
Create the review naturally from the provided information.
`;

    const prompt = `
Create ONE natural-sounding Google review suggestion.

Business name:
${safeBusinessName}

Business category:
${safeCategory || "Not specified"}

Business description:
${safeDescription || "Not specified"}

Customer rating:
${normalizedRating}/5

Customer name:
${safeCustomerName || "Not provided"}

Important keywords:
${keywordText}

${templateSection}

Requirements:
- Write from the customer's first-person perspective.
- Match the ${ratingTone} tone.
- Keep the review realistic and concise.
- Do not invent facts, products, employees, prices, dates,
  offers, or customer experiences.
- Do not mention AI.
- Do not mention the admin template.
- Do not use hashtags.
- Do not use excessive emojis.
- Do not make the review overly promotional.
- Make it suitable for a Google review.
- Return ONLY the review text.
`;

    console.log(`[Gemini] Generating review using model: ${getModel()}`);

    const response = await client.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: "minimal",
        },
        maxOutputTokens: 300,
      },
    });

    console.log("========== GEMINI RAW RESPONSE ==========");

    console.dir(response, {
      depth: 10,
    });

    console.log("==========================================");

    const review = extractResponseText(response);

    if (!review) {
      console.error(
        "[Gemini] Empty response:",
        JSON.stringify(
          {
            candidates: response?.candidates,
            promptFeedback: response?.promptFeedback,
          },
          null,
          2,
        ),
      );

      throw new Error("Gemini returned an empty response.");
    }

    console.log("[Gemini] Review generated successfully.");

    return review;
  } catch (error) {
    console.error("[Gemini] Review generation failed:", error);

    // Preserve useful Gemini error information
    if (error?.message) {
      throw new Error(`Gemini API error: ${error.message}`);
    }

    throw new Error("Gemini API request failed.");
  }
};

/* =========================================================
   GENERATE REVIEW VARIATIONS
   ========================================================= */

export const generateReviewVariations = async ({
  businessName,
  category,
  description,
  rating,
  keywords = [],
  customerName = "",
  count = 3,
}) => {
  try {
    const client = gemini || getGeminiClient();

    const normalizedRating = Number(rating);

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error("Rating must be between 1 and 5.");
    }

    const variationCount = Math.min(Math.max(Number(count) || 3, 1), 5);

    const prompt = `
Create ${variationCount} different natural Google review suggestions.

Business name:
${cleanText(businessName)}

Business category:
${cleanText(category)}

Business description:
${cleanText(description)}

Customer rating:
${normalizedRating}/5

Customer name:
${cleanText(customerName)}

Keywords:
${cleanKeywords(keywords).join(", ")}

Rules:
- First-person customer perspective.
- Match the rating honestly.
- Each review must be meaningfully different.
- Keep each review concise.
- Do not invent facts or specific experiences.
- No hashtags.
- No excessive emojis.
- Do not mention AI.
- Return valid JSON only.

Format:
{
  "reviews": [
    "review 1",
    "review 2",
    "review 3"
  ]
}
`;

    const response = await client.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    });

    const content = extractResponseText(response);

    if (!content) {
      throw new Error("Gemini returned an empty response.");
    }

    try {
      const parsed = JSON.parse(content);

      const reviews = Array.isArray(parsed?.reviews)
        ? parsed.reviews
            .map((review) => cleanText(review))
            .filter(Boolean)
            .slice(0, variationCount)
        : [];

      if (!reviews.length) {
        throw new Error("No review variations returned.");
      }

      return reviews;
    } catch {
      throw new Error("Invalid JSON response received from Gemini.");
    }
  } catch (error) {
    console.error("[Gemini] Review variations failed:", error);

    throw new Error(`Gemini API error: ${error?.message || "Request failed."}`);
  }
};

export default {
  generateReviewSuggestion,
  generateReviewVariations,
};
