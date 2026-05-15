import axios from 'axios';

const API_BASE_URL = 'http://localhost:5017/api'; // Corrected port to match launchSettings.json

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),

  getUsers: (params: { search?: string; status?: 'Active' | 'Suspended' | 'Banned' | 'ShadowBanned'; page?: number; pageSize?: number }) =>
    api.get('/admin/users', { params }),

  createUser: (data: any) =>
    api.post('/admin/users', data),

  getUserDetails: (userId: string) =>
    api.get(`/admin/users/${userId}`),

  moderateUser: (userId: string, action: 'Ban' | 'Unban' | 'Suspend' | 'ShadowBan' | 'Restore', reason: string, durationDays?: number) =>
    api.post(`/admin/users/${userId}/moderate`, { action, reason, durationDays }),

  forceLogoutUser: (userId: string) =>
    api.post(`/admin/users/${userId}/force-logout`),

  getHealth: () =>
    api.get('/admin/health'),

  getSystemInfo: () =>
    api.get('/admin/monitoring/system-info'),

  getLogs: (count = 50) =>
    api.get(`/admin/monitoring/logs?count=${count}`),

  banUser: (userId: string, reason: string, until?: string) => 
    api.post(`/admin/users/${userId}/ban`, { reason, until }),
  
  unbanUser: (userId: string) => 
    api.post(`/admin/users/${userId}/unban`),
  
  getReports: () => 
    api.get('/admin/reports'),

  resolveReport: (id: string, data: { adminFeedback?: string; banUser: boolean; banReason?: string; banUntil?: string }) =>
    api.post(`/admin/reports/${id}/resolve`, data),

  dismissReport: (id: string) =>
    api.post(`/admin/reports/${id}/dismiss`),

  deletePhoto: (userId: string, photoId: string) =>
    api.delete(`/admin/users/${userId}/photos/${photoId}`),

  getPendingVerifications: () =>
    api.get('/admin/verifications/pending'),

  approveVerification: (id: string) =>
    api.post(`/admin/verifications/${id}/approve`),

  rejectVerification: (id: string, reason: string) =>
    api.post(`/admin/verifications/${id}/reject`, { reason }),

  getAppReviews: () =>
    api.get('/admin/reviews'),

  replyToReview: (id: string, reply: string) =>
    api.post(`/admin/reviews/${id}/reply`, { reply }),

  getConfigs: () =>
    api.get('/admin/configs'),

  updateConfig: (key: string, value: string) =>
    api.put(`/admin/configs/${key}`, JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } }),

  getAuditLogs: () =>
    api.get('/admin/audit-logs'),
  
  getStats: () => 
    api.get('/admin/stats'),

  getAdvancedStats: () =>
    api.get('/admin/stats/advanced'),

  sendNotification: (userId: string, title: string, content: string) =>
    api.post(`/admin/users/${userId}/notify`, { title, content }),

  quickBan: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/quick-ban`, { reason }),

  broadcast: (title: string, content: string) =>
    api.post('/admin/broadcast', { title, content }),
};

export default api;
