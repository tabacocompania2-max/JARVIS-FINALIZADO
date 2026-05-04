import axios from 'axios';

class YoutubeService {
  private getApiUrl() {
    return process.env.EXPO_PUBLIC_API_URL || 'https://jarvis-coach-v2-production.up.railway.app';
  }

  /**
   * Busca el primer video relevante para una consulta usando el backend.
   */
  async getFirstVideoId(query: string): Promise<string | null> {
    try {
      console.log('📺 Buscando video en YouTube vía backend:', query);
      
      const response = await axios.get(`${this.getApiUrl()}/api/youtube/search-music`, {
        params: { q: query }
      });
      
      if (response.data.success && response.data.result) {
        return response.data.result.id;
      }
      return null;
    } catch (error) {
      console.error('❌ [YouTube Backend Error]:', error);
      return null;
    }
  }
}

export const youtubeService = new YoutubeService();
