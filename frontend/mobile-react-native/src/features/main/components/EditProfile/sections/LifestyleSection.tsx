import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';

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
  return (
    <EditProfileSection title="Lifestyle & Interests" onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>Drinking</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('drinking', 'Drinking Habit', ['Often', 'Sometimes', 'No'])}
      >
        <Text style={drinking ? styles.selectorText : styles.placeholderText}>{drinking || 'Select Habit'}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Smoking</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('smoking', 'Smoking Habit', ['Often', 'Sometimes', 'No'])}
      >
        <Text style={smoking ? styles.selectorText : styles.placeholderText}>{smoking || 'Select Habit'}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Social Level</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('socialLevel', 'Social Level', ['Introvert', 'Extrovert', 'Ambivert'])}
      >
        <Text style={socialLevel ? styles.selectorText : styles.placeholderText}>{socialLevel || 'Select Level'}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Personality Type</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('personalityType', 'Personality Type', ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'])}
      >
        <Text style={personalityType ? styles.selectorText : styles.placeholderText}>{personalityType || 'Select Type'}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Hobbies</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('hobbies', 'Hobbies', ['Reading', 'Gaming', 'Cooking', 'Hiking', 'Photography', 'Music', 'Traveling', 'Sports'])}
      >
        <Text style={hobbies.length > 0 ? styles.selectorText : styles.placeholderText}>
          {hobbies.length > 0 ? hobbies.join(', ') : 'Select Hobbies'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>Interests</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('interests', 'Interests', ['Technology', 'Art', 'Science', 'Fashion', 'Movies', 'Anime', 'Politics', 'Business'])}
      >
        <Text style={interests.length > 0 ? styles.selectorText : styles.placeholderText}>
          {interests.length > 0 ? interests.join(', ') : 'Select Interests'}
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
