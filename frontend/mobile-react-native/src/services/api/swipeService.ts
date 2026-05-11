import { apiClient } from './apiClient';

export interface UserProfileDto {
  userId: string;
  displayName: string;
  age: number;
  bio: string;
  photos: string[];
  locationName: string;
  occupation: string;
  interests: string[];
}

export enum SwipeType {
  Like = 1,
  Dislike = 2,
  SuperLike = 3,
}

export interface SwipeActionResponse {
  isMatch: boolean;
  matchId?: string;
}

export const swipeService = {
  getFeed: async (filters?: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    distance?: number;
  }): Promise<UserProfileDto[]> => {
    try {
      console.log('[SwipeService] getFeed called with filters:', filters);
      const response = await apiClient.get<any>('/api/v1/swipes/feed', {
        params: {
          Gender: filters?.gender,
          MinAge: filters?.minAge,
          MaxAge: filters?.maxAge,
          Distance: filters?.distance,
        },
      });
      console.log(`[SwipeService] getFeed success: ${response.data.data?.length} items`);
      return response.data.data;
    } catch (error) {
      console.error('[SwipeService] getFeed error:', error);
      throw error;
    }
  },

  swipeAction: async (targetId: string, type: SwipeType): Promise<SwipeActionResponse> => {
    const response = await apiClient.post<any>('/api/v1/swipes/action', {
      targetId,
      type,
    });
    return response.data.data;
  },

  getMatches: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/api/v1/swipes/matches');
    return response.data.data;
  },

  swipeQueryOptions: {
    queryKey: ['swipeFeed'],
    queryFn: () => swipeService.getFeed(),
    staleTime: 0,
    gcTime: 0,
  },
};
