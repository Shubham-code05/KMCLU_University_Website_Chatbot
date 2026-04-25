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

// ✅ ADD THIS LINE (chatbot.js serve )
app.use(express.static(__dirname));

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

// ✅ Language Detection
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

    // Save + reply
    const sendReply = async (replyText) => {
      try {
        await ChatHistory.create({
          userMessage: message,
          botReply: replyText,
        });
      } catch (err) {
        console.log("History Save Error:", err.message);
      }

      return res.json({ reply: replyText });
    };

    // ✅ Greeting (language aware)
    if (["hi", "hello", "hey", "hlo", "namaste"].includes(lowerMessage)) {
      if (userLang === "hindi") {
        return sendReply(
          "👋 KMCLU Helpdesk me swagat hai!\n\nAap puch sakte hain:\n• Admission\n• Fees\n• Courses\n• Hostel\n• Result\n• Contact"
        );
      }

      if (userLang === "hinglish") {
        return sendReply(
          "👋 Welcome to KMCLU Helpdesk!\n\nAap pooch sakte ho:\n• Admission\n• Fees\n• Courses\n• Hostel\n• Result\n• Contact"
        );
      }

      return sendReply(
        "👋 Welcome to KMCLU Helpdesk!\n\nYou can ask about:\n• Admission\n• Fees\n• Courses\n• Hostel\n• Result\n• Contact"
      );
    }

    // ✅ Static Answers
    if (lowerMessage.includes("full form")) {
      return sendReply(
        "KMCLU ka full form Khwaja Moinuddin Chishti Language University hai."
      );
    }

    if (lowerMessage.includes("vice chancellor") || lowerMessage.includes("vc")) {
      return sendReply("KMCLU ke Vice Chancellor Prof. Ajay Taneja hain.");
    }

    if (
      lowerMessage.includes("address") ||
      lowerMessage.includes("location") ||
      lowerMessage.includes("kaha")
    ) {
      return sendReply(
        "KMCLU Sitapur-Hardoi Bypass Road, Lucknow - 226013, Uttar Pradesh mein sthit hai."
      );
    }

    if (lowerMessage.includes("contact")) {
      return sendReply(
        "📞 +91-7007076127\n📧 reg@kmclu.ac.in"
      );
    }

    // ✅ DB Search (RAG)
    const result = await UniversityData.findOne({
      question: { $regex: message, $options: "i" },
    });

    if (result) {
      let finalAnswer = result.answer;

      // language formatting
      if (userLang === "hindi") {
        finalAnswer = `👉 जानकारी:\n${result.answer}`;
      } else if (userLang === "hinglish") {
        finalAnswer = `${result.answer}\n\n(aur kuch puchna ho to bolo 👍)`;
      }

      return sendReply(finalAnswer);
    }

    // 🤖 AI Fallback
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
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

Give direct answers (no "visit website" unless necessary)

If unknown:
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
      completion.choices?.[0]?.message?.content ||
      "KMCLU ki official website par iski jaankari uplabdh nahi hai.";

    return sendReply(reply);
  } catch (error) {
    console.log("Server Error:", error.message);

    return res.status(500).json({
      reply: "Server Error. Try again.",
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});