import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { normalizeFont, radius, spacing } from "../utils/responsive";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E84C60",
    paddingVertical: spacing(16),
    paddingHorizontal: spacing(28),
    borderRadius: radius(16),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  disabled: {
    backgroundColor: "#ffb3c1",
    opacity: 0.7,
  },
  text: {
    color: "#ffffff",
    fontSize: normalizeFont(16),
    fontWeight: "600",
  },
});
