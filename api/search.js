import { GoogleGenerativeAI } from "@google/generative-ai";

const fallbackModels = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

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

  const query = body?.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required.' });
  }

  const prompt = `
    You are the core engine for 'Anakrino', a premium directory of AI tools.
    The user is searching for: "${query}"
    
    Search the live web and find the top 4 to 6 AI platforms that best fit this request.
    Use a natural, helpful, and expert tone—like a professional tech reviewer explaining it to a friend.
    
    You MUST respond ONLY with a valid JSON array of objects. Do not include any markdown wrappers like \`\`\`json.
    
    Each object must strictly follow this exact structure:
    [
      {
        "name": "Name of the AI Tool",
        "tagline": "A punchy, 10-word maximum tagline explaining what it does best.",
        "description": "A helpful 3-4 sentence paragraph explaining how it works, its best features, and who it is best for.",
        "pricing": "Open Source, Free, Freemium, or Paid",
        "category": "e.g., Video, Coding, Design, Writing",
        "pros": ["Great feature 1", "Great feature 2", "Great feature 3"],
        "cons": ["Limitation 1", "Limitation 2"],
        "url": "The official website URL"
      }
    ]
  `;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (let i = 0; i < fallbackModels.length; i++) {
    const currentModelName = fallbackModels[i];
    try {
      const model = genAI.getGenerativeModel({
        model: currentModelName,
        tools: [{ googleSearch: {} }]
      });

      const result = await model.generateContent(prompt);
      let textResponse = result.response.text();
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

      const toolData = JSON.parse(textResponse);
      return res.status(200).json(toolData);
    } catch (error) {
      console.warn(`Search inference failed on ${currentModelName}:`, error.message);
      if (i === fallbackModels.length - 1) {
        return res.status(502).json({
          error: "Failed to synthesize platform data from inference models: " + error.message
        });
      }
    }
  }
}
