import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { UserProfileDto } from '../../../services/api/swipeService';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface MatchOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSayHello: () => void;
  matchProfile: UserProfileDto;
  myProfile?: UserProfileDto; // Usually we'd get this from auth state
}

export const MatchOverlay = ({ visible, onClose, onSayHello, matchProfile, myProfile }: MatchOverlayProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.background}
        />
        
        <View style={styles.content}>
          {/* Overlapping Cards */}
          <View style={styles.cardsContainer}>
             <View style={[styles.cardWrapper, styles.cardLeft]}>
                <Image 
                  source={{ uri: myProfile?.photos[0]?.url || 'https://via.placeholder.com/400x600' }} 
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.heartIconSmall}>
                   <Text style={{fontSize: normalizeFont(12)}}>❤</Text>
                </View>
             </View>
             <View style={[styles.cardWrapper, styles.cardRight]}>
                <Image 
                  source={{ uri: matchProfile.photos[0]?.url }} 
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.heartIconSmall}>
                   <Text style={{fontSize: normalizeFont(12)}}>❤</Text>
                </View>
             </View>
          </View>

          <Text style={styles.matchTitle}>It's a match, {matchProfile.displayName}!</Text>
          <Text style={styles.matchSubtitle}>Start a conversation now with each other</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onSayHello}>
            <Text style={styles.primaryButtonText}>Say hello</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Keep swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    width: '90%',
    alignItems: 'center',
  },
  cardsContainer: {
    height: height * 0.4,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(40),
  },
  cardWrapper: {
    width: width * 0.45,
    height: height * 0.3,
    borderRadius: radius(20),
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  cardLeft: {
    transform: [{ rotate: '-10deg' }, { translateX: -spacing(40) }],
    zIndex: 1,
  },
  cardRight: {
    transform: [{ rotate: '10deg' }, { translateX: spacing(40) }],
    zIndex: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartIconSmall: {
    position: 'absolute',
    top: -spacing(10),
    right: -spacing(10),
    width: spacing(30),
    height: spacing(30),
    borderRadius: radius(15),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  matchTitle: {
    fontSize: normalizeFont(32),
    fontWeight: 'bold',
    color: '#ff4d6d',
    textAlign: 'center',
    marginBottom: spacing(10),
  },
  matchSubtitle: {
    fontSize: normalizeFont(16),
    color: '#ccc',
    textAlign: 'center',
    marginBottom: spacing(50),
    paddingHorizontal: spacing(40),
  },
  primaryButton: {
    backgroundColor: '#ff4d6d',
    width: '100%',
    height: spacing(60),
    borderRadius: radius(15),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(15),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: normalizeFont(18),
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    width: '100%',
    height: spacing(60),
    borderRadius: radius(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ff4d6d',
    fontSize: normalizeFont(18),
    fontWeight: '600',
  },
});
