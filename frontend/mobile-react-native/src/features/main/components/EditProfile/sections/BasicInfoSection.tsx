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
  onOpenModal: (type: string, title: string, options: string[]) => void;
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
        onPress={() => onOpenModal('gender', t('profile_edit.select_gender'), [t('discover.men'), t('discover.women'), t('common.other')])}
      >
        <Text style={gender ? styles.selectorText : styles.placeholderText}>{gender || t('profile_edit.select_gender')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.languages')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('languages', t('profile_edit.select_languages'), ['Vietnamese', 'English', 'Korean', 'Japanese', 'Chinese', 'French'])}
      >
        <Text style={languages.length > 0 ? styles.selectorText : styles.placeholderText}>
          {languages.length > 0 ? languages.join(', ') : t('profile_edit.select_languages')}
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
