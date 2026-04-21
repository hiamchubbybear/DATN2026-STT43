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
};
