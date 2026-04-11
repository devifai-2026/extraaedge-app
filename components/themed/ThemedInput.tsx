import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle,
  TextStyle
} from 'react-native';
import { Theme } from '@/constants/theme';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function ThemedInput({ 
  label, 
  error, 
  containerStyle, 
  style, 
  ...props 
}: ThemedInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        error ? styles.errorBorder : null
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Theme.colors.input.placeholder}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: Theme.colors.input.background,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: Theme.colors.input.border,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: Theme.colors.input.text,
  },
  errorBorder: {
    borderColor: Theme.colors.status.error,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.status.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
