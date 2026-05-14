import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getDeviceInfo = (fcmToken?: string | null) => {
  return {
    deviceId: Constants.sessionId || 'unknown',
    deviceName: Constants.deviceName || 'unknown',
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version || '1.0.0',
    fcmToken: fcmToken || undefined
  };
};
