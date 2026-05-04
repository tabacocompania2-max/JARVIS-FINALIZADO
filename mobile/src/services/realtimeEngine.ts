import { Audio } from 'expo-av';
import { audioStreamer } from './audioStreamer';
import { sttService } from './sttService';
import { grokService } from './grokService';
import { actionService } from './actionService';
import { deepgramService } from './deepgramService';

class RealtimeEngine {
  private isRunning = false;
  private isSpeaking = false;
  private sound: Audio.Sound | null = null;

  async start(callbacks: {
    onTranscript: (text: string) => void;
    onJarvisResponse: (text: string) => void;
    onStateChange: (state: 'listening' | 'thinking' | 'speaking') => void;
  }) {
    if (this.isRunning) return;

    this.isRunning = true;

    await audioStreamer.start(async (uri) => {
      if (!this.isRunning || this.isSpeaking) return;

      console.log('📡 Sending to STT');
      const text = await sttService.transcribe(uri);

      if (text && text.trim().length > 2) {
        console.log('🧠 STT result:', text);
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
      const clean = await actionService.handleResponseActions(response);

      callbacks.onJarvisResponse(clean);
      callbacks.onStateChange('speaking');

      const url = await deepgramService.generateSpeech(clean);
      await this.play(url);

    } catch (e) {
      console.log('❌ process error', e);
    } finally {
      this.isSpeaking = false;
      callbacks.onStateChange('listening');
    }
  }

  async play(audioUrl: string) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      this.sound = sound;

      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            resolve(true);
          }
        });
      });

    } catch (e) {
      console.log('❌ audio play error', e);
    }
  }

  stop() {
    this.isRunning = false;
    this.sound?.stopAsync();
    audioStreamer.stop();
  }
}

export const realtimeEngine = new RealtimeEngine();
