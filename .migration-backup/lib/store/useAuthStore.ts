'use client';

import { create } from 'zustand';
import { api, setAuthToken } from '../api';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('erp_token') : null;
const storedRefreshToken = typeof window !== 'undefined' ? window.localStorage.getItem('erp_refresh_token') : null;

export const useAuthStore = create<AuthState>((set) => {
  if (storedToken) {
    setAuthToken(storedToken);
  }

  return {
    token: storedToken,
    refreshToken: storedRefreshToken,
    user: null,
    error: null,
    loading: false,
    login: async (email: string, password: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user } = response.data;

        window.localStorage.setItem('erp_token', accessToken);
        window.localStorage.setItem('erp_refresh_token', refreshToken);
        setAuthToken(accessToken);
        set({ token: accessToken, refreshToken, user, loading: false });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to login';
        set({ error: message, loading: false });
        return false;
      }
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('erp_token');
        window.localStorage.removeItem('erp_refresh_token');
      }
      setAuthToken(null);
      set({ token: null, refreshToken: null, user: null, error: null });
    },
    loadProfile: async () => {
      const currentToken = typeof window !== 'undefined' ? window.localStorage.getItem('erp_token') : null;
      if (!currentToken) return;
      try {
        const response = await api.get('/auth/me');
        set({ user: response.data });
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('erp_token');
            window.localStorage.removeItem('erp_refresh_token');
          }
          setAuthToken(null);
          set({ token: null, refreshToken: null, user: null });
        }
      }
    },
  };
});
