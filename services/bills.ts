import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Bill } from '@/types';

const BILLS_KEY = 'bills';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getAllBillsFromStorage = async (): Promise<Bill[]> => {
  try {
    const data = await AsyncStorage.getItem(BILLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading bills from storage:', error);
    return [];
  }
};

const saveBillsToStorage = async (bills: Bill[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error('Error saving bills to storage:', error);
  }
};

export const billService = {
  async getAllBills(userId: string): Promise<Bill[]> {
    try {
      const bills = await getAllBillsFromStorage();
      return bills
        .filter((b) => b.user_id === userId)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    } catch (error) {
      console.error('Get bills error:', error);
      return [];
    }
  },

  async getUnpaidBills(userId: string): Promise<Bill[]> {
    try {
      const bills = await getAllBillsFromStorage();
      return bills
        .filter((b) => b.user_id === userId && !b.is_paid)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    } catch (error) {
      console.error('Get unpaid bills error:', error);
      return [];
    }
  },

  async getPaidBills(userId: string): Promise<Bill[]> {
    try {
      const bills = await getAllBillsFromStorage();
      return bills
        .filter((b) => b.user_id === userId && b.is_paid)
        .sort((a, b) => {
          const dateA = new Date(a.paid_at || 0).getTime();
          const dateB = new Date(b.paid_at || 0).getTime();
          return dateB - dateA;
        });
    } catch (error) {
      console.error('Get paid bills error:', error);
      return [];
    }
  },

  async getBillById(id: string): Promise<Bill | null> {
    try {
      const bills = await getAllBillsFromStorage();
      return bills.find((b) => b.id === id) || null;
    } catch (error) {
      console.error('Get bill by id error:', error);
      return null;
    }
  },

  async createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill | null> {
    try {
      const bills = await getAllBillsFromStorage();
      const newBill: Bill = {
        ...bill,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      bills.push(newBill);
      await saveBillsToStorage(bills);
      return newBill;
    } catch (error) {
      console.error('Create bill error:', error);
      throw error;
    }
  },

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    try {
      const bills = await getAllBillsFromStorage();
      const index = bills.findIndex((b) => b.id === id);
      if (index === -1) return null;

      bills[index] = {
        ...bills[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await saveBillsToStorage(bills);
      return bills[index];
    } catch (error) {
      console.error('Update bill error:', error);
      throw error;
    }
  },

  async markAsPaid(billId: string, paidAmount?: number): Promise<Bill | null> {
    try {
      const bills = await getAllBillsFromStorage();
      const index = bills.findIndex((b) => b.id === billId);
      if (index === -1) return null;

      bills[index] = {
        ...bills[index],
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_amount: paidAmount,
        updated_at: new Date().toISOString(),
      };
      await saveBillsToStorage(bills);
      return bills[index];
    } catch (error) {
      console.error('Mark bill as paid error:', error);
      throw error;
    }
  },

  async markAsUnpaid(billId: string): Promise<Bill | null> {
    try {
      const bills = await getAllBillsFromStorage();
      const index = bills.findIndex((b) => b.id === billId);
      if (index === -1) return null;

      bills[index] = {
        ...bills[index],
        is_paid: false,
        paid_at: undefined,
        paid_amount: undefined,
        updated_at: new Date().toISOString(),
      };
      await saveBillsToStorage(bills);
      return bills[index];
    } catch (error) {
      console.error('Mark bill as unpaid error:', error);
      throw error;
    }
  },

  async deleteBill(id: string): Promise<void> {
    try {
      const bills = await getAllBillsFromStorage();
      const filtered = bills.filter((b) => b.id !== id);
      await saveBillsToStorage(filtered);
    } catch (error) {
      console.error('Delete bill error:', error);
      throw error;
    }
  },

  async searchBills(userId: string, query: string): Promise<Bill[]> {
    try {
      const bills = await getAllBillsFromStorage();
      return bills
        .filter((b) => b.user_id === userId && b.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    } catch (error) {
      console.error('Search bills error:', error);
      return [];
    }
  },
};
