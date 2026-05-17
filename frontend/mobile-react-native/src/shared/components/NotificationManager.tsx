import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { toast } from '../services/toast';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation/RootNavigator';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/api/notificationService';
import { swipeService } from '../../services/api/swipeService';
import { useAuthStore } from '../../store/authStore';
import { getFcmToken } from '../utils/notificationHelper';

// Configure how notifications are handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationManager: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuthStore();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  const { 
    setHasUnreadMessages, 
    setHasUnreadMatches, 
    setHasUnreadNotifications,
    hasUnreadMatches,
    hasUnreadNotifications 
  } = useNotificationStore();

  const lastMatchCount = useRef<number>(0);

  // Function to poll for updates from the server
  const checkUpdates = async () => {
    try {
      // 1. Check for unread notifications
      const notifications = await notificationService.list();
      const unreadNotifs = notifications.some(n => !n.isRead);
      if (unreadNotifs !== hasUnreadNotifications) {
        setHasUnreadNotifications(unreadNotifs);
      }

      // 2. Check for new matches
      const matches = await swipeService.getMatches();
      if (matches.length > lastMatchCount.current) {
        if (lastMatchCount.current > 0) { // Only mark as unread if it's a NEW match
          setHasUnreadMatches(true);
        }
        lastMatchCount.current = matches.length;
      }
    } catch (error) {
      console.log('[NotificationManager] Polling error:', error);
    }
  };

  useEffect(() => {
    // Dynamically register/update push token on startup if authenticated
    const registerPushToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getFcmToken();
          if (token) {
            console.log('[NotificationManager] Registering push token with backend:', token);
            await notificationService.updateFcmToken(token);
            console.log('[NotificationManager] Push token registered successfully.');
          } else {
            console.log('[NotificationManager] Push token not available (permission denied or simulator issue)');
          }
        } catch (error) {
          console.error('[NotificationManager] Error registering push token:', error);
        }
      }
    };

    registerPushToken();

    // Initial check
    checkUpdates();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(checkUpdates, 30000);

    // 1. Listen for incoming notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      
      console.log('Notification Received in Foreground:', { title, body, data });

      // Show a toast for foreground notifications
      toast.show({
        title: title || 'Thông báo',
        message: body || '',
        type: (data?.type === 'error' || data?.type === 'warning') ? 'error' : 'info',
        duration: 5000,
      });

      // Update global unread status based on type
      if (data?.type === 'chat') {
        setHasUnreadMessages(true);
      } else if (data?.type === 'match') {
        setHasUnreadMatches(true);
      } else {
        setHasUnreadNotifications(true);
      }
      
      // Also trigger a manual check to sync counts immediately
      checkUpdates();
    });

    // 2. Listen for when a user interacts with a notification (taps it)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      
      console.log('Notification Tapped:', data);

      if (data?.type === 'chat' && data?.conversationId) {
        navigation.navigate('ChatRoom', {
          conversationId: data.conversationId,
          receiverId: data.senderId,
          receiverName: 'Người dùng', 
        });
      } else if (data?.type === 'match') {
        navigation.navigate('MainTabs', { screen: 'Matches' });
      }
    });

    return () => {
      clearInterval(interval);
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [navigation, isAuthenticated]);

  return null; 
};
