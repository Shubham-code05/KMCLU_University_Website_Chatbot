const path = require('path');
// Path fix taaki .env backend folder se load ho
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Database Schema
const UniversityData = mongoose.model('UniversityData', new mongoose.Schema({
    source: String,
    content: String,
    embedding: [Number],
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chota pause dene ke liye function (taaki API block na ho)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function runIngestion() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        const filePath = path.join(__dirname, 'university_data.json');
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`🚀 Starting ingestion for ${rawData.length} items. Please wait...`);

        // Model name yahan fix kiya hai
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        for (let i = 0; i < rawData.length; i++) {
            const item = rawData[i];
            
            try {
                // Gemini se embedding lena
                const result = await model.embedContent(item.content);
                const embedding = result.embedding.values;

                // Database mein save karna
                await UniversityData.create({
                    source: item.source,
                    content: item.content,
                    embedding: embedding
                });

                if (i % 5 === 0) console.log(`Progress: ${i}/${rawData.length} items indexed...`);
                
                // Har request ke baad 1 second ka gap (Rate limiting se bachne ke liye)
                await delay(1000); 

            } catch (innerErr) {
                console.error(`❌ Error at item ${i}:`, innerErr.message);
                // Agar kisi ek item mein error aaye toh script ruke nahi
                continue; 
            }
        }

        console.log("🎉 Ingestion Complete! Data is now in MongoDB with AI Embeddings.");
        process.exit();
    } catch (err) {
        console.error("❌ Fatal Error:", err.message);
        process.exit(1);
    }
}

runIngestion();