import { apiClient } from './apiClient';

export interface UserDiscoverDto {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export const userService = {
  discoverUsers: async (): Promise<UserDiscoverDto[]> => {
    const response = await apiClient.get('/api/users/discover');
    // The backend returns ApiResponse<List<UserSearchDto>>
    return response.data.data;
  },
};
