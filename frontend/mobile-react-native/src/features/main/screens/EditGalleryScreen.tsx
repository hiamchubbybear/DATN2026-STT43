import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = (SCREEN_WIDTH - 40 - 24) / 3;

const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgX = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EditGalleryScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setPhotos(data.photos || []);
    } catch (error) {
      Logger.error('Failed to fetch photos', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setSaving(true);
        const uploadedPhoto = await profileService.uploadPhoto(result.assets[0].uri);
        setPhotos([...photos, uploadedPhoto]);
        showToast({
          type: 'success',
          text1: 'Success',
          text2: 'Photo uploaded successfully'
        });
      } catch (error) {
        Logger.error('Failed to upload photo', error);
        showToast({
          type: 'error',
          text1: 'Upload Failed',
          text2: 'Please try again later'
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (photos.length <= 1) {
      showToast({
        type: 'error',
        text1: 'Cannot Delete',
        text2: 'You must have at least one photo.'
      });
      return;
    }

    try {
      setSaving(true);
      await profileService.deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      showToast({
        type: 'success',
        text1: 'Deleted',
        text2: 'Photo removed successfully'
      });
    } catch (error) {
      Logger.error('Failed to delete photo', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Could not delete photo'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      setSaving(true);
      await profileService.setPrimaryPhoto(photoId);
      
      // Update local state to reflect change
      setPhotos(photos.map(p => ({
        ...p,
        isPrimary: p.id === photoId
      })));

      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Primary photo updated'
      });
    } catch (error) {
      Logger.error('Failed to set primary photo', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update primary photo'
      });
    } finally {
      setSaving(false);
    }
  };

  // Show existing photos + one empty slot for adding more (up to 9)
  const slots = Array.from({ length: Math.min(photos.length + 1, 9) }, (_, i) => i);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F43F5E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SvgChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Gallery</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Photos</Text>
        <Text style={styles.sectionSubTitle}>Add up to 9 photos to show your best self.</Text>

        <View style={styles.photoGrid}>
          {slots.map((index) => {
            const photo = photos[index];
            const isUploaded = !!photo;
            
            return (
              <View key={index} style={styles.photoSlotContainer}>
                {isUploaded ? (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      style={styles.flex}
                      onPress={() => handleSetPrimary(photo.id)}
                    >
                      <Image source={{ uri: photo.url }} style={[styles.photoImage, photo.isPrimary && styles.primaryPhotoBorder]} />
                    </TouchableOpacity>
                    
                    {photo.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>PRIMARY</Text>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={styles.deleteBadge} 
                      onPress={() => handleDeletePhoto(photo.id)}
                      disabled={saving}
                    >
                      <SvgX />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.photoPlaceholder} 
                    onPress={() => handlePickImage(index)}
                    disabled={saving}
                  >
                    <View style={styles.plusIcon}>
                      <Ionicons name="add" size={30} color="#F43F5E" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.helperText}>
            First photo will be your primary profile picture.
          </Text>
        </View>

        {saving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator color="#F43F5E" />
            <Text style={styles.savingText}>Updating Gallery...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoSlotContainer: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH * 1.35,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    zIndex: 10,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.9)',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  primaryPhotoBorder: {
    borderWidth: 3,
    borderColor: '#F43F5E',
  },
  flex: {
    flex: 1,
  },
  plusIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: '#FFF1F2',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  helperText: {
    textAlign: 'center',
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '500',
  },
  savingOverlay: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  savingText: {
    color: '#F43F5E',
    fontWeight: '600',
  }
});
