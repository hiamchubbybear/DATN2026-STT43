import { apiClient } from './apiClient';

export type UserDiscoverDto = {
	userId: string;
	displayName: string;
	avatarUrl?: string;
};

export const userService = {
	discoverUsers: async (): Promise<UserDiscoverDto[]> => {
		const response = await apiClient.get('/api/users/discover');
		return response.data?.data ?? response.data;
	},
};
