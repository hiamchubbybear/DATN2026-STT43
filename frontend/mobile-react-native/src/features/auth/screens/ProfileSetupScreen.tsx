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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 13;

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [interestedIn, setInterestedIn] = useState('Female');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [drinking, setDrinking] = useState('Not for me');
  const [smoking, setSmoking] = useState('Non-smoker');
  const [socialLevel, setSocialLevel] = useState('Socially active');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [freeTimePrefer, setFreeTimePrefer] = useState<string[]>([]);
  const [dateStyle, setDateStyle] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['vietnamese']);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleNext = async () => {
    if (step === 1 && !displayName.trim()) {
      showToast({
        title: t('missing_fields', 'Required Information'),
        message: t('setup.step1_placeholder'),
        type: 'error'
      });
      return;
    }
    if (step === 2) {
      const dobDate = new Date(dob);
      const today = new Date();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || isNaN(dobDate.getTime()) || dobDate > today) {
        showToast({
          title: 'Invalid Date',
          message: 'Invalid date of birth',
          type: 'error'
        });
        return;
      }
    }
    if (step === 13 && photos.length === 0) {
      showToast({
        title: t('common.error'),
        message: t('setup.step10_subtitle'),
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
        socialLevel,
        hobbies,
        interests,
        freeTimePrefer,
        dateStyle,
        languages: languages.length > 0 ? languages : ['english'],
      });

      // 2. Upload Photos sequentially
      if (photos.length > 0) {
        for (const uri of photos) {
          try {
            await profileService.uploadPhoto(uri);
          } catch (e) {
            console.error("Failed to upload photo:", uri, e);
          }
        }
      }

      showToast({
        title: 'Success',
        message: 'Your profile has been completed!',
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
            <Text style={styles.title}>{t('setup.step1_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step1_subtitle')}</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder={t('setup.step1_placeholder')}
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
            <Text style={styles.title}>{t('setup.step2_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step2_subtitle')}</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                let formatted = cleaned;
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
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>{t('setup.step3_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step3_subtitle')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { label: t('discover.men'), value: 'Male' },
                { label: t('discover.women'), value: 'Female' },
                { label: t('common.other'), value: 'Other' }
              ].map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.optionButton, gender === g.value && styles.optionButtonActive]}
                  onPress={() => setGender(g.value)}
                >
                  <Text style={[styles.optionText, gender === g.value && styles.optionTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>{t('setup.step4_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step4_subtitle')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { label: t('discover.men'), value: 'Male' },
                { label: t('discover.women'), value: 'Female' },
                { label: t('discover.everyone'), value: 'Everyone' }
              ].map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.optionButton, interestedIn === g.value && styles.optionButtonActive]}
                  onPress={() => setInterestedIn(g.value)}
                >
                  <Text style={[styles.optionText, interestedIn === g.value && styles.optionTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.title}>{t('setup.step5_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step5_subtitle')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('setup.step5_occupation')}</Text>
              <TextInput
                style={styles.inputLarge}
                placeholder={t('profile_edit.occupation_placeholder')}
                value={occupation}
                onChangeText={setOccupation}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.inputGroup, { marginTop: 24 }]}>
              <Text style={styles.label}>{t('setup.step5_school')}</Text>
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
            <Text style={styles.title}>{t('setup.step6_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step6_subtitle')}</Text>
            <TextInput
              style={[styles.inputLarge, styles.textArea]}
              placeholder={t('profile_edit.bio_placeholder')}
              value={bio}
              onChangeText={setBio}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </>
        );
      case 7:
        return (
          <>
            <Text style={styles.title}>{t('setup.step7_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step7_subtitle')}</Text>
            
            <Text style={styles.sectionLabel}>{t('setup.step7_drinking')}</Text>
            <View style={styles.chipsContainer}>
              {[
                { label: t('common.choices.freq_no'), value: 'Never' },
                { label: t('common.choices.freq_sometimes'), value: 'Socially' },
                { label: t('common.choices.freq_often'), value: 'Frequently' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, drinking === item.value && styles.chipActive]}
                  onPress={() => setDrinking(item.value)}
                >
                  <Text style={[styles.chipText, drinking === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t('setup.step7_smoking')}</Text>
            <View style={styles.chipsContainer}>
              {[
                { label: t('common.choices.freq_no'), value: 'Never' },
                { label: t('common.choices.freq_sometimes'), value: 'Socially' },
                { label: t('common.choices.freq_often'), value: 'Frequently' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, smoking === item.value && styles.chipActive]}
                  onPress={() => setSmoking(item.value)}
                >
                  <Text style={[styles.chipText, smoking === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t('setup.step7_social')}</Text>
            <View style={styles.chipsContainer}>
              {[
                { label: t('common.choices.soc_introvert'), value: 'Introvert' },
                { label: t('common.choices.soc_extrovert'), value: 'Extrovert' },
                { label: t('common.choices.soc_ambivert'), value: 'Ambivert' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, socialLevel === item.value && styles.chipActive]}
                  onPress={() => setSocialLevel(item.value)}
                >
                  <Text style={[styles.chipText, socialLevel === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 8:
        const hobbyList = [
          { label: t('common.choices.hobby_reading'), value: 'Reading' },
          { label: t('common.choices.hobby_gaming'), value: 'Gaming' },
          { label: t('common.choices.hobby_cooking'), value: 'Cooking' },
          { label: t('common.choices.hobby_hiking'), value: 'Hiking' },
          { label: t('common.choices.hobby_photo'), value: 'Photography' },
          { label: t('common.choices.hobby_music'), value: 'Music' },
          { label: t('common.choices.hobby_travel'), value: 'Traveling' },
          { label: t('common.choices.hobby_sports'), value: 'Sports' },
          { label: t('common.choices.hobby_coffee'), value: 'Coffee' },
          { label: t('common.choices.hobby_art'), value: 'Art' },
          { label: t('common.choices.hobby_movies'), value: 'Movies' },
          { label: t('common.choices.hobby_dancing'), value: 'Dancing' },
          { label: t('common.choices.hobby_fitness'), value: 'Fitness' },
          { label: t('common.choices.hobby_yoga'), value: 'Yoga' },
          { label: t('common.choices.hobby_wine'), value: 'Wine' },
          { label: t('common.choices.hobby_foodie'), value: 'Foodie' },
          { label: t('common.choices.hobby_animals'), value: 'Animals' },
          { label: t('common.choices.hobby_netflix'), value: 'Netflix' },
          { label: t('common.choices.hobby_gardening'), value: 'Gardening' },
          { label: t('common.choices.hobby_swimming'), value: 'Swimming' },
          { label: t('common.choices.hobby_coding'), value: 'Coding' },
          { label: t('common.choices.hobby_tattoos'), value: 'Tattoos' },
          { label: t('common.choices.hobby_cars'), value: 'Cars' },
          { label: t('common.choices.hobby_outdoors'), value: 'Outdoors' },
          { label: t('common.choices.hobby_baking'), value: 'Baking' },
          { label: t('common.choices.hobby_climbing'), value: 'Climbing' },
          { label: t('common.choices.hobby_skating'), value: 'Skating' },
          { label: t('common.choices.hobby_thrift'), value: 'Thrifting' },
          { label: t('common.choices.hobby_concerts'), value: 'Concerts' },
          { label: t('common.choices.hobby_museums'), value: 'Museums' },
          { label: t('common.choices.hobby_camping'), value: 'Camping' },
          { label: t('common.choices.hobby_surfing'), value: 'Surfing' },
          { label: t('common.choices.hobby_pottery'), value: 'Pottery' },
          { label: t('common.choices.hobby_karaoke'), value: 'Karaoke' }
        ];
        return (
          <>
            <Text style={styles.title}>{t('setup.step8_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step8_subtitle')}</Text>
            <View style={styles.chipsContainer}>
              {hobbyList.map((h) => {
                const isActive = hobbies.includes(h.value);
                return (
                  <TouchableOpacity
                    key={h.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(h.value, hobbies, setHobbies)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{h.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 9:
        const interestList = [
          { label: t('common.choices.int_tech'), value: 'Technology' },
          { label: t('common.choices.int_art'), value: 'Art & Design' },
          { label: t('common.choices.int_science'), value: 'Science' },
          { label: t('common.choices.int_fashion'), value: 'Fashion' },
          { label: t('common.choices.int_movies'), value: 'Movies & TV' },
          { label: t('common.choices.int_anime'), value: 'Anime & Manga' },
          { label: t('common.choices.int_politics'), value: 'Politics' },
          { label: t('common.choices.int_business'), value: 'Business & Startups' },
          { label: t('common.choices.int_music'), value: 'Music' },
          { label: t('common.choices.int_sports'), value: 'Sports' },
          { label: t('common.choices.int_cooking'), value: 'Cooking' },
          { label: t('common.choices.int_travel'), value: 'Travel' },
          { label: t('common.choices.int_gaming'), value: 'Gaming' },
          { label: t('common.choices.int_fitness'), value: 'Fitness & Health' },
          { label: t('common.choices.int_finance'), value: 'Finance' },
          { label: t('common.choices.int_history'), value: 'History' },
          { label: t('common.choices.int_psychology'), value: 'Psychology' },
          { label: t('common.choices.int_nature'), value: 'Nature' },
          { label: t('common.choices.int_astrology'), value: 'Astrology' },
          { label: t('common.choices.int_charity'), value: 'Charity & Volunteering' },
          { label: t('common.choices.int_literature'), value: 'Literature' },
          { label: t('common.choices.int_philosophy'), value: 'Philosophy' },
          { label: t('common.choices.int_environment'), value: 'Environment' },
          { label: t('common.choices.int_space'), value: 'Space & Astronomy' },
          { label: t('common.choices.int_wellness'), value: 'Wellness' },
          { label: t('common.choices.int_architecture'), value: 'Architecture' },
          { label: t('common.choices.int_podcasts'), value: 'Podcasts' },
          { label: t('common.choices.int_diy'), value: 'DIY & Crafting' },
          { label: t('common.choices.int_marketing'), value: 'Marketing' },
          { label: t('common.choices.int_journalism'), value: 'Journalism' }
        ];
        return (
          <>
            <Text style={styles.title}>{t('profile_edit.interests_label')}</Text>
            <Text style={styles.subtitle}>{t('profile_edit.select_interests')}</Text>
            <View style={styles.chipsContainer}>
              {interestList.map((i) => {
                const isActive = interests.includes(i.value);
                return (
                  <TouchableOpacity
                    key={i.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(i.value, interests, setInterests)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{i.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 10:
        const langList = [
          { label: t('common.choices.lang_vi'), value: 'vietnamese' },
          { label: t('common.choices.lang_en'), value: 'english' },
          { label: t('common.choices.lang_ko'), value: 'korean' },
          { label: t('common.choices.lang_ja'), value: 'japanese' },
          { label: t('common.choices.lang_zh'), value: 'chinese' },
          { label: t('common.choices.lang_fr'), value: 'french' },
          { label: t('common.choices.lang_es'), value: 'spanish' },
          { label: t('common.choices.lang_de'), value: 'german' },
          { label: t('common.choices.lang_it'), value: 'italian' },
          { label: t('common.choices.lang_ru'), value: 'russian' },
          { label: t('common.choices.lang_th'), value: 'thai' }
        ];
        return (
          <>
            <Text style={styles.title}>{t('setup.step9_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step9_subtitle')}</Text>
            <View style={styles.chipsContainer}>
              {langList.map((lang) => {
                const isActive = languages.includes(lang.value);
                return (
                  <TouchableOpacity
                    key={lang.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(lang.value, languages, setLanguages)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{lang.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 11:
        const freeTimeList = [
          { label: t('common.choices.ft_stay'), value: 'Staying In' },
          { label: t('common.choices.ft_out'), value: 'Going Out' },
          { label: t('common.choices.ft_chill'), value: 'Chilling' },
          { label: t('common.choices.ft_prod'), value: 'Productive' },
          { label: t('common.choices.ft_adv'), value: 'Adventurous' },
          { label: t('common.choices.ft_gym'), value: 'Gym' },
          { label: t('common.choices.ft_read'), value: 'Reading' },
          { label: t('common.choices.ft_game'), value: 'Gaming' },
          { label: t('common.choices.ft_brunch'), value: 'Brunching' },
          { label: t('common.choices.ft_farmers_market'), value: 'Farmers Market' },
          { label: t('common.choices.ft_volunteering'), value: 'Volunteering' },
          { label: t('common.choices.ft_meditating'), value: 'Meditating' },
          { label: t('common.choices.ft_puzzles'), value: 'Puzzles / Lego' },
          { label: t('common.choices.ft_exhibition'), value: 'Art Exhibition' },
          { label: t('common.choices.ft_live_music'), value: 'Live Music' },
          { label: t('common.choices.ft_hiking'), value: 'Hiking / Nature' },
          { label: t('common.choices.ft_cafe_hopping'), value: 'Cafe Hopping' },
          { label: t('common.choices.ft_skating'), value: 'Skating / Boarding' }
        ];
        return (
          <>
            <Text style={styles.title}>{t('profile_edit.free_time_label')}</Text>
            <Text style={styles.subtitle}>{t('profile_edit.select_preference')}</Text>
            <View style={styles.chipsContainer}>
              {freeTimeList.map((ft) => {
                const isActive = freeTimePrefer.includes(ft.value);
                return (
                  <TouchableOpacity
                    key={ft.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(ft.value, freeTimePrefer, setFreeTimePrefer)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{ft.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 12:
        const datingStyleList = [
          { label: t('common.choices.ds_coffee'), value: 'Coffee' },
          { label: t('common.choices.ds_dinner'), value: 'Dinner' },
          { label: t('common.choices.ds_movie'), value: 'Movies' },
          { label: t('common.choices.ds_walk'), value: 'Long Walks' },
          { label: t('common.choices.ds_act'), value: 'Active' },
          { label: t('common.choices.ds_bar'), value: 'Bar' },
          { label: t('common.choices.ds_museum'), value: 'Museum' },
          { label: t('common.choices.ds_concert'), value: 'Concert' },
          { label: t('common.choices.ds_sport'), value: 'Sport' },
          { label: t('common.choices.ds_cooking'), value: 'Cooking' },
          { label: t('common.choices.ds_travel'), value: 'Travel' },
          { label: t('common.choices.ds_arcade'), value: 'Arcade / Games' },
          { label: t('common.choices.ds_picnic'), value: 'Picnic' },
          { label: t('common.choices.ds_bowling'), value: 'Bowling' },
          { label: t('common.choices.ds_workshop'), value: 'Workshop / Class' },
          { label: t('common.choices.ds_karaoke'), value: 'Karaoke' },
          { label: t('common.choices.ds_festival'), value: 'Festival / Fair' },
          { label: t('common.choices.ds_bookstore'), value: 'Bookstore Date' },
          { label: t('common.choices.ds_zoo'), value: 'Zoo / Aquarium' },
          { label: t('common.choices.ds_beach'), value: 'Beach Trip' },
          { label: t('common.choices.ds_sports_game'), value: 'Watch Sports' }
        ];
        return (
          <>
            <Text style={styles.title}>{t('profile_edit.date_style_label')}</Text>
            <Text style={styles.subtitle}>{t('profile_edit.select_style')}</Text>
            <View style={styles.chipsContainer}>
              {datingStyleList.map((ds) => {
                const isActive = dateStyle.includes(ds.value);
                return (
                  <TouchableOpacity
                    key={ds.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleArrayItem(ds.value, dateStyle, setDateStyle)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{ds.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 13:
        const slots = [0, 1, 2, 3, 4, 5];
        return (
          <>
            <Text style={styles.title}>{t('setup.step10_title')}</Text>
            <Text style={styles.subtitle}>{t('setup.step10_subtitle')}</Text>
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
                          disabled={index > photos.length}
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
          </>
        );
    }
  };

  const progressPercentage = (step / totalSteps) * 100;
  const isOptionalStep = step >= 5 && step <= 12;

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
          <Image 
            source={require('../../../../assets/images/logo_v2.png')} 
            style={styles.headerLogo} 
            resizeMode="contain"
          />
          {isOptionalStep ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>{t('setup.skip')}</Text>
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
              <Text style={styles.primaryButtonText}>{step === totalSteps ? t('setup.complete_btn') : t('common.continue')}</Text>
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
  headerLogo: {
    width: scale(24),
    height: scale(24),
    borderRadius: radius(6),
    marginLeft: spacing(12),
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
    paddingBottom: spacing(40),
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
  sectionLabel: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: '#374151',
    marginBottom: spacing(12),
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
    borderBottomWidth: 1, 
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
