import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { normalizeFont, radius, spacing } from '../utils/responsive';

type AuthBackButtonProps = {
  onPress: () => void;
};

export const AuthBackButton: React.FC<AuthBackButtonProps> = ({ onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
    >
      <Ionicons name="chevron-back" size={normalizeFont(20)} color="#111111" />
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    borderRadius: radius(999),
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(6),
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backText: {
    fontSize: normalizeFont(16),
    color: '#111111',
    fontWeight: '500',
  },
});
