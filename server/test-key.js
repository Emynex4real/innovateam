// server/test-key.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
  const key = process.env.GEMINI_API_KEY;
  console.log("🔑 Testing API Key:", key ? "Found (Starts with " + key.substring(0, 5) + "...)" : "MISSING");

  if (!key) {
    console.error("❌ No API Key found in .env file");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);

  console.log("\n1. 🔍 Listing Available Models for this Key...");
  try {
    // This asks Google: "What models am I allowed to use?"
    // Note: We use a fetch hack because the SDK doesn't always expose listModels easily in older versions
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google API Error:", data.error.message);
      console.log("\n⚠️ SOLUTION: Your API Key is likely invalid or the API is not enabled in Google Cloud.");
      return;
    }

    const models = data.models || [];
    console.log(`✅ Found ${models.length} models.`);
    
    const flashModel = models.find(m => m.name.includes('flash'));
    
    if (flashModel) {
        console.log("   -> Flash Model Found:", flashModel.name);
        
        console.log("\n2. 🧪 Attempting Generation with Flash...");
        const model = genAI.getGenerativeModel({ model: flashModel.name.replace('models/', '') });
        const result = await model.generateContent("Say 'Hello from Gemini'");
        console.log("✅ SUCCESS! Response:", result.response.text());
    } else {
        console.error("❌ No 'Flash' model found in your allowed list.");
        console.log("Available models:", models.map(m => m.name));
    }

  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error.message);
  }
}

testConnection();