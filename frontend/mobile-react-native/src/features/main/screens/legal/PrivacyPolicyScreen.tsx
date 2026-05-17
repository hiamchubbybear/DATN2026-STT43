import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const PrivacyPolicyScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close-outline" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.privacyPolicy')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: May 15, 2026</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to Mixer ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Account Information:</Text> When you sign up, we collect your email, name, age, and gender to create your profile.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Profile Media:</Text> We collect photos and videos you upload to build your dating profile.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Location Data:</Text> With your permission, we collect precise location data to help you find matches nearby.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Identity Verification:</Text> We collect ID documents and face scans to verify authenticity and prevent fraud. This data is encrypted and handled securely.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Information</Text>
        <Text style={styles.text}>
          - To provide and improve our matching algorithms.{"\n"}
          - To facilitate communication between users.{"\n"}
          - To ensure the safety and security of our community.{"\n"}
          - To personalize your experience.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.text}>
          We do not sell your personal data. We share information only with:{"\n"}
          - Other users (limited to what you choose to show on your profile).{"\n"}
          - Service providers who help us with hosting, verification, and notifications.{"\n"}
          - Legal authorities if required by law.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, update, or delete your information at any time through the app settings. You can also withdraw consent for location tracking in your device settings.
        </Text>

        <Text style={styles.sectionTitle}>6. Security</Text>
        <Text style={styles.text}>
          We use industry-standard encryption (AES-256) for messages and secure storage for all personal documents to ensure your data remains protected.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Mixer App. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
