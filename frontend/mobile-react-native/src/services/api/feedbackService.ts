import { apiClient } from './apiClient';

export interface AppReviewRequest {
  rating: number;
  comment: string;
}

export const feedbackService = {
  submitReview: async (data: AppReviewRequest) => {
    const response = await apiClient.post('/api/users/review', data);
    return response.data;
  },
};
