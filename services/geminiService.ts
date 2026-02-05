import { GoogleGenAI } from "@google/genai";
import { GroundingSource, NewsletterData, CustomSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock data representing newsletters found in a user's Gmail
const MOCK_GMAIL_NEWSLETTERS = [
  { sender: "The Morning Brew", subject: "Nvidia's new chip & Coffee markets", summary: "Nvidia announced the B200 Blackwell chip. Markets reacted positively. Also, coffee prices hit a 30-year high." },
  { sender: "TLDR Tech", subject: "OpenAI's latest model leaks", summary: "Rumors of a new model 'Strawberry' or Q* surfacing in internal testing. Potential reasoning capabilities discussed." },
  { sender: "Substack: Hardware Junkie", subject: "The state of RISC-V in 2024", summary: "Adoption of RISC-V in data centers is accelerating. China leads in implementation." }
];

export const generateWeeklyNewsletter = async (
  themes: string[], 
  preferredSources: string[], 
  customSources: CustomSource[],
  isGmailConnected: boolean
): Promise<NewsletterData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const sourcesList = [...preferredSources];
  const customContextStrings = customSources.map(cs => `${cs.type === 'url' ? 'Website' : cs.type === 'social' ? 'Social Account' : 'Newsletter name'}: ${cs.value}`);
  
  // Inject Gmail context directly if connected
  let gmailContext = "";
  if (isGmailConnected) {
    gmailContext = "\n\nCONTEXT FROM USER'S GMAIL INBOX NEWSLETTERS:\n" + 
      MOCK_GMAIL_NEWSLETTERS.map(n => `- From: ${n.sender}, Subject: ${n.subject}, Summary: ${n.summary}`).join('\n');
  }

  const sourcesContext = (sourcesList.length > 0 || customSources.length > 0 || isGmailConnected)
    ? `Please prioritize information and news from these specific sources: ${sourcesList.join(', ')}. 
       Additionally, pay special attention to updates from these specific links or entities provided by the user: ${customContextStrings.join(', ')}.
       ${gmailContext}`
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
    5. **Citations**: If you use information from the Gmail context, mention it (e.g., "Scanning your recent newsletters, we noticed...").

    You MUST use the Google Search tool to find the actual news from the last 7 days and verify updates.
  `;

  try {
    // Note: We use gemini-3-flash-preview which supports googleSearch.
    // Config Rule: When using googleSearch, only googleSearch is permitted. 
    // Mixing googleSearch with functionDeclarations (Function Calling) often results in a 500 error.
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
      gmailUsed: isGmailConnected
    };

  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};
