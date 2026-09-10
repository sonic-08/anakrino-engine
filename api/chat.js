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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({ contents });
    const reply = result?.response?.text() || "Sorry, I had trouble generating an answer.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat generation failed:", error);
    return res.status(502).json({ error: error.message || "Failed to generate chat response." });
  }
}
