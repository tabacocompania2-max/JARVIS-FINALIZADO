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

    await audioStreamer.start(async (uri) => {
      if (!this.isRunning || this.isSpeaking) return;

      const text = await groqSTTService.transcribe(uri);

      if (text && text.trim().length > 2) {
        callbacks.onTranscript(text);
        await this.processMessage(text, callbacks);
      }
    });

    callbacks.onStateChange('listening');
  }

  public async processMessage(text: string, callbacks: any) {
    try {
      this.isSpeaking = true;
      callbacks.onStateChange('thinking');

      const response = await grokService.chat(text, []);
      const cleanResponse = await actionService.handleResponseActions(response);

      callbacks.onJarvisResponse(cleanResponse);
      
      console.log('🔊 Speaking:', cleanResponse);

      Speech.stop();
      Speech.speak(cleanResponse, {
        language: 'es-CO',
        onStart: () => callbacks.onStateChange('speaking'),
        onDone: () => {
            this.isSpeaking = false;
            callbacks.onStateChange('listening');
        },
        onError: (e) => {
            console.log('❌ Speech error:', e);
            this.isSpeaking = false;
            callbacks.onStateChange('listening');
        }
      });

    } catch (e) {
      console.log('❌ process error', e);
      this.isSpeaking = false;
      callbacks.onStateChange('listening');
    }
  }

  stop() {
    this.isRunning = false;
    Speech.stop();
    audioStreamer.stop();
  }
}

export const realtimeEngine = new RealtimeEngine();
