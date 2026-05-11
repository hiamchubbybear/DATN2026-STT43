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
    return response.data.data || response.data;
  },
  getOrCreateConversation: async (targetUserId: string): Promise<string> => {
    const response = await apiClient.get(`/api/chat/conversation/${targetUserId}`);
    // Extract Guid from ApiResponse<Guid>
    return response.data.data;
  },
  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/api/chat/conversation/${conversationId}`);
  }
};
