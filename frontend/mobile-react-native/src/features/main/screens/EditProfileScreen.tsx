import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Modal, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

// Components
import { EditProfileHeader } from '../components/EditProfile/EditProfileHeader';
import { EditSelectionModal } from '../components/EditProfile/EditSelectionModal';
import { BasicInfoSection } from '../components/EditProfile/sections/BasicInfoSection';
import { BioSection } from '../components/EditProfile/sections/BioSection';
import { BackgroundSection } from '../components/EditProfile/sections/BackgroundSection';
import { LifestyleSection } from '../components/EditProfile/sections/LifestyleSection';
import { DatingStyleSection } from '../components/EditProfile/sections/DatingStyleSection';
import { LocationSection } from '../components/EditProfile/sections/LocationSection';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList>;

export const EditProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigation>();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  const [loading, setLoading] = React.useState(true);
  const [savingSection, setSavingSection] = React.useState<string | null>(null);

  // Profile State
  const [displayName, setDisplayName] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [languages, setLanguages] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState('');
  const [occupation, setOccupation] = React.useState('');
  const [education, setEducation] = React.useState('');
  const [drinking, setDrinking] = React.useState('');
  const [smoking, setSmoking] = React.useState('');
  const [socialLevel, setSocialLevel] = React.useState('');
  const [personalityType, setPersonalityType] = React.useState('');
  const [hobbies, setHobbies] = React.useState<string[]>([]);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [freeTimePrefer, setFreeTimePrefer] = React.useState<string[]>([]);
  const [dateStyle, setDateStyle] = React.useState<string[]>([]);
  const [locationName, setLocationName] = React.useState('');
  const [interestedIn, setInterestedIn] = React.useState('');

  // Modal State
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState('');
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalOptions, setModalOptions] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await profileService.getMyProfile();
      setDisplayName(profile?.basicInfo?.displayName || '');
      setBio(profile?.bio || '');
      setOccupation(profile?.background?.occupation || '');
      setEducation(profile?.background?.education || '');
      setLocationName(profile?.locationName || '');
      setInterestedIn(profile?.interestedIn || '');
      
      // Map gender enum to string
      const genderVal = profile?.basicInfo?.gender;
      if (genderVal === 1) setGender('Male');
      else if (genderVal === 2) setGender('Female');
      else if (genderVal === 3) setGender('Other');
      else setGender('');

      setDob(profile?.basicInfo?.dob || '');
      setLanguages((profile?.basicInfo?.languages || []).map((l: string) => l.trim()));
      setDrinking(profile?.lifestyle?.drinking || '');
      setSmoking(profile?.lifestyle?.smoking || '');
      setSocialLevel(profile?.lifestyle?.socialLevel || '');
      setPersonalityType(profile?.lifestyle?.personalityType || '');
      setHobbies(profile?.lifestyle?.hobbies || []);
      setInterests(profile?.lifestyle?.interests || []);
      setFreeTimePrefer(profile?.datingStyle?.freeTimePrefer || []);
      setDateStyle(profile?.datingStyle?.dateStyle || []);
    } catch (error) {
      Logger.error('Failed to fetch profile', error);
      showToast({ type: 'error', text1: t('common.error'), text2: t('profile_edit.error_load') });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    try {
      setSavingSection(section);
      switch (section) {
        case 'basicInfo':
          let genderEnum = 3;
          if (gender === 'Male') genderEnum = 1;
          else if (gender === 'Female') genderEnum = 2;

          await profileService.updateBasicInfo({ displayName, dob, gender: genderEnum as any, languages });
          break;
        case 'bio':
          let genderBioEnum = 3;
          if (gender === 'Male') genderBioEnum = 1;
          else if (gender === 'Female') genderBioEnum = 2;
          
          await profileService.updateBio({ 
            bio, 
            gender: genderBioEnum as any, 
            interestedIn 
          });
          break;
        case 'background':
          await profileService.updateBackground({ education, occupation });
          break;
        case 'lifestyle':
          await profileService.updateLifestyle({ drinking, smoking, socialLevel, personalityType, hobbies, interests });
          break;
        case 'datingStyle':
          await profileService.updateDatingStyle({ freeTimePrefer, dateStyle });
          break;
        case 'location':
          setSavingSection('location');
          const { status } = await Location.getForegroundPermissionsAsync();
          let latitude = 0;
          let longitude = 0;
          
          if (status === 'granted') {
            const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            latitude = currentLoc.coords.latitude;
            longitude = currentLoc.coords.longitude;
          }
          
          await profileService.updateLocation({ locationName, latitude, longitude });
          break;
      }
      showToast({ type: 'success', text1: t('common.success'), text2: `${t(`profile_edit.${section}`)} ${t('profile_edit.success_update')}` });
    } catch (error) {
      Logger.error(`Failed to update ${section}`, error);
      showToast({ type: 'error', text1: t('common.error'), text2: `${t('profile_edit.error_update')} ${t(`profile_edit.${section}`)}` });
    } finally {
      setSavingSection(null);
    }
  };

  const openModal = (type: string, title: string, options: (string | { label: string; value: string })[]) => {
    setModalType(type);
    setModalTitle(title);
    setModalOptions(options as any);
    setModalVisible(true);
  };

  const handleSelect = (option: string) => {
    switch (modalType) {
      case 'gender': setGender(option); setModalVisible(false); break;
      case 'education': setEducation(option); setModalVisible(false); break;
      case 'drinking': setDrinking(option); setModalVisible(false); break;
      case 'smoking': setSmoking(option); setModalVisible(false); break;
      case 'socialLevel': setSocialLevel(option); setModalVisible(false); break;
      case 'personalityType': setPersonalityType(option); setModalVisible(false); break;
      case 'languages': setLanguages(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]); break;
      case 'hobbies': setHobbies(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]); break;
      case 'interests': setInterests(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]); break;
      case 'freeTimePrefer': setFreeTimePrefer(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]); break;
      case 'dateStyle': setDateStyle(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]); break;
    }
  };

  const getSelectedValues = () => {
    switch (modalType) {
      case 'gender': return gender;
      case 'education': return education;
      case 'drinking': return drinking;
      case 'smoking': return smoking;
      case 'socialLevel': return socialLevel;
      case 'personalityType': return personalityType;
      case 'languages': return languages;
      case 'hobbies': return hobbies;
      case 'interests': return interests;
      case 'freeTimePrefer': return freeTimePrefer;
      case 'dateStyle': return dateStyle;
      default: return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE3F57" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EditProfileHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          <MenuButton 
            icon="person-outline" title={t('profile_edit.basic_info')} 
            onPress={() => setActiveModal('basicInfo')} 
          />
          <MenuButton 
            icon="document-text-outline" title={t('profile_edit.bio')} 
            onPress={() => setActiveModal('bio')} 
          />
          <MenuButton 
            icon="school-outline" title={t('profile_edit.background')} 
            onPress={() => setActiveModal('background')} 
          />
          <MenuButton 
            icon="heart-outline" title={t('profile_edit.lifestyle')} 
            onPress={() => setActiveModal('lifestyle')} 
          />
          <MenuButton 
            icon="calendar-outline" title={t('profile_edit.datingStyle')} 
            onPress={() => setActiveModal('datingStyle')} 
          />
          <MenuButton 
            icon="location-outline" title={t('profile_edit.location')} 
            onPress={() => setActiveModal('location')} 
          />
        </View>
      </ScrollView>

      {/* Section Overlays - Optimized to allow Toasts and avoid Modal stacking issues */}
      {activeModal && (
        <View style={[StyleSheet.absoluteFill, styles.sectionOverlay, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{t('profile_edit.edit_section')} {t(`profile_edit.${activeModal}`)}</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {activeModal === 'basicInfo' && (
                <BasicInfoSection 
                  displayName={displayName} setDisplayName={setDisplayName}
                  dob={dob} setDob={setDob}
                  gender={gender} languages={languages}
                  onOpenModal={openModal}
                  onSave={() => handleSaveSection('basicInfo')}
                  isSaving={savingSection === 'basicInfo'}
                />
              )}
              {activeModal === 'bio' && (
                <BioSection 
                  bio={bio} setBio={setBio}
                  onSave={() => handleSaveSection('bio')}
                  isSaving={savingSection === 'bio'}
                />
              )}
              {activeModal === 'background' && (
                <BackgroundSection 
                  occupation={occupation} setOccupation={setOccupation}
                  education={education}
                  onOpenModal={openModal}
                  onSave={() => handleSaveSection('background')}
                  isSaving={savingSection === 'background'}
                />
              )}
              {activeModal === 'lifestyle' && (
                <LifestyleSection 
                  drinking={drinking} smoking={smoking}
                  socialLevel={socialLevel} personalityType={personalityType}
                  hobbies={hobbies} interests={interests}
                  onOpenModal={openModal}
                  onSave={() => handleSaveSection('lifestyle')}
                  isSaving={savingSection === 'lifestyle'}
                />
              )}
              {activeModal === 'datingStyle' && (
                <DatingStyleSection 
                  freeTimePrefer={freeTimePrefer} dateStyle={dateStyle}
                  onOpenModal={openModal}
                  onSave={() => handleSaveSection('datingStyle')}
                  isSaving={savingSection === 'datingStyle'}
                />
              )}
              {activeModal === 'location' && (
                <LocationSection 
                  locationName={locationName} setLocationName={setLocationName}
                  onSave={() => handleSaveSection('location')}
                  isSaving={savingSection === 'location'}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      <EditSelectionModal 
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        selectedValues={getSelectedValues()}
        isMultiSelect={['languages', 'hobbies', 'interests', 'freeTimePrefer', 'dateStyle'].includes(modalType)}
        onSelect={handleSelect}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const MenuButton = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuButtonLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#EE3F57" />
      </View>
      <Text style={styles.menuButtonText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F8' },
  scrollContent: { padding: 16 },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  modalScroll: {
    padding: 20,
  },
  sectionOverlay: {
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
