import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabButton,
        tabBarLabel: () => null,
        tabBarIcon: ({ focused }) => {
          const routeName = route.name as keyof MainTabParamList;
          const iconColor = focused ? '#EE3F57' : '#ADAFBB';

          return (
            <View style={styles.tabInner}>
              <View style={[styles.topLine, focused && styles.topLineActive]} />
              <Ionicons name={ICONS[routeName]} size={22} color={iconColor} />
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
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  tabInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  topLine: {
    width: 16,
    height: 3,
    borderRadius: 999,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  topLineActive: {
    backgroundColor: '#EE3F57',
  },
});
