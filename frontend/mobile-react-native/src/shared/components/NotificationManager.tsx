import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { toast } from '../services/toast';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation/RootNavigator';
import { useNotificationStore } from '../../store/notificationStore';

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
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  const { setHasUnreadMessages, setHasUnreadMatches, setHasUnreadNotifications } = useNotificationStore();

  useEffect(() => {
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
    });

    // 2. Listen for when a user interacts with a notification (taps it)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      
      console.log('Notification Tapped:', data);

      if (data?.type === 'chat' && data?.conversationId) {
        navigation.navigate('ChatRoom', {
          conversationId: data.conversationId,
          receiverId: data.senderId,
          receiverName: 'Người dùng', // Ideal would be to have name in data
        });
      } else if (data?.type === 'match') {
        navigation.navigate('MainTabs', { screen: 'Matches' });
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [navigation]);

  return null; // This component doesn't render anything
};
