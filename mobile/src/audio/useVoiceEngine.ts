import { useRef } from 'react';

export const useVoiceEngine = (callbacks: { 
  onTriggerSTT: () => void, 
  onStopTTS: () => void 
}) => {
  const state = useRef({
    isAssistantSpeaking: false,
    isUserSpeaking: false,
    playbackLock: false,
    postTTSBuffer: false,
    noiseFloor: 0.001,
    dynamicThreshold: 0.003,
    echoLevel: 0,
    bargeInTime: 0,
    silenceTime: 0,
  });

  // 🎤 MAIN AUDIO LOOP
  const onAudioFrame = (rawLevel: number) => {
    if (rawLevel === undefined) return;

    const s = state.current;

    // 🔻 Atenuación fuerte durante TTS (0.15 como pediste)
    const level = s.isAssistantSpeaking ? rawLevel * 0.15 : rawLevel;

    // 🚫 Bloqueo total post TTS
    if (s.postTTSBuffer) return;

    // 🧠 Actualizar ruido base (Más sensible)
    if (!s.isUserSpeaking && !s.isAssistantSpeaking) {
      s.noiseFloor = s.noiseFloor * 0.9 + level * 0.1;
      s.dynamicThreshold = Math.max(0.003, s.noiseFloor * 1.2);
    }

    // 🔁 Seguimiento continuo del eco (Menos exigente)
    if (s.isAssistantSpeaking) {
      s.echoLevel = s.echoLevel * 0.8 + level * 0.2;
    } else {
      s.echoLevel *= 0.6;
    }

    // 🔒 MODO BLOQUEADO (TTS activo)
    if (s.playbackLock) {
      handleBargeIn(level);
      return;
    }

    // 🎤 DETECCIÓN NORMAL DE VOZ
    if (
      level > s.dynamicThreshold &&
      level > s.echoLevel * 1.6
    ) {
      startUserSpeech();
    }
  };

  // 🎤 INICIO VOZ USUARIO
  const startUserSpeech = () => {
    const s = state.current;
    if (!s.isUserSpeaking) {
      console.log('🎤 USER START');
      s.isUserSpeaking = true;
      s.silenceTime = 0;
    }
  };

  // 🤫 SILENCIO DETECTOR (Llamado desde un intervalo externo o el mismo loop)
  const handleSilence = (deltaMs: number) => {
    const s = state.current;
    if (!s.isUserSpeaking) return;

    s.silenceTime += deltaMs;

    if (s.silenceTime > 800) {
      console.log('🧠 USER END');
      s.isUserSpeaking = false;
      callbacks.onTriggerSTT();
    }
  };

  // 🔊 INICIO TTS
  const startTTS = () => {
    const s = state.current;
    s.isAssistantSpeaking = true;
    s.playbackLock = true;
    s.echoLevel = 0;
    console.log('🔊 TTS START');
  };

  // 🔚 FIN TTS
  const endTTS = () => {
    const s = state.current;
    console.log('🔇 TTS END');
    s.postTTSBuffer = true;

    setTimeout(() => {
      s.isAssistantSpeaking = false;
      s.playbackLock = false;
      s.postTTSBuffer = false;
      // decay en vez de reset
      s.echoLevel *= 0.6;
    }, 500);
  };

  // 💥 INTERRUPCIÓN (BARGE-IN)
  const handleBargeIn = (level: number) => {
    const s = state.current;
    if (
      level > s.echoLevel * 4 &&
      level > 0.02
    ) {
      s.bargeInTime += 30;
      if (s.bargeInTime > 200) {
        console.log('💥 BARGE-IN TRIGGERED');
        callbacks.onStopTTS();
        s.playbackLock = false;
        s.isAssistantSpeaking = false;
        startUserSpeech();
      }
    } else {
      s.bargeInTime = Math.max(0, s.bargeInTime - 15);
    }
  };

  return {
    onAudioFrame,
    startTTS,
    endTTS,
    handleSilence,
    state: s => s, // Para lectura si es necesario
    resetSilence: () => { state.current.silenceTime = 0; }
  };
};
