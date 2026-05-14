import { apiClient } from './apiClient';

export interface UserReport {
  id: string;
  reporterId: string;
  targetUserId: string;
  reason: string;
  description: string;
  evidencePhotos: string[];
  createdAt: string;
  status: number; // 0: Pending, 1: Resolved, 2: Dismissed
  adminFeedback?: string;
  actionTaken?: string;
  resolvedAt?: string;
}

export const reportService = {
  submitReport: async (targetUserId: string, reason: string, description: string, evidenceFiles?: any[]): Promise<string> => {
    const formData = new FormData();
    formData.append('TargetUserId', targetUserId);
    formData.append('Reason', reason);
    formData.append('Description', description);

    if (evidenceFiles && evidenceFiles.length > 0) {
      evidenceFiles.forEach((file, index) => {
        formData.append('EvidenceFiles', {
          uri: file.uri,
          name: file.name || `evidence_${index}.jpg`,
          type: file.type || 'image/jpeg',
        } as any);
      });
    }

    const response = await apiClient.post('/api/users/report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getMyReports: async (): Promise<UserReport[]> => {
    const response = await apiClient.get('/api/users/reports');
    return response.data.data;
  },
};
