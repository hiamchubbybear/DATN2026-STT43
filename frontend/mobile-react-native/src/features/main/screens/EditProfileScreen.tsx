import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = (SCREEN_WIDTH - 40 - 24) / 3; // 3 columns, 20px padding each side, 12px gap

const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgPlus = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Circle cx="14" cy="14" r="14" fill="#F43F5E" />
    <Path d="M14 8V20M8 14H20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgMinus = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Circle cx="14" cy="14" r="14" fill="#FFFFFF" stroke="#E5E7EB" />
    <Path d="M10 10L18 18M18 10L10 18" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EditProfileScreen = () => {
  const navigation = useNavigation();

  // Mock initial photos
  const [photos, setPhotos] = useState<string[]>([
    Image.resolveAssetSource(require('../../../../assets/images/anh1.jpg')).uri,
    Image.resolveAssetSource(require('../../../../assets/images/anh2.jpg')).uri,
    Image.resolveAssetSource(require('../../../../assets/images/anh3.jpg')).uri,
  ]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (photos.length < 6) {
        // TODO: Call API to upload photo
        setPhotos([...photos, result.assets[0].uri]);
      } else {
        alert("You can only upload up to 6 photos.");
      }
    }
  };

  const removePhoto = (index: number) => {
    // TODO: Call API to delete photo
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const slots = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 9 slots like the screenshot

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SvgChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoGrid}>
          {slots.map((index) => {
            const isUploaded = index < photos.length;
            return (
              <View key={index} style={styles.photoSlotContainer}>
                {isUploaded ? (
                  <>
                    <Image source={{ uri: photos[index] }} style={styles.photoImage} />
                    <TouchableOpacity style={styles.photoBadge} onPress={() => removePhoto(index)}>
                      <SvgMinus />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.photoPlaceholder} 
                      onPress={pickImage}
                      disabled={index > photos.length} // Force consecutive uploads
                    >
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.photoBadge} 
                      onPress={pickImage}
                      disabled={index > photos.length}
                    >
                      {index <= photos.length && <SvgPlus />}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.helperText}>
          Add a video, pic, or Loop to get 4% closer to completing your profile and you may even get more Likes.
        </Text>

        <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
          <Text style={styles.addMediaText}>ADD MEDIA</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Match the light gray background from screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoSlotContainer: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH * 1.4,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  photoBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
  },
  helperText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  addMediaButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F43F5E', // Gradient can be added later if needed
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  addMediaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
