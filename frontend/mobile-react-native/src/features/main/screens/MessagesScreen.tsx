import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { apiClient } from '../../../services/api/apiClient';
import { Logger } from '../../../shared/utils/logger';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../../store/notificationStore';
import { useFocusEffect } from '@react-navigation/native';

const defaultAvatar = require('../../../../assets/images/anh1.jpg');

export const MessagesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const convResponse = await apiClient.get('/api/chat/conversations');
      if (convResponse.data?.success) {
        setConversations(convResponse.data.data);
      }
    } catch (err: any) {
      Logger.error('Failed to fetch data', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const setHasUnreadMessages = useNotificationStore(state => state.setHasUnreadMessages);

  useFocusEffect(
    React.useCallback(() => {
      setHasUnreadMessages(false);
    }, [setHasUnreadMessages])
  );

  React.useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EE3F57" />
        }
      >
        <View style={styles.headTop}>
          <Text style={styles.clock}>4:20</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={normalizeFont(18)} color="#EE3F57" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t('chat.title')}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={normalizeFont(16)} color="#A1A1AA" />
          <Text style={styles.searchText}>{t('chat.search')}</Text>
        </View>

        <Text style={[styles.sectionTitle, styles.messagesTitle]}>{t('chat.recent_chats')}</Text>

        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <TouchableOpacity 
              key={conv.id} 
              style={styles.messageRow}
              onPress={() => navigation.navigate('ChatRoom', {
                conversationId: conv.id,
                receiverId: conv.otherParticipantId,
                receiverName: conv.otherParticipantName,
                receiverAvatar: conv.otherParticipantAvatar
              })}
            >
              <Image 
                source={conv.otherParticipantAvatar ? { uri: conv.otherParticipantAvatar } : defaultAvatar} 
                style={styles.avatar} 
              />
              <View style={styles.messageMeta}>
                <Text style={styles.name}>{conv.otherParticipantName}</Text>
                <Text style={styles.preview} numberOfLines={1}>{conv.lastMessage || t('chat.no_messages')}</Text>
              </View>
              <View style={styles.trailing}>
                <Text style={styles.time}>
                  {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('chat.empty_state')}</Text>
            <Text style={[styles.emptyText, { marginTop: spacing(8), fontSize: normalizeFont(12) }]}>
              {t('chat.pull_to_refresh')}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: spacing(20) },
  headTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(6),
  },
  clock: {
    color: '#111111',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },
  filterBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: normalizeFont(34), fontWeight: '800', color: '#111111' },
  searchWrap: {
    marginTop: spacing(12),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(8),
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(10),
  },
  searchText: {
    fontSize: normalizeFont(13),
    color: '#A1A1AA',
  },
  sectionTitle: {
    marginTop: spacing(16),
    fontSize: normalizeFont(15),
    color: '#111111',
    fontWeight: '700',
  },
  activityRow: {
    marginTop: spacing(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityItem: {
    alignItems: 'center',
    width: scale(68),
  },
  activityAvatarRing: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius(28),
    borderWidth: 2,
    borderColor: '#FF7A8B',
    padding: spacing(2),
  },
  activityAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius(26),
  },
  activityLabel: {
    marginTop: spacing(6),
    fontSize: normalizeFont(12),
    color: '#18181B',
    fontWeight: '500',
  },
  messagesTitle: {
    marginTop: spacing(18),
  },
  messageRow: {
    marginTop: spacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(10),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: radius(25),
  },
  messageMeta: {
    flex: 1,
  },
  name: {
    fontSize: normalizeFont(15),
    color: '#111111',
    fontWeight: '700',
  },
  preview: {
    marginTop: spacing(2),
    fontSize: normalizeFont(13),
    color: '#71717A',
  },
  trailing: {
    alignItems: 'flex-end',
    minWidth: scale(48),
    gap: spacing(5),
  },
  time: {
    fontSize: normalizeFont(11),
    color: '#A1A1AA',
    fontWeight: '600',
  },
  unreadBubble: {
    minWidth: scale(20),
    height: scale(20),
    borderRadius: radius(10),
    backgroundColor: '#EE3F57',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  unreadText: {
    fontSize: normalizeFont(11),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomSpacer: {
    height: verticalScale(84),
  },
  emptyState: {
    marginTop: spacing(40),
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(20),
  },
  emptyText: {
    fontSize: normalizeFont(14),
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: verticalScale(20),
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
    flex: 1,
  },
});
