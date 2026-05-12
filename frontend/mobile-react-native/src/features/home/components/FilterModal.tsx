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
import Svg, { Path } from 'react-native-svg';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { spacing, radius, normalizeFont, scale } from '../../../shared/utils/responsive';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const IconClose = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Map display gender names to backend numeric values
// Male = 1, Female = 2, Everyone = 3
const GENDER_MAP: Record<string, number> = {
  'Male': 1,
  'Female': 2,
  'Everyone': 3,
};

const REVERSE_GENDER_MAP: Record<number, string> = {
  1: 'Male',
  2: 'Female',
  3: 'Everyone',
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    gender?: number;
    minAge?: number;
    maxAge?: number;
    distance?: number;
  }) => void;
  initialFilters: {
    gender?: any; // can be string or number
    minAge?: number;
    maxAge?: number;
    distance?: number;
  };
}

export const FilterModal = ({ visible, onClose, onApply, initialFilters }: FilterModalProps) => {
  // Convert initial gender to numeric if it's a string
  const initialGenderValue = typeof initialFilters.gender === 'string' 
    ? GENDER_MAP[initialFilters.gender] || 3 
    : initialFilters.gender || 3;

  const [gender, setGender] = useState(initialGenderValue);
  const [distance, setDistance] = useState(initialFilters.distance || 50);
  const [ageRange, setAgeRange] = useState([
    initialFilters.minAge || 18, 
    initialFilters.maxAge || 35
  ]);

  const handleApply = () => {
    onApply({
      gender,
      distance,
      minAge: ageRange[0],
      maxAge: ageRange[1],
    });
    onClose();
  };

  const handleReset = () => {
    setGender(3); // Everyone
    setDistance(50);
    setAgeRange([18, 35]);
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
              {[1, 2, 3].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.optionButton, gender === val && styles.optionActive]}
                  onPress={() => setGender(val)}
                >
                  <Text style={[styles.optionText, gender === val && styles.optionTextActive]}>
                    {val === 3 ? 'Everyone' : val === 1 ? 'Men' : 'Women'}
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
              <Text style={styles.valueText}>{ageRange[0]} - {ageRange[1]}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <MultiSlider
                values={ageRange}
                sliderLength={SCREEN_WIDTH - 64}
                onValuesChange={setAgeRange}
                min={18}
                max={80}
                step={1}
                allowOverlap={false}
                snapped
                selectedStyle={{ backgroundColor: '#F43F5E' }}
                unselectedStyle={{ backgroundColor: '#E5E7EB' }}
                markerStyle={styles.marker}
                pressedMarkerStyle={styles.markerPressed}
              />
            </View>
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
