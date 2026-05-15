import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';

import { useTranslation } from 'react-i18next';

interface BackgroundSectionProps {
  occupation: string;
  setOccupation: (val: string) => void;
  education: string;
  onOpenModal: (type: string, title: string, options: (string | { label: string; value: string })[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BackgroundSection = ({
  occupation,
  setOccupation,
  education,
  onOpenModal,
  onSave,
  isSaving
}: BackgroundSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.background')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.occupation_label')}</Text>
      <TextInput 
        style={styles.input} 
        value={occupation} 
        onChangeText={setOccupation} 
        placeholder={t('profile_edit.occupation_placeholder')} 
        placeholderTextColor="#A1A1AA" 
      />

      <Text style={styles.label}>{t('profile_edit.education_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('education', t('profile_edit.select_education'), [
          { label: t('common.choices.edu_high'), value: 'High School' },
          { label: t('common.choices.edu_vocational'), value: 'Vocational' },
          { label: t('common.choices.edu_college'), value: 'College' },
          { label: t('common.choices.edu_bachelor'), value: 'Bachelor' },
          { label: t('common.choices.edu_master'), value: 'Master' },
          { label: t('common.choices.edu_phd'), value: 'PhD' }
        ])}
      >
        <Text style={education ? styles.selectorText : styles.placeholderText}>
          {education === 'High School' ? t('common.choices.edu_high') : 
           education === 'Vocational' ? t('common.choices.edu_vocational') :
           education === 'College' ? t('common.choices.edu_college') :
           education === 'Bachelor' ? t('common.choices.edu_bachelor') : 
           education === 'Master' ? t('common.choices.edu_master') : 
           education === 'PhD' ? t('common.choices.edu_phd') : 
           t('profile_edit.select_education')}
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
