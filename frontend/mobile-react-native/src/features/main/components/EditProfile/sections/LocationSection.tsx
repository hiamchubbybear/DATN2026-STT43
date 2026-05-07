import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { EditProfileSection } from '../EditProfileSection';

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
  return (
    <EditProfileSection title="Discovery Location" onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>Location Name</Text>
      <TextInput 
        style={styles.input} 
        value={locationName} 
        onChangeText={setLocationName} 
        placeholder="Enter your city/region" 
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
