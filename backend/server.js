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
    console.log("📩 Request Body:", req.body);

    const message = req.body?.message;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        reply: "Please type something.",
      });
    }

    const lowerMessage = message.toLowerCase().trim();

    // MongoDB Search
    const result = await UniversityData.findOne({
      question: { $regex: lowerMessage, $options: "i" },
    });

    // Agar MongoDB me mil gaya
    if (result) {
      let finalReply = result.answer;

      if (lowerMessage.includes("admission")) {
        finalReply +=
          "\n\n🔗 Admission Link: https://www.kmclu.ac.in/admission/";
      }

      if (
        lowerMessage.includes("exam") ||
        lowerMessage.includes("result") ||
        lowerMessage.includes("notice") ||
        lowerMessage.includes("admit") ||
        lowerMessage.includes("time table")
      ) {
        finalReply +=
          "\n\n🔗 Exam / Notice Link: https://www.kmclu.ac.in/category/notice/";
      }

      if (lowerMessage.includes("contact")) {
        finalReply +=
          "\n\n🔗 Contact Link: https://www.kmclu.ac.in/contact-us/";
      }

      if (
        lowerMessage.includes("course") ||
        lowerMessage.includes("bca") ||
        lowerMessage.includes("bsc") ||
        lowerMessage.includes("ba")
      ) {
        finalReply +=
          "\n\n🔗 Courses Link: https://www.kmclu.ac.in/courses/";
      }

      return res.json({ reply: finalReply });
    }

    // Greeting handle
    if (
      lowerMessage === "hi" ||
      lowerMessage === "hello" ||
      lowerMessage === "hlo" ||
      lowerMessage === "hey"
    ) {
      return res.json({
        reply:
          "👋 Welcome to KMCLU Helpdesk Bot.\n\nYou can ask me about:\n• Admission\n• Courses\n• Fee\n• Hostel\n• Scholarship\n• Exam\n• Library\n• Contact",
      });
    }

    // Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
You are KMCLU University Helpdesk Bot.

You must answer ONLY questions related to KMCLU University.

Important information:
- Official Website: https://www.kmclu.ac.in/
- Admission Page: https://www.kmclu.ac.in/admission/
- Contact Page: https://www.kmclu.ac.in/contact-us/
- Courses Page: https://www.kmclu.ac.in/courses/
- Exam / Notice Page: https://www.kmclu.ac.in/category/notice/

Rules:
1. Answer only about KMCLU University.
2. Give detailed but simple answers.
3. Use bullet points if needed.
4. If the user asks about admission, include the admission link.
5. If the user asks about exam, result, notice, timetable or admit card, include the exam link.
6. If the user asks about courses, include the courses link.
7. If the user asks about contact, include the contact link.
8. If the question is not related to KMCLU, say:
"Please ask only KMCLU University related questions."

Student Question: ${lowerMessage}
`;

    try {
      const response = await model.generateContent(prompt);
      const reply = response.response.text();

      let finalReply = reply;

      if (lowerMessage.includes("admission")) {
        finalReply +=
          "\n\n🔗 Admission Link: https://www.kmclu.ac.in/admission/";
      }

      if (
        lowerMessage.includes("exam") ||
        lowerMessage.includes("result") ||
        lowerMessage.includes("notice") ||
        lowerMessage.includes("admit") ||
        lowerMessage.includes("time table")
      ) {
        finalReply +=
          "\n\n🔗 Exam / Notice Link: https://www.kmclu.ac.in/category/notice/";
      }

      if (lowerMessage.includes("contact")) {
        finalReply +=
          "\n\n🔗 Contact Link: https://www.kmclu.ac.in/contact-us/";
      }

      if (
        lowerMessage.includes("course") ||
        lowerMessage.includes("bca") ||
        lowerMessage.includes("bsc") ||
        lowerMessage.includes("ba")
      ) {
        finalReply +=
          "\n\n🔗 Courses Link: https://www.kmclu.ac.in/courses/";
      }

      return res.json({ reply: finalReply });
    } catch (geminiError) {
      console.log("❌ Gemini Error:", geminiError);

      return res.json({
        reply:
          "Sorry, AI service is not available right now.\n\nYou can still ask about:\n• Admission\n• Exam\n• Fee\n• Contact\n• Courses\n• Hostel\n• Library\n• Scholarship",
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