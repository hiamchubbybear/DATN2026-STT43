import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainScreen } from '../../features/main/screens/MainScreen';
import { MatchesScreen } from '../../features/main/screens/MatchesScreen';
import { NotificationsMainScreen } from '../../features/main/screens/NotificationsMainScreen';
import { MessagesScreen } from '../../features/main/screens/MessagesScreen';
import { ProfileMainScreen } from '../../features/main/screens/ProfileMainScreen';
import { normalizeFont, radius, scale, spacing } from '../../shared/utils/responsive';

export type MainTabParamList = {
  Main: undefined;
  Matches: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<
  keyof MainTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Main: { active: 'albums', inactive: 'albums-outline' },
  Matches: { active: 'heart', inactive: 'heart-outline' },
  Messages: { active: 'chatbubble', inactive: 'chatbubble-ellipses-outline' },
  Notifications: { active: 'notifications', inactive: 'notifications-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export const MainBottomTabs = () => {
  const insets = useSafeAreaInsets();
  const tabBottomOffset = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { bottom: tabBottomOffset }],
        tabBarItemStyle: styles.tabButton,
        tabBarLabel: () => null,
        tabBarActiveTintColor: '#EE3F57',
        tabBarInactiveTintColor: '#A8ADB8',
        tabBarIcon: ({ focused, color }) => {
          const routeName = route.name as keyof MainTabParamList;
          const iconName = focused ? ICONS[routeName].active : ICONS[routeName].inactive;

          return (
            <View style={styles.tabInner}>
              <Ionicons name={iconName} size={normalizeFont(22)} color={color} />
              {focused ? <View style={styles.activeDot} /> : null}
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
    left: 0,
    right: 0,
    bottom: 0,
    height: scale(58),
    borderRadius: 0,
    backgroundColor: '#ECEFF3',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  tabInner: {
    width: scale(28),
    height: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: spacing(2),
    right: 0,
    width: scale(8),
    height: scale(8),
    borderRadius: radius(999),
    backgroundColor: '#EE3F57',
    borderWidth: scale(1.5),
    borderColor: '#ECEFF3',
  },
});
