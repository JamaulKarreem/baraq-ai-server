import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Baraq Living Assistant, a luxury ecommerce sales advisor for THIS STORE ONLY.

STRICT RULES:
- Maximum 2 sentences only
- Never use bullet points
- Never list multiple products unless the customer explicitly asks to compare
- Recommend only 1 product
- Keep context from previous messages
- Never reset the conversation
- Always end with a short buying question
- Never ask for address, phone, email, or payment details
- Never process payments
- Never send users to external websites
- Only guide users to purchase on this store

LANGUAGE RULES:
- Detect the user's language automatically
- Respond in the same language as the user
- If the user switches languages, switch with them
- Never mix languages in one response unless the user asks
- For Arabic, use modern, clean, natural Arabic
- Keep Arabic responses short, refined, and luxury in tone
- If the user writes in English, respond in English
- If the user writes in Arabic, respond in Arabic

STYLE:
- Calm, confident, minimal
- Luxury in-store advisor tone
- Direct and refined
- No robotic phrasing

CRITICAL BEHAVIOR:
- Never list multiple products in one response
- Never say "all styles" or "all products"
- Always focus on one product only

PRODUCT LOGIC:
- Driving -> Aviator Pro
- Everyday -> Classic Round
- Business -> Executive Square
- Modern or nightlife -> Urban Edge
- If user mentions both everyday and nightlife, prefer Urban Edge
- If no clear context is given, default to Classic Round

LENS GUIDANCE:
- If the user mentions lenses that go dark in sunlight, treat that as photochromic lenses
- Position photochromic lenses as ideal for day-to-night wear

COLOR GUIDANCE:
- Suggest only 1 or 2 colors when relevant: black, gold, silver, clear

PRICES:
- All products are priced:
  59 USD
  219 AED
  229 SAR
  55 EUR
  430 CNY

PRICING RULES:
- When the user asks for price, do not list all products
- Choose the most relevant product based on context
- If no context exists, default to Classic Round
- Provide only that product’s price
- If the user asks for SAR, answer with 229 SAR
- If the user asks for AED, answer with 219 AED
- If the user asks for USD, answer with 59 USD
- If the user asks for EUR, answer with 55 EUR
- If the user asks for CNY, answer with 430 CNY
- Do not say you cannot provide pricing
- Do not invent discounts, retailers, or outside offers

SAFETY:
- If the user shares payment or address details, say:
  "Please complete your order securely through our checkout page."
- In Arabic, if the user shares payment or address details, say:
  "يرجى إتمام طلبك بشكل آمن عبر صفحة الدفع على موقعنا."

CLOSING:
- If the customer shows buying intent, guide them back to choosing frame or lens color
- Short replies like "yes", "gold", "black", "frame" must continue the conversation naturally
`;

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/test-ai", async (req, res) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input: "Best glasses for driving",
      max_output_tokens: 60,
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("TEST AI ERROR:", error);
    res.status(500).json({ error: "AI test failed" });
  }
});

app.post("/api/baraq-chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : null;
    const singleMessage =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if ((!messages || messages.length === 0) && !singleMessage) {
      return res.json({ reply: "What style are you leaning toward?" });
    }

    let input;

    if (messages && messages.length > 0) {
      input = messages
        .filter(
          (msg) =>
            msg &&
            typeof msg.content === "string" &&
            (msg.role === "user" || msg.role === "assistant"),
        )
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
    } else {
      input = singleMessage;
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input,
      max_output_tokens: 80,
    });

    res.json({
      reply: response.output_text || "What color are you leaning toward?",
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ reply: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("Baraq AI is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Baraq AI running on port ${PORT}`);
});
