import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import Svg, { Path, Circle } from 'react-native-svg';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';
import { useAuthStore } from '../../../store/authStore';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../../services/api/profileService';

const IconLocation = () => (
  <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <Path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const IconBell = () => (
  <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8C6 12 4 14 4 14H20C20 14 18 12 18 8Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

export const PermissionScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState<string>('undetermined');
  const [notificationStatus, setNotificationStatus] = useState<string>('undetermined');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status: locStatus } = await Location.getForegroundPermissionsAsync();
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    
    setLocationStatus(locStatus);
    setNotificationStatus(notifStatus);
    
    if (locStatus === 'granted' && notifStatus === 'granted') {
      // If already granted, move to next screen automatically
      navigation.replace('DiscoverySetting');
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationStatus(status);
    if (status === 'denied') {
      Linking.openSettings();
    }
  };

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationStatus(status);
    if (status === 'denied') {
      Linking.openSettings();
    }
  };

  const handleContinue = async () => {
    try {
      if (locationStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const locationName = address ? `${address.district || address.city || address.region}` : 'Nearby';
        
        await profileService.updateLocation({ latitude, longitude, locationName });
      }
    } catch (error) {
      console.error('[Permission] Failed to update location:', error);
    }
    navigation.replace('DiscoverySetting');
  };

  const isAllGranted = locationStatus === 'granted' && notificationStatus === 'granted';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('setup.permission_title')}</Text>
          <Text style={styles.subtitle}>
            {t('setup.permission_subtitle')}
          </Text>

          {/* Location Permission */}
          <View style={styles.permissionItem}>
            <IconLocation />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>{t('setup.location_title')}</Text>
              <Text style={styles.permissionDescription}>
                {t('setup.location_desc')}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.statusBadge, locationStatus === 'granted' && styles.statusBadgeGranted]}
              onPress={requestLocation}
            >
              <Text style={[styles.statusText, locationStatus === 'granted' && styles.statusTextGranted]}>
                {locationStatus === 'granted' ? t('setup.enabled') : t('setup.enable')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification Permission */}
          <View style={styles.permissionItem}>
            <IconBell />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>{t('setup.notif_title')}</Text>
              <Text style={styles.permissionDescription}>
                {t('setup.notif_desc')}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.statusBadge, notificationStatus === 'granted' && styles.statusBadgeGranted]}
              onPress={requestNotifications}
            >
              <Text style={[styles.statusText, notificationStatus === 'granted' && styles.statusTextGranted]}>
                {notificationStatus === 'granted' ? t('setup.enabled') : t('setup.enable')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, !isAllGranted && styles.buttonDisabled]} 
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.maybeLater} onPress={handleContinue}>
            <Text style={styles.maybeLaterText}>{t('setup.maybe_later')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(32),
    paddingTop: spacing(40),
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '800',
    color: '#111827',
    marginBottom: spacing(12),
  },
  subtitle: {
    fontSize: normalizeFont(16),
    color: '#6B7280',
    lineHeight: scale(24),
    marginBottom: spacing(48),
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(32),
  },
  iconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTextContainer: {
    flex: 1,
    marginLeft: spacing(16),
  },
  permissionTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing(4),
  },
  permissionDescription: {
    fontSize: normalizeFont(14),
    color: '#6B7280',
    lineHeight: scale(20),
  },
  statusBadge: {
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(6),
    borderRadius: radius(20),
    backgroundColor: '#F3F4F6',
    marginLeft: spacing(12),
  },
  statusBadgeGranted: {
    backgroundColor: '#ECFDF5',
  },
  statusText: {
    fontSize: normalizeFont(14),
    fontWeight: '700',
    color: '#4B5563',
  },
  statusTextGranted: {
    color: '#10B981',
  },
  footer: {
    paddingHorizontal: spacing(32),
    paddingBottom: spacing(40),
    paddingTop: spacing(16),
  },
  button: {
    width: '100%',
    height: scale(56),
    backgroundColor: '#F43F5E',
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
  maybeLater: {
    marginTop: spacing(16),
    alignItems: 'center',
  },
  maybeLaterText: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
