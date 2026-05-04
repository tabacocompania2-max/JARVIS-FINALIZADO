import axios from 'axios';

class GroqSTTService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
    this.apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
  }

  async transcribe(uri: string): Promise<string> {
    if (!uri) return '';

    try {
      console.log('📡 Sending to Groq STT');
      
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'es');

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      const text = response.data.text || '';
      console.log('🧠 STT result:', text);
      return text;
    } catch (error: any) {
      console.log('❌ Groq STT error:', error.response?.data || error.message);
      return '';
    }
  }
}

export const groqSTTService = new GroqSTTService();
