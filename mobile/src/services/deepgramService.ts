import * as FileSystem from 'expo-file-system';
import axios from 'axios';

class DeepgramService {
  private apiKey: string;
  private apiUrl: string = 'https://api.openai.com/v1/audio/speech';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  async generateSpeech(text: string): Promise<string> {
    try {
      console.log('🔊 Generating speech with OpenAI...');
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'tts-1',
          voice: 'nova',
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      const fileUri = `${FileSystem.cacheDirectory}jarvis_response.mp3`;
      const base64 = Buffer.from(response.data, 'binary').toString('base64');

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileUri;
    } catch (error) {
      console.log('❌ TTS error:', error);
      throw error;
    }
  }
}

export const deepgramService = new DeepgramService();
