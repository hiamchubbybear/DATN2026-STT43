import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { apiClient } from '../../../services/api/apiClient';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';
import { swipeService, SwipeType } from '../../../services/api/swipeService';
import { useSwipeAction, useMyProfile } from '../../../services/api/useSwipe';
import { Logger } from '../../../shared/utils/logger';
import { useNotificationStore } from '../../../store/notificationStore';
import { useFocusEffect } from '@react-navigation/native';
import { IconHeart } from '../../../shared/components/icons/IconHeart';
import { IconClose } from '../../../shared/components/icons/IconClose';
import { MatchModal } from '../../home/components/MatchModal';

const defaultAvatar = require('../../../../assets/images/anh2.jpg');

export const MatchesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [matchData, setMatchData] = useState<{ isVisible: boolean; user: any | null }>({
    isVisible: false,
    user: null,
  });

  const swipeAction = useSwipeAction();
  const { data: myProfile } = useMyProfile();

  const fetchData = React.useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await swipeService.getMatches();
      setMatches(data);
    } catch (err) {
      Logger.error('Failed to fetch matches', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const setHasUnreadMatches = useNotificationStore(state => state.setHasUnreadMatches);

  useFocusEffect(
    React.useCallback(() => {
      setHasUnreadMatches(false);
      fetchData(false);
    }, [setHasUnreadMatches, fetchData])
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  }, [fetchData]);

  const sections = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: any[] } = {
      [t('common.today')]: [],
      [t('common.yesterday')]: [],
      [t('common.earlier')]: []
    };

    matches.forEach(m => {
      const matchDate = new Date(m.matchedAt);
      matchDate.setHours(0, 0, 0, 0);

      if (matchDate.getTime() === today.getTime()) {
        groups[t('common.today')].push(m);
      } else if (matchDate.getTime() === yesterday.getTime()) {
        groups[t('common.yesterday')].push(m);
      } else {
        groups[t('common.earlier')].push(m);
      }
    });

    return Object.keys(groups)
      .filter(key => groups[key].length > 0)
      .map(key => {
        const items = groups[key];
        const rows: any[][] = [];
        for (let i = 0; i < items.length; i += 2) {
          rows.push(items.slice(i, i + 2));
        }
        return { title: key, data: rows };
      });
  }, [matches, t]);

  const renderItem = React.useCallback(({ item }: { item: any[] }) => (
    <View style={styles.row}>
      {item.map((match) => (
        <TouchableOpacity 
          key={match.userId} 
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => setSelectedUser(match)}
        >
          <Image 
            source={match.avatarUrl ? { uri: match.avatarUrl } : defaultAvatar} 
            style={styles.cardImage} 
          />
          <View style={styles.overlay}>
            <View style={styles.nameRowItem}>
              <Text style={styles.name} numberOfLines={1}>{match.displayName}</Text>
              {match.isIdentityVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
              )}
            </View>

            <View style={styles.iconRow}>
              <View style={styles.roundIconDark}>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.roundIconLight}>
                <Ionicons name="heart" size={13} color="#EE3F57" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {item.length === 1 ? <View style={styles.cardPlaceholder} /> : null}
    </View>
  ), []);

  const renderSectionHeader = React.useCallback(({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionLabel}>{section.title}</Text>
  ), []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE3F57" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        sections={sections}
        keyExtractor={(_, index) => `row-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#EE3F57"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{t('matches.title')}</Text>
              <Text style={styles.subtitle}>{t('matches.subtitle')}</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
              <Ionicons name="options-outline" size={normalizeFont(18)} color="#EE3F57" />
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.bottomSpacer} />
        }
      />

      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionModalContent}>
            {selectedUser && (
              <>
                <Image 
                  source={selectedUser.avatarUrl ? { uri: selectedUser.avatarUrl } : defaultAvatar} 
                  style={styles.modalAvatar} 
                />
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalName}>{selectedUser.displayName}</Text>
                  {selectedUser.isIdentityVerified && (
                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.modalSubtitle}>{t('matches.like_back_prompt', 'Do you want to like them back?')}</Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#F3F4F6' }]}
                    onPress={() => {
                      swipeAction.mutate({ targetId: selectedUser.userId, type: SwipeType.Dislike });
                      setSelectedUser(null);
                      fetchData(false);
                    }}
                  >
                    <IconClose size={24} color="#F97316" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#F43F5E' }]}
                    onPress={() => {
                      swipeAction.mutate(
                        { targetId: selectedUser.userId, type: SwipeType.Like },
                        {
                          onSuccess: (data) => {
                            if (data.isMatch) {
                              setMatchData({ isVisible: true, user: selectedUser });
                            }
                            setSelectedUser(null);
                            fetchData(false);
                          }
                        }
                      );
                    }}
                  >
                    <IconHeart size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setSelectedUser(null)}
                >
                  <Text style={styles.modalCancelText}>{t('common.cancel', 'Cancel')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {myProfile && matchData.user && (
        <MatchModal
          isVisible={matchData.isVisible}
          currentUser={{
            name: myProfile.basicInfo?.displayName || t('common.me', 'Me'),
            avatar: myProfile.photos?.[0]?.url || '',
          }}
          matchedUser={{
            name: matchData.user.displayName,
            avatar: matchData.user.avatarUrl || '',
          }}
          onClose={() => setMatchData({ isVisible: false, user: null })}
          onSayHello={async () => {
            const matchedUserId = matchData.user?.userId;
            const matchedUserName = matchData.user?.displayName;
            const matchedUserAvatar = matchData.user?.avatarUrl;
            
            setMatchData({ isVisible: false, user: null });
            
            if (matchedUserId) {
              try {
                const response = await apiClient.get(`/api/chat/conversation/${matchedUserId}`);
                if (response.data?.success) {
                  navigation.navigate('ChatRoom', {
                    conversationId: response.data.data,
                    receiverId: matchedUserId,
                    receiverName: matchedUserName || t('common.user', 'User'),
                    receiverAvatar: matchedUserAvatar,
                  });
                }
              } catch (error) {
                Logger.error('Failed to start conversation:', error);
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: spacing(20) },
  scrollContent: {
    paddingTop: verticalScale(40),
    paddingBottom: spacing(100),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: spacing(24),
  },
  title: { fontSize: normalizeFont(28), fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: spacing(8), fontSize: normalizeFont(14), color: '#71717A', maxWidth: scale(260), lineHeight: verticalScale(20) },
  filterBtn: {
    marginTop: spacing(8),
    width: scale(34),
    height: scale(34),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    marginTop: spacing(18),
    marginBottom: spacing(8),
    fontSize: normalizeFont(12),
    color: '#A1A1AA',
    fontWeight: '600',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(12),
    marginBottom: spacing(12),
  },
  card: {
    width: '48%',
    height: verticalScale(180),
    borderRadius: radius(14),
    overflow: 'hidden',
    backgroundColor: '#D4D4D8',
  },
  cardPlaceholder: {
    width: '48%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing(10),
    paddingBottom: spacing(10),
    paddingTop: spacing(22),
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: normalizeFont(14),
    fontWeight: '700',
    flexShrink: 1,
  },
  nameRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconRow: {
    marginTop: spacing(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundIconDark: {
    width: scale(20),
    height: scale(20),
    borderRadius: radius(10),
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIconLight: {
    width: scale(20),
    height: scale(20),
    borderRadius: radius(10),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: verticalScale(84),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(20),
  },
  optionModalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: radius(24),
    padding: spacing(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing(16),
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(8),
  },
  modalName: {
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: normalizeFont(14),
    color: '#6B7280',
    marginBottom: spacing(24),
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(20),
    width: '100%',
    marginBottom: spacing(20),
  },
  modalActionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCancelButton: {
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(24),
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
});
