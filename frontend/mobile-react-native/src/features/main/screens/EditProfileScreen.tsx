import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { profileService } from '../../../services/api/profileService';
import { useToast } from '../../../shared/components/ToastProvider';
import { Logger } from '../../../shared/utils/logger';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList>;

export const EditProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigation>();
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [occupation, setOccupation] = React.useState('');
  const [education, setEducation] = React.useState('');
  const [locationName, setLocationName] = React.useState('');

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const profile = await profileService.getMyProfile();
      setDisplayName(profile?.basicInfo?.displayName || '');
      setBio(profile?.bio || '');
      setOccupation(profile?.background?.occupation || '');
      setEducation(profile?.background?.education || '');
      setLocationName(profile?.locationName || '');
    } catch (err) {
      Logger.error('Failed to load profile for editing', err);
      showToast({
        title: 'Error',
        message: 'Could not load profile data.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileService.updateProfile({
        displayName,
        bio,
        occupation,
        education,
        locationName,
      });
      showToast({
        title: 'Saved',
        message: 'Profile updated successfully.',
        type: 'success',
      });
      navigation.goBack();
    } catch (err: any) {
      Logger.error('Failed to save profile', err);
      showToast({
        title: 'Save failed',
        message: err?.message || 'Could not update profile.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE3F57" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Display name</Text>
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Your name" placeholderTextColor="#A1A1AA" />

            <Text style={styles.label}>Occupation</Text>
            <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} placeholder="Occupation" placeholderTextColor="#A1A1AA" />

            <Text style={styles.label}>Education</Text>
            <TextInput style={styles.input} value={education} onChangeText={setEducation} placeholder="Education" placeholderTextColor="#A1A1AA" />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={locationName} onChangeText={setLocationName} placeholder="Location" placeholderTextColor="#A1A1AA" />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              placeholderTextColor="#A1A1AA"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.88} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
  },
  saveButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EE3F57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
