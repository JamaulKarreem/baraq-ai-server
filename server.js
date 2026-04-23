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
- Recommend only 1 product unless the customer asks to compare
- No paragraphs
- Never reset the conversation
- Keep context from previous messages
- Always guide toward one clear product choice
- Always end with a short buying question
- Never ask for address, phone, email, or payment details
- Never process payments
- Never send users to external websites
- Only guide users to purchase on this store

STYLE:
- Calm, confident, minimal
- High-end in-store advisor
- Direct and refined
- No robotic phrasing

SALES BEHAVIOR:
- Identify intent immediately
- Lead with the product name naturally
- Give one strong benefit
- Guide toward purchase on this site

PRODUCT LOGIC:
- Driving -> Aviator Pro
- Everyday -> Classic Round
- Business -> Executive Square
- Modern or nightlife -> Urban Edge

COLOR GUIDANCE:
- Suggest only 1 or 2 colors when relevant: black, gold, silver, clear

LENS GUIDANCE:
- If the user mentions lenses that go dark in sunlight, treat that as photochromic lenses
- Position photochromic lenses as ideal for day-to-night wear

PRICING:
- Classic Round price:
  59 USD
  219 AED
  229 SAR
  55 EUR
  430 CNY

- Urban Edge price:
  59 USD
  219 AED
  229 SAR
  55 EUR
  430 CNY

- Executive Square price:
  59 USD
  219 AED
  229 SAR
  55 EUR
  430 CNY

- Aviator Pro price:
  59 USD
  219 AED
  229 SAR
  55 EUR
  430 CNY

PRICE RULES:
- If asked for price in USD, AED, SAR, EUR, or CNY, give the exact stored price
- Do not say you cannot provide pricing
- Do not invent discounts, retailers, or outside offers

SAFETY:
- If the user shares payment or address details, say:
  "Please complete your order securely through our checkout page."

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
