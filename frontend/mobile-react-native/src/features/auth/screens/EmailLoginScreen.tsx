import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../../services/api/authService';
import { useAuthStore } from '../../../store/authStore';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useToast } from '../../../shared/components/ToastProvider';
import { useTranslation } from 'react-i18next';
import { getFcmToken } from '../../../shared/utils/notificationHelper';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAuth = useAuthStore(state => state.setAuth);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email || !password || loading) {
      return;
    }

    try {
      setLoading(true);
      const fcmToken = await getFcmToken();
      const data = await authService.login(email, password, fcmToken);
      const authData = data.data || (data.accessToken ? data : null);

      if (authData && authData.accessToken) {
        setAuth(
          authData.user || { id: authData.userId || '', email },
          authData.accessToken,
          authData.refreshToken,
          authData.isProfileCompleted,
        );
        console.log("✅ [EmailLogin] Success! RootNavigator will auto-switch.");
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      showToast({
        title: t('auth.login_failed'),
        message: error.message || t('auth.invalid_credentials'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F43F5E" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image 
              source={require('../../../../assets/images/logo_v2.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('auth.welcome_back')}</Text>
            <Text style={styles.description}>
              {t('auth.email_login_desc')}
            </Text>

            <View style={[
              styles.inputContainer,
              focusedInput === 'email' && styles.inputFocused
            ]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={focusedInput === 'email' ? "#F43F5E" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 6l-10 7L2 6" stroke={focusedInput === 'email' ? "#F43F5E" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={[
              styles.inputContainer, 
              styles.marginTop,
              focusedInput === 'password' && styles.inputFocused
            ]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M19 11H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2z" stroke={focusedInput === 'password' ? "#F43F5E" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M7 11V7c0-2.76 2.24-5 5-5s5 2.24 5 5v4" stroke={focusedInput === 'password' ? "#F43F5E" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password_placeholder')}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={focusedInput === 'password' ? "#F43F5E" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPasswordEmail')}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.forgot_password_link')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={!email || !password || loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('auth.login_btn')}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing(24),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing(40),
  },
  header: {
    paddingTop: spacing(10),
    paddingBottom: spacing(20),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16, // Adjust for AuthBackButton padding
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  logoImage: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius(16),
    marginBottom: spacing(24),
  },
  welcomeContainer: {
    marginBottom: 44,
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '700',
    color: '#111111',
    marginBottom: spacing(12),
  },
  description: {
    fontSize: normalizeFont(15),
    color: '#6B7280',
    lineHeight: verticalScale(22),
    marginBottom: spacing(32),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radius(16),
    paddingHorizontal: spacing(16),
    height: scale(56),
  },
  marginTop: {
    marginTop: spacing(16),
  },
  icon: {
    marginRight: spacing(12),
  },
  inputFocused: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  iconContainerFocused: {
    backgroundColor: '#FFF1F2',
  },
  input: {
    flex: 1,
    fontSize: normalizeFont(16),
    color: '#111111',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing(16),
  },
  forgotPasswordText: {
    color: '#EF4444',
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#EF4444',
    height: scale(56),
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EE3F57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#F4F4F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
});
