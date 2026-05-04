import { useState, useCallback, useEffect } from 'react';
import { realtimeEngine } from '../services/realtimeEngine';

export function useJarvisEngine() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentMedia, setCurrentMedia] = useState(null);

  const startEngine = useCallback(async () => {
    setIsListening(true);
    await realtimeEngine.start({
      onTranscript: (text) => setTranscript(text),
      onJarvisResponse: (text) => setJarvisResponse(text),
      onStateChange: (state) => {
        setIsListening(state === 'listening');
        setIsProcessing(state === 'thinking');
        setIsJarvisSpeaking(state === 'speaking');
      }
    });
  }, []);

  const stopEngine = useCallback(() => {
    realtimeEngine.stop();
    setIsListening(false);
    setIsProcessing(false);
    setIsJarvisSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      realtimeEngine.stop();
    };
  }, []);

  return {
    isListening,
    isProcessing,
    isJarvisSpeaking,
    transcript,
    jarvisResponse,
    audioLevel,
    currentMedia,
    setCurrentMedia,
    startEngine,
    stopEngine,
    startListening: startEngine,
    stopListening: stopEngine,
    stopTTS: stopEngine,
    handleUserMessage: async (text: string) => {
        setTranscript(text);
        await realtimeEngine.processMessage(text, {
            onTranscript: setTranscript,
            onJarvisResponse: setJarvisResponse,
            onStateChange: (state: any) => {
                setIsListening(state === 'listening');
                setIsProcessing(state === 'thinking');
                setIsJarvisSpeaking(state === 'speaking');
            }
        });
    }
  };
}
