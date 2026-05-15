import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, spacing, scale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';
import { authService } from '../../../services/api/authService';
import { useAuthStore } from '../../../store/authStore';

export const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      Alert.alert(t('common.error'), t('auth.enter_password', 'Please enter your password to confirm'));
      return;
    }

    if (!confirmed) {
      Alert.alert(t('common.error'), t('settings.confirm_delete_checkbox', 'Please confirm that you understand the consequences'));
      return;
    }

    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.delete_final_confirm', 'This action is irreversible. All your data will be permanently deleted. Are you absolutely sure?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive', 
          onPress: async () => {
            setLoading(true);
            try {
              await authService.deleteAccount(user?.email || '', password);
              Alert.alert(t('common.success'), t('settings.delete_success', 'Your account has been deleted.'), [
                { text: 'OK', onPress: () => logout() }
              ]);
            } catch (error: any) {
              const msg = error.response?.data?.message || t('common.error_generic');
              Alert.alert(t('common.error'), msg);
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.deleteAccount')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={32} color="#EF4444" />
            <Text style={styles.warningTitle}>{t('settings.delete_warning_title', 'Delete Account Permanently')}</Text>
            <Text style={styles.warningText}>
              {t('settings.delete_warning_desc', 'Once you delete your account, there is no going back. All your matches, messages, and profile information will be wiped from our servers.')}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t('auth.password', 'Password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enter_password', 'Enter password')}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
                {confirmed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                {t('settings.delete_confirm_text', 'I understand that this action is permanent and my data cannot be recovered.')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, (!confirmed || loading) && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={loading || !confirmed}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonText}>{t('settings.deleteAccount')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: { padding: spacing(20) },
  warningBox: {
    backgroundColor: '#FEF2F2',
    padding: spacing(20),
    borderRadius: radius(16),
    alignItems: 'center',
    marginBottom: spacing(32),
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  warningTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#B91C1C',
    marginTop: spacing(12),
    marginBottom: spacing(8),
  },
  warningText: {
    fontSize: normalizeFont(14),
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: { marginBottom: spacing(32) },
  label: { fontSize: normalizeFont(14), fontWeight: '600', color: '#374151', marginBottom: spacing(8) },
  input: {
    height: scale(52),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radius(12),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: spacing(16),
    fontSize: normalizeFont(15),
    color: '#111827',
    marginBottom: spacing(20),
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  checkboxLabel: { flex: 1, fontSize: normalizeFont(13), color: '#4B5563', lineHeight: 18 },
  deleteButton: {
    backgroundColor: '#EF4444',
    height: scale(52),
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#FCA5A5' },
  deleteButtonText: { fontSize: normalizeFont(16), fontWeight: '700', color: '#FFFFFF' },
});
