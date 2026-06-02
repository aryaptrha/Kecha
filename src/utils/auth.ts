import { supabase, isSupabaseConfigured } from './db';

const ADMIN_EMAIL_KEY = 'kecha_admin_email';
const ADMIN_TOKEN_KEY = 'kecha_admin_token';

export interface AdminUser {
  email: string;
}

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_EMAIL_KEY, data.user.email || '');
          localStorage.setItem(ADMIN_TOKEN_KEY, data.session?.access_token || '');
        }
        return true;
      }
      console.warn('Supabase auth failed:', error);
      return false; // Disable local fallback entirely when Supabase is active
    }

    // High premium local mock login for instant testing (Only active when Supabase is NOT configured)
    if (email === 'admin@kecha.com' && password === 'jkt48kecha') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_EMAIL_KEY, email);
        localStorage.setItem(ADMIN_TOKEN_KEY, 'mock-jwt-token-12345');
      }
      return true;
    }
    return false;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_EMAIL_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const email = localStorage.getItem(ADMIN_EMAIL_KEY);
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (email && token) {
      return { email };
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};
