import openai, {
  getOpenAIClient,
} from "../config/openai.js";

const getModel = () =>
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini";

const cleanText = value =>
  String(value || "").trim();

const cleanKeywords = keywords =>
  Array.isArray(keywords)
    ? keywords
        .map(keyword =>
          cleanText(keyword)
        )
        .filter(Boolean)
        .slice(0, 10)
    : [];

export const generateReviewSuggestion =
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
      openai || getOpenAIClient();

    const normalizedRating =
      Number(rating);

    if (
      !Number.isInteger(
        normalizedRating
      ) ||
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

Use this template as a writing guide and structure.
Do not copy it word-for-word.
Personalize and rewrite it naturally based only on
the information provided above.
`
        : `
No admin review template is available.
Create the review naturally from the provided information.
`;

    const prompt = `
Create one natural-sounding Google review suggestion for a customer.

Business name: ${safeBusinessName}
Business category: ${
      safeCategory || "Not specified"
    }
Business description: ${
      safeDescription ||
      "Not specified"
    }
Customer rating: ${normalizedRating}/5
Customer name: ${
      safeCustomerName ||
      "Not provided"
    }
Important keywords: ${keywordText}

${templateSection}

Requirements:
- Write from the customer's first-person perspective.
- Match the ${ratingTone} tone.
- Keep the review realistic and concise.
- Use the admin template only as a writing guide.
- Do not copy the admin template word-for-word.
- Do not invent specific facts, offers, products, employees, dates, prices, or experiences that were not provided.
- Do not mention that AI generated the review.
- Do not mention the admin template.
- Do not use excessive emojis.
- Do not use hashtags.
- Do not make the review sound promotional or repetitive.
- The review should be suitable for posting as a Google review.
- Return only the review text.
`;

    const completion =
      await client.chat.completions.create(
        {
          model: getModel(),
          temperature: 0.8,
          max_tokens: 180,
          messages: [
            {
              role: "system",
              content:
                "You write concise, authentic customer review suggestions. Never fabricate specific customer experiences or facts.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );

    const review =
      completion?.choices?.[0]?.message?.content
        ?.trim();

    if (!review) {
      throw new Error(
        "Unable to generate a review suggestion."
      );
    }

    return review;
  };

export const generateReviewVariations =
  async ({
    businessName,
    category,
    description,
    rating,
    keywords = [],
    customerName = "",
    count = 3,
  }) => {
    const client =
      openai || getOpenAIClient();

    const normalizedRating =
      Number(rating);

    if (
      !Number.isInteger(
        normalizedRating
      ) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5."
      );
    }

    const variationCount = Math.min(
      Math.max(Number(count) || 3, 1),
      5
    );

    const prompt = `
Create ${variationCount} different natural Google review suggestions.

Business name: ${cleanText(
      businessName
    )}
Business category: ${cleanText(
      category
    )}
Business description: ${cleanText(
      description
    )}
Customer rating: ${normalizedRating}/5
Customer name: ${cleanText(
      customerName
    )}
Keywords: ${cleanKeywords(
      keywords
    ).join(", ")}

Rules:
- First-person customer perspective.
- Match the rating honestly.
- Each variation must be meaningfully different.
- Keep each review concise.
- Do not invent facts or specific experiences.
- No hashtags.
- No excessive emojis.
- Do not mention AI.
- Return valid JSON only in this format:
{
  "reviews": [
    "review 1",
    "review 2",
    "review 3"
  ]
}
`;

    const completion =
      await client.chat.completions.create(
        {
          model: getModel(),
          temperature: 0.9,
          max_tokens: 500,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "Generate authentic review suggestions without fabricating customer experiences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );

    const content =
      completion?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "Unable to generate review variations."
      );
    }

    try {
      const parsed =
        JSON.parse(content);

      const reviews =
        Array.isArray(
          parsed?.reviews
        )
          ? parsed.reviews
              .map(review =>
                cleanText(review)
              )
              .filter(Boolean)
              .slice(
                0,
                variationCount
              )
          : [];

      if (reviews.length === 0) {
        throw new Error(
          "No review variations returned."
        );
      }

      return reviews;
    } catch {
      throw new Error(
        "Invalid review response received from AI service."
      );
    }
  };

export default {
  generateReviewSuggestion,
  generateReviewVariations,
};