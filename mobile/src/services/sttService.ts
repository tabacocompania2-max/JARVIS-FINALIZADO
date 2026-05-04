import * as FileSystem from 'expo-file-system';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { logService } from './logService';

const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;
const GROK_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

class STTService {
  async transcribe(uri: string): Promise<string | null> {
    try {
      logService.add("🌐 Escuchando multilingüe...");
      
      const response = await uploadAsync(
        GROK_STT_URL,
        uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          parameters: { 
            model: 'whisper-large-v3-turbo',
            // ELIMINADO: language: 'en' 
            // Ahora Whisper detectará automáticamente si hablas español o inglés
          },
          headers: { 
            'Authorization': `Bearer ${GROK_API_KEY}`,
          },
        }
      );

      if (response.status !== 200) {
        logService.add(`❌ Error STT: ${response.status}`);
        return null;
      }

      const data = JSON.parse(response.body);
      const text = data.text || null;
      if (text) logService.add(`💬 User: ${text}`);
      return text;
    } catch (error: any) {
      logService.add(`❌ Error: ${error.message}`);
      return null;
    }
  }
}

export const sttService = new STTService();
