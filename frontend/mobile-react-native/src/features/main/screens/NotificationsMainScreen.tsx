import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';

// const matchBubbles = [
//   {
//     id: 'likes',
//     type: 'likes',
//     label: '20+ Likes',
//     image: require('../../../../assets/images/anh2.jpg'),
//   },
//   {
//     id: 'm-1',
//     type: 'match',
//     label: 'Chloe',
//     image: require('../../../../assets/images/anh1.jpg'),
//     unread: true,
//   },
//   {
//     id: 'm-2',
//     type: 'match',
//     label: 'Sofia',
//     image: require('../../../../assets/images/anh3.jpg'),
//     unread: true,
//   },
//   {
//     id: 'm-3',
//     type: 'match',
//     label: 'Leilani',
//     image: require('../../../../assets/images/anh2.jpg'),
//     unread: false,
//   },
// ];

const alertItems = [
  {
    id: 'a-1',
    name: 'Profile Boost',
    message: 'Your profile was shown to 50 more people today.',
    time: '1h',
    unread: true,
    icon: 'flash',
    tone: '#F27121',
    bg: '#FFF1E6',
  },
  {
    id: 'a-2',
    name: 'New Match!',
    message: 'You and Leilani liked each other. Send a message!',
    time: '2h',
    unread: false,
    icon: 'heart',
    tone: '#8A2387',
    bg: '#F5E9FF',
  },
  {
    id: 'a-3',
    name: 'Profile Verified',
    message: 'Your identity has been successfully verified.',
    time: 'Yesterday',
    unread: false,
    icon: 'shield-checkmark',
    tone: '#EE3F57',
    bg: '#FDECEF',
  },
  {
    id: 'a-4',
    name: 'Weekend Premium Offer',
    message: 'Get 50% off Premium to see who liked you.',
    time: '2d',
    unread: false,
    icon: 'star',
    tone: '#F27121',
    bg: '#FFF1E6',
  },
];

export const NotificationsMainScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Notifications</Text>

        {/* <Text style={styles.sectionTitleAccent}>New Matches</Text> */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bubbleRow}
        >
          {/* {matchBubbles.map((item) => (
            <View key={item.id} style={styles.bubbleItem}>
              <View
                style={[
                  styles.bubbleRing,
                  item.type === 'likes' ? styles.bubbleRingLikes : styles.bubbleRingMatch,
                ]}
              >
                <Image
                  source={item.image}
                  style={[styles.bubbleAvatar, item.type === 'likes' && styles.bubbleBlur]}
                />
                {item.type === 'likes' ? (
                  <View style={styles.likeBadge}>
                    <Ionicons name="heart" size={normalizeFont(12)} color="#FFFFFF" />
                  </View>
                ) : null}
                {item.type === 'match' && item.unread ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.bubbleLabel}>{item.label}</Text>
            </View>
          ))} */}
        </ScrollView>

        <Text style={styles.sectionTitle}>Alerts & Activity</Text>
        <View style={styles.list}>
          {alertItems.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View style={styles.leading}>
                <View style={[styles.alertIconWrap, { backgroundColor: item.bg }]}
                >
                  <Ionicons
                    name={
                      item.icon === 'heart'
                        ? 'heart'
                        : item.icon === 'shield-checkmark'
                        ? 'shield-checkmark'
                        : item.icon === 'star'
                        ? 'star'
                        : 'flash'
                    }
                    size={normalizeFont(18)}
                    color={item.tone}
                  />
                </View>
              </View>

              <View style={styles.listBody}>
                <Text style={[styles.listTitle, item.unread && styles.listTitleUnread]}>{item.name}</Text>
                <Text style={styles.listMessage} numberOfLines={1}>{item.message}</Text>
              </View>

              <View style={styles.listMeta}>
                <Text style={styles.timeText}>{item.time}</Text>
                {item.unread ? <View style={styles.timeDot} /> : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing(20),
    paddingTop: spacing(10),
    paddingBottom: spacing(120),
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '800',
    color: '#333333',
    marginBottom: spacing(10),
  },
  sectionTitleAccent: {
    fontSize: normalizeFont(12),
    fontWeight: '700',
    color: '#EE3F57',
    letterSpacing: 0.4,
    marginBottom: spacing(8),
  },
  bubbleRow: {
    paddingBottom: spacing(6),
    gap: spacing(16),
  },
  bubbleItem: {
    alignItems: 'center',
  },
  bubbleRing: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  bubbleRingLikes: {
    borderColor: '#8A2387',
  },
  bubbleRingMatch: {
    borderColor: '#EE3F57',
  },
  bubbleAvatar: {
    width: scale(58),
    height: scale(58),
    borderRadius: radius(29),
  },
  bubbleBlur: {
    opacity: 0.35,
  },
  bubbleLabel: {
    marginTop: spacing(6),
    fontSize: normalizeFont(11),
    fontWeight: '600',
    color: '#333333',
  },
  unreadDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: scale(10),
    height: scale(10),
    borderRadius: radius(5),
    backgroundColor: '#EE3F57',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  likeBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: scale(18),
    height: scale(18),
    borderRadius: radius(9),
    backgroundColor: '#8A2387',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: spacing(8),
    marginBottom: spacing(6),
    fontSize: normalizeFont(13),
    fontWeight: '700',
    color: '#333333',
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leading: {
    width: scale(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: {
    flex: 1,
    paddingRight: spacing(12),
  },
  listTitle: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#333333',
  },
  listTitleUnread: {
    color: '#111111',
  },
  listMessage: {
    marginTop: spacing(4),
    fontSize: normalizeFont(12),
    color: '#ADAFBB',
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: spacing(4),
  },
  timeText: {
    fontSize: normalizeFont(11),
    color: '#ADAFBB',
  },
  timeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: radius(4),
    backgroundColor: '#EE3F57',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: verticalScale(70),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: spacing(10),
  },
  navItem: {
    width: scale(44),
    height: scale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: spacing(6),
    left: '50%',
    marginLeft: -scale(60),
    width: scale(120),
    height: verticalScale(4),
    borderRadius: radius(3),
    backgroundColor: '#E2E8F0',
  },
});
