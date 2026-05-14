import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { apiClient } from '../../../services/api/apiClient';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';

import { swipeService } from '../../../services/api/swipeService';
import { Logger } from '../../../shared/utils/logger';

const defaultAvatar = require('../../../../assets/images/anh2.jpg');

export const MatchesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

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
  }, [matches]);

  const renderItem = React.useCallback(({ item }: { item: any[] }) => (
    <View style={styles.row}>
      {item.map((match) => (
        <TouchableOpacity 
          key={match.userId} 
          style={styles.card}
          activeOpacity={0.9}
          onPress={async () => {
            try {
              const response = await apiClient.get(`/api/chat/conversation/${match.userId}`);
              if (response.data?.success) {
                navigation.navigate('ChatRoom', {
                  conversationId: response.data.data,
                  receiverId: match.userId,
                  receiverName: match.displayName,
                  receiverAvatar: match.avatarUrl
                });
              }
            } catch (err) {
              Logger.error('Failed to navigate to chat', err);
            }
          }}
        >
          <Image 
            source={match.avatarUrl ? { uri: match.avatarUrl } : defaultAvatar} 
            style={styles.cardImage} 
          />
          <View style={styles.overlay}>
            <Text style={styles.name}>{match.displayName}</Text>

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
  ), [navigation]);

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: spacing(20), paddingTop: spacing(4) },
  scrollContent: {
    paddingBottom: spacing(16),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  title: { fontSize: normalizeFont(34), fontWeight: '800', color: '#111111' },
  subtitle: { marginTop: spacing(6), fontSize: normalizeFont(13), color: '#71717A', maxWidth: scale(248), lineHeight: verticalScale(18) },
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
});
