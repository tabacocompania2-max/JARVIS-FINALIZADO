import axios from 'axios';
import { getAuthToken } from './firebase';

class GroqSTTService {
  private getApiUrl() {
    return process.env.EXPO_PUBLIC_API_URL || 'https://jarvis-coach-v2-production.up.railway.app';
  }

  async transcribe(uri: string): Promise<string> {
    if (!uri) return '';

    try {
      console.log('📡 Sending audio to backend for transcription...');
      
      const token = await getAuthToken();
      const formData = new FormData();
      
      // En React Native, el FormData espera un objeto con uri, name y type para archivos
      formData.append('file', {
        uri: uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await axios.post(`${this.getApiUrl()}/api/ai/transcribe`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      });

      const text = response.data.text || '';
      console.log('🧠 Transcription received:', text);
      return text;
    } catch (error: any) {
      console.error('❌ Backend Transcription error:', error.response?.data || error.message);
      return '';
    }
  }
}

export const groqSTTService = new GroqSTTService();
