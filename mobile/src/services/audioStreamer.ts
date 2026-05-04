import { Audio } from 'expo-av';

class AudioStreamer {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async start(onData: (uri: string) => void) {
    if (this.isRecording) return;

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.log('❌ Mic permission denied');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    this.isRecording = true;

    const loop = async () => {
      if (!this.isRecording) return;

      try {
        const recording = new Audio.Recording();

        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
        });

        await recording.startAsync();

        setTimeout(async () => {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            console.log('🎤 Audio captured:', uri);

            if (uri) onData(uri);
          } catch (e) {
            console.log('❌ stop error', e);
          }

          loop(); // 🔁 LOOP CONTINUO
        }, 1200); // ⚡ BAJADO DE 4000 → 1200

      } catch (e) {
        console.log('❌ record error', e);
        setTimeout(loop, 500);
      }
    };

    loop();
  }

  stop() {
    this.isRecording = false;
    this.recording?.stopAndUnloadAsync();
  }
}

export const audioStreamer = new AudioStreamer();
