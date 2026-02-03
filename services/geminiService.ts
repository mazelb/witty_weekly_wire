import { GoogleGenAI } from "@google/genai";
import { GroundingSource, NewsletterData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyNewsletter = async (themes: string[]): Promise<NewsletterData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const prompt = `
    Act as a witty, humorous, and knowledgeable newsletter editor. 
    Your task is to compile a weekly digest for the past 7 days based on the following selected topics: ${themes.join(', ')}.

    Guidelines:
    1. **Tone**: Light, refreshing, humorous, but strictly factual. Avoid dry corporate speak. Make it feel like a smart friend texting you the updates.
    2. **Structure**: 
       - A catchy, pun-filled Title for this week's edition.
       - A brief, funny Intro.
       - Separate sections for each selected topic.
       - For each topic, pick the top 1-2 most significant news stories from the LAST WEEK. 
       - If nothing major happened, mention a smaller interesting tidbit.
       - A "Fun Fact of the Week" at the end.
    3. **Formatting**: Use Markdown. Use H2 (##) for section headers. Use bolding for emphasis.
    4. **Constraints**: Keep it under 800 words total. strictly English.

    You MUST use the Google Search tool to find the actual news from the last 7 days.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7, 
      }
    });

    const content = response.text || "Sorry, I couldn't write the newsletter this time. Writer's block!";
    
    // Extract grounding chunks for sources
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];

    // Simple extraction logic: look for web chunks
    rawChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title
        });
      }
    });

    // Deduplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      content,
      sources: uniqueSources,
      generatedAt: new Date(),
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
