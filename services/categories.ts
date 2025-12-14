import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '@/constants';
import type { Category } from '@/types';

const CATEGORIES_KEY = 'categories';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getAllCategoriesFromStorage = async (): Promise<Category[]> => {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading categories from storage:', error);
    return [];
  }
};

const saveCategoriesToStorage = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to storage:', error);
  }
};

export const categoryService = {
  async initializeDefaultCategories(userId: string): Promise<void> {
    try {
      const existing = await getAllCategoriesFromStorage();
      if (existing.length === 0) {
        const defaultCategories = CATEGORIES.map((cat) => ({
          ...cat,
          id: generateId(),
          user_id: userId,
          is_default: true,
          created_at: new Date().toISOString(),
        }));
        await saveCategoriesToStorage(defaultCategories);
      }
    } catch (error) {
      console.error('Initialize default categories error:', error);
    }
  },

  async getAllCategories(userId: string): Promise<Category[]> {
    try {
      const categories = await getAllCategoriesFromStorage();
      return categories
        .filter((c) => !c.user_id || c.user_id === userId)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await getAllCategoriesFromStorage();
      return categories.find((c) => c.id === id) || null;
    } catch (error) {
      console.error('Get category by id error:', error);
      return null;
    }
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> {
    try {
      const categories = await getAllCategoriesFromStorage();
      const newCategory: Category = {
        ...category,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      categories.push(newCategory);
      await saveCategoriesToStorage(categories);
      return newCategory;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const categories = await getAllCategoriesFromStorage();
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) return null;

      categories[index] = {
        ...categories[index],
        ...updates,
      };
      await saveCategoriesToStorage(categories);
      return categories[index];
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await getAllCategoriesFromStorage();
      const filtered = categories.filter((c) => c.id !== id);
      await saveCategoriesToStorage(filtered);
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },
};
