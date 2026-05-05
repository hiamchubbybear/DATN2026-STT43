import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { Logger } from '../../../shared/utils/logger';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<ProfileNavigation>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
          <Ionicons name="cloud-offline-outline" size={56} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Profile unavailable</Text>
          <Text style={styles.errorMessage}>{error || 'No profile data found.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profile?.basicInfo?.displayName || 'Your profile';
  const age = calculateAge(profile?.basicInfo?.dob);
  const occupation = profile?.background?.occupation || 'No occupation set';
  const location = profile?.locationName || 'No location set';
  const bio = profile?.bio || 'Add a short bio to help people get to know you.';
  const photos = profile?.photos || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={photos[0]?.url ? { uri: photos[0].url } : defaultAvatar}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <TouchableOpacity style={[styles.fab, styles.fabLeft]} onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
            <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.fab, styles.fabRight]} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}>
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>{displayName}{age ? `, ${age}` : ''}</Text>
              <Text style={styles.subText}>{occupation}</Text>
            </View>
            <TouchableOpacity style={styles.editChip} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}>
              <Text style={styles.editChipText}>Edit</Text>
              <Ionicons name="chevron-forward" size={14} color="#EE3F57" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.bodyText}>{location}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{bio}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditGallery')} activeOpacity={0.85}>
                <Text style={styles.linkText}>Edit gallery</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.galleryGrid}>
              {photos.length > 0 ? photos.slice(0, 6).map((photo: any, index: number) => (
                <Image key={photo.id || index} source={{ uri: photo.url }} style={styles.galleryItem} resizeMode="cover" />
              )) : (
                <View style={styles.emptyGallery}>
                  <Ionicons name="images-outline" size={20} color="#D1D5DB" />
                  <Text style={styles.emptyGalleryText}>No photos yet</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('DiscoverySettings')} activeOpacity={0.88}>
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Discovery Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F8',
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
    backgroundColor: '#F7F7F8',
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
    lineHeight: 20,
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
  hero: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLeft: {
    left: 16,
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
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF0F3',
    gap: 4,
  },
  editChipText: {
    color: '#EE3F57',
    fontWeight: '700',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  linkText: {
    color: '#EE3F57',
    fontWeight: '700',
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
  primaryButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EE3F57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
