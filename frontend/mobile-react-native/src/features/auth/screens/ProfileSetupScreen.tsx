import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../store/authStore';
import { profileService } from '../../../services/api/profileService';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useToast } from '../../../shared/components/ToastProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = (SCREEN_WIDTH - 64 - 24) / 3; // 3 columns, 32px padding each side, 12px gap between

const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function ProfileSetupScreen() {
  const navigation = useNavigation<any>();
  const { setProfileStatus, logout } = useAuthStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [interestedIn, setInterestedIn] = useState('Female');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['Vietnamese']);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleNext = async () => {
    if (step === 1 && !displayName.trim()) {
      showToast({
        title: 'Thông tin bắt buộc',
        message: 'Vui lòng nhập tên của bạn.',
        type: 'error'
      });
      return;
    }
    if (step === 2 && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      showToast({
        title: 'Định dạng sai',
        message: 'Vui lòng nhập ngày sinh theo định dạng YYYY-MM-DD.',
        type: 'error'
      });
      return;
    }
    if (step === 9 && photos.length === 0) {
      showToast({
        title: 'Thiếu ảnh',
        message: 'Vui lòng thêm ít nhất một ảnh đại diện.',
        type: 'error'
      });
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      logout();
    }
  };

  const toggleArrayItem = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showToast({
        title: 'Quyền truy cập',
        message: 'Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh lên!',
        type: 'info'
      });
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
        setPhotos([...photos, result.assets[0].uri]);
      } else {
        showToast({
          title: 'Giới hạn ảnh',
          message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
          type: 'info'
        });
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // 1. Setup Profile Text Data
      await profileService.setupProfile({
        displayName,
        dob: new Date(dob).toISOString(),
        gender,
        interestedIn,
        education,
        occupation,
        bio,
        drinking,
        smoking,
        hobbies,
        languages: languages.length > 0 ? languages : ['English'],
      });

      // 2. Upload Photos sequentially
      if (photos.length > 0) {
        for (const uri of photos) {
          try {
            await profileService.uploadPhoto(uri);
          } catch (e) {
            console.error("Failed to upload photo:", uri, e);
            // Optionally tell the user some photos failed, but we still completed the profile.
          }
        }
      }

      showToast({
        title: 'Thành công',
        message: 'Hồ sơ của bạn đã được hoàn tất!',
        type: 'success'
      });
      navigation.replace('Permission');
    } catch (error: any) {
      showToast({
        title: 'Lỗi',
        message: error.message || 'Đã có lỗi xảy ra khi lưu hồ sơ',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>What's your first name?</Text>
            <Text style={styles.subtitle}>This is how it will appear on your profile. You cannot change it later.</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="First Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>My birthday is</Text>
            <Text style={styles.subtitle}>Your age will be public.</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={(text) => {
                // Remove any non-numeric characters
                const cleaned = text.replace(/\D/g, '');
                let formatted = cleaned;
                
                // Format: YYYY-MM-DD
                if (cleaned.length > 4 && cleaned.length <= 6) {
                  formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
                } else if (cleaned.length > 6) {
                  formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
                }
                
                setDob(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>I am a</Text>
            <Text style={styles.subtitle}>We use this to offer you better matches.</Text>
            <View style={styles.optionsContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                    {g === 'Male' ? 'Man' : g === 'Female' ? 'Woman' : 'Other'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>I am interested in</Text>
            <Text style={styles.subtitle}>Who do you want to see on Discovery?</Text>
            <View style={styles.optionsContainer}>
              {['Male', 'Female', 'Everyone'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, interestedIn === g && styles.optionButtonActive]}
                  onPress={() => setInterestedIn(g)}
                >
                  <Text style={[styles.optionText, interestedIn === g && styles.optionTextActive]}>
                    {g === 'Male' ? 'Men' : g === 'Female' ? 'Women' : 'Everyone'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.title}>Background</Text>
            <Text style={styles.subtitle}>Share what you do and where you studied. (Optional)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Occupation / Job Title</Text>
              <TextInput
                style={styles.inputLarge}
                placeholder="e.g. Software Engineer"
                value={occupation}
                onChangeText={setOccupation}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.inputGroup, { marginTop: 24 }]}>
              <Text style={styles.label}>School / University</Text>
              <TextInput
                style={styles.inputLarge}
                placeholder="e.g. Harvard University"
                value={education}
                onChangeText={setEducation}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </>
        );
      case 6:
        return (
          <>
            <Text style={styles.title}>Write a Bio</Text>
            <Text style={styles.subtitle}>A little bit about you. Make it fun! (Optional)</Text>
            <TextInput
              style={[styles.inputLarge, styles.textArea]}
              placeholder="I love going on spontaneous road trips..."
              value={bio}
              onChangeText={setBio}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </>
        );
      case 7:
        const hobbyList = ['Photography', 'Travel', 'Coffee', 'Music', 'Gaming', 'Reading', 'Sports', 'Cooking', 'Art'];
        return (
          <>
            <Text style={styles.title}>Hobbies & Interests</Text>
            <Text style={styles.subtitle}>What do you like to do in your free time? (Optional)</Text>
            <View style={styles.chipsContainer}>
              {hobbyList.map((h) => {
                const isActive = hobbies.includes(h);
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(h, hobbies, setHobbies)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 8:
        const langList = ['Vietnamese', 'English', 'Korean', 'Japanese', 'Chinese', 'French', 'Spanish'];
        return (
          <>
            <Text style={styles.title}>Languages I know</Text>
            <Text style={styles.subtitle}>Select the languages you can speak.</Text>
            <View style={styles.chipsContainer}>
              {langList.map((lang) => {
                const isActive = languages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(lang, languages, setLanguages)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 9:
        // Render a 9-slot grid
        const slots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        return (
          <>
            <Text style={styles.title}>Add Recent Photos</Text>
            <Text style={styles.subtitle}>Add at least 1 photo to continue. First photo is your main one.</Text>
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
            <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 24, fontSize: 14 }]}>
              Add a video, pic, or Loop to get 4% closer to completing your profile and you may even get more Likes.
            </Text>
          </>
        );
    }
  };

  const progressPercentage = (step / totalSteps) * 100;
  const isOptionalStep = step >= 5 && step <= 7;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <SvgChevronLeft />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
          {isOptionalStep ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderButton} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {renderStepContent()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{step === totalSteps ? 'Complete Profile' : 'Continue'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
    paddingTop: spacing(12),
    paddingBottom: spacing(20),
  },
  backButton: {
    padding: spacing(8),
    marginLeft: -spacing(8),
  },
  placeholderButton: {
    width: scale(48),
  },
  skipButton: {
    width: scale(48),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    color: '#6B7280',
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
  progressBarContainer: {
    flex: 1,
    height: scale(8),
    backgroundColor: '#F3F4F6',
    borderRadius: radius(4),
    marginHorizontal: spacing(16),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F43F5E',
    borderRadius: radius(4),
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing(32),
    paddingTop: spacing(20),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: normalizeFont(28),
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing(8),
  },
  subtitle: {
    fontSize: normalizeFont(15),
    color: '#6B7280',
    lineHeight: verticalScale(22),
    marginBottom: spacing(32),
  },
  inputLarge: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    fontSize: normalizeFont(18),
    fontWeight: '600',
    color: '#111827',
    paddingVertical: spacing(10),
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radius(12),
    paddingHorizontal: spacing(12),
    borderBottomWidth: 1, // override borderBottomWidth from inputLarge
    marginTop: spacing(8),
  },
  inputGroup: {
    marginBottom: spacing(16),
  },
  label: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing(8),
  },
  optionsContainer: {
    gap: spacing(12),
  },
  optionButton: {
    width: '100%',
    height: scale(52),
    borderRadius: radius(16),
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  optionText: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#F43F5E',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(10),
  },
  chip: {
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(10),
    borderRadius: radius(20),
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  chipText: {
    fontSize: normalizeFont(15),
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#F43F5E',
  },
  footer: {
    paddingHorizontal: spacing(32),
    paddingBottom: spacing(40),
    paddingTop: spacing(16),
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    width: '100%',
    height: scale(56),
    backgroundColor: '#F43F5E',
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing(12),
  },
  photoSlotContainer: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH * 1.4,
    marginBottom: spacing(8),
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: radius(12),
    borderWidth: scale(2),
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius(12),
    backgroundColor: '#E5E7EB',
  },
  photoBadge: {
    position: 'absolute',
    bottom: -spacing(8),
    right: -spacing(8),
    backgroundColor: '#FFFFFF',
    borderRadius: radius(14),
  },
});
