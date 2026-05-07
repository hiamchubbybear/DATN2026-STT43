import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';

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
  return (
    <EditProfileSection title="Basic Info" onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>Display name</Text>
      <TextInput 
        style={styles.input} 
        value={displayName} 
        onChangeText={setDisplayName} 
        placeholder="Your name" 
        placeholderTextColor="#A1A1AA" 
      />

      <Text style={styles.label}>Birthday (YYYY-MM-DD)</Text>
      <TextInput 
        style={styles.input} 
        value={dob?.split('T')[0]} 
        onChangeText={setDob} 
        placeholder="1997-03-04" 
        placeholderTextColor="#A1A1AA" 
      />

      <Text style={styles.label}>Gender</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('gender', 'Select Gender', ['Male', 'Female', 'Other'])}
      >
        <Text style={gender ? styles.selectorText : styles.placeholderText}>{gender || 'Select Gender'}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Languages</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('languages', 'Select Languages', ['Vietnamese', 'English', 'Korean', 'Japanese', 'Chinese', 'French'])}
      >
        <Text style={languages.length > 0 ? styles.selectorText : styles.placeholderText}>
          {languages.length > 0 ? languages.join(', ') : 'Select Languages'}
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
