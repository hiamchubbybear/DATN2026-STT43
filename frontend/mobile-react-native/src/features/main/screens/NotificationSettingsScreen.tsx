import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, spacing } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';

const SettingSwitch = ({ title, description, value, onToggle }: { 
  title: string, 
  description: string, 
  value: boolean, 
  onToggle: (v: boolean) => void 
}) => (
  <View style={styles.switchRow}>
    <View style={styles.switchText}>
      <Text style={styles.switchTitle}>{title}</Text>
      <Text style={styles.switchDesc}>{description}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onToggle}
      trackColor={{ false: '#E5E7EB', true: '#EE3F57' }}
      thumbColor="#FFFFFF"
    />
  </View>
);

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [warnings, setWarnings] = useState(true);
  const [marketing, setMarketing] = useState(false);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/settings');
      const data = res.data;
      setNewMatches(data.enableMatchNotification);
      setNewMessages(data.enableMessageNotification);
      setWarnings(data.enablePushNotification);
      setMarketing(data.enableEmailNotification);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: string, value: boolean) => {
    // Optimistic update
    const prev = { newMatches, newMessages, warnings, marketing };
    if (type === 'matches') setNewMatches(value);
    if (type === 'messages') setNewMessages(value);
    if (type === 'warnings') setWarnings(value);
    if (type === 'marketing') setMarketing(value);

    try {
      await userService.updateNotifications({
        match: type === 'matches' ? value : newMatches,
        message: type === 'messages' ? value : newMessages,
        push: type === 'warnings' ? value : warnings,
        email: type === 'marketing' ? value : marketing
      });
    } catch (error) {
      // Revert on error
      if (type === 'matches') setNewMatches(prev.newMatches);
      if (type === 'messages') setNewMessages(prev.newMessages);
      if (type === 'warnings') setWarnings(prev.warnings);
      if (type === 'marketing') setMarketing(prev.marketing);
      showToast({ type: 'error', title: t('common.error'), message: 'Failed to update settings' });
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#EE3F57" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.notifications')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.push_notifications', 'Push Notifications')}</Text>
          <SettingSwitch 
            title={t('settings.new_matches', 'New Matches')} 
            description={t('settings.new_matches_desc', 'Get notified when you have a new match')} 
            value={newMatches}
            onToggle={(v) => handleToggle('matches', v)}
          />
          <SettingSwitch 
            title={t('settings.new_messages', 'New Messages')} 
            description={t('settings.new_messages_desc', 'Get notified when you receive a message')} 
            value={newMessages}
            onToggle={(v) => handleToggle('messages', v)}
          />
          <SettingSwitch 
            title={t('settings.account_warnings', 'Account Warnings')} 
            description={t('settings.account_warnings_desc', 'Safety alerts and account restriction notices')} 
            value={warnings}
            onToggle={(v) => handleToggle('warnings', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.marketing', 'Marketing')}</Text>
          <SettingSwitch 
            title={t('settings.promotions', 'Promotions & Tips')} 
            description={t('settings.promotions_desc', 'Receive offers and tips on how to find better matches')} 
            value={marketing}
            onToggle={(v) => handleToggle('marketing', v)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: spacing(8), marginLeft: -spacing(8) },
  headerTitle: { fontSize: normalizeFont(18), fontWeight: '700', color: '#111827' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  section: {
    marginTop: spacing(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: normalizeFont(13),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    paddingHorizontal: spacing(20),
    paddingTop: spacing(16),
    paddingBottom: spacing(8),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(16),
    paddingHorizontal: spacing(20),
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  switchText: { flex: 1, paddingRight: spacing(16) },
  switchTitle: { fontSize: normalizeFont(15), fontWeight: '600', color: '#111827' },
  switchDesc: { fontSize: normalizeFont(13), color: '#6B7280', marginTop: spacing(2) },
});
