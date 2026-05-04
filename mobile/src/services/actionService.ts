import { Linking } from 'react-native';
import { youtubeService } from './youtubeService';

class ActionService {
  /**
   * Analiza la respuesta de Jarvis y ejecuta acciones.
   * Ahora soporta reproducción directa en YouTube.
   */
  async handleResponseActions(response: string): Promise<string> {
    const lowerResponse = response.toLowerCase();

    if (response.includes('[YOUTUBE:') || lowerResponse.includes('youtube.com')) {
      const query = response.match(/\[YOUTUBE:(.*?)\]/)?.[1] || response.replace(/\[YOUTUBE:.*?\]/g, '').trim();
      
      console.log('🔍 Buscando video directo para:', query);
      const videoId = await youtubeService.getFirstVideoId(query);
      
      const url = videoId 
        ? `https://www.youtube.com/watch?v=${videoId}` 
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      
      console.log('🚀 Reproduciendo video:', url);
      setTimeout(() => {
        Linking.openURL(url).catch(err => console.error("Error al abrir video", err));
      }, 1000);

      return response.replace(/\[YOUTUBE:.*?\]/g, '').trim() || "Playing the best English learning video for you...";
    }

    return response;
  }
}

export const actionService = new ActionService();
