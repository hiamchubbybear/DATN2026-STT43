import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeFeed, useSwipeAction } from '../../../services/api/useSwipe';
import { SwipeableCard, SwipeableCardRef } from '../components/SwipeableCard';
import { SwipeType, UserProfileDto } from '../../../services/api/swipeService';
import { IconFilter } from '../../../shared/components/icons/IconFilter';
import { IconHeart } from '../../../shared/components/icons/IconHeart';
import { IconClose } from '../../../shared/components/icons/IconClose';
import { IconStar } from '../../../shared/components/icons/IconStar';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';
import { Modal } from 'react-native';
import { ProfileDetail } from '../components/ProfileDetail';
import { FilterModal } from '../components/FilterModal';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState({
    gender: 'Everyone',
    minAge: 18,
    maxAge: 35,
    distance: 50,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: feedData, isLoading, refetch, isFetching } = useSwipeFeed(filters);
  const swipeAction = useSwipeAction();

  const [profiles, setProfiles] = useState<UserProfileDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileDto | null>(null);
  const fetchingMore = useRef(false);
  const cardRefs = useRef<{[key: string]: SwipeableCardRef}>({});

  // Reset profiles when filters change to trigger fresh data load
  useEffect(() => {
    setProfiles([]);
    setCurrentIndex(0);
  }, [filters]);

  // Initialize profiles when feedData is loaded
  useEffect(() => {
    if (feedData && feedData.length > 0) {
      // If we are resetting (e.g. filter change), replace entirely
      if (currentIndex === 0 && profiles.length === 0) {
        setProfiles(feedData);
      } else {
        // Otherwise, append only new profiles
        const newProfiles = feedData.filter(
          newP => !profiles.find(p => p.userId === newP.userId)
        );
        if (newProfiles.length > 0) {
          setProfiles(prev => [...prev, ...newProfiles]);
        }
      }
      fetchingMore.current = false;
    }
  }, [feedData, currentIndex]);

  // Pre-fetch logic & Image preloading
  useEffect(() => {
    if (profiles.length > 0) {
      // Preload images for the next 5 profiles
      const nextProfiles = profiles.slice(currentIndex, currentIndex + 5);
      const urlsToPreload = nextProfiles.flatMap(p => p.photos);
      Image.prefetch(urlsToPreload);

      if (currentIndex >= profiles.length - 5 && !fetchingMore.current && !isFetching) {
        fetchingMore.current = true;
        refetch();
      }
    }
  }, [currentIndex, profiles, isFetching]);

  const handleSwipe = useCallback((type: SwipeType) => {
    // Safety check: ensure we have a valid profile at the current index
    const swipedProfile = profiles[currentIndex];
    if (!swipedProfile) {
      console.warn('[HomeScreen] Attempted to swipe but profile is undefined at index:', currentIndex);
      return;
    }

    // Trigger API call
    swipeAction.mutate({ 
      targetId: swipedProfile.userId, 
      type 
    });

    // Move to next card
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, profiles, swipeAction]); // Added profiles to dependencies

  const onButtonPress = (type: SwipeType) => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile && cardRefs.current[currentProfile.userId]) {
      cardRefs.current[currentProfile.userId].swipe(type);
    }
  };

  const isInitialLoading = (isLoading || isFetching) && profiles.length === 0;

  if (isInitialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F43F5E" />
      </View>
    );
  }

  const hasNoProfiles = profiles.length === 0 || currentIndex >= profiles.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing(10) }]}>
        <View style={styles.placeholder} />
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your match</Text>
        </View>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowFilterModal(true)}
        >
          <IconFilter size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Swipe Stack */}
      <View style={styles.stackContainer}>
        {hasNoProfiles ? (
          <View style={styles.noProfiles}>
            <Text style={styles.noProfilesText}>No more profiles found</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setProfiles([]);
                setCurrentIndex(0);
                refetch();
              }}
            >
              <Text style={styles.retryButtonText}>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          profiles
            .slice(currentIndex, currentIndex + 3)
            .reverse()
            .map((profile, index, array) => {
              const isFirst = index === array.length - 1;
              return (
                <SwipeableCard
                  key={profile.userId}
                  ref={el => {
                    if (el) {
                      cardRefs.current[profile.userId] = el;
                    } else {
                      // Cleanup when card is unmounted
                      delete cardRefs.current[profile.userId];
                    }
                  }}
                  profile={profile}
                  onSwipe={handleSwipe}
                  onPress={() => profile && setSelectedProfile(profile)}
                  isFirst={isFirst}
                />
              );
            })
        )}
      </View>

      {/* Bottom Actions */}
      {!hasNoProfiles && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing(65) }]}>
          <TouchableOpacity 
            style={styles.actionButtonSmall}
            onPress={() => onButtonPress(SwipeType.Dislike)}
          >
            <IconClose size={24} color="#F97316" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonLarge}
            onPress={() => onButtonPress(SwipeType.Like)}
          >
            <IconHeart size={32} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButtonSmall}>
            <IconStar size={24} color="#9333EA" />
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Detail Modal */}
      <Modal
        visible={!!selectedProfile}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedProfile(null)}
      >
        {selectedProfile && (
          <ProfileDetail 
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onLike={() => {
              setSelectedProfile(null);
              onButtonPress(SwipeType.Like);
            }}
            onDislike={() => {
              setSelectedProfile(null);
              onButtonPress(SwipeType.Dislike);
            }}
          />
        )}
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={filters}
        onApply={(newFilters: any) => {
          setFilters(newFilters);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(24),
    paddingBottom: spacing(10),
  },
  placeholder: {
    width: 48,
  },
  titleContainer: {
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
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackContainer: {
    flex: 1,
    marginHorizontal: spacing(16),
    marginTop: spacing(10),
    marginBottom: spacing(15),
  },
  noProfiles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProfilesText: {
    fontSize: normalizeFont(18),
    color: '#6B7280',
    marginBottom: spacing(20),
  },
  retryButton: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: spacing(30),
    paddingVertical: spacing(15),
    borderRadius: radius(30),
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalizeFont(16),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(25),
    paddingTop: spacing(20),
  },
  actionButtonSmall: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius(26),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonLarge: {
    width: scale(68),
    height: scale(68),
    borderRadius: radius(34),
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
