import { Audio } from 'expo-av';
import { logService } from '../services/logService';

class AudioStreamer {
  private recording: Audio.Recording | null = null;
  private isRunning: boolean = false;
  private onUriCallback: ((uri: string) => void) | null = null;
  private maxLevelInChunk: number = -160;

  async start(onUri: (uri: string) => void) {
    this.isRunning = true;
    this.onUriCallback = onUri;
    await this.startRecordingCycle();
  }

  private async startRecordingCycle() {
    if (!this.isRunning) return;

    try {
      await Audio.requestPermissionsAsync();
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.MIN,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      });

      // ACTIVAMOS MONITORIZACIÓN DE VOLUMEN
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          if (status.metering > this.maxLevelInChunk) {
            this.maxLevelInChunk = status.metering;
          }
        }
      });

      this.recording = recording;
      await recording.startAsync();
      this.maxLevelInChunk = -160;

      setTimeout(async () => {
        if (this.recording && this.isRunning) {
          try {
            const currentMax = this.maxLevelInChunk;
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            
            if (uri && this.onUriCallback) {
              // Pasamos la URI y el nivel máximo detectado en este trozo
              (this.onUriCallback as any)(uri, currentMax);
            }
          } catch (e) {}
          this.startRecordingCycle();
        }
      }, 2000);

    } catch (error: any) {
      setTimeout(() => this.startRecordingCycle(), 1000);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.recording) {
      try { this.recording.stopAndUnloadAsync(); } catch (e) {}
      this.recording = null;
    }
  }
}

export const audioStreamer = new AudioStreamer();
