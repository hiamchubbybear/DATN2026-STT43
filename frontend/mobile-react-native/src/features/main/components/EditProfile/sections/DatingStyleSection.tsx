import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.dating_style')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.free_time_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('freeTimePrefer', t('profile_edit.select_preference'), [t('setup.ft_stay'), t('setup.ft_out'), t('setup.ft_chill'), t('setup.ft_prod'), t('setup.ft_adv')])}
      >
        <Text style={freeTimePrefer.length > 0 ? styles.selectorText : styles.placeholderText}>
          {freeTimePrefer.length > 0 ? freeTimePrefer.join(', ') : t('profile_edit.select_preference')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.date_style_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('dateStyle', t('profile_edit.select_style'), [t('setup.ds_coffee'), t('setup.ds_dinner'), t('setup.ds_movie'), t('setup.ds_walk'), t('setup.ds_act'), t('setup.ds_bar')])}
      >
        <Text style={dateStyle.length > 0 ? styles.selectorText : styles.placeholderText}>
          {dateStyle.length > 0 ? dateStyle.join(', ') : t('profile_edit.select_style')}
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
