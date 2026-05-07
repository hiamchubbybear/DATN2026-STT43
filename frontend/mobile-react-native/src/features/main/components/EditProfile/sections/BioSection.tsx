import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { EditProfileSection } from '../EditProfileSection';

interface BioSectionProps {
  bio: string;
  setBio: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BioSection = ({ bio, setBio, onSave, isSaving }: BioSectionProps) => {
  return (
    <EditProfileSection title="About Me" onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>Bio</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={bio} 
        onChangeText={setBio} 
        placeholder="Tell us about yourself..." 
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
});
