import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Animated, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { calculateCompletion } from '../../../shared/utils/profileUtils';
import { useTranslation } from 'react-i18next';
import { Logger } from '../../../shared/utils/logger';
import { normalizeFont, radius, spacing, scale } from '../../../shared/utils/responsive';
import { ImagePreviewModal } from '../../../shared/components/ImagePreviewModal';

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

export const ProfileMainScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = React.useState(false);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (err: any) {
      Logger.error('Failed to fetch profile', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

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
        <Text style={styles.errorTitle}>{t('profile.unavailable')}</Text>
        <Text style={styles.errorMessage}>{error || 'No profile data found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>{t('profile.try_again')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = profile?.basicInfo?.displayName || 'Your profile';
  const age = calculateAge(profile?.basicInfo?.dob);
  const occupation = profile?.background?.occupation || t('common.no_occupation_set', 'No occupation set');
  const location = profile?.locationName || t('common.no_location_set', 'No location set');
  const bio = profile?.bio || t('profile.no_bio');
  const photos = profile?.photos || [];

  const getGenderDisplay = (val: any) => {
    if (val === 1) return t('discover.men');
    if (val === 2) return t('discover.women');
    if (val === 3) return t('common.other', 'Other');
    return val || t('common.not_set', 'Not set');
  };

  const handleImagePreview = (url: string) => {
    setSelectedImage(url);
    setPreviewVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header Background */}
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

      {/* Sticky Settings Button (Left) */}
      <TouchableOpacity 
        style={[styles.fabSticky, { top: insets.top + 10, left: 16 }]} 
        onPress={() => navigation.navigate('Settings')}
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
          <Ionicons name="settings-outline" size={18} color="#fff" />
          <Animated.View style={{
            position: 'absolute',
            opacity: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            })
          }}>
            <Ionicons name="settings-outline" size={18} color="#111" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Sticky Edit Button (Right) */}
      <TouchableOpacity 
        style={[styles.fabSticky, { top: insets.top + 10, right: 16 }]} 
        onPress={() => navigation.navigate('EditProfile')}
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
          <Ionicons name="pencil" size={18} color="#fff" />
          <Animated.View style={{
            position: 'absolute',
            opacity: scrollY.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            })
          }}>
            <Ionicons name="pencil" size={18} color="#111" />
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
          <RefreshControl refreshing={loading} onRefresh={loadProfile} colors={['#F43F5E']} tintColor="#F43F5E" />
        }
      >
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.hero}
          onPress={() => photos[0]?.url && handleImagePreview(photos[0].url)}
        >
          <Image
            source={photos[0]?.url ? { uri: photos[0].url } : defaultAvatar}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{displayName}{age ? `, ${age}` : ''}</Text>
                {profile.isIdentityVerified && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.subText}>{occupation}</Text>
            </View>
            <TouchableOpacity style={styles.editChip} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editChipText}>{t('profile.edit')}</Text>
              <Ionicons name="chevron-forward" size={14} color="#F43F5E" />
            </TouchableOpacity>
          </View>

          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>{t('profile.completion')}</Text>
              <Text style={styles.completionValue}>{calculateCompletion(profile)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${calculateCompletion(profile)}%` }]} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.verificationCard} 
            onPress={() => {
              if (profile.isIdentityVerified) {
                Alert.alert(
                  t('verification.already_verified_title', 'Verified Account'),
                  t('verification.already_verified_message', 'Your account has been successfully verified. You now have a blue badge!'),
                  [{ text: 'OK' }]
                );
              } else if (profile.verificationStatus === 0) {
                Alert.alert(
                  t('verification.pending_title', 'Verification Pending'),
                  t('verification.pending_message', 'Your identity verification is currently being reviewed. Please wait for the process to complete.'),
                  [{ text: 'OK' }]
                );
              } else {
                navigation.navigate('IdentityVerification' as any);
              }
            }}
          >
            <View style={styles.verificationIconBg}>
              <Ionicons 
                name={profile.isIdentityVerified ? "checkmark-circle" : "shield-checkmark-outline"} 
                size={24} 
                color={profile.isIdentityVerified ? "#10B981" : "#6B7280"} 
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.verificationTitle}>{t('verification.title')}</Text>
              <Text style={[
                styles.verificationStatus, 
                profile.isIdentityVerified && { color: '#10B981' },
                profile.verificationStatus === 0 && { color: '#F59E0B' },
                profile.verificationStatus === 2 && { color: '#EF4444' }
              ]}>
                {profile.isIdentityVerified 
                  ? t('verification.status.approved') 
                  : profile.verificationStatus === 0 
                    ? t('verification.status.pending') 
                    : profile.verificationStatus === 2 
                      ? t('verification.status.rejected', 'Rejected - Try Again')
                      : t('verification.status.unverified', 'Not Verified')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.about')}</Text>
            <Text style={styles.bodyText}>{bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personal_info')}</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.lifestyle')}</Text>
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

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('common.gallery')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditGallery')}>
                <Text style={styles.linkText}>{t('profile.edit_gallery')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.galleryGrid}>
              {photos.length > 0 ? (
                <>
                  {(showAllPhotos ? photos.slice(0, 9) : photos.slice(0, 3)).map((photo: any, index: number) => {
                    const isLastOfThree = !showAllPhotos && index === 2 && photos.length > 3;
                    return (
                      <TouchableOpacity 
                        key={photo.id || index} 
                        style={styles.galleryItem}
                        onPress={() => {
                          if (isLastOfThree) setShowAllPhotos(true);
                          else handleImagePreview(photo.url);
                        }}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: photo.url }} style={styles.photoImg} resizeMode="cover" />
                        {isLastOfThree && (
                          <View style={styles.moreOverlay}>
                            <Text style={styles.moreText}>+{photos.length - 3}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <View style={styles.emptyGallery}>
                  <Ionicons name="images-outline" size={20} color="#D1D5DB" />
                  <Text style={styles.emptyGalleryText}>{t('profile.no_photos')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      <ImagePreviewModal 
        visible={previewVisible}
        imageUrl={selectedImage}
        onClose={() => setPreviewVisible(false)}
      />
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
  scroll: {
    flex: 1,
  },
  hero: {
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  fabSticky: {
    position: 'absolute',
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
  nameContainer: {
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
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    gap: 4,
  },
  editChipText: {
    color: '#F43F5E',
    fontWeight: '700',
  },
  completionContainer: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  completionValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F43F5E',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F43F5E',
    borderRadius: 3,
  },
  verificationCard: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  verificationIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  verificationStatus: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
  bodyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  linkText: {
    color: '#F43F5E',
    fontWeight: '700',
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
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyGallery: {
    width: '100%',
    paddingVertical: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGalleryText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 13,
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
