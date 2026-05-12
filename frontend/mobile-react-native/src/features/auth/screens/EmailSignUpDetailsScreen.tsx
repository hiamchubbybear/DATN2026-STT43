import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../../services/api/authService';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useToast } from '../../../shared/components/ToastProvider';

export default function EmailSignUpDetailsScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();

  const handleSignUp = async () => {
    if (!email || !password) {
      showToast({
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ các trường',
        type: 'error'
      });
      return;
    }

    // Password validation: at least 8 chars, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      showToast({
        title: 'Mật khẩu yếu',
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số.',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      // We send "" for username as it's no longer used but API might still expect it for now
      // Actually, I'll update the service and API too.
      await authService.register(email, password);
      // Registration successful, backend automatically sends email
      navigation.navigate('EmailSignUpVerify', { email });
    } catch (error: any) {
      showToast({
        title: 'Đăng ký thất bại',
        message: error.message || 'Đã có lỗi xảy ra',
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join our community today. Enter your details to get started.
            </Text>

            <View style={styles.inputContainer}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 6l-10 7L2 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="Email address"
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
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]} 
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={!email || !password || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
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
  },
  content: {
    flex: 1,
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
