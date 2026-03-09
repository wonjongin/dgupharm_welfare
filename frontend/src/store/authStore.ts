import { create } from 'zustand';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  login: (sid: string, name: string) => Promise<void>;
  register: (sid: string, name: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  initialize: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isInitialized: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (sid: string, name: string) => {
    const data = await apiLogin(sid, name);
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.access_token });
  },

  register: async (sid: string, name: string) => {
    const data = await apiRegister(sid, name);
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.access_token });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));
