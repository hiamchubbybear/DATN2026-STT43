import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { Logger } from '../../../shared/utils/logger';
import { UserReportModal } from '../../../shared/components/UserReportModal';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

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
  const [showAllPhotos, setShowAllPhotos] = React.useState(false);
  const [reportVisible, setReportVisible] = React.useState(false);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#EE3F57" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <TouchableOpacity style={styles.backFab} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Ionicons name="cloud-offline-outline" size={56} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Profile unavailable</Text>
          <Text style={styles.errorMessage}>{error || 'No profile data found.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProfile} colors={['#EE3F57']} />
        }
      >
        <View style={styles.hero}>
          <Image
            source={photos[0]?.url ? { uri: photos[0].url } : defaultAvatar}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={[styles.backFab, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fab, styles.fabRight, { top: insets.top + 10 }]} 
            onPress={() => setReportVisible(true)}
          >
            <Ionicons name="flag-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
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
              <Text style={styles.nameText}>{displayName}{age ? `, ${age}` : ''}</Text>
              <Text style={styles.subText}>{occupation}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.bodyText}>{location}</Text>
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
                    <Ionicons name="wine-outline" size={14} color="#EE3F57" />
                    <Text style={styles.tagText}>Drinks: {profile.lifestyle.drinking}</Text>
                  </View>
                )}
                {profile.lifestyle?.smoking && (
                  <View style={styles.tag}>
                    <Ionicons name="leaf-outline" size={14} color="#EE3F57" />
                    <Text style={styles.tagText}>Smokes: {profile.lifestyle.smoking}</Text>
                  </View>
                )}
                {profile.lifestyle?.socialLevel && (
                  <View style={styles.tag}>
                    <Ionicons name="people-outline" size={14} color="#EE3F57" />
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
                {photos.map((photo: any, index: number) => (
                  <View key={photo.id || index} style={styles.galleryItem}>
                    <Image source={{ uri: photo.url }} style={styles.photoImg} resizeMode="cover" />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hero: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backFab: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fab: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fabRight: {
    right: 16,
  },
  card: {
    marginTop: -24,
    marginHorizontal: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subText: {
    marginTop: 4,
    fontSize: 13,
    color: '#71717A',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#52525B',
    lineHeight: 20,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  interestTagText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  hobbyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
  },
  hobbyTagText: {
    fontSize: 13,
    color: '#EA580C',
    fontWeight: '600',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: '31.8%',
    aspectRatio: 0.78,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#EE3F57',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
