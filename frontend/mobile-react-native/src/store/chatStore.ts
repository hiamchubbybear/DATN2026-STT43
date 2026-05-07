import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  payload: string;
  timestamp: string;
  isDelivered?: boolean;
  isRead?: boolean;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>; // Key: conversationId
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  markAsDelivered: (conversationId: string, messageId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),
  markAsDelivered: (conversationId, messageId) =>
    set((state) => {
      const convMsgs = state.messages[conversationId];
      if (!convMsgs) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: convMsgs.map((m) =>
            m.id === messageId ? { ...m, isDelivered: true } : m
          ),
        },
      };
    }),
  clearMessages: () => set({ messages: {} }),
}));
