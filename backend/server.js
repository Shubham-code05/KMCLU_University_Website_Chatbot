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


// ✅ Language Detection (NEW)
function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "hindi";

  const lower = text.toLowerCase();
  const hinglishWords = ["hai", "kya", "kaise", "kyu", "tum", "mera", "kaun"];

  if (hinglishWords.some(word => lower.includes(word))) {
    return "hinglish";
  }

  return "english";
}


// Test Route
app.get("/", (req, res) => {
  res.send("KMCLU Chatbot Backend Running...");
});

// Chat History Route
app.get("/history", async (req, res) => {
  try {
    const chats = await ChatHistory.find()
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(chats);
  } catch (err) {
    console.log("❌ History Fetch Error:", err.message);

    res.status(500).json({
      error: "History fetch failed",
    });
  }
});

// Clear History Route
app.delete("/history", async (req, res) => {
  try {
    await ChatHistory.deleteMany({});

    res.json({
      message: "History deleted successfully",
    });
  } catch (err) {
    console.log("❌ History Delete Error:", err.message);

    res.status(500).json({
      error: "History delete failed",
    });
  }
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

    // ✅ Detect Language (NEW)
    const userLang = detectLanguage(message);

    // Common reply + save function
    const sendReply = async (replyText) => {
      try {
        await ChatHistory.create({
          userMessage: message,
          botReply: replyText,
        });
      } catch (err) {
        console.log("❌ Chat History Save Error:", err.message);
      }

      return res.json({
        reply: replyText,
      });
    };

    // Greeting
    if (["hi", "hello", "hey", "hlo"].includes(lowerMessage)) {
      return sendReply(
        "👋 Welcome to KMCLU Student Helpdesk!\n\nYou can ask me about:\n• Admission\n• Courses\n• Fee Structure\n• Hostel\n• Scholarship\n• Exam\n• Result\n• Library\n• Contact Number\n• Vice Chancellor\n• Placement\n• Address\n• Latest Notice"
      );
    }

    // Static Answers
    if (
      lowerMessage.includes("full form") ||
      lowerMessage.includes("kmclu ka full form")
    ) {
      return sendReply(
        "KMCLU ka full form Khwaja Moinuddin Chishti Language University, Lucknow hai."
      );
    }

    if (
      lowerMessage.includes("vice chancellor") ||
      lowerMessage.includes("vc kaun") ||
      lowerMessage.includes("vice chancellor kaun hai")
    ) {
      return sendReply(
        "KMCLU ke Vice Chancellor Prof. Ajay Taneja hain."
      );
    }

    if (
      lowerMessage.includes("address") ||
      lowerMessage.includes("location") ||
      lowerMessage.includes("kaha hai")
    ) {
      return sendReply(
        "KMCLU Sitapur-Hardoi Bypass Road, Lucknow - 226013, Uttar Pradesh mein sthit hai."
      );
    }

    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("helpline")
    ) {
      return sendReply(
        "KMCLU Helpline Number: +91-7007076127\nEmail: reg@kmclu.ac.in"
      );
    }

    // Latest Notice
    if (
      lowerMessage.includes("latest notice") ||
      lowerMessage.includes("new notice") ||
      lowerMessage === "notice"
    ) {
      try {
        const { data } = await axios.get("https://www.kmclu.ac.in/", {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
          timeout: 10000,
        });

        const $ = cheerio.load(data);
        const notices = [];

        $("a").each((i, el) => {
          const text = $(el).text().trim();

          if (
            text.length > 25 &&
            !text.toLowerCase().includes("home") &&
            !text.toLowerCase().includes("read more") &&
            !text.toLowerCase().includes("contact") &&
            !text.toLowerCase().includes("admission") &&
            !notices.includes(text)
          ) {
            notices.push(text);
          }
        });

        const latestNotice =
          notices[0] || "Website par latest notice available hai.";

        return sendReply(
          `📢 Latest KMCLU Notice:\n\n${latestNotice}\n\nWebsite: https://www.kmclu.ac.in/`
        );
      } catch (err) {
        return sendReply(
          "Latest notice fetch nahi ho paaya.\n\nWebsite: https://www.kmclu.ac.in/"
        );
      }
    }

    // DB Search
    const result = await UniversityData.findOne({
      question: { $regex: lowerMessage, $options: "i" },
    });

    if (result) {
      return sendReply(result.answer);
    }

    // 🤖 Groq Fallback (UPDATED ONLY THIS PART)
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are the official KMCLU University Helpdesk Bot.

User language: ${userLang}

Rules:
- Reply in SAME language as user
- Hindi → Hindi
- Hinglish → Hinglish
- English → English

Use only official KMCLU information.

KMCLU Full Form:
Khwaja Moinuddin Chishti Language University, Lucknow

Official Address:
Sitapur-Hardoi Bypass Road, Lucknow - 226013

Vice Chancellor:
Prof. Ajay Taneja

Helpline Number:
+91-7007076127

Official Website:
https://www.kmclu.ac.in/

If information is not available, say:
"KMCLU ki official website par iski jaankari uplabdh nahi hai."
`
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
      return sendReply(
        "KMCLU ki official website par iski jaankari uplabdh nahi hai."
      );
    }
  } catch (error) {
    return res.status(500).json({
      reply: "Server Error. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 