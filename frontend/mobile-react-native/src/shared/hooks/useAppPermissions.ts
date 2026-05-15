import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

export const useAppPermissions = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // 1. Request Location Permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          console.warn('Location permission denied');
        } else {
          // If granted, get current position to warm up the provider
          await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        }

        // 2. Request Notification Permission
        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        if (notificationStatus !== 'granted') {
          console.warn('Notification permission denied');
        }

      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);
};
