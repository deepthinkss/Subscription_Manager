import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { AnalyticsSummary, Subscription, Bill } from '@/types';

const SUBSCRIPTIONS_KEY = 'subscriptions';
const BILLS_KEY = 'bills';
const CATEGORIES_KEY = 'categories';

export const analyticsService = {
  async getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get data from local storage
      const subscriptionsData = await AsyncStorage.getItem(SUBSCRIPTIONS_KEY);
      const billsData = await AsyncStorage.getItem(BILLS_KEY);
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_KEY);

      const allSubscriptions: Subscription[] = subscriptionsData ? JSON.parse(subscriptionsData) : [];
      const allBills: Bill[] = billsData ? JSON.parse(billsData) : [];
      const categories = categoriesData ? JSON.parse(categoriesData) : [];

      // Filter by userId and date range
      const userSubscriptions = allSubscriptions.filter(
        (s) => s.user_id === userId && s.is_active
      );
      const userBills = allBills.filter(
        (b) =>
          b.user_id === userId &&
          new Date(b.due_date) >= monthStart &&
          new Date(b.due_date) <= monthEnd
      );
      const paidBills = allBills.filter(
        (b) =>
          b.user_id === userId &&
          b.is_paid &&
          b.paid_at &&
          new Date(b.paid_at) >= monthStart &&
          new Date(b.paid_at) <= monthEnd
      );

      const upcomingBills = userBills.filter((b) => !b.is_paid);
      const overdueBills = upcomingBills.filter((b) => new Date(b.due_date) < now);

        const categoryMap = new Map<string, any>(categories.map((c: any) => [c.id, c]));

      const categoryBreakdown = this.getCategoryBreakdown(
        userSubscriptions,
        userBills,
        categoryMap
      );

      const topSubscriptions = userSubscriptions
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      const monthlyTrend = this.getMonthlyTrend(userSubscriptions, userBills, 6);

      return {
        total_monthly_expense: this.calculateTotalExpense(userSubscriptions, userBills),
        upcoming_bills_count: upcomingBills.length,
        overdue_bills_count: overdueBills.length,
        active_subscriptions_count: userSubscriptions.length,
        category_breakdown: categoryBreakdown,
        top_subscriptions: topSubscriptions,
        monthly_trend: monthlyTrend,
      };
    } catch (error) {
      console.error('Get analytics summary error:', error);
      throw error;
    }
  },

  getCategoryBreakdown(
    subscriptions: Subscription[],
    bills: Bill[],
    categoryMap: Map<string, any>
  ) {
    const categoryTotals = new Map<string, number>();

    subscriptions.forEach((sub) => {
      const current = categoryTotals.get(sub.category_id) || 0;
      categoryTotals.set(sub.category_id, current + sub.amount);
    });

    bills.forEach((bill) => {
      const current = categoryTotals.get(bill.category_id) || 0;
      categoryTotals.set(bill.category_id, current + bill.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryTotals.entries()).map(([categoryId, amount]) => ({
      category_id: categoryId,
      category_name: categoryMap.get(categoryId)?.name || 'Unknown',
      total_amount: amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
  },

  calculateTotalExpense(subscriptions: Subscription[], bills: Bill[]): number {
    const subscriptionTotal = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const billTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);
    return subscriptionTotal + billTotal;
  },

  getMonthlyTrend(subscriptions: Subscription[], bills: Bill[], months: number) {
    const trend = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthSubscriptions = subscriptions.filter(
        (s) =>
          new Date(s.created_at) >= monthStart && new Date(s.created_at) <= monthEnd
      );

      const monthBills = bills.filter(
        (b) =>
          new Date(b.due_date) >= monthStart && new Date(b.due_date) <= monthEnd
      );

      const subTotal = monthSubscriptions.reduce((sum, s) => sum + s.amount, 0);
      const billTotal = monthBills.reduce((sum, b) => sum + b.amount, 0);

      trend.push({
        month: format(date, 'MMM yyyy'),
        total_expense: subTotal + billTotal,
      });
    }

    return trend;
  },

  async getCategoryStats(userId: string, categoryId: string) {
    try {
      const subscriptionsData = await AsyncStorage.getItem(SUBSCRIPTIONS_KEY);
      const billsData = await AsyncStorage.getItem(BILLS_KEY);

      const subscriptions: Subscription[] = subscriptionsData ? JSON.parse(subscriptionsData) : [];
      const bills: Bill[] = billsData ? JSON.parse(billsData) : [];

      const userSubscriptions = subscriptions.filter(
        (s) => s.user_id === userId && s.category_id === categoryId && s.is_active
      );
      const userBills = bills.filter((b) => b.user_id === userId && b.category_id === categoryId);

      const subTotal = userSubscriptions.reduce((sum, s) => sum + s.amount, 0);
      const billTotal = userBills.reduce((sum, b) => sum + b.amount, 0);
      const count = userSubscriptions.length + userBills.length;

      return {
        total_amount: subTotal + billTotal,
        item_count: count,
        subscriptions: userSubscriptions,
        bills: userBills,
      };
    } catch (error) {
      console.error('Get category stats error:', error);
      throw error;
    }
  },
};
