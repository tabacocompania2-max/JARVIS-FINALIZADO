# Roadmap: Jarvis 3.0 - Realtime Voice Edition

Este documento detalla la migración del sistema actual basado en archivos (Latencia Alta) a un sistema de streaming bidireccional (Latencia < 500ms).

## 1. Cambios de Arquitectura
| Componente | Jarvis 2.0 (Actual) | Jarvis 3.0 (ChatGPT Level) |
| :--- | :--- | :--- |
| **Captura** | Archivos .m4a (expo-av) | Stream PCM crudo (44.1kHz/16bit) |
| **Detección** | Energía básica (JS) | VAD Nativo (C++ / Silero) |
| **Protocolo** | HTTP POST (Rest) | WebSockets / WebRTC (Full Duplex) |
| **TTS** | Archivo completo (Speech) | Audio Chunk Streaming (Buffer) |
| **Interrupción** | Heurística x4 | AEC Nativo con cancelación de fase |

## 2. Dependencias Necesarias
Para manejar audio a bajo nivel necesitamos salir de Expo Go:
- `react-native-live-audio-stream`: Captura de PCM en tiempo real.
- `react-native-audio-buffer`: Reproducción de chunks de audio sin gaps.
- `react-native-webrtc`: (Opcional) Si usamos protocolos P2P.
- `web-vad-react-native`: Detector de voz inteligente.

## 3. Fases de Implementación

### Fase 1: El Pipeline de Entrada (Streaming Mic)
1. Instalar dependencias nativas.
2. Crear `audioStreamer.ts` para capturar el micrófono.
3. Implementar WebSocket con el servidor (Railway).

### Fase 2: El Pipeline de Salida (Streaming TTS)
1. Implementar un "Jitter Buffer" para recibir audio de la IA.
2. Reproducción fluida de buffers sin clics ni silencios entre trozos.

### Fase 3: UI & Visualización (FFT)
1. Integrar `react-native-skia` para una visualización espectral premium.
2. Animaciones fluidas de 60fps basadas en la frecuencia real.

## 4. Próximos Pasos Inmediatos
1. Configurar `eas.json` para builds nativos.
2. Instalar librerías de streaming.
3. Refactorizar `audioService.ts` a modo "Buffer Mode".
