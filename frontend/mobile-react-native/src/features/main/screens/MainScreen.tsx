import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- SVGs ---
const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgFilter = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 6H20M4 12H12M16 12H20M4 18H20" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="14" cy="12" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
    <Circle cx="8" cy="6" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
    <Circle cx="16" cy="18" r="2" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
  </Svg>
);

const SvgDoubleUp = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M7 11L12 6L17 11M7 17L12 12L17 17" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgDoubleDown = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M7 7L12 12L17 7M7 13L12 18L17 13" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgHeart = () => (
  <Svg width="36" height="36" viewBox="0 0 24 24" fill="#9333EA">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const SvgCross = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgHeartSolid = () => (
  <Svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const SvgStar = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="#9333EA">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const SvgLocation = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" stroke="#FFFFFF" strokeWidth="2" />
  </Svg>
);

const SvgGradientOverlay = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
        <Stop offset="40%" stopColor="#000000" stopOpacity="0.4" />
        <Stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#grad)" />
  </Svg>
);

export const MainScreen = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const insets = useSafeAreaInsets();

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.iconButton}>
            <SvgFilter />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.introText}>
            Get ready to find your perfect match with these simple gestures.
          </Text>

          <View style={styles.gestureSection}>
            <SvgDoubleUp />
            <Text style={styles.swipeUpTitle}>Swipe Up to Reject</Text>
            <Text style={styles.noteText}>NOTE: AFTER REJECTING, YOU CANNOT UNDO THIS ACTION.</Text>
          </View>

          <View style={styles.blobContainer}>
            <View style={styles.blobPink} />
            <View style={styles.blobPurple} />
          </View>

          <View style={styles.gestureSection}>
            <Text style={styles.swipeDownTitle}>Swipe Down to Match</Text>
            <Text style={styles.noteText}>INSTANT CONNECTION BEGINS HERE.</Text>
            <View style={styles.heartContainer}>
              <SvgHeart />
              <View style={styles.chevronDownWrap}>
                <SvgDoubleDown />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowOnboarding(false)}>
            <Text style={styles.primaryButtonText}>Got it! Start Swiping</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>STEP 1 OF 1 • COMPLETE</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- CARDS VIEW ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Chicago, Il</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <SvgFilter />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {/* Background Card */}
        <View style={styles.cardBackground} />

        {/* Main Card */}
        <View style={styles.card}>
          <Image source={require('../../../../assets/images/anh2.jpg')} style={styles.cardImage} />

          <View style={styles.distanceTag}>
            <SvgLocation />
            <Text style={styles.distanceText}>1 km</Text>
          </View>

          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <View style={styles.cardOverlay}>
            <SvgGradientOverlay />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>Jessica Parker, 23</Text>
              <Text style={styles.cardBio}>Professional model</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[
        styles.actionButtons, 
        { paddingBottom: insets.bottom + 84 } // Adjust for bottom tab bar and safe area
      ]}>
        <TouchableOpacity style={styles.actionButtonSmall}>
          <SvgCross />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonLarge}>
          <SvgHeartSolid />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSmall}>
          <SvgStar />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    width: 48,
  },
  // --- ONBOARDING STYLES ---
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  introText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  gestureSection: {
    alignItems: 'center',
    zIndex: 10,
  },
  swipeUpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  swipeDownTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A855F7',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  blobContainer: {
    height: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  blobPink: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FBCFE8',
    opacity: 0.4,
    top: -20,
    left: width / 2 - 120,
  },
  blobPurple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E9D5FF',
    opacity: 0.4,
    bottom: -20,
    right: width / 2 - 100,
  },
  heartContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  chevronDownWrap: {
    marginTop: -8,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 84,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#F43F5E',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // --- CARDS STYLES ---
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBackground: {
    position: 'absolute',
    top: 4,
    width: '88%',
    height: '100%',
    backgroundColor: '#DBEAFE',
    borderRadius: 24,
    zIndex: -1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  distanceTag: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  paginationDots: {
    position: 'absolute',
    right: 16,
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'flex-end',
  },
  cardInfo: {
    padding: 24,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardBio: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 84,
    paddingTop: 24,
    gap: 24,
  },
  actionButtonSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  actionButtonLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
});
