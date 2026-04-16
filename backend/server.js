const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const UniversityData = require("./models/UniversityData");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json()); // ye bahut important hai

// Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("KMCLU Chatbot Backend Running...");
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const message = req.body?.message;

    if (!message) {
      return res.status(400).json({
        reply: "No message received",
      });
    }

    const lowerMessage = message.toLowerCase();

    // MongoDB search
    const result = await UniversityData.findOne({
      question: { $regex: lowerMessage, $options: "i" },
    });

    // Agar MongoDB me answer mil gaya
    if (result) {
      return res.json({ reply: result.answer });
    }

    // Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
You are KMCLU University Helpdesk Bot.

Only answer questions related to KMCLU University such as:
- admission
- fee
- courses
- hostel
- scholarship
- exam
- library
- contact

Student Question: ${lowerMessage}

Give a short, simple and helpful answer.
If the question is not related to KMCLU University, reply:
"Please ask KMCLU related questions only."
`;

    try {
      const response = await model.generateContent(prompt);
      const reply = response.response.text();

      return res.json({ reply });
    } catch (geminiError) {
      console.log("❌ Gemini Error:", geminiError.message);

      return res.json({
        reply:
          "Sorry, AI service is not available right now. Please try Admission, Exam, Fee, Contact, Courses, Hostel, Library or Scholarship.",
      });
    }
  } catch (error) {
    console.log("❌ Server Error:", error);

    return res.status(500).json({
      reply: "Server Error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});