import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { UserProfileDto } from '../../../services/api/swipeService';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { IconLocation } from '../../../shared/components/icons/IconLocation';
import { IconSend } from '../../../shared/components/icons/IconSend';
import { IconCheck } from '../../../shared/components/icons/IconCheck';
import { IconHeart } from '../../../shared/components/icons/IconHeart';
import { IconClose } from '../../../shared/components/icons/IconClose';
import { IconStar } from '../../../shared/components/icons/IconStar';
import { IconBack } from '../../../shared/components/icons/IconBack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { chatService } from '../../../services/api/chatService';

const { width, height } = Dimensions.get('window');

interface ProfileDetailProps {
  profile: UserProfileDto;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileDetail = ({ profile, onClose, onLike, onDislike }: ProfileDetailProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [isMessaging, setIsMessaging] = React.useState(false);

  const handleMessage = async () => {
    if (isMessaging) return;
    
    try {
      setIsMessaging(true);
      const conversationId = await chatService.getOrCreateConversation(profile.userId);
      
      onClose(); // Close the modal
      navigation.navigate('ChatRoom', {
        conversationId,
        receiverId: profile.userId,
        receiverName: profile?.displayName || 'User',
        receiverAvatar: profile?.photos[0]
      });
    } catch (error) {
      console.error('[ProfileDetail] Failed to start conversation:', error);
    } finally {
      setIsMessaging(false);
    }
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Main Photo */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profile.photos[0] }} 
            style={styles.mainImage}
            contentFit="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <View style={styles.backButtonInner}>
              <IconBack size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,1)']}
            style={styles.gradient}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.nameText}>
                {profile?.displayName}, {profile?.age}
              </Text>
              <Text style={styles.occupationText}>{profile?.occupation}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.sendButton, isMessaging && { opacity: 0.5 }]} 
              onPress={handleMessage}
              disabled={isMessaging}
            >
              <View style={styles.sendButtonInner}>
                {isMessaging ? (
                  <ActivityIndicator size="small" color="#ff4d6d" />
                ) : (
                  <IconSend size={24} color="#ff4d6d" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
            <View style={styles.locationBadge}>
               <IconLocation size={14} color="#ff4d6d" />
               <Text style={styles.locationBadgeText}>1 km</Text>
            </View>
            <Text style={styles.locationText}>{profile.locationName || 'Tân Bình, TP. Hồ Chí Minh'}</Text>
          </View>

          {/* Interests/Tags */}
          <View style={styles.tagsContainer}>
            {profile.interests?.map((interest, index) => (
              <View key={index} style={[styles.tag, index < 2 && styles.activeTag]}>
                <View style={styles.tagInner}>
                  {index < 2 && <IconCheck size={14} color="#ff4d6d" />}
                  <Text style={[styles.tagText, index < 2 && styles.activeTagText]}>
                    {interest}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio || 'Living my best life and exploring the world.'}</Text>
          </View>

          {/* Gallery */}
          <View style={styles.gallerySection}>
            <View style={styles.galleryHeader}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.galleryGrid}>
              <View style={styles.galleryMain}>
                {profile.photos[1] && <Image source={{ uri: profile.photos[1] }} style={styles.galleryImage} contentFit="cover" />}
              </View>
              <View style={styles.gallerySide}>
                 {profile.photos.slice(2, 4).map((url, i) => (
                   <Image key={i} source={{ uri: url }} style={styles.galleryImageSmall} contentFit="cover" />
                 ))}
              </View>
            </View>
            <View style={styles.galleryBottom}>
               {profile.photos.slice(4, 7).map((url, i) => (
                   <Image key={i} source={{ uri: url }} style={styles.galleryImageSquare} contentFit="cover" />
               ))}
            </View>
          </View>

          <View style={{ height: spacing(100) }} />
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingActions}>
         <TouchableOpacity style={[styles.fab, styles.fabDislike]} onPress={onDislike}>
            <IconClose size={30} color="#ff4d6d" />
         </TouchableOpacity>
         <TouchableOpacity style={[styles.fab, styles.fabLike]} onPress={onLike}>
            <IconHeart size={40} color="#fff" />
         </TouchableOpacity>
         <TouchableOpacity style={[styles.fab, styles.fabStar]}>
            <IconStar size={30} color="#9b5de5" />
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: height * 0.55,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing(50),
    left: spacing(20),
    zIndex: 10,
  },
  backButtonInner: {
    width: spacing(44),
    height: spacing(44),
    borderRadius: radius(22),
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: normalizeFont(24),
    fontWeight: 'bold',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: spacing(100),
  },
  infoContent: {
    paddingHorizontal: spacing(25),
    marginTop: -spacing(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(15),
  },
  nameText: {
    fontSize: normalizeFont(28),
    fontWeight: 'bold',
    color: '#111',
  },
  occupationText: {
    fontSize: normalizeFont(16),
    color: '#666',
    marginTop: spacing(4),
  },
  sendButton: {
    width: spacing(54),
    height: spacing(54),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: normalizeFont(20),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(20),
  },
  locationBadge: {
    backgroundColor: '#ffe8ec',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(6),
    borderRadius: radius(15),
    marginRight: spacing(10),
  },
  locationBadgeText: {
    color: '#ff4d6d',
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  locationText: {
    color: '#888',
    fontSize: normalizeFont(14),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(10),
    marginBottom: spacing(25),
  },
  tag: {
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
    borderRadius: radius(10),
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: spacing(100),
    alignItems: 'center',
  },
  activeTag: {
    borderColor: '#ff4d6d',
    backgroundColor: '#fff',
  },
  tagInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(6),
  },
  tagText: {
    fontSize: normalizeFont(14),
    color: '#444',
  },
  activeTagText: {
    color: '#ff4d6d',
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing(25),
  },
  sectionTitle: {
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: spacing(10),
  },
  bioText: {
    fontSize: normalizeFont(16),
    color: '#555',
    lineHeight: normalizeFont(24),
  },
  gallerySection: {
    marginBottom: spacing(20),
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(15),
  },
  seeAllText: {
    color: '#ff4d6d',
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  galleryGrid: {
    flexDirection: 'row',
    height: height * 0.3,
    gap: spacing(10),
    marginBottom: spacing(10),
  },
  galleryMain: {
    flex: 2,
    borderRadius: radius(15),
    overflow: 'hidden',
  },
  gallerySide: {
    flex: 1,
    gap: spacing(10),
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius(15),
  },
  galleryImageSmall: {
    flex: 1,
    width: '100%',
    borderRadius: radius(15),
  },
  galleryBottom: {
    flexDirection: 'row',
    height: height * 0.15,
    gap: spacing(10),
  },
  galleryImageSquare: {
    flex: 1,
    borderRadius: radius(15),
  },
  floatingActions: {
    position: 'absolute',
    bottom: spacing(40),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(20),
  },
  fab: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  fabDislike: {
    width: spacing(64),
    height: spacing(64),
    borderRadius: radius(32),
  },
  fabLike: {
    width: spacing(86),
    height: spacing(86),
    borderRadius: radius(43),
    backgroundColor: '#ff4d6d',
  },
  fabStar: {
    width: spacing(64),
    height: spacing(64),
    borderRadius: radius(32),
  },
  fabText: {
    color: '#ff4d6d',
    fontSize: normalizeFont(24),
  },
  fabTextHeart: {
    color: '#fff',
    fontSize: normalizeFont(34),
  },
  fabTextStar: {
    color: '#9b5de5',
    fontSize: normalizeFont(24),
  },
});
