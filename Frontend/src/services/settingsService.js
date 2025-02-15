import api from './api';

export const settingsService = {
  // Get user preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.patch('/preferences/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}; 