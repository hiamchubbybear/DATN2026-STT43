import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../../../services/api/authService';
import { useToast } from '../../../../shared/components/ToastProvider';
import { ActivityIndicator } from 'react-native';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../../shared/utils/responsive';

const { width } = Dimensions.get('window');

export default function ForgotPasswordVerifyScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ForgotPasswordVerify'>>();
  const { email } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    const newCode = text.toUpperCase();
    setCode(newCode);
    if (newCode.length === 6) {
      try {
        setLoading(true);
        await authService.verifyResetToken(email, newCode);
        navigation.navigate('ResetPassword', { email, token: newCode });
      } catch (error: any) {
        showToast({
          title: 'Xác thực thất bại',
          message: error.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn',
          type: 'error'
        });
        setCode(''); // Clear code on failure
      } finally {
        setLoading(false);
      }
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
              <Path d="M15 18l-6-6 6-6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.timerTitle}>{formatTime(timer)}</Text>
          <Text style={styles.description}>
            Enter the 6-character code sent to your email to reset password
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
          onPress={() => setTimer(42)}
          disabled={loading || timer > 0}
        >
          {loading ? <ActivityIndicator color="#EF4444" /> : <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>Send again</Text>}
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
    alignItems: 'center',
  },
  timerTitle: {
    fontSize: normalizeFont(32),
    fontWeight: '700',
    color: '#111111',
    marginBottom: spacing(16),
  },
  description: {
    fontSize: normalizeFont(15),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing(40),
    paddingHorizontal: spacing(20),
    lineHeight: verticalScale(22),
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(8),
    marginBottom: spacing(40),
  },
  codeBox: {
    width: scale(44),
    height: scale(56),
    borderRadius: radius(12),
    borderWidth: scale(2),
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFocused: {
    borderColor: '#8B5CF6',
  },
  codeBoxFilled: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  codeText: {
    fontSize: normalizeFont(24),
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
    color: '#EF4444',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});
