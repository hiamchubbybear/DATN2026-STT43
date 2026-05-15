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

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.fill_all_fields', 'Please fill all fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.password_mismatch', 'Passwords do not match'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('auth.password_too_short', 'Password must be at least 6 characters'));
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(user?.email || '', oldPassword, newPassword);
      Alert.alert(t('common.success'), t('settings.change_password_success', 'Password updated successfully'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || t('common.error_generic');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.changePassword')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.description}>
            {t('settings.change_password_desc', 'Your new password must be different from previous used passwords.')}
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('settings.oldPassword', 'Old Password')}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('settings.oldPassword_placeholder', 'Enter old password')}
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
                <Ionicons name={showOld ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('settings.newPassword', 'New Password')}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('settings.newPassword_placeholder', 'Enter new password')}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('settings.confirmPassword', 'Confirm New Password')}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('settings.confirmPassword_placeholder', 'Confirm new password')}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('settings.updatePassword', 'Update Password')}</Text>
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
  description: {
    fontSize: normalizeFont(14),
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing(24),
  },
  inputSection: { gap: spacing(16), marginBottom: spacing(32) },
  label: { fontSize: normalizeFont(14), fontWeight: '600', color: '#374151', marginBottom: spacing(6) },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radius(12),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: spacing(12),
  },
  input: {
    flex: 1,
    height: scale(48),
    fontSize: normalizeFont(15),
    color: '#111827',
  },
  eyeIcon: { padding: spacing(8) },
  button: {
    backgroundColor: '#EE3F57',
    height: scale(52),
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EE3F57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: '#FCA5A5' },
  buttonText: { fontSize: normalizeFont(16), fontWeight: '700', color: '#FFFFFF' },
});
