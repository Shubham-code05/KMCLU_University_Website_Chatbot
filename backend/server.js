const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const UniversityData = require("./models/UniversityData");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
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

    // Greeting
    if (["hi", "hello", "hey", "hlo"].includes(lowerMessage)) {
      return res.json({
        reply:
          "👋 Welcome to KMCLU Student Helpdesk!\n\nYou can ask me about:\n• Admission\n• Courses\n• Fee Structure\n• Hostel\n• Scholarship\n• Exam\n• Result\n• Library\n• Contact Number\n• Vice Chancellor\n• Placement\n• Address\n• Latest Notice",
      });
    }

    // Static Answers
    if (
      lowerMessage.includes("full form") ||
      lowerMessage.includes("kmclu ka full form")
    ) {
      return res.json({
        reply:
          "KMCLU ka full form Khwaja Moinuddin Chishti Language University, Lucknow hai.",
      });
    }

    if (
      lowerMessage.includes("vice chancellor") ||
      lowerMessage.includes("vc kaun") ||
      lowerMessage.includes("vice chancellor kaun hai")
    ) {
      return res.json({
        reply: "KMCLU ke Vice Chancellor Prof. Ajay Taneja hain.",
      });
    }

    if (
      lowerMessage.includes("address") ||
      lowerMessage.includes("location") ||
      lowerMessage.includes("kaha hai")
    ) {
      return res.json({
        reply:
          "KMCLU Sitapur-Hardoi Bypass Road, Lucknow - 226013, Uttar Pradesh mein sthit hai.",
      });
    }

    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("helpline")
    ) {
      return res.json({
        reply:
          "KMCLU Helpline Number: +91-7007076127\nEmail: reg@kmclu.ac.in",
      });
    }

    // Latest Notice
    if (
      lowerMessage.includes("latest notice") ||
      lowerMessage.includes("new notice") ||
      lowerMessage.includes("notice")
    ) {
      try {
        const { data } = await axios.get(
          "https://www.kmclu.ac.in/notice/",
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );

        const $ = cheerio.load(data);

        const notices = [];

        $("a").each((i, el) => {
          const text = $(el).text().trim();

          if (
            text.length > 20 &&
            !text.toLowerCase().includes("home") &&
            !text.toLowerCase().includes("read more") &&
            !text.toLowerCase().includes("click here") &&
            !text.toLowerCase().includes("view all")
          ) {
            notices.push(text);
          }
        });

        const latestNotice =
          notices[0] || "Latest notice website par available hai.";

        return res.json({
          reply:
            "📢 Latest KMCLU Notice:\n\n" +
            latestNotice +
            "\n\nWebsite: https://www.kmclu.ac.in/notice/",
        });
      } catch (err) {
        console.log("❌ Notice Fetch Error:", err.message);

        return res.json({
          reply:
            "Latest notice fetch nahi ho paaya.\nWebsite: https://www.kmclu.ac.in/notice/",
        });
      }
    }

    // Smart Matching for MongoDB
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
      lowerMessage.includes("bba") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "bba fee";
    } else if (
      lowerMessage.includes("bcom") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "bcom fee";
    } else if (
      lowerMessage.includes("ba") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "ba fee";
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

    // MongoDB Search
    const result = await UniversityData.findOne({
      question: { $regex: searchText, $options: "i" },
    });

    if (result) {
      return res.json({
        reply: result.answer,
      });
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

If information is not available, say:
"KMCLU ki official website par iski jaankari uplabdh nahi hai."

If question is not related to KMCLU, say:
"Please ask only KMCLU University related questions."
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const reply = completion.choices?.[0]?.message?.content?.trim();

      return res.json({
        reply:
          reply ||
          "KMCLU ki official website par iski jaankari uplabdh nahi hai.",
      });
    } catch (groqError) {
      console.log("❌ Groq Error:", groqError.message);

      return res.json({
        reply:
          "KMCLU ki official website par iski jaankari uplabdh nahi hai.",
      });
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