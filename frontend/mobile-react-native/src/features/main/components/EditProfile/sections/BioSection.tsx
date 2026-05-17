import React from 'react';
import { Text, TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';

import { useTranslation } from 'react-i18next';

interface BioSectionProps {
  bio: string;
  setBio: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BioSection = ({ bio, setBio, onSave, isSaving }: BioSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.about_me')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.bio_label')}</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={bio} 
        onChangeText={setBio} 
        placeholder={t('profile_edit.bio_placeholder')} 
        placeholderTextColor="#A1A1AA"
        multiline
        numberOfLines={4}
      />
    </EditProfileSection>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
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
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
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
    marginTop: 8,
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
