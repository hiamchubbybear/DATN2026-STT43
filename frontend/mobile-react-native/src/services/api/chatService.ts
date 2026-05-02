import { apiClient } from './apiClient';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  payload: string;
  timestamp: string;
}

export const chatService = {
  getChatHistory: async (conversationId: string, before?: string, limit: number = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/v1/chat/${conversationId}/history`, {
      params: { before, limit }
    });
    // Assuming backend returns a direct list or wrapped in ApiResponse
    return response.data.data || response.data;
  },
};
