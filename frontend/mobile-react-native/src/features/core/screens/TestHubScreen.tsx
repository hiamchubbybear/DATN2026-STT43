import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { AuthBackButton } from '../../../shared/components/AuthBackButton';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

export const TestHubScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isProfileCompleted } = useAuthStore();
  const isInAppFlow = isAuthenticated && isProfileCompleted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AuthBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Test Navigation Hub</Text>
        <Text style={styles.subtitle}>
          {isInAppFlow
            ? 'Bạn đang ở app flow. Các nút bên dưới mở tab có kèm thanh navigation bar.'
            : 'Bạn đang ở auth/setup flow. Dùng các nút dưới để test đăng nhập/đăng ký.'}
        </Text>

        <View style={styles.buttons}>
          <PrimaryButton title="Xem Main (Preview)" onPress={() => navigation.navigate('PreviewMainTabs', { screen: 'Main' })} />

          {isInAppFlow ? (
            <>
              <PrimaryButton title="Main" onPress={() => navigation.navigate('MainTabs', { screen: 'Main' })} />
              <PrimaryButton title="Matches" onPress={() => navigation.navigate('MainTabs', { screen: 'Matches' })} />
              <PrimaryButton title="Notifications" onPress={() => navigation.navigate('MainTabs', { screen: 'Notifications' })} />
              <PrimaryButton title="Messages" onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })} />
              <PrimaryButton title="Profile" onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })} />
              <PrimaryButton title="Settings" onPress={() => navigation.navigate('Settings')} />
            </>
          ) : (
            <>
              <PrimaryButton title="Onboarding" onPress={() => navigation.navigate('Onboarding')} />
              <PrimaryButton title="Login" onPress={() => navigation.navigate('Login')} />
              <PrimaryButton title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
              <PrimaryButton title="Email Login" onPress={() => navigation.navigate('EmailLogin')} />
              <PrimaryButton title="Email Sign Up" onPress={() => navigation.navigate('EmailSignUp')} />
              <PrimaryButton title="Forgot Password" onPress={() => navigation.navigate('ForgotPasswordEmail')} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F3F3' },
  container: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '700', color: '#111111', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 16 },
  buttons: { gap: 10 },
});
