const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Chatbot Server Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const UniversityData = mongoose.model('UniversityData', new mongoose.Schema({
    source: String,
    content: String,
    embedding: [Number],
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helper: Manual Embedding Fetch (To bypass SDK 404 Bug) ---
async function getEmbedding(text) {
    const url = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: text }] }
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    return data.embedding.values;
}

function dotProduct(a, b) {
    return a.map((x, i) => a[i] * (b[i] || 0)).reduce((m, n) => m + n, 0);
}

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Get Embedding using Manual Fetch (v1 force)
        const userEmbedding = await getEmbedding(message);

        const allData = await UniversityData.find({});
        if (allData.length === 0) return res.json({ reply: "Database khali hai!" });

        // 2. Vector Search Logic
        let bestMatch = allData[0];
        let maxSimilarity = -Infinity;

        allData.forEach((doc) => {
            if (doc.embedding && doc.embedding.length === userEmbedding.length) {
                const similarity = dotProduct(userEmbedding, doc.embedding);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    bestMatch = doc;
                }
            }
        });

        // 3. Generate Answer
        const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Aap KMCLU University ke AI assistant hain. 
        Context: ${bestMatch.content}
        Sawal: ${message}`;

        const result = await chatModel.generateContent(prompt);
        res.json({ reply: result.response.text() });

    } catch (error) {
        console.error("❌ Error Detail:", error.message);
        res.status(500).json({ reply: "Bhai, server error! Terminal dekho." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Final Fix Server: http://localhost:${PORT}`));