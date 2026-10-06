const { GoogleGenAI, Type } = require("@google/genai");

const User = require("../models/User");
const { decrypt } = require("../utils/encryption");

/*
==================================================
GET USER GEMINI AI CLIENT
==================================================
*/

const getUserAI = async (userId) => {
  const user = await User.findById(userId).select(
    "geminiApiKeyEncrypted geminiApiEnabled"
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.geminiApiEnabled) {
    throw new Error(
      "Gemini API key is not configured. Please add your Gemini API key in AI Settings."
    );
  }

  if (!user.geminiApiKeyEncrypted) {
    throw new Error(
      "Gemini API key is not configured. Please add your Gemini API key in AI Settings."
    );
  }

  const apiKey = decrypt(user.geminiApiKeyEncrypted);

  if (!apiKey) {
    throw new Error("Unable to decrypt Gemini API key");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

/*
==================================================
PRODUCT SCHEMA
==================================================
*/

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

  required: [
    "intent",
    "product",
    "missingFields",
  ],
};

/*
==================================================
SALE SCHEMA
==================================================
*/

const saleSchema = {
  type: Type.OBJECT,

  properties: {
    intent: {
      type: Type.STRING,
      enum: ["add_sale", "unknown"],
    },

    sale: {
      type: Type.OBJECT,

      properties: {
        customerName: {
          type: Type.STRING,
          nullable: true,
        },

        productName: {
          type: Type.STRING,
          nullable: true,
        },

        quantity: {
          type: Type.NUMBER,
          nullable: true,
        },

        paymentStatus: {
          type: Type.STRING,
          nullable: true,
        },

        paidAmount: {
          type: Type.NUMBER,
          nullable: true,
        },

        dueDate: {
          type: Type.STRING,
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

  required: [
    "intent",
    "sale",
    "missingFields",
  ],
};

/*
==================================================
PURCHASE SCHEMA
==================================================
*/

const purchaseSchema = {
  type: Type.OBJECT,

  properties: {
    intent: {
      type: Type.STRING,
      enum: ["add_purchase", "unknown"],
    },

    purchase: {
      type: Type.OBJECT,

      properties: {
        supplierName: {
          type: Type.STRING,
          nullable: true,
        },

        productName: {
          type: Type.STRING,
          nullable: true,
        },

        quantity: {
          type: Type.NUMBER,
          nullable: true,
        },

        unitCost: {
          type: Type.NUMBER,
          nullable: true,
        },

        receivedDate: {
          type: Type.STRING,
          nullable: true,
        },

        invoiceReference: {
          type: Type.STRING,
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

  required: [
    "intent",
    "purchase",
    "missingFields",
  ],
};

/*
==================================================
UNDERSTAND PRODUCT COMMAND
==================================================
*/

const understandProductCommand = async (userId, text) => {
  const ai = await getUserAI(userId);

  const prompt = `
You are an AI assistant for an inventory management application.

Your job is to understand the user's spoken command
and extract product information.

The user may speak in:

- English
- Tamil
- Tanglish
- Tamil-English mixed language

Understand all of these naturally.

Rules:

1. If the user wants to add or create a product,
   intent must be "add_product".

2. If the user is not asking to add a product,
   intent must be "unknown".

3. Extract ONLY information explicitly mentioned.

4. NEVER invent or guess missing values.

5. Missing values must be null.

6. Add missing field names to missingFields.

7. Keep numeric values as numbers.

8. Understand natural conversational speech.

9. Understand Tamil, English, Tanglish and mixed
   Tamil-English commands.

10. Do not add explanations outside JSON.

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

/*
==================================================
UNDERSTAND SALE COMMAND
==================================================
*/

const understandSaleCommand = async (userId, text) => {
  const ai = await getUserAI(userId);

  const prompt = `
You are an AI assistant for an inventory management application.

Your job is to understand the user's spoken command
and extract sale information.

The user may speak in:

- English
- Tamil
- Tanglish
- Tamil-English mixed language

Understand all of these naturally.

Rules:

1. If the user wants to create, add or record a sale,
   intent must be "add_sale".

2. If the user is not asking to create a sale,
   intent must be "unknown".

3. Extract ONLY information explicitly mentioned.

4. NEVER invent or guess missing values.

5. Missing values must be null.

6. Add missing field names to missingFields.

7. Keep numeric values as numbers.

8. Understand natural conversational speech.

9. Understand Tamil, English, Tanglish and mixed
   Tamil-English commands.

10. Do not add explanations outside JSON.

Sale fields:

- customerName
- productName
- quantity
- paymentStatus
- paidAmount
- dueDate

Important:

- customerName = only customer name
- productName = only product name
- quantity = number
- paymentStatus = Paid, Partial, or Due
- paidAmount = number
- dueDate = date if explicitly mentioned

NEVER calculate paidAmount.

NEVER calculate dueDate.

NEVER guess customer or product names.

Examples:

English:
"Create a sale for customer Ravi, product Cotton Saree,
quantity 2, payment status paid."

Tanglish:
"Ravi ku Cotton Saree rendu sell pannunga payment paid."

Tamil:
"ரவி அவர்களுக்கு காட்டன் சேலை இரண்டு விற்கவும்."

User command:

"${text}"
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: saleSchema,
    },
  });

  return JSON.parse(response.text);
};

/*
==================================================
UNDERSTAND PURCHASE COMMAND
==================================================
*/

const understandPurchaseCommand = async (userId, text) => {
  const ai = await getUserAI(userId);

  const prompt = `
You are an AI assistant for an inventory management application.

Your job is to understand the user's spoken command
and extract purchase information.

The user may speak in:

- English
- Tamil
- Tanglish
- Tamil-English mixed language

Understand all of these naturally.

Rules:

1. If the user wants to create, add or record a purchase,
   intent must be "add_purchase".

2. If the user is not asking to create a purchase,
   intent must be "unknown".

3. Extract ONLY information explicitly mentioned.

4. NEVER invent or guess missing values.

5. Missing values must be null.

6. Add missing field names to missingFields.

7. Keep numeric values as numbers.

8. Understand natural conversational speech.

9. Understand Tamil, English, Tanglish and mixed
   Tamil-English commands.

10. Do not add explanations outside JSON.

Purchase fields:

- supplierName
- productName
- quantity
- unitCost
- receivedDate
- invoiceReference

Important:

- supplierName = only supplier name
- productName = only product name
- quantity = number
- unitCost = number
- receivedDate = only if explicitly mentioned
- invoiceReference = only if explicitly mentioned

NEVER calculate unitCost.

NEVER calculate receivedDate.

NEVER invent invoiceReference.

Examples:

English:
"Add a purchase from ABC Traders for Cotton Saree,
quantity 20, unit cost 700."

Tanglish:
"ABC Traders kitta irundhu Cotton Saree 20 pieces
purchase pannunga, unit cost 700."

Tamil-English:
"Supplier Kumar Textiles, product Silk Saree,
quantity 10, unit cost 850."

Tamil:
"ABC Traders இடமிருந்து காட்டன் சேலை 20 வாங்குங்கள்,
ஒரு சேலையின் விலை 700."

User command:

"${text}"
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: purchaseSchema,
    },
  });

  return JSON.parse(response.text);
};


const understandCustomerCommand = async (userId, text) => {
  const ai = await getUserAI(userId);

  const customerSchema = {
    type: Type.OBJECT,
    properties: {
      intent: {
        type: Type.STRING,
      },
      customer: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            nullable: true,
          },
          phone: {
            type: Type.STRING,
            nullable: true,
          },
          address: {
            type: Type.STRING,
            nullable: true,
          },
          notes: {
            type: Type.STRING,
            nullable: true,
          },
          whatsappPreference: {
            type: Type.BOOLEAN,
            nullable: true,
          },
        },
        required: [
          "name",
          "phone",
          "address",
          "notes",
          "whatsappPreference",
        ],
      },
      missingFields: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["intent", "customer", "missingFields"],
  };

  const prompt = `
You are an AI assistant for an inventory management application.

Understand the user's customer-related voice command.

The user may speak in:
- English
- Tamil
- Tanglish
- Mixed Tamil and English

Extract customer information accurately.

Possible information:
- Customer name
- Phone number
- Address
- Notes
- WhatsApp communication preference

Examples:

"Add customer Lakshmi phone 9876543210"
"Customer name is Lakshmi, mobile 9876543210, address Salem"
"Lakshmi oda number 9876543210"
"Lakshmi, phone 9876543210, WhatsApp yes"

Rules:

1. intent must be "add_customer" for a customer creation command.
2. Do not invent missing information.
3. If a field is not mentioned, return null.
4. Phone number should contain digits only when possible.
5. whatsappPreference:
   - true if the user clearly says WhatsApp yes/preferred.
   - false if the user clearly says WhatsApp no/not preferred.
   - null if not mentioned.
6. missingFields should contain fields that are important but were not detected.
7. Return only JSON matching the provided schema.

User command:
${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: customerSchema,
    },
  });

  return JSON.parse(response.text);
};

/*
==================================================
EXPORT
==================================================
*/

module.exports = {
  understandProductCommand,
  understandSaleCommand,
  understandPurchaseCommand,
  understandCustomerCommand,
};