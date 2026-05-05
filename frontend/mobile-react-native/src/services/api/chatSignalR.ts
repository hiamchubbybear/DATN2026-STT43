import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { API_CONFIG } from '../../constants/config'; // assuming this exists, we will use process.env if not.

class ChatSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private isConnecting = false;

  public async startConnection() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        console.warn('Cannot connect to SignalR without a token');
        this.isConnecting = false;
        return;
      }

      // Use the API Base URL from env, or fallback to the local backend port
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5017';
      
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/app`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.registerEvents();

      await this.hubConnection.start();
      console.log('SignalR Connected!');
    } catch (err) {
      console.error('Error connecting to SignalR:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  private registerEvents() {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (data: any) => {
      console.log('Received message:', data);
      useChatStore.getState().addMessage(data.conversationId, {
        id: data.reqId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        payload: data.payload,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    });

    this.hubConnection.on('Ack', (data: any) => {
      console.log('Message ACK received:', data);
      if (data.status === 'SUCCESS' && data.conversationId && data.reqId) {
        useChatStore.getState().markAsDelivered(data.conversationId, data.reqId);
      }
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR Reconnecting...', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected! Connection ID:', connectionId);
      // Trigger a REST API call to fetch missed messages here (Catch-up phase)
    });

    this.hubConnection.onclose((error) => {
      console.warn('SignalR Connection Closed', error);
    });
  }

  public async sendMessage(conversationId: string, receiverId: string, content: string, reqId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendMessage', conversationId, receiverId, content, reqId);
      } catch (err) {
        console.error('Error sending message via SignalR:', err);
        throw err;
      }
    } else {
      console.warn('No SignalR connection. Cannot send message.');
      throw new Error('Not connected');
    }
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
}

export const chatSignalRService = new ChatSignalRService();
