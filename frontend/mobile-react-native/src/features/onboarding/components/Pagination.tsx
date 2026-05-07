import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { OnboardingSlide } from '../data/onboardingData';
import { ONBOARDING_SPACED_ITEM_WIDTH } from '../utils/constants';
import { radius, scale, spacing } from '../../../shared/utils/responsive';

interface PaginationProps {
  data: OnboardingSlide[];
  scrollX: Animated.Value;
  currentIndex?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ data, scrollX, currentIndex }) => {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        if (typeof currentIndex === 'number') {
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        }

        const inputRange = [
          (index - 1) * ONBOARDING_SPACED_ITEM_WIDTH,
          index * ONBOARDING_SPACED_ITEM_WIDTH,
          (index + 1) * ONBOARDING_SPACED_ITEM_WIDTH,
        ];
        
        const dotColor = scrollX.interpolate({
          inputRange,
          outputRange: ['#e0e0e0', '#E84C60', '#e0e0e0'],
          extrapolate: 'clamp',
        });

        const dotScale = scrollX.interpolate({
          inputRange,
          outputRange: [1, 1.2, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: dotColor, transform: [{ scale: dotScale }] },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing(24),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: radius(4),
    marginHorizontal: spacing(4),
  },
  dotActive: {
    backgroundColor: '#E84C60',
    transform: [{ scale: 1.2 }],
  },
  dotInactive: {
    backgroundColor: '#e0e0e0',
    transform: [{ scale: 1 }],
  },
});
