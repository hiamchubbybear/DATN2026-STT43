import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Logger } from '../../../shared/utils/logger';
import { profileService } from '../../../services/api/profileService';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const defaultAvatar = require('../../../../assets/images/anh2.jpg');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 92,
  },
  heroWrap: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowFloat: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    zIndex: 2,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  actionBtnPrimary: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EE3F57',
  },
  contentCard: {
    marginTop: 0,
    marginHorizontal: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#18181B',
  },
  titleText: {
    marginTop: 4,
    fontSize: 13,
    color: '#A1A1AA',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FECBD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  sectionSpacing: {
    marginTop: 16,
  },
  distanceChip: {
    borderRadius: 10,
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FECBD3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    color: '#EE3F57',
    fontWeight: '700',
  },
  locationText: {
    marginTop: 6,
    fontSize: 13,
    color: '#71717A',
  },
  aboutText: {
    marginTop: 8,
    fontSize: 13,
    color: '#52525B',
    lineHeight: 19,
  },
  readMore: {
    marginTop: 4,
    fontSize: 13,
    color: '#EE3F57',
    fontWeight: '700',
  },
  interestHeader: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showMoreText: {
    fontSize: 12,
    color: '#71717A',
  },
  interestWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  interestChipActive: {
    borderColor: '#F8B4C2',
    backgroundColor: '#FFF2F5',
  },
  interestText: {
    fontSize: 12,
    color: '#3F3F46',
  },
  interestTextActive: {
    color: '#EE3F57',
    fontWeight: '600',
  },
  galleryHead: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 13,
    color: '#EE3F57',
    fontWeight: '700',
  },
  galleryGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryItem: {
    width: (SCREEN_WIDTH - 52 - 20) / 3, // Precise calculation: (Screen - CardMargin/Padding - 2 gaps) / 3
    height: ((SCREEN_WIDTH - 52 - 20) / 3) * 1.35,
    borderRadius: 16,
    backgroundColor: '#F3F4F6', 
  },
  progressSection: {
    marginTop: 42,
    marginHorizontal: 30,
    marginBottom: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EE3F57',
  },
  progressBg: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EE3F57',
    borderRadius: 2,
  },
  galleryPlaceholder: {
    backgroundColor: '#F9FAFB',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#EE3F57',
    borderRadius: 999,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  editBtnTop: {
    position: 'absolute',
    top: 16,
    right: 64, 
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIdentityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    gap: 4,
  },
  editIdentityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EE3F57',
  },
  editGalleryBtnLarge: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F3',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECBD3',
    gap: 8,
  },
  editGalleryBtnLargeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EE3F57',
  },
});

const ProfileActionButton = ({ icon, primary = false }: { icon: keyof typeof Ionicons.glyphMap; primary?: boolean }) => (
  <TouchableOpacity style={[styles.actionBtn, primary && styles.actionBtnPrimary]} activeOpacity={0.88}>
    <Ionicons name={icon} size={22} color={primary ? '#FFFFFF' : icon === 'close' ? '#F97316' : '#9333EA'} />
  </TouchableOpacity>
);

export const ProfileMainScreen = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [randomHeroIndex, setRandomHeroIndex] = React.useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getMyProfile();
        console.log("🔍 [Profile] Data received:", JSON.stringify(data, null, 2));
        setProfile(data);
        
        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          setRandomHeroIndex(randomIndex);
        }
      } catch (err: any) {
        Logger.error('Failed to fetch profile', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#EE3F57" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMsg}>{error || 'Profile not found'}</Text>
          <TouchableOpacity 
            style={styles.retryBtn} 
            onPress={() => {
              // Trigger a re-fetch
              setError(null);
              setLoading(true);
              // Since fetchProfile is inside useEffect, we can use a state to trigger it
              // but for now, let's just use navigation.replace or similar if needed.
              // Actually, I can just call the function if I move it out of useEffect.
              // Let's assume the user reloads or we add a toggle state.
            }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const gallery = profile.photos || [];
  const heroPhoto = gallery.length > 0 ? gallery[randomHeroIndex] : null;
  const interests = profile.lifestyle?.interests || [];

  const calculateCompletion = () => {
    let score = 0;
    let total = 6;
    
    if (profile.bio && profile.bio.length > 10) score++;
    if (gallery.length >= 2) score++;
    if (profile.basicInfo?.displayName) score++;
    if (profile.background?.occupation) score++;
    if (profile.lifestyle?.interests?.length >= 3) score++;
    if (profile.locationName) score++;
    
    return Math.round((score / total) * 100);
  };

  const completionRate = calculateCompletion();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 } // Adjusted for floating tab bar
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Image 
            source={heroPhoto ? { uri: heroPhoto.url } : defaultAvatar} 
            style={styles.heroImage} 
            resizeMode="cover" 
          />


          <TouchableOpacity 
            style={styles.editBtnTop} 
            activeOpacity={0.85} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsBtn} 
            activeOpacity={0.85} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressValue}>{completionRate}% complete</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.identityRow}>
            <View>
              <Text style={styles.nameText}>
                {profile?.basicInfo?.displayName}, {calculateAge(profile?.basicInfo?.dob)}
              </Text>
              <Text style={styles.titleText}>{profile?.background?.occupation || 'No occupation'}</Text>
            </View>
             <TouchableOpacity 
              style={styles.editIdentityBtn} 
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editIdentityText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={14} color="#EE3F57" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.distanceChip}>
              <Ionicons name="location-outline" size={12} color="#EE3F57" />
              <Text style={styles.distanceText}>1 km</Text>
            </View>
          </View>
          <Text style={styles.locationText}>{profile.locationName || 'Unknown'}</Text>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>About</Text>
          <Text style={styles.aboutText}>{profile.bio || 'No bio yet.'}</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>

          <View style={styles.interestHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity style={styles.showMoreBtn} activeOpacity={0.85}>
              <Text style={styles.showMoreText}>Show more</Text>
              <Ionicons name="chevron-down" size={12} color="#71717A" />
            </TouchableOpacity>
          </View>

          <View style={styles.interestWrap}>
            {interests.map((item: string, index: number) => (
              <View key={item} style={[styles.interestChip, index < 2 && styles.interestChipActive]}>
                <Text style={[styles.interestText, index < 2 && styles.interestTextActive]}>
                  {index < 2 ? `✓ ${item}` : item}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.galleryHead}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EditGallery')}
            >
              <Text style={styles.seeAll}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.galleryGrid}>
            {gallery && gallery.length > 0 ? gallery.map((photo: any, index: number) => (
              <Image 
                key={photo.id || `photo-${index}`} 
                source={{ uri: photo.url }} 
                style={styles.galleryItem} 
                resizeMode="cover"
              />
            )) : (
              [0, 1, 2].map((i) => (
                <View 
                  key={`placeholder-${i}`} 
                  style={[styles.galleryItem, styles.galleryPlaceholder]}
                >
                  <Ionicons name="image-outline" size={20} color="#D1D5DB" />
                </View>
              ))
            )}
          </View>

          <TouchableOpacity 
            style={styles.editGalleryBtnLarge} 
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditGallery')}
          >
            <Ionicons name="images-outline" size={20} color="#EE3F57" />
            <Text style={styles.editGalleryBtnLargeText}>Edit Gallery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

