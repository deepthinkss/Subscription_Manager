import { create } from 'zustand';
import { billService } from '@/services/bills';
import type { Bill } from '@/types';

interface BillStore {
  bills: Bill[];
  unpaidBills: Bill[];
  paidBills: Bill[];
  loading: boolean;
  error: string | null;
  fetchBills: (userId: string) => Promise<void>;
  fetchUnpaidBills: (userId: string) => Promise<void>;
  fetchPaidBills: (userId: string) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markAsPaid: (id: string, paidAmount?: number) => Promise<void>;
  markAsUnpaid: (id: string) => Promise<void>;
  searchBills: (userId: string, query: string) => Promise<void>;
  reset: () => void;
}

export const useBillStore = create<BillStore>((set) => ({
  bills: [],
  unpaidBills: [],
  paidBills: [],
  loading: false,
  error: null,

  fetchBills: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const bills = await billService.getAllBills(userId);
      set({ bills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bills', loading: false });
      console.error(error);
    }
  },

  fetchUnpaidBills: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const unpaidBills = await billService.getUnpaidBills(userId);
      set({ unpaidBills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch unpaid bills', loading: false });
      console.error(error);
    }
  },

  fetchPaidBills: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const paidBills = await billService.getPaidBills(userId);
      set({ paidBills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch paid bills', loading: false });
      console.error(error);
    }
  },

  addBill: async (bill) => {
    set({ loading: true, error: null });
    try {
      const newBill = await billService.createBill(bill);
      if (newBill) {
        set((state) => ({
          bills: [...state.bills, newBill],
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to add bill', loading: false });
      console.error(error);
    }
  },

  updateBill: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await billService.updateBill(id, updates);
      if (updated) {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? updated : bill)),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to update bill', loading: false });
      console.error(error);
    }
  },

  deleteBill: async (id) => {
    set({ loading: true, error: null });
    try {
      await billService.deleteBill(id);
      set((state) => ({
        bills: state.bills.filter((bill) => bill.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete bill', loading: false });
      console.error(error);
    }
  },

  markAsPaid: async (id, paidAmount) => {
    set({ loading: true, error: null });
    try {
      const updated = await billService.markAsPaid(id, paidAmount);
      if (updated) {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? updated : bill)),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to mark bill as paid', loading: false });
      console.error(error);
    }
  },

  markAsUnpaid: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await billService.markAsUnpaid(id);
      if (updated) {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? updated : bill)),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to mark bill as unpaid', loading: false });
      console.error(error);
    }
  },

  searchBills: async (userId, query) => {
    set({ loading: true, error: null });
    try {
      const bills = await billService.searchBills(userId, query);
      set({ bills, loading: false });
    } catch (error) {
      set({ error: 'Failed to search bills', loading: false });
      console.error(error);
    }
  },

  reset: () => {
    set({ bills: [], unpaidBills: [], paidBills: [], loading: false, error: null });
  },
}));
