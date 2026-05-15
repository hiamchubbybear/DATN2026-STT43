import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/features/signup/components/ActionButton';
import { SocialButton } from '@/features/signup/components/SocialButton';

export function SignUpScreen() {
  const router = useRouter();

  const handleEmailSignup = () => {
    console.log('Continue with email clicked');
    router.push('/signup/email' as never);
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleAppleLogin = () => {
    console.log('Apple login clicked');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          onPress={() => router.replace('/' as never)}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Ionicons name="chevron-back" size={22} color="#111111" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.centerSection}>
          <Image source={require('@/assets/images/logo_v2.png')} style={styles.logoImage} />

          <Text style={styles.title}>Sign up to continue</Text>

          <View style={styles.buttonsStack}>
            <ActionButton label="Continue with email" variant="primary" onPress={handleEmailSignup} />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialButton platform="facebook" onPress={handleFacebookLogin} />
            <SocialButton platform="google" onPress={handleGoogleLogin} />
            <SocialButton platform="apple" onPress={handleAppleLogin} />
          </View>
        </View>

        <View style={styles.bottomLinks}>
          <Pressable style={({ pressed }) => [pressed && styles.linkPressed]}>
            <Text style={styles.linkText}>Terms of use</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [pressed && styles.linkPressed]}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: '#F3F3F3',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backText: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '500',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  logoImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  title: {
    color: '#111111',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonsStack: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  socialRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  linkText: {
    color: '#EE3F57',
    fontSize: 13,
    fontWeight: '500',
  },
  linkPressed: {
    opacity: 0.75,
  },
});
