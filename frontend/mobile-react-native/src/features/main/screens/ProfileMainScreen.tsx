import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const profile = {
  name: 'Jessica Parker',
  age: 23,
  title: 'Professional model',
  location: 'Chicago, IL United States',
  distance: '1 km',
  about:
    'My name is Jessica Parker and I enjoy meeting new people and finding ways to help them.',
  interests: ['Traveling', 'Books', 'Music', 'Dancing', 'Modeling'],
  gallery: [
    require('../../../../assets/images/anh1.jpg'),
    require('../../../../assets/images/anh2.jpg'),
    require('../../../../assets/images/anh3.jpg'),
    require('../../../../assets/images/anh1.jpg'),
    require('../../../../assets/images/anh2.jpg'),
  ],
};

const ProfileActionButton = ({ icon, primary = false }: { icon: keyof typeof Ionicons.glyphMap; primary?: boolean }) => (
  <TouchableOpacity style={[styles.actionBtn, primary && styles.actionBtnPrimary]} activeOpacity={0.88}>
    <Ionicons name={icon} size={22} color={primary ? '#FFFFFF' : icon === 'close' ? '#F97316' : '#9333EA'} />
  </TouchableOpacity>
);

export const ProfileMainScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={require('../../../../assets/images/anh2.jpg')} style={styles.heroImage} resizeMode="cover" />

          <TouchableOpacity style={styles.backBtn} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.actionRowFloat}>
            <ProfileActionButton icon="close" />
            <ProfileActionButton icon="heart" primary />
            <ProfileActionButton icon="star" />
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.identityRow}>
            <View>
              <Text style={styles.nameText}>
                {profile.name}, {profile.age}
              </Text>
              <Text style={styles.titleText}>{profile.title}</Text>
            </View>
            <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85}>
              <Ionicons name="paper-plane-outline" size={16} color="#EE3F57" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.distanceChip}>
              <Ionicons name="location-outline" size={12} color="#EE3F57" />
              <Text style={styles.distanceText}>{profile.distance}</Text>
            </View>
          </View>
          <Text style={styles.locationText}>{profile.location}</Text>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>About</Text>
          <Text style={styles.aboutText}>{profile.about}</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>

          <View style={styles.interestHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity style={styles.showMoreBtn} activeOpacity={0.85}>
              <Text style={styles.showMoreText}>Show more</Text>
              <Ionicons name="chevron-down" size={12} color="#71717A" />
            </TouchableOpacity>
          </View>

          <View style={styles.interestWrap}>
            {profile.interests.map((item, index) => (
              <View key={item} style={[styles.interestChip, index < 2 && styles.interestChipActive]}>
                <Text style={[styles.interestText, index < 2 && styles.interestTextActive]}>
                  {index < 2 ? `✓ ${item}` : item}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.galleryHead}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <TouchableOpacity activeOpacity={0.85}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.galleryGrid}>
            {profile.gallery.map((photo, index) => (
              <Image key={`${index}`} source={photo} style={styles.galleryItem} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 92,
  },
  heroWrap: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowFloat: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    zIndex: 2,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  actionBtnPrimary: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EE3F57',
  },
  contentCard: {
    marginTop: 0,
    marginHorizontal: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#18181B',
  },
  titleText: {
    marginTop: 4,
    fontSize: 13,
    color: '#A1A1AA',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FECBD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  sectionSpacing: {
    marginTop: 16,
  },
  distanceChip: {
    borderRadius: 10,
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FECBD3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    color: '#EE3F57',
    fontWeight: '700',
  },
  locationText: {
    marginTop: 6,
    fontSize: 13,
    color: '#71717A',
  },
  aboutText: {
    marginTop: 8,
    fontSize: 13,
    color: '#52525B',
    lineHeight: 19,
  },
  readMore: {
    marginTop: 4,
    fontSize: 13,
    color: '#EE3F57',
    fontWeight: '700',
  },
  interestHeader: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showMoreText: {
    fontSize: 12,
    color: '#71717A',
  },
  interestWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  interestChipActive: {
    borderColor: '#F8B4C2',
    backgroundColor: '#FFF2F5',
  },
  interestText: {
    fontSize: 12,
    color: '#3F3F46',
  },
  interestTextActive: {
    color: '#EE3F57',
    fontWeight: '600',
  },
  galleryHead: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 13,
    color: '#EE3F57',
    fontWeight: '700',
  },
  galleryGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  galleryItem: {
    width: '32%',
    aspectRatio: 0.82,
    borderRadius: 10,
  },
});
