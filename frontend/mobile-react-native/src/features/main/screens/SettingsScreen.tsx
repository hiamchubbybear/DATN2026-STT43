import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';
import { AppRatingModal } from '../../../shared/components/AppRatingModal';
import { useTranslation } from 'react-i18next';
import { userService } from '../../../services/api/userService';

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

export const SettingsScreen = () => {
  const { logout, user } = useAuthStore();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [ratingVisible, setRatingVisible] = React.useState(false);
  const [isIncognito, setIsIncognito] = React.useState(user?.isIncognito || false);
  const [loadingIncognito, setLoadingIncognito] = React.useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setIsIncognito(user.isIncognito || false);
    }
  }, [user]);

  const handleToggleIncognito = async (value: boolean) => {
    setLoadingIncognito(true);
    try {
      await userService.updateIncognito(value);
      setIsIncognito(value);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.incognito_failed', 'Failed to update incognito mode'));
    } finally {
      setLoadingIncognito(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logout_confirm', 'Are you sure you want to logout?'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  const toggleLanguage = async () => {
    setIsChangingLanguage(true);
    
    // Simulate system update delay (1.5 seconds)
    setTimeout(async () => {
      try {
        const currentLang = i18n.language || 'vi';
        const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
        await i18n.changeLanguage(newLang);
      } catch (error) {
        console.error('Failed to change language:', error);
      } finally {
        // Keep loading for a tiny bit more to ensure smooth transition
        setTimeout(() => {
          setIsChangingLanguage(false);
        }, 500);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Language Loading Overlay */}
      <Modal transparent visible={isChangingLanguage} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#EE3F57" />
            <Text style={styles.loadingText}>
              {i18n.language.startsWith('vi') ? 'Updating language...' : 'Đang cập nhật ngôn ngữ...'}
            </Text>
            <Text style={styles.loadingSubText}>
              {i18n.language.startsWith('vi') ? 'Please wait a moment' : 'Vui lòng chờ trong giây lát'}
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <SettingsItem icon="person-outline" label={t('settings.personalInfo')} color="#6366F1" onPress={() => navigation.navigate('EditProfile')} />
          <SettingsItem icon="options-outline" label={t('settings.discoverySettings')} color="#F43F5E" onPress={() => navigation.navigate('DiscoverySettings')} />
          <SettingsItem icon="language-outline" label={`${t('settings.language')} (${i18n.language.toUpperCase()})`} color="#10B981" onPress={toggleLanguage} />
          <SettingsItem icon="lock-closed-outline" label={t('settings.changePassword')} color="#8B5CF6" onPress={() => navigation.navigate('ChangePassword' as any)} />
          <SettingsItem icon="notifications-outline" label={t('settings.notifications')} color="#F59E0B" onPress={() => navigation.navigate('NotificationSettings' as any)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          <SettingsItem 
            icon="shield-checkmark-outline" 
            label={t('settings.privacyPolicy')} 
            color="#10B981" 
            onPress={() => navigation.navigate('PrivacyPolicy' as any)}
          />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#6B728010' }]}>
                <Ionicons name="eye-off-outline" size={20} color="#6B7280" />
              </View>
              <Text style={styles.rowText}>{t('settings.incognito_mode')}</Text>
            </View>
            <Switch 
              value={isIncognito} 
              onValueChange={handleToggleIncognito}
              disabled={loadingIncognito}
              trackColor={{ false: '#E5E7EB', true: '#EE3F57' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
          <SettingsItem icon="help-circle-outline" label={t('settings.help_support')} color="#3B82F6" onPress={() => Alert.alert(t('settings.help_support'), 'Email: support@mixer.app')} />
          <SettingsItem icon="bug-outline" label={t('settings.report_problem')} color="#F43F5E" onPress={() => Alert.alert(t('settings.report_problem'), 'Please contact support@mixer.app with details.')} />
          <SettingsItem icon="document-text-outline" label={t('settings.report_history')} color="#F59E0B" onPress={() => navigation.navigate('ReportHistory')} />
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
            onPress={() => navigation.navigate('DeleteAccount')} 
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
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: normalizeFont(12),
    marginVertical: spacing(32),
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
});
