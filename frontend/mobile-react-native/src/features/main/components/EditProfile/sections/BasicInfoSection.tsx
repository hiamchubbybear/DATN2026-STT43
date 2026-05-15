import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

interface BasicInfoSectionProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  gender: string;
  languages: string[];
  onOpenModal: (type: string, title: string, options: (string | { label: string; value: string })[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BasicInfoSection = ({
  displayName,
  setDisplayName,
  dob,
  setDob,
  gender,
  languages,
  onOpenModal,
  onSave,
  isSaving
}: BasicInfoSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.basic_info')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.display_name')}</Text>
      <TextInput 
        style={styles.input} 
        value={displayName} 
        onChangeText={setDisplayName} 
        placeholder={t('setup.step1_placeholder')} 
        placeholderTextColor="#A1A1AA" 
      />

      <Text style={styles.label}>{t('profile_edit.birthday')} (YYYY-MM-DD)</Text>
      <TextInput 
        style={styles.input} 
        value={dob?.split('T')[0]} 
        onChangeText={setDob} 
        placeholder="1997-03-04" 
        placeholderTextColor="#A1A1AA" 
      />

      <Text style={styles.label}>{t('profile_edit.gender')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('gender', t('profile_edit.select_gender'), [
          { label: t('discover.men'), value: 'Male' },
          { label: t('discover.women'), value: 'Female' },
          { label: t('common.other'), value: 'Other' }
        ])}
      >
        <Text style={gender ? styles.selectorText : styles.placeholderText}>
          {gender === 'Male' ? t('discover.men') : gender === 'Female' ? t('discover.women') : gender === 'Other' ? t('common.other') : t('profile_edit.select_gender')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.languages')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('languages', t('profile_edit.select_languages'), [
          { label: t('common.choices.lang_vi'), value: 'Vietnamese' },
          { label: t('common.choices.lang_en'), value: 'English' },
          { label: t('common.choices.lang_ko'), value: 'Korean' },
          { label: t('common.choices.lang_ja'), value: 'Japanese' },
          { label: t('common.choices.lang_zh'), value: 'Chinese' },
          { label: t('common.choices.lang_fr'), value: 'French' },
          { label: t('common.choices.lang_es'), value: 'Spanish' },
          { label: t('common.choices.lang_de'), value: 'German' },
          { label: t('common.choices.lang_it'), value: 'Italian' },
          { label: t('common.choices.lang_ru'), value: 'Russian' },
          { label: t('common.choices.lang_th'), value: 'Thai' }
        ])}
      >
        <Text style={languages.length > 0 ? styles.selectorText : styles.placeholderText}>
          {languages.length > 0 
            ? languages.map(l => {
                switch(l) {
                  case 'Vietnamese': return t('common.choices.lang_vi');
                  case 'English': return t('common.choices.lang_en');
                  case 'Korean': return t('common.choices.lang_ko');
                  case 'Japanese': return t('common.choices.lang_ja');
                  case 'Chinese': return t('common.choices.lang_zh');
                  case 'French': return t('common.choices.lang_fr');
                  case 'Spanish': return t('common.choices.lang_es');
                  case 'German': return t('common.choices.lang_de');
                  case 'Italian': return t('common.choices.lang_it');
                  case 'Russian': return t('common.choices.lang_ru');
                  case 'Thai': return t('common.choices.lang_th');
                  default: return l;
                }
              }).join(', ') 
            : t('profile_edit.select_languages')}
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
  input: {
    height: 52,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
