import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../../services/api/authService';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../shared/components/ToastProvider';

const { width } = Dimensions.get('window');

export default function VerifyScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'EmailSignUpVerify'>>();
  const { email } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAuth = useAuthStore(state => state.setAuth);
  const { showToast } = useToast();
  
  const [code, setCode] = useState<string>('');
  const [timer, setTimer] = useState(42);
  const [loading, setLoading] = useState(false);
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = async (text: string) => {
    const newCode = text.toUpperCase(); // Backend usually uses uppercase for codes
    setCode(newCode);
    
    if (newCode.length === 6) {
      try {
        setLoading(true);
        const result = await authService.verifyEmail(email, newCode);
        console.log("🔍 [Verify] Raw response:", JSON.stringify(result, null, 2));
        
        // Handle both wrapped (result.data) and direct (result) responses
        const authData = result.data || (result.accessToken ? result : null);
        console.log("🔍 [Verify] Parsed authData:", JSON.stringify(authData, null, 2));

        if (authData && authData.accessToken) {
          showToast({
            title: 'Thành công',
            message: 'Xác thực email thành công!',
            type: 'success'
          });
          setAuth(
            authData.user || { id: '', email: email, username: '' },
            authData.accessToken,
            authData.refreshToken,
            authData.isProfileCompleted
          );
        } else {
          console.error("❌ [Verify] Invalid structure:", result);
          throw new Error('Verification successful but tokens not received');
        }
      } catch (error: any) {
        showToast({
          title: 'Xác thực thất bại',
          message: error.message || 'Mã xác thực không chính xác',
          type: 'error'
        });
        setCode(''); // Clear code on failure
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await authService.resendVerification(email);
      setTimer(42);
      showToast({
        title: 'Thành công',
        message: 'Mã xác thực đã được gửi lại',
        type: 'success'
      });
    } catch (error: any) {
      showToast({
        title: 'Lỗi',
        message: error.message || 'Không thể gửi lại mã',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle focus when clicking boxes
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderDot = (index: number) => {
    const isFilled = index < code.length;
    const isFocused = index === code.length;
    const value = code[index] || '';

    return (
      <TouchableOpacity 
        key={index}
        activeOpacity={1}
        onPress={handlePress}
        style={[
          styles.codeBox,
          isFilled && styles.codeBoxFilled,
          isFocused && styles.codeBoxFocused,
        ]}
      >
        <Text style={[styles.codeText, isFilled && styles.codeTextFilled]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.timerTitle}>{formatTime(timer)}</Text>
          <Text style={styles.description}>
            Type the verification code we've sent you
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.hiddenInput}
              caretHidden
            />
            {[0, 1, 2, 3, 4, 5].map(renderDot)}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resendContainer} 
          onPress={handleResend}
          disabled={loading || timer > 0}
        >
          {loading ? <ActivityIndicator color="#F43F5E" /> : <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>Send again</Text>}
        </TouchableOpacity>
      </View>
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
    paddingBottom: spacing(40),
  },
  header: {
    paddingTop: spacing(10),
    paddingBottom: spacing(40),
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
  timerTitle: {
    marginBottom: spacing(16),
    fontWeight: '700',
    color: '#111111',
    fontSize: normalizeFont(15),
  },
  description: {
    marginBottom: spacing(40),
    paddingHorizontal: spacing(20),
    lineHeight: verticalScale(22),
  },
  codeContainer: {
    gap: spacing(8),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  codeBox: {
    width: scale(48),
    height: verticalScale(56),
    borderRadius: radius(12),
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFocused: {
    borderColor: '#8B5CF6',
  },
  codeBoxFilled: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  codeText: {
    fontSize: normalizeFont(18),
    fontWeight: '600',
    color: '#111111',
  },
  codeTextFilled: {
    color: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  key: {
    width: width / 3 - 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#111111',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#F43F5E',
    fontWeight: '600',
    fontSize: 16,
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});
