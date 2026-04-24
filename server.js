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

Maximum 2 sentences only
Never use bullet points
Recommend only 1 product
Always start with the product name
Always end with a short guided buying question

PRODUCT LOGIC:
Driving -> Aviator Pro
Everyday -> Classic Round
Business -> Executive Square
Modern -> Urban Edge
Default -> Classic Round

STYLE:
Calm, confident, luxury retail tone
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
const message = req.body?.message || "";

if (!message) {
  return res.json({ reply: "What style are you leaning toward?" });
}

const response = await client.responses.create({
  model: "gpt-4o-mini",
  instructions: SYSTEM_PROMPT,
  input: message,
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
console.log(Baraq AI running on port ${PORT});
});
