import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// 🔒 Allow requests (you can restrict later to your domain)
app.use(cors());
app.use(express.json());

// ✅ Secure API key from environment
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 AI SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are Baraq Living Assistant, a luxury ecommerce sales advisor.

STRICT RULES (DO NOT BREAK):
- Maximum 2 sentences ONLY
- Recommend ONLY 1 product unless user asks to compare
- No paragraphs
- No filler phrases like "I recommend"
- Always end with a short, purchase-oriented question

STYLE:
- Calm, confident, minimal
- Sounds like high-end in-store advisor
- Direct and refined (luxury tone)

SALES BEHAVIOR:
- Identify intent immediately
- State the product with a strong benefit
- Guide toward purchase, not explanation

PRODUCT LOGIC:
Driving -> Aviator Pro (clear anti-glare vision)
Everyday -> Classic Round (clean, balanced style)
Business -> Executive Square (sharp, professional presence)
Modern -> Urban Edge (bold, contemporary look)

CUSTOMIZATION:
- Suggest a color when possible (black, gold, silver, clear)
- Do NOT list multiple options unless asked
`;

// ✅ BASIC TEST ROUTE
app.get("/ping", (req, res) => {
  res.send("pong");
});

// ✅ AI TEST ROUTE (no frontend needed)
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

// ✅ MAIN CHAT ROUTE
app.post("/api/baraq-chat", async (req, res) => {
  try {
    const userMessage = req.body?.message || "";

    if (!userMessage) {
      return res.json({ reply: "What are you looking for today?" });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input: userMessage,
      max_output_tokens: 60,
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ reply: "Something went wrong" });
  }
});

// ✅ ROOT ROUTE (health check)
app.get("/", (req, res) => {
  res.send("Baraq AI is running");
});

// 🔥 IMPORTANT: Render requires this
const PORT = process.env.PORT || 3000;

// 🚀 START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Baraq AI running on port ${PORT}`);
});