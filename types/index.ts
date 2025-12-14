export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  user_id?: string;
  is_default: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  next_payment_date: string;
  payment_method: string;
  auto_renewal: boolean;
  logo_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  amount: number;
  currency: string;
  due_date: string;
  payment_method: string;
  is_recurring: boolean;
  recurring_cycle?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  is_paid: boolean;
  paid_at?: string;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  subscription_id?: string;
  bill_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  subscription_id?: string;
  bill_id?: string;
  title: string;
  message: string;
  type: 'reminder' | 'overdue' | 'payment_successful' | 'payment_failed';
  is_read: boolean;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

export interface AppSettings {
  user_id: string;
  currency: string;
  notifications_enabled: boolean;
  reminder_days_before: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_monthly_expense: number;
  upcoming_bills_count: number;
  overdue_bills_count: number;
  active_subscriptions_count: number;
  category_breakdown: {
    category_id: string;
    category_name: string;
    total_amount: number;
    percentage: number;
  }[];
  top_subscriptions: Subscription[];
  monthly_trend: {
    month: string;
    total_expense: number;
  }[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface FormErrors {
  [key: string]: string;
}
