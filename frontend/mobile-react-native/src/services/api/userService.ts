import { apiClient } from './apiClient';

export const userService = {
  updateIncognito: async (isIncognito: boolean) => {
    const res = await apiClient.patch('/api/users/me/incognito', { isIncognito });
    return res.data;
  },
  
  updateNotifications: async (settings: { push: boolean, email: boolean, match: boolean, message: boolean }) => {
    const res = await apiClient.patch('/api/settings/notifications', settings);
    return res.data;
  },
};
