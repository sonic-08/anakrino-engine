import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const fallbackModels = [
  "gemini-3.5-flash",       
  "gemini-3.1-flash-lite",  
  "gemini-2.5-flash"        
];

export async function searchWithAnakrino(query) {
  if (!apiKey) {
    throw new Error("API key is missing! Please check your .env file.");
  }

  // UPDATED PROMPT: Natural, expert, approachable tone
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

  for (let i = 0; i < fallbackModels.length; i++) {
    const currentModelName = fallbackModels[i];
    
    try {
      console.log(`Routing prompt through inference model: ${currentModelName}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: currentModelName,
        tools: [{ googleSearch: {} }] 
      });

      const result = await model.generateContent(prompt);
      let textResponse = result.response.text();
      
      // Clean up the response
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const toolData = JSON.parse(textResponse);
      return toolData;

    } catch (error) {
      console.warn(`Inference failed on ${currentModelName}. Error:`, error.message);
      
      if (i === fallbackModels.length - 1) {
        console.error("All inference node fallbacks exhausted.");
        throw new Error("Failed to synthesize platform data. Please adjust your prompt and retry.");
      }
    }
  }
}