import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DiscoverySettingsScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { t } = useTranslation();
  
  const [ageRange, setAgeRange] = useState([18, 100]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setAgeRange([data.minAgePreference || 18, data.maxAgePreference || 100]);
      setMaxDistance(data.maxDistanceKm || 50);
    } catch (error) {
      Logger.error('Failed to fetch discovery settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentProfile = await profileService.getMyProfile();
      
      await profileService.updateProfile({
        ...currentProfile,
        minAgePreference: ageRange[0],
        maxAgePreference: ageRange[1],
        maxDistanceKm: maxDistance,
      });
      
      showToast({
        type: 'success',
        title: t('common.success'),
        message: t('discover_settings.success_save')
      });
      navigation.goBack();
    } catch (error) {
      Logger.error('Failed to update discovery settings', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('discover_settings.error_save')
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F43F5E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('discover_settings.title')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#F43F5E" />
          ) : (
            <Text style={styles.saveText}>{t('discover_settings.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.prefHeader}>
            <Text style={styles.label}>{t('discover_settings.age_range')}</Text>
            <Text style={styles.value}>{ageRange[0]} - {ageRange[1]}</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <MultiSlider
              values={ageRange}
              sliderLength={SCREEN_WIDTH - 80}
              onValuesChange={setAgeRange}
              min={18}
              max={100}
              step={1}
              allowOverlap={false}
              snapped
              selectedStyle={{ backgroundColor: '#F43F5E' }}
              unselectedStyle={{ backgroundColor: '#F3F4F6' }}
              markerStyle={styles.marker}
              pressedMarkerStyle={styles.markerPressed}
            />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.prefHeader}>
            <Text style={styles.label}>{t('discover_settings.max_distance')}</Text>
            <Text style={styles.value}>{maxDistance} km</Text>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={200}
            step={1}
            value={maxDistance}
            onValueChange={setMaxDistance}
            minimumTrackTintColor="#F43F5E"
            maximumTrackTintColor="#F3F4F6"
            thumbTintColor="#F43F5E"
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            {t('discover_settings.info_text')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F43F5E',
    width: 50,
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  prefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F43F5E',
  },
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
  },
  marker: {
    backgroundColor: '#FFFFFF',
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F43F5E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerPressed: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#F43F5E',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  infoBox: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 10,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  }
});
