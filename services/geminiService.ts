import { GoogleGenAI } from "@google/genai";
import { GroundingSource, NewsletterData, CustomSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyNewsletter = async (
  themes: string[], 
  preferredSources: string[], 
  customSources: CustomSource[]
): Promise<NewsletterData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const sourcesList = [...preferredSources];
  const customContext = customSources.map(cs => `${cs.type === 'url' ? 'Website' : cs.type === 'social' ? 'Social Account' : 'Newsletter name'}: ${cs.value}`).join(', ');

  const sourcesContext = (sourcesList.length > 0 || customSources.length > 0)
    ? `Please prioritize information and news from these specific sources: ${sourcesList.join(', ')}. 
       Additionally, pay special attention to updates from these specific links or entities provided by the user: ${customContext}.`
    : "Search across high-quality reputable news outlets across the web.";

  const prompt = `
    Act as a witty, humorous, and knowledgeable newsletter editor. 
    Your task is to compile a weekly digest for the past 7 days based on the following selected topics: ${themes.join(', ')}.

    ${sourcesContext}

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

    You MUST use the Google Search tool to find the actual news from the last 7 days and verify updates from the user-provided sources if they are links.
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
    
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];

    rawChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title
        });
      }
    });

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
