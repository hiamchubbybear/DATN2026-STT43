import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services/api/authService';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../shared/components/ToastProvider';
import { ActivityIndicator } from 'react-native';
import { AuthBackButton } from '../../../shared/components/AuthBackButton';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAuth = useAuthStore(state => state.setAuth);
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) return;
    
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      const authData = data.data || (data.accessToken ? data : null);

      if (authData && authData.accessToken) {
        showToast({
          title: 'Đăng nhập thành công',
          message: 'Chào mừng bạn quay trở lại!',
          type: 'success'
        });
        setAuth(
          authData.user || { id: authData.userId || '', email: email, username: '' }, 
          authData.accessToken, 
          authData.refreshToken,
          authData.isProfileCompleted
        );
      } else {
        throw new Error('Thông tin đăng nhập không hợp lệ');
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
            <AuthBackButton onPress={() => navigation.goBack()} />
          </View>
          
          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue where you left off.
              </Text>
            </View>

            <View style={styles.form}>
              {/* Email Input */}
              <View style={[
                styles.inputWrapper, 
                focusedInput === 'email' && styles.inputWrapperFocused
              ]}>
                <View style={[
                  styles.iconContainer,
                  focusedInput === 'email' && styles.iconContainerFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedInput === 'email' ? '#EE3F57' : '#9CA3AF'} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#A1A1AA"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Password Input */}
              <View style={[
                styles.inputWrapper, 
                focusedInput === 'password' && styles.inputWrapperFocused
              ]}>
                <View style={[
                  styles.iconContainer,
                  focusedInput === 'password' && styles.iconContainerFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'password' ? '#EE3F57' : '#9CA3AF'} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#A1A1AA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPasswordEmail')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={!email || !password || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 32,
  },
  header: {
    paddingTop: 12,
    height: 60,
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
    fontSize: 32,
    fontWeight: '800',
    color: '#18181B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717A',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F4F4F5',
    paddingHorizontal: 16,
    height: 64,
  },
  inputWrapperFocused: {
    borderColor: '#EE3F57',
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerFocused: {
    backgroundColor: '#FFF1F2',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#18181B',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    color: '#EE3F57',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 20,
  },
  button: {
    backgroundColor: '#EE3F57',
    height: 64,
    borderRadius: 20,
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
    fontSize: 17,
    fontWeight: '700',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#71717A',
  },
  signUpLink: {
    fontSize: 14,
    color: '#EE3F57',
    fontWeight: '700',
  },
});
