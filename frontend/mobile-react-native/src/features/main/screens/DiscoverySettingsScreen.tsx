import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';

export const DiscoverySettingsScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(100);
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
      setMinAge(data.minAgePreference || 18);
      setMaxAge(data.maxAgePreference || 100);
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
        minAgePreference: minAge,
        maxAgePreference: maxAge,
        maxDistanceKm: maxDistance,
      });
      
      showToast({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Discovery preferences updated'
      });
      navigation.goBack();
    } catch (error) {
      Logger.error('Failed to update discovery settings', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save settings'
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
        <Text style={styles.headerTitle}>Discovery Settings</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#F43F5E" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.prefHeader}>
            <Text style={styles.label}>Age Range</Text>
            <Text style={styles.value}>{minAge} - {maxAge}</Text>
          </View>
          
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderLabel}>Minimum Age</Text>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={maxAge}
              step={1}
              value={minAge}
              onValueChange={setMinAge}
              minimumTrackTintColor="#F43F5E"
              maximumTrackTintColor="#F3F4F6"
              thumbTintColor="#F43F5E"
            />
            
            <Text style={styles.sliderLabel}>Maximum Age</Text>
            <Slider
              style={styles.slider}
              minimumValue={minAge}
              maximumValue={100}
              step={1}
              value={maxAge}
              onValueChange={setMaxAge}
              minimumTrackTintColor="#F43F5E"
              maximumTrackTintColor="#F3F4F6"
              thumbTintColor="#F43F5E"
            />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.prefHeader}>
            <Text style={styles.label}>Maximum Distance</Text>
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
            We'll show you people within this range. Sometimes we might show people slightly outside if we run out of options.
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
  sliderGroup: {
    gap: 10,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: -5,
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
