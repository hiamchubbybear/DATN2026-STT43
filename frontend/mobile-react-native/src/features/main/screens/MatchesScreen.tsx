import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';

const matchCards = [
  { id: 'm-1', name: 'Leilani, 19', image: require('../../../../assets/images/anh1.jpg'), section: 'Today' },
  { id: 'm-2', name: 'Annabelle, 20', image: require('../../../../assets/images/anh2.jpg'), section: 'Today' },
  { id: 'm-3', name: 'Reagan, 24', image: require('../../../../assets/images/anh3.jpg'), section: 'Today' },
  { id: 'm-4', name: 'Adry, 25', image: require('../../../../assets/images/anh1.jpg'), section: 'Today' },
  { id: 'm-5', name: 'Sofia, 21', image: require('../../../../assets/images/anh2.jpg'), section: 'Yesterday' },
  { id: 'm-6', name: 'Cassie, 23', image: require('../../../../assets/images/anh3.jpg'), section: 'Yesterday' },
];

const SECTION_ORDER = ['Today', 'Yesterday'] as const;
const INITIAL_BATCH = 4;
const LOAD_MORE_BATCH = 2;

export const MatchesScreen = () => {
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_BATCH);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const visibleItems = React.useMemo(() => matchCards.slice(0, visibleCount), [visibleCount]);
  const sections = React.useMemo(() => {
    return SECTION_ORDER
      .map((section) => {
        const items = visibleItems.filter((item) => item.section === section);
        const rows: Array<Array<typeof matchCards[number]>> = [];

        for (let index = 0; index < items.length; index += 2) {
          rows.push(items.slice(index, index + 2));
        }

        return { title: section, data: rows };
      })
      .filter((section) => section.data.length > 0);
  }, [visibleItems]);

  React.useEffect(() => {
    if (loadingMore) {
      setLoadingMore(false);
    }
  }, [loadingMore, visibleCount]);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setVisibleCount(INITIAL_BATCH);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  const handleLoadMore = React.useCallback(() => {
    if (loadingMore || visibleCount >= matchCards.length) {
      return;
    }
    setLoadingMore(true);
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH, matchCards.length));
  }, [loadingMore, visibleCount]);

  const renderItem = React.useCallback(({ item }: { item: Array<typeof matchCards[number]> }) => (
    <View style={styles.row}>
      {item.map((match) => (
        <View key={match.id} style={styles.card}>
          <Image source={match.image} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.name}>{match.name}</Text>

            <View style={styles.iconRow}
            >
              <View style={styles.roundIconDark}>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.roundIconLight}>
                <Ionicons name="heart" size={13} color="#EE3F57" />
              </View>
            </View>
          </View>
        </View>
      ))}
      {item.length === 1 ? <View style={styles.cardPlaceholder} /> : null}
    </View>
  ), []);

  const renderSectionHeader = React.useCallback(({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionLabel}>{section.title}</Text>
  ), []);

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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
              <Text style={styles.title}>Matches</Text>
              <Text style={styles.subtitle}>This is a list of people who have liked you and your matches.</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
              <Ionicons name="options-outline" size={normalizeFont(18)} color="#EE3F57" />
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.bottomSpacer}>
            {loadingMore ? <ActivityIndicator color="#EE3F57" /> : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
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
