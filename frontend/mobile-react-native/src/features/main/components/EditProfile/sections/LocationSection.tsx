import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

interface LocationSectionProps {
  locationName: string;
  setLocationName: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const LocationSection = ({
  locationName,
  setLocationName,
  onSave,
  isSaving
}: LocationSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.location')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.location_label')}</Text>
      <TextInput 
        style={styles.input} 
        value={locationName} 
        onChangeText={setLocationName} 
        placeholder={t('profile_edit.location_placeholder')} 
        placeholderTextColor="#A1A1AA" 
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
});
