// Mock Supabase client - replaced with localStorage implementation
// This file is kept for backward compatibility but is no longer used

export const supabase = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: null } }),
  },
};

export const initializeSupabaseAuth = () => {
  console.log('Using local storage for authentication');
};
