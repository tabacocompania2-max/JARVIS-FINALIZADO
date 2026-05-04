import axios from 'axios';

class STTService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
    this.apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
  }

  async transcribe(uri: string): Promise<string> {
    try {
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
      });

      return response.data.text || '';
    } catch (error) {
      console.log('❌ STT error:', error);
      return '';
    }
  }
}

export const sttService = new STTService();
