import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SettingsItem = ({ icon, label, color = '#111827', onPress, showArrow = true }: { 
  icon: keyof typeof Ionicons.glyphMap, 
  label: string, 
  color?: string,
  onPress?: () => void,
  showArrow?: boolean
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}10` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.rowText, { color: color === '#EF4444' ? '#EF4444' : '#111827' }]}>{label}</Text>
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản', 
      'Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.', 
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa vĩnh viễn', style: 'destructive', onPress: () => console.log('Delete account requested') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <SettingsItem icon="person-outline" label="Thông tin cá nhân" color="#6366F1" onPress={() => navigation.navigate('EditProfile' as any)} />
          <SettingsItem icon="options-outline" label="Tiêu chuẩn tìm kiếm" color="#F43F5E" onPress={() => navigation.navigate('DiscoverySettings' as any)} />
          <SettingsItem icon="lock-closed-outline" label="Đổi mật khẩu" color="#8B5CF6" />
          <SettingsItem icon="notifications-outline" label="Thông báo" color="#F59E0B" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền riêng tư & Bảo mật</Text>
          <SettingsItem icon="shield-checkmark-outline" label="Quyền riêng tư" color="#10B981" />
          <SettingsItem icon="eye-off-outline" label="Chế độ ẩn danh" color="#6B7280" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <SettingsItem icon="help-circle-outline" label="Trợ giúp & Hỗ trợ" color="#3B82F6" />
          <SettingsItem icon="information-circle-outline" label="Về chúng tôi" color="#6B7280" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động</Text>
          <SettingsItem 
            icon="log-out-outline" 
            label="Đăng xuất" 
            color="#EF4444" 
            onPress={handleLogout} 
            showArrow={false} 
          />
          <SettingsItem 
            icon="trash-outline" 
            label="Xóa tài khoản" 
            color="#EF4444" 
            onPress={handleDeleteAccount} 
            showArrow={false} 
          />
        </View>

        <Text style={styles.versionText}>Phiên bản 1.0.0 (BETA)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: spacing(8),
    marginLeft: -spacing(8),
  },
  headerTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingTop: spacing(20),
  },
  section: {
    marginBottom: spacing(24),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: normalizeFont(13),
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing(20),
    paddingTop: spacing(16),
    paddingBottom: spacing(8),
    backgroundColor: '#FAFAFA',
  },
  row: {
    paddingVertical: spacing(16),
    paddingHorizontal: spacing(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: normalizeFont(16),
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(20),
    marginHorizontal: spacing(20),
    paddingVertical: spacing(16),
    backgroundColor: '#FEF2F2',
    borderRadius: radius(16),
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: spacing(8),
  },
});
