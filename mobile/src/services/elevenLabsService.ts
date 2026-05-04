import * as FileSystem from 'expo-file-system';
import { getAuthToken } from './firebase';

export const elevenLabsService = {
  private_getApiUrl() {
    return process.env.EXPO_PUBLIC_API_URL || 'https://jarvis-coach-v2-production.up.railway.app';
  },

  async textToSpeech(text: string): Promise<string | null> {
    try {
      console.log('💎 Llamando al backend para generar voz (ElevenLabs)...');
      
      const token = await getAuthToken();
      const response = await fetch(`${this.private_getApiUrl()}/api/ai/tts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Backend TTS:', response.status, errorText);
        return null;
      }

      const blob = await response.blob();
      const fileUri = `${FileSystem.cacheDirectory}jarvis_voice.mp3`;
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          resolve(base64data);
        };
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('✅ Voz generada con éxito vía backend');
      return fileUri;
    } catch (error) {
      console.error('❌ Error fatal en TTS backend:', error);
      return null;
    }
  },
};
