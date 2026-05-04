import { logService } from './logService';

const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;

class GrokService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
    const prefix = this.apiKey ? this.apiKey.substring(0, 7) : 'NONE';
    logService.add(`✅ Key Loaded: ${prefix}... (len: ${this.apiKey.length})`);
  }

  async chat(message: string, history: any[] = []): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are Jarvis, a professional English Coach and Bilingual AI Assistant. 
              
              CORE MISSION:
              - Your primary goal is to help the user learn and practice English.
              - Even if the user speaks in Spanish, you should encourage English practice.
              
              MIRROR RULE:
              - Respond in the SAME language the user used, but always keep an educational tone.
              
              YOUTUBE ACTION RULES:
              - IMPORTANT: When the user asks for music, songs, or videos, ALWAYS prioritize content in ENGLISH.
              - Search for English-language artists, podcasts, or lessons unless the user explicitly asks for something in Spanish.
              - Tag format: [YOUTUBE:Search Query in English]
              - Example (if user asks for music in Spanish): "¡Claro! Te pondré algo de Ed Sheeran para que practiques tu oído con sus letras. [YOUTUBE:Ed Sheeran Greatest Hits lyrics]"
              
              STRICT LANGUAGE CONSISTENCY:
              1. Never mix languages in a single response.
              2. You are an ELT (English Language Teaching) expert.
              3. Be natural, professional, and ALWAYS prioritize the user's English progress.`
            },
            ...history,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logService.add(`❌ Groq Error ${response.status}: ${errorData.error?.message || 'Unknown'}`);
        throw new Error(`Groq API Error ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error("Invalid API Response");
      }
      
      return data.choices[0].message.content;
    } catch (error: any) {
      if (!error.message.includes("Groq API Error")) {
        logService.add(`❌ Network/Request Error: ${error.message}`);
      }
      throw error;
    }
  }
}

export const grokService = new GrokService();
