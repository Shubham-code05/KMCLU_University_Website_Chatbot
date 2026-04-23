const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const UniversityData = require("./models/UniversityData");
const ChatHistory = require("./models/ChatHistory");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Groq Setup
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

// 🟢 Language Detection Function
function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "hindi";

  const lower = text.toLowerCase();
  const hinglishWords = ["hai", "kya", "kaise", "kyu", "tum", "mera", "kaun"];

  if (hinglishWords.some((word) => lower.includes(word))) {
    return "hinglish";
  }

  return "english";
}

// Test Route
app.get("/", (req, res) => {
  res.send("KMCLU Chatbot Backend Running...");
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message?.trim();

    if (!message) {
      return res.status(400).json({
        reply: "Please type something.",
      });
    }

    const lowerMessage = message.toLowerCase();
    const userLang = detectLanguage(message);

    // Save + Reply function
    const sendReply = async (replyText) => {
      try {
        await ChatHistory.create({
          userMessage: message,
          botReply: replyText,
        });
      } catch (err) {
        console.log("❌ Chat History Save Error:", err.message);
      }

      return res.json({ reply: replyText });
    };

    // Greeting
    if (["hi", "hello", "hey", "hlo"].includes(lowerMessage)) {
      return sendReply(
        userLang === "hindi"
          ? "👋 KMCLU Student Helpdesk mein aapka swagat hai!"
          : "👋 Welcome to KMCLU Student Helpdesk!"
      );
    }

    // Static Answers
    if (lowerMessage.includes("full form")) {
      return sendReply(
        "KMCLU ka full form Khwaja Moinuddin Chishti Language University, Lucknow hai."
      );
    }

    if (lowerMessage.includes("vice chancellor")) {
      return sendReply(
        "KMCLU ke Vice Chancellor Prof. Ajay Taneja hain."
      );
    }

    if (lowerMessage.includes("address")) {
      return sendReply(
        "KMCLU Sitapur-Hardoi Bypass Road, Lucknow - 226013, Uttar Pradesh mein sthit hai."
      );
    }

    if (lowerMessage.includes("contact")) {
      return sendReply(
        "KMCLU Helpline Number: +91-7007076127\nEmail: reg@kmclu.ac.in"
      );
    }

    // 🔍 Search DB
    const result = await UniversityData.findOne({
      question: { $regex: lowerMessage, $options: "i" },
    });

    if (result) {
      return sendReply(result.answer);
    }

    // 🤖 AI Fallback
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `
You are KMCLU University Helpdesk Bot.

User language: ${userLang}

Rules:
- Reply in SAME language as user
- Hindi → Hindi
- Hinglish → Hinglish
- English → English

Use only KMCLU related info.

If not available:
"KMCLU ki official website par iski jaankari uplabdh nahi hai."
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const reply =
        completion.choices?.[0]?.message?.content?.trim() ||
        "KMCLU ki official website par iski jaankari uplabdh nahi hai.";

      return sendReply(reply);
    } catch (err) {
      console.log("❌ AI Error:", err.message);

      return sendReply(
        "KMCLU ki official website par iski jaankari uplabdh nahi hai."
      );
    }
  } catch (error) {
    console.log("❌ Server Error:", error.message);

    return res.status(500).json({
      reply: "Server Error. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});