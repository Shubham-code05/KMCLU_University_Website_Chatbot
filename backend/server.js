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
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

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
    const message = req.body?.message;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        reply: "Please type something.",
      });
    }

    const lowerMessage = message.toLowerCase().trim();

    // Greetings
    if (["hi", "hello", "hlo", "hey"].includes(lowerMessage)) {
      return res.json({
        reply:
          "👋 Welcome to KMCLU Student Helpdesk!\n\nYou can ask me about:\n• Admission\n• Courses\n• BCA / MBA / MCA Fee\n• Hostel\n• Scholarship\n• Exam\n• Result\n• Admit Card\n• Contact Number",
      });
    }

    // Smart keyword matching
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
      lowerMessage.includes("ba") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "ba fee";
    } else if (
      lowerMessage.includes("bcom") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "bcom fee";
    } else if (
      lowerMessage.includes("all") &&
      lowerMessage.includes("fee")
    ) {
      searchText = "all course fee";
    } else if (
      lowerMessage.includes("mba") &&
      (lowerMessage.includes("admission") || lowerMessage.includes("apply"))
    ) {
      searchText = "mba admission";
    } else if (
      lowerMessage.includes("btech") &&
      lowerMessage.includes("admission")
    ) {
      searchText = "btech admission";
    } else if (
      lowerMessage.includes("hostel") &&
      lowerMessage.includes("fee")
    ) {
      searchText = "hostel fee";
    } else if (
      lowerMessage.includes("contact") &&
      lowerMessage.includes("number")
    ) {
      searchText = "contact number";
    } else if (
      lowerMessage.includes("library") &&
      lowerMessage.includes("timing")
    ) {
      searchText = "library timing";
    } else if (lowerMessage.includes("hostel")) {
      searchText = "hostel";
    } else if (lowerMessage.includes("result")) {
      searchText = "result";
    } else if (
      lowerMessage.includes("admit") ||
      lowerMessage.includes("hall ticket")
    ) {
      searchText = "admit card";
    }

    // MongoDB Search
    const result = await UniversityData.findOne({
      question: { $regex: searchText, $options: "i" },
    });

    // If answer found in DB
    if (result) {
      return res.json({
        reply: result.answer,
      });
    }

    // Gemini fallback
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `
You are KMCLU University Helpdesk Bot.

Answer ONLY questions related to KMCLU University.

Official Website: https://www.kmclu.ac.in/

Question: ${lowerMessage}
`;

      const response = await model.generateContent(prompt);
      const reply = response.response.text();

      return res.json({ reply });
    } catch (geminiError) {
      console.log("Gemini Error:", geminiError.message);

      return res.json({
        reply: `I understand you asked about "${message}".

Please ask KMCLU-related questions such as:
• Admission
• Courses
• BCA Fee
• MBA Fee
• MCA Fee
• Hostel
• Scholarship
• Exam
• Result
• Admit Card
• Contact Number

For more details visit:
https://www.kmclu.ac.in/`,
      });
    }
  } catch (error) {
    console.log("❌ Server Error:", error);

    return res.status(500).json({
      reply: "Server Error. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});