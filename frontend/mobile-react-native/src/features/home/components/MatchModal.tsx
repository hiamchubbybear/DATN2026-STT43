import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

interface MatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSayHello: () => void;
  currentUser: {
    name: string;
    avatar: string;
  };
  matchedUser: {
    name: string;
    avatar: string;
  };
}

export const MatchModal: React.FC<MatchModalProps> = ({
  isVisible,
  onClose,
  onSayHello,
  currentUser,
  matchedUser,
}) => {
  const { t } = useTranslation();
  
  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const card1TranslateX = useRef(new Animated.Value(-width)).current;
  const card2TranslateX = useRef(new Animated.Value(width)).current;
  const contentScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.spring(card1TranslateX, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(card2TranslateX, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.spring(contentScale, {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      // Reset animations
      overlayOpacity.setValue(0);
      card1TranslateX.setValue(-width);
      card2TranslateX.setValue(width);
      contentScale.setValue(0.8);
      contentOpacity.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.blurOverlay, { opacity: overlayOpacity }]} />

        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.photoContainer}>
            <Animated.View 
              style={[
                styles.photoWrapper, 
                styles.photoLeft,
                { transform: [{ translateX: card1TranslateX }, { rotate: '-12deg' }] }
              ]}
            >
              <Image source={{ uri: currentUser.avatar }} style={styles.photo} />
              <View style={[styles.heartBadge, styles.heartLeft]}>
                <Ionicons name="heart" size={scale(24)} color="#EE3F57" />
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.photoWrapper, 
                styles.photoRight,
                { transform: [{ translateX: card2TranslateX }, { rotate: '12deg' }] }
              ]}
            >
              <Image source={{ uri: matchedUser.avatar }} style={styles.photo} />
              <View style={[styles.heartBadge, styles.heartRight]}>
                <Ionicons name="heart" size={scale(24)} color="#EE3F57" />
              </View>
            </Animated.View>
          </View>

          {/* Text Section */}
          <Animated.View 
            style={[
              styles.textContainer,
              { opacity: contentOpacity, transform: [{ scale: contentScale }] }
            ]}
          >
            <Text style={styles.title}>
              {t('match.title', { name: matchedUser.name })}
            </Text>
            <Text style={styles.subtitle}>
              {t('match.subtitle')}
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              { opacity: contentOpacity, transform: [{ translateY: Animated.multiply(contentOpacity, -20) }] }
            ]}
          >
            <TouchableOpacity 
              style={styles.primaryBtn} 
              activeOpacity={0.8}
              onPress={onSayHello}
            >
              <Text style={styles.primaryBtnText}>{t('match.say_hello', 'Say hello')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn} 
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={styles.secondaryBtnText}>{t('match.keep_swiping', 'Keep swiping')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing(32),
  },
  photoContainer: {
    height: verticalScale(350),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(40),
  },
  photoWrapper: {
    width: width * 0.45,
    height: verticalScale(240),
    borderRadius: radius(20),
    borderWidth: 6,
    borderColor: '#FFFFFF',
    overflow: 'visible',
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  photoLeft: {
    zIndex: 2,
    left: width * 0.1,
    top: verticalScale(40),
  },
  photoRight: {
    zIndex: 1,
    right: width * 0.1,
    top: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: radius(14),
  },
  heartBadge: {
    position: 'absolute',
    width: scale(48),
    height: scale(48),
    borderRadius: radius(24),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heartLeft: {
    bottom: -scale(24),
    left: -scale(12),
  },
  heartRight: {
    top: -scale(24),
    left: -scale(12),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing(60),
  },
  title: {
    fontSize: normalizeFont(34),
    fontWeight: '900',
    color: '#EE3F57',
    textAlign: 'center',
    marginBottom: spacing(12),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalizeFont(16),
    color: '#F4F4F5',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing(16),
  },
  primaryBtn: {
    backgroundColor: '#EE3F57',
    paddingVertical: verticalScale(18),
    borderRadius: radius(18),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#EE3F57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(17),
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: verticalScale(18),
    borderRadius: radius(18),
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(17),
    fontWeight: '600',
  },
});
