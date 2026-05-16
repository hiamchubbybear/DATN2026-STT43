import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileSection } from '../EditProfileSection';
import { useTranslation } from 'react-i18next';

interface LifestyleSectionProps {
  drinking: string;
  smoking: string;
  socialLevel: string;
  personalityType: string;
  hobbies: string[];
  interests: string[];
  loveLanguage: string[];
  onOpenModal: (type: string, title: string, options: (string | { label: string; value: string })[]) => void;
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
  loveLanguage,
  onOpenModal,
  onSave,
  isSaving
}: LifestyleSectionProps) => {
  const { t } = useTranslation();
  return (
    <EditProfileSection title={t('profile_edit.lifestyle_interests')} onSave={onSave} isSaving={isSaving}>
      <Text style={styles.label}>{t('profile_edit.drinking_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('drinking', t('profile_edit.select_habit'), [
          { label: t('common.choices.freq_no'), value: 'Never' },
          { label: t('common.choices.freq_sometimes'), value: 'Socially' },
          { label: t('common.choices.freq_often'), value: 'Frequently' }
        ])}
      >
        <Text style={drinking ? styles.selectorText : styles.placeholderText}>
          {drinking === 'Never' ? t('common.choices.freq_no') : drinking === 'Socially' ? t('common.choices.freq_sometimes') : drinking === 'Frequently' ? t('common.choices.freq_often') : t('profile_edit.select_habit')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.smoking_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('smoking', t('profile_edit.select_habit'), [
          { label: t('common.choices.freq_no'), value: 'Never' },
          { label: t('common.choices.freq_sometimes'), value: 'Socially' },
          { label: t('common.choices.freq_often'), value: 'Frequently' }
        ])}
      >
        <Text style={smoking ? styles.selectorText : styles.placeholderText}>
          {smoking === 'Never' ? t('common.choices.freq_no') : smoking === 'Socially' ? t('common.choices.freq_sometimes') : smoking === 'Frequently' ? t('common.choices.freq_often') : t('profile_edit.select_habit')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.social_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('socialLevel', t('profile_edit.select_level'), [
          { label: t('common.choices.soc_introvert'), value: 'Introvert' },
          { label: t('common.choices.soc_extrovert'), value: 'Extrovert' },
          { label: t('common.choices.soc_ambivert'), value: 'Ambivert' }
        ])}
      >
        <Text style={socialLevel ? styles.selectorText : styles.placeholderText}>
          {socialLevel === 'Introvert' ? t('common.choices.soc_introvert') : socialLevel === 'Extrovert' ? t('common.choices.soc_extrovert') : socialLevel === 'Ambivert' ? t('common.choices.soc_ambivert') : t('profile_edit.select_level')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.personality_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('personalityType', t('profile_edit.select_type'), ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'])}
      >
        <Text style={personalityType ? styles.selectorText : styles.placeholderText}>{personalityType || t('profile_edit.select_type')}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.love_language_label', 'Ngôn ngữ tình yêu')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('loveLanguage', t('profile_edit.select_love_language', 'Chọn ngôn ngữ tình yêu'), [
          { label: 'Words of Affirmation', value: 'Words of Affirmation' },
          { label: 'Acts of Service', value: 'Acts of Service' },
          { label: 'Receiving Gifts', value: 'Receiving Gifts' },
          { label: 'Quality Time', value: 'Quality Time' },
          { label: 'Physical Touch', value: 'Physical Touch' }
        ])}
      >
        <Text style={loveLanguage?.length > 0 ? styles.selectorText : styles.placeholderText}>
          {loveLanguage?.length > 0 ? loveLanguage.join(', ') : t('profile_edit.select_love_language', 'Chọn ngôn ngữ tình yêu')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.hobbies_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('hobbies', t('profile_edit.select_hobbies'), [
          { label: t('common.choices.hobby_reading'), value: 'Reading' },
          { label: t('common.choices.hobby_gaming'), value: 'Gaming' },
          { label: t('common.choices.hobby_cooking'), value: 'Cooking' },
          { label: t('common.choices.hobby_hiking'), value: 'Hiking' },
          { label: t('common.choices.hobby_photo'), value: 'Photography' },
          { label: t('common.choices.hobby_music'), value: 'Music' },
          { label: t('common.choices.hobby_travel'), value: 'Traveling' },
          { label: t('common.choices.hobby_sports'), value: 'Sports' },
          { label: t('common.choices.hobby_coffee'), value: 'Coffee' },
          { label: t('common.choices.hobby_art'), value: 'Art' },
          { label: t('common.choices.hobby_movies'), value: 'Movies' },
          { label: t('common.choices.hobby_dancing'), value: 'Dancing' },
          { label: t('common.choices.hobby_fitness'), value: 'Fitness' },
          { label: t('common.choices.hobby_yoga'), value: 'Yoga' },
          { label: t('common.choices.hobby_wine'), value: 'Wine' },
          { label: t('common.choices.hobby_foodie'), value: 'Foodie' },
          { label: t('common.choices.hobby_animals'), value: 'Animals' },
          { label: t('common.choices.hobby_netflix'), value: 'Netflix' },
          { label: t('common.choices.hobby_gardening'), value: 'Gardening' },
          { label: t('common.choices.hobby_swimming'), value: 'Swimming' },
          { label: t('common.choices.hobby_coding'), value: 'Coding' },
          { label: t('common.choices.hobby_tattoos'), value: 'Tattoos' },
          { label: t('common.choices.hobby_cars'), value: 'Cars' },
          { label: t('common.choices.hobby_outdoors'), value: 'Outdoors' },
          { label: t('common.choices.hobby_fishing'), value: 'Fishing' },
          { label: t('common.choices.hobby_writing'), value: 'Writing' },
          { label: t('common.choices.hobby_boardgames'), value: 'Board Games' },
          { label: t('common.choices.hobby_meditation'), value: 'Meditation' },
          { label: t('common.choices.hobby_vaping'), value: 'Vaping' },
          { label: t('common.choices.hobby_skincare'), value: 'Skincare' },
          { label: t('common.choices.hobby_crypto'), value: 'Crypto' },
          { label: t('common.choices.hobby_fashion'), value: 'Fashion' },
          { label: t('common.choices.hobby_baking'), value: 'Baking' },
          { label: t('common.choices.hobby_climbing'), value: 'Climbing' },
          { label: t('common.choices.hobby_skating'), value: 'Skating' },
          { label: t('common.choices.hobby_thrift'), value: 'Thrifting' },
          { label: t('common.choices.hobby_concerts'), value: 'Concerts' },
          { label: t('common.choices.hobby_museums'), value: 'Museums' },
          { label: t('common.choices.hobby_camping'), value: 'Camping' },
          { label: t('common.choices.hobby_surfing'), value: 'Surfing' },
          { label: t('common.choices.hobby_pottery'), value: 'Pottery' },
          { label: t('common.choices.hobby_karaoke'), value: 'Karaoke' }
        ])}
      >
        <Text style={hobbies.length > 0 ? styles.selectorText : styles.placeholderText}>
          {hobbies.length > 0 
            ? hobbies.map(h => {
                switch(h) {
                  case 'Reading': return t('common.choices.hobby_reading');
                  case 'Gaming': return t('common.choices.hobby_gaming');
                  case 'Cooking': return t('common.choices.hobby_cooking');
                  case 'Hiking': return t('common.choices.hobby_hiking');
                  case 'Photography': return t('common.choices.hobby_photo');
                  case 'Music': return t('common.choices.hobby_music');
                  case 'Traveling': return t('common.choices.hobby_travel');
                  case 'Sports': return t('common.choices.hobby_sports');
                  case 'Coffee': return t('common.choices.hobby_coffee');
                  case 'Art': return t('common.choices.hobby_art');
                  case 'Movies': return t('common.choices.hobby_movies');
                  case 'Dancing': return t('common.choices.hobby_dancing');
                  case 'Fitness': return t('common.choices.hobby_fitness');
                  case 'Yoga': return t('common.choices.hobby_yoga');
                  case 'Wine': return t('common.choices.hobby_wine');
                  case 'Foodie': return t('common.choices.hobby_foodie');
                  case 'Animals': return t('common.choices.hobby_animals');
                  case 'Netflix': return t('common.choices.hobby_netflix');
                  case 'Gardening': return t('common.choices.hobby_gardening');
                  case 'Swimming': return t('common.choices.hobby_swimming');
                  case 'Coding': return t('common.choices.hobby_coding');
                  case 'Tattoos': return t('common.choices.hobby_tattoos');
                  case 'Cars': return t('common.choices.hobby_cars');
                  case 'Outdoors': return t('common.choices.hobby_outdoors');
                  case 'Fishing': return t('common.choices.hobby_fishing');
                  case 'Writing': return t('common.choices.hobby_writing');
                  case 'Board Games': return t('common.choices.hobby_boardgames');
                  case 'Meditation': return t('common.choices.hobby_meditation');
                  case 'Vaping': return t('common.choices.hobby_vaping');
                  case 'Skincare': return t('common.choices.hobby_skincare');
                  case 'Crypto': return t('common.choices.hobby_crypto');
                   case 'Fashion': return t('common.choices.hobby_fashion');
                  case 'Baking': return t('common.choices.hobby_baking');
                  case 'Climbing': return t('common.choices.hobby_climbing');
                  case 'Skating': return t('common.choices.hobby_skating');
                  case 'Thrifting': return t('common.choices.hobby_thrift');
                  case 'Concerts': return t('common.choices.hobby_concerts');
                  case 'Museums': return t('common.choices.hobby_museums');
                  case 'Camping': return t('common.choices.hobby_camping');
                  case 'Surfing': return t('common.choices.hobby_surfing');
                  case 'Pottery': return t('common.choices.hobby_pottery');
                  case 'Karaoke': return t('common.choices.hobby_karaoke');
                  default: return h;
                }
              }).join(', ') 
            : t('profile_edit.select_hobbies')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text style={styles.label}>{t('profile_edit.interests_label')}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => onOpenModal('interests', t('profile_edit.select_interests'), [
          { label: t('common.choices.int_tech'), value: 'Technology' },
          { label: t('common.choices.int_art'), value: 'Art & Design' },
          { label: t('common.choices.int_science'), value: 'Science' },
          { label: t('common.choices.int_fashion'), value: 'Fashion' },
          { label: t('common.choices.int_movies'), value: 'Movies & TV' },
          { label: t('common.choices.int_anime'), value: 'Anime & Manga' },
          { label: t('common.choices.int_politics'), value: 'Politics' },
          { label: t('common.choices.int_business'), value: 'Business & Startups' },
          { label: t('common.choices.int_music'), value: 'Music' },
          { label: t('common.choices.int_sports'), value: 'Sports' },
          { label: t('common.choices.int_cooking'), value: 'Cooking' },
          { label: t('common.choices.int_travel'), value: 'Travel' },
          { label: t('common.choices.int_gaming'), value: 'Gaming' },
          { label: t('common.choices.int_fitness'), value: 'Fitness & Health' },
          { label: t('common.choices.int_finance'), value: 'Finance' },
          { label: t('common.choices.int_history'), value: 'History' },
          { label: t('common.choices.int_psychology'), value: 'Psychology' },
          { label: t('common.choices.int_nature'), value: 'Nature' },
          { label: t('common.choices.int_astrology'), value: 'Astrology' },
          { label: t('common.choices.int_charity'), value: 'Charity & Volunteering' },
          { label: t('common.choices.int_literature'), value: 'Literature' },
          { label: t('common.choices.int_philosophy'), value: 'Philosophy' },
          { label: t('common.choices.int_environment'), value: 'Environment' },
          { label: t('common.choices.int_space'), value: 'Space & Astronomy' },
          { label: t('common.choices.int_wellness'), value: 'Wellness' },
          { label: t('common.choices.int_architecture'), value: 'Architecture' },
          { label: t('common.choices.int_podcasts'), value: 'Podcasts' },
          { label: t('common.choices.int_diy'), value: 'DIY & Crafting' },
          { label: t('common.choices.int_marketing'), value: 'Marketing' },
          { label: t('common.choices.int_journalism'), value: 'Journalism' }
        ])}
      >
        <Text style={interests.length > 0 ? styles.selectorText : styles.placeholderText}>
          {interests.length > 0 
            ? interests.map(i => {
                switch(i) {
                  case 'Technology': return t('common.choices.int_tech');
                  case 'Art & Design': return t('common.choices.int_art');
                  case 'Science': return t('common.choices.int_science');
                  case 'Fashion': return t('common.choices.int_fashion');
                  case 'Movies & TV': return t('common.choices.int_movies');
                  case 'Anime & Manga': return t('common.choices.int_anime');
                  case 'Politics': return t('common.choices.int_politics');
                  case 'Business & Startups': return t('common.choices.int_business');
                  case 'Music': return t('common.choices.int_music');
                  case 'Sports': return t('common.choices.int_sports');
                  case 'Cooking': return t('common.choices.int_cooking');
                  case 'Travel': return t('common.choices.int_travel');
                  case 'Gaming': return t('common.choices.int_gaming');
                  case 'Fitness & Health': return t('common.choices.int_fitness');
                  case 'Finance': return t('common.choices.int_finance');
                  case 'History': return t('common.choices.int_history');
                  case 'Psychology': return t('common.choices.int_psychology');
                  case 'Nature': return t('common.choices.int_nature');
                  case 'Astrology': return t('common.choices.int_astrology');
                  case 'Charity & Volunteering': return t('common.choices.int_charity');
                  case 'Literature': return t('common.choices.int_literature');
                  case 'Philosophy': return t('common.choices.int_philosophy');
                  case 'Environment': return t('common.choices.int_environment');
                  case 'Space & Astronomy': return t('common.choices.int_space');
                  case 'Wellness': return t('common.choices.int_wellness');
                  case 'Architecture': return t('common.choices.int_architecture');
                  case 'Podcasts': return t('common.choices.int_podcasts');
                  case 'DIY & Crafting': return t('common.choices.int_diy');
                  case 'Marketing': return t('common.choices.int_marketing');
                  case 'Journalism': return t('common.choices.int_journalism');
                  default: return i;
                }
              }).join(', ') 
            : t('profile_edit.select_interests')}
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
