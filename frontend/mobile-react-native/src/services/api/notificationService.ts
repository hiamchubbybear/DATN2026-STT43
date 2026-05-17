import { apiClient } from './apiClient';

export type NotificationType = 'match' | 'message' | 'warning' | 'admin' | 'info';

export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  list: async (): Promise<NotificationDto[]> => {
    const res = await apiClient.get('/api/notifications');
    // backend returns ApiResponse<List<Notification>>
    return res.data?.data ?? [];
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/notifications/${id}`);
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.post('/api/notifications/read-all');
    return res.data;
  },
  updateFcmToken: async (fcmToken: string): Promise<any> => {
    const res = await apiClient.post('/api/users/me/fcm-token', { fcmToken });
    return res.data;
  },
};

