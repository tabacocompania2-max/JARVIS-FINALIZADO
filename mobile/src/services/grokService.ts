import { logService } from './logService';
import { getAuthToken } from './firebase';

class GrokService {
  private getApiUrl() {
    try {
      return process.env.EXPO_PUBLIC_API_URL || 'https://jarvis-coach-v2-production.up.railway.app';
    } catch (e) {
      return 'https://jarvis-coach-v2-production.up.railway.app';
    }
  }

  async chat(message: string, history: any[] = []): Promise<string> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${this.getApiUrl()}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logService.add(`❌ Server Error ${response.status}: ${errorData.error || 'Unknown'}`);
        throw new Error(`Server API Error ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error: any) {
      logService.add(`❌ Connection Error: ${error.message}`);
      throw error;
    }
  }
}

export const grokService = new GrokService();
