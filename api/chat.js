import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "GEMINI_API_KEY is not configured on the server. Please add it to your environment variables." 
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const contents = body?.contents;
  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Invalid contents array provided.' });
  }

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  for (let i = 0; i < fallbackModels.length; i++) {
    const currentModelName = fallbackModels[i];
    try {
      const model = genAI.getGenerativeModel({ model: currentModelName });
      const result = await model.generateContent({ contents });
      const reply = result?.response?.text() || "Sorry, I had trouble generating an answer.";
      return res.status(200).json({ reply });
    } catch (error) {
      console.warn(`Chat inference failed on ${currentModelName}:`, error.message);
      if (i === fallbackModels.length - 1) {
        return res.status(502).json({ error: error.message || "Failed to generate chat response." });
      }
    }
  }
}
