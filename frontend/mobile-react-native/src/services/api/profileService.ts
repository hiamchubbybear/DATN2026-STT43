import { apiClient } from './apiClient';

export const profileService = {
  setupProfile: async (data: {
    displayName: string;
    dob: string;
    gender: string;
    languages: string[];
    education?: string;
    occupation?: string;
    bio?: string;
    interestedIn?: string;
    drinking?: string;
    smoking?: string;
    socialLevel?: string;
    personalityType?: string;
    loveLanguage?: string[];
    hobbies?: string[];
    interests?: string[];
    freeTimePrefer?: string[];
    dateStyle?: string[];
  }) => {
    const response = await apiClient.post('/api/v1/profile/setup', data);
    return response.data;
  },

  uploadPhoto: async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';

    // Determine mime type based on extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri,
      name: filename,
      type
    } as any);

    const response = await apiClient.post('/api/users/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/api/users/me');
    return response.data.data;
  },

  deletePhoto: async (photoId: string) => {
    const response = await apiClient.delete(`/api/users/photos/${photoId}`);
    return response.data;
  },

  reorderPhotos: async (photoIds: string[]) => {
    const response = await apiClient.patch('/api/users/photos/reorder', { photoIds });
    return response.data;
  },

  setPrimaryPhoto: async (photoId: string) => {
    const response = await apiClient.patch(`/api/users/photos/${photoId}/primary`);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/api/users/me/profile', data);
    return response.data;
  },

  updatePreferences: async (data: any) => {
    const response = await apiClient.patch('/api/users/me/preferences', data);
    return response.data;
  },

  updateLocation: async (data: { latitude: number; longitude: number; locationName: string }) => {
    const response = await apiClient.patch('/api/users/me/location', data);
    return response.data;
  },

  updateBio: async (data: { bio: string; gender: string; interestedIn: string }) => {
    const response = await apiClient.patch('/api/users/me/bio', data);
    return response.data;
  },

  updateBasicInfo: async (data: { displayName: string; dob: string; gender: string; languages: string[] }) => {
    const response = await apiClient.patch('/api/users/me/basic-info', data);
    return response.data;
  },

  updateBackground: async (data: { education: string; occupation: string }) => {
    const response = await apiClient.patch('/api/users/me/background', data);
    return response.data;
  },

  updateLifestyle: async (data: {
    drinking: string;
    smoking: string;
    socialLevel: string;
    personalityType: string;
    loveLanguage: string[];
    hobbies: string[];
    interests: string[];
  }) => {
    const response = await apiClient.patch('/api/users/me/lifestyle', data);
    return response.data;
  },

  updateDatingStyle: async (data: { freeTimePrefer: string[]; dateStyle: string[] }) => {
    const response = await apiClient.patch('/api/users/me/dating-style', data);
    return response.data;
  },
};

