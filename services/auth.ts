import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

// Mock user for demonstration
const MOCK_USER_ID = 'local-user-123';
const CURRENT_USER_KEY = 'current_user';

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<User | null> {
    try {
      // Create a local user object
      const user: User = {
        id: MOCK_USER_ID,
        email,
        name,
        currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store user data locally
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      // Initialize default categories
      const defaultCategories = [
        { id: '1', name: 'Utilities', icon: 'zap', color: '#FF6B6B', is_default: true, created_at: new Date().toISOString() },
        { id: '2', name: 'Entertainment', icon: 'film', color: '#4ECDC4', is_default: true, created_at: new Date().toISOString() },
        { id: '3', name: 'Food', icon: 'utensils', color: '#FFE66D', is_default: true, created_at: new Date().toISOString() },
        { id: '4', name: 'Transport', icon: 'car', color: '#A29BFE', is_default: true, created_at: new Date().toISOString() },
        { id: '5', name: 'Health', icon: 'heart', color: '#FF7675', is_default: true, created_at: new Date().toISOString() },
      ];

      await AsyncStorage.setItem('categories', JSON.stringify(defaultCategories));

      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      // Create a simple session
      const user: User = {
        id: MOCK_USER_ID,
        email,
        name: email.split('@')[0],
        currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      // Just a mock - in a real app this would send an email
      console.log('Password reset email would be sent to:', email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userData) return null;

      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },

  async deleteAccount(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      await AsyncStorage.removeItem('bills');
      await AsyncStorage.removeItem('subscriptions');
      await AsyncStorage.removeItem('categories');
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    // Mock subscription - just return a dummy unsubscribe function
    const checkAuth = async () => {
      const user = await this.getCurrentUser();
      callback(user);
    };

    checkAuth();

    return {
      unsubscribe: () => {},
    };
  },
};
