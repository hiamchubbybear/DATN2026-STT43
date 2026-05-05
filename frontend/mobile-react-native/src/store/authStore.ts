import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isProfileCompleted: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string, isProfileCompleted?: boolean) => void;
  setProfileStatus: (isCompleted: boolean) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isProfileCompleted: false,
      setAuth: (user, accessToken, refreshToken, isProfileCompleted = false) => set({ 
        user, 
        accessToken, 
        refreshToken, 
        isAuthenticated: true,
        isProfileCompleted
      }),
      setProfileStatus: (isCompleted) => set({ isProfileCompleted: isCompleted }),
      updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false,
        isProfileCompleted: false
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
