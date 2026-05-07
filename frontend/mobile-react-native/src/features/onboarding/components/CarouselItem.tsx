import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { OnboardingSlide } from '../data/onboardingData';
import { ONBOARDING_SPACED_ITEM_WIDTH, ONBOARDING_SPACING } from '../utils/constants';
import { radius } from '../../../shared/utils/responsive';

interface CarouselItemProps {
  item: OnboardingSlide;
  index: number;
  scrollX: Animated.Value;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ item, index, scrollX }) => {
  const inputRange = [
    (index - 1) * ONBOARDING_SPACED_ITEM_WIDTH,
    index * ONBOARDING_SPACED_ITEM_WIDTH,
    (index + 1) * ONBOARDING_SPACED_ITEM_WIDTH,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: ONBOARDING_SPACED_ITEM_WIDTH }}>
      <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
        <Image
          source={item.imageSource}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    marginHorizontal: ONBOARDING_SPACING / 2,
    borderRadius: radius(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
