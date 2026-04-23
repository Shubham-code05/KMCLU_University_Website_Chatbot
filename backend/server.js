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
app.use(cors());
app.use(express.json());

// Groq Setup
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err.message));

// Language Detection 🔥
const detectLanguage = (text) => {
  if (/^[a-zA-Z0-9\s.,?]+$/.test(text)) return "english";
  if (/[\u0900-\u097F]/.test(text)) return "hindi";
  return "hinglish";
};

// Root
app.get("/", (req, res) => {
  res.send("KMCLU Backend Running...");
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message?.trim();

    if (!message) {
      return res.json({ reply: "Please type something." });
    }

    const lowerMessage = message.toLowerCase();
    const language = detectLanguage(message);

    // Save + Reply
    const sendReply = async (replyText) => {
      try {
        await ChatHistory.create({
          userMessage: message,
          botReply: replyText,
        });
      } catch (err) {
        console.log("❌ Save Error:", err.message);
      }

      return res.json({ reply: replyText });
    };

    // Greeting (Dynamic Language)
    if (["hi", "hello", "hey", "hlo"].includes(lowerMessage)) {
      if (language === "english") {
        return sendReply(
          "👋 Welcome to KMCLU Helpdesk! You can ask about admission, fees, hostel, courses, etc."
        );
      } else if (language === "hindi") {
        return sendReply(
          "👋 KMCLU हेल्पडेस्क में आपका स्वागत है। आप admission, fees, hostel आदि के बारे में पूछ सकते हैं।"
        );
      } else {
        return sendReply(
          "👋 Welcome to KMCLU Helpdesk! Aap admission, fees, hostel ke baare me puch sakte hain."
        );
      }
    }

    // Contact
    if (lowerMessage.includes("contact")) {
      return sendReply(
        "KMCLU Helpline: +91-7007076127\nEmail: reg@kmclu.ac.in"
      );
    }

    // Latest Notice
    if (lowerMessage.includes("notice")) {
      try {
        const { data } = await axios.get("https://www.kmclu.ac.in/");
        const $ = cheerio.load(data);

        const notices = [];
        $("a").each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 30 && !notices.includes(text)) {
            notices.push(text);
          }
        });

        return sendReply(
          `📢 Latest Notice:\n\n${notices[0] || "Visit website"}\n\nhttps://www.kmclu.ac.in/`
        );
      } catch {
        return sendReply("Notice fetch failed.");
      }
    }

    // Mongo Search
    const result = await UniversityData.findOne({
      question: { $regex: lowerMessage, $options: "i" },
    });

    if (result) return sendReply(result.answer);

    // 🔥 AI RESPONSE (FIXED LANGUAGE)
    const systemPrompt = `
You are KMCLU University Helpdesk Bot.

IMPORTANT:
- Reply in SAME language as user.
- English → English
- Hindi → Hindi
- Hinglish → Hinglish
- Do NOT mix languages.

Only give KMCLU related answers.

If unknown:
"KMCLU ki official website par iski jaankari uplabdh nahi hai."
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Information not available.";

    return sendReply(reply);
  } catch (err) {
    console.log("❌ Server Error:", err.message);
    res.json({ reply: "Server error." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});