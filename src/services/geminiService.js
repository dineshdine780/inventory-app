const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const productSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ["add_product", "unknown"],
    },

    product: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          nullable: true,
        },
        category: {
          type: Type.STRING,
          nullable: true,
        },
        purchasePrice: {
          type: Type.NUMBER,
          nullable: true,
        },
        sellingPrice: {
          type: Type.NUMBER,
          nullable: true,
        },
        stock: {
          type: Type.NUMBER,
          nullable: true,
        },
        reorderLevel: {
          type: Type.NUMBER,
          nullable: true,
        },
      },
    },

    missingFields: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },

  required: ["intent", "product", "missingFields"],
};

const understandProductCommand = async (text) => {
  const prompt = `
You are an AI assistant for an inventory management application.

Your job is to understand the user's spoken command and extract product information.

Rules:

1. If the user wants to add/create a product, intent must be "add_product".
2. If the user is not asking to add a product, intent must be "unknown".
3. Extract ONLY information explicitly mentioned by the user.
4. NEVER invent or guess missing values.
5. Missing values must be null.
6. Add missing field names to missingFields.
7. Keep numeric values as numbers.
8. Understand natural conversational speech.
9. Do not add explanations outside the JSON structure.

Product fields:

- name
- category
- purchasePrice
- sellingPrice
- stock
- reorderLevel

User command:

"${text}"
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: productSchema,
    },
  });

  return JSON.parse(response.text);
};

module.exports = {
  understandProductCommand,
};