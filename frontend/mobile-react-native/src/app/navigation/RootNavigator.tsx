import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../../features/onboarding/screens/OnboardingScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { SignUpScreen } from '../../features/auth/screens/SignUpScreen';
import EmailSignUpDetailsScreen from '../../features/auth/screens/EmailSignUpDetailsScreen';
import EmailSignUpVerifyScreen from '../../features/auth/screens/EmailSignUpVerifyScreen';
import EmailLoginScreen from '../../features/auth/screens/EmailLoginScreen';
import ForgotPasswordEmailScreen from '../../features/auth/screens/forgot-password/ForgotPasswordEmailScreen';
import ForgotPasswordVerifyScreen from '../../features/auth/screens/forgot-password/ForgotPasswordVerifyScreen';
import ResetPasswordScreen from '../../features/auth/screens/forgot-password/ResetPasswordScreen';
import { useAuthStore } from '../../store/authStore';
import ProfileSetupScreen from '../../features/auth/screens/ProfileSetupScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { MainBottomTabs, MainTabParamList } from './MainBottomTabs';
import { PermissionScreen } from '../../features/onboarding/screens/PermissionScreen';
import { DiscoverySettingScreen } from '../../features/onboarding/screens/DiscoverySettingScreen';
import { SettingsScreen } from '../../features/main/screens/SettingsScreen';
import { EditProfileScreen } from '../../features/main/screens/EditProfileScreen';
import { EditGalleryScreen } from '../../features/main/screens/EditGalleryScreen';
import { UserProfileScreen } from '../../features/main/screens/UserProfileScreen';
import { ChatRoomScreen } from '../../features/chat/screens/ChatRoomScreen';
import { IdentityVerificationScreen } from '../../features/main/screens/IdentityVerificationScreen';
import { AppFeedbackScreen } from '../../features/main/screens/AppFeedbackScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  EmailSignUp: undefined;
  EmailSignUpVerify: { email: string };
  EmailLogin: undefined;
  ForgotPasswordEmail: undefined;
  ForgotPasswordVerify: { email: string };
  ResetPassword: { email: string; token: string };
  ProfileSetup: undefined;
  Permission: undefined;
  DiscoverySetting: undefined;
  Home: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Settings: undefined;
  EditProfile: undefined;
  EditGallery: undefined;
  UserProfile: { userId: string };
  ReportHistory: undefined;
  IdentityVerification: undefined;
  AppFeedback: undefined;
  ChatRoom: { conversationId: string; receiverId: string; receiverName: string; receiverAvatar?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { ReportHistoryScreen } from '../../features/main/screens/ReportHistoryScreen';

export const RootNavigator = () => {
  const { isAuthenticated, isProfileCompleted } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="EmailSignUp" component={EmailSignUpDetailsScreen} />
            <Stack.Screen name="EmailSignUpVerify" component={EmailSignUpVerifyScreen} />
            <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
            <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmailScreen} />
            <Stack.Screen name="ForgotPasswordVerify" component={ForgotPasswordVerifyScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : !isProfileCompleted ? (
          // Setup Stack
          <>
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="Permission" component={PermissionScreen} />
            <Stack.Screen name="DiscoverySetting" component={DiscoverySettingScreen} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
            <Stack.Screen name="AppFeedback" component={AppFeedbackScreen} />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainBottomTabs} 
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Feed', headerShown: true }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
            />
            <Stack.Screen 
              name="EditGallery" 
              component={EditGalleryScreen} 
            />
            <Stack.Screen 
              name="UserProfile" 
              component={UserProfileScreen} 
            />
            <Stack.Screen 
              name="ReportHistory" 
              component={ReportHistoryScreen} 
            />
            <Stack.Screen 
              name="IdentityVerification" 
              component={IdentityVerificationScreen} 
            />
          </>
        )}
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoomScreen} 
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
