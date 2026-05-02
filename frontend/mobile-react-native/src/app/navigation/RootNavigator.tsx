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
import { TestHubScreen } from '../../features/core/screens/TestHubScreen';
import { MainBottomTabs, MainTabParamList } from './MainBottomTabs';
import { SettingsScreen } from '../../features/main/screens/SettingsScreen';
import { EditProfileScreen } from '../../features/main/screens/EditProfileScreen';
import { EditGalleryScreen } from '../../features/main/screens/EditGalleryScreen';
import { DiscoverySettingsScreen } from '../../features/main/screens/DiscoverySettingsScreen';
import { MainScreen } from '../../features/main/screens/MainScreen';
import { NotificationsMainScreen } from '../../features/main/screens/NotificationsMainScreen';
import { MessagesScreen } from '../../features/main/screens/MessagesScreen';
import { MatchesScreen } from '../../features/main/screens/MatchesScreen';
import { ProfileMainScreen } from '../../features/main/screens/ProfileMainScreen';
import { ChatRoomScreen } from '../../features/chat/screens/ChatRoomScreen';

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
  Home: undefined;
  TestHub: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PreviewMainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Settings: undefined;
  EditProfile: undefined;
  EditGallery: undefined;
  DiscoverySettings: undefined;
  DemoDiscover: undefined;
  DemoNotifications: undefined;
  DemoMessages: undefined;
  DemoMatches: undefined;
  DemoProfile: undefined;
  ChatRoom: { conversationId: string; receiverId: string; receiverName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
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
              name="DiscoverySettings" 
              component={DiscoverySettingsScreen} 
            />
          </>
        )}
        <Stack.Screen 
          name="TestHub" 
          component={TestHubScreen} 
        />
        <Stack.Screen name="DemoDiscover" component={MainScreen} />
        <Stack.Screen name="DemoNotifications" component={NotificationsMainScreen} />
        <Stack.Screen name="DemoMessages" component={MessagesScreen} />
        <Stack.Screen name="DemoMatches" component={MatchesScreen} />
        <Stack.Screen name="DemoProfile" component={ProfileMainScreen} />
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoomScreen} 
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
