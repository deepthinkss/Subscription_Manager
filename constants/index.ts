export const CATEGORIES = [
  { id: '1', name: 'Streaming', icon: 'Play', color: '#FF6B6B' },
  { id: '2', name: 'Utilities', icon: 'Zap', color: '#FFA500' },
  { id: '3', name: 'Internet', icon: 'Wifi', color: '#4ECDC4' },
  { id: '4', name: 'Insurance', icon: 'Shield', color: '#45B7D1' },
  { id: '5', name: 'Fitness', icon: 'Activity', color: '#96CEB4' },
  { id: '6', name: 'Software', icon: 'Package', color: '#DDA0DD' },
  { id: '7', name: 'Education', icon: 'Book', color: '#F0E68C' },
  { id: '8', name: 'Finance', icon: 'DollarSign', color: '#90EE90' },
  { id: '9', name: 'Healthcare', icon: 'Heart', color: '#FFB6C1' },
  { id: '10', name: 'Entertainment', icon: 'Music', color: '#87CEEB' },
  { id: '11', name: 'Shopping', icon: 'ShoppingBag', color: '#FF69B4' },
  { id: '12', name: 'Other', icon: 'MoreHorizontal', color: '#A9A9A9' },
];

export const BILLING_CYCLES = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
];

export const CURRENCIES = [
  { label: 'Indian Rupee (₹)', value: 'INR' },
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'British Pound (£)', value: 'GBP' },
  { label: 'Australian Dollar (A$)', value: 'AUD' },
  { label: 'Canadian Dollar (C$)', value: 'CAD' },
];

export const PAYMENT_METHODS = [
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'UPI', value: 'upi' },
  { label: 'Net Banking', value: 'net_banking' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cash', value: 'cash' },
];

export const THEME = {
  light: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#EC4899',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  dark: {
    primary: '#3db7e8ff',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#22D3EE',
  },
};

export const REMINDER_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
];

export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  OVERDUE: 'overdue',
  PAYMENT_SUCCESSFUL: 'payment_successful',
  PAYMENT_FAILED: 'payment_failed',
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

export const API_ENDPOINTS = {
  SUBSCRIPTIONS: '/subscriptions',
  BILLS: '/bills',
  CATEGORIES: '/categories',
  PAYMENTS: '/payments',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
};

export const APP_MARGINS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 28,
  xl: 34,
  xxl: 32,
};

export const APP_RADII = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl:40,
  full: 9999,
};

export const ANIMATION_TIMING = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,
};
