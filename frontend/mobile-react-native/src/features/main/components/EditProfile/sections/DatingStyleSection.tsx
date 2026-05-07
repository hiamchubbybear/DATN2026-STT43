import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';

interface DatingStyleSectionProps {
  freeTimePrefer: string[];
  dateStyle: string[];
  onOpenModal: (type: string, title: string, options: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const DatingStyleSection = ({
  freeTimePrefer,
  dateStyle,
  onOpenModal,
  onSave,
  isSaving
}: DatingStyleSectionProps) => {
  return (
    <EditProfileSection title="Dating Style" onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>Free Time Preference</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('freeTimePrefer', 'Free Time Preference', ['Staying In', 'Going Out', 'Chilling', 'Productive', 'Adventurous'])}
      >
        <Text style={freeTimePrefer.length > 0 ? styles.selectorText : styles.placeholderText}>
          {freeTimePrefer.length > 0 ? freeTimePrefer.join(', ') : 'Select Preference'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Preferred Date Style</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('dateStyle', 'Preferred Date Style', ['Coffee', 'Dinner', 'Movie', 'Walk', 'Activity', 'Bar'])}
      >
        <Text style={dateStyle.length > 0 ? styles.selectorText : styles.placeholderText}>
          {dateStyle.length > 0 ? dateStyle.join(', ') : 'Select Style'}
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
