import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Subscription } from '@/types';

const SUBSCRIPTIONS_KEY = 'subscriptions';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getAllSubscriptionsFromStorage = async (): Promise<Subscription[]> => {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading subscriptions from storage:', error);
    return [];
  }
};

const saveSubscriptionsToStorage = async (subscriptions: Subscription[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Error saving subscriptions to storage:', error);
  }
};

export const subscriptionService = {
  async getAllSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      return subscriptions
        .filter((s) => s.user_id === userId && s.is_active)
        .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());
    } catch (error) {
      console.error('Get subscriptions error:', error);
      return [];
    }
  },

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      return subscriptions.find((s) => s.id === id) || null;
    } catch (error) {
      console.error('Get subscription by id error:', error);
      return null;
    }
  },

  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      const newSubscription: Subscription = {
        ...subscription,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      subscriptions.push(newSubscription);
      await saveSubscriptionsToStorage(subscriptions);
      return newSubscription;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  },

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      const index = subscriptions.findIndex((s) => s.id === id);
      if (index === -1) return null;

      subscriptions[index] = {
        ...subscriptions[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await saveSubscriptionsToStorage(subscriptions);
      return subscriptions[index];
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  },

  async deleteSubscription(id: string): Promise<void> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      const index = subscriptions.findIndex((s) => s.id === id);
      if (index !== -1) {
        subscriptions[index].is_active = false;
        subscriptions[index].updated_at = new Date().toISOString();
        await saveSubscriptionsToStorage(subscriptions);
      }
    } catch (error) {
      console.error('Delete subscription error:', error);
      throw error;
    }
  },

  async searchSubscriptions(userId: string, query: string): Promise<Subscription[]> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      return subscriptions
        .filter((s) => s.user_id === userId && s.is_active && s.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());
    } catch (error) {
      console.error('Search subscriptions error:', error);
      return [];
    }
  },

  async getSubscriptionsByCategory(userId: string, categoryId: string): Promise<Subscription[]> {
    try {
      const subscriptions = await getAllSubscriptionsFromStorage();
      return subscriptions.filter((s) => s.user_id === userId && s.category_id === categoryId && s.is_active);
    } catch (error) {
      console.error('Get subscriptions by category error:', error);
      return [];
    }
  },

  subscribeToSubscriptions(userId: string, callback: (subscriptions: Subscription[]) => void) {
    // Mock subscription - just call the callback immediately
    this.getAllSubscriptions(userId).then(callback);
    
    return {
      unsubscribe: () => {},
    };
  },
};
