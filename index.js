const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(express.json({ limit: "1mb" }));

// Frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({
    status: "ok",
    service: "jarvis",
    version: "0.1"
  });
});

// AI
app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const ai = new GoogleGenAI({
      apiKey
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `
You are Jarvis, Ali Akbar's personal AI assistant.

Your job:
- Understand English, Urdu and Roman Urdu.
- Reply in Roman Urdu by default.
- If Ali asks in English and clearly wants English, reply in English.
- Answer the actual question.
- Never repeat a fixed response such as "I heard you say".
- Be helpful, natural and concise.
- If you do not know something, say so instead of inventing information.
- You are currently Jarvis v0.1, so do not claim that you can control Gmail, WhatsApp,
  Amazon, Shopify or other services unless that capability has actually been connected.
- For normal questions, give the best useful answer you can.
        `,
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    const reply = response.text?.trim();

    if (!reply) {
      return res.status(500).json({
        error: "AI returned an empty response"
      });
    }

    res.json({
      reply
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "Jarvis AI request failed"
    });
  }
});

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Jarvis v0.1 listening on port ${PORT}`);
});
