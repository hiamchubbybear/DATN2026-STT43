import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const SvgChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SvgLogOut = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SettingsScreen = () => {
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SvgChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Thông tin cá nhân</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Quyền riêng tư</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <SvgLogOut />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
});
