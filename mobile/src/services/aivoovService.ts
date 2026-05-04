import * as FileSystem from 'expo-file-system';
import { logService } from './logService';

const AIVOOV_API_KEY = '';
const AIVOOV_API_URL = 'https://aivoov.com/api/v8/create';

// Usamos el ID estándar de la documentación de AiVOOV
const VOICE_ID = 'a9c6e858-cbcb-4380-91e5-21cea93be41f'; 

class AivoovService {
  async generateSpeech(text: string): Promise<string> {
    logService.add(`🎤 Solicitando voz (${VOICE_ID.substring(0,8)})...`);
    
    try {
      const details: any = {
        'voice_id[]': VOICE_ID,
        'transcribe_text[]': text,
        'transcribe_ssml_pitch_rate[]': 'default',
        'transcribe_ssml_spk_rate[]': 'default',
      };

      let formBody: any = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      const response = await fetch(AIVOOV_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': AIVOOV_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
      });

      const data = await response.json();
      
      if (!data.status || !data.audio) {
        logService.add(`❌ AiVOOV: ${data.message || 'Error'}`);
        // Si la voz no existe, lanzamos error para que salte el fallback nativo
        throw new Error(data.message || "Voice unavailable");
      }

      logService.add("💾 Procesando audio...");
      
      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
      const filename = `${cacheDir}jarvis_voice_aivoov.mp3`;
      
      await FileSystem.writeAsStringAsync(filename, data.audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      logService.add("✅ Voz AiVOOV lista");
      return filename;
    } catch (error: any) {
      logService.add(`❌ Error AiVOOV: ${error.message}`);
      throw error;
    }
  }
}

export const aivoovService = new AivoovService();
