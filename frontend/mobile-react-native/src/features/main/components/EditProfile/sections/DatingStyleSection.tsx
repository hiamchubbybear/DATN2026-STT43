import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

interface DatingStyleSectionProps {
  freeTimePrefer: string[];
  dateStyle: string[];
  onOpenModal: (type: string, title: string, options: (string | { label: string; value: string })[]) => void;
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
        onPress={() => onOpenModal('freeTimePrefer', t('profile_edit.select_preference'), [
          { label: t('common.choices.ft_stay'), value: 'Staying In' },
          { label: t('common.choices.ft_out'), value: 'Going Out' },
          { label: t('common.choices.ft_chill'), value: 'Chilling' },
          { label: t('common.choices.ft_prod'), value: 'Productive' },
          { label: t('common.choices.ft_adv'), value: 'Adventurous' },
          { label: t('common.choices.ft_gym'), value: 'Gym' },
          { label: t('common.choices.ft_read'), value: 'Reading' },
          { label: t('common.choices.ft_game'), value: 'Gaming' },
          { label: t('common.choices.ft_brunch'), value: 'Brunching' },
          { label: t('common.choices.ft_farmers_market'), value: 'Farmers Market' },
          { label: t('common.choices.ft_volunteering'), value: 'Volunteering' },
          { label: t('common.choices.ft_meditating'), value: 'Meditating' },
          { label: t('common.choices.ft_puzzles'), value: 'Puzzles / Lego' },
          { label: t('common.choices.ft_exhibition'), value: 'Art Exhibition' },
          { label: t('common.choices.ft_live_music'), value: 'Live Music' },
          { label: t('common.choices.ft_hiking'), value: 'Hiking / Nature' },
          { label: t('common.choices.ft_cafe_hopping'), value: 'Cafe Hopping' },
          { label: t('common.choices.ft_skating'), value: 'Skating / Boarding' }
        ])}
      >
        <Text style={freeTimePrefer.length > 0 ? styles.selectorText : styles.placeholderText}>
          {freeTimePrefer.length > 0 
            ? freeTimePrefer.map(f => {
                switch(f) {
                  case 'Staying In': return t('common.choices.ft_stay');
                  case 'Going Out': return t('common.choices.ft_out');
                  case 'Chilling': return t('common.choices.ft_chill');
                  case 'Productive': return t('common.choices.ft_prod');
                  case 'Adventurous': return t('common.choices.ft_adv');
                  case 'Gym': return t('common.choices.ft_gym');
                  case 'Reading': return t('common.choices.ft_read');
                  case 'Gaming': return t('common.choices.ft_game');
                  case 'Brunching': return t('common.choices.ft_brunch');
                  case 'Farmers Market': return t('common.choices.ft_farmers_market');
                  case 'Volunteering': return t('common.choices.ft_volunteering');
                  case 'Meditating': return t('common.choices.ft_meditating');
                  case 'Puzzles / Lego': return t('common.choices.ft_puzzles');
                  case 'Art Exhibition': return t('common.choices.ft_exhibition');
                  case 'Live Music': return t('common.choices.ft_live_music');
                  case 'Hiking / Nature': return t('common.choices.ft_hiking');
                  case 'Cafe Hopping': return t('common.choices.ft_cafe_hopping');
                  case 'Skating / Boarding': return t('common.choices.ft_skating');
                  default: return f;
                }
              }).join(', ') 
            : t('profile_edit.select_preference')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.date_style_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('dateStyle', t('profile_edit.select_style'), [
          { label: t('common.choices.ds_coffee'), value: 'Coffee' },
          { label: t('common.choices.ds_dinner'), value: 'Dinner' },
          { label: t('common.choices.ds_movie'), value: 'Movies' },
          { label: t('common.choices.ds_walk'), value: 'Long Walks' },
          { label: t('common.choices.ds_act'), value: 'Active' },
          { label: t('common.choices.ds_bar'), value: 'Bar' },
          { label: t('common.choices.ds_museum'), value: 'Museum' },
          { label: t('common.choices.ds_concert'), value: 'Concert' },
          { label: t('common.choices.ds_sport'), value: 'Sport' },
          { label: t('common.choices.ds_cooking'), value: 'Cooking' },
          { label: t('common.choices.ds_travel'), value: 'Travel' },
          { label: t('common.choices.ds_arcade'), value: 'Arcade / Games' },
          { label: t('common.choices.ds_picnic'), value: 'Picnic' },
          { label: t('common.choices.ds_bowling'), value: 'Bowling' },
          { label: t('common.choices.ds_workshop'), value: 'Workshop / Class' },
          { label: t('common.choices.ds_karaoke'), value: 'Karaoke' },
          { label: t('common.choices.ds_festival'), value: 'Festival / Fair' },
          { label: t('common.choices.ds_bookstore'), value: 'Bookstore Date' },
          { label: t('common.choices.ds_zoo'), value: 'Zoo / Aquarium' },
          { label: t('common.choices.ds_beach'), value: 'Beach Trip' },
          { label: t('common.choices.ds_sports_game'), value: 'Watch Sports' }
        ])}
      >
        <Text style={dateStyle.length > 0 ? styles.selectorText : styles.placeholderText}>
          {dateStyle.length > 0 
            ? dateStyle.map(d => {
                switch(d) {
                  case 'Coffee': return t('common.choices.ds_coffee');
                  case 'Dinner': return t('common.choices.ds_dinner');
                  case 'Movies': return t('common.choices.ds_movie');
                  case 'Long Walks': return t('common.choices.ds_walk');
                  case 'Active': return t('common.choices.ds_act');
                  case 'Bar': return t('common.choices.ds_bar');
                  case 'Museum': return t('common.choices.ds_museum');
                  case 'Concert': return t('common.choices.ds_concert');
                  case 'Sport': return t('common.choices.ds_sport');
                  case 'Cooking': return t('common.choices.ds_cooking');
                  case 'Travel': return t('common.choices.ds_travel');
                  case 'Arcade / Games': return t('common.choices.ds_arcade');
                  case 'Picnic': return t('common.choices.ds_picnic');
                  case 'Bowling': return t('common.choices.ds_bowling');
                  case 'Workshop / Class': return t('common.choices.ds_workshop');
                  case 'Karaoke': return t('common.choices.ds_karaoke');
                  case 'Festival / Fair': return t('common.choices.ds_festival');
                  case 'Bookstore Date': return t('common.choices.ds_bookstore');
                  case 'Zoo / Aquarium': return t('common.choices.ds_zoo');
                  case 'Beach Trip': return t('common.choices.ds_beach');
                  case 'Watch Sports': return t('common.choices.ds_sports_game');
                  default: return d;
                }
              }).join(', ') 
            : t('profile_edit.select_style')}
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
