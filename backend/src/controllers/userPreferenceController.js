import { UserPreference } from '../models/UserPreference.js';

export const userPreferenceController = {
  // Get user preferences
  async getPreferences(req, res) {
    try {
      const preferences = await UserPreference.findOne({ userId: req.user._id });
      if (!preferences) {
        // Create default preferences if none exist
        const newPreferences = await UserPreference.create({
          userId: req.user._id,
          settings: {
            theme: 'light',
            emailNotifications: true,
            pushNotifications: true,
            weeklyDigest: true,
            language: 'en'
          }
        });
        return res.json(newPreferences);
      }
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update settings
  async updateSettings(req, res) {
    try {
      const { emailNotifications, pushNotifications, weeklyDigest, theme, language } = req.body;
      
      // Find and update preferences, create if doesn't exist
      const preferences = await UserPreference.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: {
            'settings.emailNotifications': emailNotifications,
            'settings.pushNotifications': pushNotifications,
            'settings.weeklyDigest': weeklyDigest,
            'settings.theme': theme,
            'settings.language': language
          }
        },
        { 
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Toggle favorite
  async toggleFavorite(req, res) {
    try {
      const { taskId } = req.body;
      const preferences = await UserPreference.findOne({ userId: req.user._id });
      
      if (!preferences) {
        // Create new preferences with the favorite
        const newPreferences = await UserPreference.create({
          userId: req.user._id,
          favorites: [taskId]
        });
        return res.json(newPreferences);
      }

      const index = preferences.favorites.indexOf(taskId);
      if (index > -1) {
        preferences.favorites.splice(index, 1);
      } else {
        preferences.favorites.push(taskId);
      }
      
      await preferences.save();
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add to recently viewed
  async addToRecent(req, res) {
    try {
      const { itemId, itemType } = req.body;
      const preferences = await UserPreference.findOne({ userId: req.user._id });
      
      if (!preferences) {
        // Create new preferences with the recent item
        const newPreferences = await UserPreference.create({
          userId: req.user._id,
          recentlyViewed: [{
            item: itemId,
            itemType,
            viewedAt: new Date()
          }]
        });
        return res.json(newPreferences);
      }

      // Add new item to the beginning of recentlyViewed
      preferences.recentlyViewed.unshift({
        item: itemId,
        itemType,
        viewedAt: new Date()
      });
      
      // Keep only last 10 items
      preferences.recentlyViewed = preferences.recentlyViewed.slice(0, 10);
      
      await preferences.save();
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}; 