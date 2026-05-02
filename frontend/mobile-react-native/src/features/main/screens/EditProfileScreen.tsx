import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DRINKING_OPTIONS = ['Never', 'Socially', 'Frequently'];
const SMOKING_OPTIONS = ['Never', 'Occasionally', 'Regularly'];
const SOCIAL_OPTIONS = ['Introvert', 'Ambivert', 'Extrovert'];
const HOBBIES_OPTIONS = ['Music', 'Travel', 'Movies', 'Gaming', 'Sports', 'Reading', 'Cooking', 'Art', 'Photography', 'Dancing'];
const DATE_STYLE_OPTIONS = ['Casual', 'Serious', 'Flexible', 'Dinner', 'Coffee', 'Outdoors'];

const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [gender, setGender] = useState('');
  const [interestedIn, setInterestedIn] = useState('');
  
  // Lifestyle
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [socialLevel, setSocialLevel] = useState('');
  const [personalityType, setPersonalityType] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Dating Style
  const [freeTimePrefer, setFreeTimePrefer] = useState<string[]>([]);
  const [dateStyle, setDateStyle] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setInitialLoading(true);
      const data = await profileService.getMyProfile();
      setDisplayName(data.basicInfo?.displayName || '');
      setBio(data.bio || '');
      setOccupation(data.background?.occupation || '');
      setEducation(data.background?.education || '');
      setGender(data.basicInfo?.gender || '');
      setInterestedIn(data.interestedIn || '');

      // Lifestyle
      setDrinking(data.lifestyle?.drinking || '');
      setSmoking(data.lifestyle?.smoking || '');
      setSocialLevel(data.lifestyle?.socialLevel || '');
      setPersonalityType(data.lifestyle?.personalityType || '');
      setHobbies(data.lifestyle?.hobbies || []);
      setInterests(data.lifestyle?.interests || []);
      
      // Dating Style
      setFreeTimePrefer(data.datingStyle?.freeTimePrefer || []);
      setDateStyle(data.datingStyle?.dateStyle || []);
    } catch (error) {
      Logger.error('Failed to fetch profile', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load profile data'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Get current prefs to not overwrite them with defaults
      const currentProfile = await profileService.getMyProfile();
      
      await profileService.updateProfile({
        displayName,
        bio,
        occupation,
        education,
        gender: gender || 'Other',
        interestedIn: interestedIn || 'Both',
        latitude: currentProfile.latitude, 
        longitude: currentProfile.longitude, 
        locationName: currentProfile.locationName, 
        minAgePreference: currentProfile.minAgePreference,
        maxAgePreference: currentProfile.maxAgePreference,
        maxDistanceKm: currentProfile.maxDistanceKm,
        // Lifestyle
        drinking,
        smoking,
        socialLevel,
        personalityType,
        loveLanguage: currentProfile.lifestyle?.loveLanguage || [],
        hobbies,
        interests,
        // Dating Style
        freeTimePrefer,
        dateStyle
      });
      
      showToast({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your changes have been saved'
      });
      navigation.goBack();
    } catch (error) {
      Logger.error('Failed to update profile', error);
      showToast({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Please check your information and try again'
      });
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#F43F5E" />
          ) : (
            <Text style={styles.doneText}>Save</Text>
          )}
        </TouchableOpacity>
       </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Session 1: Basic Info */}
          <View style={styles.sessionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleText}>Basic Info</Text>
            </View>
            <View style={styles.inputSection}>
              <View style={styles.rowInputWrapper}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color="#F43F5E" />
                </View>
                <TextInput
                  style={styles.flexInput}
                  placeholder="Display Name"
                  placeholderTextColor="#9CA3AF"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>

              <Text style={[styles.subLabel, { marginTop: 20 }]}>About Me</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tell something about yourself..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  value={bio}
                  onChangeText={setBio}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.charCount}>{bio.length}/500</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Session 2: Work & Education */}
          <View style={[styles.sessionBox, { marginTop: 20 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleText}>Work & Education</Text>
            </View>
            <View style={styles.inputSection}>
              <View style={styles.rowInputWrapper}>
                <View style={styles.iconContainer}>
                  <Ionicons name="briefcase-outline" size={20} color="#F43F5E" />
                </View>
                <TextInput
                  style={styles.flexInput}
                  placeholder="Occupation"
                  placeholderTextColor="#9CA3AF"
                  value={occupation}
                  onChangeText={setOccupation}
                />
              </View>

              <View style={[styles.rowInputWrapper, { marginTop: 12 }]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="school-outline" size={20} color="#F43F5E" />
                </View>
                <TextInput
                  style={styles.flexInput}
                  placeholder="Education"
                  placeholderTextColor="#9CA3AF"
                  value={education}
                  onChangeText={setEducation}
                />
              </View>
            </View>
          </View>

          {/* Session 3: Lifestyle */}
          <View style={[styles.sessionBox, { marginTop: 20 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleText}>Lifestyle</Text>
            </View>
            <View style={styles.inputSection}>
              <Text style={styles.subLabel}>Drinking</Text>
              <View style={styles.genderRow}>
                {DRINKING_OPTIONS.map((item) => (
                  <TouchableOpacity 
                    key={item}
                    style={[styles.genderChip, drinking === item && styles.genderChipActive]}
                    onPress={() => setDrinking(item)}
                  >
                    <Text style={[styles.genderChipText, drinking === item && styles.genderChipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.subLabel, { marginTop: 20 }]}>Smoking</Text>
              <View style={styles.genderRow}>
                {SMOKING_OPTIONS.map((item) => (
                  <TouchableOpacity 
                    key={item}
                    style={[styles.genderChip, smoking === item && styles.genderChipActive]}
                    onPress={() => setSmoking(item)}
                  >
                    <Text style={[styles.genderChipText, smoking === item && styles.genderChipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.subLabel, { marginTop: 20 }]}>Hobbies</Text>
              <View style={[styles.genderRow, { flexWrap: 'wrap', gap: 8 }]}>
                {HOBBIES_OPTIONS.map((item) => {
                  const isActive = hobbies.includes(item);
                  return (
                    <TouchableOpacity 
                      key={item}
                      style={[styles.interestChip, isActive && styles.interestChipActive]}
                      onPress={() => {
                        if (isActive) {
                          setHobbies(hobbies.filter(h => h !== item));
                        } else {
                          setHobbies([...hobbies, item]);
                        }
                      }}
                    >
                      <Text style={[styles.interestChipText, isActive && styles.interestChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Session 4: Preferences */}
          <View style={[styles.sessionBox, { marginTop: 20 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleText}>I'm looking for...</Text>
            </View>
            <View style={styles.inputSection}>
              <Text style={styles.subLabel}>Interested In</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Both'].map((item) => (
                  <TouchableOpacity 
                    key={item}
                    style={[styles.genderChip, interestedIn === item && styles.genderChipActive]}
                    onPress={() => setInterestedIn(item)}
                  >
                    <Text style={[styles.genderChipText, interestedIn === item && styles.genderChipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.subLabel, { marginTop: 20 }]}>Ideal Date Style</Text>
              <View style={[styles.genderRow, { flexWrap: 'wrap', gap: 8 }]}>
                {DATE_STYLE_OPTIONS.map((item) => {
                  const isActive = dateStyle.includes(item);
                  return (
                    <TouchableOpacity 
                      key={item}
                      style={[styles.interestChip, isActive && styles.interestChipActive]}
                      onPress={() => {
                        if (isActive) {
                          setDateStyle(dateStyle.filter(d => d !== item));
                        } else {
                          setDateStyle([...dateStyle, item]);
                        }
                      }}
                    >
                      <Text style={[styles.interestChipText, isActive && styles.interestChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.mainSaveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.mainSaveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footerSpacing} />
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
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F43F5E',
    width: 60,
    textAlign: 'right',
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
  formContainer: {
    marginTop: 0,
  },
  sessionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  inputSection: {
    marginBottom: 0,
  },
  inputWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  rowInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flexInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  genderChipActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  genderChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  genderChipTextActive: {
    color: '#F43F5E',
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  interestChipActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  interestChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  interestChipTextActive: {
    color: '#F43F5E',
  },
  footerSpacing: {
    height: 60,
  },
  mainSaveButton: {
    height: 56,
    backgroundColor: '#F43F5E',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#FDA4AF',
  },
});
