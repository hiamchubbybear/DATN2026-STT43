import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { normalizeFont, radius, spacing } from '../../../shared/utils/responsive';
import { UserProfileDto } from '../../../services/api/swipeService';
import { IconLocation } from '../../../shared/components/icons/IconLocation';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;

interface Props {
  profile: UserProfileDto;
  onPressInfo?: () => void;
}

export const SwipeCard: React.FC<Props> = ({ profile, onPressInfo }) => {
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : ['https://via.placeholder.com/400x600'];
  const currentPhoto = photos[photoIndex];

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
            source={{ uri: currentPhoto }}
            style={styles.image}
            contentFit="cover"
            transition={300}
        />
        
        {/* Location Badge - Top Left */}
        <View style={styles.locationBadgeContainer}>
          <View style={styles.locationBadge}>
            <IconLocation size={12} color="#fff" />
            <Text style={styles.locationBadgeText}>1 km</Text>
          </View>
        </View>
        
        {/* Photo switching overlay */}
        <View style={StyleSheet.absoluteFill}>
           <View style={{ flexDirection: 'row', flex: 1 }}>
              <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => setPhotoIndex(prev => Math.max(0, prev - 1))}
              />
              <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))}
              />
           </View>
        </View>

        {photos.length > 1 && (
            <View style={styles.indicators}>
                {photos.map((_, i) => (
                    <View 
                        key={i} 
                        style={[
                            styles.indicator, 
                            { backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)' }
                        ]} 
                    />
                ))}
            </View>
        )}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />
      
      <TouchableOpacity 
        style={styles.info} 
        activeOpacity={0.9}
        onPress={onPressInfo}
      >
        <Text style={styles.name}>
          {profile?.displayName || 'Unknown'}, {profile?.age || ''}
        </Text>
        {profile?.occupation ? <Text style={styles.occupation}>{profile.occupation}</Text> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius(35),
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationBadgeContainer: {
    position: 'absolute',
    top: spacing(20),
    left: spacing(20),
    zIndex: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(6),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationBadgeText: {
    color: '#fff',
    fontSize: normalizeFont(12),
    fontWeight: 'bold',
    marginLeft: spacing(4),
  },
  indicators: {
    position: 'absolute',
    top: '25%',
    right: spacing(12),
    bottom: '25%',
    width: 6,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: spacing(8),
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing(25),
  },
  name: {
    color: '#fff',
    fontSize: normalizeFont(28),
    fontWeight: 'bold',
  },
  occupation: {
    color: '#eee',
    fontSize: normalizeFont(16),
    marginTop: spacing(4),
  },
});
