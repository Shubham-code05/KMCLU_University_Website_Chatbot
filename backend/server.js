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

    // Smart matching
    let searchText = lowerMessage;

    if (
      lowerMessage.includes("bca") &&
      (lowerMessage.includes("fee") || lowerMessage.includes("fees"))
    ) {
      searchText = "bca fee";
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
    } else if (
      lowerMessage.includes("hostel")
    ) {
      searchText = "hostel";
    } else if (
      lowerMessage.includes("result")
    ) {
      searchText = "result";
    } else if (
      lowerMessage.includes("admit")
    ) {
      searchText = "admit card";
    }

    // MongoDB Search
    const result = await UniversityData.findOne({
      question: { $regex: searchText, $options: "i" },
    });

    if (result) {
      let finalReply = result.answer;

      // Add useful links automatically
      if (
        searchText.includes("admission") ||
        searchText.includes("apply")
      ) {
        finalReply +=
          "\n\n🔗 Admission Link: https://www.kmclu.ac.in/admission/";
      }

      if (
        searchText.includes("exam") ||
        searchText.includes("result") ||
        searchText.includes("notice") ||
        searchText.includes("admit")
      ) {
        finalReply +=
          "\n\n🔗 Notice Link: https://www.kmclu.ac.in/category/notice/";
      }

      if (
        searchText.includes("course") ||
        searchText.includes("bca") ||
        searchText.includes("mba fee") ||
        searchText.includes("mca fee")
      ) {
        finalReply +=
          "\n\n🔗 Courses Link: https://www.kmclu.ac.in/courses/";
      }

      if (searchText.includes("contact")) {
        finalReply +=
          "\n\n🔗 Contact Link: https://www.kmclu.ac.in/contact-us/";
      }

      return res.json({ reply: finalReply });
    }

    // Greetings
    if (["hi", "hello", "hlo", "hey"].includes(lowerMessage)) {
      return res.json({
        reply:
          "👋 Welcome to KMCLU Helpdesk Bot.\n\nYou can ask me about:\n• Admission\n• Courses\n• Fee\n• Hostel\n• Scholarship\n• Exam\n• Library\n• Contact",
      });
    }

    // Gemini fallback
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
You are KMCLU University Helpdesk Bot.

Answer ONLY questions related to KMCLU University.

Official Website: https://www.kmclu.ac.in/

If the question is about:
- admission → include https://www.kmclu.ac.in/admission/
- contact → include https://www.kmclu.ac.in/contact-us/
- courses or fees → include https://www.kmclu.ac.in/courses/
- result, exam, admit card or notice → include https://www.kmclu.ac.in/category/notice/

If the question is not related to KMCLU, reply:
"Please ask only KMCLU University related questions."

Question: ${lowerMessage}
`;

    try {
      const response = await model.generateContent(prompt);
      const reply = response.response.text();

      return res.json({ reply });
    } catch (err) {
      return res.json({
        reply:
          "Sorry, AI service is not available right now. Please ask about Admission, Courses, Fee, Hostel, Exam or Contact.",
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