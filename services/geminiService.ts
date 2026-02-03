import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { GroundingSource, NewsletterData, CustomSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock data representing newsletters found in a user's Gmail
const MOCK_GMAIL_NEWSLETTERS = [
  { sender: "The Morning Brew", subject: "Nvidia's new chip & Coffee markets", summary: "Nvidia announced the B200 Blackwell chip. Markets reacted positively. Also, coffee prices hit a 30-year high." },
  { sender: "TLDR Tech", subject: "OpenAI's latest model leaks", summary: "Rumors of a new model 'Strawberry' or Q* surfacing in internal testing. Potential reasoning capabilities discussed." },
  { sender: "Substack: Hardware Junkie", subject: "The state of RISC-V in 2024", summary: "Adoption of RISC-V in data centers is accelerating. China leads in implementation." }
];

const fetchGmailNewslettersTool: FunctionDeclaration = {
  name: 'fetch_gmail_newsletters',
  parameters: {
    type: Type.OBJECT,
    description: 'Fetch recent newsletter summaries from the user connected Gmail inbox.',
    properties: {
      days_back: {
        type: Type.NUMBER,
        description: 'Number of days of history to fetch (default is 7).',
      },
    },
    required: ['days_back'],
  },
};

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
  const customContext = customSources.map(cs => `${cs.type === 'url' ? 'Website' : cs.type === 'social' ? 'Social Account' : 'Newsletter name'}: ${cs.value}`).join(', ');

  const sourcesContext = (sourcesList.length > 0 || customSources.length > 0 || isGmailConnected)
    ? `Please prioritize information and news from these specific sources: ${sourcesList.join(', ')}. 
       Additionally, pay special attention to updates from these specific links or entities provided by the user: ${customContext}.
       ${isGmailConnected ? "The user's Gmail is connected. Use the 'fetch_gmail_newsletters' tool to read their recent subscriptions and integrate their unique insights." : ""}`
    : "Search across high-quality reputable news outlets across the web.";

  const prompt = `
    Act as a witty, humorous, and knowledgeable newsletter editor. 
    Your task is to compile a weekly digest for the past 7 days based on the following selected topics: ${themes.join(', ')}.

    ${sourcesContext}

    Guidelines:
    1. **Tone**: Light, refreshing, humorous, but strictly factual. Avoid dry corporate speak.
    2. **Structure**: Catchy Title, Funny Intro, Topic Sections, Fun Fact.
    3. **Formatting**: Markdown (H2 for headers).
    4. **Integration**: If you use data from Gmail, mention it subtly (e.g., "Scanning your inbox, we saw...").

    You MUST use Google Search for general news and the Gmail tool if connected.
  `;

  try {
    const config: any = {
      tools: [{ googleSearch: {} }],
      temperature: 0.7, 
    };

    if (isGmailConnected) {
      config.tools.push({ functionDeclarations: [fetchGmailNewslettersTool] });
    }

    let response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config
    });

    // Handle tool calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      const toolCall = response.functionCalls[0];
      if (toolCall.name === 'fetch_gmail_newsletters') {
        // Execute the tool and send back the results
        const result = { newsletters: MOCK_GMAIL_NEWSLETTERS };
        
        // Final generation with tool result
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ functionCall: toolCall }] },
            { 
              role: 'user', 
              parts: [{ 
                functionResponse: { 
                  name: 'fetch_gmail_newsletters', 
                  id: toolCall.id, 
                  response: { result } 
                } 
              }] 
            }
          ],
          config: { tools: [{ googleSearch: {} }] }
        });
      }
    }

    const content = response.text || "Sorry, I couldn't write the newsletter this time.";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];

    rawChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });

    return {
      content,
      sources: sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i),
      generatedAt: new Date(),
      gmailUsed: isGmailConnected
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
