import { apiClient } from './apiClient';

export enum VerificationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export interface UserVerification {
  id: string;
  userId: string;
  idNumber: string;
  fullName: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  status: VerificationStatus;
  rejectReason?: string;
  createdAt: string;
}

export const verificationService = {
  submitVerification: async (data: {
    idNumber: string;
    fullName: string;
    frontImage: any;
    backImage: any;
    selfieImage: any;
  }) => {
    const formData = new FormData();
    formData.append('IdNumber', data.idNumber);
    formData.append('FullName', data.fullName);
    
    formData.append('FrontImage', {
      uri: data.frontImage.uri,
      name: 'front.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('BackImage', {
      uri: data.backImage.uri,
      name: 'back.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('SelfieImage', {
      uri: data.selfieImage.uri,
      name: 'selfie.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await apiClient.post('/api/users/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getVerificationStatus: async (): Promise<UserVerification | null> => {
    const response = await apiClient.get('/api/users/verify/status');
    return response.data.data;
  },
};
