import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const profile = {
  basic_info: {
    displayName: 'Minh Anh',
    dob: '1998-10-15',
    gender: 'Female',
    languages: ['Tiếng Việt', 'English', '한국어'],
  },
  background: {
    education: 'Đại học Kinh tế TP.HCM',
    occupation: 'Product Designer',
  },
  lifestyle: {
    drinking: 'Occasionally',
    smoking: 'Never',
    socialLevel: 'Extrovert',
    personalityType: 'ENFP',
    loveLanguage: ['Quality Time', 'Words of Affirmation'],
    hobbies: ['Photography', 'Pilates', 'Travel', 'Coffee Tasting'],
    interests: ['Design', 'Startup', 'Music Festival', 'Hiking'],
  },
  dating_style: {
    freeTimePrefer: ['Brunch cuối tuần', 'Road trip ngắn', 'Đi triển lãm'],
    dateStyle: ['Trò chuyện sâu', 'Vui vẻ tự nhiên', 'Tôn trọng không gian cá nhân'],
  },
  bio: 'Mình thích cuộc sống cân bằng giữa công việc sáng tạo và những chuyến đi ngắn cuối tuần. Luôn tìm kiếm năng lượng tích cực và sự chân thành.',
  photos: [
    require('../../../../assets/images/anh1.jpg'),
    require('../../../../assets/images/anh2.jpg'),
    require('../../../../assets/images/anh3.jpg'),
  ],
};

const getAge = (dob: string) => {
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

export const ProfileMainScreen = () => {
  const navigation = useNavigation<any>();
  const habitItems = [
    { key: 'Drinking', value: profile.lifestyle.drinking, icon: 'wine-outline' },
    { key: 'Smoking', value: profile.lifestyle.smoking, icon: 'flame-outline' },
    { key: 'Social', value: profile.lifestyle.socialLevel, icon: 'people-outline' },
    { key: 'Personality', value: profile.lifestyle.personalityType, icon: 'sparkles-outline' },
  ];

  const aboutChips = [
    ...profile.basic_info.languages,
    ...profile.lifestyle.loveLanguage,
    ...profile.lifestyle.hobbies,
    ...profile.lifestyle.interests,
    ...profile.dating_style.freeTimePrefer,
    ...profile.dating_style.dateStyle,
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          <Image source={profile.photos[0]} style={styles.heroImage} resizeMode="cover" />

          <TouchableOpacity style={styles.settingsButton} activeOpacity={0.85} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroOverlay}>
            <View style={styles.avatarWrapper}>
              <Image source={profile.photos[1]} style={styles.avatar} />
            </View>
            <View style={styles.profileIdentity}>
              <Text style={styles.nameText}>
                {profile.basic_info.displayName}, {getAge(profile.basic_info.dob)}
              </Text>
              <Text style={styles.genderText}>{profile.basic_info.gender}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hồ sơ của tôi</Text>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.9} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="create-outline" size={16} color="#EE3F57" />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bioText}>{profile.bio}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={18} color="#EE3F57" />
            <Text style={styles.infoLabel}>Nghề nghiệp</Text>
            <Text style={styles.infoValue}>{profile.background.occupation}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={18} color="#EE3F57" />
            <Text style={styles.infoLabel}>Học vấn</Text>
            <Text style={styles.infoValue}>{profile.background.education}</Text>
          </View>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Sở thích & phong cách</Text>
          <View style={styles.chipsWrap}>
            {aboutChips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Thói quen</Text>
          <View style={styles.habitGrid}>
            {habitItems.map((item) => (
              <View key={item.key} style={styles.habitCard}>
                <View style={styles.habitIconWrap}>
                  <Ionicons name={item.icon as any} size={18} color="#EE3F57" />
                </View>
                <Text style={styles.habitKey}>{item.key}</Text>
                <Text style={styles.habitValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Ảnh của tôi</Text>
          <View style={styles.photoGrid}>
            {profile.photos.map((photo, index) => (
              <Image key={`${index}`} source={photo} style={styles.gridPhoto} resizeMode="cover" />
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
    backgroundColor: '#F3F3F3',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    height: 290,
    backgroundColor: '#111111',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
  },
  avatarWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  profileIdentity: {
    paddingTop: 30,
  },
  detailsCard: {
    marginTop: 56,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE0E5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF5F7',
  },
  editText: {
    color: '#EE3F57',
    fontSize: 12,
    fontWeight: '600',
  },
  bioText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
  nameText: {
    color: '#111111',
    fontSize: 28,
    fontWeight: '700',
  },
  genderText: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionSpacing: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F3F3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#ADAFBB',
  },
  infoValue: {
    marginLeft: 'auto',
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EE3F57',
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 13,
    color: '#EE3F57',
    fontWeight: '600',
  },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 12,
  },
  habitCard: {
    width: '48.5%',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  habitIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  habitKey: {
    fontSize: 12,
    color: '#ADAFBB',
    fontWeight: '500',
  },
  habitValue: {
    marginTop: 2,
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  photoGrid: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridPhoto: {
    flex: 1,
    height: 112,
    borderRadius: 14,
  },
});
