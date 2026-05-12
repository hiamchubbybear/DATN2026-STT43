import axios from 'axios';

const API_BASE_URL = 'https://datn.chessy.dev/api'; // Thay đổi theo môi trường

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const adminApi = {
  getUsers: (page = 1, pageSize = 10) => 
    api.get(`/admin/users?page=${page}&pageSize=${pageSize}`),
  
  banUser: (userId: string, reason: string, until?: string) => 
    api.post(`/admin/users/${userId}/ban`, { reason, until }),
  
  unbanUser: (userId: string) => 
    api.post(`/admin/users/${userId}/unban`),
  
  getReports: () => 
    api.get('/admin/reports'),

  resolveReport: (id: string) =>
    api.post(`/admin/reports/${id}/resolve`),

  getPendingVerifications: () =>
    api.get('/admin/verifications/pending'),

  approveVerification: (id: string) =>
    api.post(`/admin/verifications/${id}/approve`),

  getConfigs: () =>
    api.get('/admin/configs'),

  updateConfig: (key: string, value: string) =>
    api.put(`/admin/configs/${key}`, value, { headers: { 'Content-Type': 'application/json' } }),

  getAuditLogs: () =>
    api.get('/admin/audit-logs'),
  
  getStats: () => 
    api.get('/admin/stats'),
};

export default api;
