import * as Speech from 'expo-speech';
import { logService } from './logService';

const DEEPGRAM_API_KEY = '22074d77b976d229d9dc176fa131214c36b2edee';
// Probamos con Helios que es el más compatible o Asteria
const VOICE_MODEL = 'aura-helios-en'; 

class DeepgramService {
  async generateSpeech(text: string): Promise<string> {
    logService.add(`🔗 Generando voz (${VOICE_MODEL})...`);
    // Añadimos &container=mp3 para asegurar compatibilidad
    return `https://api.deepgram.com/v1/speak?model=${VOICE_MODEL}&text=${encodeURIComponent(text)}&container=mp3`;
  }

  getHeaders() {
    return {
      'Authorization': `Token ${DEEPGRAM_API_KEY}`,
    };
  }

  async speakFallback(text: string) {
    logService.add("🗣️ Fallback: Voz Nativa...");
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  }
}

export const deepgramService = new DeepgramService();
