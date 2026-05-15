import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { swipeService, UserProfileDto } from '../../../services/api/swipeService';

const { width } = Dimensions.get('window');

// --- SVGs ---
const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgFilter = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 6H20M4 12H12M16 12H20M4 18H20" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="14" cy="12" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
    <Circle cx="8" cy="6" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
    <Circle cx="16" cy="18" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
  </Svg>
);

const SvgDoubleUp = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M7 11L12 6L17 11M7 17L12 12L17 17" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgDoubleDown = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M7 7L12 12L17 7M7 13L12 18L17 13" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgHeart = () => (
  <Svg width="36" height="36" viewBox="0 0 24 24" fill="#9333EA">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const SvgCross = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgHeartSolid = () => (
  <Svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const SvgStar = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="#9333EA">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const SvgLocation = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" stroke="#FFFFFF" strokeWidth="2" />
  </Svg>
);

const SvgGradientOverlay = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
        <Stop offset="40%" stopColor="#000000" stopOpacity="0.4" />
        <Stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#grad)" />
  </Svg>
);

export const MainScreen = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>{t('onboarding.title')}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <SvgFilter />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.introText}>
            {t('onboarding.intro')}
          </Text>

          <View style={styles.gestureSection}>
            <SvgDoubleUp />
            <Text style={styles.swipeUpTitle}>{t('onboarding.swipe_up_title')}</Text>
            <Text style={styles.noteText}>{t('onboarding.swipe_up_note')}</Text>
          </View>

          <View style={styles.blobContainer}>
            <View style={styles.blobPink} />
            <View style={styles.blobPurple} />
          </View>

          <View style={styles.gestureSection}>
            <Text style={styles.swipeDownTitle}>{t('onboarding.swipe_down_title')}</Text>
            <Text style={styles.noteText}>{t('onboarding.swipe_down_note')}</Text>
            <View style={styles.heartContainer}>
              <SvgHeart />
              <View style={styles.chevronDownWrap}>
                <SvgDoubleDown />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowOnboarding(false)}>
            <Text style={styles.primaryButtonText}>{t('onboarding.got_it')}</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>{t('onboarding.step_complete')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!showOnboarding) {
      fetchUsers();
    }
  }, [showOnboarding]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await swipeService.getFeed();
      setUsers(data || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users[currentIndex];

  const handleNext = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      fetchUsers();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      );
    }

    if (!currentUser) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>{t('discover.no_users_title') || 'No more people'}</Text>
          <Text style={styles.emptyText}>{t('discover.no_users_desc') || 'Try changing your filters or check back later'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>{t('common.retry') || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardBackground} />
        <View style={styles.card}>
          {currentUser.photos && currentUser.photos.length > 0 ? (
            <Image source={{ uri: currentUser.photos[0] }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={100} color="#D1D5DB" />
            </View>
          )}

          <View style={styles.distanceTag}>
            <SvgLocation />
            <Text style={styles.distanceText}>
              {currentUser.distanceKm !== undefined ? `${Math.round(currentUser.distanceKm)} km` : '1 km'}
            </Text>
          </View>

          <View style={styles.paginationDots}>
            {currentUser.photos?.slice(0, 5).map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === 0 && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.cardOverlay}>
            <SvgGradientOverlay />
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>{currentUser.displayName}, {currentUser.age}</Text>
                {currentUser.isIdentityVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" style={{ marginLeft: 6 }} />
                )}
              </View>
              <Text style={styles.cardBio} numberOfLines={1}>
                {currentUser.bio || currentUser.occupation || t('common.no_bio')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // --- CARDS VIEW ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('DiscoverySettings')}>
          <SvgFilter />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>{t('discover.title')}</Text>
          <Text style={styles.headerSubtitle}>{currentUser?.locationName || t('common.nearby')}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      {renderContent()}

      <View style={[
        styles.actionButtons, 
        { paddingBottom: insets.bottom + 10 } 
      ]}>
        <TouchableOpacity style={styles.actionButtonSmall} onPress={handleNext}>
          <SvgCross />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButtonLarge}
          onPress={async () => {
            try {
              await swipeService.swipeAction(currentUser.userId, 1);
              handleNext();
            } catch (e) {
              handleNext();
            }
          }}
        >
          <SvgHeartSolid />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSmall}>
          <SvgStar />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(24),
    paddingTop: spacing(12),
    paddingBottom: spacing(8),
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: normalizeFont(24),
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: normalizeFont(12),
    color: '#6B7280',
    marginTop: spacing(2),
  },
  iconButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: radius(16),
    borderWidth: scale(1.5),
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing(40),
  },
  emptyTitle: {
    fontSize: normalizeFont(24),
    fontWeight: '800',
    color: '#111827',
    marginTop: spacing(24),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: normalizeFont(16),
    color: '#6B7280',
    marginTop: spacing(12),
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: spacing(32),
    backgroundColor: '#F43F5E',
    paddingHorizontal: spacing(32),
    paddingVertical: spacing(14),
    borderRadius: radius(16),
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  // --- ONBOARDING STYLES ---
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing(32),
    paddingTop: spacing(24),
  },
  introText: {
    textAlign: 'center',
    fontSize: normalizeFont(15),
    color: '#4B5563',
    lineHeight: verticalScale(22),
    marginBottom: spacing(40),
    paddingHorizontal: spacing(20),
  },
  gestureSection: {
    alignItems: 'center',
    zIndex: 10,
  },
  swipeUpTitle: {
    fontSize: normalizeFont(20),
    fontWeight: '800',
    color: '#374151',
    marginTop: spacing(12),
    marginBottom: spacing(6),
  },
  swipeDownTitle: {
    fontSize: normalizeFont(20),
    fontWeight: '800',
    color: '#A855F7',
    marginBottom: spacing(6),
  },
  noteText: {
    fontSize: normalizeFont(10),
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  blobContainer: {
    height: verticalScale(120),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing(10),
  },
  blobPink: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: radius(70),
    backgroundColor: '#FBCFE8',
    opacity: 0.4,
    top: -spacing(20),
    left: width / 2 - 120,
  },
  blobPurple: {
    position: 'absolute',
    width: scale(120),
    height: scale(120),
    borderRadius: radius(60),
    backgroundColor: '#E9D5FF',
    opacity: 0.4,
    bottom: -spacing(20),
    right: width / 2 - 100,
  },
  heartContainer: {
    alignItems: 'center',
    marginTop: spacing(20),
  },
  chevronDownWrap: {
    marginTop: -spacing(8),
  },
  footer: {
    paddingHorizontal: spacing(32),
    paddingBottom: verticalScale(84),
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: scale(60),
    backgroundColor: '#F43F5E',
    borderRadius: radius(30),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: spacing(24),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(18),
    fontWeight: '700',
  },
  stepText: {
    fontSize: normalizeFont(11),
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // --- CARDS STYLES ---
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(20),
    paddingTop: spacing(16),
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius(24),
    overflow: 'hidden',
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBackground: {
    position: 'absolute',
    top: spacing(4),
    width: '88%',
    height: '100%',
    backgroundColor: '#DBEAFE',
    borderRadius: radius(24),
    zIndex: -1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  distanceTag: {
    position: 'absolute',
    top: spacing(20),
    left: spacing(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(8),
    borderRadius: radius(12),
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(13),
    fontWeight: '600',
    marginLeft: spacing(6),
  },
  paginationDots: {
    position: 'absolute',
    right: spacing(16),
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: spacing(14),
    paddingHorizontal: spacing(8),
    borderRadius: radius(20),
    gap: spacing(8),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: radius(3),
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(180),
    justifyContent: 'flex-end',
  },
  cardInfo: {
    padding: spacing(24),
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: normalizeFont(28),
    fontWeight: '800',
    marginBottom: spacing(6),
  },
  cardBio: {
    color: '#E5E7EB',
    fontSize: normalizeFont(15),
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(84),
    paddingTop: spacing(24),
    gap: spacing(24),
  },
  actionButtonSmall: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius(32),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  actionButtonLarge: {
    width: scale(84),
    height: scale(84),
    borderRadius: radius(42),
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
});
