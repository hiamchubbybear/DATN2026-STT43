import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

type FilterType = 'ALL' | 'MATCHES' | 'LIKES';

const activeFilter: FilterType = 'ALL';

const notifications = [
  {
    id: 'n-1',
    section: 'Today',
    title: 'New Message from Sarah',
    desc: 'That hiking trip looks amazing! Where was it?',
    time: '13M AGO',
    icon: '👩‍🦱',
    tone: '#FFE3D1',
  },
  {
    id: 'n-2',
    section: 'Today',
    title: 'Someone Liked You!',
    desc: 'Upgrade to see who is interested in you.',
    time: '2H AGO',
    icon: '⭐',
    tone: '#F1EBFF',
  },
  {
    id: 'n-3',
    section: 'Yesterday',
    title: 'Profile Boost',
    desc: 'Your profile was shown to 50 more people today!',
    time: 'YESTERDAY',
    icon: '✨',
    tone: '#F4EEFF',
  },
  {
    id: 'n-4',
    section: 'Earlier this week',
    title: 'Say hi to Chloe',
    desc: 'It’s been a while since you matched. Don’t let it go cold!',
    time: '3D AGO',
    icon: '👩',
    tone: '#FFE3D1',
  },
];

export const NotificationsMainScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.filters}>
          {(['ALL', 'MATCHES', 'LIKES'] as FilterType[]).map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]} activeOpacity={0.85}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {notifications.map((item, index) => {
          const prevSection = notifications[index - 1]?.section;
          const showSection = item.section !== prevSection;

          return (
            <View key={item.id}>
              {showSection ? <Text style={styles.sectionLabel}>{item.section}</Text> : null}
              <View style={styles.itemCard}>
                <View style={[styles.iconWrap, { backgroundColor: item.tone }]}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>

                <View style={styles.meta}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemText}>{item.desc}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 4 },
  title: { fontSize: 34, fontWeight: '800', color: '#121212', alignSelf: 'center' },
  filters: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#EE3F57',
    borderColor: '#EE3F57',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#A1A1AA',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 12,
    color: '#A1A1AA',
    alignSelf: 'center',
    fontWeight: '500',
  },
  itemCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  meta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    color: '#18181B',
    fontWeight: '700',
  },
  timeText: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '700',
  },
  itemText: {
    marginTop: 4,
    fontSize: 13,
    color: '#71717A',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 84,
  },
});
