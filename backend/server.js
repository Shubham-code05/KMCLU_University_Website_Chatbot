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
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
        console.log("❌ Notice Fetch Error:", err.message);

        return sendReply(
          "Latest notice fetch nahi ho paaya.\n\nWebsite: https://www.kmclu.ac.in/"
        );
      }
    }

    // Smart Search Text
    let searchText = lowerMessage;

    if (
      lowerMessage.includes("bca") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "bca fee";
    } else if (
      lowerMessage.includes("btech") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "btech fee";
    } else if (
      lowerMessage.includes("mba") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "mba fee";
    } else if (
      lowerMessage.includes("mca") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "mca fee";
    } else if (
      lowerMessage.includes("hostel") &&
      lowerMessage.includes("fee")
    ) {
      searchText = "hostel fee";
    } else if (lowerMessage.includes("hostel")) {
      searchText = "hostel";
    } else if (lowerMessage.includes("library")) {
      searchText = "library";
    } else if (lowerMessage.includes("scholarship")) {
      searchText = "scholarship";
    } else if (lowerMessage.includes("result")) {
      searchText = "result";
    } else if (
      lowerMessage.includes("admit") ||
      lowerMessage.includes("hall ticket")
    ) {
      searchText = "admit card";
    } else if (lowerMessage.includes("course")) {
      searchText = "courses";
    }

    // Search in UniversityData
    const result = await UniversityData.findOne({
      question: { $regex: searchText, $options: "i" },
    });

    if (result) {
      return sendReply(result.answer);
    }

    // Groq Fallback
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are the official KMCLU University Helpdesk Bot.

Use only official KMCLU information.

KMCLU Full Form:
Khwaja Moinuddin Chishti Language University, Lucknow

Official Address:
Sitapur-Hardoi Bypass Road, Lucknow - 226013, Uttar Pradesh

Vice Chancellor:
Prof. Ajay Taneja

Helpline Number:
+91-7007076127

Registrar Email:
reg@kmclu.ac.in

Official Website:
https://www.kmclu.ac.in/

Answer in simple Hinglish.

If information is not available, say exactly:
"KMCLU ki official website par iski jaankari uplabdh nahi hai."

If question is not related to KMCLU, say exactly:
"Please ask only KMCLU University related questions."
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
    } catch (groqError) {
      console.log("❌ Groq Error:", groqError.message);

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