const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

class YoutubeService {
  /**
   * Busca el primer video relevante para una consulta y retorna su ID.
   */
  async getFirstVideoId(query: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
      }
      return null;
    } catch (error) {
      console.error('❌ [YouTube API Error]:', error);
      return null;
    }
  }
}

export const youtubeService = new YoutubeService();
