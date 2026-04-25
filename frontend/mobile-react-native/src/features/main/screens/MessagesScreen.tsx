import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const avatars = [
  { id: 'a-1', name: 'You', image: require('../../../../assets/images/anh1.jpg') },
  { id: 'a-2', name: 'Emma', image: require('../../../../assets/images/anh2.jpg') },
  { id: 'a-3', name: 'Ava', image: require('../../../../assets/images/anh3.jpg') },
  { id: 'a-4', name: 'Sophia', image: require('../../../../assets/images/anh1.jpg') },
];

const conversations = [
  { id: 'c-1', name: 'Emelie', message: 'Sticker 😍', time: '23 min', unread: 1, image: require('../../../../assets/images/anh2.jpg') },
  { id: 'c-2', name: 'Abigail', message: 'Typing...', time: '27 min', unread: 2, image: require('../../../../assets/images/anh3.jpg') },
  { id: 'c-3', name: 'Elizabeth', message: 'Ok, see you then.', time: '33 min', unread: 0, image: require('../../../../assets/images/anh1.jpg') },
  { id: 'c-4', name: 'Penelope', message: "Yo! Hey! What's up, long time...", time: '50 min', unread: 0, image: require('../../../../assets/images/anh2.jpg') },
  { id: 'c-5', name: 'Chloe', message: 'You: Hello how are you?', time: '55 min', unread: 0, image: require('../../../../assets/images/anh3.jpg') },
  { id: 'c-6', name: 'Grace', message: 'You: Great! what was your last tr... ', time: '1 hour', unread: 0, image: require('../../../../assets/images/anh1.jpg') },
];

export const MessagesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headTop}>
          <Text style={styles.clock}>4:20</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={18} color="#EE3F57" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Messages</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#A1A1AA" />
          <Text style={styles.searchText}>Search</Text>
        </View>

        <Text style={styles.sectionTitle}>Activities</Text>
        <View style={styles.activityRow}>
          {avatars.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityAvatarRing}>
                <Image source={item.image} style={styles.activityAvatar} />
              </View>
              <Text style={styles.activityLabel}>{item.name}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.messagesTitle]}>Messages</Text>

        {conversations.map((item) => (
          <View key={item.id} style={styles.messageRow}>
            <Image source={item.image} style={styles.avatar} />

            <View style={styles.messageMeta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.preview}>{item.message}</Text>
            </View>

            <View style={styles.trailing}>
              <Text style={styles.time}>{item.time}</Text>
              {item.unread > 0 ? (
                <View style={styles.unreadBubble}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 2 },
  headTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clock: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#111111' },
  searchWrap: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchText: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 15,
    color: '#111111',
    fontWeight: '700',
  },
  activityRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityItem: {
    alignItems: 'center',
    width: 68,
  },
  activityAvatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FF7A8B',
    padding: 2,
  },
  activityAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  activityLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#18181B',
    fontWeight: '500',
  },
  messagesTitle: {
    marginTop: 18,
  },
  messageRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageMeta: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    color: '#111111',
    fontWeight: '700',
  },
  preview: {
    marginTop: 2,
    fontSize: 13,
    color: '#71717A',
  },
  trailing: {
    alignItems: 'flex-end',
    minWidth: 48,
    gap: 5,
  },
  time: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  unreadBubble: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EE3F57',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 84,
  },
});
