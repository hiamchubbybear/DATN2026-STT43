import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';
import { useAuthStore } from '../../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../../services/api/profileService';
import { ActivityIndicator } from 'react-native';

export const DiscoverySettingScreen = ({ navigation }: any) => {
  const { setProfileStatus } = useAuthStore();
  const { t } = useTranslation();
  const [distance, setDistance] = useState(50);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [showMe, setShowMe] = useState(t('discover.everyone'));
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    try {
      setSaving(true);
      // Map showMe label to GenderPreference value:
      // Male = 1, Female = 2, Everyone = 3
      let lookingForVal = 3;
      if (showMe === t('discover.men')) {
        lookingForVal = 1;
      } else if (showMe === t('discover.women')) {
        lookingForVal = 2;
      }

      await profileService.updatePreferences({
        minAgePreference: ageRange[0],
        maxAgePreference: ageRange[1],
        maxDistanceKm: distance,
        lookingFor: lookingForVal,
      });
    } catch (error) {
      console.error('Failed to save onboarding preferences:', error);
    } finally {
      setSaving(false);
      setProfileStatus(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('setup.discovery_title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>
            {t('setup.discovery_subtitle')}
          </Text>

          {/* Show Me Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('discover.show_me')}</Text>
            <View style={styles.optionsContainer}>
              {[t('discover.men'), t('discover.women'), t('discover.everyone')].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, showMe === option && styles.optionActive]}
                  onPress={() => setShowMe(option)}
                >
                  <Text style={[styles.optionText, showMe === option && styles.optionTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Section */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>{t('discover.distance_max')}</Text>
              <Text style={styles.valueText}>{distance} km</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#F43F5E"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#F43F5E"
            />
          </View>

          {/* Age Section */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>{t('discover.age_range')}</Text>
              <Text style={styles.valueText}>{ageRange[0]} - {ageRange[1]}</Text>
            </View>
            <View style={styles.ageSliderPlaceholder}>
               {/* Simple mock for age range as standard slider is single-thumb */}
               <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={ageRange[1]}
                onValueChange={(val) => setAgeRange([18, Math.round(val)])}
                minimumTrackTintColor="#F43F5E"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#F43F5E"
              />
              <Text style={styles.helperText}>{t('setup.adjust_age')}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, saving && { opacity: 0.8 }]} 
            onPress={handleFinish}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('setup.enter_app')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(32),
    paddingTop: spacing(40),
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '800',
    color: '#111827',
    marginBottom: spacing(12),
  },
  subtitle: {
    fontSize: normalizeFont(16),
    color: '#6B7280',
    lineHeight: scale(24),
    marginBottom: spacing(48),
  },
  section: {
    marginBottom: spacing(40),
  },
  sectionTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(8),
  },
  valueText: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: '#F43F5E',
  },
  optionsContainer: {
    gap: spacing(12),
  },
  optionButton: {
    width: '100%',
    height: scale(52),
    borderRadius: radius(16),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: spacing(20),
  },
  optionActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  optionText: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#F43F5E',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ageSliderPlaceholder: {
    marginTop: spacing(8),
  },
  helperText: {
    fontSize: normalizeFont(12),
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: spacing(4),
  },
  footer: {
    paddingHorizontal: spacing(32),
    paddingBottom: spacing(40),
    paddingTop: spacing(16),
  },
  button: {
    width: '100%',
    height: scale(56),
    backgroundColor: '#F43F5E',
    borderRadius: radius(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
});
