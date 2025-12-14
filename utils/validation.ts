import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(100),
  category_id: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  next_payment_date: z.string().min(1, 'Next payment date is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  auto_renewal: z.boolean(),
});

export const billFormSchema = z.object({
  name: z.string().min(1, 'Bill name is required').max(100),
  category_id: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  due_date: z.string().min(1, 'Due date is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  is_recurring: z.boolean(),
  recurring_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']).optional(),
});

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const getFieldError = (
  errors: Record<string, any>,
  fieldName: string
): string | undefined => {
  const error = errors[fieldName];
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return undefined;
};
