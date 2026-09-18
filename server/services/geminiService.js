import gemini, {
  getGeminiClient,
} from "../config/gemini.js";

const getModel = () =>
  process.env.GEMINI_MODEL ||
  "gemini-3.8-flash";

const cleanText = (value) =>
  String(value || "").trim();

const cleanKeywords = (keywords) =>
  Array.isArray(keywords)
    ? keywords
        .map((keyword) => cleanText(keyword))
        .filter(Boolean)
        .slice(0, 10)
    : [];

export const generateGeminiReviewSuggestion =
  async ({
    businessName,
    category,
    description,
    rating,
    keywords = [],
    customerName = "",
    reviewTemplate = "",
  }) => {
    const client =
      gemini || getGeminiClient();

    const normalizedRating = Number(rating);

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5."
      );
    }

    const safeBusinessName =
      cleanText(businessName) ||
      "the business";

    const safeCategory =
      cleanText(category);

    const safeDescription =
      cleanText(description);

    const safeCustomerName =
      cleanText(customerName);

    const safeKeywords =
      cleanKeywords(keywords);

    const safeTemplate =
      cleanText(reviewTemplate);

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

    const templateSection =
      safeTemplate
        ? `
Admin review template:
${safeTemplate}

Use this only as a writing guide.
Do not copy it word-for-word.
Personalize it naturally.
`
        : `
No admin review template is available.
Create the review naturally.
`;

    const prompt = `
Create one natural-sounding Google review suggestion for a customer.

Business name: ${safeBusinessName}
Business category: ${
      safeCategory || "Not specified"
    }
Business description: ${
      safeDescription || "Not specified"
    }
Customer rating: ${normalizedRating}/5
Customer name: ${
      safeCustomerName || "Not provided"
    }
Important keywords: ${keywordText}

${templateSection}

Requirements:
- Write from the customer's first-person perspective.
- Match the ${ratingTone} tone.
- Keep the review realistic and concise.
- Do not invent specific facts, products, employees, dates, prices, offers, or experiences.
- Do not mention AI.
- Do not mention the admin template.
- Do not use excessive emojis.
- Do not use hashtags.
- Do not make it sound promotional or repetitive.
- Make it suitable for a Google review.
- Return ONLY the review text.
`;

    const response =
      await client.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 180,
        },
      });

    const review =
      response?.text?.trim();

    if (!review) {
      throw new Error(
        "Unable to generate a Gemini review suggestion."
      );
    }

    return review;
  };

export default {
  generateGeminiReviewSuggestion,
};