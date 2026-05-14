import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function getFcmToken() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    // For Expo Go, use expoPushToken. For production/preview, you might want the native FCM token.
    // However, the backend is using FirebaseMessaging, which expects an FCM token.
    // To get the device's FCM token in Expo, we use getDevicePushTokenAsync.
    
    // NOTE: getDevicePushTokenAsync returns the native FCM token on Android and APNS token on iOS.
    // FirebaseMessaging.SendAsync expects the FCM token.
    
    const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('FCM Device Token:', deviceToken);
    return deviceToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}
