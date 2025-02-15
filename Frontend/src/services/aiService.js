import api from './api';

class AIService {
  async sendMessage(message, history = []) {
    try {
      const response = await api.post('/ai-chat/chat', {
        message,
        history
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async generatePath(topic, duration) {
    try {
      const response = await api.post('/paths/generate', { topic, duration });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const aiService = new AIService(); 