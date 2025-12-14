import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '@/types';

const SETTINGS_KEY = 'app_settings';

const getDefaultSettings = (userId: string): AppSettings => ({
  user_id: userId,
  currency: 'INR',
  notifications_enabled: true,
  reminder_days_before: 2,
  theme: 'auto',
  language: 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const settingsService = {
  async getSettings(userId: string): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Return default settings if none exist
      const defaultSettings = getDefaultSettings(userId);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    } catch (error) {
      console.error('Get settings error:', error);
      return null;
    }
  },

  async updateSettings(userId: string, updates: Partial<AppSettings>): Promise<AppSettings | null> {
    try {
      let settings = await this.getSettings(userId);
      if (!settings) {
        settings = getDefaultSettings(userId);
      }

      const updated: AppSettings = {
        ...settings,
        ...updates,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  async setCurrency(userId: string, currency: string): Promise<AppSettings | null> {
    return this.updateSettings(userId, { currency });
  },

  async setTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<AppSettings | null> {
    return this.updateSettings(userId, { theme });
  },

  async setNotificationsEnabled(userId: string, enabled: boolean): Promise<AppSettings | null> {
    return this.updateSettings(userId, { notifications_enabled: enabled });
  },

  async setReminderDaysBefore(userId: string, days: number): Promise<AppSettings | null> {
    return this.updateSettings(userId, { reminder_days_before: days });
  },

  async setLanguage(userId: string, language: string): Promise<AppSettings | null> {
    return this.updateSettings(userId, { language });
  },
};
