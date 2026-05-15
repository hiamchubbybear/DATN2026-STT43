import { create } from 'zustand';

interface NotificationState {
  hasUnreadMessages: boolean;
  hasUnreadMatches: boolean;
  hasUnreadNotifications: boolean;
  setHasUnreadMessages: (value: boolean) => void;
  setHasUnreadMatches: (value: boolean) => void;
  setHasUnreadNotifications: (value: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  hasUnreadMessages: false,
  hasUnreadMatches: false,
  hasUnreadNotifications: false,
  setHasUnreadMessages: (value) => set({ hasUnreadMessages: value }),
  setHasUnreadMatches: (value) => set({ hasUnreadMatches: value }),
  setHasUnreadNotifications: (value) => set({ hasUnreadNotifications: value }),
  clearAll: () => set({ 
    hasUnreadMessages: false, 
    hasUnreadMatches: false, 
    hasUnreadNotifications: false 
  }),
}));
