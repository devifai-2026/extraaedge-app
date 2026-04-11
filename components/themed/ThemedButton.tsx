import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { Theme } from '@/constants/theme';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({ 
  title, 
  variant = 'primary', 
  loading = false, 
  style, 
  textStyle,
  disabled,
  ...props 
}: ThemedButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const buttonStyle: ViewStyle = {
    backgroundColor: isPrimary ? Theme.colors.primary : isOutline ? 'transparent' : Theme.colors.surface,
    borderColor: Theme.colors.primary,
    borderWidth: isOutline ? 1.5 : 0,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    opacity: (disabled || loading) ? 0.6 : 1,
  };

  const buttonTextStyle: TextStyle = {
    color: isPrimary ? Theme.colors.text.inverse : Theme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  };

  return (
    <TouchableOpacity 
      style={[styles.base, buttonStyle, style]} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Theme.colors.text.inverse : Theme.colors.primary} />
      ) : (
        <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
