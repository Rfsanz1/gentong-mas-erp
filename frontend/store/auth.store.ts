// frontend/store/auth.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) => {
        // Set a lightweight presence cookie so Next.js middleware can detect auth
        if (typeof document !== 'undefined') {
          document.cookie = `gm_auth=1; path=/; max-age=${7 * 24 * 3600}; samesite=strict`;
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'gm_auth=; path=/; max-age=0';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'gentong-mas-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
