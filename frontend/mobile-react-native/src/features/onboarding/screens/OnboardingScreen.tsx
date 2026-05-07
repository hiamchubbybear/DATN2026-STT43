import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { onboardingData } from '../data/onboardingData';
import { CarouselItem } from '../components/CarouselItem';
import { Pagination } from '../components/Pagination';
import { OnboardingFooter } from '../components/OnboardingFooter';
import { ONBOARDING_SPACED_ITEM_WIDTH, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/constants';
import { spacing, verticalScale } from '../../../shared/utils/responsive';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLoopEnabled = onboardingData.length > 1;
  const loopedData = useMemo(() => {
    if (!isLoopEnabled) {
      return onboardingData;
    }

    return [
      onboardingData[onboardingData.length - 1],
      ...onboardingData,
      onboardingData[0],
    ];
  }, [isLoopEnabled]);
  const initialVirtualIndex = isLoopEnabled ? 1 : 0;
  const virtualIndexRef = useRef(initialVirtualIndex);

  const getRealIndex = (virtualIndex: number) => {
    if (!isLoopEnabled) {
      return virtualIndex;
    }

    if (virtualIndex === 0) {
      return onboardingData.length - 1;
    }

    if (virtualIndex === loopedData.length - 1) {
      return 0;
    }

    return virtualIndex - 1;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextVirtualIndex = virtualIndexRef.current + 1;
      const nextOffset = nextVirtualIndex * ONBOARDING_SPACED_ITEM_WIDTH;

      flatListRef.current?.scrollToOffset({
        offset: nextOffset,
        animated: true,
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const onMomentumScrollEnd = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const virtualIndex = Math.round(x / ONBOARDING_SPACED_ITEM_WIDTH);
    virtualIndexRef.current = virtualIndex;

    const realIndex = getRealIndex(virtualIndex);
    if (realIndex !== currentIndex) {
      setCurrentIndex(realIndex);
    }

    if (!isLoopEnabled) {
      return;
    }

    if (virtualIndex === 0) {
      const resetIndex = onboardingData.length;
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: resetIndex * ONBOARDING_SPACED_ITEM_WIDTH,
          animated: false,
        });
      });
      virtualIndexRef.current = resetIndex;
      return;
    }

    if (virtualIndex === loopedData.length - 1) {
      const resetIndex = 1;
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: resetIndex * ONBOARDING_SPACED_ITEM_WIDTH,
          animated: false,
        });
      });
      virtualIndexRef.current = resetIndex;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
    }
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Carousel Section */}
        <View style={styles.carouselWrapper}>
          <Animated.FlatList
            ref={flatListRef}
            data={loopedData}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialVirtualIndex}
            getItemLayout={(_, index) => ({
              length: ONBOARDING_SPACED_ITEM_WIDTH,
              offset: ONBOARDING_SPACED_ITEM_WIDTH * index,
              index,
            })}
            snapToInterval={ONBOARDING_SPACED_ITEM_WIDTH}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - ONBOARDING_SPACED_ITEM_WIDTH) / 2,
            }}
            onScroll={handleScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => <CarouselItem item={item} index={index} scrollX={scrollX} />}
          />
        </View>

        {/* Pagination Dots */}
        <Pagination data={onboardingData} scrollX={scrollX} currentIndex={currentIndex} />

        {/* Text & Footer Area */}
        <OnboardingFooter 
          currentSlide={onboardingData[currentIndex]}
          onCreateAccount={() => {
            navigation.navigate('SignUp');
          }}
          onSignIn={() => {
            navigation.navigate('Login');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? spacing(24) : 0,
  },
  container: {
    flex: 1,
  },
  carouselWrapper: {
    height: SCREEN_HEIGHT * 0.45,
    marginTop: spacing(20),
  },
});
