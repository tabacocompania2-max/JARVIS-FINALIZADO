import { useState, useEffect } from 'react';
import { grokService } from '../services/grokService';
import { realtimeEngine } from '../audio/realtimeEngine';
import { actionService } from '../services/actionService';
import { deepgramService } from '../services/deepgramService';
import { Audio } from 'expo-av';

export function useSpeechAudio() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('¡Hola! Soy Jarvis. Pulsa el botón para empezar tu clase o escribe algo abajo. ⚡');
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const MAX_HISTORY = 10;

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
    setupAudio();
  }, []);

  const startListening = async () => {
    if (isJarvisSpeaking || isProcessing) return; 
    try {
      setIsListening(true);
      await realtimeEngine.start({
        onTranscript: (text) => setTranscript(text),
        onJarvisResponse: async (text) => {
          const cleanText = await actionService.handleResponseActions(text);
          setJarvisResponse(cleanText);
        },
        onStateChange: (state) => {
          if (state === 'listening') {
            setIsListening(true);
            setIsProcessing(false);
            setIsJarvisSpeaking(false);
          } else if (state === 'thinking') {
            setIsProcessing(true);
          } else if (state === 'speaking') {
            setIsJarvisSpeaking(true);
            setIsProcessing(false);
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    realtimeEngine.stop();
  };

  const handleUserMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    setIsProcessing(true);
    setTranscript(userMessage);
    
    try {
      const newUserHistory = [...history, { role: 'user', content: userMessage }];
      if (newUserHistory.length > MAX_HISTORY) newUserHistory.shift();
      
      const response = await grokService.chat(userMessage, history);
      
      const newHistory = [...newUserHistory, { role: 'assistant', content: response }];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      setHistory(newHistory);

      const cleanResponse = await actionService.handleResponseActions(response);
      setJarvisResponse(cleanResponse);
      
      // Voz de Jarvis
      const audioUrl = await deepgramService.generateSpeech(cleanResponse);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      setIsProcessing(false);
    }
  };

  return {
    isListening, isProcessing, isJarvisSpeaking, transcript, jarvisResponse,
    startListening, stopListening, handleUserMessage
  };
}
