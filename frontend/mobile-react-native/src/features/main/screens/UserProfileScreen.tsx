import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { Logger } from '../../../shared/utils/logger';
import { UserReportModal } from '../../../shared/components/UserReportModal';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';

const { height } = Dimensions.get('window');
const defaultAvatar = require('../../../../assets/images/anh2.jpg');

function calculateAge(dob?: string) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const UserProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reportVisible, setReportVisible] = React.useState(false);
  
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      Logger.error('Failed to fetch user profile', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F43F5E" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={56} color="#D1D5DB" />
        <Text style={styles.errorTitle}>Profile unavailable</Text>
        <Text style={styles.errorMessage}>{error || 'No profile data found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = profile?.basicInfo?.displayName || 'User profile';
  const age = calculateAge(profile?.basicInfo?.dob);
  const occupation = profile?.background?.occupation || 'No occupation set';
  const location = profile?.locationName || 'No location set';
  const bio = profile?.bio || '';
  const photos = profile?.photos || [];

  const getGenderDisplay = (val: any) => {
    if (val === 1) return 'Male';
    if (val === 2) return 'Female';
    if (val === 3) return 'Other';
    return val || 'Not set';
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { 
            opacity: scrollY.interpolate({
              inputRange: [200, 280],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            }),
            paddingTop: insets.top
          }
        ]}
      >
        <Text style={styles.headerTitleSticky}>{displayName}</Text>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity 
        style={[styles.backFab, { top: insets.top + 10 }]} 
        onPress={() => navigation.goBack()}
      >
        <Animated.View style={[
          styles.fabInner,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: ['rgba(0,0,0,0.3)', 'rgba(255,255,255,0.9)'],
              extrapolate: 'clamp'
            })
          }
        ]}>
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color="#fff" 
          />
          <Animated.View style={{
            position: 'absolute',
            opacity: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            })
          }}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Flag/Report Button */}
      <TouchableOpacity 
        style={[styles.reportFab, { top: insets.top + 10 }]} 
        onPress={() => setReportVisible(true)}
      >
        <Animated.View style={[
          styles.fabInner,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: ['rgba(0,0,0,0.3)', 'rgba(255,255,255,0.9)'],
              extrapolate: 'clamp'
            })
          }
        ]}>
           <Ionicons name="flag-outline" size={20} color="#fff" />
           <Animated.View style={{
            position: 'absolute',
            opacity: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            })
          }}>
            <Ionicons name="flag-outline" size={20} color="#111" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProfile} colors={['#F43F5E']} />
        }
      >
        <View style={styles.hero}>
          <Image
            source={photos[0]?.url ? { uri: photos[0].url } : defaultAvatar}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <UserReportModal 
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          targetUserId={userId}
          targetUserName={displayName}
        />

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.displayNameContainer}>
                <Text style={styles.nameText}>{displayName}{age ? `, ${age}` : ''}</Text>
                {profile?.isIdentityVerified && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.subText}>{occupation}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#F43F5E" />
              <Text style={styles.bodyText}>{location}</Text>
            </View>
          </View>

          {bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bodyText}>{bio}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{getGenderDisplay(profile.basicInfo?.gender)}</Text>
              </View>
              {profile.basicInfo?.languages?.length > 0 && (
                <View style={styles.infoItem}>
                  <Ionicons name="language-outline" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>{profile.basicInfo.languages.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>

          {(profile.lifestyle?.drinking || profile.lifestyle?.smoking || profile.lifestyle?.socialLevel) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.tagContainer}>
                {profile.lifestyle?.drinking && (
                  <View style={styles.tag}>
                    <Ionicons name="wine-outline" size={14} color="#F43F5E" />
                    <Text style={styles.tagText}>{profile.lifestyle.drinking}</Text>
                  </View>
                )}
                {profile.lifestyle?.smoking && (
                  <View style={styles.tag}>
                    <Ionicons name="leaf-outline" size={14} color="#F43F5E" />
                    <Text style={styles.tagText}>{profile.lifestyle.smoking}</Text>
                  </View>
                )}
                {profile.lifestyle?.socialLevel && (
                  <View style={styles.tag}>
                    <Ionicons name="people-outline" size={14} color="#F43F5E" />
                    <Text style={styles.tagText}>{profile.lifestyle.socialLevel}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {(profile.lifestyle?.interests?.length > 0 || profile.lifestyle?.hobbies?.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
              <View style={styles.tagContainer}>
                {profile.lifestyle?.interests?.map((item: string) => (
                  <View key={item} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{item}</Text>
                  </View>
                ))}
                {profile.lifestyle?.hobbies?.map((item: string) => (
                  <View key={item} style={styles.hobbyTag}>
                    <Text style={styles.hobbyTagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {photos.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <View style={styles.galleryGrid}>
                {photos.slice(1).map((photo: any, index: number) => (
                  <View key={photo.id || index} style={styles.galleryItem}>
                    <Image source={{ uri: photo.url }} style={styles.photoImg} resizeMode="cover" />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
    zIndex: 998,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleSticky: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  hero: {
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backFab: {
    position: 'absolute',
    left: 16,
    zIndex: 999,
  },
  reportFab: {
    position: 'absolute',
    right: 16,
    zIndex: 999,
  },
  fabInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  displayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedIcon: {
    marginTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subText: {
    marginTop: 4,
    fontSize: 15,
    color: '#6B7280',
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bodyText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
  },
  tagText: {
    fontSize: 14,
    color: '#F43F5E',
    fontWeight: '600',
  },
  interestTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  interestTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  hobbyTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  hobbyTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#F43F5E',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
