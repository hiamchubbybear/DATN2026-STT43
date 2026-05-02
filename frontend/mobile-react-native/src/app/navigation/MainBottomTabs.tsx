import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainScreen } from '../../features/main/screens/MainScreen';
import { MatchesScreen } from '../../features/main/screens/MatchesScreen';
import { NotificationsMainScreen } from '../../features/main/screens/NotificationsMainScreen';
import { MessagesScreen } from '../../features/main/screens/MessagesScreen';
import { ProfileMainScreen } from '../../features/main/screens/ProfileMainScreen';

export type MainTabParamList = {
  Main: undefined;
  Matches: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Main: 'albums',
  Matches: 'heart-outline',
  Messages: 'chatbubble-ellipses-outline',
  Notifications: 'notifications-outline',
  Profile: 'person-outline',
};

export const MainBottomTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom - 15 : 0,
          }
        ],
        tabBarItemStyle: styles.tabButton,
        tabBarLabel: () => null,
        tabBarIcon: ({ focused }) => {
          const routeName = route.name as keyof MainTabParamList;
          const iconColor = focused ? '#EE3F57' : '#ADAFBB';

          return (
            <View style={styles.tabInner}>
              <View style={[styles.topLine, focused && styles.topLineActive]} />
              <Ionicons name={ICONS[routeName]} size={24} color={iconColor} />
            </View>
          );
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsMainScreen} />
      <Tab.Screen name="Profile" component={ProfileMainScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  topLine: {
    width: 12,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  topLineActive: {
    backgroundColor: '#EE3F57',
  },
});


