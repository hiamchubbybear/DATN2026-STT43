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
  interestedIn: string;
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
  interestedIn,
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
        <Text style={[gender ? styles.selectorText : styles.placeholderText, { flex: 1, marginRight: 10 }]}>
          {gender === 'Male' ? t('discover.men') : gender === 'Female' ? t('discover.women') : gender === 'Other' ? t('common.other') : t('profile_edit.select_gender')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.interested_in')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('interestedIn', t('profile_edit.select_interested_in'), [
          { label: t('discover.men'), value: 'Male' },
          { label: t('discover.women'), value: 'Female' },
          { label: t('discover.everyone'), value: 'Other' }
        ])}
      >
        <Text style={[interestedIn ? styles.selectorText : styles.placeholderText, { flex: 1, marginRight: 10 }]}>
          {interestedIn === 'Male' ? t('discover.men') : interestedIn === 'Female' ? t('discover.women') : interestedIn === 'Other' ? t('discover.everyone') : t('profile_edit.select_interested_in')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.languages')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('languages', t('profile_edit.select_languages'), [
          { label: t('common.choices.lang_vi'), value: 'vietnamese' },
          { label: t('common.choices.lang_en'), value: 'english' },
          { label: t('common.choices.lang_ko'), value: 'korean' },
          { label: t('common.choices.lang_ja'), value: 'japanese' },
          { label: t('common.choices.lang_zh'), value: 'chinese' },
          { label: t('common.choices.lang_fr'), value: 'french' },
          { label: t('common.choices.lang_es'), value: 'spanish' },
          { label: t('common.choices.lang_de'), value: 'german' },
          { label: t('common.choices.lang_it'), value: 'italian' },
          { label: t('common.choices.lang_ru'), value: 'russian' },
          { label: t('common.choices.lang_th'), value: 'thai' }
        ])}
      >
        <Text style={[languages.length > 0 ? styles.selectorText : styles.placeholderText, { flex: 1, marginRight: 10 }]}>
          {languages.length > 0 
            ? languages.map(l => {
                switch(l.toLowerCase()) {
                  case 'vietnamese': return t('common.choices.lang_vi');
                  case 'english': return t('common.choices.lang_en');
                  case 'korean': return t('common.choices.lang_ko');
                  case 'japanese': return t('common.choices.lang_ja');
                  case 'chinese': return t('common.choices.lang_zh');
                  case 'french': return t('common.choices.lang_fr');
                  case 'spanish': return t('common.choices.lang_es');
                  case 'german': return t('common.choices.lang_de');
                  case 'italian': return t('common.choices.lang_it');
                  case 'russian': return t('common.choices.lang_ru');
                  case 'thai': return t('common.choices.lang_th');
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
    minHeight: 52,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
