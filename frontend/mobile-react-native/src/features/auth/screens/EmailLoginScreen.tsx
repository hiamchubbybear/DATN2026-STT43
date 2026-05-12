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

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAuth = useAuthStore(state => state.setAuth);
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password || loading) {
      return;
    }

    try {
      setLoading(true);
      const data = await authService.login(email, password);
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
        title: 'Đăng nhập thất bại',
        message: error.message || 'Email hoặc mật khẩu không chính xác',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18l-6-6 6-6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Please enter your email address and password to log in.
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
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPasswordEmail')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={!email || !password || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    justifyContent: 'space-between',
    paddingBottom: spacing(20),
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
    paddingTop: 40,
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
