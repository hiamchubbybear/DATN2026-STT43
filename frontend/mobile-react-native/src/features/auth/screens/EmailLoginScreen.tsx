import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../../services/api/authService';
import { useAuthStore } from '../../../store/authStore';
import { Alert, ActivityIndicator } from 'react-native';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      console.log("🔍 [Login] Raw data:", JSON.stringify(data, null, 2));
      
      // Backend LoginCommand returns AuthResponse. Handle both wrapped (data.data) and direct (data)
      const authData = data.data || (data.accessToken ? data : null);
      console.log("🔍 [Login] Parsed authData:", JSON.stringify(authData, null, 2));

      if (authData && authData.accessToken) {
        Alert.alert('Success', 'Login successful!');
        setAuth(
          authData.user || { id: authData.userId || '', email: email, username: '' }, 
          authData.accessToken, 
          authData.refreshToken,
          authData.isProfileCompleted
        );
      } else {
        console.error("❌ [Login] Invalid structure:", data);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
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
                <Path d="M15 18l-6-6 6-6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.description}>
              Please enter your email address and password to log in.
            </Text>

            <View style={styles.inputContainer}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 6l-10 7L2 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              />
            </View>

            <View style={[styles.inputContainer, styles.passwordContainer]}>
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
                autoCorrect={false}
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  passwordContainer: {
    marginTop: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
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
    fontSize: 16,
    fontWeight: '600',
  },
});
