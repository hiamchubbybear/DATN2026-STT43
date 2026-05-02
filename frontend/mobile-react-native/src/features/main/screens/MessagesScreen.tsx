import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { UserDiscoverDto, userService } from '../../../services/api/userService';
import { Logger } from '../../../shared/utils/logger';

const defaultAvatar = require('../../../../assets/images/anh1.jpg');

export const MessagesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = React.useState<UserDiscoverDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.discoverUsers();
        setUsers(data);
      } catch (err: any) {
        Logger.error('Failed to fetch users', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

         <Text style={styles.sectionTitle}>Discover People (Test Chat)</Text>
        <View style={styles.activityRow}>
          {loading ? (
            <ActivityIndicator size="small" color="#EE3F57" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            users.map((item) => (
              <TouchableOpacity 
                key={item.userId} 
                style={styles.activityItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChatRoom', {
                  conversationId: item.userId, 
                  receiverId: item.userId,
                  receiverName: item.displayName
                })}
              >
                <View style={styles.activityAvatarRing}>
                  <Image 
                    source={item.avatarUrl ? { uri: item.avatarUrl } : defaultAvatar} 
                    style={styles.activityAvatar} 
                  />
                </View>
                <Text style={styles.activityLabel} numberOfLines={1}>{item.displayName}</Text>
              </TouchableOpacity>
            ))
          )}
          {!loading && !error && users.length === 0 && (
            <Text style={styles.emptyText}>No users found. Try registering another account!</Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, styles.messagesTitle]}>Recent Chats</Text>

        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Click a person above to start testing chat!</Text>
        </View>

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
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
    flex: 1,
  },
});
