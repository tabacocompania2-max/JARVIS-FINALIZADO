import { audioStreamer } from './audioStreamer';
import { sttService } from '../services/sttService';
import { grokService } from '../services/grokService';
import { actionService } from '../services/actionService';
import { logService } from '../services/logService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

class RealtimeEngine {
  private isRunning: boolean = false;
  private isJarvisSpeaking: boolean = false;
  private playbackLock: boolean = false;
  private postTTSBuffer: boolean = false;
  
  // Umbrales de volumen (en dB, -160 a 0)
  private readonly BARGE_IN_THRESHOLD = -20; // Nivel para interrumpir a Jarvis
  private readonly SPEECH_THRESHOLD = -45;   // Nivel mínimo para considerar voz humana

  async start(callbacks: {
    onTranscript: (text: string) => void;
    onJarvisResponse: (text: string) => void;
    onStateChange: (state: any) => void;
  }) {
    if (this.isRunning) this.stop();
    this.isRunning = true;
    logService.add("🏗️ Arquitectura REAL MODE V5.1.0 ON");

    await audioStreamer.start(async (uri: string, level: number) => {
      if (!this.isRunning) return;

      // 1. CAPA DE CONTROL DE TURNOS (PLAYBACK LOCK)
      if (this.postTTSBuffer) return; // Ignoramos el rebote final

      if (this.playbackLock) {
        // ¿Es una interrupción real (Barge-in)?
        if (level > this.BARGE_IN_THRESHOLD) {
          logService.add("💥 INTERRUPCIÓN DETECTADA");
          this.handleBargeIn();
        } else {
          // Es solo eco de Jarvis, ignoramos este trozo de audio
          return;
        }
      }

      // 2. DETECCIÓN DE VOZ HUMANA
      if (level < this.SPEECH_THRESHOLD) return; // Silencio o ruido de fondo bajo

      callbacks.onStateChange('thinking');
      try {
        const text = await sttService.transcribe(uri);
        if (text && text.trim().length > 1) {
          callbacks.onTranscript(text);
          await this.processUserMessage(text, callbacks);
        } else {
          callbacks.onStateChange('listening');
        }
      } catch (e) { callbacks.onStateChange('listening'); }
    });
    callbacks.onStateChange('listening');
  }

  private handleBargeIn() {
    Speech.stop();
    this.isJarvisSpeaking = false;
    this.playbackLock = false;
    this.postTTSBuffer = false;
  }

  private async processUserMessage(text: string, callbacks: any) {
    try {
      const response = await grokService.chat(text, []);
      const cleanResponse = await actionService.handleResponseActions(response);
      logService.add(`🤖 Jarvis: ${cleanResponse.substring(0, 50)}...`);
      callbacks.onJarvisResponse(cleanResponse);

      // Iniciamos TTS con Playback Lock
      this.isJarvisSpeaking = true;
      this.playbackLock = true;
      callbacks.onStateChange('speaking');
      
      const spanishIndicators = /[¿¡ñáéíóú]|(\b(el|la|que|si|no|hola)\b)/i;
      const lang = spanishIndicators.test(cleanResponse) ? 'es-MX' : 'en-US';

      Speech.speak(cleanResponse, {
        language: lang,
        pitch: 1.0,
        rate: 0.95,
        onStart: () => {
          this.playbackLock = true;
        },
        onDone: () => this.endTTS(callbacks),
        onError: () => this.endTTS(callbacks)
      });
    } catch (error) { 
      this.endTTS(callbacks);
    }
  }

  private endTTS(callbacks: any) {
    this.isJarvisSpeaking = false;
    this.playbackLock = false;
    this.postTTSBuffer = true;
    
    // Buffer de 500ms para evitar el eco final antes de reabrir el mic
    setTimeout(() => {
      this.postTTSBuffer = false;
      callbacks.onStateChange('listening');
    }, 500);
  }

  stop() {
    this.isRunning = false;
    this.playbackLock = false;
    this.isJarvisSpeaking = false;
    audioStreamer.stop();
    Speech.stop();
  }
}

export const realtimeEngine = new RealtimeEngine();
