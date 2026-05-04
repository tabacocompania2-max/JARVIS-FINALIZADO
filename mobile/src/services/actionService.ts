import { spotifyService } from './spotifyService';

class ActionService {
  async handleResponseActions(response: string): Promise<string> {
    let cleanResponse = response;

    const spotifyMatch = response.match(/\[SPOTIFY_SEARCH:(.+?)\]/);
    if (spotifyMatch) {
      const query = spotifyMatch[1];
      console.log('🎵 Spotify action detected:', query);
      await spotifyService.playSearch(query);
      cleanResponse = cleanResponse.replace(/\[SPOTIFY_SEARCH:.+?\]/g, '').trim();
    }

    cleanResponse = cleanResponse.replace(/\[ES\]|\[EN\]/g, '').trim();
    return cleanResponse;
  }
}

export const actionService = new ActionService();
