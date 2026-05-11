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

export const DiscoverySettingScreen = ({ navigation }: any) => {
  const { setProfileStatus } = useAuthStore();
  const [distance, setDistance] = useState(50);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [showMe, setShowMe] = useState('Everyone');

  const handleFinish = () => {
    // In a real app, we'd save these to the backend/store
    // For now, we'll just set profile as completed to enter the app
    setProfileStatus(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Discovery Settings</Text>
          <Text style={styles.subtitle}>
            Personalize who you want to see. You can change these later in settings.
          </Text>

          {/* Show Me Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Show Me</Text>
            <View style={styles.optionsContainer}>
              {['Men', 'Women', 'Everyone'].map((option) => (
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
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
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
              <Text style={styles.sectionTitle}>Age Range</Text>
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
              <Text style={styles.helperText}>Adjusting upper age limit</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            <Text style={styles.buttonText}>Enter App</Text>
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
