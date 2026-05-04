import * as Speech from 'expo-speech';
import { audioStreamer } from './audioStreamer';
import { groqSTTService } from './groqSTTService';
import { grokService } from './grokService';
import { actionService } from './actionService';

class RealtimeEngine {
  private isRunning = false;
  private isSpeaking = false;

  async start(callbacks: {
    onTranscript: (text: string) => void;
    onJarvisResponse: (text: string) => void;
    onStateChange: (state: 'listening' | 'thinking' | 'speaking') => void;
  }) {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      await audioStreamer.start(async (uri) => {
        if (!this.isRunning || this.isSpeaking) return;

        try {
          const text = await groqSTTService.transcribe(uri);

          if (text && text.trim().length > 2) {
            callbacks.onTranscript(text);
            await this.processMessage(text, callbacks);
          }
        } catch (sttError) {
          console.log('❌ STT pipeline error:', sttError);
          callbacks.onStateChange('listening');
        }
      });

      callbacks.onStateChange('listening');
    } catch (startError) {
      console.log('❌ Engine start error:', startError);
      this.isRunning = false;
    }
  }

  public async processMessage(text: string, callbacks: any) {
    try {
      this.isSpeaking = true;
      callbacks.onStateChange('thinking');

      const response = await grokService.chat(text, []);
      const cleanResponse = await actionService.handleResponseActions(response);

      callbacks.onJarvisResponse(cleanResponse);
      
      console.log('🔊 Speaking:', cleanResponse);

      await Speech.stop();

      await Speech.speak(cleanResponse, {
        language: 'es-CO',
        rate: 1.0,
        pitch: 1.0,
        onStart: () => {
          this.isSpeaking = true;
          callbacks.onStateChange('speaking');
        },
        onDone: () => {
          this.isSpeaking = false;
          callbacks.onStateChange('listening');
        },
        onError: (error) => {
          console.log('❌ TTS Speech error:', error);
          this.isSpeaking = false;
          callbacks.onStateChange('listening');
        }
      });

    } catch (e) {
      console.log('❌ Global process error:', e);
      this.isSpeaking = false;
      callbacks.onStateChange('listening');
    }
  }

  stop() {
    this.isRunning = false;
    this.isSpeaking = false;
    try {
      Speech.stop();
      audioStreamer.stop();
    } catch (e) {
      console.log('⚠️ stop engine error', e);
    }
  }
}

export const realtimeEngine = new RealtimeEngine();
