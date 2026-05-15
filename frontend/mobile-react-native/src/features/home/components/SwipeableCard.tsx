import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolation,
  withTiming
} from 'react-native-reanimated';
import { UserProfileDto, SwipeType } from '../../../services/api/swipeService';
import { SwipeCard } from './SwipeCard';
import { spacing, radius, normalizeFont } from '../../../shared/utils/responsive';
import { IconHeart } from '../../../shared/components/icons/IconHeart';
import { IconClose } from '../../../shared/components/icons/IconClose';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_UP_THRESHOLD = -SCREEN_HEIGHT * 0.1; // Reduced from 0.15 to 0.1 for easier swipe
const SWIPE_DOWN_THRESHOLD = SCREEN_HEIGHT * 0.1;

export interface SwipeableCardRef {
  swipe: (type: SwipeType) => void;
}

interface SwipeableCardProps {
  profile: UserProfileDto;
  onSwipe: (type: SwipeType) => void;
  onPress?: () => void;
  isFirst?: boolean;
}

export const SwipeableCard = React.memo(forwardRef<SwipeableCardRef, SwipeableCardProps>(
  ({ profile, onSwipe, onPress, isFirst }, ref) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    const swipeOut = (type: SwipeType) => {
      'worklet';
      // Trigger the next card immediatey to remove delay
      runOnJS(onSwipe)(type);

      // Like is DOWN (+), Dislike is UP (-)
      const destY = type === SwipeType.Like ? SCREEN_HEIGHT : -SCREEN_HEIGHT;
      
      // Snappier transition out
      translateY.value = withSpring(destY, { 
        damping: 25, 
        stiffness: 250, 
        mass: 0.4,
        velocity: 50
      });
      opacity.value = withTiming(0, { duration: 100 });
    };

    useImperativeHandle(ref, () => ({
      swipe: (type: SwipeType) => {
        swipeOut(type);
      }
    }));

    const panGesture = Gesture.Pan()
      .minDistance(10) // Slightly increased to avoid accidental pans
      .activeOffsetY([-10, 10]) // Increased sensitivity area
      .onUpdate((event) => {
        translateY.value = event.translationY;
        // Reduce horizontal effect to keep it "straight"
        translateX.value = event.translationX * 0.1;
        rotate.value = event.translationX * 0.05;
      })
      .onEnd((event) => {
        // Enforce vertical priority
        if (event.translationY > SWIPE_DOWN_THRESHOLD) {
          swipeOut(SwipeType.Like);
        } else if (event.translationY < SWIPE_UP_THRESHOLD) {
          swipeOut(SwipeType.Dislike);
        } else {
          translateY.value = withSpring(0, { damping: 15 });
          translateX.value = withSpring(0, { damping: 15 });
          rotate.value = withSpring(0, { damping: 15 });
        }
      });

    const tapGesture = Gesture.Tap()
      .onEnd(() => {
        // Block tap if card is moving (swiping)
        if (Math.abs(translateY.value) < 10 && Math.abs(translateX.value) < 10) {
          if (onPress) runOnJS(onPress)();
        }
      });

    const longPressGesture = Gesture.LongPress()
      .minDuration(300)
      .onEnd((event, success) => {
        if (success && onPress) {
          runOnJS(onPress)();
        }
      });

    const gestures = Gesture.Simultaneous(panGesture, Gesture.Exclusive(longPressGesture, tapGesture));

    const rStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { translateY: translateY.value },
          { translateX: translateX.value },
          { rotate: `${rotate.value}deg` },
        ],
      };
    });

    const likeOpacity = useAnimatedStyle(() => {
      // Like is DOWN (positive Y)
      const op = interpolate(translateY.value, [30, 120], [0, 1], Extrapolation.CLAMP);
      return { opacity: op };
    });

    const nopeOpacity = useAnimatedStyle(() => {
      // Nope is UP (negative Y)
      const op = interpolate(translateY.value, [-120, -30], [1, 0], Extrapolation.CLAMP);
      return { opacity: op };
    });

    return (
      <View style={[styles.container, { zIndex: isFirst ? 100 : 1 }]} pointerEvents={isFirst ? 'auto' : 'none'}>
        <GestureDetector gesture={gestures}>
          <Animated.View style={[styles.card, rStyle]}>
            <SwipeCard profile={profile} onPressInfo={onPress} />
            
            <Animated.View style={[styles.overlay, likeOpacity]}>
               <View style={styles.iconCircle}>
                  <IconHeart size={50} color="#ff4d6d" />
               </View>
            </Animated.View>

            <Animated.View style={[styles.overlay, nopeOpacity]}>
               <View style={styles.iconCircle}>
                  <IconClose size={50} color="#ccc" />
               </View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
));

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 10,
  },
  iconCircle: {
    width: spacing(100),
    height: spacing(100),
    borderRadius: radius(50),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  iconText: {
    fontSize: normalizeFont(50),
    color: '#ff4d6d',
  },
  iconTextX: {
    fontSize: normalizeFont(50),
    color: '#ccc',
  },
});
