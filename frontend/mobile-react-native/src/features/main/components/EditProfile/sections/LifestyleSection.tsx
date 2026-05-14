import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

interface LifestyleSectionProps {
  drinking: string;
  smoking: string;
  socialLevel: string;
  personalityType: string;
  hobbies: string[];
  interests: string[];
  onOpenModal: (type: string, title: string, options: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const LifestyleSection = ({
  drinking,
  smoking,
  socialLevel,
  personalityType,
  hobbies,
  interests,
  onOpenModal,
  onSave,
  isSaving
}: LifestyleSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.lifestyle_interests')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.drinking_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('drinking', t('profile_edit.select_habit'), [t('setup.freq_often'), t('setup.freq_sometimes'), t('setup.freq_no')])}
      >
        <Text style={drinking ? styles.selectorText : styles.placeholderText}>{drinking || t('profile_edit.select_habit')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.smoking_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('smoking', t('profile_edit.select_habit'), [t('setup.freq_often'), t('setup.freq_sometimes'), t('setup.freq_no')])}
      >
        <Text style={smoking ? styles.selectorText : styles.placeholderText}>{smoking || t('profile_edit.select_habit')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.social_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('socialLevel', t('profile_edit.select_level'), [t('setup.soc_introvert'), t('setup.soc_extrovert'), t('setup.soc_ambivert')])}
      >
        <Text style={socialLevel ? styles.selectorText : styles.placeholderText}>{socialLevel || t('profile_edit.select_level')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.personality_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('personalityType', t('profile_edit.select_type'), ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'])}
      >
        <Text style={personalityType ? styles.selectorText : styles.placeholderText}>{personalityType || t('profile_edit.select_type')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.hobbies_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('hobbies', t('profile_edit.select_hobbies'), [t('setup.hobby_reading'), t('setup.hobby_gaming'), t('setup.hobby_cooking'), t('setup.hobby_hiking'), t('setup.hobby_photo'), t('setup.hobby_music'), t('setup.hobby_travel'), t('setup.hobby_sports')])}
      >
        <Text style={hobbies.length > 0 ? styles.selectorText : styles.placeholderText}>
          {hobbies.length > 0 ? hobbies.join(', ') : t('profile_edit.select_hobbies')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.interests_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('interests', t('profile_edit.select_interests'), [t('setup.int_tech'), t('setup.int_art'), t('setup.int_science'), t('setup.int_fashion'), t('setup.int_movies'), t('setup.int_anime'), t('setup.int_politics'), t('setup.int_business')])}
      >
        <Text style={interests.length > 0 ? styles.selectorText : styles.placeholderText}>
          {interests.length > 0 ? interests.join(', ') : t('profile_edit.select_interests')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </EditProfileSection>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  selector: {
    height: 52,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
