import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services/api/authService';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useToast } from '../../../shared/components/ToastProvider';
import { useTranslation } from 'react-i18next';

export default function EmailSignUpDetailsScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      showToast({
        title: t('auth.missing_fields'),
        message: t('auth.missing_fields_desc'),
        type: 'error'
      });
      return;
    }

    if (password !== confirmPassword) {
      showToast({
        title: t('auth.password_mismatch'),
        message: t('auth.password_mismatch_desc'),
        type: 'error'
      });
      return;
    }

    // Password validation: at least 8 chars, at least one uppercase letter and one number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      showToast({
        title: t('auth.weak_password'),
        message: t('auth.weak_password_desc'),
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await authService.register(email, password);
      // Registration successful, backend automatically sends email
      navigation.navigate('EmailSignUpVerify', { email });
    } catch (error: any) {
      showToast({
        title: t('common.error'),
        message: error.message || t('auth.signUp_failed', 'Registration failed'),
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
            <Text style={styles.title}>{t('auth.signUp_title')}</Text>
            <Text style={styles.description}>
              {t('auth.signUp_details_desc')}
            </Text>

            <View style={styles.inputContainer}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 6l-10 7L2 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, styles.marginTop]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M19 11H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M7 11V7c0-2.76 2.24-5 5-5s5 2.24 5 5v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, styles.marginTop]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M19 11H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M7 11V7c0-2.76 2.24-5 5-5s5 2.24 5 5v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.button, (!email || !password || !confirmPassword || loading) && styles.buttonDisabled]} 
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={!email || !password || !confirmPassword || loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('auth.signUp_btn')}</Text>}
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
  input: {
    flex: 1,
    fontSize: normalizeFont(16),
    color: '#111111',
    height: '100%',
  },
  eyeIcon: {
    padding: spacing(4),
  },
  button: {
    backgroundColor: '#F43F5E',
    height: scale(56),
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#FDA4AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
});
