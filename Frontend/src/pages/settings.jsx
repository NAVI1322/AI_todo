import React, { useState, useEffect } from 'react';
import { Bell, Moon, Globe, Lock, Mail } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    darkMode: theme === 'dark',
    language: 'en',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await settingsService.getPreferences();
      setSettings({
        emailNotifications: prefs.settings.emailNotifications,
        pushNotifications: prefs.settings.pushNotifications,
        weeklyDigest: prefs.settings.weeklyDigest,
        darkMode: theme === 'dark',
        language: prefs.settings.language
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);

      if (key === 'darkMode') {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      } else {
        // Update backend only for notification and language settings
        await settingsService.updateSettings({
          emailNotifications: key === 'emailNotifications' ? !settings[key] : settings.emailNotifications,
          pushNotifications: key === 'pushNotifications' ? !settings[key] : settings.pushNotifications,
          weeklyDigest: key === 'weeklyDigest' ? !settings[key] : settings.weeklyDigest,
          theme: theme,
          language: settings.language
        });
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
      // Revert the setting if update failed
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Settings
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y dark:divide-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <ToggleItem
              icon={<Mail />}
              title="Email Notifications"
              description="Receive updates about your learning progress"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              disabled={saving}
            />
            <ToggleItem
              icon={<Bell />}
              title="Push Notifications"
              description="Get notified about new lessons and achievements"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              disabled={saving}
            />
            <ToggleItem
              icon={<Mail />}
              title="Weekly Digest"
              description="Receive a summary of your weekly progress"
              checked={settings.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
              disabled={saving}
            />
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h3>
          <div className="space-y-4">
            <ToggleItem
              icon={<Moon />}
              title="Dark Mode"
              description="Toggle dark mode on or off"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ icon, title, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="text-gray-500 dark:text-gray-400 mt-1">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
} 