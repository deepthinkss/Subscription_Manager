import * as Notifications from 'expo-notifications';
import type { Notification } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Request permissions error:', error);
      return false;
    }
  },

  async scheduleNotification(
    title: string,
    body: string,
    seconds: number = 60,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          type: 'time' as any,
          seconds,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      throw error;
    }
  },

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  },

  async getAllNotifications(userId: string): Promise<Notification[]> {
    try {
      return [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  },

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      return [];
    } catch (error) {
      console.error('Get unread notifications error:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      return;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      return;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification | null> {
    try {
      return null;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      return;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      return;
    } catch (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  },

  onNotificationReceived(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  onNotificationResponse(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
