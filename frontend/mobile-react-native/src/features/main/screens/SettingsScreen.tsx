import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';

const SettingsItem = ({ icon, label, color = '#111827', onPress, showArrow = true }: { 
  icon: keyof typeof Ionicons.glyphMap, 
  label: string, 
  color?: string,
  onPress?: () => void,
  showArrow?: boolean
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}10` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.rowText, { color: color === '#EF4444' ? '#EF4444' : '#111827' }]}>{label}</Text>
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
  </TouchableOpacity>
);

import { AppRatingModal } from '../../../shared/components/AppRatingModal';

import { useTranslation } from 'react-i18next';

export const SettingsScreen = () => {
  const { logout } = useAuthStore();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [ratingVisible, setRatingVisible] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logout_confirm', 'Are you sure you want to logout?'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  const toggleLanguage = async () => {
    try {
      const currentLang = i18n.language || 'vi';
      const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
      await i18n.changeLanguage(newLang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'), 
      t('settings.delete_account_confirm'), 
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.deleteAccount'), style: 'destructive', onPress: () => console.log('Delete account requested') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <SettingsItem icon="person-outline" label={t('settings.personalInfo')} color="#6366F1" onPress={() => navigation.navigate('EditProfile' as any)} />
          <SettingsItem icon="options-outline" label={t('settings.discoverySettings')} color="#F43F5E" onPress={() => navigation.navigate('DiscoverySettings' as any)} />
          <SettingsItem icon="language-outline" label={`${t('settings.language')} (${i18n.language.toUpperCase()})`} color="#10B981" onPress={toggleLanguage} />
          <SettingsItem icon="lock-closed-outline" label={t('settings.changePassword')} color="#8B5CF6" />
          <SettingsItem icon="notifications-outline" label={t('settings.notifications')} color="#F59E0B" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          <SettingsItem icon="shield-checkmark-outline" label={t('settings.privacy')} color="#10B981" />
          <SettingsItem icon="eye-off-outline" label={t('settings.incognito_mode')} color="#6B7280" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
          <SettingsItem icon="help-circle-outline" label={t('settings.help_support')} color="#3B82F6" />
          <SettingsItem icon="bug-outline" label={t('settings.report_problem')} color="#F43F5E" onPress={() => console.log('Report problem')} />
          <SettingsItem icon="document-text-outline" label={t('settings.report_history')} color="#F59E0B" onPress={() => navigation.navigate('ReportHistory' as any)} />
          <SettingsItem icon="star-outline" label={t('settings.rate_app')} color="#F59E0B" onPress={() => setRatingVisible(true)} />
        </View>

        <View style={styles.section}>
          <SettingsItem 
            icon="log-out-outline" 
            label={t('settings.logout')} 
            color="#EF4444" 
            onPress={handleLogout} 
            showArrow={false} 
          />
          <SettingsItem 
            icon="trash-outline" 
            label={t('settings.deleteAccount')} 
            color="#EF4444" 
            onPress={handleDeleteAccount} 
            showArrow={false} 
          />
        </View>

        <Text style={styles.versionText}>{t('settings.version')} 1.0.0 (BETA)</Text>
      </ScrollView>

      <AppRatingModal 
        visible={ratingVisible} 
        onClose={() => setRatingVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: spacing(8),
    marginLeft: -spacing(8),
  },
  headerTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingTop: spacing(20),
  },
  section: {
    marginBottom: spacing(24),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: normalizeFont(13),
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing(20),
    paddingTop: spacing(16),
    paddingBottom: spacing(8),
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(16),
    paddingHorizontal: spacing(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: normalizeFont(16),
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(20),
    marginHorizontal: spacing(20),
    paddingVertical: spacing(16),
    backgroundColor: '#FEF2F2',
    borderRadius: radius(16),
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: spacing(8),
  },
});
