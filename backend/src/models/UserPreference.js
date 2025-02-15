import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  recentlyViewed: [{
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'recentlyViewed.itemType' },
    itemType: { type: String, enum: ['Task', 'Path'] },
    viewedAt: { type: Date, default: Date.now }
  }],
  settings: {
    theme: { type: String, default: 'light' },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  }
}, {
  timestamps: true
});

export const UserPreference = mongoose.model('UserPreference', userPreferenceSchema); 