const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const UniversityData = require("./models/UniversityData");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);


// app.use(cors());
// app.use(express.json());

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
    const message = req.body.message.toLowerCase();

    // MongoDB me search karo
    const result = await UniversityData.findOne({
      question: { $regex: message, $options: "i" },
    });

    // Agar MongoDB me mil gaya
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

Student Question: ${message}

Give a short, simple and helpful answer.
If the question is not related to KMCLU University, reply:
"Please ask KMCLU related questions only."
`;

    try {
      const response = await model.generateContent(prompt);
      const reply = response.response.text();

      return res.json({ reply });
    } catch (geminiError) {
      console.log("Gemini Error:", geminiError.message);

      return res.json({
        reply:
          "Sorry, AI service is not available right now. Please try Admission, Exam, Fee, Contact, Courses, Hostel, Library or Scholarship.",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      reply: "Server Error",
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});