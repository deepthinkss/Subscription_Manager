import { create } from 'zustand';
import { subscriptionService } from '@/services/subscriptions';
import type { Subscription } from '@/types';

interface SubscriptionStore {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  fetchSubscriptions: (userId: string) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  searchSubscriptions: (userId: string, query: string) => Promise<void>;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],
  loading: false,
  error: null,

  fetchSubscriptions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions(userId);
      set({ subscriptions, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch subscriptions', loading: false });
      console.error(error);
    }
  },

  addSubscription: async (subscription) => {
    set({ loading: true, error: null });
    try {
      const newSubscription = await subscriptionService.createSubscription(subscription);
      if (newSubscription) {
        set((state) => ({
          subscriptions: [...state.subscriptions, newSubscription],
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to add subscription', loading: false });
      console.error(error);
    }
  },

  updateSubscription: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await subscriptionService.updateSubscription(id, updates);
      if (updated) {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => (sub.id === id ? updated : sub)),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to update subscription', loading: false });
      console.error(error);
    }
  },

  deleteSubscription: async (id) => {
    set({ loading: true, error: null });
    try {
      await subscriptionService.deleteSubscription(id);
      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete subscription', loading: false });
      console.error(error);
    }
  },

  searchSubscriptions: async (userId, query) => {
    set({ loading: true, error: null });
    try {
      const subscriptions = await subscriptionService.searchSubscriptions(userId, query);
      set({ subscriptions, loading: false });
    } catch (error) {
      set({ error: 'Failed to search subscriptions', loading: false });
      console.error(error);
    }
  },

  reset: () => {
    set({ subscriptions: [], loading: false, error: null });
  },
}));
