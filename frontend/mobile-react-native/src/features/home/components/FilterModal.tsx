import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';
import Svg, { Path } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const IconClose = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    distance?: number;
  }) => void;
  initialFilters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    distance?: number;
  };
}

export const FilterModal = ({ visible, onClose, onApply, initialFilters }: FilterModalProps) => {
  const [gender, setGender] = useState(initialFilters.gender || 'Everyone');
  const [distance, setDistance] = useState(initialFilters.distance || 50);
  const [maxAge, setMaxAge] = useState(initialFilters.maxAge || 35);

  const handleApply = () => {
    onApply({
      gender,
      distance,
      minAge: 18,
      maxAge,
    });
    onClose();
  };

  const handleReset = () => {
    setGender('Everyone');
    setDistance(50);
    setMaxAge(35);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <IconClose />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Show Me</Text>
            <View style={styles.optionsContainer}>
              {['Male', 'Female', 'Everyone'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, gender === option && styles.optionActive]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[styles.optionText, gender === option && styles.optionTextActive]}>
                    {option === 'Everyone' ? 'Everyone' : option === 'Male' ? 'Men' : 'Women'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Age Range</Text>
              <Text style={styles.valueText}>18 - {maxAge}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={80}
              step={1}
              value={maxAge}
              onValueChange={setMaxAge}
              minimumTrackTintColor="#F43F5E"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#F43F5E"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius(32),
    borderTopRightRadius: radius(32),
    paddingBottom: spacing(40),
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(24),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#111827',
  },
  resetText: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#F43F5E',
  },
  section: {
    padding: spacing(24),
  },
  sectionTitle: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing(16),
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing(12),
  },
  optionButton: {
    flex: 1,
    height: scale(44),
    borderRadius: radius(12),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  optionText: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#F43F5E',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(8),
  },
  valueText: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#F43F5E',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    paddingHorizontal: spacing(24),
    marginTop: spacing(8),
  },
  applyButton: {
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
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
});
