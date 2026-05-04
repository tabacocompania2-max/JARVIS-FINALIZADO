import { logService } from './logService';

const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;

class GrokService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
    if (!this.apiKey) {
      logService.add("⚠️ Warning: Groq API Key is MISSING");
    } else {
      logService.add("✅ Groq API Key loaded");
    }
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
              content: `You are Jarvis, a highly intelligent Bilingual AI Assistant. 
              
              MIRROR RULE:
              - ALWAYS respond in the SAME language the user used in their last message.
              - If the user says "Hola", you MUST respond in Spanish.
              - If the user says "Hello", you MUST respond in English.
              - Only switch to English if the user asks to practice English or starts speaking English.
              
              ACTIONS & TOOLS:
              - If the user asks for music, a song, or a video, you MUST include a tag like this: [YOUTUBE:Search Query]
              - Example: "Sure! Playing some Beatles for you. [YOUTUBE:The Beatles Hey Jude]"
              
              STRICT LANGUAGE CONSISTENCY:
              1. Never mix languages in a single response.
              2. Your identity is a bilingual coach, not just an English teacher.
              3. Be natural, warm, and mirror the user's linguistic choice perfectly.`
            },
            ...history,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error("Invalid API Response");
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      logService.add("❌ Error Groq API");
      throw error;
    }
  }
}

export const grokService = new GrokService();
