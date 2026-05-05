import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';

const profileSeed = {
  fullName: 'Jessica Parker',
  age: '23',
  jobTitle: 'Professional model',
  location: 'Chicago, IL United States',
  bio: 'My name is Jessica Parker and I enjoy meeting new people and finding ways to help them.',
  interests: 'Traveling, Books, Music, Dancing, Modeling',
  phone: '+1 202-555-0148',
  email: 'jessica.parker@example.com',
};

export const ProfileMainScreen = () => {
  const [form, setForm] = useState(profileSeed);
  const [extraPhotoUri, setExtraPhotoUri] = useState<string | null>(null);

  const updateField = (field: keyof typeof profileSeed, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = () => {
    Alert.alert('Đã lưu', 'Thông tin cá nhân của bạn đã được cập nhật.');
  };

  const onPickExtraPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh để tải ảnh lên.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });

    if (!result.canceled && result.assets.length > 0) {
      setExtraPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={require('../../../../assets/images/anh2.jpg')} style={styles.heroImage} resizeMode="cover" />

          <TouchableOpacity style={styles.changeAvatarBtn} activeOpacity={0.9}>
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.screenTitle}>Hồ sơ của tôi</Text>
          <Text style={styles.screenSubtitle}>Bạn có thể chỉnh sửa các thông tin cá nhân ở đây.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Họ và tên</Text>
            <TextInput style={styles.input} value={form.fullName} onChangeText={(text) => updateField('fullName', text)} placeholder="Nhập họ và tên" placeholderTextColor="#A1A1AA" />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.rowFieldItem}>
              <Text style={styles.fieldLabel}>Tuổi</Text>
              <TextInput style={styles.input} value={form.age} onChangeText={(text) => updateField('age', text)} placeholder="Tuổi" keyboardType="number-pad" placeholderTextColor="#A1A1AA" />
            </View>
            <View style={styles.rowFieldItem}>
              <Text style={styles.fieldLabel}>Nghề nghiệp</Text>
              <TextInput style={styles.input} value={form.jobTitle} onChangeText={(text) => updateField('jobTitle', text)} placeholder="Nghề nghiệp" placeholderTextColor="#A1A1AA" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={(text) => updateField('email', text)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#A1A1AA" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Số điện thoại</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={(text) => updateField('phone', text)} placeholder="Số điện thoại" keyboardType="phone-pad" placeholderTextColor="#A1A1AA" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Địa điểm</Text>
            <TextInput style={styles.input} value={form.location} onChangeText={(text) => updateField('location', text)} placeholder="Địa điểm" placeholderTextColor="#A1A1AA" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Giới thiệu</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={(text) => updateField('bio', text)}
              placeholder="Viết giới thiệu ngắn"
              multiline
              textAlignVertical="top"
              placeholderTextColor="#A1A1AA"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Sở thích (ngăn cách bởi dấu phẩy)</Text>
            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              value={form.interests}
              onChangeText={(text) => updateField('interests', text)}
              placeholder="Ví dụ: Music, Travel, Fitness"
              multiline
              textAlignVertical="top"
              placeholderTextColor="#A1A1AA"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Ảnh bổ sung</Text>

            {extraPhotoUri ? (
              <View style={styles.extraPhotoPreviewWrap}>
                <Image source={{ uri: extraPhotoUri }} style={styles.extraPhotoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoBtn} activeOpacity={0.9} onPress={() => setExtraPhotoUri(null)}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity style={styles.uploadPhotoBtn} activeOpacity={0.9} onPress={onPickExtraPhoto}>
              <Ionicons name="image-outline" size={18} color="#EE3F57" />
              <Text style={styles.uploadPhotoText}>{extraPhotoUri ? 'Chọn lại ảnh' : 'Tải ảnh lên'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.9} onPress={onSave}>
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
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
    paddingBottom: spacing(96),
  },
  heroWrap: {
    height: verticalScale(260),
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: spacing(14),
    right: spacing(14),
    paddingHorizontal: spacing(12),
    height: scale(34),
    borderRadius: radius(12),
    backgroundColor: 'rgba(17,24,39,0.65)',
    flexDirection: 'row',
    gap: spacing(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(12),
    fontWeight: '700',
  },
  contentCard: {
    marginTop: -spacing(18),
    marginHorizontal: spacing(10),
    borderRadius: radius(24),
    backgroundColor: '#FFFFFF',
    paddingTop: spacing(24),
    paddingBottom: spacing(24),
    paddingHorizontal: spacing(16),
  },
  screenTitle: {
    fontSize: normalizeFont(28),
    fontWeight: '700',
    color: '#18181B',
  },
  screenSubtitle: {
    marginTop: spacing(6),
    fontSize: normalizeFont(13),
    color: '#71717A',
  },
  formGroup: {
    marginTop: spacing(18),
  },
  rowFields: {
    marginTop: spacing(18),
    flexDirection: 'row',
    gap: spacing(10),
  },
  rowFieldItem: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: spacing(8),
    fontSize: normalizeFont(13),
    fontWeight: '600',
    color: '#3F3F46',
  },
  input: {
    height: scale(46),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: spacing(12),
    fontSize: normalizeFont(13),
    color: '#18181B',
  },
  textArea: {
    height: verticalScale(96),
    paddingTop: spacing(10),
  },
  textAreaSmall: {
    height: verticalScale(72),
    paddingTop: spacing(10),
  },
  uploadPhotoBtn: {
    marginTop: spacing(6),
    height: scale(46),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#F8C7CF',
    backgroundColor: '#FFF4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(8),
  },
  uploadPhotoText: {
    color: '#EE3F57',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },
  extraPhotoPreviewWrap: {
    marginBottom: spacing(10),
    width: scale(112),
    height: verticalScale(140),
    borderRadius: radius(14),
    overflow: 'hidden',
    position: 'relative',
  },
  extraPhotoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: spacing(6),
    right: spacing(6),
    width: scale(24),
    height: scale(24),
    borderRadius: radius(999),
    backgroundColor: 'rgba(17,24,39,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: spacing(22),
    height: scale(48),
    borderRadius: radius(14),
    backgroundColor: '#EE3F57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },
});
