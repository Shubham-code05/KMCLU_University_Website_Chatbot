const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
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

    // Greeting
    if (["hi", "hello", "hey", "hlo"].includes(lowerMessage)) {
      return res.json({
        reply:
          "👋 Welcome to KMCLU Student Helpdesk!\n\nYou can ask me about:\n• Admission\n• Courses\n• Fee Structure\n• Hostel\n• Scholarship\n• Exam\n• Result\n• Library\n• Contact Number\n• Vice Chancellor\n• Placement\n• Address",
      });
    }

    // Smart matching
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
      lowerMessage.includes("all") &&
      lowerMessage.includes("fee")
    ) {
      searchText = "all course fee";
    } else if (
      lowerMessage.includes("fee structure") ||
      lowerMessage === "fee"
    ) {
      searchText = "fee structure";
    } else if (
      lowerMessage.includes("mba") &&
      (lowerMessage.includes("admission") ||
        lowerMessage.includes("apply"))
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
    } else if (lowerMessage.includes("contact")) {
      searchText = "contact";
    }

    // MongoDB Search
    const result = await UniversityData.findOne({
      question: { $regex: searchText, $options: "i" },
    });

    // If answer found in MongoDB
    if (result) {
      return res.json({
        reply: result.answer,
      });
    }

    // Groq Fallback
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are the official KMCLU University Helpdesk Bot.

KMCLU full form is Khwaja Moinuddin Chishti Language University, Lucknow.

You must answer any question related to KMCLU University such as:
- Full form
- Location and address
- Vice Chancellor
- Courses and fees
- Admission process
- Eligibility
- Hostel
- Scholarship
- Exam and Result
- Library
- Faculty
- Placement
- Contact details
- Campus information

Official Website: https://www.kmclu.ac.in/

If the question is not related to KMCLU University, reply only:
"Please ask only KMCLU University related questions."
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const reply = completion.choices[0].message.content;

      if (!reply || reply.trim() === "") {
        return res.json({
          reply:
            "Sorry, I could not find information about that KMCLU query.",
        });
      }

      return res.json({
        reply,
      });
    } catch (groqError) {
      console.log("❌ Groq Error:", groqError);

      return res.json({
        reply:
          "Sorry, I am unable to answer right now. Please try again after some time.",
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