import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '../data/onboardingData';
import { normalizeFont, spacing, verticalScale } from '../../../shared/utils/responsive';

interface OnboardingFooterProps {
  currentSlide: OnboardingSlide;
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({ 
  currentSlide, 
  onCreateAccount, 
  onSignIn 
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Dynamic Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.title}>{t(`onboarding.slide${currentSlide?.id}_title`)}</Text>
        <Text style={styles.description}>{t(`onboarding.slide${currentSlide?.id}_desc`)}</Text>
      </View>

      {/* Footer Actions */}
      <View style={[styles.actions, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <PrimaryButton 
          title={t('auth.create_account')} 
          onPress={onCreateAccount} 
        />
        
        <View style={styles.signInWrapper}>
          <Text style={styles.signInText}>{t('auth.noAccount').split('?')[0]}? </Text>
          <TouchableOpacity onPress={onSignIn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.signInHighlight}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: spacing(32),
    marginTop: spacing(32),
    minHeight: verticalScale(100),
  },
  title: {
    fontSize: normalizeFont(28),
    fontWeight: '700',
    color: '#E84C60', // Red color
    marginBottom: spacing(16),
    textAlign: 'center',
  },
  description: {
    fontSize: normalizeFont(16),
    color: '#4B5563', // Soft gray text
    textAlign: 'center',
    lineHeight: verticalScale(24),
    fontWeight: '400',
  },
  actions: {
    paddingHorizontal: spacing(24),
    paddingBottom: spacing(24),
  },
  signInWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing(20),
  },
  signInText: {
    fontSize: normalizeFont(14),
    color: '#6B7280',
  },
  signInHighlight: {
    fontSize: normalizeFont(14),
    color: '#E84C60',
    fontWeight: '600',
  },
});
