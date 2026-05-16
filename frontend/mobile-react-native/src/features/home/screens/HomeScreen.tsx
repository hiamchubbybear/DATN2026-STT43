import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeFeed, useSwipeAction } from '../../../services/api/useSwipe';
import { SwipeableCard, SwipeableCardRef } from '../components/SwipeableCard';
import { swipeService, SwipeType, UserProfileDto } from '../../../services/api/swipeService';
import { IconFilter } from '../../../shared/components/icons/IconFilter';
import { IconHeart } from '../../../shared/components/icons/IconHeart';
import { IconClose } from '../../../shared/components/icons/IconClose';
import { IconStar } from '../../../shared/components/icons/IconStar';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';
import { Modal } from 'react-native';
import { ProfileDetail } from '../components/ProfileDetail';
import { FilterModal } from '../components/FilterModal';
import { MatchModal } from '../components/MatchModal';
import { useMyProfile } from '../../../services/api/useSwipe';
import { useNotificationStore } from '../../../store/notificationStore';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { profileService } from '../../../services/api/profileService';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { chatService } from '../../../services/api/chatService';

const { width } = Dimensions.get('window');

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  
  const { data: myProfile } = useMyProfile();
  
  const [filters, setFilters] = useState({
    gender: 3, 
    minAge: 18,
    maxAge: 35,
    distance: 50,
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [matchData, setMatchData] = useState<{ isVisible: boolean; user: UserProfileDto | null }>({
    isVisible: false,
    user: null,
  });

  const { data: feedData, isLoading, refetch, isFetching } = useSwipeFeed(filters);

  // Sync filters with user profile on mount or when profile loads
  useEffect(() => {
    if (myProfile) {
      setFilters({
        gender: myProfile.lookingFor || 3,
        minAge: myProfile.minAgePreference || 18,
        maxAge: myProfile.maxAgePreference || 35,
        distance: myProfile.maxDistanceKm || 50,
      });
    }
  }, [myProfile]);
  
  const swipeAction = useSwipeAction();

  const [profiles, setProfiles] = useState<UserProfileDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileDto | null>(null);
  const fetchingMore = useRef(false);
  const cardRefs = useRef<{[key: string]: SwipeableCardRef}>({});

  // 1. Update location on mount
  useEffect(() => {
    const updateLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ 
            accuracy: Location.Accuracy.Balanced 
          });
          const { latitude, longitude } = location.coords;
          
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          const locationName = address ? `${address.district || address.city || address.region}` : 'Nearby';

          console.log(`[Home] Updating location: ${locationName} (${latitude}, ${longitude})`);
          await profileService.updateLocation({ latitude, longitude, locationName });
          
          // Refetch feed to get correct distances
          refetch();
        } else {
          Alert.alert(
            t('common.location_required', 'Location Required'),
            t('common.location_permission_desc', 'We need your location to show people nearby. Please enable it in Settings.'),
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('[Home] Failed to update location:', error);
      }
    };

    updateLocation();
  }, [refetch, t]);

  // 2. Reset profiles when filters change
  useEffect(() => {
    setProfiles([]);
    setCurrentIndex(0);
  }, [filters]);

  // 3. Initialize profiles when feedData is loaded
  useEffect(() => {
    if (feedData && feedData.length > 0) {
      if (currentIndex === 0 && profiles.length === 0) {
        setProfiles(feedData);
      } else {
        const newProfiles = feedData.filter(
          newP => !profiles.find(p => p.userId === newP.userId)
        );
        if (newProfiles.length > 0) {
          setProfiles(prev => [...prev, ...newProfiles]);
        }
      }
      fetchingMore.current = false;
    }
  }, [feedData, currentIndex, profiles]);

  // 4. Pre-fetch logic & Image preloading
  useEffect(() => {
    const checkAndLoop = async () => {
      if (profiles.length > 0) {
        const nextProfiles = profiles.slice(currentIndex, currentIndex + 10);
        const urlsToPreload = nextProfiles.flatMap(p => p.photos);
        Image.prefetch(urlsToPreload);

        if (currentIndex > 0 && currentIndex >= profiles.length - 2 && !fetchingMore.current && !isFetching) {
          fetchingMore.current = true;
          refetch();
        }
      }
    };

    checkAndLoop();
  }, [currentIndex, profiles, isFetching, refetch]);

  const handleSwipe = useCallback((type: SwipeType) => {
    const swipedProfile = profiles[currentIndex];
    if (!swipedProfile) return;

    swipeAction.mutate(
      { targetId: swipedProfile.userId, type },
      {
        onSuccess: (data) => {
          if (data.isMatch) {
            setMatchData({ isVisible: true, user: swipedProfile });
            useNotificationStore.getState().setHasUnreadMatches(true);
          }
        }
      }
    );

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, profiles, swipeAction]);

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
        <Image 
          source={require('../../../../assets/images/logo_v2.png')} 
          style={styles.headerLogo} 
          contentFit="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{t('discover.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('discover.subtitle')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { marginRight: spacing(8) }]}
            onPress={() => {
              setProfiles([]);
              setCurrentIndex(0);
              refetch();
            }}
            disabled={isFetching}
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#F43F5E" />
            ) : (
              <Ionicons name="refresh-outline" size={22} color="#111827" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowFilterModal(true)}
          >
            <IconFilter size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Stack */}
      <View style={styles.stackContainer}>
        {hasNoProfiles ? (
          <View style={styles.noProfiles}>
            <Text style={styles.noProfilesText}>{t('discover.no_users_title')}</Text>
            <Text style={styles.noProfilesDesc}>{t('discover.no_users_desc')}</Text>
            <View style={styles.noProfilesActions}>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={async () => {
                  try {
                    await swipeService.resetSwipes();
                    setProfiles([]);
                    setCurrentIndex(0);
                    refetch();
                  } catch (err) {
                    console.error('Failed to reset swipes:', err);
                  }
                }}
              >
                <Text style={styles.retryButtonText}>{t('discover.reset_loop')}</Text>
              </TouchableOpacity>
            </View>
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
                      delete cardRefs.current[profile.userId];
                    }
                  }}
                  profile={profile}
                  onSwipe={handleSwipe}
                  onPress={() => setSelectedProfile(profile)}
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

      {/* Match Modal */}
      {myProfile && matchData.user && (
        <MatchModal
          isVisible={matchData.isVisible}
          currentUser={{
            name: myProfile.basicInfo?.displayName || t('common.me', 'Me'),
            avatar: myProfile.photos?.[0]?.url || '',
          }}
          matchedUser={{
            name: matchData.user.displayName,
            avatar: matchData.user.photos?.[0] || '',
          }}
          onClose={() => setMatchData({ isVisible: false, user: null })}
          onSayHello={async () => {
            const matchedUserId = matchData.user?.userId;
            const matchedUserName = matchData.user?.displayName;
            const matchedUserAvatar = matchData.user?.photos?.[0];
            
            setMatchData({ isVisible: false, user: null });
            
            if (matchedUserId) {
              try {
                const conversationId = await chatService.getOrCreateConversation(matchedUserId);
                navigation.navigate('ChatRoom', {
                  conversationId,
                  receiverId: matchedUserId,
                  receiverName: matchedUserName || t('common.user', 'User'),
                  receiverAvatar: matchedUserAvatar,
                });
              } catch (error) {
                console.error('Failed to start conversation:', error);
              }
            }
          }}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius(8),
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
  noProfilesDesc: {
    fontSize: normalizeFont(14),
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: spacing(24),
    paddingHorizontal: spacing(40),
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
  noProfilesActions: {
    flexDirection: 'row',
    gap: spacing(12),
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
